import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { showMessage } from '../../util/AllFunction';
import Table from '../../util/Table';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconArrowLeft from '../../components/Icon/IconArrowLeft';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconPhone from '../../components/Icon/IconPhone';
import IconUser from '../../components/Icon/IconUser';
import { makeCustomerBulkPayment, resetCustomerPaymentStatus, getCustomerBookingsAndPayments } from '../../redux/customerPaymentSlice';

const RecordPayment = () => {
    const dispatch = useDispatch();
    const { customerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { customer } = location.state || {};

    // States
    const [selectedShipments, setSelectedShipments] = useState([]);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'cash',
        description: '',
        bookingIds: []
    });
    const [errors, setErrors] = useState({});
    const [shipmentsList, setShipmentsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [processing, setProcessing] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [loadingBookings, setLoadingBookings] = useState(false);

    // Payment mode options
    const paymentModes = [
        { value: 'cash', label: 'Cash' },
        // { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
        // { value: 'bank_transfer', label: 'Bank Transfer' },
        // { value: 'cheque', label: 'Cheque' },
        // { value: 'wallet', label: 'Wallet' }
    ];

    useEffect(() => {
        dispatch(setPageTitle('Record Payment'));
        
        if (customer && customer.customer_id) {
            setCustomerData(customer);
            fetchCustomerBookings(customer.customer_id);
        } else if (customerId) {
            // If customer data not passed via state, fetch it
            fetchCustomerBookings(customerId);
        } else {
            showMessage('error', 'Customer data not found');
            navigate('/package/payment');
        }
    }, [customer, customerId, dispatch, navigate]);

    const fetchCustomerBookings = async (id) => {
        setLoadingBookings(true);
        try {
            const result = await dispatch(getCustomerBookingsAndPayments({ 
                customerId: id, 
            })).unwrap();
            
            if (result?.data) {
                const bookings = result.data.bookings || [];
                // Filter only bookings with due amount > 0
                const pendingBookings = bookings.filter(b => parseFloat(b.due_amount) > 0);
                
                setShipmentsList(pendingBookings);
                
                // Select all pending shipments by default
                const pendingIds = pendingBookings.map(b => b.booking_id);
                setSelectedShipments(pendingIds);
                
                // Calculate initial total due for all pending shipments
                const totalDue = pendingBookings.reduce((sum, b) => sum + parseFloat(b.due_amount || 0), 0);
                setPaymentForm(prev => ({
                    ...prev,
                    amount: totalDue.toString()
                }));
            }
        } catch (error) {
            console.error('Error fetching customer bookings:', error);
            showMessage('error', 'Failed to load customer bookings');
        } finally {
            setLoadingBookings(false);
        }
    };

    // Calculate selected totals
    const calculateSelectedTotals = () => {
        const selected = shipmentsList.filter(s => selectedShipments.includes(s.booking_id));
        const totalDue = selected.reduce((sum, s) => sum + parseFloat(s.due_amount || 0), 0);
        const totalAmount = selected.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
        const paidAmount = selected.reduce((sum, s) => sum + parseFloat(s.paid_amount || 0), 0);
        
        return { totalDue, totalAmount, paidAmount, count: selected.length };
    };

    // Toggle shipment selection
    const toggleShipmentSelection = (shipmentId) => {
        setSelectedShipments(prev => {
            let newSelected;
            if (prev.includes(shipmentId)) {
                newSelected = prev.filter(id => id !== shipmentId);
            } else {
                newSelected = [...prev, shipmentId];
            }
            
            // Update payment amount to match new selected total
            if (newSelected.length > 0) {
                const selectedShipmentsData = shipmentsList.filter(s => newSelected.includes(s.booking_id));
                const newTotalDue = selectedShipmentsData.reduce((sum, s) => sum + parseFloat(s.due_amount || 0), 0);
                setPaymentForm(prevForm => ({
                    ...prevForm,
                    amount: newTotalDue.toString()
                }));
            } else {
                setPaymentForm(prevForm => ({
                    ...prevForm,
                    amount: ''
                }));
            }
            
            return newSelected;
        });
    };

    // Select all shipments on current page
    const selectAllOnPage = () => {
        const pageShipments = getPaginatedData();
        const allSelected = pageShipments.every(s => selectedShipments.includes(s.booking_id));
        
        if (allSelected) {
            // Deselect all on page
            const newSelected = selectedShipments.filter(id => 
                !pageShipments.some(s => s.booking_id === id)
            );
            setSelectedShipments(newSelected);
            
            // Recalculate total due for remaining selected shipments
            const remainingSelected = shipmentsList.filter(s => newSelected.includes(s.booking_id));
            const newTotalDue = remainingSelected.reduce((sum, s) => sum + parseFloat(s.due_amount || 0), 0);
            setPaymentForm(prev => ({
                ...prev,
                amount: newTotalDue > 0 ? newTotalDue.toString() : ''
            }));
        } else {
            // Select all on page
            const newSelected = [...selectedShipments];
            pageShipments.forEach(s => {
                if (!newSelected.includes(s.booking_id)) {
                    newSelected.push(s.booking_id);
                }
            });
            setSelectedShipments(newSelected);
            
            // Calculate new total due including newly selected shipments
            const selectedShipmentsData = shipmentsList.filter(s => newSelected.includes(s.booking_id));
            const newTotalDue = selectedShipmentsData.reduce((sum, s) => sum + parseFloat(s.due_amount || 0), 0);
            setPaymentForm(prev => ({
                ...prev,
                amount: newTotalDue.toString()
            }));
        }
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
            newErrors.amount = `Payment amount cannot exceed total due (₹${totalDue.toFixed(2)})`;
        }

        if (!paymentForm.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

        if (!paymentForm.paymentMode) {
            newErrors.paymentMode = 'Payment mode is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) {
            showMessage('error', 'Please fix all errors');
            return;
        }

        const paymentAmount = parseFloat(paymentForm.amount);
        const { totalDue, count } = calculateSelectedTotals();
        
        showMessage(
            'warning', 
            `Are you sure you want to record payment of ₹${paymentAmount.toFixed(2)} for ${count} shipment(s)?`, 
            async () => {
                setProcessing(true);
                
                try {
                    const paymentData = {
                        amount: paymentAmount,
                        paymentMode: paymentForm.paymentMode,
                        paymentDate: paymentForm.paymentDate,
                        description: paymentForm.description || `Payment for ${count} shipment(s)`,
                        bookingIds: selectedShipments
                    };

                    const result = await dispatch(makeCustomerBulkPayment({
                        customerId: customerId || customer?.customer_id,
                        paymentData,
                        type: 'sender' // Default to sender
                    })).unwrap();

                    if (result?.data) {
                        showMessage('success', `Payment of ₹${paymentAmount.toFixed(2)} recorded successfully`);
                        
                        // Redirect back after 1.5 seconds
                        setTimeout(() => {
                            navigate('/package/payment');
                        }, 1500);
                    }
                } catch (error) {
                    console.error('Payment error:', error);
                    showMessage('error', error.message || 'Failed to process payment');
                } finally {
                    setProcessing(false);
                    dispatch(resetCustomerPaymentStatus());
                }
            },
            'Yes, process payment'
        );
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
                        checked={getPaginatedData().length > 0 && getPaginatedData().every(s => selectedShipments.includes(s.booking_id))}
                        onChange={selectAllOnPage}
                        className="w-4 h-4 md:w-5 md:h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-2 font-bold text-sm md:text-base">SELECT</span>
                </div>
            ),
            accessor: 'select',
            Cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={selectedShipments.includes(row.original.booking_id)}
                    onChange={() => toggleShipmentSelection(row.original.booking_id)}
                    className="w-4 h-4 md:w-5 md:h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
            ),
            width: 70,
        },
        {
            Header: 'SHIPMENT',
            accessor: 'booking_number',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-gray-900 text-sm md:text-base">#{row.original.booking_number}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(row.original.booking_date).toLocaleDateString()}</div>
                    <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.original.payment_by === 'sender' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                            {row.original.payment_by === 'sender' ? 'Sender Pays' : 'Receiver Pays'}
                        </span>
                    </div>
                </div>
            ),
            width: 120,
        },
        {
            Header: 'FROM/TO',
            accessor: 'route',
            Cell: ({ row }) => (
                <div>
                    <div className="text-xs">
                        <span className="font-medium">From:</span> {row.original.fromCenter?.office_center_name || 'N/A'}
                    </div>
                    <div className="text-xs mt-1">
                        <span className="font-medium">To:</span> {row.original.toCenter?.office_center_name || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            Header: 'AMOUNT',
            accessor: 'amount',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-gray-900">₹{parseFloat(row.original.total_amount).toFixed(2)}</div>
                    <div className="text-xs text-red-600 font-medium">Due: ₹{parseFloat(row.original.due_amount).toFixed(2)}</div>
                </div>
            ),
            width: 100,
        },
        {
            Header: 'STATUS',
            accessor: 'payment_status',
            Cell: ({ value }) => {
                const statusConfig = {
                    pending: { 
                        color: 'bg-yellow-100 text-yellow-800',
                        label: 'Due'
                    },
                    partial: { 
                        color: 'bg-orange-100 text-orange-800',
                        label: 'Partial'
                    },
                    completed: { 
                        color: 'bg-green-100 text-green-800',
                        label: 'Paid'
                    }
                };
                const config = statusConfig[value] || statusConfig.pending;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {value === 'pending' ? 'Due' : value === 'partial' ? 'Partial' : 'Paid'}
                    </span>
                );
            },
            width: 80,
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

    if (loadingBookings) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading customer bookings...</p>
                </div>
            </div>
        );
    }

    if (!customerData && shipmentsList.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <p className="text-gray-600">No pending payments found for this customer.</p>
                    <button
                        onClick={() => navigate('/package/payment')}
                        className="btn btn-primary mt-4"
                    >
                        Back to Payment Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4 md:py-6">
            {/* Mobile Header */}
            <div className="mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => navigate('/package/payment')}
                            className="btn btn-outline-secondary btn-sm flex items-center"
                        >
                            <IconArrowLeft className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                                <IconUser className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-lg text-red-600">₹{selectedTotals.totalDue.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">Selected Due</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">
                            Record Payment for {customerData?.customer_name || 'Customer'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center">
                                <IconPhone className="w-3 h-3 mr-1" />
                                {customerData?.customer_number}
                            </span>
                            <span>•</span>
                            <span>
                                {shipmentsList.length} pending shipment{shipmentsList.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Shipments Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Select Shipments</h2>
                                    <p className="text-gray-600 text-sm">
                                        {selectedShipments.length} of {shipmentsList.length} selected
                                        {selectedTotals.count > 0 && (
                                            <span className="ml-2 text-red-600 font-bold">
                                                • ₹{selectedTotals.totalDue.toFixed(2)} due
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    Page {currentPage + 1} of {Math.ceil(getTotalCount() / pageSize)}
                                </div>
                            </div>
                        </div>

                        {errors.shipments && (
                            <div className="p-3 bg-red-50 border-b border-red-200">
                                <p className="text-red-600 text-sm flex items-center">
                                    <IconX className="w-4 h-4 mr-2" />
                                    {errors.shipments}
                                </p>
                            </div>
                        )}

                        <div className="p-1">
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
                                pagination={true}
                                isSearchable={false}
                                isSortable={true}
                                showPageSize={true}
                                responsive={true}
                                className="border-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
                        <div className="p-4 border-b border-gray-200 bg-primary">
                            <h2 className="text-lg font-bold text-white flex items-center">
                                <IconDollarSign className="w-5 h-5 mr-2" />
                                Payment Details
                            </h2>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Payment Amount */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Payment Amount <span className="text-danger">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
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
                                        className={`form-input w-full pl-8 pr-3 py-2 rounded-lg border ${errors.amount ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary`}
                                        placeholder="Enter amount"
                                        min="0"
                                        max={selectedTotals.totalDue}
                                        step="0.01"
                                        disabled={processing}
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-red-600 text-xs">⚠️ {errors.amount}</p>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                    Max: ₹{selectedTotals.totalDue.toFixed(2)}
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Payment Mode <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={paymentForm.paymentMode}
                                    onChange={(e) => {
                                        setPaymentForm({...paymentForm, paymentMode: e.target.value});
                                        if (errors.paymentMode) {
                                            setErrors({...errors, paymentMode: null});
                                        }
                                    }}
                                    className={`form-select w-full py-2 rounded-lg border ${errors.paymentMode ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary`}
                                    disabled={processing}
                                >
                                    {paymentModes.map(mode => (
                                        <option key={mode.value} value={mode.value}>
                                            {mode.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.paymentMode && (
                                    <p className="mt-1 text-red-600 text-xs">⚠️ {errors.paymentMode}</p>
                                )}
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Payment Date <span className="text-danger">*</span>
                                </label>
                                <div className="relative">
                                    <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={paymentForm.paymentDate}
                                        onChange={(e) => {
                                            setPaymentForm({...paymentForm, paymentDate: e.target.value});
                                            if (errors.paymentDate) {
                                                setErrors({...errors, paymentDate: null});
                                            }
                                        }}
                                        className={`form-input w-full pl-10 pr-3 py-2 rounded-lg border ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'} focus:border-primary focus:ring-1 focus:ring-primary`}
                                        disabled={processing}
                                    />
                                </div>
                                {errors.paymentDate && (
                                    <p className="mt-1 text-red-600 text-xs">⚠️ {errors.paymentDate}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={paymentForm.description}
                                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                                    className="form-textarea w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="Enter payment description..."
                                    rows="3"
                                    disabled={processing}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={selectedShipments.length === 0 || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0 || processing}
                                className="btn btn-success w-full py-3 mt-2 flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <IconDollarSign className="w-5 h-5 mr-2" />
                                        Record Payment
                                    </>
                                )}
                            </button>

                            {/* Quick Summary */}
                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-600">Shipments:</div>
                                    <div className="font-bold text-right">{selectedShipments.length}</div>
                                    
                                    <div className="text-gray-600">Amount:</div>
                                    <div className="font-bold text-green-600 text-right">
                                        ₹{parseFloat(paymentForm.amount || 0).toFixed(2)}
                                    </div>

                                    <div className="text-gray-600">Remaining:</div>
                                    <div className="font-bold text-red-600 text-right">
                                        ₹{(selectedTotals.totalDue - parseFloat(paymentForm.amount || 0)).toFixed(2)}
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

export default RecordPayment;