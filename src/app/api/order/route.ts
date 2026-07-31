import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DbService } from "@/lib/db-service";
import { verifyJWT } from "@/lib/auth";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import {
  sendAdminOrderEmail,
  sendCustomerOrderConfirmation,
  sendOrderStatusEmail
} from "@/lib/email";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

async function isAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gizmogrid_admin_token")?.value;
  if (!token) return false;
  const decoded = await verifyJWT(token);
  return !!decoded;
}

export async function GET() {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    const orders = await DbService.getOrders({});
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("[POST /api/order] Received new order placement request.");
  try {
    const ip = getClientIp(request);
    if (checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many order requests. Please try again in one minute." }, { status: 429 });
    }

    const body = await request.json();
    const {
      customerInfo,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      couponCode,
      notes,
      items,
      idempotencyKey,
    } = body;

    // 1. Basic validation
    console.log("[POST /api/order] Step 1: Validating contact, address, and shopping cart items.");
    if (!customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
      console.warn("[POST /api/order] Validation Failed: Missing customer contact info.");
      return NextResponse.json({ error: "Missing customer contact info" }, { status: 400 });
    }
    if (!shippingAddress?.streetAddress || !shippingAddress?.city || !shippingAddress?.province || !shippingAddress?.postalCode) {
      console.warn("[POST /api/order] Validation Failed: Missing shipping address fields.");
      return NextResponse.json({ error: "Missing shipping address fields" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      console.warn("[POST /api/order] Validation Failed: Shopping cart is empty.");
      return NextResponse.json({ error: "Shopping cart is empty" }, { status: 400 });
    }

    // 2. Duplicate Submission (Idempotency Key) Check
    if (idempotencyKey) {
      console.log(`[POST /api/order] Step 2: Checking idempotency key presence: "${idempotencyKey}".`);
      const existingOrder = await Order.findOne({ idempotencyKey }).lean();
      if (existingOrder) {
        console.info(`[POST /api/order] Idempotency Hit: Order already exists with key "${idempotencyKey}". Returning existing Order ${existingOrder.orderNumber}.`);
        return NextResponse.json({
          success: true,
          orderId: existingOrder._id,
          orderNumber: existingOrder.orderNumber,
        });
      }
    }

    // 3. Map Payment Method to Schema enum
    console.log("[POST /api/order] Step 3: Determining resolved payment method.");
    let resolvedPaymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA" = "CASH_ON_DELIVERY";
    if (paymentMethod === "ADVANCE_TRANSFER") {
      const wallet = (paymentDetails?.walletName || "").toLowerCase();
      if (wallet.includes("jazz")) {
        resolvedPaymentMethod = "JAZZCASH";
      } else if (wallet.includes("easy")) {
        resolvedPaymentMethod = "EASYPAISA";
      } else {
        resolvedPaymentMethod = "BANK_TRANSFER";
      }
    }
    console.log(`[POST /api/order] Resolved payment method: "${resolvedPaymentMethod}".`);

    // 4. Security Check: Recalculate prices and verify stock from DB
    console.log("[POST /api/order] Step 4: Security verification. Fetching catalog data and recalculating subtotals.");
    let subtotal = 0;
    const validatedItems = [];
    const productsToUpdate = [];

    for (const item of items) {
      console.log(`[POST /api/order] Verifying item productId: "${item.productId}" (variant: "${item.variantName || 'None'}").`);
      const dbProduct = await DbService.getProductById(item.productId);
      if (!dbProduct) {
        console.warn(`[POST /api/order] Product not found in database: "${item.productId}".`);
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }
      if (dbProduct.status !== "active") {
        console.warn(`[POST /api/order] Product is inactive: "${dbProduct.name}" (${item.productId}).`);
        return NextResponse.json({ error: `Product is currently inactive: ${dbProduct.name}` }, { status: 400 });
      }

      // Check variant matching
      let unitPrice = dbProduct.basePrice;
      let sku = dbProduct.SKU || "sku";
      let matchedVariant = null;

      if (item.variantName) {
        matchedVariant = dbProduct.variants?.find((v: any) => v.name === item.variantName);
        if (!matchedVariant) {
          console.warn(`[POST /api/order] Variant not found: "${item.variantName}" for product "${dbProduct.name}".`);
          return NextResponse.json({ error: `Variant not found: ${item.variantName} for product ${dbProduct.name}` }, { status: 400 });
        }
        unitPrice = matchedVariant.price;
        sku = matchedVariant.sku || sku;
      }

      // Check stock limits
      const availableStock = matchedVariant ? matchedVariant.stock : dbProduct.stockQuantity;
      if (item.quantity > availableStock) {
        console.warn(`[POST /api/order] Stock Exceeded: Requested ${item.quantity} units of "${dbProduct.name}", available: ${availableStock}.`);
        return NextResponse.json(
          { error: `Insufficient stock for ${dbProduct.name}${item.variantName ? " (" + item.variantName + ")" : ""}. Available: ${availableStock}` },
          { status: 400 }
        );
      }

      subtotal += unitPrice * item.quantity;
      validatedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        sku,
        price: unitPrice,
        qty: item.quantity,
        variant: item.variantName || undefined,
      });

      // Track stock reduction payload
      productsToUpdate.push({
        dbProduct,
        matchedVariant,
        qty: item.quantity,
      });
    }
    console.log(`[POST /api/order] Recalculated subtotal: $${subtotal.toFixed(2)}.`);

    // 5. Database Coupon Validation & Recalculation
    let discount = 0;
    if (couponCode) {
      console.log(`[POST /api/order] Step 5: Validating coupon code: "${couponCode}".`);
      const code = couponCode.trim().toUpperCase();
      const dbCoupon = await Coupon.findOne({ code, active: true });
      if (!dbCoupon) {
        console.warn(`[POST /api/order] Coupon is invalid or inactive: "${code}".`);
        return NextResponse.json({ error: "Invalid or inactive coupon code." }, { status: 400 });
      }

      // Check expiry date
      if (new Date() > new Date(dbCoupon.expiryDate)) {
        console.warn(`[POST /api/order] Coupon has expired: "${code}".`);
        return NextResponse.json({ error: "This coupon code has expired." }, { status: 400 });
      }

      // Check usage limits
      if (dbCoupon.usageLimit !== undefined && dbCoupon.usageCount >= dbCoupon.usageLimit) {
        console.warn(`[POST /api/order] Coupon usage limit exceeded: "${code}".`);
        return NextResponse.json({ error: "This coupon code has reached its usage limit." }, { status: 400 });
      }

      // Check minimum order value
      if (subtotal < dbCoupon.minOrderValue) {
        console.warn(`[POST /api/order] Subtotal too low: $${subtotal} < minimum threshold of $${dbCoupon.minOrderValue} for coupon "${code}".`);
        return NextResponse.json(
          { error: `Minimum subtotal of $${dbCoupon.minOrderValue.toFixed(2)} is required to use this coupon.` },
          { status: 400 }
        );
      }

      // Calculate discount amount
      if (dbCoupon.discountType === "percentage") {
        discount = subtotal * (dbCoupon.discountValue / 100);
      } else {
        discount = Math.min(dbCoupon.discountValue, subtotal);
      }

      // Increment usage count on the coupon
      dbCoupon.usageCount += 1;
      await dbCoupon.save();
      console.log(`[POST /api/order] Coupon discount of $${discount.toFixed(2)} applied successfully. New usage count: ${dbCoupon.usageCount}.`);
    }

    // 6. Calculate shipping (Free above $50, else $5)
    const shippingFee = subtotal >= 50 ? 0 : 5;

    // 7. Calculate final total (No tax/VAT per spec requirements)
    const total = Math.max(0, subtotal - discount + shippingFee);
    console.log(`[POST /api/order] Final calculation: subtotal: $${subtotal}, discount: $${discount}, shipping: $${shippingFee}, total: $${total.toFixed(2)}.`);

    // 8. Generate Sequence Order Number
    console.log("[POST /api/order] Step 6: Generating sequence order number.");
    const year = new Date().getFullYear();
    const allOrders = await DbService.getOrders({});
    let seq = 1;
    if (allOrders.length > 0) {
      const latestOrder = allOrders[0];
      const match = latestOrder.orderNumber?.match(/ORD-\d+-(\d+)/);
      if (match) {
        seq = Number(match[1]) + 1;
      } else {
        seq = allOrders.length + 1;
      }
    }
    const orderNumber = `ORD-${year}-${String(seq).padStart(6, "0")}`;
    console.log(`[POST /api/order] Generated Order Number: "${orderNumber}".`);

    // 9. Reduce stocks in DB
    console.log("[POST /api/order] Step 7: Deducting purchased quantities from catalog inventory stocks.");
    for (const update of productsToUpdate) {
      const { dbProduct, matchedVariant, qty } = update;
      if (matchedVariant) {
        matchedVariant.stock -= qty;
        dbProduct.stockQuantity = Math.max(0, dbProduct.stockQuantity - qty);
        console.log(`[POST /api/order] Deducting variant stock for "${dbProduct.name}" (${matchedVariant.name}): -${qty} units. New variant stock: ${matchedVariant.stock}.`);
      } else {
        dbProduct.stockQuantity -= qty;
        console.log(`[POST /api/order] Deducting base stock for "${dbProduct.name}": -${qty} units. New stock: ${dbProduct.stockQuantity}.`);
      }
      await DbService.saveProduct(dbProduct);
    }

    // 10. Persist Order document
    console.log("[POST /api/order] Step 8: Saving Order document to database.");
    const orderPayload = {
      orderNumber,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      shippingAddress: {
        country: shippingAddress.country || "Pakistan",
        province: shippingAddress.province,
        city: shippingAddress.city,
        area: shippingAddress.province || shippingAddress.city,
        houseFlatOffice: shippingAddress.apartment || "N/A",
        street: shippingAddress.streetAddress,
        landmark: shippingAddress.landmark || "",
        postalCode: shippingAddress.postalCode,
      },
      items: validatedItems,
      subtotal,
      shipping: shippingFee,
      discount,
      total,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "NEW",
      notes: notes || "",
      idempotencyKey, // Persisted for double-submission checks
      tracking: {},
      paymentDetails: resolvedPaymentMethod !== "CASH_ON_DELIVERY" ? {
        method: paymentDetails?.walletName || "TRANSFER",
        transactionRef: paymentDetails?.transactionRef || "",
        senderAccount: paymentDetails?.senderAccount || "",
        screenshotUrl: paymentDetails?.screenshotUrl || "",
      } : undefined,
    };

    const savedOrder = await DbService.saveOrder(orderPayload);
    console.log(`[POST /api/order] Order successfully saved in database. ID: "${savedOrder._id}".`);

    // 11. Fire Nodemailer confirmation emails (Isolated: cannot crash checkout flow)
    console.log("[POST /api/order] Step 9: Attempting to fire confirmation email alerts.");
    let adminNotified = false;
    let customerConfirmed = false;
    try {
      adminNotified = await sendAdminOrderEmail(savedOrder);
      customerConfirmed = await sendCustomerOrderConfirmation(savedOrder);
      console.log(`[POST /api/order] Email sending results: Admin alert sent: ${adminNotified}, Customer invoice sent: ${customerConfirmed}.`);
    } catch (emailErr) {
      console.error("[POST /api/order] Nodemailer email dispatcher threw an exception. Catching and recovering:", emailErr);
    }

    // Save notification status back to MongoDB in a secondary, isolated block
    try {
      savedOrder.emailStatus = {
        adminNotified,
        customerConfirmed,
      };
      await DbService.saveOrder(savedOrder);
      console.log("[POST /api/order] Order email status flags updated successfully in MongoDB.");
    } catch (dbErr) {
      console.error("[POST /api/order] Failed to save emailStatus updates on order:", dbErr);
    }

    console.info(`[POST /api/order] Checkout completed successfully. Returning Order ${savedOrder.orderNumber}.`);
    return NextResponse.json({
      success: true,
      orderId: savedOrder._id,
      orderNumber: savedOrder.orderNumber,
    });
  } catch (error) {
    console.error("[POST /api/order] CRITICAL CHECKOUT CONTROLLER FAILURE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, courierName, trackingNumber, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await DbService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.orderStatus;

    // Update order fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes !== undefined) order.notes = notes;
    
    // Merge tracking parameters safely
    order.tracking = {
      ...order.tracking,
      courier: courierName !== undefined ? courierName : order.tracking?.courier,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : order.tracking?.trackingNumber,
      status: orderStatus || order.tracking?.status,
    };

    const updatedOrder = await DbService.saveOrder(order);

    // If orderStatus changed, send notification email
    if (orderStatus && orderStatus !== oldStatus) {
      try {
        await sendOrderStatusEmail(updatedOrder);
      } catch (emailErr) {
        console.error("Failed to send order status update email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Admin order PUT update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
