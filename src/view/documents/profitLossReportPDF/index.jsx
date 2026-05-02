import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const ProfitLossPDF = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [reportData, setReportData] = useState(null);
    const [entries, setEntries] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [closingBalance, setClosingBalance] = useState(0);
    const [generatedDate, setGeneratedDate] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [centerName, setCenterName] = useState('');

    useEffect(() => {
        if (location.state) {
            const {
                reportData: data,
                entries: transactionEntries,
                summaryData: summary,
                openingBalance: opening,
                closingBalance: closing,
                generatedDate: genDate,
                date,
                centerName: center
            } = location.state;
            
            setReportData(data);
            setEntries(transactionEntries || []);
            setSummaryData(summary || []);
            setOpeningBalance(opening || 0);
            setClosingBalance(closing || 0);
            setGeneratedDate(genDate || moment().format('DD/MM/YYYY HH:mm'));
            setReportDate(date || moment().format('DD/MM/YYYY'));
            setCenterName(center || 'All Centers');
        }
    }, [location.state]);

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
            maximumFractionDigits: 2
        }).format(numAmount);
    };

    const formatRupees = (amount) => {
        const numAmount = parseFloat(amount || 0);
        return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (!reportData && entries.length === 0) {
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
                            <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>PROFIT & LOSS LEDGER REPORT</div>
                            <div style={{ fontSize: '8pt', marginTop: '1mm' }}>Credit and Debit Statement</div>
                        </td>
                        <td width="30%" style={{ borderRight: '2px solid #000', padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
                                {reportDate}
                            </div>
                            <div style={{ fontSize: '9pt' }}>{moment(reportDate, 'DD/MM/YYYY').format('dddd')}</div>
                        </td>
                        <td width="30%" style={{ padding: '3mm', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '8pt', lineHeight: '1.3' }}>
                                <div>Generated: {generatedDate}</div>
                                <div>Center: {centerName}</div>
                            </div>
                        </td>
                    </tr>
                </table>

                {/* LEDGER ENTRIES TABLE */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '6mm' }}>
                    <thead>
                        <tr>
                            <th colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                📋 LEDGER STATEMENT - TRANSACTION DETAILS
                            </th>
                        </tr>
                        <tr>
                            <th width="40%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                                Particulars
                            </th>
                            <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                                Credit (₹)
                            </th>
                            <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                                Debit (₹)
                            </th>
                            <th width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                                Remarks
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={index} style={{ pageBreakInside: 'avoid' }}>
                                <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top' }}>
                                    <div style={{ fontWeight: entry.isBold ? 'bold' : 'normal', fontSize: entry.type === 'payment' ? '9pt' : '8.5pt' }}>
                                        {entry.name}
                                    </div>
                                    {entry.payment_number && (
                                        <div style={{ fontSize: '7pt', color: '#666', marginTop: '1mm' }}>
                                            #{entry.payment_number}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '6.5pt', color: '#999', marginTop: '0.5mm' }}>
                                        {entry.type === 'payment' && 'Income'}
                                        {entry.type === 'expense' && 'Expense'}
                                        {entry.type === 'extra_income' && 'Extra Income'}
                                        {entry.type === 'investment' && 'Investment'}
                                        {entry.type === 'withdrawal' && 'Withdrawal'}
                                    </div>
                                </td>
                                <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', verticalAlign: 'top', color: '#059669', fontWeight: entry.isBold ? 'bold' : 'normal' }}>
                                    {entry.credit > 0 ? formatRupees(entry.credit) : '-'}
                                </td>
                                <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', verticalAlign: 'top', color: '#dc2626', fontWeight: entry.isBold ? 'bold' : 'normal' }}>
                                    {entry.debit > 0 ? formatRupees(entry.debit) : '-'}
                                </td>
                                <td style={{ border: '1px solid #000', padding: '2mm', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                    {entry.remarks || '-'}
                                </td>
                            </tr>
                        ))}

                        {/* Empty state when no entries */}
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ border: '1px solid #000', padding: '10mm', textAlign: 'center', color: '#666' }}>
                                    No transactions recorded for this date
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* Summary Section */}
                    {summaryData.length > 0 && (
                        <tbody>
                            <tr>
                                <td colSpan="4" style={{ borderTop: '2px solid #000', borderBottom: '1px solid #000', padding: '2mm', backgroundColor: '#f9fafb' }}>
                                    <strong style={{ fontSize: '9pt' }}>SUMMARY</strong>
                                </td>
                            </tr>
                            {summaryData.map((summary, index) => (
                                <tr 
                                    key={`summary-${index}`}
                                    style={{ 
                                        backgroundColor: summary.isHighlight ? '#fff3e0' : (summary.isBold ? '#f9fafb' : 'transparent'),
                                        pageBreakInside: 'avoid'
                                    }}
                                >
                                    <td style={{ 
                                        border: '1px solid #000', 
                                        padding: '2.5mm', 
                                        fontWeight: summary.isBold ? 'bold' : 'normal',
                                        fontSize: summary.isBold ? '9.5pt' : '9pt'
                                    }}>
                                        {summary.name}
                                    </td>
                                    <td style={{ 
                                        border: '1px solid #000', 
                                        padding: '2.5mm', 
                                        textAlign: 'right', 
                                        fontWeight: summary.isBold ? 'bold' : 'normal',
                                        color: '#059669'
                                    }}>
                                        {summary.credit > 0 ? formatRupees(summary.credit) : '-'}
                                    </td>
                                    <td style={{ 
                                        border: '1px solid #000', 
                                        padding: '2.5mm', 
                                        textAlign: 'right', 
                                        fontWeight: summary.isBold ? 'bold' : 'normal',
                                        color: '#dc2626'
                                    }}>
                                        {summary.debit > 0 ? formatRupees(summary.debit) : '-'}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2.5mm', fontSize: '7.5pt' }}>
                                        {summary.remarks || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>

                {/* BREAKDOWN SECTIONS */}
                {reportData && reportData.summary && (
                    <>
                        {/* Payment Breakdowns */}
                        <div style={{ marginBottom: '6mm' }}>
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th colSpan="3" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                            💰 PAYMENT BREAKDOWN
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td width="50%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#eff6ff' }} colSpan="3">
                                            By Payment Type
                                        </td>
                                    </tr>
                                    {(reportData.summary?.payment_breakdown_by_type || []).map((item, idx) => (
                                        <tr key={`type-${idx}`}>
                                            <td width="60%" style={{ border: '1px solid #000', padding: '2mm' }}>{item.label}</td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                                {formatRupees(item.total)}
                                            </td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>
                                                {item.count} transactions
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#eff6ff' }} colSpan="3">
                                            By Payment Mode
                                        </td>
                                    </tr>
                                    {(reportData.summary?.payment_breakdown_by_mode || []).map((item, idx) => (
                                        <tr key={`mode-${idx}`}>
                                            <td width="60%" style={{ border: '1px solid #000', padding: '2mm' }}>{item.label}</td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                                {formatRupees(item.total)}
                                            </td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>
                                                {item.count} transactions
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Expense Breakdowns */}
                        <div style={{ marginBottom: '6mm' }}>
                            <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th colSpan="3" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                            💸 EXPENSE BREAKDOWN
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td width="50%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef2f2' }} colSpan="3">
                                            By Expense Type
                                        </td>
                                    </tr>
                                    {(reportData.summary?.expense_breakdown_by_expense_type || []).map((item, idx) => (
                                        <tr key={`exp-type-${idx}`}>
                                            <td width="60%" style={{ border: '1px solid #000', padding: '2mm' }}>{item.expense_type}</td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>
                                                {formatRupees(item.total)}
                                            </td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>
                                                {item.count} transactions
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    <tr>
                                        <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef2f2' }} colSpan="3">
                                            By Payment Type
                                        </td>
                                    </tr>
                                    {(reportData.summary?.expense_breakdown_by_payment_type || []).map((item, idx) => (
                                        <tr key={`exp-mode-${idx}`}>
                                            <td width="60%" style={{ border: '1px solid #000', padding: '2mm' }}>{item.label}</td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>
                                                {formatRupees(item.total)}
                                            </td>
                                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>
                                                {item.count} transactions
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Extra Income Breakdown */}
                        {(reportData.summary?.extra_income_breakdown_by_type?.length > 0 || reportData.summary?.total_extra_income_amount > 0) && (
                            <div style={{ marginBottom: '6mm' }}>
                                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th colSpan="3" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                                ✨ EXTRA INCOME BREAKDOWN
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td width="60%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>Total Extra Income</td>
                                            <td width="40%" colSpan="2" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                                {formatRupees(reportData.summary?.total_extra_income_amount || 0)}
                                            </td>
                                        </tr>
                                        {(reportData.summary?.extra_income_breakdown_by_type || []).map((item, idx) => (
                                            <tr key={`extra-${idx}`}>
                                                <td width="60%" style={{ border: '1px solid #000', padding: '2mm' }}>{item.label}</td>
                                                <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                                    {formatRupees(item.total)}
                                                </td>
                                                <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center' }}>
                                                    {item.count} transactions
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* FINANCIAL SUMMARY CARDS */}
                {reportData && reportData.summary && (
                    <div style={{ marginBottom: '6mm' }}>
                        <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '2px solid #000', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th colSpan="4" style={{ borderBottom: '2px solid #000', padding: '3mm', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                        📊 FINANCIAL SUMMARY
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>
                                        Total Payments:
                                    </td>
                                    <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                        {formatRupees(reportData.summary?.total_payment_amount || 0)}
                                    </td>
                                    <td width="25%" style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                        Total Extra Income:
                                    </td>
                                    <td width="25%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                        {formatRupees(reportData.summary?.total_extra_income_amount || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                                        Total Income:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                        {formatRupees(reportData.summary?.total_income || 0)}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef2f2' }}>
                                        Total Expenses:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>
                                        {formatRupees(reportData.summary?.total_expense_amount || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                        Total Investments:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669' }}>
                                        {formatRupees(reportData.summary?.total_investments || 0)}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                        Total Withdrawals:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626' }}>
                                        {formatRupees(reportData.summary?.total_withdrawals || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                        Operational P/L:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: parseFloat(reportData.summary?.operational_profit_loss || 0) >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                                        {formatRupees(reportData.summary?.operational_profit_loss || 0)}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                        Net Investment Change:
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: parseFloat(reportData.summary?.net_investment_change || 0) >= 0 ? '#059669' : '#dc2626', fontWeight: 'bold' }}>
                                        {formatRupees(reportData.summary?.net_investment_change || 0)}
                                    </td>
                                </tr>
                                <tr style={{ backgroundColor: parseFloat(reportData.summary?.total_profit_loss || 0) >= 0 ? '#d1fae5' : '#fee2e2' }}>
                                    <td colSpan="2" style={{ border: '1px solid #000', padding: '3mm', fontWeight: 'bold', fontSize: '11pt', textAlign: 'center' }}>
                                        NET PROFIT/LOSS:
                                    </td>
                                    <td colSpan="2" style={{ border: '1px solid #000', padding: '3mm', textAlign: 'right', fontWeight: 'bold', fontSize: '12pt', color: parseFloat(reportData.summary?.total_profit_loss || 0) >= 0 ? '#059669' : '#dc2626' }}>
                                        {formatRupees(reportData.summary?.total_profit_loss || 0)}
                                        <span style={{ fontSize: '9pt', marginLeft: '5mm' }}>
                                            ({parseFloat(reportData.summary?.total_profit_loss || 0) >= 0 ? 'PROFIT' : 'LOSS'})
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TRANSACTION STATISTICS */}
                <div style={{ marginBottom: '4mm' }}>
                    <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                        <tr>
                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                <strong>Total Credit:</strong>
                            </td>
                            <td width="13%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>
                                {formatRupees(entries.filter(e => e.credit > 0).reduce((sum, e) => sum + e.credit, 0))}
                            </td>
                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                <strong>Total Debit:</strong>
                            </td>
                            <td width="13%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>
                                {formatRupees(entries.filter(e => e.debit > 0).reduce((sum, e) => sum + e.debit, 0))}
                            </td>
                            <td width="20%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                <strong>Total Transactions:</strong>
                            </td>
                            <td width="14%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', fontWeight: 'bold' }}>
                                {entries.length}
                            </td>
                        </tr>
                    </table>
                </div>

                {/* CUSTOMER STATISTICS */}
                {reportData && reportData.summary && (
                    <div style={{ marginBottom: '4mm' }}>
                        <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                            <tr>
                                <td width="33%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                    <strong>Unique Customers:</strong> {reportData.summary?.unique_customers || 0}
                                </td>
                                <td width="33%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                    <strong>Centers Involved:</strong> {reportData.summary?.centers_involved || 0}
                                </td>
                                <td width="34%" style={{ border: '1px solid #000', padding: '2mm', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                    <strong>Days in Range:</strong> {reportData.summary?.days_in_range || 1}
                                </td>
                            </tr>
                        </table>
                    </div>
                )}

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
                        PROFIT & LOSS LEDGER REPORT - ACCOUNTING DEPARTMENT
                    </div>
                    <div>
                        Report ID: PL-{reportDate.replace(/\//g, '')} | 
                        Generated: {generatedDate} | 
                        Status: {reportData?.summary?.profit_loss_status === 'profit' ? 'PROFITABLE' : 'LOSS'}
                    </div>
                    <div style={{ marginTop: '2mm', fontStyle: 'italic', fontSize: '7.5pt' }}>
                        "This report shows all credit and debit transactions with opening and closing balance for the selected period."
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

export default ProfitLossPDF;