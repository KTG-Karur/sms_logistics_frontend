import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage, getAccessIdsByLabel } from '../../../util/AllFunction';
import _ from 'lodash';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconDollarSign from '../../../components/Icon/IconDollarSign';
import IconFilter from '../../../components/Icon/IconSearch';
import IconSearch from '../../../components/Icon/IconSearch';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconClock from '../../../components/Icon/IconClock';
import IconArrowRight from '../../../components/Icon/IconChevronRight';
import IconList from '../../../components/Icon/IconListCheck';
import IconBuilding from '../../../components/Icon/IconBuilding';
import IconCreditCard from '../../../components/Icon/IconCreditCard';
import IconFileText from '../../../components/Icon/IconTxtFile';
import IconX from '../../../components/Icon/IconX';
import Tippy from '@tippyjs/react';
import Select from 'react-select';
import Table from '../../../util/Table';
import { useNavigate } from 'react-router-dom';
import { getExpense, setExpenseFilters, clearExpenseFilters, resetExpenseStatus } from '../../../redux/expenseSlice';
import { createExpensePayment, resetExpensePaymentStatus } from '../../../redux/expensePaymentSlice';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { getExpenceType } from '../../../redux/expenceTypeSlice';

const ExpenseSettlement = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Expenses Payment');
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
    const getDefaultFromDate = () => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date;
    };

    // Get data from Redux store
    const { expenseData, loading: expenseLoading, filters: storeFilters } = useSelector((state) => state.ExpenseSlice || {});
    const { createPaymentSuccess, createPaymentFailed, loading: paymentLoading } = useSelector((state) => state.ExpensePaymentSlice || {});
    const { officeCentersData = [], loading: centersLoading } = useSelector((state) => state.OfficeCenterSlice || {});
    const { expenceTypeData = [], loading: typesLoading } = useSelector((state) => state.ExpenceTypeSlice || {});

    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Filter state
    const [filterState, setFilterState] = useState({
        expenseTypeId: '',
        officeCenterId: '',
        paymentStatus: '', // 'paid', 'unpaid', 'partial'
        paymentType: '', // 'cash', 'gpay', 'bank_transfer', 'cheque', 'credit_card', 'other'
        startDate: formatInputDate(getDefaultFromDate()),
        endDate: formatInputDate(getTodayDate()),
        expenseId: '', // Add expense ID filter
    });

    const [showFilter, setShowFilter] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Payment form state
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

    // Fetch initial data
    useEffect(() => {
        dispatch(setPageTitle('Expense Settlement'));
        fetchOfficeCenters();
        fetchExpenseTypes();
        // Set default filter state
        setFilterState(prev => ({
            ...prev,
            startDate: formatInputDate(getDefaultFromDate()),
            endDate: formatInputDate(getTodayDate()),
        }));
    }, []);

    // Fetch expenses when filters change
    useEffect(() => {
        if (filterState.startDate && filterState.endDate) {
            fetchExpenses();
        }
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

    const fetchOfficeCenters = () => {
        dispatch(getOfficeCenters({}));
    };

    const fetchExpenseTypes = () => {
        dispatch(getExpenceType({}));
    };

    const fetchExpenses = async () => {
        try {
            const params = {};
            if (filterState.officeCenterId) {
                params.officeCenterId = filterState.officeCenterId;
            }
            if (filterState.expenseTypeId) {
                params.expenseTypeId = filterState.expenseTypeId;
            }
            if (filterState.startDate) {
                params.startDate = filterState.startDate;
            }
            if (filterState.endDate) {
                params.endDate = filterState.endDate;
            }
            if (filterState.paymentStatus) {
                if (filterState.paymentStatus === 'unpaid') {
                    params.isPaid = false;
                } else if (filterState.paymentStatus === 'paid') {
                    params.isPaid = true;
                }
                // For 'partial', we'll handle in frontend filtering
            }
            if (filterState.paymentType) {
                params.paymentType = filterState.paymentType;
            }
            if (filterState.expenseId) {
                params.expenseId = filterState.expenseId;
            }
            if (searchTerm) {
                params.search = searchTerm;
            }

            await dispatch(getExpense(params)).unwrap();
        } catch (error) {
            showMessage('error', 'Failed to fetch expenses');
        }
    };

    // Transform API data and filter expenses
    const getExpenses = () => {
        if (!expenseData || !expenseData.data) return [];

        let expenses = expenseData.data.map((expense) => {
            const totalAmount = parseFloat(expense.amount) || 0;
            const paidAmount = parseFloat(expense.paid_amount) || 0;
            const balance = totalAmount - paidAmount;

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
                paymentMethod: expense.payment_type || 'Not Specified',
                expense_date: expense.expense_date,
                is_paid: expense.is_paid,
                officeCenter: expense.officeCenter ? {
                    id: expense.officeCenter.office_center_id,
                    name: expense.officeCenter.office_center_name,
                } : null,
                originalData: expense,
            };
        });

        // Apply payment status filter (for partial payments)
        if (filterState.paymentStatus === 'partial') {
            expenses = expenses.filter(item => item.status === 'Partially Paid');
        } else if (filterState.paymentStatus === 'unpaid') {
            expenses = expenses.filter(item => item.status === 'Unpaid');
        } else if (filterState.paymentStatus === 'paid') {
            expenses = expenses.filter(item => item.status === 'Fully Paid');
        }

        // Apply payment type filter
        if (filterState.paymentType) {
            expenses = expenses.filter(item => 
                item.paymentMethod?.toLowerCase() === filterState.paymentType.toLowerCase()
            );
        }

        // Apply expense ID filter
        if (filterState.expenseId) {
            const expenseIdLower = filterState.expenseId.toLowerCase();
            expenses = expenses.filter(item => 
                item.id?.toString().toLowerCase().includes(expenseIdLower)
            );
        }

        return expenses;
    };

    // Calculate totals for all expenses
    const calculateTotals = () => {
        const allExpenses = getExpenses();
        const totalAmount = allExpenses.reduce((sum, item) => sum + item.totalAmount, 0);
        const paidAmount = allExpenses.reduce((sum, item) => sum + item.paidAmount, 0);
        const balanceAmount = allExpenses.reduce((sum, item) => sum + item.balance, 0);
        
        const unpaidCount = allExpenses.filter(e => e.status === 'Unpaid').length;
        const partialCount = allExpenses.filter(e => e.status === 'Partially Paid').length;
        const paidCount = allExpenses.filter(e => e.status === 'Fully Paid').length;
        
        return {
            totalAmount,
            paidAmount,
            balanceAmount,
            itemCount: allExpenses.length,
            settlementRate: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
            unpaidCount,
            partialCount,
            paidCount,
        };
    };

    // Filter handlers
    const handleFilterChange = (selectedOption, { name }) => {
        setFilterState(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));
    };

    const handleInputFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterState(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFilterApply = () => {
        setShowFilter(false);
        setCurrentPage(0);
        // Filters are already applied via useEffect when filterState changes
    };

    const handleFilterClear = () => {
        setFilterState({
            expenseTypeId: '',
            officeCenterId: '',
            paymentStatus: '',
            paymentType: '',
            startDate: formatInputDate(getDefaultFromDate()),
            endDate: formatInputDate(getTodayDate()),
            expenseId: '',
        });
        setSearchTerm('');
        setShowFilter(false);
        setCurrentPage(0);
        dispatch(clearExpenseFilters());
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== undefined) {
                fetchExpenses();
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Payment form functions
    const resetPaymentForm = () => {
        setPaymentData({ amount: '', paymentMethod: 'cash', notes: '' });
        setPaymentErrors({});
        setSelectedExpense(null);
        setShowPaymentForm(false);
    };

    const openPaymentForm = (expense) => {
        if (!_.includes(accessIds, '10')) {
            showMessage('warning', 'You do not have permission to process payments');
            return;
        }
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

        if (name === 'amount' && selectedExpense) {
            const maxAllowed = selectedExpense.balance;
            if (parseFloat(value) > maxAllowed) {
                processedValue = maxAllowed.toString();
            }
        }

        setPaymentData(prev => ({ ...prev, [name]: processedValue }));
        if (paymentErrors[name]) {
            setPaymentErrors(prev => ({ ...prev, [name]: null }));
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
        const today = formatInputDate(new Date());

        const paymentRequest = {
            expenseId: selectedExpense.originalData.expense_id,
            paymentDate: today,
            amount: paymentAmount,
            paymentType: paymentData.paymentMethod,
            notes: paymentData.notes || `Payment for ${selectedExpense.expenseType}`,
        };

        showMessage('warning', `Process payment of ₹${paymentAmount.toLocaleString('en-IN')} for ${selectedExpense.expenseType}?`, () => {
            dispatch(createExpensePayment(paymentRequest));
        });
    };

    // Get selected value for React Select
    const getSelectedValue = (options, value) => {
        if (!value) return null;
        return options.find(option => option.value === value) || null;
    };

    // Filter options
    const officeCenterOptions = (officeCentersData || []).map(center => ({
        value: center.id,
        label: center.officeCentersName || center.office_center_name,
    }));

    const expenseTypeOptions = (expenceTypeData || []).map(type => ({
        value: type.expenceTypeId,
        label: type.expenceTypeName,
    }));

    const paymentStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'partial', label: 'Partially Paid' },
        { value: 'paid', label: 'Fully Paid' },
    ];

    const paymentTypeOptions = [
        { value: '', label: 'All Payment Types' },
        { value: 'cash', label: 'Cash' },
        { value: 'gpay', label: 'GPay' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'other', label: 'Other' },
    ];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Unpaid': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <IconClock className="w-3 h-3 mr-1" /> },
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

    // Table Columns (removed Expense ID column)
    const expenseColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            Cell: (row) => <div>{row?.row?.index + 1 + currentPage * pageSize}</div>,
            width: 80,
        },
        {
            Header: 'Center',
            accessor: 'officeCenter',
            sort: true,
            Cell: ({ row }) => (
                <div className="flex items-center">
                    <IconBuilding className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                        {row.original.officeCenter?.name || 'N/A'}
                    </span>
                </div>
            ),
        },
        {
            Header: 'Expense Type',
            accessor: 'expenseType',
            sort: true,
            Cell: ({ row }) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2">
                        {getCategoryIcon(row.original.category)}
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                        {row.original.expenseType}
                    </span>
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
            Header: 'Date',
            accessor: 'expense_date',
            sort: true,
            Cell: ({ value }) => <div className="text-sm">{value ? formatDisplayDate(new Date(value)) : '-'}</div>,
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
            sort: true,
            Cell: ({ value }) => <div className="text-green-600 font-semibold">₹{value.toLocaleString('en-IN')}</div>,
        },
        {
            Header: 'Pending',
            accessor: 'balance',
            sort: true,
            Cell: ({ value }) => (
                <div className={`font-bold ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{value.toLocaleString('en-IN')}
                </div>
            ),
        },
        {
            Header: 'Payment Type',
            accessor: 'paymentMethod',
            sort: true,
            Cell: ({ value }) => {
                const paymentTypeMap = {
                    cash: 'Cash',
                    gpay: 'GPay',
                    bank_transfer: 'Bank Transfer',
                    cheque: 'Cheque',
                    credit_card: 'Credit Card',
                    other: 'Other'
                };
                return <span className="text-sm">{paymentTypeMap[value?.toLowerCase()] || value || '-'}</span>;
            },
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
                
                if (expense.status === 'Fully Paid') {
                    return (
                        <Tippy content="Already Fully Paid">
                            <span className="text-xs text-green-600 italic">Paid</span>
                        </Tippy>
                    );
                }
                
                if (!canProcessPayment) {
                    return (
                        <Tippy content="No payment permission">
                            <span className="text-xs text-gray-400 italic">No access</span>
                        </Tippy>
                    );
                }
                
                return (
                    <Tippy content="Process Payment">
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => openPaymentForm(expense)}
                        >
                            Pay <IconArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </Tippy>
                );
            },
            width: 100,
        },
    ];

    const isLoading = expenseLoading || centersLoading || typesLoading;
    const totals = calculateTotals();
    const expenses = getExpenses();

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Settlement</h2>
                    <p className="text-gray-600 dark:text-gray-400">Process payments for expenses</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                            <IconDollarSign className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{totals.totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{totals.itemCount} total items</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <IconCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{totals.paidAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">{totals.settlementRate.toFixed(1)}% settled</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                            <IconClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pending Balance</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{totals.balanceAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500">
                        {totals.unpaidCount} unpaid, {totals.partialCount} partial
                    </div>
                </div>

                <div className="bg-gradient-to-r from-primary to-primary/90 text-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                            <IconList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm opacity-90">Payment Status</div>
                            <div className="text-xl font-bold">
                                {totals.paidCount}/{totals.itemCount}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs opacity-75">
                        {totals.paidCount} fully paid items
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilter && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">Filter Expenses</h5>
                        <button
                            type="button"
                            onClick={() => setShowFilter(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Expense ID Filter - New */}
                        <div>
                            <label>Expense ID</label>
                            <input
                                type="text"
                                name="expenseId"
                                className="form-input w-full"
                                placeholder="Enter Expense ID"
                                value={filterState.expenseId}
                                onChange={handleInputFilterChange}
                            />
                        </div>

                        {/* Date Range Filters */}
                        <div>
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="form-input w-full"
                                value={filterState.startDate}
                                onChange={handleDateFilterChange}
                            />
                        </div>
                        <div>
                            <label>End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                className="form-input w-full"
                                value={filterState.endDate}
                                onChange={handleDateFilterChange}
                            />
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
                                isClearable
                                className="react-select"
                                classNamePrefix="select"
                                isLoading={centersLoading}
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
                                isClearable
                                className="react-select"
                                classNamePrefix="select"
                                isLoading={typesLoading}
                            />
                        </div>

                        {/* Payment Status Filter */}
                        <div>
                            <label>Payment Status</label>
                            <Select
                                name="paymentStatus"
                                options={paymentStatusOptions}
                                value={getSelectedValue(paymentStatusOptions, filterState.paymentStatus)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'paymentStatus' })}
                                placeholder="All Status"
                                isClearable
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>

                        {/* Payment Type Filter */}
                        <div>
                            <label>Payment Type</label>
                            <Select
                                name="paymentType"
                                options={paymentTypeOptions}
                                value={getSelectedValue(paymentTypeOptions, filterState.paymentType)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'paymentType' })}
                                placeholder="All Payment Types"
                                isClearable
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
                        <input
                            type="text"
                            className="form-input pl-10 w-full"
                            placeholder="Search by description, expense type..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowFilter(!showFilter)}
                        className="btn btn-outline-primary"
                    >
                        <IconFilter className="ltr:mr-2 rtl:ml-2" />
                        Advanced Filters
                    </button>
                </div>
            </div>

            {/* Payment Form */}
            {showPaymentForm && selectedExpense && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Process Payment - {selectedExpense.expenseType}
                        </h3>
                        <button
                            type="button"
                            onClick={resetPaymentForm}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                            <div className="font-bold text-gray-900 dark:text-white">
                                ₹{selectedExpense.totalAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</div>
                            <div className="font-bold text-green-600">
                                ₹{selectedExpense.paidAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</div>
                            <div className="font-bold text-red-600">
                                ₹{selectedExpense.balance.toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Office Center</div>
                            <div className="font-medium">{selectedExpense.officeCenter?.name || 'N/A'}</div>
                        </div>
                    </div>
                    <form onSubmit={handlePaymentSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                {paymentErrors.amount && (
                                    <div className="text-danger text-sm mt-1">{paymentErrors.amount}</div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                    Max: ₹{selectedExpense.balance.toLocaleString('en-IN')}
                                </div>
                            </div>
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
                                {paymentErrors.paymentMethod && (
                                    <div className="text-danger text-sm mt-1">{paymentErrors.paymentMethod}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                <textarea
                                    name="notes"
                                    className="form-textarea w-full"
                                    placeholder="Add payment notes..."
                                    rows="1"
                                    value={paymentData.notes}
                                    onChange={handlePaymentInputChange}
                                />
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
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">Expense List</h3>
                        <div className="text-sm text-gray-500">
                            Showing {expenses.length} expenses
                            {filterState.startDate && filterState.endDate && ` | ${formatDisplayDate(new Date(filterState.startDate))} - ${formatDisplayDate(new Date(filterState.endDate))}`}
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    {/* Show active filters */}
                    {(filterState.officeCenterId || filterState.expenseTypeId || filterState.paymentStatus || filterState.paymentType || filterState.expenseId) && (
                        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {filterState.expenseId && (
                                    <span className="badge bg-primary">
                                        Expense ID: {filterState.expenseId}
                                    </span>
                                )}
                                {filterState.officeCenterId && (
                                    <span className="badge bg-primary">
                                        Center: {officeCenterOptions.find(c => c.value === filterState.officeCenterId)?.label || filterState.officeCenterId}
                                    </span>
                                )}
                                {filterState.expenseTypeId && (
                                    <span className="badge bg-primary">
                                        Type: {expenseTypeOptions.find(t => t.value === filterState.expenseTypeId)?.label || filterState.expenseTypeId}
                                    </span>
                                )}
                                {filterState.paymentStatus && (
                                    <span className="badge bg-primary">
                                        Status: {paymentStatusOptions.find(s => s.value === filterState.paymentStatus)?.label || filterState.paymentStatus}
                                    </span>
                                )}
                                {filterState.paymentType && (
                                    <span className="badge bg-primary">
                                        Payment Type: {paymentTypeOptions.find(p => p.value === filterState.paymentType)?.label || filterState.paymentType}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={handleFilterClear}
                                    className="text-danger text-sm hover:underline ml-2"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading expenses...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={expenseColumns}
                                data={getPaginatedData(expenses)}
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                totalCount={expenses.length}
                                totalPages={Math.ceil(expenses.length / pageSize)}
                                onPaginationChange={handlePaginationChange}
                                pagination={true}
                                isSearchable={false}
                                isSortable={true}
                                loading={isLoading}
                            />
                            {expenses.length === 0 && !isLoading && (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">No expenses found</div>
                                    <div className="text-sm text-gray-500">
                                        {filterState.startDate && filterState.endDate 
                                            ? `No expenses found for selected date range` 
                                            : 'No expenses available'}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseSettlement;