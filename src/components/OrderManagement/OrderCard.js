import React, { useState } from "react";
import { updateOrderField } from "../../services/orderService.js";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Grid,
    IconButton,
    Typography,
    TextField,
    styled,
} from "@mui/material";
import {
    Edit,
    Check,
    Close,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    LocalShipping as LocalShippingIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    LocationOn as LocationOnIcon,
    Inventory as InventoryIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const OrderCard = ({ order, setOrders, handleOpenEmailModal, setEmailData }) => {
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Separate states for each field to avoid unnecessary re-renders
    const [editingField, setEditingField] = useState(null);
    const [fieldValue, setFieldValue] = useState("");

    const handleEditChange = (e) => {
        setFieldValue(e.target.value);
    };

    const handleUpdate = async () => {
        if (!editingField) return;
        await updateOrderField(order.purchaseOrderId, editingField, fieldValue, setOrders);
        setEditingField(null);
    };

    const startEditing = (field, value) => {
        setEditingField(field);
        setFieldValue(value);
    };

    const cancelEditing = () => {
        setEditingField(null);
    };

    const StatusChip = styled(Chip)(({ theme }) => ({
        borderRadius: 20,
        padding: "0 10px",
        fontWeight: "bold",
        textTransform: "uppercase",
        fontSize: "0.75rem",
    }));

    const getStatusConfig = (status) => {
        const configs = {
            shipped: { color: "primary", icon: <LocalShippingIcon /> },
            created: { color: "warning", icon: <ScheduleIcon /> },
            canceled: { color: "error", icon: <InventoryIcon /> },
            delivered: { color: "success", icon: <CheckCircleIcon /> },
            default: { color: "primary", icon: <InventoryIcon /> },
        };
        return configs[status.toLowerCase()] || configs.default;
    };

    const statusConfig = getStatusConfig(order.status);
    const totalPrice = order.orderLines.reduce((sum, line) => sum + line.price, 0);

    return (
        <Card sx={{ marginBottom: 2, borderRadius: 2 }}>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <Typography variant="h6" color="primary">
                            #{order.purchaseOrderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {new Date(order.orderDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
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
                        <StatusChip icon={statusConfig.icon} label={order.status} color={statusConfig.color} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        {/* Shipping Price Field */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography>Shipping Price: {order.shippingPrice || "-"}</Typography>
                            {editingField !== "shippingPrice" ? (
                                <IconButton onClick={() => startEditing("shippingPrice", order.shippingPrice)}>
                                    <Edit />
                                </IconButton>
                            ) : (
                                <>
                                    <TextField
                                        size="small"
                                        value={fieldValue}
                                        onChange={handleEditChange}
                                        autoFocus
                                    />
                                    <IconButton onClick={handleUpdate}>
                                        <Check />
                                    </IconButton>
                                    <IconButton onClick={cancelEditing}>
                                        <Close />
                                    </IconButton>
                                </>
                            )}
                        </Box>

                        {/* Cost Field */}
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Typography>Cost: {order.cost || "-"}</Typography>
                            {editingField !== "cost" ? (
                                <IconButton onClick={() => startEditing("cost", order.cost)}>
                                    <Edit />
                                </IconButton>
                            ) : (
                                <>
                                    <TextField
                                        size="small"
                                        value={fieldValue}
                                        onChange={handleEditChange}
                                        autoFocus
                                    />
                                    <IconButton onClick={handleUpdate}>
                                        <Check />
                                    </IconButton>
                                    <IconButton onClick={cancelEditing}>
                                        <Close />
                                    </IconButton>
                                </>
                            )}
                        </Box>

                        {/* Email Buttons */}
                        {order.status === "SHIPPED" && !order.shipmentEmail && (
                            <Button variant="contained" color="primary" onClick={() => handleOpenEmailModal(order, "shipmentEmail")}>
                                Send Shipment Email
                            </Button>
                        )}
                        {order.status === "DELIVERED" && !order.deliveredEmail && (
                            <Button variant="contained" color="success" onClick={() => handleOpenEmailModal(order, "deliveredEmail")}>
                                Send Delivered Email
                            </Button>
                        )}
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Typography variant="h6" color="primary">${totalPrice.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                        <IconButton onClick={() => setExpandedOrder(expandedOrder === order.purchaseOrderId ? null : order.purchaseOrderId)}>
                            {expandedOrder === order.purchaseOrderId ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </Grid>
                </Grid>

                {/* Order Details Collapse */}
                <Collapse in={expandedOrder === order.purchaseOrderId}>
                    <Box sx={{ padding: 3, border: "1px solid gray", borderRadius: 2, marginTop: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                    Shipping Details
                                </Typography>
                                <Box display="flex" alignItems="start" gap={1} mb={1}>
                                    <PersonIcon color="action" />
                                    <Typography>{order.shippingAddress.name}</Typography>
                                </Box>
                                <Box display="flex" alignItems="start" gap={1}>
                                    <LocationOnIcon color="action" />
                                    <Typography>
                                        {order.shippingAddress.address1}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}
                                    </Typography>
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
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
};

export default OrderCard;
