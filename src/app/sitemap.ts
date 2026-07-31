import { MetadataRoute } from "next";
import { DbService } from "@/lib/db-service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static core routes
  const staticRoutes = ["", "/shop", "/track"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    // Dynamic products routes
    const products = await DbService.getProducts({ status: "active" });
    const productEntries = products.map((prod) => ({
      url: `${baseUrl}/products/${prod.slug}`,
      lastModified: new Date(prod.updatedAt || prod.createdAt || Date.now()),
      changeFrequency: "weekly" as "weekly",
      priority: 0.7,
    }));

    // Dynamic categories routes
    const categories = await DbService.getCategories();
    const categoryEntries = categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: new Date(cat.updatedAt || cat.createdAt || Date.now()),
      changeFrequency: "weekly" as "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...productEntries, ...categoryEntries];
  } catch (err) {
    console.error("Failed to generate dynamic sitemap entries:", err);
    return staticRoutes;
  }
}
