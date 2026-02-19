import { apiReturnCallBack } from './ApiConfig';

// GET all bookings with filters
export async function getDeliveriesApi(request) {
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

// GET booking by ID
export async function getDeliveryByIdApi(bookingId) {
    try {
        const response = await apiReturnCallBack('GET', `/bookings/${bookingId}`);
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
export async function updateDeliveryStatusApi(bookingId, statusData) {
    try {
        const response = await apiReturnCallBack('PUT', `/bookings/${bookingId}/delivery-status`, statusData);
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

// GET bookings by customer
export async function getDeliveriesByCustomerApi(customerId, type = 'sender') {
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