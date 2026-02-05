import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCompany, resetCompanyStatus } from '../../../redux/companySlice';
import { baseURL } from '../../../api/ApiConfig';
import moment from 'moment';

const AuditReportPDF = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [auditData, setAuditData] = useState([]);
    const [filters, setFilters] = useState({});
    const [companyInfo, setCompanyInfo] = useState({});
    const [summaryStats, setSummaryStats] = useState({});
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get company data from Redux
    const { getCompanySuccess, companyData, getCompanyFailed, errorMessage } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
        getCompanyFailed: state.ComapnySlice.getCompanyFailed,
        errorMessage: state.ComapnySlice.errorMessage,
    }));

    useEffect(() => {
        if (location.state?.auditData) {
            // If single audit is passed
            setSelectedAudit(location.state.auditData);
            setAuditData([location.state.auditData]);
        } else if (location.state?.allAudits) {
            // If multiple audits are passed (from export all)
            setAuditData(location.state.allAudits);
        } else if (location.state?.filteredData) {
            // If filtered data is passed
            setAuditData(location.state.filteredData);
        }

        if (location.state?.filters) {
            setFilters(location.state.filters);
        }
    }, [location.state]);

    useEffect(() => {
        dispatch(getCompany());
    }, [dispatch]);

    useEffect(() => {
        if (getCompanySuccess && companyData?.data?.[0]) {
            const companyDataItem = companyData.data[0];
            setCompanyInfo({
                companyName: companyDataItem?.companyName || 'Audit Management System',
                companyMobile: companyDataItem?.companyMobile || '',
                companyAltMobile: companyDataItem?.companyAltMobile || '',
                companyMail: companyDataItem?.companyMail || '',
                companyAddressOne: companyDataItem?.companyAddressOne || '',
                companyGstNo: companyDataItem?.companyGstNo || '',
                companyAddressTwo: companyDataItem?.companyAddressTwo || '',
                logoPreview: companyDataItem?.companyLogo ? `${baseURL}${companyDataItem?.companyLogo}` : '',
            });
            dispatch(resetCompanyStatus());
            setLoading(false);
        } else if (getCompanyFailed) {
            // Set default company info if API fails
            setCompanyInfo({
                companyName: 'ASIAN FABRIC X',
                companyAddressOne: '123 Textile Street, Mumbai',
                companyAddressTwo: 'Maharashtra, India - 400001',
                companyGstNo: 'GSTIN123456789',
                companyMail: 'info@asianfabricx.com',
                companyMobile: '+91 9876543210',
                logoPreview: '',
            });
            setLoading(false);
        }
    }, [getCompanySuccess, getCompanyFailed, companyData, dispatch]);

    useEffect(() => {
        // Calculate summary statistics
        if (auditData.length > 0) {
            const stats = {
                totalAudits: auditData.length,
                avgScore: Math.round(auditData.reduce((sum, audit) => sum + audit.currentScore, 0) / auditData.length),
                completed: auditData.filter(a => a.status === 'Completed').length,
                inProgress: auditData.filter(a => a.status === 'In Progress').length,
                pendingReview: auditData.filter(a => a.status === 'Pending Review').length,
                mainSuppliers: auditData.filter(a => a.supplierType === 'Main Supplier').length,
                subSuppliers: auditData.filter(a => a.supplierType === 'Sub Supplier').length,
                totalImages: auditData.reduce((sum, audit) => sum + (audit.images ? audit.images.length : 0), 0),
                totalNonCompliant: auditData.filter(a => a.currentScore < 100).length,
                avgImprovement: Math.round(auditData.reduce((sum, audit) => sum + (audit.currentScore - audit.lastAuditScore), 0) / auditData.length),
            };
            setSummaryStats(stats);
        }
    }, [auditData]);

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-700';
        if (score >= 80) return 'text-blue-700';
        if (score >= 70) return 'text-yellow-700';
        if (score >= 60) return 'text-orange-700';
        return 'text-red-700';
    };

    const getScoreBgColor = (score) => {
        if (score >= 90) return 'bg-green-100';
        if (score >= 80) return 'bg-blue-100';
        if (score >= 70) return 'bg-yellow-100';
        if (score >= 60) return 'bg-orange-100';
        return 'bg-red-100';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'text-green-700 bg-green-100';
            case 'In Progress':
                return 'text-blue-700 bg-blue-100';
            case 'Pending Review':
                return 'text-yellow-700 bg-yellow-100';
            default:
                return 'text-gray-700 bg-gray-100';
        }
    };

    const formatMobileNumber = (number) => {
        if (!number) return '';
        const cleanNumber = number.toString().replace(/\D/g, '');
        
        if (cleanNumber.length > 12) {
            return (
                <div style={{ lineHeight: '1', fontSize: '8pt' }}>
                    <div>{cleanNumber.substring(0, 10)}</div>
                    <div>{cleanNumber.substring(10)}</div>
                </div>
            );
        }
        
        if (cleanNumber.length === 10) {
            return `${cleanNumber.substring(0, 5)} ${cleanNumber.substring(5)}`;
        }
        
        return cleanNumber;
    };

    const renderProgressBar = (score, width = '100%', height = '6px') => {
        const color = score >= 90 ? '#10b981' : 
                     score >= 80 ? '#3b82f6' : 
                     score >= 70 ? '#f59e0b' : 
                     score >= 60 ? '#f97316' : '#ef4444';
        
        return (
            <div style={{ 
                width: width, 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px', 
                height: height,
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${score}%`,
                    backgroundColor: color,
                    height: '100%',
                    borderRadius: '4px'
                }}></div>
            </div>
        );
    };

    // Function to get key checklist scores (only non-100% or top issues)
    const getKeyChecklistScores = (audit) => {
        const checklistScores = [
            { label: 'Child Labour', score: audit.childLabourScore, key: 'childLabourScore' },
            { label: 'Forced Labour', score: audit.forcedLabourScore, key: 'forcedLabourScore' },
            { label: 'Freedom Assoc', score: audit.freedomOfAssociationScore, key: 'freedomOfAssociationScore' },
            { label: 'Discrimination', score: audit.discriminationScore, key: 'discriminationScore' },
            { label: 'Mgmt System', score: audit.mgmtSystemScore, key: 'mgmtSystemScore' },
            { label: 'Business Ethics', score: audit.businessEthicsScore, key: 'businessEthicsScore' },
            { label: 'Env Mgmt', score: audit.envMgmtScore, key: 'envMgmtScore' },
            { label: 'Health Safety', score: audit.healthSafetyScore, key: 'healthSafetyScore' },
            { label: 'Working Hours', score: audit.workingHoursScore, key: 'workingHoursScore' },
            { label: 'Accident Ins', score: audit.accidentInsuranceScore, key: 'accidentInsuranceScore' },
            { label: 'Licenses', score: audit.licensesPermitsScore, key: 'licensesPermitsScore' },
            { label: 'Housekeeping', score: audit.housekeepingScore, key: 'housekeepingScore' },
            { label: 'Recruitment', score: audit.recruitmentScore, key: 'recruitmentScore' },
            { label: 'Accommodation', score: audit.accommodationScore, key: 'accommodationScore' },
            { label: 'Transport', score: audit.transportScore, key: 'transportScore' },
        ];

        // Filter out 100% scores
        const nonPerfectScores = checklistScores.filter(item => item.score < 100);
        
        if (nonPerfectScores.length === 0) {
            // All scores are 100%
            return [{
                label: 'All Checklists',
                score: 100,
                status: 'Fully Compliant',
                isPerfect: true
            }];
        }

        // Sort by score (lowest first)
        return nonPerfectScores
            .sort((a, b) => a.score - b.score)
            .slice(0, 3); // Show only top 3 issues
    };

    const getTableData = () => {
        const tableData = [];
        auditData.forEach((audit, index) => {
            const keyScores = getKeyChecklistScores(audit);
            
            tableData.push({
                sno: index + 1,
                auditId: audit.auditId,
                supplierName: audit.supplierName,
                supplierType: audit.supplierType,
                auditDate: moment(audit.auditDate).format('DD/MM/YYYY'),
                auditorName: audit.auditorName,
                lastScore: audit.lastAuditScore,
                currentScore: audit.currentScore,
                status: audit.status,
                improvement: audit.currentScore - audit.lastAuditScore,
                keyScores: keyScores,
                imagesCount: audit.images ? audit.images.length : 0,
                isAllPerfect: keyScores.length === 1 && keyScores[0].isPerfect,
            });
        });
        return tableData;
    };

    const tableData = getTableData();

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Report</h3>
                <p className="text-gray-500">Preparing audit report...</p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div id="audit-report-to-print" className="bg-white mx-auto" style={{ 
                width: '277mm',
                minHeight: '190mm',
                height: 'auto'
            }}>
                {/* Header Section with Company Logo */}
                <div className="pb-2 mb-2" style={{ padding: '0', borderBottom: '2px solid #e5e7eb' }}>
                    <div className="flex justify-between items-start" style={{ width: '100%' }}>
                        <div className="flex items-center">
                            {companyInfo.logoPreview && (
                                <img
                                    src={companyInfo.logoPreview}
                                    alt="Company Logo"
                                    crossOrigin="anonymous"
                                    style={{
                                        maxHeight: '35px',
                                        marginRight: '10px',
                                    }}
                                />
                            )}
                            <div>
                                <h1 className="font-bold text-gray-800" style={{ fontSize: '16pt', lineHeight: '1.1' }}>
                                    {companyInfo.companyName}
                                </h1>
                                <p className="text-gray-600" style={{ fontSize: '9pt', lineHeight: '1.1' }}>
                                    {companyInfo.companyAddressOne}
                                    {companyInfo.companyAddressTwo && `, ${companyInfo.companyAddressTwo}`}
                                </p>
                                <p className="text-gray-500" style={{ fontSize: '8pt', lineHeight: '1.1' }}>
                                    {companyInfo.companyGstNo && `GST: ${companyInfo.companyGstNo}`}
                                    {companyInfo.companyMail && ` • ${companyInfo.companyMail}`}
                                    {companyInfo.companyMobile && ` • ${formatMobileNumber(companyInfo.companyMobile)}`}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="font-bold text-blue-800 uppercase" style={{ fontSize: '14pt', lineHeight: '1.1' }}>
                                SUPPLIER AUDIT REPORT
                            </h2>
                            <p className="text-gray-600" style={{ fontSize: '10pt', lineHeight: '1.1' }}>
                                {filters.startDate && filters.toDate 
                                    ? `${moment(filters.startDate).format('DD MMM YY')} to ${moment(filters.toDate).format('DD MMM YY')}`
                                    : 'All Audits'
                                }
                            </p>
                            <p className="text-gray-500" style={{ fontSize: '9pt', lineHeight: '1.1' }}>
                                Generated: {moment().format('DD/MM/YYYY HH:mm')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Audit Table */}
                <div style={{ width: '100%', marginBottom: '10px' }}>
                    <table className="border-collapse border border-gray-300" style={{ 
                        width: '100%',
                        tableLayout: 'fixed',
                        fontSize: '8.5pt',
                        lineHeight: '1.2'
                    }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '3%' }}>S.No</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '8%' }}>Audit ID</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '15%' }}>Supplier Details</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '7%' }}>Auditor</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '6%' }}>Scores</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '6%' }}>Status</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '7%' }}>Date</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-left p-1" style={{ width: '12%' }}>Key Checklist Scores</th>
                                <th className="border border-gray-300 font-semibold text-gray-700 text-center p-1" style={{ width: '4%' }}>Images</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                        {row.sno}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '9pt' }}>{row.auditId}</div>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '9pt' }}>{row.supplierName}</div>
                                        <div style={{ fontSize: '8pt', color: '#666' }}>
                                            {row.supplierType}
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        {row.auditorName}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span style={{ fontSize: '7.5pt' }}>Last:</span>
                                                <span style={{ 
                                                    fontSize: '8pt', 
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px',
                                                    borderRadius: '4px',
                                                    backgroundColor: getScoreBgColor(row.lastScore).replace('bg-', '')
                                                }} className={getScoreColor(row.lastScore)}>
                                                    {row.lastScore}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span style={{ fontSize: '7.5pt' }}>Current:</span>
                                                <span style={{ 
                                                    fontSize: '8pt', 
                                                    fontWeight: 'bold',
                                                    padding: '1px 4px',
                                                    borderRadius: '4px',
                                                    backgroundColor: getScoreBgColor(row.currentScore).replace('bg-', '')
                                                }} className={getScoreColor(row.currentScore)}>
                                                    {row.currentScore}%
                                                </span>
                                            </div>
                                            <div className={`text-center ${row.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontSize: '7pt' }}>
                                                {row.improvement >= 0 ? '▲' : '▼'} {Math.abs(row.improvement)}%
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                        <span style={{ 
                                            padding: '2px 6px',
                                            borderRadius: '12px',
                                            fontSize: '7.5pt',
                                            fontWeight: 'bold',
                                            display: 'inline-block',
                                            backgroundColor: getStatusColor(row.status).split(' ')[1].replace('bg-', ''),
                                            color: getStatusColor(row.status).split(' ')[0].replace('text-', '')
                                        }}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word', fontSize: '8pt' }}>
                                        {row.auditDate}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1" style={{ wordWrap: 'break-word' }}>
                                        {row.isAllPerfect ? (
                                            <div className="text-center">
                                                <div style={{ 
                                                    color: '#059669',
                                                    fontSize: '8pt',
                                                    fontWeight: 'bold',
                                                    padding: '2px 4px',
                                                    backgroundColor: '#dcfce7',
                                                    borderRadius: '4px'
                                                }}>
                                                    ✓ All Compliant
                                                </div>
                                                <div style={{ fontSize: '7pt', color: '#059669', marginTop: '2px' }}>
                                                    100% in all checklists
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {row.keyScores.map((scoreItem, idx) => (
                                                    <div key={idx} className="flex justify-between items-center">
                                                        <span style={{ fontSize: '7pt' }}>{scoreItem.label}:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span style={{ 
                                                                fontSize: '7.5pt', 
                                                                fontWeight: 'bold',
                                                                color: scoreItem.score >= 70 ? '#3b82f6' : '#dc2626'
                                                            }}>
                                                                {scoreItem.score}%
                                                            </span>
                                                            <div style={{ 
                                                                width: '15px', 
                                                                height: '3px',
                                                                backgroundColor: scoreItem.score >= 70 ? '#3b82f6' : '#dc2626',
                                                                borderRadius: '2px'
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {row.keyScores.length < 3 && row.currentScore < 100 && (
                                                    <div style={{ fontSize: '7pt', color: '#6b7280', textAlign: 'center', marginTop: '2px' }}>
                                                        +{15 - row.keyScores.length} more at 100%
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="border border-gray-300 align-top p-1 text-center" style={{ wordWrap: 'break-word' }}>
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            borderRadius: '50%',
                                            backgroundColor: row.imagesCount > 0 ? '#4f46e5' : '#d1d5db',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto',
                                            fontSize: '7.5pt',
                                            fontWeight: 'bold'
                                        }}>
                                            {row.imagesCount}
                                        </div>
                                        <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                                            Images
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Detailed Score Breakdown for Selected Audit */}
                {selectedAudit && (
                    <div className="mt-6" style={{ pageBreakBefore: 'always' }}>
                        <div className="mb-3 pb-1 border-b border-gray-300">
                            <h3 className="font-bold text-blue-700" style={{ fontSize: '12pt' }}>
                                DETAILED AUDIT REPORT - {selectedAudit.auditId}
                            </h3>
                            <p className="text-gray-600" style={{ fontSize: '9pt' }}>
                                Supplier: {selectedAudit.supplierName} • Type: {selectedAudit.supplierType} • 
                                Auditor: {selectedAudit.auditorName} • Date: {moment(selectedAudit.auditDate).format('DD/MM/YYYY')}
                            </p>
                        </div>
                        
                        {/* Score Summary */}
                        <div className="mb-4">
                            <div className="grid grid-cols-4 gap-2" style={{ fontSize: '9pt' }}>
                                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                                    <div className="font-bold text-gray-700">Last Score</div>
                                    <div className={`text-2xl font-bold ${getScoreColor(selectedAudit.lastAuditScore)}`}>
                                        {selectedAudit.lastAuditScore}%
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-2 rounded border border-blue-200 text-center">
                                    <div className="font-bold text-blue-700">Current Score</div>
                                    <div className={`text-2xl font-bold ${getScoreColor(selectedAudit.currentScore)}`}>
                                        {selectedAudit.currentScore}%
                                    </div>
                                </div>
                                <div className={`p-2 rounded border ${selectedAudit.currentScore >= selectedAudit.lastAuditScore ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} text-center`}>
                                    <div className={`font-bold ${selectedAudit.currentScore >= selectedAudit.lastAuditScore ? 'text-green-700' : 'text-red-700'}`}>
                                        Improvement
                                    </div>
                                    <div className={`text-2xl font-bold ${selectedAudit.currentScore >= selectedAudit.lastAuditScore ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedAudit.currentScore >= selectedAudit.lastAuditScore ? '+' : ''}
                                        {selectedAudit.currentScore - selectedAudit.lastAuditScore}%
                                    </div>
                                </div>
                                <div className="bg-indigo-50 p-2 rounded border border-indigo-200 text-center">
                                    <div className="font-bold text-indigo-700">Status</div>
                                    <div className="text-lg font-bold" style={{ 
                                        color: getStatusColor(selectedAudit.status).split(' ')[0].replace('text-', '')
                                    }}>
                                        {selectedAudit.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist Scores Grid - Show only non-100% scores */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-2" style={{ fontSize: '10pt' }}>
                                Checklist Scores Breakdown
                                <span className="text-gray-500 text-xs font-normal ml-2">
                                    (Showing only areas needing improvement)
                                </span>
                            </h4>
                            
                            {(() => {
                                const checklistScores = [
                                    { label: '1. Child Labour', score: selectedAudit.childLabourScore },
                                    { label: '2. Forced Labour', score: selectedAudit.forcedLabourScore },
                                    { label: '3. Freedom of Association', score: selectedAudit.freedomOfAssociationScore },
                                    { label: '4. Discrimination', score: selectedAudit.discriminationScore },
                                    { label: '5. Management System', score: selectedAudit.mgmtSystemScore },
                                    { label: '6. Business Ethics', score: selectedAudit.businessEthicsScore },
                                    { label: '7. Environmental Management', score: selectedAudit.envMgmtScore },
                                    { label: '8. Health & Safety', score: selectedAudit.healthSafetyScore },
                                    { label: '9. Working Hours', score: selectedAudit.workingHoursScore },
                                    { label: '10. Accident Insurance', score: selectedAudit.accidentInsuranceScore },
                                    { label: '11. Licenses & Permits', score: selectedAudit.licensesPermitsScore },
                                    { label: '12. Housekeeping', score: selectedAudit.housekeepingScore },
                                    { label: '13. Recruitment', score: selectedAudit.recruitmentScore },
                                    { label: '14. Accommodation', score: selectedAudit.accommodationScore },
                                    { label: '15. Transport', score: selectedAudit.transportScore },
                                ];

                                const nonPerfectScores = checklistScores.filter(item => item.score < 100);
                                
                                if (nonPerfectScores.length === 0) {
                                    return (
                                        <div className="text-center py-4 border border-green-200 bg-green-50 rounded-lg">
                                            <div className="text-green-700 font-bold" style={{ fontSize: '10pt' }}>
                                                ✓ ALL CHECKLISTS FULLY COMPLIANT
                                            </div>
                                            <div className="text-green-600" style={{ fontSize: '9pt', marginTop: '4px' }}>
                                                All 15 checklist categories scored 100%
                                            </div>
                                            <div className="mt-2" style={{ fontSize: '8pt', color: '#059669' }}>
                                                Perfect Compliance Status
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="grid grid-cols-3 gap-2" style={{ fontSize: '8.5pt' }}>
                                        {nonPerfectScores
                                            .sort((a, b) => a.score - b.score) // Sort by lowest score first
                                            .map((item, index) => (
                                            <div key={index} className="border border-gray-200 rounded p-2">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium text-gray-700">{item.label}</span>
                                                    <span style={{ 
                                                        fontSize: '8pt', 
                                                        fontWeight: 'bold',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        backgroundColor: getScoreBgColor(item.score).replace('bg-', ''),
                                                        color: getScoreColor(item.score).replace('text-', '')
                                                    }}>
                                                        {item.score}%
                                                    </span>
                                                </div>
                                                {renderProgressBar(item.score, '100%', '4px')}
                                                <div className="text-center mt-1" style={{ 
                                                    fontSize: '7pt',
                                                    color: item.score >= 70 ? '#3b82f6' : '#dc2626',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {item.score >= 70 ? 'NEEDS MINOR IMPROVEMENT' : 'NEEDS MAJOR IMPROVEMENT'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                            
                            {(() => {
                                const perfectCount = 15 - (getKeyChecklistScores(selectedAudit).length === 1 && getKeyChecklistScores(selectedAudit)[0].isPerfect ? 15 : getKeyChecklistScores(selectedAudit).length);
                                if (perfectCount > 0) {
                                    return (
                                        <div className="mt-2 text-center" style={{ fontSize: '8pt', color: '#059669' }}>
                                            ✓ {perfectCount} checklist(s) scored 100% (Fully Compliant)
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Images Section if available */}
                        {selectedAudit.images && selectedAudit.images.length > 0 && (
                            <div className="mt-4">
                                <div className="mb-2 pb-1 border-b border-gray-300">
                                    <h4 className="font-bold text-blue-700" style={{ fontSize: '10pt' }}>
                                        AUDIT EVIDENCE IMAGES ({selectedAudit.images.length})
                                    </h4>
                                </div>
                                
                                <div className="space-y-3">
                                    {selectedAudit.images.map((image, index) => (
                                        <div key={image.id} className="border border-gray-200 rounded p-2" style={{ 
                                            backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                                        }}>
                                            <div className="flex">
                                                <div style={{ width: '80mm', marginRight: '4mm' }}>
                                                    <div className="font-bold text-gray-800 mb-1" style={{ fontSize: '9pt' }}>
                                                        {index + 1}. {image.title}
                                                    </div>
                                                    <div className="text-gray-700 mb-2" style={{ fontSize: '8pt' }}>
                                                        {image.description}
                                                    </div>
                                                    <div className="text-gray-600" style={{ fontSize: '7.5pt' }}>
                                                        Checklist: {image.checklistId} • Item: {image.itemId} • 
                                                        Uploaded: {moment(image.uploadDate).format('DD/MM/YYYY')}
                                                    </div>
                                                </div>
                                                <div style={{ width: '50mm' }}>
                                                    <div style={{ 
                                                        width: '50mm', 
                                                        height: '30mm',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '2px',
                                                        backgroundColor: '#f3f4f6',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{ 
                                                            textAlign: 'center',
                                                            color: '#6b7280',
                                                            fontSize: '8pt'
                                                        }}>
                                                            [Image: {image.title}]
                                                            <br />
                                                            <span style={{ fontSize: '7pt' }}>URL: {image.url.substring(0, 30)}...</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 text-center text-gray-600" style={{ fontSize: '7pt' }}>
                                                        Evidence Image
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-6 pt-2 border-t border-gray-300 text-center">
                    <p className="text-gray-500" style={{ fontSize: '8pt' }}>
                        {companyInfo.companyName} • Computer generated audit report • {moment().format('DD/MM/YYYY HH:mm')} • 
                        Total Records: {tableData.length}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="d-print-none mt-6 flex justify-center gap-4">
                <button onClick={handleBack} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
                    ← Back
                </button>
                <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    🖨️ Print
                </button>
            </div>

            <style jsx>{`
                @media print {
                    /* Reset all margins and padding */
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Hide everything except the print content */
                    body * {
                        visibility: hidden;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    #audit-report-to-print,
                    #audit-report-to-print * {
                        visibility: visible;
                    }

                    #audit-report-to-print {
                        position: relative !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 277mm !important;
                        min-height: 190mm !important;
                        height: auto !important;
                        margin: 0 auto !important;
                        padding: 5mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        overflow: visible !important;
                        page-break-after: always;
                    }

                    /* Hide navigation and other elements */
                    .d-print-none,
                    header,
                    nav,
                    .navbar,
                    .sidebar,
                    .action-buttons {
                        display: none !important;
                    }

                    /* Ensure table fits properly */
                    table {
                        width: 100% !important;
                        table-layout: fixed !important;
                        border-collapse: collapse !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        font-size: 8.5pt !important;
                        line-height: 1.2 !important;
                    }

                    th, td {
                        padding: 2px 3px !important;
                        border: 0.5px solid #000 !important;
                        font-size: 8.5pt !important;
                        line-height: 1.2 !important;
                        vertical-align: top !important;
                        margin: 0 !important;
                    }

                    /* Page setup for A4 landscape */
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }

                    /* Force colors to print */
                    @media print and (color) {
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            color-adjust: exact !important;
                        }
                    }

                    /* Allow page breaks */
                    #audit-report-to-print {
                        page-break-inside: auto;
                    }

                    table {
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    /* Detailed report should start on new page */
                    #audit-report-to-print > div:nth-child(4) {
                        page-break-before: always !important;
                    }

                    /* Ensure proper text wrapping */
                    th, td {
                        word-wrap: break-word !important;
                        overflow-wrap: break-word !important;
                        hyphens: auto !important;
                    }

                    /* Colors for score cells */
                    .text-green-700 { color: #047857 !important; }
                    .text-blue-700 { color: #1d4ed8 !important; }
                    .text-yellow-700 { color: #a16207 !important; }
                    .text-orange-700 { color: #c2410c !important; }
                    .text-red-700 { color: #b91c1c !important; }
                    
                    .bg-green-100 { background-color: #dcfce7 !important; }
                    .bg-blue-100 { background-color: #dbeafe !important; }
                    .bg-yellow-100 { background-color: #fef3c7 !important; }
                    .bg-orange-100 { background-color: #ffedd5 !important; }
                    .bg-red-100 { background-color: #fee2e2 !important; }

                    /* Status colors */
                    .text-green-700.bg-green-100 { 
                        color: #047857 !important; 
                        background-color: #dcfce7 !important; 
                    }
                    .text-blue-700.bg-blue-100 { 
                        color: #1d4ed8 !important; 
                        background-color: #dbeafe !important; 
                    }
                    .text-yellow-700.bg-yellow-100 { 
                        color: #a16207 !important; 
                        background-color: #fef3c7 !important; 
                    }

                    /* Perfect compliance styling */
                    #audit-report-to-print > div:nth-child(3) table tbody tr td:nth-child(8) > div > div:first-child {
                        background-color: #dcfce7 !important;
                        color: #047857 !important;
                        border: 0.5px solid #10b981 !important;
                    }
                }

                /* Screen styles */
                @media screen {
                    #audit-report-to-print {
                        padding: 15px;
                        border-radius: 4px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background: white;
                        overflow: auto;
                        max-height: calc(100vh - 150px);
                    }

                    /* Table styling for screen */
                    table {
                        font-size: 8.5pt;
                    }

                    th, td {
                        padding: 3px 4px;
                    }

                    /* Images section for screen */
                    #audit-report-to-print > div:nth-child(4) {
                        margin-top: 20px;
                    }

                    /* Progress bars for screen */
                    .progress-bar {
                        transition: width 0.3s ease;
                    }

                    /* Perfect compliance badge */
                    #audit-report-to-print > div:nth-child(3) table tbody tr td:nth-child(8) > div > div:first-child {
                        transition: all 0.2s ease;
                    }
                    
                    #audit-report-to-print > div:nth-child(3) table tbody tr td:nth-child(8) > div > div:first-child:hover {
                        transform: scale(1.02);
                        box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
                    }
                }

                /* Ensure proper text wrapping */
                .align-top {
                    vertical-align: top;
                }

                td {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                /* Force table to use all available space */
                table {
                    border-spacing: 0;
                }

                /* Custom scrollbar for screen */
                @media screen {
                    #audit-report-to-print::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                    }

                    #audit-report-to-print::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 4px;
                    }

                    #audit-report-to-print::-webkit-scrollbar-thumb {
                        background: #888;
                        border-radius: 4px;
                    }

                    #audit-report-to-print::-webkit-scrollbar-thumb:hover {
                        background: #555;
                    }
                }
            `}</style>
        </div>
    );
};

export default AuditReportPDF;