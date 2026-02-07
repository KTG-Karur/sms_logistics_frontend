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

import { getVehicleType, createVehicleType, updateVehicleType, deleteVehicleType, resetVehicleTypeStatus } from '../../../redux/vehicleTypeSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Vehicle Type');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();

    const vehicleTypeState = useSelector((state) => state.VehicleTypeSlice || {});
    const {
        vehicleTypeData = [],
        loading = false,
        error = null,
        getVehicleTypeSuccess = false,
        createVehicleTypeSuccess = false,
        updateVehicleTypeSuccess = false,
        deleteVehicleTypeSuccess = false,
    } = vehicleTypeState;

    const [modal, setModal] = useState(false);
    const [state, setState] = useState({});
    const [formContain, setFormContain] = useState(FormContainer);
    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(setPageTitle('VehicleType Management'));
        fetchVehicleTypes();
    }, []);

    useEffect(() => {
        if (createVehicleTypeSuccess) {
            showMessage('success', 'VehicleType created successfully');
            closeModel();
            fetchVehicleTypes(); 
            dispatch(resetVehicleTypeStatus());
        }

        if (updateVehicleTypeSuccess) {
            showMessage('success', 'VehicleType updated successfully');
            closeModel();
            fetchVehicleTypes(); 
            dispatch(resetVehicleTypeStatus());
        }

        if (deleteVehicleTypeSuccess) {
            showMessage('success', 'VehicleType deleted successfully');
            fetchVehicleTypes(); 
            dispatch(resetVehicleTypeStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetVehicleTypeStatus());
        }
    }, [createVehicleTypeSuccess, updateVehicleTypeSuccess, deleteVehicleTypeSuccess, error]);

    const fetchVehicleTypes = () => {
        dispatch(getVehicleType({})); 
    };

    // Transform API data for the table
    const transformedVehicleTypes = vehicleTypeData.map((item, index) => ({
        id: item.vehicle_type_id,
        vehicle_type_name: item.vehicle_type_name,
        is_active: item.is_active ? 'Active' : 'Inactive',
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
            Header: 'VehicleType Name',
            accessor: 'vehicle_type_name',
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
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteVehicleType(row.original.id)}>
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
            vehicleTypeName: data.vehicle_type_name,
        });
        isEdit = true;
        setSelectedItem(data);
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!state.vehicleTypeName || state.vehicleTypeName.trim() === '') {
            showMessage('error', 'Please enter vehicleType name');
            return;
        }

        // Check for duplicate vehicle type name
        const duplicateVehicleType = transformedVehicleTypes.find(
            (vehicleType) => 
                vehicleType.vehicle_type_name.toLowerCase() === state.vehicleTypeName.toLowerCase() && 
                vehicleType.id !== selectedItem.id
        );

        if (duplicateVehicleType) {
            showMessage('error', 'VehicleType name already exists');
            return;
        }

        try {
            const requestData = {
                vehicleTypeName: state.vehicleTypeName.trim(),
            };

            if (isEdit) {
                dispatch(
                    updateVehicleType({
                        request: requestData,
                        vehicleTypeId: selectedItem.id,
                    })
                );
            } else {
                dispatch(createVehicleType(requestData));
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

    const handleDeleteVehicleType = (vehicleTypeId) => {
        showMessage('warning', 'Are you sure you want to delete this vehicleType?', () => {
            dispatch(deleteVehicleType(vehicleTypeId));
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return transformedVehicleTypes.slice(startIndex, endIndex);
    };

    return (
        <div >
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Vehicle Type List'}
                    toggle={_.includes(accessIds, '2') ? createModel : false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={transformedVehicleTypes.length}
                    totalPages={Math.ceil(transformedVehicleTypes.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Vehicle Type"
                    loading={loading}
                />
            </div>

            <ModelViewBox
                modal={modal}
                modelHeader={isEdit?'Edit Vehicle Type':'Add Vehicle Type'}
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