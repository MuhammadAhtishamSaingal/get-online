import nodemailer from "nodemailer";

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Nodemailer configuration missing. Emails will be logged to terminal.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendAdminOrderEmail(order: any): Promise<boolean> {
  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL || "admin@gizmogrid.com";
  const transporter = getTransporter();

  const itemsList = order.items
    .map(
      (item: any) =>
        `<li>${item.name} - Qty: ${item.qty ?? item.quantity} - Price: $${item.price.toFixed(2)} (SKU: ${item.sku})${item.variant ? ` [Style: ${item.variant}]` : ""}</li>`
    )
    .join("\n");

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #2563eb; font-weight: 800;">GizmoGrid Order Alert</h2>
      <p>A new order has been received on GizmoGrid.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Order Number</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.orderNumber}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Customer</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.customerInfo?.name} (${order.customerInfo?.email})</td>
        </tr>
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Phone</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.customerInfo?.phone}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Shipping Address</th>
          <td style="padding: 10px; border: 1px solid #ddd;">
            ${order.shippingAddress?.houseFlatOffice || "N/A"}, ${order.shippingAddress?.street || ""}, ${order.shippingAddress?.area || ""}, ${order.shippingAddress?.city}, ${order.shippingAddress?.province}, ${order.shippingAddress?.country}
          </td>
        </tr>
        <tr style="background: #f9fafb;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Payment Method</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${order.paymentMethod}</td>
        </tr>
      </table>

      <h3 style="margin-top: 30px;">Ordered Items</h3>
      <ul>
        ${itemsList}
      </ul>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-weight: bold;">
        <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
        ${order.discount > 0 ? `<p style="color: green;">Discount: -$${order.discount.toFixed(2)}</p>` : ""}
        <p>Shipping: $${(order.shipping ?? 0).toFixed(2)}</p>
        <h3 style="color: #2563eb;">Total Order Amount: $${order.total.toFixed(2)}</h3>
      </div>

      <p style="margin-top: 30px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Manage Order</a>
      </p>
    </div>
  `;

  if (!transporter) {
    console.log("=== MOCK ADMIN ORDER EMAIL ===");
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: New Order ${order.orderNumber}`);
    console.log(emailHtml.replace(/<[^>]*>/g, ""));
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"GizmoGrid Store" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `[Order Alert] New Order ${order.orderNumber} - $${order.total.toFixed(2)}`,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error("Nodemailer failed to send admin email:", error);
    return false;
  }
}

export async function sendCustomerOrderConfirmation(order: any): Promise<boolean> {
  const transporter = getTransporter();
  if (!order.customerInfo?.email) return false;

  const itemsList = order.items
    .map(
      (item: any) =>
        `<li>${item.name} - Qty: ${item.qty ?? item.quantity} - Price: $${item.price.toFixed(2)}${item.variant ? ` [Style: ${item.variant}]` : ""}</li>`
    )
    .join("\n");

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #2563eb; font-weight: 800; text-align: center;">GizmoGrid</h2>
      <p style="text-align: center; font-size: 16px;">Thank you for your order, <strong>${order.customerInfo.name}</strong>!</p>
      <p>We are packing your items and will dispatch them shortly. Here is your transaction invoice summary.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Shipping To:</strong> ${order.shippingAddress?.houseFlatOffice || "N/A"}, ${order.shippingAddress?.street || ""}, ${order.shippingAddress?.city}</p>
      </div>

      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Order Details</h3>
      <ul style="padding-left: 20px;">
        ${itemsList}
      </ul>

      <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: right;">
        <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
        ${order.discount > 0 ? `<p style="color: green;">Discount: -$${order.discount.toFixed(2)}</p>` : ""}
        <p>Shipping: ${(order.shipping ?? 0) === 0 ? "Free" : `$${(order.shipping ?? 0).toFixed(2)}`}</p>
        <h3 style="color: #2563eb; font-size: 18px;">Total Paid: $${order.total.toFixed(2)}</h3>
      </div>

      <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
        If you have any questions, reply directly to this email or reach us at support@gizmogrid.com.
      </p>
    </div>
  `;

  if (!transporter) {
    console.log("=== MOCK CUSTOMER CONFIRMATION EMAIL ===");
    console.log(`To: ${order.customerInfo.email}`);
    console.log(`Subject: GizmoGrid Order Confirmation - ${order.orderNumber}`);
    console.log(emailHtml.replace(/<[^>]*>/g, ""));
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"GizmoGrid Store" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `GizmoGrid Order Confirmation - ${order.orderNumber}`,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error("Nodemailer failed to send customer email:", error);
    return false;
  }
}

export async function sendOrderStatusEmail(order: any): Promise<boolean> {
  const transporter = getTransporter();
  if (!order.customerInfo?.email) return false;

  const emailHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #2563eb; font-weight: 800; text-align: center;">GizmoGrid</h2>
      <p style="font-size: 16px;">Hello <strong>${order.customerInfo.name}</strong>,</p>
      <p>The status of your order <strong>${order.orderNumber}</strong> has been updated to:</p>
      
      <div style="background: #2563eb; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;">
        ${order.orderStatus.toUpperCase()}
      </div>

      ${
        order.trackingNumber
          ? `<p><strong>Courier Tracking Code:</strong> ${order.trackingNumber} (${order.courierName || "Standard Courier"})</p>`
          : ""
      }

      <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
        If you have questions regarding shipment logs, contact support@gizmogrid.com.
      </p>
    </div>
  `;

  if (!transporter) {
    console.log("=== MOCK CUSTOMER STATUS UPDATE EMAIL ===");
    console.log(`To: ${order.customerInfo.email}`);
    console.log(`Subject: Order ${order.orderNumber} Status Update`);
    console.log(emailHtml.replace(/<[^>]*>/g, ""));
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"GizmoGrid Store" <${process.env.EMAIL_USER}>`,
      to: order.customerInfo.email,
      subject: `Order ${order.orderNumber} Status Update: ${order.orderStatus}`,
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error("Nodemailer failed to send status update email:", error);
    return false;
  }
}
