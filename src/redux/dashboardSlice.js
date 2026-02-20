import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardDataApi } from '../api/DashboardApi';

// Thunk for dashboard data
export const getDashboardData = createAsyncThunk('dashboard/getDashboardData', async (request = {}) => {
    return await getDashboardDataApi(request);
});

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        dashboardData: null,
        loading: false,
        error: null,
        getDashboardDataSuccess: false,
        getDashboardDataFailed: false,
        
        // Processed data for UI
        statistics: {
            totalTrips: 0,
            completedTrips: 0,
            inProgressTrips: 0,
            delayedTrips: 0,
            totalBookings: 0,
            totalPayments: 0,
        },
        todayStats: {
            bookings: 0,
            trips: 0,
            payments: "0.00"
        },
        thisWeekStats: {
            bookings: 0,
            payments: "0.00"
        },
        thisMonthStats: {
            bookings: 0,
            trips: 0,
            payments: "0.00"
        },
        statusBreakdown: {
            bookings: {
                not_started: 0,
                delivered: 0
            },
            trips: {
                in_progress: 0
            }
        },
        upcomingTrips: [],
        recentPayments: [],
        topCustomers: [],
    },
    reducers: {
        resetDashboardStatus: (state) => {
            state.getDashboardDataSuccess = false;
            state.getDashboardDataFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearDashboardData: (state) => {
            state.dashboardData = null;
            state.statistics = {
                totalTrips: 0,
                completedTrips: 0,
                inProgressTrips: 0,
                delayedTrips: 0,
                totalBookings: 0,
                totalPayments: 0,
            };
            state.todayStats = {
                bookings: 0,
                trips: 0,
                payments: "0.00"
            };
            state.thisWeekStats = {
                bookings: 0,
                payments: "0.00"
            };
            state.thisMonthStats = {
                bookings: 0,
                trips: 0,
                payments: "0.00"
            };
            state.statusBreakdown = {
                bookings: {
                    not_started: 0,
                    delivered: 0
                },
                trips: {
                    in_progress: 0
                }
            };
            state.upcomingTrips = [];
            state.recentPayments = [];
            state.topCustomers = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // GET DASHBOARD DATA
            .addCase(getDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getDashboardDataSuccess = false;
                state.getDashboardDataFailed = false;
            })
            .addCase(getDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardData = action.payload.data;
                
                // Map API data to our structure
                const apiData = action.payload.data || {};
                
                state.todayStats = apiData.today || {
                    bookings: 0,
                    trips: 0,
                    payments: "0.00"
                };
                
                state.thisWeekStats = apiData.this_week || {
                    bookings: 0,
                    payments: "0.00"
                };
                
                state.thisMonthStats = apiData.this_month || {
                    bookings: 0,
                    trips: 0,
                    payments: "0.00"
                };
                
                state.statusBreakdown = apiData.status_breakdown || {
                    bookings: {
                        not_started: 0,
                        delivered: 0
                    },
                    trips: {
                        in_progress: 0
                    }
                };
                
                state.upcomingTrips = apiData.upcoming_trips || [];
                state.recentPayments = apiData.recent_payments || [];
                state.topCustomers = apiData.top_customers || [];
                
                // Calculate statistics for the dashboard
                const totalBookings = (apiData.status_breakdown?.bookings?.not_started || 0) + 
                                     (apiData.status_breakdown?.bookings?.delivered || 0);
                
                state.statistics = {
                    totalTrips: apiData.this_month?.trips || 0,
                    completedTrips: apiData.status_breakdown?.bookings?.delivered || 0,
                    inProgressTrips: apiData.status_breakdown?.trips?.in_progress || 0,
                    delayedTrips: 0, // API doesn't provide this yet
                    totalBookings: totalBookings,
                    deliveredBookings: apiData.status_breakdown?.bookings?.delivered || 0,
                    pendingBookings: apiData.status_breakdown?.bookings?.not_started || 0,
                    totalPayments: parseFloat(apiData.this_month?.payments || 0),
                    thisWeekPayments: parseFloat(apiData.this_week?.payments || 0),
                    todayPayments: parseFloat(apiData.today?.payments || 0),
                };
                
                state.getDashboardDataSuccess = true;
                state.getDashboardDataFailed = false;
            })
            .addCase(getDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard data';
                state.getDashboardDataSuccess = false;
                state.getDashboardDataFailed = true;
            });
    },
});

export const { resetDashboardStatus, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;