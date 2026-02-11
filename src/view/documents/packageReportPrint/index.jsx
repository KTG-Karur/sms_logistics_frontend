import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const PackageReportPrint = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [reportData, setReportData] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState(null);
    const [stats, setStats] = useState(null);
    const [generatedDate, setGeneratedDate] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        if (location.state) {
            const { filteredData = [], filters = null, stats = null, generatedDate = '', totalRecords = 0 } = location.state;
            
            setFilteredData(filteredData);
            setFilters(filters);
            setStats(stats);
            setGeneratedDate(generatedDate);
            setTotalRecords(totalRecords);
            
            // Use first record as sample for details
            if (filteredData.length > 0) {
                setReportData(filteredData[0]);
            }
        }
    }, [location.state]);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return moment(date).format('DD/MM/YYYY');
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        return moment(dateTime).format('DD/MM/YYYY HH:mm');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
            case 'Delivered':
                return '#059669';
            case 'in_transit':
            case 'in_transit':
                return '#2563eb';
            case 'pending':
            case 'Pending':
                return '#f59e0b';
            case 'delayed':
            case 'Delayed':
                return '#dc2626';
            default:
                return '#6b7280';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'Paid':
                return '#059669';
            case 'partial':
            case 'Partial':
                return '#f59e0b';
            case 'pending':
            case 'Pending':
                return '#dc2626';
            default:
                return '#6b7280';
        }
    };

    // Calculate totals for summary
    const calculateSummary = () => {
        if (!filteredData || filteredData.length === 0) return null;

        const summary = {
            totalPackages: filteredData.length,
            totalAmount: filteredData.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
            paidAmount: filteredData.reduce((sum, item) => sum + (item.paidAmount || 0), 0),
            dueAmount: filteredData.reduce((sum, item) => sum + (item.dueAmount || 0), 0),
            totalWeight: filteredData.reduce((sum, item) => {
                const weight = parseFloat(item.totalWeight) || 0;
                return sum + weight;
            }, 0) + ' kg',
            statusCounts: filteredData.reduce((acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
            }, {}),
            paymentStatusCounts: filteredData.reduce((acc, item) => {
                acc[item.paymentStatus] = (acc[item.paymentStatus] || 0) + 1;
                return acc;
            }, {})
        };

        return summary;
    };

    const summary = calculateSummary();

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area - LANDSCAPE LAYOUT */}
            <div
                id="package-report-to-print"
                className="bg-white mx-auto"
                style={{
                    width: '297mm', // A4 landscape width
                    minHeight: '210mm', // A4 landscape height
                    height: 'auto',
                    padding: '15mm',
                    fontFamily: '"Times New Roman", serif',
                }}
            >
                {/* HEADER SECTION */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '4mm' }}>
                    <tr>
                        <td width="150" style={{ border: '1px solid #000', padding: '2px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <img
                                src="/assets/images/SMS logo_02.png"
                                alt="Company Logo"
                                style={{
                                    maxWidth: '140px',
                                    maxHeight: '40px',
                                    objectFit: 'contain',
                                }}
                            />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 4px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.2' }}>
                                PACKAGE AUDIT & TRANSPORTATION REPORT
                            </div>
                            <div style={{ fontSize: '10pt', marginTop: '2px' }}>
                                {filters?.startDate && filters?.toDate 
                                    ? `Period: ${moment(filters.startDate).format('DD/MM/YYYY')} to ${moment(filters.toDate).format('DD/MM/YYYY')}`
                                    : 'All Time Report'}
                            </div>
                        </td>
                        <td width="150" style={{ border: '1px solid #000', padding: '2px 4px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '9pt', lineHeight: '1.2' }}>
                                <div>Generated: {generatedDate || moment().format('DD/MM/YYYY HH:mm')}</div>
                                <div>Total Records: {totalRecords}</div>
                                <div>Page: 1 of 1</div>
                            </div>
                        </td>
                    </tr>
                </table>

                {/* REPORT SUMMARY SECTION */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                           REPORT SUMMARY
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="16%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            Total Packages:
                        </td>
                        <td width="17%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#eff6ff', fontWeight: 'bold', textAlign: 'center' }}>
                            {summary?.totalPackages || 0}
                        </td>
                        <td width="16%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            Total Amount:
                        </td>
                        <td width="17%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#ecfdf5', fontWeight: 'bold', textAlign: 'center', color: '#1e40af' }}>
                            ₹{summary?.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#d1fae5' }}>
                            Paid Amount:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#d1fae5', fontWeight: 'bold', textAlign: 'center', color: '#059669' }}>
                            ₹{summary?.paidAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fee2e2' }}>
                            Due Amount:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#fee2e2', fontWeight: 'bold', textAlign: 'center', color: '#dc2626' }}>
                            ₹{summary?.dueAmount?.toFixed(2) || '0.00'}
                        </td>
                    </tr>
                </table>

                {/* PACKAGE LIST - MAIN DATA TABLE */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '8pt' }}>
                    <tr>
                        <td colspan="14" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            PACKAGE DETAILS
                        </td>
                    </tr>
                    
                    {/* Table Header */}
                    <tr>
                        <th width="3%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            #
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Package ID
                        </th>
                        <th width="7%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Trip ID
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Route
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Sender
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Receiver
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Total (₹)
                        </th>
                        <th width="6%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Paid (₹)
                        </th>
                        <th width="6%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Due (₹)
                        </th>
                        <th width="7%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Payment
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Vehicle
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Driver
                        </th>
                        <th width="6%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Status
                        </th>
                        <th width="7%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Date
                        </th>
                    </tr>

                    {/* Table Data */}
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>
                                {index + 1}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontWeight: 'bold' }}>
                                {item.packageId}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top' }}>
                                {item.tripId}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.fromCenter}<br/>
                                → {item.toCenter}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.senderName}<br/>
                                <span style={{ color: '#6b7280', fontSize: '7pt' }}>{item.senderMobile}</span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.receiverName}<br/>
                                <span style={{ color: '#6b7280', fontSize: '7pt' }}>{item.receiverMobile}</span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold' }}>
                                ₹{item.totalAmount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', color: '#059669', fontWeight: 'bold' }}>
                                ₹{item.paidAmount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', color: '#dc2626', fontWeight: 'bold' }}>
                                ₹{item.dueAmount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center' }}>
                                <div style={{
                                    padding: '1px 3px',
                                    borderRadius: '2px',
                                    backgroundColor: getPaymentStatusColor(item.paymentStatus) + '20',
                                    color: getPaymentStatusColor(item.paymentStatus),
                                    fontWeight: 'bold',
                                    fontSize: '7pt'
                                }}>
                                    {item.paymentStatus}
                                </div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.vehicleNumber}<br/>
                                <span style={{ color: '#6b7280', fontSize: '7pt' }}>{item.vehicleType}</span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.driverName}<br/>
                                <span style={{ color: '#6b7280', fontSize: '7pt' }}>{item.driverMobile}</span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center' }}>
                                <div style={{
                                    padding: '1px 3px',
                                    borderRadius: '2px',
                                    backgroundColor: getStatusColor(item.status) + '20',
                                    color: getStatusColor(item.status),
                                    fontWeight: 'bold',
                                    fontSize: '7pt'
                                }}>
                                    {item.status}
                                </div>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', fontSize: '7.5pt' }}>
                                {formatDate(item.date)}
                            </td>
                        </tr>
                    ))}

                    {/* SUMMARY ROW */}
                    <tr style={{ fontWeight: 'bold' }}>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'right', backgroundColor: '#f9fafb' }}>
                            TOTALS:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', backgroundColor: '#f9fafb', color: '#1e40af' }}>
                            ₹{summary?.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', backgroundColor: '#f9fafb', color: '#059669' }}>
                            ₹{summary?.paidAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', backgroundColor: '#f9fafb', color: '#dc2626' }}>
                            ₹{summary?.dueAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                            {summary?.totalPackages || 0} Packages
                        </td>
                    </tr>
                </table>

                {/* REPORT FOOTER */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                LOGISTICS TRANSPORT REPORT - CONFIDENTIAL
                            </div>
                            <div>
                                Report Generated by KTGT Logistics System | {generatedDate || moment().format('DD/MM/YYYY HH:mm')} | 
                                Records: {totalRecords} | For Internal Use Only
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
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
                        width: 297mm !important;
                        height: auto !important;
                        transform: rotate(0deg) !important;
                    }

                    body * {
                        visibility: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    #package-report-to-print,
                    #package-report-to-print * {
                        visibility: visible;
                    }

                    #package-report-to-print {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 297mm !important;
                        min-height: 210mm !important;
                        margin: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-inside: avoid !important;
                    }

                    .d-print-none,
                    header,
                    nav,
                    .navbar,
                    .sidebar,
                    .action-buttons {
                        display: none !important;
                    }

                    @page {
                        size: A4 landscape;
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
                        font-size: 8pt !important;
                        line-height: 1.2 !important;
                        page-break-inside: avoid !important;
                    }

                    th, td {
                        padding: 2px 3px !important;
                        border: 0.5px solid #000 !important;
                        font-size: 8pt !important;
                        line-height: 1.2 !important;
                        vertical-align: top !important;
                    }

                    /* Background colors */
                    td[style*="background-color: #f0f0f0"] {
                        background-color: #f0f0f0 !important;
                    }
                    
                    td[style*="background-color: #eff6ff"] {
                        background-color: #eff6ff !important;
                    }
                    
                    td[style*="background-color: #ecfdf5"] {
                        background-color: #ecfdf5 !important;
                    }
                    
                    td[style*="background-color: #fef3c7"] {
                        background-color: #fef3c7 !important;
                    }
                    
                    td[style*="background-color: #fee2e2"] {
                        background-color: #fee2e2 !important;
                    }
                    
                    td[style*="background-color: #e0e7ff"] {
                        background-color: #e0e7ff !important;
                    }
                    
                    td[style*="background-color: #dbeafe"] {
                        background-color: #dbeafe !important;
                    }
                    
                    td[style*="background-color: #d1fae5"] {
                        background-color: #d1fae5 !important;
                    }
                    
                    td[style*="background-color: #f9fafb"] {
                        background-color: #f9fafb !important;
                    }
                    
                    td[style*="background-color: #f8fafc"] {
                        background-color: #f8fafc !important;
                    }
                    
                    td[style*="background-color: #e5e7eb"] {
                        background-color: #e5e7eb !important;
                    }

                    /* Text colors */
                    div[style*="color: #1e40af"],
                    td[style*="color: #1e40af"] {
                        color: #1e40af !important;
                    }
                    
                    div[style*="color: #059669"],
                    td[style*="color: #059669"] {
                        color: #059669 !important;
                    }
                    
                    div[style*="color: #7c3aed"],
                    td[style*="color: #7c3aed"] {
                        color: #7c3aed !important;
                    }
                    
                    div[style*="color: #dc2626"],
                    td[style*="color: #dc2626"] {
                        color: #dc2626 !important;
                    }
                    
                    div[style*="color: #f59e0b"],
                    td[style*="color: #f59e0b"] {
                        color: #f59e0b !important;
                    }
                    
                    div[style*="color: #2563eb"],
                    td[style*="color: #2563eb"] {
                        color: #2563eb !important;
                    }
                    
                    div[style*="color: #6b7280"],
                    td[style*="color: #6b7280"] {
                        color: #6b7280 !important;
                    }
                }

                /* Screen styles */
                @media screen {
                    #package-report-to-print {
                        border-radius: 4px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                        margin-bottom: 20px;
                        transform: rotate(0deg);
                    }

                    #package-report-to-print::-webkit-scrollbar {
                        width: 8px;
                    }

                    #package-report-to-print::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }

                    #package-report-to-print::-webkit-scrollbar-thumb {
                        background: #c1c1c1;
                        border-radius: 4px;
                    }

                    #package-report-to-print::-webkit-scrollbar-thumb:hover {
                        background: #a1a1a1;
                    }
                }
            `}</style>
        </div>
    );
};

export default PackageReportPrint;