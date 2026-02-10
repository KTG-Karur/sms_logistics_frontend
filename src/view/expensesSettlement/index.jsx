import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import IconReceipt from '../../components/Icon/IconReceipt';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconFilter from '../../components/Icon/IconSearch';
import IconSearch from '../../components/Icon/IconSearch';
import IconCheckCircle from '../../components/Icon/IconCheckCircle';
import IconClock from '../../components/Icon/IconClock';
import IconArrowRight from '../../components/Icon/IconChevronRight';
import IconList from '../../components/Icon/IconListCheck';
import { useNavigate } from 'react-router-dom';

const ExpenseSettlement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Updated mock data with only Other Expenses
    const [expensesData, setExpensesData] = useState({
        date: '07/02/2026',
        otherExpenses: [
            { 
                id: 301, 
                expenseType: 'Fuel', 
                description: 'Diesel for trucks - TATA 407 (TN 10 AB 1234)',
                totalAmount: 50000,
                paidAmount: 35000,
                balance: 15000,
                status: 'Partially Paid',
                category: 'vehicle',
                subCategory: 'fuel',
                vendor: 'Indian Oil',
                paymentMethod: 'Cash',
                invoiceNumber: 'INV-001-2026',
                dayWiseUnpaid: [
                    { date: '05/02/2026', amount: 10000, description: 'Fuel Purchase - 100 liters' },
                    { date: '07/02/2026', amount: 5000, description: 'Fuel Purchase - 50 liters' }
                ],
                vehicleDetails: 'TATA 407 - TN 10 AB 1234'
            },
            { 
                id: 302, 
                expenseType: 'Vehicle Maintenance', 
                description: 'Regular service and repairs - Ashok Leyland',
                totalAmount: 25000,
                paidAmount: 25000,
                balance: 0,
                status: 'Fully Paid',
                category: 'vehicle',
                subCategory: 'maintenance',
                vendor: 'Auto Service Center',
                paymentMethod: 'Bank Transfer',
                invoiceNumber: 'INV-002-2026',
                dayWiseUnpaid: [],
                vehicleDetails: 'Ashok Leyland - TN 09 CD 5678'
            },
            { 
                id: 303, 
                expenseType: 'Toll Charges', 
                description: 'Highway toll payments for Chennai-Bangalore route',
                totalAmount: 18000,
                paidAmount: 12000,
                balance: 6000,
                status: 'Partially Paid',
                category: 'vehicle',
                subCategory: 'toll',
                vendor: 'NHAI',
                paymentMethod: 'FastTag',
                invoiceNumber: 'TOLL-001-2026',
                dayWiseUnpaid: [
                    { date: '06/02/2026', amount: 4000, description: 'Chennai Toll Plaza' },
                    { date: '07/02/2026', amount: 2000, description: 'Krishnagiri Toll' }
                ],
                vehicleDetails: 'Multiple Vehicles'
            },
            { 
                id: 304, 
                expenseType: 'Office Rent', 
                description: 'Monthly office rent for warehouse',
                totalAmount: 35000,
                paidAmount: 35000,
                balance: 0,
                status: 'Fully Paid',
                category: 'overhead',
                subCategory: 'rent',
                vendor: 'Property Owner',
                paymentMethod: 'Cheque',
                invoiceNumber: 'RENT-2026-02',
                dayWiseUnpaid: [],
                location: 'Chennai Warehouse'
            },
            { 
                id: 305, 
                expenseType: 'Office Supplies', 
                description: 'Purchase of office stationery and supplies',
                totalAmount: 8500,
                paidAmount: 5000,
                balance: 3500,
                status: 'Partially Paid',
                category: 'overhead',
                subCategory: 'supplies',
                vendor: 'Stationery Mart',
                paymentMethod: 'UPI',
                invoiceNumber: 'INV-003-2026',
                dayWiseUnpaid: [
                    { date: '07/02/2026', amount: 3500, description: 'Pending payment for printer cartridges' }
                ]
            },
            { 
                id: 306, 
                expenseType: 'Insurance Premium', 
                description: 'Vehicle insurance premium for fleet',
                totalAmount: 120000,
                paidAmount: 40000,
                balance: 80000,
                status: 'Partially Paid',
                category: 'vehicle',
                subCategory: 'insurance',
                vendor: 'New India Assurance',
                paymentMethod: 'Bank Transfer',
                invoiceNumber: 'INS-2026-02',
                dayWiseUnpaid: [
                    { date: '01/02/2026', amount: 40000, description: 'First installment' },
                    { date: '15/02/2026', amount: 40000, description: 'Second installment (upcoming)' }
                ],
                policyNumber: 'POL-12345-2026'
            },
            { 
                id: 307, 
                expenseType: 'Internet Bill', 
                description: 'Monthly internet service charges',
                totalAmount: 1800,
                paidAmount: 1800,
                balance: 0,
                status: 'Fully Paid',
                category: 'overhead',
                subCategory: 'utilities',
                vendor: 'Airtel',
                paymentMethod: 'Auto-debit',
                invoiceNumber: 'BILL-2026-02',
                dayWiseUnpaid: []
            },
            { 
                id: 308, 
                expenseType: 'Parking Fees', 
                description: 'Monthly parking charges at warehouse',
                totalAmount: 5000,
                paidAmount: 5000,
                balance: 0,
                status: 'Fully Paid',
                category: 'vehicle',
                subCategory: 'parking',
                vendor: 'Warehouse Management',
                paymentMethod: 'Cash',
                invoiceNumber: 'PARK-2026-02',
                dayWiseUnpaid: [],
                location: 'Main Warehouse Parking'
            },
            { 
                id: 309, 
                expenseType: 'Repairs', 
                description: 'Emergency repairs for loading equipment',
                totalAmount: 15000,
                paidAmount: 0,
                balance: 15000,
                status: 'Unpaid',
                category: 'other',
                subCategory: 'repairs',
                vendor: 'Equipment Services',
                paymentMethod: 'Pending',
                invoiceNumber: 'REP-001-2026',
                dayWiseUnpaid: [
                    { date: '06/02/2026', amount: 15000, description: 'Hydraulic jack repair' }
                ],
                equipment: 'Hydraulic Loading Jack'
            },
            { 
                id: 310, 
                expenseType: 'Training Program', 
                description: 'Driver safety training program',
                totalAmount: 25000,
                paidAmount: 15000,
                balance: 10000,
                status: 'Partially Paid',
                category: 'other',
                subCategory: 'training',
                vendor: 'Safety First Institute',
                paymentMethod: 'Bank Transfer',
                invoiceNumber: 'TRN-001-2026',
                dayWiseUnpaid: [
                    { date: '07/02/2026', amount: 10000, description: 'Balance payment' }
                ],
                participants: '5 drivers'
            }
        ]
    });

    const [filters, setFilters] = useState({
        category: 'all',
        subCategory: 'all',
        status: 'all',
        search: ''
    });

    const [selectedCategory, setSelectedCategory] = useState('all');

    // Categories for filtering
    const expenseCategories = [
        { value: 'vehicle', label: 'Vehicle Expenses' },
        { value: 'overhead', label: 'Overhead Expenses' },
        { value: 'other', label: 'Other Expenses' }
    ];

    const subCategories = {
        vehicle: ['fuel', 'maintenance', 'toll', 'parking', 'insurance'],
        overhead: ['rent', 'utilities', 'supplies', 'internet'],
        other: ['repairs', 'training', 'miscellaneous', 'legal']
    };

    useEffect(() => {
        dispatch(setPageTitle('Expense Settlement'));
    }, []);

    // Calculate totals
    const calculateTotalAmount = () => {
        return expensesData.otherExpenses.reduce((sum, item) => sum + item.totalAmount, 0);
    };

    const calculatePaidAmount = () => {
        return expensesData.otherExpenses.reduce((sum, item) => sum + item.paidAmount, 0);
    };

    const calculateBalanceAmount = () => {
        return expensesData.otherExpenses.reduce((sum, item) => sum + item.balance, 0);
    };

    const calculateCategoryTotal = (category) => {
        return expensesData.otherExpenses
            .filter(item => filters.category === 'all' || item.category === category)
            .reduce((sum, item) => sum + item.totalAmount, 0);
    };

    // Filter data
    const getFilteredData = () => {
        let data = [...expensesData.otherExpenses];

        // Filter by category
        if (filters.category !== 'all') {
            data = data.filter(item => item.category === filters.category);
        }

        // Filter by sub-category
        if (filters.subCategory !== 'all') {
            data = data.filter(item => item.subCategory === filters.subCategory);
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
                item.expenseType.toLowerCase().includes(searchLower) ||
                item.description.toLowerCase().includes(searchLower) ||
                (item.vendor && item.vendor.toLowerCase().includes(searchLower)) ||
                (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchLower))
            );
        }

        return data;
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleViewDetails = (expense) => {
        navigate('/expenses/settlement/details', { 
            state: { 
                expense,
                category: 'other'
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
            case 'vehicle': return <IconReceipt className="w-5 h-5 text-blue-600" />;
            case 'overhead': return <IconReceipt className="w-5 h-5 text-purple-600" />;
            case 'other': return <IconReceipt className="w-5 h-5 text-yellow-600" />;
            default: return <IconReceipt className="w-5 h-5 text-gray-600" />;
        }
    };

    const getCategoryColor = (category) => {
        switch(category) {
            case 'vehicle': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'overhead': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'other': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
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
                {expenseCategories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => handleCategoryClick(cat.value)}
                        className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === cat.value ? getCategoryColor(cat.value) : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                        <IconReceipt className="w-4 h-4 mr-2" />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );

    // Render summary cards
    const renderSummaryCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Expenses Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        <IconDollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculateTotalAmount().toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {expensesData.otherExpenses.length} expense items
                </div>
            </div>

            {/* Paid Amount Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                        <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculatePaidAmount().toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {((calculatePaidAmount() / calculateTotalAmount()) * 100).toFixed(1)}% settled
                </div>
            </div>

            {/* Pending Balance Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                        <IconClock className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Pending Balance</div>
                        <div className="text-xl font-bold text-gray-800 dark:text-white">
                            ₹{calculateBalanceAmount().toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {expensesData.otherExpenses.filter(e => e.balance > 0).length} items pending
                </div>
            </div>
        </div>
    );

    // Render grand total card
    const renderGrandTotalCard = () => (
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg p-5 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-sm opacity-90">Expense Settlement Summary</div>
                    <div className="text-3xl font-bold">₹{calculateTotalAmount().toLocaleString('en-IN')}</div>
                    <div className="text-sm opacity-90 mt-1">
                        {expensesData.otherExpenses.length} expense items • Date: {expensesData.date}
                    </div>
                </div>
                <div className="text-right">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="opacity-90">Total Paid:</span>
                            <span className="font-semibold text-green-300">₹{calculatePaidAmount().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-90">Pending Balance:</span>
                            <span className="font-semibold text-yellow-300">₹{calculateBalanceAmount().toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-90">Settlement Rate:</span>
                            <span className="font-semibold">
                                {((calculatePaidAmount() / calculateTotalAmount()) * 100).toFixed(1)}%
                            </span>
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
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1 md:ml-4">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select 
                            className="form-select w-full"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {expenseCategories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sub-Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub-Category</label>
                        <select 
                            className="form-select w-full"
                            value={filters.subCategory}
                            onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                            disabled={filters.category === 'all'}
                        >
                            <option value="all">All Sub-categories</option>
                            {filters.category !== 'all' && subCategories[filters.category]?.map((subCat) => (
                                <option key={subCat} value={subCat}>
                                    {subCat.charAt(0).toUpperCase() + subCat.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="form-input pl-10 w-full"
                                placeholder="Search expenses..."
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
                            Showing {filteredData.length} of {expensesData.otherExpenses.length} expenses
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
                                    Expense Details
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Payment Info
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
                                    Pending Days
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
                                            <div>
                                                <div className="font-medium text-gray-700 dark:text-gray-300">
                                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">
                                                    {item.subCategory}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                {item.expenseType}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </div>
                                            {item.invoiceNumber && (
                                                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    Invoice: {item.invoiceNumber}
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
                                            <div>Vendor: {item.vendor}</div>
                                            <div>Method: {item.paymentMethod}</div>
                                            {item.vehicleDetails && (
                                                <div className="truncate max-w-xs">Vehicle: {item.vehicleDetails}</div>
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
                                        >
                                            {item.balance > 0 ? 'Settle' : 'View'}
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
                    <p className="text-gray-600 dark:text-gray-400">Manage and process other expense payments (non-salary)</p>
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