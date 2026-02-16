import { apiReturnCallBack } from './ApiConfig';

// GET all opening balances with filters
export async function getOpeningBalanceApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/opening-balances', request);
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

// CREATE opening balance
export async function createOpeningBalanceApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/opening-balances', request);
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

// BULK CREATE opening balances
export async function bulkCreateOpeningBalancesApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/opening-balances/bulk', request);
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

// UPDATE opening balance
export async function updateOpeningBalanceApi(request, openingBalanceId) {
    try {
        const response = await apiReturnCallBack('PUT', `/opening-balances/${openingBalanceId}`, request);
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

// DELETE opening balance (soft delete)
export async function deleteOpeningBalanceApi(openingBalanceId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/opening-balances/${openingBalanceId}`);
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