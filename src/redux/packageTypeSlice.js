import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPackageTypeApi, createPackageTypeApi, updatePackageTypeApi, deletePackageTypeApi } from '../api/PackageTypeApi';

export const getPackageType = createAsyncThunk('packageType/getPackageType', async (request) => {
    const response = await getPackageTypeApi(request);
    return response;
});

export const createPackageType = createAsyncThunk('packageType/createPackageType', async (request) => {
    const response = await createPackageTypeApi(request);
    return response;
});

export const updatePackageType = createAsyncThunk('packageType/updatePackageType', async ({ request, packageTypeId }) => {
    const response = await updatePackageTypeApi(request, packageTypeId);
    return response;
});

export const deletePackageType = createAsyncThunk('packageType/deletePackageType', async (packageTypeId) => {
    const response = await deletePackageTypeApi(packageTypeId);
    return response;
});

const packageTypeSlice = createSlice({
    name: 'packageType',
    initialState: {
        packageTypeData: [],
        loading: false,
        error: null,
        getPackageTypeSuccess: false,
        getPackageTypeFailed: false,
        createPackageTypeSuccess: false,
        createPackageTypeFailed: false,
        updatePackageTypeSuccess: false,
        updatePackageTypeFailed: false,
        deletePackageTypeSuccess: false,
        deletePackageTypeFailed: false,
    },
    reducers: {
        resetPackageTypeStatus: (state) => {
            state.getPackageTypeSuccess = false;
            state.getPackageTypeFailed = false;
            state.createPackageTypeSuccess = false;
            state.createPackageTypeFailed = false;
            state.updatePackageTypeSuccess = false;
            state.updatePackageTypeFailed = false;
            state.deletePackageTypeSuccess = false;
            state.deletePackageTypeFailed = false;
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getPackageType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getPackageTypeSuccess = false;
                state.getPackageTypeFailed = false;
            })
            .addCase(getPackageType.fulfilled, (state, action) => {
                state.loading = false;
                state.packageTypeData = action.payload.data || [];
                state.getPackageTypeSuccess = true;
                state.getPackageTypeFailed = false;
            })
            .addCase(getPackageType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getPackageTypeSuccess = false;
                state.getPackageTypeFailed = true;
            })

            // CREATE
            .addCase(createPackageType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createPackageTypeSuccess = false;
                state.createPackageTypeFailed = false;
            })
            .addCase(createPackageType.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.packageTypeData.push(action.payload.data);
                }
                state.createPackageTypeSuccess = true;
                state.createPackageTypeFailed = false;
            })
            .addCase(createPackageType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createPackageTypeSuccess = false;
                state.createPackageTypeFailed = true;
            })

            // UPDATE
            .addCase(updatePackageType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updatePackageTypeSuccess = false;
                state.updatePackageTypeFailed = false;
            })
            .addCase(updatePackageType.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPackage = action.payload.data;
                if (updatedPackage) {
                    const index = state.packageTypeData.findIndex(
                        (pkg) => pkg.package_type_id === updatedPackage.package_type_id
                    );
                    if (index !== -1) {
                        state.packageTypeData[index] = updatedPackage;
                    }
                }
                state.updatePackageTypeSuccess = true;
                state.updatePackageTypeFailed = false;
            })
            .addCase(updatePackageType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updatePackageTypeSuccess = false;
                state.updatePackageTypeFailed = true;
            })

            // DELETE
            .addCase(deletePackageType.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deletePackageTypeSuccess = false;
                state.deletePackageTypeFailed = false;
            })
            .addCase(deletePackageType.fulfilled, (state, action) => {
                state.loading = false;
                const packageTypeId = action.meta.arg;
                state.packageTypeData = state.packageTypeData.filter(
                    (pkg) => pkg.package_type_id !== packageTypeId
                );
                state.deletePackageTypeSuccess = true;
                state.deletePackageTypeFailed = false;
            })
            .addCase(deletePackageType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deletePackageTypeSuccess = false;
                state.deletePackageTypeFailed = true;
            });
    },
});

export const { resetPackageTypeStatus } = packageTypeSlice.actions;
export default packageTypeSlice.reducer;