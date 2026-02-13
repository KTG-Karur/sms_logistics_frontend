import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getStaffAttendanceApi,
    getStaffAttendanceListApi,
    getStaffAttendanceReportApi,
    createStaffAttendanceApi,
    updateStaffAttendanceApi
} from '../api/AttendanceApi';

// ============= ASYNC THUNKS =============

// GET attendance for specific date
export const getStaffAttendance = createAsyncThunk(
    'attendance/getStaffAttendance',
    async (filters = {}) => {
        return await getStaffAttendanceApi(filters);
    }
);

// GET monthly attendance list
export const getStaffAttendanceList = createAsyncThunk(
    'attendance/getStaffAttendanceList',
    async (filters = {}) => {
        return await getStaffAttendanceListApi(filters);
    }
);

// GET attendance report
export const getStaffAttendanceReport = createAsyncThunk(
    'attendance/getStaffAttendanceReport',
    async (filters = {}) => {
        return await getStaffAttendanceReportApi(filters);
    }
);

// CREATE attendance
export const createStaffAttendance = createAsyncThunk(
    'attendance/createStaffAttendance',
    async (request) => {
        return await createStaffAttendanceApi(request);
    }
);

// UPDATE attendance
export const updateStaffAttendance = createAsyncThunk(
    'attendance/updateStaffAttendance',
    async (request) => {
        return await updateStaffAttendanceApi(request);
    }
);

// ============= INITIAL STATE =============

const initialState = {
    // Data
    dailyAttendance: [],           // Daily attendance records
    monthlyAttendance: {           // Monthly attendance with details
        attendanceDetail: []
    },
    attendanceReport: [],         // Attendance report with counts
    
    // Status flags
    loading: false,
    error: null,
    
    // Success flags
    getAttendanceSuccess: false,
    getAttendanceListSuccess: false,
    getAttendanceReportSuccess: false,
    createAttendanceSuccess: false,
    updateAttendanceSuccess: false,
    
    // Failed flags
    getAttendanceFailed: false,
    getAttendanceListFailed: false,
    getAttendanceReportFailed: false,
    createAttendanceFailed: false,
    updateAttendanceFailed: false,
    
    // Filters
    filters: {
        attendanceDate: null,
        departmentId: null,
        employeeId: null,
        durationId: null,
    },
};

// ============= SLICE =============

const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {
        // Reset all status flags
        resetAttendanceStatus: (state) => {
            state.getAttendanceSuccess = false;
            state.getAttendanceListSuccess = false;
            state.getAttendanceReportSuccess = false;
            state.createAttendanceSuccess = false;
            state.updateAttendanceSuccess = false;
            
            state.getAttendanceFailed = false;
            state.getAttendanceListFailed = false;
            state.getAttendanceReportFailed = false;
            state.createAttendanceFailed = false;
            state.updateAttendanceFailed = false;
            
            state.error = null;
            state.loading = false;
        },
        
        // Set filters
        setAttendanceFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        
        // Clear filters
        clearAttendanceFilters: (state) => {
            state.filters = {
                attendanceDate: null,
                departmentId: null,
                employeeId: null,
                durationId: null,
            };
        },
        
        // Clear attendance data
        clearAttendanceData: (state) => {
            state.dailyAttendance = [];
            state.monthlyAttendance = { attendanceDetail: [] };
            state.attendanceReport = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ========== GET DAILY ATTENDANCE ==========
            .addCase(getStaffAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getAttendanceSuccess = false;
                state.getAttendanceFailed = false;
            })
            .addCase(getStaffAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.dailyAttendance = action.payload.data || [];
                state.getAttendanceSuccess = true;
                state.getAttendanceFailed = false;
            })
            .addCase(getStaffAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch attendance';
                state.getAttendanceSuccess = false;
                state.getAttendanceFailed = true;
            })
            
            // ========== GET MONTHLY ATTENDANCE LIST ==========
            .addCase(getStaffAttendanceList.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getAttendanceListSuccess = false;
                state.getAttendanceListFailed = false;
            })
            .addCase(getStaffAttendanceList.fulfilled, (state, action) => {
                state.loading = false;
                state.monthlyAttendance = action.payload.data || { attendanceDetail: [] };
                state.getAttendanceListSuccess = true;
                state.getAttendanceListFailed = false;
            })
            .addCase(getStaffAttendanceList.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch monthly attendance';
                state.getAttendanceListSuccess = false;
                state.getAttendanceListFailed = true;
            })
            
            // ========== GET ATTENDANCE REPORT ==========
            .addCase(getStaffAttendanceReport.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getAttendanceReportSuccess = false;
                state.getAttendanceReportFailed = false;
            })
            .addCase(getStaffAttendanceReport.fulfilled, (state, action) => {
                state.loading = false;
                state.attendanceReport = action.payload.data || [];
                state.getAttendanceReportSuccess = true;
                state.getAttendanceReportFailed = false;
            })
            .addCase(getStaffAttendanceReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch attendance report';
                state.getAttendanceReportSuccess = false;
                state.getAttendanceReportFailed = true;
            })
            
            // ========== CREATE ATTENDANCE ==========
            .addCase(createStaffAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createAttendanceSuccess = false;
                state.createAttendanceFailed = false;
            })
            .addCase(createStaffAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.dailyAttendance = action.payload.data || [];
                state.createAttendanceSuccess = true;
                state.createAttendanceFailed = false;
            })
            .addCase(createStaffAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create attendance';
                state.createAttendanceSuccess = false;
                state.createAttendanceFailed = true;
            })
            
            // ========== UPDATE ATTENDANCE ==========
            .addCase(updateStaffAttendance.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateAttendanceSuccess = false;
                state.updateAttendanceFailed = false;
            })
            .addCase(updateStaffAttendance.fulfilled, (state, action) => {
                state.loading = false;
                state.dailyAttendance = action.payload.data || [];
                state.updateAttendanceSuccess = true;
                state.updateAttendanceFailed = false;
            })
            .addCase(updateStaffAttendance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update attendance';
                state.updateAttendanceSuccess = false;
                state.updateAttendanceFailed = true;
            });
    },
});

export const {
    resetAttendanceStatus,
    setAttendanceFilters,
    clearAttendanceFilters,
    clearAttendanceData
} = attendanceSlice.actions;

export default attendanceSlice.reducer;