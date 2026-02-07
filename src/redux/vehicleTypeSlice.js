import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getVehicleTypeApi, createVehicleTypeApi, updateVehicleTypeApi, deleteVehicleTypeApi } from '../api/VehicleTypeApi';

export const getVehicleType = createAsyncThunk('vehicleType/getVehicleType', async (request) => {
    return await getVehicleTypeApi(request);
});

export const createVehicleType = createAsyncThunk('vehicleType/createVehicleType', async (request) => {
    return await createVehicleTypeApi(request);
});

export const updateVehicleType = createAsyncThunk('vehicleType/updateVehicleType', async ({ request, vehicleTypeId }) => {
    return await updateVehicleTypeApi(request, vehicleTypeId);
});

export const deleteVehicleType = createAsyncThunk('vehicleType/deleteVehicleType', async (vehicleTypeId) => {
    return await deleteVehicleTypeApi(vehicleTypeId);
});

const vehicleTypeSlice = createSlice({
    name: 'vehicleType',
    initialState: {
        vehicleTypeData: [],
        loading: false,
        error: null,
        getVehicleTypeSuccess: false,
        getVehicleTypeFailed: false,
        createVehicleTypeSuccess: false,
        createVehicleTypeFailed: false,
        updateVehicleTypeSuccess: false,
        updateVehicleTypeFailed: false,
        deleteVehicleTypeSuccess: false,
        deleteVehicleTypeFailed: false,
    },
    reducers: {
        resetVehicleTypeStatus: (state) => {
            state.getVehicleTypeSuccess = false;
            state.getVehicleTypeFailed = false;
            state.createVehicleTypeSuccess = false;
            state.createVehicleTypeFailed = false;
            state.updateVehicleTypeSuccess = false;
            state.updateVehicleTypeFailed = false;
            state.deleteVehicleTypeSuccess = false;
            state.deleteVehicleTypeFailed = false;
            state.error = null;
            state.loading = false;
            state.vehicleTypeData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getVehicleType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getVehicleTypeSuccess = false;
                state.getVehicleTypeFailed = false;
            })
            .addCase(getVehicleType.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicleTypeData = action.payload.data;
                state.getVehicleTypeSuccess = true;
                state.getVehicleTypeFailed = false;
            })
            .addCase(getVehicleType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getVehicleTypeSuccess = false;
                state.getVehicleTypeFailed = true;
            })

            // CREATE
            .addCase(createVehicleType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createVehicleTypeSuccess = false;
                state.createVehicleTypeFailed = false;
            })
            .addCase(createVehicleType.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicleTypeData.push(action.payload);
                state.createVehicleTypeSuccess = true;
                state.createVehicleTypeFailed = false;
            })
            .addCase(createVehicleType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createVehicleTypeSuccess = false;
                state.createVehicleTypeFailed = true;
            })

            // UPDATE
            .addCase(updateVehicleType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateVehicleTypeSuccess = false;
                state.updateVehicleTypeFailed = false;
            })
            .addCase(updateVehicleType.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.vehicleTypeData.findIndex((vehicleType) => vehicleType.id === action.payload.id);
                if (index !== -1) state.vehicleTypeData[index] = action.payload;
                state.updateVehicleTypeSuccess = true;
                state.updateVehicleTypeFailed = false;
            })
            .addCase(updateVehicleType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateVehicleTypeSuccess = false;
                state.updateVehicleTypeFailed = true;
            })

            // DELETE
            .addCase(deleteVehicleType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteVehicleTypeSuccess = false;
                state.deleteVehicleTypeFailed = false;
            })
            .addCase(deleteVehicleType.fulfilled, (state, action) => {
                state.loading = false;
                state.vehicleTypeData = state.vehicleTypeData.filter((vehicleType) => vehicleType.id !== action.payload);
                state.deleteVehicleTypeSuccess = true;
                state.deleteVehicleTypeFailed = false;
            })
            .addCase(deleteVehicleType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteVehicleTypeSuccess = false;
                state.deleteVehicleTypeFailed = true;
            });
    },
});

export const { resetVehicleTypeStatus } = vehicleTypeSlice.actions;
export default vehicleTypeSlice.reducer;
