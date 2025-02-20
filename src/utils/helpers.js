export const calculateTotalProfit = (orders) => {
    let total = 0;

    orders.forEach((order) => {
        if (order.status.toLowerCase() === "shipped" && order.cost) {
            const totalPrice = order.orderLines.reduce((sum, line) => sum + line.price, 0);
            const price = parseInt(totalPrice) * 84 || 0;
            const cost = parseInt(order.cost) || 0;
            const shippingPrice = parseInt(order.shippingPrice) || 0;

            const commission = Math.floor(price * 15 / 100); // 15% commission
            const profit = price - commission - cost - shippingPrice;
            total += profit;
        }
    });

    return total;
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const showNotification = (setNotification, message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
};


export const getEmailTemplate = (order, type) => {
    if (!order || !order.purchaseOrderId || !order.shippingAddress || !order.orderLines) {
        console.error("Invalid order data provided for email template.");
        return { subject: "", body: "" };
    }

    const customerName = order.shippingAddress.name;
    const purchaseOrderId = order.purchaseOrderId;
    const productsShipped = order.orderLines.map(line => line.productName).join(", ");
    const trackingInfo = order.orderLines[0]?.trackingInfo;

    if (type === "shipmentEmail") {
        return {
            subject: `Your Order #${purchaseOrderId} Has Been Shipped!`,
            body: `
          <h2>Order Shipment Notification</h2>
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Thank you for choosing Grow Enterprises!</p>
          <p>We're excited to let you know that your order <strong>#${purchaseOrderId}</strong> has been shipped!</p>
          <ul>
            <li><strong>Product(s) Shipped:</strong> ${productsShipped}</li>
            ${trackingInfo ? `<li><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</li>
            <li><strong>Track Your Order:</strong> <a href="${trackingInfo.trackingURL}" target="_blank">Click here</a></li>` : ""}
          </ul>
          <h3>Returns & Refunds</h3>
          <p>We want to ensure a smooth shopping experience for you. In the rare case that you receive a damaged or incorrect product, we kindly ask you to take a video or photos while unpacking the box. This will help us verify the issue and process your return or refund request quickly and efficiently.</p>
          <p>Providing these details allows us to improve our order dispatch process and enhance the overall shopping experience for our customers.</p>
          <p>If you need any assistance, feel free to contact our support team.</p>
          <p>Best regards,<br>Grow Enterprises</p>  
        `,
        };
    }

    if (type === "deliveredEmail") {
        return {
            subject: `Your Order #${purchaseOrderId} Has Been Delivered!`,
            body: `
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
        `,
        };
    }

    return { subject: "", body: "" };
};

