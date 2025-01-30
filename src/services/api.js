import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchOrders = async () => {
    console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);
    try {
        const response = await axios.get(`${API_BASE_URL}/walmart/unshipped/orders`);
        return response.data || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const submitShipment = async (order) => {
    const isOrderInfoValid = order.orderInfo.every(product =>
        Object.values(product.productEditableFields).every(value => value !== null && value !== '')
    );

    if (!isOrderInfoValid) {
        alert('Please fill all fields in the order information before submitting.');
        return null;
    }

    if (Object.values(order.orderEditableFields).some(value => !value)) {
        alert('Please fill all fields before submitting.');
        return;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/shiprocket/createOrder`, order);
        alert('Order submitted successfully!');
        return response.data;
    } catch (error) {
        console.error('Error submitting shipment:', error);
        throw error;
    }
};

export const updateShipment = async (order) => {
    const isOrderInfoValid = order.orderInfo.every(product =>
        Object.values(product.productEditableFields).every(value => value !== null && value !== '')
    );

    if (!isOrderInfoValid) {
        alert('Please fill all fields in the order information before submitting.');
        return;
    }

    if (Object.values(order.orderEditableFields).some(value => !value)) {
        alert('Please fill all fields before submitting.');
        return;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/shiprocket/updateOrder`, order);
        alert('Order updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating shipment:', error);
        throw error;
    }
};
