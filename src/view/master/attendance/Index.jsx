import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage, dateConversion } from '../../../util/AllFunction';
import { getEmployee } from '../../../redux/employeeSlice';
import { 
    getStaffAttendance, 
    createStaffAttendance, 
    updateStaffAttendance,
    resetAttendanceStatus,
} from '../../../redux/attendanceSlice';
import { 
    getHoliday, 
    createHoliday, 
    resetHolidayStatus 
} from '../../../redux/holidaySlice';
import moment from 'moment';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconUser from '../../../components/Icon/IconUser';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconXCircle from '../../../components/Icon/IconXCircle';
import IconSun from '../../../components/Icon/IconSun';
import IconMinus from '../../../components/Icon/IconMinus';
import IconClock from '../../../components/Icon/IconClock';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPlus from '../../../components/Icon/IconPlus';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconDownload from '../../../components/Icon/IconDownload';

const Attendance = () => {
    const dispatch = useDispatch();
    
    // Redux state
    const { employeeData } = useSelector((state) => state.EmployeeSlice);
    const { 
        dailyAttendance, 
        createAttendanceSuccess, 
        updateAttendanceSuccess,
        loading: attendanceLoading 
    } = useSelector((state) => state.AttendanceSlice);
    const { 
        holidayData, 
        createHolidaySuccess,
        loading: holidayLoading 
    } = useSelector((state) => state.HolidaySlice);
    
    // Local state
    const [loading, setLoading] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [searchQuery, setSearchQuery] = useState('');
    const [showHolidayForm, setShowHolidayForm] = useState(false);
    const [showHolidayList, setShowHolidayList] = useState(false);
    
    // Login info for created_by/updated_by
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const currentUserId = localData?.employeeId || null;
    
    // Holiday form state
    const [holidayForm, setHolidayForm] = useState({
        holiday_date: '',
        reason: '',
        is_active: 1,
        created_by: currentUserId
    });
    
    // Filter
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ============= ATTENDANCE STATUS OPTIONS =============
    const attendanceStatuses = [
        { value: 'present', label: 'Present', color: 'success', icon: IconCheckCircle },
        { value: 'absent', label: 'Absent', color: 'danger', icon: IconXCircle },
        { value: 'halfday', label: 'Half Day', color: 'warning', icon: IconClock },
    ];

    // ============= INITIAL LOAD =============
    useEffect(() => {
        dispatch(setPageTitle('Attendance Management'));
        fetchEmployees();
        fetchAttendance();
        fetchHolidays();
    }, []);

    // ============= FETCH DATA =============
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            await dispatch(getEmployee({ is_active: 1 }));
        } catch (error) {
            showMessage('error', 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            await dispatch(getStaffAttendance({ 
                attendanceDate: selectedDate 
            }));
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        }
    };

    const fetchHolidays = async () => {
        try {
            await dispatch(getHoliday({ is_active: 1 }));
        } catch (error) {
            console.error('Failed to fetch holidays:', error);
        }
    };

    // ============= PROCESS EMPLOYEE DATA =============
    useEffect(() => {
        if (employeeData) {
            setEmployeeList(employeeData);
            setFilteredEmployees(employeeData);
        }
    }, [employeeData]);

    // ============= PROCESS ATTENDANCE DATA =============
    useEffect(() => {
        if (dailyAttendance && dailyAttendance.length > 0) {
            // Group by employee and date, take the latest record for each
            const attendanceMap = {};
            
            dailyAttendance.forEach(record => {
                const staffId = record.staffId;
                const date = record.attendanceDate;
                
                if (!attendanceMap[staffId]) {
                    attendanceMap[staffId] = {};
                }
                
                // Always overwrite with the latest record we get from API
                attendanceMap[staffId][date] = {
                    status: record.attendanceStatus,
                    attendanceId: record.staffAttendanceId,
                    markedAt: new Date().toISOString()
                };
            });
            
            setAttendanceData(attendanceMap);
        }
    }, [dailyAttendance]);

    // ============= PROCESS HOLIDAY DATA =============
    const [holidays, setHolidays] = useState([]);
    
    useEffect(() => {
        if (holidayData && holidayData.length > 0) {
            const formattedHolidays = holidayData.map((holiday, index) => ({
                id: holiday.holidayId || index,
                holidayId: holiday.holidayId,
                holidayName: holiday.reason || 'Holiday',
                holidayDate: moment(holiday.holidayDate).format('YYYY-MM-DD'),
                description: holiday.reason || '',
                isActive: holiday.isActive
            }));
            setHolidays(formattedHolidays);
        } else {
            setHolidays([]);
        }
    }, [holidayData]);

    // ============= RESPONSE HANDLERS =============
    useEffect(() => {
        if (createAttendanceSuccess || updateAttendanceSuccess) {
            showMessage('success', 'Attendance saved successfully');
            fetchAttendance();
            dispatch(resetAttendanceStatus());
        }
    }, [createAttendanceSuccess, updateAttendanceSuccess]);

    useEffect(() => {
        if (createHolidaySuccess) {
            showMessage('success', 'Holiday added successfully');
            fetchHolidays();
            setShowHolidayForm(false);
            setHolidayForm({
                holiday_date: '',
                reason: '',
                is_active: 1,
                created_by: currentUserId
            });
            dispatch(resetHolidayStatus());
        }
    }, [createHolidaySuccess]);

    // ============= FILTERING =============
    useEffect(() => {
        filterEmployees();
    }, [searchQuery, statusFilter, selectedDate, attendanceData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredEmployees]);

    const filterEmployees = () => {
        let filtered = [...employeeList];
        
        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(emp => 
                emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.mobileNo?.includes(searchQuery)
            );
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(emp => {
                const empAttendance = attendanceData[emp.employeeId]?.[selectedDate];
                
                // Handle holiday case
                if (isHoliday(selectedDate) && statusFilter === 'holiday') {
                    return true;
                }
                
                return empAttendance?.status === statusFilter;
            });
        }
        
        setFilteredEmployees(filtered);
    };

    // ============= ATTENDANCE HANDLERS =============
    const handleDateChange = (date) => {
        setSelectedDate(date);
        dispatch(getStaffAttendance({ attendanceDate: date }));
    };

    const isHoliday = (date) => {
        return holidays.some(holiday => holiday.holidayDate === date);
    };

    const getHolidayName = (date) => {
        const holiday = holidays.find(h => h.holidayDate === date);
        return holiday ? holiday.holidayName : null;
    };

    const handleAttendanceChange = async (employeeId, status) => {
        if (isHoliday(selectedDate)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(selectedDate)} holiday`);
            return;
        }

        const attendancePayload = {
            staffAttendance: [{
                staffId: employeeId,
                attendanceDate: selectedDate,
                attendanceStatus: status,
                updatedBy: currentUserId,
                createdBy: currentUserId
            }]
        };

        try {
            await dispatch(updateStaffAttendance(attendancePayload));
        } catch (error) {
            showMessage('error', 'Failed to mark attendance');
        }
    };

    const markAllAttendance = async (status) => {
        if (isHoliday(selectedDate)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(selectedDate)} holiday`);
            return;
        }

        const attendancePayload = {
            staffAttendance: filteredEmployees.map(emp => ({
                staffId: emp.employeeId,
                attendanceDate: selectedDate,
                attendanceStatus: status,
                updatedBy: currentUserId,
                createdBy: currentUserId
            }))
        };

        try {
            await dispatch(updateStaffAttendance(attendancePayload));
            showMessage('success', `Marked all employees as ${status.replace('-', ' ')}`);
        } catch (error) {
            showMessage('error', 'Failed to mark all attendance');
        }
    };

    // ============= HOLIDAY HANDLERS =============
    const handleSaveHoliday = async () => {
        if (!holidayForm.reason?.trim()) {
            showMessage('error', 'Please enter holiday name');
            return;
        }
        
        if (!holidayForm.holiday_date) {
            showMessage('error', 'Please select holiday date');
            return;
        }

        try {
            await dispatch(createHoliday(holidayForm));
        } catch (error) {
            showMessage('error', 'Failed to add holiday');
        }
    };

    const deleteHoliday = (holidayId) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this holiday?',
            async () => {
                showMessage('info', 'Delete functionality requires backend implementation');
            },
            'Yes, delete it'
        );
    };

    // ============= UTILITY FUNCTIONS =============
    const getAttendanceStatus = (employeeId) => {
        if (isHoliday(selectedDate)) {
            return 'holiday';
        }
        const empAttendance = attendanceData[employeeId]?.[selectedDate];
        if (!empAttendance) return 'pending';
        return empAttendance.status || 'pending';
    };

    const getStatusDetails = (status) => {
        const statusMap = {
            'present': { color: 'success', icon: IconCheckCircle, label: 'Present' },
            'absent': { color: 'danger', icon: IconXCircle, label: 'Absent' },
            'halfday': { color: 'warning', icon: IconClock, label: 'Half Day' },
            'holiday': { color: 'purple', icon: IconSun, label: 'Holiday' },
            'sunday': { color: 'purple', icon: IconSun, label: 'Sunday' },
            'pending': { color: 'light', icon: IconMinus, label: 'Pending' }
        };
        return statusMap[status] || statusMap.pending;
    };

    const getStatusColor = (status) => {
        return getStatusDetails(status).color;
    };

    const getStatusIcon = (status) => {
        const details = getStatusDetails(status);
        const IconComponent = details.icon;
        return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
    };

    const getStatusLabel = (status) => {
        return getStatusDetails(status).label;
    };

    const getStatusCount = (status) => {
        if (status === 'holiday') {
            return isHoliday(selectedDate) ? 1 : 0;
        }
        if (status === 'pending') {
            return filteredEmployees.filter(emp => 
                getAttendanceStatus(emp.employeeId) === 'pending'
            ).length;
        }
        return filteredEmployees.filter(emp => 
            getAttendanceStatus(emp.employeeId) === status
        ).length;
    };

    // ============= PAGINATION =============
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const goToPage = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    // ============= EXPORT =============
    const exportAttendance = () => {
        const data = {
            date: selectedDate,
            holiday: isHoliday(selectedDate) ? getHolidayName(selectedDate) : 'No',
            employees: filteredEmployees.map(emp => ({
                name: emp.employeeName,
                status: getAttendanceStatus(emp.employeeId),
                statusLabel: getStatusLabel(getAttendanceStatus(emp.employeeId)),
                markedAt: attendanceData[emp.employeeId]?.[selectedDate]?.markedAt 
                    ? moment(attendanceData[emp.employeeId][selectedDate].markedAt).format('HH:mm:ss') 
                    : 'N/A'
            }))
        };

        const csvContent = [
            ['Date', selectedDate],
            ['Holiday', data.holiday],
            [''],
            ['Employee Name', 'Status', 'Marked Time'],
            ...data.employees.map(emp => [
                emp.name,
                emp.statusLabel,
                emp.markedAt
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('success', 'Attendance exported successfully');
    };

    // ============= COMPONENTS =============
    const HolidayBadge = () => {
        if (isHoliday(selectedDate)) {
            return (
                <div className="inline-flex items-center px-3 py-2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm font-medium">
                    <IconSun className="w-4 h-4 mr-2" />
                    {getHolidayName(selectedDate)} - Holiday
                </div>
            );
        }
        return null;
    };

    // ============= RENDER =============
    const isLoading = loading || attendanceLoading || holidayLoading;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="panel">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white-light">
                            Attendance Management
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Mark daily attendance (Present / Absent / Half Day)
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* Date Selector */}
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <IconCalendar className="w-5 h-5 text-primary" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="form-input bg-transparent border-0 focus:ring-0"
                            />
                        </div>
                        {/* Holiday Indicator */}
                        <HolidayBadge />
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input pl-10"
                        />
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-select"
                    >
                        <option value="all">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="halfday">Half Day</option>
                        <option value="pending">Pending</option>
                        <option value="holiday">Holiday</option>
                    </select>
                    
                    {/* Show Per Page */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="form-select"
                    >
                        <option value="5">5 per page</option>
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                    </select>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {['present', 'absent', 'halfday', 'pending', 'holiday'].map((status) => {
                        const count = getStatusCount(status);
                        if (status === 'holiday' && count === 0) return null;
                        
                        return (
                            <div
                                key={status}
                                className={`bg-${getStatusColor(status)}-50 dark:bg-${getStatusColor(status)}-900/20 p-4 rounded-lg`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                                            {getStatusLabel(status)}
                                        </div>
                                        <div className={`text-2xl font-bold text-${getStatusColor(status)}-600`}>
                                            {count}
                                        </div>
                                    </div>
                                    {getStatusIcon(status)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons - All Three Buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => markAllAttendance('present')}
                        disabled={isHoliday(selectedDate)}
                        className={`btn btn-success ${
                            isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <IconCheckCircle className="w-4 h-4 mr-2" />
                        Mark All Present
                    </button>
                    <button
                        onClick={() => markAllAttendance('absent')}
                        disabled={isHoliday(selectedDate)}
                        className={`btn btn-danger ${
                            isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <IconXCircle className="w-4 h-4 mr-2" />
                        Mark All Absent
                    </button>
                    <button
                        onClick={() => markAllAttendance('halfday')}
                        disabled={isHoliday(selectedDate)}
                        className={`btn btn-warning ${
                            isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <IconClock className="w-4 h-4 mr-2" />
                        Mark All Half Day
                    </button>
                    <button
                        onClick={() => setShowHolidayForm(true)}
                        className="btn btn-info"
                    >
                        <IconPlus className="w-4 h-4 mr-2" />
                        Add Holiday
                    </button>
                    <button
                        onClick={() => setShowHolidayList(true)}
                        className="btn btn-warning"
                    >
                        View Holidays
                    </button>
                    <button
                        onClick={exportAttendance}
                        className="btn btn-primary"
                    >
                        <IconDownload className="w-4 h-4 mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="panel">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        Attendance for {dateConversion(selectedDate, 'DD MMMM YYYY')}
                        {isHoliday(selectedDate) && (
                            <span className="ml-2 text-purple-600">(Holiday)</span>
                        )}
                    </h3>
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="px-4 py-3 text-left">S.No</th>
                                        <th className="px-4 py-3 text-left">Employee</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((employee, index) => {
                                        const status = getAttendanceStatus(employee.employeeId);
                                        const statusDetails = getStatusDetails(status);
                                        const markedTime = attendanceData[employee.employeeId]?.[selectedDate]?.markedAt
                                            ? moment(attendanceData[employee.employeeId][selectedDate].markedAt).format('HH:mm')
                                            : null;
                                        const isDisabled = status === 'holiday';
                                        
                                        return (
                                            <tr
                                                key={employee.employeeId}
                                                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                                            >
                                                <td className="px-4 py-3">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <IconUser className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div className="font-medium">
                                                            {employee.employeeName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-${statusDetails.color}`}>
                                                            {statusDetails.icon && <statusDetails.icon className="w-5 h-5" />}
                                                        </span>
                                                        <span className={`badge badge-${statusDetails.color} capitalize`}>
                                                            {statusDetails.label}
                                                        </span>
                                                        {markedTime && status !== 'holiday' && status !== 'pending' && (
                                                            <span className="text-xs text-gray-500">
                                                                at {markedTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        {/* Present Button */}
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'present')}
                                                            disabled={isDisabled || status === 'present'}
                                                            className={`btn btn-outline-success btn-sm ${
                                                                isDisabled || status === 'present' ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <IconCheckCircle className="w-3 h-3 mr-1" />
                                                            Present
                                                        </button>
                                                        
                                                        {/* Absent Button */}
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'absent')}
                                                            disabled={isDisabled || status === 'absent'}
                                                            className={`btn btn-outline-danger btn-sm ${
                                                                isDisabled || status === 'absent' ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <IconXCircle className="w-3 h-3 mr-1" />
                                                            Absent
                                                        </button>
                                                        
                                                        {/* Half Day Button */}
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'halfday')}
                                                            disabled={isDisabled || status === 'halfday'}
                                                            className={`btn btn-outline-warning btn-sm ${
                                                                isDisabled || status === 'halfday' ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <IconClock className="w-3 h-3 mr-1" />
                                                            Half Day
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {currentItems.map((employee, index) => {
                                const status = getAttendanceStatus(employee.employeeId);
                                const statusDetails = getStatusDetails(status);
                                const markedTime = attendanceData[employee.employeeId]?.[selectedDate]?.markedAt
                                    ? moment(attendanceData[employee.employeeId][selectedDate].markedAt).format('HH:mm')
                                    : null;
                                const isDisabled = status === 'holiday';
                                
                                return (
                                    <div
                                        key={employee.employeeId}
                                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <IconUser className="w-5 h-5 text-primary" />
                                                </div>
                                            </div>
                                            <span className={`badge badge-${statusDetails.color} capitalize`}>
                                                {statusDetails.label}
                                            </span>
                                        </div>
                                        
                                        {markedTime && status !== 'holiday' && status !== 'pending' && (
                                            <div className="text-sm text-gray-500 mb-3">
                                                Marked at: {markedTime}
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                                            <button
                                                onClick={() => handleAttendanceChange(employee.employeeId, 'present')}
                                                disabled={isDisabled || status === 'present'}
                                                className={`btn btn-success btn-sm ${
                                                    isDisabled || status === 'present' ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleAttendanceChange(employee.employeeId, 'absent')}
                                                disabled={isDisabled || status === 'absent'}
                                                className={`btn btn-danger btn-sm ${
                                                    isDisabled || status === 'absent' ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                Absent
                                            </button>
                                            <button
                                                onClick={() => handleAttendanceChange(employee.employeeId, 'halfday')}
                                                disabled={isDisabled || status === 'halfday'}
                                                className={`btn btn-warning btn-sm ${
                                                    isDisabled || status === 'halfday' ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                Half Day
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex flex-col md:flex-row items-center justify-between">
                                <div className="text-sm text-gray-500 mb-2 md:mb-0">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className="btn btn-outline-primary btn-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`btn btn-sm ${
                                                currentPage === page ? 'btn-primary' : 'btn-outline-primary'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className="btn btn-outline-primary btn-sm disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Holiday Form Modal */}
            {showHolidayForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Add Holiday</h3>
                            <button
                                onClick={() => setShowHolidayForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Holiday Name *
                                </label>
                                <input
                                    type="text"
                                    value={holidayForm.reason}
                                    onChange={(e) => setHolidayForm(prev => ({
                                        ...prev,
                                        reason: e.target.value
                                    }))}
                                    className="form-input w-full"
                                    placeholder="Enter holiday name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={holidayForm.holiday_date}
                                    onChange={(e) => setHolidayForm(prev => ({
                                        ...prev,
                                        holiday_date: e.target.value
                                    }))}
                                    className="form-input w-full"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t flex justify-end space-x-2">
                            <button
                                onClick={() => setShowHolidayForm(false)}
                                className="btn btn-outline-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveHoliday}
                                className="btn btn-primary"
                                disabled={holidayLoading}
                            >
                                {holidayLoading ? 'Saving...' : 'Save Holiday'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Holiday List Modal */}
            {showHolidayList && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                Holiday List ({holidays.length})
                            </h3>
                            <button
                                onClick={() => setShowHolidayList(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {holidays.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No holidays added yet
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900">
                                                <th className="px-4 py-3 text-left">Holiday Name</th>
                                                <th className="px-4 py-3 text-left">Date</th>
                                                <th className="px-4 py-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holidays.map(holiday => (
                                                <tr key={holiday.id} className="border-b dark:border-gray-700">
                                                    <td className="px-4 py-3 font-medium">
                                                        {holiday.holidayName}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {dateConversion(holiday.holidayDate, 'DD MMMM YYYY')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => deleteHoliday(holiday.holidayId)}
                                                            className="btn btn-outline-danger btn-sm"
                                                        >
                                                            <IconTrashLines className="w-3 h-3 mr-1" />
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-between">
                            <div className="text-sm text-gray-500">
                                Total Holidays: {holidays.length}
                            </div>
                            <button
                                onClick={() => setShowHolidayList(false)}
                                className="btn btn-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;