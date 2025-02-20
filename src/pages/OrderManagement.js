import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, CircularProgress, Fade, Alert, Typography, TextField } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fetchOrders, syncShippingPrice, updateStatus, syncOrders } from "../services/orderService";
import OrderStats from "../components/OrderManagement/OrderStats";
import OrderList from "../components/OrderManagement/OrderList";
import EmailModal from "../components/OrderManagement/EmailModal";
import { Sync } from "@mui/icons-material";
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { getEmailTemplate } from "../utils/helpers";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSyncPrice, setLoadingSyncPrice] = useState(false);
  const [loadingCreatedOrders, setLoadingCreatedOrders] = useState(false);
  const [loadingShippedOrders, setLoadingShippedOrders] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [loadingSyncOrders, setLoadingSyncOrders] = useState(false);
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

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSyncShippingPrice = async () => {
    setLoadingSyncPrice(true);
    const ordersToSync = orders.filter(order => !order.shippingPrice);
    const payload = (ordersToSync || [])
      .filter(order => order?.status && order.status !== "Created")
      .map(order => ({
        customerOrderId: order.customerOrderId,
        purchaseOrderId: order.purchaseOrderId
      }));
    try {
      const updatedOrders = await syncShippingPrice(payload, showNotification);

      if (updatedOrders && updatedOrders.length > 0) {
        setOrders((prevOrders) => {
          return prevOrders.map(order => {
            const updatedOrder = updatedOrders.find(uo => uo.purchaseOrderId === order.purchaseOrderId);
            return updatedOrder ? {
              ...updatedOrder,
              orderLines: JSON.parse(updatedOrder.orderLines),
              shippingAddress: JSON.parse(updatedOrder.shippingAddress),
            } : order;
          });
        });
      }
    } catch (error) {
      console.error("Error syncing shipping prices:", error);
    } finally {
      setLoadingSyncPrice(false);
    }

    setLoadingSyncPrice(false);
  };

  const handleSyncOrders = async () => {
    setLoadingSyncOrders(true);
    const someNewOrders = await syncOrders(selectedDate, showNotification);
    if (someNewOrders && someNewOrders.length > 0) {
      setOrders((prevOrders) => {
        // Extract existing order IDs for quick lookup
        const existingOrderIds = new Set(prevOrders.map(order => order.purchaseOrderId));

        // Filter only new orders and format them
        const newOrders = someNewOrders
          .filter(order => !existingOrderIds.has(order.purchaseOrderId))
          .map(updatedOrder => ({
            ...updatedOrder,
            orderLines: JSON.parse(updatedOrder.orderLines),
            shippingAddress: JSON.parse(updatedOrder.shippingAddress),
          }));

        // New orders should appear first
        return [...newOrders, ...prevOrders];
      });
    }
    setLoadingSyncOrders(false);
  };

  const handleUpdateStatus = async (statusType) => {
    if (statusType === "createdOrder") { setLoadingCreatedOrders(true); }
    if (statusType === "ShippedOrder") { setLoadingShippedOrders(true); }
    const updatedOrders = await updateStatus(statusType, showNotification);

    if (updatedOrders && updatedOrders.length > 0) {
      setOrders((prevOrders) => {
        return prevOrders.map(order => {
          const updatedOrder = updatedOrders.find(uo => uo.purchaseOrderId === order.purchaseOrderId);
          return updatedOrder ? {
            ...updatedOrder,
            orderLines: JSON.parse(updatedOrder.orderLines),
            shippingAddress: JSON.parse(updatedOrder.shippingAddress),
          } : order;
        });
      });
    }

    if (statusType === "createdOrder") { setLoadingCreatedOrders(false); }
    if (statusType === "ShippedOrder") { setLoadingShippedOrders(false); }
  };

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

        {/* Button Container */}
        <Box display="flex" gap={2} alignItems="center" mt={2}>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Sync />}
            onClick={handleSyncOrders}
            disabled={loadingSyncOrders}
          >
            {loadingSyncOrders ? <CircularProgress size={24} color="inherit" /> : "Sync Orders"}
          </Button>
        </Box>
        <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Sync />}
            onClick={handleSyncShippingPrice}
          >
            {loadingSyncPrice ? <CircularProgress size={24} color="inherit" /> : "Sync Shipping Price"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<Sync />}
            onClick={() => handleUpdateStatus("createdOrder")}
          >
            {loadingCreatedOrders ? <CircularProgress size={24} color="inherit" /> : "Update Status for Created Orders"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<Sync />}
            onClick={() => handleUpdateStatus("ShippedOrder")}
          >
            {loadingShippedOrders ? <CircularProgress size={24} color="inherit" /> : "Update Status for Shipped Orders"}
          </Button>
        </Box>
      </Box>

      <OrderStats orders={orders} />
      <OrderList orders={orders} setOrders={setOrders} handleOpenEmailModal={handleOpenEmailModal} setEmailData={setEmailData} />

      <EmailModal open={openEmailModal} handleClose={() => setOpenEmailModal(false)} emailData={emailData} setEmailData={setEmailData} setOrders={setOrders} />
    </Box>
  );
};

export default OrderManagement;
