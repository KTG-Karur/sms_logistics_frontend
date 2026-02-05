import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';

const AuditReportPaper = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [auditData, setAuditData] = useState(null);
    const [allAudits, setAllAudits] = useState([]);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        if (location.state?.auditData) {
            setAuditData(location.state.auditData);
        }
        if (location.state?.allAudits) {
            setAllAudits(location.state.allAudits);
        }
    }, [location.state]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    const handleBack = () => {
        navigate(-1);
    };

    // Sample data structure for demonstration
    const getCategoryData = () => {
        return [
            { key: 'childLabourScore', label: '1. Child Labour', totalItems: 10 },
            { key: 'forcedLabourScore', label: '2. Forced Labour', totalItems: 8 },
            { key: 'freedomOfAssociationScore', label: '3. Freedom of Association', totalItems: 6 },
            { key: 'discriminationScore', label: '4. Discrimination', totalItems: 9 },
            { key: 'disciplinaryPracticesScore', label: '5. Disciplinary Practices', totalItems: 7 },
            { key: 'mgmtSystemScore', label: '6. Management System', totalItems: 12 },
            { key: 'businessEthicsScore', label: '7. Business Ethics', totalItems: 8 },
            { key: 'envMgmtScore', label: '8. Environmental Management', totalItems: 10 },
            { key: 'healthSafetyScore', label: '9. Health & Safety', totalItems: 15 },
            { key: 'workingHoursScore', label: '10. Working Hours & Wages', totalItems: 11 },
            { key: 'accidentInsuranceScore', label: '11. Accident Insurance', totalItems: 5 },
            { key: 'licensesPermitsScore', label: '12. Licenses & Permits', totalItems: 8 },
            { key: 'housekeepingScore', label: '13. Housekeeping & Training', totalItems: 10 },
            { key: 'recruitmentScore', label: '14. Recruitment & Accommodation', totalItems: 9 },
            { key: 'accommodationScore', label: '15. Accommodation', totalItems: 12 }
        ];
    };

    const calculateCategoryTotals = () => {
        const categories = getCategoryData();

        return categories.map((category, index) => {
            const score = auditData?.[category.key] || Math.floor(Math.random() * 100);
            const okCount = Math.round((score / 100) * category.totalItems);
            const notOkCount = Math.max(0, Math.round(((100 - score) / 100) * category.totalItems));
            const naCount = Math.max(0, category.totalItems - okCount - notOkCount);
            const applicableCount = category.totalItems - naCount;
            const percentage = applicableCount > 0 ? Math.round((okCount / applicableCount) * 100) : 0;
            
            return {
                sNo: index + 1,
                requirement: category.label,
                ok: okCount,
                notOk: notOkCount,
                na: naCount,
                total: category.totalItems,
                applicable: applicableCount,
                percentage: percentage
            };
        });
    };

    const calculateSummary = () => {
        const categoryData = calculateCategoryTotals();
        const totalItems = categoryData.reduce((sum, item) => sum + item.total, 0);
        const totalOk = categoryData.reduce((sum, item) => sum + item.ok, 0);
        const totalNotOk = categoryData.reduce((sum, item) => sum + item.notOk, 0);
        const totalNA = categoryData.reduce((sum, item) => sum + item.na, 0);
        const totalApplicable = totalItems - totalNA;
        const overallPercentage = totalApplicable > 0 ? Math.round((totalOk / totalApplicable) * 100) : 0;

        return {
            totalOk,
            totalNotOk,
            totalNA,
            totalItems,
            totalApplicable,
            overallPercentage
        };
    };

    const categoryData = calculateCategoryTotals();
    const summary = calculateSummary();

    if (!auditData && allAudits.length === 0) {
        return (
            <div className="p-4">
                <div className="text-center py-8">No audit data available</div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area */}
            <div 
                id="audit-report-to-print"
                className="print-report"
            >
                {/* Header */}
                <div className="print-header">
                    <h1>
                        ASIAN FABRICX - SUB SUPPLIER AUDIT REPORT
                    </h1>
                    <div className="header-info">
                        <div className="left-info">
                            <div><strong>Supplier Name:</strong> {auditData?.supplierName || 'N/A'}</div>
                            <div><strong>Supplier Type:</strong> {auditData?.supplierType || 'N/A'}</div>
                            <div><strong>Location:</strong> {auditData?.location || 'N/A'}</div>
                        </div>
                        <div className="right-info">
                            <div><strong>Audit Date:</strong> {auditData ? moment(auditData.auditDate).format('DD/MM/YYYY') : 'N/A'}</div>
                            <div><strong>Auditor:</strong> {auditData?.auditorName || 'N/A'}</div>
                            <div><strong>Report ID:</strong> {auditData?.auditId || 'AUD-REPORT'}</div>
                            <div><strong>Generated On:</strong> {moment().format('DD/MM/YYYY HH:mm')}</div>
                        </div>
                    </div>
                    
                    {/* Highlighted Total Applicable Requirements */}
                    <div className="applicable-requirements">
                        <strong>Total Applicable Requirements: <span>{summary.totalApplicable}</span></strong>
                    </div>
                </div>

                {/* Main Audit Table */}
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th className="sno">S.No</th>
                            <th className="requirements">Requirements</th>
                            <th className="basic" colSpan="3">
                                Basic
                                <div className="basic-sub">
                                    OK &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Not OK &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; N/A
                                </div>
                            </th>
                            <th className="total">Total</th>
                            <th className="percentage">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryData.map((item) => (
                            <tr key={item.sNo}>
                                <td className="sno">{item.sNo}</td>
                                <td className="requirements">{item.requirement}</td>
                                <td className="ok">{item.ok}</td>
                                <td className="not-ok">{item.notOk}</td>
                                <td className="na">{item.na}</td>
                                <td className="total">{item.total}</td>
                                <td className="percentage">{item.percentage}%</td>
                            </tr>
                        ))}
                        
                        {/* Summary Row */}
                        <tr className="summary-row">
                            <td colSpan="2">TOTAL</td>
                            <td>{summary.totalOk}</td>
                            <td>{summary.totalNotOk}</td>
                            <td>{summary.totalNA}</td>
                            <td>{summary.totalItems}</td>
                            <td>{summary.overallPercentage}%</td>
                        </tr>
                    </tbody>
                </table>

                {/* Compliance Summary Table */}
                <table className="compliance-table">
                    <thead>
                        <tr>
                            <th colSpan="6">COMPLIANCE SUMMARY</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Total OK Items:</strong></td>
                            <td>{summary.totalOk}</td>
                            <td><strong>Total Not OK Items:</strong></td>
                            <td>{summary.totalNotOk}</td>
                            <td><strong>Total N/A Items:</strong></td>
                            <td>{summary.totalNA}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Items Checked:</strong></td>
                            <td>{summary.totalItems}</td>
                            <td><strong>Total Applicable Requirements:</strong></td>
                            <td>{summary.totalApplicable}</td>
                            <td><strong>Overall Compliance Rate:</strong></td>
                            <td>{summary.overallPercentage}%</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer */}
                <div className="print-footer">
                    <p><strong>ASIAN FABRICX QUALITY ASSURANCE DEPARTMENT</strong></p>
                    <p>Factory Audit Checklist - Form No: AFX-QA-003 Rev. 2.1</p>
                    <p className="footer-note">Page 1 of 1 • This document shall not be reproduced without authorization</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <button 
                    onClick={handleBack}
                    className="back-btn"
                >
                    ← Back
                </button>
                <button 
                    onClick={handlePrint}
                    className="print-btn"
                    disabled={isPrinting}
                >
                    {isPrinting ? 'Printing...' : '🖨️ Print Report'}
                </button>
            </div>

            <style jsx>{`
                /* Screen styles */
                .print-report {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 15mm;
                    font-family: 'Times New Roman', serif;
                    font-size: 11px;
                    line-height: 1.2;
                    background: white;
                    margin: 0 auto;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                    overflow: auto;
                    max-height: calc(100vh - 150px);
                }

                .print-header {
                    text-align: center;
                    margin-bottom: 16px;
                    border-bottom: 1px solid #000;
                    padding-bottom: 12px;
                }

                .print-header h1 {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 12px;
                }

                .header-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    margin-bottom: 8px;
                }

                .left-info {
                    text-align: left;
                }

                .right-info {
                    text-align: right;
                }

                .applicable-requirements {
                    margin-top: 8px;
                }

                .applicable-requirements span {
                    background-color: #ffff00;
                    padding: 2px 6px;
                }

                .audit-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #000;
                    margin-bottom: 16px;
                    font-size: 11px;
                }

                .audit-table th,
                .audit-table td {
                    border: 1px solid #000;
                    padding: 3px 5px;
                    vertical-align: top;
                }

                .audit-table th {
                    font-weight: bold;
                    text-align: center;
                    background-color: #f5f5f5;
                }

                .sno {
                    width: 5%;
                    text-align: center;
                }

                .requirements {
                    width: 45%;
                    text-align: left;
                }

                .basic {
                    width: 25%;
                    text-align: center;
                }

                .basic-sub {
                    font-weight: normal;
                    font-size: 10px;
                    margin-top: 2px;
                }

                .total {
                    width: 8%;
                    text-align: center;
                }

                .percentage {
                    width: 8%;
                    text-align: center;
                }

                .ok,
                .not-ok,
                .na {
                    text-align: center;
                }

                .summary-row {
                    font-weight: bold;
                }

                .compliance-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #000;
                    margin-bottom: 16px;
                    font-size: 11px;
                }

                .compliance-table th,
                .compliance-table td {
                    border: 1px solid #000;
                    padding: 3px 5px;
                    text-align: left;
                }

                .compliance-table th {
                    font-weight: bold;
                    text-align: center;
                    background-color: #f5f5f5;
                }

                .compliance-table td:nth-child(even) {
                    text-align: center;
                }

                .print-footer {
                    margin-top: 24px;
                    padding-top: 8px;
                    border-top: 1px solid #000;
                    text-align: center;
                    font-size: 11px;
                }

                .footer-note {
                    margin-top: 4px;
                }

                .action-buttons {
                    margin-top: 24px;
                    display: flex;
                    justify-content: center;
                    gap: 16px;
                }

                .back-btn,
                .print-btn {
                    padding: 8px 24px;
                    color: white;
                    border: none;
                    font-family: Arial, sans-serif;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    min-width: 120px;
                }

                .back-btn {
                    background-color: #6b7280;
                }

                .back-btn:hover {
                    background-color: #4b5563;
                }

                .print-btn {
                    background-color: #1f2937;
                }

                .print-btn:hover {
                    background-color: #111827;
                }

                .print-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* Print styles */
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

                    #audit-report-to-print,
                    #audit-report-to-print * {
                        visibility: visible;
                    }

                    .print-report {
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
                        border-radius: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                    }

                    .action-buttons,
                    header,
                    nav,
                    .navbar,
                    .sidebar {
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

                    .audit-table,
                    .compliance-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 11px !important;
                        line-height: 1.2 !important;
                        page-break-inside: avoid !important;
                    }

                    .audit-table th,
                    .audit-table td,
                    .compliance-table th,
                    .compliance-table td {
                        padding: 3px 4px !important;
                        border: 1px solid #000 !important;
                        font-size: 11px !important;
                        line-height: 1.2 !important;
                        vertical-align: top !important;
                    }

                    .audit-table th {
                        background-color: #f5f5f5 !important;
                    }

                    .compliance-table th {
                        background-color: #f5f5f5 !important;
                    }

                    .applicable-requirements span {
                        background-color: #ffff00 !important;
                    }

                    .print-footer {
                        position: relative !important;
                        bottom: 0 !important;
                        margin-top: 10mm !important;
                    }

                    /* Fix table header colors */
                    div[style*="background-color: #1e40af"] {
                        background-color: #1e40af !important;
                        color: white !important;
                    }
                    
                    div[style*="background-color: #059669"] {
                        background-color: #059669 !important;
                        color: white !important;
                    }
                }

                /* Scrollbar for screen view */
                @media screen {
                    .print-report::-webkit-scrollbar {
                        width: 8px;
                    }

                    .print-report::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }

                    .print-report::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }

                    .print-report::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuditReportPaper;