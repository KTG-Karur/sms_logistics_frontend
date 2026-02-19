// src/redux/api/TripApi.js

import { apiReturnCallBack } from './ApiConfig';

// GET all trips with filters
export async function getTripsApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/trips', request);
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

// GET trip by ID
export async function getTripByIdApi(tripId) {
    try {
        const response = await apiReturnCallBack('GET', `/trips/${tripId}`);
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

// GET available bookings for trip assignment
export async function getAvailableBookingsApi() {
    try {
        const response = await apiReturnCallBack('GET', '/trips/available/bookings');
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
        // Return empty data structure on error
        return { data: [], error: true, message: error.message, code: 500 };
    }
}

// GET available vehicles for a date
export async function getAvailableVehiclesApi(tripDate) {
    try {
        const response = await apiReturnCallBack('GET', `/trips/available/vehicles?tripDate=${tripDate}`);
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
        return { data: [], error: true, message: error.message, code: 500 };
    }
}

// GET available drivers for a date
export async function getAvailableDriversApi(tripDate) {
    try {
        const response = await apiReturnCallBack('GET', `/trips/available/drivers?tripDate=${tripDate}`);
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
        return { data: [], error: true, message: error.message, code: 500 };
    }
}

// GET available loadmen for a date
export async function getAvailableLoadmenApi(tripDate) {
    try {
        const response = await apiReturnCallBack('GET', `/trips/available/loadmen?tripDate=${tripDate}`);
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
        return { data: [], error: true, message: error.message, code: 500 };
    }
}

// CREATE new trip
export async function createTripApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/trips', request);
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

// UPDATE trip
export async function updateTripApi(request, tripId) {
    try {
        const response = await apiReturnCallBack('PUT', `/trips/${tripId}`, request);
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

// UPDATE trip status
export async function updateTripStatusApi(tripId, statusData) {
    try {
        const response = await apiReturnCallBack('PUT', `/trips/${tripId}/status`, statusData);
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

// UPDATE trip bookings (ADD/REMOVE bookings) - For add-on stages
export async function updateTripBookingsApi(tripId, bookingData) {
    try {
        const response = await apiReturnCallBack('PUT', `/trips/${tripId}/bookings`, bookingData);
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

// DELETE trip (soft delete)
export async function deleteTripApi(tripId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/trips/${tripId}`);
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