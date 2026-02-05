import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconPlus from '../../../components/Icon/IconPlus';
import IconChevronUp from '../../../components/Icon/IconChevronUp';
import IconChevronDown from '../../../components/Icon/IconChevronDown';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
import IconCheck from '../../../components/Icon/IconX';
import IconFile from '../../../components/Icon/IconFile';
import IconCamera from '../../../components/Icon/IconPlus';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import { showMessage } from '../../../util/AllFunction';

const SubChecklistAudit = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [itemState, setItemState] = useState({
        checklistId: '',
        name: '',
        order: 0,
        hasOptions: false,
        hasDescription: false,
        hasImage: false,
    });
    const [checklists, setChecklists] = useState([]);
    const [checklist, setChecklist] = useState(null);
    const [errors, setErrors] = useState([]);
    const [selectedCheckItem, setSelectedCheckItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const columns = [
        {
            Header: 'Order',
            accessor: 'order',
            width: 100,
            Cell: ({ row }) => {
                const item = row.original;
                const items = checklist.checkItems || [];
                const isFirstItem = item.order === 1;
                const isLastItem = item.order === items.length;

                return (
                    <div className="flex items-center space-x-2">
                        <span className="font-bold">{item.order}</span>
                        <div className="flex flex-col">
                            <button onClick={() => moveItemUp(item.id)} className={`text-gray-500 hover:text-blue-600 ${isFirstItem ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={isFirstItem}>
                                <IconChevronUp className="w-4 h-4" />
                            </button>
                            <button onClick={() => moveItemDown(item.id)} className={`text-gray-500 hover:text-blue-600 ${isLastItem ? 'opacity-30 cursor-not-allowed' : ''}`} disabled={isLastItem}>
                                <IconChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: 'Check Item Name',
            accessor: 'name',
            sort: true,
            Cell: ({ value }) => <div className="font-medium text-gray-800">{value}</div>,
        },
        {
            Header: 'Configuration',
            accessor: 'config',
            Cell: ({ row }) => {
                const item = row.original;
                return renderItemIndicators(item);
            },
            width: 200,
        },
        {
            Header: 'Status',
            accessor: 'isActive',
            Cell: ({ value }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{value === 1 ? 'Active' : 'Inactive'}</span>
            ),
            width: 100,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const item = row.original;
                const isActive = item.isActive === 1;

                return (
                    <div className="flex items-center space-x-2">
                        {isActive ? (
                            <>
                                <Tippy content="Edit">
                                    <button onClick={() => onEditForm(item)} className="text-success hover:text-success-dark">
                                        <IconPencil className="w-4 h-4" />
                                    </button>
                                </Tippy>
                                <Tippy content="Delete">
                                    <button onClick={() => handleDeleteCheckItem(item)} className="text-danger hover:text-danger-dark">
                                        <IconTrashLines className="w-4 h-4" />
                                    </button>
                                </Tippy>
                            </>
                        ) : (
                            <Tippy content="Restore">
                                <button onClick={() => handleRestoreCheckItem(item)} className="text-warning hover:text-warning-dark font-bold">
                                    ↶
                                </button>
                            </Tippy>
                        )}
                    </div>
                );
            },
            width: 100,
        },
    ];
    useEffect(() => {
        if (location.state?.checklist && location.state?.checklists) {
            setChecklist(location.state.checklist);
            setChecklists(location.state.checklists);
        } else {
            navigate('/master/checklist-audit');
        }
    }, [location.state, navigate]);

    const closeModel = () => {
        setIsEdit(false);
        onFormClear();
        setModal(false);
    };

    const onFormClear = () => {
        setItemState({
            checklistId: checklist?.id || '',
            name: '',
            order: 0,
            hasOptions: false,
            hasDescription: false,
            hasImage: false,
        });
        setSelectedCheckItem(null);
        setErrors([]);
    };

    const createModel = () => {
        onFormClear();
        setIsEdit(false);

        const maxItemOrder = checklist?.checkItems?.length > 0 ? Math.max(...checklist.checkItems.map((i) => i.order)) : 0;

        setItemState({
            checklistId: checklist?.id || '',
            name: '',
            order: maxItemOrder + 1,
            hasOptions: false,
            hasDescription: false,
            hasImage: false,
        });
        setModal(true);
        setErrors([]);
    };

    const onEditForm = (item) => {
        setItemState({
            checklistId: checklist?.id || '',
            name: item.name || '',
            order: item.order || 0,
            hasOptions: item.hasOptions || false,
            hasDescription: item.hasDescription || false,
            hasImage: item.hasImage || false,
        });
        setIsEdit(true);
        setSelectedCheckItem(item);
        setModal(true);
        setErrors([]);
    };

    const validateForm = () => {
        const newErrors = [];
        if (!itemState.name?.trim()) newErrors.push('name');
        if (!itemState.order || itemState.order < 1) newErrors.push('order');

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) {
            showMessage('error', 'Please fill all required fields correctly');
            return;
        }

        try {
            if (!checklist) {
                showMessage('error', 'Checklist not found');
                return;
            }

            const checklistIndex = checklists.findIndex((c) => c.id === checklist.id);
            if (checklistIndex === -1) {
                showMessage('error', 'Checklist not found');
                return;
            }

            const updatedChecklists = [...checklists];

            if (isEdit && selectedCheckItem) {
                const updatedItem = {
                    ...selectedCheckItem,
                    name: itemState.name.trim(),
                    order: itemState.order,
                    hasOptions: itemState.hasOptions,
                    hasDescription: itemState.hasDescription,
                    hasImage: itemState.hasImage,
                };

                if (itemState.hasOptions) {
                    updatedItem.options = [
                        { id: 1, label: 'Yes', value: 'yes' },
                        { id: 2, label: 'No', value: 'no' },
                        { id: 3, label: 'Not Applicable', value: 'na' },
                    ];
                } else {
                    delete updatedItem.options;
                }

                updatedChecklists[checklistIndex].checkItems = updatedChecklists[checklistIndex].checkItems.map((item) => (item.id === selectedCheckItem.id ? updatedItem : item));

                showMessage('success', 'Check item updated successfully');
            } else {
                const newCheckItem = {
                    id: Date.now(),
                    checklistId: checklist.id,
                    name: itemState.name.trim(),
                    order: itemState.order,
                    isActive: 1,
                    hasOptions: itemState.hasOptions,
                    hasDescription: itemState.hasDescription,
                    hasImage: itemState.hasImage,
                };

                if (itemState.hasOptions) {
                    newCheckItem.options = [
                        { id: 1, label: 'Yes', value: 'yes' },
                        { id: 2, label: 'No', value: 'no' },
                        { id: 3, label: 'Not Applicable', value: 'na' },
                    ];
                }

                updatedChecklists[checklistIndex].checkItems = [...(updatedChecklists[checklistIndex].checkItems || []), newCheckItem];
                showMessage('success', 'Check item created successfully');
            }

            updatedChecklists[checklistIndex].checkItems.sort((a, b) => a.order - b.order);
            setChecklists(updatedChecklists);
            setChecklist(updatedChecklists[checklistIndex]);

            closeModel();
        } catch (error) {
            showMessage('error', 'Failed to save check item');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setItemState((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors.includes(name)) {
            setErrors((prev) => prev.filter((error) => error !== name));
        }
    };

    const handleDeleteCheckItem = (item) => {
        showMessage('warning', 'Are you sure you want to delete this check item?', () => {
            const checklistIndex = checklists.findIndex((c) => c.id === checklist.id);
            if (checklistIndex === -1) return;

            const updatedChecklists = [...checklists];
            updatedChecklists[checklistIndex].checkItems = updatedChecklists[checklistIndex].checkItems.filter((i) => i.id !== item.id).map((item, index) => ({ ...item, order: index + 1 }));

            setChecklists(updatedChecklists);
            setChecklist(updatedChecklists[checklistIndex]);

            showMessage('success', 'Check item deleted successfully');
        });
    };

    const moveItemUp = (itemId) => {
        if (!checklist) return;

        const itemIndex = checklist.checkItems.findIndex((i) => i.id === itemId);
        if (itemIndex <= 0) return;

        const updatedChecklists = [...checklists];
        const checklistIndex = updatedChecklists.findIndex((c) => c.id === checklist.id);
        if (checklistIndex === -1) return;

        const items = [...updatedChecklists[checklistIndex].checkItems];
        const temp = items[itemIndex];
        items[itemIndex] = items[itemIndex - 1];
        items[itemIndex - 1] = temp;

        items.forEach((item, idx) => {
            item.order = idx + 1;
        });

        updatedChecklists[checklistIndex].checkItems = items;
        setChecklists(updatedChecklists);
        setChecklist(updatedChecklists[checklistIndex]);
    };

    const moveItemDown = (itemId) => {
        if (!checklist) return;

        const itemIndex = checklist.checkItems.findIndex((i) => i.id === itemId);
        if (itemIndex >= checklist.checkItems.length - 1) return;

        const updatedChecklists = [...checklists];
        const checklistIndex = updatedChecklists.findIndex((c) => c.id === checklist.id);
        if (checklistIndex === -1) return;

        const items = [...updatedChecklists[checklistIndex].checkItems];
        const temp = items[itemIndex];
        items[itemIndex] = items[itemIndex + 1];
        items[itemIndex + 1] = temp;

        items.forEach((item, idx) => {
            item.order = idx + 1;
        });

        updatedChecklists[checklistIndex].checkItems = items;
        setChecklists(updatedChecklists);
        setChecklist(updatedChecklists[checklistIndex]);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const items = checklist?.checkItems || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return items.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return checklist?.checkItems?.length || 0;
    };

    const renderItemIndicators = (item) => {
        const indicators = [];

        if (item.hasOptions) {
            indicators.push(
                <Tippy key="options" content="Has Yes/No/NA options">
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        <IconCheck className="w-3 h-3" />
                        <span>Options</span>
                    </div>
                </Tippy>,
            );
        }

        if (item.hasDescription) {
            indicators.push(
                <Tippy key="desc" content="Requires description">
                    <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        <IconFile className="w-3 h-3" />
                        <span>Desc</span>
                    </div>
                </Tippy>,
            );
        }

        if (item.hasImage) {
            indicators.push(
                <Tippy key="image" content="Requires image upload">
                    <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        <IconCamera className="w-3 h-3" />
                        <span>Image</span>
                    </div>
                </Tippy>,
            );
        }

        return <div className="flex items-center space-x-1">{indicators}</div>;
    };

    const handleBack = () => {
        // Navigate back to main page with updated checklists
        navigate('/master/checklist-audit', {
            state: { checklists: checklists },
        });
    };

    if (!checklist) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-gray-500">No checklist selected</div>
                    <button onClick={handleBack} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{checklist.title}</h1>
                        <p className="text-gray-600">
                            Checklist ID: {checklist.id} | Order: {checklist.order} | Items: {checklist.checkItems?.length || 0}
                        </p>
                    </div>
                </div>
                <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-900">
                        <IconArrowLeft className="w-5 h-5 mr-2" />
                        Back to Checklists
                    </button>
            </div>

            <div>
                <Table
                    columns={columns}
                    Title={'Check Items'}
                    toggle={createModel}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Check Item"
                    loadings={loading}
                />
            </div>

            <ModelViewBox
                key={isEdit ? `edit-item-${selectedCheckItem?.id}` : 'create-item'}
                modal={modal}
                modelHeader={isEdit ? 'Edit Check Item' : 'Add Check Item'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="md"
                submitBtnText={isEdit ? 'Update' : 'Create'}
                loadings={loading}
            >
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                            <p className="font-medium">
                                {checklist.order}. {checklist.title}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check Item Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" name="name" value={itemState.name} onChange={handleInputChange} placeholder="Enter check item name" className="form-input w-full" />
                        {errors.includes('name') && <div className="text-danger text-sm mt-1">* Please enter check item name</div>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Order Number <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-500 ml-2">(Determines display sequence within checklist)</span>
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-blue-600">{itemState.order}</p>
                                </div>
                            </div>
                        </div>
                        {errors.includes('order') && <div className="text-danger text-sm mt-1">* Please enter a valid order number</div>}
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-3">Check Item Configuration</h4>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Include Yes/No/Not Applicable Options</label>
                                    <p className="text-sm text-gray-500">When checked, users must select one of these options</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="hasOptions" checked={itemState.hasOptions} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Require Description Field</label>
                                    <p className="text-sm text-gray-500">When checked, users must enter a description when filling the form</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="hasDescription" checked={itemState.hasDescription} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">Require Image Upload</label>
                                    <p className="text-sm text-gray-500">When checked, users must upload an image when selecting "Yes"</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="hasImage" checked={itemState.hasImage} onChange={handleInputChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {itemState.hasOptions && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h5 className="font-medium text-blue-800 mb-2">Preview of Options:</h5>
                                    <div className="flex space-x-3">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                            <span className="text-sm text-gray-700">Yes</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                            <span className="text-sm text-gray-700">No</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                                            <span className="text-sm text-gray-700">Not Applicable</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">Users will be required to select one of these options in the form</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </ModelViewBox>
        </div>
    );
};

export default SubChecklistAudit;
