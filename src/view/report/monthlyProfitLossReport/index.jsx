import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconDownload from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconTrendingDown from '../../../components/Icon/IconTrendingDown';
import IconUsers from '../../../components/Icon/IconUsers';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconBuilding from '../../../components/Icon/IconBuilding';
import IconPieChart from '../../../components/Icon/IconPieChart';
import IconX from '../../../components/Icon/IconX';
import Table from '../../../util/Table';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getDateRangeProfitLossApi } from '../../../api/ReportApi';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { showMessage, getAccessIdsByLabel } from '../../../util/AllFunction';
import Select from 'react-select';
import _ from 'lodash';

const ProfitLossReport = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get login info and permissions
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Profit and Loss Report');

    // Get office centers from Redux
    const officeCentersState = useSelector((state) => state.OfficeCenterSlice || {});
    const { officeCentersData = [], loading: centersLoading = false } = officeCentersState;

    // Default to last 30 days
    const defaultFromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const defaultToDate = moment().format('YYYY-MM-DD');

    // States
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [dateRange, setDateRange] = useState({
        from: defaultFromDate,
        to: defaultToDate
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('summary');

    // Pagination states for each table
    const [paymentsPagination, setPaymentsPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [expensesPagination, setExpensesPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [extraIncomePagination, setExtraIncomePagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [investmentsPagination, setInvestmentsPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [customerPagination, setCustomerPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Modal states
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState(null);
    const [customerPaymentsPagination, setCustomerPaymentsPagination] = useState({ pageIndex: 0, pageSize: 10 });

    useEffect(() => {
        dispatch(setPageTitle('Profit & Loss Report'));
        dispatch(getOfficeCenters({}));
    }, []);

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            fetchReportData();
        }
    }, [dateRange.from, dateRange.to, selectedCenter]);

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);

        try {
            const request = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                centerId: selectedCenter?.value || null
            };

            const response = await getDateRangeProfitLossApi(request);

            if (response && response.data) {
                setReportData(response.data);
                // Reset pagination when new data loads
                setPaymentsPagination({ pageIndex: 0, pageSize: 10 });
                setExpensesPagination({ pageIndex: 0, pageSize: 10 });
                setExtraIncomePagination({ pageIndex: 0, pageSize: 10 });
                setInvestmentsPagination({ pageIndex: 0, pageSize: 10 });
                setCustomerPagination({ pageIndex: 0, pageSize: 10 });
            } else {
                setError('No data found for selected date range');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch report data');
            showMessage('error', err.message || 'Failed to fetch report data');
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCenterChange = (selectedOption) => {
        setSelectedCenter(selectedOption);
    };

    const quickDateRange = (days) => {
        const toDate = moment().format('YYYY-MM-DD');
        const fromDate = moment().subtract(days, 'days').format('YYYY-MM-DD');
        setDateRange({ from: fromDate, to: toDate });
    };

    const handleViewCustomerPayments = (customer) => {
        if (!customer) return;

        const customerWithPayments = {
            customer_name: customer.customer_name || 'Unknown',
            customer_number: customer.customer_number || 'N/A',
            total_amount: customer.total_amount || 0,
            payment_count: customer.payment_count || 0,
            payments: Array.isArray(customer.payments)
                ? customer.payments.map((payment) => ({
                      payment_id: payment.payment_id,
                      payment_number: payment.payment_number || 'N/A',
                      amount: payment.amount || 0,
                      mode: payment.mode || 'N/A',
                      booking_number: payment.booking_number || 'N/A',
                      booking_center: payment.booking_center || 'N/A',
                      date: payment.date || null,
                      payment_type: payment.type || 'full',
                      payment_type_label: getPaymentTypeLabel(payment.type)
                  }))
                : [],
        };

        setSelectedCustomer(customerWithPayments);
        setCustomerPaymentsPagination({ pageIndex: 0, pageSize: 10 });
        setShowCustomerModal(true);
    };

    const getPaymentTypeLabel = (type) => {
        const labels = { 'advance': 'Advance', 'partial': 'Partial', 'full': 'Full', 'refund': 'Refund' };
        return labels[type] || type;
    };

    const handleViewExpenseDetails = (expenseType) => {
        if (!reportData || !expenseType) return;
        
        const expenses = reportData.transactions?.expenses?.filter(
            exp => exp.expense_type === expenseType.expense_type
        ) || [];
        
        setSelectedExpenseType({
            name: expenseType.expense_type,
            total: expenseType.total,
            count: expenseType.count,
            expenses: expenses
        });
        setShowExpenseModal(true);
    };

    const closeModal = () => {
        setShowCustomerModal(false);
        setSelectedCustomer(null);
        setShowExpenseModal(false);
        setSelectedExpenseType(null);
        setCustomerPaymentsPagination({ pageIndex: 0, pageSize: 10 });
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(num);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num || 0);
    };

    // Helper function to get paginated data
    const getPaginatedData = (data, pageIndex, pageSize) => {
        if (!data || !Array.isArray(data)) return [];
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return data.slice(start, end);
    };

    // Transform office centers for react-select
    const centerOptions = [
        { value: '', label: 'All Centers' },
        ...(officeCentersData || []).map((center) => ({
            value: center.id,
            label: center.officeCentersName,
        })),
    ];

    const selectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '42px',
            borderColor: '#e2e8f0',
            '&:hover': {
                borderColor: '#cbd5e0',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e2e8f0' : 'white',
            color: state.isSelected ? 'white' : '#1e293b',
            cursor: 'pointer',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 50,
        }),
    };

    // Payment Columns
    const paymentColumns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + paymentsPagination.pageIndex * paymentsPagination.pageSize}</div>,
            width: 70,
        },
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => (
                <div className="text-sm">
                    <div>{moment(value).format('DD/MM/YYYY')}</div>
                </div>
            ),
        },
        {
            Header: 'Payment No',
            accessor: 'payment_number',
            width: 120,
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Customer',
            accessor: 'customer',
            width: 150,
            Cell: ({ value }) => (
                <div>
                    <div className="font-medium">{value?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{value?.number || ''}</div>
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            width: 120,
            Cell: ({ value }) => (
                <div className="font-bold text-green-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Payment Mode',
            accessor: 'payment_mode_label',
            width: 100,
            Cell: ({ value }) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value}
                </span>
            ),
        },
        {
            Header: 'Payment Type',
            accessor: 'payment_type_label',
            width: 100,
            Cell: ({ value }) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {value}
                </span>
            ),
        },
        {
            Header: 'Booking Center',
            accessor: 'booking_center',
            width: 120,
            Cell: ({ value }) => (
                <div className="text-sm">{value?.name || 'N/A'}</div>
            ),
        },
    ];

    // Expense Columns
    const expenseColumns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + expensesPagination.pageIndex * expensesPagination.pageSize}</div>,
            width: 70,
        },
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => (
                <div className="text-sm">{moment(value).format('DD/MM/YYYY')}</div>
            ),
        },
        {
            Header: 'Expense Type',
            accessor: 'expense_type',
            width: 120,
            Cell: ({ value }) => (
                <div className="font-medium">{value || 'N/A'}</div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            width: 120,
            Cell: ({ value }) => (
                <div className="font-bold text-red-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Payment Type',
            accessor: 'payment_type_label',
            width: 100,
            Cell: ({ value }) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {value}
                </span>
            ),
        },
        {
            Header: 'Center',
            accessor: 'center',
            width: 120,
            Cell: ({ value }) => (
                <div className="text-sm">{value?.name || 'N/A'}</div>
            ),
        },
        {
            Header: 'Description',
            accessor: 'description',
            width: 200,
            Cell: ({ value }) => (
                <div className="text-sm text-gray-600">{value || '-'}</div>
            ),
        },
    ];

    // Extra Income Columns
    const extraIncomeColumns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + extraIncomePagination.pageIndex * extraIncomePagination.pageSize}</div>,
            width: 70,
        },
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => (
                <div className="text-sm">{moment(value).format('DD/MM/YYYY')}</div>
            ),
        },
        {
            Header: 'Income Type',
            accessor: 'income_type_label',
            width: 100,
            Cell: ({ value }) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {value}
                </span>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            width: 120,
            Cell: ({ value }) => (
                <div className="font-bold text-green-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Center',
            accessor: 'center',
            width: 120,
            Cell: ({ value }) => (
                <div className="text-sm">{value?.name || 'N/A'}</div>
            ),
        },
        {
            Header: 'Description',
            accessor: 'description',
            width: 200,
            Cell: ({ value }) => (
                <div className="text-sm text-gray-600">{value || '-'}</div>
            ),
        },
    ];

    // Investment Columns
    const investmentColumns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + investmentsPagination.pageIndex * investmentsPagination.pageSize}</div>,
            width: 70,
        },
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => (
                <div className="text-sm">{moment(value).format('DD/MM/YYYY')}</div>
            ),
        },
        {
            Header: 'Type',
            accessor: 'type',
            width: 100,
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {value === 'IN' ? 'Investment' : 'Withdrawal'}
                </span>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            width: 120,
            Cell: ({ value, row }) => (
                <div className={`font-bold ${row.original.type === 'IN' ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(value)}
                </div>
            ),
        },
        {
            Header: 'Center',
            accessor: 'center',
            width: 120,
            Cell: ({ value }) => (
                <div className="text-sm">{value?.name || 'N/A'}</div>
            ),
        },
        {
            Header: 'Notes',
            accessor: 'notes',
            width: 150,
            Cell: ({ value }) => (
                <div className="text-sm text-gray-600">{value || '-'}</div>
            ),
        },
    ];

    // Customer Columns for Summary Table
    const customerColumns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + customerPagination.pageIndex * customerPagination.pageSize}</div>,
            width: 70,
        },
        {
            Header: 'Customer Name',
            accessor: 'customer_name',
            width: 200,
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-medium">{value}</div>
                    <div className="text-xs text-gray-500">{row.original.customer_number}</div>
                </div>
            ),
        },
        {
            Header: 'Total Amount',
            accessor: 'total_amount',
            width: 150,
            Cell: ({ value }) => (
                <div className="font-bold text-green-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Payment Count',
            accessor: 'payment_count',
            width: 120,
            Cell: ({ value }) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value} payments
                </span>
            ),
        },
        {
            Header: 'Action',
            accessor: 'action',
            width: 100,
            Cell: ({ row }) => (
                <button
                    onClick={() => handleViewCustomerPayments(row.original)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    View Details
                </button>
            ),
        },
    ];

    // Customer Payment Modal Columns
    const customerPaymentColumns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + customerPaymentsPagination.pageIndex * customerPaymentsPagination.pageSize}</div>,
            width: 60,
        },
        {
            Header: 'Payment No',
            accessor: 'payment_number',
            width: 120,
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            width: 100,
            Cell: ({ value }) => (
                <div className="font-bold text-green-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Mode',
            accessor: 'mode',
            width: 80,
            Cell: ({ value }) => (
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                    {value}
                </span>
            ),
        },
        {
            Header: 'Type',
            accessor: 'payment_type_label',
            width: 80,
            Cell: ({ value }) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {value}
                </span>
            ),
        },
        {
            Header: 'Booking No',
            accessor: 'booking_number',
            width: 100,
        },
        {
            Header: 'Booking Center',
            accessor: 'booking_center',
            width: 100,
        },
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => value ? moment(value).format('DD/MM/YYYY') : '-',
        },
    ];

    const onDownloadExcel = () => {
        if (!reportData) return;

        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
            ['PROFIT & LOSS REPORT'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [`Center: ${selectedCenter?.label || 'All Centers'}`],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['OPENING BALANCE'],
            ['Total', reportData.opening_balance?.total || '0'],
            ['As of Date', reportData.opening_balance?.as_of_date || 'N/A'],
            [],
            ['FINANCIAL SUMMARY'],
            ['Metric', 'Amount'],
            ['Total Payments', reportData.summary?.total_payment_amount || '0'],
            ['Total Extra Income', reportData.summary?.total_extra_income_amount || '0'],
            ['Total Income', reportData.summary?.total_income || '0'],
            ['Total Expenses', reportData.summary?.total_expense_amount || '0'],
            ['Operational Profit/Loss', reportData.summary?.operational_profit_loss || '0'],
            ['Total Investments', reportData.summary?.total_investments || '0'],
            ['Total Withdrawals', reportData.summary?.total_withdrawals || '0'],
            ['Net Investment Change', reportData.summary?.net_investment_change || '0'],
            ['Net Profit/Loss', reportData.summary?.total_profit_loss || '0'],
            ['Profit/Loss Status', reportData.summary?.profit_loss_status || 'N/A'],
            ['Closing Balance', reportData.summary?.closing_balance || '0'],
            [],
            ['PAYMENT BREAKDOWN BY TYPE'],
            ['Type', 'Amount', 'Count'],
            ...(reportData.summary?.payment_breakdown_by_type || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['PAYMENT BREAKDOWN BY MODE'],
            ['Mode', 'Amount', 'Count'],
            ...(reportData.summary?.payment_breakdown_by_mode || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['EXTRA INCOME BREAKDOWN'],
            ['Type', 'Amount', 'Count'],
            ...(reportData.summary?.extra_income_breakdown_by_type || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['EXPENSE BREAKDOWN BY PAYMENT TYPE'],
            ['Payment Type', 'Amount', 'Count'],
            ...(reportData.summary?.expense_breakdown_by_payment_type || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['EXPENSE BREAKDOWN BY EXPENSE TYPE'],
            ['Expense Type', 'Amount', 'Count'],
            ...(reportData.summary?.expense_breakdown_by_expense_type || []).map(item => [item.expense_type, item.amount, item.count]),
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Payments Sheet
        if (reportData.transactions?.payments?.length > 0) {
            const paymentsData = [
                ['PAYMENTS DETAILS'],
                [],
                ['Date', 'Payment No', 'Customer', 'Amount', 'Payment Mode', 'Payment Type', 'Booking Center', 'Description'],
                ...reportData.transactions.payments.map(p => [
                    p.date,
                    p.payment_number,
                    p.customer?.name || 'N/A',
                    p.amount,
                    p.payment_mode_label,
                    p.payment_type_label,
                    p.booking_center?.name || 'N/A',
                    p.description || ''
                ])
            ];
            const paymentsWs = XLSX.utils.aoa_to_sheet(paymentsData);
            XLSX.utils.book_append_sheet(wb, paymentsWs, 'Payments');
        }

        // Expenses Sheet
        if (reportData.transactions?.expenses?.length > 0) {
            const expensesData = [
                ['EXPENSES DETAILS'],
                [],
                ['Date', 'Expense Type', 'Amount', 'Payment Type', 'Center', 'Description'],
                ...reportData.transactions.expenses.map(e => [
                    e.date,
                    e.expense_type,
                    e.amount,
                    e.payment_type_label,
                    e.center?.name || 'N/A',
                    e.description || e.notes || ''
                ])
            ];
            const expensesWs = XLSX.utils.aoa_to_sheet(expensesData);
            XLSX.utils.book_append_sheet(wb, expensesWs, 'Expenses');
        }

        // Extra Income Sheet
        if (reportData.transactions?.extra_incomes?.length > 0) {
            const extraIncomeData = [
                ['EXTRA INCOME DETAILS'],
                [],
                ['Date', 'Income Type', 'Amount', 'Center', 'Description'],
                ...reportData.transactions.extra_incomes.map(i => [
                    i.date,
                    i.income_type_label,
                    i.amount,
                    i.center?.name || 'N/A',
                    i.description || ''
                ])
            ];
            const extraIncomeWs = XLSX.utils.aoa_to_sheet(extraIncomeData);
            XLSX.utils.book_append_sheet(wb, extraIncomeWs, 'Extra Income');
        }

        // Investments Sheet
        if (reportData.transactions?.investments?.length > 0) {
            const investmentsData = [
                ['INVESTMENTS & WITHDRAWALS'],
                [],
                ['Date', 'Type', 'Amount', 'Center', 'Notes'],
                ...reportData.transactions.investments.map(i => [
                    i.date,
                    i.type === 'IN' ? 'Investment' : 'Withdrawal',
                    i.amount,
                    i.center?.name || 'N/A',
                    i.notes || ''
                ])
            ];
            const investmentsWs = XLSX.utils.aoa_to_sheet(investmentsData);
            XLSX.utils.book_append_sheet(wb, investmentsWs, 'Investments');
        }

        const fileName = `Profit-Loss-${moment(dateRange.from).format('DD-MM-YY')}-to-${moment(dateRange.to).format('DD-MM-YY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Pagination handlers
    const handlePaymentsPagination = (pageIndex, pageSize) => {
        setPaymentsPagination({ pageIndex, pageSize });
    };

    const handleExpensesPagination = (pageIndex, pageSize) => {
        setExpensesPagination({ pageIndex, pageSize });
    };

    const handleExtraIncomePagination = (pageIndex, pageSize) => {
        setExtraIncomePagination({ pageIndex, pageSize });
    };

    const handleInvestmentsPagination = (pageIndex, pageSize) => {
        setInvestmentsPagination({ pageIndex, pageSize });
    };

    const handleCustomerPagination = (pageIndex, pageSize) => {
        setCustomerPagination({ pageIndex, pageSize });
    };

    const handleCustomerPaymentsPagination = (pageIndex, pageSize) => {
        setCustomerPaymentsPagination({ pageIndex, pageSize });
    };

    // Get paginated data for customer modal
    const getPaginatedCustomerPayments = () => {
        if (!selectedCustomer?.payments) return [];
        const start = customerPaymentsPagination.pageIndex * customerPaymentsPagination.pageSize;
        const end = start + customerPaymentsPagination.pageSize;
        return selectedCustomer.payments.slice(start, end);
    };

    
    // Get paginated data for all tables
    const paginatedPayments = getPaginatedData(
        reportData?.transactions?.payments || [],
        paymentsPagination.pageIndex,
        paymentsPagination.pageSize
    );

    const paginatedExpenses = getPaginatedData(
        reportData?.transactions?.expenses || [],
        expensesPagination.pageIndex,
        expensesPagination.pageSize
    );

    const paginatedExtraIncome = getPaginatedData(
        reportData?.transactions?.extra_incomes || [],
        extraIncomePagination.pageIndex,
        extraIncomePagination.pageSize
    );

    const paginatedInvestments = getPaginatedData(
        reportData?.transactions?.investments || [],
        investmentsPagination.pageIndex,
        investmentsPagination.pageSize
    );

    const paginatedCustomers = getPaginatedData(
        reportData?.breakdown?.by_customer || [],
        customerPagination.pageIndex,
        customerPagination.pageSize
    );

    if (loading || centersLoading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading report data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <IconTrendingDown className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Report</h3>
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchReportData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Profit & Loss Report</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Comprehensive financial analysis with date range filtering</p>
            </div>

            {/* Date Range and Center Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Select Date Range & Center</h2>
                        <p className="text-sm text-gray-600">Choose the period for your profit & loss analysis</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IconCalendar className="inline w-4 h-4 mr-1" />
                            From Date
                        </label>
                        <input
                            type="date"
                            name="from"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange.from}
                            onChange={handleDateRangeChange}
                            max={moment().format('YYYY-MM-DD')}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IconCalendar className="inline w-4 h-4 mr-1" />
                            To Date
                        </label>
                        <input
                            type="date"
                            name="to"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateRange.to}
                            onChange={handleDateRangeChange}
                            max={moment().format('YYYY-MM-DD')}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IconBuilding className="inline w-4 h-4 mr-1" />
                            Filter by Center
                        </label>
                        <Select
                            options={centerOptions}
                            value={selectedCenter}
                            onChange={handleCenterChange}
                            placeholder="Select a center..."
                            isClearable
                            styles={selectStyles}
                        />
                    </div>
                    
                    <div className="flex items-end">
                        <button onClick={fetchReportData} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Export Button */}
            {reportData && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {_.includes(accessIds, '5') && (
                            <button onClick={onDownloadExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm flex items-center text-sm">
                                <IconDownload className="mr-2 w-4 h-4" />
                                Export Excel Report
                            </button>
                        )}
                        
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {moment(dateRange.from).format('DD MMM YYYY')} - {moment(dateRange.to).format('DD MMM YYYY')} | {selectedCenter?.label || 'All Centers'}
                            </h3>
                            <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium mt-1 ${reportData.summary?.profit_loss_status === 'profit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {reportData.summary?.profit_loss_status === 'profit' ? <IconTrendingUp className="w-4 h-4 mr-1" /> : <IconTrendingDown className="w-4 h-4 mr-1" />}
                                {reportData.summary?.profit_loss_status === 'profit' ? 'PROFIT' : 'LOSS'}: {formatCurrency(Math.abs(reportData.summary?.total_profit_loss || 0))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Mode Toggle */}
            {reportData && (
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setViewMode('summary')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'summary' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            <IconPieChart className="w-4 h-4 mr-2" />
                            Summary
                        </button>
                        <button onClick={() => setViewMode('payments')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'payments' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            <IconMoney className="w-4 h-4 mr-2" />
                            Payments ({reportData.transactions?.payments?.length || 0})
                        </button>
                        <button onClick={() => setViewMode('expenses')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'expenses' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            <IconReceipt className="w-4 h-4 mr-2" />
                            Expenses ({reportData.transactions?.expenses?.length || 0})
                        </button>
                        {(reportData.transactions?.extra_incomes?.length > 0) && (
                            <button onClick={() => setViewMode('extraIncome')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'extraIncome' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                <IconTrendingUp className="w-4 h-4 mr-2" />
                                Extra Income ({reportData.transactions?.extra_incomes?.length || 0})
                            </button>
                        )}
                        {(reportData.transactions?.investments?.length > 0) && (
                            <button onClick={() => setViewMode('investments')} className={`px-4 py-2 rounded-lg flex items-center ${viewMode === 'investments' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                <IconPieChart className="w-4 h-4 mr-2" />
                                Investments ({reportData.transactions?.investments?.length || 0})
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Cards and Sections */}
            {reportData && viewMode === 'summary' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Total Income</h3>
                                <div className="p-2 bg-blue-100 rounded-full"><IconMoney className="w-5 h-5 text-blue-600" /></div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-700 mb-2">{formatCurrency(reportData.summary?.total_income || 0)}</div>
                                <div className="text-sm text-gray-600">{reportData.summary?.total_payments || 0} payments, {reportData.summary?.total_extra_income_count || 0} extra income</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Total Expenses</h3>
                                <div className="p-2 bg-red-100 rounded-full"><IconReceipt className="w-5 h-5 text-red-600" /></div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-700 mb-2">{formatCurrency(reportData.summary?.total_expense_amount || 0)}</div>
                                <div className="text-sm text-gray-600">{reportData.summary?.total_expense_payments || 0} transactions</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Operational P/L</h3>
                                <div className={`p-2 rounded-full ${parseFloat(reportData.summary?.operational_profit_loss || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {parseFloat(reportData.summary?.operational_profit_loss || 0) >= 0 ? <IconTrendingUp className="w-5 h-5 text-green-600" /> : <IconTrendingDown className="w-5 h-5 text-red-600" />}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold mb-2 ${parseFloat(reportData.summary?.operational_profit_loss || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(Math.abs(reportData.summary?.operational_profit_loss || 0))}
                                </div>
                                <div className="text-sm text-gray-600">Income - Expenses</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Net Profit/Loss</h3>
                                <div className={`p-2 rounded-full ${reportData.summary?.profit_loss_status === 'profit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {reportData.summary?.profit_loss_status === 'profit' ? <IconTrendingUp className="w-5 h-5 text-green-600" /> : <IconTrendingDown className="w-5 h-5 text-red-600" />}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold mb-2 ${reportData.summary?.profit_loss_status === 'profit' ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(Math.abs(reportData.summary?.total_profit_loss || 0))}
                                </div>
                                <div className="text-sm text-gray-600">After investments & withdrawals</div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800">Payment Breakdown</h3>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Type</h4>
                                    <div className="space-y-2">
                                        {(reportData.summary?.payment_breakdown_by_type || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Mode</h4>
                                    <div className="space-y-2">
                                        {(reportData.summary?.payment_breakdown_by_mode || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                                <h3 className="text-lg font-semibold text-red-800">Expense Breakdown</h3>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Expense Type</h4>
                                    <div className="space-y-2">
                                        {(reportData.summary?.expense_breakdown_by_expense_type || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100" onClick={() => handleViewExpenseDetails(item)}>
                                                <span className="text-sm font-medium text-gray-700">{item.expense_type}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-red-600">{formatCurrency(item.total)}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Type</h4>
                                    <div className="space-y-2">
                                        {(reportData.summary?.expense_breakdown_by_payment_type || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-red-600">{formatCurrency(item.total)}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extra Income & Investment Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {(reportData.summary?.extra_income_breakdown_by_type?.length > 0) && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
                                    <h3 className="text-lg font-semibold text-yellow-800">Extra Income</h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2">
                                        {(reportData.summary?.extra_income_breakdown_by_type || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(reportData.transactions?.investments?.length > 0) && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                                    <h3 className="text-lg font-semibold text-purple-800">Investments & Withdrawals</h3>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2">
                                        {reportData.transactions.investments.slice(0, 5).map((inv, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">{inv.type === 'IN' ? 'Investment' : 'Withdrawal'}</span>
                                                    {inv.center && <span className="text-xs text-gray-500 ml-2">- {inv.center.name}</span>}
                                                </div>
                                                <span className={`text-sm font-bold ${inv.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(inv.amount)}
                                                </span>
                                            </div>
                                        ))}
                                        {reportData.transactions.investments.length > 5 && (
                                            <div className="text-center text-sm text-gray-500 pt-2">
                                                ... and {reportData.transactions.investments.length - 5} more transactions
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Customer Summary Table with Pagination */}
                    {reportData.breakdown?.by_customer?.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">Customer Summary</h3>
                                <p className="text-sm text-gray-600">{reportData.summary?.unique_customers || 0} unique customers</p>
                            </div>
                            <div className="p-4">
                                <Table
                                    columns={customerColumns}
                                    data={paginatedCustomers}
                                    pageSize={customerPagination.pageSize}
                                    pageIndex={customerPagination.pageIndex}
                                    totalCount={reportData.breakdown.by_customer.length}
                                    totalPages={Math.ceil(reportData.breakdown.by_customer.length / customerPagination.pageSize)}
                                    onPaginationChange={handleCustomerPagination}
                                    pagination={true}
                                    isSearchable={false}
                                    isSortable={true}
                                    theadClass="bg-gray-50"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Payments Table with Pagination */}
            {reportData && viewMode === 'payments' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Payment Details</h3>
                        <p className="text-gray-600 text-sm">{reportData.transactions?.payments?.length || 0} payments found</p>
                    </div>
                    <div className="p-2 sm:p-4">
                        <Table
                            columns={paymentColumns}
                            data={paginatedPayments}
                            pageSize={paymentsPagination.pageSize}
                            pageIndex={paymentsPagination.pageIndex}
                            totalCount={reportData.transactions?.payments?.length || 0}
                            totalPages={Math.ceil((reportData.transactions?.payments?.length || 0) / paymentsPagination.pageSize)}
                            onPaginationChange={handlePaymentsPagination}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            theadClass="bg-gray-50"
                        />
                    </div>
                </div>
            )}

            {/* Expenses Table with Pagination */}
            {reportData && viewMode === 'expenses' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Expense Details</h3>
                        <p className="text-gray-600 text-sm">{reportData.transactions?.expenses?.length || 0} expenses found</p>
                    </div>
                    <div className="p-2 sm:p-4">
                        <Table
                            columns={expenseColumns}
                            data={paginatedExpenses}
                            pageSize={expensesPagination.pageSize}
                            pageIndex={expensesPagination.pageIndex}
                            totalCount={reportData.transactions?.expenses?.length || 0}
                            totalPages={Math.ceil((reportData.transactions?.expenses?.length || 0) / expensesPagination.pageSize)}
                            onPaginationChange={handleExpensesPagination}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            theadClass="bg-gray-50"
                        />
                    </div>
                </div>
            )}

            {/* Extra Income Table with Pagination */}
            {reportData && viewMode === 'extraIncome' && reportData.transactions?.extra_incomes?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Extra Income Details</h3>
                        <p className="text-gray-600 text-sm">{reportData.transactions?.extra_incomes?.length || 0} extra income entries found</p>
                    </div>
                    <div className="p-2 sm:p-4">
                        <Table
                            columns={extraIncomeColumns}
                            data={paginatedExtraIncome}
                            pageSize={extraIncomePagination.pageSize}
                            pageIndex={extraIncomePagination.pageIndex}
                            totalCount={reportData.transactions?.extra_incomes?.length || 0}
                            totalPages={Math.ceil((reportData.transactions?.extra_incomes?.length || 0) / extraIncomePagination.pageSize)}
                            onPaginationChange={handleExtraIncomePagination}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            theadClass="bg-gray-50"
                        />
                    </div>
                </div>
            )}

            {/* Investments Table with Pagination */}
            {reportData && viewMode === 'investments' && reportData.transactions?.investments?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Investments & Withdrawals</h3>
                        <p className="text-gray-600 text-sm">{reportData.transactions?.investments?.length || 0} transactions found</p>
                    </div>
                    <div className="p-2 sm:p-4">
                        <Table
                            columns={investmentColumns}
                            data={paginatedInvestments}
                            pageSize={investmentsPagination.pageSize}
                            pageIndex={investmentsPagination.pageIndex}
                            totalCount={reportData.transactions?.investments?.length || 0}
                            totalPages={Math.ceil((reportData.transactions?.investments?.length || 0) / investmentsPagination.pageSize)}
                            onPaginationChange={handleInvestmentsPagination}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            theadClass="bg-gray-50"
                        />
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {!reportData && !loading && !error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
                    <IconCalendar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Data Available</h3>
                    <p className="text-yellow-600 mb-4">Select a date range and center to view the profit & loss report</p>
                    <button onClick={fetchReportData} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                        Load Data
                    </button>
                </div>
            )}

            {/* Customer Payment Modal with Pagination */}
            {showCustomerModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Payment Details - {selectedCustomer.customer_name}</h3>
                                        <p className="text-sm text-gray-600">Phone: {selectedCustomer.customer_number} | Total: {formatCurrency(selectedCustomer.total_amount)} | Payments: {selectedCustomer.payment_count}</p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><IconX className="w-6 h-6" /></button>
                                </div>
                                <div className="mt-4">
                                    <Table
                                        columns={customerPaymentColumns}
                                        data={getPaginatedCustomerPayments()}
                                        pageSize={customerPaymentsPagination.pageSize}
                                        pageIndex={customerPaymentsPagination.pageIndex}
                                        totalCount={selectedCustomer.payments?.length || 0}
                                        totalPages={Math.ceil((selectedCustomer.payments?.length || 0) / customerPaymentsPagination.pageSize)}
                                        onPaginationChange={handleCustomerPaymentsPagination}
                                        pagination={true}
                                        isSearchable={false}
                                        isSortable={true}
                                        theadClass="bg-gray-50"
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Details Modal */}
            {showExpenseModal && selectedExpenseType && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Expense Details - {selectedExpenseType.name}</h3>
                                        <p className="text-sm text-gray-600">Total: {formatCurrency(selectedExpenseType.total)} | Transactions: {selectedExpenseType.count}</p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><IconX className="w-6 h-6" /></button>
                                </div>
                                <div className="overflow-x-auto max-h-96">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment Type</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Center</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedExpenseType.expenses.map((expense, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-sm">{moment(expense.date).format('DD/MM/YYYY')}</td>
                                                    <td className="px-4 py-2 text-sm text-right font-bold text-red-700">{formatCurrency(expense.amount)}</td>
                                                    <td className="px-4 py-2 text-sm">{expense.payment_type_label}</td>
                                                    <td className="px-4 py-2 text-sm">{expense.center?.name || '-'}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-500">{expense.description || expense.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button onClick={closeModal} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitLossReport;