import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (checkRateLimit(ip, 10, 60000)) {
      return NextResponse.json({ error: "Too many coupon validation attempts. Please try again in one minute." }, { status: 429 });
    }

    await connectDB();
    const body = await request.json();
    const { couponCode, subtotal } = body;

    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code, active: true });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon code." }, { status: 404 });
    }

    // 1. Check expiration
    if (new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ error: "This coupon code has expired." }, { status: 400 });
    }

    // 2. Check usage limits
    if (coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon code has reached its usage limit." }, { status: 400 });
    }

    // 3. Check minimum order value
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum subtotal of $${coupon.minOrderValue.toFixed(2)} is required to use this coupon.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (error) {
    console.error("Coupon validation route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
