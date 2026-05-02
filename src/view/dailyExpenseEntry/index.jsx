import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import { showMessage, getAccessIdsByLabel } from '../../util/AllFunction';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconCheck from '../../components/Icon/IconCheck';
import IconReceipt from '../../components/Icon/IconReceipt';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconMoney';
import IconEdit from '../../components/Icon/IconEdit';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconFilter from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import IconIncome from '../../components/Icon/IconTrendingUp';
import Tippy from '@tippyjs/react';
import Select from 'react-select';
import _ from 'lodash';

// Import Redux actions
import { getOfficeCenters } from '../../redux/officeCenterSlice';
import { getExpenceType } from '../../redux/expenceTypeSlice';
import { 
    getOpeningBalance, 
    createOpeningBalance, 
    updateOpeningBalance, 
    deleteOpeningBalance,
    resetOpeningBalanceStatus 
} from '../../redux/openingBalanceSlice';
import {
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    resetExpenseStatus,
    setExpenseFilters,
    clearExpenseFilters
} from '../../redux/expenseSlice';
import {
    createExpensePayment,
    deleteExpensePayment,
    resetExpensePaymentStatus
} from '../../redux/expensePaymentSlice';
import {
    getExtraIncome,
    createExtraIncome,
    updateExtraIncome,
    deleteExtraIncome,
    resetExtraIncomeStatus,
    setExtraIncomeFilters,
    clearExtraIncomeFilters
} from '../../redux/extraIncomeSlice';

const ExpenseCalculation = () => {
    const dispatch = useDispatch();

    // Get access permissions
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Daily Expense Entry');

    // Permission checks
    const canCreate = _.includes(accessIds, '2');
    const canEdit = _.includes(accessIds, '3');
    const canDelete = _.includes(accessIds, '4');
    const canPay = _.includes(accessIds, '10');

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

    // Redux state
    const officeCentersState = useSelector((state) => state.OfficeCenterSlice || {});
    const expenceTypeState = useSelector((state) => state.ExpenceTypeSlice || {});
    const openingBalanceReduxState = useSelector((state) => state.OpeningBalanceSlice || {});
    const expenseReduxState = useSelector((state) => state.ExpenseSlice || {});
    const expensePaymentReduxState = useSelector((state) => state.ExpensePaymentSlice || {});
    const extraIncomeReduxState = useSelector((state) => state.ExtraIncomeSlice || {});

    const {
        officeCentersData = [],
        loading: officeLoading = false,
    } = officeCentersState;

    const {
        expenceTypeData = [],
        loading: expenceTypeLoading = false,
    } = expenceTypeState;

    const {
        openingBalanceData = [],
        loading: openingLoading = false,
        createOpeningBalanceSuccess = false,
        updateOpeningBalanceSuccess = false,
        deleteOpeningBalanceSuccess = false,
        error: openingError = null,
    } = openingBalanceReduxState;

    const {
        expenseData = [],
        loading: expenseLoading = false,
        createExpenseSuccess = false,
        updateExpenseSuccess = false,
        deleteExpenseSuccess = false,
        error: expenseError = null,
    } = expenseReduxState;

    const {
        createPaymentSuccess = false,
        deletePaymentSuccess = false,
        error: paymentError = null,
    } = expensePaymentReduxState;

    const {
        extraIncomeData = [],
        loading: extraIncomeLoading = false,
        createExtraIncomeSuccess = false,
        updateExtraIncomeSuccess = false,
        deleteExtraIncomeSuccess = false,
        error: extraIncomeError = null,
    } = extraIncomeReduxState;

    // UI State
    const [showOpeningBalanceForm, setShowOpeningBalanceForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [showExtraIncomeForm, setShowExtraIncomeForm] = useState(false);
    const [showExtraIncomeFilter, setShowExtraIncomeFilter] = useState(false);
    const [openingBalanceType, setOpeningBalanceType] = useState('IN');

    // Local state
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedOfficeCenter, setSelectedOfficeCenter] = useState(null);
    const [openingBalances, setOpeningBalances] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [extraIncomes, setExtraIncomes] = useState([]);

    // Form states
    const [openingBalanceForm, setOpeningBalanceForm] = useState({
        date: '',
        officeCenterId: '',
        inOut: 'IN',
        openingBalance: '',
        notes: ''
    });

    const [expenseForm, setExpenseForm] = useState({
        expenseTypeId: '',
        amount: '',
        description: '',
        hasPayment: false,
        payment: {
            paymentDate: '',
            amount: '',
            paymentType: 'cash',
            notes: ''
        }
    });

    const [extraIncomeForm, setExtraIncomeForm] = useState({
        income_date: '',
        amount: '',
        income_type: 'cash',
        description: ''
    });

    const [paymentForm, setPaymentForm] = useState({
        expenseId: '',
        paymentDate: '',
        amount: '',
        paymentType: 'cash',
        notes: ''
    });

    // Edit states
    const [isEditOpeningBalance, setIsEditOpeningBalance] = useState(false);
    const [selectedOpeningBalanceItem, setSelectedOpeningBalanceItem] = useState(null);
    const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);
    const [isEditExtraIncome, setIsEditExtraIncome] = useState(false);
    const [selectedExtraIncomeItem, setSelectedExtraIncomeItem] = useState(null);

    // Form errors
    const [openingBalanceErrors, setOpeningBalanceErrors] = useState({});
    const [expenseErrors, setExpenseErrors] = useState({});
    const [paymentErrors, setPaymentErrors] = useState({});
    const [extraIncomeErrors, setExtraIncomeErrors] = useState({});

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [extraIncomeCurrentPage, setExtraIncomeCurrentPage] = useState(0);
    const [extraIncomePageSize, setExtraIncomePageSize] = useState(10);

    // Filters
    const [filters, setFilters] = useState({
        expenseTypeId: null,
        isPaid: null,
    });

    const [filterState, setFilterState] = useState({
        expenseTypeId: '',
        isPaid: '',
    });

    const [extraIncomeFilters, setExtraIncomeFilters] = useState({
        incomeType: null,
    });

    const [extraIncomeFilterState, setExtraIncomeFilterState] = useState({
        incomeType: '',
    });

    // Check if opening balance exists for selected date, center and type
    const hasOpeningBalance = (type = 'IN') => {
        if (!selectedOfficeCenter?.value || !selectedDate) return false;
        const formattedDate = formatInputDate(selectedDate);
        return openingBalances.some(balance => 
            balance.date === formattedDate && balance.in_out === type
        );
    };

    // Load initial data
    useEffect(() => {
        dispatch(setPageTitle('Expense Calculation'));
        fetchOfficeCenters();
        fetchExpenceTypes();
    }, []);

    // Fetch expense types
    const fetchExpenceTypes = () => {
        dispatch(getExpenceType({}));
    };

    // Set default office center when data loads
    useEffect(() => {
        if (officeCentersData && officeCentersData.length > 0 && !selectedOfficeCenter) {
            const sortedCenters = [...officeCentersData].sort((a, b) => {
                const nameA = a?.officeCentersName || a?.office_center_name || '';
                const nameB = b?.officeCentersName || b?.office_center_name || '';
                return nameA.localeCompare(nameB);
            });
            const firstCenter = sortedCenters[0];
            if (firstCenter && firstCenter.id) {
                setSelectedOfficeCenter({
                    value: firstCenter.id,
                    label: firstCenter.officeCentersName || firstCenter.office_center_name || 'Unknown'
                });
            }
        }
    }, [officeCentersData]);

    // Fetch data when date or office center changes
    useEffect(() => {
        if (selectedOfficeCenter?.value) {
            fetchOpeningBalances();
            fetchExpenses();
            fetchExtraIncomes();
        }
    }, [selectedDate, selectedOfficeCenter]);

    // Handle opening balance success/error
    useEffect(() => {
        if (createOpeningBalanceSuccess) {
            showMessage('success', `Opening balance (${openingBalanceType}) created successfully`);
            resetOpeningBalanceForm();
            fetchOpeningBalances();
            dispatch(resetOpeningBalanceStatus());
        }
        if (updateOpeningBalanceSuccess) {
            showMessage('success', `Opening balance (${selectedOpeningBalanceItem?.in_out}) updated successfully`);
            resetOpeningBalanceForm();
            fetchOpeningBalances();
            dispatch(resetOpeningBalanceStatus());
        }
        if (deleteOpeningBalanceSuccess) {
            showMessage('success', 'Opening balance deleted successfully');
            fetchOpeningBalances();
            dispatch(resetOpeningBalanceStatus());
        }
        if (openingError) {
            showMessage('error', openingError);
            dispatch(resetOpeningBalanceStatus());
        }
    }, [createOpeningBalanceSuccess, updateOpeningBalanceSuccess, deleteOpeningBalanceSuccess, openingError]);

    // Handle expense success/error
    useEffect(() => {
        if (createExpenseSuccess) {
            showMessage('success', 'Expense created successfully');
            resetExpenseForm();
            fetchExpenses();
            dispatch(resetExpenseStatus());
        }
        if (updateExpenseSuccess) {
            showMessage('success', 'Expense updated successfully');
            resetExpenseForm();
            fetchExpenses();
            dispatch(resetExpenseStatus());
        }
        if (deleteExpenseSuccess) {
            showMessage('success', 'Expense deleted successfully');
            fetchExpenses();
            dispatch(resetExpenseStatus());
        }
        if (expenseError) {
            showMessage('error', expenseError);
            dispatch(resetExpenseStatus());
        }
    }, [createExpenseSuccess, updateExpenseSuccess, deleteExpenseSuccess, expenseError]);

    // Handle payment success/error
    useEffect(() => {
        if (createPaymentSuccess) {
            showMessage('success', 'Payment added successfully');
            resetPaymentForm();
            fetchExpenses();
            dispatch(resetExpensePaymentStatus());
        }
        if (deletePaymentSuccess) {
            showMessage('success', 'Payment deleted successfully');
            fetchExpenses();
            dispatch(resetExpensePaymentStatus());
        }
        if (paymentError) {
            showMessage('error', paymentError);
            dispatch(resetExpensePaymentStatus());
        }
    }, [createPaymentSuccess, deletePaymentSuccess, paymentError]);

    // Handle extra income success/error
    useEffect(() => {
        if (createExtraIncomeSuccess) {
            showMessage('success', 'Extra income created successfully');
            resetExtraIncomeForm();
            fetchExtraIncomes();
            dispatch(resetExtraIncomeStatus());
        }
        if (updateExtraIncomeSuccess) {
            showMessage('success', 'Extra income updated successfully');
            resetExtraIncomeForm();
            fetchExtraIncomes();
            dispatch(resetExtraIncomeStatus());
        }
        if (deleteExtraIncomeSuccess) {
            showMessage('success', 'Extra income deleted successfully');
            fetchExtraIncomes();
            dispatch(resetExtraIncomeStatus());
        }
        if (extraIncomeError) {
            showMessage('error', extraIncomeError);
            dispatch(resetExtraIncomeStatus());
        }
    }, [createExtraIncomeSuccess, updateExtraIncomeSuccess, deleteExtraIncomeSuccess, extraIncomeError]);

    // Transform office centers for select options
    const officeCenterOptions = (officeCentersData || []).map(center => ({
        value: center?.id || '',
        label: center?.officeCentersName || center?.office_center_name || 'Unknown'
    }));

    // Transform expense types for select options
    const expenseTypeOptions = (expenceTypeData || []).map(type => ({
        value: type?.expenceTypeId || '',
        label: type?.expenceTypeName || 'Unknown'
    }));

    // Filter options for expense types
    const filterExpenseTypeOptions = [
        { value: '', label: 'All Types' },
        ...(expenceTypeData || []).map(type => ({
            value: type?.expenceTypeId || '',
            label: type?.expenceTypeName || 'Unknown'
        }))
    ];

    const filterStatusOptions = [
        { value: '', label: 'All Status' },
        { value: 'true', label: 'Paid' },
        { value: 'false', label: 'Unpaid' },
    ];

    const incomeTypeOptions = [
        { value: '', label: 'All Types' },
        { value: 'cash', label: 'Cash' },
        { value: 'upi', label: 'UPI' },
    ];

    // API Calls
    const fetchOfficeCenters = () => {
        dispatch(getOfficeCenters({}));
    };

    const fetchOpeningBalances = () => {
        if (!selectedOfficeCenter?.value) return;
        
        const params = {
            date: formatInputDate(selectedDate),
            officeCenterId: selectedOfficeCenter?.value,
        };
        dispatch(getOpeningBalance(params));
    };

    const fetchExpenses = () => {
        if (!selectedOfficeCenter?.value) return;
        
        const params = {
            startDate: formatInputDate(selectedDate),
            endDate: formatInputDate(selectedDate),
            officeCenterId: selectedOfficeCenter?.value,
            ...(filters.expenseTypeId && { expenseTypeId: filters.expenseTypeId }),
            ...(filters.isPaid !== null && { isPaid: filters.isPaid }),
        };
        dispatch(getExpense(params));
    };

    const fetchExtraIncomes = () => {
        if (!selectedOfficeCenter?.value) return;
        
        const params = {
            startDate: formatInputDate(selectedDate),
            endDate: formatInputDate(selectedDate),
            officeCenterId: selectedOfficeCenter?.value,
            ...(extraIncomeFilters.incomeType && { incomeType: extraIncomeFilters.incomeType }),
        };
        dispatch(getExtraIncome(params));
    };

    // Set opening balances from API
    useEffect(() => {
        if (openingBalanceData && openingBalanceData.length > 0) {
            setOpeningBalances(openingBalanceData);
        } else {
            setOpeningBalances([]);
        }
    }, [openingBalanceData]);

    // Set expenses from API
    useEffect(() => {
        if (expenseData) {
            if (expenseData.data && Array.isArray(expenseData.data)) {
                setExpenses(expenseData.data);
            } 
            else if (Array.isArray(expenseData)) {
                setExpenses(expenseData);
            }
            else if (expenseData.data && expenseData.data.data && Array.isArray(expenseData.data.data)) {
                setExpenses(expenseData.data.data);
            }
            else {
                setExpenses([]);
            }
        } else {
            setExpenses([]);
        }
    }, [expenseData]);

    // Set extra incomes from API
    useEffect(() => {
        if (extraIncomeData) {
            if (extraIncomeData.data && Array.isArray(extraIncomeData.data)) {
                setExtraIncomes(extraIncomeData.data);
            } 
            else if (Array.isArray(extraIncomeData)) {
                setExtraIncomes(extraIncomeData);
            }
            else if (extraIncomeData.data && extraIncomeData.data.data && Array.isArray(extraIncomeData.data.data)) {
                setExtraIncomes(extraIncomeData.data.data);
            }
            else {
                setExtraIncomes([]);
            }
        } else {
            setExtraIncomes([]);
        }
    }, [extraIncomeData]);

    // Filter expenses when filters change
    useEffect(() => {
        if (expenseData) {
            let sourceData = [];
            
            if (expenseData.data && Array.isArray(expenseData.data)) {
                sourceData = expenseData.data;
            } else if (Array.isArray(expenseData)) {
                sourceData = expenseData;
            } else if (expenseData.data && expenseData.data.data && Array.isArray(expenseData.data.data)) {
                sourceData = expenseData.data.data;
            }

            if (sourceData.length > 0) {
                let filtered = [...sourceData];
                
                if (filters.expenseTypeId) {
                    filtered = filtered.filter(e => e.expenseType?.expence_type_id === filters.expenseTypeId);
                }
                
                if (filters.isPaid !== null) {
                    filtered = filtered.filter(e => e.is_paid === filters.isPaid);
                }
                
                setExpenses(filtered);
            }
        }
    }, [filters, expenseData]);

    // Calculate totals for expenses
    const calculateTotalExpenses = () => {
        return (expenses || []).reduce((sum, expense) => sum + parseFloat(expense?.amount || 0), 0);
    };

    const calculateTotalPaid = () => {
        return (expenses || []).reduce((sum, expense) => sum + parseFloat(expense?.paid_amount || 0), 0);
    };

    const calculateTotalOpeningBalance = () => {
        return (openingBalances || []).reduce((sum, balance) => {
            const amount = parseFloat(balance?.opening_balance || 0);
            return balance?.in_out === 'IN' ? sum + amount : sum - amount;
        }, 0);
    };

    const calculateNetBalance = () => {
        return calculateTotalOpeningBalance() - calculateTotalPaid();
    };

    // Calculate total extra income
    const calculateTotalExtraIncome = () => {
        return (extraIncomes || []).reduce((sum, income) => sum + parseFloat(income?.amount || 0), 0);
    };

    // Get opening balance by type
    const getOpeningBalanceByType = (type) => {
        return (openingBalances || []).find(balance => balance.in_out === type);
    };

    // Handle office center change
    const handleOfficeCenterChange = (option) => {
        setSelectedOfficeCenter(option);
    };

    // Filter handlers for expenses
    const handleFilterChange = (selectedOption, { name }) => {
        setFilterState(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleFilterApply = () => {
        const apiFilters = {};
        Object.keys(filterState).forEach(key => {
            if (filterState[key] !== '') {
                if (key === 'isPaid') {
                    apiFilters[key] = filterState[key] === 'true';
                } else {
                    apiFilters[key] = filterState[key];
                }
            }
        });
        
        dispatch(setExpenseFilters(apiFilters));
        setFilters(apiFilters);
        setShowFilter(false);
    };

    const handleFilterClear = () => {
        setFilterState({
            expenseTypeId: '',
            isPaid: '',
        });
        dispatch(clearExpenseFilters());
        setFilters({
            expenseTypeId: null,
            isPaid: null,
        });
        setShowFilter(false);
        fetchExpenses();
    };

    // Filter handlers for extra income
    const handleExtraIncomeFilterChange = (selectedOption, { name }) => {
        setExtraIncomeFilterState(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
    };

    const handleExtraIncomeFilterApply = () => {
        const apiFilters = {};
        Object.keys(extraIncomeFilterState).forEach(key => {
            if (extraIncomeFilterState[key] !== '') {
                apiFilters[key] = extraIncomeFilterState[key];
            }
        });
        
        dispatch(setExtraIncomeFilters(apiFilters));
        setExtraIncomeFilters(apiFilters);
        setShowExtraIncomeFilter(false);
        fetchExtraIncomes();
    };

    const handleExtraIncomeFilterClear = () => {
        setExtraIncomeFilterState({
            incomeType: '',
        });
        dispatch(clearExtraIncomeFilters());
        setExtraIncomeFilters({
            incomeType: null,
        });
        setShowExtraIncomeFilter(false);
        fetchExtraIncomes();
    };

    // Get selected value for React Select
    const getSelectedValue = (options, value) => {
        if (value === undefined || value === null || value === '') return null;
        return options.find(option => option.value === value.toString()) || null;
    };

    // Opening Balance Form Handlers
    const resetOpeningBalanceForm = () => {
        setOpeningBalanceForm({
            date: '',
            officeCenterId: '',
            inOut: 'IN',
            openingBalance: '',
            notes: ''
        });
        setOpeningBalanceErrors({});
        setIsEditOpeningBalance(false);
        setSelectedOpeningBalanceItem(null);
        setShowOpeningBalanceForm(false);
    };

    const openAddOpeningBalanceForm = (type = 'IN') => {
        if (!canCreate) {
            showMessage('warning', 'You do not have permission to create opening balance');
            return;
        }
        setOpeningBalanceType(type);
        setOpeningBalanceForm({
            date: formatInputDate(selectedDate),
            officeCenterId: selectedOfficeCenter?.value || '',
            inOut: type,
            openingBalance: '',
            notes: ''
        });
        setIsEditOpeningBalance(false);
        setSelectedOpeningBalanceItem(null);
        setShowOpeningBalanceForm(true);
    };

    const openEditOpeningBalanceForm = (item) => {
        if (!canEdit) {
            showMessage('warning', 'You do not have permission to edit opening balance');
            return;
        }
        setOpeningBalanceType(item?.in_out || 'IN');
        setOpeningBalanceForm({
            date: item?.date || '',
            officeCenterId: item?.office_center_id || '',
            inOut: item?.in_out || 'IN',
            openingBalance: item?.opening_balance || '',
            notes: item?.notes || '',
        });
        setIsEditOpeningBalance(true);
        setSelectedOpeningBalanceItem(item);
        setShowOpeningBalanceForm(true);
    };

    const handleOpeningBalanceInputChange = (e) => {
        const { name, value } = e.target;
        setOpeningBalanceForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (openingBalanceErrors[name]) {
            setOpeningBalanceErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateOpeningBalanceForm = () => {
        const errors = {};
        if (!openingBalanceForm.date) errors.date = 'Date is required';
        if (!openingBalanceForm.openingBalance) errors.openingBalance = 'Opening balance is required';
        else if (parseFloat(openingBalanceForm.openingBalance) < 0) errors.openingBalance = 'Opening balance cannot be negative';
        
        setOpeningBalanceErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpeningBalanceSubmit = (e) => {
        e.preventDefault();
        if (!validateOpeningBalanceForm()) return;

        const requestData = {
            date: openingBalanceForm.date,
            officeCenterId: selectedOfficeCenter?.value || openingBalanceForm.officeCenterId,
            inOut: openingBalanceForm.inOut,
            openingBalance: parseFloat(openingBalanceForm.openingBalance),
            notes: openingBalanceForm.notes,
        };

        if (isEditOpeningBalance && selectedOpeningBalanceItem?.opening_balance_id) {
            dispatch(updateOpeningBalance({
                request: requestData,
                openingBalanceId: selectedOpeningBalanceItem.opening_balance_id
            }));
        } else {
            dispatch(createOpeningBalance(requestData));
        }
    };

    const handleDeleteOpeningBalance = (item) => {
        if (!canDelete) {
            showMessage('warning', 'You do not have permission to delete opening balance');
            return;
        }
        if (!item?.opening_balance_id) return;
        
        showMessage(
            'warning',
            `Are you sure you want to delete this ${item.in_out === 'IN' ? 'IN' : 'OUT'} opening balance?`,
            () => {
                dispatch(deleteOpeningBalance(item.opening_balance_id));
            },
            'Yes, delete it'
        );
    };

    // Expense Form Handlers
    const resetExpenseForm = () => {
        setExpenseForm({
            expenseTypeId: '',
            amount: '',
            description: '',
            hasPayment: false,
            payment: {
                paymentDate: '',
                amount: '',
                paymentType: 'cash',
                notes: ''
            }
        });
        setExpenseErrors({});
        setShowExpenseForm(false);
    };

    const openAddExpenseForm = () => {
        if (!canCreate) {
            showMessage('warning', 'You do not have permission to create expenses');
            return;
        }
        setExpenseForm({
            expenseTypeId: '',
            amount: '',
            description: '',
            hasPayment: false,
            payment: {
                paymentDate: formatInputDate(selectedDate),
                amount: '',
                paymentType: 'cash',
                notes: ''
            }
        });
        setShowExpenseForm(true);
    };

    const handleExpenseInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('payment.')) {
            const paymentField = name.split('.')[1];
            setExpenseForm(prev => ({
                ...prev,
                payment: {
                    ...prev.payment,
                    [paymentField]: value
                }
            }));
        } else {
            setExpenseForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
        if (expenseErrors[name]) {
            setExpenseErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleExpenseTypeChange = (option) => {
        setExpenseForm(prev => ({
            ...prev,
            expenseTypeId: option?.value || ''
        }));
        if (expenseErrors.expenseTypeId) {
            setExpenseErrors(prev => ({ ...prev, expenseTypeId: null }));
        }
    };

    const validateExpenseForm = () => {
        const errors = {};
        if (!expenseForm.expenseTypeId) errors.expenseTypeId = 'Expense type is required';
        if (!expenseForm.amount) errors.amount = 'Amount is required';
        else if (parseFloat(expenseForm.amount) <= 0) errors.amount = 'Amount must be greater than 0';
        
        setExpenseErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        if (!validateExpenseForm()) return;

        const requestData = {
            expenseDate: formatInputDate(selectedDate),
            expenseTypeId: expenseForm.expenseTypeId,
            officeCenterId: selectedOfficeCenter?.value,
            amount: parseFloat(expenseForm.amount),
            description: expenseForm.description,
        };

        if (expenseForm.hasPayment && expenseForm.payment?.amount && parseFloat(expenseForm.payment.amount) > 0) {
            requestData.payment = {
                paymentDate: expenseForm.payment.paymentDate || formatInputDate(selectedDate),
                amount: parseFloat(expenseForm.payment.amount),
                paymentType: expenseForm.payment.paymentType || 'cash',
                notes: expenseForm.payment.notes || '',
            };
        }

        dispatch(createExpense(requestData));
    };

    const handleDeleteExpense = (expenseId) => {
        if (!canDelete) {
            showMessage('warning', 'You do not have permission to delete expenses');
            return;
        }
        if (!expenseId) return;
        
        showMessage(
            'warning',
            'Are you sure you want to delete this expense?',
            () => {
                dispatch(deleteExpense(expenseId));
            },
            'Yes, delete it'
        );
    };

    // Payment Form Handlers
    const resetPaymentForm = () => {
        setPaymentForm({
            expenseId: '',
            paymentDate: '',
            amount: '',
            paymentType: 'cash',
            notes: ''
        });
        setPaymentErrors({});
        setSelectedExpenseForPayment(null);
        setShowPaymentForm(false);
    };

    const openAddPaymentForm = (expense) => {
        if (!canPay) {
            showMessage('warning', 'You do not have permission to add payments');
            return;
        }
        if (!expense) return;
        
        setSelectedExpenseForPayment(expense);
        setPaymentForm({
            expenseId: expense.expense_id,
            paymentDate: formatInputDate(selectedDate),
            amount: '',
            paymentType: 'cash',
            notes: '',
        });
        setShowPaymentForm(true);
    };

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;
        
        if (name === 'amount' && selectedExpenseForPayment) {
            const maxAllowed = parseFloat(selectedExpenseForPayment.amount) - parseFloat(selectedExpenseForPayment.paid_amount);
            if (parseFloat(value) > maxAllowed) {
                processedValue = maxAllowed.toString();
            }
        }
        
        setPaymentForm(prev => ({
            ...prev,
            [name]: processedValue
        }));
        
        if (paymentErrors[name]) {
            setPaymentErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validatePaymentForm = () => {
        const errors = {};
        if (!paymentForm.paymentDate) errors.paymentDate = 'Payment date is required';
        if (!paymentForm.amount) errors.amount = 'Amount is required';
        else if (parseFloat(paymentForm.amount) <= 0) errors.amount = 'Amount must be greater than 0';
        else if (selectedExpenseForPayment) {
            const maxAllowed = parseFloat(selectedExpenseForPayment.amount) - parseFloat(selectedExpenseForPayment.paid_amount);
            if (parseFloat(paymentForm.amount) > maxAllowed) {
                errors.amount = `Payment amount cannot exceed ₹${maxAllowed.toLocaleString('en-IN')}`;
            }
        }
        
        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (!validatePaymentForm()) return;
        
        const requestData = {
            expenseId: paymentForm.expenseId,
            paymentDate: paymentForm.paymentDate,
            amount: parseFloat(paymentForm.amount),
            paymentType: paymentForm.paymentType,
            notes: paymentForm.notes,
        };

        dispatch(createExpensePayment(requestData));
    };

    // Extra Income Form Handlers
    const resetExtraIncomeForm = () => {
        setExtraIncomeForm({
            income_date: formatInputDate(selectedDate),
            amount: '',
            income_type: 'cash',
            description: ''
        });
        setExtraIncomeErrors({});
        setIsEditExtraIncome(false);
        setSelectedExtraIncomeItem(null);
        setShowExtraIncomeForm(false);
    };

    const openAddExtraIncomeForm = () => {
        if (!canCreate) {
            showMessage('warning', 'You do not have permission to create extra income');
            return;
        }
        setExtraIncomeForm({
            income_date: formatInputDate(selectedDate),
            amount: '',
            income_type: 'cash',
            description: ''
        });
        setIsEditExtraIncome(false);
        setSelectedExtraIncomeItem(null);
        setShowExtraIncomeForm(true);
    };

    const openEditExtraIncomeForm = (item) => {
        if (!canEdit) {
            showMessage('warning', 'You do not have permission to edit extra income');
            return;
        }
        setExtraIncomeForm({
            income_date: item?.income_date || '',
            amount: item?.amount || '',
            income_type: item?.income_type || 'cash',
            description: item?.description || '',
        });
        setIsEditExtraIncome(true);
        setSelectedExtraIncomeItem(item);
        setShowExtraIncomeForm(true);
    };

    const handleExtraIncomeInputChange = (e) => {
        const { name, value } = e.target;
        setExtraIncomeForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (extraIncomeErrors[name]) {
            setExtraIncomeErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleIncomeTypeChange = (option) => {
        setExtraIncomeForm(prev => ({
            ...prev,
            income_type: option?.value || 'cash'
        }));
    };

    const validateExtraIncomeForm = () => {
        const errors = {};
        if (!extraIncomeForm.income_date) errors.income_date = 'Income date is required';
        if (!extraIncomeForm.amount) errors.amount = 'Amount is required';
        else if (parseFloat(extraIncomeForm.amount) <= 0) errors.amount = 'Amount must be greater than 0';
        if (!extraIncomeForm.income_type) errors.income_type = 'Income type is required';
        
        setExtraIncomeErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleExtraIncomeSubmit = (e) => {
        e.preventDefault();
        if (!validateExtraIncomeForm()) return;

        const requestData = {
            income_date: extraIncomeForm.income_date,
            officeCenterId: selectedOfficeCenter?.value,
            amount: parseFloat(extraIncomeForm.amount),
            incomeType: extraIncomeForm.income_type,
            description: extraIncomeForm.description,
        };

        if (isEditExtraIncome && selectedExtraIncomeItem?.extra_income_id) {
            dispatch(updateExtraIncome({
                request: requestData,
                extraIncomeId: selectedExtraIncomeItem.extra_income_id
            }));
        } else {
            dispatch(createExtraIncome(requestData));
        }
    };

    const handleDeleteExtraIncome = (item) => {
        if (!canDelete) {
            showMessage('warning', 'You do not have permission to delete extra income');
            return;
        }
        if (!item?.extra_income_id) return;
        
        showMessage(
            'warning',
            'Are you sure you want to delete this extra income record?',
            () => {
                dispatch(deleteExtraIncome(item.extra_income_id));
            },
            'Yes, delete it'
        );
    };

    // Table Columns for Opening Balance
    const openingBalanceColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Date',
            accessor: 'date',
            sort: true,
            Cell: ({ value }) => (
                <div className="font-medium">{value ? new Date(value).toLocaleDateString('en-IN') : '-'}</div>
            ),
        },
        {
            Header: 'Type',
            accessor: 'in_out',
            sort: true,
            Cell: ({ value }) => (
                <div className={`font-semibold ${value === 'IN' ? 'text-success' : 'text-danger'}`}>
                    {value === 'IN' ? 'Cash In' : 'Cash Out'}
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'opening_balance',
            sort: true,
            Cell: ({ value, row }) => {
                const amount = parseFloat(value || 0);
                const type = row.original.in_out;
                return (
                    <div className={`font-bold text-lg ${type === 'IN' ? 'text-success' : 'text-danger'}`}>
                        {type === 'OUT' ? '- ' : ''}₹{amount.toLocaleString('en-IN')}
                    </div>
                );
            },
        },
        {
            Header: 'Notes',
            accessor: 'notes',
            Cell: ({ value }) => <div className="text-gray-600">{value || '-'}</div>,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    {canEdit && (
                        <Tippy content="Edit">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => openEditOpeningBalanceForm(row.original)}
                            >
                                <IconEdit className="w-4 h-4" />
                            </button>
                        </Tippy>
                    )}
                    {canDelete && (
                        <Tippy content="Delete">
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteOpeningBalance(row.original)}
                            >
                                <IconTrashLines className="w-4 h-4" />
                            </button>
                        </Tippy>
                    )}
                </div>
            ),
            width: 120,
        },
    ];

    // Table Columns for Expenses
    const expenseColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Expense Type',
            accessor: 'expenseType',
            sort: true,
            Cell: ({ row }) => (
                <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {row.original.expenseType?.expence_type_name || '-'}
                </div>
            ),
        },
        {
            Header: 'Description',
            accessor: 'description',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-gray-600 dark:text-gray-400">{value || '-'}</div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-warning font-bold text-lg">₹{parseFloat(value || 0).toLocaleString('en-IN')}</div>
            ),
        },
        {
            Header: 'Paid',
            accessor: 'paid_amount',
            Cell: ({ value }) => (
                <div className="text-success font-medium">₹{parseFloat(value || 0).toLocaleString('en-IN')}</div>
            ),
        },
        {
            Header: 'Balance',
            accessor: 'balance',
            Cell: ({ row }) => {
                const balance = parseFloat(row.original.amount || 0) - parseFloat(row.original.paid_amount || 0);
                return (
                    <div className={`font-medium ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                        ₹{balance.toLocaleString('en-IN')}
                    </div>
                );
            },
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                const expense = row.original;
                return (
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${expense.is_paid ? 'bg-success' : 'bg-danger'}`}></div>
                        <span className={`font-medium ${expense.is_paid ? 'text-success' : 'text-danger'}`}>
                            {expense.is_paid ? 'Paid' : 'Unpaid'}
                        </span>
                    </div>
                );
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const expense = row.original;
                const balance = parseFloat(expense.amount || 0) - parseFloat(expense.paid_amount || 0);
                
                return (
                    <div className="flex items-center space-x-2">
                        {balance > 0 && canPay && (
                            <Tippy content="Add Payment">
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openAddPaymentForm(expense)}
                                >
                                    <IconDollarSign className="w-4 h-4" />
                                    <span className="ml-1">Pay</span>
                                </button>
                            </Tippy>
                        )}
                        
                        {canDelete && (
                            <Tippy content="Delete">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteExpense(expense.expense_id)}
                                >
                                    <IconTrashLines className="w-4 h-4" />
                                </button>
                            </Tippy>
                        )}
                        
                        {!canPay && !canDelete && (
                            <span className="text-xs text-gray-400 italic">No actions</span>
                        )}
                    </div>
                );
            },
            width: 150,
        },
    ];

    // Table Columns for Extra Income
    const extraIncomeColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Date',
            accessor: 'income_date',
            sort: true,
            Cell: ({ value }) => (
                <div className="font-medium">{value ? new Date(value).toLocaleDateString('en-IN') : '-'}</div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-success font-bold text-lg">
                    ₹{parseFloat(value || 0).toLocaleString('en-IN')}
                </div>
            ),
        },
        {
            Header: 'Income Type',
            accessor: 'income_type',
            sort: true,
            Cell: ({ value }) => {
                const typeMap = {
                    'cash': '💵 Cash',
                    'upi': '📱 UPI',
                };
                return (
                    <div className="font-medium">
                        {typeMap[value] || value || '-'}
                    </div>
                );
            },
        },
        {
            Header: 'Description',
            accessor: 'description',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-gray-600 dark:text-gray-400">{value || '-'}</div>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    {canEdit && (
                        <Tippy content="Edit">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => openEditExtraIncomeForm(row.original)}
                            >
                                <IconEdit className="w-4 h-4" />
                            </button>
                        </Tippy>
                    )}
                    {canDelete && (
                        <Tippy content="Delete">
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteExtraIncome(row.original)}
                            >
                                <IconTrashLines className="w-4 h-4" />
                            </button>
                        </Tippy>
                    )}
                    {!canEdit && !canDelete && (
                        <span className="text-xs text-gray-400 italic">No actions</span>
                    )}
                </div>
            ),
            width: 150,
        },
    ];

    // Calculate totals by payment type
    const calculateTotalPaidByType = () => {
        const totals = {
            cash: 0,
            gpay: 0,
            other: 0
        };
        
        (expenses || []).forEach(expense => {
            if (expense.payments && Array.isArray(expense.payments)) {
                expense.payments.forEach(payment => {
                    const amount = parseFloat(payment.amount || 0);
                    const paymentType = payment.payment_type || 'cash';
                    if (totals[paymentType] !== undefined) {
                        totals[paymentType] += amount;
                    } else {
                        totals.other += amount;
                    }
                });
            }
        });
        
        return totals;
    };

    const paidByType = calculateTotalPaidByType();
    const totalPaidAmount = calculateTotalPaid();
    const totalExtraIncomeAmount = calculateTotalExtraIncome();
    const totalExpenseAmount = calculateTotalExpenses();

    // Pagination handlers for expenses
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

    const getPaginatedExtraIncomeData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        const startIndex = extraIncomeCurrentPage * extraIncomePageSize;
        const endIndex = startIndex + extraIncomePageSize;
        return data.slice(startIndex, endIndex);
    };

    const handleExtraIncomePaginationChange = (pageIndex, newPageSize) => {
        setExtraIncomeCurrentPage(pageIndex);
        setExtraIncomePageSize(newPageSize);
    };

    return (
        <div className="space-y-6">
            {/* Header with Office Center and Date Selector */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense & Income Calculation</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage opening balances, expenses, and extra income</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <IconBuilding className="w-5 h-5 text-primary" />
                        <Select
                            className="w-64"
                            placeholder="Select Office Center"
                            options={officeCenterOptions}
                            value={selectedOfficeCenter}
                            onChange={handleOfficeCenterChange}
                            isSearchable={true}
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderColor: '#e5e7eb',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderColor: '#ee9043',
                                    },
                                }),
                            }}
                        />
                    </div>
                    
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <IconCalendar className="w-5 h-5 text-primary mr-2" />
                        <div className="flex items-center">
                            <span className="text-gray-600 dark:text-gray-400 mr-2">Date:</span>
                            <input
                                type="date"
                                className="bg-transparent border-none focus:outline-none text-gray-800 dark:text-white font-medium"
                                value={formatInputDate(selectedDate)}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense Filter Panel */}
            {showFilter && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Filter Expenses
                        </h5>
                        <button
                            type="button"
                            onClick={() => setShowFilter(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>Expense Type</label>
                            <Select
                                name="expenseTypeId"
                                options={filterExpenseTypeOptions}
                                value={getSelectedValue(filterExpenseTypeOptions, filterState.expenseTypeId)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'expenseTypeId' })}
                                placeholder="All Types"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                        
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
                        <button
                            type="button"
                            onClick={handleFilterClear}
                            className="btn btn-outline-secondary"
                        >
                            Clear Filters
                        </button>
                        <button
                            type="button"
                            onClick={handleFilterApply}
                            className="btn btn-primary"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Extra Income Filter Panel */}
            {showExtraIncomeFilter && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Filter Extra Income
                        </h5>
                        <button
                            type="button"
                            onClick={() => setShowExtraIncomeFilter(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>Income Type</label>
                            <Select
                                name="incomeType"
                                options={incomeTypeOptions}
                                value={getSelectedValue(incomeTypeOptions, extraIncomeFilterState.incomeType)}
                                onChange={(selectedOption) => handleExtraIncomeFilterChange(selectedOption, { name: 'incomeType' })}
                                placeholder="All Types"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={handleExtraIncomeFilterClear}
                            className="btn btn-outline-secondary"
                        >
                            Clear Filters
                        </button>
                        <button
                            type="button"
                            onClick={handleExtraIncomeFilterApply}
                            className="btn btn-primary"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Opening Balance Form */}
            {showOpeningBalanceForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            {isEditOpeningBalance ? 'Edit Opening Balance' : `Add ${openingBalanceType === 'IN' ? 'Cash In' : 'Cash Out'} Opening Balance`}
                        </h5>
                        <button
                            type="button"
                            onClick={resetOpeningBalanceForm}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleOpeningBalanceSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    name="date"
                                    className={`form-input ${openingBalanceErrors.date ? 'border-danger' : ''}`}
                                    value={openingBalanceForm.date}
                                    onChange={handleOpeningBalanceInputChange}
                                    disabled={isEditOpeningBalance}
                                />
                                {openingBalanceErrors.date && (
                                    <div className="text-danger text-sm mt-1">{openingBalanceErrors.date}</div>
                                )}
                            </div>
                            
                            <div>
                                <label>Office Center</label>
                                <div className="form-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                                    {selectedOfficeCenter?.label || 'Select office center first'}
                                </div>
                            </div>

                            <div>
                                <label>Type</label>
                                {isEditOpeningBalance ? (
                                    <div className="form-input bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                                        {openingBalanceForm.inOut === 'IN' ? 'Cash In' : 'Cash Out'}
                                    </div>
                                ) : (
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="inOut"
                                                value="IN"
                                                checked={openingBalanceForm.inOut === 'IN'}
                                                onChange={(e) => setOpeningBalanceForm(prev => ({ ...prev, inOut: e.target.value }))}
                                                className="form-radio h-4 w-4 text-primary"
                                            />
                                            <span className="ml-2 text-success">Cash In</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="inOut"
                                                value="OUT"
                                                checked={openingBalanceForm.inOut === 'OUT'}
                                                onChange={(e) => setOpeningBalanceForm(prev => ({ ...prev, inOut: e.target.value }))}
                                                className="form-radio h-4 w-4 text-danger"
                                            />
                                            <span className="ml-2 text-danger">Cash Out</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label>{openingBalanceForm.inOut === 'IN' ? 'Cash In Amount' : 'Cash Out Amount'} (₹) <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    name="openingBalance"
                                    className={`form-input ${openingBalanceErrors.openingBalance ? 'border-danger' : ''}`}
                                    placeholder={`Enter ${openingBalanceForm.inOut === 'IN' ? 'cash in' : 'cash out'} amount`}
                                    value={openingBalanceForm.openingBalance}
                                    onChange={handleOpeningBalanceInputChange}
                                    min="0"
                                    step="0.01"
                                />
                                {openingBalanceErrors.openingBalance && (
                                    <div className="text-danger text-sm mt-1">{openingBalanceErrors.openingBalance}</div>
                                )}
                            </div>
                            
                            <div className="md:col-span-2">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    className="form-textarea"
                                    placeholder="Enter notes (optional)"
                                    rows="3"
                                    value={openingBalanceForm.notes}
                                    onChange={handleOpeningBalanceInputChange}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={resetOpeningBalanceForm}
                                className="btn btn-outline-secondary"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={openingLoading}
                            >
                                {openingLoading ? 'Processing...' : (isEditOpeningBalance ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Opening Balance Section */}
            <div className="panel border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 border-b">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                            <IconDollarSign className="w-5 h-5 mr-2 text-primary" />
                            Opening Balances - {selectedOfficeCenter?.label || 'Select Center'} ({selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN') : ''})
                        </h5>
                        {canCreate && (
                            <div className="flex space-x-2">
                                {!hasOpeningBalance('IN') && (
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={() => openAddOpeningBalanceForm('IN')}
                                        disabled={!selectedOfficeCenter}
                                    >
                                        <IconPlus className="w-4 h-4 mr-1" />
                                        Add Cash In
                                    </button>
                                )}
                                {!hasOpeningBalance('OUT') && (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => openAddOpeningBalanceForm('OUT')}
                                        disabled={!selectedOfficeCenter}
                                    >
                                        <IconPlus className="w-4 h-4 mr-1" />
                                        Add Cash Out
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex space-x-4 mt-2 text-sm">
                        {getOpeningBalanceByType('IN') && (
                            <div className="bg-success/10 text-success px-3 py-1 rounded-full">
                                Cash In: ₹{parseFloat(getOpeningBalanceByType('IN')?.opening_balance || 0).toLocaleString('en-IN')}
                            </div>
                        )}
                        {getOpeningBalanceByType('OUT') && (
                            <div className="bg-danger/10 text-danger px-3 py-1 rounded-full">
                                Cash Out: ₹{parseFloat(getOpeningBalanceByType('OUT')?.opening_balance || 0).toLocaleString('en-IN')}
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="p-4">
                    {openingBalances.length > 0 ? (
                        <Table
                            columns={openingBalanceColumns}
                            data={openingBalances}
                            pageSize={5}
                            pagination={true}
                            isSearchable={false}
                            isSortable={true}
                            loading={openingLoading}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {selectedOfficeCenter ? (
                                <>
                                    No opening balances found for {new Date(selectedDate).toLocaleDateString('en-IN')}.
                                    {canCreate && (
                                        <div className="mt-2 space-x-2">
                                            <button
                                                className="text-success ml-2 underline"
                                                onClick={() => openAddOpeningBalanceForm('IN')}
                                            >
                                                Add Cash In
                                            </button>
                                            <button
                                                className="text-danger ml-2 underline"
                                                onClick={() => openAddOpeningBalanceForm('OUT')}
                                            >
                                                Add Cash Out
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                'Please select an office center to view opening balances.'
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{totalExpenseAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <IconReceipt className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Net Opening Balance</div>
                            <div className={`text-xl font-bold ${calculateTotalOpeningBalance() >= 0 ? 'text-success' : 'text-danger'}`}>
                                ₹{calculateTotalOpeningBalance().toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <IconDollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Payment Breakdown</div>
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Total: ₹{totalPaidAmount.toLocaleString('en-IN')}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {paidByType.cash > 0 && (
                            <div className="flex items-center">
                                <span className="text-gray-600">💵 Cash</span>
                                <span className="ml-1 font-semibold">₹{paidByType.cash.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {paidByType.gpay > 0 && (
                            <div className="flex items-center">
                                <span className="text-gray-600">📱 GPay</span>
                                <span className="ml-1 font-semibold">₹{paidByType.gpay.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {totalPaidAmount === 0 && (
                            <span className="text-gray-400">No payments</span>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Extra Income</div>
                            <div className="text-xl font-bold text-success">
                                +₹{totalExtraIncomeAmount.toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <IconIncome className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">Net Balance</div>
                            <div className={`text-2xl font-bold ${(calculateTotalOpeningBalance() - totalPaidAmount + totalExtraIncomeAmount) >= 0 ? 'text-success' : 'text-danger'}`}>
                                ₹{(calculateTotalOpeningBalance() - totalPaidAmount + totalExtraIncomeAmount).toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-gray-400">
                                Opening - Paid + Income
                            </div>
                        </div>
                        <div className="p-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg">
                            <IconDollarSign className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expense Form */}
            {showExpenseForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Add Expense
                        </h5>
                        <button
                            type="button"
                            onClick={resetExpenseForm}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleExpenseSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>Expense Type <span className="text-danger">*</span></label>
                                <Select
                                    placeholder="Select Expense Type"
                                    options={expenseTypeOptions}
                                    value={expenseTypeOptions.find(opt => opt.value === expenseForm.expenseTypeId)}
                                    onChange={handleExpenseTypeChange}
                                    isSearchable={true}
                                    className={expenseErrors.expenseTypeId ? 'border-danger' : ''}
                                    isLoading={expenceTypeLoading}
                                />
                                {expenseErrors.expenseTypeId && (
                                    <div className="text-danger text-sm mt-1">{expenseErrors.expenseTypeId}</div>
                                )}
                            </div>
                            
                            <div>
                                <label>Amount (₹) <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    className={`form-input ${expenseErrors.amount ? 'border-danger' : ''}`}
                                    placeholder="Enter amount"
                                    value={expenseForm.amount}
                                    onChange={handleExpenseInputChange}
                                    min="0"
                                    step="0.01"
                                />
                                {expenseErrors.amount && (
                                    <div className="text-danger text-sm mt-1">{expenseErrors.amount}</div>
                                )}
                            </div>
                            
                            <div className="md:col-span-2">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Enter description"
                                    rows="2"
                                    value={expenseForm.description}
                                    onChange={handleExpenseInputChange}
                                />
                            </div>
                        </div>

                        {canPay && (
                            <div className="border-t pt-4 mt-4">
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Details</h6>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="flex items-center h-full">
                                        <input
                                            type="checkbox"
                                            id="hasPayment"
                                            className="form-checkbox h-4 w-4 text-primary"
                                            checked={expenseForm.hasPayment}
                                            onChange={(e) => setExpenseForm(prev => ({
                                                ...prev,
                                                hasPayment: e.target.checked,
                                                payment: {
                                                    ...prev.payment,
                                                    paymentDate: formatInputDate(selectedDate),
                                                }
                                            }))}
                                        />
                                        <label htmlFor="hasPayment" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            Add payment
                                        </label>
                                    </div>
                                    
                                    {expenseForm.hasPayment && (
                                        <>
                                            <div>
                                                <label>Payment Date</label>
                                                <input
                                                    type="date"
                                                    name="payment.paymentDate"
                                                    className="form-input"
                                                    value={expenseForm.payment.paymentDate}
                                                    onChange={handleExpenseInputChange}
                                                />
                                            </div>
                                            <div>
                                                <label>Payment Amount</label>
                                                <input
                                                    type="number"
                                                    name="payment.amount"
                                                    className="form-input"
                                                    placeholder="Enter amount"
                                                    value={expenseForm.payment.amount}
                                                    onChange={handleExpenseInputChange}
                                                    min="0"
                                                    step="0.01"
                                                    max={expenseForm.amount || 0}
                                                />
                                            </div>
                                            <div>
                                                <label>Payment Type</label>
                                                <select
                                                    name="payment.paymentType"
                                                    className="form-select"
                                                    value={expenseForm.payment.paymentType}
                                                    onChange={handleExpenseInputChange}
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="gpay">GPay</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={resetExpenseForm}
                                className="btn btn-outline-secondary"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={expenseLoading}
                            >
                                {expenseLoading ? 'Processing...' : 'Create Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Payment Form */}
            {showPaymentForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Add Payment
                        </h5>
                        <button
                            type="button"
                            onClick={resetPaymentForm}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handlePaymentSubmit}>
                        {selectedExpenseForPayment && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Expense Details</div>
                                <div className="flex justify-between">
                                    <span>Expense Type:</span>
                                    <span className="font-semibold">{selectedExpenseForPayment.expenseType?.expence_type_name || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Amount:</span>
                                    <span className="font-semibold">₹{parseFloat(selectedExpenseForPayment.amount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Paid Amount:</span>
                                    <span className="font-semibold text-success">₹{parseFloat(selectedExpenseForPayment.paid_amount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t mt-2">
                                    <span>Remaining:</span>
                                    <span className="font-semibold text-danger">
                                        ₹{(parseFloat(selectedExpenseForPayment.amount || 0) - parseFloat(selectedExpenseForPayment.paid_amount || 0)).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label>Payment Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    className={`form-input ${paymentErrors.paymentDate ? 'border-danger' : ''}`}
                                    value={paymentForm.paymentDate}
                                    onChange={handlePaymentInputChange}
                                />
                                {paymentErrors.paymentDate && (
                                    <div className="text-danger text-sm mt-1">{paymentErrors.paymentDate}</div>
                                )}
                            </div>

                            <div>
                                <label>Payment Amount (₹) <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    className={`form-input ${paymentErrors.amount ? 'border-danger' : ''}`}
                                    placeholder="Enter amount"
                                    value={paymentForm.amount}
                                    onChange={handlePaymentInputChange}
                                    min="0.01"
                                    step="0.01"
                                    max={selectedExpenseForPayment ? (parseFloat(selectedExpenseForPayment.amount) - parseFloat(selectedExpenseForPayment.paid_amount)) : undefined}
                                />
                                {paymentErrors.amount && (
                                    <div className="text-danger text-sm mt-1">{paymentErrors.amount}</div>
                                )}
                            </div>

                            <div>
                                <label>Payment Type <span className="text-danger">*</span></label>
                                <select
                                    name="paymentType"
                                    className="form-select"
                                    value={paymentForm.paymentType}
                                    onChange={handlePaymentInputChange}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gpay">GPay</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <div className="flex space-x-2 w-full">
                                    <button
                                        type="button"
                                        onClick={resetPaymentForm}
                                        className="btn btn-outline-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-1"
                                    >
                                        {expensePaymentReduxState.loading ? 'Processing...' : 'Add Payment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Expenses Table */}
            <div className="panel border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b flex justify-between items-center">
                    <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                        <IconReceipt className="w-5 h-5 mr-2 text-primary" />
                        Expense Records - {selectedOfficeCenter?.label || 'Select Center'} ({selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN') : ''})
                    </h5>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowFilter(!showFilter)}
                            className="btn btn-outline-primary"
                        >
                            <IconFilter className="ltr:mr-2 rtl:ml-2" />
                            Filter
                        </button>
                        
                        {canCreate && (
                            <button
                                type="button"
                                className="btn btn-success btn-sm"
                                onClick={openAddExpenseForm}
                            >
                                <IconPlus className="w-4 h-4 mr-1" />
                                Add Expense
                            </button>
                        )}
                    </div>
                </div>

                {(filters.expenseTypeId || filters.isPaid !== null) && (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium">Active Filters:</span>
                            {filters.expenseTypeId && (
                                <span className="badge bg-primary">
                                    Type: {expenseTypeOptions.find(t => t.value === filters.expenseTypeId)?.label || filters.expenseTypeId}
                                </span>
                            )}
                            {filters.isPaid !== null && (
                                <span className="badge bg-primary">
                                    Status: {filters.isPaid ? 'Paid' : 'Unpaid'}
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

                <div className="p-4">
                    {expenseLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table
                            columns={expenseColumns}
                            data={getPaginatedData(expenses)}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={expenses?.length || 0}
                            totalPages={Math.ceil((expenses?.length || 0) / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            pagination={true}
                            isSearchable={true}
                            isSortable={true}
                            loading={expenseLoading}
                        />
                    )}
                </div>
            </div>

            {/* Extra Income Section with Inline Form */}
            <div className="panel border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900 border-b">
                    <div className="flex justify-between items-center">
                        <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                            <IconIncome className="w-5 h-5 mr-2 text-success" />
                            Extra Income Records - {selectedOfficeCenter?.label || 'Select Center'} ({selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN') : ''})
                        </h5>
                        <div className="flex space-x-2">
                            {/* <button
                                type="button"
                                onClick={() => setShowExtraIncomeFilter(!showExtraIncomeFilter)}
                                className="btn btn-outline-primary"
                            >
                                <IconFilter className="ltr:mr-2 rtl:ml-2" />
                                Filter
                            </button> */}
                            
                            {canCreate && !showExtraIncomeForm && (
                                <button
                                    type="button"
                                    className="btn btn-success btn-sm"
                                    onClick={openAddExtraIncomeForm}
                                >
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Extra Income
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {(extraIncomeFilters.incomeType) && (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium">Active Filters:</span>
                            {extraIncomeFilters.incomeType && (
                                <span className="badge bg-primary">
                                    Type: {incomeTypeOptions.find(t => t.value === extraIncomeFilters.incomeType)?.label || extraIncomeFilters.incomeType}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleExtraIncomeFilterClear}
                                className="text-danger text-sm hover:underline ml-2"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}

                {/* Extra Income Inline Form */}
                {showExtraIncomeForm && (
                    <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="font-semibold text-md dark:text-white-light">
                                {isEditExtraIncome ? 'Edit Extra Income' : 'Add Extra Income'}
                            </h6>
                            <button
                                type="button"
                                onClick={resetExtraIncomeForm}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <IconX className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleExtraIncomeSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label>Income Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        name="income_date"
                                        className={`form-input ${extraIncomeErrors.income_date ? 'border-danger' : ''}`}
                                        value={extraIncomeForm.income_date}
                                        onChange={handleExtraIncomeInputChange}
                                    />
                                    {extraIncomeErrors.income_date && (
                                        <div className="text-danger text-sm mt-1">{extraIncomeErrors.income_date}</div>
                                    )}
                                </div>

                                <div>
                                    <label>Amount (₹) <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        name="amount"
                                        className={`form-input ${extraIncomeErrors.amount ? 'border-danger' : ''}`}
                                        placeholder="Enter amount"
                                        value={extraIncomeForm.amount}
                                        onChange={handleExtraIncomeInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                    {extraIncomeErrors.amount && (
                                        <div className="text-danger text-sm mt-1">{extraIncomeErrors.amount}</div>
                                    )}
                                </div>

                                <div>
                                    <label>Income Type <span className="text-danger">*</span></label>
                                    <Select
                                        placeholder="Select Income Type"
                                        options={incomeTypeOptions.filter(opt => opt.value !== '')}
                                        value={incomeTypeOptions.find(opt => opt.value === extraIncomeForm.income_type)}
                                        onChange={handleIncomeTypeChange}
                                        className={extraIncomeErrors.income_type ? 'border-danger' : ''}
                                    />
                                    {extraIncomeErrors.income_type && (
                                        <div className="text-danger text-sm mt-1">{extraIncomeErrors.income_type}</div>
                                    )}
                                </div>

                                <div>
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        className="form-input"
                                        placeholder="Enter description (optional)"
                                        value={extraIncomeForm.description}
                                        onChange={handleExtraIncomeInputChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={resetExtraIncomeForm}
                                    className="btn btn-outline-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={extraIncomeLoading}
                                >
                                    {extraIncomeLoading ? 'Processing...' : (isEditExtraIncome ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="p-4">
                    {extraIncomeLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : extraIncomes.length > 0 ? (
                        <Table
                            columns={extraIncomeColumns}
                            data={getPaginatedExtraIncomeData(extraIncomes)}
                            pageSize={extraIncomePageSize}
                            pageIndex={extraIncomeCurrentPage}
                            totalCount={extraIncomes?.length || 0}
                            totalPages={Math.ceil((extraIncomes?.length || 0) / extraIncomePageSize)}
                            onPaginationChange={handleExtraIncomePaginationChange}
                            pagination={true}
                            isSearchable={true}
                            isSortable={true}
                            loading={extraIncomeLoading}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {selectedOfficeCenter ? (
                                <>
                                    No extra income records found for {new Date(selectedDate).toLocaleDateString('en-IN')}.
                                    {canCreate && !showExtraIncomeForm && (
                                        <div className="mt-2">
                                            <button
                                                className="text-success ml-2 underline"
                                                onClick={openAddExtraIncomeForm}
                                            >
                                                Add Extra Income
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                'Please select an office center to view extra income records.'
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseCalculation;