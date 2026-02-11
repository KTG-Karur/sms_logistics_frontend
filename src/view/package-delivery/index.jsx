import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Tippy from '@tippyjs/react';
import { showMessage } from '../../util/AllFunction';
import Select from 'react-select';
import IconPlus from '../../components/Icon/IconPlus';
import IconUser from '../../components/Icon/IconUser';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconPackage from '../../components/Icon/IconBox';
import IconTruck from '../../components/Icon/IconTruck';
import IconDriver from '../../components/Icon/IconDriver';
import IconUsers from '../../components/Icon/IconUsers';
import IconEye from '../../components/Icon/IconEye';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconClock from '../../components/Icon/IconClock';
import IconCheckCircle from '../../components/Icon/IconCheckCircle';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconRoute from '../../components/Icon/Menu/IconMenuWidgets';
import IconLayers from '../../components/Icon/IconLayers';
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconFlag from '../../components/Icon/IconAt';
import IconSearch from '../../components/Icon/IconSearch';
import IconFilter from '../../components/Icon/IconCoffee';
import IconCheck from '../../components/Icon/IconCheck';
import IconEdit from '../../components/Icon/IconEdit';
import IconClipboardList from '../../components/Icon/IconClipboardText';
import IconTruckDelivery from '../../components/Icon/IconTruck';
import IconHome from '../../components/Icon/IconHome';
import IconBuilding from '../../components/Icon/IconBuilding';

// Custom responsive table component
const ResponsiveTable = ({ 
    columns, 
    data, 
    pageSize = 10,
    pageIndex = 0,
    totalCount,
    totalPages,
    onPaginationChange,
    onSearchChange,
    pagination = true,
    isSearchable = true,
    searchPlaceholder = "Search...",
    showPageSize = true,
    showStatusFilter = false,
    statusFilterValue = 'all',
    onStatusFilterChange
}) => {
    const [currentPage, setCurrentPage] = useState(pageIndex);
    const [rowsPerPage, setRowsPerPage] = useState(pageSize);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Handle search
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(0);
        if (onSearchChange) onSearchChange(term);
    }, [onSearchChange]);
    
    // Handle page change
    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        if (onPaginationChange) onPaginationChange(page, rowsPerPage);
    }, [onPaginationChange, rowsPerPage]);
    
    // Handle rows per page change
    const handleRowsPerPageChange = useCallback((e) => {
        const newRowsPerPage = parseInt(e.target.value);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(0);
        if (onPaginationChange) onPaginationChange(0, newRowsPerPage);
    }, [onPaginationChange]);
    
    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(row => 
            columns.some(col => {
                if (col.accessor && row[col.accessor]) {
                    return String(row[col.accessor]).toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            })
        );
    }, [data, searchTerm, columns]);
    
    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const startIndex = currentPage * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, rowsPerPage]);

    // Calculate actual total pages
    const actualTotalPages = useMemo(() => {
        return Math.ceil(filteredData.length / rowsPerPage);
    }, [filteredData.length, rowsPerPage]);
    
    return (
        <div className="w-full">
            {/* Search and Filter Bar */}
            <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
                {isSearchable && (
                    <div className="sm:w-64">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <IconSearch className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}
                
                {showStatusFilter && (
                    <div className="sm:w-48">
                        <div className="relative">
                            <select
                                value={statusFilterValue}
                                onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in_progress">In Progress</option>
                                <option value="at_warehouse">At Warehouse</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="delayed">Delayed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <IconFilter className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    {columns.map((column, index) => (
                                        <th
                                            key={index}
                                            scope="col"
                                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                            style={{ width: column.width }}
                                        >
                                            {column.Header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                            {columns.map((column, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap"
                                                >
                                                    {column.Cell ? column.Cell({ value: row[column.accessor], row: { original: row } }) : row[column.accessor]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-gray-500">
                                            No data found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {paginatedData.length > 0 ? (
                    paginatedData.map((row, rowIndex) => (
                        <div key={rowIndex} className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {columns.map((column, colIndex) => (
                                    <div key={colIndex} className={`${column.mobileFull ? 'col-span-2' : ''}`}>
                                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                                            {column.Header}
                                        </div>
                                        <div className="text-sm text-gray-900">
                                            {column.Cell ? column.Cell({ value: row[column.accessor], row: { original: row } }) : row[column.accessor]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
                        <div className="text-gray-500 text-sm">No data found</div>
                    </div>
                )}
            </div>
            
            {/* Pagination */}
            {pagination && filteredData.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{currentPage * rowsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min((currentPage + 1) * rowsPerPage, filteredData.length)}
                        </span>{' '}
                        of <span className="font-medium">{filteredData.length}</span> results
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                        {showPageSize && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Show:</span>
                                <select
                                    value={rowsPerPage}
                                    onChange={handleRowsPerPageChange}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                                >
                                    {[5, 10, 20, 50].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className={`px-3 py-1.5 rounded border text-sm ${
                                    currentPage === 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                }`}
                            >
                                Previous
                            </button>
                            
                            {Array.from({ length: Math.min(5, actualTotalPages) }).map((_, i) => {
                                let pageNum;
                                if (actualTotalPages <= 5) {
                                    pageNum = i;
                                } else if (currentPage <= 2) {
                                    pageNum = i;
                                } else if (currentPage >= actualTotalPages - 3) {
                                    pageNum = actualTotalPages - 5 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1.5 rounded border text-sm ${
                                            currentPage === pageNum
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                            
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= actualTotalPages - 1}
                                className={`px-3 py-1.5 rounded border text-sm ${
                                    currentPage >= actualTotalPages - 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DeliveryManagement = () => {
    const dispatch = useDispatch();

    // Dummy trips data with various statuses
    const [trips, setTrips] = useState([
        {
            id: 1,
            tripNo: 'TRIP0001',
            bookingId: 'BK001',
            customerName: 'John Doe',
            customerPhone: '9876543210',
            fromBranch: 'Chennai Central Hub',
            toBranch: 'Bangalore South Terminal',
            fromAddress: '123 Main Street, Chennai',
            toAddress: '456 Park Avenue, Bangalore',
            receiverName: 'Robert Johnson',
            receiverPhone: '8765432109',
            vehicleNo: 'TN01AB1234',
            driverName: 'Rajesh Kumar',
            driverPhone: '9876543210',
            loadmen: ['Ramesh', 'Suresh'],
            totalPackages: 3,
            totalWeight: 27,
            totalAmount: 365,
            tripDate: '2024-01-20',
            scheduledTime: '08:00 - 14:00',
            currentStatus: 'out_for_delivery',
            deliveryStatus: 'in_transit',
            lastUpdated: '2024-01-20 09:30',
            estimatedDelivery: '2024-01-20 14:00',
            actualDelivery: null,
            deliveryNotes: 'Call before delivery',
            paymentStatus: 'paid',
            paymentMethod: 'cash',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Box', 
                    quantity: 2, 
                    weight: 25,
                    dimensions: '30x30x30 cm',
                    specialInstructions: 'Fragile',
                    status: 'out_for_delivery'
                },
                { 
                    id: 2, 
                    packageType: 'Document', 
                    quantity: 1, 
                    weight: 2,
                    dimensions: 'A4 Envelope',
                    specialInstructions: 'Handle with care',
                    status: 'out_for_delivery'
                }
            ]
        },
        {
            id: 2,
            tripNo: 'TRIP0002',
            bookingId: 'BK002',
            customerName: 'Rajesh Kumar',
            customerPhone: '9876543211',
            fromBranch: 'Bangalore South Terminal',
            toBranch: 'Mumbai Port Facility',
            fromAddress: 'Bangalore City Center',
            toAddress: '789 Marine Drive, Mumbai',
            receiverName: 'Suresh Patel',
            receiverPhone: '8765432110',
            vehicleNo: 'KA02CD5678',
            driverName: 'Suresh Patel',
            driverPhone: '9876543211',
            loadmen: ['Ganesh', 'Mahesh'],
            totalPackages: 3,
            totalWeight: 26,
            totalAmount: 725,
            tripDate: '2024-01-18',
            scheduledTime: '09:00 - 17:00',
            currentStatus: 'at_warehouse',
            deliveryStatus: 'not_started',
            lastUpdated: '2024-01-18 08:45',
            estimatedDelivery: '2024-01-19 17:00',
            actualDelivery: null,
            deliveryNotes: 'Wait for confirmation',
            paymentStatus: 'pending',
            paymentMethod: 'card',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Document', 
                    quantity: 3, 
                    weight: 3,
                    dimensions: 'A4 Envelope',
                    specialInstructions: 'Urgent delivery',
                    status: 'at_warehouse'
                },
                { 
                    id: 2, 
                    packageType: 'Small Package', 
                    quantity: 2, 
                    weight: 8,
                    dimensions: '20x20x20 cm',
                    specialInstructions: 'Keep upright',
                    status: 'at_warehouse'
                },
                { 
                    id: 3, 
                    packageType: 'Parcel', 
                    quantity: 1, 
                    weight: 15,
                    dimensions: '40x30x20 cm',
                    specialInstructions: 'Fragile contents',
                    status: 'at_warehouse'
                }
            ]
        },
        {
            id: 3,
            tripNo: 'TRIP0003',
            bookingId: 'BK003',
            customerName: 'Priya Sharma',
            customerPhone: '9876543212',
            fromBranch: 'Karur Hub',
            toBranch: 'Hyderabad Distribution Center',
            fromAddress: 'Karur Textile Market',
            toAddress: '234 Banjara Hills, Hyderabad',
            receiverName: 'Amit Verma',
            receiverPhone: '8765432111',
            vehicleNo: 'MH03EF9012',
            driverName: 'Mohan Singh',
            driverPhone: '9876543212',
            loadmen: ['Raju', 'Kumar'],
            totalPackages: 5,
            totalWeight: 15,
            totalAmount: 425,
            tripDate: '2024-01-19',
            scheduledTime: '10:00 - 16:00',
            currentStatus: 'in_progress',
            deliveryStatus: 'in_transit',
            lastUpdated: '2024-01-19 11:15',
            estimatedDelivery: '2024-01-19 16:00',
            actualDelivery: null,
            deliveryNotes: 'Textile goods, keep dry',
            paymentStatus: 'paid',
            paymentMethod: 'online',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Small Package', 
                    quantity: 5, 
                    weight: 3,
                    dimensions: '15x15x15 cm',
                    specialInstructions: 'Standard delivery',
                    status: 'in_progress'
                }
            ]
        },
        {
            id: 4,
            tripNo: 'TRIP0004',
            bookingId: 'BK004',
            customerName: 'Vikram Singh',
            customerPhone: '9876543214',
            fromBranch: 'Karur Hub',
            toBranch: 'Pune Delivery Hub',
            fromAddress: 'Karur IT Park',
            toAddress: '123 MG Road, Pune',
            receiverName: 'Anjali Mehta',
            receiverPhone: '8765432112',
            vehicleNo: 'DL04GH3456',
            driverName: 'Amit Sharma',
            driverPhone: '9876543213',
            loadmen: ['Ramesh', 'Suresh'],
            totalPackages: 1,
            totalWeight: 40,
            totalAmount: 410,
            tripDate: '2024-01-20',
            scheduledTime: '07:00 - 13:00',
            currentStatus: 'delivered',
            deliveryStatus: 'delivered',
            lastUpdated: '2024-01-20 12:45',
            estimatedDelivery: '2024-01-20 13:00',
            actualDelivery: '2024-01-20 12:45',
            deliveryNotes: 'Electronics - handled carefully',
            paymentStatus: 'paid',
            paymentMethod: 'cash',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Electronics', 
                    quantity: 1, 
                    weight: 40,
                    dimensions: '50x40x30 cm',
                    specialInstructions: 'Handle with care, Fragile',
                    status: 'delivered'
                }
            ]
        },
        {
            id: 5,
            tripNo: 'TRIP0005',
            bookingId: 'BK005',
            customerName: 'Anjali Mehta',
            customerPhone: '9876543215',
            fromBranch: 'Pune Delivery Hub',
            toBranch: 'Mumbai Port Facility',
            fromAddress: '123 MG Road, Pune',
            toAddress: '789 Marine Drive, Mumbai',
            receiverName: 'Raj Malhotra',
            receiverPhone: '8765432113',
            vehicleNo: 'GJ05IJ7890',
            driverName: 'Rajesh Kumar',
            driverPhone: '9876543210',
            loadmen: ['Ganesh', 'Mahesh'],
            totalPackages: 10,
            totalWeight: 25,
            totalAmount: 470,
            tripDate: '2024-01-20',
            scheduledTime: '14:00 - 20:00',
            currentStatus: 'delayed',
            deliveryStatus: 'delayed',
            lastUpdated: '2024-01-20 16:30',
            estimatedDelivery: '2024-01-20 20:00',
            actualDelivery: null,
            deliveryNotes: 'Traffic congestion on highway',
            paymentStatus: 'pending',
            paymentMethod: 'card',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Clothing', 
                    quantity: 10, 
                    weight: 25,
                    dimensions: '30x20x15 cm',
                    specialInstructions: 'Keep dry',
                    status: 'delayed'
                }
            ]
        },
        {
            id: 6,
            tripNo: 'TRIP0006',
            bookingId: 'BK006',
            customerName: 'Raj Malhotra',
            customerPhone: '9876543216',
            fromBranch: 'Mumbai Port Facility',
            toBranch: 'Ahmedabad Warehouse',
            fromAddress: '789 Marine Drive, Mumbai',
            toAddress: '456 Ring Road, Ahmedabad',
            receiverName: 'Sunil Patel',
            receiverPhone: '8765432114',
            vehicleNo: 'TN01AB1234',
            driverName: 'Suresh Patel',
            driverPhone: '9876543211',
            loadmen: ['Raju', 'Kumar'],
            totalPackages: 3,
            totalWeight: 75,
            totalAmount: 790,
            tripDate: '2024-01-21',
            scheduledTime: '06:00 - 14:00',
            currentStatus: 'scheduled',
            deliveryStatus: 'scheduled',
            lastUpdated: '2024-01-20 18:00',
            estimatedDelivery: '2024-01-21 14:00',
            actualDelivery: null,
            deliveryNotes: 'Heavy machinery parts',
            paymentStatus: 'paid',
            paymentMethod: 'online',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Machinery Parts', 
                    quantity: 3, 
                    weight: 75,
                    dimensions: '60x40x30 cm',
                    specialInstructions: 'Heavy machinery, use forklift',
                    status: 'scheduled'
                }
            ]
        },
        {
            id: 7,
            tripNo: 'TRIP0007',
            bookingId: 'BK007',
            customerName: 'Karthik Raj',
            customerPhone: '9876543217',
            fromBranch: 'Karur Hub',
            toBranch: 'Coimbatore Terminal',
            fromAddress: 'Karur Bus Stand',
            toAddress: 'Coimbatore City Center',
            receiverName: 'Senthil Kumar',
            receiverPhone: '8765432115',
            vehicleNo: 'KA02CD5678',
            driverName: 'Mohan Singh',
            driverPhone: '9876543212',
            loadmen: ['Ramesh', 'Suresh'],
            totalPackages: 8,
            totalWeight: 32,
            totalAmount: 660,
            tripDate: '2024-01-22',
            scheduledTime: '09:00 - 13:00',
            currentStatus: 'cancelled',
            deliveryStatus: 'cancelled',
            lastUpdated: '2024-01-21 10:00',
            estimatedDelivery: '2024-01-22 13:00',
            actualDelivery: null,
            deliveryNotes: 'Customer requested cancellation',
            paymentStatus: 'refunded',
            paymentMethod: 'online',
            expanded: false,
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Textiles', 
                    quantity: 8, 
                    weight: 32,
                    dimensions: '40x30x20 cm',
                    specialInstructions: 'Textile goods',
                    status: 'cancelled'
                }
            ]
        }
    ]);

    // States
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [packageStatuses, setPackageStatuses] = useState({});
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Get unique branches
    const branches = useMemo(() => {
        const uniqueBranches = [...new Set(trips.map(trip => trip.fromBranch))];
        const branchOptions = uniqueBranches.map(branch => ({
            value: branch,
            label: branch
        }));
        return [{ value: 'all', label: 'All Branches' }, ...branchOptions];
    }, [trips]);

    // Filter trips based on branch and status
    const filteredTrips = useMemo(() => {
        let filtered = trips;
        
        // Filter by branch
        if (selectedBranch !== 'all') {
            filtered = filtered.filter(trip => trip.fromBranch === selectedBranch);
        }
        
        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(trip => trip.currentStatus === selectedStatus);
        }
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(trip =>
                trip.tripNo.toLowerCase().includes(term) ||
                trip.bookingId.toLowerCase().includes(term) ||
                trip.customerName.toLowerCase().includes(term) ||
                trip.customerPhone.includes(term) ||
                trip.fromBranch.toLowerCase().includes(term) ||
                trip.toBranch.toLowerCase().includes(term) ||
                trip.vehicleNo.toLowerCase().includes(term) ||
                trip.driverName.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }, [trips, selectedBranch, selectedStatus, searchTerm]);

    useEffect(() => {
        dispatch(setPageTitle('Delivery Management'));
    }, [dispatch]);

    // Get status counts for stats
    const statusCounts = useMemo(() => {
        const counts = {
            total: trips.length,
            scheduled: trips.filter(t => t.currentStatus === 'scheduled').length,
            in_progress: trips.filter(t => t.currentStatus === 'in_progress').length,
            at_warehouse: trips.filter(t => t.currentStatus === 'at_warehouse').length,
            out_for_delivery: trips.filter(t => t.currentStatus === 'out_for_delivery').length,
            delivered: trips.filter(t => t.currentStatus === 'delivered').length,
            delayed: trips.filter(t => t.currentStatus === 'delayed').length,
            cancelled: trips.filter(t => t.currentStatus === 'cancelled').length,
        };
        return counts;
    }, [trips]);

    // Toggle trip details
    const toggleTripDetails = (tripId) => {
        setTrips(prevTrips => 
            prevTrips.map(trip => 
                trip.id === tripId 
                    ? { ...trip, expanded: !trip.expanded }
                    : { ...trip, expanded: false }
            )
        );
    };

    // Handle status update
    const handleStatusUpdate = (trip) => {
        setSelectedTrip(trip);
        setUpdateStatus(trip.currentStatus);
        setDeliveryNotes(trip.deliveryNotes || '');
        setShowUpdateModal(true);
        
        // Initialize package statuses
        const packageStatusMap = {};
        trip.packageDetails.forEach(pkg => {
            packageStatusMap[pkg.id] = pkg.status;
        });
        setPackageStatuses(packageStatusMap);
    };

    // Update package status
    const handleUpdatePackageStatus = (packageId, newStatus) => {
        setPackageStatuses(prev => ({
            ...prev,
            [packageId]: newStatus
        }));
    };

    // Submit status update
    const submitStatusUpdate = () => {
        if (!selectedTrip || !updateStatus) return;

        const now = new Date();
        const currentDateTime = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Update all packages to the new status
        const updatedPackages = selectedTrip.packageDetails.map(pkg => ({
            ...pkg,
            status: packageStatuses[pkg.id] || updateStatus
        }));

        // Check if all packages are delivered
        const allPackagesDelivered = updatedPackages.every(pkg => pkg.status === 'delivered');
        
        setTrips(prevTrips => 
            prevTrips.map(trip => 
                trip.id === selectedTrip.id 
                    ? {
                        ...trip,
                        currentStatus: allPackagesDelivered ? 'delivered' : updateStatus,
                        deliveryStatus: allPackagesDelivered ? 'delivered' : updateStatus,
                        lastUpdated: currentDateTime,
                        deliveryNotes: deliveryNotes,
                        actualDelivery: updateStatus === 'delivered' ? currentDateTime.split(' ')[1] : trip.actualDelivery,
                        packageDetails: updatedPackages
                    }
                    : trip
            )
        );

        showMessage('success', `Status updated to ${updateStatus} for Trip ${selectedTrip.tripNo}`);
        setShowUpdateModal(false);
        setSelectedTrip(null);
        setUpdateStatus('');
        setDeliveryNotes('');
        setPackageStatuses({});
    };

    // Handle quick status update
    const handleQuickStatusUpdate = (tripId, newStatus) => {
        const now = new Date();
        const currentDateTime = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setTrips(prevTrips => 
            prevTrips.map(trip => 
                trip.id === tripId 
                    ? {
                        ...trip,
                        currentStatus: newStatus,
                        deliveryStatus: newStatus,
                        lastUpdated: currentDateTime,
                        actualDelivery: newStatus === 'delivered' ? currentDateTime.split(' ')[1] : trip.actualDelivery,
                        packageDetails: trip.packageDetails.map(pkg => ({
                            ...pkg,
                            status: newStatus
                        }))
                    }
                    : trip
            )
        );

        showMessage('success', `Status updated to ${newStatus}`);
    };

    // View package details
    const viewPackageDetails = (pkg, trip) => {
        setSelectedPackage({ ...pkg, tripNo: trip.tripNo });
        setShowPackageModal(true);
    };

    // Update single package status
    const updateSinglePackageStatus = (packageId, newStatus) => {
        if (!selectedTrip) return;

        setTrips(prevTrips => 
            prevTrips.map(trip => 
                trip.id === selectedTrip.id 
                    ? {
                        ...trip,
                        packageDetails: trip.packageDetails.map(pkg => 
                            pkg.id === packageId 
                                ? { ...pkg, status: newStatus }
                                : pkg
                        ),
                        lastUpdated: `${new Date().toISOString().split('T')[0]} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
                    }
                    : trip
            )
        );

        showMessage('success', `Package status updated to ${newStatus}`);
        setShowPackageModal(false);
        setSelectedPackage(null);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'at_warehouse': return 'bg-purple-100 text-purple-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'delayed': return 'bg-red-100 text-red-800';
            case 'cancelled': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled': return '⏰';
            case 'in_progress': return '🚚';
            case 'at_warehouse': return '🏢';
            case 'out_for_delivery': return '📦';
            case 'delivered': return '✓';
            case 'delayed': return '⚠️';
            case 'cancelled': return '✗';
            default: return '📋';
        }
    };

    // Get status options for dropdown
    const statusOptions = [
        { value: 'scheduled', label: 'Scheduled', icon: '⏰' },
        { value: 'in_progress', label: 'In Progress', icon: '🚚' },
        { value: 'at_warehouse', label: 'At Warehouse', icon: '🏢' },
        { value: 'out_for_delivery', label: 'Out for Delivery', icon: '📦' },
        { value: 'delivered', label: 'Delivered', icon: '✓' },
        { value: 'delayed', label: 'Delayed', icon: '⚠️' },
        { value: 'cancelled', label: 'Cancelled', icon: '✗' },
    ];

    // Handle pagination change
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Handle search change
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    // Trip details component
    const TripDetails = ({ trip }) => {
        if (!trip.expanded) return null;

        return (
            <div className="bg-gray-50 rounded-lg mt-4 p-4 sm:p-6 border border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* Trip Information */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                            Trip Information
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Trip No:</span>
                                <span className="font-medium text-blue-600">{trip.tripNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-medium">{trip.bookingId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium">{trip.tripDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Schedule:</span>
                                <span className="font-medium">{trip.scheduledTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-medium">{trip.lastUpdated}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Estimated Delivery:</span>
                                <span className={`font-medium ${trip.currentStatus === 'delayed' ? 'text-red-600' : 'text-green-600'}`}>
                                    {trip.estimatedDelivery}
                                </span>
                            </div>
                            {trip.actualDelivery && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Actual Delivery:</span>
                                    <span className="font-medium text-green-600">{trip.actualDelivery}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer & Receiver Info */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                            Customer & Receiver
                        </h4>
                        <div className="space-y-3 text-xs sm:text-sm">
                            <div>
                                <div className="text-gray-600 font-medium mb-1">Customer:</div>
                                <div className="font-medium">{trip.customerName}</div>
                                <div className="text-gray-600">{trip.customerPhone}</div>
                            </div>
                            <div>
                                <div className="text-gray-600 font-medium mb-1">Receiver:</div>
                                <div className="font-medium">{trip.receiverName}</div>
                                <div className="text-gray-600">{trip.receiverPhone}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-gray-600 font-medium mb-1">Payment:</div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${trip.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {trip.paymentStatus}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-gray-600 font-medium mb-1">Method:</div>
                                    <span className="font-medium">{trip.paymentMethod}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & Team */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconTruck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                            Vehicle & Team
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vehicle:</span>
                                <span className="font-medium">{trip.vehicleNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Driver:</span>
                                <span className="font-medium">{trip.driverName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Driver Contact:</span>
                                <span className="font-medium">{trip.driverPhone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Loadmen:</span>
                                <span className="font-medium">{trip.loadmen.join(', ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Load Summary */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconPackage className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                            Load Summary
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Packages:</span>
                                <span className="font-medium">{trip.totalPackages}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Weight:</span>
                                <span className="font-medium">{trip.totalWeight}kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-medium text-green-600">₹{trip.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Delivery Notes:</span>
                                <span className="font-medium text-gray-700">{trip.deliveryNotes || 'None'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                <div className="mb-4 sm:mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg border-b pb-2">
                        Package Details ({trip.packageDetails.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {trip.packageDetails.map((pkg, index) => (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-medium text-gray-800 text-sm sm:text-base">
                                            {pkg.packageType} × {pkg.quantity}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            ID: PKG{pkg.id.toString().padStart(3, '0')}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                                        {getStatusIcon(pkg.status)} {pkg.status}
                                    </span>
                                </div>
                                
                                <div className="space-y-1 text-xs sm:text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Weight:</span>
                                        <span className="font-medium">{pkg.weight}kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dimensions:</span>
                                        <span className="font-medium">{pkg.dimensions}</span>
                                    </div>
                                    {pkg.specialInstructions && (
                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                            <div className="text-xs text-gray-600 font-medium">Special Instructions:</div>
                                            <div className="text-xs text-yellow-600">{pkg.specialInstructions}</div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => viewPackageDetails(pkg, trip)}
                                        className="btn btn-outline-primary btn-xs sm:btn-sm w-full text-xs sm:text-sm"
                                    >
                                        <IconEye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        View & Update Package
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => handleStatusUpdate(trip)}
                        className="btn btn-primary btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                    >
                        <IconEdit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Update Delivery Status
                    </button>
                    
                    {trip.currentStatus === 'out_for_delivery' && (
                        <button
                            onClick={() => handleQuickStatusUpdate(trip.id, 'delivered')}
                            className="btn btn-success btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                        >
                            <IconCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Mark as Delivered
                        </button>
                    )}
                    
                    {trip.currentStatus === 'in_progress' && (
                        <button
                            onClick={() => handleQuickStatusUpdate(trip.id, 'out_for_delivery')}
                            className="btn btn-warning btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                        >
                            <IconTruckDelivery className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Mark as Out for Delivery
                        </button>
                    )}
                    
                    {trip.currentStatus === 'at_warehouse' && (
                        <button
                            onClick={() => handleQuickStatusUpdate(trip.id, 'in_progress')}
                            className="btn btn-info btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                        >
                            <IconTruck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Start Delivery
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Table columns
    const columns = useMemo(() => [
        {
            Header: 'Trip No',
            accessor: 'tripNo',
            Cell: ({ value, row }) => {
                const trip = row.original;
                return (
                    <div className="font-medium">
                        <div className="text-primary font-bold text-sm sm:text-base">{value}</div>
                        <div className="text-xs text-gray-500 mt-1">{trip.bookingId}</div>
                    </div>
                );
            },
            width: 120,
            mobileFull: false,
        },
        {
            Header: 'Customer & Route',
            accessor: 'customerRoute',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-gray-800 text-sm sm:text-base">
                            {trip.customerName}
                        </div>
                        <div className="text-xs text-gray-600">
                            {trip.customerPhone}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <IconMapPin className="w-3 h-3 mr-1" />
                            {trip.fromBranch} → {trip.toBranch}
                        </div>
                    </div>
                );
            },
            width: 180,
            mobileFull: true,
        },
        {
            Header: 'Delivery Info',
            accessor: 'deliveryInfo',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm">
                            <span className="font-medium">{trip.tripDate}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                            {trip.scheduledTime}
                        </div>
                        <div className="text-xs text-gray-500">
                            Est: {trip.estimatedDelivery}
                        </div>
                    </div>
                );
            },
            width: 120,
            mobileFull: false,
        },
        {
            Header: 'Vehicle & Driver',
            accessor: 'vehicleDriver',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-xs sm:text-sm">
                            <IconTruck className="w-3 h-3 inline mr-1" />
                            {trip.vehicleNo}
                        </div>
                        <div className="text-xs text-gray-600">
                            <IconDriver className="w-3 h-3 inline mr-1" />
                            {trip.driverName}
                        </div>
                    </div>
                );
            },
            width: 140,
            mobileFull: false,
        },
        {
            Header: 'Status',
            accessor: 'currentStatus',
            Cell: ({ value, row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                            {getStatusIcon(value)} {value.replace('_', ' ')}
                        </span>
                        <div className="text-xs text-gray-500">
                            {trip.totalPackages} packages
                        </div>
                    </div>
                );
            },
            width: 130,
            mobileFull: false,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Tippy content={trip.expanded ? "Hide Details" : "View Details"}>
                            <button 
                                onClick={() => toggleTripDetails(trip.id)} 
                                className="btn btn-outline-primary btn-xs sm:btn-sm p-1 sm:p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                {trip.expanded ? <IconChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <IconEye className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </button>
                        </Tippy>
                        
                        <Tippy content="Update Status">
                            <button 
                                onClick={() => handleStatusUpdate(trip)} 
                                className="btn btn-outline-success btn-xs sm:btn-sm p-1 sm:p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                            >
                                <IconEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </Tippy>
                        
                        {trip.currentStatus === 'out_for_delivery' && (
                            <Tippy content="Mark Delivered">
                                <button 
                                    onClick={() => handleQuickStatusUpdate(trip.id, 'delivered')} 
                                    className="btn btn-outline-green btn-xs sm:btn-sm p-1 sm:p-1.5 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                                >
                                    <IconCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </Tippy>
                        )}
                    </div>
                );
            },
            width: 140,
            mobileFull: false,
        },
    ], []);

    return (
        <div className="container mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 sm:mb-6">
                    <div className="w-full lg:w-auto">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Delivery Status</h1>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                            Track and update delivery status for all trips
                        </p>
                    </div>
                </div>

                {/* Branch Filter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-full sm:w-auto">
                        <div className="flex items-center space-x-2">
                            <IconBuilding className="w-4 h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by Branch:</span>
                        </div>
                        <Select
                            options={branches}
                            value={branches.find(branch => branch.value === selectedBranch)}
                            onChange={(option) => setSelectedBranch(option.value)}
                            className="react-select mt-2 w-full sm:w-48 lg:w-64"
                            classNamePrefix="select"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    minHeight: '38px',
                                    fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                }),
                            }}
                        />
                    </div>
                    
                    <div className="w-full sm:w-auto">
                        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                            Showing {filteredTrips.length} of {trips.length} trips
                        </div>
                    </div>
                </div>
            </div>

            {/* Trips Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="w-full lg:w-auto">
                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Delivery Status</h2>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                                Update delivery status and track progress
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-3 sm:p-4">
                    <ResponsiveTable
                        columns={columns}
                        data={filteredTrips}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={filteredTrips.length}
                        totalPages={Math.ceil(filteredTrips.length / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        onSearchChange={handleSearch}
                        pagination={true}
                        isSearchable={true}
                        searchPlaceholder="Search trips by trip no, customer, phone, vehicle..."
                        showPageSize={true}
                        showStatusFilter={true}
                        statusFilterValue={selectedStatus}
                        onStatusFilterChange={setSelectedStatus}
                    />
                    
                    {/* Render Trip Details for expanded rows */}
                    {trips.filter(trip => trip.expanded).map(trip => (
                        <TripDetails key={trip.id} trip={trip} />
                    ))}
                </div>
            </div>

            {/* Update Status Modal */}
            {showUpdateModal && selectedTrip && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                Update Delivery Status - {selectedTrip.tripNo}
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm">
                                Customer: {selectedTrip.customerName} | From: {selectedTrip.fromBranch} → To: {selectedTrip.toBranch}
                            </p>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                          

                            {/* Package Status Updates */}
                            <div className="mb-6">
                                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
                                    Update Package Statuses ({selectedTrip.packageDetails.length} packages)
                                </label>
                                <div className="space-y-3">
                                    {selectedTrip.packageDetails.map((pkg) => (
                                        <div key={pkg.id} className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                                                <div>
                                                    <div className="font-medium text-gray-800 text-sm sm:text-base">
                                                        {pkg.packageType} × {pkg.quantity}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Weight: {pkg.weight}kg • Size: {pkg.dimensions}
                                                    </div>
                                                    {pkg.specialInstructions && (
                                                        <div className="text-xs text-yellow-600 mt-1">
                                                            Note: {pkg.specialInstructions}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-2 sm:mt-0">
                                                    <select
                                                        value={packageStatuses[pkg.id] || pkg.status}
                                                        onChange={(e) => handleUpdatePackageStatus(pkg.id, e.target.value)}
                                                        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                                                    >
                                                        {statusOptions.map((option) => (
                                                            <option key={option.value} value={option.value}>
                                                                {option.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Notes */}
                            <div className="mb-6">
                                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                                    Delivery Notes
                                </label>
                                <textarea
                                    value={deliveryNotes}
                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                                    rows="3"
                                    placeholder="Add any delivery notes or special instructions..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setSelectedTrip(null);
                                        setUpdateStatus('');
                                        setDeliveryNotes('');
                                        setPackageStatuses({});
                                    }}
                                    className="btn btn-outline-secondary hover:shadow-md transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitStatusUpdate}
                                    disabled={!updateStatus}
                                    className={`btn shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 sm:px-6 w-full sm:w-auto ${
                                        !updateStatus ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'
                                    }`}
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Package Details Modal */}
            {showPackageModal && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                Package Details
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm">
                                Trip: {selectedPackage.tripNo}
                            </p>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs text-gray-600">Package Type</div>
                                            <div className="font-medium text-sm sm:text-base">{selectedPackage.packageType}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Quantity</div>
                                            <div className="font-medium text-sm sm:text-base">{selectedPackage.quantity}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Weight</div>
                                            <div className="font-medium text-sm sm:text-base">{selectedPackage.weight}kg</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Dimensions</div>
                                            <div className="font-medium text-sm sm:text-base">{selectedPackage.dimensions}</div>
                                        </div>
                                    </div>
                                    
                                    {selectedPackage.specialInstructions && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="text-xs text-gray-600">Special Instructions</div>
                                            <div className="text-sm text-yellow-600">{selectedPackage.specialInstructions}</div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                                        Update Package Status
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => updateSinglePackageStatus(selectedPackage.id, option.value)}
                                                className={`p-2 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                                    selectedPackage.status === option.value
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                                                }`}
                                            >
                                                <span className="text-sm mb-1">{option.icon}</span>
                                                <span className="text-xs font-medium">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPackageModal(false);
                                        setSelectedPackage(null);
                                    }}
                                    className="btn btn-outline-primary w-full text-sm sm:text-base"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;