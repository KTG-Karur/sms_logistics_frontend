import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import IconEye from '../../components/Icon/IconEye';
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconClock from '../../components/Icon/IconClock';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconUser from '../../components/Icon/IconUser';
import IconBuilding from '../../components/Icon/IconHome';
import IconSearch from '../../components/Icon/IconSearch';
import IconX from '../../components/Icon/IconX';
import IconCheck from '../../components/Icon/IconCheck';
import IconTimes from '../../components/Icon/IconClock';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconFilter from '../../components/Icon/IconSearch';
import IconSave from '../../components/Icon/IconSave';
import IconRotate from '../../components/Icon/IconRefresh';
import Table from '../../util/Table';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { showMessage } from '../../util/AllFunction';

const AuditReSchedulingApproval = () => {
    const navigate = useNavigate();

    // Mock data
    const dummyReScheduleRequests = [
        {
            id: 1,
            requestId: 'RS-2024-001',
            originalAuditId: 'AUDIT-2024-001',
            auditType: 'External Provider Audit',
            supplierId: 1,
            supplierName: 'ABC Manufacturing Ltd.',
            currentAuditorName: 'John Smith',
            currentAuditorId: 1,
            requestedNewAuditorName: 'Sarah Johnson',
            requestedNewAuditorId: 2,
            reasonForChange: 'Original auditor has scheduling conflict',
            originalSchedule: {
                dueDate: '2024-03-31',
                assignmentDate: '2024-03-01',
                nextAuditDate: '2024-09-30'
            },
            requestedSchedule: {
                dueDate: '2024-04-05',
                assignmentDate: '2024-04-01',
                nextAuditDate: '2024-10-05'
            },
            requestedBy: 'John Smith (AUD001)',
            requestedDate: '2024-02-25T10:30:00',
            status: 'Pending',
            priority: 'High',
            score: 85,
            completedDate: '2024-03-15',
            isActive: 1,
        },
        {
            id: 2,
            requestId: 'RS-2024-002',
            originalAuditId: 'AUDIT-2024-003',
            auditType: 'Quality Audit',
            supplierId: 3,
            supplierName: 'Global Garments Inc.',
            currentAuditorName: 'John Smith',
            currentAuditorId: 1,
            requestedNewAuditorName: null,
            requestedNewAuditorId: null,
            reasonForChange: 'Supplier requested date change',
            originalSchedule: {
                dueDate: '2024-04-10',
                assignmentDate: '2024-03-10',
                nextAuditDate: '2024-10-10'
            },
            requestedSchedule: {
                dueDate: '2024-04-20',
                assignmentDate: '2024-04-10',
                nextAuditDate: '2024-10-20'
            },
            requestedBy: 'Global Garments Inc.',
            requestedDate: '2024-02-28T14:20:00',
            status: 'Pending',
            priority: 'Medium',
            score: 72,
            completedDate: '2024-03-10',
            isActive: 1,
        },
        {
            id: 3,
            requestId: 'RS-2024-003',
            originalAuditId: 'AUDIT-2024-005',
            auditType: 'Environmental Audit',
            supplierId: 5,
            supplierName: 'Food Processing Unit',
            currentAuditorName: 'Sarah Johnson',
            currentAuditorId: 2,
            requestedNewAuditorName: 'Michael Chen',
            requestedNewAuditorId: 3,
            reasonForChange: 'Specialized certification required',
            originalSchedule: {
                dueDate: '2024-03-20',
                assignmentDate: '2024-02-20',
                nextAuditDate: '2024-09-20'
            },
            requestedSchedule: {
                dueDate: '2024-03-25',
                assignmentDate: '2024-02-25',
                nextAuditDate: '2024-09-25'
            },
            requestedBy: 'Sarah Johnson (AUD002)',
            requestedDate: '2024-02-26T09:15:00',
            status: 'Pending',
            priority: 'High',
            score: 90,
            completedDate: '2024-03-05',
            isActive: 1,
        },
        {
            id: 4,
            requestId: 'RS-2024-004',
            originalAuditId: 'AUDIT-2024-002',
            auditType: 'Factory Audit',
            supplierId: 2,
            supplierName: 'XYZ Textile Mills',
            currentAuditorName: 'Sarah Johnson',
            currentAuditorId: 2,
            requestedNewAuditorName: 'John Smith',
            requestedNewAuditorId: 1,
            reasonForChange: 'Conflict of interest identified',
            originalSchedule: {
                dueDate: '2024-04-05',
                assignmentDate: '2024-03-05',
                nextAuditDate: '2024-10-05'
            },
            requestedSchedule: {
                dueDate: '2024-04-08',
                assignmentDate: '2024-03-08',
                nextAuditDate: '2024-10-08'
            },
            requestedBy: 'Compliance Department',
            requestedDate: '2024-02-27T16:45:00',
            status: 'Approved',
            priority: 'Critical',
            score: 88,
            completedDate: '2024-03-01',
            approvalDate: '2024-02-28T10:00:00',
            approvedBy: 'CEO - Robert Wilson',
            isActive: 1,
        },
        {
            id: 5,
            requestId: 'RS-2024-005',
            originalAuditId: 'AUDIT-2024-004',
            auditType: 'Safety Audit',
            supplierId: 4,
            supplierName: 'Tech Components Corp.',
            currentAuditorName: 'Michael Chen',
            currentAuditorId: 3,
            requestedNewAuditorName: null,
            requestedNewAuditorId: null,
            reasonForChange: 'Supplier expansion project delays',
            originalSchedule: {
                dueDate: '2024-04-12',
                assignmentDate: '2024-03-12',
                nextAuditDate: '2024-10-12'
            },
            requestedSchedule: {
                dueDate: '2024-04-25',
                assignmentDate: '2024-03-25',
                nextAuditDate: '2024-10-25'
            },
            requestedBy: 'Tech Components Corp.',
            requestedDate: '2024-02-24T11:30:00',
            status: 'Rejected',
            priority: 'Low',
            score: 65,
            completedDate: '2024-03-20',
            rejectionDate: '2024-02-25T14:15:00',
            rejectedBy: 'CEO - Robert Wilson',
            isActive: 1,
        },
    ];

    const dummyAuditors = [
        {
            id: 1,
            name: 'John Smith',
            auditorId: 'AUD001',
            designation: 'Senior Auditor',
            currentWorkload: 3,
            availability: 'Available',
            isActive: 1,
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            auditorId: 'AUD002',
            designation: 'Lead Auditor',
            currentWorkload: 2,
            availability: 'Available',
            isActive: 1,
        },
        {
            id: 3,
            name: 'Michael Chen',
            auditorId: 'AUD003',
            designation: 'Junior Auditor',
            currentWorkload: 1,
            availability: 'Available',
            isActive: 1,
        },
    ];

    const dummySuppliers = [
        { id: 1, name: 'ABC Manufacturing Ltd.' },
        { id: 2, name: 'XYZ Textile Mills' },
        { id: 3, name: 'Global Garments Inc.' },
        { id: 4, name: 'Tech Components Corp.' },
        { id: 5, name: 'Food Processing Unit' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Requests' },
        { value: 'Pending', label: 'Pending Approval' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
    ];

    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
    ];

    // State Management
    const [requests, setRequests] = useState(dummyReScheduleRequests);
    const [filteredRequests, setFilteredRequests] = useState(dummyReScheduleRequests);
    const [auditors, setAuditors] = useState(dummyAuditors);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState({ value: 'all', label: 'All Requests' });
    const [priorityFilter, setPriorityFilter] = useState({ value: 'all', label: 'All Priorities' });
    const [supplierFilter, setSupplierFilter] = useState({ value: 'all', label: 'All Suppliers' });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    
    // Form States
    const [showForm, setShowForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formAction, setFormAction] = useState(''); // 'approve' or 'reject'
    const [approvalForm, setApprovalForm] = useState({
        finalAuditorId: '',
        finalAssignmentDate: '',
        finalDueDate: '',
        finalNextAuditDate: '',
        remarks: '',
    });

    const [errors, setErrors] = useState([]);

    // Filter function using useCallback to prevent infinite re-renders
    const filterRequests = useCallback(() => {
        let filtered = requests.filter((request) => request.isActive === 1);

        if (searchTerm) {
            filtered = filtered.filter(
                (request) =>
                    request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.currentAuditorName.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        if (statusFilter.value !== 'all') {
            filtered = filtered.filter((request) => request.status === statusFilter.value);
        }

        if (priorityFilter.value !== 'all') {
            filtered = filtered.filter((request) => request.priority === priorityFilter.value);
        }

        if (supplierFilter.value !== 'all') {
            filtered = filtered.filter((request) => request.supplierId === parseInt(supplierFilter.value));
        }

        setFilteredRequests(filtered);
        setCurrentPage(0);
    }, [searchTerm, statusFilter, priorityFilter, supplierFilter, requests]);

    // Filter effect - runs only when dependencies change
    useEffect(() => {
        filterRequests();
    }, [filterRequests]);

    // Initial loading effect
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const handleViewAudit = (audit) => {
        navigate('/audit/report-pdf', { 
            // state: { 
            //     auditData: audit 
            // }
        });
    };

    const openForm = (request, action) => {
        setSelectedRequest(request);
        setFormAction(action);
        
        if (action === 'approve') {
            setApprovalForm({
                finalAuditorId: request.requestedNewAuditorId ? request.requestedNewAuditorId.toString() : request.currentAuditorId.toString(),
                finalAssignmentDate: request.requestedSchedule.assignmentDate || '',
                finalDueDate: request.requestedSchedule.dueDate || '',
                finalNextAuditDate: request.requestedSchedule.nextAuditDate || '',
                remarks: '',
            });
        } else {
            setApprovalForm({
                finalAuditorId: '',
                finalAssignmentDate: '',
                finalDueDate: '',
                finalNextAuditDate: '',
                remarks: '',
            });
        }
        
        setErrors([]);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedRequest(null);
        setFormAction('');
        setApprovalForm({
            finalAuditorId: '',
            finalAssignmentDate: '',
            finalDueDate: '',
            finalNextAuditDate: '',
            remarks: '',
        });
        setErrors([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setApprovalForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors.includes(name)) {
            setErrors((prev) => prev.filter((error) => error !== name));
        }
    };

    const handleSelectChange = (selectedOption, name) => {
        setApprovalForm((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));

        if (errors.includes(name)) {
            setErrors((prev) => prev.filter((error) => error !== name));
        }
    };

    const validateApprovalForm = () => {
        if (!selectedRequest) return false;
        
        const newErrors = [];
        if (!approvalForm.finalAuditorId) newErrors.push('finalAuditorId');
        if (!approvalForm.finalAssignmentDate) newErrors.push('finalAssignmentDate');
        if (!approvalForm.finalDueDate) newErrors.push('finalDueDate');
        if (!approvalForm.finalNextAuditDate) newErrors.push('finalNextAuditDate');

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleApproveRequest = () => {
        if (!validateApprovalForm()) {
            showMessage('error', 'Please fill all required fields');
            return;
        }

        const selectedAuditor = auditors.find(a => a.id === parseInt(approvalForm.finalAuditorId));
        
        const updatedRequests = requests.map((request) => {
            if (request.id === selectedRequest.id) {
                return {
                    ...request,
                    status: 'Approved',
                    currentAuditorName: selectedAuditor?.name || request.currentAuditorName,
                    currentAuditorId: selectedAuditor?.id || request.currentAuditorId,
                    approvalDate: new Date().toISOString(),
                    approvedBy: 'CEO - Robert Wilson',
                    approvalRemarks: approvalForm.remarks || 'Approved as requested',
                    finalSchedule: {
                        assignmentDate: approvalForm.finalAssignmentDate,
                        dueDate: approvalForm.finalDueDate,
                        nextAuditDate: approvalForm.finalNextAuditDate,
                        auditorName: selectedAuditor?.name || request.currentAuditorName,
                    },
                };
            }
            return request;
        });

        setRequests(updatedRequests);
        showMessage('success', 'Re-scheduling request approved successfully');
        closeForm();
    };

    const handleRejectRequest = () => {
        if (!approvalForm.remarks.trim()) {
            showMessage('error', 'Please provide rejection remarks');
            return;
        }

        const updatedRequests = requests.map((request) => {
            if (request.id === selectedRequest.id) {
                return {
                    ...request,
                    status: 'Rejected',
                    rejectionDate: new Date().toISOString(),
                    rejectedBy: 'CEO - Robert Wilson',
                    rejectionRemarks: approvalForm.remarks,
                };
            }
            return request;
        });

        setRequests(updatedRequests);
        showMessage('success', 'Re-scheduling request rejected');
        closeForm();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center w-fit">
                        <IconCheckCircle className="w-3 h-3 mr-1" /> Approved
                    </span>
                );
            case 'Rejected':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center w-fit">
                        <IconXCircle className="w-3 h-3 mr-1" /> Rejected
                    </span>
                );
            case 'Pending':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center w-fit">
                        <IconClock className="w-3 h-3 mr-1" /> Pending
                    </span>
                );
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getScoreBadge = (score) => {
        if (score >= 90) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">{score}</span>;
        if (score >= 75) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{score}</span>;
        if (score >= 60) return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">{score}</span>;
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">{score}</span>;
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredRequests.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredRequests.length;
    };

    const getStatistics = () => {
        const activeRequests = requests.filter((r) => r.isActive === 1);
        return {
            total: activeRequests.length,
            pending: activeRequests.filter((r) => r.status === 'Pending').length,
            approved: activeRequests.filter((r) => r.status === 'Approved').length,
            rejected: activeRequests.filter((r) => r.status === 'Rejected').length,
            critical: activeRequests.filter((r) => r.priority === 'Critical').length,
            high: activeRequests.filter((r) => r.priority === 'High').length,
        };
    };

    const stats = getStatistics();

    const columns = [
        {
            Header: 'Request ID',
            accessor: 'requestId',
            Cell: ({ row }) => {
                const request = row.original;
                return (
                    <div>
                        <div className="font-bold text-gray-800">{request.requestId}</div>
                        <div className="text-xs text-gray-500">{request.auditType}</div>
                    </div>
                );
            },
            width: 150,
        },
        {
            Header: 'Supplier/Company',
            accessor: 'supplierName',
            Cell: ({ row }) => {
                const request = row.original;
                return (
                    <div className="flex items-center">
                        <IconBuilding className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                            <div className="font-medium text-gray-800">{request.supplierName}</div>
                            <div className="text-xs text-gray-500">ID: {request.originalAuditId}</div>
                        </div>
                    </div>
                );
            },
            width: 200,
        },
        {
            Header: 'Auditor',
            accessor: 'currentAuditorName',
            Cell: ({ row }) => {
                const request = row.original;
                const hasNewAuditor = request.requestedNewAuditorName;
                
                return (
                    <div>
                        <div className="flex items-center">
                            <IconUser className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="font-medium text-gray-800">{request.currentAuditorName}</div>
                        </div>
                        {hasNewAuditor && (
                            <div className="text-xs text-blue-600 mt-1">
                                → Requested: {request.requestedNewAuditorName}
                            </div>
                        )}
                    </div>
                );
            },
            width: 180,
        },
        {
            Header: 'Score',
            accessor: 'score',
            Cell: ({ row }) => {
                const request = row.original;
                return (
                    <div className="text-center">
                        <div className="text-lg font-bold">{getScoreBadge(request.score)}</div>
                        <div className="text-xs text-gray-500 mt-1">Completed: {new Date(request.completedDate).toLocaleDateString()}</div>
                    </div>
                );
            },
            width: 120,
        },
        {
            Header: 'Reason',
            accessor: 'reasonForChange',
            Cell: ({ row }) => {
                const request = row.original;
                return (
                    <div>
                        <div className="text-sm text-gray-700 line-clamp-2">{request.reasonForChange}</div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                            <IconCalendar className="w-3 h-3 mr-1" />
                            Due: {new Date(request.requestedSchedule.dueDate).toLocaleDateString()}
                        </div>
                    </div>
                );
            },
            width: 250,
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                const request = row.original;
                return getStatusBadge(request.status);
            },
            width: 120,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const request = row.original;

                return (
                    <div className="flex flex-col space-y-2">
                        <Tippy content="View Audit Report">
                            <button
                                onClick={() => handleViewAudit(request)}
                                className="flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                <IconEye className="w-4 h-4 mr-2" />
                                View Report
                            </button>
                        </Tippy>

                        {request.status === 'Pending' && (
                            <div className="flex space-x-2">
                                <Tippy content="Approve Request">
                                    <button
                                        onClick={() => openForm(request, 'approve')}
                                        className="flex-1 flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm"
                                    >
                                        <IconCheck className="w-4 h-4" />
                                    </button>
                                </Tippy>

                                <Tippy content="Reject Request">
                                    <button
                                        onClick={() => openForm(request, 'reject')}
                                        className="flex-1 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm"
                                    >
                                        <IconTimes className="w-4 h-4" />
                                    </button>
                                </Tippy>
                            </div>
                        )}
                    </div>
                );
            },
            width: 180,
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800">Audit Re-scheduling Approval</h1>
                <p className="text-gray-600 mt-2">Review and approve/reject audit re-scheduling requests</p>
            </div>

            {/* Filters Toggle */}
            <div className="mb-6">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                    <IconFilter className="w-4 h-4 mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by request ID, supplier, auditor..."
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
                            />
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <Select
                                value={priorityFilter}
                                onChange={setPriorityFilter}
                                options={priorityOptions}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={false}
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
                                    ...dummySuppliers.map((supplier) => ({
                                        value: supplier.id.toString(),
                                        label: supplier.name,
                                    })),
                                ]}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isClearable={false}
                            />
                        </div>

                        {/* Clear Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter({ value: 'all', label: 'All Requests' });
                                    setPriorityFilter({ value: 'all', label: 'All Priorities' });
                                    setSupplierFilter({ value: 'all', label: 'All Suppliers' });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm font-medium opacity-90">Total Requests</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <div className="text-sm font-medium opacity-90">Pending Approval</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.approved}</div>
                    <div className="text-sm font-medium opacity-90">Approved</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.rejected}</div>
                    <div className="text-sm font-medium opacity-90">Rejected</div>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.critical}</div>
                    <div className="text-sm font-medium opacity-90">Critical Priority</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.high}</div>
                    <div className="text-sm font-medium opacity-90">High Priority</div>
                </div>
            </div>

            {/* Approval/Rejection Form Section */}
            {showForm && selectedRequest && (
                <div className="panel mb-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                            {formAction === 'approve' ? 'Approve Re-scheduling Request' : 'Reject Re-scheduling Request'}
                        </h3>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            title="Close form"
                        >
                            <IconX className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Request Info Card */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm text-gray-600">Request ID</div>
                                    <div className="font-bold text-gray-800">{selectedRequest.requestId}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Status</div>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Priority</div>
                                    <div className={`font-medium ${selectedRequest.priority === 'Critical' ? 'text-red-600' : 
                                        selectedRequest.priority === 'High' ? 'text-orange-600' : 
                                        selectedRequest.priority === 'Medium' ? 'text-yellow-600' : 'text-blue-600'}`}>
                                        {selectedRequest.priority}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Audit Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Audit ID:</span>
                                            <span className="font-medium">{selectedRequest.originalAuditId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Audit Type:</span>
                                            <span className="font-medium">{selectedRequest.auditType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Score:</span>
                                            {getScoreBadge(selectedRequest.score)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Completed Date:</span>
                                            <span className="font-medium">
                                                {new Date(selectedRequest.completedDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Supplier Details</h4>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <IconBuilding className="w-6 h-6 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-bold text-gray-800">{selectedRequest.supplierName}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Auditor</h4>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-4">
                                        <IconUser className="w-6 h-6 text-gray-400 mr-3" />
                                        <div>
                                            <div className="font-bold text-gray-800">{selectedRequest.currentAuditorName}</div>
                                            {selectedRequest.requestedNewAuditorName && (
                                                <div className="text-sm text-blue-600 mt-1">
                                                    Requested new: {selectedRequest.requestedNewAuditorName}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Reason for Change</h4>
                                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <p className="text-gray-700">{selectedRequest.reasonForChange}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Comparison */}
                        <div className="border-t pt-6">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Schedule Comparison</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h5 className="font-bold text-blue-700 mb-3">Original Schedule</h5>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Assignment Date:</span>
                                            <span className="font-medium">{selectedRequest.originalSchedule.assignmentDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Due Date:</span>
                                            <span className="font-medium">{selectedRequest.originalSchedule.dueDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Next Audit Date:</span>
                                            <span className="font-medium">{selectedRequest.originalSchedule.nextAuditDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h5 className="font-bold text-green-700 mb-3">Requested Schedule</h5>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Assignment Date:</span>
                                            <span className="font-medium">{selectedRequest.requestedSchedule.assignmentDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Due Date:</span>
                                            <span className="font-medium">{selectedRequest.requestedSchedule.dueDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Next Audit Date:</span>
                                            <span className="font-medium">{selectedRequest.requestedSchedule.nextAuditDate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approval Form - Only show for approval action */}
                        {formAction === 'approve' && (
                            <div className="border-t pt-6">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Final Assignment Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Final Auditor *
                                        </label>
                                        <Select
                                            value={auditors.find(a => a.id.toString() === approvalForm.finalAuditorId) ? 
                                                { value: approvalForm.finalAuditorId, label: `${auditors.find(a => a.id.toString() === approvalForm.finalAuditorId)?.name} (${auditors.find(a => a.id.toString() === approvalForm.finalAuditorId)?.auditorId})` } 
                                                : null}
                                            onChange={(option) => handleSelectChange(option, 'finalAuditorId')}
                                            options={auditors.map(auditor => ({
                                                value: auditor.id.toString(),
                                                label: `${auditor.name} (${auditor.auditorId}) - ${auditor.designation}`,
                                            }))}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            isClearable={true}
                                            placeholder="Select auditor..."
                                        />
                                        {errors.includes('finalAuditorId') && (
                                            <p className="mt-1 text-sm text-red-600">Please select an auditor</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Date *</label>
                                        <input
                                            type="date"
                                            name="finalAssignmentDate"
                                            value={approvalForm.finalAssignmentDate}
                                            onChange={handleInputChange}
                                            className={`form-input w-full ${errors.includes('finalAssignmentDate') ? 'border-red-500' : ''}`}
                                        />
                                        {errors.includes('finalAssignmentDate') && (
                                            <p className="mt-1 text-sm text-red-600">Please select assignment date</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                                        <input
                                            type="date"
                                            name="finalDueDate"
                                            value={approvalForm.finalDueDate}
                                            onChange={handleInputChange}
                                            className={`form-input w-full ${errors.includes('finalDueDate') ? 'border-red-500' : ''}`}
                                        />
                                        {errors.includes('finalDueDate') && (
                                            <p className="mt-1 text-sm text-red-600">Please select due date</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Next Audit Date *</label>
                                        <input
                                            type="date"
                                            name="finalNextAuditDate"
                                            value={approvalForm.finalNextAuditDate}
                                            onChange={handleInputChange}
                                            className={`form-input w-full ${errors.includes('finalNextAuditDate') ? 'border-red-500' : ''}`}
                                        />
                                        {errors.includes('finalNextAuditDate') && (
                                            <p className="mt-1 text-sm text-red-600">Please select next audit date</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
                                    <textarea
                                        name="remarks"
                                        value={approvalForm.remarks}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="form-textarea w-full"
                                        placeholder="Add remarks for approval..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Rejection Form - Only show for rejection action */}
                        {formAction === 'reject' && (
                            <div className="border-t pt-6">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Rejection Details</h4>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Remarks *</label>
                                    <textarea
                                        name="remarks"
                                        value={approvalForm.remarks}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="form-textarea w-full"
                                        placeholder="Please provide reason for rejection..."
                                        required
                                    />
                                    {!approvalForm.remarks.trim() && (
                                        <p className="mt-1 text-sm text-red-600">Rejection remarks are required</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="border-t pt-6 flex justify-end space-x-3">
                            <button
                                onClick={closeForm}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            
                            {formAction === 'approve' ? (
                                <button
                                    onClick={handleApproveRequest}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <IconRotate className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <IconSave className="w-4 h-4 mr-2" />
                                            Approve & Assign
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleRejectRequest}
                                    disabled={!approvalForm.remarks.trim() || loading}
                                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <IconRotate className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <IconTimes className="w-4 h-4 mr-2" />
                                            Reject Request
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Table Section */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Re-scheduling Requests'}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={false}
                    isSortable={true}
                    btnName={null}
                    loadings={loading}
                />
            </div>
        </div>
    );
};

export default AuditReSchedulingApproval;