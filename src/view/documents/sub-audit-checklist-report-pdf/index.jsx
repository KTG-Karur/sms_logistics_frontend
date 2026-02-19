import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const PackageReportPrint = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState(null);
    const [stats, setStats] = useState(null);
    const [generatedDate, setGeneratedDate] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [allShipments, setAllShipments] = useState([]);

    useEffect(() => {
        if (location.state) {
            const { filteredData = [], filters = null, stats = null, generatedDate = '', totalRecords = 0 } = location.state;
            
            setFilteredData(filteredData);
            setFilters(filters);
            setStats(stats);
            setGeneratedDate(generatedDate);
            setTotalRecords(totalRecords);
            
            // Group by customer - for demo, using first customer as selected
            if (filteredData.length > 0) {
                // In real scenario, you'd have a selected customer ID
                // For demo, group by fromName (sender)
                const customerShipments = filteredData.filter(item => 
                    item.fromName === filteredData[0].fromName
                );
                setAllShipments(customerShipments);
                setSelectedCustomer({
                    name: filteredData[0].fromName,
                    mobile: filteredData[0].fromMobile
                });
            }
        } else {
            // Comprehensive dummy data for ONE customer with multiple shipments
            const customerName = 'John Doe';
            const customerMobile = '9876543210';
            
            const dummyShipments = [
                {
                    id: 1,
                    packageId: 'PKG001',
                    fromCenter: 'Karur',
                    toCenter: 'Erode',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '456 Park Avenue, Erode',
                    fromMobile: customerMobile,
                    fromName: customerName,
                    toMobile: '8765432109',
                    toName: 'Robert Johnson',
                    tripName: 'RRR',
                    packageDetails: [
                        { packageType: 'bag', quantity: 6, rate: 70 }
                    ],
                    totalAmount: 420,
                    paidAmount: 420,
                    dueAmount: 0,
                    paymentBy: 'from',
                    paymentStatus: 'completed',
                    date: '2025-11-17',
                    tripId: 'TRP001'
                },
                {
                    id: 2,
                    packageId: 'PKG002',
                    fromCenter: 'Karur',
                    toCenter: 'Salem',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '789 Market Road, Salem',
                    fromMobile: customerMobile,
                    fromName: customerName,
                    toMobile: '7654321098',
                    toName: 'Mike Brown',
                    tripName: 'VSK',
                    packageDetails: [
                        { packageType: 'bag', quantity: 1, rate: 70 }
                    ],
                    totalAmount: 70,
                    paidAmount: 0,
                    dueAmount: 70,
                    paymentBy: 'from',
                    paymentStatus: 'pending',
                    date: '2025-11-17',
                    tripId: 'TRP002'
                },
                {
                    id: 3,
                    packageId: 'PKG003',
                    fromCenter: 'Karur',
                    toCenter: 'Coimbatore',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '456 Cross Cut Road, Coimbatore',
                    fromMobile: customerMobile,
                    fromName: customerName,
                    toMobile: '9988776655',
                    toName: 'David Wilson',
                    tripName: 'Export',
                    packageDetails: [
                        { packageType: 'bag', quantity: 24, rate: 70 }
                    ],
                    totalAmount: 1680,
                    paidAmount: 500,
                    dueAmount: 1180,
                    paymentBy: 'from',
                    paymentStatus: 'partial',
                    date: '2025-11-18',
                    tripId: 'TRP003'
                },
                {
                    id: 4,
                    packageId: 'PKG004',
                    fromCenter: 'Karur',
                    toCenter: 'Chennai',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '456 Anna Salai, Chennai',
                    fromMobile: customerMobile,
                    fromName: customerName,
                    toMobile: '8877665544',
                    toName: 'Sarah Williams',
                    tripName: 'KPN',
                    packageDetails: [
                        { packageType: 'bag', quantity: 10, rate: 70 }
                    ],
                    totalAmount: 700,
                    paidAmount: 200,
                    dueAmount: 500,
                    paymentBy: 'from',
                    paymentStatus: 'partial',
                    date: '2025-11-19',
                    tripId: 'TRP004'
                },
                {
                    id: 5,
                    packageId: 'PKG005',
                    fromCenter: 'Karur',
                    toCenter: 'Madurai',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '789 North Veli Street, Madurai',
                    fromMobile: customerMobile,
                    fromName: customerName,
                    toMobile: '7788996655',
                    toName: 'Priya Kumar',
                    tripName: 'VRL',
                    packageDetails: [
                        { packageType: 'bag', quantity: 15, rate: 70 }
                    ],
                    totalAmount: 1050,
                    paidAmount: 1050,
                    dueAmount: 0,
                    paymentBy: 'from',
                    paymentStatus: 'completed',
                    date: '2025-11-20',
                    tripId: 'TRP005'
                },
                {
                    id: 6,
                    packageId: 'PKG006',
                    fromCenter: 'Karur',
                    toCenter: 'Trichy',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '456 Cantonment, Trichy',
                    fromMobile: '9988776655', // Different sender - received by customer
                    fromName: 'Ramesh Kumar',
                    toMobile: customerMobile,
                    toName: customerName,
                    tripName: 'SRS',
                    packageDetails: [
                        { packageType: 'bag', quantity: 8, rate: 70 }
                    ],
                    totalAmount: 560,
                    paidAmount: 0,
                    dueAmount: 560,
                    paymentBy: 'to', // Receiver pays (customer receives)
                    paymentStatus: 'pending',
                    date: '2025-11-21',
                    tripId: 'TRP006'
                },
                {
                    id: 7,
                    packageId: 'PKG007',
                    fromCenter: 'Karur',
                    toCenter: 'Tirupur',
                    fromLocation: '123 Main Street, Karur',
                    toLocation: '456 Avinashi Road, Tirupur',
                    fromMobile: '8877665544', // Different sender - received by customer
                    fromName: 'Suresh Reddy',
                    toMobile: customerMobile,
                    toName: customerName,
                    tripName: 'GATI',
                    packageDetails: [
                        { packageType: 'bag', quantity: 12, rate: 70 }
                    ],
                    totalAmount: 840,
                    paidAmount: 300,
                    dueAmount: 540,
                    paymentBy: 'to', // Receiver pays (customer receives)
                    paymentStatus: 'partial',
                    date: '2025-11-22',
                    tripId: 'TRP007'
                }
            ];
            
            setAllShipments(dummyShipments);
            setSelectedCustomer({
                name: customerName,
                mobile: customerMobile
            });
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
        return moment(date).format('DD-MM-YY');
    };

    const formatFullDate = (date) => {
        if (!date) return moment().format('DD-MM-YYYY');
        return moment(date).format('DD-MM-YYYY');
    };

    // Format quantity with fractions
    const formatQuantity = (qty) => {
        if (!qty) return '0';
        const num = parseFloat(qty);
        if (Number.isInteger(num)) return num.toString();
        
        const whole = Math.floor(num);
        const fraction = num - whole;
        
        if (Math.abs(fraction - 0.5) < 0.01) return whole > 0 ? `${whole}½` : '½';
        if (Math.abs(fraction - 0.25) < 0.01) return whole > 0 ? `${whole}¼` : '¼';
        if (Math.abs(fraction - 0.75) < 0.01) return whole > 0 ? `${whole}¾` : '¾';
        
        return num.toString();
    };

    // Prepare table rows from all shipments
    const prepareTableRows = () => {
        if (!allShipments || allShipments.length === 0) return [];

        return allShipments.map((shipment, index) => {
            // Determine payment indicator
            let paymentIndicator;
            if (shipment.fromName === selectedCustomer?.name) {
                paymentIndicator = 'S';
            } else {
                paymentIndicator = 'R';
            }

            // Get the full mobile number
            const mobile = shipment.fromName === selectedCustomer?.name 
                ? shipment.toMobile 
                : shipment.fromMobile;

            const tripName = shipment.tripName || 'GEN';
            
            // Format: Date - Particular (with full mobile)
            const dateParticular = `${formatDate(shipment.date)} - ${tripName}-${mobile}(${paymentIndicator})`;

            // Get package details
            const packageDetail = shipment.packageDetails && shipment.packageDetails[0] 
                ? shipment.packageDetails[0] 
                : { packageType: 'bag', quantity: 0, rate: 0 };

            return {
                id: shipment.id,
                sno: index + 1,
                dateParticular: dateParticular,
                qty: packageDetail.quantity || 0,
                rate: packageDetail.rate || 0,
                amount: (packageDetail.quantity || 0) * (packageDetail.rate || 0)
            };
        });
    };

    const tableRows = prepareTableRows();

    // Calculate totals
    const totalAmount = tableRows.reduce((sum, row) => sum + row.amount, 0);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Ledger Bill - A5 Portrait */}
            <div
                id="ledger-bill-to-print"
                className="bg-white mx-auto ledger-container"
            >
                {/* Header with Phone Numbers on Right */}
                <div className="header-top">
                    <div className="header-left">
                        <span className="cash-bill">CASH BILL</span>
                    </div>
                    <div className="header-right">
                        <div>cell:95002 43118</div>
                        <div>95665 27118</div>
                    </div>
                </div>

                {/* Company Name and Address */}
                <div className="company-header">
                    <h1>SMS REGULAR SERVICE</h1>
                    <p className="address">M.G Road, Amman Petrol Bunk Near, Karur – 639002</p>
                </div>

                {/* Customer Info and Bill Date */}
                <div className="info-bar">
                    <span>M/s: {selectedCustomer?.name || '__________'} - {selectedCustomer?.mobile || '__________'}</span>
                    <span>Bill Date: {formatFullDate()}</span>
                </div>

                {/* Main Table */}
                <table className="ledger-table">
                    <thead>
                        <tr>
                            <th className="col-sno">S.No</th>
                            <th className="col-particular">Date - Particular</th>
                            <th className="col-rate">Rate</th>
                            <th className="col-qty">Qty</th>
                            <th className="col-amount">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.length > 0 ? (
                            tableRows.map((row) => (
                                <tr key={row.id}>
                                    <td className="col-sno">{row.sno}</td>
                                    <td className="col-particular">{row.dateParticular}</td>
                                    <td className="col-rate">{row.rate}</td>
                                    <td className="col-qty">{formatQuantity(row.qty)}</td>
                                    <td className="col-amount">{row.amount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">No transactions</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Total Amount */}
                <div className="total-section">
                    <span>Total Amount: ₹{totalAmount.toFixed(2)}</span>
                </div>

                {/* Footer with Thank You and Signature */}
                <div className="ledger-footer">
                    <div className="thankyou">
                        Thank You Visit Again
                    </div>
                    <div className="signature-area">
                        <div className="signature-text">Signature</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4 no-print">
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
                    Print Ledger Bill
                </button>
            </div>

            {/* Styles */}
            <style jsx>{`
                /* Ledger Container - A5 Portrait */
                .ledger-container {
                    width: 148mm;
                    max-width: 148mm;
                    min-width: 148mm;
                    margin: 0 auto;
                    padding: 3mm 4mm;
                    background: white;
                    font-family: 'Times New Roman', Times, serif;
                    border: 2px solid #333;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }

                /* Header Top with Phone Numbers */
                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2mm;
                    border-bottom: 1px dotted #333;
                    padding-bottom: 1mm;
                }

                .header-left {
                    font-size: 14pt;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .header-right {
                    font-size: 9pt;
                    text-align: right;
                    line-height: 1.2;
                }

                /* Company Header */
                .company-header {
                    text-align: center;
                    margin-bottom: 2mm;
                    border-bottom: 2px solid #333;
                    padding-bottom: 1mm;
                }

                .company-header h1 {
                    font-size: 16pt;
                    font-weight: bold;
                    margin: 0;
                    line-height: 1.2;
                    text-transform: uppercase;
                }

                .company-header .address {
                    font-size: 9pt;
                    margin: 0;
                    line-height: 1.2;
                }

                /* Info Bar */
                .info-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2mm;
                    font-size: 10pt;
                    padding-bottom: 1mm;
                }

                /* Table Styles - Reduced font by 3px (from 8pt to 5pt) */
                .ledger-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2mm;
                    font-size: 5pt;
                    table-layout: fixed;
                }

                .ledger-table th {
                    border: 1px solid #333;
                    padding: 1pt 0.5pt;
                    font-weight: bold;
                    text-align: center;
                    background: #f0f0f0;
                    font-size: 5pt;
                    white-space: nowrap;
                }

                .ledger-table td {
                    padding: 1pt 0.5pt;
                    vertical-align: middle;
                    border-left: 1px solid #333;
                    border-right: 1px solid #333;
                    border-bottom: none;
                    border-top: none;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 5pt;
                }

                .ledger-table td.col-rate,
                .ledger-table td.col-qty,
                .ledger-table td.col-amount {
                    text-align: right;
                }

                .ledger-table td.col-sno {
                    text-align: center;
                }

                .ledger-table td.col-particular {
                    text-align: left;
                }

                /* Column widths */
                .col-sno { width: 8%; }
                .col-particular { width: 52%; }
                .col-rate { width: 12%; }
                .col-qty { width: 10%; }
                .col-amount { width: 18%; }

                .no-data {
                    text-align: center;
                    padding: 2pt;
                    font-style: italic;
                    border-bottom: 1px solid #333 !important;
                }

                /* Total Section */
                .total-section {
                    margin: 1.5mm 0;
                    padding: 1mm 0;
                    border-top: 2px solid #333;
                    border-bottom: 2px solid #333;
                    text-align: right;
                    font-size: 11pt;
                    font-weight: bold;
                }

                /* Footer with Signature */
                .ledger-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 1.5mm;
                }

                .thankyou {
                    font-size: 10pt;
                    font-style: italic;
                    font-weight: bold;
                }

                .signature-area {
                    text-align: center;
                }

                .signature-text {
                    font-size: 8pt;
                }

                /* Print Styles */
                @media print {
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 148mm !important;
                        height: 210mm !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    #ledger-bill-to-print,
                    #ledger-bill-to-print * {
                        visibility: visible;
                    }

                    #ledger-bill-to-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 148mm;
                        height: 210mm;
                        margin: 0 !important;
                        padding: 3mm 4mm !important;
                        border: 2px solid #333 !important;
                        box-shadow: none !important;
                        page-break-after: avoid;
                        page-break-inside: avoid;
                        box-sizing: border-box;
                    }

                    .no-print {
                        display: none !important;
                    }

                    @page {
                        size: A5 portrait;
                        margin: 0;
                    }

                    .ledger-table th {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default PackageReportPrint;