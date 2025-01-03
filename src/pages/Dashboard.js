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
} from '@mui/material';
import '../styles/customStyles.css';
import { getDummyOrders } from '../data/dummy'

const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalType, setModalType] = useState(''); // 'view', 'edit', 'shipment'
    const [editedData, setEditedData] = useState({});
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
            const response = await axios.get('http://localhost:8080/getUnshippedOrder');
            setOrders(response.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            console.log("bscd " + getDummyOrders())
            setOrders(getDummyOrders());
        } finally {
            setLoading(false);
        }
    };

    const handleModalOpen = (order, type) => {
        setSelectedOrder(order);
        setModalType(type);
        setEditedData(order);
        if (type === 'shipment') {
            setShipmentDetails({
                productNameForShiprocket: '',
                hsn: '',
                unitPrice: '',
                deadWeight: '',
                length: '',
                height: '',
                width: '',
                shiprocketQty: '',
            });
        }
    };

    const handleModalClose = () => {

        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.purchaseOrderId === selectedOrder.purchaseOrderId
                    ? { ...order, ...selectedOrder }
                    : order
            )
        );

        setSelectedOrder(null);
        setModalType('');
    };

    const handleShipmentChange = (order, field, value) => {
        setSelectedOrder({ ...order, [field]: value })
        console.log(order[field])
            ; setShipmentDetails({ ...shipmentDetails, [field]: value });
    };

    const handleEditChange = (field, value) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleSubmitShipment = async () => {
        if (Object.values(shipmentDetails).some((value) => !value)) {
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

    const handleSave = () => {
        const updatedOrders = orders.map((order) =>
            order.purchaseOrderId === selectedOrder.purchaseOrderId ? { ...editedData } : order
        );
        setOrders(updatedOrders);
        handleModalClose();
    };

    if (loading) return <CircularProgress />;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Unshipped Orders
            </Typography>
            <Grid container spacing={3}>
                {orders.map((order) => (
                    <Grid style={{margin: '10px 0px 10px 0px'}} item xs={12} md={6} lg={4} key={order.purchaseOrderId}>
                        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 16}}>
                            <CardContent>
                                <Typography variant="h6">Order ID: {order.purchaseOrderId}</Typography>
                                <Typography>Customer Name: {order.shippingInfo.postalAddress.name}</Typography>
                                <Typography>Address: {order.shippingInfo.postalAddress.address1}</Typography>
                                <Typography>Email: {order.customerEmailId}</Typography>
                                <Typography>Phone: {order.shippingInfo.phone}</Typography>
                                <Typography>Product Name: {order.orderLines.orderLine[0].item.productName}</Typography>
                                <Typography>Quantity: {order.orderLines.orderLine[0].orderLineQuantity.amount}</Typography>
                                <Typography>Price: ${order.orderLines.orderLine[0].charges.charge[0].chargeAmount.amount}</Typography>

                                {order.productNameForShiprocket != null &&
                                    <Typography>ProductName for shipment: {order.productNameForShiprocket}</Typography>}

                                {order.hsn != null &&
                                    <Typography>HSN: {order.hsn}</Typography>}

                                {order.unitPrice != null &&
                                    <Typography>UnitPrice : {order.unitPrice}</Typography>}

                                {order.deadWeight != null &&
                                    <Typography>DeadWeight : {order.deadWeight}</Typography>}

                                {order.length != null &&
                                    <Typography>Length: {order.length}</Typography>}

                                {order.height != null &&
                                    <Typography>Height: {order.height}</Typography>}
                                {order.width != null &&
                                    <Typography>Width  :{order.width}</Typography>}

                            </CardContent>
                            <Box mt="auto" display="flex" gap={2}>
                                <Button variant="contained" onClick={() => handleModalOpen(order, 'view')}>
                                    View
                                </Button>
                                <Button variant="outlined" onClick={() => handleModalOpen(order, 'edit')}>
                                    Edit
                                </Button>
                                <Button variant="contained" color="secondary" onClick={() => handleModalOpen(order, 'shipment')}>
                                    Start Shipment
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal open={!!modalType} onClose={handleModalClose}>
                <Box sx={{ p: 4, bgcolor: 'background.paper', m: 'auto', maxWidth: 500, mt: 10 }}>
                    {modalType === 'view' && selectedOrder && (
                        <>
                            <Typography variant="h6">Order Details</Typography>
                            <Typography>Order ID: {selectedOrder.purchaseOrderId}</Typography>
                            <Typography>Customer Name: {selectedOrder.shippingInfo.postalAddress.name}</Typography>
                        </>
                    )}

                    {modalType === 'edit' && (
                        <>
                            <Typography variant="h6">Edit Order</Typography>
                            <TextField
                                label="Customer Name"
                                value={editedData?.shippingInfo?.postalAddress?.name || ''}
                                fullWidth
                                onChange={(e) => handleEditChange('customerName', e.target.value)}
                            />
                            <Button variant="contained" onClick={handleSave}>
                                Save
                            </Button>
                        </>
                    )}

                    {modalType === 'shipment' && (
                        <>
                            <Typography variant="h6">Start Shipment</Typography>
                            {Object.keys(shipmentDetails).map((field) => (
                                <TextField
                                    key={field}
                                    label={field}
                                    value={selectedOrder[field]}
                                    fullWidth
                                    margin="normal"
                                    onChange={(e) => handleShipmentChange(selectedOrder, field, e.target.value)}
                                />
                            ))}
                            <Button style={{ marginRight:'10px'}} variant="contained" onClick={handleSubmitShipment}>
                                Submit
                            </Button>
                            <Button  style={{ marginLeft:'10px'}} variant="outlined" onClick={handleModalClose}>
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
