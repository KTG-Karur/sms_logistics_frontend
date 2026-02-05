import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IconSave from '../../components/Icon/IconSave';
import IconCancel from '../../components/Icon/IconX';
import IconEye from '../../components/Icon/IconEye';
import IconPrinter from '../../components/Icon/IconPrinter';
import IconDownload from '../../components/Icon/IconFile';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrash from '../../components/Icon/IconTrashLines';
import IconImage from '../../components/Icon/IconCamera';
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconMinus from '../../components/Icon/IconMinusCircle';
import IconEdit from '../../components/Icon/IconEdit';
import IconView from '../../components/Icon/IconEye';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { showMessage } from '../../util/AllFunction';

// Import your ModalViewBox component
import ModelViewBox from '../../util/ModelViewBox';

// Brand colors
const PRIMARY_COLOR = 'rgb(241, 101, 33)'; // Orange
const SECONDARY_COLOR = 'rgb(46, 48, 146)'; // Dark Blue

const ExternalProviderAuditForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mode = 'create', auditData = null } = location.state || {};

    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';
    const isCreateMode = mode === 'create';

    // Step state
    const [currentStep, setCurrentStep] = useState(1); // 1: Provider Info, 2: Checklist
    const [savedSteps, setSavedSteps] = useState({
        providerInfo: false,
        checklists: {},
    });

    // Modal state for image viewing
    const [imageModal, setImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    // Main state
    const [formData, setFormData] = useState({
        // Provider Information
        supplierName: '',
        supplierType: '',
        employeeCount: '',
        productionCapacity: '',
        asianAuditorName: '',
        lastAuditDate: '',
        machineCount: '',
        products: '',
        visitDate: new Date().toISOString().split('T')[0],
        supplierRepresentative: '',
        lastAuditScore: '',
        currentScore: '',
        transportAvailable: false,
        accommodationAvailable: false,
        animalsAllowed: false,

        // Audit Details
        auditId: `AUD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        auditDate: new Date().toISOString().split('T')[0],
        status: isCreateMode ? 'Pending' : 'In Progress',

        // Checklists - Each checklist has its own expanded state
        checklists: [],

        // Worker Interviews
        workerInterviews: [],

        // Auditor Remarks
        auditorRemarks: '',

        // External Provider Comments
        externalProviderComments: '',

        // Score tracking
        completedItems: 0,
        totalItems: 0,
    });

    // Expanded sections for main accordion
    const [expandedSections, setExpandedSections] = useState({
        providerInfo: true,
        checklist: false,
        workerInterviews: false,
        auditorRemarks: false,
        providerComments: false,
    });

    // File upload states
    const [uploadedImages, setUploadedImages] = useState({});

    // Enhanced dummy checklist data with 14 main checklists
    const dummyChecklists = [
        {
            id: 1,
            title: '1. MANAGEMENT SYSTEM & COMPLIANCE',
            order: 1,
            isExpanded: false,
            items: Array.from({ length: 5 }, (_, i) => ({
                id: 1.1 + i * 0.1,
                title: `1.${i + 1}. Management System Requirement ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_1_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_1_${i}`, label: 'No', value: 'no' },
                    { id: `na_1_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 2,
            title: '2. HEALTH & SAFETY',
            order: 2,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 2.1 + i * 0.1,
                title: `2.${i + 1}. Safety Requirement ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_2_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_2_${i}`, label: 'No', value: 'no' },
                    { id: `na_2_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 3,
            title: '3. ENVIRONMENTAL MANAGEMENT',
            order: 3,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 3.1 + i * 0.1,
                title: `3.${i + 1}. Environmental Compliance ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_3_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_3_${i}`, label: 'No', value: 'no' },
                    { id: `na_3_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 4,
            title: '4. QUALITY CONTROL',
            order: 4,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 4.1 + i * 0.1,
                title: `4.${i + 1}. Quality Standard ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_4_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_4_${i}`, label: 'No', value: 'no' },
                    { id: `na_4_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 5,
            title: '5. PRODUCTION FACILITIES',
            order: 5,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 5.1 + i * 0.1,
                title: `5.${i + 1}. Facility Requirement ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_5_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_5_${i}`, label: 'No', value: 'no' },
                    { id: `na_5_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 6,
            title: '6. WORKER WELFARE',
            order: 6,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 6.1 + i * 0.1,
                title: `6.${i + 1}. Worker Welfare ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_6_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_6_${i}`, label: 'No', value: 'no' },
                    { id: `na_6_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 7,
            title: '7. DOCUMENTATION & RECORDS',
            order: 7,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 7.1 + i * 0.1,
                title: `7.${i + 1}. Documentation ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_7_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_7_${i}`, label: 'No', value: 'no' },
                    { id: `na_7_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 8,
            title: '8. SUPPLY CHAIN MANAGEMENT',
            order: 8,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 8.1 + i * 0.1,
                title: `8.${i + 1}. Supply Chain ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_8_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_8_${i}`, label: 'No', value: 'no' },
                    { id: `na_8_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 9,
            title: '9. EMERGENCY PREPAREDNESS',
            order: 9,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 9.1 + i * 0.1,
                title: `9.${i + 1}. Emergency Plan ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_9_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_9_${i}`, label: 'No', value: 'no' },
                    { id: `na_9_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 10,
            title: '10. TRAINING & COMPETENCE',
            order: 10,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 10.1 + i * 0.1,
                title: `10.${i + 1}. Training Requirement ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_10_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_10_${i}`, label: 'No', value: 'no' },
                    { id: `na_10_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 11,
            title: '11. EQUIPMENT MAINTENANCE',
            order: 11,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 11.1 + i * 0.1,
                title: `11.${i + 1}. Equipment Check ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_11_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_11_${i}`, label: 'No', value: 'no' },
                    { id: `na_11_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 12,
            title: '12. RISK ASSESSMENT',
            order: 12,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 12.1 + i * 0.1,
                title: `12.${i + 1}. Risk Factor ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_12_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_12_${i}`, label: 'No', value: 'no' },
                    { id: `na_12_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 13,
            title: '13. SOCIAL COMPLIANCE',
            order: 13,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 13.1 + i * 0.1,
                title: `13.${i + 1}. Social Standard ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_13_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_13_${i}`, label: 'No', value: 'no' },
                    { id: `na_13_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
        {
            id: 14,
            title: '14. CONTINUAL IMPROVEMENT',
            order: 14,
            isExpanded: false,
            items: Array.from({ length: 4 }, (_, i) => ({
                id: 14.1 + i * 0.1,
                title: `14.${i + 1}. Improvement Area ${i + 1}`,
                type: 'radio',
                options: [
                    { id: `yes_14_${i}`, label: 'Yes', value: 'yes' },
                    { id: `no_14_${i}`, label: 'No', value: 'no' },
                    { id: `na_14_${i}`, label: 'N/A', value: 'na' },
                ],
                selectedValue: '',
                description: '',
                image: null,
                hasDescription: true,
                hasImage: true,
                isSaved: false,
            })),
        },
    ];

    // Initialize with dummy data
    useEffect(() => {
        if (auditData) {
            setFormData((prev) => ({
                ...prev,
                ...auditData,
                checklists: auditData.checklists || dummyChecklists,
            }));
            if (auditData.supplierName) {
                setSavedSteps((prev) => ({ ...prev, providerInfo: true }));
                setCurrentStep(2);
                setExpandedSections((prev) => ({ ...prev, checklist: true }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                checklists: dummyChecklists,
            }));
        }
    }, [auditData]);

    // Calculate progress
    useEffect(() => {
        const totalItems = formData.checklists.reduce((acc, cl) => acc + cl.items.length, 0);
        const completedItems = formData.checklists.reduce((acc, cl) => acc + cl.items.filter((item) => item.selectedValue).length, 0);

        setFormData((prev) => ({
            ...prev,
            totalItems,
            completedItems,
        }));
    }, [formData.checklists]);

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const toggleChecklist = (checklistId) => {
        setFormData((prev) => {
            const updatedChecklists = prev.checklists.map((checklist) => {
                if (checklist.id === checklistId) {
                    return { ...checklist, isExpanded: !checklist.isExpanded };
                }
                return checklist;
            });
            return { ...prev, checklists: updatedChecklists };
        });
    };

    const expandAllChecklists = () => {
        setFormData((prev) => {
            const updatedChecklists = prev.checklists.map((checklist) => ({
                ...checklist,
                isExpanded: true,
            }));
            return { ...prev, checklists: updatedChecklists };
        });
    };

    const collapseAllChecklists = () => {
        setFormData((prev) => {
            const updatedChecklists = prev.checklists.map((checklist) => ({
                ...checklist,
                isExpanded: false,
            }));
            return { ...prev, checklists: updatedChecklists };
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleChecklistChange = (checklistId, itemId, field, value) => {
        setFormData((prev) => {
            const updatedChecklists = prev.checklists.map((checklist) => {
                if (checklist.id === checklistId) {
                    const updatedItems = checklist.items.map((item) => {
                        if (item.id === itemId) {
                            return { ...item, [field]: value, isSaved: field === 'selectedValue' ? false : item.isSaved };
                        }
                        return item;
                    });
                    return { ...checklist, items: updatedItems };
                }
                return checklist;
            });

            return { ...prev, checklists: updatedChecklists };
        });
    };

    const handleImageUpload = (checklistId, itemId, e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Please upload an image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', 'Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;
                setUploadedImages((prev) => ({
                    ...prev,
                    [`${checklistId}_${itemId}`]: imageData,
                }));

                handleChecklistChange(checklistId, itemId, 'image', imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (checklistId, itemId) => {
        const key = `${checklistId}_${itemId}`;
        setUploadedImages((prev) => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });

        handleChecklistChange(checklistId, itemId, 'image', null);
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setImageModal(true);
    };

    const closeImageModal = () => {
        setSelectedImage('');
        setImageModal(false);
    };

    // Save functions
    const saveProviderInfo = () => {
        if (!formData.supplierName || !formData.asianAuditorName) {
            showMessage('error', 'Please fill all required fields');
            return;
        }

        setSavedSteps((prev) => ({ ...prev, providerInfo: true }));
        setCurrentStep(2);
        setExpandedSections((prev) => ({ ...prev, checklist: true }));
        showMessage('success', 'Provider information saved successfully!');
    };

    const saveChecklistItem = (checklistId, itemId) => {
        setFormData((prev) => {
            const updatedChecklists = prev.checklists.map((checklist) => {
                if (checklist.id === checklistId) {
                    const updatedItems = checklist.items.map((item) => {
                        if (item.id === itemId) {
                            return { ...item, isSaved: true };
                        }
                        return item;
                    });
                    return { ...checklist, items: updatedItems };
                }
                return checklist;
            });

            return { ...prev, checklists: updatedChecklists };
        });

        setSavedSteps((prev) => ({
            ...prev,
            checklists: {
                ...prev.checklists,
                [`${checklistId}_${itemId}`]: true,
            },
        }));

        showMessage('success', 'Checklist item saved successfully!');
    };

    const saveAllChecklist = (checklistId) => {
        setFormData((prev) => {
            const updatedChecklists = prev.checklists.map((checklist) => {
                if (checklist.id === checklistId) {
                    const updatedItems = checklist.items.map((item) => ({
                        ...item,
                        isSaved: true,
                    }));
                    return { ...checklist, items: updatedItems };
                }
                return checklist;
            });

            return { ...prev, checklists: updatedChecklists };
        });

        showMessage('success', 'All items in checklist saved successfully!');
    };

    // Worker Interview Functions
    const [newInterview, setNewInterview] = useState({
        name: '',
        designation: '',
        natureOfWork: '',
        questions: [{ question: '', response: '' }],
    });

    const addQuestion = () => {
        setNewInterview((prev) => ({
            ...prev,
            questions: [...prev.questions, { question: '', response: '' }],
        }));
    };

    const removeQuestion = (index) => {
        if (newInterview.questions.length > 1) {
            setNewInterview((prev) => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== index),
            }));
        }
    };

    const updateQuestion = (index, field, value) => {
        const updatedQuestions = [...newInterview.questions];
        updatedQuestions[index][field] = value;
        setNewInterview((prev) => ({
            ...prev,
            questions: updatedQuestions,
        }));
    };

    const addInterview = () => {
        if (!newInterview.name || !newInterview.designation) {
            showMessage('error', 'Name and designation are required');
            return;
        }

        setFormData((prev) => ({
            ...prev,
            workerInterviews: [...prev.workerInterviews, { ...newInterview, id: Date.now() }],
        }));

        setNewInterview({
            name: '',
            designation: '',
            natureOfWork: '',
            questions: [{ question: '', response: '' }],
        });

        showMessage('success', 'Worker interview added successfully');
    };

    const removeInterview = (index) => {
        setFormData((prev) => ({
            ...prev,
            workerInterviews: prev.workerInterviews.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!savedSteps.providerInfo) {
            showMessage('error', 'Please save provider information first');
            return;
        }

        const successMessage = isEditMode ? 'Audit updated successfully!' : 'Audit created successfully!';
        showMessage('success', successMessage);
        setTimeout(() => {
            navigate(-1);
        }, 1500);
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            navigate(-1);
        }
    };

    const printAudit = () => {
        window.print();
    };

    const exportAudit = () => {
        showMessage('success', 'Audit exported successfully!');
    };

    const getProgressColor = () => {
        const progress = (formData.completedItems / formData.totalItems) * 100;
        if (progress >= 90) return '#10b981'; // green
        if (progress >= 70) return PRIMARY_COLOR; // orange
        if (progress >= 50) return '#f59e0b'; // yellow
        return '#ef4444'; // red
    };

    // Custom styles for brand colors
    const brandStyles = `
        .btn-primary {
            background-color: ${PRIMARY_COLOR} !important;
            border-color: ${PRIMARY_COLOR} !important;
        }
        .btn-primary:hover {
            background-color: rgba(241, 101, 33, 0.9) !important;
        }
        .btn-outline-primary {
            color: ${PRIMARY_COLOR} !important;
            border-color: ${PRIMARY_COLOR} !important;
        }
        .btn-outline-primary:hover {
            background-color: ${PRIMARY_COLOR} !important;
            color: white !important;
        }
        .text-primary {
            color: ${PRIMARY_COLOR} !important;
        }
        .border-primary {
            border-color: ${PRIMARY_COLOR} !important;
        }
        .bg-primary {
            background-color: ${PRIMARY_COLOR} !important;
        }
        .bg-secondary {
            background-color: ${SECONDARY_COLOR} !important;
        }
        .progress-bar {
            background-color: ${PRIMARY_COLOR} !important;
        }
        .form-radio:checked {
            background-color: ${PRIMARY_COLOR} !important;
            border-color: ${PRIMARY_COLOR} !important;
        }
        .form-checkbox:checked {
            background-color: ${PRIMARY_COLOR} !important;
            border-color: ${PRIMARY_COLOR} !important;
        }
        .accordion-header.active {
            border-left: 4px solid ${PRIMARY_COLOR} !important;
        }
    `;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <style>{brandStyles}</style>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(241,101,33)] to-[rgb(46,48,146)] flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{isViewMode ? 'View Audit' : isEditMode ? 'Edit Audit' : 'New Audit'}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    ID: <span className="font-mono">{formData.auditId}</span>
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{new Date(formData.visitDate).toLocaleDateString()}</span>
                                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm">{formData.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                        <div className="text-3xl font-bold text-gray-800">{formData.completedItems}</div>
                        <div className="text-sm text-gray-600">Items Completed</div>
                        <div className="text-xs text-gray-500 mt-1">out of {formData.totalItems} total</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl">
                        <div className="text-3xl font-bold text-gray-800">{formData.totalItems > 0 ? Math.round((formData.completedItems / formData.totalItems) * 100) : 0}%</div>
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(formData.completedItems / formData.totalItems) * 100}%`,
                                    backgroundColor: getProgressColor(),
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                        <div className="text-3xl font-bold text-gray-800">{formData.checklists.length}</div>
                        <div className="text-sm text-gray-600">Checklists</div>
                        <div className="text-xs text-gray-500 mt-1">14 main categories</div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Provider Information Accordion */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className={`border-b border-gray-200 ${expandedSections.providerInfo ? 'bg-gradient-to-r from-blue-50 to-white' : ''}`}>
                        <button
                            type="button"
                            onClick={() => toggleSection('providerInfo')}
                            className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(241,101,33)] to-[rgb(46,48,146)] flex items-center justify-center mr-4">
                                    <span className="text-white font-bold">1</span>
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-800">Provider Information</h3>
                                    <p className="text-gray-600 text-sm mt-1">Basic details about the external provider</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {savedSteps.providerInfo && <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Saved</span>}
                                {expandedSections.providerInfo ? <IconChevronUp className="w-5 h-5 text-gray-500" /> : <IconChevronDown className="w-5 h-5 text-gray-500" />}
                            </div>
                        </button>
                    </div>

                    {expandedSections.providerInfo && (
                        <div className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Supplier Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Name of Supplier/External Provider *</label>
                                    <input
                                        type="text"
                                        name="supplierName"
                                        value={formData.supplierName}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="Enter supplier name"
                                        required
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Supplier Type - Changed to text field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Type of Supplier *</label>
                                    <input
                                        type="text"
                                        name="supplierType"
                                        value={formData.supplierType}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="Enter supplier type"
                                        required
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Number of Employees */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">No. of Employees</label>
                                    <input
                                        type="number"
                                        name="employeeCount"
                                        value={formData.employeeCount}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="Enter number"
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Production Capacity */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Production Capacity</label>
                                    <input
                                        type="text"
                                        name="productionCapacity"
                                        value={formData.productionCapacity}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="e.g., 5000 units/month"
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Asian Auditor Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Asian Auditor Name *</label>
                                    <input
                                        type="text"
                                        name="asianAuditorName"
                                        value={formData.asianAuditorName}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="Enter auditor name"
                                        required
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Visit Date */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Date of Visit *</label>
                                    <input
                                        type="date"
                                        name="visitDate"
                                        value={formData.visitDate}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        required
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Last Audit Date - Moved next to Visit Date */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Last Audit Date</label>
                                    <input
                                        type="date"
                                        name="lastAuditDate"
                                        value={formData.lastAuditDate}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Number of Machines */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">No. of Machines</label>
                                    <input
                                        type="number"
                                        name="machineCount"
                                        value={formData.machineCount}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="Enter number"
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Products - Changed to textarea with same height as other fields */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Name of Products</label>
                                    <textarea
                                        name="products"
                                        value={formData.products}
                                        onChange={handleInputChange}
                                        className="form-textarea w-full min-h-[42px]"
                                        placeholder="Enter product names"
                                        rows="1"
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Supplier Representative */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Supplier Representative</label>
                                    <input
                                        type="text"
                                        name="supplierRepresentative"
                                        value={formData.supplierRepresentative}
                                        onChange={handleInputChange}
                                        className="form-input w-full"
                                        placeholder="Enter representative name"
                                        disabled={isViewMode || savedSteps.providerInfo}
                                    />
                                </div>

                                {/* Last Audit Score */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Last Audit Score</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="lastAuditScore"
                                            value={formData.lastAuditScore}
                                            onChange={handleInputChange}
                                            className="form-input w-full pr-10"
                                            placeholder="Score"
                                            min="0"
                                            max="100"
                                            disabled={isViewMode || savedSteps.providerInfo}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500">%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Score */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Current Score</label>
                                    <div className="relative">
                                        <input type="number" name="currentScore" value={formData.currentScore} className="form-input w-full pr-10 bg-gray-50" placeholder="Auto-calculated" disabled />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500">%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Fields */}
                                <div className="md:col-span-3 space-y-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700">Facility Features</h4>
                                    <div className="flex flex-wrap gap-4 md:gap-6">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="transportAvailable"
                                                checked={formData.transportAvailable}
                                                onChange={handleInputChange}
                                                className="form-checkbox h-5 w-5 rounded"
                                                disabled={isViewMode || savedSteps.providerInfo}
                                            />
                                            <span className="text-gray-700">Transport Available</span>
                                        </label>

                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="accommodationAvailable"
                                                checked={formData.accommodationAvailable}
                                                onChange={handleInputChange}
                                                className="form-checkbox h-5 w-5 rounded"
                                                disabled={isViewMode || savedSteps.providerInfo}
                                            />
                                            <span className="text-gray-700">Accommodation Available</span>
                                        </label>

                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                name="animalsAllowed"
                                                checked={formData.animalsAllowed}
                                                onChange={handleInputChange}
                                                className="form-checkbox h-5 w-5 rounded"
                                                disabled={isViewMode || savedSteps.providerInfo}
                                            />
                                            <span className="text-gray-700">Animals Allowed</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Save Button for Provider Info */}
                                {!isViewMode && !savedSteps.providerInfo && (
                                    <div className="md:col-span-3 pt-4 border-t border-gray-200">
                                        <div className="flex justify-end">
                                            <button type="button" onClick={saveProviderInfo} className="btn btn-primary px-6">
                                                <IconSave className="w-4 h-4 mr-2" />
                                                Save Provider Information
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Checklists Accordion - Only show if provider info is saved */}
                {savedSteps.providerInfo && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`border-b border-gray-200 ${expandedSections.checklist ? 'bg-gradient-to-r from-orange-50 to-white' : ''}`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('checklist')}
                                className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(241,101,33)] to-[rgb(46,48,146)] flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Audit Checklist</h3>
                                        <p className="text-gray-600 text-sm mt-1">Complete the audit checklist with Yes/No/N/A options</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="hidden md:inline text-sm text-gray-500">
                                        {formData.completedItems}/{formData.totalItems} items
                                    </span>
                                    {expandedSections.checklist ? <IconChevronUp className="w-5 h-5 text-gray-500" /> : <IconChevronDown className="w-5 h-5 text-gray-500" />}
                                </div>
                            </button>
                        </div>

                        {expandedSections.checklist && (
                            <div className="p-4 md:p-6">
                                {/* Checklist Controls */}
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-gray-700">Checklist Controls:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={expandAllChecklists} className="btn btn-sm btn-outline-primary">
                                            Expand All
                                        </button>
                                        <button type="button" onClick={collapseAllChecklists} className="btn btn-sm btn-outline-primary">
                                            Collapse All
                                        </button>
                                    </div>
                                </div>

                                {/* Checklists Container */}
                                <div className="space-y-4">
                                    {formData.checklists.map((checklist, checklistIndex) => {
                                        const completedCount = checklist.items.filter((item) => item.selectedValue).length;
                                        const totalCount = checklist.items.length;
                                        const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                                        const allSaved = checklist.items.every((item) => item.isSaved);

                                        return (
                                            <div key={checklist.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                                {/* Checklist Header */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleChecklist(checklist.id)}
                                                    className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-gray-50 to-white hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                                progress === 100 ? 'bg-green-100 text-green-600' : progress >= 50 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                        >
                                                            <span className="font-bold">{checklist.order}</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="font-semibold text-gray-800">{checklist.title}</h4>
                                                            <div className="flex items-center space-x-3 mt-1">
                                                                <span className="text-sm text-gray-600">
                                                                    {completedCount}/{totalCount} items
                                                                </span>
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-orange-500' : 'bg-gray-400'}`}
                                                                        style={{ width: `${progress}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700">{progress}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div
                                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                progress === 100 ? 'bg-green-100 text-green-800' : progress >= 50 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {progress === 100 ? 'Complete' : 'In Progress'}
                                                        </div>
                                                        {checklist.isExpanded ? <IconChevronUp className="w-5 h-5 text-gray-500" /> : <IconChevronDown className="w-5 h-5 text-gray-500" />}
                                                    </div>
                                                </button>

                                                {/* Checklist Items */}
                                                {checklist.isExpanded && (
                                                    <div className="divide-y divide-gray-100">
                                                        <div className="p-4 bg-gray-50 border-b">
                                                            <div className="flex justify-between items-center">
                                                                <div className="text-sm text-gray-600">Complete all items and save individually</div>
                                                                <button type="button" onClick={() => saveAllChecklist(checklist.id)} className="btn btn-sm btn-primary" disabled={allSaved}>
                                                                    <IconSave className="w-3 h-3 mr-1" />
                                                                    Save All Items
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {checklist.items.map((item, itemIndex) => {
                                                            const imageKey = `${checklist.id}_${item.id}`;
                                                            const hasImage = uploadedImages[imageKey] || item.image;

                                                            return (
                                                                <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                                    {/* Single Row Layout */}
                                                                    <div className="grid grid-cols-12 gap-3 items-center">
                                                                        {/* Question Title - 3 columns */}
                                                                        <div className="col-span-12 lg:col-span-3">
                                                                            <label className="block text-sm font-medium text-gray-700 mb-1">{item.title}</label>
                                                                        </div>

                                                                        {/* Radio Options - 3 columns */}
                                                                        <div className="col-span-12 lg:col-span-2">
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {item.options.map((option) => (
                                                                                    <label
                                                                                        key={option.id}
                                                                                        className={`inline-flex items-center px-2 py-1 rounded border cursor-pointer transition-all text-xs whitespace-nowrap ${
                                                                                            item.selectedValue === option.value
                                                                                                ? option.value === 'yes'
                                                                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                                                                    : option.value === 'no'
                                                                                                      ? 'bg-red-50 border-red-200 text-red-700'
                                                                                                      : 'bg-gray-50 border-gray-200 text-gray-700'
                                                                                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                                                                        }`}
                                                                                    >
                                                                                        <input
                                                                                            type="radio"
                                                                                            name={`item_${item.id}`}
                                                                                            value={option.value}
                                                                                            checked={item.selectedValue === option.value}
                                                                                            onChange={(e) => handleChecklistChange(checklist.id, item.id, 'selectedValue', e.target.value)}
                                                                                            className="sr-only"
                                                                                            disabled={isViewMode}
                                                                                        />
                                                                                        <span className="flex items-center">
                                                                                            {option.value === 'yes' && <IconCheck className="w-3 h-3 mr-1" />}
                                                                                            {option.value === 'no' && <IconX className="w-3 h-3 mr-1" />}
                                                                                            {option.value === 'na' && <IconMinus className="w-3 h-3 mr-1" />}
                                                                                            {option.label}
                                                                                        </span>
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Comments - 2 columns */}
                                                                        <div className="col-span-12 lg:col-span-2">
                                                                            <div className="relative">
                                                                                <textarea
                                                                                    value={item.description}
                                                                                    onChange={(e) => handleChecklistChange(checklist.id, item.id, 'description', e.target.value)}
                                                                                    className="form-textarea w-full text-sm py-1 px-2"
                                                                                    placeholder="Add comments..."
                                                                                    rows="3"
                                                                                    disabled={isViewMode}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Image Upload/View - 2 columns */}
                                                                        <div className="col-span-12 lg:col-span-2">
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                {hasImage ? (
                                                                                    <div className="flex items-center gap-1">
                                                                                        <button type="button" className="btn btn-sm btn-outline-primary px-2" onClick={() => openImageModal(hasImage)}>
                                                                                            <IconView className="w-3 h-3 mr-1" />
                                                                                            View
                                                                                        </button>
                                                                                        {!isViewMode && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => removeImage(checklist.id, item.id)}
                                                                                                className="btn btn-sm btn-outline-danger px-2"
                                                                                            >
                                                                                                <IconTrash className="w-3 h-3" />
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                ) : (
                                                                                    !isViewMode && (
                                                                                        <label className="cursor-pointer">
                                                                                            <input
                                                                                                type="file"
                                                                                                accept="image/*"
                                                                                                onChange={(e) => handleImageUpload(checklist.id, item.id, e)}
                                                                                                className="hidden"
                                                                                                disabled={isViewMode}
                                                                                            />
                                                                                            <span className="btn btn-sm btn-outline-primary px-2">
                                                                                                <IconImage className="w-3 h-3 mr-1" />
                                                                                                Upload
                                                                                            </span>
                                                                                        </label>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Save/Update Button - 1 column */}
                                                                        <div className="col-span-12 lg:col-span-1 flex justify-end">
                                                                            {!isViewMode && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => saveChecklistItem(checklist.id, item.id)}
                                                                                    className={`btn btn-sm ${item.isSaved ? 'btn-success' : 'btn-primary'} px-2`}
                                                                                    disabled={!item.selectedValue}
                                                                                >
                                                                                    {item.isSaved ? (
                                                                                        <>
                                                                                            <IconEdit className="w-3 h-3" />Update
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <IconSave className="w-3 h-3" />Save
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Worker Interviews Accordion */}
                {savedSteps.providerInfo && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`border-b border-gray-200 ${expandedSections.workerInterviews ? 'bg-gradient-to-r from-purple-50 to-white' : ''}`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('workerInterviews')}
                                className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(241,101,33)] to-[rgb(46,48,146)] flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Worker Interviews</h3>
                                        <p className="text-gray-600 text-sm mt-1">Record interviews with workers (Name, Designation, Questions & Responses)</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="hidden md:inline text-sm text-gray-500">{formData.workerInterviews.length} interviews</span>
                                    {expandedSections.workerInterviews ? <IconChevronUp className="w-5 h-5 text-gray-500" /> : <IconChevronDown className="w-5 h-5 text-gray-500" />}
                                </div>
                            </button>
                        </div>

                        {expandedSections.workerInterviews && (
                            <div className="p-4 md:p-6">
                                {/* Add New Interview Form */}
                                {!isViewMode && (
                                    <div className="mb-6 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Interview</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Worker Name *</label>
                                                <input
                                                    type="text"
                                                    value={newInterview.name}
                                                    onChange={(e) => setNewInterview((prev) => ({ ...prev, name: e.target.value }))}
                                                    className="form-input w-full"
                                                    placeholder="Enter worker name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Designation *</label>
                                                <input
                                                    type="text"
                                                    value={newInterview.designation}
                                                    onChange={(e) => setNewInterview((prev) => ({ ...prev, designation: e.target.value }))}
                                                    className="form-input w-full"
                                                    placeholder="Enter designation"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Nature of Work</label>
                                                <input
                                                    type="text"
                                                    value={newInterview.natureOfWork}
                                                    onChange={(e) => setNewInterview((prev) => ({ ...prev, natureOfWork: e.target.value }))}
                                                    className="form-input w-full"
                                                    placeholder="Describe work nature"
                                                />
                                            </div>
                                        </div>

                                        {/* Questions Section */}
                                        <div className="space-y-4 mb-6">
                                            <div className="flex flex-wrap justify-between items-center gap-3">
                                                <h5 className="text-md font-medium text-gray-700">Questions & Responses</h5>
                                                <button type="button" onClick={addQuestion} className="btn btn-sm btn-outline-primary">
                                                    <IconPlus className="w-4 h-4 mr-1" />
                                                    Add Question
                                                </button>
                                            </div>

                                            {newInterview.questions.map((q, index) => (
                                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Question {index + 1}</label>
                                                                <input
                                                                    type="text"
                                                                    value={q.question}
                                                                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                                                                    className="form-input w-full"
                                                                    placeholder="Enter question"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">Response</label>
                                                                <textarea
                                                                    value={q.response}
                                                                    onChange={(e) => updateQuestion(index, 'response', e.target.value)}
                                                                    className="form-textarea w-full"
                                                                    placeholder="Enter response"
                                                                    rows="3"
                                                                />
                                                            </div>
                                                        </div>
                                                        {newInterview.questions.length > 1 && (
                                                            <button type="button" onClick={() => removeQuestion(index)} className="btn btn-outline-danger btn-sm self-start">
                                                                <IconTrash className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button type="button" onClick={addInterview} className="btn btn-primary">
                                            <IconPlus className="w-4 h-4 mr-2" />
                                            Add Interview
                                        </button>
                                    </div>
                                )}

                                {/* Interviews Table */}
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">S.No</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Designation</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nature of Work</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Questions</th>
                                                {!isViewMode && <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {formData.workerInterviews.length > 0 ? (
                                                formData.workerInterviews.map((interview, index) => (
                                                    <tr key={interview.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{interview.name}</div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{interview.designation}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm text-gray-900">{interview.natureOfWork}</div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="space-y-2">
                                                                {interview.questions.map((q, qIndex) => (
                                                                    <div key={qIndex} className="text-sm">
                                                                        <div className="font-medium text-gray-700">
                                                                            Q{qIndex + 1}: {q.question}
                                                                        </div>
                                                                        <div className="text-gray-600 ml-4">A: {q.response || 'No response'}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        {!isViewMode && (
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <button type="button" onClick={() => removeInterview(index)} className="btn btn-sm btn-outline-danger">
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={isViewMode ? 5 : 6} className="px-4 py-8 text-center">
                                                        <div className="text-gray-500">No worker interviews recorded yet.</div>
                                                        {!isViewMode && <div className="text-sm text-gray-400 mt-2">Use the form above to add interviews</div>}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Auditor Remarks Accordion */}
                {savedSteps.providerInfo && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`border-b border-gray-200 ${expandedSections.auditorRemarks ? 'bg-gradient-to-r from-green-50 to-white' : ''}`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('auditorRemarks')}
                                className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(241,101,33)] to-[rgb(46,48,146)] flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">4</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">Auditor Remarks / Observations</h3>
                                        <p className="text-gray-600 text-sm mt-1">Overall observations and recommendations</p>
                                    </div>
                                </div>
                                {expandedSections.auditorRemarks ? <IconChevronUp className="w-5 h-5 text-gray-500" /> : <IconChevronDown className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>

                        {expandedSections.auditorRemarks && (
                            <div className="p-4 md:p-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Overall Audit Observations</label>
                                    <textarea
                                        name="auditorRemarks"
                                        value={formData.auditorRemarks}
                                        onChange={handleInputChange}
                                        className="form-textarea w-full min-h-[150px]"
                                        placeholder="Enter your overall observations, findings, and recommendations..."
                                        disabled={isViewMode}
                                    />
                                    <div className="flex items-center text-sm text-gray-500">
                                        <IconEye className="w-4 h-4 mr-2" />
                                        Include strengths, areas for improvement, and any critical observations.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* External Provider Comments Accordion */}
                {savedSteps.providerInfo && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className={`border-b border-gray-200 ${expandedSections.providerComments ? 'bg-gradient-to-r from-teal-50 to-white' : ''}`}>
                            <button
                                type="button"
                                onClick={() => toggleSection('providerComments')}
                                className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(241,101,33)] to-[rgb(46,48,146)] flex items-center justify-center mr-4">
                                        <span className="text-white font-bold">5</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">External Provider Comments / Suggestions</h3>
                                        <p className="text-gray-600 text-sm mt-1">Feedback from the external provider about the audit</p>
                                    </div>
                                </div>
                                {expandedSections.providerComments ? <IconChevronUp className="w-5 h-5 text-gray-500" /> : <IconChevronDown className="w-5 h-5 text-gray-500" />}
                            </button>
                        </div>

                        {expandedSections.providerComments && (
                            <div className="p-4 md:p-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">Provider Feedback</label>
                                    <textarea
                                        name="externalProviderComments"
                                        value={formData.externalProviderComments}
                                        onChange={handleInputChange}
                                        className="form-textarea w-full min-h-[150px]"
                                        placeholder="Enter provider's comments, suggestions, or feedback about the audit process..."
                                        disabled={isViewMode}
                                    />
                                    <div className="flex items-center text-sm text-gray-500">
                                        <IconEye className="w-4 h-4 mr-2" />
                                        This section is for the external provider to provide feedback about the audit process.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 -mx-4 md:-mx-6 mt-8 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                            Audit ID: <span className="font-semibold">{formData.auditId}</span>
                            <span className="mx-2">•</span>
                            Progress:{' '}
                            <span className="font-semibold">
                                {formData.completedItems}/{formData.totalItems}
                            </span>{' '}
                            items
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {!isViewMode && (
                                <>
                                    <button type="button" onClick={handleCancel} className="btn btn-outline-primary">
                                        <IconCancel className="w-4 h-4 mr-2" />
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={!savedSteps.providerInfo}>
                                        <IconSave className="w-4 h-4 mr-2" />
                                        {isEditMode ? 'Update Audit' : 'Save Audit'}
                                    </button>
                                </>
                            )}

                            {isViewMode && (
                                <>
                                    <button type="button" onClick={() => navigate(-1)} className="btn btn-outline-primary">
                                        Back to List
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate('/audit/external-provider/form', {
                                                state: { mode: 'edit', auditData: formData },
                                            })
                                        }
                                        className="btn btn-primary"
                                    >
                                        Edit Audit
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Image Modal */}
            <ModelViewBox modal={imageModal} modelHeader="View Image" isEdit={false} setModel={closeImageModal} handleSubmit={() => {}} modelSize="lg" saveBtn={false}>
                <div className="p-4">
                    {selectedImage && (
                        <div className="flex justify-center">
                            <img src={selectedImage} alt="Supporting Evidence" className="max-w-full max-h-[500px] object-contain rounded-lg" />
                        </div>
                    )}
                </div>
            </ModelViewBox>
        </div>
    );
};

export default ExternalProviderAuditForm;
