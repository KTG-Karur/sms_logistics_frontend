import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getPackageApi, 
    getPackageByIdApi,
    getPackagesByCustomerApi,
    createPackageApi, 
    updatePackageApi, 
    updatePackageDeliveryStatusApi,
    addPackagePaymentApi,
    deletePackageApi 
} from '../api/PackageApi';

// GET all packages
export const getPackage = createAsyncThunk('package/getPackage', async (filters = {}, { rejectWithValue }) => {
    try {
        const response = await getPackageApi(filters);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET package by ID
export const getPackageById = createAsyncThunk('package/getPackageById', async (packageId, { rejectWithValue }) => {
    try {
        const response = await getPackageByIdApi(packageId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET packages by customer
export const getPackagesByCustomer = createAsyncThunk('package/getPackagesByCustomer', async ({ customerId, type = 'sender' }, { rejectWithValue }) => {
    try {
        const response = await getPackagesByCustomerApi(customerId, type);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// CREATE package
export const createPackage = createAsyncThunk('package/createPackage', async (request, { rejectWithValue }) => {
    try {
        const response = await createPackageApi(request);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// UPDATE package
export const updatePackage = createAsyncThunk('package/updatePackage', async ({ request, packageId }, { rejectWithValue }) => {
    try {
        const response = await updatePackageApi(request, packageId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// UPDATE delivery status
export const updatePackageDeliveryStatus = createAsyncThunk('package/updatePackageDeliveryStatus', async ({ packageId, statusData }, { rejectWithValue }) => {
    try {
        const response = await updatePackageDeliveryStatusApi(packageId, statusData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// ADD payment to package
export const addPackagePayment = createAsyncThunk('package/addPackagePayment', async ({ packageId, paymentData }, { rejectWithValue }) => {
    try {
        const response = await addPackagePaymentApi(packageId, paymentData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// DELETE package
export const deletePackage = createAsyncThunk('package/deletePackage', async (packageId, { rejectWithValue }) => {
    try {
        const response = await deletePackageApi(packageId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const packageSlice = createSlice({
    name: 'package',
    initialState: {
        packageData: [],
        filteredData: [],
        currentPackage: null,
        customerPackages: [],
        loading: false,
        error: null,
        getPackageSuccess: false,
        getPackageFailed: false,
        getPackageByIdSuccess: false,
        getPackageByIdFailed: false,
        getPackagesByCustomerSuccess: false,
        getPackagesByCustomerFailed: false,
        createPackageSuccess: false,
        createPackageFailed: false,
        updatePackageSuccess: false,
        updatePackageFailed: false,
        updateDeliveryStatusSuccess: false,
        updateDeliveryStatusFailed: false,
        addPaymentSuccess: false,
        addPaymentFailed: false,
        deletePackageSuccess: false,
        deletePackageFailed: false,
        filters: {
            bookingNumber: null,
            llrNumber: null,
            fromCenterId: null,
            toCenterId: null,
            fromCustomerId: null,
            toCustomerId: null,
            deliveryStatus: null,
            paymentStatus: null,
            fromDate: null,
            toDate: null,
            search: null,
        },
    },
    reducers: {
        resetPackageStatus: (state) => {
            state.getPackageSuccess = false;
            state.getPackageFailed = false;
            state.getPackageByIdSuccess = false;
            state.getPackageByIdFailed = false;
            state.getPackagesByCustomerSuccess = false;
            state.getPackagesByCustomerFailed = false;
            state.createPackageSuccess = false;
            state.createPackageFailed = false;
            state.updatePackageSuccess = false;
            state.updatePackageFailed = false;
            state.updateDeliveryStatusSuccess = false;
            state.updateDeliveryStatusFailed = false;
            state.addPaymentSuccess = false;
            state.addPaymentFailed = false;
            state.deletePackageSuccess = false;
            state.deletePackageFailed = false;
            state.error = null;
            state.loading = false;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                bookingNumber: null,
                llrNumber: null,
                fromCenterId: null,
                toCenterId: null,
                fromCustomerId: null,
                toCustomerId: null,
                deliveryStatus: null,
                paymentStatus: null,
                fromDate: null,
                toDate: null,
                search: null,
            };
        },
        clearCurrentPackage: (state) => {
            state.currentPackage = null;
        },
        clearCustomerPackages: (state) => {
            state.customerPackages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH ALL PACKAGES
            .addCase(getPackage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPackageSuccess = false;
                state.getPackageFailed = false;
            })
            .addCase(getPackage.fulfilled, (state, action) => {
                state.loading = false;
                state.packageData = action.payload.data || [];
                state.filteredData = action.payload.data || [];
                state.getPackageSuccess = true;
                state.getPackageFailed = false;
            })
            .addCase(getPackage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch failed';
                state.getPackageSuccess = false;
                state.getPackageFailed = true;
            })

            // FETCH PACKAGE BY ID
            .addCase(getPackageById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPackageByIdSuccess = false;
                state.getPackageByIdFailed = false;
            })
            .addCase(getPackageById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPackage = action.payload.data || null;
                state.getPackageByIdSuccess = true;
                state.getPackageByIdFailed = false;
            })
            .addCase(getPackageById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch by ID failed';
                state.getPackageByIdSuccess = false;
                state.getPackageByIdFailed = true;
            })

            // FETCH PACKAGES BY CUSTOMER
            .addCase(getPackagesByCustomer.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPackagesByCustomerSuccess = false;
                state.getPackagesByCustomerFailed = false;
            })
            .addCase(getPackagesByCustomer.fulfilled, (state, action) => {
                state.loading = false;
                state.customerPackages = action.payload.data || [];
                state.getPackagesByCustomerSuccess = true;
                state.getPackagesByCustomerFailed = false;
            })
            .addCase(getPackagesByCustomer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch by customer failed';
                state.getPackagesByCustomerSuccess = false;
                state.getPackagesByCustomerFailed = true;
            })

            // CREATE PACKAGE
            .addCase(createPackage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createPackageSuccess = false;
                state.createPackageFailed = false;
            })
            .addCase(createPackage.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.packageData.unshift(action.payload.data);
                    state.filteredData.unshift(action.payload.data);
                }
                state.createPackageSuccess = true;
                state.createPackageFailed = false;
            })
            .addCase(createPackage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Create failed';
                state.createPackageSuccess = false;
                state.createPackageFailed = true;
            })

            // UPDATE PACKAGE
            .addCase(updatePackage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updatePackageSuccess = false;
                state.updatePackageFailed = false;
            })
            .addCase(updatePackage.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPackage = action.payload.data;
                if (updatedPackage && updatedPackage.booking_id) {
                    const index = state.packageData.findIndex((pkg) => pkg.booking_id === updatedPackage.booking_id);
                    if (index !== -1) {
                        state.packageData[index] = updatedPackage;
                    }
                    
                    const filteredIndex = state.filteredData.findIndex((pkg) => pkg.booking_id === updatedPackage.booking_id);
                    if (filteredIndex !== -1) {
                        state.filteredData[filteredIndex] = updatedPackage;
                    }
                    
                    if (state.currentPackage && state.currentPackage.booking_id === updatedPackage.booking_id) {
                        state.currentPackage = updatedPackage;
                    }
                }
                state.updatePackageSuccess = true;
                state.updatePackageFailed = false;
            })
            .addCase(updatePackage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update failed';
                state.updatePackageSuccess = false;
                state.updatePackageFailed = true;
            })

            // UPDATE DELIVERY STATUS
            .addCase(updatePackageDeliveryStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateDeliveryStatusSuccess = false;
                state.updateDeliveryStatusFailed = false;
            })
            .addCase(updatePackageDeliveryStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.updateDeliveryStatusSuccess = true;
                state.updateDeliveryStatusFailed = false;
            })
            .addCase(updatePackageDeliveryStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update delivery status failed';
                state.updateDeliveryStatusSuccess = false;
                state.updateDeliveryStatusFailed = true;
            })

            // ADD PAYMENT TO PACKAGE
            .addCase(addPackagePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.addPaymentSuccess = false;
                state.addPaymentFailed = false;
            })
            .addCase(addPackagePayment.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    const updatedPackage = action.payload.data;
                    
                    const index = state.packageData.findIndex((pkg) => pkg.booking_id === updatedPackage.booking_id);
                    if (index !== -1) {
                        state.packageData[index] = updatedPackage;
                    }
                    
                    const filteredIndex = state.filteredData.findIndex((pkg) => pkg.booking_id === updatedPackage.booking_id);
                    if (filteredIndex !== -1) {
                        state.filteredData[filteredIndex] = updatedPackage;
                    }
                    
                    if (state.currentPackage && state.currentPackage.booking_id === updatedPackage.booking_id) {
                        state.currentPackage = updatedPackage;
                    }
                }
                state.addPaymentSuccess = true;
                state.addPaymentFailed = false;
            })
            .addCase(addPackagePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Add payment failed';
                state.addPaymentSuccess = false;
                state.addPaymentFailed = true;
            })

            // DELETE PACKAGE
            .addCase(deletePackage.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deletePackageSuccess = false;
                state.deletePackageFailed = false;
            })
            .addCase(deletePackage.fulfilled, (state, action) => {
                state.loading = false;
                const packageId = action.meta.arg;
                state.packageData = state.packageData.filter((pkg) => pkg.booking_id !== packageId);
                state.filteredData = state.filteredData.filter((pkg) => pkg.booking_id !== packageId);
                if (state.currentPackage && state.currentPackage.booking_id === packageId) {
                    state.currentPackage = null;
                }
                state.deletePackageSuccess = true;
                state.deletePackageFailed = false;
            })
            .addCase(deletePackage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Delete failed';
                state.deletePackageSuccess = false;
                state.deletePackageFailed = true;
            });
    },
});

export const { 
    resetPackageStatus, 
    setFilters, 
    clearFilters, 
    clearCurrentPackage,
    clearCustomerPackages 
} = packageSlice.actions;

export default packageSlice.reducer;