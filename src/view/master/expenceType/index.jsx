import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import FormLayout from '../../../util/formLayout';
import { findArrObj, showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';
import _ from 'lodash';
import { FormContainer } from './formContainer';
import IconUserPlus from '../../../components/Icon/IconUserPlus';

import { getExpenceType, createExpenceType, updateExpenceType, deleteExpenceType, resetExpenceTypeStatus } from '../../../redux/expenceTypeSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds =  getAccessIdsByLabel(localData?.pagePermission || [], 'Expence Type');

    const dispatch = useDispatch();

    const expenceTypeState = useSelector((state) => state.ExpenceTypeSlice || {});
    const {
        expenceTypeData = [],
        loading = false,
        error = null,
        getExpenceTypeSuccess = false,
        createExpenceTypeSuccess = false,
        updateExpenceTypeSuccess = false,
        deleteExpenceTypeSuccess = false,
    } = expenceTypeState;

    const [modal, setModal] = useState(false);
    const [state, setState] = useState({});
    const [formContain, setFormContain] = useState(FormContainer);
    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [transformedExpenceTypes, setTransformedExpenceTypes] = useState([]);

    // List of protected expense type names that cannot be edited or deleted
    const PROTECTED_EXPENSE_TYPES = ['Loadman Salary', 'Salary'];

    useEffect(() => {
        dispatch(setPageTitle('ExpenceType Management'));
        fetchExpenceTypes();
    }, []);

    useEffect(() => {
        // Transform API data for the table whenever expenceTypeData changes
        if (expenceTypeData && expenceTypeData.length > 0) {
            const transformed = expenceTypeData.map((item, index) => ({
                id: item.expenceTypeId, // Note: camelCase from API response
                expence_type_name: item.expenceTypeName, // Convert to snake_case for table display
                is_active: item.isActive === 1 ? 'Active' : 'Inactive',
                originalData: item, // Keep original data for reference
                isProtected: PROTECTED_EXPENSE_TYPES.includes(item.expenceTypeName) // Flag for protected items
            }));
            setTransformedExpenceTypes(transformed);
        } else {
            setTransformedExpenceTypes([]);
        }
    }, [expenceTypeData]);

    useEffect(() => {
        if (createExpenceTypeSuccess) {
            showMessage('success', 'ExpenceType created successfully');
            closeModel();
            fetchExpenceTypes(); 
            dispatch(resetExpenceTypeStatus());
        }

        if (updateExpenceTypeSuccess) {
            showMessage('success', 'ExpenceType updated successfully');
            closeModel();
            fetchExpenceTypes(); 
            dispatch(resetExpenceTypeStatus());
        }

        if (deleteExpenceTypeSuccess) {
            showMessage('success', 'ExpenceType deleted successfully');
            fetchExpenceTypes(); 
            dispatch(resetExpenceTypeStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetExpenceTypeStatus());
        }
    }, [createExpenceTypeSuccess, updateExpenceTypeSuccess, deleteExpenceTypeSuccess, error]);

    const fetchExpenceTypes = () => {
        dispatch(getExpenceType({})); 
    };

    // Check if expense type is protected (cannot be edited/deleted)
    const isProtectedExpenseType = (expenseTypeName) => {
        return PROTECTED_EXPENSE_TYPES.includes(expenseTypeName);
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'sno',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Expence Type Name',
            accessor: 'expence_type_name',
            sort: true,
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <span>{value}</span>
                    {isProtectedExpenseType(value) && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">
                            Protected
                        </span>
                    )}
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'is_active',
            Cell: ({ value }) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        value === 'Active' ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg' : 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg'
                    }`}
                >
                    {value}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const isProtected = isProtectedExpenseType(row.original.expence_type_name);
                
                return (
                    <div className="flex items-center space-x-2">
                        {_.includes(accessIds, '3') && !isProtected && (
                            <Tippy content="Edit">
                                <span className="text-success me-2 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                    <IconPencil />
                                </span>
                            </Tippy>
                        )}
                        {_.includes(accessIds, '4') && !isProtected && (
                            <Tippy content="Delete">
                                <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteExpenceType(row.original.id)}>
                                    <IconTrashLines />
                                </span>
                            </Tippy>
                        )}
                        {isProtected && (
                            <Tippy content="This is a protected expense type and cannot be modified">
                                <span className="text-gray-400 cursor-not-allowed">
                                    <IconPencil className="opacity-30" />
                                    <IconTrashLines className="opacity-30 ml-2" />
                                </span>
                            </Tippy>
                        )}
                    </div>
                );
            },
            width: 120,
        },
    ];

    const closeModel = () => {
        setModal(false);
        isEdit = false;
        onFormClear();
    };

    const onFormClear = () => {
        setSelectedItem({});
        setErrors([]);
        setSelectedIndex(null);
        setState({});
    };

    const createModel = () => {
        onFormClear();
        isEdit = false;
        setModal(true);
    };

    const onEditForm = (data) => {
        // Prevent editing of protected expense types
        if (isProtectedExpenseType(data.expence_type_name)) {
            showMessage('warning', 'This expense type is protected and cannot be edited');
            return;
        }

        setState({
            expenceTypeName: data.expence_type_name, // Use the transformed field name
        });
        isEdit = true;
        setSelectedItem(data);
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!state.expenceTypeName || state.expenceTypeName.trim() === '') {
            showMessage('error', 'Please enter expenceType name');
            return;
        }

        // Prevent creating duplicate protected names
        if (PROTECTED_EXPENSE_TYPES.includes(state.expenceTypeName.trim())) {
            showMessage('error', `"${state.expenceTypeName}" is a protected name and cannot be used`);
            return;
        }

        // Check for duplicate expence type name
        const duplicateExpenceType = transformedExpenceTypes.find(
            (expenceType) => 
                expenceType.expence_type_name && 
                expenceType.expence_type_name.toLowerCase() === state.expenceTypeName.toLowerCase() && 
                expenceType.id !== selectedItem.id
        );

        if (duplicateExpenceType) {
            showMessage('error', 'ExpenceType name already exists');
            return;
        }

        // Check if trying to update a protected expense type
        if (isEdit && selectedItem && isProtectedExpenseType(selectedItem.expence_type_name)) {
            showMessage('warning', 'This expense type is protected and cannot be modified');
            closeModel();
            return;
        }

        try {
            const requestData = {
                expenceTypeName: state.expenceTypeName.trim(),
            };

            if (isEdit) {
                dispatch(
                    updateExpenceType({
                        request: requestData,
                        expenceTypeId: selectedItem.id,
                    })
                );
            } else {
                dispatch(createExpenceType(requestData));
            }
        } catch (error) {
            showMessage('error', 'Failed to save data');
        }
    };

    const handleInputChange = (e, name) => {
        const value = e.target.value;
        setState((prev) => ({ ...prev, [name]: value }));

        if (errors.length > 0) {
            setErrors(errors.filter((error) => error.field !== name));
        }
    };

    const handleDeleteExpenceType = (expenceTypeId) => {
        // Find the expense type to check if it's protected
        const expenseType = transformedExpenceTypes.find(et => et.id === expenceTypeId);
        
        if (expenseType && isProtectedExpenseType(expenseType.expence_type_name)) {
            showMessage('warning', 'This expense type is protected and cannot be deleted');
            return;
        }

        showMessage('warning', 'Are you sure you want to delete this expenceType?', () => {
            dispatch(deleteExpenceType(expenceTypeId));
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        if (!transformedExpenceTypes || transformedExpenceTypes.length === 0) {
            return [];
        }
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return transformedExpenceTypes.slice(startIndex, endIndex);
    };

    return (
        <div >
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Expence Type List'}
                    toggle={_.includes(accessIds, '2') ? createModel : false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={transformedExpenceTypes.length}
                    totalPages={Math.ceil(transformedExpenceTypes.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Expence Type"
                    loading={loading}
                />
                
                {/* Debug info - remove after fixing */}
                {transformedExpenceTypes.length === 0 && expenceTypeData.length > 0 && (
                    <div className="p-4 mt-4 bg-yellow-100 border border-yellow-400 rounded">
                        <p className="text-yellow-700">
                            Debug: Data received but not transformed. Raw data: {JSON.stringify(expenceTypeData)}
                        </p>
                    </div>
                )}
                
                {!loading && transformedExpenceTypes.length === 0 && expenceTypeData.length === 0 && (
                    <div className="p-4 mt-4 bg-blue-100 border border-blue-400 rounded">
                        <p className="text-blue-700">No expence types found. Click "Add Expence Type" to create one.</p>
                    </div>
                )}
            </div>

            <ModelViewBox
                modal={modal}
                modelHeader={isEdit?'Edit Expence Type':'Add Expence Type'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="sm"
                submitBtnText={isEdit ? 'Update' : 'Create'}
                loading={loading}
            >
                <FormLayout
                    dynamicForm={formContain}
                    handleSubmit={onFormSubmit}
                    setState={setState}
                    state={state}
                    onChangeCallBack={{
                        handleInputChange: handleInputChange,
                    }}
                    errors={errors}
                    setErrors={setErrors}
                    loading={loading}
                />
            </ModelViewBox>
        </div>
    );
};

export default Index;