"use client";

import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { Star, CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  approved: boolean;
  product: string; // Product id
  createdAt: string;
}

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchReviews = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews?admin=true");
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        showToast(data.error || "Failed to load reviews.", "error");
      }
    } catch {
      showToast("Network error fetching reviews.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchReviews]);

  const handleToggleApproval = async (id: string, currentApproved: boolean) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: id,
          approved: !currentApproved,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(!currentApproved ? "Review approved!" : "Review unapproved!", "success");
        fetchReviews();
      } else {
        showToast(data.error || "Failed to update review status.", "error");
      }
    } catch {
      showToast("Error updating review status.", "error");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: id,
          deleteReview: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Review deleted successfully.", "success");
        fetchReviews();
      } else {
        showToast(data.error || "Failed to delete review.", "error");
      }
    } catch {
      showToast("Error deleting review.", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
            User Reviews
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Approve or reject customer-submitted product feedback before it displays publicly.
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="inline-flex items-center gap-1.5 px-3 h-8 border border-neutral-200 bg-white text-neutral-600 rounded-custom-lg text-xs font-bold hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-20 text-xs text-neutral-400">
              Loading user reviews...
            </div>
          ) : reviews.length > 0 ? (
            <table className="min-w-full divide-y divide-neutral-100 text-left">
              <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Reviewer details</th>
                  <th className="px-6 py-3.5">Rating</th>
                  <th className="px-6 py-3.5">Comment</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Approval Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600 font-medium">
                {reviews.map((rev) => (
                  <tr key={rev._id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{rev.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{rev.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating ? "fill-current" : "text-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs sm:max-w-md truncate text-neutral-500 font-semibold leading-relaxed">
                      {rev.comment}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-semibold">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        rev.approved
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {rev.approved ? "Approved" : "Pending Approval"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApproval(rev._id, rev.approved)}
                          className={`p-1.5 rounded-custom-lg border transition-all focus:outline-none ${
                            rev.approved
                              ? "border-neutral-200 bg-white text-neutral-500 hover:text-amber-600 hover:border-amber-250"
                              : "border-green-250 bg-green-50/50 text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600"
                          }`}
                          title={rev.approved ? "Unapprove review" : "Approve review"}
                        >
                          {rev.approved ? (
                            <XCircle className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-400 hover:text-red-600 hover:border-red-200 transition-all focus:outline-none"
                          title="Delete review"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24 text-xs text-neutral-400">
              No user reviews are currently logged in the system.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
