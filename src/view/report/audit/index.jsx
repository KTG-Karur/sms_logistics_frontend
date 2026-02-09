import { useState, useEffect, useRef } from 'react';
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
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import _ from 'lodash';

const PackageReport = () => {
    const dispatch = useDispatch();

    // Dummy data for reports (expanded with all required details)
    const dummyReportData = [
        {
            id: 1,
            packageId: 'PKG-001',
            tripId: 'TRP-001',
            fromCenter: 'Chennai Central Hub',
            toCenter: 'Bangalore South Terminal',
            fromLocation: '123 Main Street, Chennai',
            toLocation: '456 Park Avenue, Bangalore',
            
            // Customer Details
            senderName: 'John Doe',
            senderMobile: '9876543210',
            receiverName: 'Robert Johnson',
            receiverMobile: '8765432109',
            
            // Package Details
            packageDetails: [
                { packageType: 'Box', quantity: 2, rate: 100, pickupPrice: 30, dropPrice: 45, total: 275 }
            ],
            totalWeight: '25 kg',
            dimensions: '30x30x40 cm',
            packageValue: 5000,
            
            // Payment Details
            totalAmount: 275,
            paymentBy: 'sender',
            paidAmount: 275,
            paymentStatus: 'paid',
            paymentMethod: 'cash',
            paymentDate: '2024-01-15',
            dueAmount: 0,
            
            // Trip Details
            tripDate: '2024-01-15',
            tripStatus: 'completed',
            departureTime: '09:00 AM',
            arrivalTime: '02:00 PM',
            distance: '350 km',
            estimatedDuration: '5 hours',
            actualDuration: '5 hours 15 mins',
            
            // Vehicle Details
            vehicleNumber: 'TN-01-AB-1234',
            vehicleType: 'Tata Ace',
            vehicleCapacity: '1 ton',
            vehicleModel: '2022',
            insuranceNumber: 'INS-789456',
            insuranceExpiry: '2025-12-31',
            
            // Driver Details
            driverName: 'Rajesh Kumar',
            driverMobile: '9876543211',
            driverLicense: 'DL-7894561230',
            driverExpiry: '2026-05-15',
            
            // Load Man Details
            loadManName: 'Suresh Patel',
            loadManMobile: '9876543212',
            
            // Tracking Details
            trackingNumber: 'TRK-789456123',
            currentLocation: 'Bangalore South Terminal',
            lastUpdated: '2024-01-15 14:00',
            
            // Delivery Details
            deliveryProof: 'signed_document.jpg',
            deliveryTime: '2024-01-15 14:15',
            receivedBy: 'Robert Johnson',
            receiverSignature: true,
            
            // Status
            status: 'delivered',
            date: '2024-01-15',
            
            // Additional Info
            notes: 'Fragile - Handle with care',
            specialInstructions: 'Deliver before 3 PM',
            documents: ['invoice.pdf', 'packing_list.pdf']
        },
        {
            id: 2,
            packageId: 'PKG-002',
            tripId: 'TRP-002',
            fromCenter: 'Mumbai Port Facility',
            toCenter: 'Delhi North Warehouse',
            fromLocation: '789 Marine Drive, Mumbai',
            toLocation: '101 Connaught Place, Delhi',
            
            // Customer Details
            senderName: 'Sarah Williams',
            senderMobile: '8765432109',
            receiverName: 'Mike Brown',
            receiverMobile: '7654321098',
            
            // Package Details
            packageDetails: [
                { packageType: 'Document', quantity: 1, rate: 50, pickupPrice: 15, dropPrice: 25, total: 90 },
                { packageType: 'Parcel', quantity: 2, rate: 30, pickupPrice: 25, dropPrice: 40, total: 190 }
            ],
            totalWeight: '8 kg',
            dimensions: '20x20x10 cm',
            packageValue: 1500,
            
            // Payment Details
            totalAmount: 280,
            paymentBy: 'receiver',
            paidAmount: 0,
            paymentStatus: 'pending',
            paymentMethod: 'cash_on_delivery',
            paymentDate: '',
            dueAmount: 280,
            
            // Trip Details
            tripDate: '2024-01-16',
            tripStatus: 'in_transit',
            departureTime: '10:00 AM',
            arrivalTime: 'Expected 06:00 PM',
            distance: '1400 km',
            estimatedDuration: '32 hours',
            actualDuration: '',
            
            // Vehicle Details
            vehicleNumber: 'MH-01-CD-5678',
            vehicleType: 'Eicher Truck',
            vehicleCapacity: '5 ton',
            vehicleModel: '2021',
            insuranceNumber: 'INS-123456',
            insuranceExpiry: '2024-12-31',
            
            // Driver Details
            driverName: 'Vikram Singh',
            driverMobile: '9876543213',
            driverLicense: 'DL-1234567890',
            driverExpiry: '2025-08-20',
            
            // Load Man Details
            loadManName: 'Ajay Sharma',
            loadManMobile: '9876543214',
            
            // Tracking Details
            trackingNumber: 'TRK-123456789',
            currentLocation: 'Near Indore',
            lastUpdated: '2024-01-16 18:30',
            
            // Delivery Details
            deliveryProof: '',
            deliveryTime: '',
            receivedBy: '',
            receiverSignature: false,
            
            // Status
            status: 'in_transit',
            date: '2024-01-16',
            
            // Additional Info
            notes: 'Urgent delivery',
            specialInstructions: 'Call before delivery',
            documents: ['invoice.pdf']
        },
        {
            id: 3,
            packageId: 'PKG-003',
            tripId: 'TRP-003',
            fromCenter: 'Hyderabad Distribution Center',
            toCenter: 'Kolkata East Station',
            fromLocation: '234 Banjara Hills, Hyderabad',
            toLocation: '567 Park Street, Kolkata',
            
            // Customer Details
            senderName: 'David Wilson',
            senderMobile: '6543210987',
            receiverName: 'Lisa Miller',
            receiverMobile: '6543210987',
            
            // Package Details
            packageDetails: [
                { packageType: 'Large Package', quantity: 1, rate: 200, pickupPrice: 60, dropPrice: 85, total: 345 }
            ],
            totalWeight: '45 kg',
            dimensions: '50x50x60 cm',
            packageValue: 12000,
            
            // Payment Details
            totalAmount: 345,
            paymentBy: 'sender',
            paidAmount: 200,
            paymentStatus: 'partial',
            paymentMethod: 'online_transfer',
            paymentDate: '2024-01-17',
            dueAmount: 145,
            
            // Trip Details
            tripDate: '2024-01-17',
            tripStatus: 'scheduled',
            departureTime: '08:00 AM',
            arrivalTime: 'Expected 08:00 PM',
            distance: '1500 km',
            estimatedDuration: '36 hours',
            actualDuration: '',
            
            // Vehicle Details
            vehicleNumber: 'TS-01-EF-9012',
            vehicleType: 'Ashok Leyland',
            vehicleCapacity: '7 ton',
            vehicleModel: '2023',
            insuranceNumber: 'INS-654321',
            insuranceExpiry: '2025-06-30',
            
            // Driver Details
            driverName: 'Sanjay Verma',
            driverMobile: '9876543215',
            driverLicense: 'DL-4567891230',
            driverExpiry: '2027-01-10',
            
            // Load Man Details
            loadManName: 'Ramesh Gupta',
            loadManMobile: '9876543216',
            
            // Tracking Details
            trackingNumber: 'TRK-456789123',
            currentLocation: 'Hyderabad Distribution Center',
            lastUpdated: '2024-01-17 07:30',
            
            // Delivery Details
            deliveryProof: '',
            deliveryTime: '',
            receivedBy: '',
            receiverSignature: false,
            
            // Status
            status: 'pending',
            date: '2024-01-17',
            
            // Additional Info
            notes: 'Medical equipment',
            specialInstructions: 'Temperature sensitive',
            documents: ['invoice.pdf', 'certificate.pdf']
        },
        {
            id: 4,
            packageId: 'PKG-004',
            tripId: 'TRP-004',
            fromCenter: 'Pune Cargo Terminal',
            toCenter: 'Ahmedabad Logistics Hub',
            fromLocation: '890 FC Road, Pune',
            toLocation: '123 Law Garden, Ahmedabad',
            
            // Customer Details
            senderName: 'Emily Davis',
            senderMobile: '7654321098',
            receiverName: 'Michael Taylor',
            receiverMobile: '8765432101',
            
            // Package Details
            packageDetails: [
                { packageType: 'Small Package', quantity: 3, rate: 40, pickupPrice: 20, dropPrice: 35, total: 285 },
                { packageType: 'Medium Package', quantity: 1, rate: 60, pickupPrice: 40, dropPrice: 60, total: 160 }
            ],
            totalWeight: '18 kg',
            dimensions: 'Various sizes',
            packageValue: 8000,
            
            // Payment Details
            totalAmount: 445,
            paymentBy: 'receiver',
            paidAmount: 0,
            paymentStatus: 'pending',
            paymentMethod: 'credit_card',
            paymentDate: '',
            dueAmount: 445,
            
            // Trip Details
            tripDate: '2024-01-18',
            tripStatus: 'delayed',
            departureTime: '09:30 AM',
            arrivalTime: 'Delayed - Expected 07:00 PM',
            distance: '650 km',
            estimatedDuration: '10 hours',
            actualDuration: '',
            
            // Vehicle Details
            vehicleNumber: 'MH-12-GH-3456',
            vehicleType: 'Mahindra Bolero',
            vehicleCapacity: '1.5 ton',
            vehicleModel: '2020',
            insuranceNumber: 'INS-789123',
            insuranceExpiry: '2024-09-15',
            
            // Driver Details
            driverName: 'Arun Mehta',
            driverMobile: '9876543217',
            driverLicense: 'DL-7891234560',
            driverExpiry: '2025-11-30',
            
            // Load Man Details
            loadManName: 'Prakash Joshi',
            loadManMobile: '9876543218',
            
            // Tracking Details
            trackingNumber: 'TRK-789123456',
            currentLocation: 'Near Surat',
            lastUpdated: '2024-01-18 16:45',
            
            // Delivery Details
            deliveryProof: '',
            deliveryTime: '',
            receivedBy: '',
            receiverSignature: false,
            
            // Status
            status: 'delayed',
            date: '2024-01-18',
            
            // Additional Info
            notes: 'Multiple packages same receiver',
            specialInstructions: 'Consolidate all packages',
            documents: ['packing_list.pdf', 'invoice.pdf']
        },
        {
            id: 5,
            packageId: 'PKG-005',
            tripId: 'TRP-005',
            fromCenter: 'Bangalore South Terminal',
            toCenter: 'Chennai Central Hub',
            fromLocation: '456 Park Avenue, Bangalore',
            toLocation: '123 Main Street, Chennai',
            
            // Customer Details
            senderName: 'Robert Johnson',
            senderMobile: '8765432109',
            receiverName: 'John Doe',
            receiverMobile: '9876543210',
            
            // Package Details
            packageDetails: [
                { packageType: 'XL Package', quantity: 1, rate: 150, pickupPrice: 80, dropPrice: 110, total: 340 }
            ],
            totalWeight: '60 kg',
            dimensions: '80x60x50 cm',
            packageValue: 20000,
            
            // Payment Details
            totalAmount: 340,
            paymentBy: 'sender',
            paidAmount: 340,
            paymentStatus: 'paid',
            paymentMethod: 'cash',
            paymentDate: '2024-01-19',
            dueAmount: 0,
            
            // Trip Details
            tripDate: '2024-01-19',
            tripStatus: 'completed',
            departureTime: '11:00 AM',
            arrivalTime: '04:00 PM',
            distance: '350 km',
            estimatedDuration: '5 hours',
            actualDuration: '5 hours',
            
            // Vehicle Details
            vehicleNumber: 'KA-01-IJ-7890',
            vehicleType: 'Tata 407',
            vehicleCapacity: '2.5 ton',
            vehicleModel: '2022',
            insuranceNumber: 'INS-321654',
            insuranceExpiry: '2025-03-31',
            
            // Driver Details
            driverName: 'Mohan Reddy',
            driverMobile: '9876543219',
            driverLicense: 'DL-3216549870',
            driverExpiry: '2026-07-22',
            
            // Load Man Details
            loadManName: 'Kumar Swamy',
            loadManMobile: '9876543220',
            
            // Tracking Details
            trackingNumber: 'TRK-321654987',
            currentLocation: 'Chennai Central Hub',
            lastUpdated: '2024-01-19 16:00',
            
            // Delivery Details
            deliveryProof: 'digital_signature.jpg',
            deliveryTime: '2024-01-19 15:45',
            receivedBy: 'John Doe',
            receiverSignature: true,
            
            // Status
            status: 'delivered',
            date: '2024-01-19',
            
            // Additional Info
            notes: 'Return shipment',
            specialInstructions: '',
            documents: ['return_slip.pdf', 'invoice.pdf']
        }
    ];

    // States
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showTripModal, setShowTripModal] = useState(false);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedStatus: null,
        selectedPaymentStatus: null,
        selectedFromCenter: null,
        selectedToCenter: null,
        selectedDriver: null,
        selectedVehicle: null,
        startDate: '',
        toDate: '',
        minAmount: '',
        maxAmount: '',
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Get unique values for filters
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'delayed', label: 'Delayed' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const paymentStatusOptions = [
        { value: 'all', label: 'All Payment Status' },
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'partial', label: 'Partial' },
    ];

    const centerOptions = [
        { value: 'all', label: 'All Centers' },
        { value: 'Chennai Central Hub', label: 'Chennai Central Hub' },
        { value: 'Bangalore South Terminal', label: 'Bangalore South Terminal' },
        { value: 'Mumbai Port Facility', label: 'Mumbai Port Facility' },
        { value: 'Delhi North Warehouse', label: 'Delhi North Warehouse' },
        { value: 'Hyderabad Distribution Center', label: 'Hyderabad Distribution Center' },
        { value: 'Kolkata East Station', label: 'Kolkata East Station' },
        { value: 'Pune Cargo Terminal', label: 'Pune Cargo Terminal' },
        { value: 'Ahmedabad Logistics Hub', label: 'Ahmedabad Logistics Hub' },
    ];

    const driverOptions = [
        { value: 'all', label: 'All Drivers' },
        { value: 'Rajesh Kumar', label: 'Rajesh Kumar' },
        { value: 'Vikram Singh', label: 'Vikram Singh' },
        { value: 'Sanjay Verma', label: 'Sanjay Verma' },
        { value: 'Arun Mehta', label: 'Arun Mehta' },
        { value: 'Mohan Reddy', label: 'Mohan Reddy' },
    ];

    const vehicleOptions = [
        { value: 'all', label: 'All Vehicles' },
        { value: 'TN-01-AB-1234', label: 'TN-01-AB-1234 (Tata Ace)' },
        { value: 'MH-01-CD-5678', label: 'MH-01-CD-5678 (Eicher Truck)' },
        { value: 'TS-01-EF-9012', label: 'TS-01-EF-9012 (Ashok Leyland)' },
        { value: 'MH-12-GH-3456', label: 'MH-12-GH-3456 (Mahindra Bolero)' },
        { value: 'KA-01-IJ-7890', label: 'KA-01-IJ-7890 (Tata 407)' },
    ];

    useEffect(() => {
        dispatch(setPageTitle('Package Report Management'));
        // Initialize with dummy data
        setReportData(dummyReportData);
        setFilteredData(dummyReportData);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'in_transit':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'delayed':
                return 'bg-orange-100 text-orange-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'partial':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-red-100 text-red-800';
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
            Header: 'Package ID',
            accessor: 'packageId',
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Trip ID',
            accessor: 'tripId',
            Cell: ({ value }) => <span className="font-medium text-purple-600">{value}</span>,
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium text-sm">{row.original.fromCenter}</div>
                    <div className="text-xs text-gray-500">→ {row.original.toCenter}</div>
                </div>
            ),
        },
        {
            Header: 'Customers',
            accessor: 'customers',
            Cell: ({ row }) => (
                <div>
                    <div className="text-sm">
                        <span className="text-blue-600">{row.original.senderName}</span>
                        <span className="mx-1">→</span>
                        <span className="text-green-600">{row.original.receiverName}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.senderMobile} → {row.original.receiverMobile}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'totalAmount',
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-bold text-gray-800">₹{value}</div>
                    <div className={`text-xs px-1 rounded ${getPaymentStatusColor(row.original.paymentStatus)}`}>
                        {row.original.paymentStatus}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Vehicle & Driver',
            accessor: 'vehicleDriver',
            Cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium">{row.original.vehicleNumber}</div>
                    <div className="text-xs text-gray-500">{row.original.driverName}</div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            ),
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => moment(value).format('DD/MM/YYYY'),
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
                            onClick={() => handleViewTrip(data)}
                            className="flex items-center justify-center w-8 h-8 text-purple-600 hover:text-purple-800 transition-colors"
                            title="View Trip Details"
                        >
                            <IconTruck className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleExportReport(data)}
                            className="flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-800 transition-colors"
                            title="Export to Excel"
                        >
                            <IconDownload className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchLoading(true);

        let filtered = [...reportData];

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (report) =>
                    report.packageId.toLowerCase().includes(query) ||
                    report.tripId.toLowerCase().includes(query) ||
                    report.senderName.toLowerCase().includes(query) ||
                    report.receiverName.toLowerCase().includes(query) ||
                    report.senderMobile.includes(query) ||
                    report.receiverMobile.includes(query) ||
                    report.vehicleNumber.toLowerCase().includes(query) ||
                    report.driverName.toLowerCase().includes(query) ||
                    report.trackingNumber.toLowerCase().includes(query)
            );
        }

        // Apply status filter
        if (filters.selectedStatus && filters.selectedStatus.value !== 'all') {
            filtered = filtered.filter((report) => report.status === filters.selectedStatus.value);
        }

        // Apply payment status filter
        if (filters.selectedPaymentStatus && filters.selectedPaymentStatus.value !== 'all') {
            filtered = filtered.filter((report) => report.paymentStatus === filters.selectedPaymentStatus.value);
        }

        // Apply from center filter
        if (filters.selectedFromCenter && filters.selectedFromCenter.value !== 'all') {
            filtered = filtered.filter((report) => report.fromCenter === filters.selectedFromCenter.value);
        }

        // Apply to center filter
        if (filters.selectedToCenter && filters.selectedToCenter.value !== 'all') {
            filtered = filtered.filter((report) => report.toCenter === filters.selectedToCenter.value);
        }

        // Apply driver filter
        if (filters.selectedDriver && filters.selectedDriver.value !== 'all') {
            filtered = filtered.filter((report) => report.driverName === filters.selectedDriver.value);
        }

        // Apply vehicle filter
        if (filters.selectedVehicle && filters.selectedVehicle.value !== 'all') {
            filtered = filtered.filter((report) => report.vehicleNumber === filters.selectedVehicle.value.split(' ')[0]);
        }

        // Apply date filter
        if (filters.startDate && filters.toDate) {
            filtered = filtered.filter((report) => {
                const reportDate = moment(report.date);
                const start = moment(filters.startDate);
                const end = moment(filters.toDate);
                return reportDate.isBetween(start, end, null, '[]');
            });
        }

        // Apply amount filter
        if (filters.minAmount) {
            filtered = filtered.filter((report) => report.totalAmount >= parseFloat(filters.minAmount));
        }

        if (filters.maxAmount) {
            filtered = filtered.filter((report) => report.totalAmount <= parseFloat(filters.maxAmount));
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
            selectedPaymentStatus: null,
            selectedFromCenter: null,
            selectedToCenter: null,
            selectedDriver: null,
            selectedVehicle: null,
            startDate: '',
            toDate: '',
            minAmount: '',
            maxAmount: '',
        });
        setAppliedFilters(null);
        setShowAdvancedFilters(false);
        setSearchLoading(false);
        setCurrentPage(0);
        setFilteredData(dummyReportData);
    };

    const handleViewDetails = (report) => {
        setSelectedReport(report);
        setShowDetailsModal(true);
    };

    const handleViewTrip = (report) => {
        setSelectedReport(report);
        setShowTripModal(true);
    };

    const handleExportReport = (report) => {
        exportReportToExcel(report);
    };

    const exportReportToExcel = (report) => {
        const wb = XLSX.utils.book_new();

        // Main Report Sheet
        const reportInfo = [
            ['COMPREHENSIVE PACKAGE REPORT'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['PACKAGE INFORMATION'],
            [`Package ID: ${report.packageId}`],
            [`Trip ID: ${report.tripId}`],
            [`Tracking Number: ${report.trackingNumber}`],
            [`Status: ${report.status.toUpperCase()}`],
            [`Date: ${moment(report.date).format('DD/MM/YYYY')}`],
            [],
            ['ROUTE INFORMATION'],
            [`From Center: ${report.fromCenter}`],
            [`From Location: ${report.fromLocation}`],
            [`To Center: ${report.toCenter}`],
            [`To Location: ${report.toLocation}`],
            [`Distance: ${report.distance}`],
            [`Estimated Duration: ${report.estimatedDuration}`],
            [`Actual Duration: ${report.actualDuration || 'N/A'}`],
            [],
            ['CUSTOMER INFORMATION'],
            ['Sender Details', '', 'Receiver Details'],
            [`Name: ${report.senderName}`, '', `Name: ${report.receiverName}`],
            [`Mobile: ${report.senderMobile}`, '', `Mobile: ${report.receiverMobile}`],
            [],
            ['PAYMENT INFORMATION'],
            [`Total Amount: ₹${report.totalAmount}`],
            [`Payment By: ${report.paymentBy === 'sender' ? 'Sender' : 'Receiver'}`],
            [`Payment Status: ${report.paymentStatus.toUpperCase()}`],
            [`Payment Method: ${report.paymentMethod}`],
            [`Paid Amount: ₹${report.paidAmount}`],
            [`Due Amount: ₹${report.dueAmount}`],
            [`Payment Date: ${report.paymentDate ? moment(report.paymentDate).format('DD/MM/YYYY') : 'N/A'}`],
            [],
            ['VEHICLE INFORMATION'],
            [`Vehicle Number: ${report.vehicleNumber}`],
            [`Vehicle Type: ${report.vehicleType}`],
            [`Capacity: ${report.vehicleCapacity}`],
            [`Model: ${report.vehicleModel}`],
            [`Insurance Number: ${report.insuranceNumber}`],
            [`Insurance Expiry: ${moment(report.insuranceExpiry).format('DD/MM/YYYY')}`],
            [],
            ['DRIVER INFORMATION'],
            [`Driver Name: ${report.driverName}`],
            [`Driver Mobile: ${report.driverMobile}`],
            [`License Number: ${report.driverLicense}`],
            [`License Expiry: ${moment(report.driverExpiry).format('DD/MM/YYYY')}`],
            [],
            ['LOAD MAN INFORMATION'],
            [`Load Man Name: ${report.loadManName}`],
            [`Load Man Mobile: ${report.loadManMobile}`],
            [],
            ['TRIP DETAILS'],
            [`Trip Date: ${moment(report.tripDate).format('DD/MM/YYYY')}`],
            [`Departure Time: ${report.departureTime}`],
            [`Arrival Time: ${report.arrivalTime}`],
            [`Trip Status: ${report.tripStatus}`],
            [`Last Updated: ${moment(report.lastUpdated).format('DD/MM/YYYY HH:mm')}`],
            [],
            ['DELIVERY INFORMATION'],
            [`Delivery Time: ${report.deliveryTime || 'N/A'}`],
            [`Received By: ${report.receivedBy || 'N/A'}`],
            [`Signature: ${report.receiverSignature ? 'Yes' : 'No'}`],
            [`Delivery Proof: ${report.deliveryProof || 'N/A'}`],
            [],
            ['PACKAGE DETAILS'],
            ['Package Type', 'Quantity', 'Rate (₹)', 'Pickup (₹)', 'Drop (₹)', 'Total (₹)'],
        ];

        report.packageDetails.forEach((pkg) => {
            reportInfo.push([pkg.packageType, pkg.quantity, pkg.rate, pkg.pickupPrice, pkg.dropPrice, pkg.total]);
        });

        reportInfo.push(['', '', '', '', 'TOTAL', `₹${report.totalAmount}`]);
        reportInfo.push([]);
        reportInfo.push(['ADDITIONAL INFORMATION']);
        reportInfo.push([`Total Weight: ${report.totalWeight}`]);
        reportInfo.push([`Dimensions: ${report.dimensions}`]);
        reportInfo.push([`Package Value: ₹${report.packageValue}`]);
        reportInfo.push([`Notes: ${report.notes}`]);
        reportInfo.push([`Special Instructions: ${report.specialInstructions}`]);
        reportInfo.push([`Documents: ${report.documents.join(', ')}`]);

        const ws1 = XLSX.utils.aoa_to_sheet(reportInfo);
        ws1['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

        // Detailed Package Sheet
        const packageData = [
            ['DETAILED PACKAGE SPECIFICATIONS'],
            [],
            ['Item', 'Package Type', 'Quantity', 'Rate', 'Pickup Price', 'Drop Price', 'Subtotal'],
        ];

        report.packageDetails.forEach((pkg, index) => {
            packageData.push([
                index + 1,
                pkg.packageType,
                pkg.quantity,
                pkg.rate,
                pkg.pickupPrice,
                pkg.dropPrice,
                pkg.total,
            ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(packageData);
        ws2['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

        XLSX.utils.book_append_sheet(wb, ws1, 'Package Report');
        XLSX.utils.book_append_sheet(wb, ws2, 'Package Details');

        const fileName = `Package-Report-${report.packageId}-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onDownloadAllExcel = () => {
        const wb = XLSX.utils.book_new();

        const header = [
            ['COMPREHENSIVE PACKAGE REPORTS'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            [
                'Package ID',
                'Trip ID',
                'From Center',
                'To Center',
                'Sender',
                'Sender Mobile',
                'Receiver',
                'Receiver Mobile',
                'Total Amount',
                'Payment Status',
                'Paid Amount',
                'Due Amount',
                'Vehicle No',
                'Driver',
                'Load Man',
                'Status',
                'Trip Date',
                'Distance',
                'Package Weight',
                'Tracking No',
            ],
        ];

        const data = filteredData.map((report) => [
            report.packageId,
            report.tripId,
            report.fromCenter,
            report.toCenter,
            report.senderName,
            report.senderMobile,
            report.receiverName,
            report.receiverMobile,
            report.totalAmount,
            report.paymentStatus,
            report.paidAmount,
            report.dueAmount,
            report.vehicleNumber,
            report.driverName,
            report.loadManName,
            report.status,
            moment(report.tripDate).format('DD/MM/YYYY'),
            report.distance,
            report.totalWeight,
            report.trackingNumber,
            report.currentLocation,
        ]);

        const allRows = [...header, ...data];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        ws['!cols'] = [
            { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
            { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
            { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'All Packages');

        const fileName = `All-Package-Reports-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = () => {
        // This would typically call a PDF generation API
        
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
            totalAmount: filteredData.reduce((sum, report) => sum + report.totalAmount, 0),
            paidAmount: filteredData.reduce((sum, report) => sum + report.paidAmount, 0),
            dueAmount: filteredData.reduce((sum, report) => sum + report.dueAmount, 0),
            delivered: filteredData.filter((report) => report.status === 'delivered').length,
            inTransit: filteredData.filter((report) => report.status === 'in_transit').length,
        };
    };

    const stats = getStats();

    return (
        <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Package Report Management</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Comprehensive package tracking and reporting system</p>
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
                                    Search Packages
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by package ID, trip ID, customer name, mobile, vehicle, driver, or tracking number..."
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

                            {/* Payment Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                <Select
                                    options={paymentStatusOptions}
                                    value={filters.selectedPaymentStatus}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedPaymentStatus: selectedOption })}
                                    placeholder="Payment Status"
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

                                    {/* Amount Range */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Min amount"
                                            value={filters.minAmount}
                                            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Max amount"
                                            value={filters.maxAmount}
                                            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
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
                                        <IconPrinter className="mr-2 w-4 h-4" />
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
                            <p className="text-sm font-medium text-gray-600">Total Packages</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">{stats.total}</p>
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
                            <p className="text-xl font-bold text-gray-800 mt-1">₹{stats.totalAmount}</p>
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
                            <p className="text-xl font-bold text-gray-800 mt-1">₹{stats.paidAmount}</p>
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
                            <p className="text-sm font-medium text-gray-600">Due Amount</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">₹{stats.dueAmount}</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-full">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading States and Table */}
            {searchLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Searching Package Data</h3>
                        <p className="text-gray-500">Please wait while we fetch the package information based on your criteria</p>
                    </div>
                </div>
            ) : appliedFilters && filteredData.length > 0 ? (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Package Reports</h3>
                                    <p className="text-gray-600 text-sm">
                                        Showing {filteredData.length} records
                                        {filters.startDate && filters.toDate
                                            ? ` from ${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}`
                                            : ' (All Time)'}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Delivered: </span>
                                        <span className="font-semibold text-green-600">{stats.delivered}</span>
                                    </div>
                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">In Transit: </span>
                                        <span className="font-semibold text-blue-600">{stats.inTransit}</span>
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
                        <p className="text-gray-600 text-lg max-w-md mb-6">No package records match your current search criteria. Try adjusting your filters or search terms.</p>
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
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Package Report Dashboard</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">
                            {reportData.length > 0 ? `Ready to search through ${reportData.length} package records. Use the search filters above to generate detailed reports.` : 'Loading package data...'}
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

            {/* Package Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Package Details - ${selectedReport?.packageId || ''}`}
                setModel={() => setShowDetailsModal(false)}
                modelSize="max-w-6xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedReport && (
                    <div className="p-4 space-y-6">
                        {/* Header Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2">Package Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Package ID:</span>
                                            <span className="font-bold">{selectedReport.packageId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trip ID:</span>
                                            <span className="font-medium text-purple-600">{selectedReport.tripId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tracking No:</span>
                                            <span className="font-medium">{selectedReport.trackingNumber}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-green-800 mb-2">Status Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Package Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                                                {selectedReport.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trip Status:</span>
                                            <span className="font-medium">{selectedReport.tripStatus}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Date:</span>
                                            <span className="font-medium">{moment(selectedReport.date).format('DD/MM/YYYY')}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-orange-800 mb-2">Delivery Information</h4>
                                    <div className="space-y-1 text-sm">
                                       
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Last Updated:</span>
                                            <span className="font-medium">{moment(selectedReport.lastUpdated).format('DD/MM/YYYY HH:mm')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Received By:</span>
                                            <span className="font-medium">{selectedReport.receivedBy || 'Not delivered yet'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconMapPin className="w-4 h-4 mr-2 text-blue-500" />
                                    Route Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                            <div className="text-xs text-blue-600 mb-1">From Center</div>
                                            <div className="font-medium">{selectedReport.fromCenter}</div>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded border border-green-100">
                                            <div className="text-xs text-green-600 mb-1">To Center</div>
                                            <div className="font-medium">{selectedReport.toCenter}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Locations</div>
                                        <div className="text-sm">
                                            <div className="flex items-center mb-1">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                <span>{selectedReport.fromLocation}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                <span>{selectedReport.toLocation}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Distance</div>
                                            <div className="font-medium">{selectedReport.distance}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Est. Duration</div>
                                            <div className="font-medium">{selectedReport.estimatedDuration}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconTruck className="w-4 h-4 mr-2 text-purple-500" />
                                    Trip Details
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Trip Date</div>
                                            <div className="font-medium">{moment(selectedReport.tripDate).format('DD/MM/YYYY')}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Trip Status</div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium inline-block ${getStatusColor(selectedReport.tripStatus)}`}>
                                                {selectedReport.tripStatus.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                                            <div className="text-xs text-yellow-600 mb-1">Departure Time</div>
                                            <div className="font-medium">{selectedReport.departureTime}</div>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded border border-green-100">
                                            <div className="text-xs text-green-600 mb-1">Arrival Time</div>
                                            <div className="font-medium">{selectedReport.arrivalTime}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Actual Duration</div>
                                        <div className="font-medium">{selectedReport.actualDuration || 'In progress'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-blue-500" />
                                    Customer Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                        <div className="text-xs text-blue-600 mb-1">Sender Details</div>
                                        <div className="font-medium">{selectedReport.senderName}</div>
                                        <div className="text-sm text-gray-600">{selectedReport.senderMobile}</div>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded border border-green-100">
                                        <div className="text-xs text-green-600 mb-1">Receiver Details</div>
                                        <div className="font-medium">{selectedReport.receiverName}</div>
                                        <div className="text-sm text-gray-600">{selectedReport.receiverMobile}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconMoney className="w-4 h-4 mr-2 text-green-500" />
                                    Payment Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Total Amount</div>
                                            <div className="text-lg font-bold text-gray-800">₹{selectedReport.totalAmount}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Payment Status</div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedReport.paymentStatus)}`}>
                                                {selectedReport.paymentStatus.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Payment By</div>
                                            <div className="font-medium">{selectedReport.paymentBy === 'sender' ? 'Sender' : 'Receiver'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Payment Method</div>
                                            <div className="font-medium">{selectedReport.paymentMethod.replace('_', ' ').toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-green-50 p-2 rounded border border-green-100">
                                            <div className="text-xs text-green-600 mb-1">Paid Amount</div>
                                            <div className="font-bold text-green-700">₹{selectedReport.paidAmount}</div>
                                        </div>
                                        <div className="bg-red-50 p-2 rounded border border-red-100">
                                            <div className="text-xs text-red-600 mb-1">Due Amount</div>
                                            <div className="font-bold text-red-700">₹{selectedReport.dueAmount}</div>
                                        </div>
                                    </div>
                                    {selectedReport.paymentDate && (
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Payment Date</div>
                                            <div className="font-medium">{moment(selectedReport.paymentDate).format('DD/MM/YYYY')}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle, Driver & Load Man Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Vehicle Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Vehicle Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Vehicle Number</div>
                                        <div className="font-bold text-lg text-purple-700">{selectedReport.vehicleNumber}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Driver Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Driver Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Driver Name</div>
                                        <div className="font-bold text-lg text-blue-700">{selectedReport.driverName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Driver Mobile</div>
                                        <div className="font-medium">{selectedReport.driverMobile}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">License Number</div>
                                        <div className="font-medium">{selectedReport.driverLicense}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">License Expiry</div>
                                        <div className="font-medium">{moment(selectedReport.driverExpiry).format('DD/MM/YYYY')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Load Man Details */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">Load Man Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Load Man Name</div>
                                        <div className="font-bold text-lg text-green-700">{selectedReport.loadManName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Load Man Mobile</div>
                                        <div className="font-medium">{selectedReport.loadManMobile}</div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-xs text-gray-600 mb-1">Package Specifications</div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span>Total Weight:</span>
                                                <span className="font-medium">{selectedReport.totalWeight}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Dimensions:</span>
                                                <span className="font-medium">{selectedReport.dimensions}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Package Value:</span>
                                                <span className="font-medium">₹{selectedReport.packageValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Package Details Table */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Package Items</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Type</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate (₹)</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup (₹)</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop (₹)</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedReport.packageDetails.map((pkg, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{pkg.packageType}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{pkg.quantity}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{pkg.rate}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{pkg.pickupPrice}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{pkg.dropPrice}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">₹{pkg.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="5" className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                                                Total Amount:
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-lg font-bold text-blue-700">₹{selectedReport.totalAmount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Additional Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Notes</div>
                                    <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100">{selectedReport.notes}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Special Instructions</div>
                                    <div className="text-sm bg-blue-50 p-2 rounded border border-blue-100">{selectedReport.specialInstructions}</div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-xs text-gray-600 mb-1">Documents</div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedReport.documents.map((doc, index) => (
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

            {/* Trip Details Modal */}
            <ModelViewBox
                modal={showTripModal}
                modelHeader={`Trip Details - ${selectedReport?.tripId || ''}`}
                setModel={() => setShowTripModal(false)}
                modelSize="max-w-4xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedReport && (
                    <div className="p-4 space-y-4">
                        {/* Trip Header */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div>
                                    <div className="text-lg font-bold text-gray-800">{selectedReport.tripId}</div>
                                    <div className="text-sm text-gray-600">
                                        {selectedReport.fromCenter} → {selectedReport.toCenter}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.tripStatus)}`}>
                                        {selectedReport.tripStatus.toUpperCase()}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {selectedReport.distance}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Trip Timeline */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-4">Trip Timeline</h4>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                                
                                {/* Timeline items */}
                                <div className="space-y-6 relative">
                                    {/* Departure */}
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Departure</div>
                                            <div className="text-sm text-gray-600">{selectedReport.departureTime}</div>
                                            <div className="text-xs text-gray-500 mt-1">{selectedReport.fromCenter}</div>
                                        </div>
                                    </div>

                                    {/* Arrival */}
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${selectedReport.tripStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center z-10`}>
                                            {selectedReport.tripStatus === 'completed' ? (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">Arrival</div>
                                            <div className="text-sm text-gray-600">{selectedReport.arrivalTime}</div>
                                            <div className="text-xs text-gray-500 mt-1">{selectedReport.toCenter}</div>
                                            {selectedReport.tripStatus === 'completed' && selectedReport.deliveryTime && (
                                                <div className="text-xs text-green-600 mt-1">
                                                    Delivered at: {selectedReport.deliveryTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Crew Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Driver Info */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-blue-500" />
                                    Driver Information
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Name</div>
                                        <div className="font-medium text-lg">{selectedReport.driverName}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">Mobile</div>
                                            <div className="font-medium">{selectedReport.driverMobile}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600 mb-1">License</div>
                                            <div className="font-medium">{selectedReport.driverLicense}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Load Man Info */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-green-500" />
                                    Load Man Information
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Name</div>
                                        <div className="font-medium text-lg">{selectedReport.loadManName}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-1">Mobile</div>
                                        <div className="font-medium">{selectedReport.loadManMobile}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Information */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <IconTruck className="w-4 h-4 mr-2 text-purple-500" />
                                Vehicle Information
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Vehicle No</div>
                                    <div className="font-bold text-lg text-purple-700">{selectedReport.vehicleNumber}</div>
                                </div>
                            </div>
                        </div>

                        {/* Package Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Trip Summary</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                    <div className="text-xs text-blue-600 mb-1">Packages</div>
                                    <div className="text-lg font-bold">{selectedReport.packageDetails.length}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded border border-green-100">
                                    <div className="text-xs text-green-600 mb-1">Total Weight</div>
                                    <div className="text-lg font-bold">{selectedReport.totalWeight}</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                                    <div className="text-xs text-yellow-600 mb-1">Total Value</div>
                                    <div className="text-lg font-bold">₹{selectedReport.packageValue}</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded border border-purple-100">
                                    <div className="text-xs text-purple-600 mb-1">Shipping Cost</div>
                                    <div className="text-lg font-bold">₹{selectedReport.totalAmount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default PackageReport;