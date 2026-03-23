import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate}from 'react-router-dom';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import Table from '../../../util/Table';
import { showMessage, getAccessIdsByLabel } from '../../../util/AllFunction';
import IconDownload from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconFilter from '../../../components/Icon/IconSearch';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconTrendingDown from '../../../components/Icon/IconTrendingDown';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconClock from '../../../components/Icon/IconClock';
import IconChartBar from '../../../components/Icon/IconChartBar';
import IconBuilding from '../../../components/Icon/IconBuilding';
import IconWallet from '../../../components/Icon/IconCashBanknotes';
import IconX from '../../../components/Icon/IconX';
import IconSearch from '../../../components/Icon/IconSearch';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import moment from 'moment';
import _ from 'lodash';
import { getExpense } from '../../../redux/expenseSlice';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { getExpenceType } from '../../../redux/expenceTypeSlice';

const ExpenseReport = () => {
    const dispatch = useDispatch();
    const printRef = useRef();
    const navigate = useNavigate();

    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Expense Report');

    // Get data from Redux
    const { expenseData, loading: expenseLoading } = useSelector((state) => state.ExpenseSlice || {});
    const { officeCentersData = [], loading: centersLoading } = useSelector((state) => state.OfficeCenterSlice || {});
    const { expenceTypeData = [], loading: typesLoading } = useSelector((state) => state.ExpenceTypeSlice || {});

    // Default date range - last 30 days
    const defaultFromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const defaultToDate = moment().format('YYYY-MM-DD');

    // States
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [dateRange, setDateRange] = useState({ from: defaultFromDate, to: defaultToDate });
    const [viewMode, setViewMode] = useState('summary');
    const [reportData, setReportData] = useState({
        summary: null,
        dailyData: [],
        categoryData: [],
        paymentTypeData: [],
        filteredExpenses: []
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activePaymentTypeFilter, setActivePaymentTypeFilter] = useState(''); // For quick filter buttons
    
    // Filter states
    const [filters, setFilters] = useState({
        expenseTypeId: '',
        officeCenterId: '',
        paymentStatus: '',
        paymentType: '',
        expenseId: ''
    });

    // Payment type options
    const paymentTypeOptions = [
        { value: '', label: 'All Payment Types', color: '#6c757d' },
        { value: 'cash', label: 'Cash', color: '#28a745' },
        { value: 'gpay', label: 'GPay', color: '#4285f4' },
        { value: 'bank_transfer', label: 'Bank Transfer', color: '#fd7e14' },
        { value: 'cheque', label: 'Cheque', color: '#20c997' },
        { value: 'credit_card', label: 'Credit Card', color: '#dc3545' },
        { value: 'other', label: 'Other', color: '#6f42c1' }
    ];

    const paymentStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'partial', label: 'Partially Paid' },
        { value: 'paid', label: 'Fully Paid' }
    ];

    // Fetch initial data
    useEffect(() => {
        dispatch(setPageTitle('Expense Report'));
        fetchOfficeCenters();
        fetchExpenseTypes();
    }, []);

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            fetchExpenses();
        }
    }, [dateRange.from, dateRange.to, selectedCenter, filters, searchTerm, activePaymentTypeFilter]);

    const fetchOfficeCenters = () => {
        dispatch(getOfficeCenters({}));
    };

    const fetchExpenseTypes = () => {
        dispatch(getExpenceType({}));
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                ...(selectedCenter?.value && { officeCenterId: selectedCenter.value }),
                ...(filters.expenseTypeId && { expenseTypeId: filters.expenseTypeId }),
                ...(filters.expenseId && { expenseId: filters.expenseId }),
                ...(searchTerm && { search: searchTerm })
            };
            
            const result = await dispatch(getExpense(params)).unwrap();
            
            // Handle API response
            let expenses = [];
            if (result?.data?.data && Array.isArray(result.data.data)) {
                expenses = result.data.data;
            } else if (result?.data && Array.isArray(result.data)) {
                expenses = result.data;
            } else if (Array.isArray(result)) {
                expenses = result;
            }
            
            // Apply payment type filter if active
            if (activePaymentTypeFilter) {
                expenses = expenses.filter(exp => {
                    if (exp.payments && exp.payments.length > 0) {
                        return exp.payments[0].payment_type === activePaymentTypeFilter;
                    }
                    return false;
                });
            }
            
            processReportData(expenses);
        } catch (err) {
            console.error('Error fetching expenses:', err);
            showMessage('error', 'Failed to fetch expense data');
        } finally {
            setLoading(false);
        }
    };

    const processReportData = (expenses) => {
        if (!expenses || expenses.length === 0) {
            setReportData({
                summary: null,
                dailyData: [],
                categoryData: [],
                paymentTypeData: [],
                filteredExpenses: []
            });
            return;
        }

        // Process data
        const dailyMap = new Map();
        const categoryMap = new Map();
        const paymentTypeMap = new Map();

        expenses.forEach(expense => {
            const date = expense.expense_date;
            const amount = parseFloat(expense.amount) || 0;
            const paidAmount = parseFloat(expense.paid_amount) || 0;
            const expenseTypeName = expense.expenseType?.expence_type_name || 'Other';
            const officeCenterName = expense.officeCenter?.office_center_name || 'N/A';
            
            // Get payment type from payments array
            let paymentType = 'Not Specified';
            if (expense.payments && expense.payments.length > 0) {
                const typeMap = { cash: 'Cash', gpay: 'GPay', bank_transfer: 'Bank Transfer', cheque: 'Cheque', credit_card: 'Credit Card', other: 'Other' };
                paymentType = typeMap[expense.payments[0].payment_type] || expense.payments[0].payment_type;
            }
            
            const category = getExpenseCategory(expenseTypeName);
            const isFullyPaid = paidAmount >= amount;
            const isPartiallyPaid = paidAmount > 0 && paidAmount < amount;
            const status = isFullyPaid ? 'Paid' : (isPartiallyPaid ? 'Partial' : 'Unpaid');

            // Daily summary
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    date,
                    dayOfWeek: moment(date).format('dddd'),
                    totalExpense: 0,
                    totalPaid: 0,
                    totalUnpaid: 0,
                    expenseCount: 0,
                    paidCount: 0,
                    unpaidCount: 0,
                    partialCount: 0
                });
            }
            const dayData = dailyMap.get(date);
            dayData.totalExpense += amount;
            dayData.totalPaid += paidAmount;
            dayData.totalUnpaid += (amount - paidAmount);
            dayData.expenseCount++;
            if (status === 'Paid') dayData.paidCount++;
            else if (status === 'Partial') dayData.partialCount++;
            else dayData.unpaidCount++;

            // Category summary
            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    category,
                    totalExpense: 0,
                    totalPaid: 0,
                    totalUnpaid: 0,
                    expenseCount: 0,
                    paidCount: 0,
                    unpaidCount: 0
                });
            }
            const catData = categoryMap.get(category);
            catData.totalExpense += amount;
            catData.totalPaid += paidAmount;
            catData.totalUnpaid += (amount - paidAmount);
            catData.expenseCount++;
            if (status === 'Paid') catData.paidCount++;
            else catData.unpaidCount++;

            // Payment Type summary
            if (!paymentTypeMap.has(paymentType)) {
                paymentTypeMap.set(paymentType, {
                    paymentType,
                    totalExpense: 0,
                    totalPaid: 0,
                    totalUnpaid: 0,
                    expenseCount: 0,
                    paidCount: 0,
                    unpaidCount: 0
                });
            }
            const ptData = paymentTypeMap.get(paymentType);
            ptData.totalExpense += amount;
            ptData.totalPaid += paidAmount;
            ptData.totalUnpaid += (amount - paidAmount);
            ptData.expenseCount++;
            if (status === 'Paid') ptData.paidCount++;
            else ptData.unpaidCount++;
        });

        // Apply additional filters
        let filteredExpenses = [...expenses];
        
        if (filters.paymentStatus === 'paid') {
            filteredExpenses = filteredExpenses.filter(e => (parseFloat(e.paid_amount) || 0) >= (parseFloat(e.amount) || 0));
        } else if (filters.paymentStatus === 'partial') {
            filteredExpenses = filteredExpenses.filter(e => {
                const paid = parseFloat(e.paid_amount) || 0;
                const amount = parseFloat(e.amount) || 0;
                return paid > 0 && paid < amount;
            });
        } else if (filters.paymentStatus === 'unpaid') {
            filteredExpenses = filteredExpenses.filter(e => (parseFloat(e.paid_amount) || 0) === 0);
        }

        // Convert maps to arrays
        const dailyData = Array.from(dailyMap.values()).sort((a, b) => moment(a.date).diff(moment(b.date)));
        const categoryData = Array.from(categoryMap.values());
        const paymentTypeData = Array.from(paymentTypeMap.values());

        // Calculate totals
        const totalExpense = dailyData.reduce((sum, day) => sum + day.totalExpense, 0);
        const totalPaid = dailyData.reduce((sum, day) => sum + day.totalPaid, 0);
        const totalUnpaid = dailyData.reduce((sum, day) => sum + day.totalUnpaid, 0);
        const totalExpenseCount = dailyData.reduce((sum, day) => sum + day.expenseCount, 0);
        const totalPaidCount = dailyData.reduce((sum, day) => sum + day.paidCount, 0);
        const totalPartialCount = dailyData.reduce((sum, day) => sum + (day.partialCount || 0), 0);
        const totalUnpaidCount = dailyData.reduce((sum, day) => sum + day.unpaidCount, 0);
        const paymentRate = totalExpense > 0 ? (totalPaid / totalExpense) * 100 : 0;

        setReportData({
            summary: {
                dateRange: { from: dateRange.from, to: dateRange.to },
                totalDays: dailyData.length,
                expenseDays: dailyData.filter(day => day.totalExpense > 0).length,
                zeroExpenseDays: dailyData.filter(day => day.totalExpense === 0).length,
                totalExpense,
                totalPaid,
                totalUnpaid,
                totalExpenseCount,
                totalPaidCount,
                totalPartialCount,
                totalUnpaidCount,
                paymentRate: parseFloat(paymentRate.toFixed(1)),
                avgDailyExpense: dailyData.length > 0 ? totalExpense / dailyData.length : 0,
                avgExpensePerItem: totalExpenseCount > 0 ? totalExpense / totalExpenseCount : 0
            },
            dailyData,
            categoryData,
            paymentTypeData,
            filteredExpenses
        });
    };

    const getExpenseCategory = (expenseType) => {
        const vehicleTypes = ['Fuel', 'Diesel', 'Petrol', 'Maintenance', 'Repair', 'Toll', 'Parking', 'Vehicle', 'Service', 'Disel'];
        const staffTypes = ['Salary', 'Wage', 'Staff', 'Driver', 'Overtime', 'Bonus', 'Loadman', 'Mechanic'];
        
        if (vehicleTypes.some(type => expenseType?.toLowerCase().includes(type.toLowerCase()))) return 'Vehicle';
        if (staffTypes.some(type => expenseType?.toLowerCase().includes(type.toLowerCase()))) return 'Staff';
        return 'Other';
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };

    const handleCenterChange = (selectedOption) => {
        setSelectedCenter(selectedOption);
    };

    const handleFilterChange = (selectedOption, { name }) => {
        setFilters(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
    };

    const handleInputFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentTypeQuickFilter = (paymentType) => {
        if (activePaymentTypeFilter === paymentType) {
            setActivePaymentTypeFilter('');
        } else {
            setActivePaymentTypeFilter(paymentType);
        }
        setCurrentPage(0);
    };

    const applyFilters = () => {
        setShowFilters(false);
        fetchExpenses();
    };

    const resetFilters = () => {
        setFilters({
            expenseTypeId: '',
            officeCenterId: '',
            paymentStatus: '',
            paymentType: '',
            expenseId: ''
        });
        setActivePaymentTypeFilter('');
        setSelectedCenter(null);
        setSearchTerm('');
        setShowFilters(false);
        fetchExpenses();
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    const quickDateRange = (days) => {
        const toDate = moment().format('YYYY-MM-DD');
        const fromDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
        setDateRange({ from: fromDate, to: toDate });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    };

    const formatDisplayDate = (date) => {
        if (!date) return '';
        return moment(date).format('DD/MM/YYYY');
    };

 // In your ExpenseReport component, when clicking Print:
const handlePrint = () => {
    console.log("print")
    navigate('/expense-report-pdf', {
        state: {
            reportData: expenseData, // Your expense data
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            date: dateRange.from, // Selected date range
            centerName: selectedCenter?.label || 'All Centers',
            paymentTypeFilter: activePaymentTypeFilter || 'All'
        }
    });
};

    // Options for selects
    const centerOptions = [
        { value: '', label: 'All Centers' },
        ...(officeCentersData || []).map(center => ({
            value: center.id,
            label: center.officeCentersName || center.office_center_name
        }))
    ];

    const expenseTypeOptions = [
        { value: '', label: 'All Types' },
        ...(expenceTypeData || []).map(type => ({
            value: type.expenceTypeId,
            label: type.expenceTypeName
        }))
    ];

    // Table Columns
    const dailyColumns = [
        { Header: 'Date', accessor: 'date', Cell: ({ value }) => formatDisplayDate(value), width: 100 },
        { Header: 'Day', accessor: 'dayOfWeek', width: 100 },
        { Header: 'Expenses', accessor: 'expenseCount', Cell: ({ value }) => formatNumber(value) },
        { Header: 'Total Expense', accessor: 'totalExpense', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Paid', accessor: 'totalPaid', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Unpaid', accessor: 'totalUnpaid', Cell: ({ value }) => formatCurrency(value) }
    ];

    const categoryColumns = [
        { Header: 'Category', accessor: 'category' },
        { Header: 'Count', accessor: 'expenseCount', Cell: ({ value }) => formatNumber(value) },
        { Header: 'Total', accessor: 'totalExpense', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Paid', accessor: 'totalPaid', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Unpaid', accessor: 'totalUnpaid', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Rate', accessor: 'paymentRate', Cell: ({ row }) => {
            const rate = row.original.totalExpense > 0 ? (row.original.totalPaid / row.original.totalExpense) * 100 : 0;
            return `${rate.toFixed(1)}%`;
        }}
    ];

    const paymentTypeColumns = [
        { Header: 'Payment Type', accessor: 'paymentType' },
        { Header: 'Count', accessor: 'expenseCount', Cell: ({ value }) => formatNumber(value) },
        { Header: 'Total', accessor: 'totalExpense', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Paid', accessor: 'totalPaid', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Unpaid', accessor: 'totalUnpaid', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Rate', accessor: 'paymentRate', Cell: ({ row }) => {
            const rate = row.original.totalExpense > 0 ? (row.original.totalPaid / row.original.totalExpense) * 100 : 0;
            return `${rate.toFixed(1)}%`;
        }}
    ];

    const expenseDetailColumns = [
        { Header: 'Date', accessor: 'expense_date', Cell: ({ value }) => formatDisplayDate(value), width: 100 },
        { Header: 'Center', accessor: 'officeCenter', Cell: ({ value }) => value?.office_center_name || '-' },
        { Header: 'Expense Type', accessor: 'expenseType', Cell: ({ value }) => value?.expence_type_name || '-' },
        { Header: 'Description', accessor: 'description', Cell: ({ value }) => value || '-' },
        { Header: 'Amount', accessor: 'amount', Cell: ({ value }) => formatCurrency(value) },
        { Header: 'Paid', accessor: 'paid_amount', Cell: ({ value }) => formatCurrency(value || 0) },
        { Header: 'Balance', accessor: 'balance', Cell: ({ row }) => {
            const balance = (row.original.amount || 0) - (row.original.paid_amount || 0);
            return formatCurrency(balance);
        }},
        { Header: 'Payment Type', accessor: 'payments', Cell: ({ value }) => {
            if (value && value.length > 0) {
                const typeMap = { cash: 'Cash', gpay: 'GPay', bank_transfer: 'Bank Transfer', cheque: 'Cheque', credit_card: 'Credit Card', other: 'Other' };
                return typeMap[value[0]?.payment_type] || value[0]?.payment_type || '-';
            }
            return '-';
        }},
        { Header: 'Status', accessor: 'status', Cell: ({ row }) => {
            const amount = row.original.amount || 0;
            const paid = row.original.paid_amount || 0;
            if (paid >= amount) return 'Paid';
            if (paid > 0) return 'Partial';
            return 'Unpaid';
        }}
    ];

    const onDownloadExcel = () => {
        if (!reportData.summary) return;

        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
            ['EXPENSE REPORT - SUMMARY'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [`Center: ${selectedCenter?.label || 'All Centers'}`],
            [`Payment Type Filter: ${activePaymentTypeFilter ? activePaymentTypeFilter.toUpperCase() : 'All'}`],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`], [],
            ['Metric', 'Value'],
            ['Total Days', reportData.summary.totalDays],
            ['Days with Expenses', reportData.summary.expenseDays],
            ['Total Expenses', formatCurrency(reportData.summary.totalExpense)],
            ['Total Paid', formatCurrency(reportData.summary.totalPaid)],
            ['Total Unpaid', formatCurrency(reportData.summary.totalUnpaid)],
            ['Payment Rate', `${reportData.summary.paymentRate}%`],
            ['Total Expense Items', formatNumber(reportData.summary.totalExpenseCount)],
            ['Paid Items', formatNumber(reportData.summary.totalPaidCount)],
            ['Partial Items', formatNumber(reportData.summary.totalPartialCount)],
            ['Unpaid Items', formatNumber(reportData.summary.totalUnpaidCount)]
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Payment Type Sheet
        const paymentTypeData = reportData.paymentTypeData.map(pt => [
            pt.paymentType, pt.expenseCount, pt.totalExpense, pt.totalPaid, pt.totalUnpaid,
            `${((pt.totalPaid / pt.totalExpense) * 100).toFixed(1)}%`
        ]);
        const paymentSheet = XLSX.utils.aoa_to_sheet([['Payment Type', 'Count', 'Total', 'Paid', 'Unpaid', 'Rate'], ...paymentTypeData]);
        XLSX.utils.book_append_sheet(wb, paymentSheet, 'By Payment Type');

        // Details Sheet
        const detailData = reportData.filteredExpenses.map(exp => {
            const paymentType = exp.payments && exp.payments.length > 0 ? exp.payments[0].payment_type : '-';
            const status = (exp.paid_amount || 0) >= (exp.amount || 0) ? 'Paid' : (exp.paid_amount > 0 ? 'Partial' : 'Unpaid');
            return [
                formatDisplayDate(exp.expense_date),
                exp.officeCenter?.office_center_name || '-',
                exp.expenseType?.expence_type_name || '-',
                exp.description || '-',
                exp.amount,
                exp.paid_amount || 0,
                (exp.amount || 0) - (exp.paid_amount || 0),
                paymentType,
                status
            ];
        });
        const detailSheet = XLSX.utils.aoa_to_sheet([['Date', 'Center', 'Type', 'Description', 'Amount', 'Paid', 'Balance', 'Payment Type', 'Status'], ...detailData]);
        XLSX.utils.book_append_sheet(wb, detailSheet, 'Details');

        const fileName = `Expense-Report-${moment(dateRange.from).format('DD-MM-YY')}-to-${moment(dateRange.to).format('DD-MM-YY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    };

    const isLoading = expenseLoading || centersLoading || typesLoading || loading;

    return (
        <div className="p-4 sm:p-6">
            {/* Hidden Print Section */}
            <div ref={printRef} style={{ display: 'none' }}>
                <div className="print-content">
                    <div className="header">
                        <h1>Expense Report</h1>
                        <p>Period: {moment(dateRange.from).format('DD/MM/YYYY')} - {moment(dateRange.to).format('DD/MM/YYYY')}</p>
                        <p>Center: {selectedCenter?.label || 'All Centers'}</p>
                        {activePaymentTypeFilter && <p>Payment Type: {activePaymentTypeFilter.toUpperCase()}</p>}
                    </div>

                    <div className="summary-cards">
                        <div className="card"><h3>Total Expenses</h3><div className="amount">{formatCurrency(reportData.summary?.totalExpense || 0)}</div></div>
                        <div className="card"><h3>Total Paid</h3><div className="amount">{formatCurrency(reportData.summary?.totalPaid || 0)}</div></div>
                        <div className="card"><h3>Total Unpaid</h3><div className="amount">{formatCurrency(reportData.summary?.totalUnpaid || 0)}</div></div>
                        <div className="card"><h3>Payment Rate</h3><div className="amount">{reportData.summary?.paymentRate || 0}%</div></div>
                    </div>

                    <h3>Expense Details</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th><th>Center</th><th>Expense Type</th><th>Description</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Payment Type</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.filteredExpenses?.map(exp => (
                                <tr key={exp.expense_id}>
                                    <td>{formatDisplayDate(exp.expense_date)}</td>
                                    <td>{exp.officeCenter?.office_center_name || '-'}</td>
                                    <td>{exp.expenseType?.expence_type_name || '-'}</td>
                                    <td>{exp.description || '-'}</td>
                                    <td>{formatCurrency(exp.amount)}</td>
                                    <td>{formatCurrency(exp.paid_amount || 0)}</td>
                                    <td>{formatCurrency((exp.amount || 0) - (exp.paid_amount || 0))}</td>
                                    <td>{exp.payments?.[0]?.payment_type || '-'}</td>
                                    <td>{(exp.paid_amount || 0) >= (exp.amount || 0) ? 'Paid' : (exp.paid_amount > 0 ? 'Partial' : 'Unpaid')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Expense Report</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Comprehensive expense analysis with payment type filtering</p>
            </div>

            {/* Date Range and Center Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Select Date Range & Center</h2>
                        <p className="text-sm text-gray-600">Choose the period for your expense analysis</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => quickDateRange(7)} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">Last 7 Days</button>
                        <button onClick={() => quickDateRange(30)} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium border border-blue-300">Last 30 Days</button>
                        <button onClick={() => quickDateRange(90)} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">Last 90 Days</button>
                        <button onClick={() => quickDateRange(365)} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium">Last 1 Year</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><IconCalendar className="inline w-4 h-4 mr-1" /> From Date</label>
                        <input type="date" name="from" className="form-input w-full" value={dateRange.from} onChange={handleDateRangeChange} max={moment().format('YYYY-MM-DD')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><IconCalendar className="inline w-4 h-4 mr-1" /> To Date</label>
                        <input type="date" name="to" className="form-input w-full" value={dateRange.to} onChange={handleDateRangeChange} max={moment().format('YYYY-MM-DD')} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><IconBuilding className="inline w-4 h-4 mr-1" /> Filter by Center</label>
                        <Select options={centerOptions} value={selectedCenter} onChange={handleCenterChange} placeholder="Select a center..." isClearable />
                    </div>
                    <div className="flex items-end">
                        <button onClick={fetchExpenses} className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">Generate Report</button>
                    </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">{moment(dateRange.from).format('DD MMM YYYY')} - {moment(dateRange.to).format('DD MMM YYYY')} | {selectedCenter?.label || 'All Centers'}</h3>
                    <p className="text-gray-600 text-sm">{reportData.summary?.totalDays || 0} days • {reportData.summary?.expenseDays || 0} days with expenses • {reportData.summary?.totalExpenseCount || 0} expense items</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={onDownloadExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center">
                            <IconDownload className="mr-2 w-4 h-4" /> Export Excel
                        </button>
                        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center">
                            <IconPrinter className="mr-2 w-4 h-4" /> Print
                        </button>
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center">
                        <IconFilter className="mr-2 w-4 h-4" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
            </div>

            {/* Payment Type Quick Filter Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filter by Payment Type:</label>
                <div className="flex flex-wrap gap-2">
                    {paymentTypeOptions.filter(opt => opt.value).map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handlePaymentTypeQuickFilter(opt.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                activePaymentTypeFilter === opt.value
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={activePaymentTypeFilter === opt.value ? {} : {}}
                        >
                            {opt.label}
                        </button>
                    ))}
                    {activePaymentTypeFilter && (
                        <button
                            onClick={() => handlePaymentTypeQuickFilter('')}
                            className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium"
                        >
                            Clear Filter
                        </button>
                    )}
                </div>
                {activePaymentTypeFilter && (
                    <div className="mt-2 text-sm text-blue-600">
                        Showing only {activePaymentTypeFilter.toUpperCase()} expenses
                    </div>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Advanced Filters</h3>
                        <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700"><IconX className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Expense ID</label>
                            <input type="text" name="expenseId" className="form-input w-full" placeholder="Enter Expense ID" value={filters.expenseId} onChange={handleInputFilterChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expense Type</label>
                            <Select options={expenseTypeOptions} value={expenseTypeOptions.find(opt => opt.value === filters.expenseTypeId)} onChange={(opt) => handleFilterChange(opt, { name: 'expenseTypeId' })} placeholder="All Types" isClearable />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Payment Status</label>
                            <Select options={paymentStatusOptions} value={paymentStatusOptions.find(opt => opt.value === filters.paymentStatus)} onChange={(opt) => handleFilterChange(opt, { name: 'paymentStatus' })} placeholder="All Status" isClearable />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <button onClick={resetFilters} className="btn btn-outline-secondary">Clear All</button>
                        <button onClick={applyFilters} className="btn btn-primary">Apply Filters</button>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="relative">
                    <input
                        type="text"
                        className="form-input pl-10 w-full"
                        placeholder="Search by description, expense type, center..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Summary Cards */}
            {reportData.summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Total Expenses</h3><div className="p-2 bg-red-100 rounded-full"><IconMoney className="w-5 h-5 text-red-600" /></div></div>
                        <div className="text-2xl font-bold text-red-700">{formatCurrency(reportData.summary.totalExpense)}</div>
                        <div className="text-sm text-gray-600">Avg: {formatCurrency(reportData.summary.avgDailyExpense)}/day</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Total Paid</h3><div className="p-2 bg-green-100 rounded-full"><IconCheckCircle className="w-5 h-5 text-green-600" /></div></div>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(reportData.summary.totalPaid)}</div>
                        <div className="text-sm text-gray-600">{reportData.summary.paymentRate}% Payment Rate</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-200">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Total Unpaid</h3><div className="p-2 bg-orange-100 rounded-full"><IconClock className="w-5 h-5 text-orange-600" /></div></div>
                        <div className="text-2xl font-bold text-orange-700">{formatCurrency(reportData.summary.totalUnpaid)}</div>
                        <div className="text-sm text-gray-600">{((reportData.summary.totalUnpaid / reportData.summary.totalExpense) * 100).toFixed(1)}% of total</div>
                    </div>
                    <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Items</h3><div className="p-2 bg-white/20 rounded-full"><IconReceipt className="w-5 h-5" /></div></div>
                        <div className="text-2xl font-bold">{reportData.summary.totalPaidCount}/{reportData.summary.totalExpenseCount}</div>
                        <div className="text-sm opacity-90">{reportData.summary.totalPaidCount} paid, {reportData.summary.totalUnpaidCount} unpaid</div>
                    </div>
                </div>
            )}

            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setViewMode('summary')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'summary' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 hover:bg-gray-200'}`}><IconChartBar className="w-4 h-4 mr-2" /> Summary</button>
                    <button onClick={() => setViewMode('daily')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'daily' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 hover:bg-gray-200'}`}><IconCalendar className="w-4 h-4 mr-2" /> Daily View</button>
                    <button onClick={() => setViewMode('paymentType')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'paymentType' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 hover:bg-gray-200'}`}><IconWallet className="w-4 h-4 mr-2" /> By Payment Type</button>
                    <button onClick={() => setViewMode('category')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'category' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 hover:bg-gray-200'}`}><IconChartBar className="w-4 h-4 mr-2" /> By Category</button>
                    <button onClick={() => setViewMode('details')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'details' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 hover:bg-gray-200'}`}><IconReceipt className="w-4 h-4 mr-2" /> All Expenses ({reportData.filteredExpenses?.length || 0})</button>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'summary' && reportData.summary && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4">Financial Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between pb-2 border-b"><span>Total Expenses</span><span className="font-bold text-red-600">{formatCurrency(reportData.summary.totalExpense)}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span>Total Paid</span><span className="font-bold text-green-600">{formatCurrency(reportData.summary.totalPaid)}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span>Total Unpaid</span><span className="font-bold text-orange-600">{formatCurrency(reportData.summary.totalUnpaid)}</span></div>
                            <div className="flex justify-between pt-2 bg-green-50 p-3 rounded-lg"><span className="font-bold">Payment Rate</span><span className="text-2xl font-bold text-green-700">{reportData.summary.paymentRate}%</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4">Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between pb-2 border-b"><span>Total Expense Items</span><span className="font-bold">{formatNumber(reportData.summary.totalExpenseCount)}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span>Paid Items</span><span className="font-bold text-green-600">{formatNumber(reportData.summary.totalPaidCount)}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span>Partial Items</span><span className="font-bold text-yellow-600">{formatNumber(reportData.summary.totalPartialCount)}</span></div>
                            <div className="flex justify-between pb-2 border-b"><span>Unpaid Items</span><span className="font-bold text-red-600">{formatNumber(reportData.summary.totalUnpaidCount)}</span></div>
                            <div className="flex justify-between pt-2"><span>Average per Item</span><span className="font-bold text-blue-600">{formatCurrency(reportData.summary.avgExpensePerItem)}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'daily' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 bg-gray-50 border-b"><h3 className="text-lg font-bold">Daily Expense Breakdown</h3></div>
                    <div className="p-4">
                        <Table columns={dailyColumns} data={getPaginatedData(reportData.dailyData)} pageSize={pageSize} pageIndex={currentPage} totalCount={reportData.dailyData.length} totalPages={Math.ceil(reportData.dailyData.length / pageSize)} onPaginationChange={handlePaginationChange} pagination={true} isSearchable={false} isSortable={true} />
                    </div>
                </div>
            )}

            {viewMode === 'paymentType' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 bg-gray-50 border-b"><h3 className="text-lg font-bold">Expense by Payment Type</h3></div>
                    <div className="p-4">
                        <Table columns={paymentTypeColumns} data={getPaginatedData(reportData.paymentTypeData)} pageSize={pageSize} pageIndex={currentPage} totalCount={reportData.paymentTypeData.length} totalPages={Math.ceil(reportData.paymentTypeData.length / pageSize)} onPaginationChange={handlePaginationChange} pagination={true} isSearchable={false} isSortable={true} />
                    </div>
                </div>
            )}

            {viewMode === 'category' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 bg-gray-50 border-b"><h3 className="text-lg font-bold">Expense by Category</h3></div>
                    <div className="p-4">
                        <Table columns={categoryColumns} data={getPaginatedData(reportData.categoryData)} pageSize={pageSize} pageIndex={currentPage} totalCount={reportData.categoryData.length} totalPages={Math.ceil(reportData.categoryData.length / pageSize)} onPaginationChange={handlePaginationChange} pagination={true} isSearchable={false} isSortable={true} />
                    </div>
                </div>
            )}

            {viewMode === 'details' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 bg-gray-50 border-b"><h3 className="text-lg font-bold">Expense Details</h3></div>
                    <div className="p-4">
                        <Table columns={expenseDetailColumns} data={getPaginatedData(reportData.filteredExpenses)} pageSize={pageSize} pageIndex={currentPage} totalCount={reportData.filteredExpenses.length} totalPages={Math.ceil(reportData.filteredExpenses.length / pageSize)} onPaginationChange={handlePaginationChange} onSearch={handleSearch} pagination={true} isSearchable={true} isSortable={true} />
                        {reportData.filteredExpenses.length === 0 && <div className="text-center py-8 text-gray-500">No expenses found</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseReport;