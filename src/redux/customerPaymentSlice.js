import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getCustomerPaymentsByDateApi,
    getCustomerBookingsAndPaymentsApi,
    makeCustomerBulkPaymentApi,
    getAllCustomerPaymentRecordsApi,
    getCustomerPaymentSummaryApi,
    getAllCustomersPaymentSummaryApi,
    getCustomerPendingPaymentsApi
} from '../api/PackageApi';

// GET customer payments by date
export const getCustomerPaymentsByDate = createAsyncThunk(
    'customerPayment/getCustomerPaymentsByDate', 
    async ({ customerId, startDate, endDate, type = 'sender' }, { rejectWithValue }) => {
        try {
            const response = await getCustomerPaymentsByDateApi(customerId, startDate, endDate, type);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// GET customer bookings and payments
export const getCustomerBookingsAndPayments = createAsyncThunk(
    'customerPayment/getCustomerBookingsAndPayments', 
    async ({ customerId, type = 'sender' }, { rejectWithValue }) => {
        try {
            const response = await getCustomerBookingsAndPaymentsApi(customerId, type);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// POST make bulk payment
export const makeCustomerBulkPayment = createAsyncThunk(
    'customerPayment/makeCustomerBulkPayment', 
    async ({ customerId, paymentData, type = 'sender' }, { rejectWithValue }) => {
        try {
            const response = await makeCustomerBulkPaymentApi(customerId, paymentData, type);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// GET all customer payment records
export const getAllCustomerPaymentRecords = createAsyncThunk(
    'customerPayment/getAllCustomerPaymentRecords', 
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await getAllCustomerPaymentRecordsApi(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// GET customer payment summary
export const getCustomerPaymentSummary = createAsyncThunk(
    'customerPayment/getCustomerPaymentSummary', 
    async ({ customerId, type = 'sender' }, { rejectWithValue }) => {
        try {
            const response = await getCustomerPaymentSummaryApi(customerId, type);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// GET all customers payment summary
export const getAllCustomersPaymentSummary = createAsyncThunk(
    'customerPayment/getAllCustomersPaymentSummary', 
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await getAllCustomersPaymentSummaryApi(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// NEW: GET customer pending payments (only bookings with pending payment)
export const getCustomerPendingPayments = createAsyncThunk(
    'customerPayment/getCustomerPendingPayments', 
    async (customerId, { rejectWithValue }) => {
        try {
            const response = await getCustomerPendingPaymentsApi(customerId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const customerPaymentSlice = createSlice({
    name: 'customerPayment',
    initialState: {
        // Data states
        paymentsByDate: null,
        customerBookingsPayments: null,
        bulkPaymentResult: null,
        allPaymentRecords: null,
        customerPaymentSummary: null,
        allCustomersPaymentSummary: null,
        pendingPayments: null, // NEW
        
        // Loading states
        loading: false,
        
        // Success flags
        getPaymentsByDateSuccess: false,
        getCustomerBookingsPaymentsSuccess: false,
        makeBulkPaymentSuccess: false,
        getAllPaymentRecordsSuccess: false,
        getPaymentSummarySuccess: false,
        getAllCustomersSummarySuccess: false,
        getPendingPaymentsSuccess: false, // NEW
        
        // Error states
        error: null,
        getPaymentsByDateFailed: false,
        getCustomerBookingsPaymentsFailed: false,
        makeBulkPaymentFailed: false,
        getAllPaymentRecordsFailed: false,
        getPaymentSummaryFailed: false,
        getAllCustomersSummaryFailed: false,
        getPendingPaymentsFailed: false, // NEW
        
        // Filters for payment records
        filters: {
            customerId: null,
            startDate: null,
            endDate: null,
            paymentStatus: null,
            search: null,
            status: '',
            page: 1,
            limit: 20
        }
    },
    reducers: {
        resetCustomerPaymentStatus: (state) => {
            state.getPaymentsByDateSuccess = false;
            state.getCustomerBookingsPaymentsSuccess = false;
            state.makeBulkPaymentSuccess = false;
            state.getAllPaymentRecordsSuccess = false;
            state.getPaymentSummarySuccess = false;
            state.getAllCustomersSummarySuccess = false;
            state.getPendingPaymentsSuccess = false; // NEW
            
            state.getPaymentsByDateFailed = false;
            state.getCustomerBookingsPaymentsFailed = false;
            state.makeBulkPaymentFailed = false;
            state.getAllPaymentRecordsFailed = false;
            state.getPaymentSummaryFailed = false;
            state.getAllCustomersSummaryFailed = false;
            state.getPendingPaymentsFailed = false; // NEW
            
            state.error = null;
            state.loading = false;
        },
        
        setPaymentFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        
        clearPaymentFilters: (state) => {
            state.filters = {
                customerId: null,
                startDate: null,
                endDate: null,
                paymentStatus: null,
                search: null,
                status: '',
                page: 1,
                limit: 20
            };
        },
        
        clearPaymentData: (state) => {
            state.paymentsByDate = null;
            state.customerBookingsPayments = null;
            state.bulkPaymentResult = null;
            state.allPaymentRecords = null;
            state.customerPaymentSummary = null;
            state.allCustomersPaymentSummary = null;
            state.pendingPayments = null; // NEW
        },
        
        clearBulkPaymentResult: (state) => {
            state.bulkPaymentResult = null;
            state.makeBulkPaymentSuccess = false;
            state.makeBulkPaymentFailed = false;
        },
        
        // NEW: Clear pending payments
        clearPendingPayments: (state) => {
            state.pendingPayments = null;
            state.getPendingPaymentsSuccess = false;
            state.getPendingPaymentsFailed = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // GET CUSTOMER PAYMENTS BY DATE
            .addCase(getCustomerPaymentsByDate.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentsByDateSuccess = false;
                state.getPaymentsByDateFailed = false;
            })
            .addCase(getCustomerPaymentsByDate.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentsByDate = action.payload.data || null;
                state.getPaymentsByDateSuccess = true;
                state.getPaymentsByDateFailed = false;
            })
            .addCase(getCustomerPaymentsByDate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch customer payments by date';
                state.getPaymentsByDateSuccess = false;
                state.getPaymentsByDateFailed = true;
            })
            
            // GET CUSTOMER BOOKINGS AND PAYMENTS
            .addCase(getCustomerBookingsAndPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCustomerBookingsPaymentsSuccess = false;
                state.getCustomerBookingsPaymentsFailed = false;
            })
            .addCase(getCustomerBookingsAndPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.customerBookingsPayments = action.payload.data || null;
                state.getCustomerBookingsPaymentsSuccess = true;
                state.getCustomerBookingsPaymentsFailed = false;
            })
            .addCase(getCustomerBookingsAndPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch customer bookings and payments';
                state.getCustomerBookingsPaymentsSuccess = false;
                state.getCustomerBookingsPaymentsFailed = true;
            })
            
            // MAKE BULK PAYMENT
            .addCase(makeCustomerBulkPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.makeBulkPaymentSuccess = false;
                state.makeBulkPaymentFailed = false;
            })
            .addCase(makeCustomerBulkPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.bulkPaymentResult = action.payload.data || null;
                state.makeBulkPaymentSuccess = true;
                state.makeBulkPaymentFailed = false;
            })
            .addCase(makeCustomerBulkPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to process bulk payment';
                state.makeBulkPaymentSuccess = false;
                state.makeBulkPaymentFailed = true;
            })
            
            // GET ALL CUSTOMER PAYMENT RECORDS
            .addCase(getAllCustomerPaymentRecords.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getAllPaymentRecordsSuccess = false;
                state.getAllPaymentRecordsFailed = false;
            })
            .addCase(getAllCustomerPaymentRecords.fulfilled, (state, action) => {
                state.loading = false;
                state.allPaymentRecords = action.payload.data || null;
                state.getAllPaymentRecordsSuccess = true;
                state.getAllPaymentRecordsFailed = false;
            })
            .addCase(getAllCustomerPaymentRecords.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch payment records';
                state.getAllPaymentRecordsSuccess = false;
                state.getAllPaymentRecordsFailed = true;
            })
            
            // GET CUSTOMER PAYMENT SUMMARY
            .addCase(getCustomerPaymentSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentSummarySuccess = false;
                state.getPaymentSummaryFailed = false;
            })
            .addCase(getCustomerPaymentSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.customerPaymentSummary = action.payload.data || null;
                state.getPaymentSummarySuccess = true;
                state.getPaymentSummaryFailed = false;
            })
            .addCase(getCustomerPaymentSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch payment summary';
                state.getPaymentSummarySuccess = false;
                state.getPaymentSummaryFailed = true;
            })
            
            // GET ALL CUSTOMERS PAYMENT SUMMARY
            .addCase(getAllCustomersPaymentSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getAllCustomersSummarySuccess = false;
                state.getAllCustomersSummaryFailed = false;
            })
            .addCase(getAllCustomersPaymentSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.allCustomersPaymentSummary = action.payload.data || null;
                state.getAllCustomersSummarySuccess = true;
                state.getAllCustomersSummaryFailed = false;
            })
            .addCase(getAllCustomersPaymentSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch all customers payment summary';
                state.getAllCustomersSummarySuccess = false;
                state.getAllCustomersSummaryFailed = true;
            })
            
            // NEW: GET CUSTOMER PENDING PAYMENTS
            .addCase(getCustomerPendingPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPendingPaymentsSuccess = false;
                state.getPendingPaymentsFailed = false;
            })
            .addCase(getCustomerPendingPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingPayments = action.payload.data || null;
                state.getPendingPaymentsSuccess = true;
                state.getPendingPaymentsFailed = false;
            })
            .addCase(getCustomerPendingPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch pending payments';
                state.getPendingPaymentsSuccess = false;
                state.getPendingPaymentsFailed = true;
            });
    }
});

export const { 
    resetCustomerPaymentStatus, 
    setPaymentFilters, 
    clearPaymentFilters,
    clearPaymentData,
    clearBulkPaymentResult,
    clearPendingPayments // NEW
} = customerPaymentSlice.actions;

export default customerPaymentSlice.reducer;