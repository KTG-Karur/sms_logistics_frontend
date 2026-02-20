import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const ProfitLossReportPDF = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [reportData, setReportData] = useState(null);
    const [generatedDate, setGeneratedDate] = useState('');
    const [processedData, setProcessedData] = useState(null);

    useEffect(() => {
        if (location.state) {
            const { reportData, generatedDate, date, centerName, viewMode } = location.state;
            
            setReportData(reportData);
            setGeneratedDate(generatedDate || moment().format('DD/MM/YYYY HH:mm'));
            
            // Process the data for PDF display
            if (reportData) {
                const processed = processReportData(reportData, date, centerName);
                setProcessedData(processed);
            }
        }
    }, [location.state]);

    const processReportData = (data, date, centerName) => {
        // Use the date passed from the report component (which is the selected date)
        // Only fall back to current date if no date is provided
        let reportDate = date;
        let dayOfWeek = '';
        
        if (reportDate && moment(reportDate).isValid()) {
            // Use the provided date
            dayOfWeek = moment(reportDate).format('dddd');
        } else {
            // Try to get date from report data if available
            if (data?.date_range?.start_date && moment(data.date_range.start_date).isValid()) {
                reportDate = data.date_range.start_date;
                dayOfWeek = moment(reportDate).format('dddd');
            } else {
                // Last resort - use current date but this should not happen
                console.warn('No valid date found, using current date');
                reportDate = moment().format('YYYY-MM-DD');
                dayOfWeek = moment().format('dddd');
            }
        }
        
        // Extract payments and expenses with safe navigation
        const payments = data?.transactions?.payments || [];
        const expenses = data?.transactions?.expenses || [];
        
        // Calculate totals with safe parsing
        const totalRevenue = parseFloat(data?.summary?.total_payment_amount || 0);
        const totalExpenses = parseFloat(data?.summary?.total_expense_amount || 0);
        const totalProfit = parseFloat(data?.summary?.total_profit_loss || 0);
        const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;
        const isProfitDay = totalProfit >= 0;
        
        // Group expenses by type
        const groupedExpenses = {
            vehicle: {
                total: 0,
                items: []
            },
            staff: {
                total: 0,
                items: []
            },
            other: {
                total: 0,
                items: []
            }
        };
        
        expenses.forEach(expense => {
            const expenseItem = {
                name: expense?.type || 'Expense',
                description: expense?.description || '',
                amount: parseFloat(expense?.amount || 0),
                type: expense?.type || 'Other',
                subCategory: expense?.type || 'General',
                status: 'paid',
                balance: 0
            };
            
            // Categorize expenses
            const expenseType = expense?.type || '';
            if (['Fuel', 'Diesel', 'Petrol', 'Maintenance', 'Repair'].includes(expenseType)) {
                groupedExpenses.vehicle.items.push(expenseItem);
                groupedExpenses.vehicle.total += expenseItem.amount;
            } else if (['Salary', 'Wage', 'Staff', 'Driver'].includes(expenseType)) {
                groupedExpenses.staff.items.push(expenseItem);
                groupedExpenses.staff.total += expenseItem.amount;
            } else {
                groupedExpenses.other.items.push(expenseItem);
                groupedExpenses.other.total += expenseItem.amount;
            }
        });
        
        // Process payments
        const paymentList = payments.map((payment, index) => ({
            packageId: payment?.payment_number || `PAY-${index + 1}`,
            packageType: payment?.type || 'Standard',
            weight: 'N/A',
            dimensions: 'N/A',
            fromLocation: payment?.booking_center?.name || 'Unknown',
            toLocation: payment?.booking_center?.name || 'Unknown',
            vehicleType: 'Standard',
            driverName: 'N/A',
            staffName: payment?.customer?.name || 'N/A',
            packageValue: parseFloat(payment?.amount || 0),
            status: payment?.type || 'completed',
            date: payment?.date || reportDate
        }));
        
        return {
            date: reportDate,
            displayDate: moment(reportDate).format('DD MMMM YYYY'),
            shortDate: moment(reportDate).format('DD/MM/YYYY'),
            dayOfWeek: dayOfWeek,
            centerName: centerName || data?.center?.name || 'All Centers',
            totalRevenue: totalRevenue,
            totalExpenses: totalExpenses,
            totalProfit: totalProfit,
            profitMargin: profitMargin,
            isProfitDay: isProfitDay,
            totalPackages: paymentList.length,
            packages: paymentList,
            expenses: expenses,
            groupedExpenses: groupedExpenses,
            profitablePackages: isProfitDay ? paymentList.length : 0,
            lossPackages: !isProfitDay ? paymentList.length : 0,
            totalPackagesCount: paymentList.length
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

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        switch(status) {
            case 'paid': return '#059669';
            case 'partial': return '#f59e0b';
            case 'pending': return '#dc2626';
            default: return '#6b7280';
        }
    };

    if (!processedData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading report...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area - PORTRAIT LAYOUT */}
            <div
                id="profit-loss-report-to-print"
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
                    <tr>
                        <td width="40%" style={{ borderRight: '2px solid #000', padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>DAILY PROFIT & LOSS REPORT</div>
                            <div style={{ fontSize: '8pt', marginTop: '1mm' }}>Detailed Financial Analysis</div>
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
                            </div>
                        </td>
                    </tr>
                </table>

                {/* EXECUTIVE SUMMARY */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                    <tr>
                        <td colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            🏆 EXECUTIVE SUMMARY
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            Total Revenue:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#eff6ff', fontWeight: 'bold', textAlign: 'center', color: '#1e40af', fontSize: '10pt' }}>
                            {formatCurrency(processedData.totalRevenue)}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef2f2' }}>
                            Total Expenses:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fef2f2', fontWeight: 'bold', textAlign: 'center', color: '#dc2626', fontSize: '10pt' }}>
                            {formatCurrency(processedData.totalExpenses)}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: processedData.isProfitDay ? '#d1fae5' : '#fee2e2' }}>
                            Net Profit/Loss:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: processedData.isProfitDay ? '#d1fae5' : '#fee2e2', fontWeight: 'bold', textAlign: 'center', fontSize: '12pt', color: processedData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {formatCurrency(processedData.totalProfit)}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: processedData.isProfitDay ? '#bbf7d0' : '#fecaca' }}>
                            Profit Margin:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: processedData.isProfitDay ? '#bbf7d0' : '#fecaca', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', color: processedData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {processedData.profitMargin >= 0 ? '+' : ''}{processedData.profitMargin}%
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef3c7' }}>
                            Total Payments:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fef3c7', fontWeight: 'bold', textAlign: 'center' }}>
                            {processedData.totalPackages}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#e0e7ff' }}>
                            Day Status:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#e0e7ff', fontWeight: 'bold', textAlign: 'center', color: processedData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {processedData.isProfitDay ? 'PROFIT DAY' : 'LOSS DAY'}
                        </td>
                    </tr>
                </table>

                {/* PAYMENT DETAILS */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                    <tr>
                        <td colSpan="8" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            💰 PAYMENT DETAILS
                        </td>
                    </tr>
                    
                    {/* Table Header */}
                    <tr>
                        <th width="5%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            #
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Payment No
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Date
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Customer
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Mode
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Type
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Amount (₹)
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Booking Center
                        </th>
                    </tr>

                    {/* Table Data */}
                    {processedData.packages.map((payment, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', verticalAlign: 'top' }}>
                                {index + 1}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontWeight: 'bold' }}>
                                {payment.packageId}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt' }}>
                                {payment.date ? moment(payment.date).format('DD/MM/YYYY') : moment(processedData.date).format('DD/MM/YYYY')}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt' }}>
                                {payment.staffName}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt', textAlign: 'center' }}>
                                Cash
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt', textAlign: 'center' }}>
                                <span style={{
                                    padding: '1px 3px',
                                    borderRadius: '2px',
                                    backgroundColor: payment.packageType === 'full' ? '#05966920' : '#f59e0b20',
                                    color: payment.packageType === 'full' ? '#059669' : '#f59e0b',
                                }}>
                                    {payment.packageType}
                                </span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                                {formatRupees(payment.packageValue)}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt', textAlign: 'center' }}>
                                {payment.fromLocation}
                            </td>
                        </tr>
                    ))}

                    {/* Summary Row */}
                    <tr style={{ fontWeight: 'bold' }}>
                        <td colSpan="6" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', backgroundColor: '#f9fafb' }}>
                            TOTAL PAYMENTS:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', backgroundColor: '#f9fafb', color: '#059669', fontSize: '10pt' }}>
                            {formatRupees(processedData.totalRevenue)}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                            {processedData.packages.length}
                        </td>
                    </tr>
                </table>

                {/* DETAILED EXPENSE BREAKDOWN */}
                <div style={{ marginBottom: '6mm' }}>
                    <div style={{ 
                        fontSize: '11pt', 
                        fontWeight: 'bold', 
                        marginBottom: '3mm',
                        padding: '2mm',
                        textAlign: 'center',
                        border: '2px solid #000',
                        backgroundColor: '#f0f0f0'
                    }}>
                        💰 DETAILED EXPENSE BREAKDOWN
                    </div>

                    {/* Vehicle Expenses */}
                    {processedData.groupedExpenses.vehicle.items.length > 0 && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ 
                                fontSize: '10pt', 
                                fontWeight: 'bold', 
                                padding: '2mm',
                                backgroundColor: '#dbeafe',
                                border: '1px solid #93c5fd',
                                marginBottom: '2mm'
                            }}>
                                🚚 VEHICLE EXPENSES: {formatRupees(processedData.groupedExpenses.vehicle.total)}
                            </div>
                            
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <tr>
                                    <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>#</th>
                                    <th width="35%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Expense Type</th>
                                    <th width="35%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Description</th>
                                    <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Amount (₹)</th>
                                </tr>
                                
                                {processedData.groupedExpenses.vehicle.items.map((expense, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description || 'No description'}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                            {formatRupees(expense.amount)}
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#dbeafe' }}>
                                    <td colSpan="3" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>
                                        TOTAL VEHICLE EXPENSES:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(processedData.groupedExpenses.vehicle.total)}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    )}

                    {/* Staff Expenses */}
                    {processedData.groupedExpenses.staff.items.length > 0 && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ 
                                fontSize: '10pt', 
                                fontWeight: 'bold', 
                                padding: '2mm',
                                backgroundColor: '#d1fae5',
                                border: '1px solid #86efac',
                                marginBottom: '2mm'
                            }}>
                                👥 STAFF EXPENSES: {formatRupees(processedData.groupedExpenses.staff.total)}
                            </div>
                            
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <tr>
                                    <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>#</th>
                                    <th width="35%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Expense Type</th>
                                    <th width="35%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Description</th>
                                    <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Amount (₹)</th>
                                </tr>
                                
                                {processedData.groupedExpenses.staff.items.map((expense, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description || 'No description'}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                            {formatRupees(expense.amount)}
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                                    <td colSpan="3" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>
                                        TOTAL STAFF EXPENSES:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(processedData.groupedExpenses.staff.total)}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    )}

                    {/* Other Expenses */}
                    {processedData.groupedExpenses.other.items.length > 0 && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ 
                                fontSize: '10pt', 
                                fontWeight: 'bold', 
                                padding: '2mm',
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fcd34d',
                                marginBottom: '2mm'
                            }}>
                                📦 OTHER EXPENSES: {formatRupees(processedData.groupedExpenses.other.total)}
                            </div>
                            
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <tr>
                                    <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>#</th>
                                    <th width="35%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Expense Type</th>
                                    <th width="35%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Description</th>
                                    <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Amount (₹)</th>
                                </tr>
                                
                                {processedData.groupedExpenses.other.items.map((expense, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description || 'No description'}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                            {formatRupees(expense.amount)}
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                    <td colSpan="3" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>
                                        TOTAL OTHER EXPENSES:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(processedData.groupedExpenses.other.total)}
                                    </td>
                                </tr>
                            </table>
                        </div>
                    )}
                    
                    {/* No Expenses Message */}
                    {processedData.groupedExpenses.vehicle.items.length === 0 && 
                     processedData.groupedExpenses.staff.items.length === 0 && 
                     processedData.groupedExpenses.other.items.length === 0 && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '10mm',
                            backgroundColor: '#f9fafb',
                            border: '1px solid #000'
                        }}>
                            No expenses recorded for this day
                        </div>
                    )}
                </div>

                {/* FINAL PROFIT & LOSS CALCULATION */}
                <table width="100%" cellPadding="3" cellSpacing="0" style={{ border: '3px double #000', borderCollapse: 'collapse', marginBottom: '6mm', backgroundColor: processedData.isProfitDay ? '#f0fdf4' : '#fef2f2' }}>
                    <tr>
                        <td colSpan="3" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '12pt', backgroundColor: processedData.isProfitDay ? '#bbf7d0' : '#fecaca' }}>
                            🏁 FINAL PROFIT & LOSS STATEMENT
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="60%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>
                            TOTAL REVENUE FROM PAYMENTS:
                        </td>
                        <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                            (+) 
                        </td>
                        <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: '#059669', fontSize: '10pt' }}>
                            {formatRupees(processedData.totalRevenue)}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>
                            TOTAL EXPENSES:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                            (-)
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626', fontSize: '10pt' }}>
                            {formatRupees(processedData.totalExpenses)}
                        </td>
                    </tr>

                    <tr style={{ borderTop: '2px solid #000' }}>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', fontSize: '11pt' }}>
                            NET PROFIT / LOSS:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                            {processedData.isProfitDay ? '=' : '='}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', textAlign: 'right', fontWeight: 'bold', fontSize: '14pt', color: processedData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {formatRupees(processedData.totalProfit)}
                        </td>
                    </tr>

                    <tr style={{ backgroundColor: processedData.isProfitDay ? '#bbf7d0' : '#fecaca' }}>
                        <td colSpan="3" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt' }}>
                            PROFIT MARGIN: {processedData.profitMargin >= 0 ? '+' : ''}{processedData.profitMargin}% | 
                            DAY STATUS: {processedData.isProfitDay ? 'PROFIT DAY ✅' : 'LOSS DAY ❌'} | 
                            PAYMENTS: {processedData.packages.length}
                        </td>
                    </tr>
                </table>

                {/* PAYMENT SUMMARY */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', fontSize: '9pt' }}>
                    <tr>
                        <td colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            📊 PAYMENT SUMMARY
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Total Payments:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                            {processedData.totalPackages}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Average per Payment:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>
                            {processedData.totalPackages > 0 ? formatRupees(processedData.totalRevenue / processedData.totalPackages) : formatRupees(0)}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Total Expenses:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                            {formatRupees(processedData.totalExpenses)}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Expense Items:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                            {processedData.expenses.length}
                        </td>
                    </tr>
                </table>

                {/* REPORT FOOTER */}
                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '6mm',
                    paddingTop: '3mm',
                    borderTop: '1px solid #000',
                    fontSize: '8pt',
                    color: '#666'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '1mm' }}>
                        DAILY PROFIT & LOSS REPORT - FINANCIAL DEPARTMENT
                    </div>
                    <div>
                        Report ID: PL-{moment(processedData.date).format('DDMMYYYY')} | 
                        Generated: {generatedDate} | 
                        Payments: {processedData.totalPackages} | 
                        Expenses: {processedData.expenses.length} Items
                    </div>
                    <div style={{ marginTop: '2mm', fontStyle: 'italic', fontSize: '7.5pt' }}>
                        "This report shows daily revenue from payments and all expenses including vehicle charges, staff expenses, and other operational costs."
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

                    #profit-loss-report-to-print,
                    #profit-loss-report-to-print * {
                        visibility: visible;
                    }

                    #profit-loss-report-to-print {
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

                    .print\\:hidden,
                    header,
                    nav,
                    .navbar,
                    .sidebar,
                    .action-buttons {
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

export default ProfitLossReportPDF;