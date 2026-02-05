import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDesignationApi, createDesignationApi, updateDesignationApi, deleteDesignationApi } from '../api/DesignationApi';

export const getDesignation = createAsyncThunk('designation/getDesignation', async (request) => {
    return await getDesignationApi(request);
});

export const createDesignation = createAsyncThunk('designation/createDesignation', async (request) => {
    return await createDesignationApi(request);
});

export const updateDesignation = createAsyncThunk('designation/updateDesignation', async ({ request, designationId }) => {
    return await updateDesignationApi(request, designationId);
});

export const deleteDesignation = createAsyncThunk('designation/deleteDesignation', async (designationId) => {
    return await deleteDesignationApi(designationId);
});

const designationSlice = createSlice({
    name: 'designation',
    initialState: {
        designationData: [],
        loading: false,
        error: null,
        getDesignationSuccess: false,
        getDesignationFailed: false,
        createDesignationSuccess: false,
        createDesignationFailed: false,
        updateDesignationSuccess: false,
        updateDesignationFailed: false,
        deleteDesignationSuccess: false,
        deleteDesignationFailed: false,
    },
    reducers: {
        resetDesignationStatus: (state) => {
            state.getDesignationSuccess = false;
            state.getDesignationFailed = false;
            state.createDesignationSuccess = false;
            state.createDesignationFailed = false;
            state.updateDesignationSuccess = false;
            state.updateDesignationFailed = false;
            state.deleteDesignationSuccess = false;
            state.deleteDesignationFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getDesignation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getDesignationSuccess = false;
                state.getDesignationFailed = false;
            })
            .addCase(getDesignation.fulfilled, (state, action) => {
                state.loading = false;
                // Map API response to match our component structure
                state.designationData = action.payload.data.map((dept) => ({
                    id: dept.designationId, // Map designationId to id
                    designationName: dept.designationName,
                    status: dept.isActive === 1 ? 'Active' : 'Inactive', // Map isActive to status
                    isActive: dept.isActive,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt,
                }));
                state.getDesignationSuccess = true;
                state.getDesignationFailed = false;
            })
            .addCase(getDesignation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getDesignationSuccess = false;
                state.getDesignationFailed = true;
            })
            // CREATE
            .addCase(createDesignation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createDesignationSuccess = false;
                state.createDesignationFailed = false;
            })
            .addCase(createDesignation.fulfilled, (state, action) => {
                state.loading = false;
                const newDesignation = action.payload.data || action.payload;
                // Map the new designation to match our structure
                state.designationData.push({
                    id: newDesignation.designationId,
                    designationName: newDesignation.designationName,
                    status: newDesignation.isActive === 1 ? 'Active' : 'Inactive',
                    isActive: newDesignation.isActive,
                    createdAt: newDesignation.createdAt,
                    updatedAt: newDesignation.updatedAt,
                });
                state.createDesignationSuccess = true;
                state.createDesignationFailed = false;
            })
            .addCase(createDesignation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createDesignationSuccess = false;
                state.createDesignationFailed = true;
            })
            // UPDATE
            .addCase(updateDesignation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateDesignationSuccess = false;
                state.updateDesignationFailed = false;
            })
            .addCase(updateDesignation.fulfilled, (state, action) => {
                state.loading = false;
                const updatedDesignation = action.payload.data || action.payload;
                const index = state.designationData.findIndex((designation) => designation.id === updatedDesignation.designationId);
                if (index !== -1) {
                    state.designationData[index] = {
                        id: updatedDesignation.designationId,
                        designationName: updatedDesignation.designationName,
                        status: updatedDesignation.isActive === 1 ? 'Active' : 'Inactive',
                        isActive: updatedDesignation.isActive,
                        createdAt: updatedDesignation.createdAt,
                        updatedAt: updatedDesignation.updatedAt,
                    };
                }
                state.updateDesignationSuccess = true;
                state.updateDesignationFailed = false;
            })
            .addCase(updateDesignation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateDesignationSuccess = false;
                state.updateDesignationFailed = true;
            })
            // DELETE
            .addCase(deleteDesignation.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteDesignationSuccess = false;
                state.deleteDesignationFailed = false;
            })
            .addCase(deleteDesignation.fulfilled, (state, action) => {
                state.loading = false;
                // Use the designationId that was passed to the thunk
                const deletedId = action.meta.arg;
                state.designationData = state.designationData.filter((designation) => designation.id !== deletedId);
                state.deleteDesignationSuccess = true;
                state.deleteDesignationFailed = false;
            })
            .addCase(deleteDesignation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteDesignationSuccess = false;
                state.deleteDesignationFailed = true;
            });
    },
});

export const { resetDesignationStatus } = designationSlice.actions;
export default designationSlice.reducer;
