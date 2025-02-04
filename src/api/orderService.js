import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const token = localStorage.getItem("token");

export const updateShipmentStatus = async (orderId) => {
    try {
        const url = `${API_BASE_URL}/shiprocket/fetchOrUpdateShipmentStatus/${orderId}`;
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update shipment status:", error);
        throw error;
    }
};

export const shipOrderInWalmart = async (order) => {
    try {
        const { purchaseOrderId, orderInfo, trackingNumber } = order;

        if (!purchaseOrderId || !orderInfo?.length || !trackingNumber) {
            throw new Error("Missing required fields for shipment.");
        }

        const requestBody = {
            shipments: [
                {
                    shipmentLines: orderInfo.map((item) => ({
                        primeLineNo: item.lineNumber.toString(),
                        shipmentLineNo: item.lineNumber.toString(),
                        quantity: {
                            unitOfMeasurement: item.unitOfMeasurement || "EACH",
                            amount: item.qtyAmount || "1",
                        },
                    })),
                    trackingNumber,
                    carrier: "Shiprocket",
                },
            ],
        };

        const url = `${API_BASE_URL}/walmart/updateShipmentStatus/${purchaseOrderId}`;
        const response = await axios.post(url, requestBody, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        console.error("Failed to ship order in Walmart:", error);
        throw error;
    }
};
