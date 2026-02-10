import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { useNavigate } from 'react-router-dom';
import { showMessage } from '../../util/AllFunction';
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

const PendingPayments = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Dummy shipment data with payment history
    const dummyShipments = [
        {
            id: 1,
            fromCenter: 'Chennai Central Hub',
            toCenter: 'Bangalore South Terminal',
            fromLocation: '123 Main Street, Chennai',
            toLocation: '456 Park Avenue, Bangalore',
            fromMobile: '9876543210',
            fromName: 'John Doe',
            toMobile: '8765432109',
            toName: 'Robert Johnson',
            packageDetails: [
                { packageType: 'Box', quantity: 2, rate: 100, pickupPrice: 30, dropPrice: 45 },
            ],
            totalAmount: 275,
            paymentBy: 'from',
            paidAmount: 150,
            dueAmount: 125,
            status: 'pending',
            paymentStatus: 'partial',
            deliveryStatus: 'not_started',
            date: '2024-01-15',
            paymentHistory: [
                { date: '2024-01-15', amount: 100, method: 'Cash', reference: 'REF001' },
                { date: '2024-01-16', amount: 50, method: 'Online', reference: 'REF002' }
            ]
        },
        {
            id: 2,
            fromCenter: 'Mumbai Port Facility',
            toCenter: 'Delhi North Warehouse',
            fromLocation: '789 Marine Drive, Mumbai',
            toLocation: '101 Connaught Place, Delhi',
            fromMobile: '8765432109',
            fromName: 'Sarah Williams',
            toMobile: '7654321098',
            toName: 'Mike Brown',
            packageDetails: [
                { packageType: 'Document', quantity: 1, rate: 50, pickupPrice: 15, dropPrice: 25 },
                { packageType: 'Parcel', quantity: 2, rate: 30, pickupPrice: 25, dropPrice: 40 },
            ],
            totalAmount: 180,
            paymentBy: 'to',
            paidAmount: 0,
            dueAmount: 180,
            status: 'pending',
            paymentStatus: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-16',
            paymentHistory: []
        },
        {
            id: 3,
            fromCenter: 'Hyderabad Distribution Center',
            toCenter: 'Pune Cargo Terminal',
            fromLocation: '234 Banjara Hills, Hyderabad',
            toLocation: '890 FC Road, Pune',
            fromMobile: '9876543210',
            fromName: 'John Doe',
            toMobile: '6543210987',
            toName: 'David Wilson',
            packageDetails: [
                { packageType: 'Large Package', quantity: 1, rate: 200, pickupPrice: 60, dropPrice: 85 },
            ],
            totalAmount: 345,
            paymentBy: 'from',
            paidAmount: 200,
            dueAmount: 145,
            status: 'pending',
            paymentStatus: 'partial',
            deliveryStatus: 'in_transit',
            date: '2024-01-17',
            paymentHistory: [
                { date: '2024-01-17', amount: 100, method: 'Credit Card', reference: 'REF003' },
                { date: '2024-01-18', amount: 100, method: 'Cash', reference: 'REF004' }
            ]
        },
        {
            id: 4,
            fromCenter: 'Kolkata East Station',
            toCenter: 'Ahmedabad Logistics Hub',
            fromLocation: '567 Park Street, Kolkata',
            toLocation: '123 Law Garden, Ahmedabad',
            fromMobile: '9876543210',
            fromName: 'John Doe',
            toMobile: '9876543210',
            toName: 'Jane Smith',
            packageDetails: [
                { packageType: 'Medium Package', quantity: 2, rate: 80, pickupPrice: 40, dropPrice: 60 },
            ],
            totalAmount: 360,
            paymentBy: 'from',
            paidAmount: 360,
            dueAmount: 0,
            status: 'completed',
            paymentStatus: 'completed',
            deliveryStatus: 'delivered',
            date: '2024-01-18',
            paymentHistory: [
                { date: '2024-01-18', amount: 200, method: 'Online', reference: 'REF005' },
                { date: '2024-01-19', amount: 160, method: 'Cash', reference: 'REF006' }
            ]
        },
        {
            id: 5,
            fromCenter: 'Bangalore South Terminal',
            toCenter: 'Chennai Central Hub',
            fromLocation: '456 Park Avenue, Bangalore',
            toLocation: '123 Main Street, Chennai',
            fromMobile: '8765432109',
            fromName: 'Sarah Williams',
            toMobile: '8765432109',
            toName: 'Robert Johnson',
            packageDetails: [
                { packageType: 'Small Package', quantity: 3, rate: 50, pickupPrice: 20, dropPrice: 35 },
            ],
            totalAmount: 315,
            paymentBy: 'from',
            paidAmount: 0,
            dueAmount: 315,
            status: 'pending',
            paymentStatus: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-19',
            paymentHistory: []
        },
        {
            id: 6,
            fromCenter: 'Delhi North Warehouse',
            toCenter: 'Mumbai Port Facility',
            fromLocation: '101 Connaught Place, Delhi',
            toLocation: '789 Marine Drive, Mumbai',
            fromMobile: '7654321098',
            fromName: 'Mike Brown',
            toMobile: '7654321098',
            toName: 'Emily Davis',
            packageDetails: [
                { packageType: 'XL Package', quantity: 1, rate: 250, pickupPrice: 80, dropPrice: 110 },
            ],
            totalAmount: 440,
            paymentBy: 'from',
            paidAmount: 440,
            dueAmount: 0,
            status: 'completed',
            paymentStatus: 'completed',
            deliveryStatus: 'delivered',
            date: '2024-01-20',
            paymentHistory: [
                { date: '2024-01-20', amount: 200, method: 'Credit Card', reference: 'REF007' },
                { date: '2024-01-20', amount: 240, method: 'Online', reference: 'REF008' }
            ]
        },
    ];

    const [shipments, setShipments] = useState(dummyShipments);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentByFilter, setPaymentByFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [viewModal, setViewModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        dispatch(setPageTitle('Payment Management'));
        filterCustomers();
    }, [shipments, searchTerm, paymentByFilter, paymentStatusFilter]);

    // Process and filter customers
    const filterCustomers = () => {
        const customerMap = new Map();
        
        // Filter shipments based on payment status
        let filteredShipments = [...shipments];
        
        if (paymentStatusFilter !== 'all') {
            filteredShipments = filteredShipments.filter(shipment => shipment.paymentStatus === paymentStatusFilter);
        }
        
        // Group by customer
        filteredShipments.forEach(shipment => {
            const customerKey = shipment.paymentBy === 'from' 
                ? `${shipment.fromMobile}-${shipment.fromName}` 
                : `${shipment.toMobile}-${shipment.toName}`;
            
            if (!customerMap.has(customerKey)) {
                const customer = shipment.paymentBy === 'from' 
                    ? { 
                        key: customerKey,
                        mobile: shipment.fromMobile, 
                        name: shipment.fromName,
                        paymentBy: 'from'
                    }
                    : { 
                        key: customerKey,
                        mobile: shipment.toMobile, 
                        name: shipment.toName,
                        paymentBy: 'to'
                    };
                
                customerMap.set(customerKey, {
                    ...customer,
                    shipments: [],
                    totalDue: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                    shipmentCount: 0,
                    pendingCount: 0,
                    partialCount: 0,
                    completedCount: 0,
                    totalPayments: 0,
                    paymentCount: 0,
                    paymentMethods: {}
                });
            }
            
            const customerData = customerMap.get(customerKey);
            customerData.shipments.push(shipment);
            customerData.totalDue += shipment.dueAmount;
            customerData.totalAmount += shipment.totalAmount;
            customerData.paidAmount += shipment.paidAmount;
            customerData.shipmentCount += 1;
            
            // Calculate payment statistics
            shipment.paymentHistory.forEach(payment => {
                customerData.totalPayments += payment.amount;
                customerData.paymentCount += 1;
                
                // Count payment methods
                if (!customerData.paymentMethods[payment.method]) {
                    customerData.paymentMethods[payment.method] = 0;
                }
                customerData.paymentMethods[payment.method] += payment.amount;
            });
            
            // Count by status
            if (shipment.paymentStatus === 'pending') customerData.pendingCount += 1;
            else if (shipment.paymentStatus === 'partial') customerData.partialCount += 1;
            else if (shipment.paymentStatus === 'completed') customerData.completedCount += 1;
        });
        
        let customersArray = Array.from(customerMap.values());
        
        // Apply search filter
        if (searchTerm) {
            customersArray = customersArray.filter(
                customer =>
                    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.mobile.includes(searchTerm)
            );
        }

        // Apply paymentBy filter
        if (paymentByFilter !== 'all') {
            customersArray = customersArray.filter(customer => customer.paymentBy === paymentByFilter);
        }

        setFilteredCustomers(customersArray);
        setCurrentPage(0);
    };

    // Calculate stats
    const stats = {
        totalCustomers: filteredCustomers.length,
        totalDueAmount: filteredCustomers.reduce((sum, c) => sum + c.totalDue, 0),
        pendingCustomers: filteredCustomers.filter(c => c.pendingCount > 0).length,
        partialCustomers: filteredCustomers.filter(c => c.partialCount > 0).length,
        completedCustomers: filteredCustomers.filter(c => c.completedCount > 0).length,
        totalShipments: filteredCustomers.reduce((sum, c) => sum + c.shipmentCount, 0)
    };

    // Handle record payment button click
    const handleRecordPayment = (customer) => {
        // Filter only pending/partial shipments
        const pendingShipments = customer.shipments.filter(s => s.paymentStatus !== 'completed');
        if (pendingShipments.length === 0) {
            showMessage('error', 'No pending payments for this customer');
            return;
        }
        
        navigate(`/package/payment/${customer.key}`, { 
            state: { 
                customer: {
                    ...customer,
                    shipments: pendingShipments
                }
            } 
        });
    };

    // Handle view shipments (for customers with no due amount)
    const handleViewShipments = (customer) => {
        setSelectedCustomer(customer);
        setViewModal(true);
    };

    // Handle row click - if due amount > 0, record payment, else view
    const handleRowClick = (customer) => {
        if (customer.totalDue > 0) {
            handleRecordPayment(customer);
        } else {
            handleViewShipments(customer);
        }
    };

    // Table columns
    const columns = [
        {
            Header: 'CUSTOMER',
            accessor: 'customer',
            Cell: ({ row }) => (
                <div 
                    className="space-y-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleRowClick(row.original)}
                >
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900 text-lg">{row.original.name}</div>
                        <div className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {row.original.shipmentCount}
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <IconPhone className="w-4 h-4 mr-1" />
                        {row.original.mobile}
                    </div>
                </div>
            ),
        },
        {
            Header: 'FINANCIAL SUMMARY',
            accessor: 'financial',
            Cell: ({ row }) => (
                <div 
                    className="space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleRowClick(row.original)}
                >
                    <div className="flex justify-between items-center">
                        <span className={`font-bold text-lg ${row.original.totalDue > 0 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                            ₹{row.original.totalDue}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.original.totalDue > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {row.original.totalDue > 0 ? 'Due' : 'Paid'}
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        Total: ₹{row.original.totalAmount} • Paid: ₹{row.original.paidAmount}
                    </div>
                </div>
            ),
        },
        {
            Header: 'ACTIONS',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    {row.original.totalDue > 0 ? (
                        <button
                            onClick={() => handleRecordPayment(row.original)}
                            className="btn btn-success btn-sm flex items-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                        >
                            <IconDollarSign className="w-4 h-4 mr-1" />
                            <span className="hidden md:inline">Record Payment</span>
                            <span className="md:hidden">Pay</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleViewShipments(row.original)}
                            className="btn btn-info btn-sm flex items-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                        >
                            <IconEye className="w-4 h-4 mr-1" />
                            <span className="hidden md:inline">View Details</span>
                            <span className="md:hidden">View</span>
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
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredCustomers.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredCustomers.length;
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            Payment Management Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2 text-lg">Professional payment tracking and management system</p>
                    </div>
                </div>

                {/* Stats Cards with Animation */}
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
                                <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalDueAmount}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-full">
                                <IconDollarSign className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 h-1 bg-gradient-to-r from-primary to-purple-400 rounded-full"></div>
                    </div>
                </div>

                {/* Filters with Animation */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">🔍 Search Customer</label>
                            <div className="relative">
                                <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary transition-all duration-300"
                                    placeholder="Search by name or mobile..."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">💳 Payment By</label>
                            <select
                                value={paymentByFilter}
                                onChange={(e) => setPaymentByFilter(e.target.value)}
                                className="form-select w-full py-3 rounded-lg border-2 border-gray-200 focus:border-primary transition-all duration-300"
                            >
                                <option value="all">All Customers</option>
                                <option value="from">Sender Pays</option>
                                <option value="to">Receiver Pays</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">📊 Payment Status</label>
                            <select
                                value={paymentStatusFilter}
                                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                className="form-select w-full py-3 rounded-lg border-2 border-gray-200 focus:border-primary transition-all duration-300"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending Only</option>
                                <option value="partial">Partial Only</option>
                                <option value="completed">Completed Only</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Customer Payment Summary</h2>
                            <p className="text-gray-600 mt-2 text-sm">
                                <span className="font-semibold text-primary">{stats.totalShipments}</span> shipments across{' '}
                                <span className="font-semibold text-primary">{stats.totalCustomers}</span> customers
                                {stats.totalDueAmount > 0 && (
                                    <span className="ml-2 text-red-600 font-bold">
                                        • ₹{stats.totalDueAmount} total due
                                    </span>
                                )}
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
                        onSearchChange={handleSearch}
                        pagination={true}
                        isSearchable={false}
                        isSortable={true}
                        showPageSize={true}
                        responsive={true}
                        className="border-0"
                    />
                </div>
            </div>

            {/* View Customer Modal */}
            <ModelViewBox
                modal={viewModal}
                modelHeader={`📦 Payment Details - ${selectedCustomer?.name}`}
                setModel={() => setViewModal(false)}
                handleSubmit={null}
                modelSize="xl"
                saveBtn={false}
                customStyle="max-h-[80vh] overflow-y-auto"
            >
                {selectedCustomer && (
                    <div className="space-y-6">
                        {/* Customer Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</div>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <IconPhone className="w-4 h-4 mr-1" />
                                            {selectedCustomer.mobile}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-600">₹{selectedCustomer.totalDue}</div>
                                    <div className="text-gray-600">Remaining Due Amount</div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-600 mb-2">Total Shipments</div>
                                    <div className="text-3xl font-bold text-primary">{selectedCustomer.shipmentCount}</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-600 mb-2">Total Amount</div>
                                    <div className="text-3xl font-bold text-gray-900">₹{selectedCustomer.totalAmount}</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-600 mb-2">Total Paid</div>
                                    <div className="text-3xl font-bold text-green-600">₹{selectedCustomer.paidAmount}</div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-gray-600 mb-2">Payment Count</div>
                                    <div className="text-3xl font-bold text-blue-600">{selectedCustomer.paymentCount}</div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods Summary */}
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-green-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Payment Methods Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(selectedCustomer.paymentMethods).map(([method, amount], index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <IconCreditCard className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{method}</div>
                                            <div className="text-sm text-gray-600">₹{amount}</div>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(selectedCustomer.paymentMethods).length === 0 && (
                                    <div className="col-span-3 text-center py-4 text-gray-500">
                                        No payment methods recorded
                                    </div>
                                )}
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
                                        <div className="text-xl font-bold text-yellow-700">{selectedCustomer.pendingCount}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-orange-600">%</span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Partial</div>
                                        <div className="text-xl font-bold text-orange-700">{selectedCustomer.partialCount}</div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <IconCheck className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Completed</div>
                                        <div className="text-xl font-bold text-green-700">{selectedCustomer.completedCount}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipments List with Payment History */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Shipment & Payment Details ({selectedCustomer.shipments.length})</h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {selectedCustomer.shipments.map((shipment, index) => (
                                    <div 
                                        key={shipment.id} 
                                        className="bg-white rounded-lg p-4 border border-gray-200"
                                    >
                                        {/* Shipment Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-3">
                                                <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <div className="font-bold text-gray-900">Shipment #{shipment.id}</div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        📅 {shipment.date} • {shipment.fromCenter} → {shipment.toCenter}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-primary">₹{shipment.totalAmount}</div>
                                                <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                                                    shipment.paymentStatus === 'pending' 
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : shipment.paymentStatus === 'partial'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {shipment.paymentStatus === 'pending' ? 'Pending' : 
                                                     shipment.paymentStatus === 'partial' ? 'Partial' : 'Completed'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Package Details */}
                                        <div className="mb-3">
                                            <div className="text-sm font-medium text-gray-700 mb-1">Package Details:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {shipment.packageDetails.map((detail, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                        {detail.packageType} × {detail.quantity} @ ₹{detail.rate}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Payment Summary */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                            <div className="text-center bg-gray-50 p-2 rounded">
                                                <div className="text-sm text-gray-600">Total</div>
                                                <div className="font-bold text-gray-900">₹{shipment.totalAmount}</div>
                                            </div>
                                            <div className="text-center bg-green-50 p-2 rounded">
                                                <div className="text-sm text-green-600">Paid</div>
                                                <div className="font-bold text-green-700">₹{shipment.paidAmount}</div>
                                            </div>
                                            <div className="text-center bg-red-50 p-2 rounded">
                                                <div className="text-sm text-red-600">Due</div>
                                                <div className="font-bold text-red-700">₹{shipment.dueAmount}</div>
                                            </div>
                                            <div className="text-center bg-blue-50 p-2 rounded">
                                                <div className="text-sm text-blue-600">Payments</div>
                                                <div className="font-bold text-blue-700">{shipment.paymentHistory.length}</div>
                                            </div>
                                        </div>
                                        
                                        {/* Payment History */}
                                        {shipment.paymentHistory.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Payment History:</div>
                                                <div className="space-y-2">
                                                    {shipment.paymentHistory.map((payment, pIdx) => (
                                                        <div key={pIdx} className="flex items-center justify-between text-sm bg-green-50 p-2 rounded">
                                                            <div className="flex items-center space-x-2">
                                                                <IconCalendar className="w-4 h-4 text-gray-500" />
                                                                <span>{payment.date}</span>
                                                                <span className="px-2 py-0.5 bg-white rounded text-xs">
                                                                    {payment.method}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    Ref: {payment.reference}
                                                                </span>
                                                            </div>
                                                            <div className="font-bold text-green-700">₹{payment.amount}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* No Payment History */}
                                        {shipment.paymentHistory.length === 0 && (
                                            <div className="text-center py-3 text-gray-500 text-sm border-t border-gray-200 mt-3">
                                                No payment history recorded for this shipment
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default PendingPayments;