import { useState, useEffect } from 'react';
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
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconEye from '../../components/Icon/IconEye';
import IconX from '../../components/Icon/IconX';
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';

const PackageIntake = () => {
    const dispatch = useDispatch();

    // Dummy data for company centers
    const dummyCompanyCenters = [
        { id: 1, name: 'Chennai Central Hub' },
        { id: 2, name: 'Bangalore South Terminal' },
        { id: 3, name: 'Mumbai Port Facility' },
        { id: 4, name: 'Delhi North Warehouse' },
        { id: 5, name: 'Hyderabad Distribution Center' },
        { id: 6, name: 'Kolkata East Station' },
        { id: 7, name: 'Pune Cargo Terminal' },
        { id: 8, name: 'Ahmedabad Logistics Hub' },
    ];

    // Dummy data for customer locations (different from centers)
    const dummyCustomerLocations = [
        { id: 1, name: '123 Main Street, Chennai' },
        { id: 2, name: '456 Park Avenue, Bangalore' },
        { id: 3, name: '789 Marine Drive, Mumbai' },
        { id: 4, name: '101 Connaught Place, Delhi' },
        { id: 5, name: '234 Banjara Hills, Hyderabad' },
        { id: 6, name: '567 Park Street, Kolkata' },
        { id: 7, name: '890 FC Road, Pune' },
        { id: 8, name: '123 Law Garden, Ahmedabad' },
    ];

    // Dummy data for customers
    const dummyCustomers = [
        { id: 1, name: 'John Doe', mobileNo: '9876543210' },
        { id: 2, name: 'Jane Smith', mobileNo: '9876543210' },
        { id: 3, name: 'Robert Johnson', mobileNo: '8765432109' },
        { id: 4, name: 'Sarah Williams', mobileNo: '8765432109' },
        { id: 5, name: 'Mike Brown', mobileNo: '7654321098' },
        { id: 6, name: 'Emily Davis', mobileNo: '7654321098' },
        { id: 7, name: 'David Wilson', mobileNo: '6543210987' },
        { id: 8, name: 'Lisa Miller', mobileNo: '6543210987' },
    ];

    // Dummy data for package types
    const dummyPackageTypes = [
        { id: 1, packageName: 'Big Bag', pickupPrice: 50, dropPrice: 70 },
        { id: 2, packageName: 'Box', pickupPrice: 30, dropPrice: 45 },
        { id: 3, packageName: 'Small Package', pickupPrice: 20, dropPrice: 35 },
        { id: 4, packageName: 'Medium Package', pickupPrice: 40, dropPrice: 60 },
        { id: 5, packageName: 'Large Package', pickupPrice: 60, dropPrice: 85 },
        { id: 6, packageName: 'XL Package', pickupPrice: 80, dropPrice: 110 },
        { id: 7, packageName: 'Document', pickupPrice: 15, dropPrice: 25 },
        { id: 8, packageName: 'Parcel', pickupPrice: 25, dropPrice: 40 },
    ];

    // Dummy data for package intake records with delivery status
    const dummyPackageIntakes = [
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
            paidAmount: 275,
            status: 'pending',
            deliveryStatus: 'not_started',
            date: '2024-01-15',
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
            status: 'completed',
            deliveryStatus: 'delivered',
            date: '2024-01-16',
        },
    ];

    // States
    const [loading, setLoading] = useState(false);
    const [customerModal, setCustomerModal] = useState(false);
    const [locationModal, setLocationModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedViewPackage, setSelectedViewPackage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [packageList, setPackageList] = useState(dummyPackageIntakes);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [fromCenter, setFromCenter] = useState(null);
    const [toCenter, setToCenter] = useState(null);
    const [fromLocation, setFromLocation] = useState(null);
    const [toLocation, setToLocation] = useState(null);
    const [fromMobile, setFromMobile] = useState('');
    const [customerFrom, setCustomerFrom] = useState(null);
    const [fromNameOptions, setFromNameOptions] = useState([]);
    const [toMobile, setToMobile] = useState('');
    const [customerTo, setCustomerTo] = useState(null);
    const [toNameOptions, setToNameOptions] = useState([]);
    const [packageDetails, setPackageDetails] = useState([
        { id: 1, packageType: null, quantity: 1, rate: '', pickupPrice: 0, dropPrice: 0 },
    ]);
    const [paymentBy, setPaymentBy] = useState('from');
    const [paidAmount, setPaidAmount] = useState('');
    const [errors, setErrors] = useState({});
    const [newCustomer, setNewCustomer] = useState({ name: '', mobileNo: '' });
    const [newLocation, setNewLocation] = useState({ name: '' });
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [customerField, setCustomerField] = useState(''); // Track which field opened modal
    const [locationField, setLocationField] = useState(''); // Track which location field opened modal

    // Calculate totals
    const calculatePackageTotal = (packageItem) => {
        const qty = parseFloat(packageItem.quantity) || 0;
        const rateValue = parseFloat(packageItem.rate) || 0;
        const pickupPrice = parseFloat(packageItem.pickupPrice) || 0;
        const dropPrice = parseFloat(packageItem.dropPrice) || 0;
        
        return qty * rateValue + ((pickupPrice + dropPrice) * qty);
    };

    const calculateTotalAmount = () => {
        return packageDetails.reduce((total, pkg) => {
            return total + calculatePackageTotal(pkg);
        }, 0);
    };

    const totalAmount = calculateTotalAmount();

    useEffect(() => {
        dispatch(setPageTitle('Package Intake Management'));
    }, []);

    // Fetch customers by mobile number for From field
    const fetchFromCustomers = () => {
        if (!fromMobile || fromMobile.length !== 10) {
            setFromNameOptions([]);
            setCustomerFrom(null);
            return;
        }

        const filteredCustomers = dummyCustomers.filter((customer) => customer.mobileNo === fromMobile);

        const options = filteredCustomers.map((customer) => ({
            value: customer.id,
            label: `${customer.name} (${customer.mobileNo})`,
            data: customer,
        }));

        setFromNameOptions(options);
    };

    // Fetch customers by mobile number for To field
    const fetchToCustomers = () => {
        if (!toMobile || toMobile.length !== 10) {
            setToNameOptions([]);
            setCustomerTo(null);
            return;
        }

        const filteredCustomers = dummyCustomers.filter((customer) => customer.mobileNo === toMobile);

        const options = filteredCustomers.map((customer) => ({
            value: customer.id,
            label: `${customer.name} (${customer.mobileNo})`,
            data: customer,
        }));

        setToNameOptions(options);
    };

    // Handle mobile number changes
    useEffect(() => {
        fetchFromCustomers();
    }, [fromMobile]);

    useEffect(() => {
        fetchToCustomers();
    }, [toMobile]);

    // Handle customer selection
    const handleFromCustomerChange = (selectedOption) => {
        setCustomerFrom(selectedOption?.data || null);
    };

    const handleToCustomerChange = (selectedOption) => {
        setCustomerTo(selectedOption?.data || null);
    };

    // Open customer modal for From field
    const openFromCustomerModal = () => {
        if (fromMobile.length !== 10) {
            showMessage('error', 'Please enter a valid 10-digit mobile number first');
            return;
        }
        setCustomerField('from');
        setNewCustomer({ name: '', mobileNo: fromMobile });
        setCustomerModal(true);
    };

    // Open customer modal for To field
    const openToCustomerModal = () => {
        if (toMobile.length !== 10) {
            showMessage('error', 'Please enter a valid 10-digit mobile number first');
            return;
        }
        setCustomerField('to');
        setNewCustomer({ name: '', mobileNo: toMobile });
        setCustomerModal(true);
    };

    // Handle package detail changes
    const handlePackageDetailChange = (index, field, value) => {
        const updatedDetails = [...packageDetails];
        
        if (field === 'packageType') {
            const selectedPackage = dummyPackageTypes.find(pkg => pkg.id === value);
            if (selectedPackage) {
                updatedDetails[index] = {
                    ...updatedDetails[index],
                    packageType: selectedPackage,
                    pickupPrice: selectedPackage.pickupPrice,
                    dropPrice: selectedPackage.dropPrice,
                };
            }
        } else {
            updatedDetails[index] = {
                ...updatedDetails[index],
                [field]: field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value,
            };
        }
        
        setPackageDetails(updatedDetails);
    };

    // Add new package detail row
    const addPackageDetail = () => {
        const newId = packageDetails.length > 0 ? Math.max(...packageDetails.map(p => p.id)) + 1 : 1;
        setPackageDetails([
            ...packageDetails,
            { id: newId, packageType: null, quantity: 1, rate: '', pickupPrice: 0, dropPrice: 0 },
        ]);
    };

    // Remove package detail row
    const removePackageDetail = (index) => {
        if (packageDetails.length > 1) {
            const updatedDetails = packageDetails.filter((_, i) => i !== index);
            setPackageDetails(updatedDetails);
        }
    };

    // Get location options with "Add New" option that's always visible
    const getLocationOptions = () => {
        const options = dummyCustomerLocations.map((loc) => ({
            value: loc.id,
            label: loc.name,
            data: loc,
        }));

        // Add "Add New Location" option at the end
        options.push({
            value: 'new',
            label: '+ Add New Location',
            data: { id: 'new', name: 'New Location' },
        });

        return options;
    };

    // Custom filter for location options to always show "Add New"
    const locationFilterOption = (option, inputValue) => {
        if (option.value === 'new') {
            return true; // Always show "Add New" option
        }
        return option.label.toLowerCase().includes(inputValue.toLowerCase());
    };

    // Handle location change
    const handleLocationChange = (selectedOption, field) => {
        if (selectedOption?.value === 'new') {
            setLocationField(field);
            setLocationModal(true);
        } else {
            if (field === 'from') {
                setFromLocation(selectedOption?.data || null);
            } else if (field === 'to') {
                setToLocation(selectedOption?.data || null);
            }
        }
    };

    // Get center options
    const getCenterOptions = () => {
        return dummyCompanyCenters.map((center) => ({
            value: center.id,
            label: center.name,
            data: center,
        }));
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!fromCenter) newErrors.fromCenter = 'From center is required';
        if (!toCenter) newErrors.toCenter = 'To center is required';
        if (!fromLocation) newErrors.fromLocation = 'From location is required';
        if (!toLocation) newErrors.toLocation = 'To location is required';
        if (!fromMobile || fromMobile.length !== 10) newErrors.fromMobile = 'Valid sender mobile number (10 digits) is required';
        if (!customerFrom) newErrors.customerFrom = 'Please select a sender';
        if (!toMobile || toMobile.length !== 10) newErrors.toMobile = 'Valid receiver mobile number (10 digits) is required';
        if (!customerTo) newErrors.customerTo = 'Please select a receiver';
        
        // Validate package details
        packageDetails.forEach((pkg, index) => {
            if (!pkg.packageType) newErrors[`packageType_${index}`] = `Package type is required for item ${index + 1}`;
            if (!pkg.quantity || pkg.quantity <= 0) newErrors[`quantity_${index}`] = `Valid quantity is required for item ${index + 1}`;
            if (!pkg.rate || parseFloat(pkg.rate) <= 0) newErrors[`rate_${index}`] = `Valid rate is required for item ${index + 1}`;
        });

        if (!paymentBy) newErrors.paymentBy = 'Payment by is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('error', 'Please fix all errors before submitting');
            return;
        }

        const newPackage = {
            id: isEdit ? editId : packageList.length + 1,
            fromCenter: fromCenter.name,
            toCenter: toCenter.name,
            fromLocation: fromLocation.name,
            toLocation: toLocation.name,
            fromMobile: customerFrom.mobileNo,
            fromName: customerFrom.name,
            toMobile: customerTo.mobileNo,
            toName: customerTo.name,
            packageDetails: packageDetails.map(pkg => ({
                packageType: pkg.packageType.packageName,
                quantity: pkg.quantity,
                rate: parseFloat(pkg.rate),
                pickupPrice: pkg.pickupPrice,
                dropPrice: pkg.dropPrice,
                total: calculatePackageTotal(pkg),
            })),
            totalAmount: totalAmount,
            paymentBy: paymentBy,
            paidAmount: paymentBy === 'from' ? parseFloat(paidAmount || 0) : 0,
            status: paymentBy === 'from' && parseFloat(paidAmount || 0) >= totalAmount ? 'completed' : 'pending',
            deliveryStatus: 'not_started',
            date: new Date().toISOString().split('T')[0],
        };

        if (isEdit) {
            const updatedList = packageList.map((pkg) => (pkg.id === editId ? newPackage : pkg));
            setPackageList(updatedList);
            showMessage('success', 'Package updated successfully');
            setIsEdit(false);
            setEditId(null);
        } else {
            setPackageList([newPackage, ...packageList]);
            showMessage('success', 'Package intake recorded successfully');
        }

        resetForm();
        setShowForm(false);
    };

    // Edit package
    const handleEdit = (pkg) => {
        if (pkg.deliveryStatus !== 'not_started') {
            showMessage('error', 'Cannot edit package that is already in delivery process');
            return;
        }

        setIsEdit(true);
        setEditId(pkg.id);
        setShowForm(true);

        // Pre-fill form
        setFromCenter({ name: pkg.fromCenter });
        setToCenter({ name: pkg.toCenter });
        setFromLocation({ name: pkg.fromLocation });
        setToLocation({ name: pkg.toLocation });
        setFromMobile(pkg.fromMobile);
        setToMobile(pkg.toMobile);
        setPaymentBy(pkg.paymentBy);
        setPaidAmount(pkg.paidAmount.toString());

        // Set customer objects
        const fromCustomer = { name: pkg.fromName, mobileNo: pkg.fromMobile };
        const toCustomer = { name: pkg.toName, mobileNo: pkg.toMobile };
        setCustomerFrom(fromCustomer);
        setCustomerTo(toCustomer);

        // Set package details
        const details = pkg.packageDetails.map((detail, index) => ({
            id: index + 1,
            packageType: dummyPackageTypes.find(p => p.packageName === detail.packageType),
            quantity: detail.quantity,
            rate: detail.rate.toString(),
            pickupPrice: detail.pickupPrice,
            dropPrice: detail.dropPrice,
        }));
        setPackageDetails(details);

        // Trigger dropdown options
        fetchFromCustomers();
        fetchToCustomers();
    };

    // Delete package
    const handleDelete = (pkg) => {
        if (pkg.deliveryStatus !== 'not_started') {
            showMessage('error', 'Cannot delete package that is already in delivery process');
            return;
        }

        showMessage(
            'warning',
            `Are you sure you want to delete package #${pkg.id}?`,
            () => {
                const updatedList = packageList.filter((item) => item.id !== pkg.id);
                setPackageList(updatedList);
                showMessage('success', 'Package deleted successfully');
            },
            'Yes, delete it',
        );
    };

    // View package details
    const handleView = (pkg) => {
        setSelectedViewPackage(pkg);
        setViewModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFromCenter(null);
        setToCenter(null);
        setFromLocation(null);
        setToLocation(null);
        setFromMobile('');
        setCustomerFrom(null);
        setFromNameOptions([]);
        setToMobile('');
        setCustomerTo(null);
        setToNameOptions([]);
        setPackageDetails([{ id: 1, packageType: null, quantity: 1, rate: '', pickupPrice: 0, dropPrice: 0 }]);
        setPaymentBy('from');
        setPaidAmount('');
        setErrors({});
        setIsEdit(false);
        setEditId(null);
        setCustomerField('');
        setLocationField('');
        setNewCustomer({ name: '', mobileNo: '' });
        setNewLocation({ name: '' });
    };

    // Handle add customer
    const handleAddCustomer = () => {
        if (!newCustomer.name) {
            showMessage('error', 'Name is required');
            return;
        }

        if (newCustomer.mobileNo.length !== 10) {
            showMessage('error', 'Mobile number must be 10 digits');
            return;
        }

        const newCustomerData = {
            id: dummyCustomers.length + 1,
            ...newCustomer,
        };

        dummyCustomers.push(newCustomerData);
        showMessage('success', 'Customer added successfully');
        setCustomerModal(false);

        // Update the appropriate customer field
        if (customerField === 'from') {
            setCustomerFrom(newCustomerData);
            fetchFromCustomers();
        } else if (customerField === 'to') {
            setCustomerTo(newCustomerData);
            fetchToCustomers();
        }
        
        // Clear the customer form
        setNewCustomer({ name: '', mobileNo: '' });
        setCustomerField('');
    };

    // Close customer modal and clear data
    const closeCustomerModal = () => {
        setCustomerModal(false);
        setNewCustomer({ name: '', mobileNo: '' });
        setCustomerField('');
    };

    // Handle add location
    const handleAddLocation = () => {
        if (!newLocation.name) {
            showMessage('error', 'Location name is required');
            return;
        }

        const newLocationData = {
            id: dummyCustomerLocations.length + 1,
            ...newLocation,
        };

        dummyCustomerLocations.push(newLocationData);
        showMessage('success', 'Location added successfully');
        setLocationModal(false);

        // Set the new location in the appropriate field
        if (locationField === 'from') {
            setFromLocation(newLocationData);
        } else if (locationField === 'to') {
            setToLocation(newLocationData);
        }

        // Clear the location form
        setNewLocation({ name: '' });
        setLocationField('');
    };

    // Close location modal and clear data
    const closeLocationModal = () => {
        setLocationModal(false);
        setNewLocation({ name: '' });
        setLocationField('');
    };

    // Table configuration
    const columns = [
        {
            Header: '#',
            accessor: 'id',
            Cell: (row) => (
                <div className="font-medium text-gray-600 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full">
                        {row.row.index + 1}
                    </span>
                </div>
            ),
            width: 80,
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <IconMapPin className="w-3 h-3 mr-1 text-blue-500" />
                        <span className="text-gray-700">{row.original.fromCenter}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                        <span className="text-gray-700">{row.original.toCenter}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Customer Details',
            accessor: 'customerDetails',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                        <IconUser className="w-3 h-3 mr-1" />
                        <span>
                            {row.original.fromName} → {row.original.toName}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.fromMobile} → {row.original.toMobile}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Packages',
            accessor: 'packages',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    {row.original.packageDetails.map((pkg, index) => (
                        <div key={index} className="text-sm">
                            <span className="font-medium">{pkg.packageType}</span>
                            <span className="text-gray-600 ml-2">
                                (Qty: {pkg.quantity} × ₹{pkg.rate})
                            </span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'totalAmount',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">₹{row.original.totalAmount}</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${row.original.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {row.original.status === 'completed' ? 'Paid' : 'Pending'}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'deliveryStatus',
            Cell: ({ value }) => {
                const statusConfig = {
                    not_started: { color: 'bg-gray-100 text-gray-800', label: 'Not Started' },
                    in_transit: { color: 'bg-blue-100 text-blue-800', label: 'In Transit' },
                    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
                };
                const config = statusConfig[value] || statusConfig.not_started;

                return <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-1">
                    <Tippy content="View Details">
                        <button onClick={() => handleView(row.original)} className="btn btn-outline-primary btn-sm p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">
                            <IconEye className="w-4 h-4" />
                        </button>
                    </Tippy>
                    {row.original.deliveryStatus === 'not_started' && (
                        <>
                            <Tippy content="Edit">
                                <button onClick={() => handleEdit(row.original)} className="btn btn-outline-success btn-sm p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors">
                                    <IconPencil className="w-4 h-4" />
                                </button>
                            </Tippy>
                            <Tippy content="Delete">
                                <button onClick={() => handleDelete(row.original)} className="btn btn-outline-danger btn-sm p-1.5 rounded-lg hover:bg-danger hover:text-white transition-colors">
                                    <IconTrashLines className="w-4 h-4" />
                                </button>
                            </Tippy>
                        </>
                    )}
                </div>
            ),
            width: 150,
        },
    ];

    // Pagination
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        let filteredData = packageList;

        if (searchTerm) {
            filteredData = filteredData.filter(
                (pkg) =>
                    pkg.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.toName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.fromMobile.includes(searchTerm) ||
                    pkg.toMobile.includes(searchTerm) ||
                    pkg.fromCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.toCenter.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        let filteredData = packageList;

        if (searchTerm) {
            filteredData = filteredData.filter(
                (pkg) =>
                    pkg.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.toName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.fromMobile.includes(searchTerm) ||
                    pkg.toMobile.includes(searchTerm) ||
                    pkg.fromCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.toCenter.toLowerCase().includes(searchTerm.toLowerCase()),
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
        total: packageList.length,
        pending: packageList.filter((p) => p.status === 'pending').length,
        completed: packageList.filter((p) => p.status === 'completed').length,
        totalAmount: packageList.reduce((sum, p) => sum + p.totalAmount, 0),
    };

    return (
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Package Intake</h1>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Manage package intake, track deliveries, and handle payments</p>
                    </div>
                </div>

                {/* Stats Cards - Compact */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3 sm:mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-full">
                                <IconPackage className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Pending</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.pending}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-full">
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Completed</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.completed}</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total Amt</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">₹{stats.totalAmount}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>

                {/* Add Package Toggle Button */}
                <div className="flex justify-center mb-3 sm:mb-4">
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className={`btn ${showForm ? 'btn-outline-primary' : 'btn-primary'} shadow-md hover:shadow-lg transition-all duration-300 flex items-center text-xs sm:text-sm py-2 px-4`}
                    >
                        {showForm ? (
                            <>
                                <IconX className="w-3 h-3 mr-1" />
                                Close Form
                                <IconChevronUp className="w-3 h-3 ml-1" />
                            </>
                        ) : (
                            <>
                                <IconPlus className="w-3 h-3 mr-1" />
                                Add New Package
                                <IconChevronDown className="w-3 h-3 ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Form - Collapsible */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-4 sm:mb-6 animate-fadeIn">
                    <div className="p-3 sm:p-4 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
                            <IconPackage className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                            {isEdit ? 'Edit Package' : 'New Package Intake'}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-3 sm:p-4">
                        <div className="space-y-4 sm:space-y-5">
                            {/* Company Centers Section - Compact */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconMapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary" />
                                    Company Centers *
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {/* From Center */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From Center *</label>
                                        <Select
                                            options={getCenterOptions()}
                                            value={
                                                fromCenter
                                                    ? {
                                                          value: fromCenter.id,
                                                          label: fromCenter.name,
                                                          data: fromCenter,
                                                      }
                                                    : null
                                            }
                                            onChange={(selectedOption) => setFromCenter(selectedOption?.data || null)}
                                            placeholder="Select from center"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.fromCenter ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                        />
                                        {errors.fromCenter && <p className="mt-1 text-xs text-red-600">{errors.fromCenter}</p>}
                                    </div>

                                    {/* To Center */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To Center *</label>
                                        <Select
                                            options={getCenterOptions()}
                                            value={
                                                toCenter
                                                    ? {
                                                          value: toCenter.id,
                                                          label: toCenter.name,
                                                          data: toCenter,
                                                      }
                                                    : null
                                            }
                                            onChange={(selectedOption) => setToCenter(selectedOption?.data || null)}
                                            placeholder="Select to center"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.toCenter ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                        />
                                        {errors.toCenter && <p className="mt-1 text-xs text-red-600">{errors.toCenter}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Locations Section - Compact */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconMapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-orange-500" />
                                    Customer Locations *
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {/* From Location */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">From Location *</label>
                                        <Select
                                            options={getLocationOptions()}
                                            filterOption={locationFilterOption}
                                            value={
                                                fromLocation
                                                    ? {
                                                          value: fromLocation.id,
                                                          label: fromLocation.name,
                                                          data: fromLocation,
                                                      }
                                                    : null
                                            }
                                            onChange={(selectedOption) => handleLocationChange(selectedOption, 'from')}
                                            placeholder="Select or add location"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.fromLocation ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                        />
                                        {errors.fromLocation && <p className="mt-1 text-xs text-red-600">{errors.fromLocation}</p>}
                                    </div>

                                    {/* To Location */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To Location *</label>
                                        <Select
                                            options={getLocationOptions()}
                                            filterOption={locationFilterOption}
                                            value={
                                                toLocation
                                                    ? {
                                                          value: toLocation.id,
                                                          label: toLocation.name,
                                                          data: toLocation,
                                                      }
                                                    : null
                                            }
                                            onChange={(selectedOption) => handleLocationChange(selectedOption, 'to')}
                                            placeholder="Select or add location"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.toLocation ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                        />
                                        {errors.toLocation && <p className="mt-1 text-xs text-red-600">{errors.toLocation}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details Section - Compact with Add Customer Button */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-blue-500" />
                                    Customer Details *
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                    {/* From Customer */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sender Mobile *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={fromMobile}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setFromMobile(value);
                                                    if (value.length !== 10) {
                                                        setCustomerFrom(null);
                                                        setFromNameOptions([]);
                                                    }
                                                }}
                                                className={`form-input w-full ${errors.fromMobile ? 'border-red-500' : ''}`}
                                                placeholder="10-digit mobile"
                                                maxLength="10"
                                            />
                                            {fromMobile.length === 10 && (
                                                <button
                                                    type="button"
                                                    onClick={openFromCustomerModal}
                                                    className="btn btn-outline-primary btn-sm whitespace-nowrap flex items-center"
                                                >
                                                    <IconPlus className="w-3 h-3 mr-1" />
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                        {errors.fromMobile && <p className="mt-1 text-xs text-red-600">{errors.fromMobile}</p>}

                                        {/* Customer Name Dropdown */}
                                        {fromMobile.length === 10 && fromNameOptions.length > 0 && (
                                            <div className="mt-2">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Sender *</label>
                                                <Select
                                                    options={fromNameOptions}
                                                    onChange={handleFromCustomerChange}
                                                    placeholder="Select sender"
                                                    className="react-select"
                                                    classNamePrefix="select"
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor: errors.customerFrom ? '#ef4444' : '#d1d5db',
                                                            minHeight: '36px',
                                                            fontSize: '14px',
                                                        }),
                                                    }}
                                                />
                                                {errors.customerFrom && <p className="mt-1 text-xs text-red-600">{errors.customerFrom}</p>}
                                            </div>
                                        )}

                                        {customerFrom && customerFrom.id !== 'new' && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                                    <IconUser className="w-3 h-3 mr-1 text-blue-500" />
                                                    <span className="font-medium">{customerFrom.name}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* To Customer */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Receiver Mobile *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={toMobile}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    setToMobile(value);
                                                    if (value.length !== 10) {
                                                        setCustomerTo(null);
                                                        setToNameOptions([]);
                                                    }
                                                }}
                                                className={`form-input w-full ${errors.toMobile ? 'border-red-500' : ''}`}
                                                placeholder="10-digit mobile"
                                                maxLength="10"
                                            />
                                            {toMobile.length === 10 && (
                                                <button
                                                    type="button"
                                                    onClick={openToCustomerModal}
                                                    className="btn btn-outline-primary btn-sm whitespace-nowrap flex items-center"
                                                >
                                                    <IconPlus className="w-3 h-3 mr-1" />
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                        {errors.toMobile && <p className="mt-1 text-xs text-red-600">{errors.toMobile}</p>}

                                        {/* Customer Name Dropdown */}
                                        {toMobile.length === 10 && toNameOptions.length > 0 && (
                                            <div className="mt-2">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Receiver *</label>
                                                <Select
                                                    options={toNameOptions}
                                                    onChange={handleToCustomerChange}
                                                    placeholder="Select receiver"
                                                    className="react-select"
                                                    classNamePrefix="select"
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor: errors.customerTo ? '#ef4444' : '#d1d5db',
                                                            minHeight: '36px',
                                                            fontSize: '14px',
                                                        }),
                                                    }}
                                                />
                                                {errors.customerTo && <p className="mt-1 text-xs text-red-600">{errors.customerTo}</p>}
                                            </div>
                                        )}

                                        {customerTo && customerTo.id !== 'new' && (
                                            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                                    <IconUser className="w-3 h-3 mr-1 text-green-500" />
                                                    <span className="font-medium">{customerTo.name}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Package Details Section - Compact */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center">
                                        <IconPackage className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500" />
                                        Package Details *
                                    </h3>
                                    <button type="button" onClick={addPackageDetail} className="btn btn-outline-primary btn-xs sm:btn-sm flex items-center text-xs">
                                        <IconPlus className="w-3 h-3 mr-1" />
                                        Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {packageDetails.map((pkg, index) => (
                                        <div key={pkg.id} className="bg-gray-50 rounded p-3 border border-gray-200 relative">
                                            {packageDetails.length > 1 && (
                                                <button type="button" onClick={() => removePackageDetail(index)} className="absolute top-1 right-1 text-red-500 hover:text-red-700">
                                                    <IconX className="w-3 h-3" />
                                                </button>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                                {/* Package Type */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Package Type *</label>
                                                    <Select
                                                        options={dummyPackageTypes.map((p) => ({
                                                            value: p.id,
                                                            label: p.packageName,
                                                            data: p,
                                                        }))}
                                                        value={
                                                            pkg.packageType
                                                                ? {
                                                                      value: pkg.packageType.id,
                                                                      label: pkg.packageType.packageName,
                                                                      data: pkg.packageType,
                                                                  }
                                                                : null
                                                        }
                                                        onChange={(selectedOption) => handlePackageDetailChange(index, 'packageType', selectedOption?.value)}
                                                        placeholder="Select type"
                                                        className="react-select"
                                                        classNamePrefix="select"
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                borderColor: errors[`packageType_${index}`] ? '#ef4444' : '#d1d5db',
                                                                minHeight: '36px',
                                                                fontSize: '14px',
                                                            }),
                                                        }}
                                                    />
                                                    {errors[`packageType_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`packageType_${index}`]}</p>}
                                                    {pkg.packageType && (
                                                        <div className="mt-1 text-xs text-gray-600 grid grid-cols-2 gap-1">
                                                            <span>Pickup: ₹{pkg.pickupPrice}</span>
                                                            <span>Drop: ₹{pkg.dropPrice}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                                                    <input
                                                        type="number"
                                                        value={pkg.quantity}
                                                        onChange={(e) => handlePackageDetailChange(index, 'quantity', e.target.value)}
                                                        className={`form-input w-full ${errors[`quantity_${index}`] ? 'border-red-500' : ''}`}
                                                        min="1"
                                                        step="1"
                                                    />
                                                    {errors[`quantity_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`quantity_${index}`]}</p>}
                                                </div>

                                                {/* Rate */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Rate (₹) *</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            value={pkg.rate}
                                                            onChange={(e) => handlePackageDetailChange(index, 'rate', e.target.value)}
                                                            className={`form-input w-full pl-6 ${errors[`rate_${index}`] ? 'border-red-500' : ''}`}
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    {errors[`rate_${index}`] && <p className="mt-1 text-xs text-red-600">{errors[`rate_${index}`]}</p>}
                                                </div>

                                                {/* Package Total */}
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Package Total</label>
                                                    <div className="bg-white border border-gray-300 rounded p-2 text-center">
                                                        <div className="text-base font-bold text-primary">₹{calculatePackageTotal(pkg).toFixed(2)}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">(Qty × Rate) + Pickup + Drop</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment & Total Section - Compact */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Payment Details */}
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Payment Details *</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Payment By *</label>
                                                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                                                    <label className="flex items-center cursor-pointer group">
                                                        <div className="relative">
                                                            <input
                                                                type="radio"
                                                                name="paymentBy"
                                                                value="from"
                                                                checked={paymentBy === 'from'}
                                                                onChange={(e) => setPaymentBy(e.target.value)}
                                                                className="sr-only"
                                                            />
                                                            <div
                                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                    paymentBy === 'from' ? 'border-primary' : 'border-gray-300 group-hover:border-primary'
                                                                }`}
                                                            >
                                                                {paymentBy === 'from' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                                            </div>
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-primary">Sender Pays</span>
                                                    </label>
                                                    <label className="flex items-center cursor-pointer group">
                                                        <div className="relative">
                                                            <input
                                                                type="radio"
                                                                name="paymentBy"
                                                                value="to"
                                                                checked={paymentBy === 'to'}
                                                                onChange={(e) => setPaymentBy(e.target.value)}
                                                                className="sr-only"
                                                            />
                                                            <div
                                                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                    paymentBy === 'to' ? 'border-primary' : 'border-gray-300 group-hover:border-primary'
                                                                }`}
                                                            >
                                                                {paymentBy === 'to' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                                                            </div>
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-primary">Receiver Pays</span>
                                                    </label>
                                                </div>
                                                {errors.paymentBy && <p className="mt-1 text-xs text-red-600">{errors.paymentBy}</p>}
                                            </div>

                                            {/* Paid Amount (only for from payment) */}
                                            {paymentBy === 'from' && (
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Paid Amount (₹)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                                        <input
                                                            type="number"
                                                            value={paidAmount}
                                                            onChange={(e) => setPaidAmount(e.target.value)}
                                                            className="form-input w-full pl-6"
                                                            min="0"
                                                            max={totalAmount}
                                                            step="0.01"
                                                            placeholder={`Max: ${totalAmount.toFixed(2)}`}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                                                        <span>Leave empty if not paid</span>
                                                        <span className="font-medium text-gray-700">Due: ₹{(totalAmount - (parseFloat(paidAmount) || 0)).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Summary */}
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Total Summary</h3>
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3">
                                            <div className="text-xl sm:text-2xl font-bold text-primary text-center mb-1">₹{totalAmount.toFixed(2)}</div>
                                            <div className="text-xs text-gray-600 text-center mb-3">Total Amount</div>
                                            <div className="space-y-1">
                                                {packageDetails.map((pkg, index) => (
                                                    <div key={index} className="flex justify-between text-xs">
                                                        <span className="text-gray-600 truncate">
                                                            {pkg.packageType?.packageName || 'Item'} {index + 1}:
                                                        </span>
                                                        <span className="font-medium whitespace-nowrap">₹{calculatePackageTotal(pkg).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-blue-200 text-xs text-gray-500">Includes pickup and drop charges</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - Compact */}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-3 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowForm(false);
                                    }}
                                    className="btn btn-outline-secondary hover:shadow-md transition-all duration-300 text-xs sm:text-sm py-2"
                                >
                                    Cancel
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-outline-primary hover:shadow-md transition-all duration-300 text-xs sm:text-sm py-2">
                                    Clear Form
                                </button>
                                <button type="submit" className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm py-2 px-4">
                                    {isEdit ? 'Update Package' : 'Record Package'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Package Intake List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Package Intake Records</h2>
                            <p className="text-gray-600 mt-0.5 text-xs sm:text-sm">View and manage all package intake records</p>
                        </div>
                        <div className="text-xs text-gray-500">
                            Showing {getPaginatedData().length} of {getTotalCount()} records
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
                        searchPlaceholder="Search packages..."
                        showPageSize={true}
                        responsive={true}
                        className="rounded-lg overflow-hidden"
                    />
                </div>
            </div>

            {/* Add Customer Modal */}
            <ModelViewBox
                modal={customerModal}
                modelHeader="Add New Customer"
                setModel={closeCustomerModal}
                handleSubmit={handleAddCustomer}
                modelSize="sm"
                submitBtnText="Add Customer"
                submitBtnClass="btn-primary"
                cancelBtnText="Cancel"
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input type="text" value={newCustomer.mobileNo} disabled className="form-input w-full bg-gray-100" />
                        <p className="text-xs text-gray-500 mt-1">This mobile number is pre-filled from the form</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                            type="text"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            className="form-input w-full"
                            placeholder="Enter customer name"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the name for this mobile number</p>
                    </div>
                </div>
            </ModelViewBox>

            {/* Add Location Modal */}
            <ModelViewBox
                modal={locationModal}
                modelHeader="Add New Location"
                setModel={closeLocationModal}
                handleSubmit={handleAddLocation}
                modelSize="sm"
                submitBtnText="Add Location"
                submitBtnClass="btn-primary"
                cancelBtnText="Cancel"
            >
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                        <input
                            type="text"
                            value={newLocation.name}
                            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            className="form-input w-full"
                            placeholder="Enter location name"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">This location will be available in customer location dropdowns</p>
                    </div>
                </div>
            </ModelViewBox>

            {/* View Package Modal */}
            <ModelViewBox
                modal={viewModal}
                modelHeader="Package Details"
                setModel={() => setViewModal(false)}
                handleSubmit={null}
                modelSize="lg"
                saveBtn={false}
            >
                {selectedViewPackage && (
                    <div className="space-y-4">
                        {/* Package Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <div className="text-base font-bold text-gray-800">Package #{selectedViewPackage.id}</div>
                                    <div className="text-xs text-gray-600">{selectedViewPackage.date}</div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedViewPackage.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {selectedViewPackage.status === 'completed' ? 'Paid' : 'Payment Pending'}
                                    </div>
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedViewPackage.deliveryStatus === 'delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : selectedViewPackage.deliveryStatus === 'in_transit'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {selectedViewPackage.deliveryStatus === 'delivered' ? 'Delivered' : selectedViewPackage.deliveryStatus === 'in_transit' ? 'In Transit' : 'Not Started'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white rounded p-3 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Company Centers</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">From Center</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconMapPin className="w-3 h-3 mr-1 text-blue-500" />
                                            {selectedViewPackage.fromCenter}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">To Center</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                                            {selectedViewPackage.toCenter}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded p-3 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Customer Locations</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">From Location</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconMapPin className="w-3 h-3 mr-1 text-blue-500" />
                                            {selectedViewPackage.fromLocation}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">To Location</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                                            {selectedViewPackage.toLocation}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white rounded p-3 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Customer Information</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Sender</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconUser className="w-3 h-3 mr-1 text-blue-500" />
                                            {selectedViewPackage.fromName} ({selectedViewPackage.fromMobile})
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Receiver</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconUser className="w-3 h-3 mr-1 text-green-500" />
                                            {selectedViewPackage.toName} ({selectedViewPackage.toMobile})
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded p-3 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Payment Information</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Payment By</div>
                                        <div className="text-base font-medium">{selectedViewPackage.paymentBy === 'from' ? 'Sender' : 'Receiver'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Paid Amount</div>
                                        <div className={`text-base font-bold ${selectedViewPackage.paidAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>₹{selectedViewPackage.paidAmount}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Package Details */}
                        <div className="bg-white rounded p-3 border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2 text-sm">Package Details</h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Package Type</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Drop</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedViewPackage.packageDetails.map((pkg, index) => (
                                            <tr key={index}>
                                                <td className="px-2 py-1 text-xs">{pkg.packageType}</td>
                                                <td className="px-2 py-1 text-xs">{pkg.quantity}</td>
                                                <td className="px-2 py-1 text-xs">₹{pkg.rate}</td>
                                                <td className="px-2 py-1 text-xs">₹{pkg.pickupPrice}</td>
                                                <td className="px-2 py-1 text-xs">₹{pkg.dropPrice}</td>
                                                <td className="px-2 py-1 text-xs font-medium">₹{pkg.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="5" className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                                                Total Amount:
                                            </td>
                                            <td className="px-2 py-1 text-base font-bold text-primary">₹{selectedViewPackage.totalAmount}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Balance Due */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <div className="text-xs text-gray-600 mb-0.5">Total Amount</div>
                                    <div className="text-xl font-bold text-primary">₹{selectedViewPackage.totalAmount}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-0.5">Paid Amount</div>
                                    <div className={`text-xl font-bold ${selectedViewPackage.paidAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>₹{selectedViewPackage.paidAmount}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-0.5">Balance Due</div>
                                    <div className="text-xl font-bold text-orange-600">₹{selectedViewPackage.totalAmount - selectedViewPackage.paidAmount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default PackageIntake;