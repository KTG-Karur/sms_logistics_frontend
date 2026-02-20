import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const BookingReportPrint = () => {
    const location = useLocation();
    const navigate = useNavigate();

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return '#059669';
            case 'in_transit':
            case 'in_progress':
                return '#2563eb';
            case 'not_started':
                return '#f59e0b';
            case 'cancelled':
                return '#dc2626';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area */}
            <div
                id="booking-report-to-print"
                className="bg-white mx-auto"
                style={{
                    width: '297mm',
                    minHeight: '210mm',
                    height: 'auto',
                    padding: '15mm',
                    fontFamily: '"Times New Roman", serif',
                }}
            >
                {/* Header */}
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
                                BOOKING TRANSPORTATION REPORT
                            </div>
                            <div style={{ fontSize: '10pt', marginTop: '2px' }}>
                                {filters?.startDate && filters?.endDate 
                                    ? `Period: ${moment(filters.startDate).format('DD/MM/YYYY')} to ${moment(filters.endDate).format('DD/MM/YYYY')}`
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

                {/* Summary */}
                {stats && (
                    <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                        <tr>
                            <td colSpan="6" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                                REPORT SUMMARY
                            </td>
                        </tr>
                        <tr>
                            <td width="16%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>
                                Total Bookings:
                            </td>
                            <td width="17%" style={{ border: '1px solid #000', padding: '3px 6px', backgroundColor: '#eff6ff', fontWeight: 'bold', textAlign: 'center' }}>
                                {stats.total_bookings || 0}
                            </td>
                            <td width="16%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', backgroundColor: '#ecfdf5' }}>
                                Total Amount:
                            </td>
                            <td width="17%" style={{ border: '1px solid #000', padding: '3px 6px', backgroundColor: '#ecfdf5', fontWeight: 'bold', textAlign: 'center' }}>
                                ₹{stats.total_amount}
                            </td>
                            <td width="16%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', backgroundColor: '#d1fae5' }}>
                                Paid Amount:
                            </td>
                            <td width="17%" style={{ border: '1px solid #000', padding: '3px 6px', backgroundColor: '#d1fae5', fontWeight: 'bold', textAlign: 'center', color: '#059669' }}>
                                ₹{stats.total_paid}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', backgroundColor: '#fee2e2' }}>
                                Due Amount:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', backgroundColor: '#fee2e2', fontWeight: 'bold', textAlign: 'center', color: '#dc2626' }}>
                                ₹{stats.total_pending}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', backgroundColor: '#fef3c7' }}>
                                Payment Progress:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', backgroundColor: '#fef3c7', fontWeight: 'bold', textAlign: 'center' }}>
                                {stats.payment_progress}%
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', backgroundColor: '#dbeafe' }}>
                                Assigned Trips:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', backgroundColor: '#dbeafe', fontWeight: 'bold', textAlign: 'center' }}>
                                {stats.by_trip_status?.assigned || 0}
                            </td>
                        </tr>
                    </table>
                )}

                {/* Bookings Table */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '8pt' }}>
                    <tr>
                        <td colSpan="14" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            BOOKING DETAILS
                        </td>
                    </tr>
                    
                    {/* Header */}
                    <tr>
                        <th width="3%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            #
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Booking No
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            LLR No
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Date
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            From Center
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            To Center
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Sender
                        </th>
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'left', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Receiver
                        </th>
                        <th width="6%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
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
                        <th width="8%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Delivery
                        </th>
                        <th width="6%" style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e5e7eb' }}>
                            Trip
                        </th>
                    </tr>

                    {/* Data */}
                    {filteredData.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>
                                {index + 1}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontWeight: 'bold' }}>
                                {item.booking_number}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top' }}>
                                {item.llr_number || '-'}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top' }}>
                                {formatDate(item.booking_date)}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.fromCenter?.office_center_name}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.toCenter?.office_center_name}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.fromCustomer?.customer_name}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', fontSize: '7.5pt' }}>
                                {item.toCustomer?.customer_name}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', fontWeight: 'bold' }}>
                                ₹{item.total_amount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', color: '#059669', fontWeight: 'bold' }}>
                                ₹{item.paid_amount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center', color: item.due_amount > 0 ? '#dc2626' : '#059669', fontWeight: 'bold' }}>
                                ₹{item.due_amount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center' }}>
                                <span style={{
                                    padding: '1px 3px',
                                    borderRadius: '2px',
                                    backgroundColor: item.payment_status === 'completed' ? '#05966920' : item.payment_status === 'partial' ? '#f59e0b20' : '#dc262620',
                                    color: item.payment_status === 'completed' ? '#059669' : item.payment_status === 'partial' ? '#f59e0b' : '#dc2626',
                                    fontWeight: 'bold',
                                    fontSize: '7pt'
                                }}>
                                    {item.payment_status}
                                </span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center' }}>
                                <span style={{
                                    padding: '1px 3px',
                                    borderRadius: '2px',
                                    backgroundColor: item.delivery_status === 'delivered' ? '#05966920' : 
                                                   ['in_transit', 'picked_up', 'out_for_delivery'].includes(item.delivery_status) ? '#2563eb20' : '#f59e0b20',
                                    color: item.delivery_status === 'delivered' ? '#059669' : 
                                           ['in_transit', 'picked_up', 'out_for_delivery'].includes(item.delivery_status) ? '#2563eb' : '#f59e0b',
                                    fontWeight: 'bold',
                                    fontSize: '7pt'
                                }}>
                                    {item.delivery_status?.replace(/_/g, ' ')}
                                </span>
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top', textAlign: 'center' }}>
                                {item.trip ? (
                                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Yes</span>
                                ) : (
                                    <span style={{ color: '#6b7280' }}>No</span>
                                )}
                            </td>
                        </tr>
                    ))}

                    {/* Summary Row */}
                    {stats && (
                        <tr style={{ fontWeight: 'bold' }}>
                            <td colSpan="8" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'right', backgroundColor: '#f9fafb' }}>
                                TOTALS:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                ₹{stats.total_amount}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', backgroundColor: '#f9fafb', color: '#059669' }}>
                                ₹{stats.total_paid}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', backgroundColor: '#f9fafb', color: '#dc2626' }}>
                                ₹{stats.total_pending}
                            </td>
                            <td colSpan="3" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                                {stats.total_bookings} Bookings
                            </td>
                        </tr>
                    )}
                </table>

                {/* Footer */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                                BOOKING TRANSPORT REPORT - CONFIDENTIAL
                            </div>
                            <div>
                                Generated by KTGT Logistics System | {generatedDate || moment().format('DD/MM/YYYY HH:mm')} | 
                                Records: {totalRecords} | For Internal Use Only
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-center gap-4">
                <button
                    onClick={handleBack}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center"
                >
                    <IconBack className="w-4 h-4 mr-2" />
                    Back
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
                    }

                    body * {
                        visibility: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    #booking-report-to-print,
                    #booking-report-to-print * {
                        visibility: visible;
                    }

                    #booking-report-to-print {
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
                }
            `}</style>
        </div>
    );
};

export default BookingReportPrint;