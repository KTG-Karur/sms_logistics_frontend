import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconDownload from '../../../components/Icon/IconFile';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconEye from '../../../components/Icon/IconEye';
import IconExternalLink from '../../../components/Icon/IconExternalLink';
import IconTruck from '../../../components/Icon/IconTruck';
import IconUser from '../../../components/Icon/IconUser';
import IconPackage from '../../../components/Icon/IconBox';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconMapPin from '../../../components/Icon/IconMapPin';
import IconRoute from '../../../components/Icon/Menu/IconMenuWidgets';
import IconClock from '../../../components/Icon/IconClock';
import IconUsers from '../../../components/Icon/IconUsers';
import IconLayers from '../../../components/Icon/IconLayers';
import IconFlag from '../../../components/Icon/IconAt';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';

const TripReport = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Dummy data for trip reports
    const dummyTripData = [
        {
            id: 1,
            tripNo: 'TRIP0001',
            vehicle: {
                vehicleNo: 'TN01AB1234',
                vehicleType: 'Truck',
                capacity: '5000 kg',
                status: 'in_use',
                model: 'Tata 407',
                insuranceNumber: 'INS-789456123',
                insuranceExpiry: '2025-12-31',
                fuelType: 'Diesel',
                currentMileage: '45,000 km'
            },
            driver: {
                name: 'Rajesh Kumar',
                mobileNo: '9876543210',
                licenseNo: 'DL1234567890',
                licenseExpiry: '2026-05-15',
                address: '123 Main St, Chennai',
                experience: '5 years'
            },
            loadmen: [
                { id: 1, name: 'Ramesh', mobileNo: '9876543220', experience: '3 years' },
                { id: 2, name: 'Suresh', mobileNo: '9876543221', experience: '2 years' }
            ],
            stages: [
                {
                    stageNumber: 1,
                    stageType: 'primary',
                    fromCenter: 'Chennai Central Hub',
                    toCenter: 'Bangalore South Terminal',
                    fromLocation: '123 Main Street, Chennai',
                    toLocation: '456 Park Avenue, Bangalore',
                    bookings: [
                        {
                            id: 1,
                            fromName: 'John Doe',
                            fromMobile: '9876543210',
                            toName: 'Robert Johnson',
                            toMobile: '8765432109',
                            packageDetails: [
                                { packageType: 'Box', quantity: 2, weight: 25, dimensions: '30x30x30 cm', total: 275 },
                                { packageType: 'Document', quantity: 1, weight: 2, dimensions: 'A4 Envelope', total: 90 }
                            ],
                            totalAmount: 365,
                            paymentStatus: 'paid',
                            deliveryStatus: 'delivered'
                        }
                    ],
                    tripDate: '2024-01-20',
                    estimatedDeparture: '08:00',
                    estimatedArrival: '14:00',
                    actualDeparture: '08:15',
                    actualArrival: '14:30',
                    status: 'completed',
                    distance: '350 km',
                    fuelConsumed: '45 liters',
                    expenses: 2500,
                    remarks: 'Direct trip with smooth traffic'
                },
                {
                    stageNumber: 2,
                    stageType: 'addon',
                    fromCenter: 'Bangalore South Terminal',
                    toCenter: 'Mysore Distribution Center',
                    fromLocation: '456 Park Avenue, Bangalore',
                    toLocation: '789 Palace Road, Mysore',
                    bookings: [
                        {
                            id: 2,
                            fromName: 'Mike Brown',
                            fromMobile: '8765432110',
                            toName: 'Sarah Wilson',
                            toMobile: '7654321098',
                            packageDetails: [
                                { packageType: 'Electronics', quantity: 1, weight: 15, dimensions: '40x30x20 cm', total: 450 }
                            ],
                            totalAmount: 450,
                            paymentStatus: 'pending',
                            deliveryStatus: 'delivered'
                        }
                    ],
                    tripDate: '2024-01-20',
                    estimatedDeparture: '15:30',
                    estimatedArrival: '18:30',
                    actualDeparture: '15:45',
                    actualArrival: '19:00',
                    status: 'completed',
                    distance: '150 km',
                    fuelConsumed: '20 liters',
                    expenses: 1200,
                    remarks: 'Additional pickup at Bangalore'
                }
            ],
            totalBookings: 2,
            totalPackages: 3,
            totalWeight: 42,
            totalAmount: 815,
            totalExpenses: 3700,
            totalDistance: 500,
            totalFuelConsumed: 65,
            tripStatus: 'completed',
            startDate: '2024-01-20',
            endDate: '2024-01-20',
            tripDuration: '10 hours 45 mins',
            createdAt: '2024-01-19T10:00:00',
            createdBy: 'Admin User',
            notes: 'Multi-stop trip with additional pickup',
            issues: 'Slight delay due to Bangalore traffic',
            documents: ['trip_sheet.pdf', 'fuel_bills.pdf']
        },
        {
            id: 2,
            tripNo: 'TRIP0002',
            vehicle: {
                vehicleNo: 'KA02CD5678',
                vehicleType: 'Tempo',
                capacity: '2000 kg',
                status: 'in_use',
                model: 'Mahindra Supro',
                insuranceNumber: 'INS-456789123',
                insuranceExpiry: '2024-11-30',
                fuelType: 'Diesel',
                currentMileage: '32,000 km'
            },
            driver: {
                name: 'Suresh Patel',
                mobileNo: '9876543211',
                licenseNo: 'DL2345678901',
                licenseExpiry: '2025-08-20',
                address: '456 Gandhi Road, Bangalore',
                experience: '3 years'
            },
            loadmen: [
                { id: 3, name: 'Ganesh', mobileNo: '9876543222', experience: '4 years' }
            ],
            stages: [
                {
                    stageNumber: 1,
                    stageType: 'primary',
                    fromCenter: 'Hyderabad Distribution Center',
                    toCenter: 'Pune Delivery Hub',
                    fromLocation: '234 Banjara Hills, Hyderabad',
                    toLocation: '123 MG Road, Pune',
                    bookings: [
                        {
                            id: 3,
                            fromName: 'Priya Sharma',
                            fromMobile: '9876543212',
                            toName: 'Amit Verma',
                            toMobile: '8765432111',
                            packageDetails: [
                                { packageType: 'Small Package', quantity: 5, weight: 3, dimensions: '15x15x15 cm', total: 425 }
                            ],
                            totalAmount: 425,
                            paymentStatus: 'paid',
                            deliveryStatus: 'in_transit'
                        },
                        {
                            id: 4,
                            fromName: 'Vikram Singh',
                            fromMobile: '9876543214',
                            toName: 'Anjali Mehta',
                            toMobile: '8765432112',
                            packageDetails: [
                                { packageType: 'Electronics', quantity: 1, weight: 40, dimensions: '50x40x30 cm', total: 410 }
                            ],
                            totalAmount: 410,
                            paymentStatus: 'paid',
                            deliveryStatus: 'in_transit'
                        }
                    ],
                    tripDate: '2024-01-21',
                    estimatedDeparture: '06:00',
                    estimatedArrival: '18:00',
                    actualDeparture: '06:15',
                    actualArrival: null,
                    status: 'in_progress',
                    distance: '750 km',
                    fuelConsumed: '85 liters',
                    expenses: 5000,
                    remarks: 'Long distance trip with multiple deliveries'
                }
            ],
            totalBookings: 2,
            totalPackages: 6,
            totalWeight: 43,
            totalAmount: 835,
            totalExpenses: 5000,
            totalDistance: 750,
            totalFuelConsumed: 85,
            tripStatus: 'in_progress',
            startDate: '2024-01-21',
            endDate: null,
            tripDuration: 'Ongoing',
            createdAt: '2024-01-20T14:30:00',
            createdBy: 'Manager User',
            notes: 'Consolidated trip for Pune deliveries',
            issues: '',
            documents: ['trip_sheet.pdf']
        },
        {
            id: 3,
            tripNo: 'TRIP0003',
            vehicle: {
                vehicleNo: 'MH03EF9012',
                vehicleType: 'Container',
                capacity: '10000 kg',
                status: 'in_use',
                model: 'Eicher Pro',
                insuranceNumber: 'INS-321654987',
                insuranceExpiry: '2025-06-30',
                fuelType: 'Diesel',
                currentMileage: '85,000 km'
            },
            driver: {
                name: 'Mohan Singh',
                mobileNo: '9876543212',
                licenseNo: 'DL3456789012',
                licenseExpiry: '2027-01-10',
                address: '789 Industrial Area, Mumbai',
                experience: '8 years'
            },
            loadmen: [
                { id: 4, name: 'Mahesh', mobileNo: '9876543223', experience: '5 years' },
                { id: 5, name: 'Raju', mobileNo: '9876543224', experience: '3 years' },
                { id: 6, name: 'Kumar', mobileNo: '9876543225', experience: '2 years' }
            ],
            stages: [
                {
                    stageNumber: 1,
                    stageType: 'primary',
                    fromCenter: 'Mumbai Port Facility',
                    toCenter: 'Delhi North Warehouse',
                    fromLocation: '789 Marine Drive, Mumbai',
                    toLocation: '101 Connaught Place, Delhi',
                    bookings: [
                        {
                            id: 5,
                            fromName: 'Raj Malhotra',
                            fromMobile: '9876543216',
                            toName: 'Sunil Patel',
                            toMobile: '8765432114',
                            packageDetails: [
                                { packageType: 'Machinery Parts', quantity: 3, weight: 75, dimensions: '60x40x30 cm', total: 790 }
                            ],
                            totalAmount: 790,
                            paymentStatus: 'partial',
                            deliveryStatus: 'scheduled'
                        }
                    ],
                    tripDate: '2024-01-22',
                    estimatedDeparture: '22:00',
                    estimatedArrival: '2024-01-24 06:00',
                    actualDeparture: null,
                    actualArrival: null,
                    status: 'scheduled',
                    distance: '1400 km',
                    fuelConsumed: null,
                    expenses: 15000,
                    remarks: 'Overnight long haul trip'
                },
                {
                    stageNumber: 2,
                    stageType: 'addon',
                    fromCenter: 'Delhi North Warehouse',
                    toCenter: 'Chandigarh Terminal',
                    fromLocation: '101 Connaught Place, Delhi',
                    toLocation: '234 Sector 17, Chandigarh',
                    bookings: [
                        {
                            id: 6,
                            fromName: 'Neha Gupta',
                            fromMobile: '9876543218',
                            toName: 'Rohit Sharma',
                            toMobile: '8765432116',
                            packageDetails: [
                                { packageType: 'Textiles', quantity: 10, weight: 25, dimensions: '30x20x15 cm', total: 470 }
                            ],
                            totalAmount: 470,
                            paymentStatus: 'paid',
                            deliveryStatus: 'scheduled'
                        }
                    ],
                    tripDate: '2024-01-24',
                    estimatedDeparture: '08:00',
                    estimatedArrival: '12:00',
                    actualDeparture: null,
                    actualArrival: null,
                    status: 'scheduled',
                    distance: '250 km',
                    fuelConsumed: null,
                    expenses: 2000,
                    remarks: 'Follow-up delivery after main trip'
                }
            ],
            totalBookings: 2,
            totalPackages: 13,
            totalWeight: 100,
            totalAmount: 1260,
            totalExpenses: 17000,
            totalDistance: 1650,
            totalFuelConsumed: null,
            tripStatus: 'scheduled',
            startDate: '2024-01-22',
            endDate: '2024-01-24',
            tripDuration: '32 hours',
            createdAt: '2024-01-21T16:45:00',
            createdBy: 'Admin User',
            notes: 'Multi-day trip with heavy machinery',
            issues: '',
            documents: ['trip_sheet.pdf', 'permit_docs.pdf']
        },
        {
            id: 4,
            tripNo: 'TRIP0004',
            vehicle: {
                vehicleNo: 'DL04GH3456',
                vehicleType: 'Pickup',
                capacity: '1500 kg',
                status: 'in_use',
                model: 'Tata Ace',
                insuranceNumber: 'INS-654321987',
                insuranceExpiry: '2024-09-15',
                fuelType: 'Diesel',
                currentMileage: '28,000 km'
            },
            driver: {
                name: 'Amit Sharma',
                mobileNo: '9876543213',
                licenseNo: 'DL4567890123',
                licenseExpiry: '2025-11-30',
                address: '567 Nehru Nagar, Delhi',
                experience: '4 years'
            },
            loadmen: [
                { id: 7, name: 'Santhosh', mobileNo: '9876543226', experience: '2 years' }
            ],
            stages: [
                {
                    stageNumber: 1,
                    stageType: 'primary',
                    fromCenter: 'Kolkata East Station',
                    toCenter: 'Bhubaneswar Hub',
                    fromLocation: '567 Park Street, Kolkata',
                    toLocation: '789 Janpath, Bhubaneswar',
                    bookings: [
                        {
                            id: 7,
                            fromName: 'Lisa Miller',
                            fromMobile: '6543210987',
                            toName: 'David Wilson',
                            toMobile: '6543210987',
                            packageDetails: [
                                { packageType: 'Medical Equipment', quantity: 2, weight: 30, dimensions: '50x40x30 cm', total: 345 }
                            ],
                            totalAmount: 345,
                            paymentStatus: 'paid',
                            deliveryStatus: 'delivered'
                        }
                    ],
                    tripDate: '2024-01-19',
                    estimatedDeparture: '10:00',
                    estimatedArrival: '16:00',
                    actualDeparture: '10:30',
                    actualArrival: '17:15',
                    status: 'completed',
                    distance: '450 km',
                    fuelConsumed: '55 liters',
                    expenses: 3500,
                    remarks: 'Delayed due to road work',
                    issues: 'Vehicle had minor tire issue'
                }
            ],
            totalBookings: 1,
            totalPackages: 2,
            totalWeight: 30,
            totalAmount: 345,
            totalExpenses: 3500,
            totalDistance: 450,
            totalFuelConsumed: 55,
            tripStatus: 'completed',
            startDate: '2024-01-19',
            endDate: '2024-01-19',
            tripDuration: '6 hours 45 mins',
            createdAt: '2024-01-18T11:20:00',
            createdBy: 'Manager User',
            notes: 'Single delivery medical equipment',
            issues: 'Tire puncture repaired on route',
            documents: ['trip_sheet.pdf', 'maintenance_report.pdf']
        },
        {
            id: 5,
            tripNo: 'TRIP0005',
            vehicle: {
                vehicleNo: 'GJ05IJ7890',
                vehicleType: 'Mini Truck',
                capacity: '3000 kg',
                status: 'in_use',
                model: 'Ashok Leyland Dost',
                insuranceNumber: 'INS-987654321',
                insuranceExpiry: '2025-03-31',
                fuelType: 'Diesel',
                currentMileage: '55,000 km'
            },
            driver: {
                name: 'Sanjay Verma',
                mobileNo: '9876543215',
                licenseNo: 'DL5678901234',
                licenseExpiry: '2026-07-22',
                address: '890 Gujarat Nagar, Ahmedabad',
                experience: '6 years'
            },
            loadmen: [
                { id: 8, name: 'Prakash', mobileNo: '9876543227', experience: '3 years' },
                { id: 9, name: 'Jitendra', mobileNo: '9876543228', experience: '1 year' }
            ],
            stages: [
                {
                    stageNumber: 1,
                    stageType: 'primary',
                    fromCenter: 'Ahmedabad Logistics Hub',
                    toCenter: 'Surat Terminal',
                    fromLocation: '456 Ring Road, Ahmedabad',
                    toLocation: '789 Dumas Road, Surat',
                    bookings: [
                        {
                            id: 8,
                            fromName: 'Emily Davis',
                            fromMobile: '7654321098',
                            toName: 'Michael Taylor',
                            toMobile: '8765432101',
                            packageDetails: [
                                { packageType: 'Clothing', quantity: 10, weight: 25, dimensions: '30x20x15 cm', total: 470 },
                                { packageType: 'Accessories', quantity: 5, weight: 5, dimensions: '20x15x10 cm', total: 150 }
                            ],
                            totalAmount: 620,
                            paymentStatus: 'pending',
                            deliveryStatus: 'delayed'
                        }
                    ],
                    tripDate: '2024-01-18',
                    estimatedDeparture: '09:30',
                    estimatedArrival: '12:30',
                    actualDeparture: '09:45',
                    actualArrival: null,
                    status: 'delayed',
                    distance: '250 km',
                    fuelConsumed: '35 liters',
                    expenses: 1800,
                    remarks: 'Heavy traffic and vehicle breakdown',
                    issues: 'Engine overheating issue'
                }
            ],
            totalBookings: 1,
            totalPackages: 15,
            totalWeight: 30,
            totalAmount: 620,
            totalExpenses: 1800,
            totalDistance: 250,
            totalFuelConsumed: 35,
            tripStatus: 'delayed',
            startDate: '2024-01-18',
            endDate: null,
            tripDuration: 'Ongoing',
            createdAt: '2024-01-17T15:10:00',
            createdBy: 'Admin User',
            notes: 'Urgent clothing delivery',
            issues: 'Vehicle breakdown requiring repair',
            documents: ['trip_sheet.pdf', 'breakdown_report.pdf']
        }
    ];

    // States
    const [tripData, setTripData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedStatus: null,
        selectedVehicle: null,
        selectedDriver: null,
        selectedRoute: null,
        startDate: '',
        toDate: '',
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Get unique values for filters
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'delayed', label: 'Delayed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const vehicleOptions = [
        { value: 'all', label: 'All Vehicles' },
        { value: 'TN01AB1234', label: 'TN01AB1234 (Truck)' },
        { value: 'KA02CD5678', label: 'KA02CD5678 (Tempo)' },
        { value: 'MH03EF9012', label: 'MH03EF9012 (Container)' },
        { value: 'DL04GH3456', label: 'DL04GH3456 (Pickup)' },
        { value: 'GJ05IJ7890', label: 'GJ05IJ7890 (Mini Truck)' },
    ];

    const driverOptions = [
        { value: 'all', label: 'All Drivers' },
        { value: 'Rajesh Kumar', label: 'Rajesh Kumar (DL1234567890)' },
        { value: 'Suresh Patel', label: 'Suresh Patel (DL2345678901)' },
        { value: 'Mohan Singh', label: 'Mohan Singh (DL3456789012)' },
        { value: 'Amit Sharma', label: 'Amit Sharma (DL4567890123)' },
        { value: 'Sanjay Verma', label: 'Sanjay Verma (DL5678901234)' },
    ];

    const routeOptions = [
        { value: 'all', label: 'All Routes' },
        { value: 'Chennai-Bangalore', label: 'Chennai → Bangalore' },
        { value: 'Hyderabad-Pune', label: 'Hyderabad → Pune' },
        { value: 'Mumbai-Delhi', label: 'Mumbai → Delhi' },
        { value: 'Kolkata-Bhubaneswar', label: 'Kolkata → Bhubaneswar' },
        { value: 'Ahmedabad-Surat', label: 'Ahmedabad → Surat' },
    ];

    const centerOptions = [
        { value: 'all', label: 'All Centers' },
        { value: 'Chennai Central Hub', label: 'Chennai Central Hub' },
        { value: 'Bangalore South Terminal', label: 'Bangalore South Terminal' },
        { value: 'Mumbai Port Facility', label: 'Mumbai Port Facility' },
        { value: 'Delhi North Warehouse', label: 'Delhi North Warehouse' },
        { value: 'Hyderabad Distribution Center', label: 'Hyderabad Distribution Center' },
        { value: 'Kolkata East Station', label: 'Kolkata East Station' },
        { value: 'Pune Delivery Hub', label: 'Pune Delivery Hub' },
        { value: 'Ahmedabad Logistics Hub', label: 'Ahmedabad Logistics Hub' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Trip Report Management'));
        // Initialize with dummy data
        setTripData(dummyTripData);
        setFilteredData(dummyTripData);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'delayed':
                return 'bg-orange-100 text-orange-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStageTypeColor = (type) => {
        switch (type) {
            case 'primary':
                return 'bg-blue-100 text-blue-800';
            case 'addon':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            width: 60,
            Cell: ({ row }) => <div className="text-center font-medium">{row.index + 1}</div>,
        },
        {
            Header: 'Trip No',
            accessor: 'tripNo',
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => {
                const trip = row.original;
                const firstStage = trip.stages[0];
                const lastStage = trip.stages[trip.stages.length - 1];
                const hasAddons = trip.stages.length > 1;
                
                return (
                    <div>
                        <div className="font-medium text-sm">
                            {firstStage.fromCenter}
                            {hasAddons ? ' → Multiple' : ` → ${lastStage.toCenter}`}
                        </div>
                        <div className="text-xs text-gray-500">
                            {trip.stages.length} stage{trip.stages.length > 1 ? 's' : ''} • {trip.totalDistance} km
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Vehicle & Driver',
            accessor: 'vehicleDriver',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center">
                        <IconTruck className="w-3 h-3 mr-1 text-gray-500" />
                        <span className="font-medium text-sm">{row.original.vehicle.vehicleNo}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                        <IconUser className="w-3 h-3 mr-1 text-gray-500" />
                        <span>{row.original.driver.name}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Team & Load',
            accessor: 'teamLoad',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-sm">
                        <span className="font-medium">{row.original.loadmen.length}</span> Loadmen
                    </div>
                    <div className="text-xs text-gray-600">
                        {row.original.totalPackages} packages • {row.original.totalWeight}kg
                    </div>
                </div>
            ),
        },
        {
            Header: 'Schedule',
            accessor: 'schedule',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-sm">{moment(row.original.startDate).format('DD/MM/YYYY')}</div>
                    <div className="text-xs text-gray-600">
                        {row.original.tripDuration}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Financial',
            accessor: 'financial',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Revenue:</span>
                        <span className="font-bold text-green-600">₹{row.original.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Expenses:</span>
                        <span className="font-medium text-red-600">₹{row.original.totalExpenses}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Net:</span>
                        <span className="font-medium text-blue-600">₹{row.original.totalAmount - row.original.totalExpenses}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'tripStatus',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 120,
            Cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="flex items-center justify-center space-x-1">
                        <button
                            onClick={() => handleViewDetails(data)}
                            className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                        >
                            <IconEye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleExportReport(data)}
                            className="flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-800 transition-colors"
                            title="Export to Excel"
                        >
                            <IconDownload className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleExportPDF(data)}
                            className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 transition-colors"
                            title="Export PDF"
                        >
                            <IconPrinter className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchLoading(true);

        let filtered = [...tripData];

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (trip) =>
                    trip.tripNo.toLowerCase().includes(query) ||
                    trip.vehicle.vehicleNo.toLowerCase().includes(query) ||
                    trip.driver.name.toLowerCase().includes(query) ||
                    trip.driver.licenseNo.toLowerCase().includes(query) ||
                    trip.stages.some(stage => 
                        stage.fromCenter.toLowerCase().includes(query) ||
                        stage.toCenter.toLowerCase().includes(query)
                    )
            );
        }

        // Apply status filter
        if (filters.selectedStatus && filters.selectedStatus.value !== 'all') {
            filtered = filtered.filter((trip) => trip.tripStatus === filters.selectedStatus.value);
        }

        // Apply vehicle filter
        if (filters.selectedVehicle && filters.selectedVehicle.value !== 'all') {
            filtered = filtered.filter((trip) => trip.vehicle.vehicleNo === filters.selectedVehicle.value);
        }

        // Apply driver filter
        if (filters.selectedDriver && filters.selectedDriver.value !== 'all') {
            filtered = filtered.filter((trip) => trip.driver.name === filters.selectedDriver.value);
        }

        // Apply route filter
        if (filters.selectedRoute && filters.selectedRoute.value !== 'all') {
            filtered = filtered.filter((trip) => {
                const firstStage = trip.stages[0];
                const route = `${firstStage.fromCenter.split(' ')[0]}-${firstStage.toCenter.split(' ')[0]}`;
                return route.toLowerCase().includes(filters.selectedRoute.value.toLowerCase());
            });
        }

        // Apply date filter
        if (filters.startDate && filters.toDate) {
            filtered = filtered.filter((trip) => {
                const tripDate = moment(trip.startDate);
                const start = moment(filters.startDate);
                const end = moment(filters.toDate);
                return tripDate.isBetween(start, end, null, '[]');
            });
        }

        setTimeout(() => {
            setFilteredData(filtered);
            setAppliedFilters({ ...filters });
            setCurrentPage(0);
            setSearchLoading(false);
        }, 500);
    };

    const handleClear = () => {
        setFilters({
            searchQuery: '',
            selectedStatus: null,
            selectedVehicle: null,
            selectedDriver: null,
            selectedRoute: null,
            startDate: '',
            toDate: '',
        });
        setAppliedFilters(null);
        setShowAdvancedFilters(false);
        setSearchLoading(false);
        setCurrentPage(0);
        setFilteredData(dummyTripData);
    };

    const handleViewDetails = (trip) => {
        setSelectedTrip(trip);
        setShowDetailsModal(true);
    };

    const handleExportReport = (trip) => {
        exportTripToExcel(trip);
    };

    const handleExportPDF = (trip) => {
        // Navigate to PDF report page with trip data
        const pdfData = {
            trip: trip,
            generatedDate: moment().format('DD/MM/YYYY HH:mm')
        };
        navigate('/reports/trip-pdf', { state: pdfData });
    };

    const exportTripToExcel = (trip) => {
        const wb = XLSX.utils.book_new();

        // Main Trip Sheet
        const tripInfo = [
            ['COMPREHENSIVE TRIP REPORT'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['TRIP INFORMATION'],
            [`Trip No: ${trip.tripNo}`],
            [`Status: ${trip.tripStatus.toUpperCase()}`],
            [`Start Date: ${moment(trip.startDate).format('DD/MM/YYYY')}`],
            [`End Date: ${trip.endDate ? moment(trip.endDate).format('DD/MM/YYYY') : 'Ongoing'}`],
            [`Trip Duration: ${trip.tripDuration}`],
            [`Created By: ${trip.createdBy}`],
            [`Created At: ${moment(trip.createdAt).format('DD/MM/YYYY HH:mm')}`],
            [],
            ['VEHICLE INFORMATION'],
            [`Vehicle Number: ${trip.vehicle.vehicleNo}`],
            [`Vehicle Type: ${trip.vehicle.vehicleType}`],
            [`Capacity: ${trip.vehicle.capacity}`],
            [`Model: ${trip.vehicle.model}`],
            [`Fuel Type: ${trip.vehicle.fuelType}`],
            [`Current Mileage: ${trip.vehicle.currentMileage}`],
            [`Insurance Number: ${trip.vehicle.insuranceNumber}`],
            [`Insurance Expiry: ${moment(trip.vehicle.insuranceExpiry).format('DD/MM/YYYY')}`],
            [],
            ['DRIVER INFORMATION'],
            [`Driver Name: ${trip.driver.name}`],
            [`Driver Mobile: ${trip.driver.mobileNo}`],
            [`License Number: ${trip.driver.licenseNo}`],
            [`License Expiry: ${moment(trip.driver.licenseExpiry).format('DD/MM/YYYY')}`],
            [`Address: ${trip.driver.address}`],
            [`Experience: ${trip.driver.experience}`],
            [],
            ['LOADMEN TEAM'],
        ];

        trip.loadmen.forEach((loadman, index) => {
            tripInfo.push([
                `${index + 1}. ${loadman.name}`,
                `Mobile: ${loadman.mobileNo}`,
                `Experience: ${loadman.experience}`
            ]);
        });

        tripInfo.push([]);
        tripInfo.push(['TRIP SUMMARY']);
        tripInfo.push([`Total Stages: ${trip.stages.length}`]);
        tripInfo.push([`Total Bookings: ${trip.totalBookings}`]);
        tripInfo.push([`Total Packages: ${trip.totalPackages}`]);
        tripInfo.push([`Total Weight: ${trip.totalWeight} kg`]);
        tripInfo.push([`Total Distance: ${trip.totalDistance} km`]);
        tripInfo.push([`Total Fuel Consumed: ${trip.totalFuelConsumed || 'N/A'} liters`]);
        tripInfo.push([`Total Revenue: ₹${trip.totalAmount}`]);
        tripInfo.push([`Total Expenses: ₹${trip.totalExpenses}`]);
        tripInfo.push([`Net Profit/Loss: ₹${trip.totalAmount - trip.totalExpenses}`]);

        const ws1 = XLSX.utils.aoa_to_sheet(tripInfo);
        ws1['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }];

        // Stages Sheet
        const stagesData = [
            ['TRIP STAGES DETAILS'],
            [],
            ['Stage', 'Type', 'From Center', 'To Center', 'Date', 'Departure', 'Arrival', 'Status', 'Distance', 'Fuel', 'Expenses', 'Remarks'],
        ];

        trip.stages.forEach((stage) => {
            stagesData.push([
                stage.stageNumber,
                stage.stageType,
                stage.fromCenter,
                stage.toCenter,
                moment(stage.tripDate).format('DD/MM/YYYY'),
                stage.actualDeparture || stage.estimatedDeparture,
                stage.actualArrival || stage.estimatedArrival,
                stage.status,
                `${stage.distance} km`,
                stage.fuelConsumed ? `${stage.fuelConsumed} liters` : 'N/A',
                `₹${stage.expenses}`,
                stage.remarks
            ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(stagesData);
        ws2['!cols'] = [
            { wch: 8 }, { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 12 },
            { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 30 }
        ];

        // Bookings Sheet
        const bookingsData = [
            ['BOOKINGS DETAILS'],
            [],
            ['Stage', 'Booking ID', 'Sender', 'Receiver', 'Packages', 'Weight', 'Amount', 'Payment', 'Status'],
        ];

        trip.stages.forEach((stage) => {
            stage.bookings.forEach((booking) => {
                const totalPackages = booking.packageDetails.reduce((sum, pkg) => sum + pkg.quantity, 0);
                const totalWeight = booking.packageDetails.reduce((sum, pkg) => sum + (pkg.weight * pkg.quantity), 0);
                
                bookingsData.push([
                    stage.stageNumber,
                    booking.id,
                    `${booking.fromName} (${booking.fromMobile})`,
                    `${booking.toName} (${booking.toMobile})`,
                    totalPackages,
                    `${totalWeight} kg`,
                    `₹${booking.totalAmount}`,
                    booking.paymentStatus,
                    booking.deliveryStatus
                ]);
            });
        });

        const ws3 = XLSX.utils.aoa_to_sheet(bookingsData);
        ws3['!cols'] = [
            { wch: 8 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 10 },
            { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(wb, ws1, 'Trip Report');
        XLSX.utils.book_append_sheet(wb, ws2, 'Trip Stages');
        XLSX.utils.book_append_sheet(wb, ws3, 'Bookings Details');

        const fileName = `Trip-Report-${trip.tripNo}-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onDownloadAllExcel = () => {
        const wb = XLSX.utils.book_new();

        const header = [
            ['COMPREHENSIVE TRIP REPORTS'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            [
                'Trip No',
                'Vehicle No',
                'Driver',
                'Total Stages',
                'From Center',
                'To Center',
                'Total Distance',
                'Start Date',
                'End Date',
                'Trip Duration',
                'Total Bookings',
                'Total Packages',
                'Total Weight',
                'Total Revenue',
                'Total Expenses',
                'Net Amount',
                'Trip Status',
                'Loadmen Count',
                'Created By',
                'Created Date'
            ],
        ];

        const data = filteredData.map((trip) => {
            const firstStage = trip.stages[0];
            const lastStage = trip.stages[trip.stages.length - 1];
            
            return [
                trip.tripNo,
                trip.vehicle.vehicleNo,
                trip.driver.name,
                trip.stages.length,
                firstStage.fromCenter,
                lastStage.toCenter,
                trip.totalDistance,
                moment(trip.startDate).format('DD/MM/YYYY'),
                trip.endDate ? moment(trip.endDate).format('DD/MM/YYYY') : 'Ongoing',
                trip.tripDuration,
                trip.totalBookings,
                trip.totalPackages,
                trip.totalWeight,
                trip.totalAmount,
                trip.totalExpenses,
                trip.totalAmount - trip.totalExpenses,
                trip.tripStatus,
                trip.loadmen.length,
                trip.createdBy,
                moment(trip.createdAt).format('DD/MM/YYYY HH:mm')
            ];
        });

        const allRows = [...header, ...data];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        ws['!cols'] = [
            { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 20 },
            { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
            { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'All Trips');

        const fileName = `All-Trip-Reports-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = async () => {
        const pdfData = {
            filteredData: filteredData,
            filters: appliedFilters,
            stats: getStats(),
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            totalRecords: filteredData.length
        };

        navigate('/reports/trips-pdf', { state: pdfData });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => filteredData.length;

    const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            minHeight: '42px',
            '&:hover': {
                borderColor: '#d1d5db',
            },
        }),
    };

    const getStats = () => {
        return {
            total: filteredData.length,
            totalRevenue: filteredData.reduce((sum, trip) => sum + trip.totalAmount, 0),
            totalExpenses: filteredData.reduce((sum, trip) => sum + trip.totalExpenses, 0),
            netProfit: filteredData.reduce((sum, trip) => sum + (trip.totalAmount - trip.totalExpenses), 0),
            totalDistance: filteredData.reduce((sum, trip) => sum + trip.totalDistance, 0),
            totalPackages: filteredData.reduce((sum, trip) => sum + trip.totalPackages, 0),
            completed: filteredData.filter((trip) => trip.tripStatus === 'completed').length,
            inProgress: filteredData.filter((trip) => trip.tripStatus === 'in_progress').length,
        };
    };

    const stats = getStats();

    return (
        <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Trip Report Management</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Comprehensive trip tracking and reporting system</p>
            </div>

            {showSearch && (
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Search & Filter</h2>
                        <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                            ▲ Hide
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                            {/* Search Input */}
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconSearch className="inline w-4 h-4 mr-1" />
                                    Search Trips
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by trip number, vehicle, driver, route, or license number..."
                                    value={filters.searchQuery}
                                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                />
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <Select
                                    options={statusOptions}
                                    value={filters.selectedStatus}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedStatus: selectedOption })}
                                    placeholder="Select Status"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                />
                            </div>

                            {/* Vehicle Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                                <Select
                                    options={vehicleOptions}
                                    value={filters.selectedVehicle}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedVehicle: selectedOption })}
                                    placeholder="Select Vehicle"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                />
                            </div>

                            {/* Driver Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                                <Select
                                    options={driverOptions}
                                    value={filters.selectedDriver}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedDriver: selectedOption })}
                                    placeholder="Select Driver"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                />
                            </div>

                            {/* Advanced Filters Toggle */}
                            <div className="md:col-span-2 lg:col-span-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                        showAdvancedFilters ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconCalendar className="w-4 h-4" />
                                    <span className="font-medium">{showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
                                </button>
                            </div>

                            {/* Advanced Filters */}
                            {showAdvancedFilters && (
                                <>
                                    {/* Route Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                        <Select
                                            options={routeOptions}
                                            value={filters.selectedRoute}
                                            onChange={(selectedOption) => setFilters({ ...filters, selectedRoute: selectedOption })}
                                            placeholder="Select Route"
                                            isSearchable
                                            isClearable
                                            styles={customStyles}
                                        />
                                    </div>

                                    {/* From Center Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Center</label>
                                        <Select
                                            options={centerOptions}
                                            value={filters.selectedFromCenter}
                                            onChange={(selectedOption) => setFilters({ ...filters, selectedFromCenter: selectedOption })}
                                            placeholder="From Center"
                                            isSearchable
                                            isClearable
                                            styles={customStyles}
                                        />
                                    </div>

                                    {/* To Center Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Center</label>
                                        <Select
                                            options={centerOptions}
                                            value={filters.selectedToCenter}
                                            onChange={(selectedOption) => setFilters({ ...filters, selectedToCenter: selectedOption })}
                                            placeholder="To Center"
                                            isSearchable
                                            isClearable
                                            styles={customStyles}
                                        />
                                    </div>

                                    {/* Date Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={filters.startDate}
                                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={filters.toDate}
                                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

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
                                disabled={searchLoading}
                            >
                                {searchLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                            {appliedFilters && filteredData.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={onDownloadAllExcel}
                                        className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                                    >
                                        <IconDownload className="mr-2 w-4 h-4" />
                                        Export Excel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onGeneratePDF}
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

            {!showSearch && (
                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => setShowSearch(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center text-sm"
                    >
                        <IconSearch className="mr-2 w-4 h-4" />
                        Show Search Panel
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Trips</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">{stats.total}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <IconTruck className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">₹{stats.totalRevenue}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                            <IconMoney className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Net Profit</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">₹{stats.netProfit}</p>
                        </div>
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Distance</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">{stats.totalDistance} km</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-full">
                            <IconRoute className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading States and Table */}
            {searchLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Searching Trip Data</h3>
                        <p className="text-gray-500">Please wait while we fetch the trip information based on your criteria</p>
                    </div>
                </div>
            ) : appliedFilters && filteredData.length > 0 ? (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Trip Reports</h3>
                                    <p className="text-gray-600 text-sm">
                                        Showing {filteredData.length} records
                                        {filters.startDate && filters.toDate
                                            ? ` from ${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}`
                                            : ' (All Time)'}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Completed: </span>
                                        <span className="font-semibold text-green-600">{stats.completed}</span>
                                    </div>
                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">In Progress: </span>
                                        <span className="font-semibold text-blue-600">{stats.inProgress}</span>
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
                                totalCount={getTotalCount()}
                                totalPages={Math.ceil(getTotalCount() / pageSize)}
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
                </>
            ) : appliedFilters && filteredData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Data Found</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">No trip records match your current search criteria. Try adjusting your filters or search terms.</p>
                        <button onClick={handleClear} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold">
                            Clear Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Trip Report Dashboard</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">
                            {tripData.length > 0 ? `Ready to search through ${tripData.length} trip records. Use the search filters above to generate detailed reports.` : 'Loading trip data...'}
                        </p>
                        <button
                            onClick={() => setShowSearch(true)}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg"
                        >
                            Start Searching
                        </button>
                    </div>
                </div>
            )}

            {/* Trip Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Trip Details - ${selectedTrip?.tripNo || ''}`}
                setModel={() => setShowDetailsModal(false)}
                modelSize="max-w-6xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedTrip && (
                    <div className="p-4 space-y-6">
                        {/* Header Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2">Trip Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trip No:</span>
                                            <span className="font-bold">{selectedTrip.tripNo}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTrip.tripStatus)}`}>
                                                {selectedTrip.tripStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{selectedTrip.tripDuration}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-green-800 mb-2">Schedule</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Start Date:</span>
                                            <span className="font-medium">{moment(selectedTrip.startDate).format('DD/MM/YYYY')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">End Date:</span>
                                            <span className="font-medium">{selectedTrip.endDate ? moment(selectedTrip.endDate).format('DD/MM/YYYY') : 'Ongoing'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Created By:</span>
                                            <span className="font-medium">{selectedTrip.createdBy}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-orange-800 mb-2">Performance</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Distance:</span>
                                            <span className="font-medium">{selectedTrip.totalDistance} km</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Fuel Consumed:</span>
                                            <span className="font-medium">{selectedTrip.totalFuelConsumed || 'N/A'} liters</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Stages:</span>
                                            <span className="font-medium">{selectedTrip.stages.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle & Team Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconTruck className="w-4 h-4 mr-2 text-blue-500" />
                                    Vehicle Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                            <div className="text-xs text-blue-600 mb-1">Vehicle Number</div>
                                            <div className="font-bold text-lg">{selectedTrip.vehicle.vehicleNo}</div>
                                        </div>
                                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                            <div className="text-xs text-blue-600 mb-1">Type & Capacity</div>
                                            <div className="font-medium">{selectedTrip.vehicle.vehicleType} ({selectedTrip.vehicle.capacity})</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Model</div>
                                            <div className="font-medium">{selectedTrip.vehicle.model}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Fuel Type</div>
                                            <div className="font-medium">{selectedTrip.vehicle.fuelType}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Insurance Number</div>
                                            <div className="font-medium">{selectedTrip.vehicle.insuranceNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Expiry</div>
                                            <div className="font-medium">{moment(selectedTrip.vehicle.insuranceExpiry).format('DD/MM/YYYY')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-green-500" />
                                    Driver Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                        <div className="text-xs text-green-600 mb-1">Driver Details</div>
                                        <div className="font-bold text-lg">{selectedTrip.driver.name}</div>
                                        <div className="text-sm text-gray-600">{selectedTrip.driver.mobileNo}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">License Number</div>
                                            <div className="font-medium">{selectedTrip.driver.licenseNo}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Expiry</div>
                                            <div className="font-medium">{moment(selectedTrip.driver.licenseExpiry).format('DD/MM/YYYY')}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Experience</div>
                                        <div className="font-medium">{selectedTrip.driver.experience}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loadmen Team */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <IconUsers className="w-4 h-4 mr-2 text-purple-500" />
                                Loadmen Team ({selectedTrip.loadmen.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {selectedTrip.loadmen.map((loadman, index) => (
                                    <div key={loadman.id} className="bg-gray-50 p-3 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-800">{loadman.name}</div>
                                            <div className="text-xs text-gray-500">#{index + 1}</div>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">Mobile: {loadman.mobileNo}</div>
                                        <div className="text-xs text-gray-500">Experience: {loadman.experience}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trip Stages */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <IconRoute className="w-4 h-4 mr-2 text-blue-500" />
                                Trip Stages ({selectedTrip.stages.length})
                            </h4>
                            <div className="space-y-4">
                                {selectedTrip.stages.map((stage, index) => (
                                    <div key={index} className={`p-4 rounded-lg border ${stage.stageType === 'primary' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'}`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                                            <div className="mb-2 md:mb-0">
                                                <div className="flex items-center">
                                                    <h5 className="font-semibold text-gray-800">
                                                        Stage {stage.stageNumber}: {stage.fromCenter} → {stage.toCenter}
                                                    </h5>
                                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStageTypeColor(stage.stageType)}`}>
                                                        {stage.stageType.toUpperCase()}
                                                    </span>
                                                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(stage.status)}`}>
                                                        {stage.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {stage.bookings.length} booking{stage.bookings.length > 1 ? 's' : ''} • {stage.distance} km
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                {moment(stage.tripDate).format('DD/MM/YYYY')} • {stage.estimatedDeparture} - {stage.estimatedArrival}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Departure</div>
                                                    <div className="font-medium">{stage.actualDeparture || stage.estimatedDeparture}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Arrival</div>
                                                    <div className="font-medium">{stage.actualArrival || stage.estimatedArrival}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Fuel</div>
                                                    <div className="font-medium">{stage.fuelConsumed || 'N/A'} liters</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-600 mb-1">Expenses</div>
                                                    <div className="font-medium">₹{stage.expenses}</div>
                                                </div>
                                            </div>
                                            
                                            {stage.remarks && (
                                                <div className="mt-3">
                                                    <div className="text-xs text-gray-600 mb-1">Remarks</div>
                                                    <div className="text-sm bg-white p-2 rounded border">{stage.remarks}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconMoney className="w-4 h-4 mr-2 text-green-500" />
                                    Financial Summary
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-green-50 p-3 rounded border border-green-100">
                                            <div className="text-xs text-green-600 mb-1">Total Revenue</div>
                                            <div className="text-xl font-bold text-green-700">₹{selectedTrip.totalAmount}</div>
                                        </div>
                                        <div className="bg-red-50 p-3 rounded border border-red-100">
                                            <div className="text-xs text-red-600 mb-1">Total Expenses</div>
                                            <div className="text-xl font-bold text-red-700">₹{selectedTrip.totalExpenses}</div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                        <div className="text-xs text-blue-600 mb-1">Net Profit/Loss</div>
                                        <div className={`text-xl font-bold ${selectedTrip.totalAmount - selectedTrip.totalExpenses >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            ₹{selectedTrip.totalAmount - selectedTrip.totalExpenses}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <div className="text-gray-600">Total Bookings</div>
                                            <div className="font-medium">{selectedTrip.totalBookings}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Total Packages</div>
                                            <div className="font-medium">{selectedTrip.totalPackages}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Summary */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconPackage className="w-4 h-4 mr-2 text-orange-500" />
                                    Trip Summary
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-orange-50 p-3 rounded border border-orange-100">
                                            <div className="text-xs text-orange-600 mb-1">Total Weight</div>
                                            <div className="text-lg font-bold">{selectedTrip.totalWeight} kg</div>
                                        </div>
                                        <div className="bg-purple-50 p-3 rounded border border-purple-100">
                                            <div className="text-xs text-purple-600 mb-1">Total Distance</div>
                                            <div className="text-lg font-bold">{selectedTrip.totalDistance} km</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Fuel Efficiency</div>
                                        <div className="font-medium">
                                            {selectedTrip.totalFuelConsumed ? 
                                                `${(selectedTrip.totalDistance / selectedTrip.totalFuelConsumed).toFixed(2)} km/liter` : 
                                                'N/A'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <div className="text-gray-600">Team Size</div>
                                            <div className="font-medium">{selectedTrip.loadmen.length + 1} people</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Stops</div>
                                            <div className="font-medium">{selectedTrip.stages.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Notes</div>
                                    <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100">{selectedTrip.notes}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Issues/Problems</div>
                                    <div className="text-sm bg-red-50 p-2 rounded border border-red-100">{selectedTrip.issues || 'No issues reported'}</div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-xs text-gray-600 mb-1">Documents</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTrip.documents.map((doc, index) => (
                                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                            {doc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default TripReport;