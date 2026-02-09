import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage } from '../../util/AllFunction';
import Select from 'react-select';
import ModelViewBox from '../../util/ModelViewBox';
import IconPlus from '../../components/Icon/IconPlus';
import IconUser from '../../components/Icon/IconUser';
import IconMapPin from '../../components/Icon/IconMapPin';
import IconPackage from '../../components/Icon/IconBox';
import IconTruck from '../../components/Icon/IconTruck';
import IconDriver from '../../components/Icon/IconDriver';
import IconUsers from '../../components/Icon/IconUsers';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconEye from '../../components/Icon/IconEye';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconClock from '../../components/Icon/IconClock';
import IconCheckCircle from '../../components/Icon/IconCheckCircle';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconRoute from '../../components/Icon/IconRoute';
import IconLayers from '../../components/Icon/IconLayers';

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
    ]);

    // Dummy data for bookings
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
                { packageType: 'Box', quantity: 2, rate: 100, pickupPrice: 30, dropPrice: 45, total: 275 },
            ],
            totalAmount: 275,
            paymentBy: 'from',
            paidAmount: 275,
            status: 'pending',
            deliveryStatus: 'in_transit',
            date: '2024-01-15',
            totalWeight: 25,
            totalVolume: 0.5,
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
                { packageType: 'Document', quantity: 3, rate: 50, pickupPrice: 15, dropPrice: 25, total: 270 },
            ],
            totalAmount: 270,
            paymentBy: 'to',
            paidAmount: 0,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-18',
            totalWeight: 10,
            totalVolume: 0.2,
        },
        {
            id: 3,
            fromCenter: 'Bangalore South Terminal',
            toCenter: 'Hyderabad Distribution Center',
            fromLocation: 'Bangalore Tech Park',
            toLocation: '234 Banjara Hills, Hyderabad',
            fromMobile: '9876543212',
            fromName: 'Priya Sharma',
            toMobile: '8765432111',
            toName: 'Amit Verma',
            packageDetails: [
                { packageType: 'Small Package', quantity: 5, rate: 30, pickupPrice: 20, dropPrice: 35, total: 425 },
            ],
            totalAmount: 425,
            paymentBy: 'from',
            paidAmount: 425,
            status: 'completed',
            deliveryStatus: 'not_started',
            date: '2024-01-19',
            totalWeight: 15,
            totalVolume: 0.3,
        },
        {
            id: 4,
            fromCenter: 'Mumbai Port Facility',
            toCenter: 'Delhi North Warehouse',
            fromLocation: '789 Marine Drive, Mumbai',
            toLocation: '101 Connaught Place, Delhi',
            fromMobile: '8765432109',
            fromName: 'Sarah Williams',
            toMobile: '7654321098',
            toName: 'Mike Brown',
            packageDetails: [
                { packageType: 'Document', quantity: 1, rate: 50, pickupPrice: 15, dropPrice: 25, total: 90 },
                { packageType: 'Parcel', quantity: 2, rate: 30, pickupPrice: 25, dropPrice: 40, total: 190 },
            ],
            totalAmount: 180,
            paymentBy: 'to',
            paidAmount: 0,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-16',
            totalWeight: 15,
            totalVolume: 0.3,
        },
        {
            id: 5,
            fromCenter: 'Chennai Central Hub',
            toCenter: 'Pune Cargo Terminal',
            fromLocation: 'Chennai Beach Road',
            toLocation: '890 FC Road, Pune',
            fromMobile: '7654321098',
            fromName: 'Emily Davis',
            toMobile: '6543210987',
            toName: 'David Wilson',
            packageDetails: [
                { packageType: 'Big Bag', quantity: 2, rate: 150, pickupPrice: 50, dropPrice: 70, total: 540 },
            ],
            totalAmount: 540,
            paymentBy: 'from',
            paidAmount: 540,
            status: 'completed',
            deliveryStatus: 'not_started',
            date: '2024-01-17',
            totalWeight: 160,
            totalVolume: 2.4,
        },
    ]);

    // States
    const [viewModal, setViewModal] = useState(false);
    const [addonModal, setAddonModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
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
                    totalWeight: 25,
                    totalAmount: 275,
                    deliveryStatus: 'in_transit',
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
            totalWeight: 25,
            totalVolume: 0.5,
            totalPackages: 1,
            totalAmount: 275,
            tripType: 'primary',
            parentTripId: null,
            childTripIds: [],
        }
    ]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [tripMode, setTripMode] = useState('new');

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

    // Memoized values
    const availableBookings = useMemo(() => 
        dummyBookings.filter(booking => booking.deliveryStatus === 'not_started'),
        [dummyBookings]
    );

    const activeTrips = useMemo(() => 
        trips.filter(trip => 
            trip.status === 'in_progress' && 
            trip.tripType === 'primary' && 
            !trip.childTripIds?.length
        ),
        [trips]
    );

    // Calculate totals
    const selectedTotals = useMemo(() => {
        const bookings = tripMode === 'addon' ? selectedAddonBookings : selectedBookings;
        return bookings.reduce((totals, booking) => {
            return {
                totalWeight: totals.totalWeight + (booking.data?.totalWeight || 0),
                totalVolume: totals.totalVolume + (booking.data?.totalVolume || 0),
                totalPackages: totals.totalPackages + 1,
                totalAmount: totals.totalAmount + (booking.data?.totalAmount || 0),
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
            const parentDestination = selectedParentTrip.bookings[0]?.toCenter;
            const addonBookings = availableBookings.filter(booking => 
                booking.fromCenter === parentDestination
            );
            setAvailableAddonBookings(addonBookings);
            setSelectedAddonBookings([]); // Reset selected bookings
        }
    }, [selectedParentTrip, tripMode, availableBookings]);

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
        if (tripMode === 'addon' && selectedParentTrip) {
            return selectedParentTrip.loadmen.map(loadman => ({
                value: loadman.id,
                label: `${loadman.name} - ${loadman.mobileNo}`,
                data: loadman,
            }));
        }
        const availableLoadmen = dummyLoadmen.filter(loadman => loadman.status === 'available');
        return availableLoadmen.map(loadman => ({
            value: loadman.id,
            label: `${loadman.name} - ${loadman.mobileNo}`,
            data: loadman,
        }));
    }, [tripMode, selectedParentTrip, dummyLoadmen]);

    // Get booking options
    const getBookingOptions = useCallback(() => {
        return availableBookings.map(booking => ({
            value: booking.id,
            label: `#${booking.id}: ${booking.fromCenter} → ${booking.toCenter} (${booking.totalWeight}kg)`,
            data: booking,
        }));
    }, [availableBookings]);

    // Get add-on booking options (FIXED: No state updates inside)
    const getAddonBookingOptions = useCallback(() => {
        if (!selectedParentTrip) return [];
        
        return availableAddonBookings.map(booking => ({
            value: booking.id,
            label: `#${booking.id}: ${booking.fromCenter} → ${booking.toCenter} (${booking.totalWeight}kg)`,
            data: booking,
        }));
    }, [selectedParentTrip, availableAddonBookings]);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors = {};
        const bookings = tripMode === 'addon' ? selectedAddonBookings : selectedBookings;

        if (bookings.length === 0) {
            newErrors.bookings = 'At least one booking must be selected';
        }
        if (!selectedVehicle) newErrors.selectedVehicle = 'Vehicle is required';
        if (!selectedDriver) newErrors.selectedDriver = 'Driver is required';
        if (selectedLoadmen.length === 0) newErrors.selectedLoadmen = 'At least one loadman is required';
        
        const dateField = tripMode === 'addon' ? addonTripDate : tripDate;
        if (!dateField) newErrors.date = 'Trip date is required';
        
        const departureField = tripMode === 'addon' ? addonDeparture : estimatedDeparture;
        if (!departureField) newErrors.departure = 'Departure time is required';
        
        const arrivalField = tripMode === 'addon' ? addonArrival : estimatedArrival;
        if (!arrivalField) newErrors.arrival = 'Arrival time is required';

        if (selectedVehicle) {
            const vehicleCapacity = parseFloat(selectedVehicle.data.capacity);
            if (selectedTotals.totalWeight > vehicleCapacity) {
                newErrors.selectedVehicle = `Total weight (${selectedTotals.totalWeight}kg) exceeds vehicle capacity (${vehicleCapacity}kg)`;
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

        const newTrip = {
            id: tripId,
            tripNo: `TRIP${String(tripId).padStart(4, '0')}`,
            bookings: (tripMode === 'addon' ? selectedAddonBookings : selectedBookings).map(b => b.data),
            vehicle: selectedVehicle.data,
            driver: selectedDriver.data,
            loadmen: selectedLoadmen.map(l => l.data),
            tripDate: tripMode === 'addon' ? addonTripDate : tripDate,
            estimatedDeparture: tripMode === 'addon' ? addonDeparture : estimatedDeparture,
            estimatedArrival: tripMode === 'addon' ? addonArrival : estimatedArrival,
            actualDeparture: null,
            actualArrival: null,
            remarks: tripMode === 'addon' ? addonRemarks : remarks,
            status: 'scheduled',
            createdAt: new Date().toISOString(),
            totalWeight: selectedTotals.totalWeight,
            totalVolume: selectedTotals.totalVolume,
            totalPackages: selectedTotals.totalPackages,
            totalAmount: selectedTotals.totalAmount,
            tripType: tripMode === 'addon' ? 'addon' : 'primary',
            parentTripId: tripMode === 'addon' ? selectedParentTrip.id : null,
            childTripIds: [],
        };

        if (tripMode === 'addon' && selectedParentTrip) {
            const updatedTrips = trips.map(trip => {
                if (trip.id === selectedParentTrip.id) {
                    return {
                        ...trip,
                        childTripIds: [...(trip.childTripIds || []), tripId],
                        tripType: 'multi_stop',
                    };
                }
                return trip;
            });
            
            setTrips([...updatedTrips, newTrip]);
            showMessage('success', `Add-on trip #${tripId} created successfully!`);
        } else {
            setTrips([newTrip, ...trips]);
            showMessage('success', `Trip #${tripId} assigned successfully!`);
        }

        resetForm();
        setShowAssignForm(false);
        setAddonModal(false);
    };

    // Handle add-on trip assignment - FIXED VERSION
    const handleAssignAddonTrip = useCallback((parentTrip) => {
        setSelectedParentTrip(parentTrip);
        setTripMode('addon');
        
        // Set pre-selected vehicle, driver, and loadmen
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
        
        setSelectedLoadmen(parentTrip.loadmen.map(loadman => ({
            value: loadman.id,
            label: `${loadman.name} - ${loadman.mobileNo}`,
            data: loadman,
        })));

        setAddonTripDate(parentTrip.tripDate);
        setAddonDeparture('15:00');
        setAddonArrival('22:00');
        setAddonRemarks('');
        setSelectedAddonBookings([]);
        
        // Open modal
        setAddonModal(true);
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

    // Complete trip
    const handleCompleteTrip = (tripId) => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        setTrips(trips.map(trip => 
            trip.id === tripId 
                ? { 
                    ...trip, 
                    status: 'completed',
                    actualArrival: currentTime,
                    actualDeparture: trip.actualDeparture || trip.estimatedDeparture
                }
                : trip
        ));

        showMessage('success', `Trip #${tripId} marked as completed!`);
    };

    // View trip details
    const handleViewTrip = (trip) => {
        setSelectedTrip(trip);
        setViewModal(true);
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

    // Close addon modal
    const closeAddonModal = () => {
        setAddonModal(false);
        resetForm();
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
                            <span className="text-xs text-gray-500">Trip No</span>
                            <span className="font-bold text-primary">{trip.tripNo}</span>
                            {trip.tripType === 'addon' && (
                                <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded">Add-on</span>
                            )}
                            {trip.tripType === 'multi_stop' && (
                                <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">Multi-stop</span>
                            )}
                        </div>
                    </div>
                );
            },
            width: 120,
        },
        {
            Header: 'Route & Bookings',
            accessor: 'route',
            Cell: ({ row }) => {
                const trip = row.original;
                const firstBooking = trip.bookings[0];
                const lastBooking = trip.bookings[trip.bookings.length - 1];
                
                return (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <IconMapPin className="w-3 h-3 mr-1 text-blue-500" />
                            <span className="font-medium">
                                {firstBooking.fromCenter} → {lastBooking.toCenter}
                            </span>
                            {trip.tripType === 'multi_stop' && (
                                <IconLayers className="w-3 h-3 ml-1 text-blue-500" />
                            )}
                        </div>
                        <div className="text-xs text-gray-600">
                            {trip.bookings.length} booking{trip.bookings.length > 1 ? 's' : ''}
                            {trip.parentTripId && (
                                <span className="ml-2 text-purple-600">
                                    ← Parent: TRIP{String(trip.parentTripId).padStart(4, '0')}
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            {trip.tripDate} • {trip.estimatedDeparture} - {trip.estimatedArrival}
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Vehicle & Team',
            accessor: 'team',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <IconTruck className="w-3 h-3 mr-1 text-primary" />
                            <span className="font-medium">{trip.vehicle.vehicleNo}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                            <IconDriver className="w-3 h-3 mr-1" />
                            {trip.driver.name}
                        </div>
                        <div className="text-xs text-gray-500">
                            {trip.loadmen.length} loadmen
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Load Summary',
            accessor: 'load',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-sm">
                            <span className="font-medium">{trip.totalPackages}</span> Packages
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
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value, row }) => {
                const statusConfig = {
                    scheduled: { color: 'bg-blue-100 text-blue-800', icon: '⏰', label: 'Scheduled' },
                    in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: '🚚', label: 'In Progress' },
                    completed: { color: 'bg-green-100 text-green-800', icon: '✓', label: 'Completed' },
                    cancelled: { color: 'bg-red-100 text-red-800', icon: '✗', label: 'Cancelled' },
                };
                const config = statusConfig[value] || statusConfig.scheduled;

                return (
                    <div className="space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                            {config.icon} {config.label}
                        </span>
                        {row.original.actualArrival && (
                            <div className="text-xs text-gray-500 mt-1">
                                Arrived: {row.original.actualArrival}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div className="flex space-x-1">
                        <Tippy content="View Details">
                            <button 
                                onClick={() => handleViewTrip(trip)} 
                                className="btn btn-outline-primary btn-sm p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                <IconEye className="w-4 h-4" />
                            </button>
                        </Tippy>
                        
                        {trip.status === 'in_progress' && trip.tripType === 'primary' && (
                            <Tippy content="Add-on Trip">
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
                                        onClick={() => handleUpdateStatus(trip.id, 'in_progress')} 
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
                        
                        {trip.status === 'in_progress' && (
                            <Tippy content="Complete Trip">
                                <button 
                                    onClick={() => handleCompleteTrip(trip.id)} 
                                    className="btn btn-outline-success btn-sm p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                                >
                                    <IconCheckCircle className="w-4 h-4" />
                                </button>
                            </Tippy>
                        )}
                    </div>
                );
            },
            width: 180,
        },
    ], [handleAssignAddonTrip]);

    // Pagination functions
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        let filteredData = trips;
        if (searchTerm) {
            filteredData = filteredData.filter(
                (trip) =>
                    trip.tripNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.bookings.some(b => 
                        b.fromCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.toCenter.toLowerCase().includes(searchTerm.toLowerCase())
                    ),
            );
        }
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        let filteredData = trips;
        if (searchTerm) {
            filteredData = filteredData.filter(
                (trip) =>
                    trip.tripNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trip.bookings.some(b => 
                        b.fromCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.toCenter.toLowerCase().includes(searchTerm.toLowerCase())
                    ),
            );
        }
        return filteredData.length;
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    // Get stats
    const stats = {
        total: trips.length,
        scheduled: trips.filter((t) => t.status === 'scheduled').length,
        inProgress: trips.filter((t) => t.status === 'in_progress').length,
        completed: trips.filter((t) => t.status === 'completed').length,
        totalBookings: trips.reduce((sum, t) => sum + t.totalPackages, 0),
        addonTrips: trips.filter((t) => t.tripType === 'addon').length,
    };

    return (
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Assign Trip</h1>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Assign vehicles and drivers to package bookings for delivery</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-3 sm:mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total Trips</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <IconTruck className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">In Progress</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.inProgress}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <IconClock className="w-4 h-4 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Completed</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.completed}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <IconCheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total Bookings</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.totalBookings}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <IconPackage className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Add-on Trips</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.addonTrips}</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-full">
                                <IconRoute className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Available</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{availableBookings.length}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <IconPackage className="w-4 h-4 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 mb-3 sm:mb-4">
                    <button
                        type="button"
                        onClick={() => {
                            setTripMode('new');
                            setShowAssignForm(!showAssignForm);
                        }}
                        className={`btn ${showAssignForm && tripMode === 'new' ? 'btn-outline-primary' : 'btn-primary'} shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-xs sm:text-sm py-2 px-4`}
                    >
                        <IconPlus className="w-3 h-3 mr-1" />
                        {showAssignForm && tripMode === 'new' ? 'Close Form' : 'Assign New Trip'}
                    </button>
                    
                    {activeTrips.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTrips.length > 0) {
                                    handleAssignAddonTrip(activeTrips[0]);
                                }
                            }}
                            className="btn btn-purple shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-xs sm:text-sm py-2 px-4"
                        >
                            <IconRoute className="w-3 h-3 mr-1" />
                            Create Add-on Trip
                        </button>
                    )}
                </div>
            </div>

            {/* Regular Trip Form */}
            {showAssignForm && tripMode === 'new' && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-4 sm:mb-6 animate-fadeIn">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
                            <IconTruck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                            Assign New Trip
                        </h2>
                    </div>

                    <form onSubmit={handleAssignTrip} className="p-3 sm:p-4">
                        <div className="space-y-4 sm:space-y-5">
                            {/* Select Bookings */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconPackage className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary" />
                                    Select Bookings *
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        Available Bookings
                                    </label>
                                    <Select
                                        isMulti
                                        options={getBookingOptions()}
                                        value={selectedBookings}
                                        onChange={setSelectedBookings}
                                        placeholder="Select bookings for this trip"
                                        className="react-select"
                                        classNamePrefix="select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.bookings ? '#ef4444' : '#d1d5db',
                                                minHeight: '36px',
                                                fontSize: '14px',
                                            }),
                                        }}
                                    />
                                    {errors.bookings && <p className="mt-1 text-xs text-red-600">{errors.bookings}</p>}
                                    
                                    {selectedBookings.length > 0 && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                            <div className="text-xs text-gray-700">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <div>
                                                        <span className="font-medium">Selected:</span> {selectedBookings.length} bookings
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Total Weight:</span> {selectedTotals.totalWeight}kg
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Total Volume:</span> {selectedTotals.totalVolume}m³
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
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconTruck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary" />
                                    Select Vehicle *
                                </h3>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Available Vehicles</label>
                                    <Select
                                        options={getVehicleOptions()}
                                        value={selectedVehicle}
                                        onChange={setSelectedVehicle}
                                        placeholder="Select vehicle"
                                        className="react-select"
                                        classNamePrefix="select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderColor: errors.selectedVehicle ? '#ef4444' : '#d1d5db',
                                                minHeight: '36px',
                                                fontSize: '14px',
                                            }),
                                        }}
                                    />
                                    {errors.selectedVehicle && <p className="mt-1 text-xs text-red-600">{errors.selectedVehicle}</p>}
                                    
                                    {selectedVehicle && (
                                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                            <div className="text-xs text-gray-700">
                                                <div className="font-medium">{selectedVehicle.data.vehicleNo}</div>
                                                <div>{selectedVehicle.data.vehicleType} • Capacity: {selectedVehicle.data.capacity}</div>
                                                {selectedTotals.totalWeight > 0 && (
                                                    <div className={`mt-1 ${selectedTotals.totalWeight > parseFloat(selectedVehicle.data.capacity) ? 'text-red-600' : 'text-green-600'}`}>
                                                        Load: {selectedTotals.totalWeight}kg / {selectedVehicle.data.capacity}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Driver & Loadmen Selection */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUsers className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
                                    Select Team *
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Driver *</label>
                                        <Select
                                            options={getDriverOptions()}
                                            value={selectedDriver}
                                            onChange={setSelectedDriver}
                                            placeholder="Select driver"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.selectedDriver ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                        />
                                        {errors.selectedDriver && <p className="mt-1 text-xs text-red-600">{errors.selectedDriver}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Loadmen *</label>
                                        <Select
                                            isMulti
                                            options={getLoadmenOptions()}
                                            value={selectedLoadmen}
                                            onChange={setSelectedLoadmen}
                                            placeholder="Select loadmen"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.selectedLoadmen ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                        />
                                        {errors.selectedLoadmen && <p className="mt-1 text-xs text-red-600">{errors.selectedLoadmen}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Trip Schedule */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconCalendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                                    Trip Schedule *
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Trip Date *</label>
                                        <input
                                            type="date"
                                            value={tripDate}
                                            onChange={(e) => setTripDate(e.target.value)}
                                            className={`form-input w-full ${errors.date ? 'border-red-500' : ''}`}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Departure Time *</label>
                                        <input
                                            type="time"
                                            value={estimatedDeparture}
                                            onChange={(e) => setEstimatedDeparture(e.target.value)}
                                            className={`form-input w-full ${errors.departure ? 'border-red-500' : ''}`}
                                        />
                                        {errors.departure && <p className="mt-1 text-xs text-red-600">{errors.departure}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Arrival Time *</label>
                                        <input
                                            type="time"
                                            value={estimatedArrival}
                                            onChange={(e) => setEstimatedArrival(e.target.value)}
                                            className={`form-input w-full ${errors.arrival ? 'border-red-500' : ''}`}
                                        />
                                        {errors.arrival && <p className="mt-1 text-xs text-red-600">{errors.arrival}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Remarks</h3>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="form-textarea w-full"
                                    rows="3"
                                    placeholder="Add any special instructions for this trip..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border-2 border-blue-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-2">Trip Summary</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Bookings</div>
                                        <div className="text-xl font-bold text-primary">{selectedTotals.totalPackages}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Total Weight</div>
                                        <div className="text-xl font-bold text-primary">{selectedTotals.totalWeight}kg</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Total Amount</div>
                                        <div className="text-xl font-bold text-primary">₹{selectedTotals.totalAmount}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600">Team Size</div>
                                        <div className="text-xl font-bold text-primary">{selectedLoadmen.length + 1}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowAssignForm(false);
                                    }}
                                    className="btn btn-outline-secondary hover:shadow-md transition-all duration-300 text-xs sm:text-sm py-2"
                                >
                                    Cancel
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-outline-primary hover:shadow-md transition-all duration-300 text-xs sm:text-sm py-2">
                                    Clear Form
                                </button>
                                <button type="submit" className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm py-2 px-4">
                                    Assign Trip
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Add-on Trip Modal */}
            <ModelViewBox
                modal={addonModal}
                modelHeader="Create Add-on Trip"
                setModel={closeAddonModal}
                handleSubmit={handleAssignTrip}
                modelSize="lg"
                submitBtnText="Create Add-on Trip"
                submitBtnClass="btn-purple"
                cancelBtnText="Cancel"
            >
                <div className="space-y-4">
                    {/* Parent Trip Info */}
                    {selectedParentTrip && (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border-2 border-purple-200">
                            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                <IconTruck className="w-4 h-4 mr-2 text-purple-600" />
                                Parent Trip Information
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-xs text-gray-600">Trip No</div>
                                    <div className="font-bold text-purple-600">{selectedParentTrip.tripNo}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600">Status</div>
                                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${selectedParentTrip.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : ''}`}>
                                        {selectedParentTrip.status}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600">Destination</div>
                                    <div className="font-medium">
                                        {selectedParentTrip.bookings[0]?.toCenter}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600">Arrival Time</div>
                                    <div className="font-medium">
                                        {selectedParentTrip.estimatedArrival}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Add-on Bookings */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                            <IconPackage className="w-4 h-4 mr-2 text-primary" />
                            Available Bookings at Destination
                        </h3>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Add-on Bookings *
                            </label>
                            <Select
                                isMulti
                                options={getAddonBookingOptions()}
                                value={selectedAddonBookings}
                                onChange={setSelectedAddonBookings}
                                placeholder="Select bookings from destination location"
                                className="react-select"
                                classNamePrefix="select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: errors.bookings ? '#ef4444' : '#d1d5db',
                                        minHeight: '36px',
                                        fontSize: '14px',
                                    }),
                                }}
                            />
                            {errors.bookings && <p className="mt-1 text-xs text-red-600">{errors.bookings}</p>}
                            
                            {availableAddonBookings.length === 0 && selectedParentTrip && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                    <p className="text-xs text-yellow-700">
                                        No available bookings found at {selectedParentTrip.bookings[0]?.toCenter}
                                    </p>
                                </div>
                            )}
                            
                            {selectedAddonBookings.length > 0 && (
                                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                    <div className="text-xs text-gray-700">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div>
                                                <span className="font-medium">Selected:</span> {selectedAddonBookings.length} bookings
                                            </div>
                                            <div>
                                                <span className="font-medium">Total Weight:</span> {selectedTotals.totalWeight}kg
                                            </div>
                                            <div>
                                                <span className="font-medium">Total Volume:</span> {selectedTotals.totalVolume}m³
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

                    {/* Trip Schedule */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                            <IconCalendar className="w-4 h-4 mr-2 text-green-500" />
                            Add-on Trip Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Trip Date *</label>
                                <input
                                    type="date"
                                    value={addonTripDate}
                                    onChange={(e) => setAddonTripDate(e.target.value)}
                                    className={`form-input w-full ${errors.date ? 'border-red-500' : ''}`}
                                    min={selectedParentTrip?.tripDate}
                                />
                                {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Departure Time *</label>
                                <input
                                    type="time"
                                    value={addonDeparture}
                                    onChange={(e) => setAddonDeparture(e.target.value)}
                                    className={`form-input w-full ${errors.departure ? 'border-red-500' : ''}`}
                                    min={selectedParentTrip?.estimatedArrival}
                                />
                                {errors.departure && <p className="mt-1 text-xs text-red-600">{errors.departure}</p>}
                                <p className="text-xs text-gray-500 mt-1">Must be after parent trip arrival ({selectedParentTrip?.estimatedArrival})</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Arrival Time *</label>
                                <input
                                    type="time"
                                    value={addonArrival}
                                    onChange={(e) => setAddonArrival(e.target.value)}
                                    className={`form-input w-full ${errors.arrival ? 'border-red-500' : ''}`}
                                />
                                {errors.arrival && <p className="mt-1 text-xs text-red-600">{errors.arrival}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle & Team (Pre-selected) */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                            <IconUsers className="w-4 h-4 mr-2 text-blue-500" />
                            Team Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="text-xs text-gray-600">Vehicle</div>
                                <div className="font-medium text-sm">{selectedParentTrip?.vehicle.vehicleNo}</div>
                                <div className="text-xs text-gray-500">{selectedParentTrip?.vehicle.capacity}</div>
                            </div>
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="text-xs text-gray-600">Driver</div>
                                <div className="font-medium text-sm">{selectedParentTrip?.driver.name}</div>
                                <div className="text-xs text-gray-500">{selectedParentTrip?.driver.licenseNo}</div>
                            </div>
                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="text-xs text-gray-600">Loadmen</div>
                                <div className="font-medium text-sm">{selectedParentTrip?.loadmen.length} loadmen</div>
                                <div className="text-xs text-gray-500">
                                    {selectedParentTrip?.loadmen.map(l => l.name).join(', ')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Remarks</h3>
                        <textarea
                            value={addonRemarks}
                            onChange={(e) => setAddonRemarks(e.target.value)}
                            className="form-textarea w-full"
                            rows="3"
                            placeholder="Add any special instructions for this add-on trip..."
                        />
                    </div>

                    {/* Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border-2 border-purple-200">
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Add-on Trip Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Bookings</div>
                                <div className="text-xl font-bold text-purple-600">{selectedTotals.totalPackages}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Total Weight</div>
                                <div className="text-xl font-bold text-purple-600">{selectedTotals.totalWeight}kg</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Total Amount</div>
                                <div className="text-xl font-bold text-purple-600">₹{selectedTotals.totalAmount}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Route Type</div>
                                <div className="text-sm font-medium text-purple-600">Add-on Trip</div>
                            </div>
                        </div>
                        <p className="text-xs text-purple-600 mt-2 text-center">
                            This trip will continue from {selectedParentTrip?.bookings[0]?.toCenter}
                        </p>
                    </div>
                </div>
            </ModelViewBox>

            {/* Trips List Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Trip Assignments</h2>
                            <p className="text-gray-600 mt-0.5 text-xs sm:text-sm">View and manage all assigned trips</p>
                        </div>
                        <div className="text-xs text-gray-500">
                            Showing {getPaginatedData().length} of {getTotalCount()} trips
                        </div>
                    </div>
                </div>
                <div className="p-1 sm:p-2">
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
                        isSearchable={true}
                        isSortable={true}
                        searchPlaceholder="Search trips..."
                        showPageSize={true}
                        responsive={true}
                        className="rounded-lg overflow-hidden"
                    />
                </div>
            </div>

            {/* View Trip Modal */}
            <ModelViewBox
                modal={viewModal}
                modelHeader="Trip Details"
                setModel={() => setViewModal(false)}
                handleSubmit={null}
                modelSize="lg"
                saveBtn={false}
            >
                {selectedTrip && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <div className="text-base font-bold text-gray-800 flex items-center">
                                        {selectedTrip.tripNo}
                                        {selectedTrip.tripType === 'addon' && (
                                            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                Add-on Trip
                                            </span>
                                        )}
                                        {selectedTrip.tripType === 'multi_stop' && (
                                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                Multi-stop Trip
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        Created: {new Date(selectedTrip.createdAt).toLocaleString()}
                                        {selectedTrip.parentTripId && (
                                            <span className="ml-2 text-purple-600">
                                                ← Parent: TRIP{String(selectedTrip.parentTripId).padStart(4, '0')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Add more trip details here */}
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default AssignTrip;