import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import { getEmployee, createEmployee, updateEmployee, deleteEmployee, resetEmployeeStatus } from '../../../redux/employeeSlice';
import { getRolesApi } from '../../../api/RoleApi';
import _ from 'lodash';
import Select from 'react-select';
import IconX from '../../../components/Icon/IconX';

const Employees = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Employee');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName; // for role Permission (1.superadmin)
    const dispatch = useDispatch();
    const { getEmployeeSuccess, createEmployeeSuccess, createEmployeeFailed, updateEmployeeSuccess, deleteEmployeeSuccess, updateEmployeeFailed, error, employeeData } = useSelector(
        (state) => state.EmployeeSlice,
    );
    
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
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
        isAuthenticated: false,
        isDriver: false,
        hasSalary: false,
        isLoadman: false,
        username: '',
        password: '',
    });
    const [parentList, setParentList] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [roles, setRoles] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [licencePreview, setLicencePreview] = useState(null);

    // React Select options
    const [roleOptions, setRoleOptions] = useState([]);
    
    useEffect(() => {
        dispatch(setPageTitle('Employee Management'));
        fetchInitialData();
    }, []);

    // Reset to first page when data changes
    useEffect(() => {
        setCurrentPage(0);
    }, [parentList]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            await dispatch(getEmployee());
            await fetchDropdownData();
        } catch (error) {
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Add function to get paginated data
    const getPaginatedData = () => {
        const dataArray = parentList || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    // Add function to get total count
    const getTotalCount = () => {
        return (parentList || []).length;
    };

    const fetchDropdownData = async () => {
        try {
            const rolesResponse = await getRolesApi();
            const rolesData = rolesResponse?.data || [];

            setRoles(rolesData);

            // Prepare React Select options
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
            setParentList(employeeData);
            dispatch(resetEmployeeStatus());
        }
    }, [getEmployeeSuccess, employeeData]);

    useEffect(() => {
        if (createEmployeeSuccess) {
            showMessage('success', 'Employee created successfully');
            onFormClear();
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        } else if (createEmployeeFailed) {
            showMessage('error', error || 'create employee Failed');
            dispatch(resetEmployeeStatus());
        }
    }, [createEmployeeSuccess, createEmployeeFailed]);

    useEffect(() => {
        if (updateEmployeeSuccess) {
            showMessage('success', 'Employee updated successfully');
            onFormClear();
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        } else if (updateEmployeeFailed) {
            showMessage('error', error || 'update employee Failed');
            dispatch(resetEmployeeStatus());
        }
    }, [updateEmployeeSuccess, updateEmployeeFailed]);

    useEffect(() => {
        if (deleteEmployeeSuccess) {
            showMessage('success', 'Employee deleted successfully');
            dispatch(resetEmployeeStatus());
            fetchInitialData();
        }
    }, [deleteEmployeeSuccess]);

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
            Cell: ({ value }) => value ? `₹${value}` : '-'
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
            Header: 'Username', 
            accessor: 'userName',
            Cell: ({ value }) => value || '-'
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
        if (!state.employeeName) newErrors.employeeName = 'Employee name is required';
        if (!state.mobileNo) newErrors.mobileNo = 'Mobile number is required';
        
        // Validation based on toggles
        if (state.isAuthenticated && !state.roleId) {
            newErrors.roleId = 'Role is required when authentication is enabled';
        }
        
        // Validate driver fields if isDriver is true
        if (state.isDriver && !state.licenceNumber) {
            newErrors.licenceNumber = 'Licence number is required for driver';
        }
        
        // Validate salary if hasSalary is true
        if (state.hasSalary && !state.salary) {
            newErrors.salary = 'Salary is required when Has Salary is enabled';
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
        formData.append('employeeName', state.employeeName);
        formData.append('mobileNo', state.mobileNo);
        formData.append('addressI', state.addressI);
        formData.append('pincode', state.pincode);
        formData.append('isDriver', state.isDriver ? 1 : 0);
        formData.append('hasSalary', state.hasSalary ? 1 : 0);
        formData.append('isLoadman', state.isLoadman ? 1 : 0);
        
        // Add salary only if hasSalary is true
        if (state.hasSalary) {
            formData.append('salary', parseFloat(state.salary) || 0);
        }
        
        // Add role only if authenticated
        if (state.isAuthenticated) {
            formData.append('roleId', state.roleId);
        }
        
        // Add driver-specific fields
        if (state.isDriver) {
            formData.append('licenceNumber', state.licenceNumber);
            if (state.licenceFile) {
                formData.append('licenceFile', state.licenceFile);
            }
        }
        
        // Add authentication fields
        formData.append('isAuthenticated', state.isAuthenticated ? 1 : 0);
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
            showMessage('error', 'Failed to save employee data');
        }
    };

    const handleDeleteEmployee = (employee) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this employee?',
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
                }
                
                if (name === 'hasSalary' && !checked) {
                    // When hasSalary is disabled, clear salary
                    updatedState.salary = '';
                }
                
                return updatedState;
            });
        } else {
            setState((prev) => ({
                ...prev,
                [name]: type === 'number' ? parseFloat(value) : value,
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
            {/* Employee Form - Above the Table (only shows when showForm is true) */}
            {showForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            {isEdit ? 'Edit Employee' : 'Add New Employee'}
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
                                    placeholder="Enter Employee Name" 
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

                                    {/* Salary Field - Only show if Has Salary is enabled */}
                                    {state.hasSalary && (
                                        <div>
                                            <label>Salary <span className="text-danger">*</span></label>
                                            <input 
                                                type="number" 
                                                name="salary" 
                                                value={state.salary} 
                                                onChange={handleChange} 
                                                placeholder="Enter Salary Amount" 
                                                className="form-input" 
                                                min="0"
                                                step="0.01"
                                            />
                                            {errors.salary && <div className="text-danger text-sm mt-1">{errors.salary}</div>}
                                        </div>
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
                                                    <p className="text-xs text-gray-500 mt-1">Upload Licence image (JPG, PNG, GIF, WebP only)</p>
                                                    {errors.licenceFile && <div className="text-danger text-sm mt-1">{errors.licenceFile}</div>}
                                                </div>
                                                
                                                {/* Licence Preview */}
                                                {licencePreview && (
                                                    <div className="mt-4 relative">
                                                        <p className="text-sm font-medium mb-2">Preview:</p>
                                                        <div className="relative inline-block">
                                                            <img 
                                                                src={licencePreview} 
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
                            >
                                {isEdit ? 'Update Employee' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Employees Table */}
            <div className="panel">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        Title={'Employee List'}
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

export default Employees;