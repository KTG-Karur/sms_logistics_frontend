import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconDownload from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconFilter from '../../../components/Icon/IconSearch';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconTrendingDown from '../../../components/Icon/IconTrendingDown';
import IconPackage from '../../../components/Icon/IconBox';
import IconTruck from '../../../components/Icon/IconTruck';
import IconUsers from '../../../components/Icon/IconUsers';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconClock from '../../../components/Icon/IconClock';
import IconChartBar from '../../../components/Icon/IconChartBar';
import IconBuilding from '../../../components/Icon/IconBuilding';
import Table from '../../../util/Table';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getDateRangeProfitLossApi } from '../../../api/ReportApi';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { findArrObj, showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';
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
    const [selectedFilters, setSelectedFilters] = useState({
        packageType: 'all',
        expenseCategory: 'all',
        paymentStatus: 'all',
        profitStatus: 'all',
        vehicleType: 'all',
        staffMember: 'all'
    });
    const [reportData, setReportData] = useState({
        summary: null,
        dailyData: [],
        filteredPackages: [],
        filteredExpenses: [],
        totals: null,
        rawData: null
    });
    const [viewMode, setViewMode] = useState('summary'); // 'summary', 'packages', 'expenses', 'daily'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize data
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
                const processedData = processApiData(response.data);
                setReportData(processedData);
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

    const processApiData = (data) => {
        // Extract payments and expenses
        const payments = data?.transactions?.payments || [];
        const expenses = data?.transactions?.expenses || [];
        
        // Group by date for daily data
        const dailyMap = new Map();
        
        // Process payments
        payments.forEach(payment => {
            const date = payment.date;
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    date,
                    dayOfWeek: moment(date).format('dddd'),
                    packages: [],
                    expenses: [],
                    dailyRevenue: 0,
                    dailyExpense: 0,
                    dailyProfit: 0,
                    profitMargin: 0,
                    isProfitDay: false,
                    totalPackages: 0,
                    totalExpenses: 0,
                    vehicleExpense: 0,
                    staffExpense: 0,
                    otherExpense: 0
                });
            }
            
            const dayData = dailyMap.get(date);
            
            // Create package object from payment
            const packageObj = {
                id: payment.payment_id,
                packageId: payment.payment_number,
                date: payment.date,
                packageType: payment.type || 'Standard',
                weight: 'N/A',
                dimensions: 'N/A',
                fromLocation: payment.booking_center?.name || 'Unknown',
                toLocation: payment.booking_center?.name || 'Unknown',
                packageValue: parseFloat(payment.amount || 0),
                packageCost: 0, // We don't have cost data
                packageProfit: parseFloat(payment.amount || 0), // Assume profit equals revenue since no cost data
                vehicleType: 'Standard',
                staffMember: payment.customer?.name || 'N/A',
                status: payment.type === 'full' ? 'Delivered' : 'In Transit',
                deliveryTime: payment.date,
                isProfitable: true // All payments are profitable in this context
            };
            
            dayData.packages.push(packageObj);
            dayData.dailyRevenue += parseFloat(payment.amount || 0);
            dayData.totalPackages++;
        });
        
        // Process expenses
        expenses.forEach(expense => {
            const date = expense.date;
            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    date,
                    dayOfWeek: moment(date).format('dddd'),
                    packages: [],
                    expenses: [],
                    dailyRevenue: 0,
                    dailyExpense: 0,
                    dailyProfit: 0,
                    profitMargin: 0,
                    isProfitDay: false,
                    totalPackages: 0,
                    totalExpenses: 0,
                    vehicleExpense: 0,
                    staffExpense: 0,
                    otherExpense: 0
                });
            }
            
            const dayData = dailyMap.get(date);
            
            // Create expense object
            const expenseObj = {
                id: expense.expense_payment_id,
                expenseId: `EXP-${moment(expense.date).format('DDMM')}-${dayData.expenses.length + 1}`,
                date: expense.date,
                name: expense.type || 'Expense',
                description: expense.description || '',
                category: getExpenseCategory(expense.type),
                subCategory: expense.type || 'General',
                type: 'daily',
                amount: parseFloat(expense.amount || 0),
                status: 'paid',
                paidAmount: parseFloat(expense.amount || 0),
                balance: 0,
                vendor: 'N/A',
                paymentMethod: expense.payment_type || 'Cash'
            };
            
            dayData.expenses.push(expenseObj);
            dayData.dailyExpense += parseFloat(expense.amount || 0);
            dayData.totalExpenses++;
            
            // Categorize expense for breakdown
            const category = getExpenseCategory(expense.type);
            if (category === 'vehicle') {
                dayData.vehicleExpense += parseFloat(expense.amount || 0);
            } else if (category === 'staff') {
                dayData.staffExpense += parseFloat(expense.amount || 0);
            } else {
                dayData.otherExpense += parseFloat(expense.amount || 0);
            }
        });
        
        // Calculate daily profits and convert map to array
        const dailyData = Array.from(dailyMap.values()).map(day => {
            day.dailyProfit = day.dailyRevenue - day.dailyExpense;
            day.profitMargin = day.dailyRevenue > 0 ? (day.dailyProfit / day.dailyRevenue) * 100 : 0;
            day.isProfitDay = day.dailyProfit > 0;
            return day;
        }).sort((a, b) => moment(a.date).diff(moment(b.date)));
        
        // Calculate overall totals
        const allPackages = dailyData.flatMap(day => day.packages);
        const allExpenses = dailyData.flatMap(day => day.expenses);
        
        const totalRevenue = allPackages.reduce((sum, pkg) => sum + pkg.packageValue, 0);
        const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalProfit = totalRevenue - totalExpenses;
        const overallProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        
        // Count profit/loss days
        const profitDays = dailyData.filter(day => day.isProfitDay).length;
        const lossDays = dailyData.filter(day => !day.isProfitDay).length;
        
        // Calculate totals by expense category
        const totalVehicleExpense = allExpenses.filter(e => e.category === 'vehicle').reduce((sum, e) => sum + e.amount, 0);
        const totalStaffExpense = allExpenses.filter(e => e.category === 'staff').reduce((sum, e) => sum + e.amount, 0);
        const totalOtherExpense = allExpenses.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0);
        
        return {
            summary: {
                dateRange: { from: dateRange.from, to: dateRange.to },
                totalDays: dailyData.length,
                profitDays,
                lossDays,
                profitPercentage: dailyData.length > 0 ? ((profitDays / dailyData.length) * 100).toFixed(1) : 0,
                
                totalRevenue,
                totalExpenses,
                totalProfit,
                overallProfitMargin: parseFloat(overallProfitMargin.toFixed(1)),
                isOverallProfit: totalProfit > 0,
                
                avgDailyRevenue: dailyData.length > 0 ? totalRevenue / dailyData.length : 0,
                avgDailyExpense: dailyData.length > 0 ? totalExpenses / dailyData.length : 0,
                avgDailyProfit: dailyData.length > 0 ? totalProfit / dailyData.length : 0,
                
                totalPackages: allPackages.length,
                totalExpenseItems: allExpenses.length,
                
                totalVehicleExpense,
                totalStaffExpense,
                totalOtherExpense,
                vehicleExpensePercentage: totalExpenses > 0 ? ((totalVehicleExpense / totalExpenses) * 100).toFixed(1) : 0,
                staffExpensePercentage: totalExpenses > 0 ? ((totalStaffExpense / totalExpenses) * 100).toFixed(1) : 0,
                otherExpensePercentage: totalExpenses > 0 ? ((totalOtherExpense / totalExpenses) * 100).toFixed(1) : 0,
                
                paidExpenses: allExpenses.filter(e => e.status === 'paid').length,
                unpaidExpenses: allExpenses.filter(e => e.status === 'unpaid').length,
                partialExpenses: allExpenses.filter(e => e.status === 'partially_paid').length,
                
                profitablePackages: allPackages.filter(p => p.isProfitable).length,
                lossPackages: allPackages.filter(p => !p.isProfitable).length,
            },
            dailyData,
            allPackages,
            allExpenses,
            filteredPackages: allPackages,
            filteredExpenses: allExpenses,
            totals: {
                totalRevenue,
                totalExpenses,
                totalProfit,
                totalVehicleExpense,
                totalStaffExpense,
                totalOtherExpense
            },
            rawData: data
        };
    };

    const getExpenseCategory = (expenseType) => {
        const vehicleTypes = ['Fuel', 'Diesel', 'Petrol', 'Maintenance', 'Repair', 'Toll', 'Parking'];
        const staffTypes = ['Salary', 'Wage', 'Staff', 'Driver', 'Overtime', 'Bonus'];
        
        if (vehicleTypes.includes(expenseType)) return 'vehicle';
        if (staffTypes.includes(expenseType)) return 'staff';
        return 'other';
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
        if (!reportData.allPackages || !reportData.allExpenses) return;
        
        setLoading(true);
        
        setTimeout(() => {
            let filteredPackages = [...reportData.allPackages];
            let filteredExpenses = [...reportData.allExpenses];
            
            // Apply package filters
            if (selectedFilters.packageType !== 'all') {
                filteredPackages = filteredPackages.filter(pkg => pkg.packageType === selectedFilters.packageType);
            }
            
            if (selectedFilters.profitStatus !== 'all') {
                filteredPackages = filteredPackages.filter(pkg => 
                    selectedFilters.profitStatus === 'profit' ? pkg.isProfitable : !pkg.isProfitable
                );
            }
            
            if (selectedFilters.vehicleType !== 'all') {
                filteredPackages = filteredPackages.filter(pkg => pkg.vehicleType === selectedFilters.vehicleType);
            }
            
            if (selectedFilters.staffMember !== 'all') {
                filteredPackages = filteredPackages.filter(pkg => pkg.staffMember === selectedFilters.staffMember);
            }
            
            // Apply expense filters
            if (selectedFilters.expenseCategory !== 'all') {
                filteredExpenses = filteredExpenses.filter(exp => exp.category === selectedFilters.expenseCategory);
            }
            
            if (selectedFilters.paymentStatus !== 'all') {
                filteredExpenses = filteredExpenses.filter(exp => exp.status === selectedFilters.paymentStatus);
            }
            
            setReportData(prev => ({
                ...prev,
                filteredPackages,
                filteredExpenses
            }));
            setLoading(false);
        }, 500);
    };

    const resetFilters = () => {
        setSelectedFilters({
            packageType: 'all',
            expenseCategory: 'all',
            paymentStatus: 'all',
            profitStatus: 'all',
            vehicleType: 'all',
            staffMember: 'all'
        });
        
        setReportData(prev => ({
            ...prev,
            filteredPackages: prev.allPackages,
            filteredExpenses: prev.allExpenses
        }));
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

    // Transform office centers for react-select
    const centerOptions = [
        { value: '', label: 'All Centers' },
        ...(officeCentersData || []).map((center) => ({
            value: center.id,
            label: center.officeCentersName,
        })),
    ];

    // Custom styles for react-select
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
            '&:active': {
                backgroundColor: state.isSelected ? '#2563eb' : '#cbd5e0',
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 50,
        }),
    };

    // Package Columns
    const packageColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => (
                <div className="text-sm">
                    <div>{moment(value).format('DD/MM')}</div>
                    <div className="text-xs text-gray-500">{moment(value).format('ddd')}</div>
                </div>
            ),
        },
        {
            Header: 'Payment ID',
            accessor: 'packageId',
            width: 120,
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Payment Details',
            accessor: 'packageDetails',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.packageType}</div>
                    <div className="text-xs text-gray-500">
                        {row.original.fromLocation} → {row.original.toLocation}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'packageValue',
            Cell: ({ value }) => (
                <div>
                    <div className="font-bold text-green-700">{formatCurrency(value)}</div>
                </div>
            ),
        },
        {
            Header: 'Customer',
            accessor: 'staffMember',
            Cell: ({ value }) => (
                <div className="text-sm font-medium">{value}</div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        value === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {value}
                    </span>
                </div>
            ),
        },
    ];

    // Expense Columns
    const expenseColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            width: 100,
            Cell: ({ value }) => (
                <div className="text-sm">
                    <div>{moment(value).format('DD/MM')}</div>
                    <div className="text-xs text-gray-500">{moment(value).format('ddd')}</div>
                </div>
            ),
        },
        {
            Header: 'Expense ID',
            accessor: 'expenseId',
            width: 100,
            Cell: ({ value }) => <span className="font-bold text-red-600">{value}</span>,
        },
        {
            Header: 'Expense Details',
            accessor: 'name',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-gray-500">{row.original.description}</div>
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value }) => (
                <div className="font-bold text-red-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Payment Status',
            accessor: 'paymentStatus',
            Cell: ({ row }) => (
                <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        row.original.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        row.original.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }`}>
                        {row.original.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
            ),
        },
        {
            Header: 'Category',
            accessor: 'category',
            Cell: ({ value }) => (
                <div className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                    value === 'vehicle' ? 'bg-blue-100 text-blue-800' :
                    value === 'staff' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {value}
                </div>
            ),
        },
    ];

    // Daily Summary Columns
    const dailyColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            width: 120,
            Cell: ({ value, row }) => (
                <div className="text-sm">
                    <div className="font-medium">{moment(value).format('DD MMM YYYY')}</div>
                    <div className="text-xs text-gray-500">{row.original.dayOfWeek}</div>
                </div>
            ),
        },
        {
            Header: 'Payments',
            accessor: 'totalPackages',
            Cell: ({ value }) => (
                <div className="text-center">
                    <div className="font-bold text-blue-700">{value}</div>
                </div>
            ),
        },
        {
            Header: 'Revenue',
            accessor: 'dailyRevenue',
            Cell: ({ value }) => (
                <div className="font-bold text-green-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Expenses',
            accessor: 'dailyExpense',
            Cell: ({ value }) => (
                <div className="font-bold text-red-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Profit/Loss',
            accessor: 'dailyProfit',
            Cell: ({ value }) => (
                <div className={`font-bold ${value >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(value)}
                </div>
            ),
        },
        {
            Header: 'Margin %',
            accessor: 'profitMargin',
            Cell: ({ value }) => (
                <div className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                </div>
            ),
        },
        {
            Header: 'Day Status',
            accessor: 'isProfitDay',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {value ? 'Profit Day' : 'Loss Day'}
                </span>
            ),
        },
        {
            Header: 'Breakdown',
            accessor: 'breakdown',
            Cell: ({ row }) => (
                <div className="text-xs text-gray-600">
                    <div>Vehicle: {formatCurrency(row.original.vehicleExpense)}</div>
                    <div>Staff: {formatCurrency(row.original.staffExpense)}</div>
                </div>
            ),
        },
    ];

    const onDownloadExcel = () => {
        if (!reportData.summary) return;

        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryHeader = [
            ['PROFIT & LOSS REPORT - SUMMARY'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [`Center: ${selectedCenter?.label || 'All Centers'}`],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['OVERALL SUMMARY'],
            ['Metric', 'Value'],
            ['Report Period', `${moment(dateRange.from).format('DD MMM YYYY')} to ${moment(dateRange.to).format('DD MMM YYYY')}`],
            ['Total Days', reportData.summary.totalDays],
            ['Profit Days', reportData.summary.profitDays],
            ['Loss Days', reportData.summary.lossDays],
            ['Profit Day Percentage', `${reportData.summary.profitPercentage}%`],
            [],
            ['FINANCIAL SUMMARY', ''],
            ['Total Revenue', reportData.summary.totalRevenue],
            ['Total Expenses', reportData.summary.totalExpenses],
            ['Net Profit/Loss', reportData.summary.totalProfit],
            ['Profit Margin', `${reportData.summary.overallProfitMargin}%`],
            ['Overall Status', reportData.summary.isOverallProfit ? 'PROFIT' : 'LOSS'],
            [],
            ['DAILY AVERAGES', ''],
            ['Avg Daily Revenue', reportData.summary.avgDailyRevenue],
            ['Avg Daily Expenses', reportData.summary.avgDailyExpense],
            ['Avg Daily Profit', reportData.summary.avgDailyProfit],
            [],
            ['EXPENSE BREAKDOWN', ''],
            ['Vehicle Expenses', reportData.summary.totalVehicleExpense],
            ['Staff Expenses', reportData.summary.totalStaffExpense],
            ['Other Expenses', reportData.summary.totalOtherExpense],
            [],
            ['COUNTS', ''],
            ['Total Payments', reportData.summary.totalPackages],
            ['Total Expense Items', reportData.summary.totalExpenseItems],
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryHeader);
        summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];

        // Daily Data Sheet
        const dailyHeader = [
            ['DAILY PROFIT & LOSS DETAILS'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [],
            ['Date', 'Day', 'Payments', 'Revenue', 'Expenses', 'Profit/Loss', 'Margin %', 'Status', 'Vehicle Expense', 'Staff Expense', 'Other Expense']
        ];

        const dailyData = reportData.dailyData.map(day => [
            moment(day.date).format('DD/MM/YYYY'),
            day.dayOfWeek,
            day.totalPackages,
            day.dailyRevenue,
            day.dailyExpense,
            day.dailyProfit,
            `${day.profitMargin.toFixed(1)}%`,
            day.isProfitDay ? 'Profit' : 'Loss',
            day.vehicleExpense,
            day.staffExpense,
            day.otherExpense
        ]);

        const dailyRows = [...dailyHeader, ...dailyData];
        const dailyWs = XLSX.utils.aoa_to_sheet(dailyRows);
        dailyWs['!cols'] = [
            { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];

        // Packages Sheet
        const packageHeader = [
            ['PAYMENT DETAILS'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [],
            ['Date', 'Payment ID', 'Type', 'From', 'To', 'Amount', 'Customer', 'Status']
        ];

        const packageRows = reportData.filteredPackages.map(pkg => [
            moment(pkg.date).format('DD/MM/YYYY'),
            pkg.packageId,
            pkg.packageType,
            pkg.fromLocation,
            pkg.toLocation,
            pkg.packageValue,
            pkg.staffMember,
            pkg.status
        ]);

        const packageData = [...packageHeader, ...packageRows];
        const packageWs = XLSX.utils.aoa_to_sheet(packageData);
        packageWs['!cols'] = [
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            { wch: 12 }, { wch: 15 }, { wch: 12 }
        ];

        // Expenses Sheet
        const expenseHeader = [
            ['EXPENSES DETAILS'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [],
            ['Date', 'Expense ID', 'Name', 'Description', 'Category', 'Amount', 'Status', 'Payment Method']
        ];

        const expenseRows = reportData.filteredExpenses.map(exp => [
            moment(exp.date).format('DD/MM/YYYY'),
            exp.expenseId,
            exp.name,
            exp.description,
            exp.category,
            exp.amount,
            exp.status,
            exp.paymentMethod
        ]);

        const expenseData = [...expenseHeader, ...expenseRows];
        const expenseWs = XLSX.utils.aoa_to_sheet(expenseData);
        expenseWs['!cols'] = [
            { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Details');
        XLSX.utils.book_append_sheet(wb, packageWs, 'Payments');
        XLSX.utils.book_append_sheet(wb, expenseWs, 'Expenses');

        const fileName = `PL-Report-${moment(dateRange.from).format('DD-MM-YY')}-to-${moment(dateRange.to).format('DD-MM-YY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (loading || centersLoading || !reportData.summary) {
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
                        <button
                            onClick={() => quickDateRange(7)}
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => quickDateRange(30)}
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium border border-blue-300"
                        >
                            Last 30 Days
                        </button>
                        <button
                            onClick={() => quickDateRange(90)}
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                        >
                            Last 90 Days
                        </button>
                        <button
                            onClick={() => quickDateRange(365)}
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                        >
                            Last 1 Year
                        </button>
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            onClick={fetchReportData}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {moment(dateRange.from).format('DD MMM YYYY')} - {moment(dateRange.to).format('DD MMM YYYY')} | {selectedCenter?.label || 'All Centers'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {reportData.summary.totalDays} days • {reportData.summary.profitDays} profit days • {reportData.summary.lossDays} loss days
                    </p>
                </div>
            </div>

            {/* Export Button */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={onDownloadExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                    >
                        <IconDownload className="mr-2 w-4 h-4" />
                        Export Excel Report
                    </button>
                    
                    <div className="text-sm text-gray-600">
                        Showing {reportData.summary.totalDays} days of data
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                viewMode === 'summary' 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <IconChartBar className="w-4 h-4 mr-2" />
                            Summary
                        </button>
                        <button
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                viewMode === 'daily' 
                                    ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <IconCalendar className="w-4 h-4 mr-2" />
                            Daily View
                        </button>
                        <button
                            onClick={() => setViewMode('packages')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                viewMode === 'packages' 
                                    ? 'bg-green-100 text-green-700 border border-green-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <IconMoney className="w-4 h-4 mr-2" />
                            Payments ({reportData.filteredPackages.length})
                        </button>
                        <button
                            onClick={() => setViewMode('expenses')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                viewMode === 'expenses' 
                                    ? 'bg-red-100 text-red-700 border border-red-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <IconReceipt className="w-4 h-4 mr-2" />
                            Expenses ({reportData.filteredExpenses.length})
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        {viewMode === 'summary' && 'Financial Summary'}
                        {viewMode === 'daily' && 'Daily Profit/Loss Breakdown'}
                        {viewMode === 'packages' && 'Payment Details'}
                        {viewMode === 'expenses' && 'Expense Details'}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Revenue Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Total Revenue</h3>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <IconMoney className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700 mb-2">
                            {formatCurrency(reportData.summary.totalRevenue)}
                        </div>
                        <div className="text-sm text-gray-600">
                            Avg: {formatCurrency(reportData.summary.avgDailyRevenue)}/day
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {formatNumber(reportData.summary.totalPackages)} payments
                        </div>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Total Expenses</h3>
                        <div className="p-2 bg-red-100 rounded-full">
                            <IconReceipt className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-700 mb-2">
                            {formatCurrency(reportData.summary.totalExpenses)}
                        </div>
                        <div className="text-sm text-gray-600">
                            Avg: {formatCurrency(reportData.summary.avgDailyExpense)}/day
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {formatNumber(reportData.summary.totalExpenseItems)} items
                        </div>
                    </div>
                </div>

                {/* Net Profit Card */}
                <div className={`bg-white rounded-lg shadow-sm p-4 border ${reportData.summary.isOverallProfit ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Net Profit/Loss</h3>
                        <div className={`p-2 rounded-full ${reportData.summary.isOverallProfit ? 'bg-green-100' : 'bg-red-100'}`}>
                            {reportData.summary.isOverallProfit ? (
                                <IconTrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                                <IconTrendingDown className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold mb-2 ${reportData.summary.isOverallProfit ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(reportData.summary.totalProfit)}
                        </div>
                        <div className={`text-sm ${reportData.summary.overallProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {reportData.summary.overallProfitMargin >= 0 ? '+' : ''}{reportData.summary.overallProfitMargin}% Margin
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Avg: {formatCurrency(reportData.summary.avgDailyProfit)}/day
                        </div>
                    </div>
                </div>

                {/* Performance Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Performance</h3>
                        <div className="p-2 bg-purple-100 rounded-full">
                            <IconChartBar className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700 mb-2">
                            {reportData.summary.profitDays}/{reportData.summary.totalDays} Days
                        </div>
                        <div className="text-sm text-gray-600">
                            {reportData.summary.profitPercentage}% Profit Days
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                            <div className="bg-green-50 p-1 rounded">
                                <div className="text-green-700 font-bold">{reportData.summary.profitDays}</div>
                                <div className="text-xs text-gray-600">Profit Days</div>
                            </div>
                            <div className="bg-red-50 p-1 rounded">
                                <div className="text-red-700 font-bold">{reportData.summary.lossDays}</div>
                                <div className="text-xs text-gray-600">Loss Days</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Financial Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-700 font-medium">Total Revenue</span>
                                <span className="text-green-700 font-bold">{formatCurrency(reportData.summary.totalRevenue)}</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-600">Expense Breakdown:</div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-gray-700">Vehicle Expenses</span>
                                    </div>
                                    <div>
                                        <span className="text-red-700 font-bold">{formatCurrency(reportData.summary.totalVehicleExpense)}</span>
                                        <span className="text-xs text-gray-500 ml-2">({reportData.summary.vehicleExpensePercentage}%)</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-gray-700">Staff Expenses</span>
                                    </div>
                                    <div>
                                        <span className="text-red-700 font-bold">{formatCurrency(reportData.summary.totalStaffExpense)}</span>
                                        <span className="text-xs text-gray-500 ml-2">({reportData.summary.staffExpensePercentage}%)</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="text-gray-700">Other Expenses</span>
                                    </div>
                                    <div>
                                        <span className="text-red-700 font-bold">{formatCurrency(reportData.summary.totalOtherExpense)}</span>
                                        <span className="text-xs text-gray-500 ml-2">({reportData.summary.otherExpensePercentage}%)</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-gray-700 font-medium">Total Expenses</span>
                                <span className="text-red-700 font-bold">{formatCurrency(reportData.summary.totalExpenses)}</span>
                            </div>
                            
                            <div className={`flex justify-between items-center pt-3 border-t ${reportData.summary.isOverallProfit ? 'bg-green-50 p-3 rounded-lg' : 'bg-red-50 p-3 rounded-lg'}`}>
                                <span className={`font-bold text-lg ${reportData.summary.isOverallProfit ? 'text-green-800' : 'text-red-800'}`}>
                                    {reportData.summary.isOverallProfit ? 'Net Profit' : 'Net Loss'}
                                </span>
                                <span className={`text-2xl font-bold ${reportData.summary.isOverallProfit ? 'text-green-700' : 'text-red-700'}`}>
                                    {reportData.summary.isOverallProfit ? '+' : ''}{formatCurrency(reportData.summary.totalProfit)}
                                </span>
                            </div>
                            
                            <div className={`text-center py-2 rounded-lg ${reportData.summary.isOverallProfit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <div className="font-semibold">
                                    {reportData.summary.isOverallProfit ? 'Overall Profit' : 'Overall Loss'} • {reportData.summary.overallProfitMargin >= 0 ? '+' : ''}{reportData.summary.overallProfitMargin}% Margin
                                </div>
                                <div className="text-sm">
                                    {reportData.summary.profitDays} profit days • {reportData.summary.lossDays} loss days
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expense Distribution */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Distribution</h3>
                        <div className="space-y-4">
                            {/* Vehicle Expenses */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-gray-700">Vehicle Expenses</span>
                                    <span className="font-bold text-blue-700">{formatCurrency(reportData.summary.totalVehicleExpense)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                        className="bg-blue-600 h-4 rounded-full" 
                                        style={{ width: `${reportData.summary.vehicleExpensePercentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {reportData.summary.vehicleExpensePercentage}% of total expenses
                                </div>
                            </div>

                            {/* Staff Expenses */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-gray-700">Staff Expenses</span>
                                    <span className="font-bold text-green-700">{formatCurrency(reportData.summary.totalStaffExpense)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                        className="bg-green-600 h-4 rounded-full" 
                                        style={{ width: `${reportData.summary.staffExpensePercentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {reportData.summary.staffExpensePercentage}% of total expenses
                                </div>
                            </div>

                            {/* Other Expenses */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-gray-700">Other Expenses</span>
                                    <span className="font-bold text-purple-700">{formatCurrency(reportData.summary.totalOtherExpense)}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div 
                                        className="bg-purple-600 h-4 rounded-full" 
                                        style={{ width: `${reportData.summary.otherExpensePercentage}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {reportData.summary.otherExpensePercentage}% of total expenses
                                </div>
                            </div>

                            {/* Payment Status */}
                            <div className="pt-4 border-t">
                                <h4 className="font-medium text-gray-700 mb-3">Expense Payment Status</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-green-50 p-2 rounded text-center">
                                        <div className="text-green-700 font-bold">{reportData.summary.paidExpenses}</div>
                                        <div className="text-xs text-gray-600">Paid</div>
                                    </div>
                                    <div className="bg-yellow-50 p-2 rounded text-center">
                                        <div className="text-yellow-700 font-bold">{reportData.summary.partialExpenses}</div>
                                        <div className="text-xs text-gray-600">Partial</div>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded text-center">
                                        <div className="text-red-700 font-bold">{reportData.summary.unpaidExpenses}</div>
                                        <div className="text-xs text-gray-600">Unpaid</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'daily' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Daily Profit & Loss Breakdown
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {reportData.summary.totalDays} days from {moment(dateRange.from).format('DD MMM YYYY')} to {moment(dateRange.to).format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Profit Days: </span>
                                    <span className="font-semibold text-green-600">{reportData.summary.profitDays}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Loss Days: </span>
                                    <span className="font-semibold text-red-600">{reportData.summary.lossDays}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Success Rate: </span>
                                    <span className="font-semibold text-blue-600">{reportData.summary.profitPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <Table
                            columns={dailyColumns}
                            data={reportData.dailyData}
                            Title=""
                            pageSize={15}
                            pageIndex={0}
                            totalCount={reportData.dailyData.length}
                            totalPages={Math.ceil(reportData.dailyData.length / 15)}
                            onPaginationChange={(page, size) => {}}
                            isSortable={true}
                            pagination={true}
                            isSearchable={true}
                            tableClass="min-w-full rounded-lg overflow-hidden"
                            theadClass="bg-gray-50"
                            responsive={true}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'packages' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Payment Details
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {reportData.filteredPackages.length} payments showing
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total Revenue: </span>
                                    <span className="font-semibold text-green-600">
                                        {formatCurrency(reportData.filteredPackages.reduce((sum, pkg) => sum + pkg.packageValue, 0))}
                                    </span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Avg per Payment: </span>
                                    <span className="font-semibold text-blue-600">
                                        {formatCurrency(reportData.filteredPackages.reduce((sum, pkg) => sum + pkg.packageValue, 0) / reportData.filteredPackages.length)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <Table
                            columns={packageColumns}
                            data={reportData.filteredPackages}
                            Title=""
                            pageSize={15}
                            pageIndex={0}
                            totalCount={reportData.filteredPackages.length}
                            totalPages={Math.ceil(reportData.filteredPackages.length / 15)}
                            onPaginationChange={(page, size) => {}}
                            isSortable={true}
                            pagination={true}
                            isSearchable={true}
                            tableClass="min-w-full rounded-lg overflow-hidden"
                            theadClass="bg-gray-50"
                            responsive={true}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'expenses' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Expense Details
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {reportData.filteredExpenses.length} expense items showing
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total Expenses: </span>
                                    <span className="font-semibold text-red-600">
                                        {formatCurrency(reportData.filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                                    </span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Avg per Item: </span>
                                    <span className="font-semibold text-orange-600">
                                        {formatCurrency(reportData.filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0) / reportData.filteredExpenses.length)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <Table
                            columns={expenseColumns}
                            data={reportData.filteredExpenses}
                            Title=""
                            pageSize={15}
                            pageIndex={0}
                            totalCount={reportData.filteredExpenses.length}
                            totalPages={Math.ceil(reportData.filteredExpenses.length / 15)}
                            onPaginationChange={(page, size) => {}}
                            isSortable={true}
                            pagination={true}
                            isSearchable={true}
                            tableClass="min-w-full rounded-lg overflow-hidden"
                            theadClass="bg-gray-50"
                            responsive={true}
                        />
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Vehicle Expenses */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Vehicle Expenses</h3>
                        <IconTruck className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl font-bold text-blue-700">
                            {formatCurrency(reportData.summary.totalVehicleExpense)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {reportData.summary.vehicleExpensePercentage}% of total expenses
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Includes fuel, maintenance, repairs
                        </div>
                    </div>
                </div>

                {/* Staff Expenses */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Staff Expenses</h3>
                        <IconUsers className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(reportData.summary.totalStaffExpense)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {reportData.summary.staffExpensePercentage}% of total expenses
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Salaries and staff-related costs
                        </div>
                    </div>
                </div>

                {/* Overall Performance */}
                <div className={`bg-white rounded-lg shadow-sm p-4 border ${reportData.summary.isOverallProfit ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Overall Performance</h3>
                        {reportData.summary.isOverallProfit ? (
                            <IconTrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                            <IconTrendingDown className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className={`text-2xl font-bold ${reportData.summary.isOverallProfit ? 'text-green-700' : 'text-red-700'}`}>
                            {reportData.summary.isOverallProfit ? 'Profitable Period' : 'Loss Period'}
                        </div>
                        <div className="text-sm text-gray-600">
                            {reportData.summary.profitPercentage}% profitable days
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Net margin: {reportData.summary.overallProfitMargin >= 0 ? '+' : ''}{reportData.summary.overallProfitMargin}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Report Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Date Range</h4>
                        <p className="text-gray-600">
                            {moment(dateRange.from).format('DD MMMM YYYY')} - {moment(dateRange.to).format('DD MMMM YYYY')}
                        </p>
                        <p className="text-sm text-gray-500">
                            {reportData.summary.totalDays} days analyzed
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Key Metrics</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Total Payments: {formatNumber(reportData.summary.totalPackages)}</li>
                            <li>• Total Revenue: {formatCurrency(reportData.summary.totalRevenue)}</li>
                            <li>• Total Expenses: {formatCurrency(reportData.summary.totalExpenses)}</li>
                            <li>• Net Profit/Loss: <span className={reportData.summary.isOverallProfit ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {formatCurrency(reportData.summary.totalProfit)}
                            </span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitLossReport;