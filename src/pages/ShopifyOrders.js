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
    Checkbox,
    FormControlLabel,
    FormGroup,
    Popover,
    Badge,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SyncIcon from '@mui/icons-material/Sync';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import dayjs from 'dayjs';
import {
    syncShopifyOrders,
    syncShopifyOrdersByIds,
    getAllShopifyOrders,
    updateShopifyOrder,
} from '../services/shopifyOrderService';
import { useSnackbar } from 'notistack';

// Define all available columns
const ALL_COLUMNS = [
    { id: 'orderId', label: 'Order ID', required: true, visible: true },
    { id: 'shopifyOrderNumber', label: 'Order #', required: false, visible: true },
    { id: 'products', label: 'Products', required: false, visible: true },
    { id: 'customer', label: 'Customer', required: false, visible: false },
    { id: 'orderDate', label: 'Order Date', required: false, visible: false },
    { id: 'orderStatus', label: 'Status', required: false, visible: false },
    { id: 'fulfillmentStatus', label: 'Fulfillment', required: false, visible: false },
    { id: 'orderValue', label: 'Order Value (₹)', required: false, visible: true },
    { id: 'checkoutCharges', label: 'Checkout Charges (₹)', required: false, visible: true },
    { id: 'expectedPayment', label: 'Payment Value (₹)', required: false, visible: true },
    { id: 'shippingValue', label: 'Shipping Value (₹)', required: true, visible: true },
    { id: 'rtoValue', label: 'RTO Value (₹)', required: true, visible: true },
    { id: 'coa', label: 'COA (₹)', required: true, visible: true },
    { id: 'gac', label: 'GAC (₹)', required: false, visible: true },
    { id: 'profitLoss', label: 'Profit/Loss (₹)', required: true, visible: true },
    { id: 'deliveredDate', label: 'Delivered Date', required: false, visible: false },
    { id: 'rtoInitiatedDate', label: 'RTO Initiated', required: false, visible: false },
    { id: 'awbCode', label: 'AWB Code', required: false, visible: false },
    { id: 'courierName', label: 'Courier', required: false, visible: false },
];

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

    // Selection state
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState(
        ALL_COLUMNS.filter(col => col.visible).map(col => col.id)
    );
    const [columnAnchorEl, setColumnAnchorEl] = useState(null);

    // Fetch orders on component mount and when pagination changes
    useEffect(() => {
        fetchOrders();
    }, [page, rowsPerPage]);

    // Update select all when orders change
    useEffect(() => {
        if (orders.length > 0 && selectedOrders.length === orders.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedOrders, orders]);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllShopifyOrders(page + 1, rowsPerPage);
            setOrders(response.orders || []);
            setTotalCount(response.totalCount || 0);
            setSelectedOrders([]); // Clear selection on new data
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
            fetchOrders();
        } catch (err) {
            setError('Failed to sync orders. Please try again.');
            enqueueSnackbar('Failed to sync orders', { variant: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleSyncSelectedOrders = async () => {
        if (selectedOrders.length === 0) {
            enqueueSnackbar('Please select orders to sync', { variant: 'warning' });
            return;
        }

        setSyncing(true);
        setError(null);
        try {
            const response = await syncShopifyOrdersByIds(selectedOrders);
            enqueueSnackbar(
                `Successfully synced ${response.syncedCount || 0} selected orders`,
                { variant: 'success' }
            );
            fetchOrders();
            setSelectedOrders([]);
        } catch (err) {
            setError('Failed to sync selected orders. Please try again.');
            enqueueSnackbar('Failed to sync selected orders', { variant: 'error' });
        } finally {
            setSyncing(false);
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const allOrderIds = orders.map((order) => order.orderId);
            setSelectedOrders(allOrderIds);
            setSelectAll(true);
        } else {
            setSelectedOrders([]);
            setSelectAll(false);
        }
    };

    const handleSelectOrder = (orderId) => {
        setSelectedOrders((prev) => {
            if (prev.includes(orderId)) {
                return prev.filter((id) => id !== orderId);
            } else {
                return [...prev, orderId];
            }
        });
    };

    const isSelected = (orderId) => selectedOrders.includes(orderId);

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
            checkoutCharges: order.checkoutCharges || 0,
            expectedPayment: order.expectedPayment || 0,
            shippingValue: order.shippingValue || 0,
            rtoValue: order.rtoValue || 0,
            coa: order.coa || 0,
            gac: order.gac || 0,
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
        const gac = isEditing ? editedValues.gac : order.gac || 0;

        const profitLoss = orderValue - shippingValue - rtoValue - coa - gac;
        return profitLoss.toFixed(2);
    };

    const getProfitLossColor = (profitLoss) => {
        return profitLoss >= 0 ? 'success' : 'error';
    };

    const formatProductList = (products) => {
        if (!products || products.length === 0) return 'N/A';
        return products.map((p) => p.name || p).join(', ');
    };

    const formatDate = (dateString) => {
        return dateString[0]+"-"+dateString[1]+"-"+dateString[2];
        // if (!dateString) return 'N/A';
        // return dayjs(dateString).format('DD MMM YYYY');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
         return dateString[0]+"-"+dateString[1]+"-"+dateString[2];
    };

    const getCustomerName = (order) => {
        return order.customer?.name || 'N/A';
    };

    const getAwbCode = (order) => {
        return order.shiprocketData?.awbCode || 'N/A';
    };

    const getCourierName = (order) => {
        return order.shiprocketData?.courierName || 'N/A';
    };

    // Column visibility handlers
    const handleColumnMenuClick = (event) => {
        setColumnAnchorEl(event.currentTarget);
    };

    const handleColumnMenuClose = () => {
        setColumnAnchorEl(null);
    };

    const handleColumnToggle = (columnId) => {
        setVisibleColumns((prev) => {
            if (prev.includes(columnId)) {
                return prev.filter((id) => id !== columnId);
            } else {
                return [...prev, columnId];
            }
        });
    };

    const isColumnVisible = (columnId) => visibleColumns.includes(columnId);

    const getVisibleColumns = () => {
        return ALL_COLUMNS.filter((col) => isColumnVisible(col.id));
    };

    // Render cell content based on column
    const renderCellContent = (column, order) => {
        const isEditing = editingOrderId === order.orderId;

        switch (column.id) {
            case 'orderId':
                return (
                    <Typography variant="body2" fontWeight="medium">
                        {order.orderId}
                    </Typography>
                );
            case 'shopifyOrderNumber':
                return order.shopifyOrderNumber || 'N/A';
            case 'products':
                return (
                    <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {formatProductList(order.products)}
                    </Typography>
                );
            case 'customer':
                return getCustomerName(order);
            case 'orderDate':
                // console.log(typeof(order.orderDate))
                return formatDate(order.orderDate);
            case 'orderStatus':
                return (
                    <Chip
                        label={order.orderStatus || 'N/A'}
                        size="small"
                        color={order.orderStatus === 'open' ? 'warning' : 'default'}
                    />
                );
            case 'fulfillmentStatus':
                return (
                    <Chip
                        label={order.fulfillmentStatus || 'unfulfilled'}
                        size="small"
                        color={order.fulfillmentStatus === 'fulfilled' ? 'success' : 'default'}
                    />
                );
            case 'orderValue':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.orderValue}
                        onChange={(e) => handleFieldChange('orderValue', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.orderValue || 0).toFixed(2)}`
                );
            case 'checkoutCharges':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.checkoutCharges}
                        onChange={(e) => handleFieldChange('checkoutCharges', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.checkoutCharges || 0).toFixed(2)}`
                );
            case 'expectedPayment':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.expectedPayment}
                        onChange={(e) => handleFieldChange('expectedPayment', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.expectedPayment || 0).toFixed(2)}`
                );
            case 'shippingValue':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.shippingValue}
                        onChange={(e) => handleFieldChange('shippingValue', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.shippingValue || 0).toFixed(2)}`
                );
            case 'rtoValue':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.rtoValue}
                        onChange={(e) => handleFieldChange('rtoValue', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.rtoValue || 0).toFixed(2)}`
                );
            case 'coa':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.coa}
                        onChange={(e) => handleFieldChange('coa', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.coa || 0).toFixed(2)}`
                );
            case 'gac':
                return isEditing ? (
                    <TextField
                        type="number"
                        size="small"
                        value={editedValues.gac}
                        onChange={(e) => handleFieldChange('gac', e.target.value)}
                        sx={{ width: 100 }}
                    />
                ) : (
                    `₹${(order.gac || 0).toFixed(2)}`
                );
            case 'profitLoss':
                const profitLoss = calculateProfitLoss(order);
                return (
                    <Chip
                        label={`₹${profitLoss}`}
                        color={getProfitLossColor(parseFloat(profitLoss))}
                        size="small"
                        sx={{ fontWeight: 'bold', minWidth: 80 }}
                    />
                );
            case 'deliveredDate':
                return formatDateTime(order.deliveredDate);
            case 'rtoInitiatedDate':
                return formatDateTime(order.rtoInitiatedDate);
            case 'awbCode':
                return getAwbCode(order);
            case 'courierName':
                return getCourierName(order);
            default:
                return 'N/A';
        }
    };

    const columnMenuOpen = Boolean(columnAnchorEl);

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
                            {syncing ? 'Syncing...' : 'Sync by Date'}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
                            onClick={handleSyncSelectedOrders}
                            disabled={syncing || selectedOrders.length === 0}
                            sx={{ height: 56 }}
                        >
                            {syncing ? 'Syncing...' : `Sync Selected (${selectedOrders.length})`}
                        </Button>
                        <Tooltip title="Configure Columns">
                            <IconButton
                                color="primary"
                                onClick={handleColumnMenuClick}
                                sx={{ ml: 'auto' }}
                            >
                                <Badge badgeContent={visibleColumns.length} color="primary">
                                    <ViewColumnIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary">
                            Total Orders: {totalCount}
                        </Typography>
                    </Box>
                </Paper>

                {/* Column Selection Popover */}
                <Popover
                    open={columnMenuOpen}
                    anchorEl={columnAnchorEl}
                    onClose={handleColumnMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <Box sx={{ p: 2, minWidth: 250 }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Select Columns to Display
                        </Typography>
                        <FormGroup>
                            {ALL_COLUMNS.map((column) => (
                                <FormControlLabel
                                    key={column.id}
                                    control={
                                        <Checkbox
                                            checked={isColumnVisible(column.id)}
                                            onChange={() => handleColumnToggle(column.id)}
                                            disabled={column.required}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            {column.label}
                                            {column.required && ' (Required)'}
                                        </Typography>
                                    }
                                />
                            ))}
                        </FormGroup>
                    </Box>
                </Popover>

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
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                sx={{ color: 'white' }}
                                                indeterminate={
                                                    selectedOrders.length > 0 &&
                                                    selectedOrders.length < orders.length
                                                }
                                                checked={selectAll}
                                                onChange={handleSelectAllClick}
                                            />
                                        </TableCell>
                                        {getVisibleColumns().map((column) => (
                                            <TableCell
                                                key={column.id}
                                                sx={{ color: 'white', fontWeight: 'bold' }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => {
                                        const isEditing = editingOrderId === order.orderId;
                                        const selected = isSelected(order.orderId);

                                        return (
                                            <TableRow
                                                key={order.orderId}
                                                hover
                                                selected={selected}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selected}
                                                        onChange={() => handleSelectOrder(order.orderId)}
                                                    />
                                                </TableCell>
                                                {getVisibleColumns().map((column) => (
                                                    <TableCell key={column.id}>
                                                        {renderCellContent(column, order)}
                                                    </TableCell>
                                                ))}
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