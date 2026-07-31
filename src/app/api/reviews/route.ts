import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DbService } from "@/lib/db-service";
import { verifyJWT } from "@/lib/auth";

async function isAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gizmogrid_admin_token")?.value;
  if (!token) return false;
  const decoded = await verifyJWT(token);
  return !!decoded;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdminMode = searchParams.get("admin") === "true";
    const productId = searchParams.get("productId") || undefined;

    if (isAdminMode) {
      if (!(await isAuthorized())) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
      const reviews = await DbService.getReviews(productId);
      return NextResponse.json(reviews);
    }

    // Public view: only return approved reviews
    const allReviews = await DbService.getReviews(productId);
    const approvedReviews = allReviews.filter((r) => r.approved === true);
    return NextResponse.json(approvedReviews);
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product, name, email, rating, comment } = body;

    // Validation
    if (!product || !name || !email || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Save review (defaults to approved: false per schema definition)
    const newReview = await DbService.saveReview({
      product,
      name,
      email,
      rating: ratingNum,
      comment,
      approved: false, // Must be approved by administrator in dashboard first
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (error) {
    console.error("API Reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, approved, deleteReview } = body;

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    if (deleteReview === true) {
      await DbService.deleteReview(reviewId);
      return NextResponse.json({ success: true, message: "Review deleted successfully" });
    }

    const updated = await DbService.updateReview(reviewId, { approved });
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (error) {
    console.error("API Reviews PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
