// src/redux/api/SalaryApi.js
import { apiReturnCallBack } from './ApiConfig';

// GET calculate salary for employees
export async function calculateSalaryApi(params) {
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiReturnCallBack('GET', `/salary/calculate?${queryParams}`);
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

// GET salary summary
export async function getSalarySummaryApi(params) {
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiReturnCallBack('GET', `/salary/summary?${queryParams}`);
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

// GET employee salary detail
export async function getEmployeeSalaryDetailApi(employeeId, salaryMonth) {
    try {
        const response = await apiReturnCallBack('GET', `/salary/employee/${employeeId}/${salaryMonth}`);
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

// POST process salary payment
export async function processSalaryPaymentApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/salary/payment', request);
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

// GET salary payments
export async function getSalaryPaymentsApi(params) {
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiReturnCallBack('GET', `/salary/payments?${queryParams}`);
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

// GET salary payment by ID
export async function getSalaryPaymentByIdApi(paymentId) {
    try {
        const response = await apiReturnCallBack('GET', `/salary/payments/${paymentId}`);
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

// ============= SALARY ADJUSTMENTS API =============

// GET salary adjustments
export async function getSalaryAdjustmentsApi(params) {
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiReturnCallBack('GET', `/salary-adjustments?${queryParams}`);
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

// POST create salary adjustment
export async function createSalaryAdjustmentApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/salary-adjustments', request);
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

// PUT update salary adjustment
export async function updateSalaryAdjustmentApi(adjustmentId, request) {
    try {
        const response = await apiReturnCallBack('PUT', `/salary-adjustments/${adjustmentId}`, request);
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

// DELETE salary adjustment
export async function deleteSalaryAdjustmentApi(adjustmentId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/salary-adjustments/${adjustmentId}`);
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