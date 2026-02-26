import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconDownload from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconTrendingDown from '../../../components/Icon/IconTrendingDown';
import IconPackage from '../../../components/Icon/IconBox';
import IconTruck from '../../../components/Icon/IconTruck';
import IconUsers from '../../../components/Icon/IconUsers';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconClock from '../../../components/Icon/IconClock';
import IconBuilding from '../../../components/Icon/IconBuilding';
import IconX from '../../../components/Icon/IconX';
import Table from '../../../util/Table';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getDateRangeProfitLossApi } from '../../../api/ReportApi';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { findArrObj, showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';
import Select from 'react-select';
import _ from 'lodash';

const ProfitLossReport = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get login info and permissions
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Daily Profit Loss Report');


    // Get office centers from Redux
    const officeCentersState = useSelector((state) => state.OfficeCenterSlice || {});
    const { officeCentersData = [], loading: centersLoading = false } = officeCentersState;

    // States
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
    const [selectedCenter, setSelectedCenter] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [viewMode, setViewMode] = useState('payments'); // 'payments', 'expenses', 'summary', 'customers'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal states
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        dispatch(setPageTitle('Profit & Loss Report'));
        // Fetch office centers for dropdown
        dispatch(getOfficeCenters({}));
    }, []);

    useEffect(() => {
        if (selectedDate) {
            fetchReportData();
        }
    }, [selectedDate, selectedCenter]);

    const fetchReportData = async () => {
        setLoading(true);
        setError(null);

        try {
            const request = {
                startDate: selectedDate,
                endDate: selectedDate,
                centerId: selectedCenter?.value || null, // Send null for all centers
            };

            const response = await getDateRangeProfitLossApi(request);

            if (response && response.data) {
                setReportData(response.data);
            } else {
                setError('No data found for selected date');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch report data');
            showMessage('error', err.message || 'Failed to fetch report data');
            console.error('Error fetching report:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleCenterChange = (selectedOption) => {
        setSelectedCenter(selectedOption);
    };

    const handlePrevDay = () => {
        setSelectedDate(moment(selectedDate).subtract(1, 'day').format('YYYY-MM-DD'));
    };

    const handleNextDay = () => {
        const nextDay = moment(selectedDate).add(1, 'day').format('YYYY-MM-DD');
        const today = moment().format('YYYY-MM-DD');
        if (nextDay <= today) {
            setSelectedDate(nextDay);
        }
    };

    const handleViewCustomerPayments = (customer) => {
        if (!customer) return;

        // Ensure all required properties exist
        const customerWithPayments = {
            customer_name: customer.customer_name || 'Unknown',
            customer_number: customer.customer_number || 'N/A',
            total_amount: customer.total_amount || 0,
            payment_count: customer.payment_count || 0,
            payments: Array.isArray(customer.payments)
                ? customer.payments.map((payment) => ({
                      payment_number: payment.payment_number || 'N/A',
                      amount: payment.amount || 0,
                      mode: payment.mode || 'N/A',
                      booking_number: payment.booking_number || 'N/A',
                      booking_center: payment.booking_center || 'N/A',
                      date: payment.date || null,
                  }))
                : [],
        };

        setSelectedCustomer(customerWithPayments);
        setShowCustomerModal(true);
    };

    const closeModal = () => {
        setShowCustomerModal(false);
        setSelectedCustomer(null);
    };

    const onDownloadExcel = () => {
        if (!reportData) return;

        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryHeader = [
            ['PROFIT & LOSS REPORT'],
            [`Date: ${moment(selectedDate).format('DD/MM/YYYY')}`],
            [`Center: ${reportData.center?.name || 'All Centers'}`],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['SUMMARY'],
            ['Opening Balance', reportData.opening_balance?.total || '0.00'],
            ['Total Payments', reportData.summary?.total_payment_amount || '0.00'],
            ['Total Expenses', reportData.summary?.total_expense_amount || '0.00'],
            ['Net Profit/Loss', reportData.summary?.total_profit_loss || '0.00'],
            ['Closing Balance', reportData.summary?.closing_balance || '0.00'],
            ['Status', reportData.summary?.profit_loss_status?.toUpperCase() || 'N/A'],
            ['Unique Customers', reportData.summary?.unique_customers || 0],
        ];

        const summaryRows = [...summaryHeader];
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);

        // Payments Sheet
        const paymentHeader = [['PAYMENTS DETAILS'], [], ['Date', 'Payment Number', 'Customer', 'Amount', 'Mode', 'Type', 'Booking Number', 'Description']];

        const paymentData = (reportData.transactions?.payments || []).map((p) => [
            p.date,
            p.payment_number,
            p.customer?.name || 'N/A',
            p.amount,
            p.mode,
            p.type,
            p.booking?.number || 'N/A',
            p.description || '',
        ]);

        const paymentRows = [...paymentHeader, ...paymentData];
        const paymentWs = XLSX.utils.aoa_to_sheet(paymentRows);

        // Expenses Sheet
        const expenseHeader = [['EXPENSES DETAILS'], [], ['Date', 'Type', 'Amount', 'Description', 'Notes']];

        const expenseData = (reportData.transactions?.expenses || []).map((e) => [e.date, e.type, e.amount, e.description, e.notes]);

        const expenseRows = [...expenseHeader, ...expenseData];
        const expenseWs = XLSX.utils.aoa_to_sheet(expenseRows);

        // Customers Sheet
        const customerHeader = [['CUSTOMER PAYMENT SUMMARY'], [], ['Customer', 'Phone', 'Total Amount', 'Payment Count']];

        const customerData = (reportData.breakdown?.by_customer || []).map((c) => [c.customer_name, c.customer_number, c.total_amount, c.payment_count]);

        const customerRows = [...customerHeader, ...customerData];
        const customerWs = XLSX.utils.aoa_to_sheet(customerRows);

        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        XLSX.utils.book_append_sheet(wb, paymentWs, 'Payments');
        XLSX.utils.book_append_sheet(wb, expenseWs, 'Expenses');
        XLSX.utils.book_append_sheet(wb, customerWs, 'Customers');

        const fileName = `Profit-Loss-Report-${moment(selectedDate).format('DD-MM-YYYY')}-${(reportData.center?.name || 'All-Centers').replace(/\s+/g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = async () => {
        if (!reportData) return;

        const pdfData = {
            reportData: reportData,
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            date: moment(selectedDate).format('DD/MM/YYYY'),
            centerName: reportData.center?.name || 'All Centers',
            viewMode: viewMode,
        };

        navigate('/documents/audit-report-pdf', { state: pdfData });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: { color: 'bg-green-100 text-green-800', icon: <IconCheckCircle className="w-3 h-3 mr-1" /> },
            partial: { color: 'bg-yellow-100 text-yellow-800', icon: <IconClock className="w-3 h-3 mr-1" /> },
            pending: { color: 'bg-red-100 text-red-800', icon: <IconClock className="w-3 h-3 mr-1" /> },
        };

        const config = statusConfig[status] || statusConfig['pending'];
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${config.color}`}>
                {config.icon}
                {status?.toUpperCase()}
            </span>
        );
    };

    // Transform office centers for react-select
    const centerOptions = [
        { value: '', label: 'All Centers' },
        ...(officeCentersData || []).map((center) => ({
            value: center.id,
            label: center.officeCentersName,
        })),
    ];

    // Custom styles for react-select
    const selectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '42px',
            borderColor: '#e2e8f0',
            '&:hover': {
                borderColor: '#cbd5e0',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e2e8f0' : 'white',
            color: state.isSelected ? 'white' : '#1e293b',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: state.isSelected ? '#2563eb' : '#cbd5e0',
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 50,
        }),
    };

    // Payment Columns
    const paymentColumns = [
        {
            Header: 'Payment No',
            accessor: 'payment_number',
            width: 120,
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value}</span>,
        },
        {
            Header: 'Customer Details',
            accessor: 'customer',
            Cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.customer?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{row.original.customer?.number || ''}</div>
                </div>
            ),
        },
        {
            Header: 'Booking',
            accessor: 'booking',
            Cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.booking?.number || 'N/A'}</span>,
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value }) => <div className="font-bold text-green-700">{formatCurrency(value)}</div>,
        },
        {
            Header: 'Mode',
            accessor: 'mode',
            Cell: ({ value }) => <span className="capitalize px-2 py-1 bg-gray-100 rounded-lg text-xs">{value}</span>,
        },
        {
            Header: 'Type',
            accessor: 'type',
            Cell: ({ value }) => <span className={`capitalize px-2 py-1 rounded-lg text-xs ${value === 'full' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{value}</span>,
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => <span className="text-sm text-gray-600">{moment(value).format('DD/MM/YYYY')}</span>,
        },
    ];

    // Expense Columns
    const expenseColumns = [
        {
            Header: 'Type',
            accessor: 'type',
            Cell: ({ value }) => <span className="font-medium text-red-600">{value}</span>,
        },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-medium">{value}</div>
                    {row.original.notes && <div className="text-xs text-gray-500">{row.original.notes}</div>}
                </div>
            ),
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value }) => <div className="font-bold text-red-700">{formatCurrency(value)}</div>,
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => <span className="text-sm text-gray-600">{moment(value).format('DD/MM/YYYY')}</span>,
        },
    ];

    // Customer Columns with View Action
    const customerColumns = [
        {
            Header: 'Customer',
            accessor: 'customer_name',
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-medium text-blue-600">{value}</div>
                    <div className="text-xs text-gray-500">{row.original.customer_number}</div>
                </div>
            ),
        },
        {
            Header: 'Total Amount',
            accessor: 'total_amount',
            Cell: ({ value }) => <div className="font-bold text-green-700">{formatCurrency(value)}</div>,
        },
        {
            Header: 'Payments',
            accessor: 'payment_count',
            Cell: ({ value }) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                    {value} payment{value !== 1 ? 's' : ''}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <button
                    onClick={() => handleViewCustomerPayments(row.original)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors duration-200"
                >
                    View Payments
                </button>
            ),
        },
    ];

    // Customer Payment Details Columns for Modal
    const customerPaymentColumns = [
        {
            Header: 'Payment No',
            accessor: 'payment_number',
            Cell: ({ value }) => <span className="font-bold text-blue-600">{value || 'N/A'}</span>,
        },
        {
            Header: 'Amount',
            accessor: 'amount',
            Cell: ({ value }) => <div className="font-bold text-green-700">{formatCurrency(value || 0)}</div>,
        },
        {
            Header: 'Mode',
            accessor: 'mode',
            Cell: ({ value }) => <span className="capitalize px-2 py-1 bg-gray-100 rounded-lg text-xs">{value || 'N/A'}</span>,
        },
        {
            Header: 'Booking No',
            accessor: 'booking_number',
            Cell: ({ value }) => value || 'N/A',
        },
        {
            Header: 'Booking Center',
            accessor: 'booking_center',
            Cell: ({ value }) => value || 'N/A',
        },
        {
            Header: 'Date',
            accessor: 'date',
            Cell: ({ value }) => <span className="text-sm text-gray-600">{value ? moment(value).format('DD/MM/YYYY') : 'N/A'}</span>,
        },
    ];

    if (loading || centersLoading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <IconTrendingDown className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Report</h3>
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchReportData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Profit & Loss Report</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Daily financial summary with payments and expenses</p>
            </div>

            {/* Date Selection, Center Filter and Export */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Date Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IconCalendar className="inline w-4 h-4 mr-1" />
                            Select Date
                        </label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={selectedDate}
                            onChange={handleDateChange}
                            max={moment().format('YYYY-MM-DD')}
                        />
                    </div>

                    {/* Center Filter - React Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <IconBuilding className="inline w-4 h-4 mr-1" />
                            Filter by Center
                        </label>
                        <Select
                            options={centerOptions}
                            value={selectedCenter}
                            onChange={handleCenterChange}
                            placeholder="Select a center..."
                            isClearable
                            styles={selectStyles}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => setSelectedDate(moment().format('YYYY-MM-DD'))}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                        >
                            Today
                        </button>
                        <button onClick={handlePrevDay} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium">
                            Previous Day
                        </button>
                        <button
                            onClick={handleNextDay}
                            disabled={selectedDate === moment().format('YYYY-MM-DD')}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                                selectedDate === moment().format('YYYY-MM-DD') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            Next Day
                        </button>
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={onDownloadExcel}
                        disabled={!reportData}
                        className={`px-4 py-2 rounded-lg font-medium shadow-sm flex items-center text-sm ${
                            reportData ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <IconDownload className="mr-2 w-4 h-4" />
                        Export Excel
                    </button>
                    <button
                        onClick={onGeneratePDF}
                        disabled={!reportData}
                        className={`px-4 py-2 rounded-lg font-medium shadow-sm flex items-center text-sm ${
                            reportData ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <IconPrinter className="mr-2 w-4 h-4" />
                        Generate PDF
                    </button>
                </div>

                {/* Report Info */}
                {reportData && (
                    <div className="text-center mt-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {moment(reportData.date_range?.start_date).format('DD MMMM YYYY')} - {reportData.center?.name || 'All Centers'}
                        </h3>
                    </div>
                )}
            </div>

            {/* Summary Cards - Only show if data exists */}
            {reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Opening Balance Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Opening Balance</h3>
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <IconMoney className="w-5 h-5 text-gray-600" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-700 mb-2">{formatCurrency(reportData.opening_balance?.total)}</div>
                            </div>
                        </div>

                        {/* Total Payments Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Total Payments</h3>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <IconMoney className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-700 mb-2">{formatCurrency(reportData.summary?.total_payment_amount)}</div>
                                <div className="text-sm text-gray-600">{reportData.summary?.total_payments} payments</div>
                            </div>
                        </div>

                        {/* Total Expenses Card */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Total Expenses</h3>
                                <div className="p-2 bg-red-100 rounded-full">
                                    <IconReceipt className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-700 mb-2">{formatCurrency(reportData.summary?.total_expense_amount)}</div>
                                <div className="text-sm text-gray-600">{reportData.summary?.total_expense_payments} expenses</div>
                            </div>
                        </div>

                        {/* Net Profit/Loss Card */}
                        <div className={`bg-white rounded-lg shadow-sm p-4 border ${reportData.summary?.profit_loss_status === 'profit' ? 'border-green-200' : 'border-red-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Net Profit/Loss</h3>
                                <div className={`p-2 rounded-full ${reportData.summary?.profit_loss_status === 'profit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {reportData.summary?.profit_loss_status === 'profit' ? (
                                        <IconTrendingUp className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <IconTrendingDown className="w-5 h-5 text-red-600" />
                                    )}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold mb-2 ${reportData.summary?.profit_loss_status === 'profit' ? 'text-green-700' : 'text-red-700'}`}>
                                    {formatCurrency(reportData.summary?.total_profit_loss)}
                                </div>
                                <div className="text-sm text-gray-600">Closing: {formatCurrency(reportData.summary?.closing_balance)}</div>
                            </div>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setViewMode('payments')}
                                    className={`px-4 py-2 rounded-lg flex items-center ${
                                        viewMode === 'payments' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <IconMoney className="w-4 h-4 mr-2" />
                                    Payments ({reportData.transactions?.payments?.length || 0})
                                </button>
                                <button
                                    onClick={() => setViewMode('expenses')}
                                    className={`px-4 py-2 rounded-lg flex items-center ${
                                        viewMode === 'expenses' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <IconReceipt className="w-4 h-4 mr-2" />
                                    Expenses ({reportData.transactions?.expenses?.length || 0})
                                </button>
                                <button
                                    onClick={() => setViewMode('customers')}
                                    className={`px-4 py-2 rounded-lg flex items-center ${
                                        viewMode === 'customers' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <IconUsers className="w-4 h-4 mr-2" />
                                    Customers ({reportData.breakdown?.by_customer?.length || 0})
                                </button>
                                <button
                                    onClick={() => setViewMode('summary')}
                                    className={`px-4 py-2 rounded-lg flex items-center ${
                                        viewMode === 'summary' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <IconPackage className="w-4 h-4 mr-2" />
                                    Summary
                                </button>
                            </div>

                            <div className="text-sm text-gray-600">
                                {reportData.breakdown?.daily?.[0]?.payments || 0} payments • {reportData.breakdown?.daily?.[0]?.expenses || 0} expenses
                            </div>
                        </div>
                    </div>

                    {/* Content based on view mode */}
                    {viewMode === 'payments' && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Payment Details</h3>
                                        <p className="text-gray-600 text-sm">
                                            {reportData.transactions?.payments?.length || 0} payments received on {moment(selectedDate).format('DD MMM YYYY')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                        <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="text-gray-600">Total: </span>
                                            <span className="font-semibold text-green-600">{formatCurrency(reportData.summary?.total_payment_amount)}</span>
                                        </div>
                                        <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="text-gray-600">Avg per payment: </span>
                                            <span className="font-semibold text-blue-600">
                                                {formatCurrency(reportData.summary?.total_payment_amount / (reportData.transactions?.payments?.length || 1))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 sm:p-4">
                                <Table
                                    columns={paymentColumns}
                                    data={reportData.transactions?.payments || []}
                                    Title=""
                                    pageSize={10}
                                    pageIndex={0}
                                    totalCount={reportData.transactions?.payments?.length || 0}
                                    totalPages={Math.ceil((reportData.transactions?.payments?.length || 0) / 10)}
                                    onPaginationChange={(page, size) => {}}
                                    isSortable={true}
                                    pagination={true}
                                    isSearchable={true}
                                    tableClass="min-w-full rounded-lg overflow-hidden"
                                    theadClass="bg-gray-50"
                                    responsive={true}
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'expenses' && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Expense Details</h3>
                                        <p className="text-gray-600 text-sm">
                                            {reportData.transactions?.expenses?.length || 0} expenses on {moment(selectedDate).format('DD MMM YYYY')}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                        <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="text-gray-600">Total: </span>
                                            <span className="font-semibold text-red-600">{formatCurrency(reportData.summary?.total_expense_amount)}</span>
                                        </div>
                                        <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="text-gray-600">Avg per expense: </span>
                                            <span className="font-semibold text-orange-600">
                                                {formatCurrency(reportData.summary?.total_expense_amount / (reportData.transactions?.expenses?.length || 1))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 sm:p-4">
                                <Table
                                    columns={expenseColumns}
                                    data={reportData.transactions?.expenses || []}
                                    Title=""
                                    pageSize={10}
                                    pageIndex={0}
                                    totalCount={reportData.transactions?.expenses?.length || 0}
                                    totalPages={Math.ceil((reportData.transactions?.expenses?.length || 0) / 10)}
                                    onPaginationChange={(page, size) => {}}
                                    isSortable={true}
                                    pagination={true}
                                    isSearchable={true}
                                    tableClass="min-w-full rounded-lg overflow-hidden"
                                    theadClass="bg-gray-50"
                                    responsive={true}
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'customers' && (
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Customer Payment Summary</h3>
                                        <p className="text-gray-600 text-sm">{reportData.breakdown?.by_customer?.length || 0} unique customers made payments</p>
                                    </div>
                                    <div className="text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Unique Customers: </span>
                                        <span className="font-semibold text-purple-600">{reportData.breakdown?.by_customer?.length || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2 sm:p-4">
                                <Table
                                    columns={customerColumns}
                                    data={reportData.breakdown?.by_customer || []}
                                    Title=""
                                    pageSize={10}
                                    pageIndex={0}
                                    totalCount={reportData.breakdown?.by_customer?.length || 0}
                                    totalPages={Math.ceil((reportData.breakdown?.by_customer?.length || 0) / 10)}
                                    onPaginationChange={(page, size) => {}}
                                    isSortable={true}
                                    pagination={true}
                                    isSearchable={true}
                                    tableClass="min-w-full rounded-lg overflow-hidden"
                                    theadClass="bg-gray-50"
                                    responsive={true}
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'summary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Payment Mode Breakdown */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Mode Breakdown</h3>
                                <div className="space-y-4">
                                    {(reportData.breakdown?.by_payment_mode || []).map((mode, index) => (
                                        <div key={index} className="border-l-4 border-green-500 pl-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-gray-800 capitalize">{mode.mode}</div>
                                                    <div className="text-sm text-gray-600">{mode.count} payments</div>
                                                </div>
                                                <div className="text-green-700 font-bold">{formatCurrency(mode.total)}</div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(mode.total / reportData.summary?.total_payment_amount) * 100}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{((mode.total / reportData.summary?.total_payment_amount) * 100).toFixed(1)}% of total payments</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expense Type Breakdown */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Expense Type Breakdown</h3>
                                <div className="space-y-4">
                                    {(reportData.breakdown?.by_expense_type || []).map((expense, index) => (
                                        <div key={index} className="border-l-4 border-red-500 pl-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-gray-800">{expense.type}</div>
                                                    <div className="text-sm text-gray-600">{expense.count} expenses</div>
                                                </div>
                                                <div className="text-red-700 font-bold">{formatCurrency(expense.total)}</div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div
                                                    className="bg-red-600 h-2 rounded-full"
                                                    style={{
                                                        width: `${(expense.total / reportData.summary?.total_expense_amount) * 100}%`,
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{((expense.total / reportData.summary?.total_expense_amount) * 100).toFixed(1)}% of total expenses</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Daily Summary */}
                            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 md:col-span-2">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(reportData.breakdown?.daily || []).map((day, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-sm text-gray-600 mb-2">{moment(day.date).format('DD MMM YYYY')}</div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Payments:</span>
                                                    <span className="font-semibold text-green-600">
                                                        {day.payments} ({formatCurrency(day.payment_total)})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Expenses:</span>
                                                    <span className="font-semibold text-red-600">
                                                        {day.expenses} ({formatCurrency(day.expense_total)})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t">
                                                    <span>Net:</span>
                                                    <span className={`font-bold ${parseFloat(day.net_change) >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(day.net_change)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Customer Payment Details Modal */}
            {showCustomerModal && selectedCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Payment Details - {selectedCustomer.customer_name || 'Unknown'}</h3>
                                        <p className="text-sm text-gray-600">
                                            Phone: {selectedCustomer.customer_number || 'N/A'} | Total Paid: {formatCurrency(selectedCustomer.total_amount || 0)} | Total Payments:{' '}
                                            {selectedCustomer.payment_count || 0}
                                        </p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <IconX className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    {selectedCustomer.payments && selectedCustomer.payments.length > 0 ? (
                                        <Table
                                            columns={customerPaymentColumns}
                                            data={selectedCustomer.payments}
                                            Title=""
                                            pageSize={5}
                                            pageIndex={0}
                                            totalCount={selectedCustomer.payments.length}
                                            totalPages={Math.ceil(selectedCustomer.payments.length / 5)}
                                            onPaginationChange={(page, size) => {}}
                                            isSortable={true}
                                            pagination={true}
                                            isSearchable={true}
                                            tableClass="min-w-full rounded-lg overflow-hidden"
                                            theadClass="bg-gray-50"
                                            responsive={true}
                                        />
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <IconReceipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 text-lg font-medium mb-2">No Payment Details</p>
                                            <p className="text-gray-500 text-sm">This customer has no payment records for the selected date.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No Data Message */}
            {!reportData && !loading && !error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
                    <IconCalendar className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Data Available</h3>
                    <p className="text-yellow-600 mb-4">Select a date and center to view the profit & loss report</p>
                    <button onClick={fetchReportData} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                        Load Data
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfitLossReport;
