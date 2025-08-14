import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Fetch all orders from the backend.
 */
export const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(`${API_BASE_URL}/walmart/getAllOrderHistory`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data.map((order) => ({
            ...order,
            orderLines: JSON.parse(order.orderLines), // Convert orderLines string to object
            shippingAddress: JSON.parse(order.shippingAddress), // Convert shippingAddress string to object
        }));
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
};

export const fetchOrdersForPromotion = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.get(`${API_BASE_URL}/walmart/getAllOrderHistoryByAsc`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data.map((order) => ({
            ...order,
            orderLines: JSON.parse(order.orderLines), // Convert orderLines string to object
            shippingAddress: JSON.parse(order.shippingAddress), // Convert shippingAddress string to object
        }));
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
};

/**
 * Sync shipping prices for orders where shippingPrice is missing.
 */
export const syncShippingPrice = async (payload, showNotification) => {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.put(`${API_BASE_URL}/walmart/syncShippingPrice`, payload, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        
        showNotification("Shipping prices synced successfully!");

        return response.data;
    } catch (error) {
        console.error("Error syncing shipping prices:", error);
        showNotification("Failed to sync shipping prices", "error");
    }
};

/**
 * Update the status of orders (Created or Shipped).
 * @param {string} statusType - "createdOrder" or "ShippedOrder"
 */
export const updateStatus = async (statusType, showNotification) => {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.put(`${API_BASE_URL}/walmart/updateStatus/${statusType}`, {}, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });

        
        if(response.status === 200){
            showNotification(`${statusType} updated successfully!`);
            return response.data;
        }
    } catch (error) {
        console.error(`Failed to update status for ${statusType}:`, error);
        showNotification(`Failed to update ${statusType}!`, "error");
    }
};

/**
 * Update a specific field for an order (e.g., shippingPrice, cost).
 * @param {string} orderId
 * @param {string} field
 * @param {any} value
 */
export const updateOrderField = async (orderId, field, value, setOrders) => {
    const token = localStorage.getItem("token");

    try {
        await axios.put(
            `${API_BASE_URL}/walmart/updateOrder`,
            { purchaseOrderId: orderId, field, value },
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );

        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.purchaseOrderId === orderId ? { ...order, [field]: value } : order
            )
        );
    } catch (error) {
        console.error(`Failed to update ${field} for order ${orderId}:`, error);
    }
};

export const syncOrders = async (selectedDate, showNotification) => {
    if (!selectedDate) {
        showNotification("Please select a date before syncing orders.", "error");
        return;
    }

    const token = localStorage.getItem("token");
    const formattedDate = selectedDate.format("YYYY-MM-DD");

    try {
        const response = await axios.get(`${API_BASE_URL}/walmart/orders/sync?date=${formattedDate}`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        
        if(response.status === 200){
            showNotification("Orders synced successfully!");
            return response.data;
        }
        showNotification("Failed to sync orders.", "error");
    } catch (error) {
        console.error("Error syncing orders:", error);
        showNotification("Failed to sync orders.", "error");
    }
};

export const sendEmailAPI = async (emailData) => {
    try {
        const token = localStorage.getItem("token");

        // Validate required fields before making the API call
        if (!emailData.to || !emailData.subject || !emailData.body) {
            alert("Email recipient, subject, and body are required.");
            return null;
        }

        const response = await axios.post(
            `${API_BASE_URL}/dashboard/send-email`,
            {
                purchaseOrderId: emailData.purchaseOrderId,
                type: emailData.type,
                to: emailData.to,
                subject: emailData.subject,
                body: emailData.body,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Handle response
        if (response.status === 200) {
            alert("Email sent successfully!");
            return response.data;
        } else {
            alert(response.data.message || "Failed to send email.");
            return null;
        }
    } catch (error) {
        console.error("Error sending email:", error.response?.data || error.message);
        alert("An error occurred while sending the email. Please try again.");
        return null;
    }
};


