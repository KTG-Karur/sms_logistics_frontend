import { apiReturnCallBack } from './ApiConfig';

// GET all expenses with filters
export async function getExpenseApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/expenses', request);
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

// GET single expense with details
export async function getExpenseByIdApi(expenseId) {
    try {
        const response = await apiReturnCallBack('GET', `/expenses/${expenseId}`);
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

// CREATE expense (with optional payment)
export async function createExpenseApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/expenses', request);
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

// UPDATE expense (with optional payment)
export async function updateExpenseApi(request, expenseId) {
    try {
        const response = await apiReturnCallBack('PUT', `/expenses/${expenseId}`, request);
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

// DELETE expense (soft delete)
export async function deleteExpenseApi(expenseId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/expenses/${expenseId}`);
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

// GET expense payments
export async function getExpensePaymentsApi(expenseId) {
    try {
        const response = await apiReturnCallBack('GET', `/expenses/${expenseId}/payments`);
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