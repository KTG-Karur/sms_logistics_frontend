import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getVehiclesApi, createVehiclesApi, updateVehiclesApi, deleteVehiclesApi } from '../api/VehiclesApi';

export const getVehicles = createAsyncThunk('vehicles/getVehicles', async (request = {}) => {
    const response = await getVehiclesApi(request);
    return response;
});

export const createVehicles = createAsyncThunk('vehicles/createVehicles', async (request) => {
    const response = await createVehiclesApi(request);
    return response;
});

export const updateVehicles = createAsyncThunk('vehicles/updateVehicles', async ({ request, vehicleId }) => {
    const response = await updateVehiclesApi(request, vehicleId);
    return response;
});

export const deleteVehicles = createAsyncThunk('vehicles/deleteVehicles', async (vehicleId) => {
    const response = await deleteVehiclesApi(vehicleId);
    return response;
});

const vehiclesSlice = createSlice({
    name: 'vehicles',
    initialState: {
        vehiclesData: [],
        loading: false,
        error: null,
        getVehiclesSuccess: false,
        getVehiclesFailed: false,
        createVehiclesSuccess: false,
        createVehiclesFailed: false,
        updateVehiclesSuccess: false,
        updateVehiclesFailed: false,
        deleteVehiclesSuccess: false,
        deleteVehiclesFailed: false,
        totalCount: 0,
    },
    reducers: {
        resetVehiclesStatus: (state) => {
            state.getVehiclesSuccess = false;
            state.getVehiclesFailed = false;
            state.createVehiclesSuccess = false;
            state.createVehiclesFailed = false;
            state.updateVehiclesSuccess = false;
            state.updateVehiclesFailed = false;
            state.deleteVehiclesSuccess = false;
            state.deleteVehiclesFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getVehiclesSuccess = false;
                state.getVehiclesFailed = false;
            })
            .addCase(getVehicles.fulfilled, (state, action) => {
                state.loading = false;
                state.vehiclesData = action.payload.data || [];
                state.getVehiclesSuccess = true;
                state.getVehiclesFailed = false;
            })
            .addCase(getVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getVehiclesSuccess = false;
                state.getVehiclesFailed = true;
            })

            // CREATE
            .addCase(createVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createVehiclesSuccess = false;
                state.createVehiclesFailed = false;
            })
            .addCase(createVehicles.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.vehiclesData.unshift(action.payload.data);
                }
                state.createVehiclesSuccess = true;
                state.createVehiclesFailed = false;
            })
            .addCase(createVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createVehiclesSuccess = false;
                state.createVehiclesFailed = true;
            })

            // UPDATE
            .addCase(updateVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateVehiclesSuccess = false;
                state.updateVehiclesFailed = false;
            })
            .addCase(updateVehicles.fulfilled, (state, action) => {
                state.loading = false;
                const updatedVehicle = action.payload.data;
                if (updatedVehicle) {
                    const index = state.vehiclesData.findIndex((vehicle) => vehicle.vehicle_id === updatedVehicle.vehicle_id);
                    if (index !== -1) state.vehiclesData[index] = updatedVehicle;
                }
                state.updateVehiclesSuccess = true;
                state.updateVehiclesFailed = false;
            })
            .addCase(updateVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateVehiclesSuccess = false;
                state.updateVehiclesFailed = true;
            })

            // DELETE
            .addCase(deleteVehicles.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteVehiclesSuccess = false;
                state.deleteVehiclesFailed = false;
            })
            .addCase(deleteVehicles.fulfilled, (state, action) => {
                state.loading = false;
                const vehicleId = action.meta.arg;
                state.vehiclesData = state.vehiclesData.filter((vehicle) => vehicle.vehicle_id !== vehicleId);
                state.deleteVehiclesSuccess = true;
                state.deleteVehiclesFailed = false;
            })
            .addCase(deleteVehicles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteVehiclesSuccess = false;
                state.deleteVehiclesFailed = true;
            });
    },
});

export const { resetVehiclesStatus } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;