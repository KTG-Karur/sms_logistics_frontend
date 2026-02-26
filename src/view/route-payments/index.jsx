import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import { showMessage , getAccessIdsByLabel } from '../../util/AllFunction';
import Table from '../../util/Table';
import ModelViewBox from '../../util/ModelViewBox';
import Select from 'react-select';
import moment from 'moment';
import * as XLSX from 'xlsx';
import _ from 'lodash';

// Icons
import IconSearch from '../../components/Icon/IconSearch';
import IconFilter from '../../components/Icon/IconFilter';
import IconX from '../../components/Icon/IconX';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconDownload from '../../components/Icon/IconFile';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconEye from '../../components/Icon/IconEye';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconTruck from '../../components/Icon/IconTruck';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconUser from '../../components/Icon/IconUser';
import IconPackage from '../../components/Icon/IconBox';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconCalendar from '../../components/Icon/IconCalendar';

// Redux actions
import { getAllBookingsWithDetails, resetBookingsWithDetailsStatus } from '../../redux/reportSlice';
import { getOfficeCentersWithLocations } from '../../redux/officeCenterSlice';
import { addPackagePayment } from '../../redux/packageSlice'; // Import the payment action

// Get login info for employee details
const loginInfo = localStorage.getItem('loginInfo');
const localData = loginInfo ? JSON.parse(loginInfo) : null;
const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Booking Payments');
const currentEmployee = localData?.employeeDetails || null;
const currentUser = localData?.userDetails || null;

// Logged employee ID for collectedBy field
const loggedEmployeeId = localData?.staffId || currentUser?.id || '';



const RoutePayments = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const reportState = useSelector((state) => state.ReportSlice || {});
    const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
    const packageState = useSelector((state) => state.PackageSlice || {});
    
    const { bookingsWithDetailsData = null, loadingBookingsWithDetails = false, getBookingsWithDetailsSuccess = false, errorBookingsWithDetails = null } = reportState;
    const { officeCentersWithLocationsData = [] } = officeCenterState;
    const { addPaymentSuccess = false, addPaymentFailed = false, loading = false } = packageState;

    // State for filters
    const [filters, setFilters] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
        fromCenterId: null,
        toCenterId: null,
        paymentStatus: 'all',
        paymentBy: 'all',
        bookingStatus: 'all',
        search: '',
    });

    // State for payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMode: 'cash',
        paymentDate: moment().format('YYYY-MM-DD'),
        description: '',
        customerId: null,
        collectedBy: loggedEmployeeId, // Using logged employee ID
        collectedAtCenter: currentEmployee?.office_center_id || null
    });

    // State for transformed data
    const [summary, setSummary] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [pagination, setPagination] = useState(null);

    // State for dropdown options
    const [centerOptions, setCenterOptions] = useState([]);
    const [showFilters, setShowFilters] = useState(true);
    const [appliedFilters, setAppliedFilters] = useState(null);
    
    // Modal state
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Payment mode options
    const paymentModeOptions = [
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'upi', label: 'UPI' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'wallet', label: 'Wallet' },
    ];

    // Payment status options
    const paymentStatusOptions = [
        { value: 'all', label: 'All Payment Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'partial', label: 'Partial' },
        { value: 'completed', label: 'Completed' },
    ];

    const paymentByOptions = [
        { value: 'all', label: 'All (Sender/Receiver)' },
        { value: 'sender', label: 'Sender Pays' },
        { value: 'receiver', label: 'Receiver Pays' },
    ];

    const bookingStatusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'not_started', label: 'Not Started' },
        { value: 'picked_up', label: 'Picked Up' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Route-wise Payments'));
        fetchInitialData();
    }, [dispatch]);

    // Watch for payment success
    useEffect(() => {
        if (addPaymentSuccess) {
            showMessage('success', 'Payment added successfully');
            setShowPaymentModal(false);
            resetPaymentForm();
            // Refresh the bookings data
            if (appliedFilters) {
                handleSubmit({ preventDefault: () => {} });
            }
        }
        if (addPaymentFailed) {
            showMessage('error', 'Failed to add payment');
        }
    }, [addPaymentSuccess, addPaymentFailed]);

    const fetchInitialData = async () => {
        try {
            await dispatch(getOfficeCentersWithLocations()).unwrap();
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showMessage('error', 'Failed to load office centers');
        }
    };

    useEffect(() => {
        if (officeCentersWithLocationsData && Array.isArray(officeCentersWithLocationsData)) {
            const options = officeCentersWithLocationsData
                .filter(center => center.is_active)
                .map((center) => ({
                    value: center.office_center_id,
                    label: center.office_center_name,
                    data: center,
                }));
            setCenterOptions([{ value: null, label: 'All Centers' }, ...options]);
        }
    }, [officeCentersWithLocationsData]);

    useEffect(() => {
        if (getBookingsWithDetailsSuccess && bookingsWithDetailsData) {
            // Handle the nested data structure from your API
            const responseData = bookingsWithDetailsData.data || bookingsWithDetailsData;
            setSummary(responseData.summary || null);
            setBookings(responseData.bookings || []);
            setPagination(responseData.pagination || null);
            setAppliedFilters({ ...filters });
        }
        if (errorBookingsWithDetails) {
            showMessage('error', errorBookingsWithDetails);
            dispatch(resetBookingsWithDetailsStatus());
        }
    }, [getBookingsWithDetailsSuccess, bookingsWithDetailsData, errorBookingsWithDetails]);

    useEffect(() => {
        if (bookings && bookings.length > 0) {
            let filtered = [...bookings];
            
            if (filters.fromCenterId) {
                filtered = filtered.filter(b => b.from_center_id === filters.fromCenterId);
            }
            if (filters.toCenterId) {
                filtered = filtered.filter(b => b.to_center_id === filters.toCenterId);
            }
            
            if (filters.paymentStatus !== 'all') {
                filtered = filtered.filter(b => b.payment_status === filters.paymentStatus);
            }
            
            if (filters.paymentBy !== 'all') {
                filtered = filtered.filter(b => b.payment_by === filters.paymentBy);
            }
            
            if (filters.bookingStatus !== 'all') {
                filtered = filtered.filter(b => b.delivery_status === filters.bookingStatus);
            }
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(b => 
                    b.booking_number?.toLowerCase().includes(searchLower) ||
                    b.fromCustomer?.customer_name?.toLowerCase().includes(searchLower) ||
                    b.toCustomer?.customer_name?.toLowerCase().includes(searchLower) ||
                    b.fromCustomer?.customer_number?.includes(filters.search) ||
                    b.toCustomer?.customer_number?.includes(filters.search)
                );
            }
            
            setFilteredBookings(filtered);
            setCurrentPage(0);
        } else {
            setFilteredBookings([]);
        }
    }, [bookings, filters]);

    const handleFilterChange = (selectedOption, field) => {
        setFilters((prev) => ({
            ...prev,
            [field]: selectedOption ? selectedOption.value : null,
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const request = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            fromCenterId: filters.fromCenterId,
            toCenterId: filters.toCenterId,
            paymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : null,
            paymentBy: filters.paymentBy !== 'all' ? filters.paymentBy : null,
            deliveryStatus: filters.bookingStatus !== 'all' ? filters.bookingStatus : null,
            search: filters.search,
        };

        Object.keys(request).forEach((key) => 
            (request[key] === null || request[key] === undefined || request[key] === '') ? delete request[key] : {}
        );

        try {
            await dispatch(getAllBookingsWithDetails(request)).unwrap();
            setCurrentPage(0);
        } catch (error) {
            showMessage('error', error.message || 'Failed to fetch booking data');
        }
    };

    const handleClear = () => {
        setFilters({
            startDate: moment().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
            fromCenterId: null,
            toCenterId: null,
            paymentStatus: 'all',
            paymentBy: 'all',
            bookingStatus: 'all',
            search: '',
        });
        setAppliedFilters(null);
        setSummary(null);
        setBookings([]);
        setFilteredBookings([]);
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    // Function to get the paying customer based on payment_by field
    const getPayingCustomer = (booking) => {
        if (booking.payment_by === 'sender') {
            return {
                customerId: booking.fromCustomer?.customer_id,
                customerName: booking.fromCustomer?.customer_name,
                customerNumber: booking.fromCustomer?.customer_number
            };
        } else if (booking.payment_by === 'receiver') {
            return {
                customerId: booking.toCustomer?.customer_id,
                customerName: booking.toCustomer?.customer_name,
                customerNumber: booking.toCustomer?.customer_number
            };
        }
        return null;
    };

    // Open payment modal for selected booking
    const handleOpenPaymentModal = (booking) => {
        const dueAmount = parseFloat(booking.due_amount) || 0;
        if (dueAmount <= 0) {
            showMessage('info', 'This booking has no pending payment');
            return;
        }

        // Get the paying customer based on payment_by field
        const payingCustomer = getPayingCustomer(booking);

        if (!payingCustomer || !payingCustomer.customerId) {
            showMessage('error', 'Unable to determine paying customer');
            return;
        }

        setSelectedBookingForPayment(booking);
        setPaymentData({
            amount: dueAmount.toString(),
            paymentMode: 'cash',
            paymentDate: moment().format('YYYY-MM-DD'),
            description: `Payment for booking #${booking.booking_number} - ${payingCustomer.customerName}`,
            customerId: payingCustomer.customerId,
            collectedBy: loggedEmployeeId, // Using logged employee ID
            collectedAtCenter: currentEmployee?.office_center_id || booking.from_center_id || null
        });
        setShowPaymentModal(true);
    };

    // Handle payment form input changes
    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentModeChange = (selectedOption) => {
        setPaymentData(prev => ({
            ...prev,
            paymentMode: selectedOption ? selectedOption.value : 'cash'
        }));
    };

    // Reset payment form
    const resetPaymentForm = () => {
        setPaymentData({
            amount: '',
            paymentMode: 'cash',
            paymentDate: moment().format('YYYY-MM-DD'),
            description: '',
            customerId: null,
            collectedBy: loggedEmployeeId,
            collectedAtCenter: currentEmployee?.office_center_id || null
        });
        setSelectedBookingForPayment(null);
    };

    // Submit payment - This directly calls the API endpoint: http://localhost:5098/bookings/{bookingId}/payments
    const handleSubmitPayment = async () => {
        if (!selectedBookingForPayment) return;

        const dueAmount = parseFloat(selectedBookingForPayment.due_amount) || 0;
        const paymentAmount = parseFloat(paymentData.amount) || 0;

        if (paymentAmount <= 0) {
            showMessage('error', 'Please enter a valid amount');
            return;
        }

        if (paymentAmount > dueAmount) {
            showMessage('error', `Payment amount cannot exceed due amount of ₹${dueAmount.toFixed(2)}`);
            return;
        }

        if (!paymentData.paymentMode) {
            showMessage('error', 'Please select payment mode');
            return;
        }

        if (!paymentData.customerId) {
            showMessage('error', 'Customer ID is missing');
            return;
        }

        if (!paymentData.collectedBy) {
            showMessage('error', 'Collected by information is missing');
            return;
        }

        if (!paymentData.collectedAtCenter) {
            showMessage('error', 'Collected at center is missing');
            return;
        }

        // Get paying customer details for description
        const payingCustomer = getPayingCustomer(selectedBookingForPayment);

        // Prepare payment data exactly as per API requirement
        const apiPaymentData = {
            amount: paymentAmount,
            paymentMode: paymentData.paymentMode,
            paymentDate: paymentData.paymentDate,
            customerId: paymentData.customerId,
            description: paymentData.description || `Payment for booking #${selectedBookingForPayment.booking_number} - ${payingCustomer?.customerName || ''}`,
            collectedBy: paymentData.collectedBy,
            collectedAtCenter: paymentData.collectedAtCenter
        };

        try {
            // Directly call the API endpoint: POST /bookings/{bookingId}/payments
            await dispatch(addPackagePayment({
                packageId: selectedBookingForPayment.booking_id,
                paymentData: apiPaymentData
            })).unwrap();
            
            // Success message will be shown by the useEffect watching addPaymentSuccess
        } catch (error) {
            showMessage('error', error || 'Failed to add payment');
        }
    };

    const handleExportExcel = () => {
        if (!filteredBookings || filteredBookings.length === 0) {
            showMessage('error', 'No data to export');
            return;
        }

        const wb = XLSX.utils.book_new();

        const header = [
            ['ROUTE WISE PAYMENT REPORT'],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [`Route: ${getCenterName(filters.fromCenterId)} → ${getCenterName(filters.toCenterId)}`],
            [`Period: ${moment(filters.startDate).format('DD/MM/YYYY')} - ${moment(filters.endDate).format('DD/MM/YYYY')}`],
            [],
            [
                'S.No', 'Booking No', 'Date', 'From Center', 'To Center',
                'Sender', 'Receiver', 'Paying Customer', 'Total (₹)', 'Paid (₹)', 'Due (₹)',
                'Payment Status', 'Payment By', 'Delivery Status'
            ],
        ];

        const data = filteredBookings.map((booking, index) => {
            const payingCustomer = getPayingCustomer(booking);
            return [
                index + 1,
                booking.booking_number,
                moment(booking.booking_date).format('DD/MM/YYYY'),
                booking.fromCenter?.office_center_name || 'N/A',
                booking.toCenter?.office_center_name || 'N/A',
                booking.fromCustomer?.customer_name || 'N/A',
                booking.toCustomer?.customer_name || 'N/A',
                payingCustomer?.customerName || 'N/A',
                booking.total_amount,
                booking.paid_amount,
                booking.due_amount,
                booking.payment_status,
                booking.payment_by === 'sender' ? 'Sender' : 'Receiver',
                booking.delivery_status,
            ];
        });

        const allRows = [...header, ...data];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        ws['!cols'] = [
            { wch: 5 },   // S.No
            { wch: 15 },  // Booking No
            { wch: 12 },  // Date
            { wch: 20 },  // From Center
            { wch: 20 },  // To Center
            { wch: 20 },  // Sender
            { wch: 20 },  // Receiver
            { wch: 20 },  // Paying Customer
            { wch: 12 },  // Total
            { wch: 12 },  // Paid
            { wch: 12 },  // Due
            { wch: 15 },  // Payment Status
            { wch: 12 },  // Payment By
            { wch: 15 },  // Delivery Status
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Route Payments');
        
        const routeName = filters.fromCenterId && filters.toCenterId 
            ? `${getCenterName(filters.fromCenterId)}-to-${getCenterName(filters.toCenterId)}`
            : 'all-routes';
        const fileName = `Route-Payments-${routeName}-${moment().format('DD-MM-YYYY')}.xlsx`;
        
        XLSX.writeFile(wb, fileName);
    };

    const getCenterName = (centerId) => {
        if (!centerId) return 'All';
        const center = officeCentersWithLocationsData.find(c => c.office_center_id === centerId);
        return center?.office_center_name || 'Unknown';
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredBookings.slice(startIndex, endIndex);
    };

    const getStatusColor = (status) => {
        const statusMap = {
            not_started: 'bg-gray-100 text-gray-800',
            picked_up: 'bg-blue-100 text-blue-800',
            in_transit: 'bg-purple-100 text-purple-800',
            out_for_delivery: 'bg-yellow-100 text-yellow-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const statusMap = {
            pending: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const routeSummary = {
        totalBookings: filteredBookings.length,
        totalAmount: filteredBookings.reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0),
        totalPaid: filteredBookings.reduce((sum, b) => sum + (parseFloat(b.paid_amount) || 0), 0),
        totalDue: filteredBookings.reduce((sum, b) => sum + (parseFloat(b.due_amount) || 0), 0),
        pendingCount: filteredBookings.filter(b => b.payment_status === 'pending').length,
        partialCount: filteredBookings.filter(b => b.payment_status === 'partial').length,
        completedCount: filteredBookings.filter(b => b.payment_status === 'completed').length,
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            width: 60,
            Cell: ({ row }) => (
                <div className="text-center font-medium">
                    {row.index + 1 + currentPage * pageSize}
                </div>
            ),
        },
        {
            Header: 'Booking Details',
            accessor: 'booking',
            Cell: ({ row }) => (
                <div>
                    <div className="font-bold text-blue-600">{row.original.booking_number}</div>
                    <div className="text-xs text-gray-500">
                        {moment(row.original.booking_date).format('DD/MM/YYYY')}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => (
                <div>
                    <div className="flex items-center text-sm">
                        <IconMapPin className="w-3 h-3 mr-1 text-blue-500" />
                        <span>{row.original.fromCenter?.office_center_name}</span>
                    </div>
                    <div className="flex items-center text-sm mt-1">
                        <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                        <span>{row.original.toCenter?.office_center_name}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Customers',
            accessor: 'customers',
            Cell: ({ row }) => {
                const payingCustomer = getPayingCustomer(row.original);
                return (
                    <div>
                        <div className="flex items-center text-sm">
                            <IconUser className="w-3 h-3 mr-1 text-blue-500" />
                            <span>{row.original.fromCustomer?.customer_name}</span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                            <IconUser className="w-3 h-3 mr-1 text-green-500" />
                            <span>{row.original.toCustomer?.customer_name}</span>
                        </div>
                        {payingCustomer && (
                            <div className="mt-1 text-xs font-medium text-purple-600">
                                Paying: {payingCustomer.customerName}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            Header: 'Payment Details',
            accessor: 'payment',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Total:</span>
                        <span className="font-bold text-gray-800">₹{parseFloat(row.original.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">₹{parseFloat(row.original.paid_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-xs text-gray-600">Due:</span>
                        <span className="font-medium text-red-600">₹{parseFloat(row.original.due_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(row.original.payment_status)}`}>
                            {row.original.payment_status}
                        </span>
                        <span className="text-xs text-gray-500">
                            {row.original.payment_by === 'sender' ? 'Sender' : 'Receiver'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'delivery_status',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                    {value?.replace(/_/g, ' ').toUpperCase()}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 100,
            Cell: ({ row }) => (
                <div className="flex space-x-1">
                    <button
                        onClick={() => handleViewDetails(row.original)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                    >
                        <IconEye className="w-4 h-4" />
                    </button>
                    {parseFloat(row.original.due_amount) > 0 && _.includes(accessIds, '10') && (
                        <button
                            onClick={() => handleOpenPaymentModal(row.original)}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Record Payment"
                        >
                            <IconDollarSign className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            minHeight: '38px',
            fontSize: '14px',
            '&:hover': {
                borderColor: '#d1d5db',
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Route-wise Payments</h1>
                <p className="text-gray-600 mt-1">View and manage payments for specific routes</p>
            </div>

            {/* Filter Section */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <IconFilter className="w-5 h-5 mr-2" />
                            Route & Payment Filters
                        </h2>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconCalendar className="inline w-4 h-4 mr-1" />
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconCalendar className="inline w-4 h-4 mr-1" />
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* Route Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconMapPin className="inline w-4 h-4 mr-1 text-blue-500" />
                                    From Center
                                </label>
                                <Select
                                    options={centerOptions}
                                    value={centerOptions.find(opt => opt.value === filters.fromCenterId)}
                                    onChange={(opt) => handleFilterChange(opt, 'fromCenterId')}
                                    placeholder="Select From Center"
                                    isClearable
                                    styles={customSelectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconMapPin className="inline w-4 h-4 mr-1 text-green-500" />
                                    To Center
                                </label>
                                <Select
                                    options={centerOptions}
                                    value={centerOptions.find(opt => opt.value === filters.toCenterId)}
                                    onChange={(opt) => handleFilterChange(opt, 'toCenterId')}
                                    placeholder="Select To Center"
                                    isClearable
                                    styles={customSelectStyles}
                                />
                            </div>

                            {/* Payment Filters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconCreditCard className="inline w-4 h-4 mr-1" />
                                    Payment Status
                                </label>
                                <Select
                                    options={paymentStatusOptions}
                                    value={paymentStatusOptions.find(opt => opt.value === filters.paymentStatus)}
                                    onChange={(opt) => handleFilterChange(opt, 'paymentStatus')}
                                    placeholder="Select Payment Status"
                                    styles={customSelectStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment By
                                </label>
                                <Select
                                    options={paymentByOptions}
                                    value={paymentByOptions.find(opt => opt.value === filters.paymentBy)}
                                    onChange={(opt) => handleFilterChange(opt, 'paymentBy')}
                                    placeholder="Select Payment By"
                                    styles={customSelectStyles}
                                />
                            </div>

                            {/* Booking Status & Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconTruck className="inline w-4 h-4 mr-1" />
                                    Delivery Status
                                </label>
                                <Select
                                    options={bookingStatusOptions}
                                    value={bookingStatusOptions.find(opt => opt.value === filters.bookingStatus)}
                                    onChange={(opt) => handleFilterChange(opt, 'bookingStatus')}
                                    placeholder="Select Delivery Status"
                                    styles={customSelectStyles}
                                />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconSearch className="inline w-4 h-4 mr-1" />
                                    Search
                                </label>
                                <input
                                    type="text"
                                    name="search"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search by booking number, customer name, mobile..."
                                    value={filters.search}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                            >
                                Clear All
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px] text-sm"
                                disabled={loadingBookingsWithDetails}
                            >
                                {loadingBookingsWithDetails ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                            {appliedFilters && filteredBookings.length > 0 && _.includes(accessIds, '5') && (
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                                >
                                    <IconDownload className="mr-2 w-4 h-4" />
                                    Export Excel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Route Summary Cards */}
            {appliedFilters && filteredBookings.length > 0 && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{routeSummary.totalBookings}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <IconPackage className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">₹{routeSummary.totalAmount.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <IconDollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">₹{routeSummary.totalPaid.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <IconCreditCard className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Due</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">₹{routeSummary.totalDue.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-800">Pending Payments</p>
                                    <p className="text-2xl font-bold text-red-700 mt-1">{routeSummary.pendingCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-red-700">{routeSummary.pendingCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-800">Partial Payments</p>
                                    <p className="text-2xl font-bold text-yellow-700 mt-1">{routeSummary.partialCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-yellow-700">{routeSummary.partialCount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-800">Completed Payments</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">{routeSummary.completedCount}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-green-700">{routeSummary.completedCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Loading State */}
            {loadingBookingsWithDetails && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Route Payments</h3>
                        <p className="text-gray-500">Please wait while we fetch the payment information...</p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            {!loadingBookingsWithDetails && appliedFilters && filteredBookings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Route Payment Details
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {filters.fromCenterId && filters.toCenterId ? (
                                        <>Showing payments for route: <span className="font-semibold text-blue-600">{getCenterName(filters.fromCenterId)} → {getCenterName(filters.toCenterId)}</span></>
                                    ) : filters.fromCenterId ? (
                                        <>Showing payments from: <span className="font-semibold text-blue-600">{getCenterName(filters.fromCenterId)}</span></>
                                    ) : filters.toCenterId ? (
                                        <>Showing payments to: <span className="font-semibold text-blue-600">{getCenterName(filters.toCenterId)}</span></>
                                    ) : (
                                        <>Showing all routes</>
                                    )}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {moment(filters.startDate).format('DD MMM YYYY')} - {moment(filters.endDate).format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total: </span>
                                    <span className="font-semibold text-gray-800">₹{routeSummary.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Paid: </span>
                                    <span className="font-semibold text-green-600">₹{routeSummary.totalPaid.toFixed(2)}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Due: </span>
                                    <span className="font-semibold text-red-600">₹{routeSummary.totalDue.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-2 sm:p-4">
                        <Table
                            columns={columns}
                            data={getPaginatedData()}
                            Title=""
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={filteredBookings.length}
                            totalPages={Math.ceil(filteredBookings.length / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            isSortable={true}
                            pagination={true}
                            isSearchable={false}
                            tableClass="min-w-full rounded-lg overflow-hidden"
                            theadClass="bg-gray-50"
                            responsive={true}
                        />
                    </div>
                </div>
            )}

            {/* No Data State */}
            {!loadingBookingsWithDetails && appliedFilters && filteredBookings.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Data Found</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">
                            No payment records match your current search criteria for this route. Try adjusting your filters.
                        </p>
                        <button
                            onClick={handleClear}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Initial State */}
            {!loadingBookingsWithDetails && !appliedFilters && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <IconFilter className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Route-wise Payment Dashboard</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">
                            Select a route (From Center → To Center) and date range to view payment details for packages.
                        </p>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg"
                        >
                            Select Route
                        </button>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <ModelViewBox
                modal={showPaymentModal}
                modelHeader={`Add Payment - Booking #${selectedBookingForPayment?.booking_number || ''}`}
                setModel={() => {
                    setShowPaymentModal(false);
                    resetPaymentForm();
                }}
                handleSubmit={handleSubmitPayment}
                modelSize="md"
                submitBtnText={loading ? 'Processing...' : 'Add Payment'}
                submitBtnClass="btn-success"
                cancelBtnText="Cancel"
                loading={loading}
            >
                {selectedBookingForPayment && (
                    <div className="space-y-4">
                        {/* Booking Summary */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-600">Total Amount</p>
                                    <p className="text-lg font-bold text-gray-800">₹{parseFloat(selectedBookingForPayment.total_amount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Paid Amount</p>
                                    <p className="text-lg font-bold text-green-600">₹{parseFloat(selectedBookingForPayment.paid_amount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Due Amount</p>
                                    <p className="text-lg font-bold text-red-600">₹{parseFloat(selectedBookingForPayment.due_amount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Payment By</p>
                                    <p className="text-sm font-medium capitalize">{selectedBookingForPayment.payment_by}</p>
                                </div>
                            </div>
                        </div>

                        {/* Paying Customer Info */}
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <h4 className="text-xs font-medium text-purple-800 mb-2">Paying Customer</h4>
                            {(() => {
                                const payingCustomer = getPayingCustomer(selectedBookingForPayment);
                                return payingCustomer ? (
                                    <div className="flex items-center">
                                        <IconUser className="w-4 h-4 mr-2 text-purple-600" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{payingCustomer.customerName}</p>
                                            <p className="text-xs text-gray-600">{payingCustomer.customerNumber}</p>
                                            <p className="text-xs text-purple-600 mt-1">Customer ID: {payingCustomer.customerId}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-600">Unable to determine paying customer</p>
                                );
                            })()}
                        </div>

                        {/* Payment Form - Matches API structure */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amount (₹) *
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={paymentData.amount}
                                onChange={handlePaymentInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter amount"
                                step="0.01"
                                min="0.01"
                                max={selectedBookingForPayment.due_amount}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Max amount: ₹{parseFloat(selectedBookingForPayment.due_amount).toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Mode *
                            </label>
                            <Select
                                options={paymentModeOptions}
                                value={paymentModeOptions.find(opt => opt.value === paymentData.paymentMode)}
                                onChange={handlePaymentModeChange}
                                placeholder="Select Payment Mode"
                                styles={customSelectStyles}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Date *
                            </label>
                            <input
                                type="date"
                                name="paymentDate"
                                value={paymentData.paymentDate}
                                onChange={handlePaymentInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                max={moment().format('YYYY-MM-DD')}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                name="description"
                                value={paymentData.description}
                                onChange={handlePaymentInputChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add description for this payment"
                                rows="2"
                            />
                        </div>

                        {/* Collection Information - Read Only */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Collection Information</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-500">Collected By:</span>
                                    <p className="font-medium">{paymentData.collectedBy || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Collected At Center:</span>
                                    <p className="font-medium">{getCenterName(paymentData.collectedAtCenter)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Booking Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Booking Details - ${selectedBooking?.booking_number || ''}`}
                setModel={() => setShowDetailsModal(false)}
                modelSize="max-w-6xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedBooking && (
                    <div className="p-4 space-y-6">
                        {/* Header Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2">Booking Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Booking No:</span>
                                            <span className="font-bold">{selectedBooking.booking_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium">{moment(selectedBooking.booking_date).format('DD/MM/YYYY')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-800 mb-2">Status Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivery Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedBooking.delivery_status)}`}>
                                                {selectedBooking.delivery_status?.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                                                {selectedBooking.payment_status?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Payment By:</span>
                                            <span className="font-medium capitalize">{selectedBooking.payment_by}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-orange-800 mb-2">Amount Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-bold text-gray-800">₹{parseFloat(selectedBooking.total_amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Paid Amount:</span>
                                            <span className="font-medium text-green-600">₹{parseFloat(selectedBooking.paid_amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Due Amount:</span>
                                            <span className="font-medium text-red-600">₹{parseFloat(selectedBooking.due_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconTruck className="w-4 h-4 mr-2 text-blue-500" />
                                    Route Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                            <div className="text-xs text-blue-600 mb-1">From Center</div>
                                            <div className="font-medium">{selectedBooking.fromCenter?.office_center_name}</div>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded border border-green-100">
                                            <div className="text-xs text-green-600 mb-1">To Center</div>
                                            <div className="font-medium">{selectedBooking.toCenter?.office_center_name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-purple-500" />
                                    Customer Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                        <div className="text-xs text-blue-600 mb-1">Sender Details</div>
                                        <div className="font-medium">{selectedBooking.fromCustomer?.customer_name}</div>
                                        <div className="text-sm text-gray-600">{selectedBooking.fromCustomer?.customer_number}</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                        <div className="text-xs text-green-600 mb-1">Receiver Details</div>
                                        <div className="font-medium">{selectedBooking.toCustomer?.customer_name}</div>
                                        <div className="text-sm text-gray-600">{selectedBooking.toCustomer?.customer_number}</div>
                                    </div>
                                    {(() => {
                                        const payingCustomer = getPayingCustomer(selectedBooking);
                                        return payingCustomer && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <div className="text-xs font-medium text-purple-600 mb-1">Paying Customer</div>
                                                <div className="font-medium text-purple-700">{payingCustomer.customerName}</div>
                                                <div className="text-xs text-gray-600">{payingCustomer.customerNumber}</div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Packages Table */}
                        {selectedBooking.packages && selectedBooking.packages.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Package Items</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package Type</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedBooking.packages.map((pkg, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {pkg.packageType?.package_type_name}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{pkg.quantity}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">₹{parseFloat(pkg.total_package_charge).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Payments Table */}
                        {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Payment History</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment No</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedBooking.payments.map((payment, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{payment.payment_number}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{moment(payment.payment_date).format('DD/MM/YYYY')}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">₹{parseFloat(payment.amount).toFixed(2)}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{payment.payment_mode}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default RoutePayments;