import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconDownload from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconTrendingDown from '../../../components/Icon/IconTrendingDown';
import IconPackage from '../../../components/Icon/IconBox';
import IconTruck from '../../../components/Icon/IconTruck';
import IconUsers from '../../../components/Icon/IconUsers';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconClock from '../../../components/Icon/IconClock';
import Table from '../../../util/Table';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const ProfitLossReport = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Generate separate packages and expenses data
    const generateDataForDate = (selectedDate) => {
        // Generate Packages Data
        const packages = generatePackagesData(selectedDate);
        
        // Generate Expenses Data (separate from packages)
        const expenses = generateExpensesData(selectedDate);
        
        // Calculate totals
        const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.packageValue, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
        
        return {
            date: selectedDate,
            dayOfWeek: moment(selectedDate).format('dddd'),
            packages,
            expenses, // Separate expenses array
            dailyExpenses: expenses.filter(e => e.type === 'daily'), // Daily operational expenses
            monthlyExpenses: expenses.filter(e => e.type === 'monthly'), // Monthly recurring expenses
            otherExpenses: expenses.filter(e => e.type === 'other'), // Other one-time expenses
            
            // Summary
            totalPackages: packages.length,
            totalRevenue,
            totalExpenses,
            totalProfit,
            profitMargin: parseFloat(profitMargin),
            
            // Expense Breakdown
            totalVehicleExpense: expenses.filter(e => e.category === 'vehicle').reduce((sum, e) => sum + e.amount, 0),
            totalStaffExpense: expenses.filter(e => e.category === 'staff').reduce((sum, e) => sum + e.amount, 0),
            totalFuelExpense: expenses.filter(e => e.subCategory === 'fuel').reduce((sum, e) => sum + e.amount, 0),
            totalMaintenanceExpense: expenses.filter(e => e.subCategory === 'maintenance').reduce((sum, e) => sum + e.amount, 0),
            totalSalaryExpense: expenses.filter(e => e.subCategory === 'salary').reduce((sum, e) => sum + e.amount, 0),
            totalOtherExpense: expenses.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0),
            
            // Stats
            profitablePackages: packages.filter(p => p.packageProfit > 0).length,
            lossPackages: packages.filter(p => p.packageProfit <= 0).length,
            isProfitDay: totalProfit > 0,
            status: totalProfit > 0 ? 'profit' : 'loss'
        };
    };

    const generatePackagesData = (selectedDate) => {
        const packages = [];
        const packageTypes = ['Small Package', 'Medium Package', 'Large Package', 'XL Package', 'Document'];
        
        // Generate 10-20 packages for the day
        const packageCount = Math.floor(Math.random() * 10) + 10;
        
        for (let i = 1; i <= packageCount; i++) {
            const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
            
            // Package revenue only (no expenses included)
            let packageValue = 0;
            switch(packageType) {
                case 'Small Package': packageValue = Math.floor(Math.random() * 500) + 200; break;
                case 'Medium Package': packageValue = Math.floor(Math.random() * 1000) + 500; break;
                case 'Large Package': packageValue = Math.floor(Math.random() * 2000) + 1000; break;
                case 'XL Package': packageValue = Math.floor(Math.random() * 5000) + 2000; break;
                case 'Document': packageValue = Math.floor(Math.random() * 200) + 50; break;
            }
            
            packages.push({
                id: i,
                packageId: `PKG-${moment(selectedDate).format('DDMM')}-${i.toString().padStart(3, '0')}`,
                packageType,
                weight: `${Math.floor(Math.random() * 50) + 5} kg`,
                dimensions: `${Math.floor(Math.random() * 50) + 20}x${Math.floor(Math.random() * 50) + 20}x${Math.floor(Math.random() * 50) + 20} cm`,
                fromLocation: ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 5)],
                toLocation: ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 5)],
                packageValue,
                status: ['Delivered', 'In Transit', 'Pending'][Math.floor(Math.random() * 3)],
                deliveryTime: moment(selectedDate).add(Math.floor(Math.random() * 8), 'hours').format('HH:mm'),
                
                // Vehicle & Staff Assignment (for reference only, expenses are separate)
                vehicleType: ['Tata Ace', 'Eicher Truck', 'Ashok Leyland', 'Mahindra Bolero', 'Tata 407'][Math.floor(Math.random() * 5)],
                driverName: ['Rajesh Kumar', 'Vikram Singh', 'Sanjay Verma', 'Arun Mehta', 'Mohan Reddy'][Math.floor(Math.random() * 5)],
                staffName: ['Suresh Patel', 'Ajay Sharma', 'Ramesh Gupta', 'Prakash Joshi', 'Kumar Swamy'][Math.floor(Math.random() * 5)],
            });
        }
        
        return packages;
    };

    const generateExpensesData = (selectedDate) => {
        const expenses = [];
        
        // Vehicle Expenses (Daily operational expenses)
        const vehicleExpenses = [
            { id: 1, name: 'Diesel for Truck TN-1234', category: 'vehicle', subCategory: 'fuel', amount: Math.floor(Math.random() * 5000) + 2000, type: 'daily', description: 'Fuel purchase for daily operations', date: selectedDate, status: 'paid', paidAmount: Math.floor(Math.random() * 5000) + 2000, balance: 0 },
            { id: 2, name: 'Truck Maintenance', category: 'vehicle', subCategory: 'maintenance', amount: Math.floor(Math.random() * 3000) + 1000, type: 'daily', description: 'Regular service and repairs', date: selectedDate, status: 'partially_paid', paidAmount: Math.floor(Math.random() * 2000) + 500, balance: Math.floor(Math.random() * 1000) + 500 },
            { id: 3, name: 'Toll Charges', category: 'vehicle', subCategory: 'toll', amount: Math.floor(Math.random() * 1000) + 300, type: 'daily', description: 'Highway toll payments', date: selectedDate, status: 'paid', paidAmount: Math.floor(Math.random() * 1000) + 300, balance: 0 },
            { id: 4, name: 'Parking Fees', category: 'vehicle', subCategory: 'parking', amount: Math.floor(Math.random() * 500) + 100, type: 'daily', description: 'Daily parking charges', date: selectedDate, status: 'paid', paidAmount: Math.floor(Math.random() * 500) + 100, balance: 0 },
        ];
        
        // Staff Expenses
        const staffExpenses = [
            { id: 5, name: 'Rajesh Kumar - Driver Salary', category: 'staff', subCategory: 'salary', amount: 2000, type: 'daily', description: 'Daily driver payment', date: selectedDate, status: 'unpaid', paidAmount: 0, balance: 2000 },
            { id: 6, name: 'Suresh Patel - Loadman Salary', category: 'staff', subCategory: 'salary', amount: 1200, type: 'daily', description: 'Daily loadman payment', date: selectedDate, status: 'unpaid', paidAmount: 0, balance: 1200 },
            { id: 7, name: 'Vikram Singh - Overtime', category: 'staff', subCategory: 'overtime', amount: 800, type: 'daily', description: 'Overtime payment for extra hours', date: selectedDate, status: 'paid', paidAmount: 800, balance: 0 },
            { id: 8, name: 'Ajay Sharma - Helper', category: 'staff', subCategory: 'salary', amount: 900, type: 'daily', description: 'Daily helper payment', date: selectedDate, status: 'partially_paid', paidAmount: 500, balance: 400 },
        ];
        
        // Monthly Expenses (allocated daily)
        const monthlyExpenses = [
            { id: 9, name: 'Office Rent (Monthly)', category: 'overhead', subCategory: 'rent', amount: 20000/30, type: 'monthly', description: 'Daily allocation of office rent', date: selectedDate, status: 'paid', paidAmount: 20000/30, balance: 0 },
            { id: 10, name: 'Vehicle Insurance (Monthly)', category: 'vehicle', subCategory: 'insurance', amount: 15000/30, type: 'monthly', description: 'Daily allocation of insurance', date: selectedDate, status: 'unpaid', paidAmount: 0, balance: 15000/30 },
            { id: 11, name: 'Employee Benefits (Monthly)', category: 'staff', subCategory: 'benefits', amount: 10000/30, type: 'monthly', description: 'Daily allocation of benefits', date: selectedDate, status: 'paid', paidAmount: 10000/30, balance: 0 },
        ];
        
        // Other Expenses
        const otherExpenses = [
            { id: 12, name: 'Office Supplies', category: 'other', subCategory: 'supplies', amount: Math.floor(Math.random() * 500) + 100, type: 'other', description: 'Purchase of office stationery', date: selectedDate, status: 'paid', paidAmount: Math.floor(Math.random() * 500) + 100, balance: 0 },
            { id: 13, name: 'Miscellaneous Expenses', category: 'other', subCategory: 'misc', amount: Math.floor(Math.random() * 300) + 50, type: 'other', description: 'Other miscellaneous expenses', date: selectedDate, status: 'paid', paidAmount: Math.floor(Math.random() * 300) + 50, balance: 0 },
        ];
        
        return [...vehicleExpenses, ...staffExpenses, ...monthlyExpenses, ...otherExpenses];
    };

    // States
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [dateData, setDateData] = useState(null);
    const [viewMode, setViewMode] = useState('packages'); // 'packages' or 'expenses'

    useEffect(() => {
        dispatch(setPageTitle('Daily Profit & Loss'));
        // Load today's data initially
        const data = generateDataForDate(selectedDate);
        setDateData(data);
    }, []);

    useEffect(() => {
        if (selectedDate) {
            const data = generateDataForDate(selectedDate);
            setDateData(data);
        }
    }, [selectedDate]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Package Columns
    const packageColumns = [
        {
            Header: 'Package ID',
            accessor: 'packageId',
            width: 120,
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Package Details',
            accessor: 'packageDetails',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.packageType}</div>
                    <div className="text-xs text-gray-500">
                        {row.original.weight} | {row.original.dimensions}
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.fromLocation} → {row.original.toLocation}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Revenue',
            accessor: 'packageValue',
            Cell: ({ value }) => (
                <div className="font-bold text-green-700">{formatCurrency(value)}</div>
            ),
        },
        {
            Header: 'Vehicle & Staff',
            accessor: 'vehicleStaff',
            Cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium">{row.original.vehicleType}</div>
                    <div className="text-xs text-gray-500">{row.original.driverName}</div>
                    <div className="text-xs text-gray-500 mt-1">{row.original.staffName}</div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value === 'Delivered' ? 'bg-green-100 text-green-800' : 
                    value === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {value}
                </span>
            ),
        },
        {
            Header: 'Delivery Time',
            accessor: 'deliveryTime',
            Cell: ({ value }) => (
                <span className="text-sm text-gray-600">{value}</span>
            ),
        },
    ];

    // Expense Columns
    const expenseColumns = [
        {
            Header: 'Expense ID',
            accessor: 'id',
            width: 80,
            Cell: ({ value }) => <span className="font-bold text-red-600">EXP-{value}</span>,
        },
        {
            Header: 'Expense Details',
            accessor: 'name',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-gray-500">{row.original.description}</div>
                    <div className="text-xs">
                        <span className={`px-1 rounded ${
                            row.original.category === 'vehicle' ? 'bg-blue-100 text-blue-800' :
                            row.original.category === 'staff' ? 'bg-green-100 text-green-800' :
                            row.original.category === 'overhead' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {row.original.category}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="text-gray-500">{row.original.type}</span>
                    </div>
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
                    <div className="text-xs text-gray-500 mt-1">
                        Paid: {formatCurrency(row.original.paidAmount)} | 
                        Due: {formatCurrency(row.original.balance)}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Category',
            accessor: 'category',
            Cell: ({ value, row }) => (
                <div className="text-sm">
                    <div className="font-medium capitalize">{value}</div>
                    <div className="text-xs text-gray-500 capitalize">{row.original.subCategory}</div>
                </div>
            ),
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => (
                <span className="text-sm text-gray-600">
                    {moment(value).format('DD/MM/YYYY')}
                </span>
            ),
        },
    ];

    const onDownloadExcel = () => {
        if (!dateData) return;

        const wb = XLSX.utils.book_new();

        // Packages Sheet
        const packageHeader = [
            ['DAILY PACKAGES REPORT'],
            [`Date: ${moment(dateData.date).format('DD/MM/YYYY')} - ${dateData.dayOfWeek}`],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['PACKAGE DETAILS'],
            [
                'Package ID',
                'Package Type',
                'Weight',
                'Dimensions',
                'From',
                'To',
                'Package Value (₹)',
                'Vehicle Type',
                'Driver',
                'Staff',
                'Status',
                'Delivery Time'
            ],
        ];

        const packageData = dateData.packages.map((pkg) => [
            pkg.packageId,
            pkg.packageType,
            pkg.weight,
            pkg.dimensions,
            pkg.fromLocation,
            pkg.toLocation,
            pkg.packageValue,
            pkg.vehicleType,
            pkg.driverName,
            pkg.staffName,
            pkg.status,
            pkg.deliveryTime,
        ]);

        const packageSummary = [
            [],
            ['PACKAGES SUMMARY'],
            ['Total Packages', dateData.totalPackages],
            ['Total Revenue', dateData.totalRevenue],
            ['Profitable Packages', dateData.profitablePackages],
            ['Loss Packages', dateData.lossPackages],
        ];

        const packageRows = [...packageHeader, ...packageData, ...packageSummary];
        const packageWs = XLSX.utils.aoa_to_sheet(packageRows);
        packageWs['!cols'] = [
            { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }
        ];

        // Expenses Sheet
        const expenseHeader = [
            ['DAILY EXPENSES REPORT'],
            [`Date: ${moment(dateData.date).format('DD/MM/YYYY')} - ${dateData.dayOfWeek}`],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['EXPENSE DETAILS'],
            [
                'Expense ID',
                'Name',
                'Description',
                'Category',
                'Sub-Category',
                'Type',
                'Amount (₹)',
                'Status',
                'Paid Amount (₹)',
                'Balance (₹)',
                'Date'
            ],
        ];

        const expenseData = dateData.expenses.map((exp) => [
            `EXP-${exp.id}`,
            exp.name,
            exp.description,
            exp.category,
            exp.subCategory,
            exp.type,
            exp.amount,
            exp.status.toUpperCase(),
            exp.paidAmount,
            exp.balance,
            moment(exp.date).format('DD/MM/YYYY'),
        ]);

        const expenseSummary = [
            [],
            ['EXPENSES SUMMARY'],
            ['Total Expenses', dateData.totalExpenses],
            ['Vehicle Expenses', dateData.totalVehicleExpense],
            ['Staff Expenses', dateData.totalStaffExpense],
            ['Fuel Expenses', dateData.totalFuelExpense],
            ['Maintenance Expenses', dateData.totalMaintenanceExpense],
            ['Salary Expenses', dateData.totalSalaryExpense],
            ['Other Expenses', dateData.totalOtherExpense],
        ];

        const expenseRows = [...expenseHeader, ...expenseData, ...expenseSummary];
        const expenseWs = XLSX.utils.aoa_to_sheet(expenseRows);
        expenseWs['!cols'] = [
            { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 10 },
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
        ];

        // Profit & Loss Summary Sheet
        const plHeader = [
            ['DAILY PROFIT & LOSS SUMMARY'],
            [`Date: ${moment(dateData.date).format('DD/MM/YYYY')} - ${dateData.dayOfWeek}`],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['FINANCIAL SUMMARY'],
        ];

        const plData = [
            ['Revenue', 'Amount (₹)', 'Percentage'],
            ['Total Revenue', dateData.totalRevenue, '100%'],
            [],
            ['Expenses Breakdown', '', ''],
            ['Vehicle Expenses', dateData.totalVehicleExpense, `${((dateData.totalVehicleExpense/dateData.totalExpenses)*100).toFixed(1)}%`],
            ['Staff Expenses', dateData.totalStaffExpense, `${((dateData.totalStaffExpense/dateData.totalExpenses)*100).toFixed(1)}%`],
            ['Fuel Expenses', dateData.totalFuelExpense, `${((dateData.totalFuelExpense/dateData.totalExpenses)*100).toFixed(1)}%`],
            ['Maintenance Expenses', dateData.totalMaintenanceExpense, `${((dateData.totalMaintenanceExpense/dateData.totalExpenses)*100).toFixed(1)}%`],
            ['Salary Expenses', dateData.totalSalaryExpense, `${((dateData.totalSalaryExpense/dateData.totalExpenses)*100).toFixed(1)}%`],
            ['Other Expenses', dateData.totalOtherExpense, `${((dateData.totalOtherExpense/dateData.totalExpenses)*100).toFixed(1)}%`],
            ['Total Expenses', dateData.totalExpenses, '100%'],
            [],
            ['Profit & Loss', '', ''],
            ['Net Profit/Loss', dateData.totalProfit, `${dateData.profitMargin}%`],
            ['Day Status', dateData.status.toUpperCase(), dateData.isProfitDay ? 'PROFIT DAY' : 'LOSS DAY'],
        ];

        const plRows = [...plHeader, ...plData];
        const plWs = XLSX.utils.aoa_to_sheet(plRows);
        plWs['!cols'] = [
            { wch: 25 }, { wch: 15 }, { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, packageWs, 'Packages');
        XLSX.utils.book_append_sheet(wb, expenseWs, 'Expenses');
        XLSX.utils.book_append_sheet(wb, plWs, 'P&L Summary');

        const fileName = `Daily-PL-Report-${moment(dateData.date).format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = async () => {
        if (!dateData) return;

        const pdfData = {
            dateData: dateData,
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            date: moment(dateData.date).format('DD/MM/YYYY'),
            dayOfWeek: dateData.dayOfWeek,
            viewMode: viewMode
        };

        navigate('/documents/audit-report-pdf', { state: pdfData });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'paid': { color: 'bg-green-100 text-green-800', icon: <IconCheckCircle className="w-3 h-3 mr-1" /> },
            'partially_paid': { color: 'bg-yellow-100 text-yellow-800', icon: <IconClock className="w-3 h-3 mr-1" /> },
            'unpaid': { color: 'bg-red-100 text-red-800', icon: <IconClock className="w-3 h-3 mr-1" /> }
        };
        
        const config = statusConfig[status] || statusConfig['unpaid'];
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.color}`}>
                {config.icon}
                {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    if (!dateData) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Daily Profit & Loss Report</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Separate package revenue and expense tracking</p>
            </div>

            {/* Date Selection and Export */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IconCalendar className="inline w-4 h-4 mr-1" />
                            Select Date
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDate}
                            onChange={handleDateChange}
                            max={moment().format('YYYY-MM-DD')}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedDate(moment().format('YYYY-MM-DD'))}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setSelectedDate(moment().subtract(1, 'day').format('YYYY-MM-DD'))}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                        >
                            Yesterday
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={onDownloadExcel}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                        >
                            <IconDownload className="mr-2 w-4 h-4" />
                            Export Excel
                        </button>
                        <button
                            onClick={onGeneratePDF}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                        >
                            <IconPrinter className="mr-2 w-4 h-4" />
                            Generate PDF
                        </button>
                    </div>
                </div>
                
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {moment(dateData.date).format('DD MMMM YYYY')} - {dateData.dayOfWeek}
                    </h3>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setViewMode('packages')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                viewMode === 'packages' 
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <IconPackage className="w-4 h-4 mr-2" />
                            Packages ({dateData.packages.length})
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
                            Expenses ({dateData.expenses.length})
                        </button>
                        <button
                            onClick={() => setViewMode('summary')}
                            className={`px-4 py-2 rounded-lg flex items-center ${
                                viewMode === 'summary' 
                                    ? 'bg-green-100 text-green-700 border border-green-300' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <IconMoney className="w-4 h-4 mr-2" />
                            P&L Summary
                        </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        Showing {viewMode === 'packages' ? 'Packages' : viewMode === 'expenses' ? 'Expenses' : 'Summary'} for {moment(dateData.date).format('DD MMM YYYY')}
                    </div>
                </div>
            </div>

            {/* Status Cards */}
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
                            {formatCurrency(dateData.totalRevenue)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {dateData.totalPackages} Packages
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
                            {formatCurrency(dateData.totalExpenses)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {dateData.expenses.length} Expense Items
                        </div>
                    </div>
                </div>

                {/* Profit/Loss Card */}
                <div className={`bg-white rounded-lg shadow-sm p-4 border ${dateData.isProfitDay ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Net Profit/Loss</h3>
                        <div className={`p-2 rounded-full ${dateData.isProfitDay ? 'bg-green-100' : 'bg-red-100'}`}>
                            {dateData.isProfitDay ? (
                                <IconTrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                                <IconTrendingDown className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold mb-2 ${dateData.isProfitDay ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(dateData.totalProfit)}
                        </div>
                        <div className={`text-sm ${dateData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dateData.profitMargin >= 0 ? '+' : ''}{dateData.profitMargin}% Margin
                        </div>
                    </div>
                </div>

                {/* Expense Status Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Expense Status</h3>
                        <div className="p-2 bg-purple-100 rounded-full">
                            <IconCheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700 mb-2">
                            {dateData.expenses.length} Items
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                            <div className="bg-green-50 p-1 rounded">
                                <div className="text-green-700 font-bold">
                                    {dateData.expenses.filter(e => e.status === 'paid').length}
                                </div>
                                <div className="text-xs text-gray-600">Paid</div>
                            </div>
                            <div className="bg-yellow-50 p-1 rounded">
                                <div className="text-yellow-700 font-bold">
                                    {dateData.expenses.filter(e => e.status === 'partially_paid').length}
                                </div>
                                <div className="text-xs text-gray-600">Partial</div>
                            </div>
                            <div className="bg-red-50 p-1 rounded">
                                <div className="text-red-700 font-bold">
                                    {dateData.expenses.filter(e => e.status === 'unpaid').length}
                                </div>
                                <div className="text-xs text-gray-600">Unpaid</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'packages' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Package Revenue Details
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {dateData.totalPackages} packages delivered on {moment(dateData.date).format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total Revenue: </span>
                                    <span className="font-semibold text-green-600">{formatCurrency(dateData.totalRevenue)}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Avg per Package: </span>
                                    <span className="font-semibold text-blue-600">
                                        {formatCurrency(dateData.totalRevenue / dateData.totalPackages)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <Table
                            columns={packageColumns}
                            data={dateData.packages}
                            Title=""
                            pageSize={10}
                            pageIndex={0}
                            totalCount={dateData.packages.length}
                            totalPages={Math.ceil(dateData.packages.length / 10)}
                            onPaginationChange={(page, size) => {}}
                            isSortable={true}
                            pagination={true}
                            isSearchable={false}
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
                                    {dateData.expenses.length} expense items on {moment(dateData.date).format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total Expenses: </span>
                                    <span className="font-semibold text-red-600">{formatCurrency(dateData.totalExpenses)}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Avg per Item: </span>
                                    <span className="font-semibold text-orange-600">
                                        {formatCurrency(dateData.totalExpenses / dateData.expenses.length)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <Table
                            columns={expenseColumns}
                            data={dateData.expenses}
                            Title=""
                            pageSize={10}
                            pageIndex={0}
                            totalCount={dateData.expenses.length}
                            totalPages={Math.ceil(dateData.expenses.length / 10)}
                            onPaginationChange={(page, size) => {}}
                            isSortable={true}
                            pagination={true}
                            isSearchable={false}
                            tableClass="min-w-full rounded-lg overflow-hidden"
                            theadClass="bg-gray-50"
                            responsive={true}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Expense Breakdown Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Breakdown</h3>
                        <div className="space-y-4">
                            {/* Vehicle Expenses */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">Vehicle Expenses</div>
                                        <div className="text-sm text-gray-600">Fuel, Maintenance, Toll, Parking</div>
                                    </div>
                                    <div className="text-red-700 font-bold">
                                        {formatCurrency(dateData.totalVehicleExpense)}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${(dateData.totalVehicleExpense / dateData.totalExpenses) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {((dateData.totalVehicleExpense / dateData.totalExpenses) * 100).toFixed(1)}% of total expenses
                                </div>
                            </div>

                            {/* Staff Expenses */}
                            <div className="border-l-4 border-green-500 pl-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">Staff Expenses</div>
                                        <div className="text-sm text-gray-600">Salaries, Overtime, Benefits</div>
                                    </div>
                                    <div className="text-red-700 font-bold">
                                        {formatCurrency(dateData.totalStaffExpense)}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full" 
                                        style={{ width: `${(dateData.totalStaffExpense / dateData.totalExpenses) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {((dateData.totalStaffExpense / dateData.totalExpenses) * 100).toFixed(1)}% of total expenses
                                </div>
                            </div>

                            {/* Other Expenses */}
                            <div className="border-l-4 border-purple-500 pl-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">Other Expenses</div>
                                        <div className="text-sm text-gray-600">Supplies, Miscellaneous</div>
                                    </div>
                                    <div className="text-red-700 font-bold">
                                        {formatCurrency(dateData.totalOtherExpense)}
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-purple-600 h-2 rounded-full" 
                                        style={{ width: `${(dateData.totalOtherExpense / dateData.totalExpenses) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {((dateData.totalOtherExpense / dateData.totalExpenses) * 100).toFixed(1)}% of total expenses
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profit & Loss Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Profit & Loss Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-700">Total Revenue</span>
                                <span className="text-green-700 font-bold">{formatCurrency(dateData.totalRevenue)}</span>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-600">Expenses:</div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">• Vehicle Expenses</span>
                                    <span className="text-red-600">-{formatCurrency(dateData.totalVehicleExpense)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">• Staff Expenses</span>
                                    <span className="text-red-600">-{formatCurrency(dateData.totalStaffExpense)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">• Other Expenses</span>
                                    <span className="text-red-600">-{formatCurrency(dateData.totalOtherExpense)}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-gray-700">Total Expenses</span>
                                <span className="text-red-700 font-bold">-{formatCurrency(dateData.totalExpenses)}</span>
                            </div>
                            
                            <div className={`flex justify-between items-center pt-3 border-t ${dateData.isProfitDay ? 'bg-green-50 p-3 rounded-lg' : 'bg-red-50 p-3 rounded-lg'}`}>
                                <span className={`font-bold ${dateData.isProfitDay ? 'text-green-800' : 'text-red-800'}`}>
                                    {dateData.isProfitDay ? 'Net Profit' : 'Net Loss'}
                                </span>
                                <span className={`text-2xl font-bold ${dateData.isProfitDay ? 'text-green-700' : 'text-red-700'}`}>
                                    {dateData.isProfitDay ? '+' : ''}{formatCurrency(dateData.totalProfit)}
                                </span>
                            </div>
                            
                            <div className={`text-center py-2 rounded-lg ${dateData.isProfitDay ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <div className="font-semibold">
                                    {dateData.isProfitDay ? 'Profit Day' : 'Loss Day'} • {dateData.profitMargin >= 0 ? '+' : ''}{dateData.profitMargin}% Margin
                                </div>
                                <div className="text-sm">
                                    {dateData.profitablePackages} packages made profit • {dateData.lossPackages} packages made loss
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Vehicle Expenses Detail */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Vehicle Expenses</h3>
                        <IconTruck className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl font-bold text-blue-700">
                            {formatCurrency(dateData.totalVehicleExpense)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {((dateData.totalVehicleExpense / dateData.totalExpenses) * 100).toFixed(1)}% of total expenses
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            <div className="bg-blue-50 p-2 rounded">
                                <div className="text-blue-700 font-bold">
                                    {formatCurrency(dateData.totalFuelExpense)}
                                </div>
                                <div className="text-gray-600">Fuel</div>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                                <div className="text-blue-700 font-bold">
                                    {formatCurrency(dateData.totalMaintenanceExpense)}
                                </div>
                                <div className="text-gray-600">Maintenance</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Expenses Detail */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Staff Expenses</h3>
                        <IconUsers className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(dateData.totalStaffExpense)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {((dateData.totalStaffExpense / dateData.totalExpenses) * 100).toFixed(1)}% of total expenses
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Salary: {formatCurrency(dateData.totalSalaryExpense)}
                        </div>
                    </div>
                </div>

                {/* Day Performance */}
                <div className={`bg-white rounded-lg shadow-sm p-4 border ${dateData.isProfitDay ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Day Performance</h3>
                        {dateData.isProfitDay ? (
                            <IconTrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                            <IconTrendingDown className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className={`text-2xl font-bold ${dateData.isProfitDay ? 'text-green-700' : 'text-red-700'}`}>
                            {dateData.isProfitDay ? 'Profit Day' : 'Loss Day'}
                        </div>
                        <div className="text-sm text-gray-600">
                            {dateData.profitablePackages} packages made profit
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                            Net margin: {dateData.profitMargin >= 0 ? '+' : ''}{dateData.profitMargin}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitLossReport;