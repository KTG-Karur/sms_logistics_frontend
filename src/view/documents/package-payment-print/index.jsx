import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';
import { getCustomerPendingPayments } from '../../../redux/customerPaymentSlice';
import { showMessage } from '../../../util/AllFunction';

const PackageReportPrint = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { customerId } = useParams();

    const [pendingPayments, setPendingPayments] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [pendingShipments, setPendingShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generatedDate, setGeneratedDate] = useState(moment().format('DD-MM-YYYY'));

    useEffect(() => {
        if (location.state?.customer) {
            const { customer } = location.state;
            setSelectedCustomer(customer);
            fetchPendingPayments(customer.customer_id);
        } else if (customerId) {
            fetchPendingPayments(customerId);
        } else {
            showMessage('error', 'Customer data not found');
            navigate('/package/payment');
        }
    }, [location.state, customerId, navigate]);

    const fetchPendingPayments = async (id) => {
        setLoading(true);
        try {
            const result = await dispatch(getCustomerPendingPayments(id)).unwrap();

            if (result?.data) {
                setPendingPayments(result.data);
                
                // Filter to only show bookings where customer is responsible for payment
                const allPending = result.data.pending_bookings || [];
                const customerPaysShipments = allPending.filter(
                    shipment => shipment.is_responsible_for_payment === true
                );
                
                setPendingShipments(customerPaysShipments);
                
                setSelectedCustomer({
                    customer_id: result.data.customer_id,
                    customer_name: result.data.customer_info?.customer_name || 'Customer',
                    customer_number: result.data.customer_info?.customer_number || 'N/A',
                    summary: result.data.summary
                });
            }
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            showMessage('error', 'Failed to load pending payments');
        } finally {
            setLoading(false);
        }
    };

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

    // Safe number parsing function
    const parseNumber = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Format quantity with fractions
    const formatQuantity = (qty) => {
        const num = parseNumber(qty);
        if (num === 0) return '0';
        if (Number.isInteger(num)) return num.toString();
        
        const whole = Math.floor(num);
        const fraction = num - whole;
        
        if (Math.abs(fraction - 0.5) < 0.01) return whole > 0 ? `${whole}½` : '½';
        if (Math.abs(fraction - 0.25) < 0.01) return whole > 0 ? `${whole}¼` : '¼';
        if (Math.abs(fraction - 0.75) < 0.01) return whole > 0 ? `${whole}¾` : '¾';
        
        return num.toFixed(2);
    };

    // Format currency
    const formatCurrency = (value) => {
        const num = parseNumber(value);
        return num.toFixed(2);
    };

    // Prepare table rows - each package as a separate row with paid amount
    const prepareTableRows = () => {
        if (!pendingShipments || pendingShipments.length === 0) return [];

        const rows = [];
        let serialNo = 1;
        
        pendingShipments.forEach((shipment) => {
            // Determine counterparty (other party's details)
            const isSender = shipment.from_customer_id === selectedCustomer?.customer_id;
            const counterparty = isSender ? shipment.receiver : shipment.sender;
            const counterpartyName = counterparty?.customer_name || 'Unknown';
            const counterpartyNumber = counterparty?.customer_number || 'N/A';
            
            // Format date
            const formattedDate = formatDate(shipment.booking_date);
            
            // Get payment information from payment_progress
            const totalAmount = parseNumber(shipment.payment_progress?.total || shipment.total_amount);
            const paidAmount = parseNumber(shipment.payment_progress?.paid || shipment.paid_amount);
            const dueAmount = parseNumber(shipment.payment_progress?.due || shipment.due_amount);
            
            // Get packages
            const packages = shipment.packages || [];
            
            if (packages.length > 0) {
                // Calculate proportional paid amount based on package quantity if multiple packages
                const totalPackageQuantity = packages.reduce((sum, pkg) => sum + parseNumber(pkg.quantity), 0);
                
                packages.forEach((pkg) => {
                    const packageType = pkg.packageType?.package_type_name || 'Package';
                    const quantity = parseNumber(pkg.quantity);
                    const packageAmount = parseNumber(pkg.total_package_charge);
                    
                    // Calculate proportional paid amount for this package
                    const packagePaidAmount = totalPackageQuantity > 0 
                        ? (paidAmount * (quantity / totalPackageQuantity))
                        : 0;
                    
                    const rate = quantity > 0 ? packageAmount / quantity : 0;
                    
                    rows.push({
                        id: `row-${shipment.booking_id}-${pkg.booking_package_id || Math.random()}`,
                        sno: serialNo++,
                        dateParticular: `${formattedDate} - ${counterpartyName} (${counterpartyNumber})`,
                        packageType: packageType,
                        rate: rate,
                        qty: quantity,
                        amount: packageAmount,
                        paidAmount: packagePaidAmount,
                        dueAmount: packageAmount - packagePaidAmount
                    });
                });
            } else {
                // If no packages, create a default row
                rows.push({
                    id: `row-${shipment.booking_id}`,
                    sno: serialNo++,
                    dateParticular: `${formattedDate} - ${counterpartyName} (${counterpartyNumber})`,
                    packageType: 'General',
                    rate: totalAmount,
                    qty: 1,
                    amount: totalAmount,
                    paidAmount: paidAmount,
                    dueAmount: dueAmount
                });
            }
        });

        return rows;
    };

    const tableRows = prepareTableRows();

    // Calculate totals
    const totalAmount = tableRows.reduce((sum, row) => sum + parseNumber(row.amount), 0);
    const totalPaid = tableRows.reduce((sum, row) => sum + parseNumber(row.paidAmount), 0);
    const totalDue = tableRows.reduce((sum, row) => sum + parseNumber(row.dueAmount), 0);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading pending payments...</p>
                </div>
            </div>
        );
    }

    // Show message if no shipments where customer needs to pay
    if (pendingShipments.length === 0) {
        return (
            <div className="p-4 bg-gray-100 min-h-screen">
                <div className="bg-white mx-auto ledger-container flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">No Pending Payments</h2>
                        <p className="text-gray-600 mb-6">You have no bills that need to be paid.</p>
                        <button
                            onClick={handleBack}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Ledger Bill - A5 Portrait */}
            <div
                id="ledger-bill-to-print"
                className="bg-white mx-auto ledger-container"
            >
                {/* Header with Cash Bill - reduced to 10px */}
                <div className="header-section">
                    <div className="cash-bill">CASH BILL</div>
                    <div className="phone-numbers">
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
                    <div>
                        <span>M/s: {selectedCustomer?.customer_name || '__________'} - {selectedCustomer?.customer_number || '__________'}</span>
                    </div>
                    <div>
                        <span>Bill Date: {formatFullDate(generatedDate)}</span>
                    </div>
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
                            <th className="col-paid">Paid</th>
                            <th className="col-due">Due</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows.length > 0 ? (
                            tableRows.map((row) => (
                                <tr key={row.id}>
                                    <td className="col-sno">{row.sno}</td>
                                    <td className="col-particular">{row.dateParticular} - {row.packageType}</td>
                                    <td className="col-rate">₹{formatCurrency(row.rate)}</td>
                                    <td className="col-qty">{formatQuantity(row.qty)}</td>
                                    <td className="col-amount">₹{formatCurrency(row.amount)}</td>
                                    <td className="col-paid">₹{formatCurrency(row.paidAmount)}</td>
                                    <td className="col-due">₹{formatCurrency(row.dueAmount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">No pending payments found</td>
                            </tr>
                        )}
                        
                        {/* Summary Rows */}
                        {tableRows.length > 0 && (
                            <>
                                <tr className="summary-row">
                                    <td colSpan="4" className="summary-label-cell">Total Amount</td>
                                    <td className="summary-value-cell">₹{formatCurrency(totalAmount)}</td>
                                    <td className="summary-value-cell">₹{formatCurrency(totalPaid)}</td>
                                    <td className="summary-value-cell">₹{formatCurrency(totalDue)}</td>
                                </tr>
                                
                                {/* Balance Calculation Row */}
                                <tr className="balance-row">
                                    <td colSpan="6" className="balance-label-cell">
                                        Net Payable (Total - Paid)
                                    </td>
                                    <td className="balance-value-cell">
                                        ₹{formatCurrency(totalDue)}
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>

                {/* Footer with Thank You and Signature */}
                <div className="ledger-footer">
                    <div className="thankyou">Thank You Visit Again</div>
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
                    Print Cash Bill
                </button>
            </div>

            {/* Styles */}
            <style jsx>{`
                /* Ledger Container - A5 Portrait */
                .ledger-container {
                    width: 148mm;
                    max-width: 148mm;
                    min-width: 148mm;
                    height: 210mm;
                    margin: 0 auto;
                    padding: 3mm 4mm;
                    background: white;
                    font-family: 'Times New Roman', Times, serif;
                    border: 1px solid #ccc;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    box-sizing: border-box;
                    overflow: hidden;
                    page-break-inside: avoid;
                    break-inside: avoid;
                    display: flex;
                    flex-direction: column;
                }

                /* Header Section */
                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2mm;
                }

                .cash-bill {
                    font-size: 10px; /* Reduced to 10px */
                    font-weight: bold;
                    text-transform: uppercase;
                    color: #000;
                    flex: 1;
                    text-align: center;
                }

                .phone-numbers {
                    font-size: 9pt;
                    text-align: right;
                    line-height: 1.2;
                    min-width: 80px;
                }

                /* Company Header */
                .company-header {
                    text-align: center;
                    margin-bottom: 2mm;
                    border-bottom: 1px solid #ccc;
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
                    margin-bottom: 3mm;
                    font-size: 10pt;
                    padding-bottom: 1mm;
                    border-bottom: 1px dashed #ccc;
                }

                /* Table Styles */
                .ledger-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8.5pt;
                    table-layout: fixed;
                    flex: 1;
                }

                .ledger-table th {
                    border: 1px solid #aaa;
                    padding: 3pt 2pt;
                    font-weight: bold;
                    text-align: center;
                    background: white;
                    font-size: 8.5pt;
                }

                .ledger-table td {
                    border-left: 1px solid #aaa;
                    border-right: 1px solid #aaa;
                    padding: 3pt 2pt;
                    vertical-align: middle;
                    font-size: 8.5pt;
                }

                /* Column widths */
                .col-sno { width: 6%; }
                .col-particular { width: 40%; }
                .col-rate { width: 10%; }
                .col-qty { width: 8%; }
                .col-amount { width: 12%; }
                .col-paid { width: 12%; }
                .col-due { width: 12%; }

                /* Alignment */
                .col-sno { text-align: center; }
                .col-particular { text-align: left; }
                .col-rate { text-align: right; }
                .col-qty { text-align: right; }
                .col-amount { text-align: right; }
                .col-paid { text-align: right; }
                .col-due { text-align: right; }

                /* Summary and Balance Rows */
                .summary-row td,
                .balance-row td {
                    border-top: 1px solid #aaa;
                    border-bottom: 1px solid #aaa;
                    font-weight: bold;
                    padding: 4pt 2pt;
                }

                .summary-label-cell {
                    text-align: right;
                    font-size: 10pt;
                    padding-right: 10px;
                }

                .summary-value-cell {
                    text-align: right;
                    font-size: 10pt;
                }

                .balance-label-cell {
                    text-align: right;
                    font-size: 11pt;
                    font-weight: bold;
                    padding-right: 10px;
                    color: #000;
                }

                .balance-value-cell {
                    text-align: right;
                    font-size: 11pt;
                    font-weight: bold;
                    color: #000;
                    border-left: 1px solid #aaa;
                }

                .balance-row {
                    background-color: #f0f0f0;
                }

                .no-data {
                    text-align: center;
                    padding: 4pt;
                    font-style: italic;
                }

                /* Footer with Thank You and Signature */
                .ledger-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: auto;
                    padding-top: 3mm;
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
                    font-size: 10pt;
                    border-top: 1px solid #aaa;
                    padding-top: 2pt;
                    min-width: 40mm;
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
                        border: 1px solid #ccc !important;
                        box-shadow: none !important;
                        page-break-after: avoid;
                        page-break-inside: avoid;
                        break-inside: avoid;
                        box-sizing: border-box;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }

                    .no-print {
                        display: none !important;
                    }

                    @page {
                        size: A5 portrait;
                        margin: 0;
                    }

                    .ledger-table th,
                    .ledger-table td {
                        border-color: #aaa !important;
                    }

                    .balance-row {
                        background-color: #f0f0f0 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default PackageReportPrint;