import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const ProfitLossReportPDF = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [dateData, setDateData] = useState(null);
    const [generatedDate, setGeneratedDate] = useState('');
    const [groupedExpenses, setGroupedExpenses] = useState({});

    useEffect(() => {
        if (location.state) {
            const { dateData, generatedDate } = location.state;
            
            setDateData(dateData);
            setGeneratedDate(generatedDate);
            
            // Group expenses by category and type
            if (dateData && dateData.expenses) {
                const grouped = dateData.expenses.reduce((acc, expense) => {
                    const category = expense.category;
                    const type = expense.type || 'other';
                    
                    if (!acc[category]) {
                        acc[category] = {
                            total: 0,
                            items: [],
                            types: {}
                        };
                    }
                    
                    if (!acc[category].types[type]) {
                        acc[category].types[type] = {
                            total: 0,
                            items: []
                        };
                    }
                    
                    acc[category].total += expense.amount;
                    acc[category].items.push(expense);
                    acc[category].types[type].total += expense.amount;
                    acc[category].types[type].items.push(expense);
                    
                    return acc;
                }, {});
                
                setGroupedExpenses(grouped);
            }
        }
    }, [location.state]);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatRupees = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    // Get payment status color
    const getPaymentStatusColor = (status) => {
        switch(status) {
            case 'paid': return '#059669';
            case 'partially_paid': return '#f59e0b';
            case 'unpaid': return '#dc2626';
            default: return '#6b7280';
        }
    };

    if (!dateData) {
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
                    width: '210mm', // A4 portrait width
                    minHeight: '297mm', // A4 portrait height
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
                                {moment(dateData.date).format('DD MMMM YYYY')}
                            </div>
                            <div style={{ fontSize: '9pt' }}>{dateData.dayOfWeek}</div>
                        </td>
                        <td width="30%" style={{ padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '8pt', lineHeight: '1.3' }}>
                                <div>Generated: {generatedDate || moment().format('DD/MM/YYYY HH:mm')}</div>
                                <div>Page: 1 of 1</div>
                            </div>
                        </td>
                    </tr>
                </table>

                {/* EXECUTIVE SUMMARY */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                    <tr>
                        <td colSpan="6" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            🏆 EXECUTIVE SUMMARY
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            Total Revenue:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#eff6ff', fontWeight: 'bold', textAlign: 'center', color: '#1e40af', fontSize: '10pt' }}>
                            {formatCurrency(dateData.totalRevenue)}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef2f2' }}>
                            Total Expenses:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fef2f2', fontWeight: 'bold', textAlign: 'center', color: '#dc2626', fontSize: '10pt' }}>
                            {formatCurrency(dateData.totalExpenses)}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: dateData.isProfitDay ? '#d1fae5' : '#fee2e2' }}>
                            Net Profit/Loss:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: dateData.isProfitDay ? '#d1fae5' : '#fee2e2', fontWeight: 'bold', textAlign: 'center', fontSize: '12pt', color: dateData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {formatCurrency(dateData.totalProfit)}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: dateData.isProfitDay ? '#bbf7d0' : '#fecaca' }}>
                            Profit Margin:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: dateData.isProfitDay ? '#bbf7d0' : '#fecaca', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', color: dateData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {dateData.profitMargin >= 0 ? '+' : ''}{dateData.profitMargin}%
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef3c7' }}>
                            Total Packages:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#fef3c7', fontWeight: 'bold', textAlign: 'center' }}>
                            {dateData.totalPackages}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#e0e7ff' }}>
                            Day Status:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', verticalAlign: 'middle', backgroundColor: '#e0e7ff', fontWeight: 'bold', textAlign: 'center', color: dateData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {dateData.isProfitDay ? 'PROFIT DAY' : 'LOSS DAY'}
                        </td>
                    </tr>
                </table>

                {/* PACKAGE REVENUE DETAILS */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                    <tr>
                        <td colSpan="6" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            📦 PACKAGE REVENUE DETAILS
                        </td>
                    </tr>
                    
                    {/* Table Header */}
                    <tr>
                        <th width="5%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            #
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Package ID
                        </th>
                        <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Package Details
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Route
                        </th>
                        <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Vehicle & Staff
                        </th>
                        <th width="15%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Revenue (₹)
                        </th>
                    </tr>

                    {/* Table Data */}
                    {dateData.packages.map((pkg, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', verticalAlign: 'top' }}>
                                {index + 1}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontWeight: 'bold' }}>
                                {pkg.packageId}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt' }}>
                                <div>{pkg.packageType}</div>
                                <div style={{ color: '#666' }}>{pkg.weight} | {pkg.dimensions}</div>
                                <div style={{ color: '#666', fontSize: '7.5pt' }}>Status: {pkg.status}</div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt' }}>
                                <div>{pkg.fromLocation}</div>
                                <div>→ {pkg.toLocation}</div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '8pt' }}>
                                <div>{pkg.vehicleType}</div>
                                <div style={{ color: '#666' }}>Driver: {pkg.driverName}</div>
                                <div style={{ color: '#666' }}>Staff: {pkg.staffName}</div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                                {formatRupees(pkg.packageValue)}
                            </td>
                        </tr>
                    ))}

                    {/* Summary Row */}
                    <tr style={{ fontWeight: 'bold' }}>
                        <td colSpan="5" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', backgroundColor: '#f9fafb' }}>
                            TOTAL REVENUE:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', backgroundColor: '#f9fafb', color: '#059669', fontSize: '10pt' }}>
                            {formatRupees(dateData.totalRevenue)}
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
                    {groupedExpenses.vehicle && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ 
                                fontSize: '10pt', 
                                fontWeight: 'bold', 
                                padding: '2mm',
                                backgroundColor: '#dbeafe',
                                border: '1px solid #93c5fd',
                                marginBottom: '2mm'
                            }}>
                                🚚 VEHICLE EXPENSES: {formatRupees(groupedExpenses.vehicle.total)}
                            </div>
                            
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <tr>
                                    <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>#</th>
                                    <th width="30%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Expense Name</th>
                                    <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Description</th>
                                    <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Type</th>
                                    <th width="10%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Amount (₹)</th>
                                    <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Payment Status</th>
                                </tr>
                                
                                {groupedExpenses.vehicle.items.map((expense, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{expense.subCategory}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                            {formatRupees(expense.amount)}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '1px 3px',
                                                borderRadius: '2px',
                                                backgroundColor: getPaymentStatusColor(expense.status) + '20',
                                                color: getPaymentStatusColor(expense.status),
                                                fontWeight: 'bold',
                                                fontSize: '7pt'
                                            }}>
                                                {expense.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            {expense.balance > 0 && (
                                                <div style={{ fontSize: '7pt', color: '#666' }}>
                                                    Due: {formatRupees(expense.balance)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#dbeafe' }}>
                                    <td colSpan="4" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>
                                        TOTAL VEHICLE EXPENSES:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(groupedExpenses.vehicle.total)}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                        {((groupedExpenses.vehicle.total / dateData.totalExpenses) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            </table>
                        </div>
                    )}

                    {/* Staff Expenses */}
                    {groupedExpenses.staff && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ 
                                fontSize: '10pt', 
                                fontWeight: 'bold', 
                                padding: '2mm',
                                backgroundColor: '#d1fae5',
                                border: '1px solid #86efac',
                                marginBottom: '2mm'
                            }}>
                                👥 STAFF EXPENSES: {formatRupees(groupedExpenses.staff.total)}
                            </div>
                            
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <tr>
                                    <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>#</th>
                                    <th width="30%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Expense Name</th>
                                    <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Description</th>
                                    <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Type</th>
                                    <th width="10%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Amount (₹)</th>
                                    <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>Payment Status</th>
                                </tr>
                                
                                {groupedExpenses.staff.items.map((expense, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{expense.subCategory}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                            {formatRupees(expense.amount)}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '1px 3px',
                                                borderRadius: '2px',
                                                backgroundColor: getPaymentStatusColor(expense.status) + '20',
                                                color: getPaymentStatusColor(expense.status),
                                                fontWeight: 'bold',
                                                fontSize: '7pt'
                                            }}>
                                                {expense.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                                    <td colSpan="4" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>
                                        TOTAL STAFF EXPENSES:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(groupedExpenses.staff.total)}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                        {((groupedExpenses.staff.total / dateData.totalExpenses) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            </table>
                        </div>
                    )}

                    {/* Other Expenses */}
                    {groupedExpenses.other && (
                        <div style={{ marginBottom: '4mm' }}>
                            <div style={{ 
                                fontSize: '10pt', 
                                fontWeight: 'bold', 
                                padding: '2mm',
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fcd34d',
                                marginBottom: '2mm'
                            }}>
                                📦 OTHER EXPENSES: {formatRupees(groupedExpenses.other.total)}
                            </div>
                            
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                                <tr>
                                    <th width="5%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>#</th>
                                    <th width="30%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Expense Name</th>
                                    <th width="25%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Description</th>
                                    <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Type</th>
                                    <th width="10%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Amount (₹)</th>
                                    <th width="15%" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fef9c3' }}>Payment Status</th>
                                </tr>
                                
                                {groupedExpenses.other.items.map((expense, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm' }}>{expense.name}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', fontSize: '7.5pt' }}>{expense.description}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>{expense.subCategory}</td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                            {formatRupees(expense.amount)}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '1px 3px',
                                                borderRadius: '2px',
                                                backgroundColor: getPaymentStatusColor(expense.status) + '20',
                                                color: getPaymentStatusColor(expense.status),
                                                fontWeight: 'bold',
                                                fontSize: '7pt'
                                            }}>
                                                {expense.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                
                                <tr style={{ fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                    <td colSpan="4" style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right' }}>
                                        TOTAL OTHER EXPENSES:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(groupedExpenses.other.total)}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '1mm', textAlign: 'center' }}>
                                        {((groupedExpenses.other.total / dateData.totalExpenses) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            </table>
                        </div>
                    )}
                </div>

                {/* FINAL PROFIT & LOSS CALCULATION */}
                <table width="100%" cellPadding="3" cellSpacing="0" style={{ border: '3px double #000', borderCollapse: 'collapse', marginBottom: '6mm', backgroundColor: dateData.isProfitDay ? '#f0fdf4' : '#fef2f2' }}>
                    <tr>
                        <td colSpan="3" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '12pt', backgroundColor: dateData.isProfitDay ? '#bbf7d0' : '#fecaca' }}>
                            🏁 FINAL PROFIT & LOSS STATEMENT
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="60%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold' }}>
                            TOTAL REVENUE FROM PACKAGES:
                        </td>
                        <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                            (+) 
                        </td>
                        <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', color: '#059669', fontSize: '10pt' }}>
                            {formatRupees(dateData.totalRevenue)}
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
                            {formatRupees(dateData.totalExpenses)}
                        </td>
                    </tr>

                    <tr style={{ borderTop: '2px solid #000' }}>
                        <td style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', fontSize: '11pt' }}>
                            NET PROFIT / LOSS:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', textAlign: 'center', fontWeight: 'bold', fontSize: '11pt' }}>
                            {dateData.isProfitDay ? '=' : '='}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3mm', textAlign: 'right', fontWeight: 'bold', fontSize: '14pt', color: dateData.isProfitDay ? '#059669' : '#dc2626' }}>
                            {formatRupees(dateData.totalProfit)}
                        </td>
                    </tr>

                    <tr style={{ backgroundColor: dateData.isProfitDay ? '#bbf7d0' : '#fecaca' }}>
                        <td colSpan="3" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt' }}>
                            PROFIT MARGIN: {dateData.profitMargin >= 0 ? '+' : ''}{dateData.profitMargin}% | 
                            DAY STATUS: {dateData.isProfitDay ? 'PROFIT DAY ✅' : 'LOSS DAY ❌'} | 
                            PACKAGES: {dateData.profitablePackages} Profit / {dateData.lossPackages} Loss
                        </td>
                    </tr>
                </table>

                {/* PACKAGE PERFORMANCE SUMMARY */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', fontSize: '9pt' }}>
                    <tr>
                        <td colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            📊 PACKAGE PERFORMANCE SUMMARY
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Total Packages:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                            {dateData.totalPackages}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Average Revenue per Package:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>
                            {formatRupees(dateData.totalRevenue / dateData.totalPackages)}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>
                            Profitable Packages:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>
                            {dateData.profitablePackages}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fee2e2' }}>
                            Loss Packages:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                            {dateData.lossPackages}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Success Rate:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>
                            {((dateData.profitablePackages / dateData.totalPackages) * 100).toFixed(1)}%
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                            Loss Rate:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }}>
                            {((dateData.lossPackages / dateData.totalPackages) * 100).toFixed(1)}%
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
                        Report ID: PL-{moment(dateData.date).format('DDMMYYYY')} | 
                        Generated: {generatedDate || moment().format('DD/MM/YYYY HH:mm')} | 
                        Packages: {dateData.totalPackages} | 
                        Expenses: {dateData.expenses.length} Items
                    </div>
                    <div style={{ marginTop: '2mm', fontStyle: 'italic', fontSize: '7.5pt' }}>
                        "This detailed report shows complete revenue from packages and all expenses including vehicle charges, staff salaries, tea, maintenance, and other operational costs."
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

                    /* Background colors for print */
                    td[style*="background-color: #f0f0f0"] {
                        background-color: #f0f0f0 !important;
                    }
                    
                    td[style*="background-color: #eff6ff"] {
                        background-color: #eff6ff !important;
                    }
                    
                    td[style*="background-color: #fef2f2"] {
                        background-color: #fef2f2 !important;
                    }
                    
                    td[style*="background-color: #d1fae5"] {
                        background-color: #d1fae5 !important;
                    }
                    
                    td[style*="background-color: #fee2e2"] {
                        background-color: #fee2e2 !important;
                    }
                    
                    td[style*="background-color: #bbf7d0"] {
                        background-color: #bbf7d0 !important;
                    }
                    
                    td[style*="background-color: #fecaca"] {
                        background-color: #fecaca !important;
                    }
                    
                    td[style*="background-color: #fef3c7"] {
                        background-color: #fef3c7 !important;
                    }
                    
                    td[style*="background-color: #e0e7ff"] {
                        background-color: #e0e7ff !important;
                    }
                    
                    td[style*="background-color: #f9fafb"] {
                        background-color: #f9fafb !important;
                    }
                    
                    td[style*="background-color: #e5e7eb"] {
                        background-color: #e5e7eb !important;
                    }
                    
                    td[style*="background-color: #dbeafe"] {
                        background-color: #dbeafe !important;
                    }
                    
                    td[style*="background-color: #ecfdf5"] {
                        background-color: #ecfdf5 !important;
                    }
                    
                    td[style*="background-color: #fef9c3"] {
                        background-color: #fef9c3 !important;
                    }
                    
                    td[style*="background-color: #f0fdf4"] {
                        background-color: #f0fdf4 !important;
                    }

                    /* Text colors for print */
                    td[style*="color: #1e40af"] {
                        color: #1e40af !important;
                    }
                    
                    td[style*="color: #dc2626"] {
                        color: #dc2626 !important;
                    }
                    
                    td[style*="color: #059669"] {
                        color: #059669 !important;
                    }

                    div[style*="background-color: #dbeafe"] {
                        background-color: #dbeafe !important;
                    }
                    
                    div[style*="background-color: #d1fae5"] {
                        background-color: #d1fae5 !important;
                    }
                    
                    div[style*="background-color: #fef3c7"] {
                        background-color: #fef3c7 !important;
                    }
                    
                    div[style*="background-color: #eff6ff"] {
                        background-color: #eff6ff !important;
                    }
                    
                    div[style*="background-color: #ecfdf5"] {
                        background-color: #ecfdf5 !important;
                    }
                    
                    div[style*="background-color: #fef9c3"] {
                        background-color: #fef9c3 !important;
                    }
                }

                /* Screen styles */
                @media screen {
                    #profit-loss-report-to-print {
                        border-radius: 4px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                        margin-bottom: 20px;
                    }

                    #profit-loss-report-to-print::-webkit-scrollbar {
                        width: 8px;
                    }

                    #profit-loss-report-to-print::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }

                    #profit-loss-report-to-print::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }

                    #profit-loss-report-to-print::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfitLossReportPDF;