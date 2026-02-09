import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import IconUsers from '../../components/Icon/IconUsers';
import IconTruck from '../../components/Icon/IconTruck';
import IconPackage from '../../components/Icon/IconPackage';
import IconReceipt from '../../components/Icon/IconReceipt';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconFilter from '../../components/Icon/IconSearch';
import IconSearch from '../../components/Icon/IconSearch';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconClock from '../../components/Icon/IconClock';
import IconArrowRight from '../../components/Icon/IconChevronRight';
import IconList from '../../components/Icon/IconListCheck';
import { useNavigate } from 'react-router-dom';

const ExpenseSettlement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Updated mock data with driver dual salary structure
    const [expensesData, setExpensesData] = useState({
        date: '07/02/2026',
        employees: [
            { 
                id: 1, 
                name: 'John Doe', 
                role: 'employee',
                salaryType: 'monthly',
                monthlySalary: 52000,
                totalAmount: 52000, // Monthly salary
                paidAmount: 25000,
                balance: 27000,
                status: 'Partially Paid',
                dayWiseUnpaid: [
                    { date: '01/02/2026', amount: 10000, description: 'February Salary - Adjustment', type: 'monthly' },
                    { date: '05/02/2026', amount: 8000, description: 'Overtime Payment', type: 'monthly' },
                    { date: '07/02/2026', amount: 9000, description: 'Today\'s Salary', type: 'monthly' }
                ]
            },
            { 
                id: 2, 
                name: 'Jane Smith', 
                role: 'employee',
                salaryType: 'monthly',
                monthlySalary: 45000,
                totalAmount: 45000,
                paidAmount: 45000,
                balance: 0,
                status: 'Fully Paid',
                dayWiseUnpaid: []
            }
        ],
        drivers: [
            { 
                id: 101, 
                name: 'Robert Wilson', 
                role: 'driver',
                salaryType: 'dual', // Dual salary: monthly + loadman
                monthlySalary: 40000,
                loadmanRate: 500, // per trip/day
                totalAmount: 42000, // Monthly + loadman earnings
                monthlyAmount: 40000,
                loadmanAmount: 2000, // 4 trips/days @ 500 each
                paidAmount: 20000,
                balance: 22000,
                status: 'Partially Paid',
                dayWiseUnpaid: [
                    { date: '02/02/2026', amount: 12000, description: 'Monthly Salary', type: 'monthly' },
                    { date: '03/02/2026', amount: 500, description: 'Trip - Chennai', type: 'loadman' },
                    { date: '04/02/2026', amount: 500, description: 'Trip - Bangalore', type: 'loadman' },
                    { date: '07/02/2026', amount: 10000, description: 'Today\'s Payment', type: 'monthly' }
                ]
            },
            { 
                id: 102, 
                name: 'David Brown', 
                role: 'driver',
                salaryType: 'monthly',
                monthlySalary: 42000,
                totalAmount: 42000,
                paidAmount: 42000,
                balance: 0,
                status: 'Fully Paid',
                dayWiseUnpaid: []
            },
            { 
                id: 103, 
                name: 'Thomas Lee', 
                role: 'driver',
                salaryType: 'dual',
                monthlySalary: 38000,
                loadmanRate: 600,
                totalAmount: 41000,
                monthlyAmount: 38000,
                loadmanAmount: 3000, // 5 trips/days @ 600 each
                paidAmount: 20000,
                balance: 21000,
                status: 'Partially Paid',
                dayWiseUnpaid: [
                    { date: '01/02/2026', amount: 10000, description: 'Monthly Salary', type: 'monthly' },
                    { date: '02/02/2026', amount: 600, description: 'Trip - Mumbai', type: 'loadman' },
                    { date: '03/02/2026', amount: 600, description: 'Trip - Delhi', type: 'loadman' },
                    { date: '04/02/2026', amount: 600, description: 'Trip - Kolkata', type: 'loadman' },
                    { date: '05/02/2026', amount: 600, description: 'Trip - Hyderabad', type: 'loadman' },
                    { date: '06/02/2026', amount: 600, description: 'Trip - Pune', type: 'loadman' },
                    { date: '07/02/2026', amount: 8000, description: 'Today\'s Salary', type: 'monthly' }
                ]
            }
        ],
        loadmen: [
            { 
                id: 201, 
                name: 'James Miller', 
                role: 'loadman',
                salaryType: 'daily',
                dailyRate: 1200,
                totalAmount: 37200, // 31 days @ 1200
                paidAmount: 37200,
                balance: 0,
                status: 'Fully Paid',
                dayWiseUnpaid: []
            },
            { 
                id: 202, 
                name: 'William Davis', 
                role: 'loadman',
                salaryType: 'daily',
                dailyRate: 1150,
                totalAmount: 35650, // 31 days @ 1150
                paidAmount: 17850,
                balance: 17800,
                status: 'Partially Paid',
                dayWiseUnpaid: [
                    { date: '04/02/2026', amount: 1150, description: 'Daily Work', type: 'daily' },
                    { date: '05/02/2026', amount: 1150, description: 'Daily Work', type: 'daily' },
                    { date: '06/02/2026', amount: 1150, description: 'Daily Work', type: 'daily' },
                    { date: '07/02/2026', amount: 14350, description: 'Pending Daily Work', type: 'daily' }
                ]
            }
        ],
        otherExpenses: [
            { 
                id: 301, 
                expenseType: 'Fuel', 
                description: 'Diesel for trucks',
                totalAmount: 5000,
                paidAmount: 5000,
                balance: 0,
                status: 'Fully Paid',
                dayWiseUnpaid: []
            },
            { 
                id: 302, 
                expenseType: 'Vehicle Maintenance', 
                description: 'Regular service',
                totalAmount: 8000,
                paidAmount: 4000,
                balance: 4000,
                status: 'Partially Paid',
                dayWiseUnpaid: [
                    { date: '06/02/2026', amount: 4000, description: 'Service Charges' }
                ]
            }
        ]
    });

    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        search: ''
    });

    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        dispatch(setPageTitle('Expense Settlement'));
    }, []);

    // Calculate totals
    const calculateCategoryTotal = (category) => {
        return expensesData[category].reduce((sum, item) => sum + item.totalAmount, 0);
    };

    const calculateCategoryPaid = (category) => {
        return expensesData[category].reduce((sum, item) => sum + item.paidAmount, 0);
    };

    const calculateCategoryBalance = (category) => {
        return expensesData[category].reduce((sum, item) => sum + item.balance, 0);
    };

    const calculateGrandTotal = () => {
        return calculateCategoryTotal('employees') + 
               calculateCategoryTotal('drivers') + 
               calculateCategoryTotal('loadmen') + 
               calculateCategoryTotal('otherExpenses');
    };

    const calculateGrandPaid = () => {
        return calculateCategoryPaid('employees') + 
               calculateCategoryPaid('drivers') + 
               calculateCategoryPaid('loadmen') + 
               calculateCategoryPaid('otherExpenses');
    };

    const calculateGrandBalance = () => {
        return calculateCategoryBalance('employees') + 
               calculateCategoryBalance('drivers') + 
               calculateCategoryBalance('loadmen') + 
               calculateCategoryBalance('otherExpenses');
    };

    // Filter data
    const getFilteredData = () => {
        let data = [];
        
        if (filters.category === 'all' || filters.category === 'employees') {
            data = [...data, ...expensesData.employees.map(item => ({ ...item, category: 'Employee' }))];
        }
        if (filters.category === 'all' || filters.category === 'drivers') {
            data = [...data, ...expensesData.drivers.map(item => ({ 
                ...item, 
                category: 'Driver',
                salaryBreakdown: item.salaryType === 'dual' ? `Monthly: ₹${item.monthlyAmount?.toLocaleString('en-IN')} + Loadman: ₹${item.loadmanAmount?.toLocaleString('en-IN')}` : 'Monthly Salary'
            }))];
        }
        if (filters.category === 'all' || filters.category === 'loadmen') {
            data = [...data, ...expensesData.loadmen.map(item => ({ 
                ...item, 
                category: 'Loadman',
                salaryBreakdown: `Daily Rate: ₹${item.dailyRate?.toLocaleString('en-IN')}/day`
            }))];
        }
        if (filters.category === 'all' || filters.category === 'other') {
            data = [...data, ...expensesData.otherExpenses.map(item => ({ 
                ...item, 
                category: 'Other Expense',
                name: item.expenseType
            }))];
        }

        // Filter by status
        if (filters.status !== 'all') {
            data = data.filter(item => {
                if (filters.status === 'unpaid') return item.balance === item.totalAmount;
                if (filters.status === 'partially_paid') return item.balance > 0 && item.balance < item.totalAmount;
                if (filters.status === 'fully_paid') return item.balance === 0;
                return true;
            });
        }

        // Filter by search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            data = data.filter(item => 
                item.name.toLowerCase().includes(searchLower) ||
                (item.expenseType && item.expenseType.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower)) ||
                item.category.toLowerCase().includes(searchLower)
            );
        }

        return data;
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewDetails = (person) => {
        navigate('/expenses/settlement/details', { 
            state: { 
                person,
                category: selectedCategory !== 'all' ? selectedCategory : person.category.toLowerCase().replace(' ', '')
            } 
        });
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setFilters(prev => ({ ...prev, category }));
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Unpaid': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <IconClock className="w-3 h-3 mr-1" /> },
            'Partially Paid': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: <IconClock className="w-3 h-3 mr-1" /> },
            'Fully Paid': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <IconCheckCircle className="w-3 h-3 mr-1" /> }
        };
        
        const config = statusConfig[status] || statusConfig['Unpaid'];
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.color}`}>
                {config.icon}
                {status}
            </span>
        );
    };

    const getCategoryIcon = (category) => {
        switch(category) {
            case 'Employee': return <IconUsers className="w-5 h-5 text-blue-600" />;
            case 'Driver': return <IconTruck className="w-5 h-5 text-green-600" />;
            case 'Loadman': return <IconPackage className="w-5 h-5 text-purple-600" />;
            case 'Other Expense': return <IconReceipt className="w-5 h-5 text-yellow-600" />;
            default: return <IconUsers className="w-5 h-5 text-gray-600" />;
        }
    };

    // Render category tabs
    const renderCategoryTabs = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleCategoryClick('all')}
                    className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    <IconList className="w-4 h-4 mr-2" />
                    All Categories
                </button>
                <button
                    onClick={() => handleCategoryClick('employees')}
                    className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === 'employees' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    <IconUsers className="w-4 h-4 mr-2" />
                    Employees
                </button>
                <button
                    onClick={() => handleCategoryClick('drivers')}
                    className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === 'drivers' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    <IconTruck className="w-4 h-4 mr-2" />
                    Drivers
                </button>
                <button
                    onClick={() => handleCategoryClick('loadmen')}
                    className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === 'loadmen' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    <IconPackage className="w-4 h-4 mr-2" />
                    Loadmen
                </button>
                <button
                    onClick={() => handleCategoryClick('other')}
                    className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === 'other' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                    <IconReceipt className="w-4 h-4 mr-2" />
                    Other Expenses
                </button>
            </div>
        </div>
    );

    // Render summary cards
    const renderSummaryCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Employee Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                        <IconUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Employees</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculateCategoryTotal('employees').toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">
                        <div>Paid</div>
                        <div className="font-semibold">₹{calculateCategoryPaid('employees').toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-red-600 text-right">
                        <div>Pending</div>
                        <div className="font-semibold">₹{calculateCategoryBalance('employees').toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>

            {/* Driver Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <IconTruck className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Drivers</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculateCategoryTotal('drivers').toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">
                        <div>Paid</div>
                        <div className="font-semibold">₹{calculateCategoryPaid('drivers').toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-red-600 text-right">
                        <div>Pending</div>
                        <div className="font-semibold">₹{calculateCategoryBalance('drivers').toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>

            {/* Loadman Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                        <IconPackage className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Loadmen</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculateCategoryTotal('loadmen').toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">
                        <div>Paid</div>
                        <div className="font-semibold">₹{calculateCategoryPaid('loadmen').toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-red-600 text-right">
                        <div>Pending</div>
                        <div className="font-semibold">₹{calculateCategoryBalance('loadmen').toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>

            {/* Other Expenses Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                        <IconReceipt className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Other Expenses</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculateCategoryTotal('otherExpenses').toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">
                        <div>Paid</div>
                        <div className="font-semibold">₹{calculateCategoryPaid('otherExpenses').toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-red-600 text-right">
                        <div>Pending</div>
                        <div className="font-semibold">₹{calculateCategoryBalance('otherExpenses').toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render grand total card
    const renderGrandTotalCard = () => (
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg p-5 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm opacity-90">Total Expenses</div>
                    <div className="text-3xl font-bold">₹{calculateGrandTotal().toLocaleString('en-IN')}</div>
                </div>
                <div className="text-right">
                    <div className="text-sm opacity-90">Settlement Summary</div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="opacity-90">Total Paid:</span>
                            <span className="font-semibold text-green-300">₹{calculateGrandPaid().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-90">Pending Balance:</span>
                            <span className="font-semibold text-yellow-300">₹{calculateGrandBalance().toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render filters
    const renderFilters = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                    <IconFilter className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Filters</h3>
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 flex-1 md:ml-4">
                    {/* Status Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
                        <select 
                            className="form-select w-full"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="unpaid">Unpaid Only</option>
                            <option value="partially_paid">Partially Paid</option>
                            <option value="fully_paid">Fully Paid</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="form-input pl-10 w-full"
                                placeholder="Search by name or description..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render expenses table
    const renderExpensesTable = () => {
        const filteredData = getFilteredData();
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Expense Settlement List</h3>
                        <div className="text-sm text-gray-500">
                            Showing {filteredData.length} records
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name / Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Salary Details
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Paid Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Pending
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Unpaid Days
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredData.map((item) => (
                                <tr key={`${item.category}-${item.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
                                                {getCategoryIcon(item.category)}
                                            </div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {item.name || item.expenseType}
                                            </div>
                                            {item.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            ₹{item.totalAmount.toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {item.category === 'Driver' && item.salaryType === 'dual' ? (
                                                <div>
                                                    <div>Monthly: ₹{item.monthlyAmount?.toLocaleString('en-IN')}</div>
                                                    <div>Loadman: ₹{item.loadmanAmount?.toLocaleString('en-IN')}</div>
                                                </div>
                                            ) : item.category === 'Loadman' ? (
                                                <div>Daily: ₹{item.dailyRate?.toLocaleString('en-IN')}/day</div>
                                            ) : item.category === 'Employee' ? (
                                                <div>Monthly: ₹{item.monthlySalary?.toLocaleString('en-IN')}</div>
                                            ) : (
                                                <div>One-time expense</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-green-600 font-semibold">
                                            ₹{item.paidAmount.toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`font-bold ${item.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ₹{item.balance.toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            <div className="text-gray-900 dark:text-white">
                                                {item.dayWiseUnpaid.length} day{item.dayWiseUnpaid.length !== 1 ? 's' : ''}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Total: ₹{item.dayWiseUnpaid.reduce((sum, day) => sum + day.amount, 0).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${item.balance > 0 ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => handleViewDetails(item)}
                                            disabled={item.balance === 0}
                                        >
                                            {item.balance > 0 ? 'View Details' : 'View'}
                                            <IconArrowRight className="w-3 h-3 ml-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredData.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">No expenses found</div>
                            <div className="text-sm text-gray-500">Try adjusting your filters</div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Settlement</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage and process individual expense payments</p>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <IconCalendar className="w-5 h-5 text-primary mr-2" />
                    <div>
                        <div className="text-sm text-gray-500">Settlement Date</div>
                        <div className="font-semibold">{expensesData.date}</div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* Grand Total Card */}
            {renderGrandTotalCard()}

            {/* Category Tabs */}
            {renderCategoryTabs()}

            {/* Filters */}
            {renderFilters()}

            {/* Expenses Table */}
            {renderExpensesTable()}
        </div>
    );
};

export default ExpenseSettlement;