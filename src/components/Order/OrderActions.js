import React from 'react';
import { Box, Button } from '@mui/material';

const OrderActions = ({ order, onView, onEdit, onShipment, onShipGlobal }) => {
    return (
        <Box mt="auto" display="flex" gap={2}>
            <Button 
                variant="contained" 
                onClick={() => onView(order)}
            >
                View
            </Button>
            <Button 
                variant="outlined" 
                onClick={() => onEdit(order)}
            >
                Edit
            </Button>
            <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => onShipment(order)}
            >
                Start Shipment
            </Button>
            <Button 
                variant="contained" 
                style={{ backgroundColor: '#4CAF50' }} 
                onClick={onShipGlobal}
            >
                ShipGlobal
            </Button>
        </Box>
    );
};

export default OrderActions;