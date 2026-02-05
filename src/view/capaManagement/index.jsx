// src/pages/suppliers/CapaManagement.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import moment from 'moment';

// Icons
import IconCheckCircle from '../../components/Icon/IconCircleCheck';
import IconXCircle from '../../components/Icon/IconXCircle';
import IconClock from '../../components/Icon/IconClock';
import IconAlertCircle from '../../components/Icon/IconInfoCircle';
import IconFileText from '../../components/Icon/IconFile';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconUser from '../../components/Icon/IconUser';
import IconDownload from '../../components/Icon/IconDownload';
import IconUpload from '../../components/Icon/IconCloudDownload';
import IconSave from '../../components/Icon/IconSave';
import IconSend from '../../components/Icon/IconSend';
import IconEye from '../../components/Icon/IconEye';
import IconTrash from '../../components/Icon/IconTrashLines';
import IconPlus from '../../components/Icon/IconPlus';
import IconChevronDown from '../../components/Icon/IconChevronDown';
import IconChevronUp from '../../components/Icon/IconChevronUp';
import IconShield from '../../components/Icon/IconShield';
import IconClipboard from '../../components/Icon/IconClipboardText';

const CapaManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mock audit data
  const mockAuditData = {
    id: 'AUD-2024-001',
    auditDate: '2024-01-15',
    supplierName: 'Asian Fabrics Private Limited',
    supplierId: 'SUP-001',
    auditorName: 'Rajesh Kumar',
    status: 'OPEN', // OPEN, SUBMITTED, CLOSED
    totalChecklistItems: 19,
    nonCompliancesCount: 3,
    submittedDate: null,
    closedDate: null,
  };

  // Mock non-compliance items
  const initialNonComplianceItems = [
    {
      id: 1,
      checklistItemNo: '2.3',
      checklistTitle: 'Fire extinguishers checked monthly',
      observation: 'Last fire extinguisher check was 45 days ago',
      severity: 'Major',
      status: 'Open', // Open, Submitted, Approved, Rejected
      capa: {
        rootCause: '',
        correctiveAction: '',
        preventiveAction: '',
        targetCompletionDate: '',
        evidence: [],
        comments: '',
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: 2,
      checklistItemNo: '4.4',
      checklistTitle: 'Calibration of measuring instruments',
      observation: '3 measuring instruments overdue for calibration by 2 weeks',
      severity: 'Minor',
      status: 'Open',
      capa: {
        rootCause: '',
        correctiveAction: '',
        preventiveAction: '',
        targetCompletionDate: '',
        evidence: [],
        comments: '',
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      id: 3,
      checklistItemNo: '5.3',
      checklistTitle: 'Ventilation system adequate',
      observation: 'Poor ventilation in grinding section, dust accumulation observed',
      severity: 'Critical',
      status: 'Open',
      capa: {
        rootCause: '',
        correctiveAction: '',
        preventiveAction: '',
        targetCompletionDate: '',
        evidence: [],
        comments: '',
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
  ];

  // State
  const [auditData, setAuditData] = useState(mockAuditData);
  const [nonComplianceItems, setNonComplianceItems] = useState(initialNonComplianceItems);
  const [expandedItems, setExpandedItems] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Check if all mandatory CAPA fields are filled
  const isCapaComplete = () => {
    return nonComplianceItems.every(item => {
      const { rootCause, correctiveAction, preventiveAction, targetCompletionDate } = item.capa;
      return rootCause.trim() && correctiveAction.trim() && preventiveAction.trim() && targetCompletionDate;
    });
  };

  // Get severity badge
  const getSeverityBadge = (severity) => {
    const config = {
      Minor: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'ℹ️' },
      Major: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚠️' },
      Critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' },
    };
    const configItem = config[severity] || config.Minor;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${configItem.color}`}>
        <span className="text-xs">{configItem.icon}</span>
        {severity}
      </span>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      Open: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <IconClock className="w-3 h-3" /> },
      Submitted: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <IconClock className="w-3 h-3" /> },
      Approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: <IconCheckCircle className="w-3 h-3" /> },
      Rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: <IconXCircle className="w-3 h-3" /> },
    };
    const configItem = config[status] || config.Open;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${configItem.color}`}>
        {configItem.icon}
        {status}
      </span>
    );
  };

  // Toggle item expansion
  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Expand all items
  const expandAllItems = () => {
    setExpandedItems(nonComplianceItems.map(item => item.id));
  };

  // Collapse all items
  const collapseAllItems = () => {
    setExpandedItems([]);
  };

  // Handle CAPA field change
  const handleCapaChange = (itemId, field, value) => {
    setNonComplianceItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              capa: { ...item.capa, [field]: value },
              status: item.status === 'Submitted' ? 'Open' : item.status, // Reset to Open if editing after submission
            }
          : item
      )
    );

    // Clear error for this field
    if (formErrors[itemId]?.includes(field)) {
      setFormErrors(prev => ({
        ...prev,
        [itemId]: prev[itemId].filter(err => err !== field),
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (itemId, e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      alert('Maximum 5 files allowed per item');
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} must be JPG, PNG, or PDF`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} must be less than 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = validFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }));

      setUploadedFiles(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), ...newFiles],
      }));

      handleCapaChange(
        itemId,
        'evidence',
        [...(uploadedFiles[itemId] || []), ...newFiles].map(f => f.name)
      );
    }
  };

  // Remove uploaded file
  const removeFile = (itemId, fileId) => {
    const updatedFiles = (uploadedFiles[itemId] || []).filter(file => file.id !== fileId);
    setUploadedFiles(prev => ({
      ...prev,
      [itemId]: updatedFiles,
    }));

    handleCapaChange(
      itemId,
      'evidence',
      updatedFiles.map(f => f.name)
    );
  };

  // Validate CAPA form
  const validateCapaForm = () => {
    const errors = {};
    let hasErrors = false;

    nonComplianceItems.forEach(item => {
      const itemErrors = [];
      const { rootCause, correctiveAction, preventiveAction, targetCompletionDate } = item.capa;

      if (!rootCause.trim()) itemErrors.push('rootCause');
      if (!correctiveAction.trim()) itemErrors.push('correctiveAction');
      if (!preventiveAction.trim()) itemErrors.push('preventiveAction');
      if (!targetCompletionDate) itemErrors.push('targetCompletionDate');

      if (itemErrors.length > 0) {
        errors[item.id] = itemErrors;
        hasErrors = true;
      }
    });

    setFormErrors(errors);
    return !hasErrors;
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update status in local state
    setNonComplianceItems(prev =>
      prev.map(item => ({
        ...item,
        status: item.status === 'Open' ? 'Open' : item.status, // Keep as Open for draft
        updatedAt: moment().format('YYYY-MM-DD'),
      }))
    );

    setIsSaving(false);
    alert('CAPA saved as draft successfully!');
  };

  // Submit CAPA
  const handleSubmitCapa = async () => {
    if (!validateCapaForm()) {
      alert('Please fill all mandatory CAPA fields');
      return;
    }

    if (!window.confirm('Are you sure you want to submit this CAPA? Once submitted, you cannot edit it.')) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update status in local state
    setNonComplianceItems(prev =>
      prev.map(item => ({
        ...item,
        status: 'Submitted',
        updatedAt: moment().format('YYYY-MM-DD'),
      }))
    );

    setAuditData(prev => ({
      ...prev,
      status: 'SUBMITTED',
      submittedDate: moment().format('YYYY-MM-DD'),
    }));

    setIsSubmitting(false);
    alert('CAPA submitted successfully!');
  };

  // View evidence file
  const viewFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  // Get overall CAPA status
  const getOverallCapaStatus = () => {
    const statuses = nonComplianceItems.map(item => item.status);
    
    if (statuses.every(s => s === 'Approved')) return 'CLOSED';
    if (statuses.every(s => s === 'Submitted' || s === 'Approved')) return 'SUBMITTED';
    return 'OPEN';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CAPA – Corrective and Preventive Action</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <IconShield className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700 font-medium">{auditData.supplierName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClipboard className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">Audit ID: <span className="font-mono font-medium">{auditData.id}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">{moment(auditData.auditDate).format('DD MMM YYYY')}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className={`px-4 py-2 rounded-lg font-medium text-sm ${
                getOverallCapaStatus() === 'OPEN' 
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : getOverallCapaStatus() === 'SUBMITTED'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                Status: {getOverallCapaStatus()}
              </div>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                ← Back to Audit
              </button>
            </div>
          </div>
        </div>

        {/* Audit Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Audit Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Audit Date</div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <IconCalendar className="w-4 h-4 text-gray-500" />
                {moment(auditData.auditDate).format('DD MMM YYYY')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Auditor</div>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <IconUser className="w-4 h-4 text-gray-500" />
                {auditData.auditorName}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Total Checklist Items</div>
              <div className="text-2xl font-bold text-gray-800">{auditData.totalChecklistItems}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Non-Compliances</div>
              <div className="text-2xl font-bold text-red-600">{auditData.nonCompliancesCount}</div>
            </div>
          </div>
        </div>

        {/* CAPA Controls */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Corrective & Preventive Actions</h2>
            <p className="text-gray-600 text-sm mt-1">
              Fill CAPA for each non-compliance item. All fields are mandatory.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={expandAllItems}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Expand All
            </button>
            <button
              onClick={collapseAllItems}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Non-Compliance Items List */}
        <div className="space-y-4">
          {nonComplianceItems.map((item, index) => {
            const isExpanded = expandedItems.includes(item.id);
            const itemErrors = formErrors[item.id] || [];

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Item Header */}
                <div className={`p-4 md:p-6 border-b border-gray-100 ${isExpanded ? 'bg-gray-50' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          Item {item.checklistItemNo}
                        </span>
                        {getSeverityBadge(item.severity)}
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        {item.checklistTitle}
                      </h3>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">
                        <div className="flex items-start gap-2">
                          <IconAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-yellow-800 mb-1">Auditor Observation:</div>
                            <div className="text-sm text-yellow-700">{item.observation}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {itemErrors.length > 0 && (
                        <Tippy content="Missing required fields">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        </Tippy>
                      )}
                      <button
                        onClick={() => toggleItemExpansion(item.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <IconChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <IconChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded CAPA Form */}
                {isExpanded && (
                  <div className="p-4 md:p-6">
                    <div className="space-y-6">
                      {/* Root Cause */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Root Cause Analysis *
                          {itemErrors.includes('rootCause') && (
                            <span className="text-red-500 ml-1">(Required)</span>
                          )}
                        </label>
                        <textarea
                          value={item.capa.rootCause}
                          onChange={(e) => handleCapaChange(item.id, 'rootCause', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            itemErrors.includes('rootCause') ? 'border-red-300' : 'border-gray-300'
                          }`}
                          rows="3"
                          placeholder="Describe the root cause of this non-compliance..."
                          disabled={item.status === 'Submitted' || item.status === 'Approved'}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Identify the underlying reason for the non-compliance
                        </p>
                      </div>

                      {/* Corrective Action */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Corrective Action *
                          {itemErrors.includes('correctiveAction') && (
                            <span className="text-red-500 ml-1">(Required)</span>
                          )}
                        </label>
                        <textarea
                          value={item.capa.correctiveAction}
                          onChange={(e) => handleCapaChange(item.id, 'correctiveAction', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            itemErrors.includes('correctiveAction') ? 'border-red-300' : 'border-gray-300'
                          }`}
                          rows="3"
                          placeholder="Describe the immediate corrective actions taken..."
                          disabled={item.status === 'Submitted' || item.status === 'Approved'}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Actions to eliminate the detected non-compliance
                        </p>
                      </div>

                      {/* Preventive Action */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preventive Action *
                          {itemErrors.includes('preventiveAction') && (
                            <span className="text-red-500 ml-1">(Required)</span>
                          )}
                        </label>
                        <textarea
                          value={item.capa.preventiveAction}
                          onChange={(e) => handleCapaChange(item.id, 'preventiveAction', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            itemErrors.includes('preventiveAction') ? 'border-red-300' : 'border-gray-300'
                          }`}
                          rows="3"
                          placeholder="Describe actions to prevent recurrence..."
                          disabled={item.status === 'Submitted' || item.status === 'Approved'}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Actions to prevent recurrence of the non-compliance
                        </p>
                      </div>

                      {/* Target Completion Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Completion Date *
                          {itemErrors.includes('targetCompletionDate') && (
                            <span className="text-red-500 ml-1">(Required)</span>
                          )}
                        </label>
                        <input
                          type="date"
                          value={item.capa.targetCompletionDate}
                          onChange={(e) => handleCapaChange(item.id, 'targetCompletionDate', e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                            itemErrors.includes('targetCompletionDate') ? 'border-red-300' : 'border-gray-300'
                          }`}
                          min={moment().format('YYYY-MM-DD')}
                          disabled={item.status === 'Submitted' || item.status === 'Approved'}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Set a realistic target date for completion
                        </p>
                      </div>

                      {/* Evidence Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supporting Evidence (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={(e) => handleFileUpload(item.id, e)}
                            className="hidden"
                            id={`evidence-upload-${item.id}`}
                            disabled={item.status === 'Submitted' || item.status === 'Approved'}
                          />
                          <label
                            htmlFor={`evidence-upload-${item.id}`}
                            className={`cursor-pointer inline-flex items-center px-4 py-3 rounded-lg transition-colors ${
                              item.status === 'Submitted' || item.status === 'Approved'
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                            }`}
                          >
                            <IconUpload className="w-5 h-5 mr-2" />
                            Upload Evidence (Max 5 files, JPG/PNG/PDF)
                          </label>
                          <p className="text-sm text-gray-500 mt-2">
                            Upload photos, documents, or other evidence
                          </p>
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles[item.id]?.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {uploadedFiles[item.id].map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <IconFileText className="w-5 h-5 text-gray-500" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {file.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => viewFile(file.url)}
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    title="View file"
                                  >
                                    <IconEye className="w-4 h-4" />
                                  </button>
                                  {item.status !== 'Submitted' && item.status !== 'Approved' && (
                                    <button
                                      onClick={() => removeFile(item.id, file.id)}
                                      className="p-1 text-red-600 hover:text-red-800"
                                      title="Remove file"
                                    >
                                      <IconTrash className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Comments (Optional)
                        </label>
                        <textarea
                          value={item.capa.comments}
                          onChange={(e) => handleCapaChange(item.id, 'comments', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows="2"
                          placeholder="Any additional comments or notes..."
                          disabled={item.status === 'Submitted' || item.status === 'Approved'}
                        />
                      </div>

                      {/* Last Updated */}
                      <div className="text-sm text-gray-500">
                        Last updated: {moment(item.updatedAt).format('DD MMM YYYY HH:mm')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4 md:-mx-6 mt-8 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isCapaComplete() ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {isCapaComplete() ? (
                    <span className="text-green-600 font-medium">All CAPA fields are complete</span>
                  ) : (
                    <span className="text-yellow-600 font-medium">Fill all mandatory CAPA fields to submit</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {nonComplianceItems.filter(item => item.status === 'Submitted' || item.status === 'Approved').length} of {nonComplianceItems.length} items submitted
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving || isSubmitting}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconSave className="w-4 h-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSubmitCapa}
                  disabled={!isCapaComplete() || isSubmitting || isSaving}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center ${
                    isCapaComplete() && !isSubmitting
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <IconSend className="w-4 h-4 mr-2" />
                      Submit CAPA
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapaManagement;