import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getHolidayApi,
    createHolidayApi,
    updateHolidayApi,
    deleteHolidayApi
} from '../api/AttendanceApi';

// ============= ASYNC THUNKS =============

// GET holidays
export const getHoliday = createAsyncThunk(
    'holiday/getHoliday',
    async (filters = {}) => {
        return await getHolidayApi(filters);
    }
);

// CREATE holiday
export const createHoliday = createAsyncThunk(
    'holiday/createHoliday',
    async (request) => {
        return await createHolidayApi(request);
    }
);

// UPDATE holiday
export const updateHoliday = createAsyncThunk(
    'holiday/updateHoliday',
    async ({ request, holidayId }) => {
        return await updateHolidayApi(request, holidayId);
    }
);

export const deleteHoliday = createAsyncThunk(
    'holiday/deleteHoliday',
    async (holidayId) => {
        return await deleteHolidayApi(holidayId);
    }
);

// ============= INITIAL STATE =============

const initialState = {
    // Data
    holidayData: [],
    
    // Status flags
    loading: false,
    error: null,
    
    // Success flags
    getHolidaySuccess: false,
    createHolidaySuccess: false,
    updateHolidaySuccess: false,
    
    // Failed flags
    getHolidayFailed: false,
    createHolidayFailed: false,
    updateHolidayFailed: false,
    
    // Filters
    filters: {
        holidayId: null,
        holidayDate: null,
        isActive: null,
    },
};

// ============= SLICE =============

const holidaySlice = createSlice({
    name: 'holiday',
    initialState,
    reducers: {
        // Reset all status flags
        resetHolidayStatus: (state) => {
            state.getHolidaySuccess = false;
            state.createHolidaySuccess = false;
            state.updateHolidaySuccess = false;
            
            state.getHolidayFailed = false;
            state.createHolidayFailed = false;
            state.updateHolidayFailed = false;
            
            state.error = null;
            state.loading = false;
        },
        
        // Set filters
        setHolidayFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        
        // Clear filters
        clearHolidayFilters: (state) => {
            state.filters = {
                holidayId: null,
                holidayDate: null,
                isActive: null,
            };
        },
        
        // Clear holiday data
        clearHolidayData: (state) => {
            state.holidayData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== GET HOLIDAY ==========
            .addCase(getHoliday.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getHolidaySuccess = false;
                state.getHolidayFailed = false;
            })
            .addCase(getHoliday.fulfilled, (state, action) => {
                state.loading = false;
                state.holidayData = action.payload.data || [];
                state.getHolidaySuccess = true;
                state.getHolidayFailed = false;
            })
            .addCase(getHoliday.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch holidays';
                state.getHolidaySuccess = false;
                state.getHolidayFailed = true;
            })
            
            // ========== CREATE HOLIDAY ==========
            .addCase(createHoliday.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createHolidaySuccess = false;
                state.createHolidayFailed = false;
            })
            .addCase(createHoliday.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data && action.payload.data[0]) {
                    // Add to beginning of array
                    state.holidayData.unshift(action.payload.data[0]);
                }
                state.createHolidaySuccess = true;
                state.createHolidayFailed = false;
            })
            .addCase(createHoliday.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create holiday';
                state.createHolidaySuccess = false;
                state.createHolidayFailed = true;
            })
            
            // ========== UPDATE HOLIDAY ==========
            .addCase(updateHoliday.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateHolidaySuccess = false;
                state.updateHolidayFailed = false;
            })
            .addCase(updateHoliday.fulfilled, (state, action) => {
                state.loading = false;
                // Update the holiday in the array
                if (action.payload.data && action.payload.data[0]) {
                    const updatedHoliday = action.payload.data[0];
                    const index = state.holidayData.findIndex(
                        h => h.holidayId === updatedHoliday.holidayId
                    );
                    if (index !== -1) {
                        state.holidayData[index] = updatedHoliday;
                    }
                }
                state.updateHolidaySuccess = true;
                state.updateHolidayFailed = false;
            })
            .addCase(updateHoliday.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update holiday';
                state.updateHolidaySuccess = false;
                state.updateHolidayFailed = true;
            })
            // Add to extraReducers:
.addCase(deleteHoliday.pending, (state) => {
    state.loading = true;
    state.error = null;
})
.addCase(deleteHoliday.fulfilled, (state, action) => {
    state.loading = false;
    // Remove from array
    const holidayId = action.meta.arg;
    state.holidayData = state.holidayData.filter(h => h.holidayId !== holidayId);
    state.deleteHolidaySuccess = true;
})
.addCase(deleteHoliday.rejected, (state, action) => {
    state.loading = false;
    state.error = action.error.message || 'Failed to delete holiday';
    state.deleteHolidayFailed = true;
});
    },
});

export const {
    resetHolidayStatus,
    setHolidayFilters,
    clearHolidayFilters,
    clearHolidayData
} = holidaySlice.actions;

export default holidaySlice.reducer;