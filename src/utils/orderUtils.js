/**
 * Updates an order in the orders state after parsing JSON fields.
 * @param {Array} orders - The current list of orders.
 * @param {Object} updatedOrder - The updated order object from API.
 * @returns {Array} - The updated orders array.
 */
export const updateOrderInState = (orders, updatedOrder) => {
    if (!updatedOrder) {
      console.error("No updated order received.");
      return orders;
    }
  
    try {
      const formattedOrder = {
        ...updatedOrder,
        orderLines: JSON.parse(updatedOrder.orderLines),
        shippingAddress: JSON.parse(updatedOrder.shippingAddress),
      };
  
      return orders.map((order) =>
        order.purchaseOrderId === updatedOrder.purchaseOrderId
          ? { ...order, ...formattedOrder }
          : order
      );
    } catch (error) {
      console.error("Error parsing updated order data:", error);
      return orders;
    }
  };
  