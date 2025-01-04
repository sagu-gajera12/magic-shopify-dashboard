import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    Modal,
    TextField,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Box,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import '../styles/customStyles.css';
import { getDummyOrders } from '../data/dummy';
import AddressFields from './AddressFields';
import EditableField from './EditableFields';
import AddressDisplay from '../components/AddressDisplay';

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalType, setModalType] = useState(''); // 'view', 'edit', 'shipment'
    const [editableData, setEditableData] = useState({
        productNameForShiprocket: '',
        hsn: '',
        unitPrice: '',
        deadWeight: '',
        length: '',
        height: '',
        width: '',
        shiprocketQty: '',
        billingAddress: {
            name: '', address1: '', address2: '', city: '', state: '', postalCode: '', country: ''
        }
    });

    const [shipmentDetails, setShipmentDetails] = useState({
        productNameForShiprocket: '',
        hsn: '',
        unitPrice: '',
        deadWeight: '',
        length: '',
        height: '',
        width: '',
        shiprocketQty: '',
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/walmart/unshipped/orders');
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders(getDummyOrders());
        } finally {
            setLoading(false);
        }
    };

    const handleModalOpen = (order, type) => {
        setSelectedOrder({ ...order, editableData: { ...editableData, ...order.editableData } });
        setModalType(type);
    };

    const handleModalClose = () => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.customerOrderId === selectedOrder.customerOrderId
                    ? { ...order, ...selectedOrder }
                    : order
            )
        );
        setSelectedOrder(null);
        setModalType('');
    };

    const handleShipmentChange = (order, field, value) => {
        setSelectedOrder({ ...order, editableData: { ...order.editableData, [field]: value } })
            ; setShipmentDetails({ ...shipmentDetails, [field]: value });
    };

    const handleEditChange = (field, value) => {

        setSelectedOrder(prev => ({
            ...prev,
            editableData: {
                ...prev.editableData,
                billingAddress: {
                    ...prev.editableData.billingAddress,
                    [field]: value,
                }
            }
        }));

    };

    const handleEditBillingAddress = (field, value) => {

        setSelectedOrder(prev => ({
            ...prev,
            editableData: {
                ...prev.editableData,
                billingAddress: {
                    ...prev.editableData.billingAddress,
                    [field]: value,
                }
            }
        }));

    };

    const handleAddressCopy = (checked) => {
        if (checked) {
            setSelectedOrder(prev => ({
                ...prev,
                editableData: {
                    ...prev.editableData,
                    billingAddress: { ...prev.shippingInfo.postalAddress }
                }
            }));
        } else {
            setSelectedOrder(prev => ({
                ...prev,
                editableData: {
                    ...prev.editableData,
                    billingAddress: {
                        name: '',
                        address1: '',
                        address2: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: '',
                    },
                }
            }));
        }
    };

    const handleSave = () => {

        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.customerOrderId === selectedOrder.customerOrderId
                    ? { ...order, ...selectedOrder }
                    : order
            )
        );
        handleModalClose();
    };


    const handleSubmitShipment = async () => {
        if (Object.values(shipmentDetails).some(value => !value)) {
            alert('Please fill all fields before submitting.');
            return;
        }
        try {
            await axios.post('http://localhost:8080/createOrder', {
                ...selectedOrder,
                shipmentDetails,
            });
            alert('Order submitted successfully!');
            handleModalClose();
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to submit the order.');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Unshipped Orders
            </Typography>
            <Grid container spacing={3}>
                {orders.map(order => (
                    <Grid
                        style={{ margin: '10px 0px' }}
                        item
                        xs={12}
                        md={6}
                        lg={4}
                        key={order.customerOrderId}
                    >
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
                                <Typography>Product Name: {order.orderInfo.productName}</Typography>
                                <Typography>Quantity: {order.orderInfo.qtyAmount}</Typography>
                                <Typography>Price: ${order.orderInfo.chargeAmount}</Typography>
                                <EditableField data={order.editableData}></EditableField>

                            </CardContent>
                            <Box mt="auto" display="flex" gap={2}>
                                <Button
                                    variant="contained"
                                    onClick={() => handleModalOpen(order, 'view')}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleModalOpen(order, 'edit')}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleModalOpen(order, 'shipment')}
                                >
                                    Start Shipment
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal
                open={!!modalType}
                onClose={handleModalClose}
                style={{ overflowY: 'auto' }}
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
                    {modalType === 'view' && selectedOrder && (
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Order Details
                            </Typography>
                            <Typography><b>Order ID:</b> {selectedOrder.customerOrderId}</Typography>
                            <Typography><b>Customer Email:</b> {selectedOrder.customerEmailId}</Typography>

                            <AddressDisplay address={selectedOrder.shippingInfo.postalAddress} addressType="Shipping Address"></AddressDisplay>

                            {selectedOrder.editableData.billingAddress && (
                                <>
                                    <AddressDisplay address={selectedOrder.editableData.billingAddress} addressType="Billing Address"></AddressDisplay>
                                </>
                            )}
                        </Box>
                    )}

                    {modalType === 'edit' && (
                        <>
                            <Typography variant="h6">Edit Order</Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        onChange={(e) => handleAddressCopy(e.target.checked)}
                                    />
                                }
                                label="Same as Shipping Address"
                            />
                            <AddressFields
                                prefix="billingAddress"
                                address={selectedOrder.editableData.billingAddress || {}}
                                handleChange={handleEditBillingAddress}
                            />
                            {Object.keys(selectedOrder.editableData).map(field => (
                                (field !== "billingAddress" && <TextField
                                    key={field}
                                    label={field}
                                    value={selectedOrder.editableData[field] || ''}
                                    fullWidth
                                    margin="normal"
                                    onChange={(e) => handleShipmentChange(selectedOrder, field, e.target.value)}
                                />
                                )))}
                            <Button variant="contained" onClick={handleSave}>
                                Save
                            </Button>
                        </>
                    )}

                    {modalType === 'shipment' && (
                        <>
                            <Typography variant="h6">Start Shipment</Typography>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        onChange={(e) => handleAddressCopy(e.target.checked)}
                                    />
                                }
                                label="Same as Shipping Address"
                            />
                            <AddressFields
                                prefix="billingAddress"
                                address={selectedOrder.editableData.billingAddress || {}}
                                handleChange={handleEditBillingAddress}
                            />

                            {Object.keys(selectedOrder.editableData).map(field => (
                                (field !== "billingAddress" && <TextField
                                    key={field}
                                    label={field}
                                    value={selectedOrder.editableData[field] || ''}
                                    fullWidth
                                    margin="normal"
                                    onChange={(e) => handleShipmentChange(selectedOrder, field, e.target.value)}
                                />
                                )))}



                            <Button
                                style={{ marginRight: '10px' }}
                                variant="contained"
                                onClick={handleSubmitShipment}
                            >
                                Submit
                            </Button>
                            <Button
                                style={{ marginLeft: '10px' }}
                                variant="outlined"
                                onClick={handleModalClose}
                            >
                                Save
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default Dashboard;
