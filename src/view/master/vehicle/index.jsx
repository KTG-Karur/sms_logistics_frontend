import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage } from '../../../util/AllFunction';
import _ from 'lodash';
import Select from 'react-select';
import IconX from '../../../components/Icon/IconX';
import IconPlus from '../../../components/Icon/IconPlus';
import IconPencil from '../../../components/Icon/IconPencil';

const Vehicles = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Vehicle');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName; // for role Permission (1.superadmin)
    const dispatch = useDispatch();
    
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [state, setState] = useState({
        vehicleNumber: '',
        vehicleType: '',
        rcNumber: '',
        rcExpiryDate: '',
        rcFile: null,
        insuranceNumber: '',
        insuranceExpiryDate: '',
    });
    const [vehicleList, setVehicleList] = useState([]);
    const [errors, setErrors] = useState({});
    const [rcPreview, setRcPreview] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

    // Vehicle type options
    const vehicleTypeOptions = [
        { value: 'truck', label: 'Truck' },
        { value: 'mini_truck', label: 'Mini Truck' },
        { value: 'trailer', label: 'Trailer' },
        { value: 'container', label: 'Container' },
        { value: 'pickup', label: 'Pickup' },
        { value: 'tempo', label: 'Tempo' },
        { value: 'car', label: 'Car' },
        { value: 'bike', label: 'Bike' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        dispatch(setPageTitle('Vehicle Management'));
        fetchInitialData();
    }, []);

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(0);
    }, [vehicleList]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // await dispatch(getVehicles());
            // Mock data for now
            const mockData = [
                {
                    id: 1,
                    vehicleNumber: 'TN12AB1234',
                    vehicleType: 'truck',
                    vehicleTypeLabel: 'Truck',
                    rcNumber: 'RC123456789',
                    rcExpiryDate: '31-12-2024',
                    insuranceNumber: 'INS123456',
                    insuranceExpiryDate: '30-11-2024',
                },
                {
                    id: 2,
                    vehicleNumber: 'TN14CD5678',
                    vehicleType: 'mini_truck',
                    vehicleTypeLabel: 'Mini Truck',
                    rcNumber: 'RC987654321',
                    rcExpiryDate: '30-06-2025',
                    insuranceNumber: 'INS789012',
                    insuranceExpiryDate: '31-05-2025',
                }
            ];
            setVehicleList(mockData);
        } catch (error) {
            showMessage('error', 'Failed to load vehicle data');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Get paginated data
    const getPaginatedData = () => {
        const dataArray = vehicleList || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    // Get total count
    const getTotalCount = () => {
        return (vehicleList || []).length;
    };

    const validateForm = () => {
        const newErrors = {};
        if (!state.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
        if (!state.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
        if (!state.rcNumber) newErrors.rcNumber = 'RC number is required';
        if (!state.rcExpiryDate) newErrors.rcExpiryDate = 'RC expiry date is required';
        if (!state.rcFile && !isEdit) newErrors.rcFile = 'RC upload is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        formData.append('vehicleNumber', state.vehicleNumber);
        formData.append('vehicleType', state.vehicleType);
        formData.append('rcNumber', state.rcNumber);
        formData.append('rcExpiryDate', state.rcExpiryDate);
        formData.append('insuranceNumber', state.insuranceNumber || '');
        formData.append('insuranceExpiryDate', state.insuranceExpiryDate || '');
        
        if (state.rcFile) {
            formData.append('rcFile', state.rcFile);
        }

        try {
            if (isEdit) {
                // TODO: Replace with actual API call
                // await dispatch(updateVehicle({ vehicleId: selectedVehicle.id, request: formData }));
                showMessage('success', 'Vehicle updated successfully');
            } else {
                // TODO: Replace with actual API call
                // await dispatch(createVehicle(formData));
                showMessage('success', 'Vehicle added successfully');
            }
            
            // Reset form and refresh data
            onFormClear();
            fetchInitialData();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save vehicle data');
        }
    };

    const handleDeleteVehicle = (vehicle) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this vehicle?',
            () => {
                // TODO: Replace with actual API call
                // dispatch(deleteVehicle({ vehicleId: vehicle.id }));
                setVehicleList(prev => prev.filter(v => v.id !== vehicle.id));
                showMessage('success', 'Vehicle deleted successfully');
            },
            'Yes, delete it',
        );
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            const file = files[0];
            // Validate file type (only images)
            if (file && !file.type.startsWith('image/')) {
                showMessage('error', 'Please upload only image files (JPG, PNG, etc.)');
                return;
            }
            
            setState((prev) => ({
                ...prev,
                [name]: file,
            }));
            
            // Create preview for image
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setRcPreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setState((prev) => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    // Handle React Select change
    const handleSelectChange = (selectedOption, { name }) => {
        setState((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));
    };

    // Get selected value for React Select
    const getSelectedValue = (options, value) => {
        if (!value) return null;
        return options.find(option => option.value === value) || null;
    };

    // Handle RC file removal
    const handleRemoveRc = () => {
        setState(prev => ({
            ...prev,
            rcFile: null,
        }));
        setRcPreview(null);
    };

    const onFormClear = () => {
        setState({
            vehicleNumber: '',
            vehicleType: '',
            rcNumber: '',
            rcExpiryDate: '',
            rcFile: null,
            insuranceNumber: '',
            insuranceExpiryDate: '',
        });
        setSelectedVehicle(null);
        setIsEdit(false);
        setErrors({});
        setRcPreview(null);
        setShowForm(false);
    };

    const onEditForm = (vehicle) => {
        setState({
            vehicleNumber: vehicle.vehicleNumber || '',
            vehicleType: vehicle.vehicleType || '',
            rcNumber: vehicle.rcNumber || '',
            rcExpiryDate: vehicle.rcExpiryDate || '',
            rcFile: null,
            insuranceNumber: vehicle.insuranceNumber || '',
            insuranceExpiryDate: vehicle.insuranceExpiryDate || '',
        });
        setSelectedVehicle(vehicle);
        setIsEdit(true);
        setShowForm(true);
        
        // If editing and has RC image, set preview
        if (vehicle.rcImage) {
            setRcPreview(vehicle.rcImage);
        }
    };

    const openAddForm = () => {
        onFormClear();
        setShowForm(true);
        setIsEdit(false);
    };

    const columns = [
        { Header: 'S.No', accessor: 'id', Cell: (row) => <div>{row?.row?.index + 1}</div> },
        { Header: 'Vehicle Number', accessor: 'vehicleNumber' },
        { Header: 'Type', accessor: 'vehicleTypeLabel', Cell: ({ value }) => value || '-' },
        { Header: 'RC Number', accessor: 'rcNumber' },
        { 
            Header: 'RC Expiry', 
            accessor: 'rcExpiryDate',
            Cell: ({ value }) => value || '-'
        },
        { 
            Header: 'Insurance Expiry', 
            accessor: 'insuranceExpiryDate',
            Cell: ({ value }) => value || '-'
        },
        roleIdforRole === 'Super Admin'
            ? {
                  Header: 'Actions',
                  accessor: 'actions',
                  Cell: ({ row }) => (
                      <div className="flex space-x-2">
                          <Tippy content="Edit">
                              <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => onEditForm(row.original)}
                              >
                                  <IconPencil className="w-4 h-4" />
                              </button>
                          </Tippy>
                          <Tippy content="Delete">
                              <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteVehicle(row.original)}
                              >
                                  <IconTrashLines className="w-4 h-4" />
                              </button>
                          </Tippy>
                      </div>
                  ),
              }
            : null,
    ].filter(Boolean);

    // Helper function to find array object
    function findArrObj(arr, key, value) {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.filter(item => item[key] === value);
    }

    // Format date for display in DD-MM-YYYY format
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-')) {
            // If already in DD-MM-YYYY format, convert to YYYY-MM-DD for input field
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        return dateString;
    };

    // Convert input date from YYYY-MM-DD to DD-MM-YYYY
    const formatDateForStorage = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
    };

    // Handle date input change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setState(prev => ({
            ...prev,
            [name]: formatDateForStorage(value),
        }));
    };

    return (
        <div>
            {/* Vehicle Form - Above the Table (only shows when showForm is true) */}
            {showForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h5>
                        <button
                            type="button"
                            onClick={onFormClear}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Vehicle Number */}
                            <div>
                                <label>Vehicle Number Plate <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    name="vehicleNumber" 
                                    value={state.vehicleNumber} 
                                    onChange={handleChange} 
                                    placeholder="e.g., TN12AB1234" 
                                    className="form-input" 
                                />
                                {errors.vehicleNumber && <div className="text-danger text-sm mt-1">{errors.vehicleNumber}</div>}
                            </div>

                            {/* Vehicle Type */}
                            <div>
                                <label>Vehicle Type <span className="text-danger">*</span></label>
                                <Select
                                    name="vehicleType"
                                    options={vehicleTypeOptions}
                                    value={getSelectedValue(vehicleTypeOptions, state.vehicleType)}
                                    onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'vehicleType' })}
                                    placeholder="Select Vehicle Type"
                                    className="react-select"
                                    classNamePrefix="select"
                                />
                                {errors.vehicleType && <div className="text-danger text-sm mt-1">{errors.vehicleType}</div>}
                            </div>

                            {/* RC Number */}
                            <div>
                                <label>RC Number <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    name="rcNumber" 
                                    value={state.rcNumber} 
                                    onChange={handleChange} 
                                    placeholder="Enter RC Number" 
                                    className="form-input" 
                                />
                                {errors.rcNumber && <div className="text-danger text-sm mt-1">{errors.rcNumber}</div>}
                            </div>

                            {/* RC Expiry Date */}
                            <div>
                                <label>RC Expiry Date <span className="text-danger">*</span></label>
                                <input 
                                    type="date" 
                                    name="rcExpiryDate" 
                                    value={formatDateForInput(state.rcExpiryDate)} 
                                    onChange={handleDateChange} 
                                    className="form-input" 
                                />
                                <small className="text-gray-500">Format: DD-MM-YYYY</small>
                                {errors.rcExpiryDate && <div className="text-danger text-sm mt-1">{errors.rcExpiryDate}</div>}
                            </div>

                            {/* Insurance Number */}
                            <div>
                                <label>Insurance Number</label>
                                <input 
                                    type="text" 
                                    name="insuranceNumber" 
                                    value={state.insuranceNumber} 
                                    onChange={handleChange} 
                                    placeholder="Enter Insurance Number" 
                                    className="form-input" 
                                />
                            </div>

                            {/* Insurance Expiry Date */}
                            <div>
                                <label>Insurance Expiry Date</label>
                                <input 
                                    type="date" 
                                    name="insuranceExpiryDate" 
                                    value={formatDateForInput(state.insuranceExpiryDate)} 
                                    onChange={handleDateChange} 
                                    className="form-input" 
                                />
                                <small className="text-gray-500">Format: DD-MM-YYYY</small>
                            </div>

                            {/* RC Upload - Takes full width */}
                            <div className="lg:col-span-3">
                                <label>RC Upload <span className="text-danger">*</span></label>
                                <div className="mt-1">
                                    <input 
                                        type="file" 
                                        name="rcFile" 
                                        onChange={handleChange} 
                                        accept="image/*"
                                        className="form-input"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Upload RC image (JPG, PNG, GIF, WebP only)</p>
                                    {errors.rcFile && <div className="text-danger text-sm mt-1">{errors.rcFile}</div>}
                                </div>
                                
                                {/* RC Preview */}
                                {rcPreview && (
                                    <div className="mt-4 relative">
                                        <p className="text-sm font-medium mb-2">RC Preview:</p>
                                        <div className="relative inline-block">
                                            <img 
                                                src={rcPreview} 
                                                alt="RC Preview" 
                                                className="max-w-full h-auto max-h-48 rounded border object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveRc}
                                                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-red-700"
                                            >
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                type="button"
                                onClick={onFormClear}
                                className="btn btn-outline-secondary"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Vehicles Table */}
            <div className="panel">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        Title={'Vehicle List'}
                        toggle={roleIdforRole === 'Super Admin' ? openAddForm : false}
                        data={getPaginatedData()}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={getTotalCount()}
                        totalPages={Math.ceil(getTotalCount() / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        pagination={true}
                        isSearchable={true}
                        isSortable={true}
                    />
                )}
            </div>
        </div>
    );
};

export default Vehicles;