import { NextResponse } from "next/server";
import { DbService } from "@/lib/db-service";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (checkRateLimit(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many tracking lookups. Please try again in one minute." }, { status: 429 });
    }

    const body = await request.json();
    const { orderNumber, phone } = body;

    if (!orderNumber || !phone) {
      return NextResponse.json({ error: "Order number and phone number are required." }, { status: 400 });
    }

    const order = await DbService.getOrderByNumber(orderNumber.trim());
    if (!order) {
      return NextResponse.json({ error: "Order not found. Check order number." }, { status: 404 });
    }

    // Clean phone numbers for loose comparison
    const cleanInputPhone = phone.replace(/[^0-9]/g, "");
    const cleanDbPhone = order.customerInfo.phone.replace(/[^0-9]/g, "");

    // Check if the input phone is a suffix of the db phone or vice versa
    if (!cleanDbPhone.endsWith(cleanInputPhone) && !cleanInputPhone.endsWith(cleanDbPhone)) {
      return NextResponse.json({ error: "Phone number does not match this order." }, { status: 400 });
    }

    // Mask details for privacy
    const maskedOrder = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      city: order.shippingAddress.city,
      country: order.shippingAddress.country,
      courier: order.tracking?.courier || null,
      trackingNumber: order.tracking?.trackingNumber || null,
      itemsCount: order.items?.reduce((sum: number, item: any) => sum + item.qty, 0) || 0,
    };

    return NextResponse.json({ success: true, order: maskedOrder });
  } catch (error) {
    console.error("Order tracking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
