import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage, dateConversion } from '../../../util/AllFunction';
import { getEmployee } from '../../../redux/employeeSlice';
import moment from 'moment';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconUser from '../../../components/Icon/IconUser';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconXCircle from '../../../components/Icon/IconXCircle';
import IconSun from '../../../components/Icon/IconSun';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPlus from '../../../components/Icon/IconPlus';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconDownload from '../../../components/Icon/IconDownload';

const Attendance = () => {
    const dispatch = useDispatch();
    const { employeeData } = useSelector((state) => state.EmployeeSlice);
    
    const [loading, setLoading] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [searchQuery, setSearchQuery] = useState('');
    const [showHolidayForm, setShowHolidayForm] = useState(false);
    const [showHolidayList, setShowHolidayList] = useState(false);
    
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
    
    // Filters
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departments, setDepartments] = useState([]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        dispatch(setPageTitle('Attendance Management'));
        fetchEmployees();
        
        // Load attendance data from localStorage on initial load
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
            
            // Extract unique departments
            const deptSet = new Set();
            employees.forEach(emp => {
                if (emp.departmentName) {
                    deptSet.add(emp.departmentName);
                }
            });
            setDepartments(['all', ...Array.from(deptSet)]);
        }
    }, [employeeData]);

    useEffect(() => {
        filterEmployees();
    }, [searchQuery, departmentFilter, statusFilter, selectedDate]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
    }, [filteredEmployees]);

    // Save attendance data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }, [attendanceData]);

    // Save holidays to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('holidays', JSON.stringify(holidays));
    }, [holidays]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            await dispatch(getEmployee());
        } catch (error) {
            showMessage('error', 'Failed to load employees');
        } finally {
            setLoading(false);
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
        if (departmentFilter !== 'all') {
            filtered = filtered.filter(emp => emp.departmentName === departmentFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(emp => {
                const empAttendance = attendanceData[emp.employeeId]?.[selectedDate];
                return empAttendance?.status === statusFilter;
            });
        }

        setFilteredEmployees(filtered);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const isHoliday = (date) => {
        return holidays.some(holiday => holiday.holidayDate === date);
    };

    const getHolidayName = (date) => {
        const holiday = holidays.find(h => h.holidayDate === date);
        return holiday ? holiday.holidayName : null;
    };

    const handleAttendanceChange = (employeeId, status) => {
        if (isHoliday(selectedDate)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(selectedDate)} holiday`);
            return;
        }
        
        setAttendanceData(prev => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [selectedDate]: {
                    status: status,
                    markedAt: new Date().toISOString(),
                    markedDate: selectedDate
                }
            }
        }));
        
        showMessage('success', `Marked ${status} for employee`);
    };

    const markAllAttendance = (status) => {
        if (isHoliday(selectedDate)) {
            showMessage('info', `Cannot mark attendance on ${getHolidayName(selectedDate)} holiday`);
            return;
        }
        
        const updatedAttendance = { ...attendanceData };
        
        filteredEmployees.forEach(emp => {
            if (!updatedAttendance[emp.employeeId]) {
                updatedAttendance[emp.employeeId] = {};
            }
            updatedAttendance[emp.employeeId][selectedDate] = {
                status: status,
                markedAt: new Date().toISOString(),
                markedDate: selectedDate
            };
        });
        
        setAttendanceData(updatedAttendance);
        showMessage('success', `Marked all employees as ${status}`);
    };

    const handleSaveHoliday = () => {
        if (!holidayForm.holidayName.trim()) {
            showMessage('error', 'Please enter holiday name');
            return;
        }

        if (!holidayForm.holidayDate) {
            showMessage('error', 'Please select holiday date');
            return;
        }

        const newHoliday = {
            id: Date.now(), // Use timestamp for unique ID
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
        showMessage(
            'warning',
            'Are you sure you want to delete this holiday?',
            () => {
                setHolidays(prev => prev.filter(h => h.id !== id));
                showMessage('success', 'Holiday deleted successfully');
            },
            'Yes, delete it'
        );
    };

    const getAttendanceStatus = (employeeId) => {
        // Check if selected date is a holiday
        if (isHoliday(selectedDate)) {
            return 'holiday';
        }
        
        const empAttendance = attendanceData[employeeId]?.[selectedDate];
        if (!empAttendance) return 'pending';
        return empAttendance.status || 'pending';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'success';
            case 'absent': return 'danger';
            case 'holiday': return 'purple';
            default: return 'light';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present': return <IconCheckCircle className="w-5 h-5" />;
            case 'absent': return <IconXCircle className="w-5 h-5" />;
            case 'holiday': return <IconSun className="w-5 h-5" />;
            default: return null;
        }
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

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const exportAttendance = () => {
        const data = {
            date: selectedDate,
            holiday: isHoliday(selectedDate) ? getHolidayName(selectedDate) : 'No',
            employees: filteredEmployees.map(emp => ({
                name: emp.employeeName,
                code: emp.employeeCode || 'N/A',
                department: emp.departmentName || 'N/A',
                designation: emp.designationName,
                status: getAttendanceStatus(emp.employeeId),
                markedAt: attendanceData[emp.employeeId]?.[selectedDate]?.markedAt 
                    ? moment(attendanceData[emp.employeeId]?.[selectedDate]?.markedAt).format('HH:mm:ss')
                    : 'N/A'
            }))
        };
        
        // Create CSV content
        const csvContent = [
            ['Date', selectedDate],
            ['Holiday', data.holiday],
            [''],
            ['Employee Name', 'Employee Code', 'Department', 'Designation', 'Status', 'Marked Time'],
            ...data.employees.map(emp => [
                emp.name,
                emp.code,
                emp.department,
                emp.designation,
                emp.status,
                emp.markedAt
            ])
        ].map(row => row.join(',')).join('\n');

        // Create and download file
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

    // Holiday badge component
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

    const clearAllAttendance = () => {
        showMessage(
            'warning',
            'Are you sure you want to clear all attendance for today?',
            () => {
                const updatedAttendance = { ...attendanceData };
                
                filteredEmployees.forEach(emp => {
                    if (updatedAttendance[emp.employeeId]) {
                        delete updatedAttendance[emp.employeeId][selectedDate];
                    }
                });
                
                setAttendanceData(updatedAttendance);
                showMessage('success', 'All attendance cleared for today');
            },
            'Yes, clear all'
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="panel">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white-light">Attendance Management</h2>
                        <p className="text-gray-500 dark:text-gray-400">Simple attendance marking system</p>
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    {/* Department Filter */}
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="form-select"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((dept, index) => (
                            dept !== 'all' && (
                                <option key={index} value={dept}>{dept}</option>
                            )
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-select"
                    >
                        <option value="all">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
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
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['present', 'absent', 'pending', 'holiday'].map((status) => (
                        <div key={status} className={`bg-${getStatusColor(status)}-50 dark:bg-${getStatusColor(status)}-900/20 p-4 rounded-lg`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">{status}</div>
                                    <div className={`text-2xl font-bold text-${getStatusColor(status)}-600`}>
                                        {getStatusCount(status)}
                                    </div>
                                </div>
                                {getStatusIcon(status)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => markAllAttendance('present')}
                        disabled={isHoliday(selectedDate)}
                        className={`btn btn-success ${isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Mark All Present
                    </button>
                    <button
                        onClick={() => markAllAttendance('absent')}
                        disabled={isHoliday(selectedDate)}
                        className={`btn btn-danger ${isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Mark All Absent
                    </button>
                    <button
                        onClick={clearAllAttendance}
                        className="btn btn-secondary"
                    >
                        Clear All
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

                {loading ? (
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
                                        <th className="px-4 py-3 text-left">Department</th>
                                        <th className="px-4 py-3 text-left">Designation</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((employee, index) => {
                                        const status = getAttendanceStatus(employee.employeeId);
                                        const markedTime = attendanceData[employee.employeeId]?.[selectedDate]?.markedAt 
                                            ? moment(attendanceData[employee.employeeId]?.[selectedDate]?.markedAt).format('HH:mm')
                                            : null;
                                        
                                        return (
                                            <tr key={employee.employeeId} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900">
                                                <td className="px-4 py-3">{indexOfFirstItem + index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <IconUser className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{employee.employeeName}</div>
                                                            <div className="text-xs text-gray-500">{employee.employeeCode || '-'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{employee.departmentName || '-'}</td>
                                                <td className="px-4 py-3">{employee.designationName}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-${getStatusColor(status)}`}>
                                                            {getStatusIcon(status)}
                                                        </span>
                                                        <span className={`badge badge-${getStatusColor(status)} capitalize`}>
                                                            {status}
                                                        </span>
                                                        {markedTime && status !== 'holiday' && (
                                                            <span className="text-xs text-gray-500">
                                                                at {markedTime}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'present')}
                                                            disabled={status === 'holiday'}
                                                            className={`btn btn-outline-success btn-sm ${status === 'holiday' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleAttendanceChange(employee.employeeId, 'absent')}
                                                            disabled={status === 'holiday'}
                                                            className={`btn btn-outline-danger btn-sm ${status === 'holiday' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        >
                                                            Absent
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
                                const markedTime = attendanceData[employee.employeeId]?.[selectedDate]?.markedAt 
                                    ? moment(attendanceData[employee.employeeId]?.[selectedDate]?.markedAt).format('HH:mm')
                                    : null;
                                
                                return (
                                    <div key={employee.employeeId} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <IconUser className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{employee.employeeName}</div>
                                                    <div className="text-sm text-gray-500">{employee.designationName}</div>
                                                </div>
                                            </div>
                                            <span className={`badge badge-${getStatusColor(status)} capitalize`}>
                                                {status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                            <div>
                                                <div className="text-gray-500">Department</div>
                                                <div>{employee.departmentName || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Employee Code</div>
                                                <div>{employee.employeeCode || '-'}</div>
                                            </div>
                                        </div>

                                        {markedTime && status !== 'holiday' && (
                                            <div className="text-sm text-gray-500 mb-3">
                                                Marked at: {markedTime}
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 pt-3 border-t">
                                            <button
                                                onClick={() => handleAttendanceChange(employee.employeeId, 'present')}
                                                disabled={status === 'holiday'}
                                                className={`btn btn-success btn-sm flex-1 ${status === 'holiday' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Present
                                            </button>
                                            <button
                                                onClick={() => handleAttendanceChange(employee.employeeId, 'absent')}
                                                disabled={status === 'holiday'}
                                                className={`btn btn-danger btn-sm flex-1 ${status === 'holiday' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                Absent
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
                                            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
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
                                <label className="block text-sm font-medium mb-1">Holiday Name *</label>
                                <input
                                    type="text"
                                    value={holidayForm.holidayName}
                                    onChange={(e) => setHolidayForm(prev => ({ ...prev, holidayName: e.target.value }))}
                                    className="form-input w-full"
                                    placeholder="Enter holiday name"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={holidayForm.holidayDate}
                                    onChange={(e) => setHolidayForm(prev => ({ ...prev, holidayDate: e.target.value }))}
                                    className="form-input w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={holidayForm.description}
                                    onChange={(e) => setHolidayForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="form-textarea w-full"
                                    rows="3"
                                    placeholder="Enter holiday description (optional)..."
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
                            >
                                Save Holiday
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
                            <h3 className="text-lg font-semibold">Holiday List ({holidays.length})</h3>
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
                                                <th className="px-4 py-3 text-left">Description</th>
                                                <th className="px-4 py-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holidays.map(holiday => (
                                                <tr key={holiday.id} className="border-b dark:border-gray-700">
                                                    <td className="px-4 py-3 font-medium">{holiday.holidayName}</td>
                                                    <td className="px-4 py-3">
                                                        {dateConversion(holiday.holidayDate, 'DD MMMM YYYY')}
                                                    </td>
                                                    <td className="px-4 py-3">{holiday.description || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => deleteHoliday(holiday.id)}
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