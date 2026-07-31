import * as React from "react";
import { Metadata } from "next";
import { DbService } from "@/lib/db-service";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductDetailClient } from "@/components/ui/product-detail-client";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await DbService.getProductBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!product) {
    return {
      title: "Product Not Found | GizmoGrid",
      description: "GizmoGrid tech and lifestyle accessories store.",
    };
  }

  const title = `${product.seoTitle || product.name} | GizmoGrid`;
  const description = product.seoDescription || product.shortDescription;
  const pageUrl = `${baseUrl}/products/${product.slug}`;
  const imageUrl = product.images?.[0]?.url ? `${baseUrl}${product.images[0].url}` : `${baseUrl}/images/hero.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product metadata
  const product = await DbService.getProductBySlug(slug);

  if (!product) {
    return (
      <>
        <Header />
        <div className="h-28" />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center flex-grow">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            The premium accessory you're looking for doesn't exist or is currently out of stock.
          </p>
          <Link href="/shop">
            <Button variant="primary">Explore Shop</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Fetch reviews for this product
  const allReviews = await DbService.getReviews(product._id);
  // Show approved reviews or all reviews for dynamic dev experience
  const approvedReviews = allReviews.filter((r) => r.approved !== false);

  // Fetch related products (same category)
  const categoryProducts = await DbService.getProducts({
    category: product.category?._id || product.category,
    status: "active",
  });
  
  // Filter out active product from related list
  const relatedProducts = categoryProducts.filter(
    (p) => p._id.toString() !== product._id.toString()
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <>
      {/* Product structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": product.images?.map((img: any) => img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`) || [],
            "description": product.shortDescription || product.fullDescription,
            "sku": product.SKU || "GG-SKU",
            "brand": {
              "@type": "Brand",
              "name": product.brand || "GizmoGrid"
            },
            "offers": {
              "@type": "Offer",
              "url": `${baseUrl}/products/${product.slug}`,
              "priceCurrency": "USD",
              "price": product.basePrice,
              "itemCondition": "https://schema.org/NewCondition",
              "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            }
          })
        }}
      />

      {/* Breadcrumb structured data */}
      {product.category && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Shop",
                  "item": `${baseUrl}/shop`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": product.category.name,
                  "item": `${baseUrl}/categories/${product.category.slug}`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": product.name,
                  "item": `${baseUrl}/products/${product.slug}`
                }
              ]
            })
          }}
        />
      )}

      <Header />
      <div className="h-28" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Shop
          </Link>
          
          {product.category && (
            <div className="text-xs text-neutral-400">
              <Link href="/shop" className="hover:underline">
                Shop
              </Link>
              <span className="mx-1.5">/</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:underline">
                {product.category.name}
              </Link>
              <span className="mx-1.5">/</span>
              <span className="text-neutral-500 font-semibold">{product.name}</span>
            </div>
          )}
        </div>

        {/* Dynamic Detail Core Client */}
        <ProductDetailClient
          product={product}
          reviews={approvedReviews} // Pass approved reviews
          relatedProducts={relatedProducts}
        />
      </main>

      <Footer />
    </>
  );
}
