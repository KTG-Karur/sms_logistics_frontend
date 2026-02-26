import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import { showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';
import IconX from '../../../components/Icon/IconX';
import IconPlus from '../../../components/Icon/IconPlus';
import IconPencil from '../../../components/Icon/IconPencil';
import IconFilter from '../../../components/Icon/IconSearch';
import IconSearch from '../../../components/Icon/IconSearch';
import Select from 'react-select';
import { getLocations, createLocations, updateLocations, deleteLocations } from '../../../redux/locationSlice';
import { getOfficeCenters } from '../../../redux/officeCenterSlice';
import _ from 'lodash';

const Locations = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Location');
    const dispatch = useDispatch();

    // Get locations state from Redux
    const locationsState = useSelector((state) => state.LocationSlice || {});
    const { locationsData = [], loading = false, error = null } = locationsState;

    // Get office centers state from Redux for dropdown
    const officeCenterState = useSelector((state) => state.OfficeCenterSlice || {});
    const { officeCentersData = [], loading: officeCentersLoading = false } = officeCenterState;

    const [showForm, setShowForm] = useState(false);
    const [state, setState] = useState({
        locationName: '',
        officeCenterId: null
    });
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        locationName: '',
        officeCenterId: null,
        status: ''
    });

    useEffect(() => {
        dispatch(setPageTitle('Location Management'));
        fetchLocations();
        fetchOfficeCenters();
    }, []);

    useEffect(() => {
        fetchLocations();
    }, [filters]);

    const fetchOfficeCenters = async () => {
        try {
            await dispatch(getOfficeCenters({})).unwrap();
        } catch (error) {
            console.error('Error fetching office centers:', error);
            showMessage('error', 'Failed to load office centers');
        }
    };

    const fetchLocations = async () => {
        try {
            // Apply filters
            const filterParams = {};
            if (filters.locationName) filterParams.locationName = filters.locationName;
            if (filters.officeCenterId) filterParams.officeCenterId = filters.officeCenterId.value;
            if (filters.status) filterParams.isActive = filters.status === 'Active' ? true : false;
            
            await dispatch(getLocations(filterParams)).unwrap();
        } catch (error) {
            console.error('Error fetching locations:', error);
            showMessage('error', error.message || 'Failed to load locations');
        }
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Get paginated data
    const getPaginatedData = () => {
        const dataArray = locationsData || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return (locationsData || []).length;
    };

    const validateForm = () => {
        const newErrors = {};
        if (!state.locationName?.trim()) {
            newErrors.locationName = 'Location name is required';
        }
        if (!state.officeCenterId) {
            newErrors.officeCenterId = 'Office center is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const request = {
            locationName: state.locationName.trim(),
            officeCenterId: state.officeCenterId.value
        };

        try {
            if (isEdit && selectedLocation) {
                await dispatch(
                    updateLocations({
                        request: request,
                        locationsId: selectedLocation.location_id
                    })
                ).unwrap();
                showMessage('success', 'Location updated successfully');
            } else {
                await dispatch(createLocations(request)).unwrap();
                showMessage('success', 'Location added successfully');
            }

            onFormClear();
            fetchLocations();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', error.message || 'Failed to save location data');
        }
    };

    const handleDeleteLocation = async (location) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this location?',
            async () => {
                try {
                    await dispatch(deleteLocations(location.location_id)).unwrap();
                    showMessage('success', 'Location deleted successfully');
                    fetchLocations();
                } catch (error) {
                    showMessage('error', error.message || 'Failed to delete location');
                }
            },
            'Yes, delete it'
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: value,
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleOfficeCenterChange = (selectedOption) => {
        setState((prev) => ({
            ...prev,
            officeCenterId: selectedOption
        }));
        
        if (errors.officeCenterId) {
            setErrors((prev) => ({
                ...prev,
                officeCenterId: null
            }));
        }
    };

    const onFormClear = () => {
        setState({
            locationName: '',
            officeCenterId: null
        });
        setSelectedLocation(null);
        setIsEdit(false);
        setErrors({});
        setShowForm(false);
    };

    const onEditForm = (location) => {
        const officeCenterOption = {
            value: location.office_center_id,
            label: getOfficeCenterName(location.office_center_id)
        };

        setState({
            locationName: location.location_name || '',
            officeCenterId: officeCenterOption
        });
        setSelectedLocation(location);
        setIsEdit(true);
        setShowForm(true);
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

    const handleFilterOfficeCenterChange = (selectedOption) => {
        setFilters((prev) => ({
            ...prev,
            officeCenterId: selectedOption
        }));
    };

    const handleFilterStatusChange = (selectedOption) => {
        setFilters((prev) => ({
            ...prev,
            status: selectedOption ? selectedOption.value : ''
        }));
    };

    const clearFilters = () => {
        setFilters({
            locationName: '',
            officeCenterId: null,
            status: ''
        });
    };

    // Get office center name by ID
    const getOfficeCenterName = (officeCenterId) => {
        const officeCenter = officeCentersData.find(oc => oc.id === officeCenterId);
        return officeCenter ? officeCenter.officeCentersName : officeCenterId;
    };

    // Prepare office center options for React Select
    const getOfficeCenterOptions = () => {
        return officeCentersData
            .filter(center => center.isActive)
            .map((center) => ({
                value: center.id,
                label: center.officeCentersName
            }));
    };

    // Status options for filter
    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
    ];

    // Filter data based on search term
    const filteredData = locationsData.filter((location) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            location.location_name?.toLowerCase().includes(searchLower) ||
            getOfficeCenterName(location.office_center_id)?.toLowerCase().includes(searchLower)
        );
    });

    const columns = [
        {
            Header: 'S.No',
            accessor: 'index',
            Cell: ({ row }) => <div>{row.index + 1 + currentPage * pageSize}</div>,
            width: 80,
        },
        {
            Header: 'Location Name',
            accessor: 'location_name',
        },
        {
            Header: 'Office Center',
            accessor: 'office_center_id',
            Cell: ({ value }) => getOfficeCenterName(value),
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                    {value}
                </span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex space-x-2">
                    {_.includes(accessIds, '3') && (
                        <Tippy content="Edit">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => onEditForm(row.original)}
                            >
                                <IconPencil className="w-4 h-4" />
                            </button>
                        </Tippy>
                    )}
                    {_.includes(accessIds, '4') && (
                        <Tippy content="Delete">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteLocation(row.original)}
                            >
                                <IconTrashLines className="w-4 h-4" />
                            </button>
                        </Tippy>
                    )}
                </div>
            ),
            width: 120,
        }
    ];

    // Helper function
    function findArrObj(arr, key, value) {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.filter((item) => item[key] === value);
    }

    const customSelectStyles = {
        control: (provided) => ({
            ...provided,
            minHeight: '38px',
            borderColor: '#e0e6ed',
            '&:hover': {
                borderColor: '#ee9043',
            },
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };

    return (
        <div>
            {/* Search and Filter Bar */}
            <div className="panel mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search locations by name or office center..."
                                className="form-input w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="btn btn-outline-primary"
                        >
                            <IconFilter className="w-4 h-4 mr-2" />
                            Filters
                        </button>
                        {_.includes(accessIds, '2') && (
                            <button
                                type="button"
                                onClick={openAddForm}
                                className="btn btn-primary"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Location
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Location Name
                                </label>
                                <input
                                    type="text"
                                    name="locationName"
                                    value={filters.locationName}
                                    onChange={handleFilterChange}
                                    placeholder="Filter by location name"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Office Center
                                </label>
                                <Select
                                    name="officeCenterId"
                                    value={filters.officeCenterId}
                                    onChange={handleFilterOfficeCenterChange}
                                    options={getOfficeCenterOptions()}
                                    placeholder="Select Office Center"
                                    isClearable
                                    styles={customSelectStyles}
                                    className="react-select"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    name="status"
                                    value={statusOptions.find(option => option.value === filters.status)}
                                    onChange={handleFilterStatusChange}
                                    options={statusOptions}
                                    placeholder="Select Status"
                                    isClearable
                                    styles={customSelectStyles}
                                    className="react-select"
                                    classNamePrefix="select"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="btn btn-outline-secondary mr-2"
                            >
                                Clear Filters
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="btn btn-primary"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Location Form */}
            {showForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            {isEdit ? 'Edit Location' : 'Add New Location'}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Office Center Dropdown - React Select */}
                            <div>
                                <label className="block mb-1">
                                    Office Center <span className="text-danger">*</span>
                                </label>
                                <Select
                                    name="officeCenterId"
                                    value={state.officeCenterId}
                                    onChange={handleOfficeCenterChange}
                                    options={getOfficeCenterOptions()}
                                    placeholder="Select Office Center"
                                    isDisabled={officeCentersLoading}
                                    isLoading={officeCentersLoading}
                                    styles={customSelectStyles}
                                    className="react-select"
                                    classNamePrefix="select"
                                />
                                {errors.officeCenterId && (
                                    <div className="text-danger text-sm mt-1">
                                        {errors.officeCenterId}
                                    </div>
                                )}
                            </div>

                            {/* Location Name */}
                            <div>
                                <label className="block mb-1">
                                    Location Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="locationName"
                                    value={state.locationName}
                                    onChange={handleChange}
                                    placeholder="Enter location name"
                                    className="form-input"
                                    maxLength={100}
                                />
                                {errors.locationName && (
                                    <div className="text-danger text-sm mt-1">
                                        {errors.locationName}
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
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading || officeCentersLoading}
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    isEdit ? 'Update Location' : 'Add Location'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Locations Table */}
            <div className="panel">
                {loading && !showForm ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading locations...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-danger">
                        Error loading locations: {error}
                    </div>
                ) : locationsData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No locations found. {_.includes(accessIds, '2') && 'Click "Add Location" to get started.'}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        Title={'Location List'}
                        toggle={null}
                        data={getPaginatedData()}
                        pageSize={pageSize}
                        pageIndex={currentPage}
                        totalCount={getTotalCount()}
                        totalPages={Math.ceil(getTotalCount() / pageSize)}
                        onPaginationChange={handlePaginationChange}
                        pagination={true}
                        isSearchable={false}
                        isSortable={true}
                    />
                )}
            </div>
        </div>
    );
};

export default Locations;