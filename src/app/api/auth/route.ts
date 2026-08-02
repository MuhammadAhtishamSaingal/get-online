import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { DbService } from "@/lib/db-service";
import { signJWT, verifyJWT } from "@/lib/auth";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("getonline_admin_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (err) {
    return NextResponse.json({ authenticated: false, error: (err as any).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (checkRateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: "Too many login attempts. Please try again in one minute." }, { status: 429 });
    }

    const body = await request.json();
    const { email, password, action } = body;

    // Support logout action in POST if preferred by client
    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      const cookieStore = await cookies();
      cookieStore.delete("getonline_admin_token");
      return response;
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await DbService.getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signJWT({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("getonline_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: (err as any).message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    const cookieStore = await cookies();
    cookieStore.delete("getonline_admin_token");
    return response;
  } catch (err) {
    return NextResponse.json({ error: (err as any).message }, { status: 500 });
  }
}
