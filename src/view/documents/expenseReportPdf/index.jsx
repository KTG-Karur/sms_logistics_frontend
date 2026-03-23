import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const ExpenseReportPDF = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [generatedDate, setGeneratedDate] = useState('');
    const [processedData, setProcessedData] = useState(null);

    useEffect(() => {
        if (location.state) {
            const { reportData, generatedDate, date, centerName, paymentTypeFilter } = location.state;
            setReportData(reportData);
            setGeneratedDate(generatedDate || moment().format('DD/MM/YYYY HH:mm'));
            
            // Process the data for PDF display
            if (reportData) {
                const processed = processReportData(reportData, date, centerName, paymentTypeFilter);
                setProcessedData(processed);
            }
        }
    }, [location.state]);

    const processReportData = (data, date, centerName, paymentTypeFilter) => {
        // Extract expenses from the data
        let expenses = [];
        if (data && data.data && Array.isArray(data.data)) {
            expenses = data.data;
        } else if (Array.isArray(data)) {
            expenses = data;
        } else if (data && data.data && data.data.data && Array.isArray(data.data.data)) {
            expenses = data.data.data;
        }

        // Get report date
        let reportDate = date;
        let dayOfWeek = '';
        if (reportDate && moment(reportDate).isValid()) {
            dayOfWeek = moment(reportDate).format('dddd');
        } else if (expenses.length > 0 && expenses[0].expense_date) {
            reportDate = expenses[0].expense_date;
            dayOfWeek = moment(reportDate).format('dddd');
        } else {
            reportDate = moment().format('YYYY-MM-DD');
            dayOfWeek = moment().format('dddd');
        }

        // Calculate totals
        const totalExpense = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        const totalPaid = expenses.reduce((sum, exp) => sum + (parseFloat(exp.paid_amount) || 0), 0);
        const totalUnpaid = totalExpense - totalPaid;
        const paymentRate = totalExpense > 0 ? (totalPaid / totalExpense) * 100 : 0;
        
        // Calculate counts
        const totalExpenseCount = expenses.length;
        const totalPaidCount = expenses.filter(e => (e.paid_amount || 0) >= (e.amount || 0)).length;
        const totalPartialCount = expenses.filter(e => {
            const paid = e.paid_amount || 0;
            const amount = e.amount || 0;
            return paid > 0 && paid < amount;
        }).length;
        const totalUnpaidCount = expenses.filter(e => (e.paid_amount || 0) === 0).length;
        
        const avgExpensePerItem = totalExpenseCount > 0 ? totalExpense / totalExpenseCount : 0;

        // Group expenses by category
        const groupedExpenses = {
            vehicle: { total: 0, items: [] },
            staff: { total: 0, items: [] },
            other: { total: 0, items: [] }
        };

        expenses.forEach(expense => {
            const expenseType = expense.expenseType?.expence_type_name || expense.expense_type_name || 'Other';
            const amount = parseFloat(expense.amount) || 0;
            const paidAmount = parseFloat(expense.paid_amount) || 0;
            const balance = amount - paidAmount;
            const isPaid = paidAmount >= amount;
            const isPartial = paidAmount > 0 && paidAmount < amount;
            
            const expenseItem = {
                name: expenseType,
                description: expense.description || '',
                amount: amount,
                paidAmount: paidAmount,
                balance: balance,
                status: isPaid ? 'paid' : (isPartial ? 'partial' : 'unpaid'),
                date: expense.expense_date,
                officeCenter: expense.officeCenter?.office_center_name || expense.office_center_name || 'N/A',
                paymentType: expense.payments?.[0]?.payment_type || 'Not Specified'
            };

            // Categorize expenses
            const vehicleTypes = ['Fuel', 'Diesel', 'Petrol', 'Maintenance', 'Repair', 'Service', 'Disel'];
            const staffTypes = ['Salary', 'Wage', 'Staff', 'Driver', 'Overtime', 'Bonus', 'Loadman', 'Mechanic'];
            
            if (vehicleTypes.some(type => expenseType.toLowerCase().includes(type.toLowerCase()))) {
                groupedExpenses.vehicle.items.push(expenseItem);
                groupedExpenses.vehicle.total += amount;
            } else if (staffTypes.some(type => expenseType.toLowerCase().includes(type.toLowerCase()))) {
                groupedExpenses.staff.items.push(expenseItem);
                groupedExpenses.staff.total += amount;
            } else {
                groupedExpenses.other.items.push(expenseItem);
                groupedExpenses.other.total += amount;
            }
        });

        // Group by payment type
        const paymentTypeMap = new Map();
        expenses.forEach(expense => {
            const paymentType = expense.payments?.[0]?.payment_type || 'Not Specified';
            const amount = parseFloat(expense.amount) || 0;
            const paidAmount = parseFloat(expense.paid_amount) || 0;
            
            if (!paymentTypeMap.has(paymentType)) {
                paymentTypeMap.set(paymentType, {
                    type: paymentType,
                    total: 0,
                    paid: 0,
                    count: 0
                });
            }
            const ptData = paymentTypeMap.get(paymentType);
            ptData.total += amount;
            ptData.paid += paidAmount;
            ptData.count++;
        });
        
        const paymentTypeData = Array.from(paymentTypeMap.values());

        // Get daily breakdown
        const dailyMap = new Map();
        expenses.forEach(expense => {
            const expDate = expense.expense_date;
            const amount = parseFloat(expense.amount) || 0;
            const paidAmount = parseFloat(expense.paid_amount) || 0;
            
            if (!dailyMap.has(expDate)) {
                dailyMap.set(expDate, {
                    date: expDate,
                    totalExpense: 0,
                    totalPaid: 0,
                    count: 0
                });
            }
            const dayData = dailyMap.get(expDate);
            dayData.totalExpense += amount;
            dayData.totalPaid += paidAmount;
            dayData.count++;
        });
        
        const dailyData = Array.from(dailyMap.values()).sort((a, b) => moment(a.date).diff(moment(b.date)));

        return {
            date: reportDate,
            displayDate: moment(reportDate).format('DD MMMM YYYY'),
            shortDate: moment(reportDate).format('DD/MM/YYYY'),
            dayOfWeek: dayOfWeek,
            centerName: centerName || 'All Centers',
            paymentTypeFilter: paymentTypeFilter || 'All',
            totalExpense: totalExpense,
            totalPaid: totalPaid,
            totalUnpaid: totalUnpaid,
            paymentRate: paymentRate.toFixed(1),
            totalExpenseCount: totalExpenseCount,
            totalPaidCount: totalPaidCount,
            totalPartialCount: totalPartialCount,
            totalUnpaidCount: totalUnpaidCount,
            avgExpensePerItem: avgExpensePerItem,
            expenses: expenses,
            groupedExpenses: groupedExpenses,
            paymentTypeData: paymentTypeData,
            dailyData: dailyData
        };
    };

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatCurrency = (amount) => {
        const numAmount = parseFloat(amount || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(numAmount);
    };

    const formatRupees = (amount) => {
        const numAmount = parseFloat(amount || 0);
        return `₹${numAmount.toLocaleString('en-IN')}`;
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'paid':
                return { text: 'Paid', color: '#059669', bg: '#d1fae5' };
            case 'partial':
                return { text: 'Partial', color: '#f59e0b', bg: '#fef3c7' };
            default:
                return { text: 'Unpaid', color: '#dc2626', bg: '#fee2e2' };
        }
    };

    const getPaymentTypeDisplay = (type) => {
        const typeMap = {
            cash: 'Cash',
            gpay: 'GPay',
            bank_transfer: 'Bank Transfer',
            cheque: 'Cheque',
            credit_card: 'Credit Card',
            other: 'Other'
        };
        return typeMap[type?.toLowerCase()] || type || 'Not Specified';
    };

    if (!processedData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading expense report...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area */}
            <div 
                id="expense-report-to-print" 
                className="bg-white mx-auto"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    height: 'auto',
                    padding: '15mm',
                    fontFamily: '"Times New Roman", serif',
                    fontSize: '9pt',
                    lineHeight: '1.2'
                }}
            >
                {/* HEADER SECTION */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '8mm' }}>
                    <tbody>
                        <tr>
                            <td width="40%" style={{ borderRight: '2px solid #000', padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                                <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>EXPENSE REPORT</div>
                                <div style={{ fontSize: '8pt', marginTop: '1mm' }}>Detailed Expense Analysis</div>
                            </td>
                            <td width="30%" style={{ borderRight: '2px solid #000', padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                                <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                                    {processedData.displayDate}
                                </div>
                                <div style={{ fontSize: '9pt' }}>{processedData.dayOfWeek}</div>
                            </td>
                            <td width="30%" style={{ padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                                <div style={{ fontSize: '8pt', lineHeight: '1.3' }}>
                                    <div>Generated: {generatedDate}</div>
                                    <div>Center: {processedData.centerName}</div>
                                    {processedData.paymentTypeFilter !== 'All' && (
                                        <div>Payment Type: {processedData.paymentTypeFilter.toUpperCase()}</div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* EXECUTIVE SUMMARY */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                    <thead>
                        <tr>
                            <td colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                📊 EXECUTIVE SUMMARY
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td width="25%" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef2f2' }}>
                                Total Expenses:
                            </td>
                            <td width="25%" style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fef2f2', fontWeight: 'bold', textAlign: 'center', color: '#dc2626', fontSize: '10pt' }}>
                                {formatCurrency(processedData.totalExpense)}
                            </td>
                            <td width="25%" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#d1fae5' }}>
                                Total Paid:
                            </td>
                            <td width="25%" style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#d1fae5', fontWeight: 'bold', textAlign: 'center', color: '#059669', fontSize: '10pt' }}>
                                {formatCurrency(processedData.totalPaid)}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fee2e2' }}>
                                Total Unpaid:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fee2e2', fontWeight: 'bold', textAlign: 'center', color: '#dc2626', fontSize: '10pt' }}>
                                {formatCurrency(processedData.totalUnpaid)}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef3c7' }}>
                                Payment Rate:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fef3c7', fontWeight: 'bold', textAlign: 'center', fontSize: '10pt' }}>
                                {processedData.paymentRate}%
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#e0e7ff' }}>
                                Total Items:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#e0e7ff', fontWeight: 'bold', textAlign: 'center' }}>
                                {processedData.totalExpenseCount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#d9f99d' }}>
                                Avg per Item:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#d9f99d', fontWeight: 'bold', textAlign: 'center' }}>
                                {formatCurrency(processedData.avgExpensePerItem)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* PAYMENT TYPE BREAKDOWN */}
                <div style={{ marginBottom: '6mm' }}>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '3mm', padding: '2mm', textAlign: 'center', border: '2px solid #000', backgroundColor: '#f0f0f0' }}>
                        💳 PAYMENT TYPE BREAKDOWN
                    </div>
                    <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                        <thead>
                            <tr>
                                <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Payment Type</th>
                                <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Count</th>
                                <th width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Total Amount</th>
                                <th width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Paid Amount</th>
                                <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Payment Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.paymentTypeData.map((pt, index) => {
                                const rate = pt.total > 0 ? (pt.paid / pt.total) * 100 : 0;
                                return (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>{getPaymentTypeDisplay(pt.type)}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>{pt.count}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>{formatRupees(pt.total)}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>{formatRupees(pt.paid)}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: rate >= 80 ? '#059669' : rate >= 50 ? '#f59e0b' : '#dc2626' }}>{rate.toFixed(1)}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* DAILY BREAKDOWN (if multiple days) */}
                {processedData.dailyData.length > 1 && (
                    <div style={{ marginBottom: '6mm' }}>
                        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '3mm', padding: '2mm', textAlign: 'center', border: '2px solid #000', backgroundColor: '#f0f0f0' }}>
                            📅 DAILY EXPENSE BREAKDOWN
                        </div>
                        <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                            <thead>
                                <tr>
                                    <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Date</th>
                                    <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Expense Count</th>
                                    <th width="30%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Total Expense</th>
                                    <th width="30%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Total Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.dailyData.map((day, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '2mm' }}>{moment(day.date).format('DD/MM/YYYY')}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>{day.count}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626' }}>{formatRupees(day.totalExpense)}</td>
                                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669' }}>{formatRupees(day.totalPaid)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* DETAILED EXPENSE BREAKDOWN */}
                <div style={{ marginBottom: '6mm' }}>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '3mm', padding: '2mm', textAlign: 'center', border: '2px solid #000', backgroundColor: '#f0f0f0' }}>
                        💰 DETAILED EXPENSE BREAKDOWN
                    </div>

                    {/* Vehicle Expenses */}
                    {processedData.groupedExpenses.vehicle.items.length > 0 && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', padding: '2mm', backgroundColor: '#dbeafe', border: '1px solid #93c5fd', marginBottom: '2mm' }}>
                                🚚 VEHICLE EXPENSES: {formatRupees(processedData.groupedExpenses.vehicle.total)}
                            </div>
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <thead>
                                    <tr>
                                        <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>#</th>
                                        <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Expense Type</th>
                                        <th width="30%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Description</th>
                                        <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Amount</th>
                                        <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Paid</th>
                                        <th width="10%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.groupedExpenses.vehicle.items.map((expense, index) => {
                                        const status = getStatusBadge(expense.status);
                                        return (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description || '-'}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{formatRupees(expense.amount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>{formatRupees(expense.paidAmount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                                    <span style={{ backgroundColor: status.bg, color: status.color, padding: '1px 4px', borderRadius: '2px', fontSize: '7pt' }}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#dbeafe' }}>
                                        <td colSpan="3" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>TOTAL VEHICLE EXPENSES:</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>{formatRupees(processedData.groupedExpenses.vehicle.total)}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Staff Expenses */}
                    {processedData.groupedExpenses.staff.items.length > 0 && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', padding: '2mm', backgroundColor: '#d1fae5', border: '1px solid #86efac', marginBottom: '2mm' }}>
                                👥 STAFF EXPENSES: {formatRupees(processedData.groupedExpenses.staff.total)}
                            </div>
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <thead>
                                    <tr>
                                        <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>#</th>
                                        <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Expense Type</th>
                                        <th width="30%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Description</th>
                                        <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Amount</th>
                                        <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Paid</th>
                                        <th width="10%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.groupedExpenses.staff.items.map((expense, index) => {
                                        const status = getStatusBadge(expense.status);
                                        return (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description || '-'}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{formatRupees(expense.amount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>{formatRupees(expense.paidAmount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                                    <span style={{ backgroundColor: status.bg, color: status.color, padding: '1px 4px', borderRadius: '2px', fontSize: '7pt' }}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                                        <td colSpan="3" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>TOTAL STAFF EXPENSES:</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>{formatRupees(processedData.groupedExpenses.staff.total)}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Other Expenses */}
                    {processedData.groupedExpenses.other.items.length > 0 && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', padding: '2mm', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', marginBottom: '2mm' }}>
                                📦 OTHER EXPENSES: {formatRupees(processedData.groupedExpenses.other.total)}
                            </div>
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <thead>
                                    <tr>
                                        <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>#</th>
                                        <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Expense Type</th>
                                        <th width="30%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Description</th>
                                        <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Amount</th>
                                        <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Paid</th>
                                        <th width="10%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.groupedExpenses.other.items.map((expense, index) => {
                                        const status = getStatusBadge(expense.status);
                                        return (
                                            <tr key={index}>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description || '-'}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{formatRupees(expense.amount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>{formatRupees(expense.paidAmount)}</td>
                                                <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                                    <span style={{ backgroundColor: status.bg, color: status.color, padding: '1px 4px', borderRadius: '2px', fontSize: '7pt' }}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{ fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                        <td colSpan="3" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>TOTAL OTHER EXPENSES:</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>{formatRupees(processedData.groupedExpenses.other.total)}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {processedData.groupedExpenses.vehicle.items.length === 0 && 
                     processedData.groupedExpenses.staff.items.length === 0 && 
                     processedData.groupedExpenses.other.items.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '10mm', backgroundColor: '#f9fafb', border: '1px solid #000' }}>
                            No expenses recorded for this period
                        </div>
                    )}
                </div>

                {/* COMPLETE EXPENSE DETAILS TABLE */}
                <div style={{ marginBottom: '6mm' }}>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '3mm', padding: '2mm', textAlign: 'center', border: '2px solid #000', backgroundColor: '#f0f0f0' }}>
                        📋 COMPLETE EXPENSE DETAILS
                    </div>
                    <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '7.5pt' }}>
                        <thead>
                            <tr>
                                <th width="5%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>#</th>
                                <th width="10%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Date</th>
                                <th width="12%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Center</th>
                                <th width="18%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Expense Type</th>
                                <th width="20%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Description</th>
                                <th width="10%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Amount</th>
                                <th width="10%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Paid</th>
                                <th width="10%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Balance</th>
                                <th width="5%" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {processedData.expenses.map((expense, index) => {
                                const amount = parseFloat(expense.amount) || 0;
                                const paid = parseFloat(expense.paid_amount) || 0;
                                const balance = amount - paid;
                                const status = paid >= amount ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');
                                const statusColor = paid >= amount ? '#059669' : (paid > 0 ? '#f59e0b' : '#dc2626');
                                
                                return (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm' }}>{moment(expense.expense_date).format('DD/MM/YYYY')}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', fontSize: '7pt' }}>{expense.officeCenter?.office_center_name || '-'}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', fontWeight: 'bold' }}>{expense.expenseType?.expence_type_name || '-'}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', fontSize: '7pt' }}>{expense.description || '-'}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>{formatRupees(amount)}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>{formatRupees(paid)}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', color: balance > 0 ? '#dc2626' : '#059669', fontWeight: 'bold' }}>{formatRupees(balance)}</td>
                                        <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'center' }}>
                                            <span style={{ backgroundColor: `${statusColor}20`, color: statusColor, padding: '1px 4px', borderRadius: '2px', fontSize: '6.5pt', fontWeight: 'bold' }}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr style={{ fontWeight: 'bold', backgroundColor: '#f3f4f6' }}>
                                <td colSpan="5" style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right' }}>TOTAL:</td>
                                <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', color: '#dc2626' }}>{formatRupees(processedData.totalExpense)}</td>
                                <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', color: '#059669' }}>{formatRupees(processedData.totalPaid)}</td>
                                <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'right', color: '#dc2626' }}>{formatRupees(processedData.totalUnpaid)}</td>
                                <td style={{ border: '1px solid #000', padding: '1.5mm', textAlign: 'center' }}>{processedData.paymentRate}%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* FINAL SUMMARY */}
                <table width="100%" cellPadding="3" cellSpacing="0" style={{ border: '3px double #000', borderCollapse: 'collapse', marginBottom: '6mm', backgroundColor: '#f9fafb' }}>
                    <thead>
                        <tr>
                            <td colSpan="3" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '12pt', backgroundColor: '#e5e7eb' }}>
                                📊 FINAL EXPENSE SUMMARY
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td width="33%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>Total Expenses:</td>
                            <td width="33%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>=</td>
                            <td width="34%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', fontSize: '11pt' }}>{formatRupees(processedData.totalExpense)}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>Total Paid:</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>=</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: '#059669', fontSize: '11pt' }}>{formatRupees(processedData.totalPaid)}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>Total Unpaid:</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>=</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', fontSize: '11pt' }}>{formatRupees(processedData.totalUnpaid)}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#fef3c7' }}>
                            <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>Payment Rate:</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>=</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', fontSize: '12pt', color: '#f59e0b' }}>{processedData.paymentRate}%</td>
                        </tr>
                    </tbody>
                </table>

                {/* STATISTICS */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', fontSize: '9pt', marginBottom: '6mm' }}>
                    <thead>
                        <tr>
                            <td colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                📈 EXPENSE STATISTICS
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Total Items:</td>
                            <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>{processedData.totalExpenseCount}</td>
                            <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Paid Items:</td>
                            <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>{processedData.totalPaidCount}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Partial Items:</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#f59e0b' }}>{processedData.totalPartialCount}</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Unpaid Items:</td>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>{processedData.totalUnpaidCount}</td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Average per Item:</td>
                            <td colSpan="3" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#3b82f6' }}>{formatRupees(processedData.avgExpensePerItem)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* REPORT FOOTER */}
                <div style={{ textAlign: 'center', marginTop: '6mm', paddingTop: '3mm', borderTop: '1px solid #000', fontSize: '8pt', color: '#666' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '1mm' }}>
                        EXPENSE REPORT - FINANCIAL DEPARTMENT
                    </div>
                    <div>
                        Report ID: EXP-{moment(processedData.date).format('DDMMYYYY')} | Generated: {generatedDate} | 
                        Center: {processedData.centerName} | Items: {processedData.totalExpenseCount}
                    </div>
                    <div style={{ marginTop: '2mm', fontStyle: 'italic', fontSize: '7.5pt' }}>
                        "This report shows all expenses including vehicle charges, staff expenses, and other operational costs with payment status."
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4 print:hidden">
                <button 
                    onClick={handleBack} 
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center"
                >
                    <IconBack className="w-4 h-4 mr-2" />
                    Back to Report
                </button>
                <button 
                    onClick={handlePrint} 
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                    <IconPrinter className="w-4 h-4 mr-2" />
                    Print Report
                </button>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 210mm !important;
                        height: auto !important;
                    }
                    body * {
                        visibility: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    #expense-report-to-print, #expense-report-to-print * {
                        visibility: visible;
                    }
                    #expense-report-to-print {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 15mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-inside: avoid !important;
                    }
                    .print\\:hidden, header, nav, .navbar, .sidebar, .action-buttons {
                        display: none !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    @media print and (color) {
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                        page-break-inside: avoid !important;
                    }
                    th, td {
                        padding: 2mm !important;
                        border: 1px solid #000 !important;
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                        vertical-align: top !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExpenseReportPDF;