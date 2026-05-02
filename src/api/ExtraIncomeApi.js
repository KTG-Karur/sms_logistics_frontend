import { apiReturnCallBack } from './ApiConfig';

// GET all extra incomes with filters
export async function getExtraIncomeApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/extra-incomes', request);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// GET single extra income by ID
export async function getExtraIncomeByIdApi(extraIncomeId) {
    try {
        const response = await apiReturnCallBack('GET', `/extra-incomes/${extraIncomeId}`);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// CREATE extra income
export async function createExtraIncomeApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/extra-incomes', request);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// UPDATE extra income
export async function updateExtraIncomeApi(request, extraIncomeId) {
    try {
        const response = await apiReturnCallBack('PUT', `/extra-incomes/${extraIncomeId}`, request);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;  // ← Fixed line
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// DELETE extra income
export async function deleteExtraIncomeApi(extraIncomeId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/extra-incomes/${extraIncomeId}`);
        const data = await response.json();
        if (!response.ok) {
            if (data.code == 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}