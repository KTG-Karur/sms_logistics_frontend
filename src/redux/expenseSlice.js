import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getExpenseApi, 
    getExpenseByIdApi,
    createExpenseApi, 
    updateExpenseApi, 
    deleteExpenseApi,
    getExpensePaymentsApi 
} from '../api/ExpenseApi';

export const getExpense = createAsyncThunk('expense/getExpense', async (filters = {}) => {
    return await getExpenseApi(filters);
});

export const getExpenseById = createAsyncThunk('expense/getExpenseById', async (expenseId) => {
    return await getExpenseByIdApi(expenseId);
});

export const createExpense = createAsyncThunk('expense/createExpense', async (request) => {
    return await createExpenseApi(request);
});

export const updateExpense = createAsyncThunk('expense/updateExpense', async ({ request, expenseId }) => {
    return await updateExpenseApi(request, expenseId);
});

export const deleteExpense = createAsyncThunk('expense/deleteExpense', async (expenseId) => {
    return await deleteExpenseApi(expenseId);
});

export const getExpensePayments = createAsyncThunk('expense/getExpensePayments', async (expenseId) => {
    return await getExpensePaymentsApi(expenseId);
});

const expenseSlice = createSlice({
    name: 'expense',
    initialState: {
        expenseData: [],
        selectedExpense: null,
        paymentsData: [],
        filteredData: [],
        loading: false,
        error: null,
        getExpenseSuccess: false,
        getExpenseFailed: false,
        getExpenseByIdSuccess: false,
        getExpenseByIdFailed: false,
        createExpenseSuccess: false,
        createExpenseFailed: false,
        updateExpenseSuccess: false,
        updateExpenseFailed: false,
        deleteExpenseSuccess: false,
        deleteExpenseFailed: false,
        getPaymentsSuccess: false,
        getPaymentsFailed: false,
        filters: {
            expenseDate: null,
            expenseTypeId: null,
            officeCenterId: null,
            isPaid: null,
            startDate: null,
            endDate: null,
            search: null,
        },
    },
    reducers: {
        resetExpenseStatus: (state) => {
            state.getExpenseSuccess = false;
            state.getExpenseFailed = false;
            state.getExpenseByIdSuccess = false;
            state.getExpenseByIdFailed = false;
            state.createExpenseSuccess = false;
            state.createExpenseFailed = false;
            state.updateExpenseSuccess = false;
            state.updateExpenseFailed = false;
            state.deleteExpenseSuccess = false;
            state.deleteExpenseFailed = false;
            state.getPaymentsSuccess = false;
            state.getPaymentsFailed = false;
            state.error = null;
            state.loading = false;
        },
        setExpenseFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearExpenseFilters: (state) => {
            state.filters = {
                expenseDate: null,
                expenseTypeId: null,
                officeCenterId: null,
                isPaid: null,
                startDate: null,
                endDate: null,
                search: null,
            };
        },
        clearSelectedExpense: (state) => {
            state.selectedExpense = null;
        },
        clearPaymentsData: (state) => {
            state.paymentsData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH ALL EXPENSES
            .addCase(getExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getExpenseSuccess = false;
                state.getExpenseFailed = false;
            })
            .addCase(getExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenseData = action.payload.data || [];
                state.filteredData = action.payload.data || [];
                state.getExpenseSuccess = true;
                state.getExpenseFailed = false;
            })
            .addCase(getExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getExpenseSuccess = false;
                state.getExpenseFailed = true;
            })

            // FETCH SINGLE EXPENSE BY ID
            .addCase(getExpenseById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getExpenseByIdSuccess = false;
                state.getExpenseByIdFailed = false;
            })
            .addCase(getExpenseById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedExpense = action.payload.data || null;
                state.getExpenseByIdSuccess = true;
                state.getExpenseByIdFailed = false;
            })
            .addCase(getExpenseById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getExpenseByIdSuccess = false;
                state.getExpenseByIdFailed = true;
            })

            // FETCH EXPENSE PAYMENTS
            .addCase(getExpensePayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPaymentsSuccess = false;
                state.getPaymentsFailed = false;
            })
            .addCase(getExpensePayments.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentsData = action.payload.data || [];
                state.getPaymentsSuccess = true;
                state.getPaymentsFailed = false;
            })
            .addCase(getExpensePayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch payments failed';
                state.getPaymentsSuccess = false;
                state.getPaymentsFailed = true;
            })

            // CREATE EXPENSE
            .addCase(createExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createExpenseSuccess = false;
                state.createExpenseFailed = false;
            })
            .addCase(createExpense.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.expenseData.unshift(action.payload.data);
                    state.filteredData.unshift(action.payload.data);
                }
                state.createExpenseSuccess = true;
                state.createExpenseFailed = false;
            })
            .addCase(createExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createExpenseSuccess = false;
                state.createExpenseFailed = true;
            })

            // UPDATE EXPENSE
            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateExpenseSuccess = false;
                state.updateExpenseFailed = false;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                const updatedExpense = action.payload.data;
                if (updatedExpense) {
                    const index = state.expenseData.findIndex((expense) => expense.expense_id === updatedExpense.expense_id);
                    if (index !== -1) {
                        state.expenseData[index] = updatedExpense;
                        state.filteredData[index] = updatedExpense;
                    }
                    // Update selected expense if it's the same one
                    if (state.selectedExpense && state.selectedExpense.expense_id === updatedExpense.expense_id) {
                        state.selectedExpense = updatedExpense;
                    }
                }
                state.updateExpenseSuccess = true;
                state.updateExpenseFailed = false;
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateExpenseSuccess = false;
                state.updateExpenseFailed = true;
            })

            // DELETE EXPENSE
            .addCase(deleteExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteExpenseSuccess = false;
                state.deleteExpenseFailed = false;
            })
            .addCase(deleteExpense.fulfilled, (state, action) => {
                state.loading = false;
                const expenseId = action.meta.arg;
                state.expenseData = state.expenseData.filter((expense) => expense.expense_id !== expenseId);
                state.filteredData = state.filteredData.filter((expense) => expense.expense_id !== expenseId);
                if (state.selectedExpense && state.selectedExpense.expense_id === expenseId) {
                    state.selectedExpense = null;
                }
                state.deleteExpenseSuccess = true;
                state.deleteExpenseFailed = false;
            })
            .addCase(deleteExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteExpenseSuccess = false;
                state.deleteExpenseFailed = true;
            });
    },
});

export const { 
    resetExpenseStatus, 
    setExpenseFilters, 
    clearExpenseFilters,
    clearSelectedExpense,
    clearPaymentsData 
} = expenseSlice.actions;

export default expenseSlice.reducer;