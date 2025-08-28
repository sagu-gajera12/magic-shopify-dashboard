import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stepper,
    Step,
    StepLabel,
    Alert,
    CircularProgress
} from '@mui/material';
import OrderForm from './OrderForm';
import ShipperSelection from './ShipperSelection';
import OrderSuccess from './OrderSuccess';
import { shipGlobalService } from '../../services/shipGlobalService';

const steps = ['Order Details', 'Validate & Get Rates', 'Select Shipper', 'Create Order'];

const ShipGlobalModal = ({ open, onClose, order }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [pickupAddresses, setPickupAddresses] = useState([]);
    const [selectedPickupAddress, setSelectedPickupAddress] = useState('');
    const [orderFormData, setOrderFormData] = useState({
        customer_shipping_firstname: '',
        customer_shipping_lastname: '',
        customer_shipping_mobile: '',
        customer_shipping_alternate_mobile: '',
        customer_shipping_email: '',
        customer_shipping_country_code: 'US',
        customer_shipping_address: '',
        customer_shipping_address_2: '',
        customer_shipping_address_3: '',
        customer_shipping_postcode: '',
        customer_shipping_city: '',
        customer_shipping_state_id: '',
        customer_billing_firstname: '',
        customer_billing_lastname: '',
        customer_billing_mobile: '',
        customer_billing_country_code: 'US',
        customer_billing_address: '',
        customer_billing_address_2: '',
        customer_billing_address_3: '',
        customer_billing_postcode: '',
        customer_billing_city: '',
        customer_billing_state_id: '',
        vendor_invoice_no: '',
        vendor_order_date: new Date().toISOString().split('T')[0],
        order_reference: '',
        package_weight: 0.1,
        package_length: 1,
        package_breadth: 1,
        package_height: 1,
        currency_code: 'INR',
        csb5_status: '0',
        customer_shipping_billing_same: '1',
        vendor_reference_order_id: '',
        customer_shipping_company: '',
        ioss_number: '',
        vendor_order_item: []
    });

    const [shipperRates, setShipperRates] = useState([]);
    const [selectedShipper, setSelectedShipper] = useState('');
    const [createdOrderId, setCreatedOrderId] = useState('');

    const prefillFormData = useCallback(() => {
        const { shippingInfo, orderInfo } = order;

        const nameParts = shippingInfo.postalAddress.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setOrderFormData(prev => ({
            ...prev,
            customer_shipping_firstname: firstName,
            customer_shipping_lastname: lastName,
            customer_shipping_mobile: shippingInfo.phone || '',
            customer_shipping_alternate_mobile: shippingInfo.phone || '',
            customer_shipping_email: order.customerEmailId || '',
            customer_shipping_address: shippingInfo.postalAddress.address1 || '',
            customer_shipping_address_2: shippingInfo.postalAddress.address2 || '',
            customer_shipping_postcode: shippingInfo.postalAddress.postalCode || '',
            customer_shipping_city: shippingInfo.postalAddress.city || '',
            customer_shipping_state_id: shippingInfo.postalAddress.state || '', // Will be set after states are loaded
            customer_billing_firstname: firstName,
            customer_billing_lastname: lastName,
            customer_billing_mobile: shippingInfo.phone || '',
            customer_billing_address: shippingInfo.postalAddress.address1 || '',
            customer_billing_address_2: shippingInfo.postalAddress.address2 || '',
            customer_billing_postcode: shippingInfo.postalAddress.postalCode || '',
            customer_billing_city: shippingInfo.postalAddress.city || '',
            customer_billing_state_id: shippingInfo.postalAddress.state || '', // Will be set after states are loaded
            vendor_reference_order_id: order.purchaseOrderId || '',
            order_reference: order.customerOrderId || '',
            vendor_invoice_no: `INV-${order.customerOrderId || Date.now()}`, // Generate invoice number
            vendor_order_item: orderInfo.map((item, index) => ({
                vendor_order_item_id: `id-${Date.now()}-${index}`,
                vendor_order_item_name: item.productName || '',
                vendor_order_item_sku: `sku-${index}`,
                vendor_order_item_quantity: parseInt(item.qtyAmount) || 1,
                vendor_order_item_unit_price: parseFloat(item.chargeAmount) || 0,
                vendor_order_item_hsn: '33049990',
                vendor_order_item_tax_rate: 0
            }))
        }));
    }, [order]); // dependencies it uses internally

    const fetchPickupAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const addresses = await shipGlobalService.getPickupAddresses();
            setPickupAddresses(addresses);

            const defaultAddress = addresses.find(addr => addr.default === '1');
            if (defaultAddress) {
                setSelectedPickupAddress(defaultAddress.address_id);
            }
        } catch (error) {
            setError('Failed to fetch pickup addresses');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        if (open) {
            prefillFormData();
            fetchPickupAddresses();
        }
    }, [open, order, prefillFormData, fetchPickupAddresses]);


    const validateOrderInvoice = async () => {
        setLoading(true);
        setError('');
        try {
            await shipGlobalService.validateOrderInvoice(orderFormData);
            await getShipperRates();
        } catch (error) {
            setError('Failed to validate order invoice');
        } finally {
            setLoading(false);
        }
    };

    const getShipperRates = async () => {
        setLoading(true);
        try {
            const rates = await shipGlobalService.getShipperRates(orderFormData);
            setShipperRates(rates);
            setActiveStep(2);
        } catch (error) {
            setError('Failed to fetch shipping rates');
        } finally {
            setLoading(false);
        }
    };

    const addOrder = async (shipperCode) => {
        setLoading(true);
        try {
            const orderId = await shipGlobalService.addOrder({
                ...orderFormData,
                pickup_address_id: selectedPickupAddress,
                shipper: shipperCode
            });
            setCreatedOrderId(orderId);
            setActiveStep(3);
        } catch (error) {
            setError('Failed to add order');
        } finally {
            setLoading(false);
        }
    };

    const createDraftOrder = async () => {
        setLoading(true);
        try {
            await shipGlobalService.createDraftOrder(createdOrderId);
            onClose();
            setActiveStep(0);
            setError('');
            alert('Order created in draft successfully!');
        } catch (error) {
            setError('Failed to create draft order');
        } finally {
            setLoading(false);
        }
    };

    const handleShipperSelect = (shipperCode) => {
        setSelectedShipper(shipperCode);
        addOrder(shipperCode);
    };

    const handleInputChange = (field, value) => {
        setOrderFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...orderFormData.vendor_order_item];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        setOrderFormData(prev => ({
            ...prev,
            vendor_order_item: updatedItems
        }));
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <OrderForm
                        orderFormData={orderFormData}
                        pickupAddresses={pickupAddresses}
                        selectedPickupAddress={selectedPickupAddress}
                        onPickupAddressChange={setSelectedPickupAddress}
                        onInputChange={handleInputChange}
                        onItemChange={handleItemChange}
                    />
                );

            case 1:
                return (
                    <Box textAlign="center" py={4}>
                        <Typography variant="h6" gutterBottom>
                            Validating order and fetching shipping rates...
                        </Typography>
                        {loading && <CircularProgress />}
                    </Box>
                );

            case 2:
                return (
                    <ShipperSelection
                        shipperRates={shipperRates}
                        selectedShipper={selectedShipper}
                        onShipperSelect={handleShipperSelect}
                        loading={loading}
                    />
                );

            case 3:
                return (
                    <OrderSuccess
                        orderId={createdOrderId}
                        onCreateDraft={createDraftOrder}
                        loading={loading}
                    />
                );

            default:
                return null;
        }
    };

    const handleClose = () => {
        onClose();
        setActiveStep(0);
        setError('');
        setSelectedShipper('');
        setCreatedOrderId('');
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">ShipGlobal Order</Typography>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" style={{ marginBottom: 16 }}>
                        {error}
                    </Alert>
                )}

                {renderStepContent()}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>

                {activeStep === 0 && (
                    <Button
                        variant="contained"
                        onClick={validateOrderInvoice}
                        disabled={loading || !selectedPickupAddress}
                    >
                        Validate Order & Get Rates
                    </Button>
                )}

                {activeStep === 1 && loading && (
                    <Button disabled>
                        <CircularProgress size={20} style={{ marginRight: 8 }} />
                        Processing...
                    </Button>
                )}

                {activeStep === 2 && !loading && (
                    <Typography variant="body2" color="textSecondary">
                        Click on a shipping service to proceed
                    </Typography>
                )}

                {activeStep === 2 && loading && (
                    <Button disabled>
                        <CircularProgress size={20} style={{ marginRight: 8 }} />
                        Creating Order...
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default ShipGlobalModal;