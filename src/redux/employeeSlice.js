import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeApi, createEmployeeApi, updateEmployeeApi, deleteEmployeeApi } from '../api/EmployeeApi';

export const getEmployee = createAsyncThunk('employee/getEmployee', async (filters = {}) => {
    return await getEmployeeApi(filters);
});

export const createEmployee = createAsyncThunk('employee/createEmployee', async (request) => {
    return await createEmployeeApi(request);
});

export const updateEmployee = createAsyncThunk('employee/updateEmployee', async ({ request, employeeId }) => {
    return await updateEmployeeApi(request, employeeId);
});

export const deleteEmployee = createAsyncThunk('employee/deleteEmployee', async (employeeId) => {
    return await deleteEmployeeApi(employeeId);
});

const employeeSlice = createSlice({
    name: 'employee',
    initialState: {
        employeeData: [],
        filteredData: [],
        loading: false,
        error: null,
        getEmployeeSuccess: false,
        getEmployeeFailed: false,
        createEmployeeSuccess: false,
        createEmployeeFailed: false,
        updateEmployeeSuccess: false,
        updateEmployeeFailed: false,
        deleteEmployeeSuccess: false,
        deleteEmployeeFailed: false,
        filters: {
            is_driver: null,
            has_salary: null,
            is_loadman: null,
            is_active: null,
        },
    },
    reducers: {
        resetEmployeeStatus: (state) => {
            state.getEmployeeSuccess = false;
            state.getEmployeeFailed = false;
            state.createEmployeeSuccess = false;
            state.createEmployeeFailed = false;
            state.updateEmployeeSuccess = false;
            state.updateEmployeeFailed = false;
            state.deleteEmployeeSuccess = false;
            state.deleteEmployeeFailed = false;
            state.error = null;
            state.loading = false;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                is_driver: null,
                has_salary: null,
                is_loadman: null,
                is_active: null,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(getEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.getEmployeeSuccess = false;
                state.getEmployeeFailed = false;
            })
            .addCase(getEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.employeeData = action.payload.data || [];
                state.filteredData = action.payload.data || [];
                state.getEmployeeSuccess = true;
                state.getEmployeeFailed = false;
            })
            .addCase(getEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Fetch failed';
                state.getEmployeeSuccess = false;
                state.getEmployeeFailed = true;
            })

            // CREATE
            .addCase(createEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.createEmployeeSuccess = false;
                state.createEmployeeFailed = false;
            })
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.data) {
                    state.employeeData.unshift(action.payload.data);
                    state.filteredData.unshift(action.payload.data);
                }
                state.createEmployeeSuccess = true;
                state.createEmployeeFailed = false;
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Create failed';
                state.createEmployeeSuccess = false;
                state.createEmployeeFailed = true;
            })

            // UPDATE
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateEmployeeSuccess = false;
                state.updateEmployeeFailed = false;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                const updatedEmployee = action.payload.data;
                const index = state.employeeData.findIndex((employee) => employee.employeeId === updatedEmployee.employeeId);
                if (index !== -1) {
                    state.employeeData[index] = updatedEmployee;
                    state.filteredData[index] = updatedEmployee;
                }
                state.updateEmployeeSuccess = true;
                state.updateEmployeeFailed = false;
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Update failed';
                state.updateEmployeeSuccess = false;
                state.updateEmployeeFailed = true;
            })

            // DELETE
            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.deleteEmployeeSuccess = false;
                state.deleteEmployeeFailed = false;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.loading = false;
                const employeeId = action.meta.arg;
                state.employeeData = state.employeeData.filter((employee) => employee.employeeId !== employeeId);
                state.filteredData = state.filteredData.filter((employee) => employee.employeeId !== employeeId);
                state.deleteEmployeeSuccess = true;
                state.deleteEmployeeFailed = false;
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete failed';
                state.deleteEmployeeSuccess = false;
                state.deleteEmployeeFailed = true;
            });
    },
});

export const { resetEmployeeStatus, setFilters, clearFilters } = employeeSlice.actions;
export default employeeSlice.reducer;