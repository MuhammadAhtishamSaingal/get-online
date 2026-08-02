import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DbService } from "@/lib/db-service";
import { verifyJWT } from "@/lib/auth";

async function isAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get("getonline_admin_token")?.value;
  if (!token) return false;
  const decoded = await verifyJWT(token);
  return !!decoded;
}

export async function GET() {
  try {
    const categories = await DbService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("API Categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { _id, name, slug, order } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const category = await DbService.saveCategory({
      _id,
      name,
      slug,
      order: Number(order) || 0,
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const success = await DbService.deleteCategory(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}
