import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getLocationsApi, 
    createLocationsApi, 
    updateLocationsApi, 
    deleteLocationsApi 
} from '../api/LocationApi';

export const getLocations = createAsyncThunk('locations/getLocations', async (request = {}) => {
    const response = await getLocationsApi(request);
    return response;
});

export const createLocations = createAsyncThunk('locations/createLocations', async (request) => {
    const response = await createLocationsApi(request);
    return response;
});

export const updateLocations = createAsyncThunk('locations/updateLocations', async ({ request, locationsId }) => {
    const response = await updateLocationsApi(request, locationsId);
    return response;
});

export const deleteLocations = createAsyncThunk('locations/deleteLocations', async (locationsId) => {
    const response = await deleteLocationsApi(locationsId);
    return response;
});

const locationSlice = createSlice({
    name: 'locations',
    initialState: {
        locationsData: [],
        locationList: [],
        loading: false,
        error: null,
        errorMessage: null,
        getLocationsSuccess: false,
        getLocationsFailed: false,
        createLocationsSuccess: false,
        createLocationsFailed: false,
        updateLocationsSuccess: false,
        updateLocationsFailed: false,
        deleteLocationsSuccess: false,
        deleteLocationsFailed: false,
        totalCount: 0,
    },
    reducers: {
        resetLocationsStatus: (state) => {
            state.getLocationsSuccess = false;
            state.getLocationsFailed = false;
            state.createLocationsSuccess = false;
            state.createLocationsFailed = false;
            state.updateLocationsSuccess = false;
            state.updateLocationsFailed = false;
            state.deleteLocationsSuccess = false;
            state.deleteLocationsFailed = false;
            state.error = null;
            state.errorMessage = null;
            state.loading = false;
        },
        setLocationsData: (state, action) => {
            state.locationsData = action.payload;
            state.locationList = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH LOCATIONS
            .addCase(getLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getLocationsSuccess = false;
                state.getLocationsFailed = false;
            })
            .addCase(getLocations.fulfilled, (state, action) => {
                state.loading = false;
                
                // Map API response to match component structure
                const mappedData = (action.payload.data || []).map((item) => ({
                    location_id: item.location_id,
                    location_name: item.location_name,
                    office_center_id: item.office_center_id,
                    is_active: item.is_active,
                    status: item.is_active ? 'Active' : 'Inactive',
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    created_by: item.created_by,
                    updated_by: item.updated_by,
                }));
                
                state.locationsData = mappedData;
                state.locationList = mappedData;
                state.totalCount = mappedData.length;
                state.getLocationsSuccess = true;
                state.getLocationsFailed = false;
            })
            .addCase(getLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch locations failed';
                state.errorMessage = action.error.message || 'Fetch locations failed';
                state.getLocationsSuccess = false;
                state.getLocationsFailed = true;
            })
            
            // CREATE LOCATION
            .addCase(createLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.createLocationsSuccess = false;
                state.createLocationsFailed = false;
            })
            .addCase(createLocations.fulfilled, (state, action) => {
                state.loading = false;
                
                if (action.payload.data) {
                    const newItem = {
                        location_id: action.payload.data.location_id,
                        location_name: action.payload.data.location_name,
                        office_center_id: action.payload.data.office_center_id,
                        is_active: action.payload.data.is_active,
                        status: action.payload.data.is_active ? 'Active' : 'Inactive',
                        created_at: action.payload.data.created_at,
                        updated_at: action.payload.data.updated_at,
                        created_by: action.payload.data.created_by,
                        updated_by: action.payload.data.updated_by,
                    };
                    
                    state.locationsData.unshift(newItem);
                    state.locationList.unshift(newItem);
                    state.totalCount += 1;
                }
                
                state.createLocationsSuccess = true;
                state.createLocationsFailed = false;
            })
            .addCase(createLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create location failed';
                state.errorMessage = action.error.message || 'Create location failed';
                state.createLocationsSuccess = false;
                state.createLocationsFailed = true;
            })
            
            // UPDATE LOCATION
            .addCase(updateLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.updateLocationsSuccess = false;
                state.updateLocationsFailed = false;
            })
            .addCase(updateLocations.fulfilled, (state, action) => {
                state.loading = false;
                
                if (action.payload.data) {
                    const index = state.locationsData.findIndex(
                        (item) => item.location_id === action.payload.data.location_id
                    );
                    
                    if (index !== -1) {
                        const updatedItem = {
                            location_id: action.payload.data.location_id,
                            location_name: action.payload.data.location_name,
                            office_center_id: action.payload.data.office_center_id,
                            is_active: action.payload.data.is_active,
                            status: action.payload.data.is_active ? 'Active' : 'Inactive',
                            created_at: action.payload.data.created_at,
                            updated_at: action.payload.data.updated_at,
                            created_by: action.payload.data.created_by,
                            updated_by: action.payload.data.updated_by,
                        };
                        
                        state.locationsData[index] = updatedItem;
                        state.locationList[index] = updatedItem;
                    }
                }
                
                state.updateLocationsSuccess = true;
                state.updateLocationsFailed = false;
            })
            .addCase(updateLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update location failed';
                state.errorMessage = action.error.message || 'Update location failed';
                state.updateLocationsSuccess = false;
                state.updateLocationsFailed = true;
            })
            
            // DELETE LOCATION
            .addCase(deleteLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.deleteLocationsSuccess = false;
                state.deleteLocationsFailed = false;
            })
            .addCase(deleteLocations.fulfilled, (state, action) => {
                state.loading = false;
                
                const deletedId = action.meta.arg;
                
                state.locationsData = state.locationsData.filter(
                    (item) => item.location_id !== deletedId
                );
                state.locationList = state.locationList.filter(
                    (item) => item.location_id !== deletedId
                );
                state.totalCount = Math.max(0, state.totalCount - 1);
                
                state.deleteLocationsSuccess = true;
                state.deleteLocationsFailed = false;
            })
            .addCase(deleteLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete location failed';
                state.errorMessage = action.error.message || 'Delete location failed';
                state.deleteLocationsSuccess = false;
                state.deleteLocationsFailed = true;
            });
    },
});

export const { resetLocationsStatus, setLocationsData } = locationSlice.actions;
export default locationSlice.reducer;