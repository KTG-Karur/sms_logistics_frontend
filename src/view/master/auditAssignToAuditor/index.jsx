import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import IconEye from '../../../components/Icon/IconEye';
import IconEdit from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconClock from '../../../components/Icon/IconClock';
import IconCheckCircle from '../../../components/Icon/IconCircleCheck';
import IconXCircle from '../../../components/Icon/IconCircleCheck';
import IconRefresh from '../../../components/Icon/IconRefresh';
import IconUser from '../../../components/Icon/IconUser';
import IconBuilding from '../../../components/Icon/IconHome';
import IconSearch from '../../../components/Icon/IconSearch';
import IconList from '../../../components/Icon/IconCircleCheck';
import IconFilter from '../../../components/Icon/IconInfoCircle';
import IconX from '../../../components/Icon/IconX';
import IconPlus from '../../../components/Icon/IconPlus';
import IconSave from '../../../components/Icon/IconSave';
import IconRotate from '../../../components/Icon/IconRefresh';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import FormLayout from '../../../util/formLayout';
import { showMessage } from '../../../util/AllFunction';
import 'tippy.js/dist/tippy.css';
import { formFields } from './formContainer';

const AuditAssignToAuditor = () => {
    const navigate = useNavigate();

    const dummyAuditors = [
        {
            id: 1,
            name: 'John Smith',
            auditorId: 'AUD001',
            designation: 'Senior Auditor',
            designationId: '96af0672-2428-4a0b-8770-9e2a877415bf',
            certifications: [{ id: 1, name: 'ISO-9001-Certificate.jpg', url: 'cert1.jpg' }],
            lastLogin: '2024-01-15T10:30:00',
            isAuthenticated: true,
            isActive: 1,
            createdDate: '2024-01-01',
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            auditorId: 'AUD002',
            designation: 'Lead Auditor',
            designationId: '593ad470-64c0-4a38-ad2c-d0cee894e11d',
            certifications: [{ id: 1, name: 'Lead-Auditor-Certificate.jpg', url: 'cert3.jpg' }],
            lastLogin: '2024-01-14T14:20:00',
            isAuthenticated: true,
            isActive: 1,
            createdDate: '2024-01-05',
        },
        {
            id: 3,
            name: 'Michael Chen',
            auditorId: 'AUD003',
            designation: 'Junior Auditor',
            designationId: '7ad7ec3e-6b7e-4321-8efc-9b25fdab91a7',
            certifications: [],
            lastLogin: '2024-01-10T09:15:00',
            isAuthenticated: false,
            isActive: 1,
            createdDate: '2024-01-10',
        },
    ];

    const dummySuppliers = [
        { id: 1, name: 'ABC Manufacturing Ltd.', type: 'Manufacturer', auditCount: 3 },
        { id: 2, name: 'XYZ Textile Mills', type: 'Textile Producer', auditCount: 2 },
        { id: 3, name: 'Global Garments Inc.', type: 'Garment Manufacturer', auditCount: 1 },
        { id: 4, name: 'Tech Components Corp.', type: 'Electronic Components', auditCount: 0 },
        { id: 5, name: 'Food Processing Unit', type: 'Food Manufacturer', auditCount: 1 },
        { id: 6, name: 'Precision Tools Co.', type: 'Tool Manufacturer', auditCount: 0 },
        { id: 7, name: 'Quality Fabrics Ltd.', type: 'Fabric Supplier', auditCount: 0 },
        { id: 8, name: 'Modern Packaging Inc.', type: 'Packaging Supplier', auditCount: 0 },
    ];

    const dummyAuditAssignments = [
        {
            id: 1,
            auditId: 'AUDIT-2024-001',
            auditType: 'External Provider Audit',
            supplierId: 1,
            supplierName: 'ABC Manufacturing Ltd.',
            supplierType: 'Manufacturer',
            supplierAuditCount: 3,
            assignedAuditorId: 1,
            assignedAuditorName: 'John Smith',
            assignedAuditorIdCode: 'AUD001',
            assignmentDate: '2024-03-01',
            dueDate: '2024-03-31',
            nextAuditDate: '2024-09-30',
            status: 'Scheduled',
            completionDate: null,
            score: 88,
            totalChecklistItems: 280,
            completedChecklistItems: 150,
            workerInterviews: 5,
            lastUpdated: '2024-03-15T10:30:00',
            remarks: 'Initial assessment completed. Follow-up required for safety compliance.',
            isActive: 1,
        },
        {
            id: 2,
            auditId: 'AUDIT-2024-002',
            auditType: 'Factory Audit',
            supplierId: 2,
            supplierName: 'XYZ Textile Mills',
            supplierType: 'Textile Producer',
            supplierAuditCount: 2,
            assignedAuditorId: 2,
            assignedAuditorName: 'Sarah Johnson',
            assignedAuditorIdCode: 'AUD002',
            assignmentDate: '2024-03-05',
            dueDate: '2024-04-05',
            nextAuditDate: '2024-09-28',
            status: 'Completed',
            completionDate: '2024-03-28',
            score: 92,
            totalChecklistItems: 280,
            completedChecklistItems: 280,
            workerInterviews: 6,
            lastUpdated: '2024-03-28T15:45:00',
            remarks: 'Audit completed successfully. No major non-conformities found.',
            isActive: 1,
        },
        {
            id: 3,
            auditId: 'AUDIT-2024-003',
            auditType: 'Quality Audit',
            supplierId: 3,
            supplierName: 'Global Garments Inc.',
            supplierType: 'Garment Manufacturer',
            supplierAuditCount: 1,
            assignedAuditorId: 1,
            assignedAuditorName: 'John Smith',
            assignedAuditorIdCode: 'AUD001',
            assignmentDate: '2024-03-10',
            dueDate: '2024-04-10',
            nextAuditDate: '2024-10-10',
            status: 'Pending',
            completionDate: null,
            score: null,
            totalChecklistItems: 280,
            completedChecklistItems: 0,
            workerInterviews: 0,
            lastUpdated: '2024-03-10T09:00:00',
            remarks: 'Scheduled for next week.',
            isActive: 1,
        },
        {
            id: 4,
            auditId: 'AUDIT-2024-004',
            auditType: 'Safety Audit',
            supplierId: 4,
            supplierName: 'Tech Components Corp.',
            supplierType: 'Electronic Components',
            supplierAuditCount: 1,
            assignedAuditorId: 3,
            assignedAuditorName: 'Michael Chen',
            assignedAuditorIdCode: 'AUD003',
            assignmentDate: '2024-03-12',
            dueDate: '2024-04-12',
            nextAuditDate: '2024-10-12',
            status: 'In Progress',
            completionDate: null,
            score: null,
            totalChecklistItems: 280,
            completedChecklistItems: 80,
            workerInterviews: 2,
            lastUpdated: '2024-03-18T14:20:00',
            remarks: 'Initial findings show need for improvement in emergency exits.',
            isActive: 1,
        },
        {
            id: 5,
            auditId: 'AUDIT-2024-005',
            auditType: 'Environmental Audit',
            supplierId: 5,
            supplierName: 'Food Processing Unit',
            supplierType: 'Food Manufacturer',
            supplierAuditCount: 1,
            assignedAuditorId: 2,
            assignedAuditorName: 'Sarah Johnson',
            assignedAuditorIdCode: 'AUD002',
            assignmentDate: '2024-02-20',
            dueDate: '2024-03-20',
            nextAuditDate: '2024-08-20',
            status: 'Overdue',
            completionDate: null,
            score: null,
            totalChecklistItems: 280,
            completedChecklistItems: 120,
            workerInterviews: 3,
            lastUpdated: '2024-03-19T11:15:00',
            remarks: 'Delayed due to supplier unavailability.',
            isActive: 1,
        },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'Scheduled', label: 'Scheduled' },
        { value: 'Pending', label: 'Pending' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Overdue', label: 'Overdue' },
    ];

    const [auditors, setAuditors] = useState(dummyAuditors);
    const [suppliers, setSuppliers] = useState(dummySuppliers);
    const [auditAssignments, setAuditAssignments] = useState(dummyAuditAssignments);
    const [filteredAssignments, setFilteredAssignments] = useState(dummyAuditAssignments);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState({ value: 'all', label: 'All Status' });
    const [auditorFilter, setAuditorFilter] = useState({ value: 'all', label: 'All Auditors' });
    const [supplierFilter, setSupplierFilter] = useState({ value: 'all', label: 'All Suppliers' });
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const [assignmentForm, setAssignmentForm] = useState({
        supplierId: '',
        supplierAuditCount: 0,
        assignedAuditorId: '',
        assignmentDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        nextAuditDate: '',
        remarks: '',
    });

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [errors, setErrors] = useState([]);

    const [assignFormContain] = useState([
        {
            formFields,
        },
    ]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        let filtered = auditAssignments.filter((assignment) => assignment.isActive === 1);

        if (searchTerm) {
            filtered = filtered.filter(
                (assignment) =>
                    assignment.auditId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    assignment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    assignment.assignedAuditorName.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        if (statusFilter.value !== 'all') {
            filtered = filtered.filter((assignment) => assignment.status === statusFilter.value);
        }

        if (auditorFilter.value !== 'all') {
            filtered = filtered.filter((assignment) => assignment.assignedAuditorId === parseInt(auditorFilter.value));
        }

        if (supplierFilter.value !== 'all') {
            filtered = filtered.filter((assignment) => assignment.supplierId === parseInt(supplierFilter.value));
        }

        setFilteredAssignments(filtered);
        setCurrentPage(0);
    }, [searchTerm, statusFilter, auditorFilter, supplierFilter, auditAssignments]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAssignmentForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors.includes(name)) {
            setErrors((prev) => prev.filter((error) => error !== name));
        }
    };

    const handleSelectChange = (selectedOption, name) => {
        setAssignmentForm((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));

        if (name === 'supplierId' && selectedOption) {
            const selectedSupplier = suppliers.find((s) => s.id === selectedOption.value);
            if (selectedSupplier) {
                setAssignmentForm((prev) => ({
                    ...prev,
                    supplierId: selectedOption.value,
                    supplierAuditCount: selectedSupplier.auditCount || 0,
                    supplierType: selectedSupplier.type,
                }));
            }
        }

        if (errors.includes(name)) {
            setErrors((prev) => prev.filter((error) => error !== name));
        }
    };

    const validateForm = () => {
        const newErrors = [];
        if (!assignmentForm.supplierId) newErrors.push('supplierId');
        if (!assignmentForm.assignedAuditorId) newErrors.push('assignedAuditorId');
        if (!assignmentForm.assignmentDate) newErrors.push('assignmentDate');
        if (!assignmentForm.dueDate) newErrors.push('dueDate');
        if (!assignmentForm.nextAuditDate) newErrors.push('nextAuditDate');

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const generateNextAuditId = () => {
        const existingIds = auditAssignments
            .map((a) => a.auditId)
            .filter((id) => id.startsWith('AUDIT-'))
            .map((id) => {
                const match = id.match(/AUDIT-(\d+)-(\d+)/);
                return match ? parseInt(match[2]) : 0;
            })
            .filter((id) => !isNaN(id));

        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        const year = new Date().getFullYear();
        return `AUDIT-${year}-${String(maxId + 1).padStart(3, '0')}`;
    };

    const openForm = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextAudit = new Date();
        nextAudit.setMonth(nextAudit.getMonth() + 6);

        setAssignmentForm({
            supplierId: '',
            supplierAuditCount: 0,
            assignedAuditorId: '',
            assignmentDate: new Date().toISOString().split('T')[0],
            dueDate: tomorrow.toISOString().split('T')[0],
            nextAuditDate: nextAudit.toISOString().split('T')[0],
            remarks: '',
        });
        setErrors([]);
        setIsEdit(false);
        setSelectedAssignment(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEdit(false);
        setSelectedAssignment(null);
        setErrors([]);
        setAssignmentForm({
            supplierId: '',
            supplierAuditCount: 0,
            assignedAuditorId: '',
            assignmentDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            nextAuditDate: '',
            remarks: '',
        });
    };

    const openEditForm = (assignment) => {
        setSelectedAssignment(assignment);
        setAssignmentForm({
            supplierId: assignment.supplierId.toString(),
            supplierAuditCount: assignment.supplierAuditCount,
            assignedAuditorId: assignment.assignedAuditorId.toString(),
            assignmentDate: assignment.assignmentDate,
            dueDate: assignment.dueDate,
            nextAuditDate: assignment.nextAuditDate,
            remarks: assignment.remarks || '',
        });
        setErrors([]);
        setIsEdit(true);
        setShowForm(true);
    };

    const handleFormSubmit = () => {
        if (!validateForm()) {
            showMessage('error', 'Please fill all required fields');
            return;
        }

        const selectedAuditor = auditors.find((a) => a.id === parseInt(assignmentForm.assignedAuditorId));
        const selectedSupplier = suppliers.find((s) => s.id === parseInt(assignmentForm.supplierId));

        if (!selectedAuditor || !selectedSupplier) {
            showMessage('error', 'Invalid auditor or supplier selected');
            return;
        }

        if (isEdit && selectedAssignment) {
            // Update existing assignment
            const updatedAssignments = auditAssignments.map((assignment) => {
                if (assignment.id === selectedAssignment.id) {
                    return {
                        ...assignment,
                        supplierId: parseInt(assignmentForm.supplierId),
                        supplierName: selectedSupplier.name,
                        supplierType: selectedSupplier.type,
                        supplierAuditCount: selectedSupplier.auditCount,
                        assignedAuditorId: parseInt(assignmentForm.assignedAuditorId),
                        assignedAuditorName: selectedAuditor.name,
                        assignedAuditorIdCode: selectedAuditor.auditorId,
                        assignmentDate: assignmentForm.assignmentDate,
                        dueDate: assignmentForm.dueDate,
                        nextAuditDate: assignmentForm.nextAuditDate,
                        remarks: assignmentForm.remarks.trim(),
                        lastUpdated: new Date().toISOString(),
                    };
                }
                return assignment;
            });

            setAuditAssignments(updatedAssignments);
            showMessage('success', 'Assignment updated successfully');
        } else {
            // Create new assignment
            const newAssignment = {
                id: auditAssignments.length + 1,
                auditId: generateNextAuditId(),
                auditType: 'External Provider Audit',
                supplierId: parseInt(assignmentForm.supplierId),
                supplierName: selectedSupplier.name,
                supplierType: selectedSupplier.type,
                supplierAuditCount: selectedSupplier.auditCount + 1,
                assignedAuditorId: parseInt(assignmentForm.assignedAuditorId),
                assignedAuditorName: selectedAuditor.name,
                assignedAuditorIdCode: selectedAuditor.auditorId,
                assignmentDate: assignmentForm.assignmentDate,
                dueDate: assignmentForm.dueDate,
                nextAuditDate: assignmentForm.nextAuditDate,
                status: 'Scheduled',
                completionDate: null,
                score: null,
                totalChecklistItems: 280,
                completedChecklistItems: 0,
                workerInterviews: 0,
                lastUpdated: new Date().toISOString(),
                remarks: assignmentForm.remarks.trim(),
                isActive: 1,
            };

            setAuditAssignments((prev) => [...prev, newAssignment]);

            const updatedSuppliers = suppliers.map((supplier) => {
                if (supplier.id === parseInt(assignmentForm.supplierId)) {
                    return { ...supplier, auditCount: supplier.auditCount + 1 };
                }
                return supplier;
            });
            setSuppliers(updatedSuppliers);

            showMessage('success', 'Audit assigned successfully');
        }

        // Auto-hide form after successful save
        setTimeout(() => {
            closeForm();
        }, 1000);
    };

    const handleStartAudit = (assignment) => {
        navigate('/audit/external-provider/form', {
            state: {
                mode: 'edit',
                auditData: {
                    supplierName: assignment.supplierName,
                    supplierType: assignment.supplierType,
                    supplierAuditCount: assignment.supplierAuditCount,
                    asianAuditorName: assignment.assignedAuditorName,
                    status: 'In Progress',
                    auditId: assignment.auditId,
                    auditDate: assignment.assignmentDate,
                    auditType: assignment.auditType,
                    visitDate: assignment.assignmentDate,
                },
            },
        });
    };

    const handleDeleteAssignment = (assignment) => {
        showMessage('warning', 'Are you sure you want to delete this assignment?', () => {
            const updatedAssignments = auditAssignments.map((a) => (a.id === assignment.id ? { ...a, isActive: 0 } : a));
            setAuditAssignments(updatedAssignments);
            showMessage('success', 'Assignment deleted successfully');
        });
    };

    const handleRestoreAssignment = (assignment) => {
        const updatedAssignments = auditAssignments.map((a) => (a.id === assignment.id ? { ...a, isActive: 1 } : a));
        setAuditAssignments(updatedAssignments);
        showMessage('success', 'Assignment restored successfully');
    };

    const handleReportAudit = (assignment) => {
        navigate('/audit/report-pdf', { 
            // state: { 
            //     auditData: audit 
            // }
        });
    };

    const navigateToAuditForm = (assignment) => {
        const mode = assignment.status === 'Completed' ? 'view' : 'edit';

        navigate('/audit/external-provider/form', {
            state: {
                mode: mode,
                auditData: {
                    supplierName: assignment.supplierName,
                    supplierType: assignment.supplierType,
                    supplierAuditCount: assignment.supplierAuditCount,
                    asianAuditorName: assignment.assignedAuditorName,
                    status: assignment.status,
                    auditId: assignment.auditId,
                    auditDate: assignment.assignmentDate,
                    auditType: assignment.auditType,
                    visitDate: assignment.assignmentDate,
                },
            },
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center w-fit">
                        <IconCheckCircle className="w-3 h-3 mr-1" /> Completed
                    </span>
                );
            case 'In Progress':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center w-fit">
                        <IconRefresh className="w-3 h-3 mr-1 animate-spin" /> In Progress
                    </span>
                );
            case 'Pending':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center w-fit">
                        <IconClock className="w-3 h-3 mr-1" /> Pending
                    </span>
                );
            case 'Scheduled':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center w-fit">
                        <IconCalendar className="w-3 h-3 mr-1" /> Scheduled
                    </span>
                );
            case 'Overdue':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center w-fit">
                        <IconXCircle className="w-3 h-3 mr-1" /> Overdue
                    </span>
                );
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getProgressPercentage = (assignment) => {
        if (assignment.totalChecklistItems === 0) return 0;
        return Math.round((assignment.completedChecklistItems / assignment.totalChecklistItems) * 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        if (percentage >= 50) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredAssignments.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return filteredAssignments.length;
    };

    const getStatistics = () => {
        const activeAssignments = auditAssignments.filter((a) => a.isActive === 1);
        return {
            total: activeAssignments.length,
            completed: activeAssignments.filter((a) => a.status === 'Completed').length,
            inProgress: activeAssignments.filter((a) => a.status === 'In Progress').length,
            pending: activeAssignments.filter((a) => a.status === 'Pending').length,
            scheduled: activeAssignments.filter((a) => a.status === 'Scheduled').length,
            overdue: activeAssignments.filter((a) => a.status === 'Overdue').length,
        };
    };

    const stats = getStatistics();

    const supplierList = suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        type: supplier.type,
        auditCount: supplier.auditCount,
    }));

    const auditorList = auditors
        .filter((auditor) => auditor.isActive === 1 && auditor.isAuthenticated)
        .map((auditor) => ({
            id: auditor.id,
            name: `${auditor.name} (${auditor.auditorId})`,
            designation: auditor.designation,
        }));

    const columns = [
        {
            Header: 'Audit Details',
            accessor: 'auditDetails',
            Cell: ({ row }) => {
                const assignment = row.original;
                const progress = getProgressPercentage(assignment);
                const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'Completed';

                return (
                    <div>
                        <div className="font-bold text-gray-800 mb-2">{assignment.auditId}</div>
                        <div className="text-sm font-medium text-gray-700 mb-1">{assignment.auditType}</div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                            <IconBuilding className="w-3 h-3 mr-1" />
                            {assignment.supplierName}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>{assignment.supplierType}</span>
                            <span className="flex items-center bg-gray-100 px-2 py-1 rounded">
                                <IconList className="w-3 h-3 mr-1" />
                                Audit #{assignment.supplierAuditCount}
                            </span>
                        </div>

                        {assignment.status !== 'Scheduled' && assignment.status !== 'Pending' && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>Progress: {progress}%</span>
                                    <span>
                                        {assignment.completedChecklistItems}/{assignment.totalChecklistItems} items
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${getProgressColor(progress)}`} style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}

                        {isOverdue && assignment.status !== 'Completed' && (
                            <div className="text-xs text-red-600 mt-1 flex items-center">
                                <IconXCircle className="w-3 h-3 mr-1" />
                                Past due date
                            </div>
                        )}
                    </div>
                );
            },
            sort: true,
        },
        {
            Header: 'Auditor & Dates',
            accessor: 'auditorDates',
            Cell: ({ row }) => {
                const assignment = row.original;
                const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== 'Completed';

                return (
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <IconUser className="w-4 h-4 text-gray-500 mr-2" />
                            <div>
                                <div className="font-medium text-gray-800">{assignment.assignedAuditorName}</div>
                                <div className="text-xs text-gray-500">{assignment.assignedAuditorIdCode}</div>
                            </div>
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex items-center">
                                <IconCalendar className="w-3 h-3 text-gray-400 mr-2" />
                                <span className="text-gray-600">Assigned: </span>
                                <span className="ml-1 font-medium">{new Date(assignment.assignmentDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                                <IconCalendar className={`w-3 h-3 mr-2 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className={`${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>Due: </span>
                                <span className={`ml-1 font-medium ${isOverdue ? 'text-red-600' : ''}`}>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            {assignment.status === 'Completed' && assignment.nextAuditDate && (
                                <div className="flex items-center">
                                    <IconCalendar className="w-3 h-3 text-gray-400 mr-2" />
                                    <span className="text-gray-600">Next Audit: </span>
                                    <span className="ml-1 font-medium">{new Date(assignment.nextAuditDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
            width: 200,
        },
        {
            Header: 'Status & Score',
            accessor: 'statusScore',
            Cell: ({ row }) => {
                const assignment = row.original;

                return (
                    <div className="space-y-3">
                        <div>{getStatusBadge(assignment.status)}</div>

                        {assignment.score !== null ? (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{assignment.score}%</div>
                                <div className="text-xs text-gray-500">Final Score</div>
                            </div>
                        ) : assignment.status === 'Scheduled' || assignment.status === 'Pending' ? (
                            <div className="text-center text-gray-400 text-sm">Not started</div>
                        ) : (
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-800">{getProgressPercentage(assignment)}%</div>
                                <div className="text-xs text-gray-500">Progress</div>
                            </div>
                        )}

                        <div className="text-xs text-gray-500 text-center">{assignment.workerInterviews} worker interviews</div>
                    </div>
                );
            },
            width: 150,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const assignment = row.original;

                return (
                    <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                            <Tippy content="Edit Assignment">
                                <button
                                    onClick={() => openEditForm(assignment)}
                                    className="flex-1 flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-sm"
                                >
                                    <IconEdit className="w-4 h-4" />
                                </button>
                            </Tippy>

                            <Tippy content="Delete Assignment">
                                <button
                                    onClick={() => handleDeleteAssignment(assignment)}
                                    className="flex-1 flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-sm"
                                >
                                    <IconTrashLines className="w-4 h-4" />
                                </button>
                            </Tippy>
                        </div>

                        <div className="flex space-x-2">
                            {assignment.status === 'Scheduled' && (
                                <button onClick={() => handleStartAudit(assignment)} className="flex-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg text-sm font-medium">
                                    Start Audit
                                </button>
                            )}

                            {(assignment.status === 'Pending' || assignment.status === 'In Progress' || assignment.status === 'Overdue') && (
                                <button onClick={() => navigateToAuditForm(assignment)} className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium">
                                    Continue
                                </button>
                            )}

                            {assignment.status === 'Completed' && (
                                <button onClick={() => handleReportAudit(assignment)} className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium">
                                    View Report
                                </button>
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
                <h1 className="text-3xl font-extrabold text-gray-800">Audit Assignment Management</h1>
                <p className="text-gray-600 mt-2">Assign and manage audits to auditors, track progress and completion</p>
            </div>

            {/* Assignment Form Section */}
            {showForm && (
                <div className="panel mb-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800">
                            {isEdit ? 'Edit Audit Assignment' : 'Assign New Audit'}
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
                        {isEdit && selectedAssignment && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600">Current Status</div>
                                        <div className="font-medium">{getStatusBadge(selectedAssignment.status)}</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Audit ID: <span className="font-mono font-bold">{selectedAssignment.auditId}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <FormLayout
                            dynamicForm={assignFormContain}
                            handleSubmit={handleFormSubmit}
                            setState={setAssignmentForm}
                            state={assignmentForm}
                            onChangeCallBack={{
                                handleInputChange: handleInputChange,
                                handleSelectChange: handleSelectChange,
                            }}
                            errors={errors}
                            setErrors={setErrors}
                            loadings={loading}
                            optionListState={{
                                supplierList: supplierList,
                                auditorList: auditorList,
                            }}
                        />

                        <div className="text-sm text-gray-500 mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="mb-2">
                                <strong>Note:</strong>
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Audit will be marked as "Scheduled" upon assignment</li>
                                <li>Click "Start Audit" to begin the audit process</li>
                                <li>Next audit date should be set for future follow-up audits</li>
                                <li>Only authenticated auditors can be assigned</li>
                                <li>Supplier audit count will be incremented automatically</li>
                            </ul>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleFormSubmit}
                                disabled={loading}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <IconRotate className="w-4 h-4 mr-2 animate-spin" />
                                        {isEdit ? 'Updating...' : 'Assigning...'}
                                    </>
                                ) : (
                                    <>
                                        <IconSave className="w-4 h-4 mr-2" />
                                        {isEdit ? 'Update Assignment' : 'Assign Audit'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Toggle Button */}
            <div className="mb-6">
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
                                    placeholder="Search by audit ID, supplier, auditor..."
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
                                    ...suppliers.map((supplier) => ({
                                        value: supplier.id.toString(),
                                        label: `${supplier.name} (${supplier.auditCount} audits)`,
                                    })),
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
                                    ...auditors
                                        .filter((auditor) => auditor.isActive === 1)
                                        .map((auditor) => ({
                                            value: auditor.id.toString(),
                                            label: `${auditor.name} (${auditor.auditorId})`,
                                        })),
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

                        {/* Clear Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter({ value: 'all', label: 'All Status' });
                                    setAuditorFilter({ value: 'all', label: 'All Auditors' });
                                    setSupplierFilter({ value: 'all', label: 'All Suppliers' });
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm font-medium opacity-90">Total Assignments</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.scheduled}</div>
                    <div className="text-sm font-medium opacity-90">Scheduled</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.pending}</div>
                    <div className="text-sm font-medium opacity-90">Pending</div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.inProgress}</div>
                    <div className="text-sm font-medium opacity-90">In Progress</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.completed}</div>
                    <div className="text-sm font-medium opacity-90">Completed</div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-2xl font-bold">{stats.overdue}</div>
                    <div className="text-sm font-medium opacity-90">Overdue</div>
                </div>
            </div>

            {/* Table Section */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Audit Assignments'}
                    toggle={openForm}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={false}
                    isSortable={true}
                    btnName={showForm ? null : "Assign New Audit"}
                    loadings={loading}
                />
            </div>

            {/* Deleted Assignments Notice */}
            {auditAssignments.filter((a) => a.isActive === 0).length > 0 && (
                <div className="mt-8">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <IconRefresh className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">You have {auditAssignments.filter((a) => a.isActive === 0).length} deleted assignments.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditAssignToAuditor;