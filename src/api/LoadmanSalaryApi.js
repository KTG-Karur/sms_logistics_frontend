// src/redux/api/LoadmanSalaryApi.js
import { apiReturnCallBack } from './ApiConfig';

// =============================================
// PACKAGE ASSIGNMENT APIs
// =============================================

// Assign loadmen to trip packages
export async function assignLoadmenToTripPackagesApi(tripId, assignments) {
  try {
    const response = await apiReturnCallBack('POST', `/trips/${tripId}/assign-loadmen`, { assignments });
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

// Get trip package loadmen
export async function getTripPackageLoadmenApi(tripId, packageTypeId = null, startDate = null, endDate = null) {
  try {
    let url = `/trips/${tripId}/package-loadmen`;
    const params = new URLSearchParams();
    if (packageTypeId) params.append('packageTypeId', packageTypeId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    
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

// =============================================
// SALARY CALCULATION APIs
// =============================================

// Calculate trip loadman salary
export async function calculateTripLoadmanSalaryApi(tripId) {
  try {
    const response = await apiReturnCallBack('POST', `/trips/${tripId}/calculate-loadman-salary`);
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

// Get loadman salaries
export async function getLoadmanSalariesApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadman-salaries${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Update loadman salary status
export async function updateLoadmanSalaryStatusApi(salaryId, statusData) {
  try {
    const response = await apiReturnCallBack('PATCH', `/loadman-salaries/${salaryId}/status`, statusData);
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

// Calculate loadman daily salary
export async function calculateLoadmanDailySalaryApi(loadmanId, date, includeDetails = true) {
  try {
    const response = await apiReturnCallBack('GET', `/loadman-salary/calculate/daily/${loadmanId}/${date}?includeDetails=${includeDetails}`);
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

// =============================================
// PAYMENT PROCESSING APIs
// =============================================

// Process loadman salary payment
export async function processLoadmanSalaryPaymentApi(paymentData) {
  try {
    const response = await apiReturnCallBack('POST', '/loadman-salary/payment', paymentData);
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

// Get loadman salary summary
export async function getLoadmanSalarySummaryApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadman-salary/summary${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get all loadmen salary summary
export async function getAllLoadmenSalarySummaryApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadman-salary/all-summary${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman expenses
export async function getLoadmanExpensesApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadman-salary/expenses${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman payments
export async function getLoadmanPaymentsApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadman-salary/payments${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman payment by ID
export async function getLoadmanPaymentByIdApi(paymentId) {
  try {
    const response = await apiReturnCallBack('GET', `/loadman-salary/payments/${paymentId}`);
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

// =============================================
// LOADMAN DATA APIs
// =============================================

// Get loadman data
export async function getLoadmanDataApi(filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadmen/data${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman by ID
export async function getLoadmanByIdApi(loadmanId, options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.includeHistory !== undefined) params.append('includeHistory', options.includeHistory);
    if (options.includeTrips !== undefined) params.append('includeTrips', options.includeTrips);
    if (options.includePayments !== undefined) params.append('includePayments', options.includePayments);
    const url = `/loadmen/${loadmanId}${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman trip history
export async function getLoadmanTripHistoryApi(loadmanId, filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadmen/${loadmanId}/trip-history${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman performance
export async function getLoadmanPerformanceApi(loadmanId, startDate, endDate) {
  try {
    const response = await apiReturnCallBack('GET', `/loadmen/${loadmanId}/performance?startDate=${startDate}&endDate=${endDate}`);
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

// Get loadman package assignments
export async function getLoadmanPackageAssignmentsApi(loadmanId, filters = {}) {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    const url = `/loadmen/${loadmanId}/package-assignments${params.toString() ? '?' + params.toString() : ''}`;
    
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

// Get loadman earnings summary
export async function getLoadmanEarningsSummaryApi(loadmanId, startDate, endDate) {
  try {
    const response = await apiReturnCallBack('GET', `/loadmen/${loadmanId}/earnings-summary?startDate=${startDate}&endDate=${endDate}`);
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