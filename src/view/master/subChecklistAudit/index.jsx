import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage } from '../../../util/AllFunction';
import _ from 'lodash';
import IconUsers from '../../../components/Icon/IconUsers';
import IconTruck from '../../../components/Icon/IconTruck';
import IconPackage from '../../../components/Icon/IconPackage';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconDollarSign from '../../../components/Icon/IconDollarSign';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
import IconCheckSquare from '../../../components/Icon/IconSquareCheck';
import IconSquare from '../../../components/Icon/IconChartSquare';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconFileText from '../../../components/Icon/IconTxtFile';
import { useNavigate, useLocation } from 'react-router-dom';

const ExpenseSettlementDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Get data from navigation state
    const { person, category } = location.state || {};
    
    // If no data, redirect back
    useEffect(() => {
        if (!person) {
            navigate('/expenses/settlement');
        }
    }, [person, navigate]);

    useEffect(() => {
        if (person) {
            dispatch(setPageTitle(`Settlement - ${person.name || person.expenseType}`));
        }
    }, [person, dispatch]);

    const [selectedDays, setSelectedDays] = useState([]);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Initialize selection with all unpaid days and set default payment amount
    useEffect(() => {
        if (person?.dayWiseUnpaid) {
            const initialSelection = person.dayWiseUnpaid.map(day => ({ ...day, selected: true })); // Default all selected
            setSelectedDays(initialSelection);
            
            // Set default payment amount to total selected amount
            const totalSelected = initialSelection.reduce((sum, day) => sum + day.amount, 0);
            setPaymentData(prev => ({ 
                ...prev, 
                amount: totalSelected.toString() 
            }));
        }
    }, [person]);

    if (!person) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-gray-400 mb-2">No data found</div>
                    <button
                        onClick={() => navigate('/expenses/settlement')}
                        className="btn btn-primary"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Calculate totals
    const calculateSelectedTotal = () => {
        return selectedDays
            .filter(day => day.selected)
            .reduce((sum, day) => sum + day.amount, 0);
    };

    const handleDaySelection = (index) => {
        const newSelectedDays = selectedDays.map((day, i) => 
            i === index ? { ...day, selected: !day.selected } : day
        );
        setSelectedDays(newSelectedDays);
        
        // Update payment amount to match new selected total
        const newTotal = newSelectedDays
            .filter(day => day.selected)
            .reduce((sum, day) => sum + day.amount, 0);
        setPaymentData(prev => ({ ...prev, amount: newTotal.toString() }));
    };

    const handleSelectAll = () => {
        const allSelected = selectedDays.every(day => day.selected);
        const newSelectedDays = selectedDays.map(day => ({ ...day, selected: !allSelected }));
        setSelectedDays(newSelectedDays);
        
        // Update payment amount
        const newTotal = newSelectedDays
            .filter(day => day.selected)
            .reduce((sum, day) => sum + day.amount, 0);
        setPaymentData(prev => ({ ...prev, amount: newTotal.toString() }));
    };

    const handlePaymentSubmit = () => {
        const selectedTotal = calculateSelectedTotal();
        
        if (selectedTotal === 0) {
            showMessage('error', 'Please select at least one day to pay');
            return;
        }

        if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
            showMessage('error', 'Please enter a valid payment amount');
            return;
        }

        const paymentAmount = parseFloat(paymentData.amount);
        
        // Payment amount cannot exceed selected total
        if (paymentAmount > selectedTotal) {
            showMessage('error', `Payment amount cannot exceed selected total of ₹${selectedTotal.toLocaleString('en-IN')}`);
            return;
        }

        // Payment amount cannot be edited by user - it's automatically set to selected total
        // But we still validate in case user tries to manipulate the input
        if (paymentAmount !== selectedTotal) {
            showMessage('error', `Payment amount must be exactly ₹${selectedTotal.toLocaleString('en-IN')} (selected total)`);
            return;
        }

        showMessage('warning', `Are you sure you want to process payment of ₹${paymentAmount.toLocaleString('en-IN')} for ${person.name || person.expenseType}?`, () => {
            // Here you would typically make an API call
            console.log('Payment processed:', {
                personId: person.id,
                selectedDays: selectedDays.filter(day => day.selected),
                paymentAmount,
                paymentDate: paymentData.paymentDate,
                notes: paymentData.notes
            });

            showMessage('success', `Payment of ₹${paymentAmount.toLocaleString('en-IN')} processed successfully!`);
            
            // Navigate back after successful payment
            setTimeout(() => {
                navigate('/expenses/settlement');
            }, 1500);
        });
    };

    const getCategoryIcon = () => {
        switch(category) {
            case 'employee': return <IconUsers className="w-5 h-5 text-blue-600" />;
            case 'driver': return <IconTruck className="w-5 h-5 text-green-600" />;
            case 'loadman': return <IconPackage className="w-5 h-5 text-purple-600" />;
            case 'other': return <IconReceipt className="w-5 h-5 text-yellow-600" />;
            default: return <IconUsers className="w-5 h-5 text-gray-600" />;
        }
    };

    // Get salary type breakdown
    const getSalaryBreakdown = () => {
        if (person.category === 'Driver' && person.salaryType === 'dual') {
            return (
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Salary:</span>
                        <span className="font-semibold">₹{person.monthlyAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Loadman Earnings:</span>
                        <span className="font-semibold">₹{person.loadmanAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Total Salary:</span>
                        <span className="font-bold">₹{person.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            );
        } else if (person.category === 'Loadman') {
            return (
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Daily Rate:</span>
                        <span className="font-semibold">₹{person.dailyRate?.toLocaleString('en-IN')}/day</span>
                    </div>
                </div>
            );
        } else if (person.category === 'Employee') {
            return (
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Salary:</span>
                        <span className="font-semibold">₹{person.monthlySalary?.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Render person summary
    const renderPersonSummary = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                        {getCategoryIcon()}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {person.name || person.expenseType}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-600 dark:text-gray-400">{person.description || 'No description'}</span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {person.category} • {person.salaryType || 'Expense'}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/expenses/settlement')}
                    className="btn btn-outline-primary"
                >
                    <IconArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{person.totalAmount.toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</div>
                    <div className="text-xl font-bold text-green-600">
                        ₹{person.paidAmount.toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pending Balance</div>
                    <div className="text-xl font-bold text-red-600">
                        ₹{person.balance.toLocaleString('en-IN')}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Unpaid Days</div>
                    <div className="text-xl font-bold text-yellow-600">
                        {person.dayWiseUnpaid.length}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                    <div className={`text-xl font-bold ${
                        person.status === 'Fully Paid' ? 'text-green-600' :
                        person.status === 'Partially Paid' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {person.status}
                    </div>
                </div>
            </div>

            {/* Salary Breakdown */}
            {getSalaryBreakdown() && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Breakdown</h4>
                    {getSalaryBreakdown()}
                </div>
            )}
        </div>
    );

    // Render day-wise unpaid details
    const renderDayWiseDetails = () => {
        const selectedTotal = calculateSelectedTotal();
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Day-wise Unpaid Details
                    </h3>
                    <button
                        onClick={handleSelectAll}
                        className="btn btn-outline-primary btn-sm"
                    >
                        {selectedDays.every(day => day.selected) ? (
                            <>
                                <IconCheckSquare className="w-4 h-4 mr-2" />
                                Deselect All
                            </>
                        ) : (
                            <>
                                <IconSquare className="w-4 h-4 mr-2" />
                                Select All
                            </>
                        )}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Select
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {selectedDays.map((day, index) => (
                                <tr 
                                    key={index} 
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${day.selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    onClick={() => handleDaySelection(index)}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            {day.selected ? (
                                                <IconCheckSquare className="w-5 h-5 text-primary" />
                                            ) : (
                                                <IconSquare className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <IconCalendar className="w-4 h-4 text-gray-400 mr-2" />
                                            <span className="font-medium text-gray-900 dark:text-white">{day.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            day.type === 'monthly' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                            day.type === 'loadman' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                                            day.type === 'daily' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {day.type || 'Expense'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-red-600">
                                            ₹{day.amount.toLocaleString('en-IN')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-gray-700 dark:text-gray-300">{day.description}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                                            Unpaid
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {selectedDays.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">No unpaid days found</div>
                            <div className="text-sm text-gray-500">All payments are cleared</div>
                        </div>
                    )}
                </div>

                {/* Selection Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm text-gray-500">Selected Days</div>
                            <div className="font-semibold text-primary">
                                {selectedDays.filter(day => day.selected).length} of {selectedDays.length} days
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Selected Total</div>
                            <div className="text-2xl font-bold text-red-600">
                                ₹{selectedTotal.toLocaleString('en-IN')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Render payment form
    const renderPaymentForm = () => {
        const selectedTotal = calculateSelectedTotal();
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Details
                </h3>

                <div className="space-y-4">
                    {/* Payment Amount - Readonly, auto-filled */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Amount (₹) *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                className="form-input w-full pl-10 bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                                value={paymentData.amount}
                                readOnly
                                disabled
                            />
                            <IconDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Amount is automatically calculated from selected days
                        </div>
                    </div>

                    {/* Payment Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Date *
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                className="form-input w-full pl-10"
                                value={paymentData.paymentDate}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                            />
                            <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes (Optional)
                        </label>
                        <div className="relative">
                            <textarea
                                className="form-textarea w-full pl-10"
                                rows="3"
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Add payment notes..."
                            />
                            <IconFileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Selected Days Total:</span>
                                <span className="font-semibold">₹{selectedTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Payment Amount:</span>
                                <span className="font-bold text-primary">
                                    ₹{selectedTotal.toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Remaining Balance:</span>
                                <span className="font-bold text-green-600">
                                    ₹{(person.balance - selectedTotal).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-1"
                            onClick={() => navigate('/expenses/settlement')}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary flex-1"
                            onClick={handlePaymentSubmit}
                            disabled={selectedTotal === 0}
                        >
                            Process Payment (₹{selectedTotal.toLocaleString('en-IN')})
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Payment Settlement</h2>
                    <p className="text-gray-600 dark:text-gray-400">Select day-wise unpaid amounts and process payment</p>
                </div>
            </div>

            {/* Person Summary */}
            {renderPersonSummary()}

            {/* Day-wise Unpaid Details */}
            {renderDayWiseDetails()}

            {/* Payment Form */}
            {renderPaymentForm()}
        </div>
    );
};

export default ExpenseSettlementDetails;