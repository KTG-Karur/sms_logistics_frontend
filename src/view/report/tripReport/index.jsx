import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { getTripReport, resetTripReportStatus } from '../../../redux/reportSlice';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { getEmployee } from '../../../redux/employeeSlice';
import { getVehicles } from '../../../redux/vehiclesSlice';
import { showMessage } from '../../../util/AllFunction';

const TripReport = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Trip Report');
    
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const reportState = useSelector((state) => state.ReportSlice || {});
    const officeCentersState = useSelector((state) => state.OfficeCenterSlice || {});
    const employeeState = useSelector((state) => state.EmployeeSlice || {});
    const vehiclesState = useSelector((state) => state.VehiclesSlice || {});

    const {
        tripReportData = [],
        loadingTrip = false,
        errorTrip = null,
        getTripSuccess = false,
        getTripFailed = false
    } = reportState;

    const {
        officeCentersData = [],
        loading: officeLoading = false
    } = officeCentersState;

    const {
        employeeData = [],
        loading: employeeLoading = false
    } = employeeState;

    const {
        vehiclesData = [],
        loading: vehicleLoading = false
    } = vehiclesState;

    // States
    const [tripData, setTripData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [byCenter, setByCenter] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        limit: 20
    });

    const [filters, setFilters] = useState({
        selectedStatus: null,
        selectedVehicle: null,
        selectedDriver: null,
        selectedCenter: null,
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);

    useEffect(() => {
        dispatch(setPageTitle('Trip Report Management'));
        fetchInitialData();
    }, []);

    // Handle API response
    useEffect(() => {
        if (getTripSuccess && tripReportData) {
            if (tripReportData.data) {
                // Handle the response structure from your API
                setTripData(tripReportData.data.trips || []);
                setSummary(tripReportData.data.summary || null);
                setByCenter(tripReportData.data.by_center || []);
                setPagination(tripReportData.data.pagination || {
                    current_page: 1,
                    total_pages: 1,
                    total_records: 0,
                    limit: 20
                });
            }
            setSearchLoading(false);
            dispatch(resetTripReportStatus());
        }

        if (getTripFailed) {
            showMessage('error', errorTrip || 'Failed to fetch trip data');
            setSearchLoading(false);
            dispatch(resetTripReportStatus());
        }
    }, [getTripSuccess, getTripFailed, tripReportData, errorTrip]);

    const fetchInitialData = async () => {
        try {
            // Fetch office centers
            await dispatch(getOfficeCenters({}));
            
            // Fetch employees (drivers) - filter for drivers only
            await dispatch(getEmployee({ is_driver: '1' }));
            
            // Fetch vehicles
            await dispatch(getVehicles({}));
        } catch (error) {
            console.error('Error fetching initial data:', error);
            showMessage('error', 'Failed to load filter options');
        }
    };

    // Transform options for selects
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'delayed', label: 'Delayed' },
    ];

    const vehicleOptions = [
        { value: '', label: 'All Vehicles' },
        ...(vehiclesData || []).map(vehicle => ({
            value: vehicle.vehicle_id || vehicle.id,
            label: `${vehicle.vehicle_number_plate || vehicle.vehicleNumberPlate}`
        }))
    ];

    const driverOptions = [
        { value: '', label: 'All Drivers' },
        ...(employeeData || []).map(emp => ({
            value: emp.employeeId || emp.employee_id || emp.id,
            label: `${emp.employeeName || emp.employee_name} (${emp.mobileNo || emp.mobile_no})`
        }))
    ];

    const centerOptions = [
        { value: '', label: 'All Centers' },
        ...(officeCentersData || []).map(center => ({
            value: center.id || center.office_center_id,
            label: center.officeCentersName || center.office_center_name
        }))
    ];

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            width: 60,
            Cell: ({ row }) => <div className="text-center font-medium">{row.index + 1 + (currentPage * pageSize)}</div>,
        },
        {
            Header: 'Trip No',
            accessor: 'trip_number',
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Route',
            accessor: 'route',
            Cell: ({ row }) => {
                const trip = row.original;
                return (
                    <div>
                        <div className="font-medium text-sm">
                            {trip.fromCenter?.office_center_name || 'N/A'} → {trip.toCenter?.office_center_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                            {trip.trip_date ? moment(trip.trip_date).format('DD/MM/YYYY') : ''}
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Vehicle',
            accessor: 'vehicle',
            Cell: ({ row }) => (
                <div className="flex items-center">
                    <IconTruck className="w-3 h-3 mr-1 text-gray-500" />
                    <span className="text-sm">{row.original.vehicle?.vehicle_number_plate || 'N/A'}</span>
                </div>
            ),
        },
        {
            Header: 'Driver',
            accessor: 'driver',
            Cell: ({ row }) => (
                <div className="flex items-center">
                    <IconUser className="w-3 h-3 mr-1 text-gray-500" />
                    <span className="text-sm">{row.original.driver?.employee_name || 'N/A'}</span>
                </div>
            ),
        },
        {
            Header: 'Loadmen',
            accessor: 'loadmenCount',
            Cell: ({ row }) => (
                <div className="text-center">
                    {row.original.loadmen?.length || 0}
                </div>
            ),
        },
        {
            Header: 'Packages',
            accessor: 'total_packages',
            Cell: ({ value }) => (
                <div className="text-center font-medium">{value || 0}</div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'total_amount',
            Cell: ({ value }) => (
                <div className="font-bold text-green-600">₹{parseFloat(value || 0).toLocaleString('en-IN')}</div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                    {value ? value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ') : 'N/A'}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 100,
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
                    </div>
                );
            },
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!filters.startDate || !filters.endDate) {
            showMessage('error', 'Please select start and end dates');
            return;
        }

        setSearchLoading(true);

        const params = {
            startDate: filters.startDate,
            endDate: filters.endDate,
        };

        if (filters.selectedCenter?.value) {
            params.centerId = filters.selectedCenter.value;
        }

        if (filters.selectedDriver?.value) {
            params.driverId = filters.selectedDriver.value;
        }

        if (filters.selectedVehicle?.value) {
            params.vehicleId = filters.selectedVehicle.value;
        }

        if (filters.selectedStatus?.value) {
            params.status = filters.selectedStatus.value;
        }

        dispatch(getTripReport(params));
        setAppliedFilters({ ...filters });
        setCurrentPage(0);
    };

    const handleClear = () => {
        setFilters({
            selectedStatus: null,
            selectedVehicle: null,
            selectedDriver: null,
            selectedCenter: null,
            startDate: moment().startOf('month').format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
        });
        setAppliedFilters(null);
        setTripData([]);
        setSummary(null);
        setByCenter([]);
    };

    const handleViewDetails = (trip) => {
        setSelectedTrip(trip);
        setShowDetailsModal(true);
    };

    const handleExportReport = (trip) => {
        exportTripToExcel(trip);
    };

    const exportTripToExcel = (trip) => {
        const wb = XLSX.utils.book_new();

        // Main Trip Sheet
        const tripInfo = [
            ['COMPREHENSIVE TRIP REPORT'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['TRIP INFORMATION'],
            [`Trip No: ${trip.trip_number}`],
            [`Status: ${trip.status?.toUpperCase()}`],
            [`Trip Date: ${moment(trip.trip_date).format('DD/MM/YYYY')}`],
            [`From Center: ${trip.fromCenter?.office_center_name}`],
            [`To Center: ${trip.toCenter?.office_center_name}`],
            [],
            ['VEHICLE INFORMATION'],
            [`Vehicle Number: ${trip.vehicle?.vehicle_number_plate}`],
            [],
            ['DRIVER INFORMATION'],
            [`Driver Name: ${trip.driver?.employee_name}`],
            [`Driver Mobile: ${trip.driver?.mobile_no}`],
            [],
            ['LOADMEN TEAM'],
        ];

        trip.loadmen?.forEach((loadman, index) => {
            tripInfo.push([
                `${index + 1}. ${loadman.employee_name}`,
            ]);
        });

        tripInfo.push([]);
        tripInfo.push(['TRIP SUMMARY']);
        tripInfo.push([`Total Packages: ${trip.total_packages}`]);
        tripInfo.push([`Total Amount: ₹${parseFloat(trip.total_amount || 0).toLocaleString('en-IN')}`]);

        const ws1 = XLSX.utils.aoa_to_sheet(tripInfo);
        ws1['!cols'] = [{ wch: 25 }, { wch: 30 }];

        // Bookings Sheet
        const bookingsData = [
            ['BOOKINGS DETAILS'],
            [],
            ['Booking ID', 'Booking Number'],
        ];

        trip.bookings?.forEach((booking) => {
            bookingsData.push([
                booking.booking_id,
                booking.booking_number
            ]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(bookingsData);
        ws2['!cols'] = [{ wch: 40 }, { wch: 20 }];

        XLSX.utils.book_append_sheet(wb, ws1, 'Trip Report');
        XLSX.utils.book_append_sheet(wb, ws2, 'Bookings');

        const fileName = `Trip-Report-${trip.trip_number}-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onDownloadAllExcel = () => {
        if (!tripData.length) {
            showMessage('error', 'No data to export');
            return;
        }

        const wb = XLSX.utils.book_new();

        const header = [
            ['COMPREHENSIVE TRIP REPORTS'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [`Date Range: ${moment(filters.startDate).format('DD/MM/YYYY')} - ${moment(filters.endDate).format('DD/MM/YYYY')}`],
            [],
            [
                'Trip No',
                'Date',
                'From Center',
                'To Center',
                'Vehicle',
                'Driver',
                'Loadmen Count',
                'Packages',
                'Amount',
                'Status'
            ],
        ];

        const data = tripData.map((trip) => [
            trip.trip_number,
            moment(trip.trip_date).format('DD/MM/YYYY'),
            trip.fromCenter?.office_center_name || 'N/A',
            trip.toCenter?.office_center_name || 'N/A',
            trip.vehicle?.vehicle_number_plate || 'N/A',
            trip.driver?.employee_name || 'N/A',
            trip.loadmen?.length || 0,
            trip.total_packages || 0,
            parseFloat(trip.total_amount || 0).toFixed(2),
            trip.status || 'N/A'
        ]);

        const allRows = [...header, ...data];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        ws['!cols'] = [
            { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
            { wch: 12 }, { wch: 12 }
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'All Trips');

        const fileName = `All-Trip-Reports-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return tripData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => tripData.length;

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
        if (summary) {
            return {
                total: summary.total_trips || 0,
                totalRevenue: parseFloat(summary.total_amount || 0),
                totalPackages: summary.total_packages || 0,
                avgPackages: parseFloat(summary.average_packages_per_trip || 0),
                avgAmount: parseFloat(summary.average_amount_per_trip || 0),
                scheduled: summary.by_status?.scheduled || 0,
                in_progress: summary.by_status?.in_progress || 0,
                completed: summary.by_status?.completed || 0,
                cancelled: summary.by_status?.cancelled || 0
            };
        }

        // Calculate from trip data if no summary
        return {
            total: tripData.length,
            totalRevenue: tripData.reduce((sum, trip) => sum + parseFloat(trip.total_amount || 0), 0),
            totalPackages: tripData.reduce((sum, trip) => sum + (trip.total_packages || 0), 0),
            avgPackages: tripData.length > 0 ? 
                (tripData.reduce((sum, trip) => sum + (trip.total_packages || 0), 0) / tripData.length).toFixed(2) : 0,
            avgAmount: tripData.length > 0 ?
                (tripData.reduce((sum, trip) => sum + parseFloat(trip.total_amount || 0), 0) / tripData.length).toFixed(2) : 0,
            scheduled: tripData.filter(t => t.status === 'scheduled').length,
            in_progress: tripData.filter(t => t.status === 'in_progress').length,
            completed: tripData.filter(t => t.status === 'completed').length,
            cancelled: tripData.filter(t => t.status === 'cancelled').length
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
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">From Date *</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">To Date *</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    required
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

                            {/* Center Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Center</label>
                                <Select
                                    options={centerOptions}
                                    value={filters.selectedCenter}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedCenter: selectedOption })}
                                    placeholder="Select Center"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    isLoading={officeLoading}
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
                                    isLoading={employeeLoading}
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
                                    isLoading={vehicleLoading}
                                />
                            </div>
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
                                disabled={searchLoading || loadingTrip}
                            >
                                {searchLoading || loadingTrip ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                            {appliedFilters && tripData.length > 0 && (
                                <button
                                    type="button"
                                    onClick={onDownloadAllExcel}
                                    className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                                >
                                    <IconDownload className="mr-2 w-4 h-4" />
                                    Export Excel
                                </button>
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
            {tripData.length > 0 && (
                <>
                    {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
                                    <p className="text-xl font-bold text-gray-800 mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <IconMoney className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Packages</p>
                                    <p className="text-xl font-bold text-gray-800 mt-1">{stats.totalPackages}</p>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <IconPackage className="w-5 h-5 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Amount/Trip</p>
                                    <p className="text-xl font-bold text-gray-800 mt-1">₹{parseFloat(stats.avgAmount).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <IconMoney className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* Status Breakdown */}
                    {/* {(stats.scheduled > 0 || stats.in_progress > 0 || stats.completed > 0) && (
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown</h3>
                            <div className="flex flex-wrap gap-3">
                                {stats.scheduled > 0 && (
                                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-sm">
                                        Scheduled: {stats.scheduled}
                                    </div>
                                )}
                                {stats.in_progress > 0 && (
                                    <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm">
                                        In Progress: {stats.in_progress}
                                    </div>
                                )}
                                {stats.completed > 0 && (
                                    <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-sm">
                                        Completed: {stats.completed}
                                    </div>
                                )}
                                {stats.cancelled > 0 && (
                                    <div className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-sm">
                                        Cancelled: {stats.cancelled}
                                    </div>
                                )}
                            </div>
                        </div>
                    )} */}

                    {/* Center Breakdown */}
                    {/* {byCenter.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Trip Summary by Center</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Center</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Trips</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Packages</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {byCenter.map((center, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-medium">{center.center_name}</td>
                                                <td className="px-3 py-2 text-right">{center.trip_count}</td>
                                                <td className="px-3 py-2 text-right">{center.package_count}</td>
                                                <td className="px-3 py-2 text-right font-medium">₹{center.total_amount.toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )} */}
                </>
            )}

            {/* Loading States and Table */}
            {searchLoading || loadingTrip ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Fetching Trip Data</h3>
                        <p className="text-gray-500">Please wait while we fetch the trip information based on your criteria</p>
                    </div>
                </div>
            ) : appliedFilters && tripData.length > 0 ? (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Trip Reports</h3>
                                    <p className="text-gray-600 text-sm">
                                        Showing {tripData.length} records
                                        {appliedFilters.startDate && appliedFilters.endDate
                                            ? ` from ${moment(appliedFilters.startDate).format('DD MMM YYYY')} to ${moment(appliedFilters.endDate).format('DD MMM YYYY')}`
                                            : ''}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Total: </span>
                                        <span className="font-semibold text-blue-600">{stats.total}</span>
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
            ) : appliedFilters && tripData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Data Found</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">No trip records match your current search criteria. Try adjusting your filters or date range.</p>
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
                            Use the search filters above to generate detailed trip reports.
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
                modelHeader={`Trip Details - ${selectedTrip?.trip_number || ''}`}
                setModel={() => setShowDetailsModal(false)}
                modelSize="max-w-4xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedTrip && (
                    <div className="p-4 space-y-4">
                        {/* Header Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-blue-800 mb-2">Trip Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trip No:</span>
                                            <span className="font-bold">{selectedTrip.trip_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Status:</span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTrip.status)}`}>
                                                {selectedTrip.status?.toUpperCase().replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Trip Date:</span>
                                            <span className="font-medium">{moment(selectedTrip.trip_date).format('DD/MM/YYYY')}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-semibold text-green-800 mb-2">Route</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">From:</span>
                                            <span className="font-medium">{selectedTrip.fromCenter?.office_center_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">To:</span>
                                            <span className="font-medium">{selectedTrip.toCenter?.office_center_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle & Driver Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconTruck className="w-4 h-4 mr-2 text-blue-500" />
                                    Vehicle Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="bg-blue-50 p-2 rounded">
                                        <div className="text-xs text-blue-600 mb-1">Vehicle Number</div>
                                        <div className="font-bold">{selectedTrip.vehicle?.vehicle_number_plate || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-green-500" />
                                    Driver Information
                                </h4>
                                <div className="space-y-2">
                                    <div className="bg-green-50 p-2 rounded">
                                        <div className="text-xs text-green-600 mb-1">Driver Name</div>
                                        <div className="font-bold">{selectedTrip.driver?.employee_name || 'N/A'}</div>
                                        <div className="text-sm text-gray-600">{selectedTrip.driver?.mobile_no || ''}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loadmen Team */}
                        {selectedTrip.loadmen && selectedTrip.loadmen.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconUsers className="w-4 h-4 mr-2 text-purple-500" />
                                    Loadmen Team ({selectedTrip.loadmen.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedTrip.loadmen.map((loadman, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <div className="font-medium text-gray-800">{loadman.employee_name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                <IconClock className="w-4 h-4 mr-2 text-orange-500" />
                                Timeline
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Est Departure</div>
                                    <div className="font-medium">{selectedTrip.estimated_departure?.substring(0,5) || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Est Arrival</div>
                                    <div className="font-medium">{selectedTrip.estimated_arrival?.substring(0,5) || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Actual Departure</div>
                                    <div className="font-medium">{selectedTrip.actual_departure?.substring(0,5) || 'Not started'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Actual Arrival</div>
                                    <div className="font-medium">{selectedTrip.actual_arrival?.substring(0,5) || 'Not arrived'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bookings */}
                        {selectedTrip.bookings && selectedTrip.bookings.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                                    <IconPackage className="w-4 h-4 mr-2 text-indigo-500" />
                                    Bookings ({selectedTrip.bookings.length})
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking Number</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedTrip.bookings.map((booking, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2 font-mono text-xs">{booking.booking_number}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Trip Summary</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Total Packages</div>
                                    <div className="text-xl font-bold">{selectedTrip.total_packages || 0}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-600 mb-1">Total Amount</div>
                                    <div className="text-xl font-bold text-green-600">₹{parseFloat(selectedTrip.total_amount || 0).toLocaleString('en-IN')}</div>
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