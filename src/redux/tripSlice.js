// src/redux/tripSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    getTripsApi,
    getTripByIdApi,
    getAvailableBookingsApi,
    getAvailableVehiclesApi,
    getAvailableDriversApi,
    getAvailableLoadmenApi,
    createTripApi,
    updateTripApi,
    updateTripStatusApi,
    updateTripBookingsApi,
    deleteTripApi
} from '../api/TripApi';

// GET all trips
export const getTrips = createAsyncThunk('trip/getTrips', async (filters = {}, { rejectWithValue }) => {
    try {
        const response = await getTripsApi(filters);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET trip by ID
export const getTripById = createAsyncThunk('trip/getTripById', async (tripId, { rejectWithValue }) => {
    try {
        const response = await getTripByIdApi(tripId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET available bookings
export const getAvailableBookings = createAsyncThunk('trip/getAvailableBookings', async (_, { rejectWithValue }) => {
    try {
        const response = await getAvailableBookingsApi();
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET available vehicles
export const getAvailableVehicles = createAsyncThunk('trip/getAvailableVehicles', async (tripDate, { rejectWithValue }) => {
    try {
        const response = await getAvailableVehiclesApi(tripDate);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET available drivers
export const getAvailableDrivers = createAsyncThunk('trip/getAvailableDrivers', async (tripDate, { rejectWithValue }) => {
    try {
        const response = await getAvailableDriversApi(tripDate);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// GET available loadmen
export const getAvailableLoadmen = createAsyncThunk('trip/getAvailableLoadmen', async (tripDate, { rejectWithValue }) => {
    try {
        const response = await getAvailableLoadmenApi(tripDate);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// CREATE trip
export const createTrip = createAsyncThunk('trip/createTrip', async (request, { rejectWithValue }) => {
    try {
        const response = await createTripApi(request);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// UPDATE trip
export const updateTrip = createAsyncThunk('trip/updateTrip', async ({ request, tripId }, { rejectWithValue }) => {
    try {
        const response = await updateTripApi(request, tripId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// UPDATE trip status
export const updateTripStatus = createAsyncThunk('trip/updateTripStatus', async ({ tripId, statusData }, { rejectWithValue }) => {
    try {
        const response = await updateTripStatusApi(tripId, statusData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// UPDATE trip bookings (ADD/REMOVE bookings) - For add-on stages
export const updateTripBookings = createAsyncThunk('trip/updateTripBookings', async ({ tripId, bookingData }, { rejectWithValue }) => {
    try {
        const response = await updateTripBookingsApi(tripId, bookingData);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

// DELETE trip
export const deleteTrip = createAsyncThunk('trip/deleteTrip', async (tripId, { rejectWithValue }) => {
    try {
        const response = await deleteTripApi(tripId);
        return response;
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

const tripSlice = createSlice({
    name: 'trip',
    initialState: {
        tripData: [],
        currentTrip: null,
        availableBookings: [],
        availableVehicles: [],
        availableDrivers: [],
        availableLoadmen: [],
        loading: false,
        error: null,
        getTripsSuccess: false,
        getTripsFailed: false,
        getTripByIdSuccess: false,
        getTripByIdFailed: false,
        createTripSuccess: false,
        createTripFailed: false,
        updateTripSuccess: false,
        updateTripFailed: false,
        updateTripStatusSuccess: false,
        updateTripStatusFailed: false,
        updateTripBookingsSuccess: false,
        updateTripBookingsFailed: false,
        deleteTripSuccess: false,
        deleteTripFailed: false,
        filters: {
            tripNumber: null,
            status: null,
            fromCenterId: null,
            toCenterId: null,
            vehicleId: null,
            driverId: null,
            fromDate: null,
            toDate: null,
            search: null,
        },
    },
    reducers: {
        resetTripStatus: (state) => {
            state.getTripsSuccess = false;
            state.getTripsFailed = false;
            state.getTripByIdSuccess = false;
            state.getTripByIdFailed = false;
            state.createTripSuccess = false;
            state.createTripFailed = false;
            state.updateTripSuccess = false;
            state.updateTripFailed = false;
            state.updateTripStatusSuccess = false;
            state.updateTripStatusFailed = false;
            state.updateTripBookingsSuccess = false;
            state.updateTripBookingsFailed = false;
            state.deleteTripSuccess = false;
            state.deleteTripFailed = false;
            state.error = null;
            state.loading = false;
        },
        setTripFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearTripFilters: (state) => {
            state.filters = {
                tripNumber: null,
                status: null,
                fromCenterId: null,
                toCenterId: null,
                vehicleId: null,
                driverId: null,
                fromDate: null,
                toDate: null,
                search: null,
            };
        },
        clearCurrentTrip: (state) => {
            state.currentTrip = null;
        },
        clearAvailableData: (state) => {
            state.availableBookings = [];
            state.availableVehicles = [];
            state.availableDrivers = [];
            state.availableLoadmen = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ALL TRIPS
            .addCase(getTrips.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getTripsSuccess = false;
                state.getTripsFailed = false;
            })
            .addCase(getTrips.fulfilled, (state, action) => {
                state.loading = false;
                state.tripData = action.payload.data || [];
                state.getTripsSuccess = true;
                state.getTripsFailed = false;
            })
            .addCase(getTrips.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch failed';
                state.getTripsSuccess = false;
                state.getTripsFailed = true;
            })

            // GET TRIP BY ID
            .addCase(getTripById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getTripByIdSuccess = false;
                state.getTripByIdFailed = false;
            })
            .addCase(getTripById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTrip = action.payload.data || null;
                state.getTripByIdSuccess = true;
                state.getTripByIdFailed = false;
            })
            .addCase(getTripById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch by ID failed';
                state.getTripByIdSuccess = false;
                state.getTripByIdFailed = true;
            })

            // GET AVAILABLE BOOKINGS
            .addCase(getAvailableBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.availableBookings = action.payload?.data || [];
                console.log('Available bookings loaded:', state.availableBookings);
            })
            .addCase(getAvailableBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch available bookings failed';
                state.availableBookings = [];
            })

            // GET AVAILABLE VEHICLES
            .addCase(getAvailableVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableVehicles.fulfilled, (state, action) => {
                state.loading = false;
                state.availableVehicles = action.payload?.data || [];
            })
            .addCase(getAvailableVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch available vehicles failed';
                state.availableVehicles = [];
            })

            // GET AVAILABLE DRIVERS
            .addCase(getAvailableDrivers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableDrivers.fulfilled, (state, action) => {
                state.loading = false;
                state.availableDrivers = action.payload?.data || [];
            })
            .addCase(getAvailableDrivers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch available drivers failed';
                state.availableDrivers = [];
            })

            // GET AVAILABLE LOADMEN
            .addCase(getAvailableLoadmen.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAvailableLoadmen.fulfilled, (state, action) => {
                state.loading = false;
                state.availableLoadmen = action.payload?.data || [];
            })
            .addCase(getAvailableLoadmen.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Fetch available loadmen failed';
                state.availableLoadmen = [];
            })

            // CREATE TRIP
            .addCase(createTrip.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createTripSuccess = false;
                state.createTripFailed = false;
            })
            .addCase(createTrip.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.data) {
                    state.tripData.unshift(action.payload.data);
                }
                state.createTripSuccess = true;
                state.createTripFailed = false;
            })
            .addCase(createTrip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Create failed';
                state.createTripSuccess = false;
                state.createTripFailed = true;
            })

            // UPDATE TRIP
            .addCase(updateTrip.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateTripSuccess = false;
                state.updateTripFailed = false;
            })
            .addCase(updateTrip.fulfilled, (state, action) => {
                state.loading = false;
                const updatedTrip = action.payload?.data;
                if (updatedTrip && updatedTrip.trip_id) {
                    const index = state.tripData.findIndex((trip) => trip.trip_id === updatedTrip.trip_id);
                    if (index !== -1) {
                        state.tripData[index] = updatedTrip;
                    }
                    if (state.currentTrip && state.currentTrip.trip_id === updatedTrip.trip_id) {
                        state.currentTrip = updatedTrip;
                    }
                }
                state.updateTripSuccess = true;
                state.updateTripFailed = false;
            })
            .addCase(updateTrip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update failed';
                state.updateTripSuccess = false;
                state.updateTripFailed = true;
            })

            // UPDATE TRIP STATUS
            .addCase(updateTripStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateTripStatusSuccess = false;
                state.updateTripStatusFailed = false;
            })
            .addCase(updateTripStatus.fulfilled, (state, action) => {
                state.loading = false;
                const updatedTrip = action.payload?.data;
                if (updatedTrip && updatedTrip.trip_id) {
                    const index = state.tripData.findIndex((trip) => trip.trip_id === updatedTrip.trip_id);
                    if (index !== -1) {
                        state.tripData[index] = updatedTrip;
                    }
                    if (state.currentTrip && state.currentTrip.trip_id === updatedTrip.trip_id) {
                        state.currentTrip = updatedTrip;
                    }
                }
                state.updateTripStatusSuccess = true;
                state.updateTripStatusFailed = false;
            })
            .addCase(updateTripStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update status failed';
                state.updateTripStatusSuccess = false;
                state.updateTripStatusFailed = true;
            })

            // UPDATE TRIP BOOKINGS (ADD/REMOVE) - For add-on stages
            .addCase(updateTripBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateTripBookingsSuccess = false;
                state.updateTripBookingsFailed = false;
            })
            .addCase(updateTripBookings.fulfilled, (state, action) => {
                state.loading = false;
                const updatedTrip = action.payload?.data?.trip || action.payload?.data;
                if (updatedTrip && updatedTrip.trip_id) {
                    const index = state.tripData.findIndex((trip) => trip.trip_id === updatedTrip.trip_id);
                    if (index !== -1) {
                        state.tripData[index] = updatedTrip;
                    }
                    if (state.currentTrip && state.currentTrip.trip_id === updatedTrip.trip_id) {
                        state.currentTrip = updatedTrip;
                    }
                }
                state.updateTripBookingsSuccess = true;
                state.updateTripBookingsFailed = false;
            })
            .addCase(updateTripBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Update trip bookings failed';
                state.updateTripBookingsSuccess = false;
                state.updateTripBookingsFailed = true;
            })

            // DELETE TRIP
            .addCase(deleteTrip.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteTripSuccess = false;
                state.deleteTripFailed = false;
            })
            .addCase(deleteTrip.fulfilled, (state, action) => {
                state.loading = false;
                const tripId = action.meta.arg;
                state.tripData = state.tripData.filter((trip) => trip.trip_id !== tripId);
                if (state.currentTrip && state.currentTrip.trip_id === tripId) {
                    state.currentTrip = null;
                }
                state.deleteTripSuccess = true;
                state.deleteTripFailed = false;
            })
            .addCase(deleteTrip.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Delete failed';
                state.deleteTripSuccess = false;
                state.deleteTripFailed = true;
            });
    },
});

export const {
    resetTripStatus,
    setTripFilters,
    clearTripFilters,
    clearCurrentTrip,
    clearAvailableData
} = tripSlice.actions;

export default tripSlice.reducer;