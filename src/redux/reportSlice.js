// reportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getDailyProfitLossApi,
    getDateRangeProfitLossApi,
    getPackageReportApi,
    getTripReportApi
} from '../api/ReportApi';

// Daily Profit & Loss
export const getDailyProfitLoss = createAsyncThunk('report/getDailyProfitLoss', async (request) => {
    return await getDailyProfitLossApi(request);
});

// Date Range Profit & Loss
export const getDateRangeProfitLoss = createAsyncThunk('report/getDateRangeProfitLoss', async (request) => {
    return await getDateRangeProfitLossApi(request);
});

// Package Report
export const getPackageReport = createAsyncThunk('report/getPackageReport', async (request) => {
    return await getPackageReportApi(request);
});

// Trip Report
export const getTripReport = createAsyncThunk('report/getTripReport', async (request) => {
    return await getTripReportApi(request);
});

const reportSlice = createSlice({
    name: 'report',
    initialState: {
        // Daily Profit & Loss
        dailyProfitLossData: [],
        loadingDaily: false,
        errorDaily: null,
        getDailySuccess: false,
        getDailyFailed: false,

        // Date Range Profit & Loss
        rangeProfitLossData: [],
        loadingRange: false,
        errorRange: null,
        getRangeSuccess: false,
        getRangeFailed: false,

        // Package Report
        packageReportData: [],
        loadingPackage: false,
        errorPackage: null,
        getPackageSuccess: false,
        getPackageFailed: false,

        // Trip Report
        tripReportData: [],
        loadingTrip: false,
        errorTrip: null,
        getTripSuccess: false,
        getTripFailed: false,
    },
    reducers: {
        resetDailyReportStatus: (state) => {
            state.getDailySuccess = false;
            state.getDailyFailed = false;
            state.errorDaily = null;
            state.loadingDaily = false;
            state.dailyProfitLossData = [];
        },
        resetRangeReportStatus: (state) => {
            state.getRangeSuccess = false;
            state.getRangeFailed = false;
            state.errorRange = null;
            state.loadingRange = false;
            state.rangeProfitLossData = [];
        },
        resetPackageReportStatus: (state) => {
            state.getPackageSuccess = false;
            state.getPackageFailed = false;
            state.errorPackage = null;
            state.loadingPackage = false;
            state.packageReportData = [];
        },
        resetTripReportStatus: (state) => {
            state.getTripSuccess = false;
            state.getTripFailed = false;
            state.errorTrip = null;
            state.loadingTrip = false;
            state.tripReportData = [];
        },
        resetAllReportStatus: (state) => {
            state.getDailySuccess = false;
            state.getDailyFailed = false;
            state.getRangeSuccess = false;
            state.getRangeFailed = false;
            state.getPackageSuccess = false;
            state.getPackageFailed = false;
            state.getTripSuccess = false;
            state.getTripFailed = false;
            state.errorDaily = null;
            state.errorRange = null;
            state.errorPackage = null;
            state.errorTrip = null;
            state.loadingDaily = false;
            state.loadingRange = false;
            state.loadingPackage = false;
            state.loadingTrip = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // DAILY PROFIT & LOSS
            .addCase(getDailyProfitLoss.pending, (state) => {
                state.loadingDaily = true;
                state.errorDaily = null;
                state.getDailySuccess = false;
                state.getDailyFailed = false;
            })
            .addCase(getDailyProfitLoss.fulfilled, (state, action) => {
                state.loadingDaily = false;
                state.dailyProfitLossData = action.payload;
                state.getDailySuccess = true;
                state.getDailyFailed = false;
            })
            .addCase(getDailyProfitLoss.rejected, (state, action) => {
                state.loadingDaily = false;
                state.errorDaily = action.error.message || 'Fetch failed';
                state.getDailySuccess = false;
                state.getDailyFailed = true;
            })

            // DATE RANGE PROFIT & LOSS
            .addCase(getDateRangeProfitLoss.pending, (state) => {
                state.loadingRange = true;
                state.errorRange = null;
                state.getRangeSuccess = false;
                state.getRangeFailed = false;
            })
            .addCase(getDateRangeProfitLoss.fulfilled, (state, action) => {
                state.loadingRange = false;
                state.rangeProfitLossData = action.payload;
                state.getRangeSuccess = true;
                state.getRangeFailed = false;
            })
            .addCase(getDateRangeProfitLoss.rejected, (state, action) => {
                state.loadingRange = false;
                state.errorRange = action.error.message || 'Fetch failed';
                state.getRangeSuccess = false;
                state.getRangeFailed = true;
            })

            // PACKAGE REPORT
            .addCase(getPackageReport.pending, (state) => {
                state.loadingPackage = true;
                state.errorPackage = null;
                state.getPackageSuccess = false;
                state.getPackageFailed = false;
            })
            .addCase(getPackageReport.fulfilled, (state, action) => {
                state.loadingPackage = false;
                state.packageReportData = action.payload;
                state.getPackageSuccess = true;
                state.getPackageFailed = false;
            })
            .addCase(getPackageReport.rejected, (state, action) => {
                state.loadingPackage = false;
                state.errorPackage = action.error.message || 'Fetch failed';
                state.getPackageSuccess = false;
                state.getPackageFailed = true;
            })

            // TRIP REPORT
            .addCase(getTripReport.pending, (state) => {
                state.loadingTrip = true;
                state.errorTrip = null;
                state.getTripSuccess = false;
                state.getTripFailed = false;
            })
            .addCase(getTripReport.fulfilled, (state, action) => {
                state.loadingTrip = false;
                state.tripReportData = action.payload;
                state.getTripSuccess = true;
                state.getTripFailed = false;
            })
            .addCase(getTripReport.rejected, (state, action) => {
                state.loadingTrip = false;
                state.errorTrip = action.error.message || 'Fetch failed';
                state.getTripSuccess = false;
                state.getTripFailed = true;
            });
    },
});

export const { 
    resetDailyReportStatus,
    resetRangeReportStatus,
    resetPackageReportStatus,
    resetTripReportStatus,
    resetAllReportStatus 
} = reportSlice.actions;

export default reportSlice.reducer;