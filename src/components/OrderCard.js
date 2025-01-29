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

const OrderCard = ({ order, onView, onEdit, onShipment, onFetchShipmentStatus}) => {
    const shipmentStatus = order.shipmentStatus || "NOT_CREATED"; // Default to NOT_CREATED
    const bgColor = shipmentStatusColors[shipmentStatus];
    const statusLabel = shipmentStatusLabels[shipmentStatus];


    const handleUpdateStatus = async (orderId) => {
        try {
            const url = `${API_BASE_URL}/shiprocket/fetchOrUpdateShipmentStatus/${orderId}`;
            const response = await axios.get(url);

            console.log('Shipment status updated successfully:');
            updateShipmentStatus(response.data);
        } catch (error) {
            console.error('Failed to update shipment status:', error);
        }
    };

    const updateShipmentStatus = (shipmentDetails) => {
        onFetchShipmentStatus({
            ...order,
            shipmentStatus: shipmentDetails.status,
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
                        Order ID: {order.customerOrderId}
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
