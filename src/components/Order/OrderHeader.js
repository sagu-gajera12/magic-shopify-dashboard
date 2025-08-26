import React from 'react';
import { Typography, Box, Button } from '@mui/material';

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

const OrderHeader = ({ order, onUpdateStatus, onShipOrderInWalmart }) => {
    const shipmentStatus = order.shipmentStatus || "NOT_CREATED";
    const bgColor = shipmentStatusColors[shipmentStatus];
    const statusLabel = shipmentStatusLabels[shipmentStatus];

    return (
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
            <Box display="flex" gap={1}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onUpdateStatus(order.customerOrderId)}
                >
                    Update Status
                </Button>

                {order.shipmentStatus === "SHIPPED_IN_SHIP_ROCKET" && (
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => onShipOrderInWalmart(order)}
                    >
                        Ship in Walmart
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default OrderHeader;