import React from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import EditableField from './EditableFields';

const OrderCard = ({ order, onView, onEdit, onShipment, onOpneModel, setSelectedOrder }) => {
    return (
        <Card
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: 16,
            }}
        >
            <CardContent>
                <Typography variant="h6">Order ID: {order.customerOrderId}</Typography>
                <Typography>Customer Name: {order.shippingInfo.postalAddress.name}</Typography>
                <Typography>Address: {order.shippingInfo.postalAddress.address1}</Typography>
                <Typography>Email: {order.customerEmailId}</Typography>
                <Typography>Phone: {order.shippingInfo.phone}</Typography>
                {order.orderInfo.map((orderInfo) => (
                    <CardContent key={orderInfo.lineNumber}>
                        <Typography>Product Name: {orderInfo.productName}</Typography>
                        <Typography>Quantity: {orderInfo.qtyAmount}</Typography>
                        <Typography>Price: ${orderInfo.chargeAmount}</Typography>
                        <EditableField data={orderInfo.productEditableFields} flag="productEditableFields" />
                    </CardContent>
                ))}
                <EditableField data={order.orderEditableFields} flag="orderEditableFields" />
            </CardContent>
            <Box mt="auto" display="flex" gap={2}>
                <Button variant="contained" onClick={() => onView(order)}>View</Button>
                <Button variant="outlined" onClick={() => onEdit(order)}>Edit</Button>
                <Button variant="contained" color="secondary" onClick={() => onShipment(order)}>Start Shipment</Button>
            </Box>
        </Card>
    );
};

export default OrderCard;
