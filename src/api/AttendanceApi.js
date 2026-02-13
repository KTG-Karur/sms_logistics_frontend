import { apiReturnCallBack } from './ApiConfig';

// ============= STAFF ATTENDANCE APIs =============

/**
 * GET attendance for a specific date
 * @param {Object} request - { attendanceDate, departmentId, employeeId }
 */
export async function getStaffAttendanceApi(request = {}) {
    try {
        let queryString = '';
        if (request && Object.keys(request).length > 0) {
            const params = new URLSearchParams();
            Object.keys(request).forEach(key => {
                if (request[key] !== null && request[key] !== undefined && request[key] !== '') {
                    params.append(key, request[key]);
                }
            });
            queryString = params.toString() ? `?${params.toString()}` : '';
        }
        
        const response = await apiReturnCallBack('GET', `/staff-attendance${queryString}`, null);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getStaffAttendanceApi:', error);
        throw error;
    }
}

/**
 * GET monthly attendance list with holidays and Sundays
 * @param {Object} request - { attendanceDate, departmentId, employeeId }
 */
export async function getStaffAttendanceListApi(request = {}) {
    try {
        let queryString = '';
        if (request && Object.keys(request).length > 0) {
            const params = new URLSearchParams();
            Object.keys(request).forEach(key => {
                if (request[key] !== null && request[key] !== undefined && request[key] !== '') {
                    params.append(key, request[key]);
                }
            });
            queryString = params.toString() ? `?${params.toString()}` : '';
        }
        
        const response = await apiReturnCallBack('GET', `/staff-attendance-list${queryString}`, null);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getStaffAttendanceListApi:', error);
        throw error;
    }
}

/**
 * GET attendance report (present/absent count)
 * @param {Object} request - { attendanceDate, departmentId, employeeId, durationId, staffAttendanceId }
 */
export async function getStaffAttendanceReportApi(request = {}) {
    try {
        let queryString = '';
        if (request && Object.keys(request).length > 0) {
            const params = new URLSearchParams();
            Object.keys(request).forEach(key => {
                if (request[key] !== null && request[key] !== undefined && request[key] !== '') {
                    params.append(key, request[key]);
                }
            });
            queryString = params.toString() ? `?${params.toString()}` : '';
        }
        
        const response = await apiReturnCallBack('GET', `/staff-attendance-report${queryString}`, null);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getStaffAttendanceReportApi:', error);
        throw error;
    }
}

/**
 * CREATE staff attendance
 * @param {Object} request - { staffAttendance: [{ staffId, attendanceDate, attendanceStatus, createdBy }] }
 */
export async function createStaffAttendanceApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/staff-attendance', request);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in createStaffAttendanceApi:', error);
        throw error;
    }
}

/**
 * UPDATE staff attendance
 * @param {Object} request - { staffAttendance: [{ staffId, attendanceDate, attendanceStatus, updatedBy }] }
 */
export async function updateStaffAttendanceApi(request) {
    try {
        const response = await apiReturnCallBack('PUT', '/staff-attendance', request);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in updateStaffAttendanceApi:', error);
        throw error;
    }
}

// ============= HOLIDAY APIs =============

/**
 * GET holidays with filters
 * @param {Object} request - { holidayId, isActive, holidayDate }
 */
export async function getHolidayApi(request = {}) {
    try {
        let queryString = '';
        if (request && Object.keys(request).length > 0) {
            const params = new URLSearchParams();
            Object.keys(request).forEach(key => {
                if (request[key] !== null && request[key] !== undefined && request[key] !== '') {
                    params.append(key, request[key]);
                }
            });
            queryString = params.toString() ? `?${params.toString()}` : '';
        }
        
        const response = await apiReturnCallBack('GET', `/holiday${queryString}`, null);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in getHolidayApi:', error);
        throw error;
    }
}

/**
 * CREATE holiday
 * @param {Object} request - { holiday_date, reason, is_active, created_by }
 */
export async function createHolidayApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/holiday', request);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in createHolidayApi:', error);
        throw error;
    }
}

/**
 * UPDATE holiday
 * @param {Object} request - { holiday_date, reason, is_active, updated_by }
 * @param {string} holidayId - Holiday ID
 */
export async function updateHolidayApi(request, holidayId) {
    try {
        const response = await apiReturnCallBack('PUT', `/holiday/${holidayId}`, request);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in updateHolidayApi:', error);
        throw error;
    }
}

// DELETE holiday
export async function deleteHolidayApi(holidayId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/holiday/${holidayId}`, null);
        const data = await response.json();
        
        if (!response.ok) {
            if (data.code === 401) {
                localStorage.clear();
                window.location.href = '/auth/boxed-signin';
                throw new Error('Unauthorized');
            }
            throw new Error(data.message || JSON.stringify(data));
        }
        return data;
    } catch (error) {
        console.error('Error in deleteHolidayApi:', error);
        throw error;
    }
}