import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getExtraIncomeApi, 
    getExtraIncomeByIdApi,
    createExtraIncomeApi, 
    updateExtraIncomeApi, 
    deleteExtraIncomeApi 
} from '../api/ExtraIncomeApi';

export const getExtraIncome = createAsyncThunk('extraIncome/getExtraIncome', async (filters = {}) => {
    return await getExtraIncomeApi(filters);
});

export const getExtraIncomeById = createAsyncThunk('extraIncome/getExtraIncomeById', async (extraIncomeId) => {
    return await getExtraIncomeByIdApi(extraIncomeId);
});

export const createExtraIncome = createAsyncThunk('extraIncome/createExtraIncome', async (request) => {
    return await createExtraIncomeApi(request);
});

export const updateExtraIncome = createAsyncThunk('extraIncome/updateExtraIncome', async ({ request, extraIncomeId }) => {
    return await updateExtraIncomeApi(request, extraIncomeId);
});

export const deleteExtraIncome = createAsyncThunk('extraIncome/deleteExtraIncome', async (extraIncomeId) => {
    return await deleteExtraIncomeApi(extraIncomeId);
});

const extraIncomeSlice = createSlice({
    name: 'extraIncome',
    initialState: {
        extraIncomeData: [],
        selectedExtraIncome: null,
        filteredData: [],
        loading: false,
        error: null,
        getExtraIncomeSuccess: false,
        getExtraIncomeFailed: false,
        getExtraIncomeByIdSuccess: false,
        getExtraIncomeByIdFailed: false,
        createExtraIncomeSuccess: false,
        createExtraIncomeFailed: false,
        updateExtraIncomeSuccess: false,
        updateExtraIncomeFailed: false,
        deleteExtraIncomeSuccess: false,
        deleteExtraIncomeFailed: false,
        filters: {
            income_date: null,
            startDate: null,
            endDate: null,
            officeCenterId: null,
            incomeType: null,
        },
    },
    reducers: {
        resetExtraIncomeStatus: (state) => {
            state.getExtraIncomeSuccess = false;
            state.getExtraIncomeFailed = false;
            state.getExtraIncomeByIdSuccess = false;
            state.getExtraIncomeByIdFailed = false;
            state.createExtraIncomeSuccess = false;
            state.createExtraIncomeFailed = false;
            state.updateExtraIncomeSuccess = false;
            state.updateExtraIncomeFailed = false;
            state.deleteExtraIncomeSuccess = false;
            state.deleteExtraIncomeFailed = false;
            state.error = null;
        },
        setExtraIncomeFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearExtraIncomeFilters: (state) => {
            state.filters = {
                income_date: null,
                startDate: null,
                endDate: null,
                officeCenterId: null,
                incomeType: null,
            };
        },
        clearSelectedExtraIncome: (state) => {
            state.selectedExtraIncome = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        clearExtraIncomeData: (state) => {
            state.extraIncomeData = [];
            state.filteredData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ALL
            .addCase(getExtraIncome.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getExtraIncomeSuccess = false;
                state.getExtraIncomeFailed = false;
            })
            .addCase(getExtraIncome.fulfilled, (state, action) => {
                state.loading = false;
                let extraIncomeArray = [];
                if (action.payload?.data?.data && Array.isArray(action.payload.data.data)) {
                    extraIncomeArray = action.payload.data.data;
                } else if (action.payload?.data && Array.isArray(action.payload.data)) {
                    extraIncomeArray = action.payload.data;
                } else if (Array.isArray(action.payload)) {
                    extraIncomeArray = action.payload;
                }
                
                state.extraIncomeData = extraIncomeArray;
                state.filteredData = extraIncomeArray;
                state.getExtraIncomeSuccess = true;
                state.getExtraIncomeFailed = false;
            })
            .addCase(getExtraIncome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getExtraIncomeSuccess = false;
                state.getExtraIncomeFailed = true;
            })

            // GET BY ID
            .addCase(getExtraIncomeById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getExtraIncomeByIdSuccess = false;
                state.getExtraIncomeByIdFailed = false;
            })
            .addCase(getExtraIncomeById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedExtraIncome = action.payload?.data || null;
                state.getExtraIncomeByIdSuccess = true;
                state.getExtraIncomeByIdFailed = false;
            })
            .addCase(getExtraIncomeById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getExtraIncomeByIdSuccess = false;
                state.getExtraIncomeByIdFailed = true;
            })

            // CREATE
            .addCase(createExtraIncome.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createExtraIncomeSuccess = false;
                state.createExtraIncomeFailed = false;
            })
            .addCase(createExtraIncome.fulfilled, (state, action) => {
                state.loading = false;
                let newExtraIncome = action.payload?.data || action.payload;
                
                if (newExtraIncome) {
                    if (!Array.isArray(state.extraIncomeData)) {
                        state.extraIncomeData = [];
                    }
                    state.extraIncomeData = [newExtraIncome, ...state.extraIncomeData];
                    state.filteredData = [newExtraIncome, ...state.filteredData];
                }
                
                state.createExtraIncomeSuccess = true;
                state.createExtraIncomeFailed = false;
            })
            .addCase(createExtraIncome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error?.message || 'Create failed';
                state.createExtraIncomeSuccess = false;
                state.createExtraIncomeFailed = true;
            })

            // UPDATE
            .addCase(updateExtraIncome.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateExtraIncomeSuccess = false;
                state.updateExtraIncomeFailed = false;
            })
            .addCase(updateExtraIncome.fulfilled, (state, action) => {
                state.loading = false;
                const updatedExtraIncome = action.payload?.data;
                if (updatedExtraIncome) {
                    const index = state.extraIncomeData.findIndex(
                        (income) => income.extra_income_id === updatedExtraIncome.extra_income_id
                    );
                    if (index !== -1) {
                        state.extraIncomeData[index] = updatedExtraIncome;
                        state.filteredData[index] = updatedExtraIncome;
                    }
                    if (state.selectedExtraIncome?.extra_income_id === updatedExtraIncome.extra_income_id) {
                        state.selectedExtraIncome = updatedExtraIncome;
                    }
                }
                state.updateExtraIncomeSuccess = true;
                state.updateExtraIncomeFailed = false;
            })
            .addCase(updateExtraIncome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateExtraIncomeSuccess = false;
                state.updateExtraIncomeFailed = true;
            })

            // DELETE
            .addCase(deleteExtraIncome.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteExtraIncomeSuccess = false;
                state.deleteExtraIncomeFailed = false;
            })
            .addCase(deleteExtraIncome.fulfilled, (state, action) => {
                state.loading = false;
                const extraIncomeId = action.meta.arg;
                state.extraIncomeData = state.extraIncomeData.filter(
                    (income) => income.extra_income_id !== extraIncomeId
                );
                state.filteredData = state.filteredData.filter(
                    (income) => income.extra_income_id !== extraIncomeId
                );
                if (state.selectedExtraIncome?.extra_income_id === extraIncomeId) {
                    state.selectedExtraIncome = null;
                }
                state.deleteExtraIncomeSuccess = true;
                state.deleteExtraIncomeFailed = false;
            })
            .addCase(deleteExtraIncome.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteExtraIncomeSuccess = false;
                state.deleteExtraIncomeFailed = true;
            });
    },
});

export const { 
    resetExtraIncomeStatus, 
    setExtraIncomeFilters, 
    clearExtraIncomeFilters,
    clearSelectedExtraIncome,
    setLoading,
    clearExtraIncomeData
} = extraIncomeSlice.actions;

export default extraIncomeSlice.reducer;