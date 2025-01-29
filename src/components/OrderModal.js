import React from 'react';
import { Modal, Box, Typography, Checkbox, FormControlLabel, FormControl, InputLabel, MenuItem, TextField, Select, Button } from '@mui/material';
import AddressFields from './AddressFields';
import AddressDisplay from './AddressDisplay';
import { submitShipment, updateShipment } from '../services/api';

const OrderModal = ({ modalType = '', order = {}, onClose, onSave, onFetchShipmentStatus }) => {
    if (!modalType || !order) return null;
    const handleEditBillingAddress = (field, value) => {
        onSave({
            ...order,
            orderEditableFields: {
                ...order.orderEditableFields,
                billingAddress: {
                    ...order.orderEditableFields.billingAddress,
                    [field]: value,
                },
            },
        });
    };

    const handleAddressCopy = (checked) => {
        if (checked) {
            onSave({
                ...order,
                orderEditableFields: {
                    ...order.orderEditableFields,
                    billingAddress: { ...order.shippingInfo.postalAddress },
                },
            });
        } else {
            onSave({
                ...order,
                orderEditableFields: {
                    ...order.orderEditableFields,
                    billingAddress: {},
                },
            });
        }
    };


    const handleShipmentChange = (lineNumber, field, value, flag) => {

        if (flag === "productEditableFields") {
            const updatedOrderInfoList = order.orderInfo.map(prevOrderInfo =>
                prevOrderInfo.lineNumber === lineNumber
                    ? {
                        ...prevOrderInfo,
                        productEditableFields: {
                            ...prevOrderInfo.productEditableFields,
                            [field]: value,
                        },
                    }
                    : prevOrderInfo
            );

            onSave({ ...order, orderInfo: updatedOrderInfoList })
        } else {
            onSave({ ...order, orderEditableFields: { ...order.orderEditableFields, [field]: value } });
        }
    };


    return (<Modal

        open={!!modalType}
        onClose={onClose}
    >
        <Box
            sx={{
                p: 4,
                bgcolor: 'background.paper',
                m: 'auto',
                maxWidth: 500,
                mt: 10,
                maxHeight: '80vh',
                overflowY: 'auto',
            }}
        >
            {modalType === 'view' && order && (
                <>
                    <Typography variant="h5" gutterBottom>Order Details</Typography>
                    <Typography><b>Order ID:</b> {order.customerOrderId}</Typography>
                    <Typography><b>Customer Email:</b> {order.customerEmailId}</Typography>
                    <AddressDisplay address={order.shippingInfo.postalAddress} addressType="Shipping Address" />
                    {order.orderEditableFields.billingAddress && (
                        <AddressDisplay address={order.orderEditableFields.billingAddress} addressType="Billing Address" />
                    )}
                </>
            )}

            {modalType === 'edit' && (
                <>
                    <Typography variant="h6">Edit Order</Typography>
                    <FormControlLabel
                        control={<Checkbox onChange={(e) => handleAddressCopy(e.target.checked)} />}
                        label="Same as Shipping Address"
                    />
                    <AddressFields
                        prefix="billingAddress"
                        address={order.orderEditableFields.billingAddress || {}}
                        handleChange={handleEditBillingAddress}
                    />

                    {
                        order.orderInfo.map(product => {
                            return Object.keys(product.productEditableFields).map(field => {


                                if (field === "hsn") {
                                    // Render Select component for 'hsn'
                                    return <>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel id="hsn-label">HSN</InputLabel>
                                            <Select
                                                labelId="hsn-label"
                                                id="hsn-select"
                                                value={product.productEditableFields[field] || ''}
                                                onChange={(e) => handleShipmentChange(product.lineNumber, field, e.target.value, "productEditableFields")}
                                                label="HSN"
                                            >
                                                <MenuItem value={"33049910"}>33049910: Cosmetic item</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </>
                                }

                                return (
                                    <TextField
                                        key={field}
                                        label={field}
                                        value={product.productEditableFields[field] || ''}
                                        fullWidth
                                        margin="normal"
                                        onChange={(e) => handleShipmentChange(product.lineNumber, field, e.target.value, "productEditableFields")}
                                    />
                                );
                            })
                        })
                    }

                    {Object.keys(order.orderEditableFields).map(field => {
                        if (field === 'billingAddress') {
                            return "";
                        }
                        return (
                            <TextField
                                key={field}
                                label={field}
                                value={order.orderEditableFields[field] || ''}
                                fullWidth
                                margin="normal"
                                onChange={(e) => handleShipmentChange(0, field, e.target.value, "orderEditableFields")}
                            />
                        );
                    })}

                    <Button variant="contained" onClick={onClose}>
                        Save
                    </Button>
                </>
            )}

            {modalType === 'shipment' && (
                <>
                    <Typography variant="h6">Edit Order</Typography>
                    <FormControlLabel
                        control={<Checkbox onChange={(e) => handleAddressCopy(e.target.checked)} />}
                        label="Same as Shipping Address"
                    />
                    <AddressFields
                        prefix="billingAddress"
                        address={order.orderEditableFields.billingAddress || {}}
                        handleChange={handleEditBillingAddress}
                    />

                    {
                        order.orderInfo.map(product => {
                            return Object.keys(product.productEditableFields).map(field => {


                                if (field === "hsn") {
                                    // Render Select component for 'hsn'
                                    return <>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel id="hsn-label">HSN</InputLabel>
                                            <Select
                                                labelId="hsn-label"
                                                id="hsn-select"
                                                value={product.productEditableFields[field] || ''}
                                                onChange={(e) => handleShipmentChange(product.lineNumber, field, e.target.value, "productEditableFields")}
                                                label="HSN"
                                            >
                                                <MenuItem value={"33049910"}>33049910: Cosmetic item</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </>
                                }

                                return (
                                    <TextField
                                        key={field}
                                        label={field}
                                        value={product.productEditableFields[field] || ''}
                                        fullWidth
                                        margin="normal"
                                        onChange={(e) => handleShipmentChange(product.lineNumber, field, e.target.value, "productEditableFields")}
                                    />
                                );
                            })
                        })
                    }

                    {Object.keys(order.orderEditableFields).map(field => {
                        if (field === 'billingAddress') {
                            return "";
                        }
                        return (
                            <TextField
                                key={field}
                                label={field}
                                value={order.orderEditableFields[field] || ''}
                                fullWidth
                                margin="normal"
                                onChange={(e) => handleShipmentChange(0, field, e.target.value, "orderEditableFields")}
                            />
                        );
                    })}

                    <Button
                        style={{ marginRight: '10px' }}
                        variant="contained"
                        onClick={() => {
                            const res = submitShipment(order);
                            onClose();
                            if (res !== null)
                                onFetchShipmentStatus({ ...order, shipmentStatus: 'CREATED' });
                        }}
                    >
                        Submit
                    </Button>
                    <Button
                        style={{ marginRight: '10px' }}
                        variant="contained"
                        onClick={() => {
                            updateShipment(order);
                            onClose();
                        }}
                    >
                        Update
                    </Button>
                    <Button
                        style={{ marginLeft: '10px' }}
                        variant="outlined"
                        onClick={onClose}
                    >
                        Save
                    </Button>
                </>
            )}
        </Box>
    </Modal>
    )
};

export default OrderModal;
