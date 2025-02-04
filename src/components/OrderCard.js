import React from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import EditableField from './EditableFields';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const shipmentStatusColors = {
    NOT_CREATED: "#FFCDD2", // Light Red
    CREATED: "#FFF9C4", // Light Yellow
    SHIPPED_IN_WALMART: "#BBDEFB", // Light Blue
    SHIPPED_IN_SHIP_ROCKET: "#C8E6C9", // Light Green
};

const shipmentStatusLabels = {
    NOT_CREATED: "Not Created",
    CREATED: "Created",
    SHIPPED_IN_WALMART: "Shipped in Walmart",
    SHIPPED_IN_SHIP_ROCKET: "Shipped in ShipRocket",
};

const OrderCard = ({ order, onView, onEdit, onShipment, onFetchShipmentStatus }) => {
    const shipmentStatus = order.shipmentStatus || "NOT_CREATED"; // Default to NOT_CREATED
    const bgColor = shipmentStatusColors[shipmentStatus];
    const statusLabel = shipmentStatusLabels[shipmentStatus];


    const handleUpdateStatus = async (orderId) => {
        try {

            const url = `${API_BASE_URL}/shiprocket/fetchOrUpdateShipmentStatus/${orderId}`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Shipment status updated successfully:', response.data);
            updateShipmentStatus(response.data);
        } catch (error) {
            console.error('Failed to update shipment status:', error);
        }
    };

    const handleShipOrderInWalmart = async (order) => {
        try {
            // Extracting required fields from backend response
            const { purchaseOrderId, orderInfo } = order;

            if (purchaseOrderId === "") {
                alert('Order does not have purchaseOrderId.');
            }

            // Ensure order has necessary details
            if (!orderInfo || orderInfo.length === 0) {
                alert('Order does not have any products to ship.');
                return;
            }

            if (order.trackingNumber === "" || order.trackingNumber == null) {
                alert('Order does not have tracking details.');
                return;
            }

            // Preparing API request payload
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
                                            // dayPhone: shippingInfo.phone,
                                            // emailId: "support@example.com",
                                        },
                                    },
                                ],
                            },
                        })),
                    },
                },
            };


            console.log('requestBody:', requestBody);

            const url = `${API_BASE_URL}/walmart/updateShipmentStatus/${purchaseOrderId}`;
            const response = await axios.post(url,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

            onFetchShipmentStatus({ ...order, shipmentStatus: "SHIPPED_IN_WALMART" });

            console.log('Shipment status updated successfully in walmart:', response.data);
        } catch (error) {
            console.error('Failed to update shipment status:', error);
        }
    };

    const updateShipmentStatus = (shipmentDetails) => {
        onFetchShipmentStatus({
            ...order,
            shipmentStatus: shipmentDetails.status,
            trackingNumber: shipmentDetails.trackingNumber,
            trackingUrl: shipmentDetails.trackingUrl,
        });
    }


    return (
        <Card
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 16,
            }}
        >
            {/* Header with Status */}
            <Box
                style={{
                    backgroundColor: bgColor,
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div>
                    <Typography style={{ margin: 0 }}>
                        Customer Order ID: {order.customerOrderId}
                    </Typography>
                    <Typography style={{ margin: 0 }}>
                        Purchase Order ID: {order.purchaseOrderId}
                    </Typography>
                    <Typography
                        style={{
                            margin: 0,
                            fontWeight: 'bold',
                        }}
                    >
                        Status: {statusLabel}
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateStatus(order.customerOrderId)}
                >
                    Update Status
                </Button>

                {order.shipmentStatus === "SHIPPED_IN_SHIP_ROCKET" && <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleShipOrderInWalmart(order)}
                >
                    Ship in walmart
                </Button>
                }
            </Box>

            {/* Order Details */}
            <CardContent>
                <Typography>Customer Name: {order.shippingInfo.postalAddress.name}</Typography>
                <Typography>Address: {order.shippingInfo.postalAddress.address1}</Typography>
                <Typography>Email: {order.customerEmailId}</Typography>
                <Typography>Phone: {order.shippingInfo.phone}</Typography>
                {order.orderInfo.map((orderInfo) => (
                    <CardContent key={orderInfo.lineNumber} style={{ padding: '8px', backgroundColor: '#f9f9f9' }}>
                        <Typography>Product Name: {orderInfo.productName}</Typography>
                        <Typography>unitOfMeasurement: {orderInfo.unitOfMeasurement}</Typography>
                        <Typography>Quantity: {orderInfo.qtyAmount}</Typography>
                        <Typography>Price: ${orderInfo.chargeAmount}</Typography>
                        <EditableField data={orderInfo.productEditableFields} flag="productEditableFields" />
                    </CardContent>
                ))}
                <EditableField data={order.orderEditableFields} flag="orderEditableFields" />
            </CardContent>

            {/* Footer Actions */}
            <Box mt="auto" display="flex" gap={2}>
                <Button variant="contained" onClick={() => onView(order)}>View</Button>
                <Button variant="outlined" onClick={() => onEdit(order)}>Edit</Button>
                <Button variant="contained" color="secondary" onClick={() => onShipment(order)}>Start Shipment</Button>
            </Box>
        </Card>
    );
};

export default OrderCard;
