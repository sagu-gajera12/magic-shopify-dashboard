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
    console.log("Generating email template for order:", order, "with type:", type, "order", order);
    if (!order || ((type === "shipmentEmail" || type === "deliveredEmail" || type === "promotionalEmail") && (!order.purchaseOrderId || !order.shippingAddress || !order.orderLines))) {
        console.error("Invalid order data provided for email template.");
        return { subject: "", body: "" };
    }

    if (type === "shipmentEmail") {
        const customerName = order.shippingAddress.name;
        const purchaseOrderId = order.purchaseOrderId;
        const productsShipped = order.orderLines.map(line => line.productName).join(", ");
        const trackingInfo = order.orderLines[0]?.trackingInfo;
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
        const purchaseOrderId = order.purchaseOrderId;
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

    if (type === "promotionalEmail") {
        return {
            subject: `Your ${order.orderLines[0]?.productName || "recent purchase"} – Discover More in Our Exclusive Catalog!`,

            body: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>Hi <strong>${order.shippingAddress?.name?.split(" ")[0] || "Customer"}</strong>,</p>
            
                    <p>We hope you’re doing well! We noticed you recently purchased 
                    <strong>${order.orderLines[0]?.productName || "our product"}</strong> from us on Walmart, and we truly appreciate your trust in our products.</p>
            
                    <p>We’re excited to share that you can now explore our full <strong>exclusive product catalog</strong> — showcasing our bestsellers, new arrivals, and special offers — all in one place.</p>
            
                    <h3>Why shop directly with us?</h3>
                    <ul>
                        <li>💰 <strong>Better Prices</strong> – Exclusive discounts for returning customers</li>
                        <li>🚚 <strong>Fast Shipping</strong> – Direct dispatch from our U.S. fulfillment partner</li>
                        <li>✅ <strong>Guaranteed Authenticity</strong> – Products shipped directly from the official seller</li>
                        <li>📞 <strong>Dedicated Support</strong> – Priority service for our direct customers</li>
                    </ul>
            
                    <p style="font-size: 16px; font-weight: bold; color: #d32f2f;">
                        📌 This is our <u>catalog only</u> — to place an order, simply reply to this email, send us a WhatsApp message, or call us directly.
                    </p>
            
                    <p>As a thank-you, here’s a special offer for your next direct order:</p>
                    <p style="font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 10px; display: inline-block; border-radius: 5px;">
                        Use code <span style="color: #d32f2f;">PROMO30</span> for <strong>30% OFF</strong> your first direct purchase
                    </p>
            
                    <p style="margin-top: 20px;">
                        <a href="https://catalog.skinnthrive.com" target="_blank" 
                           style="background: #d32f2f; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                           📖 View Our Product Catalog
                        </a>
                    </p>
            
                    <p>💬 Or chat with us instantly on WhatsApp:</p>
                    <p>
                        <a href="https://wa.me/918530191782?text=${encodeURIComponent(`Hi, I am interested in ${order.orderLines[0]?.productName || 'a product'} from your catalog and would like to know more.`)}" 
                           style="background: #25D366; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
                           💬 Message Us on WhatsApp
                        </a>
                    </p>
            
                    <p>Thank you again for choosing us — we look forward to bringing you more amazing products directly.</p>
            
                    <p>Warm regards,<br>
                    <a href="https://skinnthrive.com">Skinnthrive.com</a> <br> 
                    <a href="mailto:info@skinnthrive.com">info@skinnthrive.com</a> <br> 
                    +91 8530191782</p>
                </div>
            `
        };
    }

    if (type === "orderTrackingEmail") {
        return {
            subject: `Update on Your ${order.orderInfo[0]?.productName || "Order"} – New Tracking Details Available`,
    
            body: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>Hi <strong>${order.shippingInfo?.postalAddrees?.name?.split(" ")[0] || "Customer"}</strong>,</p>
    
                    <p>We wanted to update you regarding your recent order 
                    <strong>${order.orderInfo[0]?.productName || "from our store"}</strong>.</p>
    
                    <p>Your order was initially shipped, but due to <strong>Shiprocket temporarily halting cosmetic product shipments</strong>, it was returned to us. We sincerely apologize for the inconvenience caused.</p>
    
                    <p>Good news! We have now <strong>re-shipped your order through ShipGlobal</strong> with a new tracking ID:</p>
    
                    <p style="font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 10px; display: inline-block; border-radius: 5px;">
                        Tracking ID: <span style="color: #d32f2f;">{{TRACKING_ID}}</span>
                    </p>
    
                    <p>You can track your shipment here:</p>
                    <p>
                        <a href="https://shipglobal.in/tracking?awb={{TRACKING_ID}}" target="_blank"
                           style="background: #1976d2; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                           🚚 Track Your Order
                        </a>
                    </p>
    
                    <p>Please note that delivery may take a little longer than usual. We truly appreciate your patience and understanding during this time.</p>
    
                    <p>If you have any questions or need assistance, feel free to reach us at:</p>
                    <ul>
                        <li>📧 <a href="mailto:info@skinnthrive.com">info@skinnthrive.com</a></li>
                        <li>📞 +91 8530191782</li>
                        <li>💬 <a href="https://wa.me/918530191782?text=${encodeURIComponent("Hi, I would like to get an update about my order {{TRACKING_ID}}")}" target="_blank">Message Us on WhatsApp</a></li>
                    </ul>
    
                    <p>Thank you once again for choosing us. We’re committed to ensuring your order reaches you as soon as possible.</p>
    
                    <p>Warm regards,<br>
                    <a href="https://skinnthrive.com">Skinnthrive.com</a></p>
                </div>
            `
        };
    }
    


    return { subject: "", body: "" };
};

