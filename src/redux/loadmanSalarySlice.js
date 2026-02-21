// src/redux/loadmanSalarySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  // Package Assignment APIs
  assignLoadmenToTripPackagesApi,
  getTripPackageLoadmenApi,
  
  // Salary Calculation APIs
  calculateTripLoadmanSalaryApi,
  getLoadmanSalariesApi,
  updateLoadmanSalaryStatusApi,
  
  // Payment Processing APIs
  processLoadmanSalaryPaymentApi,
  getLoadmanSalarySummaryApi,
  getAllLoadmenSalarySummaryApi,
  getLoadmanExpensesApi,
  getLoadmanPaymentsApi,
  getLoadmanPaymentByIdApi,
  calculateLoadmanDailySalaryApi,
  
  // Loadman Data APIs
  getLoadmanDataApi,
  getLoadmanByIdApi,
  getLoadmanTripHistoryApi,
  getLoadmanPerformanceApi,
  getLoadmanPackageAssignmentsApi,
  getLoadmanEarningsSummaryApi
} from '../api/LoadmanSalaryApi';

// =============================================
// PACKAGE ASSIGNMENT THUNKS
// =============================================

// Assign loadmen to trip packages
export const assignLoadmenToTripPackages = createAsyncThunk(
  'loadmanSalary/assignLoadmenToTripPackages',
  async ({ tripId, assignments }, { rejectWithValue }) => {
    try {
      const response = await assignLoadmenToTripPackagesApi(tripId, assignments);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get trip package loadmen
export const getTripPackageLoadmen = createAsyncThunk(
  'loadmanSalary/getTripPackageLoadmen',
  async ({ tripId, packageTypeId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await getTripPackageLoadmenApi(tripId, packageTypeId, startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =============================================
// SALARY CALCULATION THUNKS
// =============================================

// Calculate trip loadman salary
export const calculateTripLoadmanSalary = createAsyncThunk(
  'loadmanSalary/calculateTripLoadmanSalary',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await calculateTripLoadmanSalaryApi(tripId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman salaries
export const getLoadmanSalaries = createAsyncThunk(
  'loadmanSalary/getLoadmanSalaries',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getLoadmanSalariesApi(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update loadman salary status
export const updateLoadmanSalaryStatus = createAsyncThunk(
  'loadmanSalary/updateLoadmanSalaryStatus',
  async ({ salaryId, statusData }, { rejectWithValue }) => {
    try {
      const response = await updateLoadmanSalaryStatusApi(salaryId, statusData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Calculate loadman daily salary
export const calculateLoadmanDailySalary = createAsyncThunk(
  'loadmanSalary/calculateLoadmanDailySalary',
  async ({ loadmanId, date, includeDetails = true }, { rejectWithValue }) => {
    try {
      const response = await calculateLoadmanDailySalaryApi(loadmanId, date, includeDetails);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =============================================
// PAYMENT PROCESSING THUNKS
// =============================================

// Process loadman salary payment
export const processLoadmanSalaryPayment = createAsyncThunk(
  'loadmanSalary/processLoadmanSalaryPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await processLoadmanSalaryPaymentApi(paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman salary summary
export const getLoadmanSalarySummary = createAsyncThunk(
  'loadmanSalary/getLoadmanSalarySummary',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getLoadmanSalarySummaryApi(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get all loadmen salary summary
export const getAllLoadmenSalarySummary = createAsyncThunk(
  'loadmanSalary/getAllLoadmenSalarySummary',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getAllLoadmenSalarySummaryApi(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman expenses
export const getLoadmanExpenses = createAsyncThunk(
  'loadmanSalary/getLoadmanExpenses',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getLoadmanExpensesApi(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman payments
export const getLoadmanPayments = createAsyncThunk(
  'loadmanSalary/getLoadmanPayments',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getLoadmanPaymentsApi(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman payment by ID
export const getLoadmanPaymentById = createAsyncThunk(
  'loadmanSalary/getLoadmanPaymentById',
  async (paymentId, { rejectWithValue }) => {
    try {
      const response = await getLoadmanPaymentByIdApi(paymentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =============================================
// LOADMAN DATA THUNKS
// =============================================

// Get loadman data
export const getLoadmanData = createAsyncThunk(
  'loadmanSalary/getLoadmanData',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await getLoadmanDataApi(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman by ID
export const getLoadmanById = createAsyncThunk(
  'loadmanSalary/getLoadmanById',
  async ({ loadmanId, options = {} }, { rejectWithValue }) => {
    try {
      const response = await getLoadmanByIdApi(loadmanId, options);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman trip history
export const getLoadmanTripHistory = createAsyncThunk(
  'loadmanSalary/getLoadmanTripHistory',
  async ({ loadmanId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await getLoadmanTripHistoryApi(loadmanId, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman performance
export const getLoadmanPerformance = createAsyncThunk(
  'loadmanSalary/getLoadmanPerformance',
  async ({ loadmanId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await getLoadmanPerformanceApi(loadmanId, startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman package assignments
export const getLoadmanPackageAssignments = createAsyncThunk(
  'loadmanSalary/getLoadmanPackageAssignments',
  async ({ loadmanId, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await getLoadmanPackageAssignmentsApi(loadmanId, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get loadman earnings summary
export const getLoadmanEarningsSummary = createAsyncThunk(
  'loadmanSalary/getLoadmanEarningsSummary',
  async ({ loadmanId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await getLoadmanEarningsSummaryApi(loadmanId, startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =============================================
// SLICE
// =============================================

const loadmanSalarySlice = createSlice({
  name: 'loadmanSalary',
  initialState: {
    // Package Assignment
    tripPackageLoadmen: null,
    assignmentResults: null,
    
    // Salary Data
    loadmanSalaries: {
      salaries: [],
      summary: {},
      pagination: {}
    },
    loadmanSalarySummary: {
      summary: {},
      loadmen: [],
      pagination: {}
    },
    allLoadmenSalarySummary: {
      summary: {},
      loadmen: []
    },
    loadmanDailySalary: null,
    
    // Payment Data
    loadmanPayments: {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0
    },
    loadmanExpenses: {
      summary: {},
      expenses: []
    },
    currentPayment: null,
    
    // Loadman Data
    loadmenData: {
      loadmen: [],
      summary: {},
      pagination: {}
    },
    currentLoadman: null,
    loadmanTripHistory: null,
    loadmanPerformance: null,
    loadmanPackageAssignments: null,
    loadmanEarningsSummary: null,
    
    // UI State
    loading: false,
    error: null,
    
    // Success Flags
    assignSuccess: false,
    calculateSuccess: false,
    paymentSuccess: false,
    updateStatusSuccess: false,
    getDataSuccess: false,
    
    // Filters
    filters: {
      loadmanId: null,
      startDate: null,
      endDate: null,
      tripId: null,
      status: 'all',
      search: null,
      page: 1,
      limit: 20,
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }
  },
  
  reducers: {
    resetLoadmanSalaryStatus: (state) => {
      state.assignSuccess = false;
      state.calculateSuccess = false;
      state.paymentSuccess = false;
      state.updateStatusSuccess = false;
      state.getDataSuccess = false;
      state.error = null;
    },
    
    setLoadmanSalaryFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearLoadmanSalaryFilters: (state) => {
      state.filters = {
        loadmanId: null,
        startDate: null,
        endDate: null,
        tripId: null,
        status: 'all',
        search: null,
        page: 1,
        limit: 20,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };
    },
    
    clearCurrentLoadman: (state) => {
      state.currentLoadman = null;
    },
    
    clearLoadmanDailySalary: (state) => {
      state.loadmanDailySalary = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // =============================================
      // PACKAGE ASSIGNMENT
      // =============================================
      
      // Assign Loadmen to Trip Packages
      .addCase(assignLoadmenToTripPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.assignSuccess = false;
      })
      .addCase(assignLoadmenToTripPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentResults = action.payload.data || action.payload;
        state.assignSuccess = true;
      })
      .addCase(assignLoadmenToTripPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Assignment failed';
        state.assignSuccess = false;
      })
      
      // Get Trip Package Loadmen
      .addCase(getTripPackageLoadmen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTripPackageLoadmen.fulfilled, (state, action) => {
        state.loading = false;
        state.tripPackageLoadmen = action.payload.data || action.payload;
      })
      .addCase(getTripPackageLoadmen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // =============================================
      // SALARY CALCULATION
      // =============================================
      
      // Calculate Trip Loadman Salary
      .addCase(calculateTripLoadmanSalary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.calculateSuccess = false;
      })
      .addCase(calculateTripLoadmanSalary.fulfilled, (state, action) => {
        state.loading = false;
        state.calculateSuccess = true;
        // Optionally update the list
      })
      .addCase(calculateTripLoadmanSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Calculation failed';
        state.calculateSuccess = false;
      })
      
      // Get Loadman Salaries
      .addCase(getLoadmanSalaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanSalaries.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.loadmanSalaries = {
          salaries: response.salaries || [],
          summary: response.summary || {},
          pagination: response.pagination || {}
        };
      })
      .addCase(getLoadmanSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Update Loadman Salary Status
      .addCase(updateLoadmanSalaryStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateStatusSuccess = false;
      })
      .addCase(updateLoadmanSalaryStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.updateStatusSuccess = true;
        // Update in list if needed
      })
      .addCase(updateLoadmanSalaryStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Update failed';
        state.updateStatusSuccess = false;
      })
      
      // Calculate Loadman Daily Salary
      .addCase(calculateLoadmanDailySalary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateLoadmanDailySalary.fulfilled, (state, action) => {
        state.loading = false;
        state.loadmanDailySalary = action.payload.data || action.payload;
      })
      .addCase(calculateLoadmanDailySalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Calculation failed';
      })
      
      // =============================================
      // PAYMENT PROCESSING
      // =============================================
      
      // Process Loadman Salary Payment
      .addCase(processLoadmanSalaryPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(processLoadmanSalaryPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentSuccess = true;
        // Add to payments list if needed
      })
      .addCase(processLoadmanSalaryPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Payment failed';
        state.paymentSuccess = false;
      })
      
      // Get Loadman Salary Summary
      .addCase(getLoadmanSalarySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanSalarySummary.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.loadmanSalarySummary = {
          summary: response.summary || {},
          loadmen: response.loadmen || [],
          pagination: response.pagination || {}
        };
      })
      .addCase(getLoadmanSalarySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get All Loadmen Salary Summary
      .addCase(getAllLoadmenSalarySummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLoadmenSalarySummary.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.allLoadmenSalarySummary = {
          summary: response.summary || {},
          loadmen: response.loadmen || []
        };
      })
      .addCase(getAllLoadmenSalarySummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Expenses
      .addCase(getLoadmanExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanExpenses.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.loadmanExpenses = {
          summary: response.summary || {},
          expenses: response.expenses || []
        };
      })
      .addCase(getLoadmanExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Payments
      .addCase(getLoadmanPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanPayments.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.loadmanPayments = {
          data: response.data || [],
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 20,
          totalPages: response.totalPages || 0
        };
      })
      .addCase(getLoadmanPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Payment By ID
      .addCase(getLoadmanPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data || action.payload;
      })
      .addCase(getLoadmanPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // =============================================
      // LOADMAN DATA
      // =============================================
      
      // Get Loadman Data
      .addCase(getLoadmanData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanData.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload.data || action.payload;
        state.loadmenData = {
          loadmen: response.loadmen || [],
          summary: response.summary || {},
          pagination: response.pagination || {}
        };
      })
      .addCase(getLoadmanData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman By ID
      .addCase(getLoadmanById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLoadman = action.payload.data || action.payload;
      })
      .addCase(getLoadmanById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Trip History
      .addCase(getLoadmanTripHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanTripHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.loadmanTripHistory = action.payload.data || action.payload;
      })
      .addCase(getLoadmanTripHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Performance
      .addCase(getLoadmanPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanPerformance.fulfilled, (state, action) => {
        state.loading = false;
        state.loadmanPerformance = action.payload.data || action.payload;
      })
      .addCase(getLoadmanPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Package Assignments
      .addCase(getLoadmanPackageAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanPackageAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.loadmanPackageAssignments = action.payload.data || action.payload;
      })
      .addCase(getLoadmanPackageAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      })
      
      // Get Loadman Earnings Summary
      .addCase(getLoadmanEarningsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLoadmanEarningsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.loadmanEarningsSummary = action.payload.data || action.payload;
      })
      .addCase(getLoadmanEarningsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Fetch failed';
      });
  }
});

export const {
  resetLoadmanSalaryStatus,
  setLoadmanSalaryFilters,
  clearLoadmanSalaryFilters,
  clearCurrentLoadman,
  clearLoadmanDailySalary
} = loadmanSalarySlice.actions;

export default loadmanSalarySlice.reducer;