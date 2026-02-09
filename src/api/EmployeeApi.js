import { apiReturnCallBack } from './ApiConfig';

// GET all employees with filters
export async function getEmployeeApi(request = {}) {
    try {
        // Build query string from request object
        let queryString = '';
        if (request) {
            const params = new URLSearchParams();
            Object.keys(request).forEach(key => {
                if (request[key] !== null && request[key] !== undefined && request[key] !== '') {
                    params.append(key, request[key]);
                }
            });
            queryString = params.toString() ? `?${params.toString()}` : '';
        }
        
        const response = await apiReturnCallBack('GET', `/employees${queryString}`, null);
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

// CREATE employee
export async function createEmployeeApi(request) {
    try {
        const response = await apiReturnCallBack('FORMPOST', '/employees', request);
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

// UPDATE employee
export async function updateEmployeeApi(request, employeeId) {
    try {
        const response = await apiReturnCallBack('FORMPUT', `/employees/${employeeId}`, request);
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

// DELETE employee
export async function deleteEmployeeApi(employeeId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/employees/${employeeId}`);
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