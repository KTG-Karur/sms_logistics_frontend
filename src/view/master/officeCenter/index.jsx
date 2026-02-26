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

import { getOfficeCenters, createOfficeCenters, updateOfficeCenters, deleteOfficeCenters, resetOfficeCentersStatus } from '../../../redux/officeCenterSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Office Centers');

    const dispatch = useDispatch();

    const officeCentersState = useSelector((state) => state.OfficeCenterSlice || {});
    const {
        officeCentersData = [],
        loading = false,
        error = null,
        getOfficeCentersSuccess = false,
        createOfficeCentersSuccess = false,
        updateOfficeCentersSuccess = false,
        deleteOfficeCentersSuccess = false,
    } = officeCentersState;

    const [modal, setModal] = useState(false);
    const [state, setState] = useState({});
    const [formContain, setFormContain] = useState(FormContainer);
    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(setPageTitle('Office Centers Management'));
        fetchOfficeCenters();
    }, []);

    useEffect(() => {
        if (createOfficeCentersSuccess) {
            showMessage('success', 'Office Center created successfully');
            closeModel();
            fetchOfficeCenters();
            dispatch(resetOfficeCentersStatus());
        }

        if (updateOfficeCentersSuccess) {
            showMessage('success', 'Office Center updated successfully');
            closeModel();
            fetchOfficeCenters();
            dispatch(resetOfficeCentersStatus());
        }

        if (deleteOfficeCentersSuccess) {
            showMessage('success', 'Office Center deleted successfully');
            fetchOfficeCenters();
            dispatch(resetOfficeCentersStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetOfficeCentersStatus());
        }
    }, [createOfficeCentersSuccess, updateOfficeCentersSuccess, deleteOfficeCentersSuccess, error]);

    const fetchOfficeCenters = () => {
        dispatch(getOfficeCenters({}));
    };

    // Transform API data for the table
    const transformedOfficeCenters = officeCentersData.map((item, index) => ({
        id: item.id,
        office_center_name: item.officeCentersName,
        is_active: item.status,
        originalData: item // Keep original data for reference
    }));

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Office Center Name',
            accessor: 'office_center_name',
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
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteOfficeCenter(row.original.id)}>
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
            officeCenterName: data.office_center_name,
        });
        isEdit = true;
        setSelectedItem(data);
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!state.officeCenterName || state.officeCenterName.trim() === '') {
            showMessage('error', 'Please enter office center name');
            return;
        }

        // Check for duplicate office center name
        const duplicateOfficeCenter = transformedOfficeCenters.find(
            (officeCenter) => 
                officeCenter.office_center_name.toLowerCase() === state.officeCenterName.toLowerCase() && 
                officeCenter.id !== selectedItem.id
        );

        if (duplicateOfficeCenter) {
            showMessage('error', 'Office Center name already exists');
            return;
        }

        try {
            const requestData = {
                officeCenterName: state.officeCenterName.trim(),
            };

            if (isEdit) {
                dispatch(
                    updateOfficeCenters({
                        request: requestData,
                        officeCentersId: selectedItem.id,
                    })
                );
            } else {
                dispatch(createOfficeCenters(requestData));
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

    const handleDeleteOfficeCenter = (officeCenterId) => {
        showMessage('warning', 'Are you sure you want to delete this office center?', () => {
            dispatch(deleteOfficeCenters(officeCenterId));
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return transformedOfficeCenters.slice(startIndex, endIndex);
    };

    return (
        <div>
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Office Centers List'}
                    toggle={_.includes(accessIds, '2') ? createModel : false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={transformedOfficeCenters.length}
                    totalPages={Math.ceil(transformedOfficeCenters.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Office Center"
                    loading={loading}
                />
            </div>

            <ModelViewBox
                modal={modal}
                modelHeader={isEdit ? 'Edit Office Center' : 'Add Office Center'}
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