import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExpenceTypeApi, createExpenceTypeApi, updateExpenceTypeApi, deleteExpenceTypeApi } from '../api/ExpenceTypeApi';

export const getExpenceType = createAsyncThunk('expenceType/getExpenceType', async (request) => {
    const response = await getExpenceTypeApi(request);
    return response;
});

export const createExpenceType = createAsyncThunk('expenceType/createExpenceType', async (request) => {
    const response = await createExpenceTypeApi(request);
    return response;
});

export const updateExpenceType = createAsyncThunk('expenceType/updateExpenceType', async ({ request, expenceTypeId }) => {
    const response = await updateExpenceTypeApi(request, expenceTypeId);
    return response;
});

export const deleteExpenceType = createAsyncThunk('expenceType/deleteExpenceType', async (expenceTypeId) => {
    const response = await deleteExpenceTypeApi(expenceTypeId);
    return response;
});

const expenceTypeSlice = createSlice({
    name: 'expenceType',
    initialState: {
        expenceTypeData: [],
        loading: false,
        error: null,
        getExpenceTypeSuccess: false,
        getExpenceTypeFailed: false,
        createExpenceTypeSuccess: false,
        createExpenceTypeFailed: false,
        updateExpenceTypeSuccess: false,
        updateExpenceTypeFailed: false,
        deleteExpenceTypeSuccess: false,
        deleteExpenceTypeFailed: false,
    },
    reducers: {
        resetExpenceTypeStatus: (state) => {
            state.getExpenceTypeSuccess = false;
            state.getExpenceTypeFailed = false;
            state.createExpenceTypeSuccess = false;
            state.createExpenceTypeFailed = false;
            state.updateExpenceTypeSuccess = false;
            state.updateExpenceTypeFailed = false;
            state.deleteExpenceTypeSuccess = false;
            state.deleteExpenceTypeFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getExpenceType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getExpenceTypeSuccess = false;
                state.getExpenceTypeFailed = false;
            })
            .addCase(getExpenceType.fulfilled, (state, action) => {
                state.loading = false;
                state.expenceTypeData = action.payload.data || [];
                state.getExpenceTypeSuccess = true;
                state.getExpenceTypeFailed = false;
            })
            .addCase(getExpenceType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getExpenceTypeSuccess = false;
                state.getExpenceTypeFailed = true;
            })

            // CREATE
            .addCase(createExpenceType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createExpenceTypeSuccess = false;
                state.createExpenceTypeFailed = false;
            })
            .addCase(createExpenceType.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.expenceTypeData.push(action.payload.data);
                }
                state.createExpenceTypeSuccess = true;
                state.createExpenceTypeFailed = false;
            })
            .addCase(createExpenceType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createExpenceTypeSuccess = false;
                state.createExpenceTypeFailed = true;
            })

            // UPDATE
            .addCase(updateExpenceType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateExpenceTypeSuccess = false;
                state.updateExpenceTypeFailed = false;
            })
            .addCase(updateExpenceType.fulfilled, (state, action) => {
                state.loading = false;
                const updatedExpence = action.payload.data;
                if (updatedExpence) {
                    const index = state.expenceTypeData.findIndex(
                        (pkg) => pkg.expence_type_id === updatedExpence.expence_type_id
                    );
                    if (index !== -1) {
                        state.expenceTypeData[index] = updatedExpence;
                    }
                }
                state.updateExpenceTypeSuccess = true;
                state.updateExpenceTypeFailed = false;
            })
            .addCase(updateExpenceType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateExpenceTypeSuccess = false;
                state.updateExpenceTypeFailed = true;
            })

            // DELETE
            .addCase(deleteExpenceType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteExpenceTypeSuccess = false;
                state.deleteExpenceTypeFailed = false;
            })
            .addCase(deleteExpenceType.fulfilled, (state, action) => {
                state.loading = false;
                const expenceTypeId = action.meta.arg;
                state.expenceTypeData = state.expenceTypeData.filter(
                    (pkg) => pkg.expence_type_id !== expenceTypeId
                );
                state.deleteExpenceTypeSuccess = true;
                state.deleteExpenceTypeFailed = false;
            })
            .addCase(deleteExpenceType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteExpenceTypeSuccess = false;
                state.deleteExpenceTypeFailed = true;
            });
    },
});

export const { resetExpenceTypeStatus } = expenceTypeSlice.actions;
export default expenceTypeSlice.reducer;