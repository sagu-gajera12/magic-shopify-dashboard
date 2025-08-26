import React from 'react';
import { CardContent, Typography } from '@mui/material';
import EditableField from '../EditableFields';

const OrderDetails = ({ order }) => {
    return (
        <CardContent>
            <Typography>Customer Name: {order.shippingInfo.postalAddress.name}</Typography>
            <Typography>Address: {order.shippingInfo.postalAddress.address1}</Typography>
            <Typography>Email: {order.customerEmailId}</Typography>
            <Typography>Phone: {order.shippingInfo.phone}</Typography>
            
            {order.orderInfo.map((orderInfo) => (
                <CardContent 
                    key={orderInfo.lineNumber} 
                    style={{ padding: '8px', backgroundColor: '#f9f9f9' }}
                >
                    <Typography>Product Name: {orderInfo.productName}</Typography>
                    <Typography>Unit of Measurement: {orderInfo.unitOfMeasurement}</Typography>
                    <Typography>Quantity: {orderInfo.qtyAmount}</Typography>
                    <Typography>Price: ${orderInfo.chargeAmount}</Typography>
                    <EditableField data={orderInfo.productEditableFields} flag="productEditableFields" />
                </CardContent>
            ))}
            
            <EditableField data={order.orderEditableFields} flag="orderEditableFields" />
        </CardContent>
    );
};

export default OrderDetails;