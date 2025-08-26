import React from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';

const OrderSuccess = ({ orderId, onCreateDraft, loading }) => {
    return (
        <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
                Order Created Successfully!
            </Typography>
            <Typography variant="body1" gutterBottom>
                Order ID: {orderId}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={onCreateDraft}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
            >
                Create Draft Order
            </Button>
        </Box>
    );
};

export default OrderSuccess;