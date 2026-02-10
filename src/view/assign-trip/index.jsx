import { useState, useEffect, useCallback, useMemo } from 'react';
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
import IconRoute from '../../components/Icon/IconRoute';
import IconLayers from '../../components/Icon/IconLayers';
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconFlag from '../../components/Icon/IconAt';
import IconSearch from '../../components/Icon/IconSearch';
import IconFilter from '../../components/Icon/IconCoffee';

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
    showPageSize = true
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
            {/* Search Bar */}
            {isSearchable && (
                <div className="mb-4">
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

const AssignTrip = () => {
    const dispatch = useDispatch();

    // Dummy data for vehicles
    const [dummyVehicles] = useState([
        { id: 1, vehicleNo: 'TN01AB1234', vehicleType: 'Truck', capacity: '5000 kg', status: 'available' },
        { id: 2, vehicleNo: 'KA02CD5678', vehicleType: 'Tempo', capacity: '2000 kg', status: 'available' },
        { id: 3, vehicleNo: 'MH03EF9012', vehicleType: 'Mini Truck', capacity: '3000 kg', status: 'on_trip' },
        { id: 4, vehicleNo: 'DL04GH3456', vehicleType: 'Container', capacity: '10000 kg', status: 'available' },
        { id: 5, vehicleNo: 'GJ05IJ7890', vehicleType: 'Pickup', capacity: '1500 kg', status: 'available' },
    ]);

    // Dummy data for drivers
    const [dummyDrivers] = useState([
        { id: 1, name: 'Rajesh Kumar', mobileNo: '9876543210', licenseNo: 'DL1234567890', status: 'available' },
        { id: 2, name: 'Suresh Patel', mobileNo: '9876543211', licenseNo: 'DL2345678901', status: 'available' },
        { id: 3, name: 'Mohan Singh', mobileNo: '9876543212', licenseNo: 'DL3456789012', status: 'on_trip' },
        { id: 4, name: 'Amit Sharma', mobileNo: '9876543213', licenseNo: 'DL4567890123', status: 'available' },
    ]);

    // Dummy data for loadmen
    const [dummyLoadmen] = useState([
        { id: 1, name: 'Ramesh', mobileNo: '9876543220', status: 'available' },
        { id: 2, name: 'Suresh', mobileNo: '9876543221', status: 'available' },
        { id: 3, name: 'Ganesh', mobileNo: '9876543222', status: 'on_trip' },
        { id: 4, name: 'Mahesh', mobileNo: '9876543223', status: 'available' },
        { id: 5, name: 'Raju', mobileNo: '9876543224', status: 'available' },
        { id: 6, name: 'Kumar', mobileNo: '9876543225', status: 'available' },
    ]);

    // Enhanced dummy data for bookings with multiple packages
    const [dummyBookings] = useState([
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
                { 
                    id: 1, 
                    packageType: 'Box', 
                    quantity: 2, 
                    rate: 100, 
                    pickupPrice: 30, 
                    dropPrice: 45, 
                    total: 275,
                    weight: 25,
                    dimensions: '30x30x30 cm',
                    specialInstructions: 'Fragile'
                },
                { 
                    id: 2, 
                    packageType: 'Document', 
                    quantity: 1, 
                    rate: 50, 
                    pickupPrice: 15, 
                    dropPrice: 25, 
                    total: 90,
                    weight: 2,
                    dimensions: 'A4 Envelope',
                    specialInstructions: 'Handle with care'
                }
            ],
            totalAmount: 365,
            paymentBy: 'from',
            paidAmount: 365,
            status: 'pending',
            deliveryStatus: 'in_transit',
            date: '2024-01-15',
            totalWeight: 27,
            totalVolume: 0.6,
        },
        {
            id: 2,
            fromCenter: 'Bangalore South Terminal',
            toCenter: 'Mumbai Port Facility',
            fromLocation: 'Bangalore City Center',
            toLocation: '789 Marine Drive, Mumbai',
            fromMobile: '9876543211',
            fromName: 'Rajesh Kumar',
            toMobile: '8765432110',
            toName: 'Suresh Patel',
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Document', 
                    quantity: 3, 
                    rate: 50, 
                    pickupPrice: 15, 
                    dropPrice: 25, 
                    total: 270,
                    weight: 3,
                    dimensions: 'A4 Envelope',
                    specialInstructions: 'Urgent delivery'
                },
                { 
                    id: 2, 
                    packageType: 'Small Package', 
                    quantity: 2, 
                    rate: 80, 
                    pickupPrice: 20, 
                    dropPrice: 35, 
                    total: 270,
                    weight: 8,
                    dimensions: '20x20x20 cm',
                    specialInstructions: 'Keep upright'
                },
                { 
                    id: 3, 
                    packageType: 'Parcel', 
                    quantity: 1, 
                    rate: 120, 
                    pickupPrice: 25, 
                    dropPrice: 40, 
                    total: 185,
                    weight: 15,
                    dimensions: '40x30x20 cm',
                    specialInstructions: 'Fragile contents'
                }
            ],
            totalAmount: 725,
            paymentBy: 'to',
            paidAmount: 0,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-18',
            totalWeight: 26,
            totalVolume: 0.5,
        },
        {
            id: 3,
            fromCenter: 'Karur Hub',
            toCenter: 'Hyderabad Distribution Center',
            fromLocation: 'Karur Textile Market',
            toLocation: '234 Banjara Hills, Hyderabad',
            fromMobile: '9876543212',
            fromName: 'Priya Sharma',
            toMobile: '8765432111',
            toName: 'Amit Verma',
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Small Package', 
                    quantity: 5, 
                    rate: 30, 
                    pickupPrice: 20, 
                    dropPrice: 35, 
                    total: 425,
                    weight: 3,
                    dimensions: '15x15x15 cm',
                    specialInstructions: 'Standard delivery'
                }
            ],
            totalAmount: 425,
            paymentBy: 'from',
            paidAmount: 425,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-19',
            totalWeight: 15,
            totalVolume: 0.3,
        },
        {
            id: 4,
            fromCenter: 'Karur Hub',
            toCenter: 'Pune Delivery Hub',
            fromLocation: 'Karur IT Park',
            toLocation: '123 MG Road, Pune',
            fromMobile: '9876543214',
            fromName: 'Vikram Singh',
            toMobile: '8765432112',
            toName: 'Anjali Mehta',
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Electronics', 
                    quantity: 1, 
                    rate: 300, 
                    pickupPrice: 50, 
                    dropPrice: 60, 
                    total: 410,
                    weight: 40,
                    dimensions: '50x40x30 cm',
                    specialInstructions: 'Handle with care, Fragile'
                }
            ],
            totalAmount: 410,
            paymentBy: 'from',
            paidAmount: 410,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-20',
            totalWeight: 40,
            totalVolume: 0.06,
        },
        {
            id: 5,
            fromCenter: 'Pune Delivery Hub',
            toCenter: 'Mumbai Port Facility',
            fromLocation: '123 MG Road, Pune',
            toLocation: '789 Marine Drive, Mumbai',
            fromMobile: '9876543215',
            fromName: 'Anjali Mehta',
            toMobile: '8765432113',
            toName: 'Raj Malhotra',
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Clothing', 
                    quantity: 10, 
                    rate: 40, 
                    pickupPrice: 30, 
                    dropPrice: 40, 
                    total: 470,
                    weight: 25,
                    dimensions: '30x20x15 cm',
                    specialInstructions: 'Keep dry'
                }
            ],
            totalAmount: 470,
            paymentBy: 'to',
            paidAmount: 0,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-20',
            totalWeight: 25,
            totalVolume: 0.09,
        },
        {
            id: 6,
            fromCenter: 'Mumbai Port Facility',
            toCenter: 'Ahmedabad Warehouse',
            fromLocation: '789 Marine Drive, Mumbai',
            toLocation: '456 Ring Road, Ahmedabad',
            fromMobile: '9876543216',
            fromName: 'Raj Malhotra',
            toMobile: '8765432114',
            toName: 'Sunil Patel',
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Machinery Parts', 
                    quantity: 3, 
                    rate: 200, 
                    pickupPrice: 60, 
                    dropPrice: 70, 
                    total: 790,
                    weight: 75,
                    dimensions: '60x40x30 cm',
                    specialInstructions: 'Heavy machinery, use forklift'
                }
            ],
            totalAmount: 790,
            paymentBy: 'from',
            paidAmount: 790,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-21',
            totalWeight: 75,
            totalVolume: 0.216,
        },
        {
            id: 7,
            fromCenter: 'Karur Hub',
            toCenter: 'Coimbatore Terminal',
            fromLocation: 'Karur Bus Stand',
            toLocation: 'Coimbatore City Center',
            fromMobile: '9876543217',
            fromName: 'Karthik Raj',
            toMobile: '8765432115',
            toName: 'Senthil Kumar',
            packageDetails: [
                { 
                    id: 1, 
                    packageType: 'Textiles', 
                    quantity: 8, 
                    rate: 75, 
                    pickupPrice: 25, 
                    dropPrice: 35, 
                    total: 660,
                    weight: 32,
                    dimensions: '40x30x20 cm',
                    specialInstructions: 'Textile goods'
                }
            ],
            totalAmount: 660,
            paymentBy: 'from',
            paidAmount: 660,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-22',
            totalWeight: 32,
            totalVolume: 0.192,
        },
    ]);

    // States
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [trips, setTrips] = useState([
        {
            id: 1,
            tripNo: 'TRIP0001',
            bookings: [
                {
                    id: 1,
                    fromCenter: 'Chennai Central Hub',
                    toCenter: 'Bangalore South Terminal',
                    fromLocation: '123 Main Street, Chennai',
                    toLocation: '456 Park Avenue, Bangalore',
                    fromName: 'John Doe',
                    toName: 'Robert Johnson',
                    totalWeight: 27,
                    totalAmount: 365,
                    deliveryStatus: 'in_transit',
                    packageDetails: [
                        { 
                            id: 1, 
                            packageType: 'Box', 
                            quantity: 2, 
                            rate: 100, 
                            pickupPrice: 30, 
                            dropPrice: 45, 
                            total: 275,
                            weight: 25,
                            dimensions: '30x30x30 cm',
                            specialInstructions: 'Fragile'
                        },
                        { 
                            id: 2, 
                            packageType: 'Document', 
                            quantity: 1, 
                            rate: 50, 
                            pickupPrice: 15, 
                            dropPrice: 25, 
                            total: 90,
                            weight: 2,
                            dimensions: 'A4 Envelope',
                            specialInstructions: 'Handle with care'
                        }
                    ]
                }
            ],
            vehicle: dummyVehicles[0],
            driver: dummyDrivers[0],
            loadmen: [dummyLoadmen[0], dummyLoadmen[1]],
            tripDate: '2024-01-20',
            estimatedDeparture: '08:00',
            estimatedArrival: '14:00',
            actualDeparture: '08:15',
            actualArrival: null,
            remarks: 'Direct trip to Bangalore',
            status: 'in_progress',
            createdAt: '2024-01-19T10:00:00',
            totalWeight: 27,
            totalVolume: 0.6,
            totalPackages: 2,
            totalAmount: 365,
            tripType: 'primary',
            addonStages: [],
            currentStage: 0,
            expanded: false,
        }
    ]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [tripMode, setTripMode] = useState('new');
    const [selectedBranch, setSelectedBranch] = useState('all');

    // Form states for trip assignment
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedLoadmen, setSelectedLoadmen] = useState([]);
    const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
    const [estimatedDeparture, setEstimatedDeparture] = useState('08:00');
    const [estimatedArrival, setEstimatedArrival] = useState('18:00');
    const [remarks, setRemarks] = useState('');
    const [errors, setErrors] = useState({});

    // States for add-on trip
    const [selectedParentTrip, setSelectedParentTrip] = useState(null);
    const [availableAddonBookings, setAvailableAddonBookings] = useState([]);
    const [selectedAddonBookings, setSelectedAddonBookings] = useState([]);
    const [addonTripDate, setAddonTripDate] = useState(new Date().toISOString().split('T')[0]);
    const [addonDeparture, setAddonDeparture] = useState('15:00');
    const [addonArrival, setAddonArrival] = useState('22:00');
    const [addonRemarks, setAddonRemarks] = useState('');

    // Get unique branches from dummyBookings
    const branches = useMemo(() => {
        const uniqueBranches = [...new Set(dummyBookings.map(booking => booking.fromCenter))];
        const branchOptions = uniqueBranches.map(branch => ({
            value: branch,
            label: branch
        }));
        return [{ value: 'all', label: 'All Branches' }, ...branchOptions];
    }, []);

    // Filter available bookings by selected branch
    const availableBookings = useMemo(() => {
        let filtered = dummyBookings.filter(booking => booking.deliveryStatus === 'not_started');
        
        if (selectedBranch !== 'all') {
            filtered = filtered.filter(booking => booking.fromCenter === selectedBranch);
        }
        
        return filtered;
    }, [dummyBookings, selectedBranch]);

    const activeTrips = useMemo(() => 
        trips.filter(trip => 
            (trip.status === 'in_progress' || trip.status === 'multi_stop') && 
            trip.tripType === 'primary'
        ),
        [trips]
    );

    // Calculate totals
    const selectedTotals = useMemo(() => {
        const bookings = tripMode === 'addon' ? selectedAddonBookings : selectedBookings;
        return bookings.reduce((totals, booking) => {
            const bookingPackages = booking.data.packageDetails || [];
            const totalPackages = bookingPackages.reduce((sum, pkg) => sum + (pkg.quantity || 1), 0);
            
            return {
                totalWeight: totals.totalWeight + (booking.data.totalWeight || 0),
                totalVolume: totals.totalVolume + (booking.data.totalVolume || 0),
                totalPackages: totals.totalPackages + totalPackages,
                totalAmount: totals.totalAmount + (booking.data.totalAmount || 0),
            };
        }, { totalWeight: 0, totalVolume: 0, totalPackages: 0, totalAmount: 0 });
    }, [tripMode, selectedAddonBookings, selectedBookings]);

    useEffect(() => {
        dispatch(setPageTitle('Assign Trip Management'));
    }, [dispatch]);

    // Initialize add-on trip date
    useEffect(() => {
        if (selectedParentTrip && tripMode === 'addon') {
            setAddonTripDate(selectedParentTrip.tripDate);
        }
    }, [selectedParentTrip, tripMode]);

    // Update available addon bookings when parent trip changes
    useEffect(() => {
        if (selectedParentTrip && tripMode === 'addon') {
            const allStages = [selectedParentTrip.bookings, ...selectedParentTrip.addonStages.map(stage => stage.bookings)].flat();
            const lastDestination = allStages[allStages.length - 1]?.toCenter;
            
            let addonBookings = availableBookings.filter(booking => 
                booking.fromCenter === lastDestination
            );
            
            // Apply branch filter to addon bookings as well
            if (selectedBranch !== 'all') {
                addonBookings = addonBookings.filter(booking => booking.fromCenter === selectedBranch);
            }
            
            setAvailableAddonBookings(addonBookings);
            setSelectedAddonBookings([]);
            setSelectedLoadmen([]);
        }
    }, [selectedParentTrip, tripMode, availableBookings, selectedBranch]);

    // Get vehicle options
    const getVehicleOptions = useCallback(() => {
        if (tripMode === 'addon' && selectedParentTrip) {
            const vehicleOption = {
                value: selectedParentTrip.vehicle.id,
                label: `${selectedParentTrip.vehicle.vehicleNo} - ${selectedParentTrip.vehicle.vehicleType} (${selectedParentTrip.vehicle.capacity})`,
                data: selectedParentTrip.vehicle,
            };
            return [vehicleOption];
        }
        const availableVehicles = dummyVehicles.filter(vehicle => vehicle.status === 'available');
        return availableVehicles.map(vehicle => ({
            value: vehicle.id,
            label: `${vehicle.vehicleNo} - ${vehicle.vehicleType} (${vehicle.capacity})`,
            data: vehicle,
        }));
    }, [tripMode, selectedParentTrip, dummyVehicles]);

    // Get driver options
    const getDriverOptions = useCallback(() => {
        if (tripMode === 'addon' && selectedParentTrip) {
            const driverOption = {
                value: selectedParentTrip.driver.id,
                label: `${selectedParentTrip.driver.name} - ${selectedParentTrip.driver.licenseNo}`,
                data: selectedParentTrip.driver,
            };
            return [driverOption];
        }
        const availableDrivers = dummyDrivers.filter(driver => driver.status === 'available');
        return availableDrivers.map(driver => ({
            value: driver.id,
            label: `${driver.name} - ${driver.licenseNo}`,
            data: driver,
        }));
    }, [tripMode, selectedParentTrip, dummyDrivers]);

    // Get loadmen options
    const getLoadmenOptions = useCallback(() => {
        const availableLoadmen = dummyLoadmen.filter(loadman => loadman.status === 'available');
        return availableLoadmen.map(loadman => ({
            value: loadman.id,
            label: `${loadman.name} - ${loadman.mobileNo}`,
            data: loadman,
        }));
    }, [dummyLoadmen]);

    // Get booking options
    const getBookingOptions = useCallback(() => {
        return availableBookings.map(booking => ({
            value: booking.id,
            label: `#${booking.id}: ${booking.fromCenter} → ${booking.toCenter} (${booking.totalWeight}kg, ${booking.packageDetails.length} items)`,
            data: booking,
        }));
    }, [availableBookings]);

    // Get add-on booking options
    const getAddonBookingOptions = useCallback(() => {
        if (!selectedParentTrip) return [];
        
        return availableAddonBookings.map(booking => ({
            value: booking.id,
            label: `#${booking.id}: ${booking.fromCenter} → ${booking.toCenter} (${booking.totalWeight}kg, ${booking.packageDetails.length} items)`,
            data: booking,
        }));
    }, [selectedParentTrip, availableAddonBookings]);

    // Toggle view details for a trip
    const toggleTripDetails = useCallback((tripId) => {
        setTrips(prevTrips => 
            prevTrips.map(trip => 
                trip.id === tripId 
                    ? { ...trip, expanded: !trip.expanded }
                    : { ...trip, expanded: false }
            )
        );
    }, []);

    // Calculate if all stages are completed
    const areAllStagesCompleted = useCallback((trip) => {
        const mainCompleted = trip.bookings.every(b => b.deliveryStatus === 'delivered');
        const addonsCompleted = trip.addonStages.every(stage => 
            stage.status === 'completed' && 
            stage.bookings.every(b => b.deliveryStatus === 'delivered')
        );
        
        return mainCompleted && addonsCompleted;
    }, []);

    // Update stage status
    const handleUpdateStageStatus = useCallback((tripId, stageIndex, newStatus) => {
        setTrips(prevTrips => 
            prevTrips.map(trip => {
                if (trip.id === tripId) {
                    const updatedTrip = { ...trip };
                    
                    if (stageIndex === 0) {
                        updatedTrip.bookings = updatedTrip.bookings.map(booking => ({
                            ...booking,
                            deliveryStatus: newStatus
                        }));
                    } else {
                        const addonStageIndex = stageIndex - 1;
                        if (updatedTrip.addonStages[addonStageIndex]) {
                            updatedTrip.addonStages[addonStageIndex] = {
                                ...updatedTrip.addonStages[addonStageIndex],
                                status: newStatus,
                                bookings: updatedTrip.addonStages[addonStageIndex].bookings.map(booking => ({
                                    ...booking,
                                    deliveryStatus: newStatus
                                }))
                            };
                        }
                    }
                    
                    if (areAllStagesCompleted(updatedTrip)) {
                        updatedTrip.status = 'completed';
                        updatedTrip.actualArrival = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                    } else {
                        updatedTrip.status = 'multi_stop';
                    }
                    
                    return updatedTrip;
                }
                return trip;
            })
        );
        
        showMessage('success', `Stage ${stageIndex === 0 ? 'Main' : `Add-on ${stageIndex}`} status updated to ${newStatus}`);
    }, [areAllStagesCompleted]);

    // Complete specific stage
    const handleCompleteStage = useCallback((tripId, stageIndex) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setTrips(prevTrips => 
            prevTrips.map(trip => {
                if (trip.id === tripId) {
                    const updatedTrip = { ...trip };
                    
                    if (stageIndex === 0) {
                        updatedTrip.bookings = updatedTrip.bookings.map(booking => ({
                            ...booking,
                            deliveryStatus: 'delivered'
                        }));
                    } else {
                        const addonStageIndex = stageIndex - 1;
                        if (updatedTrip.addonStages[addonStageIndex]) {
                            updatedTrip.addonStages[addonStageIndex] = {
                                ...updatedTrip.addonStages[addonStageIndex],
                                status: 'completed',
                                actualArrival: currentTime,
                                bookings: updatedTrip.addonStages[addonStageIndex].bookings.map(booking => ({
                                    ...booking,
                                    deliveryStatus: 'delivered'
                                }))
                            };
                        }
                    }
                    
                    if (areAllStagesCompleted(updatedTrip)) {
                        updatedTrip.status = 'completed';
                        updatedTrip.actualArrival = currentTime;
                    } else {
                        updatedTrip.status = 'multi_stop';
                        updatedTrip.currentStage = stageIndex + 1;
                    }
                    
                    return updatedTrip;
                }
                return trip;
            })
        );
        
        showMessage('success', `Stage ${stageIndex === 0 ? 'Main' : `Add-on ${stageIndex}`} marked as completed!`);
    }, [areAllStagesCompleted]);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors = {};
        const bookings = tripMode === 'addon' ? selectedAddonBookings : selectedBookings;

        if (bookings.length === 0) {
            newErrors.bookings = 'At least one booking must be selected';
        }
        if (!selectedVehicle) newErrors.selectedVehicle = 'Vehicle is required';
        if (!selectedDriver) newErrors.selectedDriver = 'Driver is required';
        if (selectedLoadmen.length === 0) {
            newErrors.loadmen = 'At least one loadman is required for the trip';
        }
        
        const dateField = tripMode === 'addon' ? addonTripDate : tripDate;
        if (!dateField) newErrors.date = 'Trip date is required';
        
        const departureField = tripMode === 'addon' ? addonDeparture : estimatedDeparture;
        if (!departureField) newErrors.departure = 'Departure time is required';
        
        const arrivalField = tripMode === 'addon' ? addonArrival : estimatedArrival;
        if (!arrivalField) newErrors.arrival = 'Arrival time is required';

        if (selectedVehicle && selectedVehicle.data && selectedVehicle.data.capacity) {
            const capacityString = selectedVehicle.data.capacity;
            const vehicleCapacity = parseFloat(capacityString.split(' ')[0]) || 0;
            if (selectedTotals.totalWeight > vehicleCapacity) {
                newErrors.selectedVehicle = `Total weight (${selectedTotals.totalWeight}kg) exceeds vehicle capacity (${capacityString})`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [
        tripMode, selectedAddonBookings, selectedBookings, 
        selectedVehicle, selectedDriver, selectedLoadmen,
        addonTripDate, tripDate, addonDeparture, estimatedDeparture,
        addonArrival, estimatedArrival, selectedTotals.totalWeight
    ]);

    // Handle new trip assignment
    const handleAssignTrip = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('error', 'Please fix all errors before assigning trip');
            return;
        }

        const tripId = trips.length + 1;
        const bookings = tripMode === 'addon' ? selectedAddonBookings : selectedBookings;

        // Prepare bookings with assigned loadmen
        const bookingsWithLoadmen = bookings.map(booking => {
            const bookingId = booking.data.id;
            const packagesWithLoadmen = (booking.data.packageDetails || []).map(pkg => {
                return {
                    ...pkg,
                    assignedLoadmen: selectedLoadmen.map(l => l.data),
                    assignedLoadmenNames: selectedLoadmen.map(l => l.data.name).join(', ')
                };
            });

            return {
                ...booking.data,
                packageDetails: packagesWithLoadmen,
                deliveryStatus: 'scheduled',
                assignedLoadmen: selectedLoadmen.map(l => l.data)
            };
        });

        if (tripMode === 'addon' && selectedParentTrip) {
            // Add new add-on stage
            const newAddonStage = {
                stageNumber: (selectedParentTrip.addonStages?.length || 0) + 1,
                bookings: bookingsWithLoadmen,
                tripDate: addonTripDate,
                estimatedDeparture: addonDeparture,
                estimatedArrival: addonArrival,
                actualDeparture: null,
                actualArrival: null,
                remarks: addonRemarks,
                status: 'scheduled',
                loadmen: selectedLoadmen.map(l => l.data),
                createdAt: new Date().toISOString(),
                totalWeight: selectedTotals.totalWeight,
                totalPackages: selectedTotals.totalPackages,
                totalAmount: selectedTotals.totalAmount,
            };

            setTrips(prevTrips => 
                prevTrips.map(trip => 
                    trip.id === selectedParentTrip.id 
                        ? {
                            ...trip,
                            addonStages: [...(trip.addonStages || []), newAddonStage],
                            totalWeight: trip.totalWeight + selectedTotals.totalWeight,
                            totalPackages: trip.totalPackages + selectedTotals.totalPackages,
                            totalAmount: trip.totalAmount + selectedTotals.totalAmount,
                            status: 'multi_stop',
                            currentStage: trip.currentStage
                        }
                        : trip
                )
            );
            showMessage('success', `Add-on stage ${newAddonStage.stageNumber} added to trip #${selectedParentTrip.tripNo} successfully!`);
        } else {
            const newTrip = {
                id: tripId,
                tripNo: `TRIP${String(tripId).padStart(4, '0')}`,
                bookings: bookingsWithLoadmen,
                addonStages: [],
                vehicle: selectedVehicle.data,
                driver: selectedDriver.data,
                loadmen: selectedLoadmen.map(l => l.data),
                tripDate: tripDate,
                estimatedDeparture: estimatedDeparture,
                estimatedArrival: estimatedArrival,
                actualDeparture: null,
                actualArrival: null,
                remarks: remarks,
                status: 'scheduled',
                createdAt: new Date().toISOString(),
                totalWeight: selectedTotals.totalWeight,
                totalVolume: selectedTotals.totalVolume,
                totalPackages: selectedTotals.totalPackages,
                totalAmount: selectedTotals.totalAmount,
                tripType: 'primary',
                currentStage: 0,
                expanded: false,
            };

            setTrips([newTrip, ...trips]);
            showMessage('success', `Trip #${tripId} assigned successfully!`);
        }

        resetForm();
        setShowAssignForm(false);
    };

    // Handle add-on trip assignment
    const handleAssignAddonTrip = useCallback((parentTrip) => {
        setSelectedParentTrip(parentTrip);
        setTripMode('addon');
        setShowAssignForm(true);
        
        setSelectedVehicle({
            value: parentTrip.vehicle.id,
            label: `${parentTrip.vehicle.vehicleNo} - ${parentTrip.vehicle.vehicleType}`,
            data: parentTrip.vehicle,
        });
        
        setSelectedDriver({
            value: parentTrip.driver.id,
            label: `${parentTrip.driver.name} - ${parentTrip.driver.licenseNo}`,
            data: parentTrip.driver,
        });

        // Set loadmen from parent trip
        if (parentTrip.loadmen && parentTrip.loadmen.length > 0) {
            setSelectedLoadmen(parentTrip.loadmen.map(loadman => ({
                value: loadman.id,
                label: `${loadman.name} - ${loadman.mobileNo}`,
                data: loadman,
            })));
        }

        setAddonTripDate(parentTrip.tripDate);
        setAddonDeparture('15:00');
        setAddonArrival('22:00');
        setAddonRemarks('');
        setSelectedAddonBookings([]);
    }, []);

    // Update trip status
    const handleUpdateStatus = (tripId, newStatus) => {
        setTrips(trips.map(trip => 
            trip.id === tripId 
                ? { ...trip, status: newStatus }
                : trip
        ));
        
        showMessage('success', `Trip status updated to ${newStatus}`);
    };

    // Start main trip
    const handleStartTrip = (tripId) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setTrips(trips.map(trip => 
            trip.id === tripId 
                ? { 
                    ...trip, 
                    status: 'in_progress',
                    actualDeparture: currentTime,
                    currentStage: 0
                }
                : trip
        ));

        showMessage('success', `Trip #${tripId} started!`);
    };

    // Reset form
    const resetForm = () => {
        setSelectedBookings([]);
        setSelectedVehicle(null);
        setSelectedDriver(null);
        setSelectedLoadmen([]);
        setTripDate(new Date().toISOString().split('T')[0]);
        setEstimatedDeparture('08:00');
        setEstimatedArrival('18:00');
        setRemarks('');
        setErrors({});
        setTripMode('new');
        setSelectedParentTrip(null);
        setSelectedAddonBookings([]);
        setAvailableAddonBookings([]);
        setAddonTripDate(new Date().toISOString().split('T')[0]);
        setAddonDeparture('15:00');
        setAddonArrival('22:00');
        setAddonRemarks('');
    };

    // Get filtered data for table
    const getFilteredData = useCallback(() => {
        let filteredData = trips;
        if (searchTerm) {
            filteredData = filteredData.filter(
                (trip) =>
                    trip.tripNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.vehicle?.vehicleNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.bookings.some(b => 
                        b.fromCenter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.toCenter?.toLowerCase().includes(searchTerm.toLowerCase())
                    ) ||
                    (trip.addonStages && trip.addonStages.some(stage => 
                        stage.bookings.some(b => 
                            b.fromCenter?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.toCenter?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                    ))
            );
        }
        return filteredData;
    }, [trips, searchTerm]);

    const filteredData = getFilteredData();

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

    // Component for view details
    const TripDetails = ({ trip }) => {
        if (!trip.expanded) return null;

        const allStages = [
            { stageNumber: 0, stageName: 'Main Trip', bookings: trip.bookings, status: trip.status, actualArrival: trip.actualArrival, loadmen: trip.loadmen },
            ...(trip.addonStages || []).map(stage => ({ ...stage, stageName: `Add-on Stage ${stage.stageNumber}` }))
        ];

        const allLoadmen = new Set();
        allStages.forEach(stage => {
            if (stage.loadmen && stage.loadmen.length > 0) {
                stage.loadmen.forEach(loadman => {
                    allLoadmen.add(loadman.name);
                });
            }
        });

        return (
            <div className="bg-gray-50 rounded-lg mt-4 p-6 border border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                            <IconInfoCircle className="w-5 h-5 mr-2 text-blue-500" />
                            Trip Information
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Trip No:</span>
                                <span className="font-medium text-blue-600">{trip.tripNo}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Stage:</span>
                                <span className="font-medium">
                                    {trip.currentStage === 0 ? 'Main Trip' : `Add-on Stage ${trip.currentStage}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium">{trip.tripDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Schedule:</span>
                                <span className="font-medium">{trip.estimatedDeparture} - {trip.estimatedArrival}</span>
                            </div>
                            {trip.actualArrival && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Actual Arrival:</span>
                                    <span className="font-medium text-green-600">{trip.actualArrival}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                            <IconTruck className="w-5 h-5 mr-2 text-blue-500" />
                            Vehicle & Team
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vehicle:</span>
                                <span className="font-medium">{trip.vehicle?.vehicleNo} ({trip.vehicle?.vehicleType})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Driver:</span>
                                <span className="font-medium">{trip.driver?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Loadmen:</span>
                                <span className="font-medium">{Array.from(allLoadmen).join(', ') || 'None assigned'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Stages:</span>
                                <span className="font-medium">{allStages.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                            <IconPackage className="w-5 h-5 mr-2 text-blue-500" />
                            Load Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Stages:</span>
                                <span className="font-medium">{allStages.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Bookings:</span>
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
                        </div>
                    </div>
                </div>

                {/* Stages Timeline */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2 flex items-center">
                        <IconRoute className="w-5 h-5 mr-2" />
                        Trip Stages Timeline
                    </h4>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                        
                        <div className="space-y-6">
                            {allStages.map((stage, index) => (
                                <div key={index} className="relative pl-12">
                                    <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                        stage.status === 'completed' ? 'bg-green-500' :
                                        stage.status === 'in_progress' ? 'bg-yellow-500' :
                                        index === trip.currentStage ? 'bg-blue-500' :
                                        'bg-gray-300'
                                    }`}>
                                        {stage.status === 'completed' ? (
                                            <IconCheckCircle className="w-4 h-4 text-white" />
                                        ) : (
                                            <span className="text-white text-xs font-bold">{index + 1}</span>
                                        )}
                                    </div>
                                    
                                    <div className={`p-4 rounded-lg border ${
                                        index === trip.currentStage ? 'border-blue-300 bg-blue-50' :
                                        stage.status === 'completed' ? 'border-green-200 bg-green-50' :
                                        stage.status === 'in_progress' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-gray-200 bg-white'
                                    }`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                                            <div className="mb-2 md:mb-0">
                                                <h5 className="font-semibold text-gray-800 flex items-center">
                                                    {stage.stageName}
                                                    {index === 0 && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Primary</span>
                                                    )}
                                                    {index > 0 && (
                                                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Add-on</span>
                                                    )}
                                                </h5>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {stage.bookings?.length || 0} bookings • {stage.bookings?.reduce((sum, b) => sum + b.packageDetails?.length, 0) || 0} packages
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="mb-2 sm:mb-0">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        stage.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {stage.status === 'completed' ? 'Completed' :
                                                         stage.status === 'in_progress' ? 'In Progress' :
                                                         'Scheduled'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    {index === trip.currentStage && stage.status !== 'completed' && (
                                                        <>
                                                            {stage.status === 'scheduled' && (
                                                                <button
                                                                    onClick={() => index === 0 ? handleStartTrip(trip.id) : handleUpdateStageStatus(trip.id, index, 'in_progress')}
                                                                    className="btn btn-outline-success btn-sm"
                                                                >
                                                                    Start
                                                                </button>
                                                            )}
                                                            {stage.status === 'in_progress' && (
                                                                <button
                                                                    onClick={() => handleCompleteStage(trip.id, index)}
                                                                    className="btn btn-outline-success btn-sm"
                                                                >
                                                                    Complete
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {stage.status === 'in_progress' && (
                                                        <button
                                                            onClick={() => handleUpdateStageStatus(trip.id, index, 'delayed')}
                                                            className="btn btn-outline-warning btn-sm"
                                                        >
                                                            Delay
                                                        </button>
                                                    )}
                                                    {index === 0 && stage.status === 'scheduled' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(trip.id, 'cancelled')}
                                                            className="btn btn-outline-danger btn-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">From:</span>
                                                <div className="font-medium">{stage.bookings?.[0]?.fromCenter}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">To:</span>
                                                <div className="font-medium">{stage.bookings?.[stage.bookings?.length - 1]?.toCenter}</div>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Schedule:</span>
                                                <div className="font-medium">
                                                    {stage.estimatedDeparture} - {stage.estimatedArrival}
                                                    {stage.actualArrival && (
                                                        <span className="text-green-600 ml-2">(Arrived: {stage.actualArrival})</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {stage.loadmen && stage.loadmen.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Loadmen for this stage:</span> {stage.loadmen.map(l => l.name).join(', ')}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {stage.remarks && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="text-sm text-gray-700">
                                                    <span className="font-medium">Remarks:</span> {stage.remarks}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">All Bookings</h4>
                    <div className="space-y-4">
                        {allStages.map((stage, stageIndex) => (
                            <div key={stageIndex} className="mb-6">
                                <h5 className="font-medium text-gray-700 mb-3 text-lg flex items-center">
                                    <IconFlag className="w-4 h-4 mr-2" />
                                    {stage.stageName} Bookings ({stage.bookings?.length || 0})
                                </h5>
                                <div className="space-y-3">
                                    {stage.bookings?.map((booking, bookingIndex) => (
                                        <div key={bookingIndex} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                                                <div className="mb-3 sm:mb-0">
                                                    <div className="font-medium text-gray-800 text-lg">
                                                        Booking #{booking.id}: {booking.fromCenter} → {booking.toCenter}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Customer: {booking.fromName} • Contact: {booking.fromMobile}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Receiver: {booking.toName} • Contact: {booking.toMobile}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:items-end">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        booking.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        booking.deliveryStatus === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.deliveryStatus === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {booking.deliveryStatus}
                                                    </span>
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        Amount: <span className="font-medium">₹{booking.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="text-sm font-medium text-gray-700 mb-3">Packages ({booking.packageDetails?.length || 0}):</div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {booking.packageDetails?.map((pkg, pkgIndex) => (
                                                        <div key={pkgIndex} className="bg-gray-50 p-3 rounded border border-gray-100 hover:bg-gray-100 transition-colors">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-medium text-gray-800">{pkg.packageType} × {pkg.quantity}</div>
                                                                    <div className="text-xs text-gray-600 mt-1">
                                                                        Weight: {pkg.weight}kg • Size: {pkg.dimensions}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        Amount: ₹{pkg.total}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                                    {stage.loadmen?.map(l => l.name).join(', ') || 'No loadmen'}
                                                                </div>
                                                            </div>
                                                            {pkg.specialInstructions && (
                                                                <div className="text-xs text-yellow-600 mt-2 flex items-start">
                                                                    <span className="font-medium mr-1">Note:</span>
                                                                    {pkg.specialInstructions}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Trip Status Summary</h4>
                            <div className="text-sm text-gray-600">
                                {trip.status === 'completed' ? (
                                    <span className="text-green-600 font-medium">✓ All stages completed successfully!</span>
                                ) : (
                                    <span>
                                        Stage {trip.currentStage + 1} of {allStages.length} • 
                                        {trip.addonStages?.length > 0 && ` ${trip.addonStages.length} add-on stage(s)`}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                            {trip.status !== 'completed' && trip.currentStage > 0 && (
                                <button
                                    onClick={() => handleAssignAddonTrip(trip)}
                                    className="btn btn-purple btn-sm"
                                >
                                    <IconPlus className="w-4 h-4 mr-1" />
                                    Add Another Stage
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Table configuration
    const columns = useMemo(() => [
        {
            Header: '#',
            accessor: 'tripNo',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="font-medium text-gray-600">
                        <div className="inline-flex flex-col items-center">
                            <span className="text-xs text-gray-500 hidden sm:block">Trip No</span>
                            <span className="font-bold text-primary text-sm sm:text-base">{trip.tripNo}</span>
                            {trip.addonStages?.length > 0 && (
                                <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded mt-1">
                                    {trip.addonStages.length} add-on(s)
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
            width: 100,
            mobileFull: false,
        },
        {
            Header: 'Route & Bookings',
            accessor: 'route',
            Cell: ({ row }) => {
                const trip = row.original;
                const allStages = [
                    { bookings: trip.bookings },
                    ...(trip.addonStages || []).map(stage => ({ bookings: stage.bookings }))
                ];
                
                const firstBooking = allStages[0]?.bookings?.[0];
                const lastStage = allStages[allStages.length - 1];
                const lastBooking = lastStage?.bookings?.[lastStage.bookings?.length - 1];
                
                return (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <IconMapPin className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                                {firstBooking?.fromCenter} → {lastBooking?.toCenter}
                            </span>
                            {trip.addonStages?.length > 0 && (
                                <span className="ml-1 text-xs text-purple-600">
                                    ({trip.addonStages.length + 1} stops)
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-600">
                            {allStages.reduce((sum, stage) => sum + (stage.bookings?.length || 0), 0)} bookings • {trip.totalPackages} packages
                        </div>
                        <div className="text-xs text-gray-500">
                            Current: {trip.currentStage === 0 ? 'Main Trip' : `Add-on Stage ${trip.currentStage}`}
                        </div>
                    </div>
                );
            },
            width: 200,
            mobileFull: true,
        },
        {
            Header: 'Vehicle & Team',
            accessor: 'team',
            Cell: ({ row }) => {
                const trip = row.original;
                const allStages = [
                    { bookings: trip.bookings },
                    ...(trip.addonStages || []).map(stage => ({ bookings: stage.bookings }))
                ];
                
                const allLoadmen = new Set();
                allStages.forEach(stage => {
                    if (stage.loadmen && stage.loadmen.length > 0) {
                        stage.loadmen.forEach(loadman => {
                            allLoadmen.add(loadman.name);
                        });
                    }
                });
                
                return (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <IconTruck className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
                            <span className="font-medium truncate">{trip.vehicle?.vehicleNo}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                            <IconDriver className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{trip.driver?.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {allLoadmen.size} loadmen • {allStages.length} stages
                        </div>
                    </div>
                );
            },
            width: 150,
            mobileFull: false,
        },
        {
            Header: 'Load Summary',
            accessor: 'load',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-sm">
                            <span className="font-medium">{trip.totalPackages}</span> Items
                        </div>
                        <div className="text-xs text-gray-600">
                            Weight: {trip.totalWeight}kg
                        </div>
                        <div className="text-xs text-gray-500">
                            Amount: ₹{trip.totalAmount}
                        </div>
                    </div>
                );
            },
            width: 120,
            mobileFull: false,
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value, row }) => {
                const trip = row.original;
                const statusConfig = {
                    scheduled: { color: 'bg-blue-100 text-blue-800', icon: '⏰', label: 'Scheduled' },
                    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: '🚚', label: 'In Progress' },
                    multi_stop: { color: 'bg-purple-100 text-purple-800', icon: '🔄', label: 'Multi-stop' },
                    completed: { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Completed' },
                    cancelled: { color: 'bg-red-100 text-red-800', icon: '✗', label: 'Cancelled' },
                };
                const config = statusConfig[value] || statusConfig.scheduled;

                return (
                    <div className="space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            {config.icon} {config.label}
                        </span>
                        {trip.addonStages?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                                {trip.addonStages.length} add-on stage(s)
                            </div>
                        )}
                    </div>
                );
            },
            width: 120,
            mobileFull: false,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="flex flex-wrap gap-1">
                        <Tippy content={trip.expanded ? "Hide Details" : "View Details"}>
                            <button 
                                onClick={() => toggleTripDetails(trip.id)} 
                                className="btn btn-outline-primary btn-sm p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                {trip.expanded ? <IconChevronUp className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                            </button>
                        </Tippy>
                        
                        {(trip.status === 'in_progress' || trip.status === 'multi_stop') && (
                            <Tippy content="Add Another Stage">
                                <button 
                                    onClick={() => handleAssignAddonTrip(trip)} 
                                    className="btn btn-outline-purple btn-sm p-1.5 rounded-lg hover:bg-purple-500 hover:text-white transition-colors"
                                >
                                    <IconPlus className="w-4 h-4" />
                                </button>
                            </Tippy>
                        )}
                        
                        {trip.status === 'scheduled' && (
                            <>
                                <Tippy content="Start Trip">
                                    <button 
                                        onClick={() => handleStartTrip(trip.id)} 
                                        className="btn btn-outline-success btn-sm p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                                    >
                                        <IconClock className="w-4 h-4" />
                                    </button>
                                </Tippy>
                                <Tippy content="Cancel Trip">
                                    <button 
                                        onClick={() => handleUpdateStatus(trip.id, 'cancelled')} 
                                        className="btn btn-outline-danger btn-sm p-1.5 rounded-lg hover:bg-danger hover:text-white transition-colors"
                                    >
                                        <IconXCircle className="w-4 h-4" />
                                    </button>
                                </Tippy>
                            </>
                        )}
                    </div>
                );
            },
            width: 140,
            mobileFull: false,
        },
    ], [handleAssignAddonTrip, toggleTripDetails]);

    // Get stats
    const stats = {
        total: trips.length,
        scheduled: trips.filter((t) => t.status === 'scheduled').length,
        inProgress: trips.filter((t) => t.status === 'in_progress').length,
        completed: trips.filter((t) => t.status === 'completed').length,
        multiStop: trips.filter((t) => t.status === 'multi_stop').length,
        totalBookings: trips.reduce((sum, t) => sum + t.totalPackages, 0),
        totalAddonStages: trips.reduce((sum, t) => sum + (t.addonStages?.length || 0), 0),
    };

    return (
        <div className="container mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 sm:mb-6">
                    <div className="w-full lg:w-auto">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Assign Trip</h1>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                            Assign vehicles, drivers, and loadmen to packages
                        </p>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Trips</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                                <IconTruck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Multi-stop</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.multiStop}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                                <IconRoute className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.completed}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                                <IconCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Items</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.totalBookings}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                                <IconPackage className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Add-on Stages</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.totalAddonStages}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                                <IconPlus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Available</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{availableBookings.length}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                                <IconPackage className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons - Responsive with Branch Filter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-full sm:w-auto">
                        <div className="flex items-center space-x-2">
                            <IconFilter className="w-4 h-4 text-gray-500" />
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
                    
                    <button
                        type="button"
                        onClick={() => {
                            setTripMode('new');
                            setShowAssignForm(!showAssignForm);
                        }}
                        className={`btn ${showAssignForm && tripMode === 'new' ? 'btn-outline-primary' : 'btn-primary'} shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 sm:px-6 w-full sm:w-auto`}
                    >
                        <IconPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {showAssignForm && tripMode === 'new' ? 'Close Form' : 'Assign New Trip'}
                    </button>
                </div>
            </div>

            {/* Trip Assignment Form */}
            {showAssignForm && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6 sm:mb-8 lg:mb-10 animate-fadeIn overflow-hidden">
                    <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 flex items-center">
                            {tripMode === 'addon' ? (
                                <>
                                    <IconRoute className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                                    Add Stage to Existing Trip
                                </>
                            ) : (
                                <>
                                    <IconTruck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                                    Assign New Trip
                                </>
                            )}
                        </h2>
                    </div>

                    <form onSubmit={handleAssignTrip} className="p-3 sm:p-4 lg:p-6">
                        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                            {/* Parent Trip Info for Add-on */}
                            {tripMode === 'addon' && selectedParentTrip && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 sm:p-4 border-2 border-purple-200">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                                        <IconTruck className="w-4 h-4 mr-2 text-purple-600" />
                                        Parent Trip Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Trip No</div>
                                            <div className="font-bold text-purple-600 text-sm sm:text-base">{selectedParentTrip.tripNo}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Current Stage</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {selectedParentTrip.currentStage === 0 ? 'Main Trip' : `Add-on Stage ${selectedParentTrip.currentStage}`}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Existing Stages</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {(selectedParentTrip.addonStages?.length || 0) + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Current Destination</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {(() => {
                                                    const allStages = [
                                                        { bookings: selectedParentTrip.bookings },
                                                        ...(selectedParentTrip.addonStages || []).map(stage => ({ bookings: stage.bookings }))
                                                    ];
                                                    const lastStage = allStages[allStages.length - 1];
                                                    const lastBooking = lastStage?.bookings?.[lastStage.bookings?.length - 1];
                                                    return lastBooking?.toCenter || selectedParentTrip.bookings[0]?.toCenter;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Select Bookings */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                    <IconPackage className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                                    Select Bookings *
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">
                                        {tripMode === 'addon' ? 'Available Bookings at Current Destination' : 'Available Bookings'}
                                        {selectedBranch !== 'all' && (
                                            <span className="text-primary ml-2">(Filtered by: {selectedBranch})</span>
                                        )}
                                    </label>
                                    <Select
                                        isMulti
                                        options={tripMode === 'addon' ? getAddonBookingOptions() : getBookingOptions()}
                                        value={tripMode === 'addon' ? selectedAddonBookings : selectedBookings}
                                        onChange={tripMode === 'addon' ? setSelectedAddonBookings : setSelectedBookings}
                                        placeholder={`Select bookings ${tripMode === 'addon' ? 'from destination' : 'for this trip'}`}
                                        className="react-select"
                                        classNamePrefix="select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.bookings ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                    />
                                    {errors.bookings && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.bookings}</p>}
                                    
                                    {(tripMode === 'addon' ? selectedAddonBookings : selectedBookings).length > 0 && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                    <div>
                                                        <span className="font-medium">Bookings:</span> {(tripMode === 'addon' ? selectedAddonBookings : selectedBookings).length}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Total Items:</span> {selectedTotals.totalPackages}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Total Weight:</span> {selectedTotals.totalWeight}kg
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Total Amount:</span> ₹{selectedTotals.totalAmount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tripMode === 'addon' && availableAddonBookings.length === 0 && selectedParentTrip && (
                                        <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                            <p className="text-xs sm:text-sm text-yellow-700">
                                                No available bookings found at current destination
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vehicle Selection */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                    <IconTruck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                                    Select Vehicle *
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">
                                        Available Vehicles
                                    </label>
                                    <Select
                                        options={getVehicleOptions()}
                                        value={selectedVehicle}
                                        onChange={setSelectedVehicle}
                                        placeholder="Select vehicle"
                                        className="react-select"
                                        classNamePrefix="select"
                                        isDisabled={tripMode === 'addon' && selectedParentTrip}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.selectedVehicle ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                    />
                                    {errors.selectedVehicle && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.selectedVehicle}</p>}
                                    
                                    {selectedVehicle && (
                                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="font-medium text-sm sm:text-base">{selectedVehicle.data.vehicleNo}</div>
                                                <div className="mt-1">{selectedVehicle.data.vehicleType} • Capacity: {selectedVehicle.data.capacity}</div>
                                                {selectedTotals.totalWeight > 0 && selectedVehicle.data.capacity && (
                                                    <div className={`mt-2 text-sm ${selectedTotals.totalWeight > parseFloat(selectedVehicle.data.capacity.split(' ')[0]) ? 'text-red-600' : 'text-green-600'}`}>
                                                        Total Load: {selectedTotals.totalWeight}kg / {selectedVehicle.data.capacity}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Driver Selection */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                    <IconDriver className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                                    Select Driver *
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">
                                        Available Drivers
                                    </label>
                                    <Select
                                        options={getDriverOptions()}
                                        value={selectedDriver}
                                        onChange={setSelectedDriver}
                                        placeholder="Select driver"
                                        className="react-select"
                                        classNamePrefix="select"
                                        isDisabled={tripMode === 'addon' && selectedParentTrip}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.selectedDriver ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                    />
                                    {errors.selectedDriver && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.selectedDriver}</p>}
                                    
                                    {selectedDriver && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="font-medium text-sm sm:text-base">{selectedDriver.data.name}</div>
                                                <div className="mt-1">License: {selectedDriver.data.licenseNo}</div>
                                                <div className="mt-1">Mobile: {selectedDriver.data.mobileNo}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Loadmen Selection - Common for entire trip */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                    <IconUsers className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                                    Select Loadmen for Trip *
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">
                                        Available Loadmen
                                    </label>
                                    <Select
                                        isMulti
                                        options={getLoadmenOptions()}
                                        value={selectedLoadmen}
                                        onChange={setSelectedLoadmen}
                                        placeholder="Select loadmen for this trip"
                                        className="react-select"
                                        classNamePrefix="select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.loadmen ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                    />
                                    {errors.loadmen && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.loadmen}</p>}
                                    
                                    {selectedLoadmen.length > 0 && (
                                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="font-medium text-sm sm:text-base">{selectedLoadmen.length} Loadmen Selected</div>
                                                <div className="mt-1">
                                                    {selectedLoadmen.map((loadman, index) => (
                                                        <span key={loadman.value} className="inline-block bg-white px-2 py-1 rounded text-xs mr-1 mb-1 border">
                                                            {loadman.data.name}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-green-600 mt-2">
                                                    These loadmen will be assigned to handle all packages in the selected bookings
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trip Schedule */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                    <IconCalendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                                    Trip Schedule *
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">Trip Date *</label>
                                        <input
                                            type="date"
                                            value={tripMode === 'addon' ? addonTripDate : tripDate}
                                            onChange={(e) => tripMode === 'addon' ? setAddonTripDate(e.target.value) : setTripDate(e.target.value)}
                                            className={`form-input w-full ${errors.date ? 'border-red-500' : ''}`}
                                            min={tripMode === 'addon' ? selectedParentTrip?.tripDate : new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.date && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">Departure Time *</label>
                                        <input
                                            type="time"
                                            value={tripMode === 'addon' ? addonDeparture : estimatedDeparture}
                                            onChange={(e) => tripMode === 'addon' ? setAddonDeparture(e.target.value) : setEstimatedDeparture(e.target.value)}
                                            className={`form-input w-full ${errors.departure ? 'border-red-500' : ''}`}
                                            min={tripMode === 'addon' ? selectedParentTrip?.estimatedArrival : undefined}
                                        />
                                        {errors.departure && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.departure}</p>}
                                        {tripMode === 'addon' && selectedParentTrip && (
                                            <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                                Must be after previous stage arrival
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-2">Arrival Time *</label>
                                        <input
                                            type="time"
                                            value={tripMode === 'addon' ? addonArrival : estimatedArrival}
                                            onChange={(e) => tripMode === 'addon' ? setAddonArrival(e.target.value) : setEstimatedArrival(e.target.value)}
                                            className={`form-input w-full ${errors.arrival ? 'border-red-500' : ''}`}
                                        />
                                        {errors.arrival && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.arrival}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Remarks</h3>
                                <textarea
                                    value={tripMode === 'addon' ? addonRemarks : remarks}
                                    onChange={(e) => tripMode === 'addon' ? setAddonRemarks(e.target.value) : setRemarks(e.target.value)}
                                    className="form-textarea w-full"
                                    rows="3"
                                    placeholder="Add any special instructions for this stage..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                                    {tripMode === 'addon' ? 'New Stage Summary' : 'Trip Summary'}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="text-center">
                                        <div className="text-xs sm:text-sm text-gray-600">Bookings</div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{(tripMode === 'addon' ? selectedAddonBookings : selectedBookings).length}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs sm:text-sm text-gray-600">Total Items</div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{selectedTotals.totalPackages}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs sm:text-sm text-gray-600">Total Weight</div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">{selectedTotals.totalWeight}kg</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs sm:text-sm text-gray-600">Total Loadmen</div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                                            {selectedLoadmen.length}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="text-center">
                                            <div className="text-xs sm:text-sm text-gray-600">Total Amount</div>
                                            <div className="text-lg sm:text-xl font-bold text-primary">₹{selectedTotals.totalAmount}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs sm:text-sm text-gray-600">Team Size</div>
                                            <div className="text-lg sm:text-xl font-bold text-primary">
                                                {selectedLoadmen.length + 1}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {tripMode === 'addon' && selectedParentTrip && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                                        <p className="text-xs sm:text-sm text-purple-700 text-center">
                                            This will be Stage {(selectedParentTrip.addonStages?.length || 0) + 2} of Trip #{selectedParentTrip.tripNo}
                                        </p>
                                        <p className="text-xs text-gray-600 text-center mt-1">
                                            Total stages after addition: {(selectedParentTrip.addonStages?.length || 0) + 2}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowAssignForm(false);
                                    }}
                                    className="btn btn-outline-secondary hover:shadow-md transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    onClick={resetForm}
                                    className="btn btn-outline-primary hover:shadow-md transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 w-full sm:w-auto"
                                >
                                    Clear Form
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 sm:px-6 w-full sm:w-auto"
                                >
                                    {tripMode === 'addon' ? 'Add Stage' : 'Assign Trip'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Trips List Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="w-full lg:w-auto">
                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Trip Assignments</h2>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                                View and manage all assigned trips with multiple stages
                            </p>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                            Showing {Math.min((currentPage + 1) * pageSize, filteredData.length)} of {filteredData.length} trips
                        </div>
                    </div>
                </div>
                <div className="p-3 sm:p-4">
                    <ResponsiveTable
                        columns={columns}
                        data={filteredData}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={filteredData.length}
                        totalPages={Math.ceil(filteredData.length / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        onSearchChange={handleSearch}
                        pagination={true}
                        isSearchable={true}
                        searchPlaceholder="Search trips by trip number, vehicle, driver, or destination..."
                        showPageSize={true}
                    />
                    
                    {/* Render Trip Details for expanded rows */}
                    {trips.filter(trip => trip.expanded).map(trip => (
                        <TripDetails key={trip.id} trip={trip} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AssignTrip;