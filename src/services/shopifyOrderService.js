import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Sync orders from Shopify for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const syncShopifyOrders = async (date) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
            `${API_BASE_URL}/shopify/orders/sync`,
            { date },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error syncing Shopify orders:', error);
        if (error.response?.status === 403) {
            window.location.href = '/login';
        }
        throw error;
    }
};

/**
 * Get all Shopify orders with pagination
 * @param {number} page - Page number (starting from 1)
 * @param {number} limit - Number of items per page
 * @returns {Promise} API response with orders and pagination info
 */
export const getAllShopifyOrders = async (page = 1, limit = 10) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `${API_BASE_URL}/shopify/orders`,
            {
                params: { page, limit },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching Shopify orders:', error);
        if (error.response?.status === 403) {
            window.location.href = '/login';
        }
        throw error;
    }
};

/**
 * Update a Shopify order
 * @param {string} orderId - Order ID
 * @param {object} orderData - Updated order data
 * @returns {Promise} API response
 */
export const updateShopifyOrder = async (orderId, orderData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
            `${API_BASE_URL}/shopify/orders/${orderId}`,
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating Shopify order:', error);
        if (error.response?.status === 403) {
            window.location.href = '/login';
        }
        throw error;
    }
};
