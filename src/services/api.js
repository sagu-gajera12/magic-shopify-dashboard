import axios from 'axios';

export const fetchOrders = async () => {
    try {
        const response = await axios.get('http://localhost:8080/walmart/unshipped/orders');
        return response.data || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

export const submitShipment = async (order) => {
    console.log(order)
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
        const response = await axios.post('http://localhost:8080/shiprocket/createOrder', order);
        return order;
    } catch (error) {
        console.error('Error submitting shipment:', error);
        throw error;
    }
};
