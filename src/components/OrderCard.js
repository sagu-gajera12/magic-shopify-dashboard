import React, { useState } from 'react';
import { 
    Card, 
} from '@mui/material';
import { shipmentService } from '../services/shipmentService';
import ShipGlobalModal from './ShipGlobal/ShipGlobalModal';
import OrderActions from './Order/OrderActions';
import OrderHeader from './Order/OrderHeader';
import OrderDetails from './Order/OrderDetails';

const OrderCard = ({ order, onView, onEdit, onShipment, onFetchShipmentStatus }) => {
    const [shipGlobalOpen, setShipGlobalOpen] = useState(false);

    const handleUpdateStatus = async (orderId) => {
        try {
            const response = await shipmentService.updateShipmentStatus(orderId);
            console.log('Shipment status updated successfully:', response.data);
            updateShipmentStatus(response.data);
        } catch (error) {
            console.error('Failed to update shipment status:', error);
        }
    };

    const handleShipOrderInWalmart = async (order) => {
        try {
            const { purchaseOrderId, orderInfo } = order;

            if (!purchaseOrderId) {
                alert('Order does not have purchaseOrderId.');
                return;
            }

            if (!orderInfo || orderInfo.length === 0) {
                alert('Order does not have any products to ship.');
                return;
            }

            if (!order.trackingNumber) {
                alert('Order does not have tracking details.');
                return;
            }

            const response = await shipmentService.shipOrderInWalmart(order);
            onFetchShipmentStatus({ ...order, shipmentStatus: "SHIPPED_IN_WALMART" });
            console.log('Shipment status updated successfully in walmart:', response.data);
        } catch (error) {
            console.error('Failed to update shipment status:', error);
        }
    };

    const updateShipmentStatus = (shipmentDetails) => {
        onFetchShipmentStatus({
            ...order,
            shipmentStatus: shipmentDetails.status,
            trackingNumber: shipmentDetails.trackingNumber,
            trackingUrl: shipmentDetails.trackingUrl,
        });
    };

    const handleShipGlobal = () => {
        setShipGlobalOpen(true);
    };

    return (
        <>
            <Card
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 16,
                }}
            >
                <OrderHeader 
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onShipOrderInWalmart={handleShipOrderInWalmart}
                />

                <OrderDetails order={order} />

                <OrderActions
                    order={order}
                    onView={onView}
                    onEdit={onEdit}
                    onShipment={onShipment}
                    onShipGlobal={handleShipGlobal}
                />
            </Card>

            <ShipGlobalModal
                open={shipGlobalOpen}
                onClose={() => setShipGlobalOpen(false)}
                order={order}
            />
        </>
    );
};

export default OrderCard;