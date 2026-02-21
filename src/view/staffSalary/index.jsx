import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import IconUsers from '../../components/Icon/IconUsers';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconMoney';
import IconWallet from '../../components/Icon/IconCashBanknotes';
import IconEye from '../../components/Icon/IconEye';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconPlus from '../../components/Icon/IconPlus';
import IconMinus from '../../components/Icon/IconMinus';
import ModelViewBox from '../../util/ModelViewBox';
import Tippy from '@tippyjs/react';

// Import Redux actions
import {
    calculateSalary,
    getEmployeeSalaryDetail,
    processSalaryPayment,
    createSalaryAdjustment,
    resetSalaryStatus
} from '../../redux/salarySlice';

const SalaryCalculation = () => {
    const dispatch = useDispatch();
    
    // Redux state
    const { 
        salaryCalculation,
        loading,
        calculateSalarySuccess,
        calculateSalaryFailed,
        processSalaryPaymentSuccess,
        processSalaryPaymentFailed,
        createSalaryAdjustmentSuccess,
        createSalaryAdjustmentFailed,
        error
    } = useSelector((state) => state.SalarySlice);

    // Format date to DD/MM/YYYY for display
    const formatDisplayDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format date to YYYY-MM-DD for input[type="date"]
    const formatInputDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format YYYY-MM from date
    const getYearMonth = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    // Get today's date
    const getTodayDate = () => {
        return new Date();
    };

    // States
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [employeeData, setEmployeeData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDeductionExtraModal, setShowDeductionExtraModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);

    // Form states
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: formatInputDate(new Date()),
        notes: '',
        paymentType: 'cash',
        officeCenterId: '1' // This should come from user context or selection
    });

    const [deductionExtraForm, setDeductionExtraForm] = useState({
        type: 'deduction',
        amount: '',
        reason: '',
        adjustmentDate: formatInputDate(new Date()),
        salaryMonth: getYearMonth(new Date())
    });

    // Fetch salary data on component mount and when date changes
    useEffect(() => {
        dispatch(setPageTitle('Salary Calculation'));
    }, []);

    useEffect(() => {
        fetchSalaryData();
    }, [selectedDate]);

    // Handle API response effects
    useEffect(() => {
        if (calculateSalarySuccess && salaryCalculation) {
            processSalaryData(salaryCalculation);
            showMessage('success', 'Salary data loaded successfully');
            dispatch(resetSalaryStatus());
        }
        if (calculateSalaryFailed) {
            showMessage('error', error || 'Failed to load salary data');
            dispatch(resetSalaryStatus());
        }
    }, [calculateSalarySuccess, calculateSalaryFailed, salaryCalculation]);

    useEffect(() => {
        if (processSalaryPaymentSuccess) {
            setShowPaymentModal(false);
            fetchSalaryData(); // Refresh data
            showMessage('success', 'Payment processed successfully');
            dispatch(resetSalaryStatus());
        }
        if (processSalaryPaymentFailed) {
            showMessage('error', error || 'Failed to process payment');
            dispatch(resetSalaryStatus());
        }
    }, [processSalaryPaymentSuccess, processSalaryPaymentFailed]);

    useEffect(() => {
        if (createSalaryAdjustmentSuccess) {
            setShowDeductionExtraModal(false);
            fetchSalaryData(); // Refresh data
            showMessage('success', `${deductionExtraForm.type} added successfully`);
            dispatch(resetSalaryStatus());
        }
        if (createSalaryAdjustmentFailed) {
            showMessage('error', error || `Failed to add ${deductionExtraForm.type}`);
            dispatch(resetSalaryStatus());
        }
    }, [createSalaryAdjustmentSuccess, createSalaryAdjustmentFailed]);

    // Process salary data from API
    const processSalaryData = (data) => {
        if (!data || !data.employees) return;

        // Process all employees into a single array
        const employees = data.employees.map(emp => ({
            id: emp.employeeId,
            name: emp.employeeName,
            totalSalary: emp.netSalary || 0,
            baseSalary: emp.baseSalary || 0,
            paidAmount: emp.paidAmount || 0,
            isPaid: emp.isPaid || false,
            remainingAmount: emp.remainingAmount || emp.netSalary || 0,
            totalDeductions: emp.totalDeductions || 0,
            totalExtras: emp.totalExtras || 0,
            deductions: emp.deductions || [],
            extras: emp.extras || [],
            salaryType: emp.salaryType,
            monthlyRate: emp.monthlyRate || 0,
            dailyRate: emp.dailyRate || 0,
            presentDays: emp.presentDays || 0,
            absentDays: emp.absentDays || 0,
            halfDays: emp.halfDays || 0,
            expenseId: emp.expenseId,
            // Add role information if available from employee data
            role: emp.role || (emp.salaryType === 'daily' ? 'Daily Worker' : 'Employee')
        }));

        setEmployeeData(employees);
    };

    // Fetch salary data from API
    const fetchSalaryData = async () => {
        const salaryMonth = getYearMonth(selectedDate);
        await dispatch(calculateSalary({ 
            salaryMonth,
            includeAdjustments: 'true'
        }));
    };

    // Handle date change
    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setSelectedDate(newDate);
    };

    // Calculate totals for employees
    const calculateTotals = (data) => {
        const totalSalary = data.reduce((sum, person) => sum + (person.totalSalary || 0), 0);
        const totalPaid = data.reduce((sum, person) => sum + (person.paidAmount || 0), 0);
        const totalDeductions = data.reduce((sum, person) => sum + (person.totalDeductions || 0), 0);
        const totalExtras = data.reduce((sum, person) => sum + (person.totalExtras || 0), 0);
        const totalRemaining = data.reduce((sum, person) => {
            if (!person.isPaid || (person.paidAmount || 0) < (person.totalSalary || 0)) {
                return sum + ((person.totalSalary || 0) - (person.paidAmount || 0));
            }
            return sum;
        }, 0);
        const fullyPaid = data.filter(person => (person.paidAmount || 0) >= (person.totalSalary || 0)).length;
        const partiallyPaid = data.filter(person => (person.paidAmount || 0) > 0 && (person.paidAmount || 0) < (person.totalSalary || 0)).length;
        const unpaid = data.filter(person => (person.paidAmount || 0) === 0).length;

        return {
            totalSalary,
            totalPaid,
            totalDeductions,
            totalExtras,
            totalRemaining,
            fullyPaid,
            partiallyPaid,
            unpaid,
            totalCount: data.length
        };
    };

    const totals = calculateTotals(employeeData);

    // View details
    const viewDetails = async (person) => {
        setSelectedPerson(person);
        
        // Fetch detailed salary info
        const salaryMonth = getYearMonth(selectedDate);
        const result = await dispatch(getEmployeeSalaryDetail({ 
            employeeId: person.id, 
            salaryMonth 
        }));
        
        if (result.payload?.data) {
            setSelectedPerson({
                ...person,
                ...result.payload.data
            });
        }
        
        setShowDetailsModal(true);
    };

    // Open deduction/extra modal
    const openDeductionExtraModal = (person, type = 'deduction') => {
        setSelectedPerson(person);
        setDeductionExtraForm({
            type: type,
            amount: '',
            reason: '',
            adjustmentDate: formatInputDate(new Date()),
            salaryMonth: getYearMonth(selectedDate)
        });
        setShowDeductionExtraModal(true);
    };

    // Handle deduction/extra form change
    const handleDeductionExtraFormChange = (e) => {
        const { name, value } = e.target;
        setDeductionExtraForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add deduction or extra
    const addDeductionExtra = () => {
        if (!deductionExtraForm.amount || !deductionExtraForm.reason) {
            showMessage('error', `Please enter amount and reason for ${deductionExtraForm.type}`);
            return;
        }

        const amount = parseFloat(deductionExtraForm.amount);
        if (isNaN(amount) || amount <= 0) {
            showMessage('error', 'Please enter a valid amount');
            return;
        }

        const adjustmentData = {
            employeeId: selectedPerson.id,
            type: deductionExtraForm.type,
            amount: amount,
            reason: deductionExtraForm.reason,
            adjustmentDate: deductionExtraForm.adjustmentDate,
            salaryMonth: deductionExtraForm.salaryMonth
        };

        dispatch(createSalaryAdjustment(adjustmentData));
    };

    // Open payment modal
    const openPaymentModal = (person) => {
        setSelectedPerson(person);
        setPaymentForm({
            amount: '',
            paymentDate: formatInputDate(new Date()),
            notes: '',
            paymentType: 'cash',
            officeCenterId: '1' // This should come from user context
        });
        setShowPaymentModal(true);
    };

    // Handle payment form change
    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Process payment
    const processPayment = () => {
        if (!paymentForm.amount || isNaN(paymentForm.amount) || parseFloat(paymentForm.amount) <= 0) {
            showMessage('error', 'Please enter a valid payment amount');
            return;
        }

        const paymentAmount = parseFloat(paymentForm.amount);
        const remaining = (selectedPerson.totalSalary || 0) - (selectedPerson.paidAmount || 0);

        if (paymentAmount > remaining) {
            showMessage('error', `Payment amount cannot exceed remaining balance of ₹${remaining.toLocaleString('en-IN')}`);
            return;
        }

        // Show warning before processing payment
        showMessage('warning', `Are you sure you want to process payment of ₹${paymentAmount.toLocaleString('en-IN')} to ${selectedPerson.name}?`, () => {
            const paymentData = {
                employeeId: selectedPerson.id,
                salaryMonth: getYearMonth(selectedDate),
                amount: paymentAmount,
                paymentDate: paymentForm.paymentDate,
                officeCenterId: paymentForm.officeCenterId,
                paymentType: paymentForm.paymentType,
                notes: paymentForm.notes || `Salary payment for ${getYearMonth(selectedDate)}`
            };

            dispatch(processSalaryPayment(paymentData));
        });
    };

    // Mark as fully paid
    const markAsFullyPaid = (person) => {
        const remaining = (person.totalSalary || 0) - (person.paidAmount || 0);
        
        showMessage('warning', `Mark ${person.name} as fully paid with remaining amount of ₹${remaining.toLocaleString('en-IN')}?`, () => {
            const paymentData = {
                employeeId: person.id,
                salaryMonth: getYearMonth(selectedDate),
                amount: remaining,
                paymentDate: formatInputDate(new Date()),
                officeCenterId: '1', // This should come from user context
                paymentType: 'cash',
                notes: 'Full settlement'
            };

            dispatch(processSalaryPayment(paymentData));
        });
    };

    // Get columns for the table
    const getColumns = () => {
        return [
            {
                Header: 'S.No',
                accessor: 'id',
                Cell: ({ row }) => <div>{row.index + 1}</div>,
                width: 80,
            },
            {
                Header: 'Employee Name',
                accessor: 'name',
                sort: true,
                Cell: ({ value }) => (
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{value || ''}</div>
                ),
            },
            {
                Header: 'Salary Type',
                accessor: 'salaryType',
                sort: true,
                Cell: ({ value }) => (
                    <div className="capitalize">{value || 'N/A'}</div>
                ),
            },
            {
                Header: 'Rate',
                accessor: 'rate',
                sort: true,
                Cell: ({ row }) => {
                    const person = row.original;
                    const rate = person.salaryType === 'monthly' ? person.monthlyRate : person.dailyRate;
                    return (
                        <div className="text-primary font-medium">
                            ₹{(rate || 0).toLocaleString('en-IN')}
                            <span className="text-xs text-gray-500 ml-1">
                                {person.salaryType === 'monthly' ? '/month' : '/day'}
                            </span>
                        </div>
                    );
                },
            },
            {
                Header: 'Attendance',
                accessor: 'attendance',
                Cell: ({ row }) => {
                    const person = row.original;
                    return (
                        <div>
                            <div>Present: {person.presentDays || 0}</div>
                            {(person.absentDays > 0 || person.halfDays > 0) && (
                                <div className="text-xs text-gray-500">
                                    Absent: {person.absentDays || 0} | Half: {person.halfDays || 0}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'Base Salary',
                accessor: 'baseSalary',
                sort: true,
                Cell: ({ value }) => (
                    <div className="text-blue-600 font-medium">₹{(value || 0).toLocaleString('en-IN')}</div>
                ),
            },
            {
                Header: 'Adjustments',
                accessor: 'adjustments',
                Cell: ({ row }) => {
                    const person = row.original;
                    return (
                        <div>
                            {person.totalDeductions > 0 && (
                                <div className="text-danger">-₹{person.totalDeductions.toLocaleString('en-IN')}</div>
                            )}
                            {person.totalExtras > 0 && (
                                <div className="text-success">+₹{person.totalExtras.toLocaleString('en-IN')}</div>
                            )}
                            {person.totalDeductions === 0 && person.totalExtras === 0 && (
                                <div className="text-gray-400">No adjustments</div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'Net Salary',
                accessor: 'totalSalary',
                sort: true,
                Cell: ({ value }) => (
                    <div className="text-success font-bold text-lg">₹{(value || 0).toLocaleString('en-IN')}</div>
                ),
            },
            {
                Header: 'Paid Amount',
                accessor: 'paidAmount',
                sort: true,
                Cell: ({ value, row }) => {
                    const remaining = (row.original.totalSalary || 0) - (value || 0);
                    return (
                        <div>
                            <div className={`font-bold ${value > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                ₹{(value || 0).toLocaleString('en-IN')}
                            </div>
                            {remaining > 0 && (
                                <div className="text-xs text-red-600">₹{remaining.toLocaleString('en-IN')} remaining</div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ row }) => {
                    const person = row.original;
                    const isFullyPaid = (person.paidAmount || 0) >= (person.totalSalary || 0);
                    const hasPartialPayment = (person.paidAmount || 0) > 0 && !isFullyPaid;

                    return (
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isFullyPaid ? 'bg-success' : 'bg-danger'}`}></div>
                            <span className={`font-medium ${isFullyPaid ? 'text-success' : 'text-danger'}`}>
                                {isFullyPaid ? 'Paid' : hasPartialPayment ? 'Partial' : 'Unpaid'}
                            </span>
                        </div>
                    );
                },
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                Cell: ({ row }) => {
                    const person = row.original;
                    const remaining = (person.totalSalary || 0) - (person.paidAmount || 0);
                    const isFullyPaid = (person.paidAmount || 0) >= (person.totalSalary || 0);
                    const hasPartialPayment = (person.paidAmount || 0) > 0 && !isFullyPaid;

                    return (
                        <div className="flex items-center space-x-2">
                            <Tippy content="View Details">
                                <button
                                    type="button"
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => viewDetails(person)}
                                >
                                    <IconEye className="w-4 h-4" />
                                </button>
                            </Tippy>
                            <Tippy content="Add Deduction">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => openDeductionExtraModal(person, 'deduction')}
                                >
                                    <IconMinus className="w-4 h-4" />
                                </button>
                            </Tippy>
                            <Tippy content="Add Extra">
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openDeductionExtraModal(person, 'extra')}
                                >
                                    <IconPlus className="w-4 h-4" />
                                </button>
                            </Tippy>
                            {!isFullyPaid && (
                                <Tippy content="Make Payment">
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={() => openPaymentModal(person)}
                                    >
                                        <IconWallet className="w-4 h-4" />
                                        <span className="ml-1">Pay</span>
                                    </button>
                                </Tippy>
                            )}
                            {hasPartialPayment && remaining > 0 && (
                                <Tippy content="Mark as Fully Paid">
                                    <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => markAsFullyPaid(person)}
                                    >
                                        <IconCheck className="w-4 h-4" />
                                        <span className="ml-1">Settle</span>
                                    </button>
                                </Tippy>
                            )}
                        </div>
                    );
                },
                width: 300,
            },
        ];
    };

    // Handle pagination
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return employeeData.slice(startIndex, endIndex);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Salary Calculation</h2>
                    <p className="text-gray-600 dark:text-gray-400">Calculate and process salary payments for all employees</p>
                </div>
                <div className="flex items-center">
                    {/* Date Picker */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
                        <IconCalendar className="w-5 h-5 text-primary mr-3" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Salary Month</div>
                            <div className="flex items-center space-x-3">
                                <div className="font-semibold text-lg text-gray-800 dark:text-white min-w-[120px]">
                                    {formatDisplayDate(selectedDate)}
                                </div>
                                <input
                                    type="date"
                                    className="form-input border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 rounded-md text-gray-800 dark:text-white"
                                    value={formatInputDate(selectedDate)}
                                    onChange={handleDateChange}
                                    title="Select month"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <IconUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Employees</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">{totals.totalCount}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {totals.fullyPaid} paid • {totals.partiallyPaid} partial • {totals.unpaid} unpaid
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <IconDollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Salary</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{(totals.totalSalary || 0).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                            <IconX className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Deductions</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{(totals.totalDeductions || 0).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mr-3">
                            <IconWallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{(totals.totalRemaining || 0).toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                                Paid: ₹{(totals.totalPaid || 0).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="datatables">
                    <Table
                        columns={getColumns()}
                        Title="Employee Salary Records"
                        data={getPaginatedData()}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={employeeData.length}
                        totalPages={Math.ceil(employeeData.length / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        pagination={true}
                        isSearchable={true}
                        isSortable={true}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Salary Details - ${selectedPerson?.name || ''}`}
                isEdit={false}
                setModel={() => setShowDetailsModal(false)}
                handleSubmit={() => setShowDetailsModal(false)}
                modelSize="lg"
                saveBtn={false}
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Basic Information</h6>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Name</span>
                                        <span className="font-semibold">{selectedPerson.name || ''}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Salary Type</span>
                                        <span className="font-semibold capitalize">{selectedPerson.salaryType || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Rate</span>
                                        <span className="font-semibold">
                                            ₹{(selectedPerson.salaryType === 'monthly' ? selectedPerson.monthlyRate : selectedPerson.dailyRate || 0).toLocaleString('en-IN')}
                                            {selectedPerson.salaryType === 'monthly' ? '/month' : '/day'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Present Days</span>
                                        <span className="font-semibold">{selectedPerson.presentDays || 0} days</span>
                                    </div>
                                    {selectedPerson.absentDays > 0 && (
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Absent Days</span>
                                            <span className="font-semibold text-danger">{selectedPerson.absentDays || 0} days</span>
                                        </div>
                                    )}
                                    {selectedPerson.halfDays > 0 && (
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Half Days</span>
                                            <span className="font-semibold text-warning">{selectedPerson.halfDays || 0} days</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                        <span className="text-gray-700 dark:text-gray-300">Base Salary</span>
                                        <span className="font-bold text-blue-600">
                                            ₹{(selectedPerson.baseSalary || 0).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Show Deductions */}
                                {selectedPerson.deductions && selectedPerson.deductions.length > 0 && (
                                    <>
                                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4 mt-6">Deductions</h6>
                                        <div className="space-y-2">
                                            {selectedPerson.deductions.map((deduction, index) => (
                                                <div key={deduction.id || index} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                    <div>
                                                        <div className="font-medium text-red-700 dark:text-red-400">{deduction.reason || ''}</div>
                                                        <div className="text-xs text-gray-500">{deduction.adjustment_date || deduction.date || ''}</div>
                                                    </div>
                                                    <div className="font-bold text-red-600"> - ₹{(deduction.amount || 0).toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                                                <span className="font-semibold">Total Deductions</span>
                                                <span className="font-bold text-red-700"> - ₹{(selectedPerson.totalDeductions || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Show Extras */}
                                {selectedPerson.extras && selectedPerson.extras.length > 0 && (
                                    <>
                                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4 mt-6">Extras</h6>
                                        <div className="space-y-2">
                                            {selectedPerson.extras.map((extra, index) => (
                                                <div key={extra.id || index} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                    <div>
                                                        <div className="font-medium text-green-700 dark:text-green-400">{extra.reason || ''}</div>
                                                        <div className="text-xs text-gray-500">{extra.adjustment_date || extra.date || ''}</div>
                                                    </div>
                                                    <div className="font-bold text-green-600"> + ₹{(extra.amount || 0).toLocaleString('en-IN')}</div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                                                <span className="font-semibold">Total Extras</span>
                                                <span className="font-bold text-green-700"> + ₹{(selectedPerson.totalExtras || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Summary</h6>
                                <div className="space-y-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Net Salary</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            ₹{(selectedPerson.totalSalary || 0).toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            Breakdown:
                                            <div className="mt-1 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Base Salary:</span>
                                                    <span>₹{(selectedPerson.baseSalary || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                                {(selectedPerson.totalDeductions || 0) > 0 && (
                                                    <div className="flex justify-between text-red-600">
                                                        <span>Deductions:</span>
                                                        <span>- ₹{(selectedPerson.totalDeductions || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                {(selectedPerson.totalExtras || 0) > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Extras:</span>
                                                        <span>+ ₹{(selectedPerson.totalExtras || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                                            <span className="font-bold text-green-600">
                                                ₹{(selectedPerson.paidAmount || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                                            <span className="font-bold text-red-600">
                                                ₹{((selectedPerson.totalSalary || 0) - (selectedPerson.paidAmount || 0)).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                                            <span className={`font-bold ${
                                                selectedPerson.isPaid 
                                                    ? 'text-success' 
                                                    : (selectedPerson.paidAmount || 0) > 0 
                                                        ? 'text-warning' 
                                                        : 'text-danger'
                                            }`}>
                                                {selectedPerson.isPaid 
                                                    ? 'Fully Paid' 
                                                    : (selectedPerson.paidAmount || 0) > 0 
                                                        ? 'Partially Paid' 
                                                        : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedPerson.expense && selectedPerson.expense.payments && selectedPerson.expense.payments.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Payment History</h6>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {selectedPerson.expense.payments.map((payment, index) => (
                                                    <div key={payment.expense_payment_id || index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                                                        <div>
                                                            <div className="text-sm font-medium">{payment.payment_date || ''}</div>
                                                            <div className="text-xs text-gray-500">{payment.notes || payment.payment_type || ''}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-green-600">
                                                                ₹{(payment.amount || 0).toLocaleString('en-IN')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Deduction/Extra Modal */}
            <ModelViewBox
                modal={showDeductionExtraModal}
                modelHeader={`Add ${deductionExtraForm.type === 'deduction' ? 'Deduction' : 'Extra'} - ${selectedPerson?.name || ''}`}
                isEdit={false}
                setModel={() => setShowDeductionExtraModal(false)}
                handleSubmit={addDeductionExtra}
                modelSize="md"
                submitBtnText={`Add ${deductionExtraForm.type === 'deduction' ? 'Deduction' : 'Extra'}`}
                submitBtnClass={deductionExtraForm.type === 'deduction' ? 'btn-danger' : 'btn-success'}
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-center">
                                <div className="text-lg font-bold">
                                    {deductionExtraForm.type === 'deduction' ? 'Add Deduction' : 'Add Extra Allowance'}
                                </div>
                                <div className="text-sm text-gray-500">for {selectedPerson.name || ''}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        className={`btn ${deductionExtraForm.type === 'deduction' ? 'btn-danger' : 'btn-outline-danger'}`}
                                        onClick={() => setDeductionExtraForm(prev => ({ ...prev, type: 'deduction' }))}
                                    >
                                        <IconMinus className="w-4 h-4 mr-1" />
                                        Deduction
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${deductionExtraForm.type === 'extra' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setDeductionExtraForm(prev => ({ ...prev, type: 'extra' }))}
                                    >
                                        <IconPlus className="w-4 h-4 mr-1" />
                                        Extra
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    placeholder="Enter amount"
                                    value={deductionExtraForm.amount}
                                    onChange={handleDeductionExtraFormChange}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Reason *
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    className="form-input"
                                    placeholder={`Enter reason for ${deductionExtraForm.type}`}
                                    value={deductionExtraForm.reason}
                                    onChange={handleDeductionExtraFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="adjustmentDate"
                                    className="form-input"
                                    value={deductionExtraForm.adjustmentDate}
                                    onChange={handleDeductionExtraFormChange}
                                />
                            </div>

                            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                                    <strong>Note:</strong> {deductionExtraForm.type === 'deduction' 
                                        ? 'Deductions will be subtracted from the total salary.' 
                                        : 'Extras will be added to the total salary.'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Payment Modal */}
            <ModelViewBox
                modal={showPaymentModal}
                modelHeader={`Process Payment - ${selectedPerson?.name || ''}`}
                isEdit={false}
                setModel={() => setShowPaymentModal(false)}
                handleSubmit={processPayment}
                modelSize="md"
                submitBtnText="Process Payment"
                submitBtnClass="btn-success"
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-primary">
                                    ₹{(selectedPerson.totalSalary || 0).toLocaleString('en-IN')}
                                </div>
                                <div className="text-sm text-gray-500">Total Salary</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">
                                        ₹{(selectedPerson.paidAmount || 0).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500">Already Paid</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-red-600">
                                        ₹{((selectedPerson.totalSalary || 0) - (selectedPerson.paidAmount || 0)).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500">Remaining</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    placeholder="Enter amount to pay"
                                    value={paymentForm.amount}
                                    onChange={handlePaymentFormChange}
                                    max={(selectedPerson.totalSalary || 0) - (selectedPerson.paidAmount || 0)}
                                    min="1"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Maximum: ₹{((selectedPerson.totalSalary || 0) - (selectedPerson.paidAmount || 0)).toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Date *
                                </label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    className="form-input"
                                    value={paymentForm.paymentDate}
                                    onChange={handlePaymentFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Type
                                </label>
                                <select
                                    name="paymentType"
                                    className="form-select"
                                    value={paymentForm.paymentType}
                                    onChange={handlePaymentFormChange}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="gpay">Google Pay</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    className="form-input"
                                    placeholder="e.g., Bank transfer, Cash payment"
                                    value={paymentForm.notes}
                                    onChange={handlePaymentFormChange}
                                />
                            </div>

                            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                                    <strong>Note:</strong> This payment will be recorded and cannot be modified later. Please verify the amount before proceeding.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default SalaryCalculation;