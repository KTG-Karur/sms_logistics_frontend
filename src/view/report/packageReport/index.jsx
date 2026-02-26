import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import Select from 'react-select';
import moment from 'moment';
import _ from 'lodash';
import * as XLSX from 'xlsx';

// Icons
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconDownload from '../../../components/Icon/IconFile';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconEye from '../../../components/Icon/IconEye';
import IconTruck from '../../../components/Icon/IconTruck';
import IconUser from '../../../components/Icon/IconUser';
import IconPackage from '../../../components/Icon/IconBox';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconFilter from '../../../components/Icon/IconSearch';
import IconX from '../../../components/Icon/IconX';

// Components
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import { showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';

// Redux actions
import { getAllBookingsWithDetails, resetBookingsWithDetailsStatus } from '../../../redux/reportSlice';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { getCustomers } from '../../../redux/customerSlice';

const BookingReport = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Package Report');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get data from Redux
    const reportState = useSelector((state) => state.ReportSlice || {});
    const officeCentersState = useSelector((state) => state.OfficeCenterSlice || {});
    const customersState = useSelector((state) => state.CustomerSlice || {});

    const { bookingsWithDetailsData = null, loadingBookingsWithDetails = false, getBookingsWithDetailsSuccess = false, errorBookingsWithDetails = null } = reportState;

    const { officeCentersData = [] } = officeCentersState;
    const { customersData = [] } = customersState;

    // State for filters
    const [filters, setFilters] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
        centerId: null,
        customerId: null,
        status: null,
        paymentStatus: null,
        tripStatus: null,
        search: '',
    });

    // State for transformed data
    const [summary, setSummary] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState(null);

    // State for dropdown options
    const [centerOptions, setCenterOptions] = useState([]);
    const [customerOptions, setCustomerOptions] = useState([]);
    const [statusOptions] = useState([
        { value: 'not_started', label: 'Not Started' },
        { value: 'picked_up', label: 'Picked Up' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'out_for_delivery', label: 'Out for Delivery' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
    ]);
    const [paymentStatusOptions] = useState([
        { value: 'pending', label: 'Pending' },
        { value: 'partial', label: 'Partial' },
        { value: 'completed', label: 'Completed' },
    ]);
    const [tripStatusOptions] = useState([
        { value: 'assigned', label: 'Assigned' },
        { value: 'not_assigned', label: 'Not Assigned' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ]);

    // UI States
    const [showFilters, setShowFilters] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [appliedFilters, setAppliedFilters] = useState(null);

    useEffect(() => {
        dispatch(setPageTitle('Booking Report'));
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (getBookingsWithDetailsSuccess && bookingsWithDetailsData) {
            // Extract data from the nested structure
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

    const fetchInitialData = async () => {
        try {
            await Promise.all([dispatch(getOfficeCenters({})), dispatch(getCustomers({}))]);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    useEffect(() => {
        // Transform office centers for react-select
        if (officeCentersData && Array.isArray(officeCentersData) && officeCentersData.length > 0) {
            // Fallback if data is directly in the array
            const options = officeCentersData.map((center) => ({
                value: center.id,
                label: center.officeCentersName,
            }));
            setCenterOptions([{ value: null, label: 'All Centers' }, ...options]);
        } else {
            // Set default empty options
            setCenterOptions([{ value: null, label: 'All Centers' }]);
        }

        // Transform customers for react-select
        if (customersData && customersData.data && customersData.data.length > 0) {
            const customers = customersData.data;
            const options = customers.map((customer) => ({
                value: customer.customer_id,
                label: `${customer.customer_name} (${customer.customer_number})`,
            }));
            setCustomerOptions([{ value: null, label: 'All Customers' }, ...options]);
        } else if (customersData && Array.isArray(customersData) && customersData.length > 0) {
            const options = customersData.map((customer) => ({
                value: customer.customer_id,
                label: `${customer.customer_name} (${customer.customer_number})`,
            }));
            setCustomerOptions([{ value: null, label: 'All Customers' }, ...options]);
        } else {
            setCustomerOptions([{ value: null, label: 'All Customers' }]);
        }
    }, [officeCentersData, customersData]);

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

        // Prepare request object - remove page and limit as requested
        const request = {
            startDate: filters.startDate,
            endDate: filters.endDate,
            centerId: filters.centerId,
            customerId: filters.customerId,
            status: filters.status,
            paymentStatus: filters.paymentStatus,
            tripStatus: filters.tripStatus,
            search: filters.search,
        };

        // Remove undefined/null values
        Object.keys(request).forEach((key) => (request[key] === null || request[key] === undefined || request[key] === '' ? delete request[key] : {}));

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
            centerId: null,
            customerId: null,
            status: null,
            paymentStatus: null,
            tripStatus: null,
            search: '',
        });
        setAppliedFilters(null);
        setSummary(null);
        setBookings([]);
        setPagination(null);
        setShowAdvancedFilters(false);
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const handleGeneratePDF = () => {
        if (!bookings || bookings.length === 0) {
            showMessage('error', 'No data to generate PDF');
            return;
        }

        const pdfData = {
            filteredData: bookings,
            filters: appliedFilters,
            stats: summary,
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            totalRecords: summary?.total_bookings || 0,
        };

        navigate('/reports/booking-pdf', { state: pdfData });
    };

    const handleExportExcel = () => {
        if (!bookings || bookings.length === 0) {
            showMessage('error', 'No data to export');
            return;
        }

        const wb = XLSX.utils.book_new();

        // Header row
        const header = [
            ['BOOKING REPORT'],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            [
                'S.No',
                'Booking No',
                'LLR No',
                'Date',
                'From Center',
                'To Center',
                'Sender',
                'Sender Mobile',
                'Receiver',
                'Receiver Mobile',
                'Total (₹)',
                'Paid (₹)',
                'Due (₹)',
                'Payment Status',
                'Delivery Status',
                'Trip Status',
                'Vehicle No',
                'Driver',
                'Packages Count',
                'Created At',
            ],
        ];

        // Data rows
        const data = bookings.map((booking, index) => [
            index + 1,
            booking.booking_number,
            booking.llr_number || 'N/A',
            moment(booking.booking_date).format('DD/MM/YYYY'),
            booking.fromCenter?.office_center_name || 'N/A',
            booking.toCenter?.office_center_name || 'N/A',
            booking.fromCustomer?.customer_name || 'N/A',
            booking.fromCustomer?.customer_number || 'N/A',
            booking.toCustomer?.customer_name || 'N/A',
            booking.toCustomer?.customer_number || 'N/A',
            booking.total_amount,
            booking.paid_amount,
            booking.due_amount,
            booking.payment_status,
            booking.delivery_status,
            booking.trip?.status || 'Not Assigned',
            booking.trip?.vehicle?.vehicle_number_plate || 'N/A',
            booking.trip?.driver?.employee_name || 'N/A',
            booking.packages?.length || 0,
            moment(booking.created_at).format('DD/MM/YYYY HH:mm'),
        ]);

        const allRows = [...header, ...data];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        // Set column widths
        ws['!cols'] = [
            { wch: 5 }, // S.No
            { wch: 15 }, // Booking No
            { wch: 15 }, // LLR No
            { wch: 12 }, // Date
            { wch: 20 }, // From Center
            { wch: 20 }, // To Center
            { wch: 20 }, // Sender
            { wch: 15 }, // Sender Mobile
            { wch: 20 }, // Receiver
            { wch: 15 }, // Receiver Mobile
            { wch: 12 }, // Total
            { wch: 12 }, // Paid
            { wch: 12 }, // Due
            { wch: 15 }, // Payment Status
            { wch: 15 }, // Delivery Status
            { wch: 15 }, // Trip Status
            { wch: 15 }, // Vehicle No
            { wch: 20 }, // Driver
            { wch: 10 }, // Packages Count
            { wch: 20 }, // Created At
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

        const fileName = `Booking-Report-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        if (!bookings || bookings.length === 0) return [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return bookings.slice(startIndex, endIndex);
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

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            width: 60,
            Cell: ({ row }) => <div className="text-center font-medium">{row.index + 1 + currentPage * pageSize}</div>,
        },
        {
            Header: 'Booking No',
            accessor: 'booking_number',
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium text-sm">{row.original.fromCenter?.office_center_name}</div>
                    <div className="text-xs text-gray-500">→ {row.original.toCenter?.office_center_name}</div>
                </div>
            ),
        },
        {
            Header: 'Customers',
            accessor: 'customers',
            Cell: ({ row }) => (
                <div>
                    <div className="text-sm">
                        <span className="text-blue-600">{row.original.fromCustomer?.customer_name}</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-600">{row.original.toCustomer?.customer_name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.fromCustomer?.customer_number} → {row.original.toCustomer?.customer_number}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Payment',
            accessor: 'payment',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Total:</span>
                        <span className="font-bold text-gray-800">₹{row.original.total_amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Paid:</span>
                        <span className="font-medium text-green-600">₹{row.original.paid_amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Due:</span>
                        <span className="font-medium text-red-600">₹{row.original.due_amount}</span>
                    </div>
                    <div className={`text-xs px-1 rounded text-center mt-1 ${getPaymentStatusColor(row.original.payment_status)}`}>{row.original.payment_status}</div>
                </div>
            ),
        },
        {
            Header: 'Trip Details',
            accessor: 'trip',
            Cell: ({ row }) => {
                const trip = row.original.trip;
                return (
                    <div>
                        {trip ? (
                            <>
                                <div className="text-sm font-medium">{trip.trip_number}</div>
                                <div className="text-xs text-gray-500">{trip.vehicle?.vehicle_number_plate}</div>
                                <div className="text-xs text-gray-500">{trip.driver?.employee_name}</div>
                                <div className={`text-xs mt-1 px-1 rounded inline-block ${trip.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {trip.status}
                                </div>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">Not Assigned</span>
                        )}
                    </div>
                );
            },
        },
        {
            Header: 'Packages',
            accessor: 'packages',
            Cell: ({ value }) => (
                <div className="text-center">
                    <span className="font-bold">{value?.length || 0}</span>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'delivery_status',
            Cell: ({ value }) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{value?.replace(/_/g, ' ').toUpperCase()}</span>,
        },
        {
            Header: 'Date',
            accessor: 'booking_date',
            Cell: ({ value }) => moment(value).format('DD/MM/YYYY'),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 80,
            Cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => handleViewDetails(row.original)}
                        className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                    >
                        <IconEye className="w-4 h-4" />
                    </button>
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
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Booking Report Management</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Comprehensive booking tracking and reporting system</p>
            </div>

            {/* Search & Filter Section */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <IconFilter className="w-5 h-5 mr-2" />
                            Search & Filter
                        </h2>
                        <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
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

                            {/* Search Input */}
                            <div className="md:col-span-2 lg:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconSearch className="inline w-4 h-4 mr-1" />
                                    Search
                                </label>
                                <input
                                    type="text"
                                    name="search"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Booking No, LLR No..."
                                    value={filters.search}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Basic Filters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
                                <Select
                                    options={centerOptions}
                                    value={centerOptions.find((opt) => opt.value === filters.centerId)}
                                    onChange={(opt) => handleFilterChange(opt, 'centerId')}
                                    placeholder="Select Center"
                                    isClearable
                                    styles={customSelectStyles}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                                <Select
                                    options={customerOptions}
                                    value={customerOptions.find((opt) => opt.value === filters.customerId)}
                                    onChange={(opt) => handleFilterChange(opt, 'customerId')}
                                    placeholder="Select Customer"
                                    isClearable
                                    styles={customSelectStyles}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
                                <Select
                                    options={[{ value: null, label: 'All Status' }, ...statusOptions]}
                                    value={statusOptions.find((opt) => opt.value === filters.status) || { value: null, label: 'All Status' }}
                                    onChange={(opt) => handleFilterChange(opt, 'status')}
                                    placeholder="Select Status"
                                    isClearable
                                    styles={customSelectStyles}
                                />
                            </div>

                            {/* Advanced Filters Toggle */}
                            <div className="md:col-span-2 lg:col-span-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                        showAdvancedFilters ? 'bg-purple-50 border-purple-300 text-purple-700' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconFilter className="w-4 h-4" />
                                    <span className="font-medium">{showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
                                </button>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                        <Select
                                            options={[{ value: null, label: 'All Payment Status' }, ...paymentStatusOptions]}
                                            value={paymentStatusOptions.find((opt) => opt.value === filters.paymentStatus) || { value: null, label: 'All Payment Status' }}
                                            onChange={(opt) => handleFilterChange(opt, 'paymentStatus')}
                                            placeholder="Select Payment Status"
                                            isClearable
                                            styles={customSelectStyles}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trip Status</label>
                                        <Select
                                            options={[{ value: null, label: 'All Trip Status' }, ...tripStatusOptions]}
                                            value={tripStatusOptions.find((opt) => opt.value === filters.tripStatus) || { value: null, label: 'All Trip Status' }}
                                            onChange={(opt) => handleFilterChange(opt, 'tripStatus')}
                                            placeholder="Select Trip Status"
                                            isClearable
                                            styles={customSelectStyles}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                            >
                                Clear All
                            </button>
                            <button
                                type="submit"
                                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px] text-sm"
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
                            {appliedFilters && bookings.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleExportExcel}
                                        className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                                    >
                                        <IconDownload className="mr-2 w-4 h-4" />
                                        Export Excel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleGeneratePDF}
                                        className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                                    >
                                        <IconPrinter className="mr-2 w-4 h-4" />
                                        Generate PDF
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* Stats Cards */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">{summary.total_bookings}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <IconPackage className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">₹{summary.total_amount}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <IconMoney className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">₹{summary.total_paid}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Due Amount</p>
                                <p className="text-xl font-bold text-gray-800 mt-1">₹{summary.total_pending}</p>
                            </div>
                            <div className="p-2 bg-red-100 rounded-full">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loadingBookingsWithDetails && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Booking Data</h3>
                        <p className="text-gray-500">Please wait while we fetch the booking information...</p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            {!loadingBookingsWithDetails && appliedFilters && bookings.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Booking Reports</h3>
                                <p className="text-gray-600 text-sm">
                                    Showing {bookings.length} records from {moment(filters.startDate).format('DD MMM YYYY')} to {moment(filters.endDate).format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Delivered: </span>
                                    <span className="font-semibold text-green-600">{summary?.by_status?.delivered || 0}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">In Transit: </span>
                                    <span className="font-semibold text-blue-600">{summary?.by_status?.in_transit || 0}</span>
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
                            totalCount={bookings.length}
                            totalPages={Math.ceil(bookings.length / pageSize)}
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
            {!loadingBookingsWithDetails && appliedFilters && bookings.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Data Found</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">No booking records match your current search criteria. Try adjusting your filters.</p>
                        <button onClick={handleClear} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold">
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
                            <IconSearch className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Booking Report Dashboard</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">Use the search filters above to generate detailed booking reports with trip and payment information.</p>
                        <button
                            onClick={() => setShowFilters(true)}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg"
                        >
                            Start Searching
                        </button>
                    </div>
                </div>
            )}

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
                                            <span className="text-gray-600">LLR No:</span>
                                            <span className="font-medium">{selectedBooking.llr_number || 'N/A'}</span>
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
                                            <span className="font-medium">{selectedBooking.payment_by === 'sender' ? 'Sender' : 'Receiver'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-orange-800 mb-2">Amount Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Amount:</span>
                                            <span className="font-bold text-gray-800">₹{selectedBooking.total_amount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Paid Amount:</span>
                                            <span className="font-medium text-green-600">₹{selectedBooking.paid_amount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Due Amount:</span>
                                            <span className="font-medium text-red-600">₹{selectedBooking.due_amount}</span>
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
                                </div>
                            </div>
                        </div>

                        {/* Trip Information */}
                        {selectedBooking.trip && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconTruck className="w-4 h-4 mr-2 text-green-500" />
                                    Trip Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Trip Number</div>
                                        <div className="font-bold text-purple-700">{selectedBooking.trip.trip_number}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Trip Date</div>
                                        <div className="font-medium">{moment(selectedBooking.trip.trip_date).format('DD/MM/YYYY')}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Trip Status</div>
                                        <div className="font-medium">{selectedBooking.trip.status}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Vehicle</div>
                                        <div className="font-medium">{selectedBooking.trip.vehicle?.vehicle_number_plate}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Driver</div>
                                        <div className="font-medium">{selectedBooking.trip.driver?.employee_name}</div>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedBooking.packages.map((pkg, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.packageType?.package_type_name}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{pkg.quantity}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">₹{pkg.total_package_charge}</td>
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
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-green-600">₹{payment.amount}</td>
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

export default BookingReport;
