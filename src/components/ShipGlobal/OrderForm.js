import React from 'react';
import {
    Grid,
    TextField,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Card
} from '@mui/material';

const OrderForm = ({
    orderFormData,
    pickupAddresses,
    selectedPickupAddress,
    onPickupAddressChange,
    onInputChange,
    onItemChange
}) => {
    return (
        <Grid container spacing={2}>
            {/* Pickup Address Section */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Pickup Address</Typography>
                <RadioGroup
                    value={selectedPickupAddress}
                    onChange={(e) => onPickupAddressChange(e.target.value)}
                >
                    {pickupAddresses.map((address) => (
                        <FormControlLabel
                            key={address.address_id}
                            value={address.address_id}
                            control={<Radio />}
                            label={`${address.address} ${address.city}, ${address.state_name} - ${address.postcode}`}
                        />
                    ))}
                </RadioGroup>
            </Grid>

            {/* Customer Details Section */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Customer Details</Typography>
            </Grid>
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="First Name"
                    value={orderFormData.customer_shipping_firstname}
                    onChange={(e) => onInputChange('customer_shipping_firstname', e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Last Name"
                    value={orderFormData.customer_shipping_lastname}
                    onChange={(e) => onInputChange('customer_shipping_lastname', e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Mobile"
                    value={orderFormData.customer_shipping_mobile}
                    onChange={(e) => onInputChange('customer_shipping_mobile', e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Email"
                    value={orderFormData.customer_shipping_email}
                    onChange={(e) => onInputChange('customer_shipping_email', e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Address"
                    value={orderFormData.customer_shipping_address}
                    onChange={(e) => onInputChange('customer_shipping_address', e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Address 2"
                    value={orderFormData.customer_shipping_address_2}
                    onChange={(e) => onInputChange('customer_shipping_address_2', e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="City"
                    value={orderFormData.customer_shipping_city}
                    onChange={(e) => onInputChange('customer_shipping_city', e.target.value)}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    fullWidth
                    label="Postal Code"
                    value={orderFormData.customer_shipping_postcode}
                    onChange={(e) => onInputChange('customer_shipping_postcode', e.target.value)}
                />
            </Grid>
            
            {/* Package Details Section */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Package Details</Typography>
            </Grid>
            <Grid item xs={3}>
                <TextField
                    fullWidth
                    label="Weight (kg)"
                    type="number"
                    value={orderFormData.package_weight}
                    onChange={(e) => onInputChange('package_weight', parseFloat(e.target.value) || 0.1)}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    fullWidth
                    label="Length (cm)"
                    type="number"
                    value={orderFormData.package_length}
                    onChange={(e) => onInputChange('package_length', parseInt(e.target.value) || 1)}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    fullWidth
                    label="Width (cm)"
                    type="number"
                    value={orderFormData.package_breadth}
                    onChange={(e) => onInputChange('package_breadth', parseInt(e.target.value) || 1)}
                />
            </Grid>
            <Grid item xs={3}>
                <TextField
                    fullWidth
                    label="Height (cm)"
                    type="number"
                    value={orderFormData.package_height}
                    onChange={(e) => onInputChange('package_height', parseInt(e.target.value) || 1)}
                />
            </Grid>
            
            {/* Order Items Section */}
            <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Order Items</Typography>
                {orderFormData.vendor_order_item.map((item, index) => (
                    <Card key={index} style={{ marginBottom: 10, padding: 10 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    value={item.vendor_order_item_name}
                                    onChange={(e) => onItemChange(index, 'vendor_order_item_name', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    type="number"
                                    value={item.vendor_order_item_quantity}
                                    onChange={(e) => onItemChange(index, 'vendor_order_item_quantity', parseInt(e.target.value) || 1)}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    label="Price"
                                    type="number"
                                    value={item.vendor_order_item_unit_price}
                                    onChange={(e) => onItemChange(index, 'vendor_order_item_unit_price', parseFloat(e.target.value) || 0)}
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    fullWidth
                                    label="HSN"
                                    value={item.vendor_order_item_hsn}
                                    onChange={(e) => onItemChange(index, 'vendor_order_item_hsn', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Card>
                ))}
            </Grid>
        </Grid>
    );
};

export default OrderForm;