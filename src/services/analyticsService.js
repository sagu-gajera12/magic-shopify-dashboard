// src/services/analyticsService.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token')
  },
  timeout: 30000,
});

// Add token to each request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses/errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'An error occurred';
      console.error('API Error:', errorMessage);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Format date helper
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

// ───────────────────────────────────────────────
// 📌 EXPORT EACH METHOD INDIVIDUALLY
// ───────────────────────────────────────────────

// Courier Performance
export const getCourierPerformance = async (startDate, endDate) => {
  const response = await apiClient.get('shopify/orders/analytics/courier/performance', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

export const getCourierDetails = async (courierName, startDate, endDate) => {
  const response = await apiClient.get(`shopify/orders/analytics/courier/${courierName}/details`, {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

// Geography / Pincode
export const getPincodePerformance = async (startDate, endDate, limit = 50) => {
  const response = await apiClient.get('/shopify/orders/analytics/geography/pincode', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      limit,
    },
  });
  return response.data;
};

export const getCityPerformance = async (startDate, endDate) => {
  const response = await apiClient.get('/shopify/orders/analytics/geography/city', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

export const getStatePerformance = async (startDate, endDate) => {
  const response = await apiClient.get('/shopify/orders/analytics/geography/state', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};

export const getProblemAreas = async (startDate, endDate, minOrders = 10) => {
  const response = await apiClient.get('/shopify/orders/analytics/geography/problem-areas', {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      minOrders,
    },
  });
  return response.data;
};
