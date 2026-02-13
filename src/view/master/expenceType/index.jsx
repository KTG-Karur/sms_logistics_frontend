import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import FormLayout from '../../../util/formLayout';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import _ from 'lodash';
import { FormContainer } from './formContainer';
import IconUserPlus from '../../../components/Icon/IconUserPlus';

import { getExpenceType, createExpenceType, updateExpenceType, deleteExpenceType, resetExpenceTypeStatus } from '../../../redux/expenceTypeSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Expence Type');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

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
                originalData: item // Keep original data for reference
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
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    {_.includes(accessIds, '3') && (
                        <Tippy content="Edit">
                            <span className="text-success me-2 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                <IconPencil />
                            </span>
                        </Tippy>
                    )}
                    {_.includes(accessIds, '4') && (
                        <Tippy content="Delete">
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteExpenceType(row.original.id)}>
                                <IconTrashLines />
                            </span>
                        </Tippy>
                    )}
                </div>
            ),
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