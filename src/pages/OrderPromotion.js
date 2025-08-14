import React, { useState, useEffect, useCallback } from "react";
import { Box, CircularProgress, Fade, Alert, Typography } from "@mui/material";
import { fetchOrdersForPromotion } from "../services/orderService";
import OrderList from "../components/OrderManagement/OrderList";
import EmailModal from "../components/OrderManagement/EmailModal";
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { getEmailTemplate } from "../utils/helpers";

const OrderPromotion = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification] = useState({ show: false, message: "", type: "success" });
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


    const loadOrders = useCallback(async () => {
        setLoading(true);
        const data = await fetchOrdersForPromotion();
        setOrders(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Fade in={notification.show}>
                <Alert severity={notification.type} sx={{ position: "fixed", top: 16, right: 16, zIndex: 9999 }}>
                    {notification.message}
                </Alert>
            </Fade>
            <Box mb={4}>
                <Typography variant="h4" color="primary" gutterBottom>
                    Order Management
                </Typography>

            </Box>
            <OrderList orders={orders} setOrders={setOrders} handleOpenEmailModal={handleOpenEmailModal} setEmailData={setEmailData} parent="OrderPromotion" />

            <EmailModal open={openEmailModal} handleClose={() => setOpenEmailModal(false)} emailData={emailData} setEmailData={setEmailData} setOrders={setOrders} />
        </Box>
    );
};

export default OrderPromotion;
