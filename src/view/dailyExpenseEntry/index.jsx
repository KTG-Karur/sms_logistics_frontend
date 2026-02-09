import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconReceipt from '../../components/Icon/IconReceipt';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconMoney';
import IconEdit from '../../components/Icon/IconEdit';
import ModelViewBox from '../../util/ModelViewBox';
import Tippy from '@tippyjs/react';

const ExpenseCalculation = () => {
    const dispatch = useDispatch();

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

    // Get today's date
    const getTodayDate = () => {
        return new Date();
    };

    // Initial other expenses
    const initialOtherExpenses = [
        {
            id: 301,
            expenseType: 'Fuel',
            amount: 500,
            description: 'Diesel for trucks',
            isPaid: false,
            paidAmount: 0,
        },
    ];

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [expenseData, setExpenseData] = useState({
        date: formatDisplayDate(selectedDate),
        otherExpenses: initialOtherExpenses,
    });

    const [otherExpense, setOtherExpense] = useState({
        expenseType: '',
        amount: '',
        description: '',
    });

    const [editingExpense, setEditingExpense] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(setPageTitle('Expense Calculation'));
    }, []);

    // Calculate totals
    const calculateOtherExpensesTotal = () => {
        return expenseData.otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const calculateOtherExpensesPaidTotal = () => {
        return expenseData.otherExpenses.reduce((sum, expense) => sum + expense.paidAmount, 0);
    };

    // Handle date change
    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setSelectedDate(newDate);
        
        // Update expense data with new date
        setExpenseData(prev => ({
            ...prev,
            date: formatDisplayDate(newDate)
        }));
        
        // You can add logic here to load expenses for the selected date
        showMessage('info', `Loading expenses for ${formatDisplayDate(newDate)}`);
    };

    // Handle other expenses
    const handleOtherExpenseChange = (e) => {
        const { name, value } = e.target;
        setOtherExpense((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const addOtherExpense = () => {
        if (!otherExpense.expenseType || !otherExpense.amount) {
            showMessage('error', 'Please enter expense type and amount');
            return;
        }

        const newExpense = {
            id: Date.now(),
            expenseType: otherExpense.expenseType,
            amount: parseFloat(otherExpense.amount) || 0,
            description: otherExpense.description,
            isPaid: false,
            paidAmount: 0,
        };

        setExpenseData((prev) => ({
            ...prev,
            otherExpenses: [...prev.otherExpenses, newExpense],
        }));

        setOtherExpense({
            expenseType: '',
            amount: '',
            description: '',
        });

        showMessage('success', 'Expense added successfully!');
    };

    // Edit other expense
    const editOtherExpense = (expense) => {
        setEditingExpense(expense);
        setOtherExpense({
            expenseType: expense.expenseType,
            amount: expense.amount,
            description: expense.description || '',
        });
    };

    // Update other expense
    const updateOtherExpense = () => {
        if (!otherExpense.expenseType || !otherExpense.amount) {
            showMessage('error', 'Please enter expense type and amount');
            return;
        }

        setExpenseData((prev) => ({
            ...prev,
            otherExpenses: prev.otherExpenses.map((expense) =>
                expense.id === editingExpense.id
                    ? {
                          ...expense,
                          expenseType: otherExpense.expenseType,
                          amount: parseFloat(otherExpense.amount) || 0,
                          description: otherExpense.description,
                      }
                    : expense,
            ),
        }));

        setEditingExpense(null);
        setOtherExpense({
            expenseType: '',
            amount: '',
            description: '',
        });

        showMessage('success', 'Expense updated successfully!');
    };

    // Cancel edit
    const cancelEdit = () => {
        setEditingExpense(null);
        setOtherExpense({
            expenseType: '',
            amount: '',
            description: '',
        });
    };

    const removeOtherExpense = (id) => {
        const expense = expenseData.otherExpenses.find((e) => e.id === id);
        if (!expense) return;

        // Use showMessage warning for confirmation
        showMessage('warning', `Are you sure you want to delete "${expense.expenseType}" expense of ₹${expense.amount.toLocaleString('en-IN')}?`, () => {
            setExpenseData((prev) => ({
                ...prev,
                otherExpenses: prev.otherExpenses.filter((expense) => expense.id !== id),
            }));
            showMessage('success', 'Expense removed successfully!');
        });
    };

    const handleOtherExpensePayment = (id, amount) => {
        setExpenseData((prevData) => {
            const updatedExpenses = prevData.otherExpenses.map((expense) => {
                if (expense.id === id) {
                    const paidAmount = parseFloat(amount) || 0;
                    if (paidAmount <= expense.amount) {
                        return {
                            ...expense,
                            paidAmount: paidAmount,
                            isPaid: paidAmount > 0,
                        };
                    } else {
                        showMessage('error', 'Paid amount cannot exceed expense amount');
                        return expense;
                    }
                }
                return expense;
            });
            return { ...prevData, otherExpenses: updatedExpenses };
        });
    };

    const toggleOtherExpensePayment = (id) => {
        setExpenseData((prevData) => {
            const updatedExpenses = prevData.otherExpenses.map((expense) => {
                if (expense.id === id) {
                    const isPaid = !expense.isPaid;
                    return {
                        ...expense,
                        isPaid: isPaid,
                        paidAmount: isPaid ? expense.amount : 0,
                    };
                }
                return expense;
            });
            return { ...prevData, otherExpenses: updatedExpenses };
        });
    };

    // Table columns
    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Expense Type',
            accessor: 'expenseType',
            sort: true,
            Cell: ({ value }) => (
                <div className="font-semibold text-gray-800 dark:text-gray-200">{value}</div>
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
                <div className="text-warning font-bold text-lg">₹{value.toLocaleString('en-IN')}</div>
            ),
        },
        {
            Header: 'Paid Amount',
            accessor: 'paidAmount',
            Cell: ({ row }) => (
                <input
                    type="number"
                    className="form-input w-32"
                    value={row.original.paidAmount}
                    onChange={(e) => handleOtherExpensePayment(row.original.id, e.target.value)}
                    max={row.original.amount}
                    placeholder="Enter paid amount"
                />
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                const expense = row.original;
                return (
                    <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${expense.isPaid ? 'bg-success' : 'bg-danger'}`}></div>
                        <span className={`font-medium ${expense.isPaid ? 'text-success' : 'text-danger'}`}>
                            {expense.isPaid ? 'Paid' : 'Unpaid'}
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
                return (
                    <div className="flex items-center space-x-2">
                        <Tippy content="Edit">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => editOtherExpense(expense)}
                            >
                                <IconEdit className="w-4 h-4" />
                                <span className="ml-1">Edit</span>
                            </button>
                        </Tippy>
                        <Tippy content={expense.isPaid ? "Mark as Unpaid" : "Mark as Paid"}>
                            <button
                                type="button"
                                className={`btn btn-sm ${expense.isPaid ? 'btn-outline-success' : 'btn-success'}`}
                                onClick={() => toggleOtherExpensePayment(expense.id)}
                            >
                                {expense.isPaid ? <IconX className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
                                <span className="ml-1">{expense.isPaid ? 'Unpaid' : 'Paid'}</span>
                            </button>
                        </Tippy>
                        <Tippy content="Delete">
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => removeOtherExpense(expense.id)}
                            >
                                <IconTrashLines className="w-4 h-4" />
                            </button>
                        </Tippy>
                    </div>
                );
            },
            width: 200,
        },
    ];

    // Handle pagination
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return expenseData.otherExpenses.slice(startIndex, endIndex);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Calculation</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage daily expenses and payments</p>
                </div>
                <div className="flex items-center">
                    {/* Date Picker - Shows selected date */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
                        <IconCalendar className="w-5 h-5 text-primary mr-3" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Selected Date</div>
                            <div className="flex items-center space-x-3">
                                <div className="font-semibold text-lg text-gray-800 dark:text-white min-w-[120px]">
                                    {expenseData.date}
                                </div>
                                <input
                                    type="date"
                                    className="form-input border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 rounded-md text-gray-800 dark:text-white"
                                    value={formatInputDate(selectedDate)}
                                    onChange={handleDateChange}
                                    title="Select date"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                            <IconReceipt className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{calculateOtherExpensesTotal().toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <IconCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Paid</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">
                                ₹{calculateOtherExpensesPaidTotal().toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mr-3">
                            <IconDollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                ₹{(calculateOtherExpensesTotal() - calculateOtherExpensesPaidTotal()).toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Other Expense Form */}
            <div className="panel mb-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
                        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="expenseType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expense Type *
                            </label>
                            <input
                                id="expenseType"
                                type="text"
                                name="expenseType"
                                className="form-input"
                                placeholder="e.g., Fuel, Maintenance"
                                value={otherExpense.expenseType}
                                onChange={handleOtherExpenseChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount (₹) *
                            </label>
                            <input
                                id="amount"
                                type="number"
                                name="amount"
                                className="form-input"
                                placeholder="Enter amount"
                                value={otherExpense.amount}
                                onChange={handleOtherExpenseChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <input
                                id="description"
                                type="text"
                                name="description"
                                className="form-input"
                                placeholder="Brief description"
                                value={otherExpense.description}
                                onChange={handleOtherExpenseChange}
                            />
                        </div>
                        <div className="flex items-end space-x-2">
                            {editingExpense ? (
                                <>
                                    <button type="button" className="btn btn-success w-1/2" onClick={updateOtherExpense}>
                                        <IconCheck className="w-5 h-5 mr-2" />
                                        Update
                                    </button>
                                    <button type="button" className="btn btn-outline-danger w-1/2" onClick={cancelEdit}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="btn btn-success w-full" onClick={addOtherExpense}>
                                    <IconPlus className="w-5 h-5 mr-2" />
                                    Add Expense
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Expense Records'}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={expenseData.otherExpenses.length}
                    totalPages={Math.ceil(expenseData.otherExpenses.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    loading={false}
                />
            </div>

            {/* Summary Footer */}
            <div className="panel border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
                    <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                        <IconDollarSign className="w-5 h-5 mr-2 text-primary" />
                        Expense Summary for {expenseData.date}
                    </h5>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Expense Details</h6>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Total Expenses</span>
                                    <span className="font-semibold">₹{calculateOtherExpensesTotal().toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Number of Expenses</span>
                                    <span className="font-semibold">{expenseData.otherExpenses.length}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Summary</h6>
                            <div className="space-y-4">
                                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary mb-1">
                                        ₹{calculateOtherExpensesTotal().toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-sm text-gray-500">Total Expenses Amount</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Paid Amount</div>
                                        <div className="text-xl font-bold text-green-600">
                                            ₹{calculateOtherExpensesPaidTotal().toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Remaining</div>
                                        <div className="text-xl font-bold text-red-600">
                                            ₹{(calculateOtherExpensesTotal() - calculateOtherExpensesPaidTotal()).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseCalculation;