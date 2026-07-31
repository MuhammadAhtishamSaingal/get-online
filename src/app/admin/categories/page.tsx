"use client";

import * as React from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FolderPlus, Pencil, Trash2, RefreshCw } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  order: number;
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Form states
  const [editId, setEditId] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [order, setOrder] = React.useState("0");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch categories on mount
  const fetchCategories = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      showToast("Failed to load categories.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  // Sync Slug with Name automatically during creation
  React.useEffect(() => {
    if (!editId) {
      const timer = setTimeout(() => {
        setSlug(
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [name, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      showToast("Name and slug are required.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editId || undefined,
          name,
          slug,
          order: Number(order) || 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          editId ? "Category updated successfully!" : "Category created successfully!",
          "success"
        );
        
        // Reset form
        setName("");
        setSlug("");
        setOrder("0");
        setEditId(null);
        
        // Refresh list
        fetchCategories();
      } else {
        showToast(data.error || "Failed to save category.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setName(cat.name);
    setSlug(cat.slug);
    setOrder(cat.order.toString());
    showToast(`Loaded "${cat.name}" for editing.`, "info");
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${catName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Category "${catName}" deleted.`, "success");
        fetchCategories();
      } else {
        showToast(data.error || "Failed to delete category.", "error");
      }
    } catch {
      showToast("Connection error while deleting category.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName("");
    setSlug("");
    setOrder("0");
  };

  return (
    <div className="space-y-8">
      {/* Head */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-neutral-900 tracking-tight">
            Categories Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Group products into catalog structures. Items map directly to slugs.
          </p>
        </div>
        <button
          onClick={fetchCategories}
          className="inline-flex items-center gap-1.5 px-3 h-8 border border-neutral-200 bg-white text-neutral-600 rounded-custom-lg text-xs font-bold hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pane 1: Editor Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-custom-2xl border border-neutral-200 shadow-sm sticky top-6">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <FolderPlus className="h-4.5 w-4.5 text-brand-primary" />
            {editId ? "Edit Category" : "Add New Category"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Category Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Active Chargers"
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Slug URL identifier */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. active-chargers"
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-0.5">
                Sort Order
              </label>
              <input
                type="number"
                required
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                className="w-full h-10 text-xs rounded-custom-xl border border-neutral-200 bg-neutral-50 px-3 text-neutral-900 focus:border-brand-primary focus:bg-white focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center h-10 text-xs font-bold uppercase tracking-wider"
                isLoading={isSubmitting}
              >
                {editId ? "Update Category" : "Create Category"}
              </Button>
              {editId && (
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="w-full justify-center h-10 text-xs font-bold uppercase tracking-wider border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Pane 2: Categories List Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-custom-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-150">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Category Registry ({categories.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-16 text-xs text-neutral-400">
                Loading categories list...
              </div>
            ) : categories.length > 0 ? (
              <table className="min-w-full divide-y divide-neutral-100 text-left">
                <thead className="bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Order</th>
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5">Slug Handle</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600 font-medium">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-neutral-50/50">
                      <td className="px-6 py-4 text-neutral-400 font-bold">{cat.order}</td>
                      <td className="px-6 py-4 font-bold text-neutral-900">{cat.name}</td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-[10px]">{cat.slug}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all focus:outline-none"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="p-1.5 rounded-custom-lg border border-neutral-200 bg-white text-neutral-500 hover:text-red-600 hover:border-red-200 transition-all focus:outline-none"
                            title="Delete"
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
              <div className="text-center py-16 text-xs text-neutral-400">
                No categories defined. Use the creation panel to register one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
