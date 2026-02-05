import { apiReturnCallBack } from './ApiConfig';

// GET all products
export async function getProductsApi(request) {
    try {
        const response = await apiReturnCallBack('GET', '/products', request);
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

// CREATE product
export async function createProductApi(request) {
    try {
        const response = await apiReturnCallBack('POST', '/products', request);
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

// UPDATE product
export async function updateProductApi(request, productId) {
    try {
        const response = await apiReturnCallBack('PUT', `/products/${productId}`, request);
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

export async function deleteProductApi(productId) {
    try {
        const response = await apiReturnCallBack('PUT', `/products/${productId}`, { isActive: 0 }); // Pass true to indicate no body
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

// Excel bulk upload
export async function bulkUploadProductsApi(formData) {
  try {
    const response = await apiReturnCallBack('FORMPOST', '/products/upload-excel', formData, true);
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
    console.error(error);
    throw error;
  }
}

// Download template
export async function downloadTemplateApi() {
  try {
    const response = await fetch(`${baseURL}/products/download-template`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    
    return await response.blob();
  } catch (error) {
    console.error(error);
    throw error;
  }
}