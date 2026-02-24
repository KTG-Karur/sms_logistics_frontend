// export const baseURL = 'http://localhost:5098';
export const baseURL = 'https://ktgapi.smstransports.in'; // live

const getBaseUrl = (url) => {
    return `${baseURL}${url}`;
};

const getUserToken = () => {
    try {
        const data = JSON.parse(localStorage.getItem('loginInfo')) || [];
        const token = data?.token || '';
        return token;
    } catch (error) {
        console.log('TOKEN ERROR :', error);
    }
};

export function apiReturnCallBack(method, url, object = null, config = null) {
    const headers = {
        'Cache-Control': 'no-cache',
        'If-Modified-Since': 0,
        auth: getUserToken(),
    };

    if (method !== 'DELETE') {
        headers['Content-Type'] = 'application/json';
    }

    const fetchConfig = {
        method,
        headers,
        ...config,
    };

    if (object) {
        if (method === 'FORMPOST') {
            // const formData = new FormData();
            // Object.keys(object).forEach((key) => {
            //   formData.append(key, object[key]);
            // });
            fetchConfig.method = 'POST';
            fetchConfig.body = object;
            delete fetchConfig.headers['Content-Type'];
            // fetchConfig.headers['Content-Type'] = 'multipart/form-data';
            // fetchConfig.headers['content-type'] = 'multipart/form-data';
        }
        else if (method === 'FORMPUT') {
            // const formData = new FormData();
            // Object.keys(object).forEach((key) => {
            //   formData.append(key, object[key]);
            // });
            fetchConfig.method = 'PUT';
            fetchConfig.body = object;
            delete fetchConfig.headers['Content-Type'];
            // fetchConfig.headers['Content-Type'] = 'multipart/form-data';
            // fetchConfig.headers['content-type'] = 'multipart/form-data';
        } else if (method === 'GET') {
            const queryParams = new URLSearchParams(object).toString();
            url += `?${queryParams}`;
        } else if (method === 'DELETE') {
            delete fetchConfig.headers['Content-Type'];
        } else {
            fetchConfig.body = JSON.stringify(object);
        }
    }
    return fetch(getBaseUrl(url), fetchConfig);
}
