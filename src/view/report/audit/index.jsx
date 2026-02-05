import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconEye from '../../../components/Icon/IconEye';
import IconDownload from '../../../components/Icon/IconFile';
import IconExternalLink from '../../../components/Icon/IconExternalLink';
import IconChartBar from '../../../components/Icon/IconBarChart';
import IconImages from '../../../components/Icon/IconCamera'; // Added for images PDF
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import * as XLSX from 'xlsx';
import moment from 'moment';
import _ from 'lodash';

const Index = () => {
    const navigate = useNavigate();

    // Static audit data with images
    const staticAuditData = [
        {
            id: 1,
            auditId: 'AUD-001',
            supplierName: 'Asian Fabric X',
            supplierType: 'Sub Supplier',
            auditDate: '2024-01-15',
            lastAuditScore: 85,
            currentScore: 97,
            status: 'Completed',
            auditorName: 'John Smith',
            visitDate: '2024-01-15',

            // Checklist scores
            childLabourScore: 100,
            forcedLabourScore: 100,
            freedomOfAssociationScore: 100,
            discriminationScore: 100,
            mgmtSystemScore: 100,
            businessEthicsScore: 100,
            envMgmtScore: 100,
            healthSafetyScore: 100,
            workingHoursScore: 100,
            accidentInsuranceScore: 100,
            licensesPermitsScore: 100,
            housekeepingScore: 100,
            recruitmentScore: 100,
            accommodationScore: 100,
            transportScore: 100,

            // Images data
            images: [
                {
                    id: 1,
                    title: 'Factory Entrance',
                    checklistId: 1,
                    itemId: 1.1,
                    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Main entrance with security check',
                    uploadDate: '2024-01-15',
                },
                {
                    id: 2,
                    title: 'Production Area',
                    checklistId: 5,
                    itemId: 5.1,
                    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Clean and organized production floor',
                    uploadDate: '2024-01-15',
                },
                {
                    id: 3,
                    title: 'Safety Equipment',
                    checklistId: 2,
                    itemId: 2.2,
                    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Fire extinguishers properly maintained',
                    uploadDate: '2024-01-15',
                },
                {
                    id: 4,
                    title: 'Worker Facilities',
                    checklistId: 6,
                    itemId: 6.3,
                    url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Clean cafeteria area for workers',
                    uploadDate: '2024-01-15',
                },
                {
                    id: 5,
                    title: 'Quality Check',
                    checklistId: 4,
                    itemId: 4.1,
                    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Quality control station',
                    uploadDate: '2024-01-15',
                },
            ],

            // Detailed checklist data
            checklists: {
                childLabour: {
                    items: 5,
                    completed: 5,
                    score: 100,
                    details: 'All requirements met',
                },
                forcedLabour: {
                    items: 3,
                    completed: 3,
                    score: 100,
                    details: 'No forced labor detected',
                },
                freedomOfAssociation: {
                    items: 4,
                    completed: 4,
                    score: 100,
                    details: 'Freedom of association maintained',
                },
                discrimination: {
                    items: 4,
                    completed: 4,
                    score: 100,
                    details: 'No discrimination practices found',
                },
            },
        },
        {
            id: 2,
            auditId: 'AUD-002',
            supplierName: 'Textile Solutions Ltd',
            supplierType: 'Main Supplier',
            auditDate: '2024-01-20',
            lastAuditScore: 78,
            currentScore: 92,
            status: 'Completed',
            auditorName: 'Sarah Johnson',
            visitDate: '2024-01-20',

            // Checklist scores
            childLabourScore: 100,
            forcedLabourScore: 100,
            freedomOfAssociationScore: 100,
            discriminationScore: 100,
            mgmtSystemScore: 95,
            businessEthicsScore: 90,
            envMgmtScore: 88,
            healthSafetyScore: 85,
            workingHoursScore: 100,
            accidentInsuranceScore: 100,
            licensesPermitsScore: 100,
            housekeepingScore: 95,
            recruitmentScore: 90,
            accommodationScore: 85,
            transportScore: 80,

            // Images data
            images: [
                {
                    id: 6,
                    title: 'Warehouse Storage',
                    checklistId: 7,
                    itemId: 7.2,
                    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Organized raw material storage',
                    uploadDate: '2024-01-20',
                },
                {
                    id: 7,
                    title: 'Environmental Controls',
                    checklistId: 3,
                    itemId: 3.1,
                    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Waste management system',
                    uploadDate: '2024-01-20',
                },
                {
                    id: 8,
                    title: 'Training Room',
                    checklistId: 10,
                    itemId: 10.1,
                    url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Worker training facility',
                    uploadDate: '2024-01-20',
                },
            ],
        },
        {
            id: 3,
            auditId: 'AUD-003',
            supplierName: 'Global Fabrics Inc',
            supplierType: 'Sub Supplier',
            auditDate: '2024-01-25',
            lastAuditScore: 65,
            currentScore: 82,
            status: 'In Progress',
            auditorName: 'Mike Wilson',
            visitDate: '2024-01-25',

            // Checklist scores
            childLabourScore: 100,
            forcedLabourScore: 100,
            freedomOfAssociationScore: 80,
            discriminationScore: 75,
            mgmtSystemScore: 70,
            businessEthicsScore: 85,
            envMgmtScore: 90,
            healthSafetyScore: 88,
            workingHoursScore: 100,
            accidentInsuranceScore: 100,
            licensesPermitsScore: 100,
            housekeepingScore: 65,
            recruitmentScore: 70,
            accommodationScore: 60,
            transportScore: 55,

            // Images data
            images: [
                {
                    id: 9,
                    title: 'Machine Maintenance',
                    checklistId: 11,
                    itemId: 11.2,
                    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Regular machine maintenance logs',
                    uploadDate: '2024-01-25',
                },
                {
                    id: 10,
                    title: 'Emergency Exit',
                    checklistId: 9,
                    itemId: 9.1,
                    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Clearly marked emergency exits',
                    uploadDate: '2024-01-25',
                },
            ],
        },
        {
            id: 4,
            auditId: 'AUD-004',
            supplierName: 'Quality Textiles Corp',
            supplierType: 'Main Supplier',
            auditDate: '2024-02-01',
            lastAuditScore: 90,
            currentScore: 95,
            status: 'Completed',
            auditorName: 'Emily Brown',
            visitDate: '2024-02-01',

            // Checklist scores
            childLabourScore: 100,
            forcedLabourScore: 100,
            freedomOfAssociationScore: 100,
            discriminationScore: 100,
            mgmtSystemScore: 100,
            businessEthicsScore: 95,
            envMgmtScore: 90,
            healthSafetyScore: 100,
            workingHoursScore: 100,
            accidentInsuranceScore: 100,
            licensesPermitsScore: 100,
            housekeepingScore: 95,
            recruitmentScore: 90,
            accommodationScore: 85,
            transportScore: 100,

            // Images data
            images: [
                {
                    id: 11,
                    title: 'Documentation Room',
                    checklistId: 7,
                    itemId: 7.1,
                    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Proper documentation storage',
                    uploadDate: '2024-02-01',
                },
                {
                    id: 12,
                    title: 'Quality Testing',
                    checklistId: 4,
                    itemId: 4.3,
                    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Advanced quality testing equipment',
                    uploadDate: '2024-02-01',
                },
                {
                    id: 13,
                    title: 'Worker Rest Area',
                    checklistId: 6,
                    itemId: 6.2,
                    url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Comfortable rest area for workers',
                    uploadDate: '2024-02-01',
                },
                {
                    id: 14,
                    title: 'Environmental Certificate',
                    checklistId: 3,
                    itemId: 3.3,
                    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'ISO 14001 certification displayed',
                    uploadDate: '2024-02-01',
                },
            ],
        },
        {
            id: 5,
            auditId: 'AUD-005',
            supplierName: 'Eco Fabrics Ltd',
            supplierType: 'Sub Supplier',
            auditDate: '2024-02-05',
            lastAuditScore: 72,
            currentScore: 88,
            status: 'Pending Review',
            auditorName: 'David Lee',
            visitDate: '2024-02-05',

            // Checklist scores
            childLabourScore: 100,
            forcedLabourScore: 100,
            freedomOfAssociationScore: 85,
            discriminationScore: 90,
            mgmtSystemScore: 75,
            businessEthicsScore: 80,
            envMgmtScore: 95,
            healthSafetyScore: 88,
            workingHoursScore: 100,
            accidentInsuranceScore: 100,
            licensesPermitsScore: 100,
            housekeepingScore: 70,
            recruitmentScore: 65,
            accommodationScore: 85,
            transportScore: 80,

            // Images data
            images: [
                {
                    id: 15,
                    title: 'Solar Panels',
                    checklistId: 3,
                    itemId: 3.2,
                    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Renewable energy installation',
                    uploadDate: '2024-02-05',
                },
                {
                    id: 16,
                    title: 'Safety Training',
                    checklistId: 10,
                    itemId: 10.2,
                    url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Monthly safety training session',
                    uploadDate: '2024-02-05',
                },
                {
                    id: 17,
                    title: 'Raw Material Storage',
                    checklistId: 8,
                    itemId: 8.1,
                    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    description: 'Sustainable raw materials',
                    uploadDate: '2024-02-05',
                },
            ],
        },
    ];

    const [auditData, setAuditData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showImagesModal, setShowImagesModal] = useState(false);
    const [selectedAuditImages, setSelectedAuditImages] = useState([]);

    const [filters, setFilters] = useState({
        searchQuery: '',
        selectedSupplierType: null,
        selectedStatus: null,
        selectedAuditor: null,
        startDate: '',
        toDate: '',
    });

    const [appliedFilters, setAppliedFilters] = useState(null);
    const [showSearch, setShowSearch] = useState(true);
    const [showDateFilter, setShowDateFilter] = useState(false);

    // Get unique values for filters
    const supplierTypeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'Main Supplier', label: 'Main Supplier' },
        { value: 'Sub Supplier', label: 'Sub Supplier' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'Completed', label: 'Completed' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Pending Review', label: 'Pending Review' },
    ];

    const auditorOptions = [
        { value: 'all', label: 'All Auditors' },
        { value: 'John Smith', label: 'John Smith' },
        { value: 'Sarah Johnson', label: 'Sarah Johnson' },
        { value: 'Mike Wilson', label: 'Mike Wilson' },
        { value: 'Emily Brown', label: 'Emily Brown' },
        { value: 'David Lee', label: 'David Lee' },
    ];

    useEffect(() => {
        // Initialize with static data
        setAuditData(staticAuditData);
        setFilteredData(staticAuditData);
    }, []);

    const getScoreColor = (score) => {
        if (score >= 90) return 'bg-green-100 text-green-800';
        if (score >= 80) return 'bg-blue-100 text-blue-800';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800';
        if (score >= 60) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800';
            case 'Pending Review':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderProgressBar = (score) => {
        return (
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                    className={`h-4 rounded-full ${score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-blue-500' : score >= 70 ? 'bg-yellow-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        );
    };

    const auditColumns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            sort: true,
            width: 60,
            Cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            Header: 'Audit ID',
            accessor: 'auditId',
            sort: true,
            Cell: ({ value }) => <span className="font-semibold text-blue-600">{value}</span>,
        },
        {
            Header: 'Supplier',
            accessor: 'supplierName',
            sort: true,
            Cell: ({ value, row }) => (
                <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500">{row.original.supplierType}</div>
                </div>
            ),
        },
        {
            Header: 'Audit Date',
            accessor: 'auditDate',
            sort: true,
            Cell: ({ value }) => moment(value).format('DD/MM/YYYY'),
        },
        {
            Header: 'Auditor',
            accessor: 'auditorName',
            sort: true,
        },
        {
            Header: 'Last Score',
            accessor: 'lastAuditScore',
            sort: true,
            Cell: ({ value }) => (
                <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(value)}`}>{value}%</span>
                </div>
            ),
        },
        {
            Header: 'Current Score',
            accessor: 'currentScore',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="space-y-1">
                    <div className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(value)}`}>{value}%</span>
                    </div>
                    <div className="text-xs text-gray-500 text-center">{value >= row.original.lastAuditScore ? '↑ Improved' : '↓ Declined'}</div>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'status',
            sort: true,
            Cell: ({ value }) => <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>{value}</span>,
        },
        {
            Header: 'Progress Chart',
            accessor: 'progress',
            sort: false,
            Cell: ({ row }) => (
                <div className="text-center">
                    <button
                        onClick={() => handleViewChart(row.original)}
                        className="flex items-center justify-center w-8 h-8 text-purple-600 hover:text-purple-800 transition-colors"
                        title="View Progress Chart"
                    >
                        <IconChartBar className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            width: 180,
            Cell: ({ row }) => {
                const data = row.original;
                return (
                    <div className="flex items-center justify-center space-x-2">
                        {/* View Details */}
                        <button onClick={() => handleViewDetails(data)} className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors" title="View Details">
                            <IconEye className="w-4 h-4" />
                        </button>

                        {/* View Images */}
                        <button onClick={() => handleViewImages(data)} className="flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 transition-colors" title="View Images">
                            <IconImages className="w-4 h-4" />
                        </button>

                        {/* Export to Excel */}
                        <button
                            onClick={() => handleExportAudit(data)}
                            className="flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-800 transition-colors"
                            title="Export to Excel"
                        >
                            <IconDownload className="w-4 h-4" />
                        </button>

                        {/* View PDF Report */}
                        <button onClick={() => handleViewPDF(data)} className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 transition-colors" title="View PDF Report">
                            <IconExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSearchLoading(true);

        let filtered = [...auditData];

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter((audit) => audit.supplierName.toLowerCase().includes(query) || audit.auditId.toLowerCase().includes(query) || audit.auditorName.toLowerCase().includes(query));
        }

        // Apply supplier type filter
        if (filters.selectedSupplierType && filters.selectedSupplierType.value !== 'all') {
            filtered = filtered.filter((audit) => audit.supplierType === filters.selectedSupplierType.value);
        }

        // Apply status filter
        if (filters.selectedStatus && filters.selectedStatus.value !== 'all') {
            filtered = filtered.filter((audit) => audit.status === filters.selectedStatus.value);
        }

        // Apply auditor filter
        if (filters.selectedAuditor && filters.selectedAuditor.value !== 'all') {
            filtered = filtered.filter((audit) => audit.auditorName === filters.selectedAuditor.value);
        }

        // Apply date filter
        if (showDateFilter && filters.startDate && filters.toDate) {
            filtered = filtered.filter((audit) => {
                const auditDate = moment(audit.auditDate);
                const start = moment(filters.startDate);
                const end = moment(filters.toDate);
                return auditDate.isBetween(start, end, null, '[]');
            });
        }

        setTimeout(() => {
            setFilteredData(filtered);
            setAppliedFilters({ ...filters });
            setCurrentPage(0);
            setSearchLoading(false);
        }, 500);
    };

    const handleClear = () => {
        setFilters({
            searchQuery: '',
            selectedSupplierType: null,
            selectedStatus: null,
            selectedAuditor: null,
            startDate: '',
            toDate: '',
        });
        setAppliedFilters(null);
        setShowDateFilter(false);
        setSearchLoading(false);
        setCurrentPage(0);
        setFilteredData(staticAuditData);
    };

    const toggleDateFilter = () => {
        setShowDateFilter(!showDateFilter);
        if (!showDateFilter) {
            setFilters((prev) => ({
                ...prev,
                startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
                toDate: moment().format('YYYY-MM-DD'),
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                startDate: '',
                toDate: '',
            }));
        }
    };

    const handleViewDetails = (audit) => {
        setSelectedAudit(audit);
        setShowDetailsModal(true);
    };

    const handleViewImages = (audit) => {
        // Navigate to images PDF page
        navigate('/documents/print-sub-checklist-sub-audit-images', {
            state: {
                auditData: audit,
                images: audit.images || [],
            },
        });
    };

    const handleViewChart = (audit) => {
        navigate('/documents/print-sub-checklist-sub-audit-bar-chart', {
            state: {
                auditData: audit,
                allAudits: filteredData,
            },
        });
    };

    const handleExportAudit = (audit) => {
        exportAuditToExcel(audit);
    };

    const handleViewPDF = (audit) => {
        navigate('/documents/print-sub-checklist-sub-audit', {
            state: {
                auditData: audit,
            },
        });
    };

    const handleExportPDFWithImages = () => {
        if (filteredData.length > 0) {
            navigate('/documents/print-sub-checklist-sub-audit-images', {
                state: {
                    auditData: filteredData[0],
                    images: filteredData[0].images || [],
                },
            });
        }
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedAudit(null);
    };

    const exportAuditToExcel = (audit) => {
        const wb = XLSX.utils.book_new();

        // Main Audit Info Sheet
        const auditInfo = [
            ['ASIAN FABRIC X - SUB SUPPLIER AUDIT REPORT'],
            [`Audit ID: ${audit.auditId}`],
            [`Supplier Name: ${audit.supplierName}`],
            [`Supplier Type: ${audit.supplierType}`],
            [`Audit Date: ${moment(audit.auditDate).format('DD/MM/YYYY')}`],
            [`Auditor: ${audit.auditorName}`],
            [`Status: ${audit.status}`],
            [],
            ['AUDIT SCORES SUMMARY'],
            ['Category', 'Score (%)', 'Status'],
            ['1. Child Labour', audit.childLabourScore, audit.childLabourScore === 100 ? 'PASS' : 'FAIL'],
            ['2. Forced Labour', audit.forcedLabourScore, audit.forcedLabourScore === 100 ? 'PASS' : 'FAIL'],
            ['3. Freedom of Association', audit.freedomOfAssociationScore, audit.freedomOfAssociationScore === 100 ? 'PASS' : 'FAIL'],
            ['4. Discrimination', audit.discriminationScore, audit.discriminationScore === 100 ? 'PASS' : 'FAIL'],
            ['5. Management System', audit.mgmtSystemScore, audit.mgmtSystemScore === 100 ? 'PASS' : 'FAIL'],
            ['6. Business Ethics', audit.businessEthicsScore, audit.businessEthicsScore === 100 ? 'PASS' : 'FAIL'],
            ['7. Environmental Management', audit.envMgmtScore, audit.envMgmtScore === 100 ? 'PASS' : 'FAIL'],
            ['8. Health & Safety', audit.healthSafetyScore, audit.healthSafetyScore === 100 ? 'PASS' : 'FAIL'],
            ['9. Working Hours', audit.workingHoursScore, audit.workingHoursScore === 100 ? 'PASS' : 'FAIL'],
            ['10. Accident Insurance', audit.accidentInsuranceScore, audit.accidentInsuranceScore === 100 ? 'PASS' : 'FAIL'],
            ['11. Licenses & Permits', audit.licensesPermitsScore, audit.licensesPermitsScore === 100 ? 'PASS' : 'FAIL'],
            ['12. Housekeeping', audit.housekeepingScore, audit.housekeepingScore === 100 ? 'PASS' : 'FAIL'],
            ['13. Recruitment', audit.recruitmentScore, audit.recruitmentScore === 100 ? 'PASS' : 'FAIL'],
            ['14. Accommodation', audit.accommodationScore, audit.accommodationScore === 100 ? 'PASS' : 'FAIL'],
            ['15. Transport', audit.transportScore, audit.transportScore === 100 ? 'PASS' : 'FAIL'],
            [],
            ['TOTAL SCORE', audit.currentScore, audit.currentScore >= 70 ? 'PASS' : 'FAIL'],
        ];

        const ws1 = XLSX.utils.aoa_to_sheet(auditInfo);
        ws1['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];

        // Detailed Checklist Sheet
        const checklistData = [['DETAILED CHECKLIST - YES/NO/NOT APPLICABLE'], [], ['Item', 'Requirement', 'Response', 'Comments', 'Evidence']];

        // Add sample checklist items
        const checklistItems = [
            ['1.1', 'No child labour employed', 'Yes', 'All workers above 18', 'Worker IDs verified'],
            ['1.2', 'Age verification records maintained', 'Yes', 'Proper records kept', 'Records checked'],
            ['2.1', 'No forced or bonded labour', 'Yes', 'Voluntary employment', 'Interview records'],
            ['3.1', 'Freedom of association allowed', 'Yes', 'Workers can form unions', 'Policy document'],
            // Add more items as needed
        ];

        checklistData.push(...checklistItems);

        const ws2 = XLSX.utils.aoa_to_sheet(checklistData);
        ws2['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 30 }, { wch: 30 }];

        // Images Sheet
        const imagesData = [['AUDIT IMAGES'], [], ['Image ID', 'Title', 'Description', 'Checklist', 'Upload Date']];

        if (audit.images && audit.images.length > 0) {
            audit.images.forEach((image) => {
                imagesData.push([image.id, image.title, image.description, `Checklist ${image.checklistId} - Item ${image.itemId}`, moment(image.uploadDate).format('DD/MM/YYYY')]);
            });
        } else {
            imagesData.push(['No images available for this audit']);
        }

        const ws3 = XLSX.utils.aoa_to_sheet(imagesData);
        ws3['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 40 }, { wch: 25 }, { wch: 15 }];

        XLSX.utils.book_append_sheet(wb, ws1, 'Audit Summary');
        XLSX.utils.book_append_sheet(wb, ws2, 'Detailed Checklist');
        XLSX.utils.book_append_sheet(wb, ws3, 'Audit Images');

        const fileName = `Audit-Report-${audit.auditId}-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onDownloadAllExcel = () => {
        const wb = XLSX.utils.book_new();

        const header = [
            ['ASIAN FABRIC X - AUDIT MANAGEMENT REPORT'],
            [`Report Generated: ${moment().format('DD/MM/YYYY HH:mm')}`],
            [],
            [
                'Audit ID',
                'Supplier Name',
                'Supplier Type',
                'Audit Date',
                'Auditor',
                'Last Score',
                'Current Score',
                'Status',
                'Child Labour',
                'Forced Labour',
                'Freedom Assoc',
                'Discrimination',
                'Mgmt System',
                'Business Ethics',
                'Env Mgmt',
                'Health Safety',
                'Working Hours',
                'Accident Ins',
                'Licenses',
                'Housekeeping',
                'Recruitment',
                'Accommodation',
                'Transport',
                'Images Count',
            ],
        ];

        const data = filteredData.map((audit) => [
            audit.auditId,
            audit.supplierName,
            audit.supplierType,
            moment(audit.auditDate).format('DD/MM/YYYY'),
            audit.auditorName,
            audit.lastAuditScore,
            audit.currentScore,
            audit.status,
            audit.childLabourScore,
            audit.forcedLabourScore,
            audit.freedomOfAssociationScore,
            audit.discriminationScore,
            audit.mgmtSystemScore,
            audit.businessEthicsScore,
            audit.envMgmtScore,
            audit.healthSafetyScore,
            audit.workingHoursScore,
            audit.accidentInsuranceScore,
            audit.licensesPermitsScore,
            audit.housekeepingScore,
            audit.recruitmentScore,
            audit.accommodationScore,
            audit.transportScore,
            audit.images ? audit.images.length : 0,
        ]);

        const allRows = [...header, ...data];
        const ws = XLSX.utils.aoa_to_sheet(allRows);

        ws['!cols'] = Array(24)
            .fill(null)
            .map(() => ({ wch: 15 }));

        XLSX.utils.book_append_sheet(wb, ws, 'Audit Report');

        const fileName = `Audit-Report-${moment().format('DD-MM-YYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const onDownloadPDF = () => {
        navigate('/documents/audit-report-pdf', {
            state: {
                allAudits: filteredData,
                filters: appliedFilters,
            },
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredData.length;
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            minHeight: '42px',
            '&:hover': {
                borderColor: '#d1d5db',
            },
        }),
    };

    return (
        <div className="p-6">
            <div className="p-6 text-center">
                <h1 className="text-3xl font-extrabold text-gray-800">Audit Management Report</h1>
                <p className="text-gray-600 mt-2">Sub Supplier Audit Compliance Tracking</p>
            </div>

            {showSearch && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Search & Filter</h2>
                        <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                            ▲ Hide
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            {/* Date Filter Toggle Button */}
                            <div className="md:col-span-2 lg:col-span-4">
                                <button
                                    type="button"
                                    onClick={toggleDateFilter}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                                        showDateFilter ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <IconCalendar className="w-4 h-4" />
                                    <span className="font-medium">{showDateFilter ? 'Hide Date Filter' : 'Add Date Filter'}</span>
                                </button>
                            </div>

                            {/* Date Filters */}
                            {showDateFilter && (
                                <>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <label className="block text-sm font-medium text-blue-800 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            value={filters.startDate}
                                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <label className="block text-sm font-medium text-blue-800 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            value={filters.toDate}
                                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Supplier Type Filter */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Type</label>
                                <Select
                                    options={supplierTypeOptions}
                                    value={filters.selectedSupplierType}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedSupplierType: selectedOption })}
                                    placeholder="Select Type"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <Select
                                    options={statusOptions}
                                    value={filters.selectedStatus}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedStatus: selectedOption })}
                                    placeholder="Select Status"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            {/* Auditor Filter */}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Auditor</label>
                                <Select
                                    options={auditorOptions}
                                    value={filters.selectedAuditor}
                                    onChange={(selectedOption) => setFilters({ ...filters, selectedAuditor: selectedOption })}
                                    placeholder="Select Auditor"
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            {/* Search Input */}
                            <div className="md:col-span-2 bg-white p-3 rounded-lg border border-gray-200">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <IconSearch className="inline w-4 h-4 mr-1" />
                                    Search
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search by supplier name, audit ID, or auditor..."
                                    value={filters.searchQuery}
                                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                            <button type="button" onClick={handleClear} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium">
                                Clear All
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center min-w-[120px]"
                                disabled={searchLoading || (showDateFilter && (!filters.startDate || !filters.toDate))}
                            >
                                {searchLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Searching...
                                    </>
                                ) : (
                                    'Search'
                                )}
                            </button>
                            {appliedFilters && filteredData.length > 0 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={onDownloadAllExcel}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-sm flex items-center"
                                    >
                                        <IconPrinter className="mr-2 w-4 h-4" />
                                        Export Excel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onDownloadPDF}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm flex items-center"
                                    >
                                        <IconPrinter className="mr-2 w-4 h-4" />
                                        Export PDF
                                    </button>
                                    {/* <button
                                        type="button"
                                        onClick={handleExportPDFWithImages}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium shadow-sm flex items-center"
                                    >
                                        <IconImages className="mr-2 w-4 h-4" />
                                        Images PDF
                                    </button> */}
                                </>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {!showSearch && (
                <div className="flex justify-center mb-6">
                    <button onClick={() => setShowSearch(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center">
                        <IconSearch className="mr-2 w-4 h-4" />
                        Show Search Panel
                    </button>
                </div>
            )}

            {/* Loading States and Table */}
            {searchLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-6"></div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Searching Audit Data</h3>
                        <p className="text-gray-500">Please wait while we fetch the audit information based on your criteria</p>
                    </div>
                </div>
            ) : appliedFilters && filteredData.length > 0 ? (
                <>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-1">Audit Report</h3>
                                    <p className="text-gray-600">
                                        Showing {filteredData.length} records
                                        {showDateFilter && filters.startDate && filters.toDate
                                            ? ` from ${moment(filters.startDate).format('DD MMM YYYY')} to ${moment(filters.toDate).format('DD MMM YYYY')}`
                                            : ' (All Time)'}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 text-sm">
                                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Total Audits: </span>
                                        <span className="font-semibold text-blue-600">{filteredData.length}</span>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Avg Score: </span>
                                        <span className="font-semibold text-green-600">{Math.round(filteredData.reduce((sum, audit) => sum + audit.currentScore, 0) / filteredData.length)}%</span>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-gray-600">Total Images: </span>
                                        <span className="font-semibold text-indigo-600">{filteredData.reduce((sum, audit) => sum + (audit.images ? audit.images.length : 0), 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <Table
                                columns={auditColumns}
                                data={getPaginatedData()}
                                Title=""
                                pageSize={pageSize}
                                pageIndex={currentPage}
                                totalCount={getTotalCount()}
                                totalPages={Math.ceil(getTotalCount() / pageSize)}
                                onPaginationChange={handlePaginationChange}
                                isSortable={true}
                                pagination={true}
                                isSearchable={false}
                                tableClass="min-w-full rounded-lg overflow-hidden"
                                theadClass="bg-gray-50"
                            />
                        </div>
                    </div>
                </>
            ) : appliedFilters && filteredData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Data Found</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">No audit records match your current search criteria. Try adjusting your filters or search terms.</p>
                        <button onClick={handleClear} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold">
                            Clear Filters
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <IconSearch className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Audit Report Dashboard</h3>
                        <p className="text-gray-600 text-lg max-w-md mb-6">
                            {auditData.length > 0 ? `Ready to search through ${auditData.length} audit records. Use the search filters above to generate detailed reports.` : 'Loading audit data...'}
                        </p>
                        <button
                            onClick={() => setShowSearch(true)}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg"
                        >
                            Start Searching
                        </button>
                    </div>
                </div>
            )}

            {/* Audit Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Audit Details - ${selectedAudit?.auditId || ''}`}
                setModel={closeDetailsModal}
                modelSize="max-w-5xl"
                submitBtnText="Close"
                loading={false}
                hideSubmit={true}
                saveBtn={false}
            >
                {selectedAudit && (
                    <div className="p-4 space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-3">Supplier Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Supplier Name:</span>
                                        <span className="font-medium">{selectedAudit.supplierName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Supplier Type:</span>
                                        <span className="font-medium">{selectedAudit.supplierType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Audit Date:</span>
                                        <span className="font-medium">{moment(selectedAudit.auditDate).format('DD/MM/YYYY')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Images:</span>
                                        <span className="font-medium text-indigo-600">{selectedAudit.images ? selectedAudit.images.length : 0} uploaded</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-3">Score Information</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Audit Score:</span>
                                        <span className={`font-medium ${getScoreColor(selectedAudit.lastAuditScore)} px-2 py-1 rounded`}>{selectedAudit.lastAuditScore}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Score:</span>
                                        <span className={`font-medium ${getScoreColor(selectedAudit.currentScore)} px-2 py-1 rounded`}>{selectedAudit.currentScore}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Improvement:</span>
                                        <span className={`font-medium ${selectedAudit.currentScore >= selectedAudit.lastAuditScore ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedAudit.currentScore >= selectedAudit.lastAuditScore ? '+' : ''}
                                            {selectedAudit.currentScore - selectedAudit.lastAuditScore}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Images Preview */}
                        {selectedAudit.images && selectedAudit.images.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-4">Audit Images ({selectedAudit.images.length})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {selectedAudit.images.slice(0, 4).map((image) => (
                                        <div key={image.id} className="relative group">
                                            <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white">
                                                <img src={image.url} alt={image.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleViewImages(selectedAudit)}
                                                    className="px-3 py-1 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-xs font-medium text-gray-700 truncate">{image.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{image.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => handleViewImages(selectedAudit)}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <IconImages className="w-4 h-4" />
                                        View All Images ({selectedAudit.images.length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Checklist Scores Grid */}
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Checklist Scores</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
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
                                ].map((item, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                            <span className={`text-sm font-bold ${getScoreColor(item.score)} px-2 py-1 rounded`}>{item.score}%</span>
                                        </div>
                                        {renderProgressBar(item.score)}
                                        <div className="text-xs text-gray-500 mt-1 text-center">
                                            {item.score === 100 ? 'Fully Compliant' : item.score >= 70 ? 'Partially Compliant' : 'Needs Improvement'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Audit Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3">Audit Summary</h4>
                            <div className="text-sm text-gray-600">
                                <p>
                                    Auditor: <span className="font-medium">{selectedAudit.auditorName}</span>
                                </p>
                                <p>
                                    Status: <span className={`font-medium ${getStatusColor(selectedAudit.status)} px-2 py-1 rounded`}>{selectedAudit.status}</span>
                                </p>
                                <p>
                                    Visit Date: <span className="font-medium">{moment(selectedAudit.visitDate).format('DD/MM/YYYY')}</span>
                                </p>
                                <p>
                                    Images: <span className="font-medium text-indigo-600">{selectedAudit.images ? selectedAudit.images.length : 0} evidence images</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default Index;
