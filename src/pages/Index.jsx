import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../redux/themeStore/themeConfigSlice';
import { showMessage } from '../util/AllFunction';
import { getEmployee } from '../redux/employeeSlice';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Select from 'react-select';

// Icons
import IconUsers from '../components/Icon/IconUsers';
import IconTruck from '../components/Icon/IconTruck';
import IconPackage from '../components/Icon/IconBox';
import IconMoney from '../components/Icon/IconCreditCard';
import IconCalendar from '../components/Icon/IconCalendar';
import IconCheckCircle from '../components/Icon/IconCheckCircle';
import IconXCircle from '../components/Icon/IconXCircle';
import IconClock from '../components/Icon/IconClock';
import IconSun from '../components/Icon/IconSun';
import IconChartBar from '../components/Icon/IconChartBar';
import IconTrendingUp from '../components/Icon/IconTrendingUp';
import IconTrendingDown from '../components/Icon/IconTrendingDown';
import IconReceipt from '../components/Icon/IconReceipt';
import IconEye from '../components/Icon/IconEye';
import IconPlus from '../components/Icon/IconPlus';
// import IconFileText from '../components/Icon/IconFileText';
import IconPrinter from '../components/Icon/IconPrinter';
import IconDownload from '../components/Icon/IconDownload';
// import IconFilter from '../components/Icon/IconFilter';
import IconSearch from '../components/Icon/IconSearch';
import IconEdit from '../components/Icon/IconEdit';
import IconCheck from '../components/Icon/IconCheck';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employeeData } = useSelector((state) => state.EmployeeSlice);

  // States
  const [loading, setLoading] = useState(true);
  const [employeeList, setEmployeeList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAttendanceSummary, setShowAttendanceSummary] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [holidays, setHolidays] = useState([
    { id: 1, holidayName: 'New Year', holidayDate: '2024-01-01', description: 'New Year Celebration' },
    { id: 2, holidayName: 'Republic Day', holidayDate: '2024-01-26', description: 'Republic Day Celebration' },
  ]);

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: 0,
    totalDrivers: 0,
    totalLoadmen: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    pendingPackages: 0,
    deliveredPackages: 0,
    todayRevenue: 0,
    totalRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
  });

  // Recent activities
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'trip', title: 'New Trip Assigned', description: 'Trip #TRP-001 assigned to Rajesh Kumar', time: '2 hours ago', icon: '🚚', color: 'blue' },
    { id: 2, type: 'payment', title: 'Payment Received', description: '₹25,000 received from John Doe', time: '3 hours ago', icon: '💰', color: 'green' },
    { id: 3, type: 'package', title: 'Package Delivered', description: 'Package #PKG-001 delivered successfully', time: '4 hours ago', icon: '📦', color: 'purple' },
    { id: 4, type: 'employee', title: 'New Employee Joined', description: 'Mike Johnson joined as Driver', time: '1 day ago', icon: '👤', color: 'orange' },
    { id: 5, type: 'expense', title: 'Vehicle Expense', description: '₹5,000 spent on vehicle maintenance', time: '2 days ago', icon: '💸', color: 'red' },
  ]);

  // Quick stats cards
  const quickStats = [
    {
      title: 'Today\'s Attendance',
      value: `${dashboardStats.presentToday}/${dashboardStats.totalEmployees}`,
      percentage: dashboardStats.totalEmployees > 0 ? ((dashboardStats.presentToday / dashboardStats.totalEmployees) * 100).toFixed(0) : 0,
      icon: <IconUsers className="w-6 h-6 text-blue-600" />,
      color: 'blue',
      link: '/attendance',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Trips',
      value: dashboardStats.activeTrips,
      subValue: `of ${dashboardStats.totalTrips} total`,
      icon: <IconTruck className="w-6 h-6 text-green-600" />,
      color: 'green',
      link: '/assign-trip',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Packages',
      value: dashboardStats.pendingPackages,
      subValue: `${dashboardStats.deliveredPackages} delivered`,
      icon: <IconPackage className="w-6 h-6 text-orange-600" />,
      color: 'orange',
      link: '/delivery',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Today\'s Revenue',
      value: `₹${dashboardStats.todayRevenue.toLocaleString('en-IN')}`,
      subValue: `Profit: ₹${dashboardStats.monthlyProfit.toLocaleString('en-IN')}`,
      icon: <IconMoney className="w-6 h-6 text-purple-600" />,
      color: 'purple',
      link: '/reports/profit-loss',
      bgColor: 'bg-purple-50'
    }
  ];

  // Report cards
  const reportCards = [
    {
      title: 'Attendance Report',
      description: 'View employee attendance records',
      icon: <IconCalendar className="w-8 h-8 text-blue-600" />,
      link: '/reports/attendance',
      color: 'blue'
    },
    {
      title: 'Package Report',
      description: 'Track all package deliveries',
      icon: <IconPackage className="w-8 h-8 text-green-600" />,
      link: '/reports/package',
      color: 'green'
    },
    {
      title: 'Profit & Loss',
      description: 'Financial analysis report',
      icon: <IconMoney className="w-8 h-8 text-purple-600" />,
      link: '/reports/profit-loss',
      color: 'purple'
    },
    {
      title: 'Trip Report',
      description: 'Trip assignments and status',
      icon: <IconTruck className="w-8 h-8 text-orange-600" />,
      link: '/reports/trip',
      color: 'orange'
    }
  ];

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employees
      await dispatch(getEmployee());
      
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

      // Simulate API delay
      setTimeout(() => {
        // Calculate dashboard stats
        calculateDashboardStats();
        setLoading(false);
      }, 1000);

    } catch (error) {
      showMessage('error', 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeData) {
      const employees = employeeData.filter(emp => emp.designationName?.toLowerCase() !== 'loadman');
      setEmployeeList(employees);
      calculateAttendanceStats();
    }
  }, [employeeData, attendanceData, selectedDate]);

  const calculateAttendanceStats = () => {
    if (!employeeList.length) return;

    const today = selectedDate;
    const isHoliday = holidays.some(h => h.holidayDate === today);
    
    if (isHoliday) return;

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    employeeList.forEach(emp => {
      const empAttendance = attendanceData[emp.employeeId]?.[today];
      if (empAttendance) {
        if (empAttendance.status === 'present') presentCount++;
        else if (empAttendance.status === 'absent') absentCount++;
        else if (empAttendance.status === 'leave') leaveCount++;
      } else {
        absentCount++; // Not marked yet
      }
    });

    setDashboardStats(prev => ({
      ...prev,
      totalEmployees: employeeList.length,
      presentToday: presentCount,
      absentToday: absentCount,
      onLeaveToday: leaveCount
    }));
  };

  const calculateDashboardStats = () => {
    // Mock data for dashboard stats
    setDashboardStats({
      totalEmployees: 45,
      totalDrivers: 15,
      totalLoadmen: 20,
      presentToday: 38,
      absentToday: 5,
      onLeaveToday: 2,
      totalTrips: 125,
      activeTrips: 18,
      completedTrips: 107,
      pendingPackages: 45,
      deliveredPackages: 320,
      todayRevenue: 125000,
      totalRevenue: 2850000,
      monthlyExpenses: 850000,
      monthlyProfit: 2000000,
    });
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
          markedDate: selectedDate,
          markedBy: 'Admin'
        }
      }
    }));

    // Save to localStorage
    localStorage.setItem('attendanceData', JSON.stringify({
      ...attendanceData,
      [employeeId]: {
        ...attendanceData[employeeId],
        [selectedDate]: {
          status: status,
          markedAt: new Date().toISOString(),
          markedDate: selectedDate,
          markedBy: 'Admin'
        }
      }
    }));

    showMessage('success', `Marked ${status} for employee`);
    setShowAttendanceModal(false);
  };

  const markAllAttendance = (status) => {
    if (isHoliday(selectedDate)) {
      showMessage('info', `Cannot mark attendance on ${getHolidayName(selectedDate)} holiday`);
      return;
    }

    const updatedAttendance = { ...attendanceData };
    employeeList.forEach(emp => {
      if (!updatedAttendance[emp.employeeId]) {
        updatedAttendance[emp.employeeId] = {};
      }
      updatedAttendance[emp.employeeId][selectedDate] = {
        status: status,
        markedAt: new Date().toISOString(),
        markedDate: selectedDate,
        markedBy: 'Admin'
      };
    });

    setAttendanceData(updatedAttendance);
    localStorage.setItem('attendanceData', JSON.stringify(updatedAttendance));
    showMessage('success', `Marked all employees as ${status}`);
  };

  const getAttendanceStatus = (employeeId) => {
    if (isHoliday(selectedDate)) {
      return 'holiday';
    }
    const empAttendance = attendanceData[employeeId]?.[selectedDate];
    if (!empAttendance) return 'pending';
    return empAttendance.status || 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'leave': return 'bg-yellow-100 text-yellow-800';
      case 'holiday': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <IconCheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent': return <IconXCircle className="w-4 h-4 text-red-600" />;
      case 'leave': return <IconClock className="w-4 h-4 text-yellow-600" />;
      case 'holiday': return <IconSun className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  const openAttendanceModal = (employee) => {
    setSelectedEmployee(employee);
    setAttendanceStatus(getAttendanceStatus(employee.employeeId));
    setShowAttendanceModal(true);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white border border-gray-300 rounded-lg p-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 text-sm"
              />
            </div>
            {isHoliday(selectedDate) && (
              <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium">
                <IconSun className="w-4 h-4 inline mr-1" />
                {getHolidayName(selectedDate)} - Holiday
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline mt-2">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{stat.value}</p>
                  {stat.percentage && (
                    <span className="ml-2 text-sm text-green-600 font-medium">
                      {stat.percentage}%
                    </span>
                  )}
                </div>
                {stat.subValue && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.subValue}</p>
                )}
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor.replace('bg-', 'bg-').replace('-50', '-100')}`}>
                {stat.icon}
              </div>
            </div>
            <Link 
              to={stat.link}
              className="block text-center mt-4 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6">
        {/* Left Column - Attendance Summary */}
        <div className="lg:col-span-2">
          {/* Attendance Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                    <IconUsers className="w-5 h-5 mr-2 text-blue-600" />
                    Today's Attendance
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {moment(selectedDate).format('dddd, DD MMMM YYYY')}
                    {isHoliday(selectedDate) && (
                      <span className="ml-2 text-purple-600">
                        ({getHolidayName(selectedDate)} - Holiday)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => markAllAttendance('present')}
                    disabled={isHoliday(selectedDate)}
                    className={`px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors ${isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <IconCheck className="w-4 h-4 inline mr-1" />
                    Mark All Present
                  </button>
                  <button
                    onClick={() => setShowAttendanceSummary(true)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <IconEye className="w-4 h-4 inline mr-1" />
                    View Summary
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {/* Attendance Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-700">{dashboardStats.presentToday}</div>
                  <div className="text-sm text-green-600 font-medium">Present</div>
                </div>
                <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-red-700">{dashboardStats.absentToday}</div>
                  <div className="text-sm text-red-600 font-medium">Absent</div>
                </div>
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-700">{dashboardStats.onLeaveToday}</div>
                  <div className="text-sm text-yellow-600 font-medium">On Leave</div>
                </div>
              </div>

              {/* Quick Attendance Actions */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => markAllAttendance('present')}
                    disabled={isHoliday(selectedDate)}
                    className={`px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors ${isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAllAttendance('absent')}
                    disabled={isHoliday(selectedDate)}
                    className={`px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors ${isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Mark All Absent
                  </button>
                  <Link
                    to="/attendance"
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    View Full Report
                  </Link>
                </div>
              </div>

              {/* Recent Attendance Updates */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Updates</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {employeeList.slice(0, 5).map((emp) => {
                    const status = getAttendanceStatus(emp.employeeId);
                    return (
                      <div key={emp.employeeId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <IconUsers className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">{emp.employeeName}</div>
                            <div className="text-xs text-gray-500">{emp.designationName}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <button
                            onClick={() => openAttendanceModal(emp)}
                            disabled={isHoliday(selectedDate)}
                            className={`p-1 rounded ${isHoliday(selectedDate) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                          >
                            <IconEdit className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {reportCards.map((report, index) => (
              <Link
                key={index}
                to={report.link}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-${report.color}-50 group-hover:bg-${report.color}-100 transition-colors`}>
                    {report.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{report.description}</p>
                    <div className="mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                      Generate Report →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column - Recent Activities & Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <IconClock className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activities
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm">{activity.title}</h4>
                      <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                      <p className="text-gray-400 text-xs mt-2">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/activities"
                className="block text-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All Activities →
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
                <IconPlus className="w-5 h-5 mr-2 text-green-600" />
                Quick Actions
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <Link
                  to="/assign-trip"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <IconTruck className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-800">Assign New Trip</span>
                  </div>
                  <IconPlus className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                </Link>
                <Link
                  to="/delivery"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <IconPackage className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-800">Update Delivery Status</span>
                  </div>
                  <IconEdit className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                </Link>
                <Link
                  to="/reports/profit-loss"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <IconMoney className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-800">Generate P&L Report</span>
                  </div>
                  <IconDownload className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
                </Link>
                <Link
                  to="/salary"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <IconReceipt className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-gray-800">Process Salary</span>
                  </div>
                  <IconPrinter className="w-4 h-4 text-orange-600 group-hover:text-orange-700" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
            <IconChartBar className="w-5 h-5 mr-2 text-blue-600" />
            Financial Overview
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    ₹{dashboardStats.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
                <IconTrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    ₹{dashboardStats.monthlyExpenses.toLocaleString('en-IN')}
                  </p>
                </div>
                <IconTrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Profit</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    ₹{dashboardStats.monthlyProfit.toLocaleString('en-IN')}
                  </p>
                </div>
                <IconMoney className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Update Attendance
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {selectedEmployee.employeeName} • {selectedEmployee.designationName}
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <IconUsers className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-medium text-gray-800">{selectedEmployee.employeeName}</p>
                  <p className="text-gray-600 text-sm">{selectedEmployee.designationName}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAttendanceStatus('present')}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        attendanceStatus === 'present'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <IconCheckCircle className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">Present</span>
                    </button>
                    <button
                      onClick={() => setAttendanceStatus('absent')}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        attendanceStatus === 'absent'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
                      }`}
                    >
                      <IconXCircle className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">Absent</span>
                    </button>
                    <button
                      onClick={() => setAttendanceStatus('leave')}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        attendanceStatus === 'leave'
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
                      }`}
                    >
                      <IconClock className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">Leave</span>
                    </button>
                    <button
                      onClick={() => setAttendanceStatus('half_day')}
                      className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                        attendanceStatus === 'half_day'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <IconClock className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">Half Day</span>
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="text-xs text-gray-500 mb-2">
                    Date: {moment(selectedDate).format('DD MMMM YYYY')}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAttendanceChange(selectedEmployee.employeeId, attendanceStatus)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Update Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Summary Modal */}
      {showAttendanceSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  Attendance Summary - {moment(selectedDate).format('DD MMMM YYYY')}
                </h3>
                <button
                  onClick={() => setShowAttendanceSummary(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-700">{dashboardStats.presentToday}</div>
                    <div className="text-green-600 font-medium">Present</div>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-700">{dashboardStats.absentToday}</div>
                    <div className="text-red-600 font-medium">Absent</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-700">{dashboardStats.totalEmployees}</div>
                    <div className="text-blue-600 font-medium">Total Employees</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {employeeList.map((emp) => {
                  const status = getAttendanceStatus(emp.employeeId);
                  const markedTime = attendanceData[emp.employeeId]?.[selectedDate]?.markedAt
                    ? moment(attendanceData[emp.employeeId]?.[selectedDate]?.markedAt).format('HH:mm')
                    : null;
                  return (
                    <div key={emp.employeeId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <IconUsers className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{emp.employeeName}</div>
                          <div className="text-sm text-gray-500">{emp.designationName}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        {markedTime && (
                          <span className="text-sm text-gray-500">at {markedTime}</span>
                        )}
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setAttendanceStatus(status);
                            setShowAttendanceSummary(false);
                            setShowAttendanceModal(true);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <IconEdit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Total: {dashboardStats.totalEmployees} employees
                </div>
                <button
                  onClick={() => setShowAttendanceSummary(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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

export default Dashboard;