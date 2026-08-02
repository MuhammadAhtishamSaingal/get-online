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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminQuery = searchParams.get("admin") === "true";
    const featured = searchParams.get("featured") === "true";
    const bestSeller = searchParams.get("bestSeller") === "true";
    const newArrival = searchParams.get("newArrival") === "true";
    const category = searchParams.get("category");

    // Admin queries all products, public queries active only
    const filter: Record<string, any> = {};
    if (!isAdminQuery) {
      filter.status = "active";
    }

    if (featured) filter.featured = true;
    if (bestSeller) filter.bestSeller = true;
    if (newArrival) filter.newArrival = true;

    // Secure administrative endpoint checks
    if (isAdminQuery && !(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let products = await DbService.getProducts(filter);

    if (category) {
      const categories = await DbService.getCategories();
      const catObj = categories.find((c) => c.slug === category);
      if (catObj) {
        products = products.filter(
          (p) => p.category?.toString() === catObj._id.toString()
        );
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("API Products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    
    // Server-side simple constraints check
    if (!body.name || !body.slug || !body.basePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const product = await DbService.saveProduct({
      ...body,
      basePrice: Number(body.basePrice),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      costPrice: body.costPrice ? Number(body.costPrice) : undefined,
      stockQuantity: Number(body.stockQuantity) || 0,
      lowStockThreshold: Number(body.lowStockThreshold) || 5,
    });

    return NextResponse.json({ success: true, product });
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
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const success = await DbService.deleteProduct(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}
