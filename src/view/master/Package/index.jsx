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

const PackageTypes = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Package Types');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();
    
    // Dummy data for package types (Prices for load men)
    const dummyData = [
        { id: 1, packageName: 'Big Bag', pickupPrice: 50, dropPrice: 70 },
        { id: 2, packageName: 'Box', pickupPrice: 30, dropPrice: 45 },
        { id: 3, packageName: 'Small Package', pickupPrice: 20, dropPrice: 35 },
        { id: 4, packageName: 'Medium Package', pickupPrice: 40, dropPrice: 60 },
        { id: 5, packageName: 'Large Package', pickupPrice: 60, dropPrice: 85 },
        { id: 6, packageName: 'XL Package', pickupPrice: 80, dropPrice: 110 },
        { id: 7, packageName: 'Document', pickupPrice: 15, dropPrice: 25 },
        { id: 8, packageName: 'Parcel', pickupPrice: 25, dropPrice: 40 },
        { id: 9, packageName: 'Container', pickupPrice: 100, dropPrice: 150 },
        { id: 10, packageName: 'Crate', pickupPrice: 45, dropPrice: 65 },
    ];

    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [state, setState] = useState({
        packageName: '',
        pickupPrice: '',
        dropPrice: '',
    });
    const [packageList, setPackageList] = useState([]);
    const [errors, setErrors] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(setPageTitle('Package Types Management'));
        fetchPackageData();
    }, []);

    const fetchPackageData = () => {
        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
            setPackageList(dummyData);
            setLoading(false);
        }, 500);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        let filteredData = packageList;
        
        // Apply search filter
        if (searchTerm) {
            filteredData = filteredData.filter(pkg => 
                pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        let filteredData = packageList;
        
        if (searchTerm) {
            filteredData = filteredData.filter(pkg => 
                pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filteredData.length;
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0); // Reset to first page on search
    };

    const columns = [
        { 
            Header: 'S.No', 
            accessor: 'id', 
            Cell: (row) => <div>{(currentPage * pageSize) + row.row.index + 1}</div>,
            width: 80 
        },
        { 
            Header: 'Package Name', 
            accessor: 'packageName',
            sort: true 
        },
        { 
            Header: 'Pickup Price (₹)', 
            accessor: 'pickupPrice',
            Cell: ({ value }) => <div className="font-medium">₹{value}</div>,
            sort: true 
        },
        { 
            Header: 'Drop Price (₹)', 
            accessor: 'dropPrice',
            Cell: ({ value }) => <div className="font-medium">₹{value}</div>,
            sort: true 
        },
        { 
            Header: 'Total Price (₹)', 
            accessor: 'totalPrice',
            Cell: ({ row }) => {
                const pkg = row.original;
                const total = pkg.pickupPrice + pkg.dropPrice;
                return (
                    <div className="font-bold text-blue-600">
                        ₹{total}
                    </div>
                );
            }
        },
        roleIdforRole === 'Super Admin'
            ? {
                  Header: 'Actions',
                  accessor: 'actions',
                  Cell: ({ row }) => (
                      <div className="flex items-center space-x-3">
                          <Tippy content="Edit">
                              <span className="text-success cursor-pointer hover:text-green-700" onClick={() => onEditForm(row.original)}>
                                  <IconPencil className="w-5 h-5" />
                              </span>
                          </Tippy>
                          <Tippy content="Delete">
                              <span className="text-danger cursor-pointer hover:text-red-700" onClick={() => handleDeletePackage(row.original)}>
                                  <IconTrashLines className="w-5 h-5" />
                              </span>
                          </Tippy>
                      </div>
                  ),
                  width: 100
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
            packageName: '',
            pickupPrice: '',
            dropPrice: '',
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
            packageName: data.packageName || '',
            pickupPrice: data.pickupPrice || '',
            dropPrice: data.dropPrice || '',
        });
        setIsEdit(true);
        setSelectedItem(data);
        setModal(true);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!state.packageName.trim()) {
            newErrors.packageName = 'Package name is required';
        } else if (state.packageName.trim().length < 2) {
            newErrors.packageName = 'Package name must be at least 2 characters';
        }
        
        if (!state.pickupPrice) {
            newErrors.pickupPrice = 'Pickup price is required';
        } else if (isNaN(state.pickupPrice) || parseFloat(state.pickupPrice) <= 0) {
            newErrors.pickupPrice = 'Pickup price must be a valid positive number';
        }
        
        if (!state.dropPrice) {
            newErrors.dropPrice = 'Drop price is required';
        } else if (isNaN(state.dropPrice) || parseFloat(state.dropPrice) <= 0) {
            newErrors.dropPrice = 'Drop price must be a valid positive number';
        }
        
        // Check for duplicate package name (excluding current item in edit mode)
        const duplicatePackage = packageList.find(pkg => 
            pkg.packageName.toLowerCase() === state.packageName.toLowerCase() && 
            (!isEdit || pkg.id !== selectedItem?.id)
        );
        
        if (duplicatePackage) {
            newErrors.packageName = 'Package name already exists';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!validateForm()) {
            showMessage('error', 'Please fix the errors in the form');
            return;
        }
        
        const packageData = {
            packageName: state.packageName.trim(),
            pickupPrice: parseFloat(state.pickupPrice),
            dropPrice: parseFloat(state.dropPrice),
        };
        
        try {
            setLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (isEdit) {
                // Update existing package
                const updatedList = packageList.map(pkg => 
                    pkg.id === selectedItem.id 
                        ? { ...packageData, id: selectedItem.id }
                        : pkg
                );
                setPackageList(updatedList);
                showMessage('success', 'Package type updated successfully');
            } else {
                // Add new package
                const newId = Math.max(...packageList.map(pkg => pkg.id), 0) + 1;
                const newPackage = { ...packageData, id: newId };
                setPackageList([...packageList, newPackage]);
                showMessage('success', 'Package type created successfully');
            }
            
            closeModel();
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save package data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePackage = (pkg) => {
        showMessage(
            'warning',
            `Are you sure you want to delete "${pkg.packageName}"?`,
            () => {
                setLoading(true);
                
                // Simulate API call
                setTimeout(() => {
                    const updatedList = packageList.filter(item => item.id !== pkg.id);
                    setPackageList(updatedList);
                    showMessage('success', 'Package type deleted successfully');
                    setLoading(false);
                }, 500);
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
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    return (
        <div>
            {loading && !modal ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div>
                    <Table
                        columns={columns}
                        Title={'Package Types (Load Man Prices)'}
                        description="Manage package types and their associated pickup/drop prices for load men"
                        toggle={roleIdforRole === 'Super Admin' ? createModel : false}
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
                        searchPlaceholder="Search by package name..."
                        btnName="Add Package Type"
                    />
                </div>
            )}

            <ModelViewBox 
                modal={modal} 
                modelHeader={isEdit ? 'Edit Package Type' : 'Add Package Type'} 
                isEdit={isEdit} 
                setModel={closeModel} 
                handleSubmit={onFormSubmit} 
                modelSize="md"
                loading={loading}
                submitBtnText={isEdit ? 'Update' : 'Create'}
            >
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Package Name <span className="text-danger">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="packageName" 
                            value={state.packageName} 
                            onChange={handleChange} 
                            placeholder="e.g., Big Bag, Box, Small Package" 
                            className={`form-input ${errors.packageName ? 'border-red-500' : ''}`}
                        />
                        {errors.packageName && (
                            <div className="text-danger text-sm mt-1 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.packageName}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            Examples: Big Bag, Box, Document, Parcel, Container, Crate
                        </div>
                    </div>

                    <div className="col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Price (₹) <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input 
                                type="number" 
                                name="pickupPrice" 
                                value={state.pickupPrice} 
                                onChange={handleChange} 
                                placeholder="0.00" 
                                className={`form-input pl-8 ${errors.pickupPrice ? 'border-red-500' : ''}`} 
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {errors.pickupPrice && (
                            <div className="text-danger text-sm mt-1 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.pickupPrice}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            Price for pickup by load man
                        </div>
                    </div>

                    <div className="col-span-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drop Price (₹) <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <input 
                                type="number" 
                                name="dropPrice" 
                                value={state.dropPrice} 
                                onChange={handleChange} 
                                placeholder="0.00" 
                                className={`form-input pl-8 ${errors.dropPrice ? 'border-red-500' : ''}`} 
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {errors.dropPrice && (
                            <div className="text-danger text-sm mt-1 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.dropPrice}
                            </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                            Price for drop by load man
                        </div>
                    </div>

                    {/* Price Summary */}
                    {state.pickupPrice && state.dropPrice && !errors.pickupPrice && !errors.dropPrice && (
                        <div className="col-span-12">
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                <h4 className="font-medium text-gray-800 mb-2 text-sm">Price Summary:</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-2 bg-white rounded border border-gray-300">
                                        <div className="text-xs text-gray-600">Pickup</div>
                                        <div className="text-lg font-bold text-blue-600">₹{parseFloat(state.pickupPrice).toFixed(2)}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded border border-gray-300">
                                        <div className="text-xs text-gray-600">Drop</div>
                                        <div className="text-lg font-bold text-green-600">₹{parseFloat(state.dropPrice).toFixed(2)}</div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded border border-gray-300 bg-blue-50">
                                        <div className="text-xs text-gray-600">Total</div>
                                        <div className="text-lg font-bold text-blue-700">
                                            ₹{(parseFloat(state.pickupPrice) + parseFloat(state.dropPrice)).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600">
                                    Note: These are prices paid to load men for pickup and drop services
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Validation Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="col-span-12">
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h4 className="font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                                        <ul className="text-sm text-red-700 list-disc list-inside">
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
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