// src/pages/LoadmanSalary/LoadmanSalaryManagement.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Tippy from '@tippyjs/react';
import { showMessage, findArrObj, formatDate } from '../../util/AllFunction';
import Select from 'react-select';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
import Modal from '../../components/Modal';
import IconPlus from '../../components/Icon/IconPlus';
import IconUser from '../../components/Icon/IconUser';
import IconPackage from '../../components/Icon/IconBox';
import IconTruck from '../../components/Icon/IconTruck';
import IconEye from '../../components/Icon/IconEye';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconClock from '../../components/Icon/IconClock';
import IconCheckCircle from '../../components/Icon/IconCheckCircle';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconDollar from '../../components/Icon/IconDollarSign';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconSearch from '../../components/Icon/IconSearch';
import IconFilter from '../../components/Icon/IconCoffee';
import IconX from '../../components/Icon/IconX';
import IconDownload from '../../components/Icon/IconDownload';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconRefresh from '../../components/Icon/IconRefresh';
import IconUsers from '../../components/Icon/IconUsers';
import IconHistory from '../../components/Icon/IconMapPin';
import IconChart from '../../components/Icon/IconChartSquare';

import {
  getAllLoadmenSalarySummary,
  getLoadmanSalarySummary,
  getLoadmanPayments,
  processLoadmanSalaryPayment,
  calculateLoadmanDailySalary,
  getLoadmanData,
  getLoadmanById,
  resetLoadmanSalaryStatus,
  clearLoadmanDailySalary
} from '../../redux/loadmanSalarySlice';
import { getEmployee } from '../../redux/employeeSlice';
import { getOfficeCenters } from '../../redux/officeCenterSlice';

// Custom Responsive Table Component (reuse from your existing one)
import ResponsiveTable from '../../util/Table';

const LoadmanSalaryManagement = () => {
  const dispatch = useDispatch();
  const loginInfo = localStorage.getItem('loginInfo');
  const localData = JSON.parse(loginInfo || '{}');
  const employeeId = localData?.employeeId;

  // Redux state
  const loadmanSalaryState = useSelector((state) => state.LoadmanSalarySlice || {});
  const {
    allLoadmenSalarySummary = { summary: {}, loadmen: [] },
    loadmanSalarySummary = { summary: {}, loadmen: [], pagination: {} },
    loadmanPayments = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 },
    loadmanDailySalary = null,
    loading = false,
    error = null,
    paymentSuccess = false,
    getDataSuccess = false
  } = loadmanSalaryState;

  const employeeState = useSelector((state) => state.EmployeeSlice || {});
  const { employeeData = [] } = employeeState;

  const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
  const { officeCentersData = [] } = officeCenterState;

  // Local states
  const [activeTab, setActiveTab] = useState('summary'); // summary, payments, details
  const [viewMode, setViewMode] = useState('all'); // all, single
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedLoadman, setSelectedLoadman] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    loadmanId: null,
    status: '',
    search: '',
    page: 1,
    limit: 20
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    loadmanId: '',
    loadmanName: '',
    salaryDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    amount: '',
    officeCenterId: '',
    paymentType: 'cash',
    notes: ''
  });

  // Calculate form state
  const [calculateForm, setCalculateForm] = useState({
    loadmanId: '',
    date: new Date().toISOString().split('T')[0],
    includeDetails: true
  });

  // Load initial data
  useEffect(() => {
    dispatch(setPageTitle('Loadman Salary Management'));
    fetchInitialData();
  }, [dispatch]);

  // Handle API responses
  useEffect(() => {
    if (paymentSuccess) {
      showMessage('success', 'Salary payment processed successfully');
      setShowPaymentModal(false);
      resetPaymentForm();
      fetchData();
      dispatch(resetLoadmanSalaryStatus());
    }
    
    if (getDataSuccess) {
      dispatch(resetLoadmanSalaryStatus());
    }
    
    if (error) {
      showMessage('error', error);
      dispatch(resetLoadmanSalaryStatus());
    }
  }, [paymentSuccess, getDataSuccess, error, dispatch]);

  // Fetch data based on active tab and filters
  useEffect(() => {
    fetchData();
  }, [activeTab, filters.startDate, filters.endDate, filters.loadmanId, filters.status, filters.page, filters.limit]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        dispatch(getEmployee({ isLoadman: true })).unwrap(),
        dispatch(getOfficeCenters({})).unwrap()
      ]);
    } catch (error) {
      showMessage('error', 'Failed to load initial data');
    }
  };

  const fetchData = () => {
    if (activeTab === 'summary') {
      if (viewMode === 'all' || !filters.loadmanId) {
        dispatch(getAllLoadmenSalarySummary({
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: filters.status,
          search: filters.search
        }));
      } else {
        dispatch(getLoadmanSalarySummary({
          loadmanId: filters.loadmanId,
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: filters.status,
          page: filters.page,
          limit: filters.limit
        }));
      }
    } else if (activeTab === 'payments') {
      dispatch(getLoadmanPayments({
        loadmanId: filters.loadmanId,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page,
        limit: filters.limit
      }));
    }
  };

  // Loadman options for select
  const loadmanOptions = useMemo(() => {
    return (employeeData || [])
      .filter(emp => emp.is_loadman)
      .map(loadman => ({
        value: loadman.employee_id,
        label: `${loadman.employee_name} - ${loadman.mobile_no || ''}`,
        data: loadman
      }));
  }, [employeeData]);

  // Office center options
  const officeCenterOptions = useMemo(() => {
    return (officeCentersData || [])
      .filter(center => center.is_active)
      .map(center => ({
        value: center.office_center_id,
        label: center.office_center_name,
        data: center
      }));
  }, [officeCentersData]);

  // Payment type options
  const paymentTypeOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'gpay', label: 'Google Pay' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' }
  ];

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSelectChange = (name, option) => {
    setFilters(prev => ({ 
      ...prev, 
      [name]: option ? option.value : null,
      page: 1 
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      loadmanId: null,
      status: '',
      search: '',
      page: 1,
      limit: 20
    });
    setViewMode('all');
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (e) => {
    setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
  };

  // Open payment modal for a loadman
  const openPaymentModal = (loadman) => {
    setSelectedLoadman(loadman);
    setPaymentForm({
      loadmanId: loadman.loadmanId || loadman.employee_id,
      loadmanName: loadman.loadmanName || loadman.employee_name,
      salaryDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      amount: loadman.totalPending > 0 ? loadman.totalPending : '',
      officeCenterId: '',
      paymentType: 'cash',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  // Open calculate modal for a loadman
  const openCalculateModal = (loadman) => {
    setSelectedLoadman(loadman);
    setCalculateForm({
      loadmanId: loadman.loadmanId || loadman.employee_id,
      date: new Date().toISOString().split('T')[0],
      includeDetails: true
    });
    setShowCalculateModal(true);
  };

  // View loadman details
  const viewLoadmanDetails = (loadman) => {
    setSelectedLoadman(loadman);
    setViewMode('single');
    setFilters(prev => ({ 
      ...prev, 
      loadmanId: loadman.loadmanId || loadman.employee_id,
      page: 1
    }));
  };

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    // Navigate to payment detail view or open modal
    showMessage('info', `Payment #${payment.expense_payment_id} details`);
  };

  // Handle payment form changes
  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelectChange = (name, option) => {
    setPaymentForm(prev => ({ ...prev, [name]: option ? option.value : '' }));
  };

  // Handle calculate form changes
  const handleCalculateFormChange = (e) => {
    const { name, value } = e.target;
    setCalculateForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit payment
  const handleSubmitPayment = (e) => {
    e.preventDefault();
    
    // Validation
    if (!paymentForm.loadmanId) {
      showMessage('error', 'Loadman is required');
      return;
    }
    if (!paymentForm.salaryDate) {
      showMessage('error', 'Salary date is required');
      return;
    }
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      showMessage('error', 'Valid payment amount is required');
      return;
    }
    if (!paymentForm.officeCenterId) {
      showMessage('error', 'Office center is required');
      return;
    }

    dispatch(processLoadmanSalaryPayment({
      loadmanId: paymentForm.loadmanId,
      salaryDate: paymentForm.salaryDate,
      paymentDate: paymentForm.paymentDate,
      amount: parseFloat(paymentForm.amount),
      officeCenterId: paymentForm.officeCenterId,
      paymentType: paymentForm.paymentType,
      notes: paymentForm.notes,
      createdBy: employeeId
    }));
  };

  // Submit calculate daily salary
  const handleCalculateDailySalary = (e) => {
    e.preventDefault();
    
    if (!calculateForm.loadmanId) {
      showMessage('error', 'Loadman is required');
      return;
    }
    if (!calculateForm.date) {
      showMessage('error', 'Date is required');
      return;
    }

    dispatch(calculateLoadmanDailySalary({
      loadmanId: calculateForm.loadmanId,
      date: calculateForm.date,
      includeDetails: calculateForm.includeDetails
    }));
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setPaymentForm({
      loadmanId: '',
      loadmanName: '',
      salaryDate: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      amount: '',
      officeCenterId: '',
      paymentType: 'cash',
      notes: ''
    });
    setSelectedLoadman(null);
  };

  // Reset calculate form
  const resetCalculateForm = () => {
    setCalculateForm({
      loadmanId: '',
      date: new Date().toISOString().split('T')[0],
      includeDetails: true
    });
    setSelectedLoadman(null);
    dispatch(clearLoadmanDailySalary());
  };

  // Export data
  const exportData = () => {
    let dataToExport = [];
    let filename = '';

    if (activeTab === 'summary') {
      dataToExport = allLoadmenSalarySummary.loadmen || [];
      filename = 'loadman_salary_summary.csv';
    } else if (activeTab === 'payments') {
      dataToExport = loadmanPayments.data || [];
      filename = 'loadman_payments.csv';
    }

    if (dataToExport.length === 0) {
      showMessage('info', 'No data to export');
      return;
    }

    // Convert to CSV
    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(item => Object.values(item).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(','));
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', label: 'Partial' },
      pending: { color: 'bg-red-100 text-red-800', label: 'Pending' },
      processed: { color: 'bg-blue-100 text-blue-800', label: 'Processed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Calculate totals
  const summaryTotals = useMemo(() => {
    const summary = allLoadmenSalarySummary.summary || {};
    return {
      totalLoadmen: summary.totalLoadmen || 0,
      totalEarnings: summary.totalEarnings || '0.00',
      totalPaid: summary.totalPaid || '0.00',
      totalPending: summary.totalPending || '0.00'
    };
  }, [allLoadmenSalarySummary]);

  // Summary table columns
  const summaryColumns = useMemo(() => [
    {
      Header: 'Loadman',
      accessor: 'loadmanName',
      Cell: ({ row }) => {
        const loadman = row.original;
        return (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
              <IconUser className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-medium text-sm">{loadman.loadmanName}</div>
              <div className="text-xs text-gray-500">{loadman.mobileNo || 'No mobile'}</div>
            </div>
          </div>
        );
      },
      width: 200,
      mobileFull: true
    },
    {
      Header: 'Working Days',
      accessor: 'workingDays',
      Cell: ({ value }) => <span className="font-medium">{value || 0}</span>,
      width: 100
    },
    {
      Header: 'Total Packages',
      accessor: 'totalPackages',
      Cell: ({ value }) => <span className="font-medium">{value || 0}</span>,
      width: 100
    },
    {
      Header: 'Earnings',
      accessor: 'totalEarnings',
      Cell: ({ value }) => <span className="font-medium text-green-600">₹{value || '0.00'}</span>,
      width: 120
    },
    {
      Header: 'Paid',
      accessor: 'totalPaid',
      Cell: ({ value }) => <span className="font-medium text-blue-600">₹{value || '0.00'}</span>,
      width: 100
    },
    {
      Header: 'Pending',
      accessor: 'totalPending',
      Cell: ({ value }) => <span className="font-medium text-red-600">₹{value || '0.00'}</span>,
      width: 100
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => getStatusBadge(value),
      width: 100
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => {
        const loadman = row.original;
        return (
          <div className="flex gap-1">
            <Tippy content="View Details">
              <button
                onClick={() => viewLoadmanDetails(loadman)}
                className="btn btn-outline-primary btn-sm p-1.5 rounded-lg"
              >
                <IconEye className="w-4 h-4" />
              </button>
            </Tippy>
            <Tippy content="Calculate Daily Salary">
              <button
                onClick={() => openCalculateModal(loadman)}
                className="btn btn-outline-info btn-sm p-1.5 rounded-lg"
              >
                <IconCalculator className="w-4 h-4" />
              </button>
            </Tippy>
            <Tippy content="Make Payment">
              <button
                onClick={() => openPaymentModal(loadman)}
                className="btn btn-outline-success btn-sm p-1.5 rounded-lg"
                disabled={parseFloat(loadman.totalPending) <= 0}
              >
                <IconDollar className="w-4 h-4" />
              </button>
            </Tippy>
          </div>
        );
      },
      width: 120
    }
  ], []);

  // Payments table columns
  const paymentsColumns = useMemo(() => [
    {
      Header: 'Date',
      accessor: 'payment_date',
      Cell: ({ value }) => formatDate(value, 'DD/MM/YYYY'),
      width: 100
    },
    {
      Header: 'Loadman',
      accessor: 'expense.employee.employee_name',
      Cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="font-medium">{payment.expense?.employee?.employee_name || 'N/A'}</div>
        );
      },
      width: 150
    },
    {
      Header: 'Salary Date',
      accessor: 'expense.expense_date',
      Cell: ({ value }) => formatDate(value, 'DD/MM/YYYY'),
      width: 100
    },
    {
      Header: 'Amount',
      accessor: 'amount',
      Cell: ({ value }) => <span className="font-medium text-green-600">₹{value}</span>,
      width: 100
    },
    {
      Header: 'Payment Type',
      accessor: 'payment_type',
      Cell: ({ value }) => (
        <span className="capitalize">{value?.replace('_', ' ') || 'Cash'}</span>
      ),
      width: 120
    },
    {
      Header: 'Notes',
      accessor: 'notes',
      Cell: ({ value }) => (
        <Tippy content={value || ''}>
          <span className="truncate max-w-[150px] block">{value || '-'}</span>
        </Tippy>
      ),
      width: 150
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => {
        const payment = row.original;
        return (
          <button
            onClick={() => viewPaymentDetails(payment)}
            className="btn btn-outline-primary btn-sm p-1.5 rounded-lg"
          >
            <IconEye className="w-4 h-4" />
          </button>
        );
      },
      width: 80
    }
  ], []);

  return (
    <div className="container mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Loadman Salary Management
            </h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">
              Manage loadman salaries, payments, and earnings
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="btn btn-outline-primary flex items-center"
            >
              <IconDownload className="w-4 h-4 mr-1" />
              Export
            </button>
            <button
              onClick={fetchData}
              className="btn btn-outline-secondary flex items-center"
              disabled={loading}
            >
              <IconRefresh className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('summary')}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconUsers className="w-4 h-4 inline mr-1" />
              Salary Summary
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconHistory className="w-4 h-4 inline mr-1" />
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconChart className="w-4 h-4 inline mr-1" />
              Loadman Details
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Loadmen</p>
                  <p className="text-lg font-bold text-gray-800">{summaryTotals.totalLoadmen}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <IconUsers className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Earnings</p>
                  <p className="text-lg font-bold text-green-600">₹{summaryTotals.totalEarnings}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <IconDollar className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Paid</p>
                  <p className="text-lg font-bold text-blue-600">₹{summaryTotals.totalPaid}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <IconCheckCircle className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total Pending</p>
                  <p className="text-lg font-bold text-red-600">₹{summaryTotals.totalPending}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <IconXCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="w-full md:w-48">
              <Select
                options={loadmanOptions}
                value={loadmanOptions.find(opt => opt.value === filters.loadmanId)}
                onChange={(opt) => handleSelectChange('loadmanId', opt)}
                placeholder="Select Loadman"
                className="react-select"
                classNamePrefix="select"
                isClearable
                styles={{
                  control: (base) => ({ ...base, minHeight: '38px', fontSize: '14px' })
                }}
              />
            </div>
            <div className="w-full md:w-40">
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input w-full"
              />
            </div>
            <div className="w-full md:w-40">
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-input w-full"
              />
            </div>
            {activeTab === 'summary' && (
              <div className="w-full md:w-36">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
            )}
            <div className="flex-1 relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by name..."
                className="form-input w-full pl-9"
              />
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="btn btn-outline-secondary whitespace-nowrap"
            >
              Clear
            </button>
            {viewMode === 'single' && (
              <button
                onClick={() => {
                  setViewMode('all');
                  setFilters(prev => ({ ...prev, loadmanId: null, page: 1 }));
                }}
                className="btn btn-outline-primary whitespace-nowrap"
              >
                <IconX className="w-4 h-4 mr-1" />
                Back to All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {activeTab === 'summary' && (
          <>
            <div className="p-3 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-800">
                {viewMode === 'single' && selectedLoadman
                  ? `${selectedLoadman.loadmanName} - Daily Salary Breakdown`
                  : 'All Loadmen Salary Summary'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filters.startDate} to {filters.endDate}
              </p>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : viewMode === 'single' && selectedLoadman ? (
                // Single loadman detailed view
                <LoadmanSalaryDetail
                  loadmanId={selectedLoadman.loadmanId || selectedLoadman.employee_id}
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                />
              ) : (
                // All loadmen summary
                <ResponsiveTable
                  columns={summaryColumns}
                  data={allLoadmenSalarySummary.loadmen || []}
                  pageSize={filters.limit}
                  pageIndex={filters.page - 1}
                  onPaginationChange={(pageIndex, pageSize) => {
                    handlePageChange(pageIndex + 1);
                    if (pageSize !== filters.limit) {
                      setFilters(prev => ({ ...prev, limit: pageSize }));
                    }
                  }}
                  pagination={true}
                  isSearchable={false}
                  showPageSize={true}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'payments' && (
          <>
            <div className="p-3 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-800">Payment History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filters.startDate} to {filters.endDate}
              </p>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <ResponsiveTable
                    columns={paymentsColumns}
                    data={loadmanPayments.data || []}
                    pageSize={filters.limit}
                    pageIndex={filters.page - 1}
                    onPaginationChange={(pageIndex, pageSize) => {
                      handlePageChange(pageIndex + 1);
                      if (pageSize !== filters.limit) {
                        setFilters(prev => ({ ...prev, limit: pageSize }));
                      }
                    }}
                    pagination={true}
                    isSearchable={false}
                    showPageSize={true}
                  />
                  <div className="mt-3 text-sm text-gray-600 text-right">
                    Total: {loadmanPayments.total} payments
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'details' && (
          <LoadmanDirectory
            onSelectLoadman={(loadman) => {
              setSelectedLoadman(loadman);
              setViewMode('single');
              setFilters(prev => ({ 
                ...prev, 
                loadmanId: loadman.employee_id,
                page: 1 
              }));
              setActiveTab('summary');
            }}
          />
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          resetPaymentForm();
        }}
        title="Process Loadman Salary Payment"
        size="lg"
      >
        <form onSubmit={handleSubmitPayment}>
          <div className="space-y-4">
            {/* Loadman Info */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="font-medium text-gray-800">Loadman: {paymentForm.loadmanName}</div>
              {selectedLoadman && (
                <div className="text-sm text-gray-600 mt-1">
                  Total Pending: ₹{selectedLoadman.totalPending || '0.00'}
                </div>
              )}
            </div>

            {/* Salary Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Date *
              </label>
              <input
                type="date"
                name="salaryDate"
                value={paymentForm.salaryDate}
                onChange={handlePaymentFormChange}
                className="form-input w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Date of earnings being paid (YYYY-MM-DD)
              </p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={paymentForm.paymentDate}
                onChange={handlePaymentFormChange}
                className="form-input w-full"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  name="amount"
                  value={paymentForm.amount}
                  onChange={handlePaymentFormChange}
                  placeholder="Enter amount"
                  className="form-input w-full pl-8"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>

            {/* Office Center */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Center *
              </label>
              <Select
                options={officeCenterOptions}
                value={officeCenterOptions.find(opt => opt.value === paymentForm.officeCenterId)}
                onChange={(opt) => handlePaymentSelectChange('officeCenterId', opt)}
                placeholder="Select office center"
                className="react-select"
                classNamePrefix="select"
                required
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type
              </label>
              <Select
                options={paymentTypeOptions}
                value={paymentTypeOptions.find(opt => opt.value === paymentForm.paymentType)}
                onChange={(opt) => handlePaymentSelectChange('paymentType', opt)}
                placeholder="Select payment type"
                className="react-select"
                classNamePrefix="select"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={paymentForm.notes}
                onChange={handlePaymentFormChange}
                rows="3"
                placeholder="Add any notes about this payment..."
                className="form-textarea w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  resetPaymentForm();
                }}
                className="btn btn-outline-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Calculate Daily Salary Modal */}
      <Modal
        isOpen={showCalculateModal}
        onClose={() => {
          setShowCalculateModal(false);
          resetCalculateForm();
        }}
        title="Calculate Daily Salary"
        size="lg"
      >
        <form onSubmit={handleCalculateDailySalary}>
          <div className="space-y-4">
            {/* Loadman Info */}
            {selectedLoadman && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium text-gray-800">
                  Loadman: {selectedLoadman.loadmanName || selectedLoadman.employee_name}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={calculateForm.date}
                onChange={handleCalculateFormChange}
                className="form-input w-full"
                required
              />
            </div>

            {/* Include Details Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeDetails"
                name="includeDetails"
                checked={calculateForm.includeDetails}
                onChange={(e) => setCalculateForm(prev => ({ 
                  ...prev, 
                  includeDetails: e.target.checked 
                }))}
                className="form-checkbox h-4 w-4 text-primary"
              />
              <label htmlFor="includeDetails" className="ml-2 text-sm text-gray-700">
                Include detailed breakdown
              </label>
            </div>

            {/* Results */}
            {loadmanDailySalary && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">Salary Calculation Result</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Loadman</div>
                    <div className="font-medium">{loadmanDailySalary.loadmanName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="font-medium">{loadmanDailySalary.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Earnings</div>
                    <div className="font-bold text-green-600">₹{loadmanDailySalary.totalEarnings}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Packages Handled</div>
                    <div className="font-medium">{loadmanDailySalary.totalPackages}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Paid Amount</div>
                    <div className="font-medium text-blue-600">₹{loadmanDailySalary.paidAmount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Pending Amount</div>
                    <div className="font-medium text-red-600">₹{loadmanDailySalary.pendingAmount}</div>
                  </div>
                </div>
                {loadmanDailySalary.assignments && loadmanDailySalary.assignments.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Assignments:</div>
                    <div className="max-h-40 overflow-y-auto">
                      {loadmanDailySalary.assignments.map((ass, idx) => (
                        <div key={idx} className="text-xs p-2 border-b last:border-b-0">
                          <div>Trip: {ass.tripNumber} | Booking: {ass.bookingNumber}</div>
                          <div>Type: {ass.loadmanType} | Amount: ₹{ass.amountEarned}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowCalculateModal(false);
                  resetCalculateForm();
                }}
                className="btn btn-outline-secondary"
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Loadman Salary Detail Component
const LoadmanSalaryDetail = ({ loadmanId, startDate, endDate }) => {
  const dispatch = useDispatch();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [loadmanId, startDate, endDate]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const response = await dispatch(getLoadmanSalarySummary({
        loadmanId,
        startDate,
        endDate
      })).unwrap();
      setDetailData(response.data || response);
    } catch (error) {
      showMessage('error', 'Failed to load loadman details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!detailData || !detailData.loadman) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data found for this loadman
      </div>
    );
  }

  const { loadman, summary = {}, dailyBreakdown = [] } = detailData;

  return (
    <div className="space-y-4">
      {/* Loadman Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Loadman Name</div>
            <div className="font-medium">{loadman.loadmanName}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Mobile</div>
            <div className="font-medium">{loadman.mobileNo || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Date Range</div>
            <div className="font-medium">{startDate} to {endDate}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Working Days</div>
            <div className="font-medium">{dailyBreakdown.length}</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500">Total Earnings</div>
          <div className="text-lg font-bold text-green-600">₹{summary.totalEarnings || '0.00'}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500">Total Paid</div>
          <div className="text-lg font-bold text-blue-600">₹{summary.totalPaid || '0.00'}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-500">Total Pending</div>
          <div className="text-lg font-bold text-red-600">₹{summary.totalPending || '0.00'}</div>
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div>
        <h3 className="font-medium text-gray-800 mb-2">Daily Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Packages</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyBreakdown.map((day, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{day.date}</td>
                  <td className="px-3 py-2 text-sm">{day.packages}</td>
                  <td className="px-3 py-2 text-sm text-green-600">₹{day.earnings}</td>
                  <td className="px-3 py-2 text-sm text-blue-600">₹{day.paid}</td>
                  <td className="px-3 py-2 text-sm text-red-600">₹{day.pending}</td>
                  <td className="px-3 py-2 text-sm">
                    {day.isFullyPaid ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Paid</span>
                    ) : day.paid > 0 ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Partial</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {dailyBreakdown.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-3 py-4 text-center text-sm text-gray-500">
                    No daily records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Loadman Directory Component
const LoadmanDirectory = ({ onSelectLoadman }) => {
  const dispatch = useDispatch();
  const [loadmen, setLoadmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLoadmen();
  }, []);

  const fetchLoadmen = async () => {
    setLoading(true);
    try {
      const response = await dispatch(getLoadmanData({})).unwrap();
      setLoadmen(response.data?.loadmen || []);
    } catch (error) {
      showMessage('error', 'Failed to load loadmen');
    } finally {
      setLoading(false);
    }
  };

  const filteredLoadmen = loadmen.filter(l => 
    l.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.mobile_no?.includes(search)
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search loadmen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input w-full"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLoadmen.map((loadman) => (
            <div
              key={loadman.employee_id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectLoadman(loadman)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <IconUser className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{loadman.employee_name}</div>
                  <div className="text-xs text-gray-500">{loadman.mobile_no || 'No mobile'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total Earnings</div>
                  <div className="font-bold text-green-600">
                    ₹{loadman.summary?.total_earnings || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredLoadmen.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No loadmen found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Missing Icon component
const IconCalculator = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="8" y1="6" x2="16" y2="6"></line>
    <line x1="16" y1="14" x2="16" y2="18"></line>
    <line x1="12" y1="10" x2="12" y2="18"></line>
    <line x1="8" y1="14" x2="8" y2="18"></line>
  </svg>
);

export default LoadmanSalaryManagement;