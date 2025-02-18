import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Paper,
  TablePagination,
  Typography,
  TextField,
  styled,
  Alert,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit,
  Check,
  Close,
  Sync,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  LocalShipping as LocalShippingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { stateToHTML } from 'draft-js-export-html';


import { sendEmailAPI } from "../services/api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Enhanced styled components
const OrderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const StatusChip = styled(Chip)(({ theme, color }) => ({
  borderRadius: 20,
  padding: '0 10px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
}));

const DetailSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSyncPrice, setLoadingSyncPrice] = useState(false);
  const [loadingCreatedOrders, setLoadingCreatedOrders] = useState(false);
  const [loadingShippedOrders, setLoadingShippedOrders] = useState(false);
  const [editing, setEditing] = useState({});
  const [totalProfit, setTotalProfit] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Default to current date
  const [loadingSyncOrders, setLoadingSyncOrders] = useState(false);

  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    purchaseOrderId: '',
    to: '',
    subject: '',
    bodyFrontend: '',
  });


  const handleOpenEmailModal = (order, type) => {
    const emailBodyHtmlForShipment = `
        <h2>Order Shipment Notification</h2>
        <p>Dear <strong>${order.shippingAddress.name}</strong>,</p>
        <p>Thank you for choosing Grow Enterprises!</p>
        <p>We're excited to let you know that your order <strong>#${order.purchaseOrderId}</strong> has been shipped!</p>
        <ul>
          <li><strong>Product(s) Shipped:</strong> ${order.orderLines.map(line => line.productName).join(', ')}</li>
          <li><strong>Tracking Number:</strong> ${order.orderLines[0].trackingInfo.trackingNumber}</li>
          <li><strong>Track Your Order:</strong> <a href="${order.orderLines[0].trackingInfo.trackingURL}" target="_blank">Click here to track your order</a></li>
        </ul>
        <h3>Returns & Refunds</h3>
        <p>We want to ensure a smooth shopping experience for you. In the rare case that you receive a damaged or incorrect product, we kindly ask you to take a video or photos while unpacking the box. This will help us verify the issue and process your return or refund request quickly and efficiently.</p>
        <p>Providing these details allows us to improve our order dispatch process and enhance the overall shopping experience for our customers.</p>
        <p>If you need any assistance, feel free to contact our support team.</p>
        <p>Best regards,<br>The Grow Enterprises Team</p>        

      `;

    const emailBodyHtmlForDelivered = `
        <h2>Thank You for Your Purchase!</h2>
        <p>Dear <strong>${order.shippingAddress.name}</strong>,</p>
        <p>We’re delighted to inform you that your order <strong>#${order.purchaseOrderId}</strong> has been successfully delivered!</p>
        
        <p>We hope you received your product as expected and that it brings value and satisfaction to you. Your feedback is incredibly important to us, and we would love to hear about your experience.</p>

        <h3>Rate & Review Your Purchase</h3>
        <p>We strive to provide the best service and high-quality products. If you’re happy with your purchase, please consider leaving us a rating and review. Your feedback helps us improve and assist future customers in making informed decisions.</p>
        
        <p><strong>Leave a Review:</strong> <a href="REVIEW_LINK" target="_blank">Click here to share your experience</a></p>

        <h3>We Look Forward to Serving You Again</h3>
        <p>At Grow Enterprises, customer satisfaction is our top priority. We are constantly working to bring you the best products and services. We look forward to serving you again in the future!</p>
        
        <h3>Need Assistance?</h3>
        <p>If you have any questions, concerns, or need any assistance, feel free to reach out to our support team at <a href="mailto:support@growenterprises.com">support@growenterprises.com</a>. We're here to help!</p>

        <p>Thank you once again for choosing Grow Enterprises. We truly appreciate your trust in us!</p>

        <p>Best regards,<br>The Grow Enterprises Team</p>        
      `;

    const emailSubjectForShipment = `Your Order #${order.purchaseOrderId} Has Been Shipped!`;
    const emailSubjectForDelivered = `Your Order #${order.purchaseOrderId} Has Been Delivered!`;

    const emailBodyHtml = type === 'shipmentEmail' ? emailBodyHtmlForShipment : emailBodyHtmlForDelivered;
    const emailSubject = type === 'shipmentEmail' ? emailSubjectForShipment : emailSubjectForDelivered;


    const blocksFromHTML = convertFromHTML(emailBodyHtml);
    const contentState = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );

    setEmailData({
      purchaseOrderId: order.purchaseOrderId,
      type: type,
      to: order.customerEmailId,
      subject: emailSubject,
      body: emailBodyHtml,
      bodyFrontend: EditorState.createWithContent(contentState),
    });
    setOpenEmailModal(true);
  };

  const handleEditorChange = (editorState) => {
    setEmailData({ ...emailData, body: stateToHTML(editorState.getCurrentContent()), bodyFrontend: editorState });
  };



  const handleCloseEmailModal = () => setOpenEmailModal(false);

  const handleSendEmail = async () => {
    try {
      // Await the response from sendEmailAPI
      const updatedOrder = await sendEmailAPI(emailData);

      if (updatedOrder) {
        const formattedOrder = {
          ...updatedOrder,
          orderLines: JSON.parse(updatedOrder.orderLines), // Convert orderLines string to object
          shippingAddress: JSON.parse(updatedOrder.shippingAddress) // Convert shippingAddress string to object
        }
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.purchaseOrderId === updatedOrder.purchaseOrderId
              ? { ...order, ...formattedOrder }
              : order
          )
        );
      } else {
        console.error("Failed to update order: No response received.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }


    setOpenEmailModal(false);
  };



  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/walmart/getAllOrderHistory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const formattedOrders = response.data.map(order => ({
        ...order,
        orderLines: JSON.parse(order.orderLines), // Convert orderLines string to object
        shippingAddress: JSON.parse(order.shippingAddress) // Convert shippingAddress string to object
      }));
      setOrders(formattedOrders);
      calculateTotalProfit(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [totalProfit, fetchOrders]);

  const handleSyncOrders = async () => {
    if (!selectedDate) {
      alert("Please select a date before syncing orders.");
      return;
    }

    setLoadingSyncOrders(true);
    try {
      const token = localStorage.getItem("token");
      const formattedDate = selectedDate.format("YYYY-MM-DD");
      await axios.get(`${API_BASE_URL}/walmart/orders/sync?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      alert("Orders synced successfully!");
    } catch (error) {
      console.error("Error syncing orders", error);
      alert("Failed to sync orders.");
    } finally {
      setLoadingSyncOrders(false);
    }
  };

  const syncShippingPrice = async () => {
    setLoadingSyncPrice(true);
    const ordersToSync = orders.filter(order => !order.shippingPrice);
    const payload = (ordersToSync || [])
      .filter(order => order?.status && order.status !== "Created")
      .map(order => ({
        customerOrderId: order.customerOrderId,
        purchaseOrderId: order.purchaseOrderId
      }));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_BASE_URL}/walmart/syncShippingPrice`, payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setOrders(response.data);
      calculateTotalProfit(response.data);
      showNotification('Shipping prices synced successfully');
    } catch (error) {
      console.error("Error syncing shipping prices:", error);
      showNotification('Failed to sync shipping prices', 'error');
    } finally {
      setLoadingSyncPrice(false);
    }
  };

  // API Call: Update Status for Created Orders
  const handleUpdateCreatedOrders = async () => {
    setLoadingCreatedOrders(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_BASE_URL}/walmart/updateStatus/createdOrder`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      showNotification(response.data || "Created orders updated successfully!");
    } catch (error) {
      showNotification("Failed to update created orders!", "error");
    } finally {
      setLoadingCreatedOrders(false);
    }
  };

  // API Call: Update Status for Shipped Orders
  const handleUpdateShippedOrders = async () => {
    setLoadingShippedOrders(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_BASE_URL}/walmart/updateStatus/ShippedOrder`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      showNotification(response.data || "Shipped orders updated successfully!");
    } catch (error) {
      showNotification("Failed to update shipped orders!", "error");
    } finally {
      setLoadingShippedOrders(false);
    }
  };

  const updateOrderField = async (orderId, field, value) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/walmart/updateOrder`, {
        purchaseOrderId: orderId,
        field: field,
        value: value,
      },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      setOrders(prevOrders => prevOrders.map(order =>
        order.purchaseOrderId === orderId ? { ...order, [field]: value } : order
      ));
      // Update orders in state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.purchaseOrderId === orderId ? { ...order, [field]: value } : order
        )
      );

      calculateTotalProfit(orders);
      showNotification('Order updated successfully');

      // Close the editing mode after successful update
      setEditing({});
    } catch (error) {
      setEditing({});
      console.error("Failed to update order field:", error);
      showNotification('Failed to update order', 'error');
    }
  };

  const calculateTotalProfit = (ordersData) => {
    let total = 0;

    ordersData.forEach(order => {
      if (order.status.toLowerCase() === "shipped" && order.cost) {
        const totalPrice = order.orderLines.reduce(
          (sum, line) => sum + line.price,
          0
        );
        const price = parseInt(totalPrice) * 84 || 0;
        const cost = parseInt(order.cost) || 0;
        const shippingPrice = parseInt(order.shippingPrice) || 0;

        const commission = Math.floor(price * 15 / 100); // Calculate 15% commission
        const profit = price - commission - cost - shippingPrice;
        total += profit;
      }
    });

    setTotalProfit(total);
  };


  const getOrderStats = () => {
    return orders.reduce((acc, order) => {
      const status = order.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  };

  const orderStats = getOrderStats();

  const getStatusConfig = (status) => {
    const configs = {
      shipped: { color: "primary", icon: <LocalShippingIcon /> },
      created: { color: "warning", icon: <ScheduleIcon /> },
      canceled: { color: "error", icon: <InventoryIcon /> },
      delivered: { color: "success", icon: <CheckCircleIcon /> },
      default: { color: "primary", icon: <InventoryIcon /> }
    };
    return configs[status.toLowerCase()] || configs.default;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        <Alert
          severity={notification.type}
          sx={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}
        >
          {notification.message}
        </Alert>
      </Fade>

      <Box mb={4}>
        <Typography variant="h4" color="primary" gutterBottom>
          Order Management
        </Typography>
        <Typography variant="h6" gutterBottom>
          Total Profit: ${totalProfit?.toFixed(2)}
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
            onClick={syncShippingPrice}
          >
            {loadingSyncPrice ? <CircularProgress size={24} color="inherit" /> : "Sync Shipping Price"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<Sync />}
            onClick={handleUpdateCreatedOrders}
          >
            {loadingCreatedOrders ? <CircularProgress size={24} color="inherit" /> : "Update Status for Created Orders"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<Sync />}
            onClick={handleUpdateShippedOrders}
          >
            {loadingShippedOrders ? <CircularProgress size={24} color="inherit" /> : "Update Status for Shipped Orders"}
          </Button>
        </Box>
      </Box>


      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.dark', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4">{orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">New Orders</Typography>
              <Typography variant="h4">{orderStats.created || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Shipped Orders</Typography>
              <Typography variant="h4">{orderStats.shipped || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Delivered Orders</Typography>
              <Typography variant="h4">{orderStats.delivered || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => {
        const totalPrice = order.orderLines.reduce(
          (sum, line) => sum + line.price,
          0
        );
        const statusConfig = getStatusConfig(order.status);

        return (
          <OrderCard key={order.purchaseOrderId}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6" color="primary">
                    #{order.purchaseOrderId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.orderDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    <Typography variant="body2">{order.customerEmailId}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <StatusChip
                    icon={statusConfig.icon}
                    label={order.status}
                    color={statusConfig.color}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>Shipping Price: {order.shippingPrice || "-"}</Typography>
                    {(editing.field === null || editing.field !== "shippingPrice") && <IconButton onClick={() => setEditing({ id: order.purchaseOrderId, field: "shippingPrice", value: order.shippingPrice })}>
                      <Edit />
                    </IconButton>
                    }
                    {editing.id === order.purchaseOrderId && editing.field === "shippingPrice" && (
                      <>
                        <TextField
                          size="small"
                          value={editing.value || ""}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        />
                        <IconButton onClick={() => updateOrderField(order.purchaseOrderId, "shippingPrice", parseFloat(editing.value))}>
                          <Check />
                        </IconButton>
                        <IconButton onClick={() => setEditing({})}>
                          <Close />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <Typography>Cost: {order.cost || "-"}</Typography>
                    {(editing.field === null || editing.field !== "cost") && <IconButton onClick={() => setEditing({ id: order.purchaseOrderId, field: "cost", value: order.cost })}>
                      <Edit />
                    </IconButton>
                    }
                    {editing.id === order.purchaseOrderId && editing.field === "cost" && (
                      <>
                        <TextField
                          size="small"
                          value={editing.value || ""}
                          onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        />
                        <IconButton onClick={() => updateOrderField(order.purchaseOrderId, "cost", parseFloat(editing.value))}>
                          <Check />
                        </IconButton>
                        <IconButton onClick={() => setEditing({})}>
                          <Close />
                        </IconButton>
                      </>
                    )}
                  </Box>
                  {order.status === "SHIPPED" && order.shipmentEmail !== true && <Button variant="contained" color="primary" onClick={() => handleOpenEmailModal(order, 'shipmentEmail')}>
                    Send Shipment Email
                  </Button>}
                  {order.status === "DELIVERED" && order.deliveredEmail !== true && <Button variant="contained" color="success" onClick={() => handleOpenEmailModal(order, 'deliveredEmail')}>
                    Send Delivered Email
                  </Button>}
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Typography variant="h6" color="primary">
                    ${totalPrice.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    onClick={() => setExpandedOrder(
                      expandedOrder === order.purchaseOrderId ? null : order.purchaseOrderId
                    )}
                  >
                    {expandedOrder === order.purchaseOrderId ?
                      <KeyboardArrowUpIcon /> :
                      <KeyboardArrowDownIcon />
                    }
                  </IconButton>
                </Grid>
              </Grid>

              <Collapse in={expandedOrder === order.purchaseOrderId}>
                <DetailSection>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                          Shipping Details
                        </Typography>
                        <Box display="flex" alignItems="start" gap={1} mb={1}>
                          <PersonIcon color="action" />
                          <Typography>
                            {order.shippingAddress.name}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="start" gap={1}>
                          <LocationOnIcon color="action" />
                          <Typography>
                            {order.shippingAddress.address1},
                            <br />
                            {order.shippingAddress.city},
                            {order.shippingAddress.state},
                            {order.shippingAddress.postalCode}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" color="primary" gutterBottom>
                        Order Items
                      </Typography>
                      {order.orderLines.map((line) => (
                        <Box
                          key={line.lineNumber}
                          sx={{
                            p: 2,
                            mb: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 1,
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2">
                                {line.productName}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography>
                                  Qty: {line.quantity}
                                </Typography>
                                <Typography fontWeight="bold">
                                  ${(line.price).toFixed(2)}
                                </Typography>
                              </Box>
                              {line.trackingInfo.trackingNumber && (
                                <Box mt={1}>
                                  <Typography variant="caption" display="block">
                                    Tracking: {line.trackingInfo.trackingNumber}
                                  </Typography>
                                  {line.trackingInfo.trackingURL && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      href={line.trackingInfo.trackingURL}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{ mt: 1 }}
                                    >
                                      Track Package
                                    </Button>
                                  )}
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </DetailSection>
              </Collapse>
            </CardContent>
          </OrderCard>
        );
      })
      }

      <Dialog open={openEmailModal} onClose={handleCloseEmailModal} disableEnforceFocus>
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <TextField
            label="Recipient Email"
            value={emailData.to}
            fullWidth
            onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
            margin="normal"
          />
          <TextField
            label="Subject"
            value={emailData.subject}
            fullWidth
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            margin="normal"
          />
          <div style={{ border: '1px solid black', minHeight: '200px', padding: '10px', marginTop: '10px' }}>
            <Editor
              editorState={emailData.bodyFrontend}
              onChange={handleEditorChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailModal} color="secondary">Close</Button>
          <Button onClick={handleSendEmail} color="primary">Send Email</Button>
        </DialogActions>
      </Dialog>


      <Paper elevation={0} sx={{ mt: 2 }}>
        <TablePagination
          component="div"
          count={orders.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[20, 50, 100]}
        />
      </Paper>
    </Box>
  );
};

export default OrderManagement;