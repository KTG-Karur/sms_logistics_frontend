import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getDeliveriesApi,
    getDeliveryByIdApi,
    updateDeliveryStatusApi,
    getDeliveriesByCustomerApi
} from '../api/DeliveryApi';

// GET all deliveries
export const getDeliveries = createAsyncThunk('delivery/getDeliveries', async (filters = {}, { rejectWithValue }) => {
    try {
        const response = await getDeliveriesApi(filters);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET delivery by ID
export const getDeliveryById = createAsyncThunk('delivery/getDeliveryById', async (bookingId, { rejectWithValue }) => {
    try {
        const response = await getDeliveryByIdApi(bookingId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// UPDATE delivery status
export const updateDeliveryStatus = createAsyncThunk('delivery/updateDeliveryStatus', async ({ bookingId, statusData }, { rejectWithValue }) => {
    try {
        const response = await updateDeliveryStatusApi(bookingId, statusData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET deliveries by customer
export const getDeliveriesByCustomer = createAsyncThunk('delivery/getDeliveriesByCustomer', async ({ customerId, type = 'sender' }, { rejectWithValue }) => {
    try {
        const response = await getDeliveriesByCustomerApi(customerId, type);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const deliverySlice = createSlice({
    name: 'delivery',
    initialState: {
        deliveryData: [],
        currentDelivery: null,
        customerDeliveries: [],
        loading: false,
        error: null,
        getDeliveriesSuccess: false,
        getDeliveriesFailed: false,
        getDeliveryByIdSuccess: false,
        getDeliveryByIdFailed: false,
        updateDeliveryStatusSuccess: false,
        updateDeliveryStatusFailed: false,
        filters: {
            bookingNumber: null,
            deliveryStatus: null,
            fromDate: null,
            toDate: null,
            search: null,
        },
    },
    reducers: {
        resetDeliveryStatus: (state) => {
            state.getDeliveriesSuccess = false;
            state.getDeliveriesFailed = false;
            state.getDeliveryByIdSuccess = false;
            state.getDeliveryByIdFailed = false;
            state.updateDeliveryStatusSuccess = false;
            state.updateDeliveryStatusFailed = false;
            state.error = null;
            state.loading = false;
        },
        setDeliveryFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearDeliveryFilters: (state) => {
            state.filters = {
                bookingNumber: null,
                deliveryStatus: null,
                fromDate: null,
                toDate: null,
                search: null,
            };
        },
        clearCurrentDelivery: (state) => {
            state.currentDelivery = null;
        },
        clearCustomerDeliveries: (state) => {
            state.customerDeliveries = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ALL DELIVERIES
            .addCase(getDeliveries.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getDeliveriesSuccess = false;
                state.getDeliveriesFailed = false;
            })
            .addCase(getDeliveries.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryData = action.payload.data || [];
                state.getDeliveriesSuccess = true;
                state.getDeliveriesFailed = false;
            })
            .addCase(getDeliveries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch failed';
                state.getDeliveriesSuccess = false;
                state.getDeliveriesFailed = true;
            })

            // GET DELIVERY BY ID
            .addCase(getDeliveryById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getDeliveryByIdSuccess = false;
                state.getDeliveryByIdFailed = false;
            })
            .addCase(getDeliveryById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDelivery = action.payload.data || null;
                state.getDeliveryByIdSuccess = true;
                state.getDeliveryByIdFailed = false;
            })
            .addCase(getDeliveryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch by ID failed';
                state.getDeliveryByIdSuccess = false;
                state.getDeliveryByIdFailed = true;
            })

            // UPDATE DELIVERY STATUS
            .addCase(updateDeliveryStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateDeliveryStatusSuccess = false;
                state.updateDeliveryStatusFailed = false;
            })
            .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updatedDelivery = action.payload.data;
                if (updatedDelivery && updatedDelivery.booking_id) {
                    const index = state.deliveryData.findIndex((d) => d.booking_id === updatedDelivery.booking_id);
                    if (index !== -1) {
                        state.deliveryData[index] = updatedDelivery;
                    }
                    if (state.currentDelivery && state.currentDelivery.booking_id === updatedDelivery.booking_id) {
                        state.currentDelivery = updatedDelivery;
                    }
                }
                state.updateDeliveryStatusSuccess = true;
                state.updateDeliveryStatusFailed = false;
            })
            .addCase(updateDeliveryStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update delivery status failed';
                state.updateDeliveryStatusSuccess = false;
                state.updateDeliveryStatusFailed = true;
            })

            // GET DELIVERIES BY CUSTOMER
            .addCase(getDeliveriesByCustomer.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDeliveriesByCustomer.fulfilled, (state, action) => {
                state.loading = false;
                state.customerDeliveries = action.payload.data || [];
            })
            .addCase(getDeliveriesByCustomer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch by customer failed';
                state.customerDeliveries = [];
            });
    },
});

export const {
    resetDeliveryStatus,
    setDeliveryFilters,
    clearDeliveryFilters,
    clearCurrentDelivery,
    clearCustomerDeliveries
} = deliverySlice.actions;

export default deliverySlice.reducer;