import { apiReturnCallBack } from './ApiConfig';

// GET all officeCenters
export async function getOfficeCentersApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/office-centers', request);
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

// GET office centers with locations
export async function getOfficeCentersWithLocationsApi() {
    try {
        const response = await apiReturnCallBack('GET', '/office-centers/with-locations/all');
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

// CREATE officeCenters
export async function createOfficeCentersApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/office-centers', request);
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

// UPDATE officeCenters
export async function updateOfficeCentersApi(request, officeCentersId) {
    try {
        const response = await apiReturnCallBack('PUT', `/office-centers/${officeCentersId}`, request);
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

export async function deleteOfficeCentersApi(officeCentersId) {
    try {
        const response = await apiReturnCallBack('DELETE', `/office-centers/${officeCentersId}`);
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