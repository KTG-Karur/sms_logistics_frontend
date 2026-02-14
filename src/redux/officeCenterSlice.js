import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    getOfficeCentersApi, 
    getOfficeCentersWithLocationsApi,
    createOfficeCentersApi, 
    updateOfficeCentersApi, 
    deleteOfficeCentersApi 
} from '../api/OfficeCenterApi';

export const getOfficeCenters = createAsyncThunk('officeCenters/getOfficeCenters', async (request = {}) => {
    const data = await getOfficeCentersApi(request);
    return data;
});

export const getOfficeCentersWithLocations = createAsyncThunk('officeCenters/getOfficeCentersWithLocations', async () => {
    const data = await getOfficeCentersWithLocationsApi();
    return data;
});

export const createOfficeCenters = createAsyncThunk('officeCenters/createOfficeCenters', async (request) => {
    return await createOfficeCentersApi(request);
});

export const updateOfficeCenters = createAsyncThunk('officeCenters/updateOfficeCenters', async ({ request, officeCentersId }) => {
    return await updateOfficeCentersApi(request, officeCentersId);
});

export const deleteOfficeCenters = createAsyncThunk('officeCenters/deleteOfficeCenters', async (officeCentersId) => {
    return await deleteOfficeCentersApi(officeCentersId);
});

const officeCenterSlice = createSlice({
    name: 'officeCenter',
    initialState: {
        officeCentersData: [],
        officeCentersWithLocationsData: [],
        officeCenterList: [],
        loading: false,
        error: null,
        getOfficeCentersSuccess: false,
        getOfficeCentersFailed: false,
        getOfficeCentersWithLocationsSuccess: false,
        getOfficeCentersWithLocationsFailed: false,
        createOfficeCentersSuccess: false,
        createOfficeCentersFailed: false,
        updateOfficeCentersSuccess: false,
        updateOfficeCentersFailed: false,
        deleteOfficeCentersSuccess: false,
        deleteOfficeCentersFailed: false,
        errorMessage: null,
    },
    reducers: {
        resetOfficeCentersStatus: (state) => {
            state.getOfficeCentersSuccess = false;
            state.getOfficeCentersFailed = false;
            state.getOfficeCentersWithLocationsSuccess = false;
            state.getOfficeCentersWithLocationsFailed = false;
            state.createOfficeCentersSuccess = false;
            state.createOfficeCentersFailed = false;
            state.updateOfficeCentersSuccess = false;
            state.updateOfficeCentersFailed = false;
            state.deleteOfficeCentersSuccess = false;
            state.deleteOfficeCentersFailed = false;
            state.error = null;
            state.errorMessage = null;
            state.loading = false;
        },
        setOfficeCentersData: (state, action) => {
            state.officeCentersData = action.payload;
            state.officeCenterList = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH OFFICE CENTERS
            .addCase(getOfficeCenters.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getOfficeCentersSuccess = false;
                state.getOfficeCentersFailed = false;
            })
            .addCase(getOfficeCenters.fulfilled, (state, action) => {
                state.loading = false;
                
                // Map API response to match component structure
                const mappedData = (action.payload.data || []).map((item) => ({
                    id: item.office_center_id,
                    officeCentersName: item.office_center_name,
                    status: item.is_active ? 'Active' : 'Inactive',
                    isActive: item.is_active,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at,
                }));
                
                state.officeCentersData = mappedData;
                state.officeCenterList = mappedData;
                state.getOfficeCentersSuccess = true;
                state.getOfficeCentersFailed = false;
            })
            .addCase(getOfficeCenters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch office centers failed';
                state.errorMessage = action.error.message || 'Fetch office centers failed';
                state.getOfficeCentersSuccess = false;
                state.getOfficeCentersFailed = true;
            })
            
            // FETCH OFFICE CENTERS WITH LOCATIONS
            .addCase(getOfficeCentersWithLocations.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.getOfficeCentersWithLocationsSuccess = false;
                state.getOfficeCentersWithLocationsFailed = false;
            })
            .addCase(getOfficeCentersWithLocations.fulfilled, (state, action) => {
                state.loading = false;
                state.officeCentersWithLocationsData = action.payload.data || [];
                state.getOfficeCentersWithLocationsSuccess = true;
                state.getOfficeCentersWithLocationsFailed = false;
            })
            .addCase(getOfficeCentersWithLocations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch office centers with locations failed';
                state.errorMessage = action.error.message || 'Fetch office centers with locations failed';
                state.getOfficeCentersWithLocationsSuccess = false;
                state.getOfficeCentersWithLocationsFailed = true;
            })
            
            // CREATE OFFICE CENTER
            .addCase(createOfficeCenters.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.createOfficeCentersSuccess = false;
                state.createOfficeCentersFailed = false;
            })
            .addCase(createOfficeCenters.fulfilled, (state, action) => {
                state.loading = false;
                
                if (action.payload.data) {
                    const newItem = {
                        id: action.payload.data.office_center_id,
                        officeCentersName: action.payload.data.office_center_name,
                        status: action.payload.data.is_active ? 'Active' : 'Inactive',
                        isActive: action.payload.data.is_active,
                        createdAt: action.payload.data.created_at,
                        updatedAt: action.payload.data.updated_at,
                    };
                    
                    state.officeCentersData.push(newItem);
                    state.officeCenterList.push(newItem);
                }
                
                state.createOfficeCentersSuccess = true;
                state.createOfficeCentersFailed = false;
            })
            .addCase(createOfficeCenters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create office center failed';
                state.errorMessage = action.error.message || 'Create office center failed';
                state.createOfficeCentersSuccess = false;
                state.createOfficeCentersFailed = true;
            })
            
            // UPDATE OFFICE CENTER
            .addCase(updateOfficeCenters.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.updateOfficeCentersSuccess = false;
                state.updateOfficeCentersFailed = false;
            })
            .addCase(updateOfficeCenters.fulfilled, (state, action) => {
                state.loading = false;
                
                if (action.payload.data) {
                    const index = state.officeCentersData.findIndex(
                        (item) => item.id === action.payload.data.office_center_id
                    );
                    
                    if (index !== -1) {
                        const updatedItem = {
                            id: action.payload.data.office_center_id,
                            officeCentersName: action.payload.data.office_center_name,
                            status: action.payload.data.is_active ? 'Active' : 'Inactive',
                            isActive: action.payload.data.is_active,
                            createdAt: action.payload.data.created_at,
                            updatedAt: action.payload.data.updated_at,
                        };
                        
                        state.officeCentersData[index] = updatedItem;
                        state.officeCenterList[index] = updatedItem;
                    }
                }
                
                state.updateOfficeCentersSuccess = true;
                state.updateOfficeCentersFailed = false;
            })
            .addCase(updateOfficeCenters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update office center failed';
                state.errorMessage = action.error.message || 'Update office center failed';
                state.updateOfficeCentersSuccess = false;
                state.updateOfficeCentersFailed = true;
            })
            
            // DELETE OFFICE CENTER
            .addCase(deleteOfficeCenters.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorMessage = null;
                state.deleteOfficeCentersSuccess = false;
                state.deleteOfficeCentersFailed = false;
            })
            .addCase(deleteOfficeCenters.fulfilled, (state, action) => {
                state.loading = false;
                
                // Use the officeCentersId that was passed to the thunk
                const deletedId = action.meta.arg;
                
                state.officeCentersData = state.officeCentersData.filter(
                    (item) => item.id !== deletedId
                );
                state.officeCenterList = state.officeCenterList.filter(
                    (item) => item.id !== deletedId
                );
                
                state.deleteOfficeCentersSuccess = true;
                state.deleteOfficeCentersFailed = false;
            })
            .addCase(deleteOfficeCenters.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete office center failed';
                state.errorMessage = action.error.message || 'Delete office center failed';
                state.deleteOfficeCentersSuccess = false;
                state.deleteOfficeCentersFailed = true;
            });
    },
});

export const { resetOfficeCentersStatus, setOfficeCentersData } = officeCenterSlice.actions;
export default officeCenterSlice.reducer;