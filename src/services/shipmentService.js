import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
    'X-Tenant-Id': localStorage.getItem('TenantId'),
});

export const shipmentService = {
    async updateShipmentStatus(orderId) {
        const url = `${API_BASE_URL}/api/integrations/courier/shiprocket/fetchOrUpdateShipmentStatus/${orderId}`;
        return await axios.get(url, {
            headers: getAuthHeaders()
        });
    },

    async shipOrderInWalmart(order) {
        const { purchaseOrderId, orderInfo } = order;

        const requestBody = {
            orderShipment: {
                orderLines: {
                    orderLine: orderInfo.map((item) => ({
                        lineNumber: item.lineNumber.toString(),
                        sellerOrderId: purchaseOrderId,
                        intentToCancelOverride: false,
                        orderLineStatuses: {
                            orderLineStatus: [
                                {
                                    status: "Shipped",
                                    statusQuantity: {
                                        unitOfMeasurement: item.unitOfMeasurement || "EACH",
                                        amount: item.qtyAmount.toString(),
                                    },
                                    trackingInfo: {
                                        shipDateTime: Date.now(),
                                        carrierName: { carrier: "Shiprocket" },
                                        methodCode: "Standard",
                                        trackingNumber: order.trackingNumber,
                                    },
                                    returnCenterAddress: {
                                        name: "Grow Enterprises return center",
                                        address1: "5050 East Garford Street Apt 170",
                                        city: " Long Beach",
                                        state: "California",
                                        postalCode: "90815",
                                        country: "USA",
                                    },
                                },
                            ],
                        },
                    })),
                },
            },
        };

        const url = `${API_BASE_URL}/api/integrations/courier/walmart/updateShipmentStatus/${purchaseOrderId}`;
        return await axios.post(url, requestBody, {
            headers: getAuthHeaders()
        });
    }
};