import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import _ from 'lodash';
import { getPackageType, createPackageType, updatePackageType, deletePackageType, resetPackageTypeStatus } from '../../../redux/packageTypeSlice';

const PackageTypes = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Package Types');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();

    // Get package types from Redux store
    const packageTypeState = useSelector((state) => state.PackageTypeSlice || {});
    const {
        packageTypeData = [],
        loading = false,
        error = null,
        getPackageTypeSuccess = false,
        createPackageTypeSuccess = false,
        updatePackageTypeSuccess = false,
        deletePackageTypeSuccess = false,
    } = packageTypeState;

    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [state, setState] = useState({
        package_type_name: '',
        package_pickup_price: '',
        package_drop_price: '',
    });
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Package Types Management'));
        fetchPackageData();
    }, []);

    useEffect(() => {
        if (createPackageTypeSuccess) {
            showMessage('success', 'Package type created successfully');
            closeModel();
            dispatch(resetPackageTypeStatus());
        }

        if (updatePackageTypeSuccess) {
            showMessage('success', 'Package type updated successfully');
            closeModel();
            dispatch(resetPackageTypeStatus());
        }

        if (deletePackageTypeSuccess) {
            showMessage('success', 'Package type deleted successfully');
            dispatch(resetPackageTypeStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetPackageTypeStatus());
        }
    }, [createPackageTypeSuccess, updatePackageTypeSuccess, deletePackageTypeSuccess, error]);

    const fetchPackageData = async () => {
        try {
            await dispatch(getPackageType({})).unwrap();
        } catch (error) {
            console.error('Error fetching package types:', error);
            showMessage('error', 'Failed to load package types');
        }
    };

    // Transform API data for the table
    const transformedPackageTypes = packageTypeData.map((item, index) => ({
        id: item.package_type_id,
        packageName: item.package_type_name,
        pickupPrice: item.package_pickup_price,
        dropPrice: item.package_drop_price,
        is_active: item.is_active ? 'Active' : 'Inactive',
        originalData: item, // Keep original data for reference
    }));

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        let filteredData = transformedPackageTypes;

        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter((pkg) => pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        let filteredData = transformedPackageTypes;

        if (searchTerm) {
            filteredData = filteredData.filter((pkg) => pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return filteredData.length;
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0); // Reset to first page on search
    };

    const columns = [
        {
            Header: '#',
            accessor: 'id',
            Cell: (row) => <div className="font-medium text-gray-600">{currentPage * pageSize + row.row.index + 1}</div>,
            width: 70,
            className: 'text-center',
        },
        {
            Header: 'Package Name',
            accessor: 'packageName',
            Cell: ({ value }) => <div className="font-medium text-gray-800">{value}</div>,
            sort: true,
        },
        {
            Header: 'Pickup Price',
            accessor: 'pickupPrice',
            Cell: ({ value }) => (
                <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600">₹{parseFloat(value).toFixed(2)}</span>
                    <span className="ml-2 text-xs text-gray-500 bg-blue-50 px-2 py-0.5 rounded">Pickup</span>
                </div>
            ),
            sort: true,
            className: 'text-center',
        },
        {
            Header: 'Drop Price',
            accessor: 'dropPrice',
            Cell: ({ value }) => (
                <div className="flex items-center">
                    <span className="text-lg font-bold text-green-600">₹{parseFloat(value).toFixed(2)}</span>
                    <span className="ml-2 text-xs text-gray-500 bg-green-50 px-2 py-0.5 rounded">Drop</span>
                </div>
            ),
            sort: true,
            className: 'text-center',
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
            width: 100,
            className: 'text-center',
        },
        roleIdforRole === 'Super Admin'
            ? {
                  Header: 'Actions',
                  accessor: 'actions',
                  Cell: ({ row }) => (
                      <div className="flex items-center justify-center space-x-2">
                          <Tippy content="Edit">
                              <button type="button" onClick={() => onEditForm(row.original)} className="btn btn-outline-primary btn-sm p-1.5 rounded-full hover:shadow-md transition-all duration-200">
                                  <IconPencil className="w-4 h-4" />
                              </button>
                          </Tippy>
                          <Tippy content="Delete">
                              <button
                                  type="button"
                                  onClick={() => handleDeletePackage(row.original)}
                                  className="btn btn-outline-danger btn-sm p-1.5 rounded-full hover:shadow-md transition-all duration-200"
                              >
                                  <IconTrashLines className="w-4 h-4" />
                              </button>
                          </Tippy>
                      </div>
                  ),
                  width: 120,
                  className: 'text-center',
              }
            : null,
    ].filter(Boolean);

    const closeModel = () => {
        setIsEdit(false);
        onFormClear();
        setModal(false);
    };

    const onFormClear = () => {
        setState({
            package_type_name: '',
            package_pickup_price: '',
            package_drop_price: '',
        });
        setSelectedItem(null);
        setErrors({});
    };

    const createModel = () => {
        onFormClear();
        setIsEdit(false);
        setModal(true);
    };

    const onEditForm = (data) => {
        setState({
            package_type_name: data.packageName || '',
            package_pickup_price: data.pickupPrice || '',
            package_drop_price: data.dropPrice || '',
        });
        setIsEdit(true);
        setSelectedItem(data);
        setModal(true);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!state.package_type_name.trim()) {
            newErrors.package_type_name = 'Package name is required';
        } else if (state.package_type_name.trim().length < 2) {
            newErrors.package_type_name = 'Package name must be at least 2 characters';
        }

        if (state.package_pickup_price === '' || state.package_pickup_price === null || state.package_pickup_price === undefined) {
            newErrors.package_pickup_price = 'Pickup price is required';
        } else if (isNaN(state.package_pickup_price) || parseFloat(state.package_pickup_price) < 0) {
            newErrors.package_pickup_price = 'Pickup price must be a valid number (0 or positive)';
        }

        if (state.package_drop_price === '' || state.package_drop_price === null || state.package_drop_price === undefined) {
            newErrors.package_drop_price = 'Drop price is required';
        } else if (isNaN(state.package_drop_price) || parseFloat(state.package_drop_price) < 0) {
            newErrors.package_drop_price = 'Drop price must be a valid number (0 or positive)';
        }

        // Check for duplicate package name (excluding current item in edit mode)
        const duplicatePackage = transformedPackageTypes.find((pkg) => pkg.packageName.toLowerCase() === state.package_type_name.toLowerCase() && (!isEdit || pkg.id !== selectedItem?.id));

        if (duplicatePackage) {
            newErrors.package_type_name = 'Package name already exists';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const requestData = {
            package_type_name: state.package_type_name.trim(),
            package_pickup_price: parseFloat(state.package_pickup_price),
            package_drop_price: parseFloat(state.package_drop_price),
        };

        try {
            if (isEdit) {
                await dispatch(
                    updatePackageType({
                        request: requestData,
                        packageTypeId: selectedItem.id,
                    }),
                ).unwrap();
            } else {
                await dispatch(createPackageType(requestData)).unwrap();
            }

            // Refresh data after successful operation
            fetchPackageData();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', error.message || 'Failed to save package data');
        }
    };

    const handleDeletePackage = (pkg) => {
        showMessage(
            'warning',
            `Are you sure you want to delete "${pkg.packageName}"?`,
            async () => {
                try {
                    await dispatch(deletePackageType(pkg.id)).unwrap();
                    fetchPackageData();
                } catch (error) {
                    showMessage('error', error.message || 'Failed to delete package type');
                }
            },
            'Yes, delete it',
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setState((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Package Types</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage package types and their associated pickup/drop prices for load men</p>
                    </div>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading package types...</p>
                    </div>
                ) : (
                    <div className="p-4">
                        <Table
                            columns={columns}
                            Title={' '}
                            description=""
                            toggle={roleIdforRole === 'Super Admin' ? createModel : null}
                            data={getPaginatedData()}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={getTotalCount()}
                            totalPages={Math.ceil(getTotalCount() / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            onSearchChange={handleSearch}
                            pagination={true}
                            isSearchable={true}
                            isSortable={true}
                            searchPlaceholder="Search package types..."
                            showPageSize={true}
                            responsive={true}
                        />
                    </div>
                )}
            </div>

            {/* Empty State */}
            {!loading && transformedPackageTypes.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Package Types Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">Get started by adding your first package type with pickup and drop prices.</p>
                    {roleIdforRole === 'Super Admin' && (
                        <button type="button" onClick={createModel} className="btn btn-primary">
                            Add First Package Type
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            <ModelViewBox
                modal={modal}
                modelHeader={isEdit ? 'Edit Package Type' : 'Add New Package Type'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="lg"
                loading={loading}
                submitBtnText={isEdit ? 'Update Package' : 'Create Package'}
                cancelBtnText="Cancel"
            >
                <div className="space-y-6">
                    {/* Package Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Package Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="package_type_name"
                            value={state.package_type_name}
                            onChange={handleChange}
                            placeholder="Enter package name (e.g., Bag, Box, Document)"
                            className={`form-input w-full ${errors.package_type_name ? 'border-red-500' : 'border-gray-300'}`}
                            autoFocus
                        />
                        {errors.package_type_name && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {errors.package_type_name}
                            </p>
                        )}
                    </div>

                    {/* Price Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pickup Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Pickup Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    name="package_pickup_price"
                                    value={state.package_pickup_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={`form-input w-full pl-10 ${errors.package_pickup_price ? 'border-red-500' : 'border-gray-300'}`}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {errors.package_pickup_price && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {errors.package_pickup_price}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Price paid to load man for pickup service</p>
                        </div>

                        {/* Drop Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Drop Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">₹</span>
                                </div>
                                <input
                                    type="number"
                                    name="package_drop_price"
                                    value={state.package_drop_price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className={`form-input w-full pl-10 ${errors.package_drop_price ? 'border-red-500' : 'border-gray-300'}`}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            {errors.package_drop_price && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {errors.package_drop_price}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Price paid to load man for drop service</p>
                        </div>
                    </div>

                    {/* Price Preview */}
                    {state.package_pickup_price && state.package_drop_price && !errors.package_pickup_price && !errors.package_drop_price && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Price Summary Preview
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Price</div>
                                    <div className="flex items-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{parseFloat(state.package_pickup_price).toFixed(2)}</div>
                                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                            {parseFloat(state.package_pickup_price) === 0 ? 'FREE' : 'PICKUP'}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-green-200 dark:border-green-800">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Drop Price</div>
                                    <div className="flex items-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{parseFloat(state.package_drop_price).toFixed(2)}</div>
                                        <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                                            {parseFloat(state.package_drop_price) === 0 ? 'FREE' : 'DROP'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-start">
                                <svg className="w-4 h-4 mr-1 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                These prices will be used to calculate load man payments for pickup and drop services.
                                {parseFloat(state.package_pickup_price) === 0 && parseFloat(state.package_drop_price) === 0 && (
                                    <span className="ml-1 text-orange-600 dark:text-orange-400 font-medium">Note: Both services are set to free (₹0).</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">Please fix the following errors:</h4>
                                    <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ModelViewBox>
        </div>
    );
};

export default PackageTypes;
