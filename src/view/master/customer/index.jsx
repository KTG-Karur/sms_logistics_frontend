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
import { getCustomers, createCustomers, updateCustomers, deleteCustomers } from '../../../redux/customerSlice';

const Customers = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Customer');
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();

    // Get customers state from Redux
    const customersState = useSelector((state) => state.CustomerSlice || {});
    const { customersData = [], loading = false, error = null } = customersState;

    const [showForm, setShowForm] = useState(false);
    const [state, setState] = useState({
        customerName: '',
        customerNumber: '',
        isActive: true
    });
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        customerNumber: '',
        customerName: ''
    });

    useEffect(() => {
        dispatch(setPageTitle('Customer Management'));
        fetchCustomers();
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [filters]);

    const fetchCustomers = async () => {
        try {
            // Apply filters
            const filterParams = {};
            if (filters.customerNumber) filterParams.customerNumber = filters.customerNumber;
            if (filters.customerName) filterParams.customerName = filters.customerName;
            
            await dispatch(getCustomers(filterParams)).unwrap();
        } catch (error) {
            console.error('Error fetching customers:', error);
            showMessage('error', error.message || 'Failed to load customers');
        }
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Get paginated data
    const getPaginatedData = () => {
        const dataArray = customersData || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return (customersData || []).length;
    };

    const validateForm = () => {
        const newErrors = {};
        if (!state.customerName?.trim()) {
            newErrors.customerName = 'Customer name is required';
        }
        if (!state.customerNumber?.trim()) {
            newErrors.customerNumber = 'Customer number is required';
        } else if (!/^\d{10}$/.test(state.customerNumber.trim())) {
            newErrors.customerNumber = 'Customer number must be 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const request = {
            customerName: state.customerName.trim(),
            customerNumber: state.customerNumber.trim()
        };

        try {
            if (isEdit && selectedCustomer) {
                await dispatch(
                    updateCustomers({
                        request: request,
                        customerId: selectedCustomer.customer_id 
                    })
                ).unwrap();
                showMessage('success', 'Customer updated successfully');
            } else {
                await dispatch(createCustomers(request)).unwrap();
                showMessage('success', 'Customer added successfully');
            }

            onFormClear();
            fetchCustomers();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', error.message || 'Failed to save customer data');
        }
    };

    const handleDeleteCustomer = async (customer) => {
        showMessage(
            'warning',
            'Are you sure you want to delete this customer?',
            async () => {
                try {
                    await dispatch(deleteCustomers(customer.customer_id)).unwrap();
                    showMessage('success', 'Customer deleted successfully');
                    fetchCustomers();
                } catch (error) {
                    showMessage('error', error.message || 'Failed to delete customer');
                }
            },
            'Yes, delete it'
        );
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const onFormClear = () => {
        setState({
            customerName: '',
            customerNumber: '',
            isActive: true
        });
        setSelectedCustomer(null);
        setIsEdit(false);
        setErrors({});
        setShowForm(false);
    };

    const onEditForm = (customer) => {
        setState({
            customerName: customer.customer_name || '',
            customerNumber: customer.customer_number || '',
            isActive: customer.is_active || true
        });
        setSelectedCustomer(customer);
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

    const clearFilters = () => {
        setFilters({
            customerNumber: '',
            customerName: ''
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
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

    // Filter data based on search term
    const filteredData = customersData.filter((customer) => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            customer.customer_name?.toLowerCase().includes(searchLower) ||
            customer.customer_number?.toLowerCase().includes(searchLower)
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
            Header: 'Customer Name',
            accessor: 'customer_name',
        },
        {
            Header: 'Customer Number',
            accessor: 'customer_number',
        },
        {
            Header: 'Status',
            accessor: 'is_active',
            Cell: ({ value }) => (
                <span className={`badge ${value ? 'bg-success' : 'bg-danger'}`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            Header: 'Created Date',
            accessor: 'created_at',
            Cell: ({ value }) => formatDate(value),
        },
        {
            Header: 'Updated Date',
            accessor: 'updated_at',
            Cell: ({ value }) => formatDate(value),
        },
        ...(roleIdforRole === 'Super Admin' ? [{
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
                            onClick={() => handleDeleteCustomer(row.original)}
                        >
                            <IconTrashLines className="w-4 h-4" />
                        </button>
                    </Tippy>
                </div>
            ),
            width: 120,
        }] : [])
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
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search customers by name or number..."
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
                        {roleIdforRole === 'Super Admin' && (
                            <button
                                type="button"
                                onClick={openAddForm}
                                className="btn btn-primary"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Add Customer
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={filters.customerName}
                                    onChange={handleFilterChange}
                                    placeholder="Filter by customer name"
                                    className="form-input"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Customer Number
                                </label>
                                <input
                                    type="text"
                                    name="customerNumber"
                                    value={filters.customerNumber}
                                    onChange={handleFilterChange}
                                    placeholder="Filter by customer number"
                                    className="form-input"
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

            {/* Customer Form */}
            {showForm && (
                <div className="panel mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            {isEdit ? 'Edit Customer' : 'Add New Customer'}
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
                            {/* Customer Name */}
                            <div>
                                <label className="block mb-1">
                                    Customer Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={state.customerName}
                                    onChange={handleChange}
                                    placeholder="Enter customer name"
                                    className="form-input"
                                    maxLength={100}
                                />
                                {errors.customerName && (
                                    <div className="text-danger text-sm mt-1">
                                        {errors.customerName}
                                    </div>
                                )}
                            </div>

                            {/* Customer Number */}
                            <div>
                                <label className="block mb-1">
                                    Customer Number <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerNumber"
                                    value={state.customerNumber}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    className="form-input"
                                    maxLength={10}
                                />
                                {errors.customerNumber && (
                                    <div className="text-danger text-sm mt-1">
                                        {errors.customerNumber}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter 10-digit mobile number without country code
                                </p>
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
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 mr-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    isEdit ? 'Update Customer' : 'Add Customer'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customers Table */}
            <div className="panel">
                {loading && !showForm ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading customers...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-danger">
                        Error loading customers: {error}
                    </div>
                ) : customersData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No customers found. {roleIdforRole === 'Super Admin' && 'Click "Add Customer" to get started.'}
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        Title={'Customer List'}
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

export default Customers;