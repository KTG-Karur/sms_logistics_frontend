import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../redux/themeStore/themeConfigSlice';
import moment from 'moment';

// Import Icons
import IconTruck from '../components/Icon/IconTruck';
import IconPackage from '../components/Icon/IconBox';
import IconMoney from '../components/Icon/IconCreditCard';
import IconUsers from '../components/Icon/IconUsers';
import IconCalendar from '../components/Icon/IconCalendar';
import IconMapPin from '../components/Icon/IconMapPin';
import IconTrendingUp from '../components/Icon/IconTrendingUp';
import IconTrendingDown from '../components/Icon/IconTrendingDown';
import IconCheckCircle from '../components/Icon/IconCheckCircle';
import IconClock from '../components/Icon/IconClock';
import IconAlertTriangle from '../components/Icon/IconTrashLines';
import IconChartBar from '../components/Icon/IconChartBar';
import IconReceipt from '../components/Icon/IconReceipt';
import IconFileText from '../components/Icon/IconFile';
import IconEye from '../components/Icon/IconEye';
import IconExternalLink from '../components/Icon/IconExternalLink';
import IconRoute from '../components/Icon/Menu/IconMenuWidgets';
import IconLayers from '../components/Icon/IconLayers';

// Brand Colors for Logistics Dashboard
const brandColors = {
  primary: '#2e3092',      // Dark Blue - Logistics
  secondary: '#f16521',    // Orange - Action Required
  success: '#10b981',      // Green - Completed/Delivered
  warning: '#f59e0b',      // Yellow - In Progress/Pending
  danger: '#ef4444',       // Red - Delayed/Issues
  info: '#3b82f6',         // Blue - In Transit
  purple: '#8b5cf6',       // Purple - Financial
};

const LogisticsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setPageTitle('Logistics Dashboard'));
  }, []);

  // Static Logistics Data (Would come from APIs in real app)
  const staticLogisticsData = useMemo(() => ({
    // Overall Statistics
    statistics: {
      totalTrips: 248,
      completedTrips: 185,
      inProgressTrips: 45,
      delayedTrips: 18,
      totalPackages: 1245,
      deliveredPackages: 987,
      pendingPackages: 258,
      totalRevenue: 852500,
      totalExpenses: 624800,
      netProfit: 227700,
      activeVehicles: 28,
      activeDrivers: 32,
      activeLoadmen: 48,
    },

    // Recent Trips
    recentTrips: [
      {
        id: 1,
        tripNo: 'TRIP0012',
        vehicleNo: 'TN01AB1234',
        driver: 'Rajesh Kumar',
        fromCenter: 'Chennai Central Hub',
        toCenter: 'Bangalore South Terminal',
        startDate: '2024-01-25',
        status: 'completed',
        distance: '350km',
        packages: 12,
        revenue: 4250,
        expenses: 3200,
        netProfit: 1050,
      },
      {
        id: 2,
        tripNo: 'TRIP0013',
        vehicleNo: 'KA02CD5678',
        driver: 'Suresh Patel',
        fromCenter: 'Hyderabad Distribution',
        toCenter: 'Pune Delivery Hub',
        startDate: '2024-01-25',
        status: 'in_progress',
        distance: '750km',
        packages: 8,
        revenue: 3650,
        expenses: 2800,
        netProfit: 850,
      },
      {
        id: 3,
        tripNo: 'TRIP0014',
        vehicleNo: 'MH03EF9012',
        driver: 'Mohan Singh',
        fromCenter: 'Mumbai Port Facility',
        toCenter: 'Delhi North Warehouse',
        startDate: '2024-01-24',
        status: 'in_progress',
        distance: '1400km',
        packages: 15,
        revenue: 8900,
        expenses: 6500,
        netProfit: 2400,
      },
      {
        id: 4,
        tripNo: 'TRIP0015',
        vehicleNo: 'DL04GH3456',
        driver: 'Amit Sharma',
        fromCenter: 'Kolkata East Station',
        toCenter: 'Bhubaneswar Hub',
        startDate: '2024-01-25',
        status: 'delayed',
        distance: '450km',
        packages: 6,
        revenue: 2850,
        expenses: 2200,
        netProfit: 650,
      },
      {
        id: 5,
        tripNo: 'TRIP0016',
        vehicleNo: 'GJ05IJ7890',
        driver: 'Sanjay Verma',
        fromCenter: 'Ahmedabad Logistics',
        toCenter: 'Surat Terminal',
        startDate: '2024-01-25',
        status: 'scheduled',
        distance: '250km',
        packages: 10,
        revenue: 4200,
        expenses: 3100,
        netProfit: 1100,
      },
    ],

    // Top Performing Routes
    topRoutes: [
      {
        id: 1,
        route: 'Chennai → Bangalore',
        trips: 45,
        packages: 280,
        revenue: 125000,
        expenses: 95000,
        profit: 30000,
        efficiency: '85%',
        avgDeliveryTime: '5.2hrs',
      },
      {
        id: 2,
        route: 'Mumbai → Delhi',
        trips: 32,
        packages: 420,
        revenue: 210000,
        expenses: 175000,
        profit: 35000,
        efficiency: '78%',
        avgDeliveryTime: '32hrs',
      },
      {
        id: 3,
        route: 'Hyderabad → Pune',
        trips: 28,
        packages: 195,
        revenue: 98500,
        expenses: 72000,
        profit: 26500,
        efficiency: '92%',
        avgDeliveryTime: '12hrs',
      },
      {
        id: 4,
        route: 'Kolkata → Bhubaneswar',
        trips: 22,
        packages: 110,
        revenue: 62500,
        expenses: 48000,
        profit: 14500,
        efficiency: '88%',
        avgDeliveryTime: '7hrs',
      },
      {
        id: 5,
        route: 'Ahmedabad → Surat',
        trips: 18,
        packages: 95,
        revenue: 48500,
        expenses: 37000,
        profit: 11500,
        efficiency: '90%',
        avgDeliveryTime: '3.5hrs',
      },
    ],

    // Package Status Summary
    packageStatus: [
      { status: 'Delivered', count: 987, percentage: 79.2, color: 'success' },
      { status: 'In Transit', count: 158, percentage: 12.7, color: 'info' },
      { status: 'Pending', count: 85, percentage: 6.8, color: 'warning' },
      { status: 'Delayed', count: 15, percentage: 1.2, color: 'danger' },
      { status: 'Cancelled', count: 3, percentage: 0.2, color: 'secondary' },
    ],

    // Vehicle Utilization
    vehicleUtilization: [
      { vehicleType: 'Trucks (10+ ton)', total: 8, active: 7, utilization: 87.5 },
      { vehicleType: 'Medium Trucks (5-10 ton)', total: 12, active: 10, utilization: 83.3 },
      { vehicleType: 'Small Trucks (1-5 ton)', total: 15, active: 11, utilization: 73.3 },
      { vehicleType: 'Pickup Vans', total: 10, active: 8, utilization: 80.0 },
      { vehicleType: 'Two-wheelers', total: 5, active: 3, utilization: 60.0 },
    ],

    // Staff Attendance (Today)
    todayAttendance: {
      totalStaff: 85,
      present: 72,
      absent: 8,
      onLeave: 5,
      attendanceRate: 84.7,
    },

    // Upcoming Trips
    upcomingTrips: [
      {
        id: 1,
        tripNo: 'TRIP0017',
        vehicleNo: 'TN01AB1234',
        driver: 'Rajesh Kumar',
        route: 'Chennai → Bangalore',
        scheduledDate: '2024-01-26',
        packages: 14,
        estimatedRevenue: 5200,
        priority: 'High',
      },
      {
        id: 2,
        tripNo: 'TRIP0018',
        vehicleNo: 'KA02CD5678',
        driver: 'Suresh Patel',
        route: 'Bangalore → Mysore',
        scheduledDate: '2024-01-26',
        packages: 8,
        estimatedRevenue: 3200,
        priority: 'Medium',
      },
      {
        id: 3,
        tripNo: 'TRIP0019',
        vehicleNo: 'MH03EF9012',
        driver: 'Mohan Singh',
        route: 'Delhi → Chandigarh',
        scheduledDate: '2024-01-27',
        packages: 18,
        estimatedRevenue: 9800,
        priority: 'High',
      },
      {
        id: 4,
        tripNo: 'TRIP0020',
        vehicleNo: 'DL04GH3456',
        driver: 'Amit Sharma',
        route: 'Kolkata → Durgapur',
        scheduledDate: '2024-01-26',
        packages: 6,
        estimatedRevenue: 2800,
        priority: 'Low',
      },
    ],

    // Financial Overview (Last 7 Days)
    financialOverview: {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      revenue: [85000, 92000, 78000, 105000, 125000, 95000, 88000],
      expenses: [62000, 68000, 58000, 78000, 92000, 72000, 65000],
      profit: [23000, 24000, 20000, 27000, 33000, 23000, 23000],
    },

    // Issues/Incidents
    recentIssues: [
      {
        id: 1,
        type: 'Vehicle Breakdown',
        vehicle: 'DL04GH3456',
        driver: 'Amit Sharma',
        location: 'Near Kolkata',
        status: 'Resolved',
        priority: 'High',
        date: '2024-01-24',
      },
      {
        id: 2,
        type: 'Package Damage',
        tripNo: 'TRIP0013',
        packageCount: 2,
        estimatedLoss: 4500,
        status: 'Investigating',
        priority: 'Medium',
        date: '2024-01-25',
      },
      {
        id: 3,
        type: 'Route Delay',
        route: 'Mumbai → Delhi',
        delayHours: 8,
        reason: 'Heavy Traffic',
        status: 'Active',
        priority: 'Low',
        date: '2024-01-25',
      },
      {
        id: 4,
        type: 'Document Missing',
        tripNo: 'TRIP0012',
        driver: 'Rajesh Kumar',
        status: 'Pending',
        priority: 'Medium',
        date: '2024-01-25',
      },
    ],
  }), []);

  // Calculate Metrics
  const calculateMetrics = useMemo(() => {
    const stats = staticLogisticsData.statistics;
    return {
      totalTrips: {
        value: stats.totalTrips.toLocaleString(),
        percentage: Math.min((stats.completedTrips / stats.totalTrips) * 100, 100),
        description: 'Total trips conducted',
      },
      totalRevenue: {
        value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`,
        percentage: Math.min((stats.totalRevenue / 1000000) * 100, 100),
        description: 'Total revenue generated',
      },
      netProfit: {
        value: `₹${(stats.netProfit / 1000).toFixed(0)}K`,
        percentage: stats.totalRevenue > 0 ? Math.min((stats.netProfit / stats.totalRevenue) * 100, 100) : 0,
        description: 'Net profit margin',
      },
      deliveryRate: {
        value: `${((stats.deliveredPackages / stats.totalPackages) * 100).toFixed(1)}%`,
        percentage: (stats.deliveredPackages / stats.totalPackages) * 100,
        description: 'Package delivery rate',
      },
    };
  }, []);

  // Calculate KPI Metrics
  const calculateKPIs = useMemo(() => {
    const stats = staticLogisticsData.statistics;
    const today = staticLogisticsData.todayAttendance;
    return {
      vehicleUtilization: Math.round((stats.activeVehicles / 35) * 100), // Assuming 35 total vehicles
      onTimeDelivery: 87.5, // Static for demo
      staffAttendance: today.attendanceRate,
      profitMargin: stats.totalRevenue > 0 ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0,
    };
  }, []);

  // Get Status Badge
  const getStatusBadge = (status) => {
    const config = {
      completed: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <IconCheckCircle className="w-3 h-3" />,
      },
      in_progress: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <IconClock className="w-3 h-3" />,
      },
      scheduled: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <IconClock className="w-3 h-3" />,
      },
      delayed: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <IconAlertTriangle className="w-3 h-3" />,
      },
      cancelled: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <IconAlertTriangle className="w-3 h-3" />,
      },
    };
    const configItem = config[status] || config.scheduled;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${configItem.color}`}>
        {configItem.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Get Priority Badge
  const getPriorityBadge = (priority) => {
    const config = {
      High: { color: 'bg-red-100 text-red-800', icon: '🔴' },
      Medium: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
      Low: { color: 'bg-blue-100 text-blue-800', icon: '🔵' },
    };
    const configItem = config[priority] || config.Medium;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${configItem.color}`}>
        <span className="text-xs">{configItem.icon}</span>
        {priority}
      </span>
    );
  };

  // Main Stats Cards
  const MainStatCard = ({ title, value, percentage, description, icon: Icon, delay, onClick, color = 'primary' }) => {
    const colorMap = {
      primary: brandColors.primary,
      secondary: brandColors.secondary,
      success: brandColors.success,
      warning: brandColors.warning,
      danger: brandColors.danger,
      info: brandColors.info,
      purple: brandColors.purple,
    };
    
    const bgColor = colorMap[color];
    
    return (
      <div
        className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
        style={{ animationDelay: `${delay}ms` }}
        onClick={onClick}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundColor: bgColor }}></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${bgColor}15` }}>
              <Icon style={{ color: bgColor }} className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: bgColor }}></div>
                <span className="text-sm font-semibold" style={{ color: bgColor }}>Live</span>
              </div>
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="h-2 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: bgColor,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    );
  };

  // KPI Card
  const KPICard = ({ title, value, target, status, icon: Icon }) => {
    const isPositive = value >= target;
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${brandColors.primary}15` }}>
            <Icon style={{ color: brandColors.primary }} className="w-5 h-5" />
          </div>
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '✓ On Target' : '⚠️ Below Target'}
          </span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}{title.includes('%') ? '' : '%'}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Target: {target}%</span>
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{Math.abs(value - target)}%
          </span>
        </div>
      </div>
    );
  };

  // Mini Metric Card
  const MiniMetricCard = ({ title, value, change, icon: Icon, color }) => {
    const isPositive = change >= 0;
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">{title}</p>
            <p className="text-xl font-bold mt-1" style={{ color: color || brandColors.primary }}>{value}</p>
            <div className="flex items-center space-x-1 mt-1">
              <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↗' : '↘'} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color || brandColors.primary}15` }}>
            <Icon style={{ color: color || brandColors.primary }} className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  // Vehicle Utilization Card
  const VehicleUtilizationCard = ({ vehicleType, total, active, utilization }) => {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">{vehicleType}</h4>
          <span className={`text-sm font-bold ${utilization >= 80 ? 'text-green-600' : utilization >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {utilization}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${utilization}%`,
              backgroundColor: utilization >= 80 ? brandColors.success : utilization >= 60 ? brandColors.warning : brandColors.danger,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Active: {active}</span>
          <span>Total: {total}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-5 animate-pulse" style={{ backgroundColor: brandColors.primary }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full opacity-5 animate-bounce" style={{ backgroundColor: brandColors.secondary }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>Logistics Operations Dashboard</h1>
            <p className="text-gray-600">Monitor trips, track packages, and manage logistics operations in real-time</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button
              onClick={() => navigate('/reports/trip-report')}
              className="px-6 py-2.5 rounded-xl font-medium border transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: 'white', borderColor: brandColors.primary, color: brandColors.primary }}
            >
              View All Reports
            </button>
            <button
              onClick={() => navigate('/trips/create')}
              className="px-6 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              style={{ backgroundColor: brandColors.secondary, color: 'white' }}
            >
              <IconTruck className="w-5 h-5" />
              <span>New Trip</span>
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <MainStatCard
            onClick={() => navigate('/reports/trip-report')}
            title="TOTAL TRIPS"
            value={calculateMetrics.totalTrips.value}
            percentage={calculateMetrics.totalTrips.percentage}
            description={calculateMetrics.totalTrips.description}
            icon={IconTruck}
            delay={0}
            color="primary"
          />
          <MainStatCard
            onClick={() => navigate('/reports/profit-loss-report')}
            title="TOTAL REVENUE"
            value={calculateMetrics.totalRevenue.value}
            percentage={calculateMetrics.totalRevenue.percentage}
            description={calculateMetrics.totalRevenue.description}
            icon={IconMoney}
            delay={200}
            color="success"
          />
          <MainStatCard
            onClick={() => navigate('/reports/profit-loss-report')}
            title="NET PROFIT"
            value={calculateMetrics.netProfit.value}
            percentage={calculateMetrics.netProfit.percentage}
            description={calculateMetrics.netProfit.description}
            icon={IconTrendingUp}
            delay={400}
            color="purple"
          />
          <MainStatCard
            onClick={() => navigate('/reports/package-report')}
            title="DELIVERY RATE"
            value={calculateMetrics.deliveryRate.value}
            percentage={calculateMetrics.deliveryRate.percentage}
            description={calculateMetrics.deliveryRate.description}
            icon={IconPackage}
            delay={600}
            color="info"
          />
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="VEHICLE UTILIZATION"
            value={calculateKPIs.vehicleUtilization}
            target={80}
            status={calculateKPIs.vehicleUtilization >= 80 ? 'positive' : 'negative'}
            icon={IconTruck}
          />
          <KPICard
            title="ON-TIME DELIVERY"
            value={calculateKPIs.onTimeDelivery}
            target={85}
            status={calculateKPIs.onTimeDelivery >= 85 ? 'positive' : 'negative'}
            icon={IconCheckCircle}
          />
          <KPICard
            title="STAFF ATTENDANCE"
            value={calculateKPIs.staffAttendance}
            target={85}
            status={calculateKPIs.staffAttendance >= 85 ? 'positive' : 'negative'}
            icon={IconUsers}
          />
          <KPICard
            title="PROFIT MARGIN"
            value={calculateKPIs.profitMargin}
            target={20}
            status={calculateKPIs.profitMargin >= 20 ? 'positive' : 'negative'}
            icon={IconChartBar}
          />
        </div>

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MiniMetricCard
            title="ACTIVE VEHICLES"
            value={staticLogisticsData.statistics.activeVehicles}
            change={8}
            icon={IconTruck}
            color={brandColors.primary}
          />
          <MiniMetricCard
            title="IN PROGRESS"
            value={staticLogisticsData.statistics.inProgressTrips}
            change={12}
            icon={IconClock}
            color={brandColors.info}
          />
          <MiniMetricCard
            title="DELAYED TRIPS"
            value={staticLogisticsData.statistics.delayedTrips}
            change={-5}
            icon={IconAlertTriangle}
            color={brandColors.danger}
          />
          <MiniMetricCard
            title="ACTIVE STAFF"
            value={staticLogisticsData.todayAttendance.present}
            change={3}
            icon={IconUsers}
            color={brandColors.success}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Recent Trips */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Trips</h3>
              <button
                onClick={() => navigate('/reports/trip-report')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {staticLogisticsData.recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.tripNo}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-medium text-gray-700">{trip.tripNo}</span>
                      {getStatusBadge(trip.status)}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${trip.netProfit >= 1000 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      ₹{trip.netProfit}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{trip.vehicleNo} • {trip.driver}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{trip.fromCenter} → {trip.toCenter}</span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <IconPackage className="w-3 h-3 mr-1" />
                        {trip.packages} packages
                      </span>
                      <span className="flex items-center">
                        <IconMapPin className="w-3 h-3 mr-1" />
                        {trip.distance}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>Revenue: ₹{trip.revenue} • Expenses: ₹{trip.expenses}</span>
                    <span>Date: {trip.startDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Top Performing Routes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Top Performing Routes</h3>
              <button
                onClick={() => navigate('/reports/route-analysis')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                Analyze Routes →
              </button>
            </div>
            <div className="space-y-4">
              {staticLogisticsData.topRoutes.map((route) => (
                <div key={route.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{route.route}</h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                        <span>{route.trips} trips</span>
                        <span>•</span>
                        <span>{route.packages} packages</span>
                        <span>•</span>
                        <span className="font-medium text-green-600">₹{route.profit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${route.efficiency >= 85 ? 'text-green-700' : route.efficiency >= 75 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {route.efficiency}
                      </div>
                      <div className="text-xs text-gray-500">Efficiency</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${route.efficiency}`,
                        backgroundColor: route.efficiency >= 85 ? brandColors.success : route.efficiency >= 75 ? brandColors.warning : brandColors.danger,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Avg delivery: {route.avgDeliveryTime}</span>
                    <span>Profit margin: {((route.profit / route.revenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Vehicle Utilization */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Vehicle Utilization</h3>
              <button
                onClick={() => navigate('/vehicles')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                Manage Vehicles →
              </button>
            </div>
            <div className="space-y-4">
              {staticLogisticsData.vehicleUtilization.map((vehicle, index) => (
                <VehicleUtilizationCard
                  key={index}
                  vehicleType={vehicle.vehicleType}
                  total={vehicle.total}
                  active={vehicle.active}
                  utilization={vehicle.utilization}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Utilization:</span>
                <span className="font-bold" style={{ color: brandColors.primary }}>
                  {staticLogisticsData.vehicleUtilization.reduce((sum, v) => sum + v.utilization, 0) / staticLogisticsData.vehicleUtilization.length}%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Package Status */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Package Status Overview</h3>
              <button
                onClick={() => navigate('/reports/package-report')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                View Details →
              </button>
            </div>
            <div className="space-y-4">
              {staticLogisticsData.packageStatus.map((status, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${status.color === 'success' ? 'bg-green-500' : status.color === 'info' ? 'bg-blue-500' : status.color === 'warning' ? 'bg-yellow-500' : status.color === 'danger' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                      <span className="font-medium text-gray-700">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{status.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({status.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${status.percentage}%`,
                        backgroundColor: status.color === 'success' ? brandColors.success : 
                                     status.color === 'info' ? brandColors.info : 
                                     status.color === 'warning' ? brandColors.warning : 
                                     status.color === 'danger' ? brandColors.danger : 
                                     brandColors.secondary,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{staticLogisticsData.statistics.deliveredPackages}</div>
                  <div className="text-sm text-green-600">Delivered</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{staticLogisticsData.statistics.pendingPackages + staticLogisticsData.statistics.inProgressTrips}</div>
                  <div className="text-sm text-blue-600">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Upcoming Trips */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Upcoming Trips</h3>
              <button
                onClick={() => navigate('/trips/schedule')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                View Schedule →
              </button>
            </div>
            <div className="space-y-4">
              {staticLogisticsData.upcomingTrips.map((trip) => (
                <div key={trip.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{trip.tripNo}</h4>
                      <div className="text-sm text-gray-600">{trip.vehicleNo} • {trip.driver}</div>
                    </div>
                    {getPriorityBadge(trip.priority)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <IconRoute className="w-3 h-3 mr-1" />
                      {trip.route}
                    </span>
                    <span className="flex items-center">
                      <IconCalendar className="w-3 h-3 mr-1" />
                      {trip.scheduledDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {trip.packages} packages • Est. revenue: ₹{trip.estimatedRevenue}
                    </div>
                    <button
                      onClick={() => navigate(`/trips/schedule/${trip.id}`)}
                      className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: brandColors.primary }}
                    >
                      Prepare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Recent Issues */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Recent Issues/Incidents</h3>
              <button
                onClick={() => navigate('/issues')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                Manage Issues →
              </button>
            </div>
            <div className="space-y-4">
              {staticLogisticsData.recentIssues.map((issue) => (
                <div key={issue.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{issue.type}</h4>
                    {getPriorityBadge(issue.priority)}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center">
                      <IconTruck className="w-3 h-3 mr-1" />
                      {issue.vehicle || issue.tripNo}
                    </span>
                    <span className="font-mono">{issue.driver || issue.packageCount ? `${issue.packageCount} packages` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                        issue.status === 'Investigating' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {issue.status}
                      </span>
                      <span className="text-sm text-gray-500">Date: {issue.date}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                      style={{ color: brandColors.primary }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Attendance & Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staff Attendance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Today's Attendance</h3>
              <button
                onClick={() => navigate('/reports/attendance-report')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                View Report →
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{staticLogisticsData.todayAttendance.present}</div>
                <div className="text-sm text-green-600">Present</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{staticLogisticsData.todayAttendance.absent}</div>
                <div className="text-sm text-red-600">Absent</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{staticLogisticsData.todayAttendance.onLeave}</div>
                <div className="text-sm text-yellow-600">On Leave</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-700">{staticLogisticsData.todayAttendance.attendanceRate}%</div>
                <div className="text-sm text-blue-600">Rate</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full"
                style={{
                  width: `${staticLogisticsData.todayAttendance.attendanceRate}%`,
                  backgroundColor: staticLogisticsData.todayAttendance.attendanceRate >= 85 ? brandColors.success : 
                                 staticLogisticsData.todayAttendance.attendanceRate >= 75 ? brandColors.warning : 
                                 brandColors.danger,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Total Staff: {staticLogisticsData.todayAttendance.totalStaff}</span>
              <span>Attendance Rate: {staticLogisticsData.todayAttendance.attendanceRate}%</span>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Weekly Financial Overview</h3>
              <button
                onClick={() => navigate('/reports/profit-loss-report')}
                className="text-sm font-medium"
                style={{ color: brandColors.primary }}
              >
                View Details →
              </button>
            </div>
            <div className="h-48 flex items-end space-x-2">
              {staticLogisticsData.financialOverview.days.map((day, index) => (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div className="flex items-end space-x-1 w-full justify-center">
                    <div
                      className="w-3/4 bg-green-500 rounded-t"
                      style={{
                        height: `${(staticLogisticsData.financialOverview.profit[index] / 40000) * 100}%`,
                        minHeight: '10px',
                      }}
                      title={`Profit: ₹${staticLogisticsData.financialOverview.profit[index]}`}
                    ></div>
                    <div
                      className="w-3/4 bg-blue-500 rounded-t"
                      style={{
                        height: `${(staticLogisticsData.financialOverview.revenue[index] / 150000) * 100}%`,
                        minHeight: '10px',
                      }}
                      title={`Revenue: ₹${staticLogisticsData.financialOverview.revenue[index]}`}
                    ></div>
                    <div
                      className="w-3/4 bg-red-500 rounded-t"
                      style={{
                        height: `${(staticLogisticsData.financialOverview.expenses[index] / 150000) * 100}%`,
                        minHeight: '10px',
                      }}
                      title={`Expenses: ₹${staticLogisticsData.financialOverview.expenses[index]}`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{day}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>Profit</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span>Expenses</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-700">₹{(staticLogisticsData.financialOverview.revenue.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-600">Weekly Revenue</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-700">₹{(staticLogisticsData.financialOverview.expenses.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-600">Weekly Expenses</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-700">₹{(staticLogisticsData.financialOverview.profit.reduce((a, b) => a + b, 0) / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-gray-600">Weekly Profit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/trips/create')}
              className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <IconTruck className="w-8 h-8 mb-2" style={{ color: brandColors.primary }} />
              <span className="font-medium">New Trip</span>
              <span className="text-xs text-gray-500 mt-1">Schedule a trip</span>
            </button>
            <button
              onClick={() => navigate('/packages/create')}
              className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <IconPackage className="w-8 h-8 mb-2" style={{ color: brandColors.success }} />
              <span className="font-medium">Add Package</span>
              <span className="text-xs text-gray-500 mt-1">Create shipment</span>
            </button>
            <button
              onClick={() => navigate('/reports/profit-loss-report')}
              className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <IconChartBar className="w-8 h-8 mb-2" style={{ color: brandColors.purple }} />
              <span className="font-medium">Financial Report</span>
              <span className="text-xs text-gray-500 mt-1">View P&L</span>
            </button>
            <button
              onClick={() => navigate('/attendance/mark')}
              className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 flex flex-col items-center justify-center"
            >
              <IconUsers className="w-8 h-8 mb-2" style={{ color: brandColors.secondary }} />
              <span className="font-medium">Mark Attendance</span>
              <span className="text-xs text-gray-500 mt-1">Staff check-in</span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Data updated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;