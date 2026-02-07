import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage, showConfirmationDialog } from '../../util/AllFunction';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconSave from '../../components/Icon/IconSave';
import Select from 'react-select';
import { baseURL } from '../../api/ApiConfig';
import { deleteVisitorCard } from '../../redux/productEnquirySlice';

const ProductEnquiryForm = ({ onSubmit, onReset, isEdit, selectedEnquiry, loading, expos, products }) => {
    const dispatch = useDispatch();

    const { deleteVisitorCardSuccess, deleteVisitorCardFailed, deleteVisitorCardLoading } = useSelector((state) => ({
        deleteVisitorCardSuccess: state.ProductEnquirySlice.deleteVisitorCardSuccess,
        deleteVisitorCardFailed: state.ProductEnquirySlice.deleteVisitorCardFailed,
        deleteVisitorCardLoading: state.ProductEnquirySlice.loading,
    }));

    const [formState, setFormState] = useState({
        expo_id: '',
        visitor_name: '',
        company_name: '',
        contact_number: '',
        visiting_card: '',
        city: '',
        country: '',
        email: '',
        nature_of_enquiry: '',
        remarks: '',
        products: [],
    });

    const [errors, setErrors] = useState([]);
    const [isExpanded, setIsExpanded] = useState(!isEdit);
    const [visitorImages, setVisitorImages] = useState([]);
    const [visitorImageFiles, setVisitorImageFiles] = useState([]);
    const [existingVisitorImages, setExistingVisitorImages] = useState([]);

    // Country options
    const countryOptions = [
        { value: 'India', label: 'India' },
        { value: 'United States', label: 'United States' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'Germany', label: 'Germany' },
        { value: 'France', label: 'France' },
        { value: 'Italy', label: 'Italy' },
        { value: 'Spain', label: 'Spain' },
        { value: 'China', label: 'China' },
        { value: 'Japan', label: 'Japan' },
        { value: 'South Korea', label: 'South Korea' },
        { value: 'Australia', label: 'Australia' },
        { value: 'Canada', label: 'Canada' },
        { value: 'Brazil', label: 'Brazil' },
        { value: 'Mexico', label: 'Mexico' },
        { value: 'Russia', label: 'Russia' },
        { value: 'Turkey', label: 'Turkey' },
        { value: 'United Arab Emirates', label: 'United Arab Emirates' },
        { value: 'Saudi Arabia', label: 'Saudi Arabia' },
        { value: 'South Africa', label: 'South Africa' },
        { value: 'Bangladesh', label: 'Bangladesh' },
        { value: 'Sri Lanka', label: 'Sri Lanka' },
        { value: 'Pakistan', label: 'Pakistan' },
        { value: 'Vietnam', label: 'Vietnam' },
        { value: 'Thailand', label: 'Thailand' },
        { value: 'Indonesia', label: 'Indonesia' },
        { value: 'Malaysia', label: 'Malaysia' },
        { value: 'Singapore', label: 'Singapore' },
    ];

    // Expo options
    const expoOptions = expos
        .filter((expo) => expo.isActive === 1)
        .map((expo) => ({
            value: expo.id,
            label: expo.expoName,
        }));

    // Product options
    const productOptions = products
        .filter((product) => product.isActive)
        .map((product) => ({
            value: product.productId,
            label: `${product.productNo} - ${product.productName}`,
            productNo: product.productNo,
            productName: product.productName,
            productComposition: product.productComposition,
            size: product.size,
            fabricName: product.fabricName,
            washingDetails: product.washingDetails,
            fillingMaterial: product.fillingMaterial,
            lowQuantityPrice: product.lowQuantityPrice,
            mediumQuantityPrice: product.mediumQuantityPrice,
            highQuantityPrice: product.highQuantityPrice,
            moq: product.moq,
            packaging: product.packaging,
            image: product.productImage,
        }));

    // Reset form when isEdit changes to false
    useEffect(() => {
        if (!isEdit && !selectedEnquiry) {
            resetForm();
        }
    }, [isEdit, selectedEnquiry]);

    // Set form state when editing
    useEffect(() => {
        if (isEdit && selectedEnquiry) {
            setFormState({
                expo_id: selectedEnquiry.expoId || '',
                visitor_name: selectedEnquiry.visitorName || '',
                company_name: selectedEnquiry.companyName || '',
                contact_number: selectedEnquiry.contactNumber || '',
                visiting_card: selectedEnquiry.visitingCard || '',
                city: selectedEnquiry.city || '',
                country: selectedEnquiry.country || '',
                email: selectedEnquiry.email || '',
                nature_of_enquiry: selectedEnquiry.natureOfEnquiry || '',
                remarks: selectedEnquiry.remarks || '',
                products:
                    selectedEnquiry.products?.map((p) => ({
                        productId: p.productId,
                        sampleRequired: p.sampleRequired || false,
                        quantity: p.quantity || 0,
                        priceRange: p.priceRange || 'medium',
                        priceRangeName: p.priceRangeName || 'medium_quantity_price', // Add priceRangeName field
                        price: p.price || parseFloat(p.price) || 0,
                        remarks: p.remarks || '',
                    })) || [],
            });

            // Handle multiple visiting card images
            if (selectedEnquiry.visitingCard) {
                try {
                    const parsedImages = JSON.parse(selectedEnquiry.visitingCard);
                    if (Array.isArray(parsedImages)) {
                        setExistingVisitorImages(parsedImages);
                        setVisitorImages(parsedImages.map((img) => `${baseURL}${img}`));
                    } else {
                        setExistingVisitorImages([selectedEnquiry.visitingCard]);
                        setVisitorImages([`${baseURL}${selectedEnquiry.visitingCard}`]);
                    }
                } catch (error) {
                    setExistingVisitorImages([selectedEnquiry.visitingCard]);
                    setVisitorImages([`${baseURL}${selectedEnquiry.visitingCard}`]);
                }
            }
            setIsExpanded(true);
        }
    }, [isEdit, selectedEnquiry]);

    // Handle delete visitor card success/failure
    useEffect(() => {
        if (deleteVisitorCardSuccess) {
            showMessage('success', 'Visitor card image deleted successfully');
        }
        if (deleteVisitorCardFailed) {
            showMessage('error', 'Failed to delete visitor card image');
        }
    }, [deleteVisitorCardSuccess, deleteVisitorCardFailed]);

    // Reset form function
    const resetForm = () => {
        setFormState({
            expo_id: '',
            visitor_name: '',
            company_name: '',
            contact_number: '',
            visiting_card: '',
            city: '',
            country: '',
            email: '',
            nature_of_enquiry: '',
            remarks: '',
            products: [],
        });
        setVisitorImages([]);
        setVisitorImageFiles([]);
        setExistingVisitorImages([]);
        setErrors([]);
    };

    const handleInputChange = (field, value) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addProduct = () => {
        setFormState((prev) => ({
            ...prev,
            products: [
                ...prev.products,
                {
                    productId: '',
                    sampleRequired: false,
                    quantity: 0,
                    priceRange: 'medium',
                    priceRangeName: 'medium_quantity_price',
                    price: 0,
                    remarks: '',
                },
            ],
        }));
    };

    const removeProduct = (index) => {
        setFormState((prev) => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
        }));
    };

    const updateProduct = (index, field, value) => {
        setFormState((prev) => ({
            ...prev,
            products: prev.products.map((product, i) => (i === index ? { ...product, [field]: value } : product)),
        }));
    };

    // Handle price range selection - now sets priceRangeName instead of price
    const handlePriceRangeSelect = (index, range, productDetails) => {
        let priceRangeName = '';
        let priceValue = 0;

        if (!productDetails) {
            // If no product details, don't update
            return;
        }

        switch (range) {
            case 'low':
                priceRangeName = 'low_quantity_price';
                priceValue = parseFloat(productDetails.lowQuantityPrice) || 0;
                break;
            case 'medium':
                priceRangeName = 'medium_quantity_price';
                priceValue = parseFloat(productDetails.mediumQuantityPrice) || 0;
                break;
            case 'high':
                priceRangeName = 'high_quantity_price';
                priceValue = parseFloat(productDetails.highQuantityPrice) || 0;
                break;
            default:
                priceRangeName = 'medium_quantity_price';
                priceValue = parseFloat(productDetails.mediumQuantityPrice) || 0;
        }

        updateProduct(index, 'priceRange', range);
        updateProduct(index, 'priceRangeName', priceRangeName);
        updateProduct(index, 'price', priceValue);
    };

    const handleVisitorImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (visitorImages.length + files.length > 5) {
            showMessage('error', 'Maximum 5 images allowed.');
            return;
        }

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Please select valid image files only');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', 'Image size should be less than 5MB');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setVisitorImageFiles((prev) => [...prev, ...validFiles]);

        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setVisitorImages((prev) => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeVisitorImage = async (index) => {
        const imageToRemove = visitorImages[index];
        const isExistingImage = imageToRemove.includes(baseURL);

        if (isExistingImage && isEdit && selectedEnquiry) {
            const imageName = imageToRemove.replace(`${baseURL}`, '');
            const confirmed = await showConfirmationDialog('Delete this image?', 'Yes, Delete', 'Image will be removed permanently.');

            if (confirmed) {
                try {
                    await dispatch(
                        deleteVisitorCard({
                            enquiryId: selectedEnquiry.enquiryId,
                            imageName,
                        })
                    ).unwrap();

                    setVisitorImages((prev) => prev.filter((_, i) => i !== index));
                    setExistingVisitorImages((prev) => prev.filter((_, i) => i !== index));
                } catch (error) {
                    showMessage('error', `Failed to delete image: ${error.message}`);
                }
            }
        } else {
            setVisitorImages((prev) => prev.filter((_, i) => i !== index));
            setVisitorImageFiles((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const requiredFields = {
            'Expo/Fair Name': formState.expo_id,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            showMessage('error', `Please fill in required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate all products have productId
        const productsWithoutSelection = formState.products.filter((p) => !p.productId);
        if (productsWithoutSelection.length > 0) {
            showMessage('error', 'Please select a product for all items');
            return;
        }

        // Prepare form data - send priceRangeName instead of price
        const submitData = {
            expo_id: formState.expo_id,
            ...(formState.visitor_name && { visitor_name: formState.visitor_name }),
            ...(formState.company_name && { company_name: formState.company_name }),
            ...(formState.contact_number && { contact_number: formState.contact_number }),
            ...(formState.visiting_card && { visiting_card: formState.visiting_card }),
            ...(formState.city && { city: formState.city }),
            ...(formState.country && { country: formState.country }),
            ...(formState.email && { email: formState.email }),
            ...(formState.nature_of_enquiry && { nature_of_enquiry: formState.nature_of_enquiry }),
            ...(formState.remarks && { remarks: formState.remarks }),
            products: formState.products.map((product) => ({
                productId: product.productId,
                sampleRequired: product.sampleRequired,
                quantity: product.quantity,
                price: product.priceRangeName, // Send priceRangeName (low_quantity_price, medium_quantity_price, high_quantity_price)
                remarks: product.remarks,
            })),
        };

        onSubmit(submitData, visitorImageFiles);
    };

    const handleCancel = () => {
        resetForm();
        setIsExpanded(false);
        onReset();
    };

    const toggleForm = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded && isEdit) {
            handleCancel();
        }
    };

    const getAvailableProducts = useMemo(() => {
        const selectedProductIds = formState.products.map((p) => p.productId).filter((id) => id);
        return productOptions.filter((product) => !selectedProductIds.includes(product.value));
    }, [formState.products, productOptions]);

    const getProductDetails = (productId) => {
        return productOptions.find((p) => p.value === productId);
    };

    // Format price for display
    const formatPrice = (price) => {
        if (!price || price === 0) return '$0.00';
        return `$${parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Custom styles for React Select - Fixed to match text field size
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '0px 2px', // Reduced padding
            boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.1)' : 'none',
            minHeight: '38px', // Match text field height
            backgroundColor: state.isFocused ? '#f9fafb' : 'white',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
                borderColor: state.isFocused ? '#4f46e5' : '#9ca3af',
            },
            fontSize: '14px', // Added font size to match
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0px 8px', // Adjust padding
        }),
        input: (provided) => ({
            ...provided,
            margin: '0px',
            padding: '0px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            padding: '8px 12px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 9999,
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '14px',
            color: '#6b7280',
        }),
        singleValue: (provided) => ({
            ...provided,
            fontSize: '14px',
        }),
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 cursor-pointer hover:shadow-sm transition-all duration-200" onClick={toggleForm}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-1 bg-white/10 rounded-md">
                            <IconPlus className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-white">{isEdit ? 'Edit Enquiry' : 'Create New Enquiry'}</h2>
                    </div>
                    <div className="text-white/80">
                        <svg className={`w-4 h-4 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            {isExpanded && (
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Expo/Fair Name - Required */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Expo/Fair Name <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={expoOptions}
                                value={expoOptions.find((option) => option.value === formState.expo_id)}
                                onChange={(selected) => handleInputChange('expo_id', selected?.value || '')}
                                placeholder="Select Expo/Fair"
                                styles={customStyles}
                                isClearable
                            />
                        </div>

                        {/* Other Basic Fields */}
                        {[
                            { field: 'visitor_name', placeholder: 'Visitor Name' },
                            { field: 'company_name', placeholder: 'Company Name' },
                            { field: 'contact_number', placeholder: 'Contact Number' },
                            { field: 'city', placeholder: 'City' },
                            { field: 'country', placeholder: 'Country', isSelect: true },
                            { field: 'email', placeholder: 'Email Address' },
                        ].map(({ field, placeholder, isSelect }) => (
                            <div key={field}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{placeholder}</label>
                                {isSelect ? (
                                    <Select
                                        options={countryOptions}
                                        value={countryOptions.find((option) => option.value === formState[field])}
                                        onChange={(selected) => handleInputChange(field, selected?.value || '')}
                                        placeholder={placeholder}
                                        styles={customStyles}
                                        isClearable
                                    />
                                ) : (
                                    <input
                                        type={field === 'email' ? 'email' : 'text'}
                                        value={formState[field]}
                                        onChange={(e) => handleInputChange(field, e.target.value)}
                                        placeholder={placeholder}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Visiting Card Images */}
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-700 mb-2">Visiting Card Images ({visitorImages.length}/5)</label>

                        {visitorImages.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                                {visitorImages.map((image, index) => {
                                    const isExistingImage = image.includes(baseURL);
                                    return (
                                        <div key={index} className="relative">
                                            <img src={image} crossOrigin="anonymous" alt={`Visitor card ${index + 1}`} className="w-full h-20 rounded-md object-cover border border-gray-300" />
                                            <button
                                                type="button"
                                                onClick={() => removeVisitorImage(index)}
                                                disabled={deleteVisitorCardLoading}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors duration-150"
                                            >
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            {isExistingImage && <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">Saved</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}

                        {visitorImages.length < 5 && (
                            <div className="flex gap-2">
                                <label className="flex-1">
                                    <input type="file" accept="image/*" capture="environment" onChange={handleVisitorImageUpload} className="hidden" />
                                    <div className="bg-indigo-600 text-white px-3 py-2 rounded-md flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors duration-150 cursor-pointer text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                            />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Camera</span>
                                    </div>
                                </label>

                                <label className="flex-1">
                                    <input type="file" accept="image/*" multiple onChange={handleVisitorImageUpload} className="hidden" />
                                    <div className="bg-emerald-600 text-white px-3 py-2 rounded-md flex items-center justify-center space-x-2 hover:bg-emerald-700 transition-colors duration-150 cursor-pointer text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span>Gallery</span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Nature of Enquiry */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nature of Enquiry</label>
                        <textarea
                            value={formState.nature_of_enquiry}
                            onChange={(e) => handleInputChange('nature_of_enquiry', e.target.value)}
                            placeholder="Describe the enquiry purpose, requirements, timeline..."
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 resize-none"
                        />
                    </div>

                    {/* Products Section - Updated */}
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">Products</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Select products and choose pricing</p>
                            </div>
                            <button
                                type="button"
                                onClick={addProduct}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-md flex items-center space-x-2 hover:bg-indigo-700 transition-colors duration-150 text-sm font-medium"
                            >
                                <IconPlus className="w-3.5 h-3.5" />
                                <span>Add Product</span>
                            </button>
                        </div>

                        {formState.products.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <p className="text-sm font-medium text-gray-600">No products added yet</p>
                                <p className="text-xs text-gray-500 mt-1">Add products to this enquiry</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formState.products.map((product, index) => {
                                    const productDetails = getProductDetails(product.productId);
                                    const currentPriceRange = product.priceRange || 'medium';

                                    return (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white hover:border-indigo-300 transition-all duration-200">
                                            {/* Product Header */}
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                                                <div className="flex items-center space-x-2">
                                                    <div className="bg-indigo-100 text-indigo-700 text-xs font-semibold w-6 h-6 rounded-md flex items-center justify-center">{index + 1}</div>
                                                    <h4 className="text-sm font-semibold text-gray-800">Product Details</h4>
                                                </div>
                                                {formState.products.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(index)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-150"
                                                    >
                                                        <IconTrashLines className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                {/* Product Selection & Large Image */}
                                                <div className="flex flex-col md:flex-row gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Select Product <span className="text-red-500">*</span>
                                                        </label>
                                                        <Select
                                                            options={getAvailableProducts}
                                                            value={productOptions.find((option) => option.value === product.productId)}
                                                            onChange={(selected) => {
                                                                updateProduct(index, 'productId', selected?.value || '');
                                                                if (selected) {
                                                                    const productDetails = getProductDetails(selected.value);
                                                                    handlePriceRangeSelect(index, 'medium', productDetails);
                                                                }
                                                            }}
                                                            placeholder="Search or select product"
                                                            styles={customStyles}
                                                            isClearable
                                                        />
                                                    </div>

                                                    {productDetails && (
                                                        <div className="flex justify-center">
                                                            <div className="relative">
                                                                <img
                                                                    src={`${baseURL}${productDetails.image}`}
                                                                    alt="Product"
                                                                    className="w-48 h-48 rounded-xl object-cover border-4 border-gray-100 shadow-lg"
                                                                    crossOrigin="anonymous"
                                                                    onError={(e) => {
                                                                        e.target.src = '/assets/images/default-product.jpg';
                                                                    }}
                                                                />
                                                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md border border-gray-200">
                                                                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[180px]">{productDetails.productName}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Specifications */}
                                                {productDetails && (
                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                                        <h5 className="font-semibold text-blue-800 mb-4">Product Specifications</h5>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                <div className="text-xs text-gray-500 font-medium mb-1">Product No</div>
                                                                <div className="text-sm font-semibold text-gray-800">{productDetails.productNo}</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                <div className="text-xs text-gray-500 font-medium mb-1">Composition</div>
                                                                <div className="text-sm font-semibold text-gray-800 truncate">{productDetails.productComposition}</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                <div className="text-xs text-gray-500 font-medium mb-1">Size</div>
                                                                <div className="text-sm font-semibold text-gray-800">{productDetails.size}</div>
                                                            </div>
                                                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                <div className="text-xs text-gray-500 font-medium mb-1">Fabric</div>
                                                                <div className="text-sm font-semibold text-gray-800 truncate">{productDetails.fabricName}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Price Cards - Now Clickable */}
                                                {productDetails && (
                                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                        <label className="block text-xs font-medium text-gray-700 mb-2">
                                                            Select Price Range <span className="text-red-500">*</span> (Medium selected by default)
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            {[
                                                                {
                                                                    range: 'low',
                                                                    label: 'Low Quantity',
                                                                    borderColor: 'border-emerald-400',
                                                                    bgColor: 'bg-emerald-50',
                                                                    textColor: 'text-emerald-700',
                                                                    dotColor: 'bg-emerald-500',
                                                                },
                                                                {
                                                                    range: 'medium',
                                                                    label: 'Medium Quantity',
                                                                    borderColor: 'border-blue-400',
                                                                    bgColor: 'bg-blue-50',
                                                                    textColor: 'text-blue-700',
                                                                    dotColor: 'bg-blue-500',
                                                                },
                                                                {
                                                                    range: 'high',
                                                                    label: 'High Quantity',
                                                                    borderColor: 'border-rose-400',
                                                                    bgColor: 'bg-rose-50',
                                                                    textColor: 'text-rose-700',
                                                                    dotColor: 'bg-rose-500',
                                                                },
                                                            ].map(({ range, label, borderColor, bgColor, textColor, dotColor }) => {
                                                                const price =
                                                                    range === 'low'
                                                                        ? productDetails.lowQuantityPrice
                                                                        : range === 'medium'
                                                                        ? productDetails.mediumQuantityPrice
                                                                        : productDetails.highQuantityPrice;

                                                                const isSelected = currentPriceRange === range;

                                                                return (
                                                                    <div
                                                                        key={range}
                                                                        onClick={() => handlePriceRangeSelect(index, range, productDetails)}
                                                                        className={`
                                                                            border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer
                                                                            ${isSelected ? `${borderColor} ${bgColor} shadow-md` : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                                                        `}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="flex items-center space-x-2">
                                                                                <div className={`w-3 h-3 rounded-full ${isSelected ? dotColor : 'bg-gray-300'}`}></div>
                                                                                <span className={`text-sm font-semibold ${isSelected ? textColor : 'text-gray-700'}`}>{label}</span>
                                                                            </div>
                                                                            {isSelected && (
                                                                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path
                                                                                            fillRule="evenodd"
                                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                                            clipRule="evenodd"
                                                                                        />
                                                                                    </svg>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className={`text-xl font-bold ${isSelected ? textColor : 'text-gray-900'}`}>{formatPrice(price)}</div>
                                                                        <div className={`text-xs mt-1 ${isSelected ? textColor : 'text-gray-600'}`}>
                                                                            {range === 'low' ? 'For small orders' : range === 'medium' ? 'For medium orders' : 'For bulk orders'}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Product Options */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={product.sampleRequired}
                                                            onChange={(e) => updateProduct(index, 'sampleRequired', e.target.checked)}
                                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                        />
                                                        <label className="text-xs font-medium text-gray-700">Sample Required</label>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                                        <input
                                                            type="text"
                                                            value={product.quantity || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || /^\d+$/.test(value)) {
                                                                    updateProduct(index, 'quantity', value === '' ? 0 : parseInt(value));
                                                                }
                                                            }}
                                                            placeholder="Enter quantity"
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                                                        <input
                                                            type="text"
                                                            value={product.remarks}
                                                            onChange={(e) => updateProduct(index, 'remarks', e.target.value)}
                                                            placeholder="Product remarks..."
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Additional Remarks */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Additional Remarks</label>
                        <textarea
                            value={formState.remarks}
                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                            placeholder="Any additional notes or special instructions..."
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 resize-none"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200">
                        <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || deleteVisitorCardLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <IconSave className="w-4 h-4" />
                            <span>{loading ? 'Saving...' : isEdit ? 'Update Enquiry' : 'Create Enquiry'}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProductEnquiryForm;
