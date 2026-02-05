// src/pages/master/SupplierStandardsMaster.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import { showMessage } from '../../../util/AllFunction';

// Icons
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconPlus from '../../../components/Icon/IconPlus';
import IconShield from '../../../components/Icon/IconShield';
import IconClipboardList from '../../../components/Icon/IconChartBar';

const SupplierStandardsMaster = () => {
    const navigate = useNavigate();

    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('standards'); // 'standards' or 'assessments'

    // Standards state
    const [standards, setStandards] = useState([
        { id: 1, name: 'IWAY Standard 6.0' },
        { id: 2, name: 'BSCI Code of Conduct' },
        { id: 3, name: 'Sedex Members Ethical Trade Audit' },
        { id: 4, name: 'WRAP Certification' },
        { id: 5, name: 'ISO 9001:2015' },
        { id: 6, name: 'ISO 14001:2015'},
        { id: 7, name: 'OHSAS 18001'},
        { id: 8, name: 'SA8000:2014'},
    ]);

    // Assessment items state
    const [assessments, setAssessments] = useState([
        { id: 1, particulars: 'Factory has proper fire safety equipment', category: 'Safety' },
        { id: 2, particulars: 'Emergency exits are clearly marked and accessible', category: 'Safety' },
        { id: 3, particulars: 'First aid kits available and accessible', category: 'Safety' },
        { id: 4, particulars: 'All employees have proper PPE', category: 'Safety' },
        { id: 5, particulars: 'Factory maintains proper ventilation', category: 'Health' },
        { id: 6, particulars: 'Drinking water available for all employees', category: 'Health' },
        { id: 7, particulars: 'Clean and hygienic toilets available', category: 'Health' },
        { id: 8, particulars: 'No child labor employed', category: 'Labor' },
        { id: 9, particulars: 'No forced labor employed', category: 'Labor' },
        { id: 10, particulars: 'Minimum wage compliance', category: 'Labor' },
        { id: 11, particulars: 'Proper working hours maintained', category: 'Labor' },
        { id: 12, particulars: 'Overtime is voluntary and paid properly', category: 'Labor' },
        { id: 13, particulars: 'Anti-discrimination policy in place', category: 'Policy' },
        { id: 14, particulars: 'Grievance mechanism available', category: 'Policy' },
        { id: 15, particulars: 'Environmental compliance certificates', category: 'Environment' },
        { id: 16, particulars: 'Waste management system in place', category: 'Environment' },
    ]);

    const [formState, setFormState] = useState({
        name: '',
        particulars: '',
        category: '',
    });

    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    // Standards columns
    const standardsColumns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Standard Name',
            accessor: 'name',
            Cell: ({ value }) => <div className="font-medium">{value}</div>,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item, 'standards')} className="text-blue-600 hover:text-blue-900" title="Edit">
                            <IconPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item, 'standards')} className="text-red-600 hover:text-red-900" title="Delete">
                            <IconTrashLines className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
            width: 100,
        },
    ];

    // Assessment columns
    const assessmentColumns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Particulars',
            accessor: 'particulars',
            Cell: ({ value }) => <div className="font-medium">{value}</div>,
        },
        {
            Header: 'Category',
            accessor: 'category',
            Cell: ({ value }) => <span className="px-2 py-1 bg-gray-100 rounded text-xs">{value}</span>,
            width: 120,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item, 'assessments')} className="text-blue-600 hover:text-blue-900" title="Edit">
                            <IconPencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item, 'assessments')} className="text-red-600 hover:text-red-900" title="Delete">
                            <IconTrashLines className="w-4 h-4" />
                        </button>
                    </div>
                );
            },
            width: 100,
        },
    ];

    const closeModel = () => {
        setModal(false);
        setIsEdit(false);
        setFormState({
            name: '',
            version: '',
            description: '',
            particulars: '',
            category: '',
        });
        setSelectedItem(null);
        setErrors([]);
    };

    const openCreateModal = () => {
        setIsEdit(false);
        setFormState({
            name: '',
            version: '',
            description: '',
            particulars: '',
            category: '',
        });
        setSelectedItem(null);
        setErrors([]);
        setModal(true);
    };

    const handleEdit = (item, type) => {
        setIsEdit(true);
        setSelectedTab(type);
        setSelectedItem(item);

        if (type === 'standards') {
            setFormState({
                name: item.name,
                particulars: '',
                category: '',
            });
        } else {
            setFormState({
                name: '',
                particulars: item.particulars,
                category: item.category,
            });
        }

        setModal(true);
    };

    const handleDelete = (item, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type === 'standards' ? 'standard' : 'assessment item'}?`)) {
            if (type === 'standards') {
                setStandards((prev) => prev.filter((s) => s.id !== item.id));
                showMessage('success', 'Standard deleted successfully');
            } else {
                setAssessments((prev) => prev.filter((a) => a.id !== item.id));
                showMessage('success', 'Assessment item deleted successfully');
            }
        }
    };

    const validateForm = () => {
        const newErrors = [];

        if (selectedTab === 'standards') {
            if (!formState.name.trim()) newErrors.push('name');
        } else {
            if (!formState.particulars.trim()) newErrors.push('particulars');
            if (!formState.category.trim()) newErrors.push('category');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showMessage('error', 'Please fill all required fields');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            if (selectedTab === 'standards') {
                if (isEdit && selectedItem) {
                    setStandards((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, ...formState } : item)));
                    showMessage('success', 'Standard updated successfully');
                } else {
                    const newItem = {
                        id: Math.max(...standards.map((s) => s.id)) + 1,
                        name: formState.name,
                        description: formState.description,
                    };
                    setStandards((prev) => [...prev, newItem]);
                    showMessage('success', 'Standard created successfully');
                }
            } else {
                if (isEdit && selectedItem) {
                    setAssessments((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, ...formState } : item)));
                    showMessage('success', 'Assessment item updated successfully');
                } else {
                    const newItem = {
                        id: Math.max(...assessments.map((a) => a.id)) + 1,
                        particulars: formState.particulars,
                        category: formState.category,
                    };
                    setAssessments((prev) => [...prev, newItem]);
                    showMessage('success', 'Assessment item created successfully');
                }
            }

            setLoading(false);
            closeModel();
        }, 500);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors.includes(name)) {
            setErrors((prev) => prev.filter((error) => error !== name));
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Supplier Master Data</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setSelectedTab('standards')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            selectedTab === 'standards' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <IconShield className="w-4 h-4" />
                            Customer Standards
                        </div>
                    </button>
                    <button
                        onClick={() => setSelectedTab('assessments')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            selectedTab === 'assessments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <IconClipboardList className="w-4 h-4" />
                            Self Assessment Items
                        </div>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div>
                {selectedTab === 'standards' ? (
                    <div>
                        <Table
                            columns={standardsColumns}
                            Title="Customer Standards Master"
                            toggle={openCreateModal}
                            data={standards}
                            pagination={true}
                            pageSize={10}
                            isSearchable={true}
                            btnName="Add New Standard"
                            loadings={loading}
                        />
                    </div>
                ) : (
                    <div>
                        <Table
                            columns={assessmentColumns}
                            Title="Self Assessment Items Master"
                            toggle={openCreateModal}
                            data={assessments}
                            pagination={true}
                            pageSize={10}
                            isSearchable={true}
                            btnName="Add New Assessment Item"
                            loadings={loading}
                        />
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            <ModelViewBox
                key={isEdit ? `edit-${selectedTab}-${selectedItem?.id}` : `create-${selectedTab}`}
                modal={modal}
                modelHeader={isEdit ? `Edit ${selectedTab === 'standards' ? 'Standard' : 'Assessment Item'}` : `Add New ${selectedTab === 'standards' ? 'Standard' : 'Assessment Item'}`}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={handleSubmit}
                modelSize="md"
                submitBtnText={isEdit ? 'Update' : 'Create'}
                loadings={loading}
            >
                <div className="space-y-4">
                    {selectedTab === 'standards' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Standard Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., IWAY Standard 6.0"
                                />
                                {errors.includes('name') && <p className="text-red-500 text-sm mt-1">Standard name is required</p>}
                            </div>

                            
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Particulars <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="particulars"
                                    value={formState.particulars}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="e.g., Factory has proper fire safety equipment"
                                />
                                {errors.includes('particulars') && <p className="text-red-500 text-sm mt-1">Particulars are required</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formState.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Safety">Safety</option>
                                    <option value="Health">Health</option>
                                    <option value="Labor">Labor</option>
                                    <option value="Policy">Policy</option>
                                    <option value="Environment">Environment</option>
                                    <option value="Quality">Quality</option>
                                </select>
                                {errors.includes('category') && <p className="text-red-500 text-sm mt-1">Category is required</p>}
                            </div>
                        </>
                    )}
                </div>
            </ModelViewBox>
        </div>
    );
};

export default SupplierStandardsMaster;
