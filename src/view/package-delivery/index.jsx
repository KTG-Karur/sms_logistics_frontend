import { useState, useEffect, useMemo, useCallback } from 'react';
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
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconSearch from '../../components/Icon/IconSearch';
import IconFilter from '../../components/Icon/IconCoffee';
import IconCheck from '../../components/Icon/IconCheck';
import IconEdit from '../../components/Icon/IconEdit';
import IconX from '../../components/Icon/IconX';
import {
    getDeliveries,
    updateDeliveryStatus,
    resetDeliveryStatus,
    setDeliveryFilters,
    clearDeliveryFilters
} from '../../redux/deliverySlice';
import { getOfficeCenters } from '../../redux/officeCenterSlice';

// Custom responsive table component
const ResponsiveTable = ({ columns, data, pageSize = 10, pageIndex = 0, onPaginationChange, onSearchChange, pagination = true, isSearchable = true, searchPlaceholder = "Search...", showPageSize = true, showStatusFilter = false, statusFilterValue = 'all', onStatusFilterChange }) => {
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
                                <option value="not_started">Not Started</option>
                                <option value="pickup_assigned">Pickup Assigned</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
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

    // Get login info for permissions
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo || '{}');
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Delivery');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    // Redux state
    const deliveryState = useSelector((state) => state.DeliverySlice || {});
    const {
        deliveryData = [],
        loading = false,
        error = null,
        updateDeliveryStatusSuccess = false
    } = deliveryState;

    const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
    const { officeCentersData = [] } = officeCenterState;

    // Local states
    const [deliveries, setDeliveries] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        fromDate: '',
        toDate: '',
    });
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [actualDeliveryDate, setActualDeliveryDate] = useState('');
    const [showPackageModal, setShowPackageModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Load initial data
    useEffect(() => {
        dispatch(setPageTitle('Delivery Management'));
        fetchInitialData();
    }, [dispatch]);

    // Handle API responses
    useEffect(() => {
        if (updateDeliveryStatusSuccess) {
            showMessage('success', 'Delivery status updated successfully');
            setShowUpdateModal(false);
            setSelectedDelivery(null);
            setUpdateStatus('');
            setDeliveryNotes('');
            setActualDeliveryDate('');
            dispatch(resetDeliveryStatus());
            fetchDeliveries();
        }
        if (error) {
            showMessage('error', error);
            dispatch(resetDeliveryStatus());
        }
    }, [updateDeliveryStatusSuccess, error, dispatch]);

    // Update deliveries data from Redux
    useEffect(() => {
        if (deliveryData && deliveryData.length > 0) {
            setDeliveries(deliveryData);
        } else {
            setDeliveries([]);
        }
    }, [deliveryData]);

    const fetchInitialData = async () => {
        try {
            await Promise.all([
                dispatch(getDeliveries({})).unwrap(),
                dispatch(getOfficeCenters({})).unwrap()
            ]);
        } catch (error) {
            showMessage('error', 'Failed to load initial data');
        }
    };

    const fetchDeliveries = () => {
        const filterParams = {};
        if (filters.fromDate) filterParams.fromDate = filters.fromDate;
        if (filters.toDate) filterParams.toDate = filters.toDate;
        if (selectedStatus !== 'all') filterParams.deliveryStatus = selectedStatus;
        if (searchTerm) filterParams.search = searchTerm;
        
        dispatch(getDeliveries(filterParams));
    };

    useEffect(() => {
        fetchDeliveries();
    }, [filters, selectedStatus, searchTerm, dispatch]);

    // Get unique branches from deliveries
    const branches = useMemo(() => {
        if (!deliveries || deliveries.length === 0) {
            return [{ value: 'all', label: 'All Branches' }];
        }
        
        const uniqueBranches = [...new Set(
            deliveries
                .map(delivery => delivery.fromCenter?.office_center_name)
                .filter(Boolean)
        )];
        
        const branchOptions = uniqueBranches.map(branch => ({ 
            value: branch, 
            label: branch 
        }));
        
        return [{ value: 'all', label: 'All Branches' }, ...branchOptions];
    }, [deliveries]);

    // Filter deliveries by branch
    const filteredDeliveries = useMemo(() => {
        if (!deliveries || deliveries.length === 0) return [];
        
        let filtered = deliveries;
        
        if (selectedBranch !== 'all') {
            filtered = filtered.filter(delivery => 
                delivery.fromCenter?.office_center_name === selectedBranch
            );
        }
        
        return filtered;
    }, [deliveries, selectedBranch]);

    // Get status counts for stats
    const statusCounts = useMemo(() => {
        const counts = {
            total: deliveries.length,
            not_started: deliveries.filter(d => d.delivery_status === 'not_started').length,
            pickup_assigned: deliveries.filter(d => d.delivery_status === 'pickup_assigned').length,
            picked_up: deliveries.filter(d => d.delivery_status === 'picked_up').length,
            in_transit: deliveries.filter(d => d.delivery_status === 'in_transit').length,
            out_for_delivery: deliveries.filter(d => d.delivery_status === 'out_for_delivery').length,
            delivered: deliveries.filter(d => d.delivery_status === 'delivered').length,
            cancelled: deliveries.filter(d => d.delivery_status === 'cancelled').length,
        };
        return counts;
    }, [deliveries]);

    // Toggle delivery details
    const toggleDeliveryDetails = (deliveryId) => {
        setDeliveries(prevDeliveries =>
            prevDeliveries.map(delivery =>
                delivery.booking_id === deliveryId
                    ? { ...delivery, expanded: !delivery.expanded }
                    : { ...delivery, expanded: false }
            )
        );
    };

    // Handle status update
    const handleStatusUpdate = (delivery) => {
        setSelectedDelivery(delivery);
        setUpdateStatus(delivery.delivery_status || 'not_started');
        setDeliveryNotes(delivery.special_instructions || '');
        setActualDeliveryDate(delivery.actual_delivery_date || new Date().toISOString().split('T')[0]);
        setShowUpdateModal(true);
    };

    // Submit status update
    const submitStatusUpdate = () => {
        if (!selectedDelivery || !updateStatus) return;

        const statusData = {
            deliveryStatus: updateStatus,
        };

        if (actualDeliveryDate) {
            statusData.actualDeliveryDate = actualDeliveryDate;
        }

        dispatch(updateDeliveryStatus({
            bookingId: selectedDelivery.booking_id,
            statusData: statusData
        }));
    };

    // Handle quick status update
    const handleQuickStatusUpdate = (deliveryId, newStatus) => {
        const statusData = {
            deliveryStatus: newStatus,
            actualDeliveryDate: newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : null
        };

        dispatch(updateDeliveryStatus({
            bookingId: deliveryId,
            statusData: statusData
        }));
    };

    // View package details
    const viewPackageDetails = (pkg, delivery) => {
        setSelectedPackage({ 
            ...pkg, 
            bookingNumber: delivery.booking_number,
            fromCenter: delivery.fromCenter?.office_center_name,
            toCenter: delivery.toCenter?.office_center_name
        });
        setShowPackageModal(true);
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'not_started': return 'bg-gray-100 text-gray-800';
            case 'pickup_assigned': return 'bg-blue-100 text-blue-800';
            case 'picked_up': return 'bg-purple-100 text-purple-800';
            case 'in_transit': return 'bg-yellow-100 text-yellow-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'not_started': return '⏳';
            case 'pickup_assigned': return '📋';
            case 'picked_up': return '📦';
            case 'in_transit': return '🚚';
            case 'out_for_delivery': return '🚛';
            case 'delivered': return '✓';
            case 'cancelled': return '✗';
            default: return '📋';
        }
    };

    // Get status label
    const getStatusLabel = (status) => {
        switch (status) {
            case 'not_started': return 'Not Started';
            case 'pickup_assigned': return 'Pickup Assigned';
            case 'picked_up': return 'Picked Up';
            case 'in_transit': return 'In Transit';
            case 'out_for_delivery': return 'Out for Delivery';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    // Get status options for dropdown
    const statusOptions = [
        { value: 'not_started', label: 'Not Started', icon: '⏳' },
        { value: 'pickup_assigned', label: 'Pickup Assigned', icon: '📋' },
        { value: 'picked_up', label: 'Picked Up', icon: '📦' },
        { value: 'in_transit', label: 'In Transit', icon: '🚚' },
        { value: 'out_for_delivery', label: 'Out for Delivery', icon: '🚛' },
        { value: 'delivered', label: 'Delivered', icon: '✓' },
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

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ fromDate: '', toDate: '' });
        setSelectedStatus('all');
        setSearchTerm('');
    };

    // Delivery details component
    const DeliveryDetails = ({ delivery }) => {
        if (!delivery.expanded) return null;

        return (
            <div className="bg-gray-50 rounded-lg mt-4 p-4 sm:p-6 border border-gray-200 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {/* Booking Information */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconInfoCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                            Booking Information
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Booking No:</span>
                                <span className="font-medium text-blue-600">{delivery.booking_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">LLR No:</span>
                                <span className="font-medium">{delivery.llr_number || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Booking Date:</span>
                                <span className="font-medium">{new Date(delivery.booking_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">From Center:</span>
                                <span className="font-medium">{delivery.fromCenter?.office_center_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">To Center:</span>
                                <span className="font-medium">{delivery.toCenter?.office_center_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">From Location:</span>
                                <span className="font-medium">{delivery.fromLocation?.location_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">To Location:</span>
                                <span className="font-medium">{delivery.toLocation?.location_name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                            Customer Information
                        </h4>
                        <div className="space-y-3 text-xs sm:text-sm">
                            <div>
                                <div className="text-gray-600 font-medium mb-1">Sender:</div>
                                <div className="font-medium">{delivery.fromCustomer?.customer_name}</div>
                                <div className="text-gray-600">{delivery.fromCustomer?.customer_number}</div>
                            </div>
                            <div>
                                <div className="text-gray-600 font-medium mb-1">Receiver:</div>
                                <div className="font-medium">{delivery.toCustomer?.customer_name}</div>
                                <div className="text-gray-600">{delivery.toCustomer?.customer_number}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-gray-600 font-medium mb-1">Payment:</div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        delivery.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 
                                        delivery.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {delivery.payment_status}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-gray-600 font-medium mb-1">Payment By:</div>
                                    <span className="font-medium">{delivery.payment_by}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base lg:text-lg">
                            <IconTruck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                            Delivery Information
                        </h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.delivery_status)}`}>
                                    {getStatusIcon(delivery.delivery_status)} {getStatusLabel(delivery.delivery_status)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Actual Delivery Date:</span>
                                <span className="font-medium">{delivery.actual_delivery_date ? new Date(delivery.actual_delivery_date).toLocaleDateString() : 'Not delivered'}</span>
                            </div>
                            {delivery.special_instructions && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <span className="text-gray-600 font-medium">Special Instructions:</span>
                                    <p className="text-xs text-yellow-600 mt-1">{delivery.special_instructions}</p>
                                </div>
                            )}
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
                                <span className="font-medium">{delivery.packages?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-medium text-green-600">₹{delivery.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Paid Amount:</span>
                                <span className="font-medium">₹{delivery.paid_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Due Amount:</span>
                                <span className={`font-medium ${delivery.due_amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ₹{delivery.due_amount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                {delivery.packages && delivery.packages.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg border-b pb-2">
                            Package Details ({delivery.packages.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {delivery.packages.map((pkg, index) => (
                                <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-gray-800 text-sm sm:text-base">
                                                {pkg.packageType?.package_type_name} × {pkg.quantity}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.delivery_status)}`}>
                                            {getStatusIcon(delivery.delivery_status)} {getStatusLabel(delivery.delivery_status)}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Pickup Charge:</span>
                                            <span className="font-medium">₹{pkg.pickup_charge}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Drop Charge:</span>
                                            <span className="font-medium">₹{pkg.drop_charge}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Handling Charge:</span>
                                            <span className="font-medium">₹{pkg.handling_charge}</span>
                                        </div>
                                        <div className="flex justify-between font-medium pt-1 border-t border-gray-100">
                                            <span className="text-gray-600">Total:</span>
                                            <span className="text-primary">₹{pkg.total_package_charge}</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => viewPackageDetails(pkg, delivery)}
                                            className="btn btn-outline-primary btn-xs sm:btn-sm w-full text-xs sm:text-sm"
                                        >
                                            <IconEye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => handleStatusUpdate(delivery)}
                        className="btn btn-primary btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                    >
                        <IconEdit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Update Delivery Status
                    </button>
                    {delivery.delivery_status === 'out_for_delivery' && (
                        <button
                            onClick={() => handleQuickStatusUpdate(delivery.booking_id, 'delivered')}
                            className="btn btn-success btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                        >
                            <IconCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Mark as Delivered
                        </button>
                    )}
                    {delivery.delivery_status === 'in_transit' && (
                        <button
                            onClick={() => handleQuickStatusUpdate(delivery.booking_id, 'out_for_delivery')}
                            className="btn btn-warning btn-sm sm:btn-md flex-1 text-xs sm:text-sm"
                        >
                            <IconTruck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Mark as Out for Delivery
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Table columns
    const columns = useMemo(() => [
        {
            Header: 'Booking No',
            accessor: 'booking_number',
            Cell: ({ value, row }) => {
                const delivery = row.original;
                return (
                    <div className="font-medium">
                        <div className="text-primary font-bold text-sm sm:text-base">{value}</div>
                        <div className="text-xs text-gray-500 mt-1">{delivery.llr_number || 'No LLR'}</div>
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
                const delivery = row.original;
                return (
                    <div className="space-y-1">
                        <div className="font-medium text-gray-800 text-sm sm:text-base">
                            {delivery.fromCustomer?.customer_name}
                        </div>
                        <div className="text-xs text-gray-600">
                            {delivery.fromCustomer?.customer_number}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <IconMapPin className="w-3 h-3 mr-1" />
                            {delivery.fromCenter?.office_center_name} → {delivery.toCenter?.office_center_name}
                        </div>
                    </div>
                );
            },
            width: 180,
            mobileFull: true,
        },
        {
            Header: 'Receiver',
            accessor: 'receiver',
            Cell: ({ row }) => {
                const delivery = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-sm font-medium">{delivery.toCustomer?.customer_name}</div>
                        <div className="text-xs text-gray-600">{delivery.toCustomer?.customer_number}</div>
                    </div>
                );
            },
            width: 140,
            mobileFull: false,
        },
        {
            Header: 'Packages',
            accessor: 'packages',
            Cell: ({ row }) => {
                const delivery = row.original;
                return (
                    <div className="space-y-1">
                        <div className="text-sm font-medium">{delivery.packages?.length || 0} items</div>
                        <div className="text-xs text-gray-600">₹{delivery.total_amount}</div>
                    </div>
                );
            },
            width: 100,
            mobileFull: false,
        },
        {
            Header: 'Status',
            accessor: 'delivery_status',
            Cell: ({ value }) => {
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                        {getStatusIcon(value)} {getStatusLabel(value)}
                    </span>
                );
            },
            width: 130,
            mobileFull: false,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const delivery = row.original;
                return (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Tippy content={delivery.expanded ? "Hide Details" : "View Details"}>
                            <button
                                onClick={() => toggleDeliveryDetails(delivery.booking_id)}
                                className="btn btn-outline-primary btn-xs sm:btn-sm p-1 sm:p-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                            >
                                {delivery.expanded ? <IconChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <IconEye className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </button>
                        </Tippy>
                        <Tippy content="Update Status">
                            <button
                                onClick={() => handleStatusUpdate(delivery)}
                                className="btn btn-outline-success btn-xs sm:btn-sm p-1 sm:p-1.5 rounded-lg hover:bg-success hover:text-white transition-colors"
                            >
                                <IconEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </Tippy>
                        {delivery.delivery_status === 'out_for_delivery' && (
                            <Tippy content="Mark Delivered">
                                <button
                                    onClick={() => handleQuickStatusUpdate(delivery.booking_id, 'delivered')}
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
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Delivery Management</h1>
                        <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                            Track and update delivery status for all bookings
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Total</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.total}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Not Started</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.not_started}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">In Transit</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.in_transit}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Out for Del</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.out_for_delivery}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Delivered</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.delivered}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Picked Up</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.picked_up}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 border border-gray-200">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Cancelled</p>
                            <p className="text-lg font-bold text-gray-800">{statusCounts.cancelled}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 mb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by booking number, customer name, phone..."
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
                            <div className="w-40">
                                <Select
                                    options={branches}
                                    value={branches.find(branch => branch.value === selectedBranch)}
                                    onChange={(option) => setSelectedBranch(option.value)}
                                    className="react-select"
                                    classNamePrefix="select"
                                    placeholder="Branch"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: '38px',
                                            fontSize: '14px',
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Deliveries Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="w-full lg:w-auto">
                            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Delivery Status</h2>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
                                Update delivery status and track progress
                            </p>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                            Showing {filteredDeliveries.length} of {deliveries.length} deliveries
                        </div>
                    </div>
                </div>
                <div className="p-3 sm:p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            <span className="ml-3">Loading deliveries...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-danger">
                            Error loading deliveries: {error}
                        </div>
                    ) : filteredDeliveries.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No deliveries found.
                        </div>
                    ) : (
                        <>
                            <ResponsiveTable
                                columns={columns}
                                data={filteredDeliveries}
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                onPaginationChange={handlePaginationChange}
                                onSearchChange={handleSearch}
                                pagination={true}
                                isSearchable={false}
                                searchPlaceholder="Search deliveries..."
                                showPageSize={true}
                                showStatusFilter={true}
                                statusFilterValue={selectedStatus}
                                onStatusFilterChange={setSelectedStatus}
                            />
                            {/* Render Delivery Details for expanded rows */}
                            {filteredDeliveries.filter(d => d.expanded).map(delivery => (
                                <DeliveryDetails key={delivery.booking_id} delivery={delivery} />
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Update Status Modal */}
            {showUpdateModal && selectedDelivery && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                Update Delivery Status
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm">
                                Booking: {selectedDelivery.booking_number}
                            </p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Status
                                    </label>
                                    <select
                                        value={updateStatus}
                                        onChange={(e) => setUpdateStatus(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.icon} {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {updateStatus === 'delivered' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Actual Delivery Date
                                        </label>
                                        <input
                                            type="date"
                                            value={actualDeliveryDate}
                                            onChange={(e) => setActualDeliveryDate(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Notes
                                    </label>
                                    <textarea
                                        value={deliveryNotes}
                                        onChange={(e) => setDeliveryNotes(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                                        rows="3"
                                        placeholder="Add any delivery notes..."
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setSelectedDelivery(null);
                                        setUpdateStatus('');
                                        setDeliveryNotes('');
                                        setActualDeliveryDate('');
                                    }}
                                    className="btn btn-outline-secondary w-full sm:w-auto"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitStatusUpdate}
                                    disabled={!updateStatus}
                                    className={`btn shadow-lg w-full sm:w-auto ${
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
                                Booking: {selectedPackage.bookingNumber}
                            </p>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <div className="text-xs text-gray-600">Package Type</div>
                                            <div className="font-medium text-sm">{selectedPackage.packageType?.package_type_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Quantity</div>
                                            <div className="font-medium text-sm">{selectedPackage.quantity}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Pickup Charge</div>
                                            <div className="font-medium text-sm">₹{selectedPackage.pickup_charge}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Drop Charge</div>
                                            <div className="font-medium text-sm">₹{selectedPackage.drop_charge}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Handling Charge</div>
                                            <div className="font-medium text-sm">₹{selectedPackage.handling_charge}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-600">Total</div>
                                            <div className="font-medium text-sm text-primary">₹{selectedPackage.total_package_charge}</div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Route</div>
                                    <div className="text-sm">{selectedPackage.fromCenter} → {selectedPackage.toCenter}</div>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPackageModal(false);
                                        setSelectedPackage(null);
                                    }}
                                    className="btn btn-outline-primary w-full"
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