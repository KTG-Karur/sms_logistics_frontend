import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage, dateConversion , getAccessIdsByLabel } from '../../../util/AllFunction';
import { getEmployee } from '../../../redux/employeeSlice';
import { 
    getStaffAttendanceList,
    getStaffAttendance,
    createStaffAttendance, 
    updateStaffAttendance,
    resetAttendanceStatus,
} from '../../../redux/attendanceSlice';
import { 
    getHoliday, 
    createHoliday, 
    resetHolidayStatus,
    deleteHoliday
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
import IconChevronLeft from '../../../components/Icon/IconChevronLeft';
import IconChevronRight from '../../../components/Icon/IconChevronRight';

const Attendance = () => {
    const dispatch = useDispatch();
    
    // Redux state
    const { employeeData } = useSelector((state) => state.EmployeeSlice);
    const { 
        monthlyAttendance,
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
    
    // Login info for permissions
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = loginInfo ? JSON.parse(loginInfo) : null;
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Staff Attendance');
    console.log(accessIds)
    const currentUserId = localData?.employeeId || null;
    
    // Extract access IDs for different permissions
    const viewAccessId = accessIds?.view || null;
    const createAccessId = accessIds?.create || null;
    const updateAccessId = accessIds?.update || null;
    const deleteAccessId = accessIds?.delete || null;
    
     const canView = accessIds?.includes('1') || false;
    const canCreate = accessIds?.includes('2') || false;
    const canUpdate = accessIds?.includes('3') || false;
    const canDelete = accessIds?.includes('4') || false;
    
    // Local state
    const [loading, setLoading] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));
    const [searchQuery, setSearchQuery] = useState('');
    const [showHolidayForm, setShowHolidayForm] = useState(false);
    const [showHolidayList, setShowHolidayList] = useState(false);
    const [viewMode, setViewMode] = useState('daily');
    
    // Holiday form state
    const [holidayForm, setHolidayForm] = useState({
        holiday_date: '',
        reason: '',
        is_active: 1,
        created_by: currentUserId
    });
    
    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ============= UTILITY FUNCTIONS =============
    const isFutureDate = (date) => {
        return moment(date).isAfter(moment(), 'day');
    };

    const isPastDate = (date) => {
        return moment(date).isBefore(moment(), 'day');
    };

    const isToday = (date) => {
        return moment(date).isSame(moment(), 'day');
    };

    // ============= INITIAL LOAD =============
    useEffect(() => {
        dispatch(setPageTitle('Attendance Management'));
        if (canView) {
            fetchEmployees();
            fetchDailyAttendance(selectedDate);
            fetchHolidays();
        } else {
            showMessage('error', 'You do not have permission to view attendance');
        }
    }, []);

    // ============= FETCH DATA =============
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            // Fetch only active employees with salary
            await dispatch(getEmployee({ 
                is_active: 1,
                has_salary: true
            }));
        } catch (error) {
            showMessage('error', 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyAttendance = async () => {
        try {
            await dispatch(getStaffAttendanceList({ 
                attendanceDate: selectedMonth + '-01'
            }));
        } catch (error) {
            console.error('Failed to fetch monthly attendance:', error);
        }
    };

    const fetchDailyAttendance = async (date) => {
        try {
            await dispatch(getStaffAttendance({ 
                attendanceDate: date 
            }));
        } catch (error) {
            console.error('Failed to fetch daily attendance:', error);
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
            // Filter employees to only show those with has_salary = true
            const salaryEmployees = employeeData.filter(emp => emp.hasSalary === true);
            setEmployeeList(salaryEmployees);
            setFilteredEmployees(salaryEmployees);
        }
    }, [employeeData]);

    // ============= PROCESS DAILY ATTENDANCE DATA =============
    const [attendanceData, setAttendanceData] = useState({});
    
    useEffect(() => {
        if (dailyAttendance && dailyAttendance.length > 0) {
            const attendanceMap = {};
            dailyAttendance.forEach(record => {
                const staffId = record.staffId;
                const date = record.attendanceDate;
                
                if (!attendanceMap[staffId]) {
                    attendanceMap[staffId] = {};
                }
                
                attendanceMap[staffId][date] = {
                    status: record.attendanceStatus,
                    attendanceId: record.staffAttendanceId,
                };
            });
            setAttendanceData(attendanceMap);
        }
    }, [dailyAttendance]);

    // ============= PROCESS MONTHLY ATTENDANCE DATA =============
    const [attendanceDetail, setAttendanceDetail] = useState([]);
    const [monthDates, setMonthDates] = useState([]);
    
    useEffect(() => {
        if (monthlyAttendance?.attendanceDetail) {
            setAttendanceDetail(monthlyAttendance.attendanceDetail);
            
            if (monthlyAttendance.attendanceDetail.length > 0) {
                const dates = Object.keys(monthlyAttendance.attendanceDetail[0].dailyStatus || {})
                    .sort((a, b) => new Date(a) - new Date(b));
                setMonthDates(dates);
            }
        }
    }, [monthlyAttendance]);

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
            if (viewMode === 'monthly') {
                fetchMonthlyAttendance();
            } else {
                fetchDailyAttendance(selectedDate);
            }
            dispatch(resetAttendanceStatus());
        }
    }, [createAttendanceSuccess, updateAttendanceSuccess, viewMode, selectedDate]);

    useEffect(() => {
        if (createHolidaySuccess) {
            showMessage('success', 'Holiday added successfully');
            fetchHolidays();
            fetchMonthlyAttendance();
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
        if (canView) {
            filterEmployees();
        }
    }, [searchQuery, statusFilter, attendanceDetail, selectedDate, viewMode, attendanceData, canView]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filteredEmployees]);

    const filterEmployees = () => {
        // Start with employeeList (already filtered for salary)
        let filtered = [...employeeList];
        
        if (searchQuery) {
            filtered = filtered.filter(emp => 
                emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.mobileNo?.includes(searchQuery)
            );
        }
        
        if (viewMode === 'monthly' && attendanceDetail.length > 0) {
            const employeeIdsWithData = attendanceDetail.map(emp => emp.staffId);
            filtered = filtered.filter(emp => employeeIdsWithData.includes(emp.employeeId));
        }
        
        if (viewMode === 'daily' && statusFilter !== 'all') {
            filtered = filtered.filter(emp => {
                const empAttendance = getEmployeeAttendanceStatus(emp.employeeId, selectedDate);
                
                if (isHoliday(selectedDate) && statusFilter === 'holiday') {
                    return true;
                }
                
                if (isSunday(selectedDate) && statusFilter === 'sunday') {
                    return true;
                }
                
                return empAttendance === statusFilter;
            });
        }
        
        setFilteredEmployees(filtered);
    };

    // ============= ATTENDANCE HANDLERS =============
    const handleMonthChange = (direction) => {
        const newMonth = moment(selectedMonth).add(direction, 'months').format('YYYY-MM');
        setSelectedMonth(newMonth);
        if (canView) {
            dispatch(getStaffAttendanceList({ attendanceDate: newMonth + '-01' }));
        }
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (canView) {
            fetchDailyAttendance(date);
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (mode === 'monthly' && canView) {
            fetchMonthlyAttendance();
        }
    };

    const isHoliday = (date) => {
        return holidays.some(holiday => holiday.holidayDate === date);
    };

    const getHolidayName = (date) => {
        const holiday = holidays.find(h => h.holidayDate === date);
        return holiday ? holiday.holidayName : null;
    };

    const isSunday = (date) => {
        return moment(date).day() === 0;
    };

    const getEmployeeAttendanceStatus = (employeeId, date) => {
        if (isHoliday(date)) {
            return 'holiday';
        }
        if (isSunday(date)) {
            return 'sunday';
        }
        
        if (viewMode === 'daily') {
            return attendanceData[employeeId]?.[date]?.status || '-';
        }
        
        const employee = attendanceDetail.find(emp => emp.staffId === employeeId);
        if (employee && employee.dailyStatus) {
            return employee.dailyStatus[date] || '-';
        }
        return '-';
    };

    const handleAttendanceChange = async (employeeId, status, date = selectedDate) => {
        // Check update permission
        if (!canUpdate) {
            showMessage('error', 'You do not have permission to update attendance');
            return;
        }

        // Check if trying to mark attendance for future date
        if (isFutureDate(date)) {
            showMessage('error', 'Cannot mark attendance for future dates');
            return;
        }

        if (isHoliday(date)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(date)} holiday`);
            return;
        }

        if (isSunday(date)) {
            showMessage('info', `Cannot mark attendance on Sunday`);
            return;
        }

        // Verify employee has salary before marking attendance
        const employee = employeeList.find(emp => emp.employeeId === employeeId);
        if (!employee || !employee.hasSalary) {
            showMessage('error', 'This employee is not eligible for attendance tracking');
            return;
        }

        const attendancePayload = {
            staffAttendance: [{
                staffId: employeeId,
                attendanceDate: date,
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
        // Check update permission
        if (!canUpdate) {
            showMessage('error', 'You do not have permission to update attendance');
            return;
        }

        // Check if trying to mark attendance for future date
        if (isFutureDate(selectedDate)) {
            showMessage('error', 'Cannot mark attendance for future dates');
            return;
        }

        if (isHoliday(selectedDate)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(selectedDate)} holiday`);
            return;
        }

        if (isSunday(selectedDate)) {
            showMessage('info', `Cannot mark attendance on Sunday`);
            return;
        }

        // Only mark attendance for employees with salary
        const eligibleEmployees = filteredEmployees.filter(emp => emp.hasSalary === true);
        
        if (eligibleEmployees.length === 0) {
            showMessage('info', 'No eligible employees with salary found');
            return;
        }

        const attendancePayload = {
            staffAttendance: eligibleEmployees.map(emp => ({
                staffId: emp.employeeId,
                attendanceDate: selectedDate,
                attendanceStatus: status,
                updatedBy: currentUserId,
                createdBy: currentUserId
            }))
        };

        try {
            await dispatch(updateStaffAttendance(attendancePayload));
            showMessage('success', `Marked all eligible employees as ${status.replace('-', ' ')}`);
        } catch (error) {
            showMessage('error', 'Failed to mark all attendance');
        }
    };

    // ============= HOLIDAY HANDLERS =============
    const handleSaveHoliday = async () => {
        // Check create permission for holidays
        if (!canCreate) {
            showMessage('error', 'You do not have permission to add holidays');
            return;
        }

        if (!holidayForm.reason?.trim()) {
            showMessage('error', 'Please enter holiday name');
            return;
        }
        
        if (!holidayForm.holiday_date) {
            showMessage('error', 'Please select holiday date');
            return;
        }

        // Check if trying to add holiday for past date
        if (isPastDate(holidayForm.holiday_date) && !isToday(holidayForm.holiday_date)) {
            showMessage('error', 'Cannot add holiday for past dates');
            return;
        }

        try {
            await dispatch(createHoliday(holidayForm));
        } catch (error) {
            showMessage('error', 'Failed to add holiday');
        }
    };

    const handleDeleteHoliday = async (holidayId) => {
        // Check delete permission for holidays
        if (!canDelete) {
            showMessage('error', 'You do not have permission to delete holidays');
            return;
        }

        try {
            await dispatch(deleteHoliday(holidayId));
            showMessage('success', 'Holiday deleted successfully');
        } catch (error) {
            console.log(error)
            showMessage('error', 'Failed to delete holiday');
        }
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
            'present': { 
                color: 'success', 
                icon: IconCheckCircle, 
                label: 'Present' 
            },
            'absent': { 
                color: 'danger', 
                icon: IconXCircle, 
                label: 'Absent' 
            },
            'halfday': { 
                color: 'warning', 
                icon: IconClock, 
                label: 'Half Day' 
            },
            'holiday': { 
                color: 'purple', 
                icon: IconSun, 
                label: 'Holiday' 
            },
            'sunday': { 
                color: 'info', 
                icon: IconSun, 
                label: 'Sunday' 
            },
            'pending': { 
                color: 'light', 
                icon: IconMinus, 
                label: 'Pending' 
            },
            '-': { 
                color: 'light', 
                icon: IconMinus, 
                label: 'Pending' 
            }
        };
        return statusMap[status] || statusMap.pending;
    };

    const getStatusColor = (status) => {
        return getStatusDetails(status).color;
    };

    const getStatusLabel = (status) => {
        return getStatusDetails(status).label;
    };

    const getSummaryStats = () => {
        if (viewMode === 'monthly') {
            const stats = {
                totalEmployees: attendanceDetail.length,
                totalPresent: attendanceDetail.reduce((sum, emp) => sum + (emp.presentCount || 0), 0),
                totalAbsent: attendanceDetail.reduce((sum, emp) => sum + (emp.absentCount || 0), 0),
                totalHalfDay: attendanceDetail.reduce((sum, emp) => sum + (emp.halfDayCount || 0), 0),
                totalWorkingDays: attendanceDetail.reduce((sum, emp) => sum + (emp.totalWorkingDays || 0), 0),
            };
            return stats;
        } else {
            // Calculate stats only for employees with salary
            const salaryEmployees = filteredEmployees.filter(emp => emp.hasSalary === true);
            
            const presentCount = salaryEmployees.filter(emp => 
                getEmployeeAttendanceStatus(emp.employeeId, selectedDate) === 'present'
            ).length;
            const absentCount = salaryEmployees.filter(emp => 
                getEmployeeAttendanceStatus(emp.employeeId, selectedDate) === 'absent'
            ).length;
            const halfDayCount = salaryEmployees.filter(emp => {
                const status = getEmployeeAttendanceStatus(emp.employeeId, selectedDate);
                return status === 'halfday';
            }).length;
            const pendingCount = salaryEmployees.filter(emp => 
                getEmployeeAttendanceStatus(emp.employeeId, selectedDate) === '-'
            ).length;
            
            return {
                presentCount,
                absentCount,
                halfDayCount,
                pendingCount,
                totalEmployees: salaryEmployees.length
            };
        }
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
        if (viewMode === 'monthly') {
            exportMonthlyAttendance();
        } else {
            exportDailyAttendance();
        }
    };

    const exportDailyAttendance = () => {
        // Only export employees with salary
        const salaryEmployees = filteredEmployees.filter(emp => emp.hasSalary === true);
        
        const data = {
            date: selectedDate,
            holiday: isHoliday(selectedDate) ? getHolidayName(selectedDate) : 'No',
            isSunday: isSunday(selectedDate),
            employees: salaryEmployees.map(emp => {
                const status = getEmployeeAttendanceStatus(emp.employeeId, selectedDate);
                return {
                    name: emp.employeeName,
                    status: getStatusLabel(status),
                };
            })
        };

        const csvContent = [
            ['Date', selectedDate],
            ['Day', moment(selectedDate).format('dddd')],
            ['Holiday', data.holiday],
            [''],
            ['Employee Name', 'Status'],
            ...data.employees.map(emp => [
                emp.name,
                emp.status
            ])
        ].map(row => row.join(',')).join('\n');

        downloadCSV(csvContent, `attendance_${selectedDate}.csv`);
    };

    const exportMonthlyAttendance = () => {
        const csvContent = [
            ['Monthly Attendance Report - ' + moment(selectedMonth).format('MMMM YYYY')],
            [''],
            ['Employee Name', 'Present Days', 'Absent Days', 'Half Days', 'Working Days'],
            ...attendanceDetail.map(emp => [
                emp.staffName,
                emp.presentCount || 0,
                emp.absentCount || 0,
                emp.halfDayCount || 0,
                emp.totalWorkingDays || 0
            ])
        ].map(row => row.join(',')).join('\n');

        downloadCSV(csvContent, `attendance_${selectedMonth}.csv`);
    };

    const downloadCSV = (content, filename) => {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('success', 'Attendance exported successfully');
    };

    // ============= STATUS BADGE COMPONENT =============
    const StatusBadge = ({ status }) => {
        const details = getStatusDetails(status);
        const IconComponent = details.icon;
        
        return (
            <span className={`badge badge-${details.color} capitalize inline-flex items-center gap-1 px-2 py-1`}>
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span>{details.label}</span>
            </span>
        );
    };

    // If user doesn't have view permission, show access denied
    if (!canView) {
        return (
            <div className="panel">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <IconXCircle className="w-16 h-16 text-danger mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white-light mb-2">
                            Access Denied
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            You do not have permission to view attendance records.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ============= RENDER =============
    const isLoading = loading || attendanceLoading || holidayLoading;
    const stats = getSummaryStats();

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
                            {viewMode === 'monthly' 
                                ? 'Monthly attendance calendar view (Employees with salary only)' 
                                : 'Daily attendance marking (Employees with salary only)'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-lg">
                            <button
                                onClick={() => handleViewModeChange('daily')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'daily'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Daily View
                            </button>
                            <button
                                onClick={() => handleViewModeChange('monthly')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'monthly'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                Monthly View
                            </button>
                        </div>
                    </div>
                </div>

                {/* Month/Date Selector */}
                <div className="mt-6">
                    {viewMode === 'monthly' ? (
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => handleMonthChange(-1)}
                                className="btn btn-outline-primary"
                            >
                                <IconChevronLeft className="w-4 h-4 mr-2" />
                                Previous Month
                            </button>
                            <h3 className="text-lg font-semibold">
                                {moment(selectedMonth).format('MMMM YYYY')}
                            </h3>
                            <button
                                onClick={() => handleMonthChange(1)}
                                className="btn btn-outline-primary"
                            >
                                Next Month
                                <IconChevronRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                    <IconCalendar className="w-5 h-5 text-primary" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        max={moment().format('YYYY-MM-DD')}
                                        className="form-input bg-transparent border-0 focus:ring-0"
                                    />
                                </div>
                                {isFutureDate(selectedDate) && (
                                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200 text-sm font-medium">
                                        <IconXCircle className="w-4 h-4 mr-2" />
                                        Cannot mark attendance for future dates
                                    </div>
                                )}
                                {isHoliday(selectedDate) && !isFutureDate(selectedDate) && (
                                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm font-medium">
                                        <IconSun className="w-4 h-4 mr-2" />
                                        {getHolidayName(selectedDate)} - Holiday
                                    </div>
                                )}
                                {isSunday(selectedDate) && !isHoliday(selectedDate) && !isFutureDate(selectedDate) && (
                                    <div className="inline-flex items-center px-3 py-2 rounded-full bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200 text-sm font-medium">
                                        <IconSun className="w-4 h-4 mr-2" />
                                        Sunday - Weekly Off
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters Section */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search employees by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input pl-10"
                        />
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Status Filter - Only for Daily View */}
                    {viewMode === 'daily' && (
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="form-select"
                        >
                            <option value="all">All Status</option>
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="halfday">Half Day</option>
                            <option value="-">Pending</option>
                            <option value="holiday">Holiday</option>
                            <option value="sunday">Sunday</option>
                        </select>
                    )}
                    
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
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {viewMode === 'monthly' ? (
                        <>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Total Employees</div>
                                <div className="text-2xl font-bold text-primary-600">{stats.totalEmployees}</div>
                            </div>
                            <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Total Present</div>
                                <div className="text-2xl font-bold text-success-600">{stats.totalPresent}</div>
                            </div>
                            <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Total Absent</div>
                                <div className="text-2xl font-bold text-danger-600">{stats.totalAbsent}</div>
                            </div>
                            <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Total Half Day</div>
                                <div className="text-2xl font-bold text-warning-600">{stats.totalHalfDay}</div>
                            </div>
                            <div className="bg-info-50 dark:bg-info-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Working Days</div>
                                <div className="text-2xl font-bold text-info-600">{stats.totalWorkingDays}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Employees with Salary</div>
                                <div className="text-2xl font-bold text-primary-600">{stats.totalEmployees}</div>
                            </div>
                            <div className="bg-success-50 dark:bg-success-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Present</div>
                                <div className="text-2xl font-bold text-success-600">{stats.presentCount}</div>
                            </div>
                            <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Absent</div>
                                <div className="text-2xl font-bold text-danger-600">{stats.absentCount}</div>
                            </div>
                            <div className="bg-warning-50 dark:bg-warning-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Half Day</div>
                                <div className="text-2xl font-bold text-warning-600">{stats.halfDayCount}</div>
                            </div>
                            <div className="bg-light-50 dark:bg-gray-900/20 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
                                <div className="text-2xl font-bold text-gray-600">{stats.pendingCount}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons - Only for Daily View and non-future dates */}
                {viewMode === 'daily' && !isHoliday(selectedDate) && !isSunday(selectedDate) && !isFutureDate(selectedDate) && canUpdate && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        <button
                            onClick={() => markAllAttendance('present')}
                            className="btn btn-success"
                        >
                            <IconCheckCircle className="w-4 h-4 mr-2" />
                            Mark All Present
                        </button>
                        <button
                            onClick={() => markAllAttendance('absent')}
                            className="btn btn-danger"
                        >
                            <IconXCircle className="w-4 h-4 mr-2" />
                            Mark All Absent
                        </button>
                        <button
                            onClick={() => markAllAttendance('halfday')}
                            className="btn btn-warning"
                        >
                            <IconClock className="w-4 h-4 mr-2" />
                            Mark All Half Day
                        </button>
                    </div>
                )}

                {/* Global Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {canCreate && (
                        <button
                            onClick={() => setShowHolidayForm(true)}
                            className="btn btn-info"
                        >
                            <IconPlus className="w-4 h-4 mr-2" />
                            Add Holiday
                        </button>
                    )}
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
                        Export {viewMode === 'monthly' ? 'Monthly' : 'Daily'} Report
                    </button>
                </div>
            </div>

            {/* Attendance Table/Calendar */}
            <div className="panel">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        {viewMode === 'monthly' 
                            ? `Attendance Calendar - ${moment(selectedMonth).format('MMMM YYYY')}`
                            : `Attendance for ${dateConversion(selectedDate, 'DD MMMM YYYY')}`
                        }
                    </h3>
                    <div className="text-sm text-gray-500">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees with salary
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No employees with salary found
                    </div>
                ) : (
                    <>
                        {viewMode === 'monthly' ? (
                            /* Monthly Calendar View */
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800">
                                            <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
                                                Employee
                                            </th>
                                            {monthDates.map(date => {
                                                const day = moment(date).format('D');
                                                const dayName = moment(date).format('ddd');
                                                const isWeekend = moment(date).day() === 0;
                                                const isHolidayDate = isHoliday(date);
                                                const isFuture = isFutureDate(date);
                                                
                                                return (
                                                    <th 
                                                        key={date} 
                                                        className={`px-2 py-3 text-center min-w-[40px] ${
                                                            isWeekend ? 'bg-gray-100 dark:bg-gray-900' : ''
                                                        } ${
                                                            isHolidayDate ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                                                        } ${
                                                            isFuture ? 'opacity-50' : ''
                                                        }`}
                                                    >
                                                        <div className="text-sm font-medium">{day}</div>
                                                        <div className="text-xs text-gray-500">{dayName}</div>
                                                        {isHolidayDate && (
                                                            <div className="text-xs text-purple-600 truncate max-w-[60px]">
                                                                🎉
                                                            </div>
                                                        )}
                                                        {isFuture && (
                                                            <div className="text-xs text-warning-600">
                                                                Future
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                            <th className="px-2 py-3 text-center bg-success-50 dark:bg-success-900/20">
                                                P
                                            </th>
                                            <th className="px-2 py-3 text-center bg-warning-50 dark:bg-warning-900/20">
                                                H
                                            </th>
                                            <th className="px-2 py-3 text-center bg-danger-50 dark:bg-danger-900/20">
                                                A
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceDetail.map((employee, index) => (
                                            <tr key={employee.staffId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                                                <td className="px-4 py-2 font-medium sticky left-0 bg-white dark:bg-gray-800">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <IconUser className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <span>{employee.staffName}</span>
                                                    </div>
                                                </td>
                                                {monthDates.map(date => {
                                                    const status = employee.dailyStatus[date] || '-';
                                                    const color = getStatusColor(status);
                                                    const isWeekend = moment(date).day() === 0;
                                                    const isHolidayDate = isHoliday(date);
                                                    const isFuture = isFutureDate(date);
                                                    
                                                    return (
                                                        <td 
                                                            key={date} 
                                                            className={`px-2 py-2 text-center ${
                                                                isWeekend ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                                                            } ${
                                                                isHolidayDate ? 'bg-purple-50 dark:bg-purple-900/10' : ''
                                                            } ${
                                                                isFuture ? 'opacity-50' : ''
                                                            }`}
                                                        >
                                                            {status !== '-' && status !== 'sunday' && status !== 'holiday' && !isFuture ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDate(date);
                                                                        setViewMode('daily');
                                                                        fetchDailyAttendance(date);
                                                                    }}
                                                                    className={`px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-200 hover:opacity-80 transition-opacity`}
                                                                >
                                                                    {getStatusLabel(status)}
                                                                </button>
                                                            ) : (
                                                                <span className={`text-xs ${
                                                                    status === 'sunday' ? 'text-info-600' : 
                                                                    status === 'holiday' ? 'text-purple-600' : 
                                                                    'text-gray-400'
                                                                }`}>
                                                                    {status === 'sunday' ? 'SUN' : 
                                                                     status === 'holiday' ? 'HOL' : 
                                                                     isFuture ? '—' : '-'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-2 py-2 text-center font-semibold text-success-600 bg-success-50 dark:bg-success-900/20">
                                                    {employee.presentCount || 0}
                                                </td>
                                                <td className="px-2 py-2 text-center font-semibold text-warning-600 bg-warning-50 dark:bg-warning-900/20">
                                                    {employee.halfDayCount || 0}
                                                </td>
                                                <td className="px-2 py-2 text-center font-semibold text-danger-600 bg-danger-50 dark:bg-danger-900/20">
                                                    {employee.absentCount || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Daily View Table */
                            <>
                                {/* Desktop Table */}
                                <div className="overflow-x-auto hidden md:block">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-800">
                                                <th className="px-4 py-3 text-left">S.No</th>
                                                <th className="px-4 py-3 text-left">Employee</th>
                                                <th className="px-4 py-3 text-left">Status</th>
                                                {!isHoliday(selectedDate) && !isSunday(selectedDate) && !isFutureDate(selectedDate) && canUpdate && (
                                                    <th className="px-4 py-3 text-left">Actions</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((employee, index) => {
                                                const status = getEmployeeAttendanceStatus(employee.employeeId, selectedDate);
                                                
                                                // Get status details with static class names
                                                let statusConfig;
                                                let StatusIcon;
                                                
                                                switch(status) {
                                                    case 'present':
                                                        statusConfig = { color: 'success', label: 'Present' };
                                                        StatusIcon = IconCheckCircle;
                                                        break;
                                                    case 'absent':
                                                        statusConfig = { color: 'danger', label: 'Absent' };
                                                        StatusIcon = IconXCircle;
                                                        break;
                                                    case 'halfday':
                                                        statusConfig = { color: 'warning', label: 'Half Day' };
                                                        StatusIcon = IconClock;
                                                        break;
                                                    case 'holiday':
                                                        statusConfig = { color: 'info', label: 'Holiday' };
                                                        StatusIcon = IconSun;
                                                        break;
                                                    case 'sunday':
                                                        statusConfig = { color: 'secondary', label: 'Sunday' };
                                                        StatusIcon = IconSun;
                                                        break;
                                                    default:
                                                        statusConfig = { color: 'light', label: 'Pending' };
                                                        StatusIcon = IconMinus;
                                                }
                                                
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
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                                                ${status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                                ${status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                                ${status === 'halfday' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                                                ${status === 'holiday' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                                ${status === 'sunday' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                                                                ${status === '-' || status === 'pending' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                                                            `}>
                                                                {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                                                                <span>{statusConfig.label}</span>
                                                            </span>
                                                        </td>
                                                        {!isHoliday(selectedDate) && !isSunday(selectedDate) && !isFutureDate(selectedDate) && canUpdate && (
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => handleAttendanceChange(employee.employeeId, 'present', selectedDate)}
                                                                        disabled={status === 'present'}
                                                                        className={`btn btn-outline-success btn-sm ${
                                                                            status === 'present' ? 'opacity-50 cursor-not-allowed' : ''
                                                                        }`}
                                                                    >
                                                                        <IconCheckCircle className="w-3 h-3 mr-1" />
                                                                        Present
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAttendanceChange(employee.employeeId, 'absent', selectedDate)}
                                                                        disabled={status === 'absent'}
                                                                        className={`btn btn-outline-danger btn-sm ${
                                                                            status === 'absent' ? 'opacity-50 cursor-not-allowed' : ''
                                                                        }`}
                                                                    >
                                                                        <IconXCircle className="w-3 h-3 mr-1" />
                                                                        Absent
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAttendanceChange(employee.employeeId, 'halfday', selectedDate)}
                                                                        disabled={status === 'halfday'}
                                                                        className={`btn btn-outline-warning btn-sm ${
                                                                            status === 'halfday' ? 'opacity-50 cursor-not-allowed' : ''
                                                                        }`}
                                                                    >
                                                                        <IconClock className="w-3 h-3 mr-1" />
                                                                        Half Day
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4">
                                    {currentItems.map((employee, index) => {
                                        const status = getEmployeeAttendanceStatus(employee.employeeId, selectedDate);
                                        const canMarkAttendance = !isHoliday(selectedDate) && !isSunday(selectedDate) && !isFutureDate(selectedDate) && canUpdate;
                                        
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
                                                        <div>
                                                            <div className="font-semibold">{employee.employeeName}</div>
                                                            <div className="text-xs text-gray-500">Salary: Yes</div>
                                                        </div>
                                                    </div>
                                                    <StatusBadge status={status} />
                                                </div>
                                                
                                                {canMarkAttendance && (
                                                    <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'present')}
                                                            disabled={status === 'present'}
                                                            className={`btn btn-success btn-sm ${
                                                                status === 'present' ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <IconCheckCircle className="w-3 h-3 mr-1 inline" />
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'absent')}
                                                            disabled={status === 'absent'}
                                                            className={`btn btn-danger btn-sm ${
                                                                status === 'absent' ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <IconXCircle className="w-3 h-3 mr-1 inline" />
                                                            Absent
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'halfday')}
                                                            disabled={status === 'halfday'}
                                                            className={`btn btn-warning btn-sm ${
                                                                status === 'halfday' ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <IconClock className="w-3 h-3 mr-1 inline" />
                                                            Half Day
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

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
            {showHolidayForm && canCreate && (
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
                                    min={moment().format('YYYY-MM-DD')}
                                    className="form-input w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    * You can only add holidays for today or future dates
                                </p>
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
                                                <th className="px-4 py-3 text-left">Day</th>
                                                {canDelete && (
                                                    <th className="px-4 py-3 text-left">Actions</th>
                                                )}
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
                                                        {moment(holiday.holidayDate).format('dddd')}
                                                    </td>
                                                    {canDelete && (
                                                        <td className="px-4 py-3">
                                                            <button
                                                                onClick={() => handleDeleteHoliday(holiday.holidayId)}
                                                                className="btn btn-outline-danger btn-sm"
                                                            >
                                                                <IconTrashLines className="w-3 h-3 mr-1" />
                                                                Delete
                                                            </button>
                                                        </td>
                                                    )}
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