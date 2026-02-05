import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductsApi, createProductApi, updateProductApi, deleteProductApi, bulkUploadProductsApi, downloadTemplateApi } from '../api/ProductApi';

export const getProducts = createAsyncThunk('product/getProducts', async (request) => {
    return await getProductsApi(request);
});

export const createProduct = createAsyncThunk('product/createProduct', async (request) => {
    return await createProductApi(request);
});

export const updateProduct = createAsyncThunk('product/updateProduct', async ({ request, productId }) => {
    return await updateProductApi(request, productId);
});

export const deleteProduct = createAsyncThunk('product/deleteProduct', async (productId) => {
    return await deleteProductApi(productId);
});

export const bulkUploadProducts = createAsyncThunk('product/bulkUploadProducts', async (formData) => {
    return await bulkUploadProductsApi(formData);
});

export const downloadTemplate = createAsyncThunk('product/downloadTemplate', async () => {
    return await downloadTemplateApi();
});

const productSlice = createSlice({
    name: 'product',
    initialState: {
        productData: [],
        loading: false,
        error: null,
        getProductsSuccess: false,
        getProductsFailed: false,
        createProductSuccess: false,
        createProductFailed: false,
        updateProductSuccess: false,
        updateProductFailed: false,
        deleteProductSuccess: false,
        deleteProductFailed: false,
        bulkUploadLoading: false,
        bulkUploadSuccess: false,
        bulkUploadFailed: false,
        bulkUploadError: null,
        downloadTemplateLoading: false,
        downloadTemplateSuccess: false,
        downloadTemplateFailed: false,
    },
    reducers: {
        resetProductStatus: (state) => {
            state.getProductsSuccess = false;
            state.getProductsFailed = false;
            state.createProductSuccess = false;
            state.createProductFailed = false;
            state.updateProductSuccess = false;
            state.updateProductFailed = false;
            state.deleteProductSuccess = false;
            state.deleteProductFailed = false;
            state.bulkUploadSuccess = false;
            state.bulkUploadFailed = false;
            state.bulkUploadError = null;
            state.downloadTemplateSuccess = false;
            state.downloadTemplateFailed = false;
            state.error = null;
            state.loading = false;
        },
        clearProductData: (state) => {
            state.productData = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getProductsSuccess = false;
                state.getProductsFailed = false;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.productData = action.payload.data;
                state.getProductsSuccess = true;
                state.getProductsFailed = false;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getProductsSuccess = false;
                state.getProductsFailed = true;
            })
            // CREATE
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createProductSuccess = false;
                state.createProductFailed = false;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.productData.unshift(action.payload.data[0]);
                state.createProductSuccess = true;
                state.createProductFailed = false;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createProductSuccess = false;
                state.createProductFailed = true;
            })
            // UPDATE
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateProductSuccess = false;
                state.updateProductFailed = false;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.productData.findIndex((product) => product.productId === action.payload.data[0].productId);
                if (index !== -1) {
                    state.productData[index] = action.payload.data[0];
                }
                state.updateProductSuccess = true;
                state.updateProductFailed = false;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateProductSuccess = false;
                state.updateProductFailed = true;
            })
            // DELETE
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteProductSuccess = false;
                state.deleteProductFailed = false;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.productData = state.productData.filter((product) => product.productId !== action.meta.arg);
                state.deleteProductSuccess = true;
                state.deleteProductFailed = false;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteProductSuccess = false;
                state.deleteProductFailed = true;
            })
            // BULK UPLOAD
            .addCase(bulkUploadProducts.pending, (state) => {
                state.bulkUploadLoading = true;
                state.bulkUploadError = null;
                state.bulkUploadSuccess = false;
                state.bulkUploadFailed = false;
            })
            .addCase(bulkUploadProducts.fulfilled, (state, action) => {
                state.bulkUploadLoading = false;
                state.bulkUploadSuccess = true;
                state.bulkUploadFailed = false;
                // Refresh products after successful upload
                if (action.payload.data?.successCount > 0) {
                    // We'll trigger a refresh in the component
                }
            })
            .addCase(bulkUploadProducts.rejected, (state, action) => {
                state.bulkUploadLoading = false;
                state.bulkUploadError = action.error.message || 'Bulk upload failed';
                state.bulkUploadSuccess = false;
                state.bulkUploadFailed = true;
            })

            // DOWNLOAD TEMPLATE
            .addCase(downloadTemplate.pending, (state) => {
                state.downloadTemplateLoading = true;
                state.downloadTemplateSuccess = false;
                state.downloadTemplateFailed = false;
            })
            .addCase(downloadTemplate.fulfilled, (state) => {
                state.downloadTemplateLoading = false;
                state.downloadTemplateSuccess = true;
                state.downloadTemplateFailed = false;
            })
            .addCase(downloadTemplate.rejected, (state, action) => {
                state.downloadTemplateLoading = false;
                state.downloadTemplateSuccess = false;
                state.downloadTemplateFailed = true;
            });
    },
});

export const { resetProductStatus, clearProductData } = productSlice.actions;
export default productSlice.reducer;
