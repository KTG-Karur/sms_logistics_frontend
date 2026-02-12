import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCustomersApi, createCustomersApi, updateCustomersApi, deleteCustomersApi } from '../api/CustomerApi';

export const getCustomers = createAsyncThunk('customers/getCustomers', async (request = {}) => {
    const response = await getCustomersApi(request);
    return response;
});

export const createCustomers = createAsyncThunk('customers/createCustomers', async (request) => {
    const response = await createCustomersApi(request);
    return response;
});

export const updateCustomers = createAsyncThunk('customers/updateCustomers', async ({ request, customerId }) => {
    const response = await updateCustomersApi(request, customerId);
    return response;
});

export const deleteCustomers = createAsyncThunk('customers/deleteCustomers', async (customerId) => {
    const response = await deleteCustomersApi(customerId);
    return response;
});

const customersSlice = createSlice({
    name: 'customers',
    initialState: {
        customersData: [],
        loading: false,
        error: null,
        getCustomersSuccess: false,
        getCustomersFailed: false,
        createCustomersSuccess: false,
        createCustomersFailed: false,
        updateCustomersSuccess: false,
        updateCustomersFailed: false,
        deleteCustomersSuccess: false,
        deleteCustomersFailed: false,
        totalCount: 0,
    },
    reducers: {
        resetCustomersStatus: (state) => {
            state.getCustomersSuccess = false;
            state.getCustomersFailed = false;
            state.createCustomersSuccess = false;
            state.createCustomersFailed = false;
            state.updateCustomersSuccess = false;
            state.updateCustomersFailed = false;
            state.deleteCustomersSuccess = false;
            state.deleteCustomersFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getCustomersSuccess = false;
                state.getCustomersFailed = false;
            })
            .addCase(getCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.customersData = action.payload.data || [];
                state.getCustomersSuccess = true;
                state.getCustomersFailed = false;
            })
            .addCase(getCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getCustomersSuccess = false;
                state.getCustomersFailed = true;
            })

            // CREATE
            .addCase(createCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createCustomersSuccess = false;
                state.createCustomersFailed = false;
            })
            .addCase(createCustomers.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.customersData.unshift(action.payload.data);
                }
                state.createCustomersSuccess = true;
                state.createCustomersFailed = false;
            })
            .addCase(createCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createCustomersSuccess = false;
                state.createCustomersFailed = true;
            })

            // UPDATE
            .addCase(updateCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateCustomersSuccess = false;
                state.updateCustomersFailed = false;
            })
            .addCase(updateCustomers.fulfilled, (state, action) => {
                state.loading = false;
                const updatedCustomer = action.payload.data;
                if (updatedCustomer) {
                    const index = state.customersData.findIndex((customer) => customer.customer_id === updatedCustomer.customer_id);
                    if (index !== -1) state.customersData[index] = updatedCustomer;
                }
                state.updateCustomersSuccess = true;
                state.updateCustomersFailed = false;
            })
            .addCase(updateCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateCustomersSuccess = false;
                state.updateCustomersFailed = true;
            })

            // DELETE
            .addCase(deleteCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteCustomersSuccess = false;
                state.deleteCustomersFailed = false;
            })
            .addCase(deleteCustomers.fulfilled, (state, action) => {
                state.loading = false;
                const customerId = action.meta.arg;
                state.customersData = state.customersData.filter((customer) => customer.customer_id !== customerId);
                state.deleteCustomersSuccess = true;
                state.deleteCustomersFailed = false;
            })
            .addCase(deleteCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteCustomersSuccess = false;
                state.deleteCustomersFailed = true;
            });
    },
});

export const { resetCustomersStatus } = customersSlice.actions;
export default customersSlice.reducer;
