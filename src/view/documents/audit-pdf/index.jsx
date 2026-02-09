import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconBack from '../../../components/Icon/IconArrowLeft';
import moment from 'moment';

const PackageReportPrint = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [reportData, setReportData] = useState(null);

    // Default data structure if no data is passed
    const defaultReportData = {
        packageId: 'PKG-2024-001',
        tripId: 'TRP-2024-001',
        trackingNumber: 'TRK-789456123',
        status: 'Delivered',
        date: '2024-01-15',
        
        // Route Information
        fromCenter: 'Chennai Central Hub',
        fromLocation: '123 Main Street, Chennai',
        toCenter: 'Bangalore South Terminal',
        toLocation: '456 Park Avenue, Bangalore',
        distance: '350 km',
        estimatedDuration: '5 hours',
        actualDuration: '5 hours 15 mins',
        
        // Customer Information
        senderName: 'John Doe',
        senderMobile: '9876543210',
        receiverName: 'Robert Johnson',
        receiverMobile: '8765432109',
        
        // Package Details
        packageDetails: [
            { packageType: 'Box', quantity: 2, rate: 100, pickupPrice: 30, dropPrice: 45, total: 275 },
            { packageType: 'Document', quantity: 1, rate: 50, pickupPrice: 15, dropPrice: 25, total: 90 }
        ],
        totalWeight: '30 kg',
        dimensions: 'Various sizes',
        packageValue: '₹5000',
        notes: 'Fragile items - Handle with care',
        specialInstructions: 'Deliver before 3 PM',
        
        // Payment Information
        totalAmount: 365,
        paymentBy: 'sender',
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        paidAmount: 365,
        dueAmount: 0,
        paymentDate: '2024-01-15',
        
        // Trip Details
        tripDate: '2024-01-15',
        tripStatus: 'Completed',
        departureTime: '09:00 AM',
        arrivalTime: '02:00 PM',
        currentLocation: 'Bangalore South Terminal',
        lastUpdated: '2024-01-15 14:00',
        
        // Vehicle Details
        vehicleNumber: 'TN-01-AB-1234',
        vehicleType: 'Tata Ace',
        vehicleCapacity: '1 ton',
        vehicleModel: '2022',
        insuranceNumber: 'INS-789456',
        insuranceExpiry: '2025-12-31',
        
        // Driver Details
        driverName: 'Rajesh Kumar',
        driverMobile: '9876543211',
        driverLicense: 'DL-7894561230',
        driverExpiry: '2026-05-15',
        
        // Load Man Details
        loadManName: 'Suresh Patel',
        loadManMobile: '9876543212',
        
        // Delivery Details
        deliveryTime: '2024-01-15 14:15',
        receivedBy: 'Robert Johnson',
        receiverSignature: true,
        deliveryProof: 'signed_document.jpg',
        
        // Audit Information
        scannedBy: 'Kumar Swamy',
        scannedDate: '2024-01-15 08:30',
        verifiedBy: 'Mohan Reddy',
        verifiedDate: '2024-01-15 08:45',
        
        // Additional Information
        loadingTime: '08:45 AM',
        unloadingTime: '02:10 PM',
        fuelConsumed: '25 liters',
        routeTaken: 'Chennai - Vellore - Krishnagiri - Bangalore',
        
        // Documents
        documents: ['invoice.pdf', 'packing_list.pdf', 'delivery_receipt.pdf']
    };

    useEffect(() => {
        if (location.state?.reportData) {
            setReportData(location.state.reportData);
        } else {
            setReportData(defaultReportData);
        }
    }, [location.state]);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };

    const formatDateTime = (dateTime) => {
        return moment(dateTime).format('DD/MM/YYYY HH:mm');
    };

    // Calculate totals
    const calculateTotals = () => {
        if (!reportData) return { items: 0, totalAmount: 0 };
        
        const items = reportData.packageDetails?.length || 0;
        const totalAmount = reportData.totalAmount || 0;
        
        return { items, totalAmount };
    };

    const totals = calculateTotals();
    const data = reportData || defaultReportData;

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area - PAPER FORM STYLE */}
            <div
                id="package-report-to-print"
                className="bg-white mx-auto"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
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
                                src="/assets/images/Asian logo_02.png"
                                alt="Company Logo"
                                style={{
                                    maxWidth: '140px',
                                    maxHeight: '40px',
                                    objectFit: 'contain',
                                }}
                            />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 4px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.2' }}>COMPREHENSIVE PACKAGE DELIVERY REPORT</div>
                        </td>
                    </tr>
                </table>

                {/* REPORT HEADER */}
                <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{
                        marginBottom: '4mm',
                        border: 'none',
                    }}
                >
                    <tr>
                        <td
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '10pt',
                                fontWeight: 'bold',
                                textAlign: 'left',
                                padding: 0,
                            }}
                        >
                            Package & Delivery Tracking Report :
                        </td>

                        <td
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '10pt',
                                textAlign: 'right',
                                padding: 0,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {data.packageId} : {formatDate(data.date)}
                        </td>
                    </tr>
                </table>

                {/* PACKAGE INFORMATION SECTION */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '10pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            SECTION 1: PACKAGE & TRACKING INFORMATION
                        </td>
                    </tr>
                    
                    {/* Package ID & Trip ID */}
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Package ID:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', color: '#1e40af' }}>
                            {data.packageId}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Trip ID:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', color: '#7c3aed' }}>
                            {data.tripId}
                        </td>
                    </tr>

                    {/* Tracking No & Status */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Tracking Number:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.trackingNumber}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Status:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', 
                            color: data.status === 'Delivered' ? '#059669' : 
                                   data.status === 'In Transit' ? '#2563eb' : 
                                   data.status === 'Pending' ? '#f59e0b' : '#dc2626' }}>
                            {data.status}
                        </td>
                    </tr>

                    {/* Package Date & Last Updated */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>Package Date:</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>{formatDate(data.date)}</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>Last Updated:</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>{formatDateTime(data.lastUpdated)}</td>
                    </tr>
                </table>

                {/* ROUTE INFORMATION */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '10pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            SECTION 2: ROUTE & TRANSPORT INFORMATION
                        </td>
                    </tr>
                    
                    {/* From Center & To Center */}
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            From Center:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            {data.fromCenter}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            To Center:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            {data.toCenter}
                        </td>
                    </tr>

                    {/* From Location & To Location */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            From Location:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#eff6ff' }}>
                            {data.fromLocation}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            To Location:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            {data.toLocation}
                        </td>
                    </tr>

                    {/* Distance & Duration */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Distance:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.distance}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Est. Duration:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.estimatedDuration}
                        </td>
                    </tr>

                    {/* Route Taken */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Route Taken:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.routeTaken}
                        </td>
                    </tr>

                    {/* Current Location */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fef3c7' }}>
                            Current Location:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#fef3c7' }}>
                            {data.currentLocation}
                        </td>
                    </tr>
                </table>

                {/* CUSTOMER INFORMATION */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '10pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center', fontSize: '11pt', backgroundColor: '#f0f0f0' }}>
                            SECTION 3: CUSTOMER INFORMATION
                        </td>
                    </tr>
                    
                    {/* Sender Information */}
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#eff6ff', textAlign: 'center' }}>
                            SENDER DETAILS
                        </td>
                    </tr>
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Name:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.senderName}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Mobile:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.senderMobile}
                        </td>
                    </tr>

                    {/* Receiver Information */}
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#ecfdf5', textAlign: 'center' }}>
                            RECEIVER DETAILS
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Name:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.receiverName}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Mobile:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.receiverMobile}
                        </td>
                    </tr>
                </table>

                {/* PACKAGE DETAILS TABLE */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="7" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            SECTION 4: PACKAGE DETAILS
                        </td>
                    </tr>
                    <tr>
                        <th width="5%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>
                            S.No
                        </th>
                        <th width="25%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'left', fontWeight: 'bold', fontSize: '9pt' }}>
                            Package Type
                        </th>
                        <th width="10%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>
                            Quantity
                        </th>
                        <th width="12%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>
                            Rate (₹)
                        </th>
                        <th width="12%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>
                            Pickup (₹)
                        </th>
                        <th width="12%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>
                            Drop (₹)
                        </th>
                        <th width="14%" style={{ border: '1px solid #000', padding: '3px 4px', textAlign: 'center', fontWeight: 'bold', fontSize: '9pt' }}>
                            Total (₹)
                        </th>
                    </tr>

                    {data.packageDetails?.map((pkg, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', verticalAlign: 'top' }}>{pkg.packageType}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>{pkg.quantity}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>₹{pkg.rate}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>₹{pkg.pickupPrice}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top' }}>₹{pkg.dropPrice}</td>
                            <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold' }}>₹{pkg.total}</td>
                        </tr>
                    ))}

                    {/* SUMMARY ROW */}
                    <tr>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '3px 4px', fontSize: '9pt', fontWeight: 'bold', textAlign: 'right' }}>
                            TOTAL AMOUNT:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold', fontSize: '10pt', color: '#1e40af' }}>
                            ₹{data.totalAmount}
                        </td>
                    </tr>
                </table>

                {/* PACKAGE SPECIFICATIONS & NOTES */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '10pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            PACKAGE SPECIFICATIONS
                        </td>
                    </tr>
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Total Weight:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.totalWeight}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Dimensions:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.dimensions}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Package Value:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', color: '#059669' }}>
                            {data.packageValue}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            No. of Items:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.packageDetails?.length || 0}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Notes:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.notes}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Special Instructions:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#fef3c7' }}>
                            {data.specialInstructions}
                        </td>
                    </tr>
                </table>

                {/* PAYMENT INFORMATION */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            SECTION 5: PAYMENT INFORMATION
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Total Amount:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', fontSize: '11pt', color: '#1e40af' }}>
                            ₹{data.totalAmount}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Payment Status:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', 
                            color: data.paymentStatus === 'Paid' ? '#059669' : '#dc2626' }}>
                            {data.paymentStatus}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Payment By:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.paymentBy === 'sender' ? 'Sender' : 'Receiver'}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Payment Method:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.paymentMethod}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            Paid Amount:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#ecfdf5', fontWeight: 'bold', color: '#059669' }}>
                            ₹{data.paidAmount}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#fee2e2' }}>
                            Due Amount:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#fee2e2', fontWeight: 'bold', color: '#dc2626' }}>
                            ₹{data.dueAmount}
                        </td>
                    </tr>

                    {data.paymentDate && (
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                Payment Date:
                            </td>
                            <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                                {formatDate(data.paymentDate)}
                            </td>
                        </tr>
                    )}
                </table>

                {/* VEHICLE, DRIVER & LOAD MAN DETAILS */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            SECTION 6: VEHICLE & CREW INFORMATION
                        </td>
                    </tr>
                    
                    {/* Vehicle Details Header */}
                    <tr>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#e0e7ff', textAlign: 'center' }}>
                            VEHICLE DETAILS
                        </td>
                    </tr>
                    <tr>
                        <td width="20%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Vehicle Number:
                        </td>
                        <td width="30%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', color: '#7c3aed' }}>
                            {data.vehicleNumber}
                        </td>
                        <td width="20%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Vehicle Type:
                        </td>
                        <td width="30%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.vehicleType}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Capacity:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.vehicleCapacity}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Model:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.vehicleModel}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Insurance No:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.insuranceNumber}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Insurance Expiry:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {formatDate(data.insuranceExpiry)}
                        </td>
                    </tr>

                    {/* Driver Details Header */}
                    <tr>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#dbeafe', textAlign: 'center' }}>
                            DRIVER DETAILS
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Driver Name:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', color: '#1e40af' }}>
                            {data.driverName}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Driver Mobile:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.driverMobile}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            License Number:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.driverLicense}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            License Expiry:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {formatDate(data.driverExpiry)}
                        </td>
                    </tr>

                    {/* Load Man Details Header */}
                    <tr>
                        <td colspan="6" style={{ border: '1px solid #000', padding: '2px 4px', fontWeight: 'bold', backgroundColor: '#d1fae5', textAlign: 'center' }}>
                            LOAD MAN DETAILS
                        </td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Load Man Name:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold', color: '#059669' }}>
                            {data.loadManName}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Load Man Mobile:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.loadManMobile}
                        </td>
                    </tr>
                </table>

                {/* TRIP & DELIVERY DETAILS */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            SECTION 7: TRIP & DELIVERY DETAILS
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Trip Date:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {formatDate(data.tripDate)}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Trip Status:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold',
                            color: data.tripStatus === 'Completed' ? '#059669' :
                                   data.tripStatus === 'In Progress' ? '#2563eb' :
                                   data.tripStatus === 'Delayed' ? '#f59e0b' : '#dc2626' }}>
                            {data.tripStatus}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Departure Time:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.departureTime}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Arrival Time:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.arrivalTime}
                        </td>
                    </tr>

                    {data.actualDuration && (
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                Actual Duration:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                                {data.actualDuration}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                Fuel Consumed:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                                {data.fuelConsumed}
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            Delivery Time:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#ecfdf5' }}>
                            {data.deliveryTime ? formatDateTime(data.deliveryTime) : 'Not Delivered Yet'}
                        </td>
                    </tr>

                    {data.receivedBy && (
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle', backgroundColor: '#d1fae5' }}>
                                Received By:
                            </td>
                            <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', backgroundColor: '#d1fae5', fontWeight: 'bold' }}>
                                {data.receivedBy}
                            </td>
                        </tr>
                    )}

                    {data.loadingTime && data.unloadingTime && (
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                Loading Time:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                                {data.loadingTime}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                                Unloading Time:
                            </td>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                                {data.unloadingTime}
                            </td>
                        </tr>
                    )}
                </table>

                {/* AUDIT & VERIFICATION */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            SECTION 8: AUDIT & VERIFICATION
                        </td>
                    </tr>
                    
                    <tr>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Scanned By:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.scannedBy}
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Scanned Date:
                        </td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.scannedDate ? formatDateTime(data.scannedDate) : 'N/A'}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Verified By:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.verifiedBy}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Verified Date:
                        </td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.verifiedDate ? formatDateTime(data.verifiedDate) : 'N/A'}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Delivery Proof:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle' }}>
                            {data.deliveryProof || 'Not Available'}
                        </td>
                    </tr>

                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            Receiver Signature:
                        </td>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', verticalAlign: 'middle', fontWeight: 'bold',
                            color: data.receiverSignature ? '#059669' : '#dc2626' }}>
                            {data.receiverSignature ? 'YES - Signature Obtained' : 'NO - Signature Not Obtained'}
                        </td>
                    </tr>
                </table>

                {/* DOCUMENTS */}
                {data.documents && data.documents.length > 0 && (
                    <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                                ATTACHED DOCUMENTS
                            </td>
                        </tr>
                        <tr>
                            <td style={{ border: '1px solid #000', padding: '6px 8px', lineHeight: '1.3' }}>
                                {data.documents.map((doc, index) => (
                                    <div key={index} style={{ marginBottom: '2px' }}>
                                        {index + 1}. {doc}
                                    </div>
                                ))}
                            </td>
                        </tr>
                    </table>
                )}

                {/* SIGNATURE SECTION */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colspan="3" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
                            AUDIT CONCLUSION & SIGNATURES
                        </td>
                    </tr>
                    <tr>
                        <td width="33%" style={{ border: '1px solid #000', padding: '8px 6px', textAlign: 'center', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '10px' }}>
                                {data.status === 'Delivered' ? 'DELIVERY SUCCESSFUL' : 
                                 data.status === 'In Transit' ? 'IN PROGRESS' : 
                                 data.status === 'Pending' ? 'PENDING DELIVERY' : 'DELIVERY ISSUE'}
                            </div>
                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '0 auto', paddingTop: '8px' }}>
                                <div style={{ fontSize: '9pt' }}>Report Generation Date</div>
                                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginTop: '3px' }}>{moment().format('DD/MM/YYYY HH:mm')}</div>
                            </div>
                        </td>
                        <td width="34%" style={{ border: '1px solid #000', padding: '8px 6px', textAlign: 'center', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '5px' }}>OPERATIONS MANAGER</div>
                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '15px auto 0', paddingTop: '8px' }}>
                                <div style={{ fontSize: '9pt' }}>Asian Logistics Operations</div>
                                <div style={{ fontSize: '8pt', marginTop: '2px' }}>Authorized Signature</div>
                            </div>
                        </td>
                        <td width="33%" style={{ border: '1px solid #000', padding: '8px 6px', textAlign: 'center', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '5px' }}>CUSTOMER ACKNOWLEDGEMENT</div>
                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '15px auto 0', paddingTop: '8px' }}>
                                <div style={{ fontSize: '9pt' }}>{data.receiverName || 'Customer'}</div>
                                <div style={{ fontSize: '8pt', marginTop: '2px' }}>Receiver Signature</div>
                            </div>
                        </td>
                    </tr>
                </table>

                {/* FOOTER */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', fontSize: '8pt' }}>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center' }}>
                            <div>--- END OF PACKAGE REPORT ---</div>
                            <div style={{ marginTop: '2px' }}>
                                Report ID: {data.packageId} | Generated on: {moment().format('DD/MM/YYYY HH:mm')} | Page 1 of 1
                            </div>
                            <div style={{ marginTop: '2px' }}>
                                Package Items: {data.packageDetails?.length || 0} | Total Value: ₹{data.totalAmount} | Status: {data.status} | 
                                Payment: {data.paymentStatus} | Vehicle: {data.vehicleNumber}
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
                        width: 210mm !important;
                        height: auto !important;
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
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
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
                    }

                    th, td {
                        padding: 3px 4px !important;
                        border: 0.5px solid #000 !important;
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                        vertical-align: top !important;
                    }

                    #package-report-to-print > div {
                        margin-bottom: 8mm !important;
                    }

                    #package-report-to-print > div:last-child {
                        position: relative !important;
                        bottom: 0 !important;
                        margin-top: 10mm !important;
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

                    /* Border colors */
                    div[style*="border: 1px solid #d1fae5"] {
                        border: 1px solid #d1fae5 !important;
                    }
                    
                    div[style*="border: 1px solid #dbeafe"] {
                        border: 1px solid #dbeafe !important;
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