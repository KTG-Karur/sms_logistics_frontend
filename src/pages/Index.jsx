import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showMessage } from '../util/AllFunction';
import IconUsers from '../components/Icon/IconUsers';
import IconFactory from '../components/Icon/IconBuilding';
import IconShield from '../components/Icon/IconShield';
import IconTrendingUp from '../components/Icon/IconTrendingUp';
import IconEye from '../components/Icon/IconEye';
import IconCheckCircle from '../components/Icon/IconCircleCheck';
import IconXCircle from '../components/Icon/IconXCircle';
import IconClipboard from '../components/Icon/IconClipboardText';
import IconCalendar from '../components/Icon/IconCalendar';
import IconGlobe from '../components/Icon/IconGlobe';
import IconStar from '../components/Icon/IconStar';
import IconAlertTriangle from '../components/Icon/IconTrashLines';
import IconClock from '../components/Icon/IconClock';
import IconPlus from '../components/Icon/IconPlus';
import IconFileText from '../components/Icon/IconFile';
import IconMapPin from '../components/Icon/IconMapPin';
import IconDollarSign from '../components/Icon/IconDollarSign';
import { findArrObj } from '../util/AllFunction';

const Dashboard = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo || '{}');
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Dashboard') || 
                         findArrObj(localData?.pagePermission, 'label', 'Home') || [{}];
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    
    const navigate = useNavigate();

    // Audit System Brand Colors
    const brandColors = {
        primary: '#2e3092', // Dark Blue - Compliance
        secondary: '#f16521', // Orange - Action Required
        success: '#10b981', // Green - Approved/Passed
        warning: '#f59e0b', // Yellow - Pending
        danger: '#ef4444', // Red - Failed/Rejected
        info: '#3b82f6', // Blue - In Progress
    };

    // Static Audit Dashboard Data
    const staticAuditData = {
        statistics: {
            totalAudits: 145,
            completedAudits: 112,
            pendingAudits: 18,
            inProgressAudits: 15,
            suppliersAudited: 89,
            nonCompliances: 27,
            capaItems: 42,
            criticalFindings: 8,
        },
        recentAudits: [
            {
                id: 1,
                auditId: 'AUD-2024-001',
                supplierName: 'Asian Fabrics Private Limited',
                supplierType: 'Textile Manufacturer',
                auditDate: '2024-01-15',
                status: 'Completed',
                score: 85,
                auditor: 'Rajesh Kumar',
                findings: 2,
                critical: 0,
            },
            {
                id: 2,
                auditId: 'AUD-2024-002',
                supplierName: 'Precision Engineering Works',
                supplierType: 'Machining & Fabrication',
                auditDate: '2024-01-12',
                status: 'In Progress',
                score: null,
                auditor: 'Priya Sharma',
                findings: 3,
                critical: 1,
            },
            {
                id: 3,
                auditId: 'AUD-2024-003',
                supplierName: 'Global Textile Mills',
                supplierType: 'Fabric Producer',
                auditDate: '2024-01-10',
                status: 'Completed',
                score: 92,
                auditor: 'Amit Patel',
                findings: 1,
                critical: 0,
            },
            {
                id: 4,
                auditId: 'AUD-2024-004',
                supplierName: 'Tech Components Corp.',
                supplierType: 'Electronic Components',
                auditDate: '2024-01-08',
                status: 'Pending',
                score: null,
                auditor: 'Sanjay Verma',
                findings: 0,
                critical: 0,
            },
            {
                id: 5,
                auditId: 'AUD-2024-005',
                supplierName: 'Quality Garments Ltd',
                supplierType: 'Apparel Manufacturer',
                auditDate: '2024-01-05',
                status: 'Completed',
                score: 78,
                auditor: 'Meera Nair',
                findings: 5,
                critical: 2,
            },
        ],
        topSuppliers: [
            {
                id: 1,
                name: 'Asian Fabrics Private Limited',
                category: 'Textile Manufacturer',
                auditCount: 12,
                avgScore: 88,
                lastAudit: '2024-01-15',
                status: 'Active',
            },
            {
                id: 2,
                name: 'Global Textile Mills',
                category: 'Fabric Producer',
                auditCount: 8,
                avgScore: 92,
                lastAudit: '2024-01-10',
                status: 'Active',
            },
            {
                id: 3,
                name: 'Precision Engineering Works',
                category: 'Machining',
                auditCount: 6,
                avgScore: 85,
                lastAudit: '2024-01-12',
                status: 'Active',
            },
            {
                id: 4,
                name: 'Tech Components Corp.',
                category: 'Electronics',
                auditCount: 5,
                avgScore: 90,
                lastAudit: '2024-01-08',
                status: 'Suspended',
            },
            {
                id: 5,
                name: 'Quality Garments Ltd',
                category: 'Apparel',
                auditCount: 4,
                avgScore: 78,
                lastAudit: '2024-01-05',
                status: 'Active',
            },
        ],
        criticalFindings: [
            {
                id: 1,
                title: 'Fire Safety Non-Compliance',
                severity: 'Critical',
                supplier: 'Precision Engineering Works',
                auditId: 'AUD-2024-002',
                dueDate: '2024-02-15',
                status: 'Open',
            },
            {
                id: 2,
                title: 'Child Labor Violation',
                severity: 'Critical',
                supplier: 'Quality Garments Ltd',
                auditId: 'AUD-2024-005',
                dueDate: '2024-02-10',
                status: 'In Progress',
            },
            {
                id: 3,
                title: 'Environmental Hazard',
                severity: 'Major',
                supplier: 'Tech Components Corp.',
                auditId: 'AUD-2024-004',
                dueDate: '2024-02-20',
                status: 'Open',
            },
            {
                id: 4,
                title: 'Safety Equipment Missing',
                severity: 'Major',
                supplier: 'Asian Fabrics Private Limited',
                auditId: 'AUD-2024-001',
                dueDate: '2024-02-05',
                status: 'Resolved',
            },
        ],
        capaStatus: [
            {
                category: 'Safety',
                open: 12,
                inProgress: 8,
                completed: 15,
                overdue: 2,
            },
            {
                category: 'Environmental',
                open: 5,
                inProgress: 3,
                completed: 10,
                overdue: 1,
            },
            {
                category: 'Quality',
                open: 8,
                inProgress: 6,
                completed: 12,
                overdue: 0,
            },
            {
                category: 'Social Compliance',
                open: 2,
                inProgress: 1,
                completed: 5,
                overdue: 1,
            },
        ],
        complianceStandards: [
            {
                standard: 'IWAY 6.0',
                compliantSuppliers: 45,
                nonCompliantSuppliers: 8,
                complianceRate: 85,
            },
            {
                standard: 'BSCI Code',
                compliantSuppliers: 52,
                nonCompliantSuppliers: 5,
                complianceRate: 91,
            },
            {
                standard: 'ISO 9001:2015',
                compliantSuppliers: 48,
                nonCompliantSuppliers: 7,
                complianceRate: 87,
            },
            {
                standard: 'ISO 14001:2015',
                compliantSuppliers: 42,
                nonCompliantSuppliers: 11,
                complianceRate: 79,
            },
        ],
        upcomingAudits: [
            {
                id: 1,
                supplierName: 'Modern Packaging Inc.',
                auditType: 'Factory Audit',
                scheduledDate: '2024-02-01',
                auditor: 'Rajesh Kumar',
                priority: 'High',
            },
            {
                id: 2,
                supplierName: 'Food Processing Unit',
                auditType: 'Environmental Audit',
                scheduledDate: '2024-02-05',
                auditor: 'Priya Sharma',
                priority: 'Medium',
            },
            {
                id: 3,
                supplierName: 'Textile Processing Ltd',
                auditType: 'Re-audit',
                scheduledDate: '2024-02-08',
                auditor: 'Amit Patel',
                priority: 'Critical',
            },
            {
                id: 4,
                supplierName: 'Metal Works Corp.',
                auditType: 'Safety Audit',
                scheduledDate: '2024-02-12',
                auditor: 'Sanjay Verma',
                priority: 'High',
            },
        ],
    };

    // Calculate metrics from static data
    const calculateMetrics = useMemo(() => {
        const stats = staticAuditData.statistics;
        
        return {
            totalAudits: {
                value: stats.totalAudits.toLocaleString(),
                percentage: Math.min((stats.totalAudits / 200) * 100, 100),
                description: 'Total audits conducted',
            },
            complianceRate: {
                value: `${Math.round(((stats.completedAudits - stats.nonCompliances) / stats.completedAudits) * 100)}%`,
                percentage: Math.round(((stats.completedAudits - stats.nonCompliances) / stats.completedAudits) * 100),
                description: 'Overall compliance rate',
            },
            suppliersAudited: {
                value: stats.suppliersAudited.toLocaleString(),
                percentage: Math.min((stats.suppliersAudited / 150) * 100, 100),
                description: 'Unique suppliers audited',
            },
            criticalFindings: {
                value: stats.criticalFindings.toLocaleString(),
                percentage: Math.min((stats.criticalFindings / 20) * 100, 100),
                description: 'Critical findings identified',
            },
        };
    }, []);

    // Calculate KPI metrics
    const calculateKPIs = useMemo(() => {
        const stats = staticAuditData.statistics;
        const recentAudits = staticAuditData.recentAudits.filter(a => a.score);
        
        const avgScore = recentAudits.length > 0 
            ? Math.round(recentAudits.reduce((sum, audit) => sum + audit.score, 0) / recentAudits.length)
            : 0;
            
        return {
            avgAuditScore: avgScore,
            auditCompletionRate: Math.round((stats.completedAudits / stats.totalAudits) * 100),
            capaResolutionRate: stats.capaItems > 0 ? Math.round(((stats.capaItems - 27) / stats.capaItems) * 100) : 0,
            onTimeCompletion: 92, // Static for demo
        };
    }, []);

    // Get severity badge
    const getSeverityBadge = (severity) => {
        const config = {
            Critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' },
            Major: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚠️' },
            Minor: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'ℹ️' },
        };
        const configItem = config[severity] || config.Minor;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${configItem.color}`}>
                <span className="text-xs">{configItem.icon}</span>
                {severity}
            </span>
        );
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const config = {
            Completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: <IconCheckCircle className="w-3 h-3" /> },
            'In Progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <IconClock className="w-3 h-3" /> },
            Pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <IconClock className="w-3 h-3" /> },
            Open: { color: 'bg-red-100 text-red-800 border-red-200', icon: <IconAlertTriangle className="w-3 h-3" /> },
            Resolved: { color: 'bg-green-100 text-green-800 border-green-200', icon: <IconCheckCircle className="w-3 h-3" /> },
            'In Progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <IconClock className="w-3 h-3" /> },
        };
        const configItem = config[status] || config.Pending;
        
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${configItem.color}`}>
                {configItem.icon}
                {status}
            </span>
        );
    };

    // Get priority badge
    const getPriorityBadge = (priority) => {
        const config = {
            Critical: { color: 'bg-red-100 text-red-800', icon: '🔴' },
            High: { color: 'bg-orange-100 text-orange-800', icon: '🟠' },
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
                                <span className="text-sm font-semibold" style={{ color: bgColor }}>
                                    Live
                                </span>
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
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}{title.includes('Score') ? '' : '%'}</p>
                
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
                        <p className="text-xl font-bold mt-1" style={{ color: color || brandColors.primary }}>
                            {value}
                        </p>
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
                        <h1 className="text-3xl font-bold mb-2" style={{ color: brandColors.primary }}>
                            Supplier Compliance Audit Dashboard
                        </h1>
                        <p className="text-gray-600">Monitor compliance, track CAPA, and manage supplier audits</p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                        <button
                            onClick={() => navigate('/audit/external-provider')}
                            className="px-6 py-2.5 rounded-xl font-medium border transition-all duration-200 hover:scale-105"
                            style={{ 
                                backgroundColor: 'white',
                                borderColor: brandColors.primary,
                                color: brandColors.primary 
                            }}
                        >
                            View All Audits
                        </button>
                        <button
                            onClick={() => navigate('/audit/external-provider/form')}
                            className="px-6 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                            style={{ backgroundColor: brandColors.secondary, color: 'white' }}
                        >
                            <IconPlus className="w-5 h-5" />
                            <span>New Audit</span>
                        </button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                    <MainStatCard
                        onClick={() => navigate('/audit/external-provider')}
                        title="TOTAL AUDITS"
                        value={calculateMetrics.totalAudits.value}
                        percentage={calculateMetrics.totalAudits.percentage}
                        description={calculateMetrics.totalAudits.description}
                        icon={IconClipboard}
                        delay={0}
                        color="primary"
                    />
                    <MainStatCard
                        onClick={() => navigate('/compliance/standards')}
                        title="COMPLIANCE RATE"
                        value={calculateMetrics.complianceRate.value}
                        percentage={calculateMetrics.complianceRate.percentage}
                        description={calculateMetrics.complianceRate.description}
                        icon={IconShield}
                        delay={200}
                        color="success"
                    />
                    <MainStatCard
                        onClick={() => navigate('/compliance/suppliers')}
                        title="SUPPLIERS AUDITED"
                        value={calculateMetrics.suppliersAudited.value}
                        percentage={calculateMetrics.suppliersAudited.percentage}
                        description={calculateMetrics.suppliersAudited.description}
                        icon={IconFactory}
                        delay={400}
                        color="info"
                    />
                    <MainStatCard
                        onClick={() => navigate('/compliance/capa')}
                        title="CRITICAL FINDINGS"
                        value={calculateMetrics.criticalFindings.value}
                        percentage={calculateMetrics.criticalFindings.percentage}
                        description={calculateMetrics.criticalFindings.description}
                        icon={IconAlertTriangle}
                        delay={600}
                        color="danger"
                    />
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard
                        title="AVG AUDIT SCORE"
                        value={calculateKPIs.avgAuditScore}
                        target={85}
                        status={calculateKPIs.avgAuditScore >= 85 ? 'positive' : 'negative'}
                        icon={IconStar}
                    />
                    <KPICard
                        title="AUDIT COMPLETION"
                        value={calculateKPIs.auditCompletionRate}
                        target={90}
                        status={calculateKPIs.auditCompletionRate >= 90 ? 'positive' : 'negative'}
                        icon={IconCheckCircle}
                    />
                    <KPICard
                        title="CAPA RESOLUTION"
                        value={calculateKPIs.capaResolutionRate}
                        target={80}
                        status={calculateKPIs.capaResolutionRate >= 80 ? 'positive' : 'negative'}
                        icon={IconClipboard}
                    />
                    <KPICard
                        title="ON-TIME COMPLETION"
                        value={calculateKPIs.onTimeCompletion}
                        target={90}
                        status={calculateKPIs.onTimeCompletion >= 90 ? 'positive' : 'negative'}
                        icon={IconCalendar}
                    />
                </div>

                {/* Detailed Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <MiniMetricCard
                        title="PENDING AUDITS"
                        value={staticAuditData.statistics.pendingAudits}
                        change={-5}
                        icon={IconClock}
                        color={brandColors.warning}
                    />
                    <MiniMetricCard
                        title="IN PROGRESS"
                        value={staticAuditData.statistics.inProgressAudits}
                        change={12}
                        icon={IconTrendingUp}
                        color={brandColors.info}
                    />
                    <MiniMetricCard
                        title="NON-COMPLIANCES"
                        value={staticAuditData.statistics.nonCompliances}
                        change={-8}
                        icon={IconXCircle}
                        color={brandColors.danger}
                    />
                    <MiniMetricCard
                        title="CAPA ITEMS"
                        value={staticAuditData.statistics.capaItems}
                        change={15}
                        icon={IconClipboard}
                        color={brandColors.secondary}
                    />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Recent Audits */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Audits</h3>
                            <button
                                onClick={() => navigate('/audit/external-provider')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                View All →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {staticAuditData.recentAudits.map((audit) => (
                                <div
                                    key={audit.id}
                                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                                    onClick={() => navigate(`/audit/report/${audit.auditId}`)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-sm font-medium text-gray-700">{audit.auditId}</span>
                                            {getStatusBadge(audit.status)}
                                        </div>
                                        {audit.score && (
                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                audit.score >= 90 ? 'bg-green-100 text-green-800' :
                                                audit.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                                audit.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {audit.score}%
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{audit.supplierName}</h4>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span>{audit.supplierType}</span>
                                        <div className="flex items-center space-x-3">
                                            <span className="flex items-center">
                                                <IconEye className="w-3 h-3 mr-1" />
                                                {audit.findings} findings
                                            </span>
                                            <span className="flex items-center">
                                                <IconAlertTriangle className="w-3 h-3 mr-1" />
                                                {audit.critical} critical
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                        <span>Auditor: {audit.auditor}</span>
                                        <span>Date: {audit.auditDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Critical Findings */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Critical Findings</h3>
                            <button
                                onClick={() => navigate('/compliance/capa')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                Manage CAPA →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {staticAuditData.criticalFindings.map((finding) => (
                                <div key={finding.id} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900 flex-1 mr-4">{finding.title}</h4>
                                        {getSeverityBadge(finding.severity)}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                        <span className="flex items-center">
                                            <IconFactory className="w-3 h-3 mr-1" />
                                            {finding.supplier}
                                        </span>
                                        <span className="font-mono">{finding.auditId}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {getStatusBadge(finding.status)}
                                            <span className="text-sm text-gray-500">
                                                Due: {finding.dueDate}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/compliance/capa/${finding.auditId}`)}
                                            className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                            style={{ color: brandColors.primary }}
                                        >
                                            Take Action
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Second Row - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Upcoming Audits */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Upcoming Audits</h3>
                            <button
                                onClick={() => navigate('/audit/schedule')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                View Schedule →
                            </button>
                        </div>
                        <div className="space-y-4">
                            {staticAuditData.upcomingAudits.map((audit) => (
                                <div key={audit.id} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-gray-900">{audit.supplierName}</h4>
                                        {getPriorityBadge(audit.priority)}
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                        <span>{audit.auditType}</span>
                                        <span className="flex items-center">
                                            <IconCalendar className="w-3 h-3 mr-1" />
                                            {audit.scheduledDate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Auditor: {audit.auditor}</span>
                                        <button
                                            onClick={() => navigate(`/audit/schedule/${audit.id}`)}
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

                    {/* Right Column - Compliance Standards */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Compliance Standards</h3>
                            <button
                                onClick={() => navigate('/compliance/standards')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                Manage Standards →
                            </button>
                        </div>
                        <div className="space-y-6">
                            {staticAuditData.complianceStandards.map((standard, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-700">{standard.standard}</span>
                                        <span className="text-lg font-bold" style={{ color: brandColors.primary }}>
                                            {standard.complianceRate}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${standard.complianceRate}%`,
                                                backgroundColor: 
                                                    standard.complianceRate >= 90 ? brandColors.success :
                                                    standard.complianceRate >= 80 ? brandColors.info :
                                                    standard.complianceRate >= 70 ? brandColors.warning :
                                                    brandColors.danger,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Compliant: {standard.compliantSuppliers}</span>
                                        <span>Non-compliant: {standard.nonCompliantSuppliers}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CAPA Status Grid */}
                <div className="mt-8">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">CAPA Status by Category</h3>
                            <button
                                onClick={() => navigate('/compliance/capa')}
                                className="text-sm font-medium"
                                style={{ color: brandColors.primary }}
                            >
                                View All CAPA →
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {staticAuditData.capaStatus.map((category, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                                    <h4 className="font-medium text-gray-900 mb-4">{category.category}</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Open</span>
                                            <span className="font-medium text-gray-900">{category.open}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">In Progress</span>
                                            <span className="font-medium" style={{ color: brandColors.info }}>{category.inProgress}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Completed</span>
                                            <span className="font-medium" style={{ color: brandColors.success }}>{category.completed}</span></div> <div className="flex justify-between items-center"> <span className="text-sm text-gray-600">Overdue</span> <span className="font-medium" style={{ color: brandColors.danger }}>{category.overdue}</span> </div> </div> </div> ))} </div> </div> </div>            {/* Top Suppliers Table */}
            <div className="mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Top Performing Suppliers</h3>
                        <button
                            onClick={() => navigate('/compliance/suppliers')}
                            className="text-sm font-medium"
                            style={{ color: brandColors.primary }}
                        >
                            View All Suppliers →
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Supplier</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Audits</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Avg Score</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Audit</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staticAuditData.topSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{supplier.name}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-600">{supplier.category}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-medium">{supplier.auditCount}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center">
                                                <div className={`w-16 h-2 rounded-full mr-2 ${
                                                    supplier.avgScore >= 90 ? 'bg-green-200' :
                                                    supplier.avgScore >= 80 ? 'bg-blue-200' :
                                                    supplier.avgScore >= 70 ? 'bg-yellow-200' :
                                                    'bg-red-200'
                                                }`}>
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${supplier.avgScore}%`,
                                                            backgroundColor: 
                                                                supplier.avgScore >= 90 ? brandColors.success :
                                                                supplier.avgScore >= 80 ? brandColors.info :
                                                                supplier.avgScore >= 70 ? brandColors.warning :
                                                                brandColors.danger,
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold">{supplier.avgScore}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-600">{supplier.lastAudit}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(supplier.status)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => navigate(`/compliance/supplier/${supplier.id}`)}
                                                className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                                                style={{ color: brandColors.primary }}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Data updated on {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })} at {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</p>
            </div>
        </div>
    </div>
);};

export default Dashboard;