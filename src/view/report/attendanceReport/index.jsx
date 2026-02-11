import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage, dateConversion } from '../../../util/AllFunction';
import { getEmployee } from '../../../redux/employeeSlice';
import moment from 'moment';
import * as XLSX from 'xlsx';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconUser from '../../../components/Icon/IconUser';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconXCircle from '../../../components/Icon/IconXCircle';
import IconSun from '../../../components/Icon/IconSun';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPlus from '../../../components/Icon/IconPlus';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconDownload from '../../../components/Icon/IconDownload';
import IconFilter from '../../../components/Icon/IconCoffee';
import IconClock from '../../../components/Icon/IconClock';
import IconUsers from '../../../components/Icon/IconUsers';
import IconChartBar from '../../../components/Icon/IconChartBar';
import IconEye from '../../../components/Icon/IconEye';
import IconEdit from '../../../components/Icon/IconEdit';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconFileText from '../../../components/Icon/IconTxtFile';

// Custom Responsive Table Component
const ResponsiveTable = ({ 
    columns, 
    data, 
    pageSize = 10,
    pageIndex = 0,
    totalCount,
    totalPages,
    onPaginationChange,
    onSearchChange,
    pagination = true,
    isSearchable = true,
    searchPlaceholder = "Search...",
    showPageSize = true,
    showStatusFilter = false,
    statusFilterValue = 'all',
    onStatusFilterChange
}) => {
    const [currentPage, setCurrentPage] = useState(pageIndex);
    const [rowsPerPage, setRowsPerPage] = useState(pageSize);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
        if (onSearchChange) onSearchChange(term);
    };
    
    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (onPaginationChange) onPaginationChange(page, rowsPerPage);
    };
    
    // Handle rows per page change
    const handleRowsPerPageChange = (e) => {
        const newRowsPerPage = parseInt(e.target.value);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(0);
        if (onPaginationChange) onPaginationChange(0, newRowsPerPage);
    };
    
    // Filter data based on search term
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
    
    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const startIndex = currentPage * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, rowsPerPage]);

    // Calculate actual total pages
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
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="pending">Pending</option>
                                <option value="holiday">Holiday</option>
                                <option value="half_day">Half Day</option>
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
                                                <td
                                                    key={colIndex}
                                                    className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap"
                                                >
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

const AttendanceReport = () => {
    const dispatch = useDispatch();
    const { employeeData } = useSelector((state) => state.EmployeeSlice);
    
    // Default date range - current month
    const defaultFromDate = moment().startOf('month').format('YYYY-MM-DD');
    const defaultToDate = moment().format('YYYY-MM-DD');

    // States
    const [loading, setLoading] = useState(true);
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [dateRange, setDateRange] = useState({
        from: defaultFromDate,
        to: defaultToDate
    });
    const [selectedFilters, setSelectedFilters] = useState({
        department: 'all',
        designation: 'all',
        status: 'all',
        employeeType: 'all'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showHolidayForm, setShowHolidayForm] = useState(false);
    const [showHolidayList, setShowHolidayList] = useState(false);
    const [viewMode, setViewMode] = useState('daily'); // 'daily', 'monthly', 'employee', 'summary'
    const [currentMonth, setCurrentMonth] = useState(moment().format('YYYY-MM'));
    
    // Holiday form state
    const [holidayForm, setHolidayForm] = useState({
        holidayName: '',
        holidayDate: moment().format('YYYY-MM-DD'),
        description: ''
    });
    
    // Holidays data
    const [holidays, setHolidays] = useState([
        { id: 1, holidayName: 'New Year', holidayDate: '2024-01-01', description: 'New Year Celebration' },
        { id: 2, holidayName: 'Republic Day', holidayDate: '2024-01-26', description: 'Republic Day Celebration' },
        { id: 3, holidayName: 'Holi', holidayDate: '2024-03-25', description: 'Festival of Colors' },
        { id: 4, holidayName: 'Diwali', holidayDate: '2024-10-31', description: 'Festival of Lights' }
    ]);
    
    // Departments and designations
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Initialize data
    useEffect(() => {
        dispatch(setPageTitle('Attendance Report'));
        fetchEmployees();
        
        // Load attendance data from localStorage
        const savedAttendance = localStorage.getItem('attendanceData');
        if (savedAttendance) {
            setAttendanceData(JSON.parse(savedAttendance));
        }
        
        // Load holidays from localStorage
        const savedHolidays = localStorage.getItem('holidays');
        if (savedHolidays) {
            setHolidays(JSON.parse(savedHolidays));
        }
    }, []);

    useEffect(() => {
        if (employeeData) {
            const employees = employeeData.filter(emp => 
                emp.designationName?.toLowerCase() !== 'loadman'
            );
            setEmployeeList(employees);
            setFilteredEmployees(employees);
            
            // Extract unique departments and designations
            const deptSet = new Set();
            const desigSet = new Set();
            
            employees.forEach(emp => {
                if (emp.departmentName) deptSet.add(emp.departmentName);
                if (emp.designationName) desigSet.add(emp.designationName);
            });
            
            setDepartments(['all', ...Array.from(deptSet)]);
            setDesignations(['all', ...Array.from(desigSet)]);
        }
        setLoading(false);
    }, [employeeData]);

    // Filter employees based on criteria
    useEffect(() => {
        filterEmployees();
    }, [searchQuery, selectedFilters, employeeList, dateRange]);

    // Save attendance data to localStorage
    useEffect(() => {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }, [attendanceData]);

    // Save holidays to localStorage
    useEffect(() => {
        localStorage.setItem('holidays', JSON.stringify(holidays));
    }, [holidays]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            await dispatch(getEmployee());
        } catch (error) {
            showMessage('error', 'Failed to load employees');
        }
    };

    const filterEmployees = () => {
        let filtered = [...employeeList];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(emp =>
                emp.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.mobileNo?.includes(searchQuery)
            );
        }

        // Department filter
        if (selectedFilters.department !== 'all') {
            filtered = filtered.filter(emp => emp.departmentName === selectedFilters.department);
        }

        // Designation filter
        if (selectedFilters.designation !== 'all') {
            filtered = filtered.filter(emp => emp.designationName === selectedFilters.designation);
        }

        // Employee type filter (for this example, using department as type)
        if (selectedFilters.employeeType !== 'all') {
            filtered = filtered.filter(emp => emp.departmentName === selectedFilters.employeeType);
        }

        // Status filter
        if (selectedFilters.status !== 'all') {
            filtered = filtered.filter(emp => {
                const attendanceStats = getEmployeeAttendanceStats(emp.employeeId);
                return attendanceStats.status === selectedFilters.status;
            });
        }

        setFilteredEmployees(filtered);
        setCurrentPage(0);
    };

    const handleDateRangeChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSelectedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const quickDateRange = (type) => {
        const today = moment();
        let fromDate, toDate;
        
        switch(type) {
            case 'today':
                fromDate = today.format('YYYY-MM-DD');
                toDate = today.format('YYYY-MM-DD');
                break;
            case 'yesterday':
                fromDate = today.subtract(1, 'day').format('YYYY-MM-DD');
                toDate = fromDate;
                break;
            case 'thisWeek':
                fromDate = today.startOf('week').format('YYYY-MM-DD');
                toDate = today.format('YYYY-MM-DD');
                break;
            case 'lastWeek':
                fromDate = today.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                toDate = today.subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
                break;
            case 'thisMonth':
                fromDate = today.startOf('month').format('YYYY-MM-DD');
                toDate = today.format('YYYY-MM-DD');
                break;
            case 'lastMonth':
                fromDate = today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
                toDate = today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD');
                break;
            default:
                return;
        }
        
        setDateRange({ from: fromDate, to: toDate });
    };

    const isHoliday = (date) => {
        return holidays.some(holiday => holiday.holidayDate === date);
    };

    const getHolidayName = (date) => {
        const holiday = holidays.find(h => h.holidayDate === date);
        return holiday ? holiday.holidayName : null;
    };

    const handleAttendanceChange = (employeeId, date, status) => {
        if (isHoliday(date)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(date)} holiday`);
            return;
        }
        
        setAttendanceData(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [date]: {
                    status: status,
                    markedAt: new Date().toISOString(),
                    markedDate: date,
                    markedBy: 'Admin'
                }
            }
        }));
        
        showMessage('success', `Attendance marked as ${status} for ${date}`);
    };

    const getAttendanceStatus = (employeeId, date) => {
        // Check if date is a holiday
        if (isHoliday(date)) {
            return 'holiday';
        }
        
        const empAttendance = attendanceData[employeeId]?.[date];
        if (!empAttendance) return 'pending';
        return empAttendance.status || 'pending';
    };

    const getEmployeeAttendanceStats = (employeeId) => {
        const startDate = moment(dateRange.from);
        const endDate = moment(dateRange.to);
        const days = [];
        
        let presentCount = 0;
        let absentCount = 0;
        let holidayCount = 0;
        let pendingCount = 0;
        let halfDayCount = 0;
        
        for (let date = startDate; date <= endDate; date.add(1, 'day')) {
            const dateStr = date.format('YYYY-MM-DD');
            const status = getAttendanceStatus(employeeId, dateStr);
            
            switch(status) {
                case 'present': presentCount++; break;
                case 'absent': absentCount++; break;
                case 'holiday': holidayCount++; break;
                case 'half_day': halfDayCount++; break;
                default: pendingCount++; break;
            }
        }
        
        const totalDays = Math.abs(endDate.diff(startDate, 'days')) + 1;
        const attendancePercentage = totalDays > 0 ? ((presentCount + (halfDayCount * 0.5)) / totalDays * 100).toFixed(1) : 0;
        
        let overallStatus = 'good';
        if (attendancePercentage < 75) overallStatus = 'poor';
        else if (attendancePercentage < 90) overallStatus = 'average';
        
        return {
            presentCount,
            absentCount,
            holidayCount,
            halfDayCount,
            pendingCount,
            totalDays,
            attendancePercentage: parseFloat(attendancePercentage),
            overallStatus
        };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800';
            case 'absent': return 'bg-red-100 text-red-800';
            case 'holiday': return 'bg-purple-100 text-purple-800';
            case 'half_day': return 'bg-yellow-100 text-yellow-800';
            case 'pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present': return '✓';
            case 'absent': return '✗';
            case 'holiday': return '☀';
            case 'half_day': return '½';
            case 'pending': return '...';
            default: return '?';
        }
    };

    const handleSaveHoliday = () => {
        if (!holidayForm.holidayName.trim()) {
            showMessage('error', 'Please enter holiday name');
            return;
        }

        const newHoliday = {
            id: Date.now(),
            ...holidayForm
        };
        
        setHolidays(prev => [...prev, newHoliday]);
        showMessage('success', 'Holiday added successfully');
        setShowHolidayForm(false);
        setHolidayForm({
            holidayName: '',
            holidayDate: moment().format('YYYY-MM-DD'),
            description: ''
        });
    };

    const deleteHoliday = (id) => {
        setHolidays(prev => prev.filter(h => h.id !== id));
        showMessage('success', 'Holiday deleted successfully');
    };

    // Get overall statistics
    const getOverallStats = () => {
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalHoliday = 0;
        let totalHalfDay = 0;
        let totalPending = 0;
        
        const startDate = moment(dateRange.from);
        const endDate = moment(dateRange.to);
        const totalDaysInRange = Math.abs(endDate.diff(startDate, 'days')) + 1;
        
        filteredEmployees.forEach(emp => {
            const stats = getEmployeeAttendanceStats(emp.employeeId);
            totalPresent += stats.presentCount;
            totalAbsent += stats.absentCount;
            totalHoliday += stats.holidayCount;
            totalHalfDay += stats.halfDayCount;
            totalPending += stats.pendingCount;
        });
        
        const totalEntries = totalPresent + totalAbsent + totalHoliday + totalHalfDay + totalPending;
        const attendanceRate = totalEntries > 0 ? ((totalPresent + (totalHalfDay * 0.5)) / totalEntries * 100).toFixed(1) : 0;
        
        return {
            totalPresent,
            totalAbsent,
            totalHoliday,
            totalHalfDay,
            totalPending,
            totalEntries,
            attendanceRate: parseFloat(attendanceRate),
            totalEmployees: filteredEmployees.length,
            totalDaysInRange
        };
    };

    const overallStats = getOverallStats();

    // Generate daily attendance data
    const generateDailyData = () => {
        const startDate = moment(dateRange.from);
        const endDate = moment(dateRange.to);
        const dailyData = [];
        
        for (let date = startDate; date <= endDate; date.add(1, 'day')) {
            const dateStr = date.format('YYYY-MM-DD');
            const dayOfWeek = date.format('dddd');
            
            let presentCount = 0;
            let absentCount = 0;
            let holidayCount = 0;
            let halfDayCount = 0;
            let pendingCount = 0;
            
            filteredEmployees.forEach(emp => {
                const status = getAttendanceStatus(emp.employeeId, dateStr);
                switch(status) {
                    case 'present': presentCount++; break;
                    case 'absent': absentCount++; break;
                    case 'holiday': holidayCount++; break;
                    case 'half_day': halfDayCount++; break;
                    default: pendingCount++; break;
                }
            });
            
            const totalEmployees = filteredEmployees.length;
            const attendanceRate = totalEmployees > 0 ? 
                ((presentCount + (halfDayCount * 0.5)) / totalEmployees * 100).toFixed(1) : 0;
            
            dailyData.push({
                date: dateStr,
                dayOfWeek,
                presentCount,
                absentCount,
                holidayCount,
                halfDayCount,
                pendingCount,
                totalEmployees,
                attendanceRate: parseFloat(attendanceRate),
                isHoliday: isHoliday(dateStr),
                holidayName: getHolidayName(dateStr)
            });
        }
        
        return dailyData;
    };

    const dailyData = generateDailyData();

    // Table columns for daily view
    const dailyColumns = [
        {
            Header: 'Date',
            accessor: 'date',
            width: 120,
            Cell: ({ value, row }) => (
                <div className="text-sm">
                    <div className="font-medium">{moment(value).format('DD MMM YYYY')}</div>
                    <div className="text-xs text-gray-500">{row.original.dayOfWeek}</div>
                    {row.original.isHoliday && (
                        <div className="text-xs text-purple-600 mt-1">
                            {row.original.holidayName}
                        </div>
                    )}
                </div>
            ),
            mobileFull: true,
        },
        {
            Header: 'Attendance',
            accessor: 'attendance',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center">
                        <span className="text-green-600 font-medium mr-2">{row.original.presentCount}</span>
                        <span className="text-xs text-gray-500">Present</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-red-600 font-medium mr-2">{row.original.absentCount}</span>
                        <span className="text-xs text-gray-500">Absent</span>
                    </div>
                </div>
            ),
            width: 100,
            mobileFull: false,
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center">
                        <span className="text-yellow-600 font-medium mr-2">{row.original.halfDayCount}</span>
                        <span className="text-xs text-gray-500">Half Day</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-purple-600 font-medium mr-2">{row.original.holidayCount}</span>
                        <span className="text-xs text-gray-500">Holiday</span>
                    </div>
                </div>
            ),
            width: 100,
            mobileFull: false,
        },
        {
            Header: 'Attendance Rate',
            accessor: 'attendanceRate',
            Cell: ({ value }) => (
                <div className={`font-bold ${value >= 90 ? 'text-green-700' : value >= 75 ? 'text-yellow-700' : 'text-red-700'}`}>
                    {value}%
                </div>
            ),
            width: 100,
            mobileFull: false,
        },
        {
            Header: 'Action',
            accessor: 'action',
            Cell: ({ row }) => (
                <button
                    onClick={() => {
                        setViewMode('employee');
                        setDateRange({
                            from: row.original.date,
                            to: row.original.date
                        });
                    }}
                    className="btn btn-outline-primary btn-sm text-xs"
                >
                    <IconEye className="w-3 h-3 mr-1" />
                    View Details
                </button>
            ),
            width: 120,
            mobileFull: false,
        },
    ];

    // Table columns for employee view
    const employeeColumns = [
        {
            Header: 'Employee',
            accessor: 'employee',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium text-gray-800">{row.original.name}</div>
                    <div className="text-xs text-gray-500">
                        {row.original.code} • {row.original.department}
                    </div>
                    <div className="text-xs text-gray-500">{row.original.designation}</div>
                </div>
            ),
            width: 180,
            mobileFull: true,
        },
        {
            Header: 'Attendance Stats',
            accessor: 'stats',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <span className="text-green-600 font-medium mr-2">{row.original.present}</span>
                        <span className="text-gray-500">Present</span>
                        <span className="mx-2">•</span>
                        <span className="text-red-600 font-medium mr-2">{row.original.absent}</span>
                        <span className="text-gray-500">Absent</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <span className="text-yellow-600 mr-1">{row.original.halfDay}</span>
                        Half Day •
                        <span className="text-purple-600 ml-1 mr-1">{row.original.holiday}</span>
                        Holiday
                    </div>
                </div>
            ),
            width: 150,
            mobileFull: false,
        },
        {
            Header: 'Attendance %',
            accessor: 'percentage',
            Cell: ({ value, row }) => (
                <div className="space-y-1">
                    <div className={`font-bold text-lg ${value >= 90 ? 'text-green-700' : value >= 75 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {value}%
                    </div>
                    <div className="text-xs text-gray-500">
                        {row.original.daysWorked}/{row.original.totalDays} days
                    </div>
                </div>
            ),
            width: 100,
            mobileFull: false,
        },
        {
            Header: 'Status',
            accessor: 'overallStatus',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value === 'good' ? 'bg-green-100 text-green-800' :
                    value === 'average' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {value === 'good' ? 'Good' : value === 'average' ? 'Average' : 'Poor'}
                </span>
            ),
            width: 80,
            mobileFull: false,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-1">
                    <button
                        onClick={() => handleAttendanceChange(row.original.id, dateRange.from, 'present')}
                        className="btn btn-outline-success btn-sm text-xs"
                    >
                        Present
                    </button>
                    <button
                        onClick={() => handleAttendanceChange(row.original.id, dateRange.from, 'absent')}
                        className="btn btn-outline-danger btn-sm text-xs"
                    >
                        Absent
                    </button>
                </div>
            ),
            width: 150,
            mobileFull: false,
        },
    ];

    // Generate employee data for table
    const employeeTableData = filteredEmployees.map(emp => {
        const stats = getEmployeeAttendanceStats(emp.employeeId);
        return {
            id: emp.employeeId,
            name: emp.employeeName,
            code: emp.employeeCode || 'N/A',
            department: emp.departmentName || 'N/A',
            designation: emp.designationName || 'N/A',
            present: stats.presentCount,
            absent: stats.absentCount,
            holiday: stats.holidayCount,
            halfDay: stats.halfDayCount,
            pending: stats.pendingCount,
            percentage: stats.attendancePercentage,
            daysWorked: stats.presentCount + stats.halfDayCount,
            totalDays: stats.totalDays,
            overallStatus: stats.overallStatus
        };
    });

    // Export to Excel
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        
        // Summary sheet
        const summaryData = [
            ['ATTENDANCE REPORT - SUMMARY'],
            [`Date Range: ${moment(dateRange.from).format('DD/MM/YYYY')} to ${moment(dateRange.to).format('DD/MM/YYYY')}`],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['OVERALL STATISTICS'],
            ['Total Employees', overallStats.totalEmployees],
            ['Date Range', `${moment(dateRange.from).format('DD MMM YYYY')} to ${moment(dateRange.to).format('DD MMM YYYY')}`],
            ['Total Days', overallStats.totalDaysInRange],
            [],
            ['ATTENDANCE BREAKDOWN'],
            ['Present', overallStats.totalPresent],
            ['Absent', overallStats.totalAbsent],
            ['Half Day', overallStats.totalHalfDay],
            ['Holidays', overallStats.totalHoliday],
            ['Pending', overallStats.totalPending],
            ['Attendance Rate', `${overallStats.attendanceRate}%`],
        ];
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        
        // Employee details sheet
        const employeeHeader = [
            ['EMPLOYEE ATTENDANCE DETAILS'],
            [],
            ['Employee Name', 'Employee Code', 'Department', 'Designation', 'Present Days', 'Absent Days', 
             'Half Days', 'Holidays', 'Total Days', 'Attendance %', 'Status']
        ];
        
        const employeeRows = employeeTableData.map(emp => [
            emp.name,
            emp.code,
            emp.department,
            emp.designation,
            emp.present,
            emp.absent,
            emp.halfDay,
            emp.holiday,
            emp.totalDays,
            `${emp.percentage}%`,
            emp.overallStatus === 'good' ? 'Good' : emp.overallStatus === 'average' ? 'Average' : 'Poor'
        ]);
        
        const employeeData = [...employeeHeader, ...employeeRows];
        const employeeWs = XLSX.utils.aoa_to_sheet(employeeData);
        
        // Daily summary sheet
        const dailyHeader = [
            ['DAILY ATTENDANCE SUMMARY'],
            [],
            ['Date', 'Day', 'Present', 'Absent', 'Half Day', 'Holiday', 'Total Employees', 'Attendance Rate', 'Holiday Name']
        ];
        
        const dailyRows = dailyData.map(day => [
            day.date,
            day.dayOfWeek,
            day.presentCount,
            day.absentCount,
            day.halfDayCount,
            day.holidayCount,
            day.totalEmployees,
            `${day.attendanceRate}%`,
            day.holidayName || '-'
        ]);
        
        const dailyDataSheet = [...dailyHeader, ...dailyRows];
        const dailyWs = XLSX.utils.aoa_to_sheet(dailyDataSheet);
        
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        XLSX.utils.book_append_sheet(wb, employeeWs, 'Employee Details');
        XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Summary');
        
        const fileName = `attendance-report-${moment(dateRange.from).format('DD-MM-YY')}-to-${moment(dateRange.to).format('DD-MM-YY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Export to PDF
    const exportToPDF = () => {
        const reportData = {
            dateRange,
            overallStats,
            employeeData: employeeTableData,
            dailyData,
            holidays,
            generatedDate: moment().format('DD/MM/YYYY HH:mm')
        };
        
        localStorage.setItem('attendanceReportData', JSON.stringify(reportData));
        window.open('/documents/attendance-report-pdf', '_blank');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Attendance Report</h1>
                    <p className="text-gray-600 mt-1 sm:mt-2">Track and manage employee attendance with detailed reporting</p>
                </div>

                {/* Date Range Selection */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 mb-1">Select Date Range</h2>
                            <p className="text-sm text-gray-600">Choose the period for attendance analysis</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => quickDateRange('today')}
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => quickDateRange('yesterday')}
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                            >
                                Yesterday
                            </button>
                            <button
                                onClick={() => quickDateRange('thisWeek')}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium border border-blue-300"
                            >
                                This Week
                            </button>
                            <button
                                onClick={() => quickDateRange('thisMonth')}
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                            >
                                This Month
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <IconCalendar className="inline w-4 h-4 mr-1" />
                                From Date
                            </label>
                            <input
                                type="date"
                                name="from"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={dateRange.from}
                                onChange={handleDateRangeChange}
                                max={moment().format('YYYY-MM-DD')}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <IconCalendar className="inline w-4 h-4 mr-1" />
                                To Date
                            </label>
                            <input
                                type="date"
                                name="to"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={dateRange.to}
                                onChange={handleDateRangeChange}
                                max={moment().format('YYYY-MM-DD')}
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <button
                                onClick={() => filterEmployees()}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                            >
                                Apply Range
                            </button>
                        </div>
                    </div>

                    <div className="text-center pt-4 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {moment(dateRange.from).format('DD MMM YYYY')} - {moment(dateRange.to).format('DD MMM YYYY')}
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {overallStats.totalDaysInRange} days • {overallStats.totalEmployees} employees
                        </p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <IconFilter className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    setSelectedFilters({
                                        department: 'all',
                                        designation: 'all',
                                        status: 'all',
                                        employeeType: 'all'
                                    });
                                    setSearchQuery('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                            >
                                Reset All
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                            <select
                                name="department"
                                value={selectedFilters.department}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>
                                        {dept === 'all' ? 'All Departments' : dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Designation</label>
                            <select
                                name="designation"
                                value={selectedFilters.designation}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {designations.map((desig, index) => (
                                    <option key={index} value={desig}>
                                        {desig === 'all' ? 'All Designations' : desig}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                            <select
                                name="status"
                                value={selectedFilters.status}
                                onChange={handleFilterChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="good">Good (&gt;90%)</option>
                                <option value="average">Average (75-90%)</option>
                                <option value="poor">Poor (&lt;75%)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={exportToExcel}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                            >
                                <IconDownload className="mr-2 w-4 h-4" />
                                Export Excel
                            </button>
                            <button
                                onClick={exportToPDF}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                            >
                                <IconPrinter className="mr-2 w-4 h-4" />
                                Generate PDF
                            </button>
                            <button
                                onClick={() => setShowHolidayForm(true)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                            >
                                <IconPlus className="mr-2 w-4 h-4" />
                                Add Holiday
                            </button>
                            <button
                                onClick={() => setShowHolidayList(true)}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all duration-200 font-medium shadow-sm flex items-center text-sm"
                            >
                                <IconFileText className="mr-2 w-4 h-4" />
                                View Holidays
                            </button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            Showing {filteredEmployees.length} employees
                        </div>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setViewMode('daily')}
                                className={`px-4 py-2 rounded-lg flex items-center ${
                                    viewMode === 'daily' 
                                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <IconCalendar className="w-4 h-4 mr-2" />
                                Daily View
                            </button>
                            <button
                                onClick={() => setViewMode('employee')}
                                className={`px-4 py-2 rounded-lg flex items-center ${
                                    viewMode === 'employee' 
                                        ? 'bg-green-100 text-green-700 border border-green-300' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <IconUsers className="w-4 h-4 mr-2" />
                                Employee View ({filteredEmployees.length})
                            </button>
                            <button
                                onClick={() => setViewMode('summary')}
                                className={`px-4 py-2 rounded-lg flex items-center ${
                                    viewMode === 'summary' 
                                        ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <IconChartBar className="w-4 h-4 mr-2" />
                                Summary
                            </button>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            {viewMode === 'daily' && 'Daily Attendance Breakdown'}
                            {viewMode === 'employee' && 'Employee Attendance Details'}
                            {viewMode === 'summary' && 'Attendance Summary'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {/* Present Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Present</h3>
                        <div className="p-2 bg-green-100 rounded-full">
                            <IconCheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-700 mb-2">
                            {overallStats.totalPresent}
                        </div>
                        <div className="text-sm text-gray-600">
                            {overallStats.totalEntries > 0 ? 
                                Math.round((overallStats.totalPresent / overallStats.totalEntries) * 100) : 0}% of total
                        </div>
                    </div>
                </div>

                {/* Absent Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Absent</h3>
                        <div className="p-2 bg-red-100 rounded-full">
                            <IconXCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-700 mb-2">
                            {overallStats.totalAbsent}
                        </div>
                        <div className="text-sm text-gray-600">
                            {overallStats.totalEntries > 0 ? 
                                Math.round((overallStats.totalAbsent / overallStats.totalEntries) * 100) : 0}% of total
                        </div>
                    </div>
                </div>

                {/* Half Day Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Half Day</h3>
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <IconClock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-700 mb-2">
                            {overallStats.totalHalfDay}
                        </div>
                        <div className="text-sm text-gray-600">
                            {overallStats.totalEntries > 0 ? 
                                Math.round((overallStats.totalHalfDay / overallStats.totalEntries) * 100) : 0}% of total
                        </div>
                    </div>
                </div>

                {/* Attendance Rate Card */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Attendance Rate</h3>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <IconChartBar className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold mb-2 ${
                            overallStats.attendanceRate >= 90 ? 'text-green-700' : 
                            overallStats.attendanceRate >= 75 ? 'text-yellow-700' : 'text-red-700'
                        }`}>
                            {overallStats.attendanceRate}%
                        </div>
                        <div className="text-sm text-gray-600">
                            Overall attendance rate
                        </div>
                    </div>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'daily' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Daily Attendance Breakdown
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {overallStats.totalDaysInRange} days from {moment(dateRange.from).format('DD MMM YYYY')} to {moment(dateRange.to).format('DD MMM YYYY')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total Present: </span>
                                    <span className="font-semibold text-green-600">{overallStats.totalPresent}</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Total Absent: </span>
                                    <span className="font-semibold text-red-600">{overallStats.totalAbsent}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <ResponsiveTable
                            columns={dailyColumns}
                            data={dailyData}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={dailyData.length}
                            totalPages={Math.ceil(dailyData.length / pageSize)}
                            onPaginationChange={(page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            }}
                            pagination={true}
                            isSearchable={true}
                            searchPlaceholder="Search by date or holiday..."
                            showPageSize={true}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'employee' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">
                                    Employee Attendance Details
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {filteredEmployees.length} employees showing
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Avg Attendance: </span>
                                    <span className="font-semibold text-blue-600">{overallStats.attendanceRate}%</span>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                    <span className="text-gray-600">Date Range: </span>
                                    <span className="font-semibold text-gray-700">
                                        {moment(dateRange.from).format('DD/MM')} - {moment(dateRange.to).format('DD/MM')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-2 sm:p-4">
                        <ResponsiveTable
                            columns={employeeColumns}
                            data={employeeTableData}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={employeeTableData.length}
                            totalPages={Math.ceil(employeeTableData.length / pageSize)}
                            onPaginationChange={(page, size) => {
                                setCurrentPage(page);
                                setPageSize(size);
                            }}
                            pagination={true}
                            isSearchable={true}
                            searchPlaceholder="Search employees by name, code, or department..."
                            showPageSize={true}
                            showStatusFilter={true}
                            statusFilterValue={selectedFilters.status}
                            onStatusFilterChange={(value) => setSelectedFilters(prev => ({ ...prev, status: value }))}
                        />
                    </div>
                </div>
            )}

            {viewMode === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Attendance Summary */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-gray-700 font-medium">Total Employees</span>
                                <span className="text-blue-700 font-bold">{overallStats.totalEmployees}</span>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-600">Attendance Breakdown:</div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-gray-700">Present</span>
                                    </div>
                                    <div>
                                        <span className="text-green-700 font-bold">{overallStats.totalPresent}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({overallStats.totalEntries > 0 ? 
                                                Math.round((overallStats.totalPresent / overallStats.totalEntries) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-gray-700">Absent</span>
                                    </div>
                                    <div>
                                        <span className="text-red-700 font-bold">{overallStats.totalAbsent}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({overallStats.totalEntries > 0 ? 
                                                Math.round((overallStats.totalAbsent / overallStats.totalEntries) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <span className="text-gray-700">Half Day</span>
                                    </div>
                                    <div>
                                        <span className="text-yellow-700 font-bold">{overallStats.totalHalfDay}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({overallStats.totalEntries > 0 ? 
                                                Math.round((overallStats.totalHalfDay / overallStats.totalEntries) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                        <span className="text-gray-700">Holidays</span>
                                    </div>
                                    <div>
                                        <span className="text-purple-700 font-bold">{overallStats.totalHoliday}</span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({overallStats.totalEntries > 0 ? 
                                                Math.round((overallStats.totalHoliday / overallStats.totalEntries) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className={`flex justify-between items-center pt-3 border-t ${overallStats.attendanceRate >= 90 ? 'bg-green-50 p-3 rounded-lg' : overallStats.attendanceRate >= 75 ? 'bg-yellow-50 p-3 rounded-lg' : 'bg-red-50 p-3 rounded-lg'}`}>
                                <span className={`font-bold text-lg ${overallStats.attendanceRate >= 90 ? 'text-green-800' : overallStats.attendanceRate >= 75 ? 'text-yellow-800' : 'text-red-800'}`}>
                                    Attendance Rate
                                </span>
                                <span className={`text-2xl font-bold ${overallStats.attendanceRate >= 90 ? 'text-green-700' : overallStats.attendanceRate >= 75 ? 'text-yellow-700' : 'text-red-700'}`}>
                                    {overallStats.attendanceRate}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Department-wise Attendance */}
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Department Performance</h3>
                        <div className="space-y-4">
                            {departments.filter(dept => dept !== 'all').map((dept, index) => {
                                const deptEmployees = employeeList.filter(emp => emp.departmentName === dept);
                                let deptPresent = 0;
                                let deptAbsent = 0;
                                let deptTotal = 0;
                                
                                deptEmployees.forEach(emp => {
                                    const stats = getEmployeeAttendanceStats(emp.employeeId);
                                    deptPresent += stats.presentCount;
                                    deptAbsent += stats.absentCount;
                                    deptTotal += stats.totalDays;
                                });
                                
                                const deptRate = deptTotal > 0 ? ((deptPresent / deptTotal) * 100).toFixed(1) : 0;
                                
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">{dept}</span>
                                            <span className={`font-bold ${deptRate >= 90 ? 'text-green-600' : deptRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {deptRate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full ${deptRate >= 90 ? 'bg-green-500' : deptRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(deptRate, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{deptEmployees.length} employees</span>
                                            <span>{deptPresent}/{deptTotal} days present</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Upcoming Holidays */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Upcoming Holidays ({holidays.length})</h3>
                    <button
                        onClick={() => setShowHolidayList(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        View All →
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {holidays.slice(0, 4).map(holiday => (
                        <div key={holiday.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-purple-800">{holiday.holidayName}</div>
                                <IconSun className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-sm text-purple-600 mb-2">
                                {moment(holiday.holidayDate).format('DD MMMM YYYY')}
                            </div>
                            <div className="text-xs text-purple-700">
                                {holiday.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Holiday Form Modal */}
            {showHolidayForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                Add Holiday
                            </h3>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                                        Holiday Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={holidayForm.holidayName}
                                        onChange={(e) => setHolidayForm(prev => ({ ...prev, holidayName: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter holiday name"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={holidayForm.holidayDate}
                                        onChange={(e) => setHolidayForm(prev => ({ ...prev, holidayDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={holidayForm.description}
                                        onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        placeholder="Enter holiday description (optional)..."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowHolidayForm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveHoliday}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                                >
                                    Save Holiday
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Holiday List Modal */}
            {showHolidayList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                                    Holiday List ({holidays.length})
                                </h3>
                                <button
                                    onClick={() => setShowHolidayList(false)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                            {holidays.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No holidays added yet
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {holidays.map(holiday => (
                                        <div key={holiday.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="mb-3 sm:mb-0">
                                                <div className="font-medium text-gray-800">{holiday.holidayName}</div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {moment(holiday.holidayDate).format('DD MMMM YYYY')}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {holiday.description}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteHoliday(holiday.id)}
                                                className="btn btn-outline-danger btn-sm self-start sm:self-center"
                                            >
                                                <IconTrashLines className="w-3 h-3 mr-1" />
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4 sm:p-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Total Holidays: {holidays.length}
                                </div>
                                <button
                                    onClick={() => setShowHolidayList(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Report Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Date Range</h4>
                        <p className="text-gray-600">
                            {moment(dateRange.from).format('DD MMMM YYYY')} - {moment(dateRange.to).format('DD MMMM YYYY')}
                        </p>
                        <p className="text-sm text-gray-500">
                            {overallStats.totalDaysInRange} days analyzed
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Key Metrics</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Total Employees: {overallStats.totalEmployees}</li>
                            <li>• Total Present Days: {overallStats.totalPresent}</li>
                            <li>• Total Absent Days: {overallStats.totalAbsent}</li>
                            <li>• Overall Attendance: <span className={
                                overallStats.attendanceRate >= 90 ? 'text-green-600 font-medium' : 
                                overallStats.attendanceRate >= 75 ? 'text-yellow-600 font-medium' : 
                                'text-red-600 font-medium'
                            }>
                                {overallStats.attendanceRate}%
                            </span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;