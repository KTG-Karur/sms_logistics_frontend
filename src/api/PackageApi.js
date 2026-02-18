import { apiReturnCallBack } from './ApiConfig';

// GET all packages (bookings)
export async function getPackageApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/bookings', request);
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

// GET package by ID
export async function getPackageByIdApi(packageId) {
    try {
        const response = await apiReturnCallBack('GET', `/bookings/${packageId}`);
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

// GET packages by customer
export async function getPackagesByCustomerApi(customerId, type = 'sender') {
    try {
        const response = await apiReturnCallBack('GET', `/customers/${customerId}/bookings?type=${type}`);
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

// CREATE package (booking)
export async function createPackageApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/bookings', request);
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

// UPDATE package (booking)
export async function updatePackageApi(request, packageId) {
    try {
        const response = await apiReturnCallBack('PUT', `/bookings/${packageId}`, request);
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

// UPDATE delivery status
export async function updatePackageDeliveryStatusApi(packageId, statusData) {
    try {
        const response = await apiReturnCallBack('PATCH', `/bookings/${packageId}/delivery-status`, statusData);
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

// DELETE package (booking) - soft delete
export async function deletePackageApi(packageId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/bookings/${packageId}`);
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

// ADD payment to package
export async function addPackagePaymentApi(packageId, paymentData) {
    try {
        const response = await apiReturnCallBack('POST', `/bookings/${packageId}/payments`, paymentData);
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

// GET customer payments by date range
export async function getCustomerPaymentsByDateApi(customerId, startDate, endDate, type = 'sender') {
    try {
        const response = await apiReturnCallBack('GET', `/customers/${customerId}/payments/by-date?startDate=${startDate}&endDate=${endDate}&type=${type}`);
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

// GET customer bookings and payments list
export async function getCustomerBookingsAndPaymentsApi(customerId) {
    try {
        const response = await apiReturnCallBack('GET', `/customers/${customerId}/bookings-payments`);
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

// POST make bulk payment for customer
export async function makeCustomerBulkPaymentApi(customerId, paymentData) {
    try {
        const response = await apiReturnCallBack('POST', `/customers/${customerId}/bulk-payment`, paymentData);
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

// GET all customer payment records
export async function getAllCustomerPaymentRecordsApi(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await apiReturnCallBack('GET', `/customer-payments/records?${queryParams}`);
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

// GET customer payment summary
export async function getCustomerPaymentSummaryApi(customerId) {
    try {
        const response = await apiReturnCallBack('GET', `/customers/${customerId}/payment-summary`);
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

// GET all customers payment summary
export async function getAllCustomersPaymentSummaryApi(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await apiReturnCallBack('GET', `/customers/payment-summary/all?${queryParams}`);
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