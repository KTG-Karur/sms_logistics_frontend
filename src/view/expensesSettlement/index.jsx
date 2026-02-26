import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { showMessage, getAccessIdsByLabel } from '../../util/AllFunction';
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
import { getExpense, setExpenseFilters, clearExpenseFilters } from '../../redux/expenseSlice';
import { createExpensePayment, resetExpensePaymentStatus } from '../../redux/expensePaymentSlice';

const ExpenseSettlement = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Expenses Payment');
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
    const { expenseData, loading: expenseLoading, filters: storeFilters } = useSelector((state) => state.ExpenseSlice);
    const { createPaymentSuccess, createPaymentFailed, loading: paymentLoading } = useSelector((state) => state.ExpensePaymentSlice);

    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Local filter state for UI
    const [localFilters, setLocalFilters] = useState({
        search: '',
    });

    // Filter state for backend
    const [filterState, setFilterState] = useState({
        expenseTypeId: '',
        isPaid: '',
        officeCenterId: '',
        startDate: '',
        endDate: '',
    });

    const [showFilter, setShowFilter] = useState(false);

    // Payment form state - shown above table
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'cash',
        notes: '',
    });
    const [paymentErrors, setPaymentErrors] = useState({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Options for filters
    const [officeCenters, setOfficeCenters] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);

    useEffect(() => {
        dispatch(setPageTitle('Expense Settlement'));
        // Set default date filter to today
        setFilterState((prev) => ({
            ...prev,
            startDate: formatInputDate(getTodayDate()),
            endDate: formatInputDate(getTodayDate()),
        }));
    }, []);

    // Fetch expenses when filters change
    useEffect(() => {
        fetchExpenses();
    }, [filterState]);

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

    // Extract unique office centers and expense types from expense data for filter options
    useEffect(() => {
        if (expenseData && expenseData.data) {
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

    const fetchExpenses = async () => {
        try {
            // Prepare filter params for backend
            const params = {};

            if (filterState.officeCenterId) {
                params.officeCenterId = filterState.officeCenterId;
            }

            if (filterState.expenseTypeId) {
                params.expenseTypeId = filterState.expenseTypeId;
            }

            if (filterState.isPaid) {
                // Convert status to isPaid boolean
                if (filterState.isPaid === 'unpaid') {
                    params.isPaid = false;
                } else if (filterState.isPaid === 'partially_paid') {
                    // For partially paid, we need to handle differently
                    // This might require backend support for partial payment filter
                    params.isPaid = false; // For now, show unpaid and partially paid
                }
            }

            if (filterState.startDate) {
                params.startDate = filterState.startDate;
            }

            if (filterState.endDate) {
                params.endDate = filterState.endDate;
            }

            // Search by description or invoice number
            if (localFilters.search) {
                params.search = localFilters.search;
            }

            await dispatch(getExpense(params)).unwrap();
        } catch (error) {
            showMessage('error', 'Failed to fetch expenses');
        }
    };

    // Transform API data to match component structure and filter for pending expenses
    const getPendingExpenses = () => {
        if (!expenseData || !expenseData.data) return [];

        return expenseData.data
            .map((expense) => {
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
            })
            .filter((item) => !item.is_paid && item.balance > 0); // Only show pending expenses
    };

    // Calculate totals for pending expenses
    const calculateTotals = () => {
        const pendingExpenses = getPendingExpenses();

        const totalAmount = pendingExpenses.reduce((sum, item) => sum + item.totalAmount, 0);
        const paidAmount = pendingExpenses.reduce((sum, item) => sum + item.paidAmount, 0);
        const balanceAmount = pendingExpenses.reduce((sum, item) => sum + item.balance, 0);

        return {
            totalAmount,
            paidAmount,
            balanceAmount,
            itemCount: pendingExpenses.length,
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

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFilterApply = () => {
        setShowFilter(false);
        // Filters are already applied via useEffect when filterState changes
    };

    const handleFilterClear = () => {
        setFilterState({
            expenseTypeId: '',
            isPaid: '',
            officeCenterId: '',
            startDate: formatInputDate(getTodayDate()),
            endDate: formatInputDate(getTodayDate()),
        });
        setLocalFilters({ search: '' });
        setShowFilter(false);
        dispatch(clearExpenseFilters());
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalFilters({ search: value });

        // Debounce search to avoid too many API calls
        const timeoutId = setTimeout(() => {
            fetchExpenses();
        }, 500);

        return () => clearTimeout(timeoutId);
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
                const canProcessPayment = _.includes(accessIds, '10');

                // Only show the button if user has permission
                if (!canProcessPayment) {
                    return (
                        <Tippy content="No payment permission">
                            <span className="text-xs text-gray-400 italic">No access</span>
                        </Tippy>
                    );
                }

                return (
                    <Tippy content="Process Payment">
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => openPaymentForm(expense)}>
                            Pay
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
                    <div className="text-xs text-gray-500">{getPendingExpenses().filter((e) => e.balance > 0).length} items pending</div>
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
                        <div className="font-semibold">{formatDisplayDate(getTodayDate())}</div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {renderSummaryCards()}

            {/* Filter Panel */}
            {showFilter && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Filter Expenses</h5>
                        <button type="button" onClick={() => setShowFilter(false)} className="text-gray-500 hover:text-gray-700">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Date Range Filters */}
                        <div>
                            <label>Start Date</label>
                            <input type="date" name="startDate" className="form-input w-full" value={filterState.startDate} onChange={handleDateFilterChange} />
                        </div>

                        <div>
                            <label>End Date</label>
                            <input type="date" name="endDate" className="form-input w-full" value={filterState.endDate} onChange={handleDateFilterChange} />
                        </div>

                        {/* Office Center Filter */}
                        <div>
                            <label>Office Center</label>
                            <Select
                                name="officeCenterId"
                                options={officeCenterOptions}
                                value={getSelectedValue(officeCenterOptions, filterState.officeCenterId)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'officeCenterId' })}
                                placeholder="All Centers"
                                isClearable={true}
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
                                isClearable={true}
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
                                isClearable={true}
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
                        <input type="text" className="form-input pl-10 w-full" placeholder="Search by description, invoice number..." value={localFilters.search} onChange={handleSearchChange} />
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <button type="button" onClick={() => setShowFilter(!showFilter)} className="btn btn-outline-primary">
                        <IconFilter className="ltr:mr-2 rtl:ml-2" />
                        Advanced Filters
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
                        <div className="text-sm text-gray-500">
                            Showing {getPendingExpenses().length} pending expenses
                            {filterState.startDate && filterState.endDate && ` for ${formatDisplayDate(new Date(filterState.startDate))} - ${formatDisplayDate(new Date(filterState.endDate))}`}
                        </div>
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
                            data={getPaginatedData(getPendingExpenses())}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={getPendingExpenses().length}
                            totalPages={Math.ceil(getPendingExpenses().length / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            loading={expenseLoading}
                        />
                    )}

                    {getPendingExpenses().length === 0 && !expenseLoading && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">No pending expenses found</div>
                            <div className="text-sm text-gray-500">{filterState.startDate && filterState.endDate ? `No pending expenses for selected date range` : 'All expenses are fully paid'}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseSettlement;
