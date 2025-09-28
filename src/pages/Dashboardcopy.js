import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import OrderCard from '../components/OrderCard';
import OrderModal from '../components/OrderModal';
import { fetchOrdersSince } from '../services/api';
import useOrders from '../hooks/useOrders';
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { getEmailTemplate } from '../utils/helpers';
import EmailModal from '../components/OrderManagement/EmailModal';

const DashboardCopy = () => {
    const { orders, setOrders, loading, setLoading, selectedOrder, setSelectedOrder, modalType, setModalType } = useOrders();

    const [openEmailModal, setOpenEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({});

    const handleOpenEmailModal = (order, type) => {
        if (!order || !order.customerEmailId) {
            console.error("Invalid order data for email modal.");
            return;
        }

        const { subject, body } = getEmailTemplate(order, type);

        if (!subject || !body) {
            console.error("Invalid email template type.");
            return;
        }

        const blocksFromHTML = convertFromHTML(body);
        const contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);

        setEmailData({
            purchaseOrderId: order.purchaseOrderId,
            type,
            to: order.customerEmailId,
            subject,
            body,
            bodyFrontend: EditorState.createWithContent(contentState),
        });

        setOpenEmailModal(true);
    };

    const editableData = {
        deadWeight: '',
        length: '',
        height: '',
        width: '',
        billingAddress: {
            name: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        }
    };
    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const orders = await fetchOrdersSince();
                setOrders(orders);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [setLoading, setOrders]);

    const handleModalOpen = (order, type) => {
        setSelectedOrder({
            ...order,
            orderEditableFields: {
                ...editableData, // Initialize with default `editableData`
                ...order.orderEditableFields, // Merge with existing data
            },
            orderInfo: order.orderInfo.map(orderInfo => ({
                ...orderInfo,
                productEditableFields: {
                    ...orderInfo.productEditableFields,
                },
            })),
        });

        setModalType(type);
    };


    const handleModalClose = () => {
        if (selectedOrder && selectedOrder.customerOrderId) {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.customerOrderId === selectedOrder.customerOrderId
                        ? { ...order, ...selectedOrder }
                        : order
                )
            );
        }
        setSelectedOrder(null);
        setModalType('');
    };

    const updateOrders = (updatedOrder) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.customerOrderId === updatedOrder.customerOrderId
                    ? { ...order, ...updatedOrder }
                    : order
            )
        );

        setTimeout(() => {
            console.log("setOrder", orders)
        }, 10000);
    }


    if (loading) return <CircularProgress />;
    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Unshipped Orders : {orders.length}
            </Typography>
            <Grid container spacing={3}>
                {orders.map((order) => (

                    <Grid item xs={12} md={6} lg={4} key={order.customerOrderId}>
                        <OrderCard
                            order={order}
                            onView={(order) => handleModalOpen(order, 'view')}
                            onEdit={(order) => handleModalOpen(order, 'edit')}
                            onShipment={(order) => handleModalOpen(order, 'shipment')}
                            onOpneModel={handleModalOpen}
                            onFetchShipmentStatus={updateOrders}
                            handleOpenEmailModal={handleOpenEmailModal} setEmailData={setEmailData}
                        />
                    </Grid>
                ))}
            </Grid>
            {modalType && (
                <OrderModal
                    modalType={modalType}
                    order={selectedOrder}
                    onClose={handleModalClose}
                    onSave={(updatedOrder) => {
                        setSelectedOrder(updatedOrder)
                    }}
                    onFetchShipmentStatus={updateOrders}
                />
            )}
            <EmailModal open={openEmailModal} handleClose={() => setOpenEmailModal(false)} emailData={emailData} setEmailData={setEmailData} setOrders={setOrders} />
        </Box>
    );
};

export default DashboardCopy;
