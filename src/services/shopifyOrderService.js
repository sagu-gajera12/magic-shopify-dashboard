import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Sync orders from Shopify for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} Response with syncedCount
 */
export const syncShopifyOrders = async (date) => {
    try {
        const response = await apiClient.post('/shopify/orders/sync', { date });
        return response.data;
    } catch (error) {
        console.error('Error syncing Shopify orders:', error);
        throw error.response?.data || error;
    }
};

/**
 * Sync specific orders by their IDs
 * @param {Array<string>} orderIds - Array of Shopify order IDs
 * @returns {Promise} Response with syncedCount
 */
export const syncShopifyOrdersByIds = async (orderIds) => {
    try {
        const response = await apiClient.post('/shopify/orders/sync', { orderIds });
        return response.data;
    } catch (error) {
        console.error('Error syncing Shopify orders by IDs:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get all Shopify orders with pagination
 * @param {number} page - Page number (starting from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise} Response with orders and pagination info
 */
export const getAllShopifyOrders = async (page = 1, limit = 10) => {
    try {
        const response = await apiClient.get('/shopify/orders', {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Shopify orders:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get a specific order by ID
 * @param {string} orderId - The order ID
 * @returns {Promise} Response with order details
 */
export const getShopifyOrderById = async (orderId) => {
    try {
        const response = await apiClient.get(`/shopify/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Shopify order:', error);
        throw error.response?.data || error;
    }
};

/**
 * Update order financial details
 * @param {string} orderId - The order ID
 * @param {Object} orderData - Updated order data
 * @param {number} orderData.orderValue - Order value
 * @param {number} orderData.shippingValue - Shipping value
 * @param {number} orderData.rtoValue - RTO value
 * @param {number} orderData.coa - Cost of acquisition
 * @param {number} orderData.gac - Google Ads Cost (optional)
 * @returns {Promise} Response with updated order
 */
export const updateShopifyOrder = async (orderId, orderData) => {
    try {
        const response = await apiClient.put(`/shopify/orders/${orderId}`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error updating Shopify order:', error);
        throw error.response?.data || error;
    }
};

export default {
    syncShopifyOrders,
    syncShopifyOrdersByIds,
    getAllShopifyOrders,
    getShopifyOrderById,
    updateShopifyOrder,
};