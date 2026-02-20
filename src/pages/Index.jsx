import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../redux/themeStore/themeConfigSlice';
import { getDashboardData } from '../redux/dashboardSlice'; // Adjust path
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
import IconRefresh from '../components/Icon/IconRefresh';

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
    
    // Get data from Redux store
    const { 
        dashboardData, 
        loading, 
        error,
        statistics,
        todayStats,
        thisWeekStats,
        thisMonthStats,
        statusBreakdown,
        upcomingTrips,
        recentPayments,
        topCustomers
    } = useSelector((state) => state.DashboardSlice);

    useEffect(() => {
        dispatch(setPageTitle('Logistics Dashboard'));
        fetchDashboardData();
        
        // Refresh data every 5 minutes
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 300000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = () => {
        dispatch(getDashboardData());
    };

    // Calculate Metrics
    const calculateMetrics = useMemo(() => {
        const totalBookings = statistics.totalBookings || 0;
        const deliveredBookings = statistics.deliveredBookings || 0;
        const totalPayments = statistics.totalPayments || 0;
        
        return {
            totalTrips: {
                value: (statistics.totalTrips || 0).toLocaleString(),
                percentage: statistics.totalTrips > 0 ? 
                    Math.min(((statistics.inProgressTrips || 0) / statistics.totalTrips) * 100, 100) : 0,
                description: 'Total trips this month',
            },
            totalRevenue: {
                value: `₹${(totalPayments / 1000).toFixed(1)}K`,
                percentage: totalPayments > 100000 ? 100 : (totalPayments / 100000) * 100,
                description: 'Total revenue this month',
            },
            netProfit: {
                value: `₹${(totalPayments * 0.3 / 1000).toFixed(1)}K`, // Estimated profit (30% of revenue)
                percentage: 30, // Estimated profit margin
                description: 'Estimated net profit',
            },
            deliveryRate: {
                value: totalBookings > 0 ? 
                    `${((deliveredBookings / totalBookings) * 100).toFixed(1)}%` : '0%',
                percentage: totalBookings > 0 ? 
                    (deliveredBookings / totalBookings) * 100 : 0,
                description: 'Package delivery rate',
            },
        };
    }, [statistics]);

    // Calculate KPI Metrics
    const calculateKPIs = useMemo(() => {
        return {
            vehicleUtilization: Math.min(statistics.inProgressTrips * 10, 100) || 0, // Simplified calculation
            onTimeDelivery: statistics.totalBookings > 0 ? 
                Math.round((statistics.deliveredBookings / statistics.totalBookings) * 100) : 0,
            staffAttendance: 85, // Static for demo - would come from attendance API
            profitMargin: 30, // Static for demo - estimated
        };
    }, [statistics]);

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
            not_started: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <IconClock className="w-3 h-3" />,
            },
            delivered: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <IconCheckCircle className="w-3 h-3" />,
            },
        };
        const configItem = config[status] || config.scheduled;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${configItem.color}`}>
                {configItem.icon}
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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

    // Get Payment Mode Icon
    const getPaymentModeIcon = (mode) => {
        switch(mode?.toLowerCase()) {
            case 'cash':
                return '💵';
            case 'upi':
                return '📱';
            case 'card':
                return '💳';
            default:
                return '💰';
        }
    };

    // Main Stats Card
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

    // Loading State
    if (loading && !dashboardData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
                    <IconAlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

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
                        <p className="text-gray-600">
                            {dashboardData?.date && `Data for ${moment(dashboardData.date).format('MMMM Do, YYYY')} • `}
                            {dashboardData?.center_name || 'All Centers'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                        <button
                            onClick={fetchDashboardData}
                            className="px-4 py-2.5 rounded-xl font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                        >
                            <IconRefresh className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                        <button
                            onClick={() => navigate('/report/trip-report')}
                            className="px-6 py-2.5 rounded-xl font-medium border transition-all duration-200 hover:scale-105"
                            style={{ backgroundColor: 'white', borderColor: brandColors.primary, color: brandColors.primary }}
                        >
                            View All Reports
                        </button>
                        <button
                            onClick={() => navigate('/package/assign-trip')}
                            className="px-6 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{ backgroundColor: brandColors.secondary, color: 'white' }}
                        >
                            <IconTruck className="w-5 h-5" />
                            <span>New Trip</span>
                        </button>
                    </div>
                </div>

                {/* Date Range Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Today</p>
                                <p className="text-2xl font-bold text-gray-900">{todayStats?.bookings || 0}</p>
                                <p className="text-xs text-gray-500">Bookings</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Trips: {todayStats?.trips || 0}</p>
                                <p className="text-lg font-semibold text-green-600">₹{parseFloat(todayStats?.payments || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">This Week</p>
                                <p className="text-2xl font-bold text-gray-900">{thisWeekStats?.bookings || 0}</p>
                                <p className="text-xs text-gray-500">Bookings</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-blue-600">₹{parseFloat(thisWeekStats?.payments || 0).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">{thisMonthStats?.bookings || 0}</p>
                                <p className="text-xs text-gray-500">Bookings</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-purple-600">₹{parseFloat(thisMonthStats?.payments || 0).toFixed(2)}</p>
                                <p className="text-xs text-gray-500">Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <MainStatCard
                        onClick={() => navigate('/report/trip-report')}
                        title="TOTAL TRIPS (MONTH)"
                        value={calculateMetrics.totalTrips.value}
                        percentage={calculateMetrics.totalTrips.percentage}
                        description={calculateMetrics.totalTrips.description}
                        icon={IconTruck}
                        delay={0}
                        color="primary"
                    />
                    <MainStatCard
                        onClick={() => navigate('/report/profit-loss')}
                        title="MONTHLY REVENUE"
                        value={calculateMetrics.totalRevenue.value}
                        percentage={calculateMetrics.totalRevenue.percentage}
                        description={calculateMetrics.totalRevenue.description}
                        icon={IconMoney}
                        delay={200}
                        color="success"
                    />
                    <MainStatCard
                        onClick={() => navigate('/report/profit-loss')}
                        title="EST. NET PROFIT"
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
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                </div> */}

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MiniMetricCard
                        title="TOTAL BOOKINGS"
                        value={statistics.totalBookings || 0}
                        change={8}
                        icon={IconPackage}
                        color={brandColors.primary}
                    />
                    <MiniMetricCard
                        title="IN PROGRESS"
                        value={statistics.inProgressTrips || 0}
                        change={12}
                        icon={IconClock}
                        color={brandColors.info}
                    />
                    <MiniMetricCard
                        title="DELIVERED"
                        value={statistics.deliveredBookings || 0}
                        change={-5}
                        icon={IconCheckCircle}
                        color={brandColors.success}
                    />
                    <MiniMetricCard
                        title="PENDING"
                        value={statistics.pendingBookings || 0}
                        change={3}
                        icon={IconAlertTriangle}
                        color={brandColors.warning}
                    />
                </div>

                {/* Two Column Layout - Recent Payments & Top Customers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Recent Payments */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Payments</h3>
                            <button
                                onClick={() => navigate('/package/payment')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentPayments && recentPayments.length > 0 ? (
                                recentPayments.slice(0, 5).map((payment) => (
                                    <div
                                        key={payment.payment_id}
                                        className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                                        onClick={() => navigate(`/package/payment/${payment.payment_id}`)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-mono text-sm font-medium text-gray-700">{payment.payment_number}</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                    {payment.payment_mode}
                                                </span>
                                            </div>
                                            <div className="text-lg font-bold text-green-600">
                                                ₹{parseFloat(payment.amount).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-600">
                                            <span>Booking: {payment.booking?.booking_number || 'N/A'}</span>
                                            <span className="flex items-center">
                                                <IconCalendar className="w-3 h-3 mr-1" />
                                                {moment(payment.payment_date).format('DD/MM/YYYY')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No recent payments found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Top Customers */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Top Customers</h3>
                            <button
                                onClick={() => navigate('/master/customer')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {topCustomers && topCustomers.length > 0 ? (
                                topCustomers.map((customer) => (
                                    <div key={customer.customer_id} className="p-4 border border-gray-200 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{customer.customer_name}</h4>
                                                <p className="text-sm text-gray-600">{customer.customer_number}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-purple-600">
                                                    ₹{parseFloat(customer.total_amount).toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {customer.booking_count} bookings
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No customer data found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Breakdown Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Booking Status */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Booking Status</h3>
                        </div>
                        <div className="space-y-4">
                            {statusBreakdown?.bookings && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <span className="font-medium text-gray-700">Not Started</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900">{statusBreakdown.bookings.not_started || 0}</span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({statistics.totalBookings > 0 ? 
                                                    ((statusBreakdown.bookings.not_started || 0) / statistics.totalBookings * 100).toFixed(1) : 0}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-yellow-500"
                                            style={{
                                                width: `${statistics.totalBookings > 0 ? 
                                                    ((statusBreakdown.bookings.not_started || 0) / statistics.totalBookings * 100) : 0}%`,
                                            }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="font-medium text-gray-700">Delivered</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900">{statusBreakdown.bookings.delivered || 0}</span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({statistics.totalBookings > 0 ? 
                                                    ((statusBreakdown.bookings.delivered || 0) / statistics.totalBookings * 100).toFixed(1) : 0}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-green-500"
                                            style={{
                                                width: `${statistics.totalBookings > 0 ? 
                                                    ((statusBreakdown.bookings.delivered || 0) / statistics.totalBookings * 100) : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Trip Status */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Trip Status</h3>
                        </div>
                        <div className="space-y-4">
                            {statusBreakdown?.trips && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="font-medium text-gray-700">In Progress</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-gray-900">{statusBreakdown.trips.in_progress || 0}</span>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({statistics.totalTrips > 0 ? 
                                                    ((statusBreakdown.trips.in_progress || 0) / statistics.totalTrips * 100).toFixed(1) : 0}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-blue-500"
                                            style={{
                                                width: `${statistics.totalTrips > 0 ? 
                                                    ((statusBreakdown.trips.in_progress || 0) / statistics.totalTrips * 100) : 0}%`,
                                            }}
                                        ></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Upcoming Trips Section */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Upcoming Trips</h3>
                        <button
                            onClick={() => navigate('/package/assign-trip')}
                            className="text-sm font-medium"
                            style={{ color: brandColors.primary }}
                        >
                            View Schedule →
                        </button>
                    </div>
                    <div className="space-y-4">
                        {upcomingTrips && upcomingTrips.length > 0 ? (
                            upcomingTrips.map((trip) => (
                                <div key={trip.trip_id || Math.random()} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{trip.trip_number || 'N/A'}</h4>
                                            <div className="text-sm text-gray-600">
                                                {trip.vehicle_number || 'Vehicle N/A'} • {trip.driver_name || 'Driver N/A'}
                                            </div>
                                        </div>
                                        {getPriorityBadge(trip.priority || 'Medium')}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                        <span className="flex items-center">
                                            <IconRoute className="w-3 h-3 mr-1" />
                                            {trip.route || 'Route TBD'}
                                        </span>
                                        <span className="flex items-center">
                                            <IconCalendar className="w-3 h-3 mr-1" />
                                            {trip.scheduled_date ? moment(trip.scheduled_date).format('DD/MM/YYYY') : 'Date TBD'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            {trip.packages_count || 0} packages • Est. revenue: ₹{parseFloat(trip.estimated_revenue || 0).toFixed(2)}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/assign-trip`)}
                                            className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                            style={{ color: brandColors.primary }}
                                        >
                                            Prepare
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No upcoming trips scheduled
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/package/assign-trip')}
                            className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 flex flex-col items-center justify-center"
                        >
                            <IconTruck className="w-8 h-8 mb-2" style={{ color: brandColors.primary }} />
                            <span className="font-medium">New Trip</span>
                            <span className="text-xs text-gray-500 mt-1">Assign trip</span>
                        </button>
                        <button
                            onClick={() => navigate('/package/intake')}
                            className="p-4 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 flex flex-col items-center justify-center"
                        >
                            <IconPackage className="w-8 h-8 mb-2" style={{ color: brandColors.success }} />
                            <span className="font-medium">Add Package</span>
                            <span className="text-xs text-gray-500 mt-1">Create shipment</span>
                        </button>
                        <button
                            onClick={() => navigate('/report/profit-loss')}
                            className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 flex flex-col items-center justify-center"
                        >
                            <IconChartBar className="w-8 h-8 mb-2" style={{ color: brandColors.purple }} />
                            <span className="font-medium">Financial Report</span>
                            <span className="text-xs text-gray-500 mt-1">View P&L</span>
                        </button>
                        <button
                            onClick={() => navigate('/package/payment')}
                            className="p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-200 flex flex-col items-center justify-center"
                        >
                            <IconMoney className="w-8 h-8 mb-2" style={{ color: brandColors.secondary }} />
                            <span className="font-medium">Record Payment</span>
                            <span className="text-xs text-gray-500 mt-1">New payment entry</span>
                        </button>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>
                        Data updated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        {loading && ' • Refreshing...'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LogisticsDashboard;