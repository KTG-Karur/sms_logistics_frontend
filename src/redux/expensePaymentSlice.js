import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    createExpensePaymentApi,
    bulkCreateExpensePaymentsApi,
    deleteExpensePaymentApi,
    getExpensePaymentSummaryApi
} from '../api/ExpensePaymentApi';

export const createExpensePayment = createAsyncThunk('expensePayment/createExpensePayment', async (request) => {
    return await createExpensePaymentApi(request);
});

export const bulkCreateExpensePayments = createAsyncThunk('expensePayment/bulkCreateExpensePayments', async (request) => {
    return await bulkCreateExpensePaymentsApi(request);
});

export const deleteExpensePayment = createAsyncThunk('expensePayment/deleteExpensePayment', async (paymentId) => {
    return await deleteExpensePaymentApi(paymentId);
});

export const getExpensePaymentSummary = createAsyncThunk('expensePayment/getExpensePaymentSummary', async (expenseId) => {
    return await getExpensePaymentSummaryApi(expenseId);
});

const expensePaymentSlice = createSlice({
    name: 'expensePayment',
    initialState: {
        paymentsData: [],
        paymentSummary: null,
        loading: false,
        error: null,
        createPaymentSuccess: false,
        createPaymentFailed: false,
        bulkCreatePaymentSuccess: false,
        bulkCreatePaymentFailed: false,
        deletePaymentSuccess: false,
        deletePaymentFailed: false,
        getSummarySuccess: false,
        getSummaryFailed: false,
        bulkCreateResults: {
            successful: [],
            failed: []
        },
    },
    reducers: {
        resetExpensePaymentStatus: (state) => {
            state.createPaymentSuccess = false;
            state.createPaymentFailed = false;
            state.bulkCreatePaymentSuccess = false;
            state.bulkCreatePaymentFailed = false;
            state.deletePaymentSuccess = false;
            state.deletePaymentFailed = false;
            state.getSummarySuccess = false;
            state.getSummaryFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearPaymentsData: (state) => {
            state.paymentsData = [];
        },
        clearPaymentSummary: (state) => {
            state.paymentSummary = null;
        },
        clearBulkCreateResults: (state) => {
            state.bulkCreateResults = {
                successful: [],
                failed: []
            };
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE SINGLE PAYMENT
            .addCase(createExpensePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createPaymentSuccess = false;
                state.createPaymentFailed = false;
            })
            .addCase(createExpensePayment.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.paymentsData.unshift(action.payload.data);
                }
                state.createPaymentSuccess = true;
                state.createPaymentFailed = false;
            })
            .addCase(createExpensePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create payment failed';
                state.createPaymentSuccess = false;
                state.createPaymentFailed = true;
            })

            // BULK CREATE PAYMENTS
            .addCase(bulkCreateExpensePayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.bulkCreatePaymentSuccess = false;
                state.bulkCreatePaymentFailed = false;
            })
            .addCase(bulkCreateExpensePayments.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.bulkCreateResults = {
                        successful: action.payload.data.successful || [],
                        failed: action.payload.data.failed || []
                    };
                    // Add successful payments to paymentsData
                    if (action.payload.data.successful && action.payload.data.successful.length > 0) {
                        const newPayments = action.payload.data.successful.map(item => item);
                        state.paymentsData = [...newPayments, ...state.paymentsData];
                    }
                }
                state.bulkCreatePaymentSuccess = true;
                state.bulkCreatePaymentFailed = false;
            })
            .addCase(bulkCreateExpensePayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Bulk create payments failed';
                state.bulkCreatePaymentSuccess = false;
                state.bulkCreatePaymentFailed = true;
            })

            // DELETE PAYMENT
            .addCase(deleteExpensePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deletePaymentSuccess = false;
                state.deletePaymentFailed = false;
            })
            .addCase(deleteExpensePayment.fulfilled, (state, action) => {
                state.loading = false;
                const paymentId = action.meta.arg;
                state.paymentsData = state.paymentsData.filter((payment) => payment.expense_payment_id !== paymentId);
                state.deletePaymentSuccess = true;
                state.deletePaymentFailed = false;
            })
            .addCase(deleteExpensePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete payment failed';
                state.deletePaymentSuccess = false;
                state.deletePaymentFailed = true;
            })

            // GET PAYMENT SUMMARY
            .addCase(getExpensePaymentSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getSummarySuccess = false;
                state.getSummaryFailed = false;
            })
            .addCase(getExpensePaymentSummary.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentSummary = action.payload.data || null;
                state.getSummarySuccess = true;
                state.getSummaryFailed = false;
            })
            .addCase(getExpensePaymentSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Get payment summary failed';
                state.getSummarySuccess = false;
                state.getSummaryFailed = true;
            });
    },
});

export const { 
    resetExpensePaymentStatus, 
    clearPaymentsData,
    clearPaymentSummary,
    clearBulkCreateResults 
} = expensePaymentSlice.actions;

export default expensePaymentSlice.reducer;