import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchOrders = async () => {
    console.log("API Base URL:", process.env.REACT_APP_API_BASE_URL);
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`${API_BASE_URL}/walmart/unshipped/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.response.status === 403) window.location.href = '/login';
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
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/shiprocket/createOrder`, order,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
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
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/shiprocket/updateOrder`, order,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            },
        );
        alert('Order updated successfully!');
        return response.data;
    } catch (error) {
        console.error('Error updating shipment:', error);
        throw error;
    }
};

// Function to validate token
export const validateToken = async (token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/validate`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Response:", response);
      return response.status === 200;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  };
