import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getOpeningBalanceApi,
    createOpeningBalanceApi,
    bulkCreateOpeningBalancesApi,
    updateOpeningBalanceApi,
    deleteOpeningBalanceApi
} from '../api/OpeningBalanceApi';

export const getOpeningBalance = createAsyncThunk('openingBalance/getOpeningBalance', async (filters = {}) => {
    return await getOpeningBalanceApi(filters);
});

export const createOpeningBalance = createAsyncThunk('openingBalance/createOpeningBalance', async (request) => {
    return await createOpeningBalanceApi(request);
});

export const bulkCreateOpeningBalances = createAsyncThunk('openingBalance/bulkCreateOpeningBalances', async (request) => {
    return await bulkCreateOpeningBalancesApi(request);
});

export const updateOpeningBalance = createAsyncThunk('openingBalance/updateOpeningBalance', async ({ request, openingBalanceId }) => {
    return await updateOpeningBalanceApi(request, openingBalanceId);
});

export const deleteOpeningBalance = createAsyncThunk('openingBalance/deleteOpeningBalance', async (openingBalanceId) => {
    return await deleteOpeningBalanceApi(openingBalanceId);
});

const openingBalanceSlice = createSlice({
    name: 'openingBalance',
    initialState: {
        openingBalanceData: [],
        filteredData: [],
        loading: false,
        error: null,
        getOpeningBalanceSuccess: false,
        getOpeningBalanceFailed: false,
        createOpeningBalanceSuccess: false,
        createOpeningBalanceFailed: false,
        bulkCreateOpeningBalanceSuccess: false,
        bulkCreateOpeningBalanceFailed: false,
        updateOpeningBalanceSuccess: false,
        updateOpeningBalanceFailed: false,
        deleteOpeningBalanceSuccess: false,
        deleteOpeningBalanceFailed: false,
        bulkCreateResults: {
            successful: [],
            failed: []
        },
        filters: {
            date: null,
            officeCenterId: null,
            startDate: null,
            endDate: null,
            openingBalanceId: null,
        },
    },
    reducers: {
        resetOpeningBalanceStatus: (state) => {
            state.getOpeningBalanceSuccess = false;
            state.getOpeningBalanceFailed = false;
            state.createOpeningBalanceSuccess = false;
            state.createOpeningBalanceFailed = false;
            state.bulkCreateOpeningBalanceSuccess = false;
            state.bulkCreateOpeningBalanceFailed = false;
            state.updateOpeningBalanceSuccess = false;
            state.updateOpeningBalanceFailed = false;
            state.deleteOpeningBalanceSuccess = false;
            state.deleteOpeningBalanceFailed = false;
            state.error = null;
            state.loading = false;
        },
        setOpeningBalanceFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearOpeningBalanceFilters: (state) => {
            state.filters = {
                date: null,
                officeCenterId: null,
                startDate: null,
                endDate: null,
                openingBalanceId: null,
            };
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
            // FETCH
            .addCase(getOpeningBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getOpeningBalanceSuccess = false;
                state.getOpeningBalanceFailed = false;
            })
            .addCase(getOpeningBalance.fulfilled, (state, action) => {
                state.loading = false;
                state.openingBalanceData = action.payload.data || [];
                state.filteredData = action.payload.data || [];
                state.getOpeningBalanceSuccess = true;
                state.getOpeningBalanceFailed = false;
            })
            .addCase(getOpeningBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getOpeningBalanceSuccess = false;
                state.getOpeningBalanceFailed = true;
            })

            // CREATE SINGLE
            .addCase(createOpeningBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createOpeningBalanceSuccess = false;
                state.createOpeningBalanceFailed = false;
            })
            .addCase(createOpeningBalance.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.openingBalanceData.unshift(action.payload.data);
                    state.filteredData.unshift(action.payload.data);
                }
                state.createOpeningBalanceSuccess = true;
                state.createOpeningBalanceFailed = false;
            })
            .addCase(createOpeningBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createOpeningBalanceSuccess = false;
                state.createOpeningBalanceFailed = true;
            })

            // BULK CREATE
            .addCase(bulkCreateOpeningBalances.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.bulkCreateOpeningBalanceSuccess = false;
                state.bulkCreateOpeningBalanceFailed = false;
            })
            .addCase(bulkCreateOpeningBalances.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.bulkCreateResults = {
                        successful: action.payload.data.successful || [],
                        failed: action.payload.data.failed || []
                    };
                    
                    // Add successful entries to openingBalanceData
                    if (action.payload.data.successful && action.payload.data.successful.length > 0) {
                        const newEntries = action.payload.data.successful.map(item => ({
                            opening_balance_id: item.opening_balance_id,
                            date: item.date,
                            office_center_id: item.office_center_id,
                            opening_balance: item.opening_balance,
                            notes: item.notes,
                            created_at: item.created_at,
                            updated_at: item.updated_at
                        }));
                        state.openingBalanceData = [...newEntries, ...state.openingBalanceData];
                        state.filteredData = [...newEntries, ...state.filteredData];
                    }
                }
                state.bulkCreateOpeningBalanceSuccess = true;
                state.bulkCreateOpeningBalanceFailed = false;
            })
            .addCase(bulkCreateOpeningBalances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Bulk create failed';
                state.bulkCreateOpeningBalanceSuccess = false;
                state.bulkCreateOpeningBalanceFailed = true;
            })

            // UPDATE
            .addCase(updateOpeningBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateOpeningBalanceSuccess = false;
                state.updateOpeningBalanceFailed = false;
            })
            .addCase(updateOpeningBalance.fulfilled, (state, action) => {
                state.loading = false;
                const updatedBalance = action.payload.data;
                if (updatedBalance) {
                    const index = state.openingBalanceData.findIndex(
                        (balance) => balance.opening_balance_id === updatedBalance.opening_balance_id
                    );
                    if (index !== -1) {
                        state.openingBalanceData[index] = updatedBalance;
                        state.filteredData[index] = updatedBalance;
                    }
                }
                state.updateOpeningBalanceSuccess = true;
                state.updateOpeningBalanceFailed = false;
            })
            .addCase(updateOpeningBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateOpeningBalanceSuccess = false;
                state.updateOpeningBalanceFailed = true;
            })

            // DELETE
            .addCase(deleteOpeningBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteOpeningBalanceSuccess = false;
                state.deleteOpeningBalanceFailed = false;
            })
            .addCase(deleteOpeningBalance.fulfilled, (state, action) => {
                state.loading = false;
                const openingBalanceId = action.meta.arg;
                state.openingBalanceData = state.openingBalanceData.filter(
                    (balance) => balance.opening_balance_id !== openingBalanceId
                );
                state.filteredData = state.filteredData.filter(
                    (balance) => balance.opening_balance_id !== openingBalanceId
                );
                state.deleteOpeningBalanceSuccess = true;
                state.deleteOpeningBalanceFailed = false;
            })
            .addCase(deleteOpeningBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteOpeningBalanceSuccess = false;
                state.deleteOpeningBalanceFailed = true;
            });
    },
});

export const { 
    resetOpeningBalanceStatus, 
    setOpeningBalanceFilters, 
    clearOpeningBalanceFilters,
    clearBulkCreateResults 
} = openingBalanceSlice.actions;

export default openingBalanceSlice.reducer;