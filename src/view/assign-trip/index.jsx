import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
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
                    weight: 25, // kg per package
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
            fromCenter: 'Bangalore South Terminal',
            toCenter: 'Hyderabad Distribution Center',
            fromLocation: 'Bangalore Tech Park',
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
            status: 'completed',
            deliveryStatus: 'not_started',
            date: '2024-01-19',
            totalWeight: 15,
            totalVolume: 0.3,
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
                            specialInstructions: 'Fragile',
                            assignedLoadmen: [dummyLoadmen[0]] // Loadmen assigned per package
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
                            specialInstructions: 'Handle with care',
                            assignedLoadmen: [dummyLoadmen[1]]
                        }
                    ]
                }
            ],
            vehicle: dummyVehicles[0],
            driver: dummyDrivers[0],
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
            addonBookings: [], // New field for add-on bookings
            expanded: false, // For view details toggle
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
    const [packageLoadmen, setPackageLoadmen] = useState({}); // { bookingId_packageId: [loadmen] }
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
            const parentDestination = selectedParentTrip.bookings[0]?.toCenter;
            const addonBookings = availableBookings.filter(booking => 
                booking.fromCenter === parentDestination
            );
            setAvailableAddonBookings(addonBookings);
            setSelectedAddonBookings([]);
            setPackageLoadmen({});
        }
    }, [selectedParentTrip, tripMode, availableBookings]);
// Get vehicle options
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
}, [tripMode, selectedParentTrip, dummyVehicles]);// Get driver options
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

    // Handle loadmen assignment for specific package
    const handlePackageLoadmenChange = useCallback((bookingId, packageId, loadmen) => {
        setPackageLoadmen(prev => ({
            ...prev,
            [`${bookingId}_${packageId}`]: loadmen
        }));
    }, []);

    // Toggle view details for a trip
    const toggleTripDetails = useCallback((tripId) => {
        setTrips(prevTrips => 
            prevTrips.map(trip => 
                trip.id === tripId 
                    ? { ...trip, expanded: !trip.expanded }
                    : { ...trip, expanded: false } // Close others
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
        
        // Validate loadmen assignment for each package
        bookings.forEach(booking => {
            const bookingId = booking.data.id;
            const packages = booking.data.packageDetails || [];
            
            packages.forEach(pkg => {
                const packageKey = `${bookingId}_${pkg.id}`;
                const assignedLoadmen = packageLoadmen[packageKey] || [];
                
                if (assignedLoadmen.length === 0) {
                    newErrors[`loadmen_${packageKey}`] = `At least one loadman is required for ${pkg.packageType} (Package #${pkg.id}) in Booking #${bookingId}`;
                }
            });
        });
        
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
        selectedVehicle, selectedDriver, packageLoadmen,
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

        // Prepare bookings with assigned loadmen per package
        const bookingsWithLoadmen = bookings.map(booking => {
            const bookingId = booking.data.id;
            const packagesWithLoadmen = (booking.data.packageDetails || []).map(pkg => {
                const packageKey = `${bookingId}_${pkg.id}`;
                const assignedLoadmen = packageLoadmen[packageKey] || [];
                
                return {
                    ...pkg,
                    assignedLoadmen: assignedLoadmen.map(l => l.data),
                    assignedLoadmenNames: assignedLoadmen.map(l => l.data.name).join(', ')
                };
            });

            return {
                ...booking.data,
                packageDetails: packagesWithLoadmen,
                deliveryStatus: 'scheduled',
                assignedLoadmen: Array.from(new Set(
                    packagesWithLoadmen.flatMap(pkg => pkg.assignedLoadmen || [])
                )) // All unique loadmen for this booking
            };
        });

        if (tripMode === 'addon' && selectedParentTrip) {
            // Add add-on bookings to parent trip
            setTrips(prevTrips => 
                prevTrips.map(trip => 
                    trip.id === selectedParentTrip.id 
                        ? {
                            ...trip,
                            addonBookings: [
                                ...(trip.addonBookings || []),
                                ...bookingsWithLoadmen
                            ],
                            totalWeight: trip.totalWeight + selectedTotals.totalWeight,
                            totalPackages: trip.totalPackages + selectedTotals.totalPackages,
                            totalAmount: trip.totalAmount + selectedTotals.totalAmount,
                            // Update estimated arrival time for add-on
                            estimatedArrival: addonArrival,
                            status: 'multi_stop'
                        }
                        : trip
                )
            );
            showMessage('success', `Add-on bookings added to trip #${selectedParentTrip.tripNo} successfully!`);
        } else {
            const newTrip = {
                id: tripId,
                tripNo: `TRIP${String(tripId).padStart(4, '0')}`,
                bookings: bookingsWithLoadmen,
                addonBookings: [], // Initialize empty addon bookings
                vehicle: selectedVehicle.data,
                driver: selectedDriver.data,
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

        setAddonTripDate(parentTrip.tripDate);
        setAddonDeparture('15:00');
        setAddonArrival('22:00');
        setAddonRemarks('');
        setSelectedAddonBookings([]);
        setPackageLoadmen({});
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

    // Reset form
    const resetForm = () => {
        setSelectedBookings([]);
        setSelectedVehicle(null);
        setSelectedDriver(null);
        setPackageLoadmen({});
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

    // Component for view details
   // Component for view details
const TripDetails = ({ trip }) => {
    if (!trip.expanded) return null;

    const allBookings = [...trip.bookings, ...(trip.addonBookings || [])];
    
    // Get all unique loadmen
    const allLoadmen = new Set();
    allBookings.forEach(booking => {
        booking.packageDetails?.forEach(pkg => {
            pkg.assignedLoadmen?.forEach(loadman => {
                allLoadmen.add(loadman.name);
            });
        });
    });

    return (
        <div className="bg-gray-50 rounded-lg mt-4 p-6 border border-gray-200 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Trip Information */}
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
                        {trip.actualDeparture && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Actual Departure:</span>
                                <span className="font-medium text-green-600">{trip.actualDeparture}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vehicle & Driver */}
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
                            <span className="text-gray-600">Team Size:</span>
                            <span className="font-medium">{allLoadmen.size + 1} people</span>
                        </div>
                    </div>
                </div>

                {/* Load Summary */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                        <IconPackage className="w-5 h-5 mr-2 text-blue-500" />
                        Load Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Bookings:</span>
                            <span className="font-medium">{allBookings.length}</span>
                        </div>
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
                    </div>
                </div>
            </div>

            {/* Bookings Details */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">Bookings Details</h4>
                <div className="space-y-4">
                    {allBookings.map((booking, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
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
                                        booking.deliveryStatus === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                                        booking.deliveryStatus === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {booking.deliveryStatus}
                                    </span>
                                    <div className="text-sm text-gray-600 mt-2">
                                        Amount: <span className="font-medium">₹{booking.totalAmount}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Packages in this booking */}
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
                                                    {pkg.assignedLoadmen?.map(l => l.name).join(', ') || 'No loadmen'}
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

            {/* Remarks and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trip.remarks && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Remarks</h4>
                        <p className="text-sm text-gray-700">{trip.remarks}</p>
                    </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Trip Status</h4>
                    <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            trip.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                            trip.status === 'multi_stop' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {trip.status === 'multi_stop' ? 'Multi-stop in Progress' : 
                             trip.status === 'in_progress' ? 'In Progress' :
                             trip.status === 'completed' ? 'Completed' : 'Scheduled'}
                        </span>
                        <div className="ml-4 text-sm text-gray-600">
                            Created: {new Date(trip.createdAt).toLocaleString()}
                        </div>
                    </div>
                    {trip.addonBookings?.length > 0 && (
                        <div className="mt-3 text-sm text-purple-700">
                            <IconLayers className="w-4 h-4 inline mr-1" />
                            Includes {trip.addonBookings.length} add-on booking(s)
                        </div>
                    )}
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
                            {(trip.addonBookings?.length > 0 || trip.status === 'multi_stop') && (
                                <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded mt-1">
                                    Multi-stop
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
            width: 100,
        },
        {
            Header: 'Route & Bookings',
            accessor: 'route',
            Cell: ({ row }) => {
                const trip = row.original;
                const firstBooking = trip.bookings[0];
                const allBookings = [...trip.bookings, ...(trip.addonBookings || [])];
                const lastBooking = allBookings[allBookings.length - 1];
                
                return (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <IconMapPin className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                                {firstBooking?.fromCenter} → {lastBooking?.toCenter}
                            </span>
                            {trip.addonBookings?.length > 0 && (
                                <IconLayers className="w-3 h-3 ml-1 text-purple-500 flex-shrink-0" />
                            )}
                        </div>
                        <div className="text-xs text-gray-600">
                            {allBookings.length} booking{allBookings.length > 1 ? 's' : ''} • {trip.totalPackages} packages
                        </div>
                        <div className="text-xs text-gray-500">
                            {trip.tripDate} • {trip.estimatedDeparture} - {trip.estimatedArrival}
                        </div>
                        {trip.addonBookings?.length > 0 && (
                            <div className="text-xs text-purple-600">
                                Includes {trip.addonBookings.length} add-on booking(s)
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            Header: 'Vehicle & Team',
            accessor: 'team',
            Cell: ({ row }) => {
                const trip = row.original;
                const allBookings = [...trip.bookings, ...(trip.addonBookings || [])];
                
                // Get all unique loadmen from all packages
                const allLoadmen = new Set();
                allBookings.forEach(booking => {
                    booking.packageDetails?.forEach(pkg => {
                        pkg.assignedLoadmen?.forEach(loadman => {
                            allLoadmen.add(loadman.name);
                        });
                    });
                });
                
                return (
                    <div className="space-y-1">
                        <div className="flex items-center text-sm">
                            <IconTruck className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
                            <span className="font-medium truncate">{trip.vehicle.vehicleNo}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                            <IconDriver className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{trip.driver.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {allLoadmen.size} loadmen assigned
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
                        {trip.actualArrival && (
                            <div className="text-xs text-gray-500 mt-1">
                                Arrived: {trip.actualArrival}
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
                    <div className="flex flex-wrap gap-1 sm:gap-0 sm:space-x-1">
                        <Tippy content={trip.expanded ? "Hide Details" : "View Details"}>
                            <button 
                                onClick={() => toggleTripDetails(trip.id)} 
                                className="btn btn-outline-primary btn-sm p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                {trip.expanded ? <IconChevronUp className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                            </button>
                        </Tippy>
                        
                        {trip.status === 'in_progress' && !trip.addonBookings?.length && (
                            <Tippy content="Add-on Bookings">
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
                        
                        {(trip.status === 'in_progress' || trip.status === 'multi_stop') && (
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
    ], [handleAssignAddonTrip, toggleTripDetails]);

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
                    ) ||
                    (trip.addonBookings && trip.addonBookings.some(b => 
                        b.fromCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.toCenter.toLowerCase().includes(searchTerm.toLowerCase())
                    ))
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
                    ) ||
                    (trip.addonBookings && trip.addonBookings.some(b => 
                        b.fromCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.toCenter.toLowerCase().includes(searchTerm.toLowerCase())
                    ))
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
        multiStop: trips.filter((t) => t.status === 'multi_stop').length,
        totalBookings: trips.reduce((sum, t) => sum + t.totalPackages, 0),
        totalAddonBookings: trips.reduce((sum, t) => sum + (t.addonBookings?.length || 0), 0),
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
                                <p className="text-xs sm:text-sm font-medium text-gray-600">Add-on Items</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mt-1">{stats.totalAddonBookings}</p>
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

                {/* Action Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
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
                    
                    {activeTrips.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTrips.length > 0) {
                                    handleAssignAddonTrip(activeTrips[0]);
                                }
                            }}
                            className="btn btn-purple shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center text-xs sm:text-sm lg:text-base py-2 sm:py-3 px-4 sm:px-6 w-full sm:w-auto"
                        >
                            <IconRoute className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Add Bookings to Trip
                        </button>
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
                                    Add Bookings to Existing Trip
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
                                            <div className="text-xs sm:text-sm text-gray-600">Status</div>
                                            <div className={`text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-full inline-block ${selectedParentTrip.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : ''}`}>
                                                {selectedParentTrip.status}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Destination</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {selectedParentTrip.bookings[0]?.toCenter}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm text-gray-600">Current Items</div>
                                            <div className="font-medium text-sm sm:text-base">
                                                {selectedParentTrip.totalPackages}
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
                                        {tripMode === 'addon' ? 'Available Bookings at Destination' : 'Available Bookings'}
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
                                                No available bookings found at {selectedParentTrip.bookings[0]?.toCenter}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Package Loadmen Assignment */}
                            {(tripMode === 'addon' ? selectedAddonBookings : selectedBookings).length > 0 && (
                                <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                                        <IconUsers className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                                        Assign Loadmen to Each Package *
                                    </h3>
                                    <div className="space-y-4 sm:space-y-6">
                                        {(tripMode === 'addon' ? selectedAddonBookings : selectedBookings).map((booking) => (
                                            <div key={booking.data.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                                                <div className="mb-4 sm:mb-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                                                        <div className="mb-2 sm:mb-0">
                                                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                                                                Booking #{booking.data.id}: {booking.data.fromCenter} → {booking.data.toCenter}
                                                            </h4>
                                                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                                                Total: {booking.data.totalWeight}kg • ₹{booking.data.totalAmount} • {booking.data.packageDetails.length} packages
                                                            </p>
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-gray-500">
                                                            Customer: {booking.data.fromName}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Packages List */}
                                                    <div className="space-y-3 sm:space-y-4">
                                                        {booking.data.packageDetails.map((pkg, pkgIndex) => (
                                                            <div key={pkg.id} className="bg-white rounded p-3 sm:p-4 border border-gray-200">
                                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3">
                                                                    <div className="mb-2 sm:mb-0">
                                                                        <h5 className="font-medium text-gray-800 text-sm sm:text-base">
                                                                            Package {pkgIndex + 1}: {pkg.packageType} × {pkg.quantity}
                                                                        </h5>
                                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                                Weight: {pkg.weight}kg
                                                                            </span>
                                                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                                Amount: ₹{pkg.total}
                                                                            </span>
                                                                            {pkg.specialInstructions && (
                                                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                                                                    {pkg.specialInstructions}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs sm:text-sm text-gray-500">
                                                                        Assign loadmen for this package
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Loadmen Selection for this Package */}
                                                                <div>
                                                                    <Select
                                                                        isMulti
                                                                        options={getLoadmenOptions()}
                                                                        value={packageLoadmen[`${booking.data.id}_${pkg.id}`] || []}
                                                                        onChange={(selected) => handlePackageLoadmenChange(booking.data.id, pkg.id, selected)}
                                                                        placeholder={`Select loadmen for ${pkg.packageType}`}
                                                                        className="react-select"
                                                                        classNamePrefix="select"
                                                                        styles={{
                                                                            control: (base) => ({
                                                                                ...base,
                                                                                borderColor: errors[`loadmen_${booking.data.id}_${pkg.id}`] ? '#ef4444' : '#d1d5db',
                                                                                minHeight: '40px',
                                                                                fontSize: window.innerWidth < 640 ? '12px' : '14px',
                                                                            }),
                                                                        }}
                                                                    />
                                                                    {errors[`loadmen_${booking.data.id}_${pkg.id}`] && (
                                                                        <p className="mt-2 text-xs sm:text-sm text-red-600">{errors[`loadmen_${booking.data.id}_${pkg.id}`]}</p>
                                                                    )}
                                                                    {(packageLoadmen[`${booking.data.id}_${pkg.id}`] || []).length > 0 && (
                                                                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                                                            <p className="text-xs sm:text-sm text-green-700">
                                                                                Selected: {packageLoadmen[`${booking.data.id}_${pkg.id}`]?.length || 0} loadmen
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                                {selectedTotals.totalWeight > 0 && (
                                                    <div className={`mt-2 text-sm ${selectedTotals.totalWeight > parseFloat(selectedVehicle.data.capacity) ? 'text-red-600' : 'text-green-600'}`}>
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
                                                Must be after {selectedParentTrip.estimatedArrival}
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
                                    placeholder="Add any special instructions for this trip..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                                    {tripMode === 'addon' ? 'Add Bookings Summary' : 'Trip Summary'}
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
                                            {Object.values(packageLoadmen).flat().length}
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
                                                {Object.values(packageLoadmen).flat().length + 1}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {tripMode === 'addon' && selectedParentTrip && (
                                    <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                                        <p className="text-xs sm:text-sm text-purple-700 text-center">
                                            These bookings will be added to Trip #{selectedParentTrip.tripNo} 
                                            ({selectedParentTrip.bookings[0]?.fromCenter} → {selectedParentTrip.bookings[0]?.toCenter})
                                        </p>
                                        <p className="text-xs text-gray-600 text-center mt-1">
                                            Total items after addition: {selectedParentTrip.totalPackages + selectedTotals.totalPackages}
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
                                    {tripMode === 'addon' ? 'Add to Trip' : 'Assign Trip'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Trips List Table */}
           {/* Trips List Table */}
<div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
    <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="w-full lg:w-auto">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Trip Assignments</h2>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                    View and manage all assigned trips with package-level loadmen assignments
                </p>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
                Showing {getPaginatedData().length} of {getTotalCount()} trips
            </div>
        </div>
    </div>
    <div className="p-1 sm:p-2 lg:p-3">
        <div className="overflow-x-auto">
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
                className="min-w-full"
            />
        </div>
        
        {/* Render Trip Details for expanded rows */}
        {getPaginatedData().map(trip => (
            <TripDetails key={trip.id} trip={trip} />
        ))}
    </div>
</div>
        </div>
    );
};

export default AssignTrip;