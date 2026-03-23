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
import IconSearch from '../../../components/Icon/IconSearch';
import { getCustomers, createCustomers, updateCustomers, deleteCustomers } from '../../../redux/customerSlice';
import _ from 'lodash';

const Customers = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Customer');
    const dispatch = useDispatch();
    
    // Get customers state from Redux
    const customersState = useSelector((state) => state.CustomerSlice || {});
    const { customersData = [], loading = false, error = null } = customersState;
    
    const [showForm, setShowForm] = useState(false);
    const [state, setState] = useState({ customerName: '', customerNumber: '', isActive: true });
    const [errors, setErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Customer Management'));
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            await dispatch(getCustomers({})).unwrap();
        } catch (error) {
            console.error('Error fetching customers:', error);
            showMessage('error', error.message || 'Failed to load customers');
        }
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Filter data based on search term (searches both name and number)
    const getFilteredData = () => {
        if (!searchTerm.trim()) return customersData || [];
        
        const searchLower = searchTerm.toLowerCase().trim();
        return (customersData || []).filter((customer) => {
            return (
                customer.customer_name?.toLowerCase().includes(searchLower) ||
                customer.customer_number?.toLowerCase().includes(searchLower)
            );
        });
    };

    // Get paginated data from filtered results
    const getPaginatedData = () => {
        const filteredData = getFilteredData();
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return getFilteredData().length;
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
                    updateCustomers({ request: request, customerId: selectedCustomer.customer_id })
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
        setState({ customerName: '', customerNumber: '', isActive: true });
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0); // Reset to first page when searching
    };

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(0);
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
                                onClick={() => handleDeleteCustomer(row.original)}
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

    return (
        <div>
            {/* Search Bar */}
            <div className="panel mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by customer name or number..."
                                className="form-input w-full pl-10 pr-10"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <IconX className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {searchTerm && (
                            <div className="text-sm text-gray-500 mt-1">
                                Found {getTotalCount()} result(s)
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {_.includes(accessIds, '2') && (
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
                ) : getTotalCount() === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? (
                            <>
                                No customers found matching "{searchTerm}".
                                <button
                                    onClick={clearSearch}
                                    className="ml-2 text-primary hover:underline"
                                >
                                    Clear search
                                </button>
                            </>
                        ) : (
                            <>
                                No customers found.
                                {_.includes(accessIds, '2') && ' Click "Add Customer" to get started.'}
                            </>
                        )}
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