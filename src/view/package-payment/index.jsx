import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import { showMessage , getAccessIdsByLabel } from '../../util/AllFunction';
import Table from '../../util/Table';
import ModelViewBox from '../../util/ModelViewBox';
import IconUser from '../../components/Icon/IconUser';
import IconDollarSign from '../../components/Icon/IconDollarSign';
import IconSearch from '../../components/Icon/IconSearch';
import IconEye from '../../components/Icon/IconEye';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconPhone from '../../components/Icon/IconPhone';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconFilter from '../../components/Icon/IconFilter';
import IconPrinter from '../../components/Icon/IconPrinter';
import { getAllCustomersPaymentSummary, getCustomerBookingsAndPayments, resetCustomerPaymentStatus } from '../../redux/customerPaymentSlice';
import Select from 'react-select';

const PendingPayments = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Booking Bulk Payment');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const paymentState = useSelector((state) => state.CustomerPaymentSlice || {});
    const { allCustomersPaymentSummary, loading = false, getAllCustomersSummarySuccess = false, getAllCustomersSummaryFailed = false, error = null } = paymentState;

    // Local state
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentByFilter, setPaymentByFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [viewModal, setViewModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerBookings, setCustomerBookings] = useState(null);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        sortBy: 'customer_name',
        sortOrder: 'ASC',
        page: 1,
        limit: 20,
    });

    // Status options for filter
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'fully_paid', label: 'Fully Paid' },
        { value: 'pending', label: 'Pending' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Payment Management'));
    }, [dispatch]);

    useEffect(() => {
        fetchAllCustomersSummary();
    }, [filters]);

    // Update filtered customers when data changes
    useEffect(() => {
        if (allCustomersPaymentSummary?.customers) {
            let customers = [...allCustomersPaymentSummary.customers];

            // Apply search filter
            if (searchTerm) {
                customers = customers.filter((customer) => 
                    customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    customer.customer_number?.includes(searchTerm)
                );
            }

            // Apply payment by filter (based on as_payer/responsible amount)
            if (paymentByFilter !== 'all') {
                customers = customers.filter((customer) => {
                    if (paymentByFilter === 'sender') {
                        return parseFloat(customer.summary?.as_payer?.total || 0) > 0;
                    } else {
                        return parseFloat(customer.summary?.as_recipient?.total || 0) > 0;
                    }
                });
            }

            // Apply payment status filter (override the API filter if needed)
            if (paymentStatusFilter !== 'all') {
                customers = customers.filter((customer) => customer.summary?.payment_status === paymentStatusFilter);
            }

            setFilteredCustomers(customers);
            setCurrentPage(0);
        }
    }, [allCustomersPaymentSummary, searchTerm, paymentByFilter, paymentStatusFilter]);

    const fetchAllCustomersSummary = () => {
        const filterParams = {
            page: filters.page,
            limit: filters.limit,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
        };

        if (filters.search) filterParams.search = filters.search;
        if (filters.status !== 'all') filterParams.status = filters.status;

        dispatch(getAllCustomersPaymentSummary(filterParams));
    };

    const fetchCustomerBookings = async (customerId, type = 'all') => {
        setLoadingBookings(true);
        try {
            const result = await dispatch(
                getCustomerBookingsAndPayments({
                    customerId,
                    type,
                }),
            ).unwrap();

            if (result?.data) {
                setCustomerBookings(result.data);
            }
        } catch (error) {
            console.error('Error fetching customer bookings:', error);
            showMessage('error', 'Failed to load customer bookings');
        } finally {
            setLoadingBookings(false);
        }
    };

    // Calculate stats
    const stats = {
        totalCustomers: allCustomersPaymentSummary?.overall?.total_customers || 0,
        totalDueAmount: parseFloat(allCustomersPaymentSummary?.overall?.total_responsible_pending || 0),
        pendingCustomers: allCustomersPaymentSummary?.status_breakdown?.pending || 0,
        partialCustomers: allCustomersPaymentSummary?.status_breakdown?.partial || 0,
        completedCustomers: allCustomersPaymentSummary?.status_breakdown?.fully_paid || 0,
        totalShipments: allCustomersPaymentSummary?.overall?.total_bookings || 0,
    };

    // Handle record payment button click
    const handleRecordPayment = (customer) => {
        if (parseFloat(customer.summary?.responsible_pending || 0) <= 0) {
            showMessage('error', 'No pending payments for this customer');
            return;
        }

        navigate(`/package/payment/${customer.customer_id}`, {
            state: {
                customer: {
                    ...customer,
                    responsible_amount: customer.summary?.responsible_amount || 0,
                    responsible_paid: customer.summary?.responsible_paid || 0,
                    responsible_pending: customer.summary?.responsible_pending || 0,
                    as_payer: customer.summary?.as_payer || { bookings: 0, total: 0, paid: 0, pending: 0 },
                    as_recipient: customer.summary?.as_recipient || { bookings: 0, total: 0, paid: 0, pending: 0 },
                },
            },
        });
    };

    // Handle view shipments
    const handleViewShipments = async (customer) => {
        setSelectedCustomer(customer);
        setViewModal(true);
        await fetchCustomerBookings(customer.customer_id, 'all');
    };

    // Handle print balance payment
    const handlePrintBalancePayment = (customer) => {
        navigate(`/documents/balance-payment-print/${customer.customer_id}`, {
            state: {
                customer: {
                    customer_id: customer.customer_id,
                    customer_name: customer.customer_name,
                    customer_number: customer.customer_number,
                    summary: customer.summary
                }
            }
        });
    };

    // Handle row click
    const handleRowClick = (customer) => {
        if (parseFloat(customer.summary?.responsible_pending || 0) > 0) {
            handleRecordPayment(customer);
        } else {
            handleViewShipments(customer);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: 1, // Reset to first page when filter changes
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: 'all',
            sortBy: 'customer_name',
            sortOrder: 'ASC',
            page: 1,
            limit: 20,
        });
        setSearchTerm('');
        setPaymentByFilter('all');
        setPaymentStatusFilter('all');
    };

    // Table columns
    const columns = [
        {
            Header: 'CUSTOMER',
            accessor: 'customer',
            Cell: ({ row }) => (
                <div className="space-y-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200" onClick={() => handleRowClick(row.original)}>
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900 text-lg">{row.original.customer_name}</div>
                        <div className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {row.original.summary?.total_bookings || 0}
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <IconPhone className="w-4 h-4 mr-1" />
                        {row.original.customer_number}
                    </div>
                </div>
            ),
        },
        {
            Header: 'RESPONSIBLE AMOUNT',
            accessor: 'responsible',
            Cell: ({ row }) => (
                <div className="space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200" onClick={() => handleRowClick(row.original)}>
                    <div className="flex justify-between items-center">
                        <span className={`font-bold text-lg ${parseFloat(row.original.summary?.responsible_pending || 0) > 0 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                            ₹{parseFloat(row.original.summary?.responsible_pending || 0).toFixed(2)}
                        </span>
                        <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                row.original.summary?.payment_status === 'fully_paid'
                                    ? 'bg-green-100 text-green-800'
                                    : row.original.summary?.payment_status === 'partial'
                                      ? 'bg-orange-100 text-orange-800'
                                      : row.original.summary?.payment_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {row.original.summary?.payment_status === 'fully_paid'
                                ? 'Paid'
                                : row.original.summary?.payment_status === 'partial'
                                  ? 'Partial'
                                  : row.original.summary?.payment_status === 'pending'
                                    ? 'Pending'
                                    : row.original.summary?.payment_status === 'not_responsible'
                                      ? 'Not Responsible'
                                      : 'No Bookings'}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: ₹{parseFloat(row.original.summary?.responsible_amount || 0).toFixed(2)} • Paid: ₹{parseFloat(row.original.summary?.responsible_paid || 0).toFixed(2)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${row.original.summary?.payment_progress || 0}%` }}></div>
                    </div>
                </div>
            ),
        },
        // {
        //     Header: 'BREAKDOWN',
        //     accessor: 'breakdown',
        //     Cell: ({ row }) => (
        //         <div className="text-sm">
        //             <div className="mb-1">
        //                 <span className="text-blue-600 font-medium">Sender:</span> ₹{parseFloat(row.original.summary?.as_payer?.total || 0).toFixed(2)}
        //             </div>
        //             <div>
        //                 <span className="text-green-600 font-medium">Receiver:</span> ₹{parseFloat(row.original.summary?.as_recipient?.total || 0).toFixed(2)}
        //             </div>
        //         </div>
        //     ),
        // },
        // {
        //     Header: 'PAYMENTS',
        //     accessor: 'payments',
        //     Cell: ({ row }) => (
        //         <div className="text-center">
        //             <div className="font-bold text-lg">{row.original.summary?.payments?.total_count || 0}</div>
        //             <div className="text-xs text-gray-500">₹{parseFloat(row.original.summary?.payments?.total_amount || 0).toFixed(2)}</div>
        //         </div>
        //     ),
        // },
        {
            Header: 'ACTIONS',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    {parseFloat(row.original.summary?.responsible_pending || 0) > 0 ? (
                        <>
                            <button
                                onClick={() => handleRecordPayment(row.original)}
                                className="btn btn-success btn-sm flex items-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                                title="Record Payment"
                            >
                                <IconDollarSign className="w-4 h-4 mr-1" />
                                <span className="hidden md:inline">Pay</span>
                            </button>
                            <button
                                onClick={() => handlePrintBalancePayment(row.original)}
                                className="btn btn-info btn-sm flex items-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                                title="Print Balance Payment"
                            >
                                <IconPrinter className="w-4 h-4 mr-1" />
                                <span className="hidden md:inline">Print</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleViewShipments(row.original)}
                            className="btn btn-info btn-sm flex items-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                            title="View Details"
                        >
                            <IconEye className="w-4 h-4 mr-1" />
                            <span className="hidden md:inline">View</span>
                        </button>
                    )}
                </div>
            ),
            width: 200,
        },
    ];

    // Pagination
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
        setFilters((prev) => ({
            ...prev,
            page: pageIndex + 1,
            limit: newPageSize,
        }));
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredCustomers.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredCustomers.length;
    };

    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            borderColor: '#e0e6ed',
            '&:hover': {
                borderColor: '#ee9043',
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Payment Management Dashboard</h1>
                        <p className="text-gray-600 mt-2 text-lg">Professional payment tracking and management system</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-5 transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                                <IconUser className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-lg border border-yellow-100 p-5 transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingCustomers}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full">
                                <span className="text-2xl font-bold text-white">!</span>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"></div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-lg border border-orange-100 p-5 transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Partial</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.partialCustomers}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
                                <span className="text-2xl font-bold text-white">%</span>
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full"></div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-green-100 p-5 transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedCustomers}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                                <IconCheck className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
                    </div>

                    <div className="bg-gradient-to-br from-white to-primary/10 rounded-xl shadow-lg border border-primary/20 p-5 transform hover:scale-105 transition-all duration-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Due</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalDueAmount.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-full">
                                <IconDollarSign className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        {/* Search */}
                        <div className="w-full">
                            <label className="block mb-1 text-sm font-medium opacity-0">Search</label>
                            <div className="relative">
                                <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input w-full pl-12 pr-4 h-[44px] rounded-lg border-2 border-gray-200 focus:border-primary transition-all duration-300"
                                    placeholder="Search by name or mobile..."
                                />
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div className="w-full">
                            <label className="block mb-1 text-sm font-medium">Payment Status</label>
                            <Select
                                value={statusOptions.find((option) => option.value === filters.status)}
                                onChange={(option) => handleFilterChange('status', option?.value || 'all')}
                                options={statusOptions}
                                placeholder="Select Status"
                                isClearable
                                styles={customSelectStyles}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <span className="ml-3">Loading customers...</span>
                </div>
            )}

            {/* Error State */}
            {getAllCustomersSummaryFailed && error && <div className="text-center py-8 text-danger">Error loading customers: {error}</div>}

            {/* No Data State */}
            {!loading && filteredCustomers.length === 0 && <div className="text-center py-8 text-gray-500">No customers found with pending payments.</div>}

            {/* Customers Table */}
            {!loading && filteredCustomers.length > 0 && (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Customer Payment Summary</h2>
                                <p className="text-gray-600 mt-2 text-sm">
                                    <span className="font-semibold text-primary">{stats.totalShipments}</span> shipments across{' '}
                                    <span className="font-semibold text-primary">{stats.totalCustomers}</span> customers
                                    {stats.totalDueAmount > 0 && <span className="ml-2 text-red-600 font-bold">• ₹{stats.totalDueAmount.toFixed(2)} total due</span>}
                                </p>
                            </div>
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                                Showing {getPaginatedData().length} of {getTotalCount()} customers
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        <Table
                            columns={columns}
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
            )}

            {/* View Customer Modal */}
            <ModelViewBox
                modal={viewModal}
                modelHeader={`📦 Payment Details - ${selectedCustomer?.customer_name}`}
                setModel={() => {
                    setViewModal(false);
                    setCustomerBookings(null);
                }}
                handleSubmit={null}
                modelSize="xl"
                saveBtn={false}
                customStyle="max-h-[80vh] overflow-y-auto"
            >
                {loadingBookings ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading customer bookings...</span>
                    </div>
                ) : (
                    customerBookings && (
                        <div className="space-y-6">
                            {/* Customer Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                            {selectedCustomer?.customer_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">{selectedCustomer?.customer_name}</div>
                                            <div className="flex items-center text-gray-600 mt-1">
                                                <IconPhone className="w-4 h-4 mr-1" />
                                                {selectedCustomer?.customer_number}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-red-600">₹{parseFloat(selectedCustomer?.summary?.responsible_pending || 0).toFixed(2)}</div>
                                        <div className="text-gray-600">Remaining Due Amount</div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Total Shipments</div>
                                        <div className="text-3xl font-bold text-primary">{customerBookings.summary?.total_bookings || 0}</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Total Amount</div>
                                        <div className="text-3xl font-bold text-gray-900">₹{parseFloat(customerBookings.summary?.total_amount || 0).toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Total Paid</div>
                                        <div className="text-3xl font-bold text-green-600">₹{parseFloat(customerBookings.summary?.total_paid || 0).toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-gray-600 mb-2">Payment Count</div>
                                        <div className="text-3xl font-bold text-blue-600">{customerBookings.summary?.total_payments || 0}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Summary */}
                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Payment Status Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                            <IconX className="w-6 h-6 text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Pending</div>
                                            <div className="text-xl font-bold text-yellow-700">{customerBookings.summary?.pending_bookings || 0}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <IconCheck className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Completed</div>
                                            <div className="text-xl font-bold text-green-700">{customerBookings.summary?.completed_bookings || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipments List with Payment History */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Shipment & Payment Details ({customerBookings.bookings?.length || 0})</h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {customerBookings.bookings?.map((booking, index) => (
                                        <div key={booking.booking_id} className="bg-white rounded-lg p-4 border border-gray-200">
                                            {/* Shipment Header */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                                                    <div>
                                                        <div className="font-bold text-gray-900">Shipment #{booking.booking_number}</div>
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            📅 {new Date(booking.booking_date).toLocaleDateString()} • {booking.fromCenter?.office_center_name} → {booking.toCenter?.office_center_name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-primary">₹{parseFloat(booking.total_amount).toFixed(2)}</div>
                                                    <div
                                                        className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                                                            booking.payment_status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : booking.payment_status === 'partial'
                                                                  ? 'bg-orange-100 text-orange-800'
                                                                  : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {booking.payment_status === 'pending' ? 'Pending' : booking.payment_status === 'partial' ? 'Partial' : 'Completed'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Package Details */}
                                            <div className="mb-3">
                                                <div className="text-sm font-medium text-gray-700 mb-1">Package Details:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.packages?.map((pkg, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                            {pkg.packageType?.package_type_name} × {pkg.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Summary */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                                <div className="text-center bg-gray-50 p-2 rounded">
                                                    <div className="text-sm text-gray-600">Total</div>
                                                    <div className="font-bold text-gray-900">₹{parseFloat(booking.total_amount).toFixed(2)}</div>
                                                </div>
                                                <div className="text-center bg-green-50 p-2 rounded">
                                                    <div className="text-sm text-green-600">Paid</div>
                                                    <div className="font-bold text-green-700">₹{parseFloat(booking.paid_amount).toFixed(2)}</div>
                                                </div>
                                                <div className="text-center bg-red-50 p-2 rounded">
                                                    <div className="text-sm text-red-600">Due</div>
                                                    <div className="font-bold text-red-700">₹{parseFloat(booking.due_amount).toFixed(2)}</div>
                                                </div>
                                                <div className="text-center bg-blue-50 p-2 rounded">
                                                    <div className="text-sm text-blue-600">Payments</div>
                                                    <div className="font-bold text-blue-700">{booking.payments?.length || 0}</div>
                                                </div>
                                            </div>

                                            {/* Payment History */}
                                            {booking.payments && booking.payments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="text-sm font-medium text-gray-700 mb-2">Payment History:</div>
                                                    <div className="space-y-2">
                                                        {booking.payments.map((payment, pIdx) => (
                                                            <div key={pIdx} className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
                                                                <div className="flex items-center space-x-2">
                                                                    <IconCalendar className="w-4 h-4 text-gray-500" />
                                                                    <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                                                                    <span className="px-2 py-0.5 bg-white rounded text-xs">{payment.payment_mode}</span>
                                                                    <span className="text-xs text-gray-500">{payment.payment_number}</span>
                                                                </div>
                                                                <div className="font-bold text-green-700">₹{parseFloat(payment.amount).toFixed(2)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* No Payment History */}
                                            {(!booking.payments || booking.payments.length === 0) && (
                                                <div className="text-center py-3 text-gray-500 text-sm border-t border-gray-200 mt-3">No payment history recorded for this shipment</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                )}
            </ModelViewBox>
        </div>
    );
};

export default PendingPayments;