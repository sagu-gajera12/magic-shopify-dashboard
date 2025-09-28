import React from 'react';
import { Box, Button } from '@mui/material';

const OrderActions = ({ order, onView, onEdit, onShipment, onShipGlobal, handleOpenEmailModal, setEmailData }) => {
    return (
        <Box 
            mt="auto" 
            display="flex" 
            gap={1.5}
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-start"
        >
            <Button 
                variant="contained" 
                size="small"
                onClick={() => onView(order)}
                sx={{ minWidth: 'fit-content' }}
            >
                View
            </Button>
            <Button 
                variant="outlined" 
                size="small"
                onClick={() => onEdit(order)}
                sx={{ minWidth: 'fit-content' }}
            >
                Edit
            </Button>
            <Button 
                variant="contained" 
                color="secondary" 
                size="small"
                onClick={() => onShipment(order)}
                sx={{ minWidth: 'fit-content' }}
            >
                Start Shipment
            </Button>
            <Button 
                variant="contained" 
                size="small"
                onClick={() => onShipGlobal(order)}
                sx={{ 
                    backgroundColor: '#4CAF50',
                    '&:hover': {
                        backgroundColor: '#45a049'
                    },
                    minWidth: 'fit-content'
                }}
            >
                ShipGlobal
            </Button>
            <Button 
                variant="contained" 
                size="small"
                onClick={() => handleOpenEmailModal(order, "orderTrackingEmail")}
                sx={{ 
                    backgroundColor: '#2196F3',
                    '&:hover': {
                        backgroundColor: '#1976D2'
                    },
                    minWidth: 'fit-content'
                }}
            >
                Send Email
            </Button>
        </Box>
    );
};

export default OrderActions;