import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Tippy from '@tippyjs/react';
import { showMessage, findArrObj } from '../../util/AllFunction';
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
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconSearch from '../../components/Icon/IconSearch';
import IconFilter from '../../components/Icon/IconCoffee';
import IconX from '../../components/Icon/IconX';
import {
    getTrips,
    getAvailableBookings,
    getAvailableVehicles,
    getAvailableDrivers,
    getAvailableLoadmen,
    createTrip,
    updateTripStatus,
    updateTripBookings,
    deleteTrip,
    resetTripStatus,
    clearAvailableData
} from '../../redux/tripSlice';
import { getOfficeCenters } from '../../redux/officeCenterSlice';
import { getVehicles } from '../../redux/vehiclesSlice';
import { getEmployee } from '../../redux/employeeSlice';

// Custom responsive table component
const ResponsiveTable = ({ columns, data, pageSize = 10, pageIndex = 0, onPaginationChange, onSearchChange, pagination = true, isSearchable = true, searchPlaceholder = "Search...", showPageSize = true }) => {
    const [currentPage, setCurrentPage] = useState(pageIndex);
    const [rowsPerPage, setRowsPerPage] = useState(pageSize);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(0);
        if (onSearchChange) onSearchChange(term);
    }, [onSearchChange]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        if (onPaginationChange) onPaginationChange(page, rowsPerPage);
    }, [onPaginationChange, rowsPerPage]);

    const handleRowsPerPageChange = useCallback((e) => {
        const newRowsPerPage = parseInt(e.target.value);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(0);
        if (onPaginationChange) onPaginationChange(0, newRowsPerPage);
    }, [onPaginationChange]);

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

    const paginatedData = useMemo(() => {
        const startIndex = currentPage * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, rowsPerPage]);

    const actualTotalPages = useMemo(() => {
        return Math.ceil(filteredData.length / rowsPerPage);
    }, [filteredData.length, rowsPerPage]);

    return (
        <div className="w-full">
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
                                                <td key={colIndex} className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
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

    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo || '{}');
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Assign Trip');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    // Redux state
    const tripState = useSelector((state) => state.TripSlice || {});
    const {
        tripData = [],
        availableBookings = [],
        availableVehicles = [],
        availableDrivers = [],
        availableLoadmen = [],
        loading = false,
        error = null,
        createTripSuccess = false,
        updateTripStatusSuccess = false,
        deleteTripSuccess = false,
        updateTripBookingsSuccess = false
    } = tripState;

    const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
    const { officeCentersData = [], loading: officeCentersLoading = false } = officeCenterState;

    const vehicleState = useSelector((state) => state.VehicleSlice || {});
    const { vehicleData = [], loading: vehiclesLoading = false } = vehicleState;

    const employeeState = useSelector((state) => state.EmployeeSlice || {});
    const { employeeData = [], loading: employeesLoading = false } = employeeState;

    // Debug logs
    useEffect(() => {
        console.log('=== Redux State Debug ===');
        console.log('Available Bookings:', availableBookings);
        console.log('Available Vehicles:', availableVehicles);
        console.log('Available Drivers:', availableDrivers);
        console.log('Available Loadmen:', availableLoadmen);
        console.log('Loading:', loading);
        console.log('Error:', error);
        console.log('========================');
    }, [availableBookings, availableVehicles, availableDrivers, availableLoadmen, loading, error]);

    // Local states
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [tripMode, setTripMode] = useState('new');
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        status: ''
    });

    // Form states
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedLoadmen, setSelectedLoadmen] = useState([]);
    const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
    const [estimatedDeparture, setEstimatedDeparture] = useState('08:00');
    const [estimatedArrival, setEstimatedArrival] = useState('18:00');
    const [remarks, setRemarks] = useState('');
    const [errors, setErrors] = useState({});

    // Add-on trip states
    const [selectedParentTrip, setSelectedParentTrip] = useState(null);
    const [availableAddonBookings, setAvailableAddonBookings] = useState([]);
    const [selectedAddonBookings, setSelectedAddonBookings] = useState([]);
    const [addonTripDate, setAddonTripDate] = useState(new Date().toISOString().split('T')[0]);
    const [addonDeparture, setAddonDeparture] = useState('15:00');
    const [addonArrival, setAddonArrival] = useState('22:00');
    const [addonRemarks, setAddonRemarks] = useState('');

    // Load initial data
    useEffect(() => {
        dispatch(setPageTitle('Assign Trip Management'));
        fetchInitialData();
    }, [dispatch]);

    // Handle API responses
   // Add this to your useEffect that handles API responses
useEffect(() => {
    if (createTripSuccess) {
        showMessage('success', 'Trip created successfully');
        resetForm();
        setShowAssignForm(false);
        dispatch(resetTripStatus());
        fetchTrips();
    }
    if (updateTripStatusSuccess) {
        showMessage('success', 'Trip status updated successfully');
        dispatch(resetTripStatus());
        fetchTrips();
    }
    if (updateTripBookingsSuccess) {
        showMessage('success', 'Add-on bookings added to trip successfully');
        resetForm();
        setShowAssignForm(false);
        dispatch(resetTripStatus());
        fetchTrips();
    }
    if (deleteTripSuccess) {
        showMessage('success', 'Trip deleted successfully');
        dispatch(resetTripStatus());
        fetchTrips();
    }
    if (error) {
        showMessage('error', error);
        dispatch(resetTripStatus());
    }
}, [
    createTripSuccess, 
    updateTripStatusSuccess, 
    updateTripBookingsSuccess,
    deleteTripSuccess, 
    error, 
    dispatch
]);
    // Update trips data from Redux
    useEffect(() => {
        setTrips(tripData || []);
    }, [tripData]);

    const fetchInitialData = async () => {
        try {
            await Promise.all([
                dispatch(getTrips({})).unwrap(),
                dispatch(getOfficeCenters({})).unwrap(),
                dispatch(getVehicles({})).unwrap(),
                dispatch(getEmployee({})).unwrap()
            ]);
        } catch (error) {
            showMessage('error', 'Failed to load initial data');
        }
    };

    const fetchTrips = () => {
        const filterParams = {};
        if (filters.fromDate) filterParams.fromDate = filters.fromDate;
        if (filters.toDate) filterParams.toDate = filters.toDate;
        if (filters.status) filterParams.status = filters.status;
        if (searchTerm) filterParams.search = searchTerm;
        dispatch(getTrips(filterParams));
    };

    useEffect(() => {
        fetchTrips();
    }, [filters, searchTerm, dispatch]);

    const fetchAvailableData = async (date) => {
        try {
            console.log('Fetching available data for date:', date);
            
            const [bookingsResult, vehiclesResult, driversResult, loadmenResult] = await Promise.all([
                dispatch(getAvailableBookings()).unwrap(),
                dispatch(getAvailableVehicles(date)).unwrap(),
                dispatch(getAvailableDrivers(date)).unwrap(),
                dispatch(getAvailableLoadmen(date)).unwrap()
            ]);
            
            console.log('Available bookings API response:', bookingsResult);
            console.log('Available vehicles API response:', vehiclesResult);
            console.log('Available drivers API response:', driversResult);
            console.log('Available loadmen API response:', loadmenResult);
            
        } catch (error) {
            console.error('Failed to load available data:', error);
            showMessage('error', 'Failed to load available data');
        }
    };

    useEffect(() => {
        if (showAssignForm) {
            fetchAvailableData(tripDate);
        } else {
            dispatch(clearAvailableData());
            // Reset add-on related states when form closes
            setSelectedParentTrip(null);
            setAvailableAddonBookings([]);
            setSelectedAddonBookings([]);
        }
    }, [showAssignForm, tripDate, dispatch]);

    // Get unique branches from available bookings
    const branches = useMemo(() => {
        if (!availableBookings || availableBookings.length === 0) {
            return [{ value: 'all', label: 'All Branches' }];
        }
        
        const uniqueBranches = [...new Set(
            availableBookings
                .map(booking => booking.fromCenter?.office_center_name || booking.from_center?.office_center_name)
                .filter(Boolean)
        )];
        
        const branchOptions = uniqueBranches.map(branch => ({ 
            value: branch, 
            label: branch 
        }));
        
        return [{ value: 'all', label: 'All Branches' }, ...branchOptions];
    }, [availableBookings]);

    // Filter available bookings - only show bookings with delivery_status = 'not_started'
    const filteredAvailableBookings = useMemo(() => {
        console.log('Filtering available bookings. Total:', availableBookings?.length || 0);
        
        if (!availableBookings || availableBookings.length === 0) {
            return [];
        }
        
        // Log first booking to see structure
        if (availableBookings.length > 0) {
            console.log('Sample booking structure:', availableBookings[0]);
        }
        
        // The API should return only bookings with delivery_status = 'not_started'
        // But we'll filter to be safe
        let filtered = availableBookings.filter(booking => {
            // Check different possible locations of delivery_status
            const status = booking.delivery_status || booking?.TripBooking?.delivery_status;
            // If status is 'not_started' or undefined, include it
            return status === 'not_started' || !status;
        });
        
        console.log('After status filter:', filtered.length);
        
        // Filter by selected branch
        if (selectedBranch !== 'all' && filtered.length > 0) {
            filtered = filtered.filter(booking => {
                const fromCenterName = booking.fromCenter?.office_center_name || 
                                      booking.from_center?.office_center_name;
                return fromCenterName === selectedBranch;
            });
        }
        
        console.log('Final filtered bookings:', filtered.length);
        return filtered;
    }, [availableBookings, selectedBranch]);

    const activeTrips = useMemo(() => 
        trips.filter(trip => trip.status === 'in_progress' || trip.status === 'scheduled'),
    [trips]);

    // Calculate totals
    const selectedTotals = useMemo(() => {
        const bookings = tripMode === 'addon' ? selectedAddonBookings : selectedBookings;
        
        return bookings.reduce((totals, booking) => {
            const bookingData = booking.data || booking;
            const bookingPackages = bookingData.packages || [];
            const totalPackages = bookingPackages.reduce((sum, pkg) => sum + (pkg.quantity || 1), 0);
            
            return {
                totalWeight: totals.totalWeight + (parseFloat(bookingData.total_weight) || 0),
                totalPackages: totals.totalPackages + totalPackages,
                totalAmount: totals.totalAmount + (parseFloat(bookingData.total_amount) || 0),
            };
        }, { totalWeight: 0, totalPackages: 0, totalAmount: 0 });
    }, [tripMode, selectedAddonBookings, selectedBookings]);

    // Initialize add-on trip data
    useEffect(() => {
        if (selectedParentTrip && tripMode === 'addon') {
            setAddonTripDate(selectedParentTrip.trip_date);
        }
    }, [selectedParentTrip, tripMode]);

    // Update available addon bookings when parent trip changes
    useEffect(() => {
        if (selectedParentTrip && tripMode === 'addon') {
            console.log('Parent Trip for Add-on:', selectedParentTrip);
            
            // Get the last destination from the parent trip
            const allBookings = selectedParentTrip.bookings || [];
            const lastBooking = allBookings[allBookings.length - 1];
            const lastDestinationId = lastBooking?.to_center_id;
            const lastDestinationName = lastBooking?.toCenter?.office_center_name;
            
            console.log('Last Destination ID:', lastDestinationId);
            console.log('Last Destination Name:', lastDestinationName);
            console.log('All available bookings:', availableBookings);
            
            if (!availableBookings || availableBookings.length === 0) {
                setAvailableAddonBookings([]);
                return;
            }
            
            // Filter bookings that are:
            // 1. Available (delivery_status = 'not_started') AND
            // 2. From center matches the last destination of parent trip
            let addonBookings = availableBookings.filter(booking => {
                // Check if booking is available
                const status = booking.delivery_status || booking?.TripBooking?.delivery_status;
                const isAvailable = status === 'not_started' || !status;
                
                // Get from center info
                const fromCenterId = booking.from_center_id;
                const fromCenterName = booking.fromCenter?.office_center_name || 
                                      booking.from_center?.office_center_name;
                
                // Check if from center matches last destination
                const fromCenterMatches = 
                    fromCenterId === lastDestinationId ||
                    fromCenterName === lastDestinationName;
                
                return isAvailable && fromCenterMatches;
            });
            
            console.log('Filtered Add-on Bookings:', addonBookings);
            
            setAvailableAddonBookings(addonBookings);
            setSelectedAddonBookings([]);
        }
    }, [selectedParentTrip, tripMode, availableBookings]);

    // Get options for selects
    const getOfficeCenterOptions = useCallback(() => {
        return (officeCentersData || [])
            .filter(center => center.is_active)
            .map(center => ({
                value: center.office_center_id,
                label: center.office_center_name,
                data: center
            }));
    }, [officeCentersData]);

    const getVehicleOptions = useCallback(() => {
        if (tripMode === 'addon' && selectedParentTrip) {
            if (selectedParentTrip.vehicle) {
                const vehicleOption = {
                    value: selectedParentTrip.vehicle.vehicle_id,
                    label: `${selectedParentTrip.vehicle.vehicle_number_plate}`,
                    data: selectedParentTrip.vehicle,
                };
                return [vehicleOption];
            }
            return [];
        }
        return (availableVehicles || []).map(vehicle => ({
            value: vehicle.vehicle_id,
            label: `${vehicle.vehicle_number_plate}`,
            data: vehicle,
        }));
    }, [tripMode, selectedParentTrip, availableVehicles]);

    const getDriverOptions = useCallback(() => {
        if (tripMode === 'addon' && selectedParentTrip) {
            if (selectedParentTrip.driver) {
                const driverOption = {
                    value: selectedParentTrip.driver.employee_id,
                    label: `${selectedParentTrip.driver.employee_name}`,
                    data: selectedParentTrip.driver,
                };
                return [driverOption];
            }
            return [];
        }
        return (availableDrivers || []).map(driver => ({
            value: driver.employee_id,
            label: `${driver.employee_name} - ${driver.mobile_no}`,
            data: driver,
        }));
    }, [tripMode, selectedParentTrip, availableDrivers]);

    const getLoadmenOptions = useCallback(() => {
        return (availableLoadmen || []).map(loadman => ({
            value: loadman.employee_id,
            label: `${loadman.employee_name} - ${loadman.mobile_no}`,
            data: loadman,
        }));
    }, [availableLoadmen]);

    // Get booking options for new trip
    const getBookingOptions = useCallback(() => {
        if (!filteredAvailableBookings || filteredAvailableBookings.length === 0) {
            return [];
        }
        
        console.log('Creating booking options from:', filteredAvailableBookings.length, 'bookings');
        
        return filteredAvailableBookings.map(booking => {
            // Safely access nested properties
            const fromCenterName = booking.fromCenter?.office_center_name || 
                                  booking.from_center?.office_center_name || 
                                  'N/A';
            const toCenterName = booking.toCenter?.office_center_name || 
                                booking.to_center?.office_center_name || 
                                'N/A';
            const bookingNumber = booking.booking_number || 'N/A';
            const totalAmount = booking.total_amount || 0;
            
            return {
                value: booking.booking_id,
                label: `#${bookingNumber}: ${fromCenterName} → ${toCenterName} (₹${totalAmount})`,
                data: booking,
                from_center_id: booking.from_center_id,
                to_center_id: booking.to_center_id
            };
        });
    }, [filteredAvailableBookings]);

    // Get add-on booking options
    const getAddonBookingOptions = useCallback(() => {
        if (!selectedParentTrip || !availableAddonBookings || availableAddonBookings.length === 0) {
            return [];
        }
        
        console.log('Creating addon booking options from:', availableAddonBookings.length, 'bookings');
        
        return availableAddonBookings.map(booking => {
            const fromCenterName = booking.fromCenter?.office_center_name || 
                                  booking.from_center?.office_center_name || 
                                  'N/A';
            const toCenterName = booking.toCenter?.office_center_name || 
                                booking.to_center?.office_center_name || 
                                'N/A';
            const bookingNumber = booking.booking_number || 'N/A';
            const totalAmount = booking.total_amount || 0;
            
            return {
                value: booking.booking_id,
                label: `#${bookingNumber}: ${fromCenterName} → ${toCenterName} (₹${totalAmount})`,
                data: booking,
                from_center_id: booking.from_center_id,
                to_center_id: booking.to_center_id
            };
        });
    }, [selectedParentTrip, availableAddonBookings]);

    // Toggle view details
    const toggleTripDetails = useCallback((tripId) => {
        setTrips(prevTrips =>
            prevTrips.map(trip =>
                trip.trip_id === tripId
                    ? { ...trip, expanded: !trip.expanded }
                    : { ...trip, expanded: false }
            )
        );
    }, []);

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
            newErrors.loadmen = 'At least one loadman is required';
        }

        const dateField = tripMode === 'addon' ? addonTripDate : tripDate;
        if (!dateField) newErrors.date = 'Trip date is required';

        const departureField = tripMode === 'addon' ? addonDeparture : estimatedDeparture;
        if (!departureField) newErrors.departure = 'Departure time is required';

        const arrivalField = tripMode === 'addon' ? addonArrival : estimatedArrival;
        if (!arrivalField) newErrors.arrival = 'Arrival time is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [
        tripMode, selectedAddonBookings, selectedBookings,
        selectedVehicle, selectedDriver, selectedLoadmen,
        addonTripDate, tripDate, addonDeparture, estimatedDeparture,
        addonArrival, estimatedArrival
    ]);

  // Replace the handleAssignTrip function in your AssignTrip component with this:

// Handle trip assignment
const handleAssignTrip = (e) => {
    e.preventDefault();
    if (!validateForm()) {
        showMessage('error', 'Please fix all errors before assigning trip');
        return;
    }

    if (tripMode === 'addon' && selectedParentTrip) {
        // For add-on stage, we need to:
        // 1. Get existing booking IDs from the parent trip
        // 2. Add new booking IDs to the trip
        
        const existingBookingIds = selectedParentTrip.bookings?.map(b => b.booking_id) || [];
        const newBookingIds = selectedAddonBookings.map(b => b.value || b.booking_id);
        
        // We're only adding new bookings, not removing any
        const bookingData = {
            addBookingIds: newBookingIds,
            removeBookingIds: [] // Empty array since we're not removing any bookings
        };
        
        console.log('Adding add-on bookings to trip:', {
            tripId: selectedParentTrip.trip_id,
            existingBookings: existingBookingIds,
            newBookings: newBookingIds,
            bookingData
        });
        
        dispatch(updateTripBookings({
            tripId: selectedParentTrip.trip_id,
            bookingData: bookingData
        }));
        
    } else {
        // Create new trip
        const bookings = selectedBookings;
        const bookingIds = bookings.map(b => b.value || b.booking_id);
        const loadmanIds = selectedLoadmen.map(l => l.value || l.employee_id);

        const firstBooking = bookings[0]?.data || bookings[0];
        const lastBooking = bookings[bookings.length - 1]?.data || bookings[bookings.length - 1];

        const requestData = {
            fromCenterId: firstBooking?.from_center_id,
            toCenterId: lastBooking?.to_center_id,
            vehicleId: selectedVehicle.value,
            driverId: selectedDriver.value,
            bookingIds: bookingIds,
            loadmanIds: loadmanIds,
            tripDate: tripDate,
            estimatedDeparture: estimatedDeparture,
            estimatedArrival: estimatedArrival,
            remarks: remarks
        };

        console.log('Creating new trip:', requestData);
        dispatch(createTrip(requestData));
    }
};

    // Handle add-on trip assignment
    const handleAssignAddonTrip = useCallback((parentTrip) => {
        console.log('Selected Parent Trip for Add-on:', parentTrip);
        
        setSelectedParentTrip(parentTrip);
        setTripMode('addon');
        setShowAssignForm(true);

        // Set vehicle (if available)
        if (parentTrip.vehicle) {
            setSelectedVehicle({
                value: parentTrip.vehicle.vehicle_id,
                label: `${parentTrip.vehicle.vehicle_number_plate}`,
                data: parentTrip.vehicle,
            });
        }

        // Set driver (if available)
        if (parentTrip.driver) {
            setSelectedDriver({
                value: parentTrip.driver.employee_id,
                label: `${parentTrip.driver.employee_name}`,
                data: parentTrip.driver,
            });
        }

        // Set loadmen (if available)
        if (parentTrip.loadmen && parentTrip.loadmen.length > 0) {
            setSelectedLoadmen(parentTrip.loadmen.map(loadman => ({
                value: loadman.employee_id,
                label: `${loadman.employee_name} - ${loadman.mobile_no}`,
                data: loadman,
            })));
        }

        // Set trip date and times
        setAddonTripDate(parentTrip.trip_date);
        setAddonDeparture('15:00');
        setAddonArrival('22:00');
        setAddonRemarks('');
        setSelectedAddonBookings([]);
        
        // Clear any previous addon bookings
        setAvailableAddonBookings([]);
    }, []);

    // Update trip status
    const handleUpdateStatus = (tripId, newStatus) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const statusData = {
            status: newStatus
        };

        if (newStatus === 'in_progress') {
            statusData.actual_departure = currentTime;
        } else if (newStatus === 'completed') {
            statusData.actual_arrival = currentTime;
        }

        dispatch(updateTripStatus({ tripId, statusData }));
    };

    // Delete trip
    const handleDeleteTrip = (tripId) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this trip?',
            () => {
                dispatch(deleteTrip(tripId));
            },
            'Yes, delete it'
        );
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

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ fromDate: '', toDate: '', status: '' });
        setSearchTerm('');
    };

// Trip Details Component - Updated with center name mapping
// Trip Details Component - Updated to show center names
const TripDetails = ({ trip }) => {
    if (!trip.expanded) return null;

    // Helper function to get center name from ID
    const getCenterName = (centerId, type) => {
        if (!centerId) return 'N/A';
        
        // Try to get from trip's fromCenter or toCenter based on matching ID
        if (trip.fromCenter?.office_center_id === centerId) {
            return trip.fromCenter.office_center_name;
        }
        if (trip.toCenter?.office_center_id === centerId) {
            return trip.toCenter.office_center_name;
        }
        
        // If no match found, return the ID as fallback
        return centerId;
    };

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
                            <span className="font-medium text-blue-600">{trip.trip_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">From Center:</span>
                            <span className="font-medium">{trip.fromCenter?.office_center_name || trip.from_center_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">To Center:</span>
                            <span className="font-medium">{trip.toCenter?.office_center_name || trip.to_center_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{trip.trip_date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Schedule:</span>
                            <span className="font-medium">{trip.estimated_departure} - {trip.estimated_arrival}</span>
                        </div>
                        {trip.actual_arrival && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Actual Arrival:</span>
                                <span className="font-medium text-green-600">{trip.actual_arrival}</span>
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
                            <span className="font-medium">{trip.vehicle?.vehicle_number_plate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Driver:</span>
                            <span className="font-medium">{trip.driver?.employee_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Loadmen:</span>
                            <span className="font-medium">
                                {trip.loadmen?.map(l => l.employee_name).join(', ') || 'None'}
                            </span>
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
                            <span className="text-gray-600">Total Bookings:</span>
                            <span className="font-medium">{trip.total_packages}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Weight:</span>
                            <span className="font-medium">{trip.total_weight}kg</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium text-green-600">₹{trip.total_amount}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">Bookings</h4>
                <div className="space-y-3">
                    {trip.bookings?.map((booking, index) => {
                        // Get from center name - try to match with trip's fromCenter or toCenter
                        const fromCenterName = 
                            // First check if booking has fromCenter object
                            booking.fromCenter?.office_center_name ||
                            // Then try to match with trip's fromCenter
                            (booking.from_center_id === trip.fromCenter?.office_center_id ? trip.fromCenter?.office_center_name :
                            // Then try to match with trip's toCenter
                            booking.from_center_id === trip.toCenter?.office_center_id ? trip.toCenter?.office_center_name :
                            // If no match, return the ID
                            booking.from_center_id);
                        
                        // Get to center name - try to match with trip's fromCenter or toCenter
                        const toCenterName = 
                            // First check if booking has toCenter object
                            booking.toCenter?.office_center_name ||
                            // Then try to match with trip's fromCenter
                            (booking.to_center_id === trip.fromCenter?.office_center_id ? trip.fromCenter?.office_center_name :
                            // Then try to match with trip's toCenter
                            booking.to_center_id === trip.toCenter?.office_center_id ? trip.toCenter?.office_center_name :
                            // If no match, return the ID
                            booking.to_center_id);
                        
                        // Get delivery status - check multiple possible locations
                        const deliveryStatus = booking.TripBooking?.delivery_status || 
                                              booking.delivery_status || 
                                              'pending';
                        
                        // Determine status color
                        const statusColor = deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                                           deliveryStatus === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                                           deliveryStatus === 'pending' ? 'bg-blue-100 text-blue-800' :
                                           'bg-gray-100 text-gray-800';
                        
                        return (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                                    <div>
                                        <div className="font-medium text-gray-800 text-base">
                                            Booking #{booking.booking_number}: {fromCenterName} → {toCenterName}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Amount: <span className="font-medium">₹{booking.total_amount}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                            {deliveryStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Show message if no bookings */}
                    {(!trip.bookings || trip.bookings.length === 0) && (
                        <div className="text-center py-4 text-gray-500">
                            No bookings found for this trip
                        </div>
                    )}
                </div>
            </div>

            {trip.remarks && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Remarks</h4>
                    <p className="text-sm text-gray-600">{trip.remarks}</p>
                </div>
            )}
        </div>
    );
};
    // Table columns
 // Table columns - Updated version
const columns = useMemo(() => [
    {
        Header: '#',
        accessor: 'trip_number',
        Cell: ({ row }) => {
            const trip = row.original;
            return (
                <div className="font-medium text-gray-600">
                    <div className="inline-flex flex-col items-center">
                        <span className="text-xs text-gray-500 hidden sm:block">Trip No</span>
                        <span className="font-bold text-primary text-sm sm:text-base">{trip.trip_number}</span>
                    </div>
                </div>
            );
        },
        width: 100,
        mobileFull: false,
    },
 {
    Header: 'Route',
    accessor: 'route',
    Cell: ({ row }) => {
        const trip = row.original;
        const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
        const { officeCentersData = [] } = officeCenterState;
        
        const getCenterName = (centerId) => {
            if (!centerId) return 'N/A';
            if (typeof centerId === 'string' && !centerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                return centerId;
            }
            const center = officeCentersData.find(c => c.office_center_id === centerId);
            return center?.office_center_name || centerId;
        };
        
        const fromCenterName = trip.fromCenter?.office_center_name || 
                               getCenterName(trip.from_center_id);
        const toCenterName = trip.toCenter?.office_center_name || 
                             getCenterName(trip.to_center_id);
        
        return (
            <div className="space-y-1">
                <div className="flex items-center text-sm">
                    <IconMapPin className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                    <span className="font-medium truncate">
                        {fromCenterName} → {toCenterName}
                    </span>
                </div>
                <div className="text-xs text-gray-600">
                    {trip.bookings?.length || 0} bookings • {trip.total_packages} packages
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
            return (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <IconTruck className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
                        <span className="font-medium truncate">{trip.vehicle?.vehicle_number_plate}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                        <IconDriver className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{trip.driver?.employee_name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {trip.loadmen?.length || 0} loadmen
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
                        <span className="font-medium">{trip.total_packages}</span> Items
                    </div>
                    <div className="text-xs text-gray-600">
                        Weight: {trip.total_weight}kg
                    </div>
                    <div className="text-xs text-gray-500">
                        Amount: ₹{trip.total_amount}
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
        Cell: ({ value }) => {
            const statusConfig = {
                scheduled: { color: 'bg-blue-100 text-blue-800', icon: '⏰', label: 'Scheduled' },
                in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: '🚚', label: 'In Progress' },
                completed: { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Completed' },
                cancelled: { color: 'bg-red-100 text-red-800', icon: '✗', label: 'Cancelled' },
            };
            const config = statusConfig[value] || statusConfig.scheduled;
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    {config.icon} {config.label}
                </span>
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
                            onClick={() => toggleTripDetails(trip.trip_id)}
                            className="btn btn-outline-primary btn-sm p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                            {trip.expanded ? <IconChevronUp className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                        </button>
                    </Tippy>
                    {(trip.status === 'in_progress' || trip.status === 'scheduled') && (
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
                                    onClick={() => handleUpdateStatus(trip.trip_id, 'in_progress')}
                                    className="btn btn-outline-success btn-sm p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                                >
                                    <IconClock className="w-4 h-4" />
                                </button>
                            </Tippy>
                            <Tippy content="Cancel Trip">
                                <button
                                    onClick={() => handleUpdateStatus(trip.trip_id, 'cancelled')}
                                    className="btn btn-outline-danger btn-sm p-1.5 rounded-lg hover:bg-danger hover:text-white transition-colors"
                                >
                                    <IconXCircle className="w-4 h-4" />
                                </button>
                            </Tippy>
                            <Tippy content="Delete Trip">
                                <button
                                    onClick={() => handleDeleteTrip(trip.trip_id)}
                                    className="btn btn-outline-danger btn-sm p-1.5 rounded-lg hover:bg-danger hover:text-white transition-colors"
                                >
                                    <IconX className="w-4 h-4" />
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
    // Stats
    const stats = {
        total: trips.length,
        scheduled: trips.filter((t) => t.status === 'scheduled').length,
        inProgress: trips.filter((t) => t.status === 'in_progress').length,
        completed: trips.filter((t) => t.status === 'completed').length,
        totalBookings: trips.reduce((sum, t) => sum + (t.total_packages || 0), 0),
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

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
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
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Scheduled</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.scheduled}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                                <IconCalendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.inProgress}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
                                <IconClock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
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
                    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 col-span-2 sm:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Available Bookings</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{filteredAvailableBookings.length}</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                                <IconPackage className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 mb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by trip number, vehicle, driver..."
                                    className="form-input w-full pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn btn-outline-primary"
                            >
                                <IconFilter className="w-4 h-4 mr-2" />
                                Filters
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setShowAssignForm(!showAssignForm);
                                }}
                                className={`btn ${showAssignForm ? 'btn-outline-primary' : 'btn-primary'} shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-xs sm:text-sm py-2 px-4`}
                            >
                                {showAssignForm ? (
                                    <>
                                        <IconX className="w-3 h-3 mr-1" />
                                        Close Form
                                        <IconChevronUp className="w-3 h-3 ml-1" />
                                    </>
                                ) : (
                                    <>
                                        <IconPlus className="w-3 h-3 mr-1" />
                                        Assign New Trip
                                        <IconChevronDown className="w-3 h-3 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">From Date</label>
                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={filters.fromDate}
                                        onChange={handleFilterChange}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">To Date</label>
                                    <input
                                        type="date"
                                        name="toDate"
                                        value={filters.toDate}
                                        onChange={handleFilterChange}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Status</label>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className="form-select"
                                    >
                                        <option value="">All</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="btn btn-outline-secondary mr-2"
                                >
                                    Clear Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFilters(false)}
                                    className="btn btn-primary"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
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
                                            <div className="font-bold text-purple-600 text-sm sm:text-base">{selectedParentTrip.trip_number}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Status</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {selectedParentTrip.status}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Bookings</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {selectedParentTrip.bookings?.length || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Current Destination</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {selectedParentTrip.bookings?.[selectedParentTrip.bookings?.length - 1]?.toCenter?.office_center_name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Branch Filter */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <div className="flex items-center space-x-2 mb-3">
                                    <IconFilter className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by Branch:</span>
                                </div>
                                <Select
                                    options={branches}
                                    value={branches.find(branch => branch.value === selectedBranch)}
                                    onChange={(option) => setSelectedBranch(option.value)}
                                    className="react-select w-full sm:w-48 lg:w-64"
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
                                    
                                    {tripMode === 'addon' ? (
                                        // Add-on mode booking selector
                                        <>
                                            <Select
                                                isMulti
                                                options={getAddonBookingOptions()}
                                                value={selectedAddonBookings}
                                                onChange={setSelectedAddonBookings}
                                                placeholder="Select bookings from destination"
                                                className="react-select"
                                                classNamePrefix="select"
                                                isLoading={loading}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        borderColor: errors.bookings ? '#ef4444' : '#d1d5db',
                                                        minHeight: '40px',
                                                        fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                                    }),
                                                }}
                                                noOptionsMessage={() => {
                                                    if (!selectedParentTrip) return 'Select a parent trip first';
                                                    if (availableAddonBookings.length === 0) {
                                                        return 'No available bookings at the destination';
                                                    }
                                                    return 'No options';
                                                }}
                                            />
                                            
                                            {selectedParentTrip && availableAddonBookings.length === 0 && (
                                                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                                    <p className="text-xs sm:text-sm text-yellow-700">
                                                        No available bookings found at {selectedParentTrip.bookings?.[selectedParentTrip.bookings?.length - 1]?.toCenter?.office_center_name || 'the destination'}. 
                                                        Please create bookings from this center first.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        // New trip mode booking selector
                                        <>
                                            <Select
                                                isMulti
                                                options={getBookingOptions()}
                                                value={selectedBookings}
                                                onChange={setSelectedBookings}
                                                placeholder="Select bookings for this trip"
                                                className="react-select"
                                                classNamePrefix="select"
                                                isLoading={loading}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        borderColor: errors.bookings ? '#ef4444' : '#d1d5db',
                                                        minHeight: '40px',
                                                        fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                                    }),
                                                }}
                                                noOptionsMessage={() => filteredAvailableBookings.length === 0 ? 'No available bookings found' : 'No options'}
                                            />
                                            
                                            {filteredAvailableBookings.length === 0 && (
                                                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                                    <p className="text-xs sm:text-sm text-yellow-700">
                                                        No available bookings found. Please create some bookings first or check the branch filter.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    
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
                                        isLoading={vehiclesLoading}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.selectedVehicle ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                        noOptionsMessage={() => 'No vehicles available'}
                                    />
                                    {errors.selectedVehicle && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.selectedVehicle}</p>}
                                    {selectedVehicle && (
                                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="font-medium text-sm sm:text-base">{selectedVehicle.data.vehicle_number_plate}</div>
                                                <div className="mt-1">{selectedVehicle.data.vehicle_type}</div>
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
                                        isLoading={employeesLoading}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.selectedDriver ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                        noOptionsMessage={() => 'No drivers available'}
                                    />
                                    {errors.selectedDriver && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.selectedDriver}</p>}
                                    {selectedDriver && (
                                        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="font-medium text-sm sm:text-base">{selectedDriver.data.employee_name}</div>
                                                <div className="mt-1">Mobile: {selectedDriver.data.mobile_no}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Loadmen Selection */}
                            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                    <IconUsers className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                                    Select Loadmen *
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
                                        isLoading={employeesLoading}
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.loadmen ? '#ef4444' : '#d1d5db',
                                                minHeight: '40px',
                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                            }),
                                        }}
                                        noOptionsMessage={() => 'No loadmen available'}
                                    />
                                    {errors.loadmen && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.loadmen}</p>}
                                    {selectedLoadmen.length > 0 && (
                                        <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                            <div className="text-xs sm:text-sm text-gray-700">
                                                <div className="font-medium text-sm sm:text-base">{selectedLoadmen.length} Loadmen Selected</div>
                                                <div className="mt-1">
                                                    {selectedLoadmen.map((loadman, index) => (
                                                        <span key={loadman.value} className="inline-block bg-white px-2 py-1 rounded text-xs mr-1 mb-1 border">
                                                            {loadman.data.employee_name}
                                                        </span>
                                                    ))}
                                                </div>
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
                                            min={tripMode === 'addon' ? selectedParentTrip?.trip_date : new Date().toISOString().split('T')[0]}
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
                                        />
                                        {errors.departure && <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.departure}</p>}
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
                                    placeholder="Add any special instructions for this trip..."
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
                            </div>

                            {/* Action Buttons */}
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
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : (tripMode === 'addon' ? 'Add Stage' : 'Assign Trip')}
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
                                View and manage all assigned trips
                            </p>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                            Showing {trips.length} trips
                        </div>
                    </div>
                </div>
                <div className="p-3 sm:p-4">
                    {loading && !showAssignForm ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <span className="ml-3">Loading trips...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-danger">
                            Error loading trips: {error}
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No trips found. Click "Assign New Trip" to get started.
                        </div>
                    ) : (
                        <>
                            <ResponsiveTable
                                columns={columns}
                                data={trips}
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                onPaginationChange={(pageIndex, newPageSize) => {
                                    setCurrentPage(pageIndex);
                                    setPageSize(newPageSize);
                                }}
                                onSearchChange={setSearchTerm}
                                pagination={true}
                                isSearchable={true}
                                searchPlaceholder="Search trips by trip number, vehicle, driver, or destination..."
                                showPageSize={true}
                            />
                            {trips.filter(trip => trip.expanded).map(trip => (
                                <TripDetails key={trip.trip_id} trip={trip} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignTrip;