import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import IconBuilding from '../../components/Icon/IconBuilding';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconFileText from '../../components/Icon/IconTxtFile';
import IconFileInvoice from '../../components/Icon/IconTxtFile';
import IconX from '../../components/Icon/IconX';
import Tippy from '@tippyjs/react';
import Select from 'react-select';
import Table from '../../util/Table';
import { useNavigate } from 'react-router-dom';
import { getExpense } from '../../redux/expenseSlice';
import { createExpensePayment, resetExpensePaymentStatus } from '../../redux/expensePaymentSlice';

const ExpenseSettlement = () => {
    const dispatch = useDispatch();

    // Format date functions
    const formatDisplayDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatInputDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getTodayDate = () => new Date();

    // Get data from Redux store
    const { expenseData, loading: expenseLoading } = useSelector((state) => state.ExpenseSlice);
    const { createPaymentSuccess, createPaymentFailed, loading: paymentLoading } = useSelector((state) => state.ExpensePaymentSlice);

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        search: '',
        officeCenterId: 'all',
    });

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [pendingExpenses, setPendingExpenses] = useState([]);
    const [officeCenters, setOfficeCenters] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);

    // Payment form state - shown above table
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'cash',
        notes: '',
    });
    const [paymentErrors, setPaymentErrors] = useState({});

    // Filter state
    const [filterState, setFilterState] = useState({
        expenseTypeId: '',
        isPaid: '',
        officeCenterId: '',
    });
    const [showFilter, setShowFilter] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Categories for filtering
    const expenseCategories = [
        { value: 'Fuel', label: 'Fuel Expenses' },
        { value: 'Snack', label: 'Snack Expenses' },
        { value: 'Maintenance', label: 'Maintenance Expenses' },
        { value: 'Other', label: 'Other Expenses' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Expense Settlement'));
        fetchExpenses();
    }, []);

    // Handle payment creation response
    useEffect(() => {
        if (createPaymentSuccess) {
            showMessage('success', 'Payment processed successfully!');
            resetPaymentForm();
            fetchExpenses(); // Refresh the list
            dispatch(resetExpensePaymentStatus());
        }

        if (createPaymentFailed) {
            showMessage('error', 'Failed to process payment');
            dispatch(resetExpensePaymentStatus());
        }
    }, [createPaymentSuccess, createPaymentFailed]);

    // Extract unique office centers and expense types from expense data
    useEffect(() => {
        if (expenseData && expenseData.data) {
            // Extract office centers
            const centers = new Set();
            const types = new Set();

            expenseData.data.forEach((expense) => {
                if (expense.officeCenter?.office_center_name) {
                    centers.add(
                        JSON.stringify({
                            id: expense.officeCenter.office_center_id,
                            name: expense.officeCenter.office_center_name,
                        }),
                    );
                }
                if (expense.expenseType?.expence_type_name) {
                    types.add(
                        JSON.stringify({
                            id: expense.expenseType.expence_type_id,
                            name: expense.expenseType.expence_type_name,
                        }),
                    );
                }
            });

            const uniqueCenters = Array.from(centers).map((c) => JSON.parse(c));
            const uniqueTypes = Array.from(types).map((t) => JSON.parse(t));

            setOfficeCenters(uniqueCenters);
            setExpenseTypes(uniqueTypes);
        }
    }, [expenseData]);

    // Transform and filter data whenever expenseData changes
    useEffect(() => {
        if (expenseData && expenseData.data) {
            const transformed = transformExpenseData(expenseData.data);
            setPendingExpenses(transformed);
        }
    }, [expenseData]);

    const fetchExpenses = async () => {
        try {
            await dispatch(getExpense({})).unwrap();
        } catch (error) {
            showMessage('error', 'Failed to fetch expenses');
        }
    };

    // Transform API data to match component structure
    const transformExpenseData = (apiData) => {
        if (!apiData || apiData.length === 0) return [];

        return apiData.map((expense) => {
            const totalAmount = parseFloat(expense.amount) || 0;
            const paidAmount = parseFloat(expense.paid_amount) || 0;
            const balance = totalAmount - paidAmount;

            // Determine status
            let status = 'Unpaid';
            if (balance === 0) status = 'Fully Paid';
            else if (paidAmount > 0 && balance > 0) status = 'Partially Paid';

            return {
                id: expense.expense_id,
                expenseType: expense.expenseType?.expence_type_name || 'Expense',
                expenseTypeId: expense.expenseType?.expence_type_id,
                description: expense.description || 'No description',
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                balance: balance,
                status: status,
                category: expense.expenseType?.expence_type_name || 'Other',
                vendor: expense.expenseType?.expence_type_name || 'N/A',
                paymentMethod: expense.payment_method || 'Not Specified',
                invoiceNumber: expense.invoice_number || 'N/A',
                expense_date: expense.expense_date,
                is_paid: expense.is_paid,
                // Office Center details
                officeCenter: expense.officeCenter
                    ? {
                          id: expense.officeCenter.office_center_id,
                          name: expense.officeCenter.office_center_name,
                      }
                    : null,
                // Store original data
                originalData: expense,
            };
        });
    };

    // Filter data to only show expenses with pending balance
    const getFilteredPendingExpenses = () => {
        // First filter to only show expenses with balance > 0 (not fully paid)
        let data = pendingExpenses.filter((item) => !item.is_paid && item.balance > 0);

        // Apply office center filter
        if (filterState.officeCenterId) {
            data = data.filter((item) => item.officeCenter?.id === filterState.officeCenterId);
        }

        // Apply category/expense type filter
        if (filterState.expenseTypeId) {
            data = data.filter((item) => item.expenseTypeId === filterState.expenseTypeId);
        }

        // Apply status filter
        if (filterState.isPaid) {
            data = data.filter((item) => {
                if (filterState.isPaid === 'unpaid') return item.paidAmount === 0;
                if (filterState.isPaid === 'partially_paid') return item.balance > 0 && item.paidAmount > 0;
                return true;
            });
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            data = data.filter(
                (item) =>
                    item.expenseType.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    (item.officeCenter?.name && item.officeCenter.name.toLowerCase().includes(searchLower)),
            );
        }

        return data;
    };

    // Calculate totals for pending expenses only
    const calculateTotals = () => {
        const filteredData = getFilteredPendingExpenses();

        const totalAmount = filteredData.reduce((sum, item) => sum + item.totalAmount, 0);
        const paidAmount = filteredData.reduce((sum, item) => sum + item.paidAmount, 0);
        const balanceAmount = filteredData.reduce((sum, item) => sum + item.balance, 0);

        return {
            totalAmount,
            paidAmount,
            balanceAmount,
            itemCount: filteredData.length,
            settlementRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
        };
    };

    // Filter handlers
    const handleFilterChange = (selectedOption, { name }) => {
        setFilterState((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));
    };

    const handleFilterApply = () => {
        setShowFilter(false);
    };

    const handleFilterClear = () => {
        setFilterState({
            expenseTypeId: '',
            isPaid: '',
            officeCenterId: '',
        });
        setShowFilter(false);
    };

    const handleSearchChange = (e) => {
        setFilters((prev) => ({ ...prev, search: e.target.value }));
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            setFilterState((prev) => ({ ...prev, expenseTypeId: '' }));
        } else {
            const type = expenseTypes.find((t) => t.name === category);
            if (type) {
                setFilterState((prev) => ({ ...prev, expenseTypeId: type.id }));
            }
        }
    };

    // Payment form functions
    const resetPaymentForm = () => {
        setPaymentData({
            amount: '',
            paymentMethod: 'cash',
            notes: '',
        });
        setPaymentErrors({});
        setSelectedExpense(null);
        setShowPaymentForm(false);
    };

    const openPaymentForm = (expense) => {
        setSelectedExpense(expense);
        setPaymentData({
            amount: expense.balance.toString(),
            paymentMethod: 'cash',
            notes: '',
        });
        setPaymentErrors({});
        setShowPaymentForm(true);
    };

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        // For amount field, validate against max allowed
        if (name === 'amount' && selectedExpense) {
            const maxAllowed = selectedExpense.balance;
            if (parseFloat(value) > maxAllowed) {
                processedValue = maxAllowed.toString();
            }
        }

        setPaymentData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        if (paymentErrors[name]) {
            setPaymentErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validatePaymentForm = () => {
        const errors = {};
        if (!paymentData.amount) {
            errors.amount = 'Amount is required';
        } else if (parseFloat(paymentData.amount) <= 0) {
            errors.amount = 'Amount must be greater than 0';
        } else if (selectedExpense && parseFloat(paymentData.amount) > selectedExpense.balance) {
            errors.amount = `Payment amount cannot exceed ₹${selectedExpense.balance.toLocaleString('en-IN')}`;
        }

        if (!paymentData.paymentMethod) {
            errors.paymentMethod = 'Payment method is required';
        }

        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!validatePaymentForm()) return;

        if (!selectedExpense) return;

        const paymentAmount = parseFloat(paymentData.amount);

        // Prepare payment request with today's date
        const today = formatInputDate(new Date());

        const paymentRequest = {
            expenseId: selectedExpense.originalData.expense_id,
            paymentDate: today,
            amount: paymentAmount,
            paymentType: paymentData.paymentMethod,
            notes: paymentData.notes || `Payment for ${selectedExpense.expenseType}`,
        };

        // Show confirmation
        showMessage('warning', `Process payment of ₹${paymentAmount.toLocaleString('en-IN')} for ${selectedExpense.expenseType}?`, () => {
            // Dispatch create payment action
            dispatch(createExpensePayment(paymentRequest));
        });
    };

    // Get selected value for React Select
    const getSelectedValue = (options, value) => {
        if (!value) return null;
        return options.find((option) => option.value === value) || null;
    };

    // Filter options
    const officeCenterOptions = officeCenters.map((center) => ({
        value: center.id,
        label: center.name,
    }));

    const expenseTypeOptions = expenseTypes.map((type) => ({
        value: type.id,
        label: type.name,
    }));

    const filterStatusOptions = [
        { value: 'unpaid', label: 'Unpaid Only' },
        { value: 'partially_paid', label: 'Partially Paid' },
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            Unpaid: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <IconClock className="w-3 h-3 mr-1" /> },
            'Partially Paid': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: <IconClock className="w-3 h-3 mr-1" /> },
            'Fully Paid': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <IconCheckCircle className="w-3 h-3 mr-1" /> },
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
        return <IconReceipt className="w-5 h-5 text-blue-600" />;
    };

    // Pagination handler
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

    // Table Columns
    const expenseColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Center',
            accessor: 'officeCenter',
            Cell: ({ row }) => (
                <div className="flex items-center">
                    <IconBuilding className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">{row.original.officeCenter?.name || 'N/A'}</span>
                </div>
            ),
        },
        {
            Header: 'Expense Type',
            accessor: 'expenseType',
            sort: true,
            Cell: ({ row }) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">{getCategoryIcon(row.original.category)}</div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{row.original.expenseType}</span>
                </div>
            ),
        },
        {
            Header: 'Description',
            accessor: 'description',
            sort: true,
            Cell: ({ value }) => <div className="text-gray-600 dark:text-gray-400">{value}</div>,
        },
        {
            Header: 'Total Amount',
            accessor: 'totalAmount',
            sort: true,
            Cell: ({ value }) => <div className="font-bold text-gray-900 dark:text-white">₹{value.toLocaleString('en-IN')}</div>,
        },
        {
            Header: 'Paid Amount',
            accessor: 'paidAmount',
            Cell: ({ value }) => <div className="text-green-600 font-semibold">₹{value.toLocaleString('en-IN')}</div>,
        },
        {
            Header: 'Pending',
            accessor: 'balance',
            Cell: ({ value }) => <div className={`font-bold ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>₹{value.toLocaleString('en-IN')}</div>,
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => getStatusBadge(value),
        },
        {
            Header: 'Action',
            accessor: 'actions',
            Cell: ({ row }) => {
                const expense = row.original;
                return (
                    <Tippy content="Process Payment">
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => openPaymentForm(expense)}>
                            Settle
                            <IconArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </Tippy>
                );
            },
            width: 120,
        },
    ];

    // Render summary cards
    const renderSummaryCards = () => {
        const totals = calculateTotals();

        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                            <IconDollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{totals.totalAmount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{totals.itemCount} pending items</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{totals.paidAmount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{totals.settlementRate.toFixed(1)}% settled</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                            <IconClock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pending Balance</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{totals.balanceAmount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{getFilteredPendingExpenses().filter((e) => e.balance > 0).length} items pending</div>
                </div>

                <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                            <IconDollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm opacity-90">Net Balance</div>
                            <div className="text-xl font-bold">₹{totals.balanceAmount.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div className="text-xs opacity-75">To be settled</div>
                </div>
            </div>
        );
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
                        className={`px-4 py-2 rounded-lg flex items-center ${selectedCategory === cat.value ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                        <IconReceipt className="w-4 h-4 mr-2" />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div>
            {/* Header with Date */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Settlement</h2>
                    <p className="text-gray-600 dark:text-gray-400">Process payments for pending expenses</p>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <IconCalendar className="w-5 h-5 text-primary mr-2" />
                    <div>
                        <div className="text-sm text-gray-500">Settlement Date</div>
                        <div className="font-semibold">{formatDisplayDate(selectedDate)}</div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* Category Tabs */}
            {renderCategoryTabs()}

            {/* Filter Panel */}
            {showFilter && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Filter Expenses</h5>
                        <button type="button" onClick={() => setShowFilter(false)} className="text-gray-500 hover:text-gray-700">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Office Center Filter */}
                        <div>
                            <label>Office Center</label>
                            <Select
                                name="officeCenterId"
                                options={officeCenterOptions}
                                value={getSelectedValue(officeCenterOptions, filterState.officeCenterId)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'officeCenterId' })}
                                placeholder="All Centers"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>

                        {/* Expense Type Filter */}
                        <div>
                            <label>Expense Type</label>
                            <Select
                                name="expenseTypeId"
                                options={expenseTypeOptions}
                                value={getSelectedValue(expenseTypeOptions, filterState.expenseTypeId)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'expenseTypeId' })}
                                placeholder="All Types"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label>Payment Status</label>
                            <Select
                                name="isPaid"
                                options={filterStatusOptions}
                                value={getSelectedValue(filterStatusOptions, filterState.isPaid)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'isPaid' })}
                                placeholder="All Status"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button type="button" onClick={handleFilterClear} className="btn btn-outline-secondary">
                            Clear Filters
                        </button>
                        <button type="button" onClick={handleFilterApply} className="btn btn-primary">
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <input type="text" className="form-input pl-10 w-full" placeholder="Search by description, category, center..." value={filters.search} onChange={handleSearchChange} />
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <button type="button" onClick={() => setShowFilter(!showFilter)} className="btn btn-outline-primary">
                        <IconFilter className="ltr:mr-2 rtl:ml-2" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Payment Form - Above Table */}
            {showPaymentForm && selectedExpense && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Process Payment - {selectedExpense.expenseType}</h3>
                        <button type="button" onClick={resetPaymentForm} className="text-gray-500 hover:text-gray-700">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                            <div className="font-bold text-gray-900 dark:text-white">₹{selectedExpense.totalAmount.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</div>
                            <div className="font-bold text-green-600">₹{selectedExpense.paidAmount.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</div>
                            <div className="font-bold text-red-600">₹{selectedExpense.balance.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Office Center</div>
                            <div className="font-medium">{selectedExpense.officeCenter?.name || 'N/A'}</div>
                        </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Payment Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Amount (₹) <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    className={`form-input w-full ${paymentErrors.amount ? 'border-danger' : ''}`}
                                    placeholder="Enter amount"
                                    value={paymentData.amount}
                                    onChange={handlePaymentInputChange}
                                    min="0.01"
                                    max={selectedExpense.balance}
                                    step="0.01"
                                />
                                {paymentErrors.amount && <div className="text-danger text-sm mt-1">{paymentErrors.amount}</div>}
                                <div className="text-xs text-gray-500 mt-1">Max: ₹{selectedExpense.balance.toLocaleString('en-IN')}</div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Method <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="paymentMethod"
                                    className={`form-select w-full ${paymentErrors.paymentMethod ? 'border-danger' : ''}`}
                                    value={paymentData.paymentMethod}
                                    onChange={handlePaymentInputChange}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gpay">GPay</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="credit_card">Credit Card</option>
                                    <option value="other">Other</option>
                                </select>
                                {paymentErrors.paymentMethod && <div className="text-danger text-sm mt-1">{paymentErrors.paymentMethod}</div>}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea name="notes" className="form-textarea w-full" placeholder="Add payment notes..." rows="1" value={paymentData.notes} onChange={handlePaymentInputChange} />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button type="button" onClick={resetPaymentForm} className="btn btn-outline-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
                                {paymentLoading ? (
                                    <>
                                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    `Process Payment (₹${parseFloat(paymentData.amount || 0).toLocaleString('en-IN')})`
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Pending Expense Settlement List</h3>
                        <div className="text-sm text-gray-500">Showing {getFilteredPendingExpenses().length} pending expenses</div>
                    </div>
                </div>

                <div className="p-4">
                    {/* Show active filters */}
                    {(filterState.expenseTypeId || filterState.isPaid || filterState.officeCenterId) && (
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {filterState.officeCenterId && (
                                    <span className="badge bg-primary">Center: {officeCenters.find((c) => c.id === filterState.officeCenterId)?.name || filterState.officeCenterId}</span>
                                )}
                                {filterState.expenseTypeId && (
                                    <span className="badge bg-primary">Type: {expenseTypes.find((t) => t.id === filterState.expenseTypeId)?.name || filterState.expenseTypeId}</span>
                                )}
                                {filterState.isPaid && <span className="badge bg-primary">Status: {filterState.isPaid === 'unpaid' ? 'Unpaid' : 'Partially Paid'}</span>}
                                <button type="button" onClick={handleFilterClear} className="text-danger text-sm hover:underline ml-2">
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}

                    {expenseLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table
                            columns={expenseColumns}
                            data={getPaginatedData(getFilteredPendingExpenses())}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={getFilteredPendingExpenses().length}
                            totalPages={Math.ceil(getFilteredPendingExpenses().length / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            loading={expenseLoading}
                        />
                    )}

                    {getFilteredPendingExpenses().length === 0 && !expenseLoading && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">No pending expenses found</div>
                            <div className="text-sm text-gray-500">All expenses are fully paid</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseSettlement;
