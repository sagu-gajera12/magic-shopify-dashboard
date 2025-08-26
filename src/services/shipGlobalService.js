import axios from 'axios';

const SHIPGLOBAL_BASE_URL = 'http://localhost:8080/api/shipglobal';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
});

export const shipGlobalService = {
    async getPickupAddresses() {
        const response = await axios.get(`${SHIPGLOBAL_BASE_URL}/pickup/get-pickup-address`, {
            headers: getAuthHeaders()
        });
        return response.data.data || [];
    },

    async validateOrderInvoice(orderFormData) {
        const payload = {
            csbv: 0,
            currency_code: orderFormData.currency_code,
            package_weight: orderFormData.package_weight,
            package_height: orderFormData.package_height,
            package_length: orderFormData.package_length,
            package_breadth: orderFormData.package_breadth,
            country_code: orderFormData.customer_shipping_country_code,
            vendor_order_item: orderFormData.vendor_order_item.map(item => ({
                vendor_order_item_id: item.vendor_order_item_id,
                vendor_order_item_name: item.vendor_order_item_name,
                vendor_order_item_sku: item.vendor_order_item_sku,
                vendor_order_item_quantity: item.vendor_order_item_quantity,
                vendor_order_item_unit_price: item.vendor_order_item_unit_price,
                vendor_order_item_hsn: item.vendor_order_item_hsn,
                vendor_order_item_tax_rate: item.vendor_order_item_tax_rate
            }))
        };

        const response = await axios.post(`${SHIPGLOBAL_BASE_URL}/orders/validate-order-invoice`, payload, {
            headers: getAuthHeaders()
        });

        if (response.data.message !== 'Item invoice validated successfully') {
            throw new Error('Order validation failed');
        }

        return response.data;
    },

    async getShipperRates(orderFormData) {
        const payload = {
            customer_shipping_postcode: orderFormData.customer_shipping_postcode,
            customer_shipping_country_code: orderFormData.customer_shipping_country_code,
            package_weight: orderFormData.package_weight,
            package_length: orderFormData.package_length,
            package_breadth: orderFormData.package_breadth,
            package_height: orderFormData.package_height,
            csbv: 0
        };

        const response = await axios.post(`${SHIPGLOBAL_BASE_URL}/orders/get-shipper-rates`, payload, {
            headers: getAuthHeaders()
        });

        if (!response.data.data || !response.data.data.rate) {
            throw new Error('No shipping rates found');
        }

        return response.data.data.rate;
    },

    async addOrder(orderData) {
        const response = await axios.post(`${SHIPGLOBAL_BASE_URL}/orders/add-order`, orderData, {
            headers: getAuthHeaders()
        });

        if (!response.data.data || !response.data.data.order_id) {
            throw new Error('Failed to create order');
        }

        return response.data.data.order_id;
    },

    async createDraftOrder(orderId) {
        const payload = {
            order_id: orderId,
            add_to_draft: true
        };

        const response = await axios.post(`${SHIPGLOBAL_BASE_URL}/orders/pay-order`, payload, {
            headers: getAuthHeaders()
        });

        return response.data;
    }
};