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

import { getDesignation, createDesignation, updateDesignation, deleteDesignation, resetDesignationStatus } from '../../../redux/designationSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Designation');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();

    const designationState = useSelector((state) => state.DesignationSlice || {});
    const {
        designationData = [],
        loading = false,
        error = null,
        getDesignationSuccess = false,
        createDesignationSuccess = false,
        updateDesignationSuccess = false,
        deleteDesignationSuccess = false,
    } = designationState;

    const [modal, setModal] = useState(false);
    const [state, setState] = useState({});
    const [formContain, setFormContain] = useState(FormContainer);
    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(setPageTitle('Designation Management'));
        fetchDesignations();
    }, []);

    useEffect(() => {
        if (createDesignationSuccess) {
            showMessage('success', 'Designation created successfully');
            closeModel();
            fetchDesignations(); 
            dispatch(resetDesignationStatus());
        }

        if (updateDesignationSuccess) {
            showMessage('success', 'Designation updated successfully');
            closeModel();
            fetchDesignations(); 
            dispatch(resetDesignationStatus());
        }

        if (deleteDesignationSuccess) {
            showMessage('success', 'Designation deleted successfully');
            fetchDesignations(); 
            dispatch(resetDesignationStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetDesignationStatus());
        }
    }, [createDesignationSuccess, updateDesignationSuccess, deleteDesignationSuccess, error]);

    const fetchDesignations = () => {
        dispatch(getDesignation({})); 
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Designation Name',
            accessor: 'designationName',
            sort: true,
        },
        {
            Header: 'Status',
            accessor: 'status',
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
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteDesignation(row.original.id)}>
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
            designationName: data.designationName,
        });
        isEdit = true;
        setSelectedItem(data);
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!state.designationName || state.designationName.trim() === '') {
            showMessage('error', 'Please enter designation name');
            return;
        }

        const duplicateDesignation = designationData.find((dept) => dept.designationName.toLowerCase() === state.designationName.toLowerCase() && dept.id !== selectedItem.id);

        if (duplicateDesignation) {
            showMessage('error', 'Designation name already exists');
            return;
        }

        try {
            const requestData = {
                designationName: state.designationName.trim(),
                status: 'Active',
            };

            if (isEdit) {
                dispatch(
                    updateDesignation({
                        request: requestData,
                        designationId: selectedItem.id,
                    })
                );
            } else {
                dispatch(createDesignation(requestData));
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

    const handleDeleteDesignation = (designationId) => {
        showMessage('warning', 'Are you sure you want to delete this designation?', () => {
            dispatch(deleteDesignation(designationId));
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return designationData.slice(startIndex, endIndex);
    };

    return (
        <div >
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Designation List'}
                    toggle={_.includes(accessIds, '2') ? createModel : false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={designationData.length}
                    totalPages={Math.ceil(designationData.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Designation"
                    loading={loading}
                />
            </div>

            <ModelViewBox
                modal={modal}
                modelHeader={isEdit?'Edit Designation':'Add Designation'}
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
