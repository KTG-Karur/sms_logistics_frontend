import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconEye from '../../../components/Icon/IconEye';
import IconDownload from '../../../components/Icon/IconFile';
import IconExternalLink from '../../../components/Icon/IconExternalLink';
import IconChartBar from '../../../components/Icon/IconBarChart';
import IconClock from '../../../components/Icon/IconClock';
import IconUser from '../../../components/Icon/IconUser';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconAlertCircle from '../../../components/Icon/IconX';
import IconCheckCircle from '../../../components/Icon/IconCircleCheck';
import * as XLSX from 'xlsx';
import moment from 'moment';
import _ from 'lodash';

// Static audit data with detailed timeline information
const staticAuditData = [
  {
    id: 1,
    auditId: 'AUD-001',
    supplierName: 'Asian Fabric X',
    supplierType: 'Sub Supplier',
    auditDate: '2024-01-15',
    submissionDate: '2024-01-18',
    startDate: '2024-01-15T08:00:00',
    endDate: '2024-01-15T17:30:00',
    lastAuditDate: '2023-07-15',
    lastAuditScore: 85,
    currentScore: 97,
    status: 'Completed',
    auditorId: 'AUD001',
    auditorName: 'John Smith',
    auditorDesignation: 'Senior Auditor',
    completionTimeHours: 9.5, // hours
    isReaudit: false,
    delayInSubmission: 0, // days
    checklistItems: 150,
    completedItems: 150,
    imagesCount: 5,
    auditType: 'Full Audit',
  },
  {
    id: 2,
    auditId: 'AUD-002',
    supplierName: 'Textile Solutions Ltd',
    supplierType: 'Main Supplier',
    auditDate: '2024-01-20',
    submissionDate: '2024-01-20',
    startDate: '2024-01-20T09:00:00',
    endDate: '2024-01-20T16:45:00',
    lastAuditDate: '2023-10-20',
    lastAuditScore: 78,
    currentScore: 92,
    status: 'Completed',
    auditorId: 'AUD001',
    auditorName: 'John Smith',
    auditorDesignation: 'Senior Auditor',
    completionTimeHours: 7.75,
    isReaudit: true,
    delayInSubmission: 0,
    checklistItems: 145,
    completedItems: 145,
    imagesCount: 3,
    auditType: 'Follow-up Audit',
  },
  {
    id: 3,
    auditId: 'AUD-003',
    supplierName: 'Global Fabrics Inc',
    supplierType: 'Sub Supplier',
    auditDate: '2024-01-25',
    submissionDate: '2024-01-28',
    startDate: '2024-01-25T08:30:00',
    endDate: '2024-01-25T18:00:00',
    lastAuditDate: '2023-07-25',
    lastAuditScore: 65,
    currentScore: 82,
    status: 'Completed',
    auditorId: 'AUD002',
    auditorName: 'Sarah Johnson',
    auditorDesignation: 'Lead Auditor',
    completionTimeHours: 9.5,
    isReaudit: false,
    delayInSubmission: 1, // 1 day delay
    checklistItems: 150,
    completedItems: 148,
    imagesCount: 2,
    auditType: 'Full Audit',
  },
  {
    id: 4,
    auditId: 'AUD-004',
    supplierName: 'Quality Textiles Corp',
    supplierType: 'Main Supplier',
    auditDate: '2024-02-01',
    submissionDate: '2024-02-01',
    startDate: '2024-02-01T08:00:00',
    endDate: '2024-02-01T15:30:00',
    lastAuditDate: '2023-11-01',
    lastAuditScore: 90,
    currentScore: 95,
    status: 'Completed',
    auditorId: 'AUD002',
    auditorName: 'Sarah Johnson',
    auditorDesignation: 'Lead Auditor',
    completionTimeHours: 7.5,
    isReaudit: true,
    delayInSubmission: 0,
    checklistItems: 140,
    completedItems: 140,
    imagesCount: 4,
    auditType: 'Follow-up Audit',
  },
  {
    id: 5,
    auditId: 'AUD-005',
    supplierName: 'Eco Fabrics Ltd',
    supplierType: 'Sub Supplier',
    auditDate: '2024-02-05',
    submissionDate: '2024-02-07',
    startDate: '2024-02-05T09:00:00',
    endDate: '2024-02-05T17:00:00',
    lastAuditDate: '2023-08-05',
    lastAuditScore: 72,
    currentScore: 88,
    status: 'Completed',
    auditorId: 'AUD003',
    auditorName: 'Mike Wilson',
    auditorDesignation: 'Junior Auditor',
    completionTimeHours: 8,
    isReaudit: false,
    delayInSubmission: 2, // 2 days delay
    checklistItems: 150,
    completedItems: 150,
    imagesCount: 3,
    auditType: 'Full Audit',
  },
  {
    id: 6,
    auditId: 'AUD-006',
    supplierName: 'Premium Fabrics Co',
    supplierType: 'Main Supplier',
    auditDate: '2024-02-10',
    submissionDate: '2024-02-10',
    startDate: '2024-02-10T08:00:00',
    endDate: '2024-02-10T16:00:00',
    lastAuditDate: '2023-11-10',
    lastAuditScore: 88,
    currentScore: 94,
    status: 'Completed',
    auditorId: 'AUD001',
    auditorName: 'John Smith',
    auditorDesignation: 'Senior Auditor',
    completionTimeHours: 8,
    isReaudit: true,
    delayInSubmission: 0,
    checklistItems: 135,
    completedItems: 135,
    imagesCount: 2,
    auditType: 'Follow-up Audit',
  },
  {
    id: 7,
    auditId: 'AUD-007',
    supplierName: 'Modern Textiles Ltd',
    supplierType: 'Sub Supplier',
    auditDate: '2024-02-15',
    submissionDate: '2024-02-18',
    startDate: '2024-02-15T09:00:00',
    endDate: '2024-02-15T18:30:00',
    lastAuditDate: '2023-08-15',
    lastAuditScore: 70,
    currentScore: 85,
    status: 'In Progress',
    auditorId: 'AUD002',
    auditorName: 'Sarah Johnson',
    auditorDesignation: 'Lead Auditor',
    completionTimeHours: 9.5,
    isReaudit: false,
    delayInSubmission: 3, // 3 days delay (still in progress)
    checklistItems: 150,
    completedItems: 120,
    imagesCount: 1,
    auditType: 'Full Audit',
  },
  {
    id: 8,
    auditId: 'AUD-008',
    supplierName: 'Smart Fabrics Inc',
    supplierType: 'Main Supplier',
    auditDate: '2024-02-20',
    submissionDate: '2024-02-20',
    startDate: '2024-02-20T08:30:00',
    endDate: '2024-02-20T16:15:00',
    lastAuditDate: '2023-11-20',
    lastAuditScore: 92,
    currentScore: 96,
    status: 'Completed',
    auditorId: 'AUD003',
    auditorName: 'Mike Wilson',
    auditorDesignation: 'Junior Auditor',
    completionTimeHours: 7.75,
    isReaudit: true,
    delayInSubmission: 0,
    checklistItems: 130,
    completedItems: 130,
    imagesCount: 2,
    auditType: 'Follow-up Audit',
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedAuditor: null,
    selectedYear: { value: '2024', label: '2024' },
    selectedMonth: null,
    selectedStatus: null,
    startDate: '',
    toDate: '',
  });
  
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [showSearch, setShowSearch] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Auditor summary data
  const [auditorSummary, setAuditorSummary] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);

  // Get unique values for filters
  const auditorOptions = useMemo(() => {
    const auditors = [...new Set(staticAuditData.map(item => item.auditorName))];
    return [
      { value: 'all', label: 'All Auditors' },
      ...auditors.map(auditor => ({
        value: auditor,
        label: auditor
      }))
    ];
  }, []);

  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
  ];

  const monthOptions = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Completed', label: 'Completed' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Pending Review', label: 'Pending Review' },
  ];

  useEffect(() => {
    setAuditData(staticAuditData);
    setFilteredData(staticAuditData);
    calculateAuditorSummary(staticAuditData);
  }, []);

  const calculateAuditorSummary = (data) => {
    const auditorMap = new Map();
    
    data.forEach(audit => {
      if (!auditorMap.has(audit.auditorId)) {
        auditorMap.set(audit.auditorId, {
          auditorId: audit.auditorId,
          auditorName: audit.auditorName,
          auditorDesignation: audit.auditorDesignation,
          totalAudits: 0,
          monthlyAudits: 0,
          yearlyAudits: 0,
          totalCompletionTime: 0,
          averageCompletionTime: 0,
          totalDelayDays: 0,
          averageDelay: 0,
          onTimeSubmissions: 0,
          delayedSubmissions: 0,
          reauditCount: 0,
          totalScore: 0,
          averageScore: 0,
          checklistItems: 0,
          completedItems: 0,
          completionRate: 0,
          imagesCount: 0,
          auditTypes: new Set(),
          monthsActive: new Set(),
        });
      }
      
      const summary = auditorMap.get(audit.auditorId);
      summary.totalAudits++;
      summary.totalCompletionTime += audit.completionTimeHours || 0;
      summary.totalDelayDays += audit.delayInSubmission || 0;
      summary.totalScore += audit.currentScore || 0;
      summary.checklistItems += audit.checklistItems || 0;
      summary.completedItems += audit.completedItems || 0;
      summary.imagesCount += audit.imagesCount || 0;
      
      if (audit.isReaudit) {
        summary.reauditCount++;
      }
      
      if (audit.delayInSubmission === 0) {
        summary.onTimeSubmissions++;
      } else if (audit.delayInSubmission > 0) {
        summary.delayedSubmissions++;
      }
      
      if (audit.auditType) {
        summary.auditTypes.add(audit.auditType);
      }
      
      // Add month to active months
      const month = moment(audit.auditDate).format('MMM');
      summary.monthsActive.add(month);
      
      // Calculate monthly/yearly based on current year filter
      const auditYear = moment(audit.auditDate).format('YYYY');
      if (auditYear === filters.selectedYear?.value) {
        summary.yearlyAudits++;
        
        // Check if it's current month
        const currentMonth = moment().format('M');
        const auditMonth = moment(audit.auditDate).format('M');
        if (auditMonth === currentMonth) {
          summary.monthlyAudits++;
        }
      }
    });
    
    // Calculate averages and finalize
    const summaries = Array.from(auditorMap.values()).map(summary => {
      summary.averageCompletionTime = summary.totalAudits > 0 
        ? (summary.totalCompletionTime / summary.totalAudits).toFixed(1)
        : 0;
      
      summary.averageScore = summary.totalAudits > 0 
        ? (summary.totalScore / summary.totalAudits).toFixed(1)
        : 0;
      
      summary.averageDelay = summary.totalAudits > 0 
        ? (summary.totalDelayDays / summary.totalAudits).toFixed(1)
        : 0;
      
      summary.completionRate = summary.checklistItems > 0 
        ? ((summary.completedItems / summary.checklistItems) * 100).toFixed(1)
        : 0;
      
      summary.reauditFrequency = summary.totalAudits > 0 
        ? ((summary.reauditCount / summary.totalAudits) * 100).toFixed(1)
        : 0;
      
      summary.timelinessRate = summary.totalAudits > 0 
        ? ((summary.onTimeSubmissions / summary.totalAudits) * 100).toFixed(1)
        : 0;
      
      summary.auditTypes = Array.from(summary.auditTypes);
      summary.monthsActive = Array.from(summary.monthsActive);
      
      return summary;
    });
    
    setAuditorSummary(summaries);
    calculateComparativeAnalysis(summaries);
  };

  const calculateComparativeAnalysis = (summaries) => {
    if (summaries.length === 0) return;
    
    const metrics = [
      'averageScore',
      'averageCompletionTime',
      'timelinessRate',
      'reauditCount',
      'totalAudits',
      'completionRate'
    ];
    
    const comparative = metrics.map(metric => {
      const values = summaries.map(s => parseFloat(s[metric]));
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      return {
        metric,
        label: getMetricLabel(metric),
        unit: getMetricUnit(metric),
        max: { value: max, auditor: summaries.find(s => parseFloat(s[metric]) === max)?.auditorName },
        min: { value: min, auditor: summaries.find(s => parseFloat(s[metric]) === min)?.auditorName },
        average: avg.toFixed(1)
      };
    });
    
    setComparativeData(comparative);
  };

  const getMetricLabel = (metric) => {
    const labels = {
      averageScore: 'Average Score',
      averageCompletionTime: 'Avg Completion Time',
      timelinessRate: 'Timeliness Rate',
      reauditCount: 'Re-audit Count',
      totalAudits: 'Total Audits',
      completionRate: 'Completion Rate'
    };
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric) => {
    const units = {
      averageScore: '%',
      averageCompletionTime: 'hrs',
      timelinessRate: '%',
      reauditCount: '',
      totalAudits: '',
      completionRate: '%'
    };
    return units[metric] || '';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    if (score >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelinessColor = (delay) => {
    if (delay === 0) return 'bg-green-100 text-green-800';
    if (delay <= 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSearchLoading(true);

    let filtered = [...staticAuditData];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((audit) => 
        audit.supplierName.toLowerCase().includes(query) || 
        audit.auditId.toLowerCase().includes(query) || 
        audit.auditorName.toLowerCase().includes(query)
      );
    }

    // Apply auditor filter
    if (filters.selectedAuditor && filters.selectedAuditor.value !== 'all') {
      filtered = filtered.filter((audit) => audit.auditorName === filters.selectedAuditor.value);
    }

    // Apply year filter
    if (filters.selectedYear && filters.selectedYear.value !== 'all') {
      filtered = filtered.filter((audit) => 
        moment(audit.auditDate).format('YYYY') === filters.selectedYear.value
      );
    }

    // Apply month filter
    if (filters.selectedMonth && filters.selectedMonth.value !== 'all') {
      filtered = filtered.filter((audit) => 
        moment(audit.auditDate).format('M') === filters.selectedMonth.value
      );
    }

    // Apply status filter
    if (filters.selectedStatus && filters.selectedStatus.value !== 'all') {
      filtered = filtered.filter((audit) => audit.status === filters.selectedStatus.value);
    }

    // Apply date filter
    if (showDateFilter && filters.startDate && filters.toDate) {
      filtered = filtered.filter((audit) => {
        const auditDate = moment(audit.auditDate);
        const start = moment(filters.startDate);
        const end = moment(filters.toDate);
        return auditDate.isBetween(start, end, null, '[]');
      });
    }

    setTimeout(() => {
      setFilteredData(filtered);
      calculateAuditorSummary(filtered);
      setAppliedFilters({ ...filters });
      setCurrentPage(0);
      setSearchLoading(false);
    }, 500);
  };

  const handleClear = () => {
    setFilters({
      searchQuery: '',
      selectedAuditor: null,
      selectedYear: { value: '2024', label: '2024' },
      selectedMonth: null,
      selectedStatus: null,
      startDate: '',
      toDate: '',
    });
    setAppliedFilters(null);
    setShowDateFilter(false);
    setSearchLoading(false);
    setCurrentPage(0);
    setFilteredData(staticAuditData);
    calculateAuditorSummary(staticAuditData);
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    if (!showDateFilter) {
      setFilters((prev) => ({
        ...prev,
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        toDate: moment().format('YYYY-MM-DD'),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: '',
        toDate: '',
      }));
    }
  };

  const onDownloadExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Auditor Summary Sheet
    const summaryHeader = [
      ['AUDITOR PERFORMANCE REPORT'],
      [`Report Period: ${filters.selectedYear?.label || 'All Time'} ${filters.selectedMonth?.label ? `- ${filters.selectedMonth.label}` : ''}`],
      [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
      [],
      [
        'Auditor Name',
        'Designation',
        'Total Audits',
        'Monthly Audits',
        'Yearly Audits',
        'Avg Completion Time (hrs)',
        'Avg Score (%)',
        'Re-audit Count',
        'Re-audit Frequency (%)',
        'On-time Submissions',
        'Delayed Submissions',
        'Timeliness Rate (%)',
        'Avg Delay (days)',
        'Completion Rate (%)',
        'Total Images',
        'Audit Types'
      ]
    ];

    const summaryData = auditorSummary.map(auditor => [
      auditor.auditorName,
      auditor.auditorDesignation,
      auditor.totalAudits,
      auditor.monthlyAudits,
      auditor.yearlyAudits,
      auditor.averageCompletionTime,
      auditor.averageScore,
      auditor.reauditCount,
      auditor.reauditFrequency,
      auditor.onTimeSubmissions,
      auditor.delayedSubmissions,
      auditor.timelinessRate,
      auditor.averageDelay,
      auditor.completionRate,
      auditor.imagesCount,
      auditor.auditTypes.join(', ')
    ]);

    const summarySheet = XLSX.utils.aoa_to_sheet([...summaryHeader, ...summaryData]);
    summarySheet['!cols'] = [
      { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
      { wch: 30 }
    ];

    // Detailed Audit Data Sheet
    const detailHeader = [
      ['DETAILED AUDIT DATA'],
      [],
      [
        'Audit ID',
        'Supplier',
        'Auditor',
        'Audit Date',
        'Status',
        'Score',
        'Completion Time (hrs)',
        'Delay (days)',
        'Is Re-audit',
        'Audit Type',
        'Checklist Items',
        'Completed Items',
        'Images',
        'Submission Date'
      ]
    ];

    const detailData = filteredData.map(audit => [
      audit.auditId,
      audit.supplierName,
      audit.auditorName,
      moment(audit.auditDate).format('DD/MM/YYYY'),
      audit.status,
      audit.currentScore,
      audit.completionTimeHours,
      audit.delayInSubmission,
      audit.isReaudit ? 'Yes' : 'No',
      audit.auditType,
      audit.checklistItems,
      audit.completedItems,
      audit.imagesCount,
      moment(audit.submissionDate).format('DD/MM/YYYY')
    ]);

    const detailSheet = XLSX.utils.aoa_to_sheet([...detailHeader, ...detailData]);
    detailSheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 8 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(wb, summarySheet, 'Auditor Summary');
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Detailed Data');

    const fileName = `Auditor-Performance-Report-${moment().format('DD-MM-YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePaginationChange = (pageIndex, newPageSize) => {
    setCurrentPage(pageIndex);
    setPageSize(newPageSize);
  };

  const getPaginatedData = () => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

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

  const renderMetricCard = (title, value, unit, icon, color, subtitle = '') => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {value}{unit && <span className="text-lg font-normal"> {unit}</span>}
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full bg-opacity-20 bg-current">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="p-6 text-center">
        <h1 className="text-3xl font-extrabold text-gray-800">Auditor Performance Report</h1>
        <p className="text-gray-600 mt-2">Comprehensive auditor analytics and performance metrics</p>
      </div>

      {showSearch && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Search & Filter</h2>
            <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
              ▲ Hide
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Date Filter Toggle */}
              <div className="md:col-span-2 lg:col-span-4">
                <button
                  type="button"
                  onClick={toggleDateFilter}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    showDateFilter ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconCalendar className="w-4 h-4" />
                  <span className="font-medium">{showDateFilter ? 'Hide Date Filter' : 'Add Date Filter'}</span>
                </button>
              </div>

              {/* Date Filters */}
              {showDateFilter && (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-800 mb-1">From Date</label>
                    <input
                      type="date"
                      className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-800 mb-1">To Date</label>
                    <input
                      type="date"
                      className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={filters.toDate}
                      onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Auditor Filter */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Auditor</label>
                <Select
                  options={auditorOptions}
                  value={filters.selectedAuditor}
                  onChange={(selectedOption) => setFilters({ ...filters, selectedAuditor: selectedOption })}
                  placeholder="Select Auditor"
                  isSearchable
                  isClearable
                  styles={customStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Year Filter */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Select
                  options={yearOptions}
                  value={filters.selectedYear}
                  onChange={(selectedOption) => setFilters({ ...filters, selectedYear: selectedOption })}
                  styles={customStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Month Filter */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <Select
                  options={monthOptions}
                  value={filters.selectedMonth}
                  onChange={(selectedOption) => setFilters({ ...filters, selectedMonth: selectedOption })}
                  placeholder="Select Month"
                  isSearchable
                  isClearable
                  styles={customStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Status Filter */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  options={statusOptions}
                  value={filters.selectedStatus}
                  onChange={(selectedOption) => setFilters({ ...filters, selectedStatus: selectedOption })}
                  placeholder="Select Status"
                  isSearchable
                  isClearable
                  styles={customStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              {/* Search Input */}
              <div className="md:col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <IconSearch className="inline w-4 h-4 mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by supplier, audit ID, or auditor..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={handleClear} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium">
                Clear All
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px]"
                disabled={searchLoading || (showDateFilter && (!filters.startDate || !filters.toDate))}
              >
                {searchLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
              {appliedFilters && filteredData.length > 0 && (
                <button
                  type="button"
                  onClick={onDownloadExcel}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center"
                >
                  <IconPrinter className="mr-2 w-4 h-4" />
                  Export Report
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!showSearch && (
        <div className="flex justify-center mb-6">
          <button onClick={() => setShowSearch(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center">
            <IconSearch className="mr-2 w-4 h-4" />
            Show Search Panel
          </button>
        </div>
      )}

      {/* Auditor Summary Cards */}
      {!searchLoading && auditorSummary.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Auditor Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {auditorSummary.map((auditor, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{auditor.auditorName}</h4>
                    <p className="text-sm text-gray-600">{auditor.auditorDesignation}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(auditor.averageScore)}`}>
                      {auditor.averageScore}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Audits:</span>
                    <span className="font-semibold">{auditor.totalAudits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="font-semibold">{auditor.averageCompletionTime} hrs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Timeliness:</span>
                    <span className={`font-semibold ${parseFloat(auditor.timelinessRate) >= 90 ? 'text-green-600' : parseFloat(auditor.timelinessRate) >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {auditor.timelinessRate}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Re-audits:</span>
                    <span className="font-semibold">{auditor.reauditCount} ({auditor.reauditFrequency}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Section */}
      {!searchLoading && appliedFilters && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Key Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderMetricCard(
              'Total Audits Completed',
              filteredData.length,
              '',
              <IconCheckCircle className="w-6 h-6 text-blue-500" />,
              ''
            )}
            {renderMetricCard(
              'Average Audit Score',
              (filteredData.reduce((sum, audit) => sum + audit.currentScore, 0) / filteredData.length).toFixed(1),
              '%',
              <IconTrendingUp className="w-6 h-6 text-green-500" />,
              ''
            )}
            {renderMetricCard(
              'Average Completion Time',
              (filteredData.reduce((sum, audit) => sum + (audit.completionTimeHours || 0), 0) / filteredData.length).toFixed(1),
              'hrs',
              <IconClock className="w-6 h-6 text-purple-500" />,
              ''
            )}
            {renderMetricCard(
              'On-time Submission Rate',
              ((filteredData.filter(audit => audit.delayInSubmission === 0).length / filteredData.length) * 100).toFixed(1),
              '%',
              <IconAlertCircle className="w-6 h-6 text-yellow-500" />,
              ''
            )}
          </div>
        </div>
      )}

      {/* Comparative Analysis Section */}
      {!searchLoading && comparativeData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Auditor Comparative Analysis</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Performer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lowest Performer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparativeData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.label}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.max.auditor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.max.value)}`}>
                          {item.max.value}{item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.min.auditor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.min.value)}`}>
                          {item.min.value}{item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.average}{item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Audit Table */}
      {!searchLoading && appliedFilters && filteredData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Detailed Audit Records</h3>
                <p className="text-gray-600">
                  Showing {filteredData.length} audit records
                  {filters.selectedAuditor?.value !== 'all' ? ` for ${filters.selectedAuditor?.label}` : ''}
                  {filters.selectedYear?.value ? ` in ${filters.selectedYear.label}` : ''}
                  {filters.selectedMonth?.value !== 'all' ? ` - ${filters.selectedMonth?.label}` : ''}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 text-sm">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-600">Total Auditors: </span>
                  <span className="font-semibold text-blue-600">{auditorSummary.length}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-600">Avg Score: </span>
                  <span className="font-semibold text-green-600">
                    {(filteredData.reduce((sum, audit) => sum + audit.currentScore, 0) / filteredData.length).toFixed(1)}%
                  </span>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-600">On-time Rate: </span>
                  <span className="font-semibold text-yellow-600">
                    {((filteredData.filter(audit => audit.delayInSubmission === 0).length / filteredData.length) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audit ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auditor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeliness</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Re-audit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPaginatedData().map((audit, index) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {currentPage * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {audit.auditId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{audit.supplierName}</div>
                      <div className="text-xs text-gray-500">{audit.supplierType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconUser className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{audit.auditorName}</div>
                          <div className="text-xs text-gray-500">{audit.auditorDesignation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {moment(audit.auditDate).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(audit.currentScore)}`}>
                        {audit.currentScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.completionTimeHours} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimelinessColor(audit.delayInSubmission)}`}>
                        {audit.delayInSubmission === 0 ? 'On Time' : `${audit.delayInSubmission} days delay`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${audit.isReaudit ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {audit.isReaudit ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(audit.status)}`}>
                        {audit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage * pageSize) + 1}</span> to{' '}
                <span className="font-medium">{Math.min((currentPage + 1) * pageSize, filteredData.length)}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePaginationChange(currentPage - 1, pageSize)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePaginationChange(currentPage + 1, pageSize)}
                  disabled={(currentPage + 1) * pageSize >= filteredData.length}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : searchLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Auditor Data</h3>
            <p className="text-gray-500">Please wait while we fetch the auditor performance data</p>
          </div>
        </div>
      ) : appliedFilters && filteredData.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <IconSearch className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Data Found</h3>
            <p className="text-gray-600 text-lg max-w-md mb-6">No audit records match your current search criteria.</p>
            <button onClick={handleClear} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold">
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <IconChartBar className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Auditor Performance Dashboard</h3>
            <p className="text-gray-600 text-lg max-w-md mb-6">
              Ready to analyze auditor performance metrics. Use the search filters above to generate detailed reports.
            </p>
            <button
              onClick={() => setShowSearch(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg"
            >
              Start Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;