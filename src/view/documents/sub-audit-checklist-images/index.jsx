import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCancel from '../../../components/Icon/IconX';
import IconDownload from '../../../components/Icon/IconFile';
import IconEye from '../../../components/Icon/IconEye';
import IconClose from '../../../components/Icon/IconXCircle';
import moment from 'moment';

const AuditImagesPrintPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const printRef = useRef();

    const [auditData, setAuditData] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);

    // Static audit data with images for demonstration
    const staticAuditData = {
        auditId: 'AUD-2024-001',
        auditDate: '2024-01-15',
        supplierName: 'Precision Engineering Works',
        supplierType: 'Machining & Fabrication',
        auditorName: 'Rajesh Kumar',
        visitDate: '2024-01-15',
        status: 'Completed',

        images: [
            {
                id: 1,
                title: 'Factory Entrance',
                checklistId: 1,
                itemId: 1.1,
                url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Main entrance with security check and visitor management system',
                uploadDate: '2024-01-15',
                checklistReference: '1. MANAGEMENT SYSTEM - Item 1.1',
            },
            {
                id: 2,
                title: 'Production Area',
                checklistId: 5,
                itemId: 5.1,
                url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Clean and organized production floor with proper material flow',
                uploadDate: '2024-01-15',
                checklistReference: '5. PRODUCTION FACILITIES - Item 5.1',
            },
            {
                id: 3,
                title: 'Safety Equipment',
                checklistId: 2,
                itemId: 2.2,
                url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Fire extinguishers properly maintained and accessible',
                uploadDate: '2024-01-15',
                checklistReference: '2. HEALTH & SAFETY - Item 2.2',
            },
            {
                id: 4,
                title: 'Worker Facilities',
                checklistId: 6,
                itemId: 6.3,
                url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Clean cafeteria area for workers with proper seating arrangement',
                uploadDate: '2024-01-15',
                checklistReference: '6. WORKER WELFARE - Item 6.3',
            },
            {
                id: 5,
                title: 'Quality Check Station',
                checklistId: 4,
                itemId: 4.1,
                url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Quality control station with measuring instruments',
                uploadDate: '2024-01-15',
                checklistReference: '4. QUALITY CONTROL - Item 4.1',
            },
            {
                id: 6,
                title: 'Documentation Room',
                checklistId: 7,
                itemId: 7.1,
                url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Proper documentation storage with controlled access',
                uploadDate: '2024-01-15',
                checklistReference: '7. DOCUMENTATION - Item 7.1',
            },
            {
                id: 7,
                title: 'Machine Maintenance',
                checklistId: 11,
                itemId: 11.2,
                url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Regular machine maintenance logs displayed',
                uploadDate: '2024-01-15',
                checklistReference: '11. EQUIPMENT MAINTENANCE - Item 11.2',
            },
            {
                id: 8,
                title: 'Emergency Exit',
                checklistId: 9,
                itemId: 9.1,
                url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
                description: 'Clearly marked emergency exits with proper signage',
                uploadDate: '2024-01-15',
                checklistReference: '9. EMERGENCY PREPAREDNESS - Item 9.1',
            },
        ],
    };

    useEffect(() => {
        if (location.state?.auditData) {
            setAuditData(location.state.auditData);
            setImages(location.state.images || location.state.auditData?.images || []);
        } else {
            setAuditData(staticAuditData);
            setImages(staticAuditData.images);
        }
    }, [location.state]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Images Report - ${auditData?.auditId || ''}</title>
                <style>
                    @page {
                        size: A4 landscape;
                        margin: 15mm;
                    }
                    
                    body {
                        font-family: 'Times New Roman', serif;
                        margin: 0;
                        padding: 15mm;
                        font-size: 10pt;
                        line-height: 1.2;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 4mm;
                        page-break-inside: avoid;
                    }
                    
                    th, td {
                        border: 1px solid #000;
                        padding: 2px 3px;
                        vertical-align: top;
                    }
                    
                    th {
                        font-weight: bold;
                        text-align: center;
                    }
                    
                    img {
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                    }
                    
                    .checklist-group {
                        page-break-inside: avoid;
                    }
                    
                    .image-container {
                        border: 1px solid #000;
                        background: #f8f8f8;
                        overflow: hidden;
                    }
                    
                    .view-button {
                        display: none;
                    }
                </style>
            </head>
            <body>
                ${printRef.current.innerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for images to load before printing
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        };
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleDownload = () => {
        alert('PDF download functionality would be implemented here');
    };

    const handleViewImage = (image) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    const formatDate = (date) => {
        return moment(date).format('DD/MM/YYYY');
    };

    // Group images by checklist for better organization
    const groupImagesByChecklist = () => {
        const groups = {};
        images.forEach((image) => {
            const key = `Checklist ${image.checklistId}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(image);
        });
        return groups;
    };

    const checklistGroups = groupImagesByChecklist();
    const groupedKeys = Object.keys(checklistGroups);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Printable Area - LANDSCAPE ORIENTATION WITH 4 IMAGES PER ROW */}
            <div
                ref={printRef}
                id="audit-images-report"
                className="bg-white mx-auto"
                style={{
                    width: '297mm',
                    minHeight: '210mm',
                    height: 'auto',
                    padding: '15mm',
                    fontFamily: '"Times New Roman", serif',
                    boxSizing: 'border-box',
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
                            <div style={{ fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '1.2' }}>AUDIT IMAGES REPORT - SUPPORTING EVIDENCE</div>
                        </td>
                    </tr>
                </table>

                {/* AUDIT INFORMATION */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colSpan="6" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                            AUDIT INFORMATION
                        </td>
                    </tr>
                    <tr>
                        <td width="15%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Audit ID:</td>
                        <td width="20%" style={{ border: '1px solid #000', padding: '3px 6px' }}>{auditData?.auditId}</td>
                        <td width="15%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Supplier:</td>
                        <td width="25%" style={{ border: '1px solid #000', padding: '3px 6px' }}>{auditData?.supplierName}</td>
                        <td width="15%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Auditor:</td>
                        <td width="10%" style={{ border: '1px solid #000', padding: '3px 6px' }}>{auditData?.auditorName}</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Audit Date:</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{formatDate(auditData?.auditDate)}</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Supplier Type:</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{auditData?.supplierType}</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Visit Date:</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{formatDate(auditData?.visitDate)}</td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Total Images:</td>
                        <td colSpan="4" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold', textAlign: 'center' }}>
                            {images.length} Supporting Evidence Images
                        </td>
                    </tr>
                </table>

                {/* IMAGES GRID - 4 IMAGES PER ROW */}
                {groupedKeys.map((checklistKey, groupIndex) => {
                    const checklistImages = checklistGroups[checklistKey];
                    const imagesPerRow = 4;

                    return (
                        <div key={groupIndex} className="checklist-group" style={{ pageBreakInside: 'avoid', marginBottom: '5mm' }}>
                            {/* Checklist Header */}
                            <table width="100%" cellPadding="0" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginBottom: '3mm' }}>
                                <tr>
                                    <td style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '10pt', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                        {checklistKey} - {checklistImages.length} Images
                                    </td>
                                </tr>
                            </table>

                            {/* Images Grid - 4 per row */}
                            {Array.from({ length: Math.ceil(checklistImages.length / imagesPerRow) }).map((_, rowIndex) => {
                                const startIndex = rowIndex * imagesPerRow;
                                const rowImages = checklistImages.slice(startIndex, startIndex + imagesPerRow);

                                return (
                                    <table
                                        key={rowIndex}
                                        width="100%"
                                        cellPadding="2"
                                        cellSpacing="0"
                                        style={{
                                            border: 'none',
                                            borderCollapse: 'collapse',
                                            marginBottom: '3mm',
                                            pageBreakInside: 'avoid',
                                        }}
                                    >
                                        <tr>
                                            {rowImages.map((image, colIndex) => (
                                                <td
                                                    key={image.id}
                                                    width="25%"
                                                    style={{
                                                        border: '1px solid #ccc',
                                                        padding: '1mm',
                                                        verticalAlign: 'top',
                                                        backgroundColor: '#fff',
                                                        height: '65mm',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {/* Clickable Image Container */}
                                                    <div
                                                        onClick={() => handleViewImage(image)}
                                                        style={{
                                                            width: '100%',
                                                            height: '40mm',
                                                            marginBottom: '1mm',
                                                            border: '1px solid #000',
                                                            backgroundColor: '#f8f8f8',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        className="image-container"
                                                    >
                                                        <img
                                                            src={image.url}
                                                            alt={image.title}
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '100%',
                                                                objectFit: 'contain',
                                                                transition: 'transform 0.3s ease',
                                                            }}
                                                            className="preview-image"
                                                        />
                                                    </div>

                                                    {/* Image Details - Compact */}
                                                    <table width="100%" cellPadding="1" cellSpacing="0" style={{ border: 'none', fontSize: '7pt' }}>
                                                        <tr>
                                                            <td style={{ padding: '0px 1px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {image.title}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '0px 1px', color: '#666', height: '15mm', overflow: 'hidden' }}>
                                                                {image.description.length > 60 ? image.description.substring(0, 60) + '...' : image.description}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '0px 1px', color: '#444' }}>
                                                                Ref: {image.checklistReference || `C${image.checklistId}.${image.itemId}`}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '0px 1px', color: '#666', fontSize: '6pt' }}>
                                                                ID: {image.id} | {formatDate(image.uploadDate)}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            ))}

                                            {/* Fill empty cells if row is not full */}
                                            {rowImages.length < imagesPerRow &&
                                                Array.from({ length: imagesPerRow - rowImages.length }).map((_, emptyIndex) => (
                                                    <td
                                                        key={`empty-${emptyIndex}`}
                                                        width="25%"
                                                        style={{
                                                            border: '1px solid #ccc',
                                                            backgroundColor: '#fafafa',
                                                            height: '65mm',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#999',
                                                                fontStyle: 'italic',
                                                                fontSize: '8pt',
                                                            }}
                                                        >
                                                            No Image
                                                        </div>
                                                    </td>
                                                ))}
                                        </tr>
                                    </table>
                                );
                            })}
                        </div>
                    );
                })}

                {/* IMAGE SUMMARY */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginTop: '5mm', fontSize: '9pt' }}>
                    <tr>
                        <td colSpan="3" style={{ border: '1px solid #000', padding: '3px 6px', fontSize: '11pt', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                            IMAGE SUMMARY
                        </td>
                    </tr>
                    <tr>
                        <td width="33%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Total Images:</td>
                        <td width="34%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Checklists Covered:</td>
                        <td width="33%" style={{ border: '1px solid #000', padding: '3px 6px', fontWeight: 'bold' }}>Upload Date Range:</td>
                    </tr>
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center', fontSize: '12pt', fontWeight: 'bold' }}>{images.length}</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center' }}>{groupedKeys.length} Checklists</td>
                        <td style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center' }}>
                            {images.length > 0 ? formatDate(images[0].uploadDate) : 'N/A'} to {images.length > 0 ? formatDate(images[images.length - 1].uploadDate) : 'N/A'}
                        </td>
                    </tr>
                </table>

                {/* FOOTER WITH SIGNATURES */}
                <table width="100%" cellPadding="2" cellSpacing="0" style={{ border: '1px solid #000', borderCollapse: 'collapse', marginTop: '5mm', fontSize: '8pt' }}>
                    <tr>
                        <td width="50%" style={{ border: '1px solid #000', padding: '8px 6px', textAlign: 'center', verticalAlign: 'top', height: '25mm' }}>
                            <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '5px' }}>AUDITOR SIGNATURE</div>
                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '20px auto 0', paddingTop: '8px' }}>
                                <div style={{ fontSize: '9pt' }}>{auditData?.asianAuditorName || auditData?.auditorName}</div>
                                <div style={{ fontSize: '8pt', marginTop: '2px' }}>Asian Fabrics Auditor</div>
                                <div style={{ fontSize: '8pt', marginTop: '2px' }}>Date: {formatDate(auditData?.auditDate)}</div>
                            </div>
                        </td>
                        <td width="50%" style={{ border: '1px solid #000', padding: '8px 6px', textAlign: 'center', verticalAlign: 'top', height: '25mm' }}>
                            <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '5px' }}>DOCUMENT VALIDATION</div>
                            <div style={{ borderTop: '1px solid #000', width: '80%', margin: '20px auto 0', paddingTop: '8px' }}>
                                <div style={{ fontSize: '9pt' }}>Quality Department</div>
                                <div style={{ fontSize: '8pt', marginTop: '2px' }}>Asian Fabrics Pvt. Ltd.</div>
                                <div style={{ fontSize: '8pt', marginTop: '2px' }}>Date: {moment().format('DD/MM/YYYY')}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2" style={{ border: '1px solid #000', padding: '3px 6px', textAlign: 'center' }}>
                            <div>--- END OF AUDIT IMAGES REPORT ---</div>
                            <div style={{ marginTop: '2px' }}>
                                Document ID: {auditData?.auditId}-IMAGES | Generated on: {moment().format('DD/MM/YYYY HH:mm')} | Page 1 of 1
                            </div>
                            <div style={{ marginTop: '2px' }}>
                                This document contains {images.length} supporting evidence images for audit verification
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4 print:hidden">
                <button
                    onClick={handleBack}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    ← Back
                </button>
                {/* <button
                    onClick={handleDownload}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                >
                    <IconDownload className="w-4 h-4 mr-2" />
                    Download PDF
                </button> */}
                <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                    <IconPrinter className="w-4 h-4 mr-2" />
                    Print Report
                </button>
            </div>

            {/* Image Modal for Larger View */}
            {showImageModal && selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
                    onClick={closeImageModal}
                >
                    <div
                        className="max-w-[90vw] max-h-[90vh] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeImageModal}
                            className="absolute -top-10 right-0 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <IconClose className="w-5 h-5" />
                        </button>
                        
                        <img
                            src={selectedImage.url.replace('w=400', 'w=1200')}
                            alt={selectedImage.title}
                            className="max-w-full max-h-[calc(90vh-100px)] object-contain rounded-t-lg"
                        />
                        
                        <div className="bg-white bg-opacity-95 p-4 rounded-b-lg">
                            <h3 className="text-lg font-bold mb-2">{selectedImage.title}</h3>
                            <p className="text-gray-600 mb-2">{selectedImage.description}</p>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Checklist: {selectedImage.checklistReference || `C${selectedImage.checklistId}.${selectedImage.itemId}`}</span>
                                <span>Uploaded: {formatDate(selectedImage.uploadDate)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles - SIMPLIFIED */}
            <style>{`
                @media print {
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    
                    #audit-images-report {
                        width: 100% !important;
                        min-height: 100vh !important;
                        padding: 15mm !important;
                        margin: 0 !important;
                        font-family: "Times New Roman", serif !important;
                        font-size: 10pt !important;
                        line-height: 1.2 !important;
                    }
                    
                    /* Hide buttons and modal during print */
                    .print\\:hidden,
                    .fixed,
                    .mt-6,
                    button {
                        display: none !important;
                    }
                    
                    /* Ensure tables print properly */
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: avoid !important;
                    }
                    
                    th, td {
                        border: 1px solid #000 !important;
                        padding: 2px 3px !important;
                    }
                    
                    img {
                        max-width: 100% !important;
                        max-height: 100% !important;
                    }
                    
                    .checklist-group {
                        page-break-inside: avoid !important;
                    }
                }
                
                /* Screen styles */
                @media screen {
                    #audit-images-report {
                        border: 1px solid #ccc;
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                        margin-bottom: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    
                    .image-container:hover {
                        border-color: #2563eb !important;
                        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
                    }
                    
                    .image-container:hover .preview-image {
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </div>
    );
};

export default AuditImagesPrintPage;