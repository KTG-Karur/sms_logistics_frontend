import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import IconEye from '../../components/Icon/IconEye';
import IconEdit from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPlus from '../../components/Icon/IconPlus';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconDownload from '../../components/Icon/IconFile';
import IconRestore from '../../components/Icon/IconRefresh';
import IconQrCode from '../../components/Icon/IconAirplay';
import IconRotate from '../../components/Icon/IconRefresh';
import IconFilter from '../../components/Icon/IconSearch';
import IconSearch from '../../components/Icon/IconSearch';
import IconCalendar from '../../components/Icon/IconCalendar';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../util/ModelViewBox';
import 'tippy.js/dist/tippy.css';
import { showMessage } from '../../util/AllFunction';

const ExternalProviderAudit = () => {
    const navigate = useNavigate();
    const [audits, setAudits] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAudits, setFilteredAudits] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    
    const [statusFilter, setStatusFilter] = useState({ value: 'all', label: 'All Status' });
    const [supplierFilter, setSupplierFilter] = useState({ value: 'all', label: 'All Suppliers' });
    const [auditorFilter, setAuditorFilter] = useState({ value: 'all', label: 'All Auditors' });
    
    const [reauditModal, setReauditModal] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState(null);
    const [reauditReason, setReauditReason] = useState('');
    
    const [qrModal, setQrModal] = useState(false);
    const [qrAudit, setQrAudit] = useState(null);

    // Enhanced dummy data with more realistic audit information
    const dummyAudits = [
        {
            id: 1,
            supplierName: 'ABC Manufacturing Ltd.',
            supplierType: 'Manufacturer',
            employeeCount: 150,
            productionCapacity: '5000 units/month',
            asianAuditorName: 'Rajesh Kumar',
            lastAuditDate: '2024-02-15',
            machineCount: 25,
            products: 'Textiles, Fabrics',
            visitDate: '2024-03-10',
            supplierRepresentative: 'Mr. Sharma',
            lastAuditScore: 85,
            currentScore: 88,
            transportAvailable: true,
            accommodationAvailable: false,
            animalsAllowed: false,
            status: 'Completed',
            auditDate: '2024-03-10',
            checklistCount: 19,
            workerInterviewCount: 5,
            isActive: 1,
            createdDate: '2024-03-10',
            auditId: 'AUD-001',
            reauditCount: 0
        },
        {
            id: 2,
            supplierName: 'XYZ Textile Mills',
            supplierType: 'Textile Producer',
            employeeCount: 200,
            productionCapacity: '8000 meters/day',
            asianAuditorName: 'Priya Sharma',
            lastAuditDate: '2024-01-20',
            machineCount: 40,
            products: 'Cotton Fabrics, Polyester',
            visitDate: '2024-03-05',
            supplierRepresentative: 'Ms. Gupta',
            lastAuditScore: 78,
            currentScore: 82,
            transportAvailable: true,
            accommodationAvailable: true,
            animalsAllowed: true,
            status: 'Completed',
            auditDate: '2024-03-05',
            checklistCount: 19,
            workerInterviewCount: 3,
            isActive: 1,
            createdDate: '2024-03-05',
            auditId: 'AUD-002',
            reauditCount: 1
        },
        {
            id: 3,
            supplierName: 'Global Garments Inc.',
            supplierType: 'Garment Manufacturer',
            employeeCount: 300,
            productionCapacity: '10000 pieces/day',
            asianAuditorName: 'Amit Patel',
            lastAuditDate: '2024-02-28',
            machineCount: 60,
            products: 'Ready-made Garments',
            visitDate: '2024-03-12',
            supplierRepresentative: 'Mr. Singh',
            lastAuditScore: 90,
            currentScore: 92,
            transportAvailable: false,
            accommodationAvailable: true,
            animalsAllowed: false,
            status: 'Completed',
            auditDate: '2024-03-12',
            checklistCount: 19,
            workerInterviewCount: 4,
            isActive: 1,
            createdDate: '2024-03-12',
            auditId: 'AUD-003',
            reauditCount: 0
        },
        {
            id: 4,
            supplierName: 'Tech Components Corp.',
            supplierType: 'Electronic Components',
            employeeCount: 120,
            productionCapacity: '20000 units/month',
            asianAuditorName: 'Sanjay Verma',
            lastAuditDate: '2024-02-10',
            machineCount: 35,
            products: 'PCB Boards, Sensors',
            visitDate: '2024-03-15',
            supplierRepresentative: 'Dr. Reddy',
            lastAuditScore: 92,
            currentScore: 95,
            transportAvailable: true,
            accommodationAvailable: false,
            animalsAllowed: false,
            status: 'Completed',
            auditDate: '2024-03-15',
            checklistCount: 19,
            workerInterviewCount: 6,
            isActive: 1,
            createdDate: '2024-03-15',
            auditId: 'AUD-004',
            reauditCount: 2
        },
        {
            id: 5,
            supplierName: 'Food Processing Unit',
            supplierType: 'Food Manufacturer',
            employeeCount: 180,
            productionCapacity: '10000 kg/day',
            asianAuditorName: 'Meera Nair',
            lastAuditDate: '2024-02-05',
            machineCount: 45,
            products: 'Packaged Foods, Spices',
            visitDate: '2024-03-18',
            supplierRepresentative: 'Mrs. Iyer',
            lastAuditScore: 75,
            currentScore: 80,
            transportAvailable: false,
            accommodationAvailable: true,
            animalsAllowed: true,
            status: 'Deleted',
            auditDate: '2024-03-18',
            checklistCount: 19,
            workerInterviewCount: 4,
            isActive: 0,
            createdDate: '2024-03-18',
            auditId: 'AUD-005',
            reauditCount: 0
        }
    ];

    // Filter options
    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'deleted', label: 'Deleted' },
    ];

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setAudits(dummyAudits);
            setFilteredAudits(dummyAudits.filter(a => a.status === 'Completed'));
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        let filtered = audits;
        
        // Apply status filter
        if (statusFilter.value === 'completed') {
            filtered = audits.filter(a => a.status === 'Completed' && a.isActive === 1);
        } else if (statusFilter.value === 'deleted') {
            filtered = audits.filter(a => a.isActive === 0);
        } else if (statusFilter.value === 'all') {
            filtered = audits.filter(a => a.status === 'Completed');
        }
        
        // Apply search filter
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(audit =>
                audit.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                audit.supplierType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                audit.products.toLowerCase().includes(searchTerm.toLowerCase()) ||
                audit.asianAuditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                audit.supplierRepresentative.toLowerCase().includes(searchTerm.toLowerCase()) ||
                audit.auditId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply supplier filter
        if (supplierFilter.value !== 'all') {
            filtered = filtered.filter(audit => audit.supplierName === supplierFilter.value);
        }
        
        // Apply auditor filter
        if (auditorFilter.value !== 'all') {
            filtered = filtered.filter(audit => audit.asianAuditorName === auditorFilter.value);
        }
        
        setFilteredAudits(filtered);
        setCurrentPage(0);
    }, [searchTerm, statusFilter, supplierFilter, auditorFilter, audits]);

    const handleCreateNewAudit = () => {
        navigate('/audit/external-provider/form', { 
            state: { mode: 'create' }
        });
    };

    const handleViewAudit = (audit) => {
        navigate('/audit/report-pdf', { 
            // state: { 
            //     auditData: audit 
            // }
        });
    };

    const handleEditAudit = (audit) => {
        if (audit.isActive !== 1) {
            showMessage('error', 'Cannot edit deleted audit. Please restore it first.');
            return;
        }
        navigate('/audit/external-provider/form', { 
            state: { 
                mode: 'edit', 
                auditData: audit 
            }
        });
    };

    const handleDeleteAudit = (audit) => {
        showMessage('warning', 'Are you sure you want to delete this audit?', () => {
            const updatedAudits = audits.map(a => 
                a.id === audit.id ? { ...a, isActive: 0, status: 'Deleted' } : a
            );
            setAudits(updatedAudits);
            showMessage('success', 'Audit deleted successfully');
        });
    };

    const handleRestoreAudit = (audit) => {
        const updatedAudits = audits.map(a => 
            a.id === audit.id ? { ...a, isActive: 1, status: 'Completed' } : a
        );
        setAudits(updatedAudits);
        showMessage('success', 'Audit restored successfully');
    };

    const openReauditModal = (audit) => {
        setSelectedAudit(audit);
        setReauditReason('');
        setReauditModal(true);
    };

    const handleReauditSubmit = () => {
        if (!reauditReason.trim()) {
            showMessage('error', 'Please provide a reason for re-audit');
            return;
        }

        if (selectedAudit) {
            const updatedAudits = audits.map(a => 
                a.id === selectedAudit.id ? { 
                    ...a, 
                    reauditCount: a.reauditCount + 1,
                    status: 'Pending Reaudit',
                    reauditReason: reauditReason,
                    reauditRequestDate: new Date().toISOString().split('T')[0]
                } : a
            );
            setAudits(updatedAudits);
            showMessage('success', 'Re-audit requested successfully');
            setReauditModal(false);
            setReauditReason('');
            setSelectedAudit(null);
        }
    };

    const openQrModal = (audit) => {
        setQrAudit(audit);
        setQrModal(true);
    };

    const getStatusBadge = (status, isActive) => {
        if (!isActive) {
            return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Deleted</span>;
        }
        
        switch (status) {
            case 'Completed':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
            case 'Pending Reaudit':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending Reaudit</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 90) return <span className="px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">{score}%</span>;
        if (score >= 80) return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500 text-white">{score}%</span>;
        if (score >= 70) return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white">{score}%</span>;
        return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">{score}%</span>;
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredAudits.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredAudits.length;
    };

    const getAuditDetails = (audit) => {
        return `${audit.employeeCount} employees • ${audit.machineCount} machines • ${audit.workerInterviewCount} interviews`;
    };

    const getStatistics = () => {
        const completedCount = audits.filter(a => a.status === 'Completed' && a.isActive === 1).length;
        const deletedCount = audits.filter(a => a.isActive === 0).length;
        const pendingReauditCount = audits.filter(a => a.status === 'Pending Reaudit' && a.isActive === 1).length;

        return { completedCount, deletedCount, pendingReauditCount };
    };

    const stats = getStatistics();

    // Get unique suppliers and auditors for filters
    const uniqueSuppliers = [...new Set(audits.map(a => a.supplierName))];
    const uniqueAuditors = [...new Set(audits.map(a => a.asianAuditorName))];

    const columns = [
        {
            Header: 'Supplier Details',
            accessor: 'supplierName',
            sort: true,
            Cell: ({ value, row }) => {
                const audit = row.original;
                return (
                    <div>
                        <div className="font-medium text-gray-800 flex items-center">
                            {value}
                            {audit.reauditCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    Re-audit #{audit.reauditCount}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{audit.supplierType}</div>
                        <div className="text-xs text-gray-500 mt-1">{audit.products}</div>
                        <div className="text-xs text-gray-500 mt-1">{getAuditDetails(audit)}</div>
                        <div className="text-xs text-gray-400 mt-1 font-mono">ID: {audit.auditId}</div>
                    </div>
                );
            },
        },
        {
            Header: 'Audit Info',
            accessor: 'auditInfo',
            Cell: ({ row }) => {
                const audit = row.original;
                return (
                    <div>
                        <div className="font-medium text-gray-800">{audit.asianAuditorName}</div>
                        <div className="text-sm text-gray-600 mt-1">Auditor</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <IconCalendar className="w-3 h-3 mr-1" />
                            {new Date(audit.visitDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{audit.supplierRepresentative}</div>
                        {audit.reauditReason && (
                            <div className="text-xs text-yellow-600 mt-1">
                                <span className="font-medium">Re-audit Reason:</span> {audit.reauditReason}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            Header: 'Scores',
            accessor: 'scores',
            Cell: ({ row }) => {
                const audit = row.original;
                return (
                    <div className="space-y-2">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Last Score</div>
                            <div>{getScoreBadge(audit.lastAuditScore)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Current Score</div>
                            <div>{getScoreBadge(audit.currentScore)}</div>
                        </div>
                        {audit.reauditCount > 0 && (
                            <div className="text-xs text-purple-600 font-medium">
                                {audit.reauditCount} re-audit(s)
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value, row }) => {
                const audit = row.original;
                return (
                    <div className="space-y-2">
                        <div>{getStatusBadge(value, audit.isActive)}</div>
                        <div className="text-xs text-gray-500">
                            {audit.checklistCount} checklist items
                        </div>
                        {audit.status === 'Pending Reaudit' && (
                            <div className="text-xs text-yellow-600">
                                Awaiting re-audit
                            </div>
                        )}
                    </div>
                );
            },
            width: 150,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const audit = row.original;
                const isActive = audit.isActive === 1;
                const isCompleted = audit.status === 'Completed';

                return (
                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                            <Tippy content="View Full Audit">
                                <button 
                                    onClick={() => handleViewAudit(audit)} 
                                    className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                                >
                                    <IconEye className="w-4 h-4 mr-1.5" />
                                    View
                                </button>
                            </Tippy>

                            <Tippy content="View QR Code">
                                <button 
                                    onClick={() => openQrModal(audit)} 
                                    className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                                >
                                    <IconQrCode className="w-4 h-4 mr-1.5" />
                                    QR
                                </button>
                            </Tippy>
                              <Tippy content="View CAPA">
                                <button 
                                    onClick={() => navigate(`/capa`)}
                                    className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                                >
                                    <IconFilter className="w-4 h-4 mr-1.5" />
                                   CAPA
                                </button>
                            </Tippy>
                        </div>

                        <div className="flex space-x-2">
                            {isActive ? (
                                <>
                                    {isCompleted && (
                                        <Tippy content="Request Re-audit">
                                            <button 
                                                onClick={() => openReauditModal(audit)} 
                                                className="flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors text-sm"
                                            >
                                                <IconRotate className="w-4 h-4 mr-1.5" />
                                                Re-audit
                                            </button>
                                        </Tippy>
                                    )}
                                    <Tippy content="Edit Audit">
                                        <button 
                                            onClick={() => handleEditAudit(audit)} 
                                            className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm"
                                        >
                                            <IconEdit className="w-4 h-4 mr-1.5" />
                                            Edit
                                        </button>
                                    </Tippy>
                                    <Tippy content="Delete Audit">
                                        <button 
                                            onClick={() => handleDeleteAudit(audit)} 
                                            className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm"
                                        >
                                            <IconTrashLines className="w-4 h-4 mr-1.5" />
                                            Delete
                                        </button>
                                    </Tippy>
                                </>
                            ) : (
                                <Tippy content="Restore Audit">
                                    <button 
                                        onClick={() => handleRestoreAudit(audit)} 
                                        className="flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors text-sm"
                                    >
                                        <IconRestore className="w-4 h-4 mr-1.5" />
                                        Restore
                                    </button>
                                </Tippy>
                            )}
                        </div>
                    </div>
                );
            },
            width: 200,
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800">External Provider Audit Management</h1>
                <p className="text-gray-600 mt-2">Manage and track compliance audits for external suppliers and providers</p>
            </div>

 {/* Filter Toggle Button */}
            <div className="mb-4">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                    <IconFilter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Filters Section - Collapsible */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by audit ID, supplier, products, auditor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input w-full pl-10"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <IconSearch className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={statusOptions}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '42px',
                                    }),
                                }}
                            />
                        </div>

                        {/* Supplier Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                            <Select
                                value={supplierFilter}
                                onChange={setSupplierFilter}
                                options={[
                                    { value: 'all', label: 'All Suppliers' },
                                    ...uniqueSuppliers.map(supplier => ({
                                        value: supplier,
                                        label: supplier
                                    }))
                                ]}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '42px',
                                    }),
                                }}
                            />
                        </div>

                        {/* Auditor Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Auditor</label>
                            <Select
                                value={auditorFilter}
                                onChange={setAuditorFilter}
                                options={[
                                    { value: 'all', label: 'All Auditors' },
                                    ...uniqueAuditors.map(auditor => ({
                                        value: auditor,
                                        label: auditor
                                    }))
                                ]}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '42px',
                                    }),
                                }}
                            />
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter({ value: 'all', label: 'All Status' });
                                    setSupplierFilter({ value: 'all', label: 'All Suppliers' });
                                    setAuditorFilter({ value: 'all', label: 'All Auditors' });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center h-[42px]"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="text-3xl font-bold mb-2">{stats.completedCount}</div>
                    <div className="text-sm font-medium opacity-90">Completed Audits</div>
                    <div className="text-xs opacity-75 mt-1">Successfully audited</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="text-3xl font-bold mb-2">{stats.deletedCount}</div>
                    <div className="text-sm font-medium opacity-90">Deleted Audits</div>
                    <div className="text-xs opacity-75 mt-1">Archived/Removed</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                    <div className="text-3xl font-bold mb-2">{stats.pendingReauditCount}</div>
                    <div className="text-sm font-medium opacity-90">Pending Re-audits</div>
                    <div className="text-xs opacity-75 mt-1">Awaiting re-audit</div>
                </div>
            </div>

            {/* Main Table */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'External Provider Audits'}
                    toggle={handleCreateNewAudit}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={false}
                    isSortable={true}
                    btnName="New Audit"
                    loadings={loading}
                    customSearch={
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700">
                                    Showing {filteredAudits.length} audit(s)
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="btn btn-outline-primary">
                                    <IconPrinter className="w-4 h-4 mr-2" />
                                    Print
                                </button>
                                <button className="btn btn-outline-secondary">
                                    <IconDownload className="w-4 h-4 mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>
                    }
                />
            </div>

            {/* Re-audit Modal */}
            <ModelViewBox
                modal={reauditModal}
                modelHeader="Request Re-audit"
                setModel={() => {
                    setReauditModal(false);
                    setReauditReason('');
                    setSelectedAudit(null);
                }}
                handleSubmit={handleReauditSubmit}
                modelSize="md"
                submitBtnText="Submit Request"
                loadings={loading}
                hideFooter={false}
                saveBtn={true}
            >
                {selectedAudit && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm font-medium text-gray-700 mb-2">Audit Details:</div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Supplier:</span>
                                    <span className="font-medium">{selectedAudit.supplierName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Audit ID:</span>
                                    <span className="font-medium font-mono">{selectedAudit.auditId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current Score:</span>
                                    <span className="font-medium">{selectedAudit.currentScore}%</span>
                                </div>
                                {/* Removed Previous Re-audits line */}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Re-audit <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reauditReason}
                                onChange={(e) => setReauditReason(e.target.value)}
                                placeholder="Enter detailed reason for requesting re-audit..."
                                className="form-textarea w-full h-32"
                                rows="4"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Please provide detailed reasoning for requesting a re-audit. This will help in planning the next audit.
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <div className="flex items-start">
                                <IconRotate className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-yellow-800">Note:</div>
                                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                                        <li>• Requesting a re-audit will change the status to "Pending Reaudit"</li>
                                        <li>• A new audit will be scheduled based on availability</li>
                                        <li>• The reason will be recorded in audit history</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* QR Code Modal */}
            <ModelViewBox
                modal={qrModal}
                modelHeader="Audit Report QR Code"
                setModel={() => setQrModal(false)}
                modelSize="sm"
                hideFooter={true}
                saveBtn={false}
            >
                {qrAudit && (
                    <div className="text-center">
                        <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Audit Report QR Code</div>
                            <div className="text-xs text-gray-500 mb-4">Scan this QR code to view the audit report PDF</div>
                        </div>
                        
                        {/* QR Code Display */}
                        <div className="mb-6">
                            <div className="w-64 h-64 mx-auto bg-gray-50 border-4 border-gray-200 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <IconQrCode className="w-32 h-32 text-gray-400 mx-auto" />
                                    <div className="mt-2 text-xs text-gray-500 font-medium">
                                        {qrAudit.auditId}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                            Use any QR scanner app to access the audit report
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default ExternalProviderAudit;