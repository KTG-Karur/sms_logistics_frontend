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

    useEffect(() => {
        if (customer && customer.shipments) {
            dispatch(setPageTitle(`Record Payment - ${customer.name}`));
            setShipmentsList(customer.shipments);
            // Select all shipments by default
            setSelectedShipments(customer.shipments.map(s => s.id));
            // Calculate initial total due for all shipments
            const totalDue = customer.shipments.reduce((sum, s) => sum + s.dueAmount, 0);
            setPaymentForm(prev => ({
                ...prev,
                amount: totalDue.toString()
            }));
        } else {
            showMessage('error', 'Customer data not found');
            navigate('/package/payment');
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
            let newSelected;
            if (prev.includes(shipmentId)) {
                newSelected = prev.filter(id => id !== shipmentId);
            } else {
                newSelected = [...prev, shipmentId];
            }
            
            // Update payment amount to match new selected total
            if (newSelected.length > 0) {
                const selectedShipmentsData = shipmentsList.filter(s => newSelected.includes(s.id));
                const newTotalDue = selectedShipmentsData.reduce((sum, s) => sum + s.dueAmount, 0);
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
        const allSelected = pageShipments.every(s => selectedShipments.includes(s.id));
        
        if (allSelected) {
            // Deselect all on page
            const newSelected = selectedShipments.filter(id => 
                !pageShipments.some(s => s.id === id)
            );
            setSelectedShipments(newSelected);
            
            // Recalculate total due for remaining selected shipments
            const remainingSelected = shipmentsList.filter(s => newSelected.includes(s.id));
            const newTotalDue = remainingSelected.reduce((sum, s) => sum + s.dueAmount, 0);
            setPaymentForm(prev => ({
                ...prev,
                amount: newTotalDue > 0 ? newTotalDue.toString() : ''
            }));
        } else {
            // Select all on page
            const newSelected = [...selectedShipments];
            pageShipments.forEach(s => {
                if (!newSelected.includes(s.id)) {
                    newSelected.push(s.id);
                }
            });
            setSelectedShipments(newSelected);
            
            // Calculate new total due including newly selected shipments
            const selectedShipmentsData = shipmentsList.filter(s => newSelected.includes(s.id));
            const newTotalDue = selectedShipmentsData.reduce((sum, s) => sum + s.dueAmount, 0);
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
            newErrors.amount = `Payment amount cannot exceed total due (₹${totalDue})`;
        }

        if (!paymentForm.paymentDate) {
            newErrors.paymentDate = 'Payment date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission with confirmation
    const handleSubmit = () => {
        if (!validateForm()) {
            showMessage('error', 'Please fix all errors');
            return;
        }

        const paymentAmount = parseFloat(paymentForm.amount);
        const { totalDue } = calculateSelectedTotals();
        
        showMessage('warning', `Are you sure you want to record payment of ₹${paymentAmount} for ${selectedShipments.length} shipment(s)?`, () => {
            // Payment confirmed - process payment
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

            // Show success message
            showMessage('success', `Payment of ₹${paymentAmount} recorded successfully`);

            // Redirect back after 1.5 seconds
            setTimeout(() => {
                navigate('/package/payment');
            }, 1500);
        });
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
                        className="w-4 h-4 md:w-5 md:h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                    />
                    <span className="ml-2 font-bold text-sm md:text-base">SELECT</span>
                </div>
            ),
            accessor: 'select',
            Cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={selectedShipments.includes(row.original.id)}
                    onChange={() => toggleShipmentSelection(row.original.id)}
                    className="w-4 h-4 md:w-5 md:h-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary"
                />
            ),
            width: 70,
        },
        {
            Header: 'SHIPMENT',
            accessor: 'id',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-gray-900 text-sm md:text-base">#{row.original.id}</div>
                    <div className="text-xs text-gray-500 mt-1">{row.original.date}</div>
                    <div className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.original.paymentBy === 'from' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                            {row.original.paymentBy === 'from' ? 'Sender Pays' : 'Receiver Pays'}
                        </span>
                    </div>
                </div>
            ),
            width: 120,
        },
        {
            Header: 'AMOUNT',
            accessor: 'amount',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-gray-900">₹{row.original.totalAmount}</div>
                    <div className="text-xs text-gray-500">Due: ₹{row.original.dueAmount}</div>
                </div>
            ),
            width: 100,
        },
        {
            Header: 'STATUS',
            accessor: 'paymentStatus',
            Cell: ({ value, row }) => {
                const statusConfig = {
                    pending: { 
                        color: 'bg-yellow-100 text-yellow-800',
                        icon: <IconX className="w-3 h-3" />,
                        label: 'Due'
                    },
                    partial: { 
                        color: 'bg-orange-100 text-orange-800',
                        icon: '💰',
                        label: 'Partial'
                    },
                    completed: { 
                        color: 'bg-green-100 text-green-800',
                        icon: <IconCheck className="w-3 h-3" />,
                        label: 'Paid'
                    }
                };
                const config = statusConfig[value] || statusConfig.pending;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center ${config.color}`}>
                        <span className="mr-1">{config.icon}</span>
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
                                <div className="font-bold text-lg text-red-600">₹{customer.totalDue}</div>
                                <div className="text-xs text-gray-500">Total Due</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 mb-1">
                            Record Payment for {customer.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center">
                                <IconPhone className="w-3 h-3 mr-1" />
                                {customer.mobile}
                            </span>
                            <span>•</span>
                            <span>
                                {customer.shipmentCount} shipment{customer.shipmentCount !== 1 ? 's' : ''}
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
                                                • ₹{selectedTotals.totalDue} due
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
                                onSearchChange={() => {}}
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
                                    Payment Amount
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
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-red-600 text-xs">⚠️ {errors.amount}</p>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                    Max: ₹{selectedTotals.totalDue}
                                </div>
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Payment Date
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
                                    />
                                </div>
                                {errors.paymentDate && (
                                    <p className="mt-1 text-red-600 text-xs">⚠️ {errors.paymentDate}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={paymentForm.notes}
                                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                                    className="form-textarea w-full rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="Enter payment notes..."
                                    rows="3"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={selectedShipments.length === 0 || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                                className="btn btn-success w-full py-3 mt-2 flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <IconDollarSign className="w-5 h-5 mr-2" />
                                Record Payment
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