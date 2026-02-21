// src/redux/salarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    calculateSalaryApi,
    getSalarySummaryApi,
    getEmployeeSalaryDetailApi,
    processSalaryPaymentApi,
    getSalaryPaymentsApi,
    getSalaryPaymentByIdApi,
    getSalaryAdjustmentsApi,
    createSalaryAdjustmentApi,
    updateSalaryAdjustmentApi,
    deleteSalaryAdjustmentApi
} from '../api/SalaryApi';

// ============= SALARY CALCULATION THUNKS =============

// GET calculate salary
export const calculateSalary = createAsyncThunk('salary/calculateSalary', async (params, { rejectWithValue }) => {
    try {
        const response = await calculateSalaryApi(params);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET salary summary
export const getSalarySummary = createAsyncThunk('salary/getSalarySummary', async (params, { rejectWithValue }) => {
    try {
        const response = await getSalarySummaryApi(params);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET employee salary detail
export const getEmployeeSalaryDetail = createAsyncThunk('salary/getEmployeeSalaryDetail', async ({ employeeId, salaryMonth }, { rejectWithValue }) => {
    try {
        const response = await getEmployeeSalaryDetailApi(employeeId, salaryMonth);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// POST process salary payment
export const processSalaryPayment = createAsyncThunk('salary/processSalaryPayment', async (request, { rejectWithValue }) => {
    try {
        const response = await processSalaryPaymentApi(request);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET salary payments
export const getSalaryPayments = createAsyncThunk('salary/getSalaryPayments', async (params, { rejectWithValue }) => {
    try {
        const response = await getSalaryPaymentsApi(params);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET salary payment by ID
export const getSalaryPaymentById = createAsyncThunk('salary/getSalaryPaymentById', async (paymentId, { rejectWithValue }) => {
    try {
        const response = await getSalaryPaymentByIdApi(paymentId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// ============= SALARY ADJUSTMENTS THUNKS =============

// GET salary adjustments
export const getSalaryAdjustments = createAsyncThunk('salary/getSalaryAdjustments', async (params, { rejectWithValue }) => {
    try {
        const response = await getSalaryAdjustmentsApi(params);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// POST create salary adjustment
export const createSalaryAdjustment = createAsyncThunk('salary/createSalaryAdjustment', async (request, { rejectWithValue }) => {
    try {
        const response = await createSalaryAdjustmentApi(request);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// PUT update salary adjustment
export const updateSalaryAdjustment = createAsyncThunk('salary/updateSalaryAdjustment', async ({ adjustmentId, request }, { rejectWithValue }) => {
    try {
        const response = await updateSalaryAdjustmentApi(adjustmentId, request);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// DELETE salary adjustment
export const deleteSalaryAdjustment = createAsyncThunk('salary/deleteSalaryAdjustment', async (adjustmentId, { rejectWithValue }) => {
    try {
        const response = await deleteSalaryAdjustmentApi(adjustmentId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const salarySlice = createSlice({
    name: 'salary',
    initialState: {
        // Salary calculation data
        salaryCalculation: null,
        salarySummary: [],
        employeeSalaryDetail: null,
        salaryPayments: [],
        currentPayment: null,
        
        // Salary adjustments data
        salaryAdjustments: [],
        currentAdjustment: null,
        
        // Loading states
        loading: false,
        error: null,
        
        // Success states
        calculateSalarySuccess: false,
        calculateSalaryFailed: false,
        getSalarySummarySuccess: false,
        getSalarySummaryFailed: false,
        getEmployeeSalaryDetailSuccess: false,
        getEmployeeSalaryDetailFailed: false,
        processSalaryPaymentSuccess: false,
        processSalaryPaymentFailed: false,
        getSalaryPaymentsSuccess: false,
        getSalaryPaymentsFailed: false,
        getSalaryPaymentByIdSuccess: false,
        getSalaryPaymentByIdFailed: false,
        
        // Adjustment success states
        getSalaryAdjustmentsSuccess: false,
        getSalaryAdjustmentsFailed: false,
        createSalaryAdjustmentSuccess: false,
        createSalaryAdjustmentFailed: false,
        updateSalaryAdjustmentSuccess: false,
        updateSalaryAdjustmentFailed: false,
        deleteSalaryAdjustmentSuccess: false,
        deleteSalaryAdjustmentFailed: false,
        
        // Filters
        filters: {
            salaryMonth: null,
            employeeId: null,
            startDate: null,
            endDate: null,
            type: null,
            page: 1,
            limit: 100
        }
    },
    reducers: {
        resetSalaryStatus: (state) => {
            state.calculateSalarySuccess = false;
            state.calculateSalaryFailed = false;
            state.getSalarySummarySuccess = false;
            state.getSalarySummaryFailed = false;
            state.getEmployeeSalaryDetailSuccess = false;
            state.getEmployeeSalaryDetailFailed = false;
            state.processSalaryPaymentSuccess = false;
            state.processSalaryPaymentFailed = false;
            state.getSalaryPaymentsSuccess = false;
            state.getSalaryPaymentsFailed = false;
            state.getSalaryPaymentByIdSuccess = false;
            state.getSalaryPaymentByIdFailed = false;
            state.getSalaryAdjustmentsSuccess = false;
            state.getSalaryAdjustmentsFailed = false;
            state.createSalaryAdjustmentSuccess = false;
            state.createSalaryAdjustmentFailed = false;
            state.updateSalaryAdjustmentSuccess = false;
            state.updateSalaryAdjustmentFailed = false;
            state.deleteSalaryAdjustmentSuccess = false;
            state.deleteSalaryAdjustmentFailed = false;
            state.error = null;
            state.loading = false;
        },
        setSalaryFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearSalaryFilters: (state) => {
            state.filters = {
                salaryMonth: null,
                employeeId: null,
                startDate: null,
                endDate: null,
                type: null,
                page: 1,
                limit: 100
            };
        },
        clearEmployeeSalaryDetail: (state) => {
            state.employeeSalaryDetail = null;
        },
        clearCurrentPayment: (state) => {
            state.currentPayment = null;
        },
        clearCurrentAdjustment: (state) => {
            state.currentAdjustment = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ============= CALCULATE SALARY =============
            .addCase(calculateSalary.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.calculateSalarySuccess = false;
                state.calculateSalaryFailed = false;
            })
            .addCase(calculateSalary.fulfilled, (state, action) => {
                state.loading = false;
                state.salaryCalculation = action.payload?.data || null;
                state.calculateSalarySuccess = true;
                state.calculateSalaryFailed = false;
            })
            .addCase(calculateSalary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Calculate salary failed';
                state.calculateSalarySuccess = false;
                state.calculateSalaryFailed = true;
            })
            
            // ============= GET SALARY SUMMARY =============
            .addCase(getSalarySummary.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getSalarySummarySuccess = false;
                state.getSalarySummaryFailed = false;
            })
            .addCase(getSalarySummary.fulfilled, (state, action) => {
                state.loading = false;
                state.salarySummary = action.payload?.data || [];
                state.getSalarySummarySuccess = true;
                state.getSalarySummaryFailed = false;
            })
            .addCase(getSalarySummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Get salary summary failed';
                state.getSalarySummarySuccess = false;
                state.getSalarySummaryFailed = true;
            })
            
            // ============= GET EMPLOYEE SALARY DETAIL =============
            .addCase(getEmployeeSalaryDetail.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getEmployeeSalaryDetailSuccess = false;
                state.getEmployeeSalaryDetailFailed = false;
            })
            .addCase(getEmployeeSalaryDetail.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeSalaryDetail = action.payload?.data || null;
                state.getEmployeeSalaryDetailSuccess = true;
                state.getEmployeeSalaryDetailFailed = false;
            })
            .addCase(getEmployeeSalaryDetail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Get employee salary detail failed';
                state.getEmployeeSalaryDetailSuccess = false;
                state.getEmployeeSalaryDetailFailed = true;
            })
            
            // ============= PROCESS SALARY PAYMENT =============
            .addCase(processSalaryPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.processSalaryPaymentSuccess = false;
                state.processSalaryPaymentFailed = false;
            })
            .addCase(processSalaryPayment.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.data) {
                    state.employeeSalaryDetail = action.payload.data;
                }
                state.processSalaryPaymentSuccess = true;
                state.processSalaryPaymentFailed = false;
            })
            .addCase(processSalaryPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Process salary payment failed';
                state.processSalaryPaymentSuccess = false;
                state.processSalaryPaymentFailed = true;
            })
            
            // ============= GET SALARY PAYMENTS =============
            .addCase(getSalaryPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getSalaryPaymentsSuccess = false;
                state.getSalaryPaymentsFailed = false;
            })
            .addCase(getSalaryPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.salaryPayments = action.payload?.data || [];
                state.getSalaryPaymentsSuccess = true;
                state.getSalaryPaymentsFailed = false;
            })
            .addCase(getSalaryPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Get salary payments failed';
                state.getSalaryPaymentsSuccess = false;
                state.getSalaryPaymentsFailed = true;
            })
            
            // ============= GET SALARY PAYMENT BY ID =============
            .addCase(getSalaryPaymentById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getSalaryPaymentByIdSuccess = false;
                state.getSalaryPaymentByIdFailed = false;
            })
            .addCase(getSalaryPaymentById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload?.data || null;
                state.getSalaryPaymentByIdSuccess = true;
                state.getSalaryPaymentByIdFailed = false;
            })
            .addCase(getSalaryPaymentById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Get salary payment by ID failed';
                state.getSalaryPaymentByIdSuccess = false;
                state.getSalaryPaymentByIdFailed = true;
            })
            
            // ============= GET SALARY ADJUSTMENTS =============
            .addCase(getSalaryAdjustments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getSalaryAdjustmentsSuccess = false;
                state.getSalaryAdjustmentsFailed = false;
            })
            .addCase(getSalaryAdjustments.fulfilled, (state, action) => {
                state.loading = false;
                state.salaryAdjustments = action.payload?.data || [];
                state.getSalaryAdjustmentsSuccess = true;
                state.getSalaryAdjustmentsFailed = false;
            })
            .addCase(getSalaryAdjustments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Get salary adjustments failed';
                state.getSalaryAdjustmentsSuccess = false;
                state.getSalaryAdjustmentsFailed = true;
            })
            
            // ============= CREATE SALARY ADJUSTMENT =============
            .addCase(createSalaryAdjustment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createSalaryAdjustmentSuccess = false;
                state.createSalaryAdjustmentFailed = false;
            })
            .addCase(createSalaryAdjustment.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.data) {
                    state.salaryAdjustments.unshift(action.payload.data);
                    state.currentAdjustment = action.payload.data;
                }
                state.createSalaryAdjustmentSuccess = true;
                state.createSalaryAdjustmentFailed = false;
            })
            .addCase(createSalaryAdjustment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Create salary adjustment failed';
                state.createSalaryAdjustmentSuccess = false;
                state.createSalaryAdjustmentFailed = true;
            })
            
            // ============= UPDATE SALARY ADJUSTMENT =============
            .addCase(updateSalaryAdjustment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateSalaryAdjustmentSuccess = false;
                state.updateSalaryAdjustmentFailed = false;
            })
            .addCase(updateSalaryAdjustment.fulfilled, (state, action) => {
                state.loading = false;
                const updatedAdjustment = action.payload?.data;
                if (updatedAdjustment && updatedAdjustment.adjustment_id) {
                    const index = state.salaryAdjustments.findIndex(
                        (adj) => adj.adjustment_id === updatedAdjustment.adjustment_id
                    );
                    if (index !== -1) {
                        state.salaryAdjustments[index] = updatedAdjustment;
                    }
                    if (state.currentAdjustment && state.currentAdjustment.adjustment_id === updatedAdjustment.adjustment_id) {
                        state.currentAdjustment = updatedAdjustment;
                    }
                }
                state.updateSalaryAdjustmentSuccess = true;
                state.updateSalaryAdjustmentFailed = false;
            })
            .addCase(updateSalaryAdjustment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update salary adjustment failed';
                state.updateSalaryAdjustmentSuccess = false;
                state.updateSalaryAdjustmentFailed = true;
            })
            
            // ============= DELETE SALARY ADJUSTMENT =============
            .addCase(deleteSalaryAdjustment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteSalaryAdjustmentSuccess = false;
                state.deleteSalaryAdjustmentFailed = false;
            })
            .addCase(deleteSalaryAdjustment.fulfilled, (state, action) => {
                state.loading = false;
                const adjustmentId = action.meta.arg;
                state.salaryAdjustments = state.salaryAdjustments.filter(
                    (adj) => adj.adjustment_id !== adjustmentId
                );
                if (state.currentAdjustment && state.currentAdjustment.adjustment_id === adjustmentId) {
                    state.currentAdjustment = null;
                }
                state.deleteSalaryAdjustmentSuccess = true;
                state.deleteSalaryAdjustmentFailed = false;
            })
            .addCase(deleteSalaryAdjustment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Delete salary adjustment failed';
                state.deleteSalaryAdjustmentSuccess = false;
                state.deleteSalaryAdjustmentFailed = true;
            });
    }
});

export const {
    resetSalaryStatus,
    setSalaryFilters,
    clearSalaryFilters,
    clearEmployeeSalaryDetail,
    clearCurrentPayment,
    clearCurrentAdjustment
} = salarySlice.actions;

export default salarySlice.reducer;