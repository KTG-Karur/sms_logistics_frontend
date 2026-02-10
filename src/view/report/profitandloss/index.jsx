import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
import Table from '../../../util/Table';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const ProfitLossReport = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Default to last 30 days
    const defaultFromDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const defaultToDate = moment().format('YYYY-MM-DD');

    // States
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
        totals: null
    });
    const [viewMode, setViewMode] = useState('summary'); // 'summary', 'packages', 'expenses', 'daily'
    const [loading, setLoading] = useState(false);

    // Initialize data
    useEffect(() => {
        dispatch(setPageTitle('Profit & Loss Report'));
        loadReportData();
    }, []);

    const generateDateRangeData = (fromDate, toDate) => {
        const dailyData = [];
        let allPackages = [];
        let allExpenses = [];
        
        // Generate data for each day in the range
        const currentDate = moment(fromDate);
        const endDate = moment(toDate);
        
        while (currentDate <= endDate) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            
            // Generate packages for this day
            const dailyPackages = generatePackagesData(dateStr);
            // Generate expenses for this day
            const dailyExpenses = generateExpensesData(dateStr);
            
            // Calculate daily totals
            const dailyRevenue = dailyPackages.reduce((sum, pkg) => sum + pkg.packageValue, 0);
            const dailyExpense = dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const dailyProfit = dailyRevenue - dailyExpense;
            const profitMargin = dailyRevenue > 0 ? ((dailyProfit / dailyRevenue) * 100).toFixed(2) : 0;
            
            dailyData.push({
                date: dateStr,
                dayOfWeek: currentDate.format('dddd'),
                packages: dailyPackages,
                expenses: dailyExpenses,
                dailyRevenue,
                dailyExpense,
                dailyProfit,
                profitMargin: parseFloat(profitMargin),
                isProfitDay: dailyProfit > 0,
                totalPackages: dailyPackages.length,
                totalExpenses: dailyExpenses.length,
                
                // Expense breakdown
                vehicleExpense: dailyExpenses.filter(e => e.category === 'vehicle').reduce((sum, e) => sum + e.amount, 0),
                staffExpense: dailyExpenses.filter(e => e.category === 'staff').reduce((sum, e) => sum + e.amount, 0),
                otherExpense: dailyExpenses.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0),
            });
            
            allPackages = [...allPackages, ...dailyPackages];
            allExpenses = [...allExpenses, ...dailyExpenses];
            
            currentDate.add(1, 'day');
        }
        
        // Calculate overall totals
        const totalRevenue = allPackages.reduce((sum, pkg) => sum + pkg.packageValue, 0);
        const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalProfit = totalRevenue - totalExpenses;
        const overallProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
        
        // Count profit/loss days
        const profitDays = dailyData.filter(day => day.isProfitDay).length;
        const lossDays = dailyData.filter(day => !day.isProfitDay).length;
        
        // Calculate averages
        const totalDays = dailyData.length;
        const avgDailyRevenue = totalRevenue / totalDays;
        const avgDailyExpense = totalExpenses / totalDays;
        const avgDailyProfit = totalProfit / totalDays;
        
        // Expense breakdown percentages
        const totalVehicleExpense = allExpenses.filter(e => e.category === 'vehicle').reduce((sum, e) => sum + e.amount, 0);
        const totalStaffExpense = allExpenses.filter(e => e.category === 'staff').reduce((sum, e) => sum + e.amount, 0);
        const totalOtherExpense = allExpenses.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0);
        
        return {
            summary: {
                dateRange: { from: fromDate, to: toDate },
                totalDays,
                profitDays,
                lossDays,
                profitPercentage: ((profitDays / totalDays) * 100).toFixed(1),
                
                // Financial totals
                totalRevenue,
                totalExpenses,
                totalProfit,
                overallProfitMargin: parseFloat(overallProfitMargin),
                isOverallProfit: totalProfit > 0,
                
                // Averages
                avgDailyRevenue,
                avgDailyExpense,
                avgDailyProfit,
                
                // Counts
                totalPackages: allPackages.length,
                totalExpenseItems: allExpenses.length,
                
                // Expense breakdown
                totalVehicleExpense,
                totalStaffExpense,
                totalOtherExpense,
                vehicleExpensePercentage: totalExpenses > 0 ? ((totalVehicleExpense / totalExpenses) * 100).toFixed(1) : 0,
                staffExpensePercentage: totalExpenses > 0 ? ((totalStaffExpense / totalExpenses) * 100).toFixed(1) : 0,
                otherExpensePercentage: totalExpenses > 0 ? ((totalOtherExpense / totalExpenses) * 100).toFixed(1) : 0,
                
                // Payment status
                paidExpenses: allExpenses.filter(e => e.status === 'paid').length,
                unpaidExpenses: allExpenses.filter(e => e.status === 'unpaid').length,
                partialExpenses: allExpenses.filter(e => e.status === 'partially_paid').length,
                
                // Package stats
                profitablePackages: allPackages.filter(p => p.packageProfit > 0).length,
                lossPackages: allPackages.filter(p => p.packageProfit <= 0).length,
            },
            dailyData,
            allPackages,
            allExpenses,
            totals: {
                totalRevenue,
                totalExpenses,
                totalProfit,
                totalVehicleExpense,
                totalStaffExpense,
                totalOtherExpense
            }
        };
    };

    const generatePackagesData = (date) => {
        const packages = [];
        const packageTypes = ['Small Package', 'Medium Package', 'Large Package', 'XL Package', 'Document'];
        const vehicleTypes = ['Tata Ace', 'Eicher Truck', 'Ashok Leyland', 'Mahindra Bolero', 'Tata 407'];
        const staffMembers = ['Rajesh Kumar', 'Vikram Singh', 'Sanjay Verma', 'Arun Mehta', 'Mohan Reddy'];
        
        const packageCount = Math.floor(Math.random() * 15) + 10;
        
        for (let i = 1; i <= packageCount; i++) {
            const packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
            const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
            const staffMember = staffMembers[Math.floor(Math.random() * staffMembers.length)];
            
            let packageValue = 0;
            switch(packageType) {
                case 'Small Package': packageValue = Math.floor(Math.random() * 500) + 200; break;
                case 'Medium Package': packageValue = Math.floor(Math.random() * 1000) + 500; break;
                case 'Large Package': packageValue = Math.floor(Math.random() * 2000) + 1000; break;
                case 'XL Package': packageValue = Math.floor(Math.random() * 5000) + 2000; break;
                case 'Document': packageValue = Math.floor(Math.random() * 200) + 50; break;
            }
            
            // Simulate package cost (for profit calculation)
            const packageCost = packageValue * (0.3 + Math.random() * 0.4); // 30-70% of value
            const packageProfit = packageValue - packageCost;
            
            packages.push({
                id: `${date.replace(/-/g, '')}-${i}`,
                packageId: `PKG-${moment(date).format('DDMM')}-${i.toString().padStart(3, '0')}`,
                date,
                packageType,
                weight: `${Math.floor(Math.random() * 50) + 5} kg`,
                dimensions: `${Math.floor(Math.random() * 50) + 20}x${Math.floor(Math.random() * 50) + 20}x${Math.floor(Math.random() * 50) + 20} cm`,
                fromLocation: ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 5)],
                toLocation: ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][Math.floor(Math.random() * 5)],
                packageValue,
                packageCost,
                packageProfit,
                vehicleType,
                staffMember,
                status: ['Delivered', 'In Transit', 'Pending'][Math.floor(Math.random() * 3)],
                deliveryTime: moment(date).add(Math.floor(Math.random() * 8), 'hours').format('HH:mm'),
                isProfitable: packageProfit > 0,
            });
        }
        
        return packages;
    };

    const generateExpensesData = (date) => {
        const expenses = [];
        
        // Expense categories
        const categories = [
            { category: 'vehicle', subCategories: ['fuel', 'maintenance', 'toll', 'parking', 'insurance'] },
            { category: 'staff', subCategories: ['salary', 'overtime', 'benefits', 'bonus'] },
            { category: 'overhead', subCategories: ['rent', 'utilities', 'internet', 'office_supplies'] },
            { category: 'other', subCategories: ['miscellaneous', 'repairs', 'training'] }
        ];
        
        // Generate 8-15 expenses per day
        const expenseCount = Math.floor(Math.random() * 8) + 8;
        
        for (let i = 1; i <= expenseCount; i++) {
            const categoryObj = categories[Math.floor(Math.random() * categories.length)];
            const subCategory = categoryObj.subCategories[Math.floor(Math.random() * categoryObj.subCategories.length)];
            
            // Generate amount based on category
            let amount = 0;
            if (categoryObj.category === 'vehicle') {
                amount = Math.floor(Math.random() * 3000) + 500;
            } else if (categoryObj.category === 'staff') {
                amount = Math.floor(Math.random() * 2000) + 300;
            } else if (categoryObj.category === 'overhead') {
                amount = Math.floor(Math.random() * 1000) + 100;
            } else {
                amount = Math.floor(Math.random() * 500) + 50;
            }
            
            // Payment status
            const statusOptions = ['paid', 'unpaid', 'partially_paid'];
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            const paidAmount = status === 'paid' ? amount : (status === 'partially_paid' ? amount * 0.5 : 0);
            const balance = amount - paidAmount;
            
            // Generate meaningful description
            const descriptions = {
                fuel: `Fuel purchase for vehicles - ${date}`,
                maintenance: `Vehicle maintenance and service`,
                toll: `Highway toll charges`,
                parking: `Daily parking fees`,
                insurance: `Vehicle insurance premium`,
                salary: `Staff salary payment`,
                overtime: `Overtime compensation`,
                benefits: `Employee benefits`,
                bonus: `Performance bonus`,
                rent: `Office rent for the month`,
                utilities: `Electricity and water bills`,
                internet: `Internet service charges`,
                office_supplies: `Office stationery and supplies`,
                miscellaneous: `Miscellaneous expenses`,
                repairs: `Office equipment repairs`,
                training: `Staff training program`
            };
            
            expenses.push({
                id: `${date.replace(/-/g, '')}-${i}`,
                expenseId: `EXP-${moment(date).format('DDMM')}-${i.toString().padStart(3, '0')}`,
                date,
                name: `${categoryObj.category.toUpperCase()} - ${subCategory.replace('_', ' ')}`,
                category: categoryObj.category,
                subCategory,
                description: descriptions[subCategory] || `${subCategory} expense`,
                amount,
                type: Math.random() > 0.7 ? 'monthly' : (Math.random() > 0.5 ? 'weekly' : 'daily'),
                status,
                paidAmount,
                balance,
                vendor: ['Indian Oil', 'Bharat Petroleum', 'Local Garage', 'Staff Account'][Math.floor(Math.random() * 4)],
                paymentMethod: ['Cash', 'Bank Transfer', 'UPI', 'Cheque'][Math.floor(Math.random() * 4)],
            });
        }
        
        return expenses;
    };

    const loadReportData = () => {
        setLoading(true);
        setTimeout(() => {
            const data = generateDateRangeData(dateRange.from, dateRange.to);
            setReportData(data);
            // Initially show all data
            setReportData(prev => ({
                ...prev,
                filteredPackages: data.allPackages,
                filteredExpenses: data.allExpenses
            }));
            setLoading(false);
        }, 1000);
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = () => {
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
        
        // Reload data with new range
        setTimeout(() => {
            const data = generateDateRangeData(fromDate, toDate);
            setReportData({
                ...data,
                filteredPackages: data.allPackages,
                filteredExpenses: data.allExpenses
            });
        }, 500);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
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
            Header: 'Value',
            accessor: 'packageValue',
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-bold text-green-700">{formatCurrency(value)}</div>
                    <div className="text-xs text-gray-500">
                        Profit: <span className={row.original.packageProfit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(row.original.packageProfit)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Vehicle & Staff',
            accessor: 'vehicleStaff',
            Cell: ({ row }) => (
                <div className="text-sm">
                    <div className="font-medium">{row.original.vehicleType}</div>
                    <div className="text-xs text-gray-500">{row.original.staffMember}</div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value, row }) => (
                <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        value === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                        {value}
                    </span>
                    <div className={`text-xs mt-1 px-2 py-0.5 rounded-full ${row.original.isProfitable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {row.original.isProfitable ? 'Profitable' : 'Loss'}
                    </div>
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
                    <div className="text-xs text-gray-500">Vendor: {row.original.vendor}</div>
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-bold text-red-700">{formatCurrency(value)}</div>
                    <div className="text-xs text-gray-500">
                        {row.original.type} • {row.original.paymentMethod}
                    </div>
                </div>
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
                    <div className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                        value === 'vehicle' ? 'bg-blue-100 text-blue-800' :
                        value === 'staff' ? 'bg-green-100 text-green-800' :
                        value === 'overhead' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {value}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 capitalize">{row.original.subCategory}</div>
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
            Header: 'Packages',
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
            Cell: ({ value, row }) => (
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
            ['Total Packages', reportData.summary.totalPackages],
            ['Total Expense Items', reportData.summary.totalExpenseItems],
            ['Profitable Packages', reportData.summary.profitablePackages],
            ['Loss Packages', reportData.summary.lossPackages],
            ['Paid Expenses', reportData.summary.paidExpenses],
            ['Unpaid Expenses', reportData.summary.unpaidExpenses],
            ['Partially Paid Expenses', reportData.summary.partialExpenses],
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summaryHeader);
        summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];

        // Daily Data Sheet
        const dailyHeader = [
            ['DAILY PROFIT & LOSS DETAILS'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [],
            ['Date', 'Day', 'Packages', 'Revenue', 'Expenses', 'Profit/Loss', 'Margin %', 'Status', 'Vehicle Expense', 'Staff Expense', 'Other Expense']
        ];

        const dailyData = reportData.dailyData.map(day => [
            moment(day.date).format('DD/MM/YYYY'),
            day.dayOfWeek,
            day.totalPackages,
            day.dailyRevenue,
            day.dailyExpense,
            day.dailyProfit,
            `${day.profitMargin}%`,
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
            ['PACKAGES DETAIL'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [],
            ['Date', 'Package ID', 'Package Type', 'Weight', 'Dimensions', 'From', 'To', 'Package Value', 'Cost', 'Profit', 'Vehicle', 'Staff', 'Status', 'Delivery Time', 'Profit Status']
        ];

        const packageRows = reportData.filteredPackages.map(pkg => [
            moment(pkg.date).format('DD/MM/YYYY'),
            pkg.packageId,
            pkg.packageType,
            pkg.weight,
            pkg.dimensions,
            pkg.fromLocation,
            pkg.toLocation,
            pkg.packageValue,
            pkg.packageCost,
            pkg.packageProfit,
            pkg.vehicleType,
            pkg.staffMember,
            pkg.status,
            pkg.deliveryTime,
            pkg.isProfitable ? 'Profitable' : 'Loss'
        ]);

        const packageData = [...packageHeader, ...packageRows];
        const packageWs = XLSX.utils.aoa_to_sheet(packageData);
        packageWs['!cols'] = [
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
            { wch: 12 }, { wch: 10 }, { wch: 12 }
        ];

        // Expenses Sheet
        const expenseHeader = [
            ['EXPENSES DETAIL'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [],
            ['Date', 'Expense ID', 'Name', 'Description', 'Category', 'Sub-Category', 'Type', 'Amount', 'Status', 'Paid Amount', 'Balance', 'Vendor', 'Payment Method']
        ];

        const expenseRows = reportData.filteredExpenses.map(exp => [
            moment(exp.date).format('DD/MM/YYYY'),
            exp.expenseId,
            exp.name,
            exp.description,
            exp.category,
            exp.subCategory,
            exp.type,
            exp.amount,
            exp.status,
            exp.paidAmount,
            exp.balance,
            exp.vendor,
            exp.paymentMethod
        ]);

        const expenseData = [...expenseHeader, ...expenseRows];
        const expenseWs = XLSX.utils.aoa_to_sheet(expenseData);
        expenseWs['!cols'] = [
            { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 15 },
            { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Details');
        XLSX.utils.book_append_sheet(wb, packageWs, 'Packages');
        XLSX.utils.book_append_sheet(wb, expenseWs, 'Expenses');

        const fileName = `PL-Report-${moment(dateRange.from).format('DD-MM-YY')}-to-${moment(dateRange.to).format('DD-MM-YY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = async () => {
        if (!reportData.summary) return;

        const pdfData = {
            reportData: reportData,
            dateRange: dateRange,
            selectedFilters: selectedFilters,
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            viewMode: viewMode
        };

        navigate('/documents/pl-report-pdf', { state: pdfData });
    };

    if (loading || !reportData.summary) {
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

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Profit & Loss Report</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Comprehensive financial analysis with date range filtering</p>
            </div>

            {/* Date Range Selection */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-1">Select Date Range</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    
                    <div className="flex items-end">
                        <button
                            onClick={loadReportData}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className="text-center pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {moment(dateRange.from).format('DD MMM YYYY')} - {moment(dateRange.to).format('DD MMM YYYY')}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {reportData.summary.totalDays} days • {reportData.summary.profitDays} profit days • {reportData.summary.lossDays} loss days
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <IconFilter className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium flex items-center"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                        >
                            Reset All
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Package Filters */}
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-700 text-sm">Package Filters</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Package Type</label>
                            <select
                                name="packageType"
                                value={selectedFilters.packageType}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Package Types</option>
                                <option value="Small Package">Small Package</option>
                                <option value="Medium Package">Medium Package</option>
                                <option value="Large Package">Large Package</option>
                                <option value="XL Package">XL Package</option>
                                <option value="Document">Document</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Profit Status</label>
                            <select
                                name="profitStatus"
                                value={selectedFilters.profitStatus}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Packages</option>
                                <option value="profit">Profitable Only</option>
                                <option value="loss">Loss Making Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Expense Filters */}
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-700 text-sm">Expense Filters</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                            <select
                                name="expenseCategory"
                                value={selectedFilters.expenseCategory}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="staff">Staff</option>
                                <option value="overhead">Overhead</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                            <select
                                name="paymentStatus"
                                value={selectedFilters.paymentStatus}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="paid">Paid Only</option>
                                <option value="unpaid">Unpaid Only</option>
                                <option value="partially_paid">Partially Paid</option>
                            </select>
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-700 text-sm">Additional Filters</h4>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Type</label>
                            <select
                                name="vehicleType"
                                value={selectedFilters.vehicleType}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Vehicles</option>
                                <option value="Tata Ace">Tata Ace</option>
                                <option value="Eicher Truck">Eicher Truck</option>
                                <option value="Ashok Leyland">Ashok Leyland</option>
                                <option value="Mahindra Bolero">Mahindra Bolero</option>
                                <option value="Tata 407">Tata 407</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Staff Member</label>
                            <select
                                name="staffMember"
                                value={selectedFilters.staffMember}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Staff</option>
                                <option value="Rajesh Kumar">Rajesh Kumar</option>
                                <option value="Vikram Singh">Vikram Singh</option>
                                <option value="Sanjay Verma">Sanjay Verma</option>
                                <option value="Arun Mehta">Arun Mehta</option>
                                <option value="Mohan Reddy">Mohan Reddy</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={onDownloadExcel}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                        >
                            <IconDownload className="mr-2 w-4 h-4" />
                            Export Excel Report
                        </button>
                        <button
                            onClick={onGeneratePDF}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                        >
                            <IconPrinter className="mr-2 w-4 h-4" />
                            Generate PDF
                        </button>
                    </div>
                    
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
                            <IconPackage className="w-4 h-4 mr-2" />
                            Packages ({reportData.filteredPackages.length})
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
                        {viewMode === 'packages' && 'Package Revenue Details'}
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
                            {formatNumber(reportData.summary.totalPackages)} packages
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

                            {/* Package Performance */}
                            <div className="pt-4 border-t">
                                <h4 className="font-medium text-gray-700 mb-3">Package Performance</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="text-green-700 font-bold text-xl">
                                            {reportData.summary.profitablePackages}
                                        </div>
                                        <div className="text-sm text-gray-600">Profitable Packages</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <div className="text-red-700 font-bold text-xl">
                                            {reportData.summary.lossPackages}
                                        </div>
                                        <div className="text-sm text-gray-600">Loss Packages</div>
                                    </div>
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
                                    Package Revenue Details
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {reportData.filteredPackages.length} packages showing ({reportData.summary.profitablePackages} profitable, {reportData.summary.lossPackages} loss)
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
                                    <span className="text-gray-600">Avg per Package: </span>
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
                            Largest expense category
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
                            Includes salaries, overtime, and benefits
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
                            <li>• Total Packages: {formatNumber(reportData.summary.totalPackages)}</li>
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