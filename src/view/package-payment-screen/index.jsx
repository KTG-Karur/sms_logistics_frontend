import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { showMessage } from '../../util/AllFunction';
import Table from '../../util/Table';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconPackage from '../../components/Icon/IconBox';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconCheck from '../../components/Icon/IconCheck';

const RecordPayment = () => {
    const dispatch = useDispatch();
    const { customerKey } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { customer } = location.state || {};

    // States
    const [selectedShipments, setSelectedShipments] = useState([]);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [shipmentsList, setShipmentsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [animatePayment, setAnimatePayment] = useState(false);

    useEffect(() => {
        if (customer && customer.shipments) {
            dispatch(setPageTitle(`Record Payment - ${customer.name}`));
            setShipmentsList(customer.shipments);
            // Select all shipments by default
            setSelectedShipments(customer.shipments.map(s => s.id));
            // Set initial payment amount to total due
            const totalDue = customer.shipments.reduce((sum, s) => sum + s.dueAmount, 0);
            setPaymentForm(prev => ({
                ...prev,
                amount: totalDue.toString()
            }));
        } else {
            showMessage('error', 'Customer data not found');
            navigate('/payments/pending');
        }
    }, [customer, dispatch, navigate]);

    // Calculate selected totals
    const calculateSelectedTotals = () => {
        const selected = shipmentsList.filter(s => selectedShipments.includes(s.id));
        const totalDue = selected.reduce((sum, s) => sum + s.dueAmount, 0);
        const totalAmount = selected.reduce((sum, s) => sum + s.totalAmount, 0);
        const paidAmount = selected.reduce((sum, s) => sum + s.paidAmount, 0);
        
        return { totalDue, totalAmount, paidAmount, count: selected.length };
    };

    // Toggle shipment selection
    const toggleShipmentSelection = (shipmentId) => {
        setSelectedShipments(prev => {
            if (prev.includes(shipmentId)) {
                return prev.filter(id => id !== shipmentId);
            } else {
                return [...prev, shipmentId];
            }
        });
    };

    // Select all shipments on current page
    const selectAllOnPage = () => {
        const pageShipments = getPaginatedData();
        const allSelected = pageShipments.every(s => selectedShipments.includes(s.id));
        
        if (allSelected) {
            // Deselect all on page
            setSelectedShipments(prev => prev.filter(id => 
                !pageShipments.some(s => s.id === id)
            ));
        } else {
            // Select all on page
            const newSelected = [...selectedShipments];
            pageShipments.forEach(s => {
                if (!newSelected.includes(s.id)) {
                    newSelected.push(s.id);
                }
            });
            setSelectedShipments(newSelected);
        }
    };

    // Quick amount buttons with animation
    const handleQuickAmount = (percentage) => {
        const { totalDue } = calculateSelectedTotals();
        const amount = Math.round(totalDue * percentage);
        setPaymentForm(prev => ({
            ...prev,
            amount: amount.toString()
        }));
        setAnimatePayment(true);
        setTimeout(() => setAnimatePayment(false), 1000);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        const paymentAmount = parseFloat(paymentForm.amount) || 0;
        const { totalDue } = calculateSelectedTotals();

        if (selectedShipments.length === 0) {
            newErrors.shipments = 'Please select at least one shipment';
        }

        if (!paymentForm.amount || paymentAmount <= 0) {
            newErrors.amount = 'Valid payment amount is required';
        } else if (paymentAmount > totalDue) {
            newErrors.amount = `Payment amount cannot exceed total due (₹${totalDue})`;
        }

        if (!paymentForm.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!validateForm()) {
            showMessage('error', 'Please fix all errors');
            return;
        }

        const paymentAmount = parseFloat(paymentForm.amount);
        const { totalDue } = calculateSelectedTotals();

        // Simulate payment distribution
        const updatedShipments = [...shipmentsList];
        let remainingAmount = paymentAmount;

        selectedShipments.forEach(shipmentId => {
            if (remainingAmount <= 0) return;

            const shipmentIndex = updatedShipments.findIndex(s => s.id === shipmentId);
            if (shipmentIndex !== -1) {
                const shipment = updatedShipments[shipmentIndex];
                // Calculate proportional amount
                const proportion = shipment.dueAmount / totalDue;
                const amountToApply = Math.min(remainingAmount, Math.round(paymentAmount * proportion));

                updatedShipments[shipmentIndex].paidAmount += amountToApply;
                updatedShipments[shipmentIndex].dueAmount -= amountToApply;

                // Update payment status
                if (updatedShipments[shipmentIndex].dueAmount <= 0) {
                    updatedShipments[shipmentIndex].paymentStatus = 'completed';
                    updatedShipments[shipmentIndex].status = 'completed';
                } else if (updatedShipments[shipmentIndex].paidAmount > 0) {
                    updatedShipments[shipmentIndex].paymentStatus = 'partial';
                }

                remainingAmount -= amountToApply;
            }
        });

        setShipmentsList(updatedShipments);

        // Show success message with animation
        showMessage('success', `🎉 Payment of ₹${paymentAmount} recorded successfully for ${selectedShipments.length} shipment(s)`);

        // Redirect back after 1.5 seconds
        setTimeout(() => {
            navigate('/payments/pending');
        }, 1500);
    };

    // Calculate selected totals
    const selectedTotals = calculateSelectedTotals();

    // Table columns for shipments
    const shipmentColumns = [
        {
            Header: () => (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={getPaginatedData().every(s => selectedShipments.includes(s.id))}
                        onChange={selectAllOnPage}
                        className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary transition-all duration-300"
                    />
                    <span className="ml-2 font-bold">SELECT</span>
                </div>
            ),
            accessor: 'select',
            Cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={selectedShipments.includes(row.original.id)}
                    onChange={() => toggleShipmentSelection(row.original.id)}
                    className="w-5 h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary transform hover:scale-110 transition-all duration-300"
                />
            ),
            width: 80,
        },
        {
            Header: 'SHIPMENT ID',
            accessor: 'id',
            Cell: ({ value }) => (
                <div className="font-bold text-lg text-gray-900 transform hover:scale-105 transition-all duration-300">
                    #{value}
                </div>
            ),
            width: 100,
        },
        {
            Header: 'ROUTE',
            accessor: 'route',
            Cell: ({ row }) => (
                <div className="space-y-2">
                    <div className="flex items-center text-sm animate-slideIn">
                        <IconMapPin className="w-4 h-4 mr-2 text-blue-500 animate-pulse" />
                        <span className="font-medium text-gray-700">{row.original.fromCenter}</span>
                    </div>
                    <div className="flex items-center text-sm animate-slideIn" style={{ animationDelay: '0.1s' }}>
                        <IconMapPin className="w-4 h-4 mr-2 text-green-500" />
                        <span className="font-medium text-gray-700">{row.original.toCenter}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">📅 {row.original.date}</div>
                </div>
            ),
        },
        {
            Header: 'PACKAGE DETAILS',
            accessor: 'details',
            Cell: ({ row }) => (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {row.original.packageDetails.map((detail, idx) => (
                            <span 
                                key={idx} 
                                className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg text-sm transform hover:scale-105 transition-all duration-300"
                            >
                                📦 {detail.packageType} × {detail.quantity}
                            </span>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500">
                        Total: ₹{row.original.totalAmount}
                    </div>
                </div>
            ),
        },
        {
            Header: 'PAYMENT STATUS',
            accessor: 'paymentStatus',
            Cell: ({ value, row }) => {
                const statusConfig = {
                    pending: { 
                        color: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800',
                        icon: '⏳',
                        label: 'Pending'
                    },
                    partial: { 
                        color: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800',
                        icon: '💰',
                        label: 'Partial'
                    },
                    completed: { 
                        color: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800',
                        icon: '✅',
                        label: 'Completed'
                    }
                };
                const config = statusConfig[value] || statusConfig.pending;
                return (
                    <div className="space-y-2">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center justify-center ${config.color} transform hover:scale-105 transition-all duration-300`}>
                            <span className="mr-2">{config.icon}</span>
                            {config.label}
                        </span>
                        <div className="text-center text-xs text-gray-500">
                            Due: <span className={`font-bold ${row.original.dueAmount > 0 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                                ₹{row.original.dueAmount}
                            </span>
                        </div>
                    </div>
                );
            },
            width: 140,
        },
        {
            Header: 'AMOUNT BREAKDOWN',
            accessor: 'amount',
            Cell: ({ row }) => (
                <div className="space-y-2">
                    <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">₹{row.original.totalAmount}</div>
                        <div className="text-sm">
                            <span className="text-gray-600">Paid: </span>
                            <span className="font-medium text-green-600">₹{row.original.paidAmount}</span>
                        </div>
                        {row.original.dueAmount > 0 && (
                            <div className="text-sm mt-1">
                                <span className="text-gray-600">Due: </span>
                                <span className="font-bold text-red-600 animate-pulse">₹{row.original.dueAmount}</span>
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
    ];

    // Pagination for shipments table
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return shipmentsList.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return shipmentsList.length;
    };

    if (!customer || !shipmentsList) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading customer data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/payments/pending')}
                    className="btn btn-outline-secondary btn-lg mb-6 flex items-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                >
                    <IconArrowLeft className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </button>

                <div className="bg-gradient-to-r from-primary/10 via-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-primary/20 shadow-xl transform hover:shadow-2xl transition-all duration-500">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {customer.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Record Payment for {customer.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 mt-3">
                                    <span className="text-gray-600 flex items-center">
                                        📱 {customer.mobile}
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <span className={`px-4 py-2 rounded-full font-bold flex items-center ${
                                        customer.paymentBy === 'from' 
                                            ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                                            : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                                    }`}>
                                        {customer.paymentBy === 'from' ? '💳 Sender Pays' : '💳 Receiver Pays'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-red-600 animate-pulse">₹{customer.totalDue}</div>
                            <div className="text-gray-600 text-lg">Total Due Amount</div>
                            <div className="text-sm text-gray-500 mt-2">
                                {customer.shipmentCount} shipment{customer.shipmentCount !== 1 ? 's' : ''} pending
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Shipments Table */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform hover:shadow-2xl transition-all duration-500">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Select Shipments for Payment</h2>
                                    <p className="text-gray-600 mt-2">
                                        {selectedShipments.length} of {shipmentsList.length} shipments selected
                                        {selectedTotals.count > 0 && (
                                            <span className="ml-2 text-red-600 font-bold animate-pulse">
                                                • ₹{selectedTotals.totalDue} total due
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="px-4 py-2 bg-primary/10 rounded-lg">
                                        <span className="text-primary font-bold">
                                            Page {currentPage + 1} of {Math.ceil(getTotalCount() / pageSize)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {errors.shipments && (
                            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 animate-shake">
                                <p className="text-red-600 font-medium flex items-center">
                                    <span className="mr-2">⚠️</span>
                                    {errors.shipments}
                                </p>
                            </div>
                        )}

                        <div className="p-2">
                            <Table
                                columns={shipmentColumns}
                                Title={''}
                                description=""
                                toggle={false}
                                data={getPaginatedData()}
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                totalCount={getTotalCount()}
                                totalPages={Math.ceil(getTotalCount() / pageSize)}
                                onPaginationChange={handlePaginationChange}
                                onSearchChange={() => {}}
                                pagination={true}
                                isSearchable={false}
                                isSortable={true}
                                showPageSize={true}
                                responsive={true}
                                className="border-0 hover:shadow-inner transition-all duration-300"
                            />
                        </div>

                        {/* Selected Summary */}
                        {selectedShipments.length > 0 && (
                            <div className="border-t border-gray-200 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 transform hover:scale-[1.02] transition-all duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                        <div className="text-sm font-medium text-gray-600">Selected Shipments</div>
                                        <div className="text-4xl font-bold text-primary mt-2 animate-count">
                                            {selectedShipments.length}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">Ready for payment</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                        <div className="text-sm font-medium text-gray-600">Total Due Amount</div>
                                        <div className="text-4xl font-bold text-red-600 mt-2 animate-pulse">
                                            ₹{selectedTotals.totalDue}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">To be collected</div>
                                    </div>
                                    <div className="text-center p-4 bg-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                                        <div className="text-sm font-medium text-gray-600">Already Paid</div>
                                        <div className="text-4xl font-bold text-green-600 mt-2">
                                            ₹{selectedTotals.paidAmount}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">Previously collected</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Payment Form */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden h-fit sticky top-8 transform hover:shadow-3xl transition-all duration-500">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-blue-600">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <IconDollarSign className="w-8 h-8 mr-3" />
                                Payment Recording
                            </h2>
                            <p className="text-white/80 mt-2">Complete payment transaction</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Payment Amount */}
                                <div className={`transform transition-all duration-500 ${animatePayment ? 'scale-105' : ''}`}>
                                    <label className="block text-lg font-bold text-gray-900 mb-3">
                                        💰 Payment Amount
                                        <span className="text-sm text-gray-500 ml-2">(Max: ₹{selectedTotals.totalDue})</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-primary">₹</span>
                                        <input
                                            type="number"
                                            value={paymentForm.amount}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const numValue = parseFloat(value);
                                                if (value === '' || (numValue >= 0 && numValue <= selectedTotals.totalDue)) {
                                                    setPaymentForm({...paymentForm, amount: value});
                                                    if (errors.amount) {
                                                        setErrors({...errors, amount: null});
                                                    }
                                                }
                                            }}
                                            className={`form-input w-full pl-12 pr-4 py-4 text-xl rounded-xl border-2 ${
                                                errors.amount ? 'border-red-500' : 'border-gray-300'
                                            } focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300`}
                                            placeholder="Enter amount"
                                            min="0"
                                            max={selectedTotals.totalDue}
                                            step="0.01"
                                        />
                                    </div>
                                    {errors.amount && (
                                        <p className="mt-2 text-red-600 font-medium animate-shake">⚠️ {errors.amount}</p>
                                    )}

                                    {/* Quick Amount Buttons */}
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAmount(0.25)}
                                            className="px-4 py-3 text-sm border-2 border-blue-200 text-blue-700 rounded-xl hover:bg-blue-50 hover:border-blue-500 hover:scale-105 transition-all duration-300 active:scale-95"
                                        >
                                            25% = ₹{Math.round(selectedTotals.totalDue * 0.25)}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAmount(0.5)}
                                            className="px-4 py-3 text-sm border-2 border-green-200 text-green-700 rounded-xl hover:bg-green-50 hover:border-green-500 hover:scale-105 transition-all duration-300 active:scale-95"
                                        >
                                            50% = ₹{Math.round(selectedTotals.totalDue * 0.5)}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAmount(0.75)}
                                            className="px-4 py-3 text-sm border-2 border-orange-200 text-orange-700 rounded-xl hover:bg-orange-50 hover:border-orange-500 hover:scale-105 transition-all duration-300 active:scale-95"
                                        >
                                            75% = ₹{Math.round(selectedTotals.totalDue * 0.75)}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAmount(1)}
                                            className="px-4 py-3 text-sm border-2 border-primary text-primary rounded-xl hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300 active:scale-95"
                                        >
                                            💯 Full = ₹{selectedTotals.totalDue}
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Date */}
                                <div className="transform transition-all duration-500" style={{ animationDelay: '0.1s' }}>
                                    <label className="block text-lg font-bold text-gray-900 mb-3">📅 Payment Date</label>
                                    <div className="relative">
                                        <IconCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                                        <input
                                            type="date"
                                            value={paymentForm.paymentDate}
                                            onChange={(e) => {
                                                setPaymentForm({...paymentForm, paymentDate: e.target.value});
                                                if (errors.paymentDate) {
                                                    setErrors({...errors, paymentDate: null});
                                                }
                                            }}
                                            className={`form-input w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 ${
                                                errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                                            } focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300`}
                                        />
                                    </div>
                                    {errors.paymentDate && (
                                        <p className="mt-2 text-red-600 font-medium animate-shake">⚠️ {errors.paymentDate}</p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="transform transition-all duration-500" style={{ animationDelay: '0.2s' }}>
                                    <label className="block text-lg font-bold text-gray-900 mb-3">📝 Payment Notes (Optional)</label>
                                    <textarea
                                        value={paymentForm.notes}
                                        onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                                        className="form-textarea w-full rounded-xl border-2 border-gray-300 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
                                        placeholder="Enter payment reference or notes..."
                                        rows="4"
                                    />
                                </div>

                                {/* Payment Summary */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-blue-200 transform hover:scale-[1.02] transition-all duration-500">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">💳 Payment Summary</h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                            <span className="text-gray-700 font-medium">Selected Shipments:</span>
                                            <span className="font-bold text-primary">{selectedShipments.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                            <span className="text-gray-700 font-medium">Total Due Amount:</span>
                                            <span className="font-bold">₹{selectedTotals.totalDue}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                            <span className="text-gray-700 font-medium">Payment Amount:</span>
                                            <span className="font-bold text-green-600 text-xl">
                                                ₹{parseFloat(paymentForm.amount || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="border-t-2 border-blue-200 pt-4 mt-4">
                                            <div className="flex justify-between items-center text-xl font-bold">
                                                <span>Remaining Due:</span>
                                                <span className="text-red-600 animate-pulse">
                                                    ₹{(selectedTotals.totalDue - parseFloat(paymentForm.amount || 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={selectedShipments.length === 0 || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                                        className="btn btn-success w-full py-4 mt-6 flex items-center justify-center text-lg font-bold transform hover:scale-105 transition-all duration-300 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <IconDollarSign className="w-6 h-6 mr-3" />
                                        Record Payment of ₹{parseFloat(paymentForm.amount || 0).toFixed(2)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordPayment;