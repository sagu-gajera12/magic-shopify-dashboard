import React from 'react';
import {
    Grid,
    Typography,
    Card,
    Box
} from '@mui/material';

const ShipperSelection = ({ shipperRates, selectedShipper, onShipperSelect, loading }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                    Select Shipping Service
                </Typography>
            </Grid>
            {shipperRates.map((rate) => (
                <Grid item xs={12} key={rate.provider_code}>
                    <Card 
                        style={{ 
                            padding: 16, 
                            cursor: 'pointer',
                            border: selectedShipper === rate.provider_code 
                                ? '2px solid #1976d2' 
                                : '1px solid #e0e0e0',
                            opacity: loading ? 0.6 : 1
                        }}
                        onClick={() => !loading && onShipperSelect(rate.provider_code)}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {rate.display_name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Transit Time: {rate.transit_time}
                                </Typography>
                                {rate.helper_text && (
                                    <Typography variant="caption" color="error">
                                        {rate.helper_text}
                                    </Typography>
                                )}
                            </Box>
                            <Box textAlign="right">
                                <Typography variant="h6" color="primary">
                                    ₹{rate.rate}
                                </Typography>
                                <Typography variant="caption">
                                    Weight: {rate.bill_weight_kg} kg
                                </Typography>
                            </Box>
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ShipperSelection;