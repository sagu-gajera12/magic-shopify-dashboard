import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import {
    syncShopifyOrders,
    getAllShopifyOrders,
    updateShopifyOrder,
} from '../services/shopifyOrderService';
import { useSnackbar } from 'notistack';

const ShopifyOrders = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [editedValues, setEditedValues] = useState({});
    const { enqueueSnackbar } = useSnackbar();

    // Fetch orders on component mount and when pagination changes
    useEffect(() => {
        fetchOrders();
    }, [page, rowsPerPage]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllShopifyOrders(page + 1, rowsPerPage);
            setOrders(response.orders || []);
            setTotalCount(response.totalCount || 0);
        } catch (err) {
            setError('Failed to fetch orders. Please try again.');
            enqueueSnackbar('Failed to fetch orders', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSyncOrders = async () => {
        setSyncing(true);
        setError(null);
        try {
            const dateString = selectedDate.format('YYYY-MM-DD');
            const response = await syncShopifyOrders(dateString);
            enqueueSnackbar(
                `Successfully synced ${response.syncedCount || 0} orders from Shopify`,
                { variant: 'success' }
            );
            // Refresh the orders list after sync
            fetchOrders();
        } catch (err) {
            setError('Failed to sync orders. Please try again.');
            enqueueSnackbar('Failed to sync orders', { variant: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleEditClick = (order) => {
        setEditingOrderId(order.orderId);
        setEditedValues({
            orderValue: order.orderValue || 0,
            shippingValue: order.shippingValue || 0,
            rtoValue: order.rtoValue || 0,
            coa: order.coa || 0,
        });
    };

    const handleCancelEdit = () => {
        setEditingOrderId(null);
        setEditedValues({});
    };

    const handleFieldChange = (field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [field]: parseFloat(value) || 0,
        }));
    };

    const handleSaveOrder = async (orderId) => {
        try {
            await updateShopifyOrder(orderId, editedValues);
            enqueueSnackbar('Order updated successfully', { variant: 'success' });
            setEditingOrderId(null);
            setEditedValues({});
            // Refresh the orders list
            fetchOrders();
        } catch (err) {
            enqueueSnackbar('Failed to update order', { variant: 'error' });
        }
    };

    const calculateProfitLoss = (order) => {
        const isEditing = editingOrderId === order.orderId;
        const orderValue = isEditing ? editedValues.orderValue : order.orderValue || 0;
        const shippingValue = isEditing ? editedValues.shippingValue : order.shippingValue || 0;
        const rtoValue = isEditing ? editedValues.rtoValue : order.rtoValue || 0;
        const coa = isEditing ? editedValues.coa : order.coa || 0;

        const profitLoss = orderValue - shippingValue - rtoValue - coa;
        return profitLoss.toFixed(2);
    };

    const getProfitLossColor = (profitLoss) => {
        return profitLoss >= 0 ? 'success' : 'error';
    };

    const formatProductList = (products) => {
        if (!products || products.length === 0) return 'N/A';
        return products.map((p) => p.name || p).join(', ');
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                    Shopify Orders Management
                </Typography>

                {/* Sync Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            renderInput={(params) => <TextField {...params} />}
                            sx={{ minWidth: 250 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                            onClick={handleSyncOrders}
                            disabled={syncing || !selectedDate}
                            sx={{ height: 56 }}
                        >
                            {syncing ? 'Syncing...' : 'Sync Orders'}
                        </Button>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                            Total Orders: {totalCount}
                        </Typography>
                    </Box>
                </Paper>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Orders Table */}
                <TableContainer component={Paper}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                            <CircularProgress />
                        </Box>
                    ) : orders.length === 0 ? (
                        <Box sx={{ p: 5, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No orders found. Try syncing orders first.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'primary.main' }}>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Products</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Value (₹)</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Shipping Value (₹)</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>RTO Value (₹)</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>COA (₹)</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Profit/Loss (₹)</TableCell>
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => {
                                        const isEditing = editingOrderId === order.orderId;
                                        const profitLoss = calculateProfitLoss(order);

                                        return (
                                            <TableRow key={order.orderId} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {order.orderId}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                        {formatProductList(order.products)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={editedValues.orderValue}
                                                            onChange={(e) => handleFieldChange('orderValue', e.target.value)}
                                                            sx={{ width: 100 }}
                                                        />
                                                    ) : (
                                                        `₹${(order.orderValue || 0).toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={editedValues.shippingValue}
                                                            onChange={(e) => handleFieldChange('shippingValue', e.target.value)}
                                                            sx={{ width: 100 }}
                                                        />
                                                    ) : (
                                                        `₹${(order.shippingValue || 0).toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={editedValues.rtoValue}
                                                            onChange={(e) => handleFieldChange('rtoValue', e.target.value)}
                                                            sx={{ width: 100 }}
                                                        />
                                                    ) : (
                                                        `₹${(order.rtoValue || 0).toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            value={editedValues.coa}
                                                            onChange={(e) => handleFieldChange('coa', e.target.value)}
                                                            sx={{ width: 100 }}
                                                        />
                                                    ) : (
                                                        `₹${(order.coa || 0).toFixed(2)}`
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`₹${profitLoss}`}
                                                        color={getProfitLossColor(parseFloat(profitLoss))}
                                                        size="small"
                                                        sx={{ fontWeight: 'bold', minWidth: 80 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {isEditing ? (
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="Save">
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => handleSaveOrder(order.orderId)}
                                                                >
                                                                    <SaveIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Cancel">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    <CancelIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    ) : (
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleEditClick(order)}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={totalCount}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </TableContainer>
            </Box>
        </LocalizationProvider>
    );
};

export default ShopifyOrders;
