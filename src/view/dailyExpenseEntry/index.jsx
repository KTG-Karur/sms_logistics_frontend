import { useState, useEffect, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconUsers from '../../components/Icon/IconUsers';
import IconTruck from '../../components/Icon/IconTruck';
import IconPackage from '../../components/Icon/IconPackage';
import IconReceipt from '../../components/Icon/IconReceipt';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconWallet from '../../components/Icon/IconAirplay';
import IconDollarSign from '../../components/Icon/IconMoney';
import IconEdit from '../../components/Icon/IconEdit';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import ModelViewBox from '../../util/ModelViewBox';

const ExpenseCalculation = () => {
    const dispatch = useDispatch();

    // Dummy data for employees, drivers, and loadmen
    const dummyEmployees = [
        { id: 1, name: 'John Doe', baseSalary: 50000, role: 'employee' },
        { id: 2, name: 'Jane Smith', baseSalary: 45000, role: 'employee' },
        { id: 3, name: 'Mike Johnson', baseSalary: 55000, role: 'employee' },
    ];

    const dummyDrivers = [
        { id: 101, name: 'Robert Wilson', baseSalary: 40000, role: 'driver' },
        { id: 102, name: 'David Brown', baseSalary: 42000, role: 'driver' },
        { id: 103, name: 'Thomas Lee', baseSalary: 38000, role: 'driver' },
    ];

    const dummyLoadmen = [
        { id: 201, name: 'James Miller', baseSalary: 35000, role: 'loadman' },
        { id: 202, name: 'William Davis', baseSalary: 36000, role: 'loadman' },
        { id: 203, name: 'Charles Garcia', baseSalary: 34000, role: 'loadman' },
    ];

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

    // Get today's date in DD/MM/YYYY format
    const getTodayDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [expenseData, setExpenseData] = useState({
        date: getTodayDate(),
        employeeExpenses: dummyEmployees.map((emp) => ({
            ...emp,
            adjustment: 0,
            adjustmentAmount: '',
            adjustmentReason: '',
            adjustmentHistory: [],
            finalSalary: emp.baseSalary,
            isPaid: false,
            paidAmount: 0,
        })),
        driverExpenses: dummyDrivers.map((driver) => ({
            ...driver,
            adjustment: 0,
            adjustmentAmount: '',
            adjustmentReason: '',
            adjustmentHistory: [],
            finalSalary: driver.baseSalary,
            isPaid: false,
            paidAmount: 0,
        })),
        loadmanExpenses: dummyLoadmen.map((loadman) => ({
            ...loadman,
            adjustment: 0,
            adjustmentAmount: '',
            adjustmentReason: '',
            adjustmentHistory: [],
            finalSalary: loadman.baseSalary,
            isPaid: false,
            paidAmount: 0,
        })),
        otherExpenses: initialOtherExpenses,
    });

    const [otherExpense, setOtherExpense] = useState({
        expenseType: '',
        amount: '',
        description: '',
    });

    const [editingExpense, setEditingExpense] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [currentHistory, setCurrentHistory] = useState({
        name: '',
        category: '',
        history: [],
    });

    useEffect(() => {
        dispatch(setPageTitle('Expense Calculation'));
    }, []);

    // Calculate totals
    const calculateTotal = (expenses) => {
        return expenses.reduce((sum, expense) => sum + expense.finalSalary, 0);
    };

    const calculateTotalPaid = (expenses) => {
        return expenses.reduce((sum, expense) => sum + expense.paidAmount, 0);
    };

    const calculateOtherExpensesTotal = () => {
        return expenseData.otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const calculateOtherExpensesPaidTotal = () => {
        return expenseData.otherExpenses.reduce((sum, expense) => sum + expense.paidAmount, 0);
    };

    const calculateGrandTotal = () => {
        return calculateTotal(expenseData.employeeExpenses) + calculateTotal(expenseData.driverExpenses) + calculateTotal(expenseData.loadmanExpenses) + calculateOtherExpensesTotal();
    };

    const calculateGrandTotalPaid = () => {
        return calculateTotalPaid(expenseData.employeeExpenses) + calculateTotalPaid(expenseData.driverExpenses) + calculateTotalPaid(expenseData.loadmanExpenses) + calculateOtherExpensesPaidTotal();
    };

    // Handle adjustment amount input
    const handleAdjustmentAmountChange = (id, value, category) => {
        setExpenseData((prevData) => {
            if (category === 'employee') {
                const updatedExpenses = prevData.employeeExpenses.map((emp) => {
                    if (emp.id === id) {
                        return { ...emp, adjustmentAmount: value };
                    }
                    return emp;
                });
                return { ...prevData, employeeExpenses: updatedExpenses };
            } else if (category === 'driver') {
                const updatedExpenses = prevData.driverExpenses.map((driver) => {
                    if (driver.id === id) {
                        return { ...driver, adjustmentAmount: value };
                    }
                    return driver;
                });
                return { ...prevData, driverExpenses: updatedExpenses };
            } else if (category === 'loadman') {
                const updatedExpenses = prevData.loadmanExpenses.map((loadman) => {
                    if (loadman.id === id) {
                        return { ...loadman, adjustmentAmount: value };
                    }
                    return loadman;
                });
                return { ...prevData, loadmanExpenses: updatedExpenses };
            }
            return prevData;
        });
    };

    // Handle adjustment reason input
    const handleAdjustmentReasonChange = (id, value, category) => {
        setExpenseData((prevData) => {
            if (category === 'employee') {
                const updatedExpenses = prevData.employeeExpenses.map((emp) => {
                    if (emp.id === id) {
                        return { ...emp, adjustmentReason: value };
                    }
                    return emp;
                });
                return { ...prevData, employeeExpenses: updatedExpenses };
            } else if (category === 'driver') {
                const updatedExpenses = prevData.driverExpenses.map((driver) => {
                    if (driver.id === id) {
                        return { ...driver, adjustmentReason: value };
                    }
                    return driver;
                });
                return { ...prevData, driverExpenses: updatedExpenses };
            } else if (category === 'loadman') {
                const updatedExpenses = prevData.loadmanExpenses.map((loadman) => {
                    if (loadman.id === id) {
                        return { ...loadman, adjustmentReason: value };
                    }
                    return loadman;
                });
                return { ...prevData, loadmanExpenses: updatedExpenses };
            }
            return prevData;
        });
    };

    // Show adjustment dialog using showMessage
    const showAdjustmentDialog = (id, category, type) => {
        let adjustmentAmount = '';
        let adjustmentReason = '';
        let name = '';

        if (category === 'employee') {
            const emp = expenseData.employeeExpenses.find((e) => e.id === id);
            adjustmentAmount = emp?.adjustmentAmount || '';
            adjustmentReason = emp?.adjustmentReason || '';
            name = emp?.name || '';
        } else if (category === 'driver') {
            const driver = expenseData.driverExpenses.find((d) => d.id === id);
            adjustmentAmount = driver?.adjustmentAmount || '';
            adjustmentReason = driver?.adjustmentReason || '';
            name = driver?.name || '';
        } else if (category === 'loadman') {
            const loadman = expenseData.loadmanExpenses.find((l) => l.id === id);
            adjustmentAmount = loadman?.adjustmentAmount || '';
            adjustmentReason = loadman?.adjustmentReason || '';
            name = loadman?.name || '';
        }

        if (!adjustmentAmount || !adjustmentReason) {
            showMessage('error', 'Please enter both amount and reason before applying adjustment');
            return;
        }

        const amount = parseFloat(adjustmentAmount) || 0;
        if (!amount) {
            showMessage('error', 'Please enter a valid amount');
            return;
        }

        // Use showMessage warning for confirmation
        showMessage('warning', `Are you sure you want to ${type === 'add' ? 'add' : 'subtract'} ₹${amount.toLocaleString('en-IN')} from ${name}'s salary? Reason: ${adjustmentReason}`, () => {
            applyAdjustment(id, category, type, amount, adjustmentReason);
        });
    };

    // Apply adjustment
    const applyAdjustment = (id, category, type, amount, reason) => {
        setExpenseData((prevData) => {
            if (category === 'employee') {
                const updatedExpenses = prevData.employeeExpenses.map((emp) => {
                    if (emp.id === id) {
                        const adjustment = type === 'add' ? amount : -amount;
                        const newAdjustment = emp.adjustment + adjustment;
                        const newHistory = [
                            ...emp.adjustmentHistory,
                            {
                                date: new Date().toLocaleString(),
                                type: type === 'add' ? 'Addition' : 'Deduction',
                                amount: amount,
                                reason: reason,
                                previousSalary: emp.finalSalary,
                                newSalary: emp.baseSalary + newAdjustment,
                            },
                        ];

                        return {
                            ...emp,
                            adjustment: newAdjustment,
                            finalSalary: emp.baseSalary + newAdjustment,
                            adjustmentAmount: '',
                            adjustmentReason: '',
                            adjustmentHistory: newHistory,
                        };
                    }
                    return emp;
                });
                return { ...prevData, employeeExpenses: updatedExpenses };
            } else if (category === 'driver') {
                const updatedExpenses = prevData.driverExpenses.map((driver) => {
                    if (driver.id === id) {
                        const adjustment = type === 'add' ? amount : -amount;
                        const newAdjustment = driver.adjustment + adjustment;
                        const newHistory = [
                            ...driver.adjustmentHistory,
                            {
                                date: new Date().toLocaleString(),
                                type: type === 'add' ? 'Addition' : 'Deduction',
                                amount: amount,
                                reason: reason,
                                previousSalary: driver.finalSalary,
                                newSalary: driver.baseSalary + newAdjustment,
                            },
                        ];

                        return {
                            ...driver,
                            adjustment: newAdjustment,
                            finalSalary: driver.baseSalary + newAdjustment,
                            adjustmentAmount: '',
                            adjustmentReason: '',
                            adjustmentHistory: newHistory,
                        };
                    }
                    return driver;
                });
                return { ...prevData, driverExpenses: updatedExpenses };
            } else if (category === 'loadman') {
                const updatedExpenses = prevData.loadmanExpenses.map((loadman) => {
                    if (loadman.id === id) {
                        const adjustment = type === 'add' ? amount : -amount;
                        const newAdjustment = loadman.adjustment + adjustment;
                        const newHistory = [
                            ...loadman.adjustmentHistory,
                            {
                                date: new Date().toLocaleString(),
                                type: type === 'add' ? 'Addition' : 'Deduction',
                                amount: amount,
                                reason: reason,
                                previousSalary: loadman.finalSalary,
                                newSalary: loadman.baseSalary + newAdjustment,
                            },
                        ];

                        return {
                            ...loadman,
                            adjustment: newAdjustment,
                            finalSalary: loadman.baseSalary + newAdjustment,
                            adjustmentAmount: '',
                            adjustmentReason: '',
                            adjustmentHistory: newHistory,
                        };
                    }
                    return loadman;
                });
                return { ...prevData, loadmanExpenses: updatedExpenses };
            }

            return prevData;
        });

        showMessage('success', `Adjustment applied successfully!`);
    };

    // Handle payment for salary
    const handleSalaryPayment = (id, category) => {
        setExpenseData((prevData) => {
            if (category === 'employee') {
                const updatedExpenses = prevData.employeeExpenses.map((emp) => {
                    if (emp.id === id) {
                        const isPaid = !emp.isPaid;
                        return {
                            ...emp,
                            isPaid: isPaid,
                            paidAmount: isPaid ? emp.finalSalary : 0,
                        };
                    }
                    return emp;
                });
                return { ...prevData, employeeExpenses: updatedExpenses };
            } else if (category === 'driver') {
                const updatedExpenses = prevData.driverExpenses.map((driver) => {
                    if (driver.id === id) {
                        const isPaid = !driver.isPaid;
                        return {
                            ...driver,
                            isPaid: isPaid,
                            paidAmount: isPaid ? driver.finalSalary : 0,
                        };
                    }
                    return driver;
                });
                return { ...prevData, driverExpenses: updatedExpenses };
            } else if (category === 'loadman') {
                const updatedExpenses = prevData.loadmanExpenses.map((loadman) => {
                    if (loadman.id === id) {
                        const isPaid = !loadman.isPaid;
                        return {
                            ...loadman,
                            isPaid: isPaid,
                            paidAmount: isPaid ? loadman.finalSalary : 0,
                        };
                    }
                    return loadman;
                });
                return { ...prevData, loadmanExpenses: updatedExpenses };
            }

            return prevData;
        });
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

        showMessage('success', 'Other expense added successfully!');
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

    // View adjustment history using ModelViewBox
    const viewAdjustmentHistory = (id, category) => {
        let history = [];
        let name = '';

        if (category === 'employee') {
            const emp = expenseData.employeeExpenses.find((e) => e.id === id);
            history = emp?.adjustmentHistory || [];
            name = emp?.name || '';
        } else if (category === 'driver') {
            const driver = expenseData.driverExpenses.find((d) => d.id === id);
            history = driver?.adjustmentHistory || [];
            name = driver?.name || '';
        } else if (category === 'loadman') {
            const loadman = expenseData.loadmanExpenses.find((l) => l.id === id);
            history = loadman?.adjustmentHistory || [];
            name = loadman?.name || '';
        }

        if (history.length === 0) {
            showMessage('info', 'No adjustment history found');
            return;
        }

        setCurrentHistory({
            name: name,
            category: category,
            history: history,
        });
        setShowHistoryModal(true);
    };

    // Close history modal
    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        setCurrentHistory({
            name: '',
            category: '',
            history: [],
        });
    };

    // Save expense data
    const saveExpenseData = () => {
        const dataToSave = {
            date: expenseData.date,
            expenses: {
                employees: expenseData.employeeExpenses,
                drivers: expenseData.driverExpenses,
                loadmen: expenseData.loadmanExpenses,
                otherExpenses: expenseData.otherExpenses,
            },
            totals: {
                employeeTotal: calculateTotal(expenseData.employeeExpenses),
                driverTotal: calculateTotal(expenseData.driverExpenses),
                loadmanTotal: calculateTotal(expenseData.loadmanExpenses),
                otherExpensesTotal: calculateOtherExpensesTotal(),
                grandTotal: calculateGrandTotal(),
                grandTotalPaid: calculateGrandTotalPaid(),
            },
        };

        console.log('Data to save:', dataToSave);
        showMessage('success', 'Expense data saved successfully!');
    };

    // Render salary adjustment section
    const renderSalarySection = (title, expenses, category, icon) => (
        <div className="panel mb-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 dark:bg-gray-800 border-b">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">{icon}</div>
                    <div>
                        <h5 className="font-semibold text-lg dark:text-white-light">{title}</h5>
                        <p className="text-gray-500 text-sm">{expenses.length} records</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-gray-500 text-sm">Total Amount</div>
                    <div className="text-2xl font-bold text-primary">₹{calculateTotal(expenses).toLocaleString('en-IN')}</div>
                </div>
            </div>
            <div className="p-4">
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr className="!bg-transparent dark:!bg-transparent">
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Name</th>
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Base Salary</th>
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Adjustment (+/-)</th>
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Final Salary</th>
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Adjustment Details</th>
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Payment Status</th>
                                <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="py-3">
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-xs text-gray-500">ID: {item.id}</div>
                                    </td>
                                    <td className="py-3">
                                        <div className="text-primary font-medium">₹{item.baseSalary.toLocaleString('en-IN')}</div>
                                    </td>
                                    <td className="py-3">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="number"
                                                    className="form-input w-24"
                                                    value={item.adjustmentAmount}
                                                    onChange={(e) => handleAdjustmentAmountChange(item.id, e.target.value, category)}
                                                    placeholder="Amount"
                                                    min="0"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success px-3 py-1"
                                                    onClick={() => showAdjustmentDialog(item.id, category, 'add')}
                                                    disabled={!item.adjustmentAmount || !item.adjustmentReason}
                                                >
                                                    +
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger px-3 py-1"
                                                    onClick={() => showAdjustmentDialog(item.id, category, 'subtract')}
                                                    disabled={!item.adjustmentAmount || !item.adjustmentReason}
                                                >
                                                    -
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-input w-full text-sm"
                                                value={item.adjustmentReason}
                                                onChange={(e) => handleAdjustmentReasonChange(item.id, e.target.value, category)}
                                                placeholder="Reason for adjustment"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className={`font-bold text-lg ${item.finalSalary >= item.baseSalary ? 'text-success' : 'text-danger'}`}>₹{item.finalSalary.toLocaleString('en-IN')}</div>
                                        {item.adjustment !== 0 && (
                                            <div className={`text-xs mt-1 ${item.adjustment > 0 ? 'text-success' : 'text-danger'}`}>
                                                {item.adjustment > 0 ? '+' : ''}₹{item.adjustment.toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        <div className="text-sm">
                                            <div className="text-gray-600 dark:text-gray-400">
                                                Total Adjustment:
                                                <span className={`font-medium ml-1 ${item.adjustment > 0 ? 'text-success' : item.adjustment < 0 ? 'text-danger' : 'text-gray-500'}`}>
                                                    {item.adjustment > 0 ? '+' : ''}₹{item.adjustment.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            {item.adjustmentHistory.length > 0 && (
                                                <button type="button" className="btn btn-link p-0 text-primary text-xs mt-1" onClick={() => viewAdjustmentHistory(item.id, category)}>
                                                    <IconInfoCircle className="w-3 h-3 mr-1" />
                                                    View History ({item.adjustmentHistory.length})
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${item.isPaid ? 'bg-success' : 'bg-danger'}`}></div>
                                            <span className={`font-medium ${item.isPaid ? 'text-success' : 'text-danger'}`}>{item.isPaid ? 'Paid' : 'Unpaid'}</span>
                                            {item.isPaid && <div className="ml-2 text-xs text-gray-500">(₹{item.paidAmount.toLocaleString('en-IN')})</div>}
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${item.isPaid ? 'btn-outline-success' : 'btn-success'}`}
                                                onClick={() => handleSalaryPayment(item.id, category)}
                                            >
                                                {item.isPaid ? <IconX className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
                                                <span className="ml-1">{item.isPaid ? 'Unpaid' : 'Paid'}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Calculation</h2>
                    <p className="text-gray-600 dark:text-gray-400">Manage daily expenses and salary payments</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                        <IconCalendar className="w-5 h-5 text-primary mr-2" />
                        <div>
                            <div className="text-sm text-gray-500">Today's Date</div>
                            <div className="font-semibold">{expenseData.date}</div>
                        </div>
                    </div>
                    <button type="button" className="btn btn-primary bg-gradient-to-r from-primary to-primary/90" onClick={saveExpenseData}>
                        <IconWallet className="w-5 h-5 mr-2" />
                        Save Expenses
                    </button>
                </div>
            </div>

            {/* Expense Summary Cards - Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <IconUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Employee Salary Total</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{calculateTotal(expenseData.employeeExpenses).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <IconTruck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Driver Salary Total</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{calculateTotal(expenseData.driverExpenses).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                            <IconPackage className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Loadman Salary Total</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{calculateTotal(expenseData.loadmanExpenses).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                            <IconReceipt className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Other Expenses Total</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">₹{calculateOtherExpensesTotal().toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mr-3">
                            <IconDollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Grand Total Expenses</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹{calculateGrandTotal().toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Total Paid</div>
                                <div className="text-sm font-medium text-green-600">₹{calculateGrandTotalPaid().toLocaleString('en-IN')}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Remaining</div>
                                <div className="text-sm font-medium text-red-600">₹{(calculateGrandTotal() - calculateGrandTotalPaid()).toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Salary Section */}
            {renderSalarySection('Employee Salary', expenseData.employeeExpenses, 'employee', <IconUsers className="w-5 h-5 text-primary" />)}

            {/* Driver Salary Section */}
            {renderSalarySection('Driver Salary', expenseData.driverExpenses, 'driver', <IconTruck className="w-5 h-5 text-green-600" />)}

            {/* Loadman Salary Section */}
            {renderSalarySection('Loadman Salary', expenseData.loadmanExpenses, 'loadman', <IconPackage className="w-5 h-5 text-purple-600" />)}

            {/* Other Expenses Section */}
            <div className="panel mb-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-5 p-4 bg-gray-50 dark:bg-gray-800 border-b">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mr-3">
                            <IconReceipt className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-lg dark:text-white-light">Other Expenses</h5>
                            <p className="text-gray-500 text-sm">{expenseData.otherExpenses.length} expense records</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-gray-500 text-sm">Total Amount</div>
                        <div className="text-2xl font-bold text-warning">₹{calculateOtherExpensesTotal().toLocaleString('en-IN')}</div>
                    </div>
                </div>

                <div className="p-4">
                    {/* Add/Edit Other Expense Form */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-5">
                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h6>
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
                                <input id="amount" type="number" name="amount" className="form-input" placeholder="Enter amount" value={otherExpense.amount} onChange={handleOtherExpenseChange} />
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

                    {/* Other Expenses List */}
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr className="!bg-transparent dark:!bg-transparent">
                                    <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Expense Type</th>
                                    <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Description</th>
                                    <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                                    <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Paid Amount</th>
                                    <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                                    <th className="!py-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenseData.otherExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3">
                                            <div className="font-semibold">{expense.expenseType}</div>
                                        </td>
                                        <td className="py-3">
                                            <div className="text-gray-600 dark:text-gray-400">{expense.description || '-'}</div>
                                        </td>
                                        <td className="py-3">
                                            <div className="text-warning font-bold text-lg">₹{expense.amount.toLocaleString('en-IN')}</div>
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                className="form-input w-32"
                                                value={expense.paidAmount}
                                                onChange={(e) => handleOtherExpensePayment(expense.id, e.target.value)}
                                                max={expense.amount}
                                                placeholder="Enter paid amount"
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${expense.isPaid ? 'bg-success' : 'bg-danger'}`}></div>
                                                <span className={`font-medium ${expense.isPaid ? 'text-success' : 'text-danger'}`}>{expense.isPaid ? 'Paid' : 'Unpaid'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center space-x-2">
                                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => editOtherExpense(expense)}>
                                                    <IconEdit className="w-4 h-4" />
                                                    <span className="ml-1">Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${expense.isPaid ? 'btn-outline-success' : 'btn-success'}`}
                                                    onClick={() => toggleOtherExpensePayment(expense.id)}
                                                >
                                                    {expense.isPaid ? <IconX className="w-4 h-4" /> : <IconCheck className="w-4 h-4" />}
                                                    <span className="ml-1">{expense.isPaid ? 'Unpaid' : 'Paid'}</span>
                                                </button>
                                                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeOtherExpense(expense.id)}>
                                                    <IconTrashLines className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {expenseData.otherExpenses.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <IconReceipt className="w-12 h-12 text-gray-300 mb-2" />
                                                <div>No other expenses added yet</div>
                                                <div className="text-sm text-gray-400">Add your first expense using the form above</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <ModelViewBox
                modal={showHistoryModal}
                modelHeader={`Adjustment History - ${currentHistory.name}`}
                isEdit={false}
                setModel={closeHistoryModal}
                handleSubmit={closeHistoryModal}
                modelSize="lg"
                saveBtn={false}
            >
                <div className="p-4">
                    {currentHistory.history.length === 0 ? (
                        <div className="text-center py-8">
                            <IconInfoCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <div className="text-gray-500">No adjustment history found</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-500">Total Adjustments: {currentHistory.history.length}</div>
                                <div className="text-sm font-medium">Category: {currentHistory.category.charAt(0).toUpperCase() + currentHistory.category.slice(1)}</div>
                            </div>

                            <div className="overflow-y-auto max-h-96">
                                <table className="table-hover w-full">
                                    <thead>
                                        <tr className="!bg-transparent dark:!bg-transparent">
                                            <th className="!py-2 font-medium text-gray-700 dark:text-gray-300">Date & Time</th>
                                            <th className="!py-2 font-medium text-gray-700 dark:text-gray-300">Type</th>
                                            <th className="!py-2 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                                            <th className="!py-2 font-medium text-gray-700 dark:text-gray-300">Reason</th>
                                            <th className="!py-2 font-medium text-gray-700 dark:text-gray-300">Salary Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentHistory.history.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-2">
                                                    <div className="text-sm">{item.date}</div>
                                                </td>
                                                <td className="py-2">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                                            item.type === 'Addition'
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                        }`}
                                                    >
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <div className={`font-bold ${item.type === 'Addition' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {item.type === 'Addition' ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={item.reason}>
                                                        {item.reason}
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="text-sm">
                                                        <div className="text-gray-500 line-through">₹{item.previousSalary.toLocaleString('en-IN')}</div>
                                                        <div className="font-medium text-primary">→ ₹{item.newSalary.toLocaleString('en-IN')}</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Total Additions</div>
                                        <div className="text-lg font-bold text-green-600">
                                            ₹
                                            {currentHistory.history
                                                .filter((item) => item.type === 'Addition')
                                                .reduce((sum, item) => sum + item.amount, 0)
                                                .toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Total Deductions</div>
                                        <div className="text-lg font-bold text-red-600">
                                            ₹
                                            {currentHistory.history
                                                .filter((item) => item.type === 'Deduction')
                                                .reduce((sum, item) => sum + item.amount, 0)
                                                .toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ModelViewBox>

            {/* Summary Footer */}
            <div className="panel border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
                    <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                        <IconDollarSign className="w-5 h-5 mr-2 text-primary" />
                        Expense Summary
                    </h5>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Expense Breakdown</h6>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Employee Salary Total</span>
                                    <span className="font-semibold">₹{calculateTotal(expenseData.employeeExpenses).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Driver Salary Total</span>
                                    <span className="font-semibold">₹{calculateTotal(expenseData.driverExpenses).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Loadman Salary Total</span>
                                    <span className="font-semibold">₹{calculateTotal(expenseData.loadmanExpenses).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Other Expenses Total</span>
                                    <span className="font-semibold">₹{calculateOtherExpensesTotal().toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Summary</h6>
                            <div className="space-y-4">
                                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-primary mb-1">₹{calculateGrandTotal().toLocaleString('en-IN')}</div>
                                    <div className="text-sm text-gray-500">Grand Total Expenses</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Paid Amount</div>
                                        <div className="text-xl font-bold text-green-600">₹{calculateGrandTotalPaid().toLocaleString('en-IN')}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Remaining</div>
                                        <div className="text-xl font-bold text-red-600">₹{(calculateGrandTotal() - calculateGrandTotalPaid()).toLocaleString('en-IN')}</div>
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
