import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage, findArrObj } from '../../util/AllFunction';
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
import IconFilter from '../../components/Icon/IconFilter';
import IconSearch from '../../components/Icon/IconSearch';
import { getPackage, createPackage, updatePackage, deletePackage, resetPackageStatus } from '../../redux/packageSlice';
import { getPackageType } from '../../redux/packageTypeSlice';
import { getCustomers, createCustomers } from '../../redux/customerSlice';
import { getOfficeCentersWithLocations } from '../../redux/officeCenterSlice';
import { createLocations } from '../../redux/locationSlice';

const PackageIntake = () => {
    const dispatch = useDispatch();

    // Get login info for permissions
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Package Intake');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;

    // Redux state
    const packageState = useSelector((state) => state.PackageSlice || {});
    const { 
        packageData = [], 
        loading = false, 
        error = null,
        createPackageSuccess = false,
        updatePackageSuccess = false,
        deletePackageSuccess = false
    } = packageState;

    const packageTypeState = useSelector((state) => state.PackageTypeSlice || {});
    const { packageTypeData = [] } = packageTypeState;

    const customerState = useSelector((state) => state.CustomerSlice || {});
    const { customersData = [], createCustomersSuccess = false } = customerState;

    const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
    const { officeCentersWithLocationsData = [], loading: officeCentersLoading = false } = officeCenterState;

    const locationState = useSelector((state) => state.LocationSlice || {});
    const { createLocationsSuccess = false } = locationState;

    // Local states
    const [showForm, setShowForm] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [selectedViewPackage, setSelectedViewPackage] = useState(null);
    const [customerModal, setCustomerModal] = useState(false);
    const [locationModal, setLocationModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [customerField, setCustomerField] = useState('');
    const [locationField, setLocationField] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', mobileNo: '' });
    const [newLocation, setNewLocation] = useState({ name: '', officeCenterId: null });
    const [paymentMode, setPaymentMode] = useState('cash');

    // Filters state
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
        deliveryStatus: '',
        paymentStatus: ''
    });

    // Form states
    const [formData, setFormData] = useState({
        fromCenterId: null,
        toCenterId: null,
        fromLocationId: null,
        toLocationId: null,
        fromMobile: '',
        fromCustomerId: null,
        toMobile: '',
        toCustomerId: null,
        paymentBy: 'sender',
        paidAmount: '',
        specialInstructions: '',
        packages: [
            { 
                packageTypeId: null, 
                quantity: '1', 
                pickupCharge: 0, 
                dropCharge: 0, 
                handlingCharge: '' 
            }
        ]
    });

    const [errors, setErrors] = useState({});

    // Load initial data
    useEffect(() => {
        dispatch(setPageTitle('Package Intake Management'));
        fetchInitialData();
    }, []);

    // Fetch success/error handling
    useEffect(() => {
        if (createPackageSuccess) {
            showMessage('success', 'Package created successfully');
            resetForm();
            setShowForm(false);
            dispatch(resetPackageStatus());
            fetchPackages();
        }
        if (updatePackageSuccess) {
            showMessage('success', 'Package updated successfully');
            resetForm();
            setShowForm(false);
            dispatch(resetPackageStatus());
            fetchPackages();
        }
        if (deletePackageSuccess) {
            showMessage('success', 'Package deleted successfully');
            dispatch(resetPackageStatus());
            fetchPackages();
        }
        if (error) {
            showMessage('error', error);
            dispatch(resetPackageStatus());
        }
    }, [createPackageSuccess, updatePackageSuccess, deletePackageSuccess, error]);

    useEffect(() => {
        if (createCustomersSuccess) {
            showMessage('success', 'Customer added successfully');
            dispatch(getCustomers({}));
            setCustomerModal(false);
            setNewCustomer({ name: '', mobileNo: '' });
            
            // Refresh customer list
            setTimeout(() => {
                if (customerField === 'from' && formData.fromMobile) {
                    const newCust = customersData.find(c => c.customer_number === formData.fromMobile);
                    if (newCust) {
                        setFormData(prev => ({ ...prev, fromCustomerId: newCust.customer_id }));
                    }
                } else if (customerField === 'to' && formData.toMobile) {
                    const newCust = customersData.find(c => c.customer_number === formData.toMobile);
                    if (newCust) {
                        setFormData(prev => ({ ...prev, toCustomerId: newCust.customer_id }));
                    }
                }
            }, 500);
        }
    }, [createCustomersSuccess]);

    useEffect(() => {
        if (createLocationsSuccess) {
            showMessage('success', 'Location added successfully');
            dispatch(getOfficeCentersWithLocations());
            setLocationModal(false);
            setNewLocation({ name: '', officeCenterId: null });
            
            // Refresh locations for the selected center
            setTimeout(() => {
                if (locationField === 'from' && formData.fromCenterId) {
                    const center = officeCentersWithLocationsData.find(c => c.office_center_id === formData.fromCenterId);
                    if (center && center.locations && center.locations.length > 0) {
                        const newLoc = center.locations[center.locations.length - 1];
                        setFormData(prev => ({ ...prev, fromLocationId: newLoc.location_id }));
                    }
                } else if (locationField === 'to' && formData.toCenterId) {
                    const center = officeCentersWithLocationsData.find(c => c.office_center_id === formData.toCenterId);
                    if (center && center.locations && center.locations.length > 0) {
                        const newLoc = center.locations[center.locations.length - 1];
                        setFormData(prev => ({ ...prev, toLocationId: newLoc.location_id }));
                    }
                }
            }, 500);
        }
    }, [createLocationsSuccess]);

    const fetchInitialData = async () => {
        try {
            await Promise.all([
                dispatch(getPackage({})).unwrap(),
                dispatch(getPackageType({})).unwrap(),
                dispatch(getCustomers({})).unwrap(),
                dispatch(getOfficeCentersWithLocations()).unwrap()
            ]);
        } catch (error) {
            showMessage('error', 'Failed to load initial data');
        }
    };

    const fetchPackages = () => {
        const filterParams = {};
        if (filters.fromDate) filterParams.fromDate = filters.fromDate;
        if (filters.toDate) filterParams.toDate = filters.toDate;
        if (filters.deliveryStatus) filterParams.deliveryStatus = filters.deliveryStatus;
        if (filters.paymentStatus) filterParams.paymentStatus = filters.paymentStatus;
        if (searchTerm) filterParams.search = searchTerm;
        
        dispatch(getPackage(filterParams));
    };

    useEffect(() => {
        fetchPackages();
    }, [filters, searchTerm]);

    // Get office center options (all active centers)
    const getOfficeCenterOptions = () => {
        return (officeCentersWithLocationsData || [])
            .filter(center => center.is_active)
            .map(center => ({
                value: center.office_center_id,
                label: center.office_center_name,
                data: center
            }));
    };

    // Get location options based on selected center
    const getLocationOptions = (centerId) => {
        if (!centerId) return [];
        
        const center = officeCentersWithLocationsData.find(c => c.office_center_id === centerId);
        if (!center || !center.locations) return [];
        
        const options = center.locations
            .filter(loc => loc.is_active)
            .map(loc => ({
                value: loc.location_id,
                label: loc.location_name,
                data: loc
            }));
        
        // Add "Add New" option
        options.push({
            value: 'new',
            label: '+ Add New Location',
            data: { id: 'new', name: 'New Location' }
        });
        
        return options;
    };

    // Get filtered center options (exclude selected center from the other dropdown)
    const getFilteredCenterOptions = (currentCenterId, excludeCenterId) => {
        const options = getOfficeCenterOptions();
        if (excludeCenterId) {
            return options.filter(opt => opt.value !== excludeCenterId);
        }
        return options;
    };

    const getPackageTypeOptions = () => {
        return (packageTypeData || [])
            .filter(pkg => pkg.is_active)
            .map(pkg => ({
                value: pkg.package_type_id,
                label: pkg.package_type_name,
                data: pkg,
                pickupPrice: parseFloat(pkg.package_pickup_price) || 0,
                dropPrice: parseFloat(pkg.package_drop_price) || 0
            }));
    };

    const getCustomerOptions = (mobile) => {
        const options = (customersData || [])
            .filter(cust => cust.customer_number === mobile)
            .map(cust => ({
                value: cust.customer_id,
                label: `${cust.customer_name} (${cust.customer_number})`,
                data: cust
            }));
        
        // Add "Add New" option
        if (mobile && mobile.length === 10) {
            options.push({
                value: 'new',
                label: '+ Add New Customer',
                data: { id: 'new', name: 'New Customer', mobileNo: mobile }
            });
        }
        
        return options;
    };

    // Custom filter for location options to always show "Add New"
    const locationFilterOption = (option, inputValue) => {
        if (option.value === 'new') {
            return true;
        }
        return option.label.toLowerCase().includes(inputValue.toLowerCase());
    };

    // Handle center selection
    const handleFromCenterChange = (selected) => {
        setFormData(prev => ({ 
            ...prev, 
            fromCenterId: selected?.value,
            fromLocationId: null // Reset location when center changes
        }));
        setErrors(prev => ({ ...prev, fromCenterId: null }));
    };

    const handleToCenterChange = (selected) => {
        setFormData(prev => ({ 
            ...prev, 
            toCenterId: selected?.value,
            toLocationId: null // Reset location when center changes
        }));
        setErrors(prev => ({ ...prev, toCenterId: null }));
    };

    // Handle location change with "Add New" option
    const handleLocationChange = (selected, field) => {
        if (selected?.value === 'new') {
            setLocationField(field);
            // Pre-fill the center ID based on which location field is being added
            if (field === 'from') {
                setNewLocation({ name: '', officeCenterId: formData.fromCenterId });
            } else if (field === 'to') {
                setNewLocation({ name: '', officeCenterId: formData.toCenterId });
            }
            setLocationModal(true);
        } else {
            if (field === 'from') {
                setFormData(prev => ({ ...prev, fromLocationId: selected?.value }));
                setErrors(prev => ({ ...prev, fromLocationId: null }));
            } else if (field === 'to') {
                setFormData(prev => ({ ...prev, toLocationId: selected?.value }));
                setErrors(prev => ({ ...prev, toLocationId: null }));
            }
        }
    };

    // Handle mobile number changes
    const handleFromMobileChange = (value) => {
        const cleanValue = value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({
            ...prev,
            fromMobile: cleanValue,
            fromCustomerId: null
        }));
        setErrors(prev => ({ ...prev, fromMobile: null, fromCustomerId: null }));
    };

    const handleToMobileChange = (value) => {
        const cleanValue = value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({
            ...prev,
            toMobile: cleanValue,
            toCustomerId: null
        }));
        setErrors(prev => ({ ...prev, toMobile: null, toCustomerId: null }));
    };

    const handleFromCustomerSelect = (selected) => {
        if (selected?.value === 'new') {
            setCustomerField('from');
            setNewCustomer({ name: '', mobileNo: formData.fromMobile });
            setCustomerModal(true);
        } else {
            setFormData(prev => ({
                ...prev,
                fromCustomerId: selected ? selected.value : null
            }));
            setErrors(prev => ({ ...prev, fromCustomerId: null }));
        }
    };

    const handleToCustomerSelect = (selected) => {
        if (selected?.value === 'new') {
            setCustomerField('to');
            setNewCustomer({ name: '', mobileNo: formData.toMobile });
            setCustomerModal(true);
        } else {
            setFormData(prev => ({
                ...prev,
                toCustomerId: selected ? selected.value : null
            }));
            setErrors(prev => ({ ...prev, toCustomerId: null }));
        }
    };

    // Package details handlers
    const handlePackageDetailChange = (index, field, value) => {
        const updatedPackages = [...formData.packages];
        
        if (field === 'packageTypeId') {
            const selectedPackage = packageTypeData.find(pkg => pkg.package_type_id === value);
            if (selectedPackage) {
                updatedPackages[index] = {
                    ...updatedPackages[index],
                    packageTypeId: value,
                    pickupCharge: parseFloat(selectedPackage.package_pickup_price) || 0,
                    dropCharge: parseFloat(selectedPackage.package_drop_price) || 0
                };
            } else {
                updatedPackages[index] = {
                    ...updatedPackages[index],
                    packageTypeId: value
                };
            }
        } else if (field === 'quantity') {
            // Allow empty string or numbers only
            if (value === '' || /^\d*$/.test(value)) {
                updatedPackages[index] = {
                    ...updatedPackages[index],
                    quantity: value
                };
            }
        } else if (field === 'handlingCharge') {
            // Allow empty string or decimal numbers
            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                updatedPackages[index] = {
                    ...updatedPackages[index],
                    handlingCharge: value
                };
            }
        }
        
        setFormData(prev => ({ ...prev, packages: updatedPackages }));
    };

    const addPackageDetail = () => {
        setFormData(prev => ({
            ...prev,
            packages: [
                ...prev.packages,
                { 
                    packageTypeId: null, 
                    quantity: '1', 
                    pickupCharge: 0, 
                    dropCharge: 0, 
                    handlingCharge: '' 
                }
            ]
        }));
    };

    const removePackageDetail = (index) => {
        if (formData.packages.length > 1) {
            const updatedPackages = formData.packages.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, packages: updatedPackages }));
        }
    };

    // Safe number parsing function
    const safeParseFloat = (value) => {
        if (value === '' || value === null || value === undefined) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    const safeParseInt = (value) => {
        if (value === '' || value === null || value === undefined) return 1;
        const parsed = parseInt(value);
        return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    };

    // Safe toFixed function
    const safeToFixed = (value, digits = 2) => {
        const num = safeParseFloat(value);
        return num.toFixed(digits);
    };

    // Calculate totals
    const calculatePackageTotal = (pkg) => {
        const quantity = safeParseInt(pkg.quantity);
        const pickupCharge = safeParseFloat(pkg.pickupCharge);
        const dropCharge = safeParseFloat(pkg.dropCharge);
        const handlingCharge = safeParseFloat(pkg.handlingCharge);
        
        return (pickupCharge + dropCharge + handlingCharge) * quantity;
    };

    const calculateTotalAmount = () => {
        return formData.packages.reduce((total, pkg) => total + calculatePackageTotal(pkg), 0);
    };

    const totalAmount = calculateTotalAmount();

    // Handle paid amount change with max validation
    const handlePaidAmountChange = (value) => {
        // Allow empty string or decimal numbers
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            const numValue = value === '' ? '' : parseFloat(value);
            
            // If it's a number and exceeds total amount, don't update
            if (numValue !== '' && !isNaN(numValue) && numValue > totalAmount) {
                setErrors(prev => ({ 
                    ...prev, 
                    paidAmount: `Amount cannot exceed ₹${safeToFixed(totalAmount)}` 
                }));
                return;
            }
            
            setFormData(prev => ({ ...prev, paidAmount: value }));
            
            // Clear paid amount error if exists
            if (errors.paidAmount) {
                setErrors(prev => ({ ...prev, paidAmount: null }));
            }
        }
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.fromCenterId) newErrors.fromCenterId = 'From center is required';
        if (!formData.toCenterId) newErrors.toCenterId = 'To center is required';
        
        // Check if same center selected
        if (formData.fromCenterId && formData.toCenterId && formData.fromCenterId === formData.toCenterId) {
            newErrors.toCenterId = 'From and To centers cannot be the same';
        }
        
        if (!formData.fromLocationId) newErrors.fromLocationId = 'From location is required';
        if (!formData.toLocationId) newErrors.toLocationId = 'To location is required';
        
        if (!formData.fromMobile || formData.fromMobile.length !== 10) {
            newErrors.fromMobile = 'Valid sender mobile number (10 digits) is required';
        }
        if (!formData.fromCustomerId) newErrors.fromCustomerId = 'Please select a sender';
        
        if (!formData.toMobile || formData.toMobile.length !== 10) {
            newErrors.toMobile = 'Valid receiver mobile number (10 digits) is required';
        }
        if (!formData.toCustomerId) newErrors.toCustomerId = 'Please select a receiver';
        
        // Check if same customer selected
        if (formData.fromCustomerId && formData.toCustomerId && formData.fromCustomerId === formData.toCustomerId) {
            newErrors.toCustomerId = 'Sender and Receiver cannot be the same customer';
        }
        
        // Validate packages
        formData.packages.forEach((pkg, index) => {
            if (!pkg.packageTypeId) {
                newErrors[`packageType_${index}`] = `Package type is required for item ${index + 1}`;
            }
            const quantity = safeParseInt(pkg.quantity);
            if (quantity < 1) {
                newErrors[`quantity_${index}`] = `Valid quantity is required for item ${index + 1}`;
            }
        });

        // Validate paid amount if payment is by sender
        if (formData.paymentBy === 'sender' && formData.paidAmount !== '') {
            const paid = safeParseFloat(formData.paidAmount);
            if (paid > totalAmount) {
                newErrors.paidAmount = `Paid amount cannot exceed ₹${safeToFixed(totalAmount)}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('error', 'Please fix all errors before submitting');
            return;
        }

        const requestData = {
            fromCenterId: formData.fromCenterId,
            toCenterId: formData.toCenterId,
            fromLocationId: formData.fromLocationId,
            toLocationId: formData.toLocationId,
            fromCustomerId: formData.fromCustomerId,
            toCustomerId: formData.toCustomerId,
            paidAmount: safeParseFloat(formData.paidAmount),
            paymentBy: formData.paymentBy,
            specialInstructions: formData.specialInstructions || '',
            packages: formData.packages.map(pkg => ({
                packageTypeId: pkg.packageTypeId,
                quantity: safeParseInt(pkg.quantity),
                pickupCharge: safeParseFloat(pkg.pickupCharge),
                dropCharge: safeParseFloat(pkg.dropCharge),
                handlingCharge: safeParseFloat(pkg.handlingCharge)
            }))
        };

        // Add payment mode only if paid amount > 0 and payment is by sender
        if (requestData.paidAmount > 0 && requestData.paymentBy === 'sender') {
            requestData.paymentMode = paymentMode;
        }

        try {
            if (isEdit && editId) {
                await dispatch(updatePackage({ request: requestData, packageId: editId })).unwrap();
            } else {
                await dispatch(createPackage(requestData)).unwrap();
            }
        } catch (error) {
            showMessage('error', error.message || 'Failed to save package');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            fromCenterId: null,
            toCenterId: null,
            fromLocationId: null,
            toLocationId: null,
            fromMobile: '',
            fromCustomerId: null,
            toMobile: '',
            toCustomerId: null,
            paymentBy: 'sender',
            paidAmount: '',
            specialInstructions: '',
            packages: [
                { 
                    packageTypeId: null, 
                    quantity: '1', 
                    pickupCharge: 0, 
                    dropCharge: 0, 
                    handlingCharge: '' 
                }
            ]
        });
        setPaymentMode('cash');
        setErrors({});
        setIsEdit(false);
        setEditId(null);
    };

    // Edit package
    const handleEdit = (pkg) => {
        if (pkg.delivery_status !== 'not_started') {
            showMessage('error', 'Cannot edit package that is already in delivery process');
            return;
        }

        setIsEdit(true);
        setEditId(pkg.booking_id);
        setShowForm(true);

        setFormData({
            fromCenterId: pkg.from_center_id,
            toCenterId: pkg.to_center_id,
            fromLocationId: pkg.from_location_id,
            toLocationId: pkg.to_location_id,
            fromMobile: pkg.fromCustomer?.customer_number || '',
            fromCustomerId: pkg.from_customer_id,
            toMobile: pkg.toCustomer?.customer_number || '',
            toCustomerId: pkg.to_customer_id,
            paymentBy: pkg.payment_by || 'sender',
            paidAmount: pkg.paid_amount?.toString() || '',
            specialInstructions: pkg.special_instructions || '',
            packages: (pkg.packages || []).map(p => ({
                packageTypeId: p.package_type_id,
                quantity: p.quantity?.toString() || '1',
                pickupCharge: parseFloat(p.pickup_charge) || 0,
                dropCharge: parseFloat(p.drop_charge) || 0,
                handlingCharge: p.handling_charge?.toString() || ''
            }))
        });
    };

    // Delete package
    const handleDelete = (pkg) => {
        if (pkg.delivery_status !== 'not_started') {
            showMessage('error', 'Cannot delete package that is already in delivery process');
            return;
        }

        showMessage(
            'warning',
            `Are you sure you want to delete package #${pkg.booking_number || pkg.booking_id}?`,
            () => {
                dispatch(deletePackage(pkg.booking_id));
            },
            'Yes, delete it'
        );
    };

    // View package details
    const handleView = (pkg) => {
        setSelectedViewPackage(pkg);
        setViewModal(true);
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            fromDate: '',
            toDate: '',
            deliveryStatus: '',
            paymentStatus: ''
        });
        setSearchTerm('');
    };

    // Customer modal handlers
    const handleAddCustomer = () => {
        if (!newCustomer.name) {
            showMessage('error', 'Name is required');
            return;
        }

        if (!newCustomer.mobileNo || newCustomer.mobileNo.length !== 10) {
            showMessage('error', 'Valid 10-digit mobile number is required');
            return;
        }

        const requestData = {
            customerName: newCustomer.name,
            customerNumber: newCustomer.mobileNo
        };

        dispatch(createCustomers(requestData));
    };

    const closeCustomerModal = () => {
        setCustomerModal(false);
        setNewCustomer({ name: '', mobileNo: '' });
        setCustomerField('');
    };

    // Location modal handlers
    const handleAddLocation = () => {
        if (!newLocation.name) {
            showMessage('error', 'Location name is required');
            return;
        }

        if (!newLocation.officeCenterId) {
            showMessage('error', 'Office center is required');
            return;
        }

        const requestData = {
            locationName: newLocation.name,
            officeCenterId: newLocation.officeCenterId
        };

        dispatch(createLocations(requestData));
    };

    const closeLocationModal = () => {
        setLocationModal(false);
        setNewLocation({ name: '', officeCenterId: null });
        setLocationField('');
    };

    // Format number for display
    const formatNumber = (value) => {
        const num = safeParseFloat(value);
        return num.toFixed(2);
    };

    // Table columns
    const columns = [
        {
            Header: '#',
            accessor: 'index',
            Cell: ({ row }) => (
                <div className="font-medium text-gray-600 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full">
                        {currentPage * pageSize + row.index + 1}
                    </span>
                </div>
            ),
            width: 80,
        },
        {
            Header: 'Booking No.',
            accessor: 'booking_number',
            Cell: ({ value }) => (
                <div className="font-medium text-gray-800">{value || '-'}</div>
            ),
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <IconMapPin className="w-3 h-3 mr-1 text-blue-500" />
                        <span className="text-gray-700">{row.original.fromCenter?.office_center_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                        <span className="text-gray-700">{row.original.toCenter?.office_center_name || 'N/A'}</span>
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
                            {row.original.fromCustomer?.customer_name || 'N/A'} → {row.original.toCustomer?.customer_name || 'N/A'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.fromCustomer?.customer_number || 'N/A'} → {row.original.toCustomer?.customer_number || 'N/A'}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Packages',
            accessor: 'packages',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    {row.original.packages?.map((pkg, index) => (
                        <div key={index} className="text-sm">
                            <span className="font-medium">{pkg.packageType?.package_type_name || 'N/A'}</span>
                            <span className="text-gray-600 ml-2">
                                (Qty: {pkg.quantity})
                            </span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'total_amount',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-lg font-bold text-primary">
                        ₹{formatNumber(row.original.total_amount)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        row.original.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : row.original.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {row.original.payment_status || 'pending'}
                    </div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'delivery_status',
            Cell: ({ value }) => {
                const statusConfig = {
                    not_started: { color: 'bg-gray-100 text-gray-800', label: 'Not Started' },
                    pickup_assigned: { color: 'bg-blue-100 text-blue-800', label: 'Pickup Assigned' },
                    picked_up: { color: 'bg-purple-100 text-purple-800', label: 'Picked Up' },
                    in_transit: { color: 'bg-indigo-100 text-indigo-800', label: 'In Transit' },
                    out_for_delivery: { color: 'bg-orange-100 text-orange-800', label: 'Out for Delivery' },
                    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
                    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
                };
                const config = statusConfig[value] || statusConfig.not_started;

                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                    </span>
                );
            },
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-1">
                    <Tippy content="View Details">
                        <button 
                            onClick={() => handleView(row.original)} 
                            className="btn btn-outline-primary btn-sm p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                            <IconEye className="w-4 h-4" />
                        </button>
                    </Tippy>
                    {row.original.delivery_status === 'not_started' && (
                        <>
                            <Tippy content="Edit">
                                <button 
                                    onClick={() => handleEdit(row.original)} 
                                    className="btn btn-outline-success btn-sm p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                                >
                                    <IconPencil className="w-4 h-4" />
                                </button>
                            </Tippy>
                            <Tippy content="Delete">
                                <button 
                                    onClick={() => handleDelete(row.original)} 
                                    className="btn btn-outline-danger btn-sm p-1.5 rounded-lg hover:bg-danger hover:text-white transition-colors"
                                >
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
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return (packageData || []).slice(startIndex, endIndex);
    };

    const getTotalCount = () => (packageData || []).length;

    // Stats
    const stats = {
        total: (packageData || []).length,
        pending: (packageData || []).filter(p => p.payment_status === 'pending').length,
        partial: (packageData || []).filter(p => p.payment_status === 'partial').length,
        completed: (packageData || []).filter(p => p.payment_status === 'completed').length,
        totalAmount: (packageData || []).reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0)
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

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3 sm:mb-4">
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-600">Partial</p>
                                <p className="text-lg font-bold text-gray-800 mt-1">{stats.partial}</p>
                            </div>
                            <div className="p-2 bg-orange-100 rounded-full">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
                                <p className="text-lg font-bold text-gray-800 mt-1">₹{formatNumber(stats.totalAmount)}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
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
                                    placeholder="Search by booking number, customer name, or mobile..."
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
                                    setShowForm(!showForm);
                                }}
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

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    <label className="block mb-1 text-sm font-medium">Delivery Status</label>
                                    <select
                                        name="deliveryStatus"
                                        value={filters.deliveryStatus}
                                        onChange={handleFilterChange}
                                        className="form-select"
                                    >
                                        <option value="">All</option>
                                        <option value="not_started">Not Started</option>
                                        <option value="pickup_assigned">Pickup Assigned</option>
                                        <option value="picked_up">Picked Up</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="out_for_delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Payment Status</label>
                                    <select
                                        name="paymentStatus"
                                        value={filters.paymentStatus}
                                        onChange={handleFilterChange}
                                        className="form-select"
                                    >
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="completed">Completed</option>
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
                            {/* Company Centers Section */}
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
                                            options={getFilteredCenterOptions(formData.fromCenterId, formData.toCenterId)}
                                            value={getOfficeCenterOptions().find(opt => opt.value === formData.fromCenterId)}
                                            onChange={handleFromCenterChange}
                                            placeholder="Select from center"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.fromCenterId ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                            isLoading={officeCentersLoading}
                                        />
                                        {errors.fromCenterId && <p className="mt-1 text-xs text-red-600">{errors.fromCenterId}</p>}
                                    </div>

                                    {/* To Center */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To Center *</label>
                                        <Select
                                            options={getFilteredCenterOptions(formData.toCenterId, formData.fromCenterId)}
                                            value={getOfficeCenterOptions().find(opt => opt.value === formData.toCenterId)}
                                            onChange={handleToCenterChange}
                                            placeholder="Select to center"
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.toCenterId ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                            isLoading={officeCentersLoading}
                                        />
                                        {errors.toCenterId && <p className="mt-1 text-xs text-red-600">{errors.toCenterId}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Locations Section */}
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
                                            options={getLocationOptions(formData.fromCenterId)}
                                            filterOption={locationFilterOption}
                                            value={getLocationOptions(formData.fromCenterId).find(opt => opt.value === formData.fromLocationId)}
                                            onChange={(selected) => handleLocationChange(selected, 'from')}
                                            placeholder={formData.fromCenterId ? "Select or add location" : "Select from center first"}
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.fromLocationId ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                            isDisabled={!formData.fromCenterId}
                                        />
                                        {errors.fromLocationId && <p className="mt-1 text-xs text-red-600">{errors.fromLocationId}</p>}
                                    </div>

                                    {/* To Location */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">To Location *</label>
                                        <Select
                                            options={getLocationOptions(formData.toCenterId)}
                                            filterOption={locationFilterOption}
                                            value={getLocationOptions(formData.toCenterId).find(opt => opt.value === formData.toLocationId)}
                                            onChange={(selected) => handleLocationChange(selected, 'to')}
                                            placeholder={formData.toCenterId ? "Select or add location" : "Select to center first"}
                                            className="react-select"
                                            classNamePrefix="select"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: errors.toLocationId ? '#ef4444' : '#d1d5db',
                                                    minHeight: '36px',
                                                    fontSize: '14px',
                                                }),
                                            }}
                                            isDisabled={!formData.toCenterId}
                                        />
                                        {errors.toLocationId && <p className="mt-1 text-xs text-red-600">{errors.toLocationId}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details Section */}
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
                                                value={formData.fromMobile}
                                                onChange={(e) => handleFromMobileChange(e.target.value)}
                                                className={`form-input w-full ${errors.fromMobile ? 'border-red-500' : ''}`}
                                                placeholder="10-digit mobile"
                                                maxLength="10"
                                            />
                                        </div>
                                        {errors.fromMobile && <p className="mt-1 text-xs text-red-600">{errors.fromMobile}</p>}

                                        {/* Customer Dropdown */}
                                        {formData.fromMobile.length === 10 && (
                                            <div className="mt-2">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Sender *</label>
                                                <Select
                                                    options={getCustomerOptions(formData.fromMobile)}
                                                    value={getCustomerOptions(formData.fromMobile).find(opt => opt.value === formData.fromCustomerId)}
                                                    onChange={handleFromCustomerSelect}
                                                    placeholder="Select or add sender"
                                                    className="react-select"
                                                    classNamePrefix="select"
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor: errors.fromCustomerId ? '#ef4444' : '#d1d5db',
                                                            minHeight: '36px',
                                                            fontSize: '14px',
                                                        }),
                                                    }}
                                                />
                                                {errors.fromCustomerId && <p className="mt-1 text-xs text-red-600">{errors.fromCustomerId}</p>}
                                            </div>
                                        )}

                                        {formData.fromCustomerId && formData.fromCustomerId !== 'new' && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                                    <IconUser className="w-3 h-3 mr-1 text-blue-500" />
                                                    <span className="font-medium">
                                                        {customersData.find(c => c.customer_id === formData.fromCustomerId)?.customer_name}
                                                    </span>
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
                                                value={formData.toMobile}
                                                onChange={(e) => handleToMobileChange(e.target.value)}
                                                className={`form-input w-full ${errors.toMobile ? 'border-red-500' : ''}`}
                                                placeholder="10-digit mobile"
                                                maxLength="10"
                                            />
                                        </div>
                                        {errors.toMobile && <p className="mt-1 text-xs text-red-600">{errors.toMobile}</p>}

                                        {/* Customer Dropdown */}
                                        {formData.toMobile.length === 10 && (
                                            <div className="mt-2">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Receiver *</label>
                                                <Select
                                                    options={getCustomerOptions(formData.toMobile)}
                                                    value={getCustomerOptions(formData.toMobile).find(opt => opt.value === formData.toCustomerId)}
                                                    onChange={handleToCustomerSelect}
                                                    placeholder="Select or add receiver"
                                                    className="react-select"
                                                    classNamePrefix="select"
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor: errors.toCustomerId ? '#ef4444' : '#d1d5db',
                                                            minHeight: '36px',
                                                            fontSize: '14px',
                                                        }),
                                                    }}
                                                />
                                                {errors.toCustomerId && <p className="mt-1 text-xs text-red-600">{errors.toCustomerId}</p>}
                                            </div>
                                        )}

                                        {formData.toCustomerId && formData.toCustomerId !== 'new' && (
                                            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                                <div className="flex items-center text-xs sm:text-sm text-gray-700">
                                                    <IconUser className="w-3 h-3 mr-1 text-green-500" />
                                                    <span className="font-medium">
                                                        {customersData.find(c => c.customer_id === formData.toCustomerId)?.customer_name}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Package Details Section */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center">
                                        <IconPackage className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-purple-500" />
                                        Package Details *
                                    </h3>
                                    <button 
                                        type="button" 
                                        onClick={addPackageDetail} 
                                        className="btn btn-outline-primary btn-xs sm:btn-sm flex items-center text-xs"
                                    >
                                        <IconPlus className="w-3 h-3 mr-1" />
                                        Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.packages.map((pkg, index) => {
                                        const selectedPkg = packageTypeData.find(pt => pt.package_type_id === pkg.packageTypeId);
                                        
                                        return (
                                            <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200 relative">
                                                {formData.packages.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removePackageDetail(index)} 
                                                        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                                                    >
                                                        <IconX className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                                    {/* Package Type */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Package Type *</label>
                                                        <Select
                                                            options={getPackageTypeOptions()}
                                                            value={getPackageTypeOptions().find(opt => opt.value === pkg.packageTypeId)}
                                                            onChange={(selected) => handlePackageDetailChange(index, 'packageTypeId', selected?.value)}
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
                                                            isLoading={packageTypeData.length === 0}
                                                        />
                                                        {errors[`packageType_${index}`] && (
                                                            <p className="mt-1 text-xs text-red-600">{errors[`packageType_${index}`]}</p>
                                                        )}
                                                        
                                                        {/* Show pickup and drop prices below package type */}
                                                        {selectedPkg && (
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                <span>Pickup: ₹{safeToFixed(selectedPkg.pickupPrice)} | Drop: ₹{safeToFixed(selectedPkg.dropPrice)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quantity */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Qty *</label>
                                                        <input
                                                            type="text"
                                                            value={pkg.quantity}
                                                            onChange={(e) => handlePackageDetailChange(index, 'quantity', e.target.value)}
                                                            className={`form-input w-full ${errors[`quantity_${index}`] ? 'border-red-500' : ''}`}
                                                            placeholder="Enter quantity"
                                                        />
                                                        {errors[`quantity_${index}`] && (
                                                            <p className="mt-1 text-xs text-red-600">{errors[`quantity_${index}`]}</p>
                                                        )}
                                                    </div>

                                                    {/* Handling Charge */}
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Handling</label>
                                                        <input
                                                            type="text"
                                                            value={pkg.handlingCharge}
                                                            onChange={(e) => handlePackageDetailChange(index, 'handlingCharge', e.target.value)}
                                                            className="form-input w-full"
                                                            placeholder="Enter amount"
                                                        />
                                                    </div>

                                                    {/* Package Total - Prominent Display */}
                                                    <div className="md:col-span-1 flex items-end">
                                                        <div className="w-full">
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Package Total</label>
                                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded p-2 text-center">
                                                                <div className="text-lg font-bold text-primary">
                                                                    ₹{safeToFixed(calculatePackageTotal(pkg))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Additional Information</h3>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                                    <textarea
                                        value={formData.specialInstructions}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                                        className="form-textarea"
                                        placeholder="Any special instructions (e.g., Handle with care, Fragile, etc.)"
                                        rows="2"
                                    />
                                </div>
                            </div>

                            {/* Payment & Total Section */}
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Payment Details - Only show for Sender Pays */}
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Payment Details *</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Payment By *</label>
                                                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                                                    <label className="flex items-center cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="paymentBy"
                                                            value="sender"
                                                            checked={formData.paymentBy === 'sender'}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({ ...prev, paymentBy: e.target.value, paidAmount: '' }));
                                                                setErrors(prev => ({ ...prev, paidAmount: null }));
                                                            }}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Sender Pays</span>
                                                    </label>
                                                    <label className="flex items-center cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="paymentBy"
                                                            value="receiver"
                                                            checked={formData.paymentBy === 'receiver'}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({ ...prev, paymentBy: e.target.value, paidAmount: '' }));
                                                                setErrors(prev => ({ ...prev, paidAmount: null }));
                                                            }}
                                                            className="form-radio"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Receiver Pays</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Payment Details - Only show when Sender Pays */}
                                            {formData.paymentBy === 'sender' && (
                                                <>
                                                    {/* Payment Mode */}
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                                        <select
                                                            value={paymentMode}
                                                            onChange={(e) => setPaymentMode(e.target.value)}
                                                            className="form-select"
                                                        >
                                                            <option value="cash">Cash</option>
                                                            <option value="card">Card</option>
                                                            <option value="upi">UPI</option>
                                                            <option value="bank_transfer">Bank Transfer</option>
                                                            <option value="cheque">Cheque</option>
                                                            <option value="wallet">Wallet</option>
                                                        </select>
                                                    </div>

                                                    {/* Paid Amount with Max Validation */}
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Paid Amount (₹)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                                            <input
                                                                type="text"
                                                                value={formData.paidAmount}
                                                                onChange={(e) => handlePaidAmountChange(e.target.value)}
                                                                className={`form-input w-full pl-6 ${errors.paidAmount ? 'border-red-500' : ''}`}
                                                                placeholder={`Max: ₹${safeToFixed(totalAmount)}`}
                                                            />
                                                        </div>
                                                        {errors.paidAmount && (
                                                            <p className="mt-1 text-xs text-red-600">{errors.paidAmount}</p>
                                                        )}
                                                        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                                                            <span>Leave empty if not paid</span>
                                                            <span className="font-medium text-gray-700">
                                                                Due: ₹{safeToFixed(totalAmount - safeParseFloat(formData.paidAmount))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            
                                            {/* Show message when Receiver Pays */}
                                            {formData.paymentBy === 'receiver' && (
                                                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
                                                    <p>Payment will be collected from receiver at the time of delivery.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total Summary */}
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">Total Summary</h3>
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3">
                                            <div className="text-xl sm:text-2xl font-bold text-primary text-center mb-1">
                                                ₹{safeToFixed(totalAmount)}
                                            </div>
                                            <div className="text-xs text-gray-600 text-center mb-3">Total Amount</div>
                                            <div className="space-y-1">
                                                {formData.packages.map((pkg, index) => {
                                                    const pkgType = packageTypeData.find(pt => pt.package_type_id === pkg.packageTypeId);
                                                    return (
                                                        <div key={index} className="flex justify-between text-xs">
                                                            <span className="text-gray-600 truncate">
                                                                {pkgType?.package_type_name || 'Item'} {index + 1}:
                                                            </span>
                                                            <span className="font-medium whitespace-nowrap">
                                                                ₹{safeToFixed(calculatePackageTotal(pkg))}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-blue-200 text-xs text-gray-500">
                                                Includes pickup, drop, and handling charges
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                                <button 
                                    type="button" 
                                    onClick={resetForm} 
                                    className="btn btn-outline-primary hover:shadow-md transition-all duration-300 text-xs sm:text-sm py-2"
                                >
                                    Clear Form
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm py-2 px-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : (isEdit ? 'Update Package' : 'Record Package')}
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
                    {loading && !showForm ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <span className="ml-3">Loading packages...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-danger">
                            Error loading packages: {error}
                        </div>
                    ) : packageData.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No packages found. Click "Add New Package" to get started.
                        </div>
                    ) : (
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
                            responsive={true}
                            className="rounded-lg overflow-hidden"
                        />
                    )}
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
                        <input 
                            type="text" 
                            value={newCustomer.mobileNo} 
                            disabled 
                            className="form-input w-full bg-gray-100" 
                        />
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Office Center</label>
                        <input 
                            type="text" 
                            value={officeCentersWithLocationsData.find(c => c.office_center_id === newLocation.officeCenterId)?.office_center_name || ''} 
                            disabled 
                            className="form-input w-full bg-gray-100" 
                        />
                        <p className="text-xs text-gray-500 mt-1">Location will be added to this center</p>
                    </div>
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
                        <p className="text-xs text-gray-500 mt-1">Enter the name for this location</p>
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
                                    <div className="text-base font-bold text-gray-800">
                                        Booking #{selectedViewPackage.booking_number || selectedViewPackage.booking_id}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {new Date(selectedViewPackage.booking_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedViewPackage.payment_status === 'completed' 
                                                ? 'bg-green-100 text-green-800' 
                                                : selectedViewPackage.payment_status === 'partial'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {selectedViewPackage.payment_status || 'pending'}
                                    </div>
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedViewPackage.delivery_status === 'delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : selectedViewPackage.delivery_status === 'in_transit'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {selectedViewPackage.delivery_status || 'not_started'}
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
                                            {selectedViewPackage.fromCenter?.office_center_name || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">To Center</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                                            {selectedViewPackage.toCenter?.office_center_name || 'N/A'}
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
                                            {selectedViewPackage.fromLocation?.location_name || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">To Location</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconMapPin className="w-3 h-3 mr-1 text-green-500" />
                                            {selectedViewPackage.toLocation?.location_name || 'N/A'}
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
                                            {selectedViewPackage.fromCustomer?.customer_name || 'N/A'} 
                                            ({selectedViewPackage.fromCustomer?.customer_number || 'N/A'})
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Receiver</div>
                                        <div className="font-medium flex items-center text-sm">
                                            <IconUser className="w-3 h-3 mr-1 text-green-500" />
                                            {selectedViewPackage.toCustomer?.customer_name || 'N/A'} 
                                            ({selectedViewPackage.toCustomer?.customer_number || 'N/A'})
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded p-3 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Payment Information</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Payment By</div>
                                        <div className="text-base font-medium">
                                            {selectedViewPackage.payment_by === 'sender' ? 'Sender' : 'Receiver'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-600 mb-0.5">Paid Amount</div>
                                        <div className={`text-base font-bold ${selectedViewPackage.paid_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{formatNumber(selectedViewPackage.paid_amount)}
                                        </div>
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
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Pickup</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Drop</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Handling</th>
                                            <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedViewPackage.packages?.map((pkg, index) => (
                                            <tr key={index}>
                                                <td className="px-2 py-1 text-xs">{pkg.packageType?.package_type_name || 'N/A'}</td>
                                                <td className="px-2 py-1 text-xs">{pkg.quantity}</td>
                                                <td className="px-2 py-1 text-xs">₹{formatNumber(pkg.pickup_charge)}</td>
                                                <td className="px-2 py-1 text-xs">₹{formatNumber(pkg.drop_charge)}</td>
                                                <td className="px-2 py-1 text-xs">₹{formatNumber(pkg.handling_charge)}</td>
                                                <td className="px-2 py-1 text-xs font-medium">₹{formatNumber(pkg.total_package_charge)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <td colSpan="5" className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                                                Total Amount:
                                            </td>
                                            <td className="px-2 py-1 text-base font-bold text-primary">
                                                ₹{formatNumber(selectedViewPackage.total_amount)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Additional Info */}
                        {selectedViewPackage.special_instructions && (
                            <div className="bg-gray-50 rounded p-3 border border-gray-200">
                                <h4 className="font-medium text-gray-700 mb-2 text-sm">Special Instructions</h4>
                                <p className="text-sm">{selectedViewPackage.special_instructions}</p>
                            </div>
                        )}

                        {/* Balance Due */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <div className="text-xs text-gray-600 mb-0.5">Total Amount</div>
                                    <div className="text-xl font-bold text-primary">₹{formatNumber(selectedViewPackage.total_amount)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-0.5">Paid Amount</div>
                                    <div className={`text-xl font-bold ${selectedViewPackage.paid_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₹{formatNumber(selectedViewPackage.paid_amount)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-0.5">Balance Due</div>
                                    <div className="text-xl font-bold text-orange-600">
                                        ₹{formatNumber((selectedViewPackage.total_amount || 0) - (selectedViewPackage.paid_amount || 0))}
                                    </div>
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