import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconFilter from '../../../components/Icon/IconSearch';
import IconX from '../../../components/Icon/IconX';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import { findArrObj, showMessage , getAccessIdsByLabel } from '../../../util/AllFunction';
import { getEmployee, createEmployee, updateEmployee, deleteEmployee, resetEmployeeStatus, setFilters, clearFilters } from '../../../redux/employeeSlice';
import { getRolesApi } from '../../../api/RoleApi';
import Select from 'react-select';

const Employees = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Staff');
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();
    
    const { 
        getEmployeeSuccess, 
        createEmployeeSuccess, 
        createEmployeeFailed, 
        updateEmployeeSuccess, 
        deleteEmployeeSuccess, 
        updateEmployeeFailed, 
        error, 
        employeeData,
        filteredData,
        filters,
        loading 
    } = useSelector((state) => state.EmployeeSlice);
    
    const [showForm, setShowForm] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [state, setState] = useState({
        employeeName: '',
        mobileNo: '',
        addressI: '',
        pincode: '',
        roleId: '',
        licenceNumber: '',
        licenceFile: null,
        salary: '',
        salaryType: 'monthly', // Default to monthly
        isAuthenticated: false,
        isDriver: false,
        hasSalary: false,
        isLoadman: false,
        username: '',
        password: '',
    });
    
    const [filterState, setFilterState] = useState({
        is_driver: '',
        has_salary: '',
        is_loadman: '',
        is_active: '1',
    });
    
    const [parentList, setParentList] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [licencePreview, setLicencePreview] = useState(null);
    
    const [roleOptions, setRoleOptions] = useState([]);
    
    // Salary type options
    const salaryTypeOptions = [
        { value: 'daily', label: 'Daily' },
        // { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        // { value: 'yearly', label: 'Yearly' },
        // { value: 'hourly', label: 'Hourly' },
        // { value: 'per_hour', label: 'Per Hour' },
    ];
    
    // Filter options
    const filterOptions = [
        { value: '', label: 'All' },
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' }
    ];
    
    const activeOptions = [
        { value: '1', label: 'Active' },
        { value: '0', label: 'Inactive' },
        { value: '', label: 'All' }
    ];
    
    useEffect(() => {
        dispatch(setPageTitle('Staff Management'));
        fetchInitialData();
        // Apply existing filters on mount
        if (Object.values(filters).some(val => val !== null && val !== '')) {
            handleFilterApply();
        }
    }, []);
    
    useEffect(() => {
        setCurrentPage(0);
    }, [parentList]);
    
    const fetchInitialData = async () => {
        try {
            await dispatch(getEmployee(filters));
            await fetchDropdownData();
        } catch (error) {
            showMessage('error', 'Failed to load data');
        }
    };
    
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };
    
    const getPaginatedData = () => {
        const dataArray = parentList || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };
    
    const getTotalCount = () => {
        return (parentList || []).length;
    };
    
    const fetchDropdownData = async () => {
        try {
            const rolesResponse = await getRolesApi();
            const rolesData = rolesResponse?.data || [];
            setRoles(rolesData);
            
            const roleSelectOptions = rolesData.map((role) => ({
                value: role.roleId,
                label: role.roleName
            }));
            setRoleOptions(roleSelectOptions);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showMessage('error', 'Failed to load dropdown options');
        }
    };
    
    useEffect(() => {
        if (getEmployeeSuccess) {
            setParentList(filteredData);
            dispatch(resetEmployeeStatus());
        }
    }, [getEmployeeSuccess, filteredData]);
    
    useEffect(() => {
        if (createEmployeeSuccess) {
            showMessage('success', 'Staff created successfully');
            onFormClear();
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        } else if (createEmployeeFailed) {
            showMessage('error', error || 'Create Staff failed');
            dispatch(resetEmployeeStatus());
        }
    }, [createEmployeeSuccess, createEmployeeFailed]);
    
    useEffect(() => {
        if (updateEmployeeSuccess) {
            showMessage('success', 'Staff updated successfully');
            onFormClear();
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        } else if (updateEmployeeFailed) {
            showMessage('error', error || 'Update Staff failed');
            dispatch(resetEmployeeStatus());
        }
    }, [updateEmployeeSuccess, updateEmployeeFailed]);
    
    useEffect(() => {
        if (deleteEmployeeSuccess) {
            showMessage('success', 'Staff deleted successfully');
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        }
    }, [deleteEmployeeSuccess]);
    
    // Columns for table
    const columns = [
        { Header: 'S.No', accessor: 'id', Cell: (row) => <div>{row?.row?.index + 1}</div> },
        { Header: 'Name', accessor: 'employeeName' },
        { Header: 'Mobile No', accessor: 'mobileNo' },
        { Header: 'Role', accessor: 'roleName' },
        { 
            Header: 'Driver', 
            accessor: 'isDriver',
            Cell: ({ value }) => value ? 'Yes' : 'No'
        },
        { 
            Header: 'Licence No', 
            accessor: 'licenceNumber',
            Cell: ({ value }) => value || '-'
        },
        { 
            Header: 'Salary', 
            accessor: 'salary', 
            Cell: ({ row }) => {
                const value = row.original.salary;
                const salaryType = row.original.salaryType;
                if (!value) return '-';
                let typeLabel = '';
                if (salaryType === 'daily') typeLabel = '/day';
                else if (salaryType === 'weekly') typeLabel = '/week';
                else if (salaryType === 'monthly') typeLabel = '/month';
                else if (salaryType === 'yearly') typeLabel = '/year';
                else if (salaryType === 'hourly') typeLabel = '/hour';
                else if (salaryType === 'per_hour') typeLabel = '/hr';
                else typeLabel = '/month';
                
                return `₹${value}${typeLabel}`;
            }
        },
        { 
            Header: 'Salary Type', 
            accessor: 'salaryType',
            Cell: ({ value }) => {
                if (!value) return '-';
                const option = salaryTypeOptions.find(opt => opt.value === value);
                return option ? option.label : value;
            }
        },
        { 
            Header: 'Has Salary', 
            accessor: 'hasSalary',
            Cell: ({ value }) => value ? 'Yes' : 'No'
        },
        { 
            Header: 'Loadman', 
            accessor: 'isLoadman',
            Cell: ({ value }) => value ? 'Yes' : 'No'
        },
        { 
            Header: 'Authenticated', 
            accessor: 'isAuthenticated',
            Cell: ({ value }) => value ? 'Yes' : 'No'
        },
        { 
            Header: 'Status', 
            accessor: 'isActive',
            Cell: ({ value }) => (
                <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        roleIdforRole === 'Super Admin'
            ? {
                  Header: 'Actions',
                  accessor: 'actions',
                  Cell: ({ row }) => (
                      <div className="flex">
                          {roleIdforRole === 'Super Admin' && (
                              <Tippy content="Edit">
                                  <span className="text-success me-1 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                      <IconPencil className="ltr:mr-2 rtl:ml-2" />
                                  </span>
                              </Tippy>
                          )}
                          {roleIdforRole === 'Super Admin' && (
                              <Tippy content="Delete">
                                  <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteEmployee(row.original)}>
                                      <IconTrashLines />
                                  </span>
                              </Tippy>
                          )}
                      </div>
                  ),
              }
            : null,
    ].filter(Boolean);
    
    // Form functions
    const onFormClear = () => {
        setState({
            employeeName: '',
            mobileNo: '',
            addressI: '',
            pincode: '',
            roleId: '',
            licenceNumber: '',
            licenceFile: null,
            salary: '',
            salaryType: 'monthly',
            isAuthenticated: false,
            isDriver: false,
            hasSalary: false,
            isLoadman: false,
            username: '',
            password: '',
        });
        setSelectedItem(null);
        setIsEdit(false);
        setErrors({});
        setShowPassword(false);
        setLicencePreview(null);
        setShowForm(false);
    };
    
    const openAddForm = () => {
        onFormClear();
        setShowForm(true);
        setIsEdit(false);
    };
    
    const onEditForm = (data) => {
        setState({
            employeeName: data.employeeName || '',
            mobileNo: data.mobileNo || '',
            addressI: data.addressI || '',
            pincode: data.pincode || '',
            roleId: data.roleId || '',
            licenceNumber: data.licenceNumber || '',
            licenceFile: null,
            salary: data.salary || '',
            salaryType: data.salaryType || 'monthly',
            isAuthenticated: data.isAuthenticated || false,
            isDriver: data.isDriver || false,
            hasSalary: data.hasSalary || false,
            isLoadman: data.isLoadman || false,
            username: data.userName || '',
            password: '',
        });
        setSelectedItem(data);
        setIsEdit(true);
        setShowForm(true);
        
        // If editing and has licence image, set preview
        if (data.licenceImage) {
            setLicencePreview(data.licenceImage);
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        if (!state.employeeName) newErrors.employeeName = 'Staff name is required';
        if (!state.mobileNo) newErrors.mobileNo = 'Mobile number is required';
        
        // Mobile number validation
        const mobileRegex = /^[0-9]{10}$/;
        if (state.mobileNo && !mobileRegex.test(state.mobileNo)) {
            newErrors.mobileNo = 'Mobile number must be 10 digits';
        }
        
        // Pincode validation
        const pincodeRegex = /^[0-9]{6}$/;
        if (state.pincode && !pincodeRegex.test(state.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits';
        }
        
        // Validation based on toggles
        if (state.isAuthenticated && !state.roleId) {
            newErrors.roleId = 'Role is required when authentication is enabled';
        }
        
        // Validate driver fields if isDriver is true
        if (state.isDriver && !state.licenceNumber) {
            newErrors.licenceNumber = 'Licence number is required for driver';
        }
        
        // Validate salary if hasSalary is true
        if (state.hasSalary) {
            if (!state.salary) {
                newErrors.salary = 'Salary is required when Has Salary is enabled';
            }
            if (!state.salaryType) {
                newErrors.salaryType = 'Salary type is required when Has Salary is enabled';
            }
        }
        
        // Validate authentication fields if isAuthenticated is true
        if (state.isAuthenticated) {
            if (!state.username) newErrors.username = 'Username is required when authentication is enabled';
            if (!state.password && !isEdit) newErrors.password = 'Password is required when authentication is enabled';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    
        const formData = new FormData();
        formData.append('employee_name', state.employeeName);
        formData.append('mobile_no', state.mobileNo);
        formData.append('address_i', state.addressI);
        formData.append('pincode', state.pincode);
        formData.append('is_driver', state.isDriver ? 1 : 0);
        formData.append('has_salary', state.hasSalary ? 1 : 0);
        formData.append('is_loadman', state.isLoadman ? 1 : 0);
        formData.append('is_authenticated', state.isAuthenticated ? 1 : 0);
        
        // Add salary and salary type only if hasSalary is true
        if (state.hasSalary) {
            formData.append('salary', parseFloat(state.salary) || 0);
            formData.append('salary_type', state.salaryType);
        }
        
        // Add role only if authenticated
        if (state.isAuthenticated) {
            formData.append('role_id', state.roleId);
        }
        
        // Add driver-specific fields
        if (state.isDriver) {
            formData.append('licence_number', state.licenceNumber);
            if (state.licenceFile) {
                formData.append('licenceFile', state.licenceFile);
            }
        }
        
        // Add authentication fields
        if (state.isAuthenticated) {
            formData.append('username', state.username);
            if (state.password) {
                formData.append('password', state.password);
            }
        }
    
        try {
            if (isEdit) {
                await dispatch(
                    updateEmployee({
                        request: formData,
                        employeeId: selectedItem.employeeId,
                    }),
                );
            } else {
                await dispatch(createEmployee(formData));
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save Staff data');
        }
    };
    
    const handleDeleteEmployee = (employee) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this Staff?',
            () => {
                dispatch(
                    deleteEmployee({
                        employeeId: employee.employeeId,
                    }),
                );
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
            
            // Validate file size (max 5MB)
            if (file && file.size > 5 * 1024 * 1024) {
                showMessage('error', 'File size should be less than 5MB');
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
                    setLicencePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else if (type === 'checkbox') {
            setState((prev) => {
                const updatedState = {
                    ...prev,
                    [name]: checked,
                };
                
                // Handle toggle dependencies
                if (name === 'isAuthenticated') {
                    if (!checked) {
                        // When authentication is disabled, clear role
                        updatedState.roleId = '';
                        updatedState.username = '';
                        updatedState.password = '';
                    }
                }
                
                if (name === 'isDriver' && !checked) {
                    // When driver is disabled, clear driver-specific fields
                    updatedState.licenceNumber = '';
                    updatedState.licenceFile = null;
                    setLicencePreview(null);
                }
                
                if (name === 'hasSalary' && !checked) {
                    // When hasSalary is disabled, clear salary and salary type
                    updatedState.salary = '';
                    updatedState.salaryType = 'monthly';
                }
                
                return updatedState;
            });
        } else {
            // Only allow numbers for mobile, pincode, and salary
            let processedValue = value;
            if (name === 'mobileNo' || name === 'pincode') {
                processedValue = value.replace(/[^0-9]/g, '');
            }
            if (name === 'salary') {
                processedValue = value.replace(/[^0-9.]/g, '');
                // Prevent multiple decimal points
                const decimalCount = (processedValue.match(/\./g) || []).length;
                if (decimalCount > 1) {
                    processedValue = processedValue.replace(/\.+$/, '');
                }
            }
            
            setState((prev) => ({
                ...prev,
                [name]: processedValue,
            }));
        }
    };
    
    // Handle React Select change for roles
    const handleSelectChange = (selectedOption, { name }) => {
        setState((prev) => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : '',
        }));
    };
    
    // Filter handlers
    const handleFilterChange = (selectedOption, { name }) => {
        setFilterState(prev => ({
            ...prev,
            [name]: selectedOption ? selectedOption.value : ''
        }));
    };
    
    const handleFilterApply = () => {
        // Convert filter state to API parameters
        const apiFilters = {};
        Object.keys(filterState).forEach(key => {
            if (filterState[key] !== '') {
                apiFilters[key] = filterState[key];
            }
        });
        
        dispatch(setFilters(apiFilters));
        dispatch(getEmployee(apiFilters));
        setShowFilter(false);
    };
    
    const handleFilterClear = () => {
        setFilterState({
            is_driver: '',
            has_salary: '',
            is_loadman: '',
            is_active: '1',
        });
        dispatch(clearFilters());
        dispatch(getEmployee({}));
        setShowFilter(false);
    };
    
    // Get selected value for React Select
    const getSelectedValue = (options, value) => {
        if (value === undefined || value === null || value === '') return null;
        return options.find(option => option.value === value.toString()) || null;
    };
    
    // Handle licence file removal
    const handleRemoveLicence = () => {
        setState(prev => ({
            ...prev,
            licenceFile: null,
            licenceNumber: '',
        }));
        setLicencePreview(null);
    };
    
    return (
        <div>
            {/* Filter Panel */}
            {showFilter && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Filter Staff
                        </h5>
                        <button
                            type="button"
                            onClick={() => setShowFilter(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Driver Filter */}
                        <div>
                            <label>Driver Status</label>
                            <Select
                                name="is_driver"
                                options={filterOptions}
                                value={getSelectedValue(filterOptions, filterState.is_driver)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'is_driver' })}
                                placeholder="All"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                        
                        {/* Has Salary Filter */}
                        <div>
                            <label>Has Salary</label>
                            <Select
                                name="has_salary"
                                options={filterOptions}
                                value={getSelectedValue(filterOptions, filterState.has_salary)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'has_salary' })}
                                placeholder="All"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                        
                        {/* Loadman Filter */}
                        <div>
                            <label>Loadman Status</label>
                            <Select
                                name="is_loadman"
                                options={filterOptions}
                                value={getSelectedValue(filterOptions, filterState.is_loadman)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'is_loadman' })}
                                placeholder="All"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                        
                        {/* Active Status Filter */}
                        <div>
                            <label>Status</label>
                            <Select
                                name="is_active"
                                options={activeOptions}
                                value={getSelectedValue(activeOptions, filterState.is_active)}
                                onChange={(selectedOption) => handleFilterChange(selectedOption, { name: 'is_active' })}
                                placeholder="All"
                                isClearable={false}
                                className="react-select"
                                classNamePrefix="select"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={handleFilterClear}
                            className="btn btn-outline-secondary"
                        >
                            Clear Filters
                        </button>
                        <button
                            type="button"
                            onClick={handleFilterApply}
                            className="btn btn-primary"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
            
            {/* Employee Form - Above the Table (only shows when showForm is true) */}
            {showForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            {isEdit ? 'Edit Staff' : 'Add New Staff'}
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
                            {/* Default Fields */}
                            <div>
                                <label>Name <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    name="employeeName" 
                                    value={state.employeeName} 
                                    onChange={handleChange} 
                                    placeholder="Enter Staff Name" 
                                    className="form-input" 
                                />
                                {errors.employeeName && <div className="text-danger text-sm mt-1">{errors.employeeName}</div>}
                            </div>

                            <div>
                                <label>Mobile No <span className="text-danger">*</span></label>
                                <input 
                                    type="text" 
                                    name="mobileNo" 
                                    value={state.mobileNo} 
                                    onChange={handleChange} 
                                    placeholder="Enter Mobile Number" 
                                    className="form-input" 
                                    maxLength={10} 
                                    minLength={10} 
                                />
                                {errors.mobileNo && <div className="text-danger text-sm mt-1">{errors.mobileNo}</div>}
                            </div>

                            <div className="lg:col-span-3">
                                <label>Address</label>
                                <textarea 
                                    name="addressI" 
                                    value={state.addressI} 
                                    onChange={handleChange} 
                                    placeholder="Enter Address" 
                                    className="form-input" 
                                    rows="3" 
                                />
                            </div>

                            <div>
                                <label>Pincode</label>
                                <input 
                                    type="text" 
                                    name="pincode" 
                                    value={state.pincode} 
                                    onChange={handleChange} 
                                    placeholder="Enter Pincode" 
                                    className="form-input" 
                                    maxLength={6} 
                                    minLength={6} 
                                />
                                {errors.pincode && <div className="text-danger text-sm mt-1">{errors.pincode}</div>}
                            </div>

                            {/* Toggle Fields Section */}
                            <div className="lg:col-span-3 border-t pt-4 mt-2">
                                <h6 className="font-semibold text-base mb-4">Toggle Options</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Is Authenticated Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            name="isAuthenticated"
                                            checked={state.isAuthenticated}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded"
                                        />
                                        <label className="text-sm font-medium">Is Authenticated</label>
                                    </div>

                                    {/* Is Driver Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            name="isDriver"
                                            checked={state.isDriver}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded"
                                        />
                                        <label className="text-sm font-medium">Is Driver</label>
                                    </div>

                                    {/* Has Salary Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            name="hasSalary"
                                            checked={state.hasSalary}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded"
                                        />
                                        <label className="text-sm font-medium">Has Salary</label>
                                    </div>

                                    {/* Is Loadman Toggle */}
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            name="isLoadman"
                                            checked={state.isLoadman}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-primary rounded"
                                        />
                                        <label className="text-sm font-medium">Is Loadman</label>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional Fields Based on Toggles */}
                            <div className="lg:col-span-3 border-t pt-4 mt-2">
                                <h6 className="font-semibold text-base mb-4">Additional Information</h6>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Role Field - Only show if Is Authenticated is enabled */}
                                    {state.isAuthenticated && (
                                        <div>
                                            <label>Role <span className="text-danger">*</span></label>
                                            <Select
                                                name="roleId"
                                                options={roleOptions}
                                                value={getSelectedValue(roleOptions, state.roleId)}
                                                onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'roleId' })}
                                                placeholder="Select Role"
                                                isClearable
                                                className="react-select"
                                                classNamePrefix="select"
                                            />
                                            {errors.roleId && <div className="text-danger mt-1 text-sm">{errors.roleId}</div>}
                                        </div>
                                    )}

                                    {/* Salary Fields - Only show if Has Salary is enabled */}
                                    {state.hasSalary && (
                                        <>
                                            <div>
                                                <label>Salary Amount <span className="text-danger">*</span></label>
                                                <input 
                                                    type="text" 
                                                    name="salary" 
                                                    value={state.salary} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter Salary Amount" 
                                                    className="form-input" 
                                                />
                                                {errors.salary && <div className="text-danger text-sm mt-1">{errors.salary}</div>}
                                            </div>
                                            
                                            <div>
                                                <label>Salary Type <span className="text-danger">*</span></label>
                                                <Select
                                                    name="salaryType"
                                                    options={salaryTypeOptions}
                                                    value={getSelectedValue(salaryTypeOptions, state.salaryType)}
                                                    onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'salaryType' })}
                                                    placeholder="Select Salary Type"
                                                    className="react-select"
                                                    classNamePrefix="select"
                                                />
                                                {errors.salaryType && <div className="text-danger mt-1 text-sm">{errors.salaryType}</div>}
                                            </div>
                                        </>
                                    )}

                                    {/* Driver-specific fields */}
                                    {state.isDriver && (
                                        <>
                                            <div>
                                                <label>Licence Number <span className="text-danger">*</span></label>
                                                <input 
                                                    type="text" 
                                                    name="licenceNumber" 
                                                    value={state.licenceNumber} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter Licence Number" 
                                                    className="form-input" 
                                                />
                                                {errors.licenceNumber && <div className="text-danger text-sm mt-1">{errors.licenceNumber}</div>}
                                            </div>

                                            <div className="lg:col-span-3">
                                                <label>Licence Upload</label>
                                                <div className="mt-1">
                                                    <input 
                                                        type="file" 
                                                        name="licenceFile" 
                                                        onChange={handleChange} 
                                                        accept="image/*"
                                                        className="form-input"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Upload Licence image (JPG, PNG, GIF, WebP only, Max 5MB)</p>
                                                    {errors.licenceFile && <div className="text-danger text-sm mt-1">{errors.licenceFile}</div>}
                                                </div>
                                                
                                                {/* Licence Preview */}
                                                {licencePreview && (
                                                    <div className="mt-4 relative">
                                                        <p className="text-sm font-medium mb-2">Preview:</p>
                                                        <div className="relative inline-block">
                                                            <img 
                                                                src={licencePreview} 
                                                                crossOrigin='ananymous'
                                                                alt="Licence Preview" 
                                                                className="max-w-full h-auto max-h-48 rounded border object-contain"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleRemoveLicence}
                                                                className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-red-700"
                                                            >
                                                                <IconX className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* Authentication Fields - Only show when enabled */}
                                    {state.isAuthenticated && (
                                        <>
                                            <div>
                                                <label>Username <span className="text-danger">*</span></label>
                                                <input 
                                                    type="text" 
                                                    name="username" 
                                                    value={state.username} 
                                                    onChange={handleChange} 
                                                    placeholder="Enter Username" 
                                                    className="form-input" 
                                                />
                                                {errors.username && <div className="text-danger text-sm mt-1">{errors.username}</div>}
                                            </div>

                                            <div>
                                                <label>
                                                    {isEdit ? 'New Password (Leave blank to keep current)' : 'Password'} 
                                                    {!isEdit && <span className="text-danger">*</span>}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={state.password}
                                                        onChange={handleChange}
                                                        placeholder={isEdit ? "Enter new password or leave blank" : "Enter Password"}
                                                        className="form-input pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                                                    >
                                                        {showPassword ? 'Hide' : 'Show'}
                                                    </button>
                                                </div>
                                                {errors.password && <div className="text-danger text-sm mt-1">{errors.password}</div>}
                                            </div>
                                        </>
                                    )}
                                </div>
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    isEdit ? 'Update Staff' : 'Add Staff'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Employees Table */}
            <div className="panel">
                <div className="flex justify-between items-center mb-6">
                    <h5 className="font-semibold text-lg dark:text-white-light">Staff List</h5>
                    <div className="flex space-x-2">
                        {/* Filter Button */}
                        <button
                            type="button"
                            onClick={() => setShowFilter(!showFilter)}
                            className="btn btn-outline-primary"
                        >
                            <IconFilter className="ltr:mr-2 rtl:ml-2" />
                            Filter
                        </button>
                        
                        {/* Add Button - Only for Super Admin */}
                        {roleIdforRole === 'Super Admin' && (
                            <button
                                type="button"
                                onClick={openAddForm}
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                Add Staff
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Show active filters */}
                {Object.values(filters).some(val => val !== null && val !== '') && (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="flex flex-wrap gap-2">
                            <span className="text-sm font-medium">Active Filters:</span>
                            {filters.is_driver !== null && filters.is_driver !== '' && (
                                <span className="badge bg-primary">
                                    Driver: {filters.is_driver === '1' ? 'Yes' : 'No'}
                                </span>
                            )}
                            {filters.has_salary !== null && filters.has_salary !== '' && (
                                <span className="badge bg-primary">
                                    Has Salary: {filters.has_salary === '1' ? 'Yes' : 'No'}
                                </span>
                            )}
                            {filters.is_loadman !== null && filters.is_loadman !== '' && (
                                <span className="badge bg-primary">
                                    Loadman: {filters.is_loadman === '1' ? 'Yes' : 'No'}
                                </span>
                            )}
                            {filters.is_active !== null && filters.is_active !== '' && (
                                <span className="badge bg-primary">
                                    Status: {filters.is_active === '1' ? 'Active' : 'Inactive'}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleFilterClear}
                                className="text-danger text-sm hover:underline ml-2"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}
                
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        Title={''}
                        toggle={false}
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

export default Employees;