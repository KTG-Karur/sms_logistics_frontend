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
import IconPieChart from '../../../components/Icon/IconPieChart';
import IconCash from '../../../components/Icon/IconCash';
import IconCreditCard from '../../../components/Icon/IconCreditCard';
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
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedExpenseType, setSelectedExpenseType] = useState(null);

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

    const handleViewExpenseDetails = (expenseType) => {
        if (!reportData || !expenseType) return;
        
        const expenses = reportData.transactions?.expenses?.filter(
            exp => exp.expense_type === expenseType.expense_type
        ) || [];
        
        setSelectedExpenseType({
            name: expenseType.expense_type,
            total: expenseType.total,
            count: expenseType.count,
            expenses: expenses
        });
        setShowExpenseModal(true);
    };

    const closeModal = () => {
        setShowCustomerModal(false);
        setSelectedCustomer(null);
        setShowExpenseModal(false);
        setSelectedExpenseType(null);
    };

    // Calculate payment totals by mode (cash vs digital)
    const getPaymentTotalsByMode = () => {
        if (!reportData || !reportData.transactions?.payments) {
            return { cash: 0, digital: 0, total: 0, cashCount: 0, digitalCount: 0 };
        }

        let cashTotal = 0;
        let digitalTotal = 0;
        let cashCount = 0;
        let digitalCount = 0;

        reportData.transactions.payments.forEach(payment => {
            const amount = parseFloat(payment.amount) || 0;
            const mode = (payment.payment_mode || '').toLowerCase();
            
            if (mode === 'cash') {
                cashTotal += amount;
                cashCount++;
            } 
            else if (['upi', 'card', 'gpay', 'bank_transfer', 'wallet', 'googlepay', 'phonepay'].includes(mode)) {
                digitalTotal += amount;
                digitalCount++;
            }
            else {
                cashTotal += amount;
                cashCount++;
            }
        });

        return {
            cash: cashTotal,
            digital: digitalTotal,
            total: cashTotal + digitalTotal,
            cashCount: cashCount,
            digitalCount: digitalCount
        };
    };

    // Calculate extra income totals by mode (cash vs digital)
    const getExtraIncomeTotalsByMode = () => {
        if (!reportData || !reportData.transactions?.extra_incomes) {
            return { cash: 0, digital: 0, total: 0, cashCount: 0, digitalCount: 0 };
        }

        let cashTotal = 0;
        let digitalTotal = 0;
        let cashCount = 0;
        let digitalCount = 0;

        reportData.transactions.extra_incomes.forEach(income => {
            const amount = parseFloat(income.amount) || 0;
            const incomeType = (income.income_type || '').toLowerCase();
            
            if (incomeType === 'cash') {
                cashTotal += amount;
                cashCount++;
            }
            else if (['upi', 'gpay', 'bank_transfer', 'card'].includes(incomeType)) {
                digitalTotal += amount;
                digitalCount++;
            }
            else {
                cashTotal += amount;
                cashCount++;
            }
        });

        return {
            cash: cashTotal,
            digital: digitalTotal,
            total: cashTotal + digitalTotal,
            cashCount: cashCount,
            digitalCount: digitalCount
        };
    };

    // Calculate expense totals by payment mode (cash vs digital)
    const getExpenseTotalsByMode = () => {
        if (!reportData || !reportData.transactions?.expenses) {
            return { cash: 0, digital: 0, total: 0, cashCount: 0, digitalCount: 0 };
        }

        let cashTotal = 0;
        let digitalTotal = 0;
        let cashCount = 0;
        let digitalCount = 0;

        reportData.transactions.expenses.forEach(expense => {
            const amount = parseFloat(expense.amount) || 0;
            const paymentType = (expense.payment_type || '').toLowerCase();
            
            if (paymentType === 'cash') {
                cashTotal += amount;
                cashCount++;
            }
            else if (['gpay', 'upi', 'bank_transfer', 'card', 'netbanking'].includes(paymentType)) {
                digitalTotal += amount;
                digitalCount++;
            }
            else {
                cashTotal += amount;
                cashCount++;
            }
        });

        return {
            cash: cashTotal,
            digital: digitalTotal,
            total: cashTotal + digitalTotal,
            cashCount: cashCount,
            digitalCount: digitalCount
        };
    };

    // Calculate cash/digital breakdown for Operational Profit/Loss
    const getOperationalProfitLossByMode = () => {
        const paymentTotals = getPaymentTotalsByMode();
        const expenseTotals = getExpenseTotalsByMode();
        const extraIncomeTotals = getExtraIncomeTotalsByMode();

        const operationalProfitCash = (paymentTotals.cash + extraIncomeTotals.cash) - expenseTotals.cash;
        const operationalProfitDigital = (paymentTotals.digital + extraIncomeTotals.digital) - expenseTotals.digital;
        const operationalProfitTotal = operationalProfitCash + operationalProfitDigital;

        return {
            cash: operationalProfitCash,
            digital: operationalProfitDigital,
            total: operationalProfitTotal,
            isProfit: operationalProfitTotal >= 0
        };
    };

    // Calculate cash/digital breakdown for Net Profit/Loss
    const getNetProfitLossByMode = () => {
        const operationalProfit = getOperationalProfitLossByMode();
        const totalInvestments = parseFloat(reportData?.summary?.total_investments || 0);
        const totalWithdrawals = parseFloat(reportData?.summary?.total_withdrawals || 0);
        const netInvestmentChange = totalInvestments - totalWithdrawals;

        // For net profit/loss, investment change is considered as cash by default
        const netProfitCash = operationalProfit.cash + netInvestmentChange;
        const netProfitDigital = operationalProfit.digital;
        const netProfitTotal = netProfitCash + netProfitDigital;

        return {
            cash: netProfitCash,
            digital: netProfitDigital,
            total: netProfitTotal,
            isProfit: netProfitTotal >= 0
        };
    };

    // Prepare ledger entries for the report
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
                    remarks: `${payment.payment_mode_label} | Booking: ${payment.booking?.number || 'N/A'}`,
                    payment_number: payment.payment_number,
                    type: 'payment'
                });
            });
        }

        // Add all extra income
        if (reportData.transactions?.extra_incomes?.length > 0) {
            reportData.transactions.extra_incomes.forEach((income) => {
                entries.push({
                    name: 'Extra Income',
                    credit: parseFloat(income.amount),
                    debit: 0,
                    remarks: `${income.income_type_label} | ${income.description || 'No description'}`,
                    type: 'extra_income'
                });
            });
        }

        // Add all expenses
        if (reportData.transactions?.expenses?.length > 0) {
            reportData.transactions.expenses.forEach((expense) => {
                entries.push({
                    name: expense.expense_type || 'Expense',
                    credit: 0,
                    debit: parseFloat(expense.amount),
                    remarks: `${expense.payment_type_label} | ${expense.description || expense.notes || 'No description'}`,
                    type: 'expense'
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
                    type: 'investment'
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
                    type: 'withdrawal'
                });
            });
        }

        return entries;
    };

    // Get summary data for footer with cash/digital breakdown
    const getSummaryData = () => {
        if (!reportData) return [];
        
        const summary = [];
        const paymentTotals = getPaymentTotalsByMode();
        const expenseTotals = getExpenseTotalsByMode();
        const extraIncomeTotals = getExtraIncomeTotalsByMode();
        const operationalProfitByMode = getOperationalProfitLossByMode();
        const netProfitByMode = getNetProfitLossByMode();
        
        // Total Payments - Overall
        const totalPayments = parseFloat(reportData.summary?.total_payment_amount || 0);
        const totalExtraIncome = parseFloat(reportData.summary?.total_extra_income_amount || 0);
        const totalIncome = totalPayments + totalExtraIncome;
        
        summary.push({
            name: 'TOTAL INCOME (Payments + Extra Income)',
            credit: totalIncome,
            debit: 0,
            remarks: `${reportData.summary?.total_payments || 0} payments, ${reportData.summary?.total_extra_income_count || 0} extra income`,
            isBold: true,
        });
        
        // Payment Breakdown by Mode
        if (paymentTotals.cash > 0 || paymentTotals.digital > 0) {
            if (paymentTotals.cash > 0) {
                summary.push({
                    name: '  └ Cash Payments',
                    credit: paymentTotals.cash,
                    debit: 0,
                    remarks: `${paymentTotals.cashCount} transactions`,
                    isSubItem: true,
                });
            }
            if (paymentTotals.digital > 0) {
                summary.push({
                    name: '  └ Digital Payments (UPI/Card/GPay/Bank Transfer)',
                    credit: paymentTotals.digital,
                    debit: 0,
                    remarks: `${paymentTotals.digitalCount} transactions`,
                    isSubItem: true,
                });
            }
        }
        
        // Extra Income Breakdown by Mode
        if (extraIncomeTotals.cash > 0 || extraIncomeTotals.digital > 0) {
            if (extraIncomeTotals.cash > 0) {
                summary.push({
                    name: '  └ Cash Extra Income',
                    credit: extraIncomeTotals.cash,
                    debit: 0,
                    remarks: `${extraIncomeTotals.cashCount} transactions`,
                    isSubItem: true,
                });
            }
            if (extraIncomeTotals.digital > 0) {
                summary.push({
                    name: '  └ Digital Extra Income (UPI/GPay)',
                    credit: extraIncomeTotals.digital,
                    debit: 0,
                    remarks: `${extraIncomeTotals.digitalCount} transactions`,
                    isSubItem: true,
                });
            }
        }
        
        // Total Expenses - Overall
        const totalExpenses = parseFloat(reportData.summary?.total_expense_amount || 0);
        summary.push({
            name: 'TOTAL EXPENSES',
            credit: 0,
            debit: totalExpenses,
            remarks: `${reportData.summary?.total_expense_payments || 0} expense transactions`,
            isBold: true,
        });
        
        // Expense Breakdown by Mode
        if (expenseTotals.cash > 0 || expenseTotals.digital > 0) {
            if (expenseTotals.cash > 0) {
                summary.push({
                    name: '  └ Cash Expenses',
                    credit: 0,
                    debit: expenseTotals.cash,
                    remarks: `${expenseTotals.cashCount} transactions`,
                    isSubItem: true,
                });
            }
            if (expenseTotals.digital > 0) {
                summary.push({
                    name: '  └ Digital Expenses (UPI/GPay/Bank Transfer)',
                    credit: 0,
                    debit: expenseTotals.digital,
                    remarks: `${expenseTotals.digitalCount} transactions`,
                    isSubItem: true,
                });
            }
        }
        
        // Operational Profit/Loss - Overall
        const operationalProfitLoss = Math.abs(parseFloat(reportData.summary?.operational_profit_loss || 0));
        const isOperationalProfit = parseFloat(reportData.summary?.operational_profit_loss || 0) >= 0;
        summary.push({
            name: 'OPERATIONAL PROFIT/LOSS',
            credit: isOperationalProfit ? operationalProfitLoss : 0,
            debit: !isOperationalProfit ? operationalProfitLoss : 0,
            remarks: 'Income - Expenses',
            isBold: true,
        });
        
        // Operational Profit/Loss Breakdown by Mode
        if (operationalProfitByMode.cash !== 0 || operationalProfitByMode.digital !== 0) {
            if (operationalProfitByMode.cash !== 0) {
                summary.push({
                    name: '  └ Cash Operational P/L',
                    credit: operationalProfitByMode.cash > 0 ? Math.abs(operationalProfitByMode.cash) : 0,
                    debit: operationalProfitByMode.cash < 0 ? Math.abs(operationalProfitByMode.cash) : 0,
                    remarks: 'Cash Income - Cash Expenses',
                    isSubItem: true,
                });
            }
            if (operationalProfitByMode.digital !== 0) {
                summary.push({
                    name: '  └ Digital Operational P/L',
                    credit: operationalProfitByMode.digital > 0 ? Math.abs(operationalProfitByMode.digital) : 0,
                    debit: operationalProfitByMode.digital < 0 ? Math.abs(operationalProfitByMode.digital) : 0,
                    remarks: 'Digital Income - Digital Expenses',
                    isSubItem: true,
                });
            }
        }
        
        // Net Investment Change
        const totalInvestments = parseFloat(reportData.summary?.total_investments || 0);
        const totalWithdrawals = parseFloat(reportData.summary?.total_withdrawals || 0);
        const netInvestmentChange = totalInvestments - totalWithdrawals;
        
        summary.push({
            name: 'NET INVESTMENT CHANGE',
            credit: netInvestmentChange > 0 ? netInvestmentChange : 0,
            debit: netInvestmentChange < 0 ? Math.abs(netInvestmentChange) : 0,
            remarks: 'Investments - Withdrawals',
            isBold: true,
        });
        
        // Total Profit/Loss (Overall)
        const totalProfitLoss = parseFloat(reportData.summary?.total_profit_loss || 0);
        const isTotalProfit = totalProfitLoss >= 0;
        
        summary.push({
            name: 'NET PROFIT/LOSS (Overall)',
            credit: isTotalProfit ? Math.abs(totalProfitLoss) : 0,
            debit: !isTotalProfit ? Math.abs(totalProfitLoss) : 0,
            remarks: 'Operational P/L + Investment Change',
            isBold: true,
            isHighlight: true,
        });
        
        // Net Profit/Loss Breakdown by Mode
        if (netProfitByMode.cash !== 0 || netProfitByMode.digital !== 0) {
            if (netProfitByMode.cash !== 0) {
                summary.push({
                    name: '  └ Cash Net P/L (incl. Investments)',
                    credit: netProfitByMode.cash > 0 ? Math.abs(netProfitByMode.cash) : 0,
                    debit: netProfitByMode.cash < 0 ? Math.abs(netProfitByMode.cash) : 0,
                    remarks: 'Cash Operational P/L + Investment Change',
                    isSubItem: true,
                });
            }
            if (netProfitByMode.digital !== 0) {
                summary.push({
                    name: '  └ Digital Net P/L',
                    credit: netProfitByMode.digital > 0 ? Math.abs(netProfitByMode.digital) : 0,
                    debit: netProfitByMode.digital < 0 ? Math.abs(netProfitByMode.digital) : 0,
                    remarks: 'Digital Operational P/L',
                    isSubItem: true,
                });
            }
        }
        
        return summary;
    };

    const onDownloadExcel = () => {
        if (!reportData) return;

        const wb = XLSX.utils.book_new();
        const entries = prepareLedgerEntries();
        const summaryData = getSummaryData();
        const openingBalance = parseFloat(reportData.opening_balance?.total || 0);
        const closingBalance = parseFloat(reportData.summary?.closing_balance || 0);
        const paymentTotals = getPaymentTotalsByMode();
        const expenseTotals = getExpenseTotalsByMode();
        const extraIncomeTotals = getExtraIncomeTotalsByMode();
        const operationalProfitByMode = getOperationalProfitLossByMode();
        const netProfitByMode = getNetProfitLossByMode();

        // Ledger Sheet
        const ledgerHeader = [
            ['PROFIT & LOSS LEDGER REPORT'],
            [`Date: ${moment(selectedDate).format('DD/MM/YYYY')}`],
            [`Center: ${reportData.center?.name || 'All Centers'}`],
            [`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            ['CASH/DIGITAL BREAKDOWN SUMMARY'],
            [`Cash Payments: ${formatCurrency(paymentTotals.cash)} (${paymentTotals.cashCount} transactions)`],
            [`Digital Payments: ${formatCurrency(paymentTotals.digital)} (${paymentTotals.digitalCount} transactions)`],
            [`Cash Extra Income: ${formatCurrency(extraIncomeTotals.cash)} (${extraIncomeTotals.cashCount} transactions)`],
            [`Digital Extra Income: ${formatCurrency(extraIncomeTotals.digital)} (${extraIncomeTotals.digitalCount} transactions)`],
            [`Cash Expenses: ${formatCurrency(expenseTotals.cash)} (${expenseTotals.cashCount} transactions)`],
            [`Digital Expenses: ${formatCurrency(expenseTotals.digital)} (${expenseTotals.digitalCount} transactions)`],
            [`Cash Operational P/L: ${formatCurrency(operationalProfitByMode.cash)}`],
            [`Digital Operational P/L: ${formatCurrency(operationalProfitByMode.digital)}`],
            [`Cash Net P/L: ${formatCurrency(netProfitByMode.cash)}`],
            [`Digital Net P/L: ${formatCurrency(netProfitByMode.digital)}`],
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

        const allRows = [...ledgerHeader, ...ledgerRows, [], ...summaryRows];
        const ledgerWs = XLSX.utils.aoa_to_sheet(allRows);

        // Set column widths
        ledgerWs['!cols'] = [{ wch: 45 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];

        XLSX.utils.book_append_sheet(wb, ledgerWs, 'Profit & Loss Ledger');

        // Summary Sheet with Breakdowns
        const summarySheetData = [
            ['PROFIT & LOSS SUMMARY'],
            [],
            ['PAYMENT BREAKDOWN BY TYPE'],
            ['Type', 'Amount (₹)', 'Count'],
            ...(reportData.summary?.payment_breakdown_by_type || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['PAYMENT BREAKDOWN BY MODE'],
            ['Mode', 'Amount (₹)', 'Count'],
            ...(reportData.summary?.payment_breakdown_by_mode || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['CASH VS DIGITAL PAYMENTS'],
            ['Type', 'Amount (₹)', 'Transactions'],
            ['Cash Payments', paymentTotals.cash.toFixed(2), paymentTotals.cashCount],
            ['Digital Payments (UPI/Card/GPay)', paymentTotals.digital.toFixed(2), paymentTotals.digitalCount],
            ['Total Payments', paymentTotals.total.toFixed(2), paymentTotals.cashCount + paymentTotals.digitalCount],
            [],
            ['CASH VS DIGITAL EXTRA INCOME'],
            ['Type', 'Amount (₹)', 'Transactions'],
            ['Cash Extra Income', extraIncomeTotals.cash.toFixed(2), extraIncomeTotals.cashCount],
            ['Digital Extra Income', extraIncomeTotals.digital.toFixed(2), extraIncomeTotals.digitalCount],
            ['Total Extra Income', extraIncomeTotals.total.toFixed(2), extraIncomeTotals.cashCount + extraIncomeTotals.digitalCount],
            [],
            ['CASH VS DIGITAL EXPENSES'],
            ['Type', 'Amount (₹)', 'Transactions'],
            ['Cash Expenses', expenseTotals.cash.toFixed(2), expenseTotals.cashCount],
            ['Digital Expenses (UPI/GPay/Bank Transfer)', expenseTotals.digital.toFixed(2), expenseTotals.digitalCount],
            ['Total Expenses', expenseTotals.total.toFixed(2), expenseTotals.cashCount + expenseTotals.digitalCount],
            [],
            ['CASH VS DIGITAL PROFIT/LOSS'],
            ['Type', 'Amount (₹)'],
            ['Cash Operational P/L', operationalProfitByMode.cash.toFixed(2)],
            ['Digital Operational P/L', operationalProfitByMode.digital.toFixed(2)],
            ['Cash Net P/L (incl. Investments)', netProfitByMode.cash.toFixed(2)],
            ['Digital Net P/L', netProfitByMode.digital.toFixed(2)],
            ['Total Net P/L', netProfitByMode.total.toFixed(2)],
            [],
            ['EXTRA INCOME BREAKDOWN'],
            ['Type', 'Amount (₹)', 'Count'],
            ...(reportData.summary?.extra_income_breakdown_by_type || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['EXPENSE BREAKDOWN BY PAYMENT TYPE'],
            ['Payment Type', 'Amount (₹)', 'Count'],
            ...(reportData.summary?.expense_breakdown_by_payment_type || []).map(item => [item.label, item.amount, item.count]),
            [],
            ['EXPENSE BREAKDOWN BY EXPENSE TYPE'],
            ['Expense Type', 'Amount (₹)', 'Count'],
            ...(reportData.summary?.expense_breakdown_by_expense_type || []).map(item => [item.expense_type, item.amount, item.count]),
        ];

        const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
        summaryWs['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary Breakdown');

        const fileName = `Profit-Loss-${moment(selectedDate).format('DD-MM-YYYY')}-${(reportData.center?.name || 'All-Centers').replace(/\s+/g, '-')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onGeneratePDF = async () => {
        if (!reportData) return;

        const entries = prepareLedgerEntries();
        const summaryData = getSummaryData();
        const openingBalance = parseFloat(reportData.opening_balance?.total || 0);
        const closingBalance = parseFloat(reportData.summary?.closing_balance || 0);
        const paymentTotals = getPaymentTotalsByMode();
        const expenseTotals = getExpenseTotalsByMode();
        const extraIncomeTotals = getExtraIncomeTotalsByMode();

        const pdfData = {
            reportData: reportData,
            entries: entries,
            summaryData: summaryData,
            openingBalance: openingBalance,
            closingBalance: closingBalance,
            generatedDate: moment().format('DD/MM/YYYY HH:mm'),
            date: moment(selectedDate).format('DD/MM/YYYY'),
            centerName: reportData.center?.name || 'All Centers',
            paymentTotals: paymentTotals,
            expenseTotals: expenseTotals,
            extraIncomeTotals: extraIncomeTotals
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
    const paymentTotals = reportData ? getPaymentTotalsByMode() : { cash: 0, digital: 0, total: 0, cashCount: 0, digitalCount: 0 };
    const expenseTotals = reportData ? getExpenseTotalsByMode() : { cash: 0, digital: 0, total: 0, cashCount: 0, digitalCount: 0 };
    const extraIncomeTotals = reportData ? getExtraIncomeTotalsByMode() : { cash: 0, digital: 0, total: 0, cashCount: 0, digitalCount: 0 };
    const operationalProfitByMode = reportData ? getOperationalProfitLossByMode() : { cash: 0, digital: 0, total: 0, isProfit: true };
    const netProfitByMode = reportData ? getNetProfitLossByMode() : { cash: 0, digital: 0, total: 0, isProfit: true };
    const extraIncomeTotal = reportData?.summary?.total_extra_income_amount || 0;
    const extraIncomeCount = reportData?.summary?.total_extra_income_count || 0;

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

            {/* Summary Cards - 4 Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Payments Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                        <h3 className="text-sm font-semibold text-green-800 flex items-center">
                            <IconMoney className="w-4 h-4 mr-1" />
                            Payments
                        </h3>
                    </div>
                    <div className="p-3">
                        <div className="text-xl font-bold text-green-700">{formatCurrency(paymentTotals.total)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Cash: {formatCurrency(paymentTotals.cash)} | Digital: {formatCurrency(paymentTotals.digital)}
                        </div>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                        <h3 className="text-sm font-semibold text-red-800 flex items-center">
                            <IconReceipt className="w-4 h-4 mr-1" />
                            Expenses
                        </h3>
                    </div>
                    <div className="p-3">
                        <div className="text-xl font-bold text-red-700">{formatCurrency(expenseTotals.total)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Cash: {formatCurrency(expenseTotals.cash)} | Digital: {formatCurrency(expenseTotals.digital)}
                        </div>
                    </div>
                </div>

                {/* Extra Income Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
                        <h3 className="text-sm font-semibold text-yellow-800 flex items-center">
                            <IconTrendingUp className="w-4 h-4 mr-1" />
                            Extra Income
                        </h3>
                    </div>
                    <div className="p-3">
                        <div className="text-xl font-bold text-yellow-700">{formatCurrency(extraIncomeTotal)}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Cash: {formatCurrency(extraIncomeTotals.cash)} | Digital: {formatCurrency(extraIncomeTotals.digital)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{extraIncomeCount} transactions</div>
                    </div>
                </div>

                {/* Net P/L Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                        <h3 className="text-sm font-semibold text-purple-800 flex items-center">
                            <IconTrendingUp className="w-4 h-4 mr-1" />
                            Net Profit/Loss
                        </h3>
                    </div>
                    <div className="p-3">
                        <div className={`text-xl font-bold ${netProfitByMode.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(Math.abs(netProfitByMode.total))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Cash: {formatCurrency(netProfitByMode.cash)} | Digital: {formatCurrency(netProfitByMode.digital)}
                        </div>
                    </div>
                </div>
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
                                        className={`${summary.isHighlight ? 'bg-yellow-50' : ''} ${summary.isSubItem ? 'bg-gray-100' : ''}`}
                                    >
                                        <td className={`px-6 py-3 text-sm ${summary.isBold ? 'font-bold' : summary.isSubItem ? 'font-normal pl-8' : 'font-medium'} text-gray-900`}>
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

            {/* Breakdown Sections */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Payment Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-800">Payment Breakdown</h3>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Type</h4>
                                <div className="space-y-2">
                                    {(reportData.summary?.payment_breakdown_by_type || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</span>
                                                <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Mode</h4>
                                <div className="space-y-2">
                                    {(reportData.summary?.payment_breakdown_by_mode || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</span>
                                                <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                            <h3 className="text-lg font-semibold text-red-800">Expense Breakdown</h3>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">By Expense Type</h4>
                                <div className="space-y-2">
                                    {(reportData.summary?.expense_breakdown_by_expense_type || []).map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className="flex justify-between items-center p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleViewExpenseDetails(item)}
                                        >
                                            <span className="text-sm font-medium text-gray-700">{item.expense_type}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-red-600">{formatCurrency(item.total)}</span>
                                                <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">By Payment Type</h4>
                                <div className="space-y-2">
                                    {(reportData.summary?.expense_breakdown_by_payment_type || []).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-red-600">{formatCurrency(item.total)}</span>
                                                <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Extra Income and Investment Sections */}
            {reportData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Extra Income Breakdown */}
                    {(reportData.summary?.extra_income_breakdown_by_type?.length > 0 || reportData.transactions?.extra_incomes?.length > 0) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
                                <h3 className="text-lg font-semibold text-yellow-800">Extra Income</h3>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">By Income Type</h4>
                                    <div className="space-y-2">
                                        {(reportData.summary?.extra_income_breakdown_by_type || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                                <div className="text-right">
                                                    <span className="text-sm font-bold text-green-600">{formatCurrency(item.total)}</span>
                                                    <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {reportData.transactions?.extra_incomes?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Transactions</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {reportData.transactions.extra_incomes.map((income, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                                                    <div>
                                                        <span className="font-medium">{income.income_type_label}</span>
                                                        {income.description && (
                                                            <span className="text-gray-500 text-xs ml-2">- {income.description}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-green-600">{formatCurrency(income.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Investment/Withdrawal Breakdown */}
                    {(reportData.transactions?.investments?.length > 0) && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-800">Investments & Withdrawals</h3>
                            </div>
                            <div className="p-4">
                                <div className="space-y-2">
                                    {reportData.transactions.investments.map((inv, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {inv.type === 'IN' ? 'Investment' : 'Withdrawal'}
                                                </span>
                                                {inv.center && (
                                                    <span className="text-xs text-gray-500 ml-2">- {inv.center.name}</span>
                                                )}
                                                {inv.notes && (
                                                    <span className="text-xs text-gray-400 ml-2">({inv.notes})</span>
                                                )}
                                            </div>
                                            <span className={`text-sm font-bold ${inv.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(inv.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Customer Modal */}
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

            {/* Expense Details Modal */}
            {showExpenseModal && selectedExpenseType && (
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
                                        <h3 className="text-lg font-bold text-gray-900">Expense Details - {selectedExpenseType.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Total: {formatCurrency(selectedExpenseType.total)} | Transactions: {selectedExpenseType.count}
                                        </p>
                                    </div>
                                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        <IconX className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="mt-4">
                                    {selectedExpenseType.expenses && selectedExpenseType.expenses.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Payment Type</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Center</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedExpenseType.expenses.map((expense, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50">
                                                            <td className="px-4 py-2 text-sm">{moment(expense.date).format('DD/MM/YYYY')}</td>
                                                            <td className="px-4 py-2 text-sm text-right font-bold text-red-700">{formatCurrency(expense.amount)}</td>
                                                            <td className="px-4 py-2 text-sm capitalize">{expense.payment_type_label}</td>
                                                            <td className="px-4 py-2 text-sm">{expense.center?.name || '-'}</td>
                                                            <td className="px-4 py-2 text-sm text-gray-500">{expense.description || expense.notes || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <IconReceipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 text-lg font-medium mb-2">No Expense Details</p>
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