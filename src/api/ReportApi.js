// api/ReportApi.js
import { apiReturnCallBack } from './ApiConfig';

// GET Daily Profit & Loss Report
export async function getDailyProfitLossApi(request) {
    try {
        const { date, centerId } = request;
        let url = `/reports/profit-loss/daily?date=${date}`;
        if (centerId) url += `&centerId=${centerId}`;
        
        const response = await apiReturnCallBack('GET', url);
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

// GET Date Range Profit & Loss Report
export async function getDateRangeProfitLossApi(request) {
    try {
        const { startDate, endDate, centerId } = request;
        let url = `/reports/profit-loss/range?startDate=${startDate}&endDate=${endDate}`;
        if (centerId) url += `&centerId=${centerId}`;
        
        const response = await apiReturnCallBack('GET', url);
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

// GET Package Report
export async function getPackageReportApi(request) {
    try {
        const { 
            startDate, 
            endDate, 
            centerId, 
            packageTypeId, 
            customerId, 
            status, 
            page, 
            limit 
        } = request;
        
        let url = `/reports/packages?`;
        const params = [];
        
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (centerId) params.push(`centerId=${centerId}`);
        if (packageTypeId) params.push(`packageTypeId=${packageTypeId}`);
        if (customerId) params.push(`customerId=${customerId}`);
        if (status) params.push(`status=${status}`);
        if (page) params.push(`page=${page}`);
        if (limit) params.push(`limit=${limit}`);
        
        url += params.join('&');
        
        const response = await apiReturnCallBack('GET', url);
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

// GET Trip Report
export async function getTripReportApi(request) {
    try {
        const { 
            startDate, 
            endDate, 
            centerId, 
            driverId, 
            vehicleId, 
            status, 
            page, 
            limit 
        } = request;
        
        let url = `/reports/trips?`;
        const params = [];
        
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (centerId) params.push(`centerId=${centerId}`);
        if (driverId) params.push(`driverId=${driverId}`);
        if (vehicleId) params.push(`vehicleId=${vehicleId}`);
        if (status) params.push(`status=${status}`);
        if (page) params.push(`page=${page}`);
        if (limit) params.push(`limit=${limit}`);
        
        url += params.join('&');
        
        const response = await apiReturnCallBack('GET', url);
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

// GET All Bookings With Details (Trip, Driver, Payment)
export async function getAllBookingsWithDetailsApi(request) {
    try {
        const { 
            startDate, 
            endDate, 
            centerId, 
            customerId, 
            status, 
            paymentStatus,
            tripStatus,
            search,
            page, 
            limit,
            includeTrip,
            includePayments
        } = request;
        
        let url = `/bookings/with-details/all?`;
        const params = [];
        
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (centerId) params.push(`centerId=${centerId}`);
        if (customerId) params.push(`customerId=${customerId}`);
        if (status) params.push(`status=${status}`);
        if (paymentStatus) params.push(`paymentStatus=${paymentStatus}`);
        if (tripStatus) params.push(`tripStatus=${tripStatus}`);
        if (search) params.push(`search=${encodeURIComponent(search)}`);
        if (page) params.push(`page=${page}`);
        if (limit) params.push(`limit=${limit}`);
        if (includeTrip !== undefined) params.push(`includeTrip=${includeTrip}`);
        if (includePayments !== undefined) params.push(`includePayments=${includePayments}`);
        
        url += params.join('&');
        
        const response = await apiReturnCallBack('GET', url);
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