import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconDownload from '../../../components/Icon/IconFile';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconMoney from '../../../components/Icon/IconCreditCard';
import IconTrendingUp from '../../../components/Icon/IconTrendingUp';
import IconTrendingDown from '../../../components/Icon/IconTrendingDown';
import IconUsers from '../../../components/Icon/IconUsers';
import IconReceipt from '../../../components/Icon/IconReceipt';
import IconBuilding from '../../../components/Icon/IconBuilding';
import IconX from '../../../components/Icon/IconX';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getDateRangeProfitLossApi } from '../../../api/ReportApi';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import { showMessage, getAccessIdsByLabel } from '../../../util/AllFunction';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal states
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        dispatch(setPageTitle('Profit & Loss Report'));
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
                centerId: selectedCenter?.value || null,
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
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(num);
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

    // Prepare ledger entries for the report (only individual transactions)
    const prepareLedgerEntries = () => {
        if (!reportData) return [];

        const entries = [];

        // Add all customer payments
        if (reportData.transactions?.payments?.length > 0) {
            reportData.transactions.payments.forEach((payment) => {
                entries.push({
                    name: payment.customer?.name || 'Customer Payment',
                    credit: parseFloat(payment.amount),
                    debit: 0,
                    remarks: `${payment.mode?.toUpperCase()} | Booking: ${payment.booking?.number || 'N/A'}`,
                    payment_number: payment.payment_number,
                });
            });
        }

        // Add all expenses
        if (reportData.transactions?.expenses?.length > 0) {
            reportData.transactions.expenses.forEach((expense) => {
                entries.push({
                    name: expense.type || 'Expense',
                    credit: 0,
                    debit: parseFloat(expense.amount),
                    remarks: expense.description || expense.notes || '',
                });
            });
        }

        // Add Investments
        const investments = reportData.transactions?.investments?.filter(inv => inv.type === 'IN') || [];
        if (investments.length > 0) {
            investments.forEach((investment) => {
                entries.push({
                    name: 'Investment',
                    credit: parseFloat(investment.amount),
                    debit: 0,
                    remarks: investment.center?.name || '',
                });
            });
        }

        // Add Withdrawals
        const withdrawals = reportData.transactions?.investments?.filter(inv => inv.type === 'OUT') || [];
        if (withdrawals.length > 0) {
            withdrawals.forEach((withdrawal) => {
                entries.push({
                    name: 'Withdrawal',
                    credit: 0,
                    debit: parseFloat(withdrawal.amount),
                    remarks: withdrawal.center?.name || '',
                });
            });
        }

        return entries;
    };

    // Get summary data for footer
    const getSummaryData = () => {
        if (!reportData) return [];
        
        const summary = [];
        
        // Total Payments
        const totalPayments = parseFloat(reportData.summary?.total_payment_amount || 0);
        summary.push({
            name: 'TOTAL PAYMENTS',
            credit: totalPayments,
            debit: 0,
            remarks: '-',
            isBold: true,
        });
        
        // Total Expenses
        const totalExpenses = parseFloat(reportData.summary?.total_expense_amount || 0);
        summary.push({
            name: 'TOTAL EXPENSES',
            credit: 0,
            debit: totalExpenses,
            remarks: '-',
            isBold: true,
        });
        
        // Operational Profit/Loss
        const operationalProfitLoss = Math.abs(parseFloat(reportData.summary?.operational_profit_loss || 0));
        const isOperationalProfit = operationalProfitLoss >= 0;
        summary.push({
            name: 'OPERATIONAL PROFIT/LOSS',
            credit: isOperationalProfit ? operationalProfitLoss : 0,
            debit: !isOperationalProfit ? operationalProfitLoss : 0,
            remarks: '-',
            isBold: true,
        });
        
        // Net Investment Change
        const totalInvestments = parseFloat(reportData.summary?.total_investments || 0);
        const totalWithdrawals = parseFloat(reportData.summary?.total_withdrawals || 0);
        const netInvestmentChange = totalInvestments - totalWithdrawals;
        
        summary.push({
            name: 'NET INVESTMENT CHANGE',
            credit: netInvestmentChange > 0 ? netInvestmentChange : 0,
            debit: netInvestmentChange < 0 ? Math.abs(netInvestmentChange) : 0,
            remarks: '-',
            isBold: true,
        });
        
        // Total Profit/Loss (Overall)
        const totalProfitLoss = parseFloat(reportData.summary?.total_profit_loss || 0);
        const isTotalProfit = totalProfitLoss >= 0;
        
        summary.push({
            name: 'NET PROFIT/LOSS (Overall)',
            credit: isTotalProfit ? Math.abs(totalProfitLoss) : 0,
            debit: !isTotalProfit ? Math.abs(totalProfitLoss) : 0,
            remarks: '-',
            isBold: true,
            isHighlight: true,
        });
        
        return summary;
    };

    const onDownloadExcel = () => {
        if (!reportData) return;

        const wb = XLSX.utils.book_new();
        const entries = prepareLedgerEntries();
        const summaryData = getSummaryData();
        const openingBalance = parseFloat(reportData.opening_balance?.total || 0);
        const closingBalance = parseFloat(reportData.summary?.closing_balance || 0);

        // Ledger Sheet
        const ledgerHeader = [
            ['PROFIT & LOSS LEDGER REPORT'],
            [`Date: ${moment(selectedDate).format('DD/MM/YYYY')}`],
            [`Center: ${reportData.center?.name || 'All Centers'}`],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['Opening Balance', formatCurrency(openingBalance), `As of ${reportData.opening_balance?.as_of_date || 'previous day'}`],
            [],
            ['Particulars', 'Credit (₹)', 'Debit (₹)', 'Remarks'],
            [],
        ];

        const ledgerRows = entries.map(entry => [
            entry.name,
            entry.credit > 0 ? entry.credit.toFixed(2) : '',
            entry.debit > 0 ? entry.debit.toFixed(2) : '',
            entry.remarks || '',
        ]);

        const summaryRows = summaryData.map(summary => [
            summary.name,
            summary.credit > 0 ? summary.credit.toFixed(2) : '',
            summary.debit > 0 ? summary.debit.toFixed(2) : '',
            summary.remarks || '',
        ]);

        const closingRow = [
            'Closing Balance',
            closingBalance.toFixed(2),
            '',
            `As of ${reportData.summary?.closing_balance_as_of || selectedDate}`,
        ];

        const allRows = [...ledgerHeader, ...ledgerRows, [], ...summaryRows, [], closingRow];
        const ledgerWs = XLSX.utils.aoa_to_sheet(allRows);

        // Set column widths
        ledgerWs['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];

        XLSX.utils.book_append_sheet(wb, ledgerWs, 'Profit & Loss Ledger');

        const fileName = `Profit-Loss-Ledger-${moment(selectedDate).format('DD-MM-YYYY')}-${(reportData.center?.name || 'All-Centers').replace(/\s+/g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = async () => {
        if (!reportData) return;

        const entries = prepareLedgerEntries();
        const summaryData = getSummaryData();
        const openingBalance = parseFloat(reportData.opening_balance?.total || 0);
        const closingBalance = parseFloat(reportData.summary?.closing_balance || 0);

        const pdfData = {
            reportData: reportData,
            entries: entries,
            summaryData: summaryData,
            openingBalance: openingBalance,
            closingBalance: closingBalance,
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            date: moment(selectedDate).format('DD/MM/YYYY'),
            centerName: reportData.center?.name || 'All Centers',
        };

        navigate('/documents/profit-loss-pdf', { state: pdfData });
    };

    const getProfitLossBadge = () => {
        if (!reportData) return null;
        
        const status = reportData.summary?.profit_loss_status;
        const amount = Math.abs(parseFloat(reportData.summary?.total_profit_loss || 0));
        
        if (status === 'profit') {
            return (
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-green-100 text-green-800">
                    <IconTrendingUp className="w-4 h-4 mr-2" />
                    <span className="font-semibold">PROFIT: {formatCurrency(amount)}</span>
                </div>
            );
        } else {
            return (
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-100 text-red-800">
                    <IconTrendingDown className="w-4 h-4 mr-2" />
                    <span className="font-semibold">LOSS: {formatCurrency(amount)}</span>
                </div>
            );
        }
    };

    // Transform office centers for react-select
    const centerOptions = [
        { value: '', label: 'All Centers' },
        ...(officeCentersData || []).map((center) => ({
            value: center.id,
            label: center.officeCentersName,
        })),
    ];

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
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 50,
        }),
    };

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

    const entries = reportData ? prepareLedgerEntries() : [];
    const summaryData = reportData ? getSummaryData() : [];
    const openingBalance = reportData ? parseFloat(reportData.opening_balance?.total || 0) : 0;
    const closingBalance = reportData ? parseFloat(reportData.summary?.closing_balance || 0) : 0;

    return (
        <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Profit & Loss Ledger Report</h1>
                <p className="text-gray-600 mt-1 sm:mt-2">Credit and Debit statement with opening and closing balance</p>
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

                    {/* Center Filter */}
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
                    {_.includes(accessIds, '5') && (
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
                    )}
                    {_.includes(accessIds, '9') && (
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
                    )}
                </div>

                {/* Report Info */}
                {reportData && (
                    <div className="text-center mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {moment(selectedDate).format('DD MMMM YYYY')} - {reportData.center?.name || 'All Centers'}
                        </h3>
                        {getProfitLossBadge()}
                    </div>
                )}
            </div>

            {/* Ledger Report Table */}
            {reportData && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Ledger Statement</h2>
                            <p className="text-gray-600 text-sm">Transaction details for {moment(selectedDate).format('DD MMM YYYY')}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Particulars</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (₹)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (₹)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {entries.map((entry, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            {entry.name}
                                            {entry.payment_number && (
                                                <div className="text-xs text-gray-500">#{entry.payment_number}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right text-green-700">
                                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right text-red-700">
                                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {entry.remarks || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                {summaryData.map((summary, index) => (
                                    <tr 
                                        key={index} 
                                        className={`${summary.isHighlight ? 'bg-yellow-50' : ''}`}
                                    >
                                        <td className={`px-6 py-3 text-sm ${summary.isBold ? 'font-bold' : 'font-medium'} text-gray-900`}>
                                            {summary.name}
                                        </td>
                                        <td className={`px-6 py-3 text-sm text-right ${summary.isBold ? 'font-bold' : 'font-medium'} text-green-700`}>
                                            {summary.credit > 0 ? formatCurrency(summary.credit) : '-'}
                                        </td>
                                        <td className={`px-6 py-3 text-sm text-right ${summary.isBold ? 'font-bold' : 'font-medium'} text-red-700`}>
                                            {summary.debit > 0 ? formatCurrency(summary.debit) : '-'}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-500">
                                            {summary.remarks || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tfoot>
                        </table>
                    </div>
                </div>
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
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment No</th>
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Mode</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Booking No</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedCustomer.payments.map((payment, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm font-medium text-blue-600">{payment.payment_number}</td>
                                                            <td className="px-4 py-2 text-sm text-right font-bold text-green-700">{formatCurrency(payment.amount)}</td>
                                                            <td className="px-4 py-2 text-sm capitalize">{payment.mode}</td>
                                                            <td className="px-4 py-2 text-sm">{payment.booking_number}</td>
                                                            <td className="px-4 py-2 text-sm">{payment.date ? moment(payment.date).format('DD/MM/YYYY') : '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
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