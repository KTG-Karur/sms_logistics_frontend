import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';
import _ from 'lodash';
import Select from 'react-select';
import IconX from '../../../components/Icon/IconX';
import IconPlus from '../../../components/Icon/IconPlus';
import IconPencil from '../../../components/Icon/IconPencil';
import IconSearch from '../../../components/Icon/IconSearch';
import IconFilter from '../../../components/Icon/IconSearch';
import { getVehicles, createVehicles, updateVehicles, deleteVehicles } from '../../../redux/vehiclesSlice';
import { getVehicleType } from '../../../redux/vehicleTypeSlice';

const Vehicles = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Vehicle');
    const accessIds =  getAccessIdsByLabel(localData?.pagePermission || [], 'Vehicle');
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();

    // Get vehicles state from Redux - Updated selector
    const vehiclesState = useSelector((state) => state.VehiclesSlice || {});
    const { vehiclesData = [], loading = false, error = null } = vehiclesState;

    // Get vehicle types from Redux
    const vehicleTypeState = useSelector((state) => state.VehicleTypeSlice || {});
    const { vehicleTypeData = [] } = vehicleTypeState;

    const [showForm, setShowForm] = useState(false);
    const [state, setState] = useState({
        vehicleNumberPlate: '',
        vehicleTypeId: '',
        rcNumber: '',
        rcExpiryDate: '',
        rcFile: null,
        insuranceNumber: '',
        insuranceExpiryDate: '',
    });
    const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
    const [errors, setErrors] = useState({});
    const [rcPreview, setRcPreview] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        vehicleNumberPlate: '',
        rcNumber: '',
        vehicleTypeId: '',
    });

    useEffect(() => {
        dispatch(setPageTitle('Vehicle Management'));
        fetchVehicleTypes();
        fetchVehicles();
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [filters]);

    useEffect(() => {
        // Convert vehicle type data to options when it changes
        if (vehicleTypeData && vehicleTypeData.length > 0) {
            const options = vehicleTypeData
                .filter((type) => type.is_active) // Only active vehicle types
                .map((type) => ({
                    value: type.vehicle_type_id,
                    label: type.vehicle_type_name,
                }));
            setVehicleTypeOptions(options);
        }
    }, [vehicleTypeData]);

    const fetchVehicleTypes = async () => {
        try {
            await dispatch(getVehicleType({})).unwrap();
        } catch (error) {
            console.error('Error fetching vehicle types:', error);
            showMessage('error', 'Failed to load vehicle types');

            // Fallback to mock data if API fails
            const mockVehicleTypes = [
                { vehicle_type_id: '1', vehicle_type_name: 'Truck', is_active: true },
                { vehicle_type_id: '2', vehicle_type_name: 'Mini Truck', is_active: true },
                { vehicle_type_id: '3', vehicle_type_name: 'Trailer', is_active: true },
                { vehicle_type_id: '4', vehicle_type_name: 'Container', is_active: true },
                { vehicle_type_id: '5', vehicle_type_name: 'Pickup', is_active: true },
                { vehicle_type_id: '6', vehicle_type_name: 'Tempo', is_active: true },
                { vehicle_type_id: '7', vehicle_type_name: 'Car', is_active: true },
                { vehicle_type_id: '8', vehicle_type_name: 'Bike', is_active: true },
                { vehicle_type_id: '9', vehicle_type_name: 'Other', is_active: true },
            ];
            const options = mockVehicleTypes.map((type) => ({
                value: type.vehicle_type_id,
                label: type.vehicle_type_name,
            }));
            setVehicleTypeOptions(options);
        }
    };

    const fetchVehicles = async () => {
        try {
            // Apply filters
            const filterParams = {};
            if (filters.vehicleNumberPlate) filterParams.vehicleNumberPlate = filters.vehicleNumberPlate;
            if (filters.rcNumber) filterParams.rcNumber = filters.rcNumber;
            if (filters.vehicleTypeId) filterParams.vehicleTypeId = filters.vehicleTypeId;

            await dispatch(getVehicles(filterParams)).unwrap();
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            showMessage('error', error.message || 'Failed to load vehicles');
        }
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Get paginated data
    const getPaginatedData = () => {
        const dataArray = vehiclesData || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return (vehiclesData || []).length;
    };

    const validateForm = () => {
        const newErrors = {};
        if (!state.vehicleNumberPlate.trim()) newErrors.vehicleNumberPlate = 'Vehicle number is required';
        if (!state.vehicleTypeId) newErrors.vehicleTypeId = 'Vehicle type is required';
        if (!state.rcNumber.trim()) newErrors.rcNumber = 'RC number is required';
        if (!state.rcExpiryDate) newErrors.rcExpiryDate = 'RC expiry date is required';
        if (!state.rcFile && !isEdit) newErrors.rcFile = 'RC document is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        formData.append('vehicleNumberPlate', state.vehicleNumberPlate.trim());
        formData.append('vehicleTypeId', state.vehicleTypeId);
        formData.append('rcNumber', state.rcNumber.trim());
        formData.append('rcExpiryDate', formatDateForAPI(state.rcExpiryDate));

        if (state.insuranceNumber.trim()) {
            formData.append('insuranceNumber', state.insuranceNumber.trim());
        }
        if (state.insuranceExpiryDate) {
            formData.append('insuranceExpiryDate', formatDateForAPI(state.insuranceExpiryDate));
        }

        if (state.rcFile) {
            formData.append('rcDocument', state.rcFile);
        }

        try {
            if (isEdit && selectedVehicle) {
                await dispatch(
                    updateVehicles({
                        request: formData,
                        vehicleId: selectedVehicle.vehicle_id,
                    }),
                ).unwrap();
                showMessage('success', 'Vehicle updated successfully');
            } else {
                await dispatch(createVehicles(formData)).unwrap();
                showMessage('success', 'Vehicle added successfully');
            }

            onFormClear();
            fetchVehicles();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', error.message || 'Failed to save vehicle data');
        }
    };

    const handleDeleteVehicle = async (vehicle) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this vehicle?',
            async () => {
                try {
                    await dispatch(deleteVehicles(vehicle.vehicle_id)).unwrap();
                    showMessage('success', 'Vehicle deleted successfully');
                    fetchVehicles();
                } catch (error) {
                    showMessage('error', error.message || 'Failed to delete vehicle');
                }
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

    const handleSelectChange = (selectedOption, { name }) => {
        setState((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));
    };

    const getSelectedValue = (options, value) => {
        if (!value) return null;
        return options.find((option) => option.value === value) || null;
    };

    const handleRemoveRc = () => {
        setState((prev) => ({
            ...prev,
            rcFile: null,
        }));
        setRcPreview(null);
    };

    const onFormClear = () => {
        setState({
            vehicleNumberPlate: '',
            vehicleTypeId: '',
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
            vehicleNumberPlate: vehicle.vehicle_number_plate || '',
            vehicleTypeId: vehicle.vehicle_type_id || '',
            rcNumber: vehicle.rc_number || '',
            rcExpiryDate: formatDateForDisplay(vehicle.rc_expiry_date) || '',
            rcFile: null,
            insuranceNumber: vehicle.insurance_number || '',
            insuranceExpiryDate: formatDateForDisplay(vehicle.insurance_expiry_date) || '',
        });
        setSelectedVehicle(vehicle);
        setIsEdit(true);
        setShowForm(true);

        // If editing and has RC image, set preview
        if (vehicle.rc_upload) {
            setRcPreview(vehicle.rc_upload);
        }
    };

    const openAddForm = () => {
        onFormClear();
        setShowForm(true);
        setIsEdit(false);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFilterSelectChange = (selectedOption, { name }) => {
        setFilters((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));
    };

    const clearFilters = () => {
        setFilters({
            vehicleNumberPlate: '',
            rcNumber: '',
            vehicleTypeId: '',
        });
    };

    // Date formatting functions
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        try {
            // Convert from YYYY-MM-DD to DD-MM-YYYY for display
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            return dateString;
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            // Convert from DD-MM-YYYY to YYYY-MM-DD for input field
            if (dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3) {
                    // Check if format is DD-MM-YYYY
                    if (parts[0].length === 2 && parts[1].length === 2) {
                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }
            }
            // If already in YYYY-MM-DD format
            return dateString;
        } catch (error) {
            return dateString;
        }
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';
        try {
            // Convert from DD-MM-YYYY to YYYY-MM-DD for API
            if (dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3 && parts[0].length === 2) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
            }
            // If already in YYYY-MM-DD format
            return dateString;
        } catch (error) {
            return dateString;
        }
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: value, // Store in YYYY-MM-DD format
        }));
    };

    // Filter data based on search term
    const filteredData = vehiclesData.filter((vehicle) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const vehicleTypeName = vehicle.vehicleType?.vehicle_type_name?.toLowerCase() || '';

        return vehicle.vehicle_number_plate?.toLowerCase().includes(searchLower) || vehicle.rc_number?.toLowerCase().includes(searchLower) || vehicleTypeName.includes(searchLower);
    });

    const columns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + currentPage * pageSize}</div>,
            width: 80,
        },
        {
            Header: 'Vehicle Number',
            accessor: 'vehicle_number_plate',
        },
        {
            Header: 'Type',
            accessor: 'vehicleType.vehicle_type_name',
            Cell: ({ value }) => value || '-',
        },
        {
            Header: 'RC Number',
            accessor: 'rc_number',
        },
        {
            Header: 'RC Expiry',
            accessor: 'rc_expiry_date',
            Cell: ({ value }) => formatDateForDisplay(value) || '-',
        },
        {
            Header: 'Insurance Number',
            accessor: 'insurance_number',
            Cell: ({ value }) => value || '-',
        },
        {
            Header: 'Insurance Expiry',
            accessor: 'insurance_expiry_date',
            Cell: ({ value }) => formatDateForDisplay(value) || '-',
        },
        {
            Header: 'RC Document',
            accessor: 'rc_upload',
            Cell: ({ value }) =>
                value ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        View
                    </a>
                ) : (
                    '-'
                ),
        },
        roleIdforRole === 'Super Admin'
            ? {
                  Header: 'Actions',
                  accessor: 'actions',
                  Cell: ({ row }) => (
                      <div className="flex space-x-2">
                          <Tippy content="Edit">
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEditForm(row.original)}>
                                  <IconPencil className="w-4 h-4" />
                              </button>
                          </Tippy>
                          <Tippy content="Delete">
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteVehicle(row.original)}>
                                  <IconTrashLines className="w-4 h-4" />
                              </button>
                          </Tippy>
                      </div>
                  ),
                  width: 120,
              }
            : null,
    ].filter(Boolean);

    // Helper function
    function findArrObj(arr, key, value) {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.filter((item) => item[key] === value);
    }

    return (
        <div>
            {/* Search and Filter Bar */}
            <div className="panel mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <h2 className="text-xl font-semibold"> Vehicle List</h2>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn btn-outline-primary">
                            <IconFilter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                        {roleIdforRole === 'Super Admin' && (
                            <button type="button" onClick={openAddForm} className="btn btn-primary">
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Vehicle
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label>Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicleNumberPlate"
                                    value={filters.vehicleNumberPlate}
                                    onChange={handleFilterChange}
                                    placeholder="Filter by vehicle number"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label>RC Number</label>
                                <input type="text" name="rcNumber" value={filters.rcNumber} onChange={handleFilterChange} placeholder="Filter by RC number" className="form-input" />
                            </div>
                            <div>
                                <label>Vehicle Type</label>
                                <Select
                                    name="vehicleTypeId"
                                    options={vehicleTypeOptions}
                                    value={getSelectedValue(vehicleTypeOptions, filters.vehicleTypeId)}
                                    onChange={(selectedOption) => handleFilterSelectChange(selectedOption, { name: 'vehicleTypeId' })}
                                    placeholder="Filter by type"
                                    isClearable
                                    className="react-select"
                                    classNamePrefix="select"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button type="button" onClick={clearFilters} className="btn btn-outline-secondary mr-2">
                                Clear Filters
                            </button>
                            <button type="button" onClick={() => setShowFilters(false)} className="btn btn-primary">
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Vehicle Form */}
            {showForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h5>
                        <button type="button" onClick={onFormClear} className="text-gray-500 hover:text-gray-700">
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Vehicle Number */}
                            <div>
                                <label>
                                    Vehicle Number Plate <span className="text-danger">*</span>
                                </label>
                                <input type="text" name="vehicleNumberPlate" value={state.vehicleNumberPlate} onChange={handleChange} placeholder="e.g., TN12AB1234" className="form-input" />
                                {errors.vehicleNumberPlate && <div className="text-danger text-sm mt-1">{errors.vehicleNumberPlate}</div>}
                            </div>

                            {/* Vehicle Type */}
                            <div>
                                <label>
                                    Vehicle Type <span className="text-danger">*</span>
                                </label>
                                <Select
                                    name="vehicleTypeId"
                                    options={vehicleTypeOptions}
                                    value={getSelectedValue(vehicleTypeOptions, state.vehicleTypeId)}
                                    onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'vehicleTypeId' })}
                                    placeholder="Select Vehicle Type"
                                    className="react-select"
                                    classNamePrefix="select"
                                    isDisabled={vehicleTypeOptions.length === 0}
                                />
                                {vehicleTypeOptions.length === 0 && <p className="text-xs text-warning mt-1">Loading vehicle types...</p>}
                                {errors.vehicleTypeId && <div className="text-danger text-sm mt-1">{errors.vehicleTypeId}</div>}
                            </div>

                            {/* RC Number */}
                            <div>
                                <label>
                                    RC Number <span className="text-danger">*</span>
                                </label>
                                <input type="text" name="rcNumber" value={state.rcNumber} onChange={handleChange} placeholder="Enter RC Number" className="form-input" />
                                {errors.rcNumber && <div className="text-danger text-sm mt-1">{errors.rcNumber}</div>}
                            </div>

                            {/* RC Expiry Date */}
                            <div>
                                <label>
                                    RC Expiry Date <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="rcExpiryDate"
                                    value={formatDateForInput(state.rcExpiryDate)}
                                    onChange={handleDateChange}
                                    className="form-input"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                                {errors.rcExpiryDate && <div className="text-danger text-sm mt-1">{errors.rcExpiryDate}</div>}
                            </div>

                            {/* Insurance Number */}
                            <div>
                                <label>Insurance Number</label>
                                <input type="text" name="insuranceNumber" value={state.insuranceNumber} onChange={handleChange} placeholder="Enter Insurance Number" className="form-input" />
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
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            {/* RC Upload */}
                            <div className="lg:col-span-3">
                                <label>RC Document Upload {!isEdit && <span className="text-danger">*</span>}</label>
                                <div className="mt-1">
                                    <input type="file" name="rcFile" onChange={handleChange} accept="image/*,.pdf" className="form-input" />
                                    <p className="text-xs text-gray-500 mt-1">Upload RC image or PDF (JPG, PNG, GIF, WebP, PDF). {isEdit ? 'Leave empty to keep existing.' : ''}</p>
                                    {errors.rcFile && <div className="text-danger text-sm mt-1">{errors.rcFile}</div>}
                                </div>

                                {/* RC Preview */}
                                {rcPreview && (
                                    <div className="mt-4 relative">
                                        <p className="text-sm font-medium mb-2">RC Preview:</p>
                                        <div className="relative inline-block">
                                            {rcPreview.includes('data:image') ? (
                                                <img src={rcPreview} alt="RC Preview" className="max-w-full h-auto max-h-48 rounded border object-contain" />
                                            ) : (
                                                <div className="bg-gray-100 p-4 rounded border">
                                                    <p className="text-sm">RC file uploaded: {state.rcFile?.name}</p>
                                                </div>
                                            )}
                                            <button type="button" onClick={handleRemoveRc} className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-red-700">
                                                <IconX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-2 mt-6">
                            <button type="button" onClick={onFormClear} className="btn btn-outline-secondary" disabled={loading}>
                                Close
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading || vehicleTypeOptions.length === 0}>
                                {loading ? 'Processing...' : isEdit ? 'Update Vehicle' : 'Add Vehicle'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Vehicles Table */}
            <div className="panel">
                {loading && !showForm ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading vehicles...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-danger">Error loading vehicles: {error}</div>
                ) : vehiclesData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No vehicles found. {roleIdforRole === 'Super Admin' && 'Click "Add Vehicle" to get started.'}</div>
                ) : (
                    <Table
                        columns={columns}
                        Title={' '}
                        toggle={null}
                        data={getPaginatedData()}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={getTotalCount()}
                        totalPages={Math.ceil(getTotalCount() / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        pagination={true}
                        isSearchable={false} // We have custom search above
                        isSortable={true}
                    />
                )}
            </div>
        </div>
    );
};

export default Vehicles;
