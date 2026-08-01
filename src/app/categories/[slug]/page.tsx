import * as React from "react";
import { DbService } from "@/lib/db-service";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { ParallaxFeature } from "@/components/ui/parallax-feature";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Category-specific parallax setups mapping
const PARALLAX_CONFIGS: Record<string, {
  backgroundImage: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}> = {
  "computer-accessories": {
    backgroundImage: "/images/parallax-computer.png",
    headline: "The Art of the Clean Desk",
    description: "Discover precision-crafted keyboards, ergonomic mice, and multi-port hubs designed to unify your desktop workspace with seamless, minimalist aesthetics.",
    ctaText: "Shop Work Essentials",
    ctaLink: "/shop?category=computer-accessories"
  },
  "gaming-accessories": {
    backgroundImage: "/images/parallax-gaming.png",
    headline: "Immersive Play Spaces",
    description: "Level up your battle station with high-performance accessories, tactile mechanical switches, and immersive desk layouts tailored for victory.",
    ctaText: "Explore Gaming Gear",
    ctaLink: "/shop?category=gaming-accessories"
  },
  "earbuds": {
    backgroundImage: "/images/parallax-audio.png",
    headline: "Acoustic Excellence",
    description: "Immerse yourself in clean soundscapes. Our premium wireless earbuds and audio interfaces are fine-tuned to block distractions and keep you focused.",
    ctaText: "Discover Audio",
    ctaLink: "/shop?category=earbuds"
  },
  "headphones": {
    backgroundImage: "/images/parallax-audio.png",
    headline: "Acoustic Excellence",
    description: "Immerse yourself in clean soundscapes. Our premium wireless earbuds and audio interfaces are fine-tuned to block distractions and keep you focused.",
    ctaText: "Discover Audio",
    ctaLink: "/shop?category=headphones"
  }
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Retrieve category metadata
  const category = await DbService.getCategoryBySlug(slug);
  
  if (!category) {
    return (
      <>
        <Header />
        <div className="h-28" />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center flex-grow">
          <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">Category Not Found</h2>
          <p className="text-sm text-neutral-500 mb-6">Sorry, we couldn't find the category you're looking for.</p>
          <Link href="/shop">
            <Button variant="primary">Back to Shop</Button>
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Retrieve products in this category
  const allProducts = await DbService.getProducts({ status: "active" });
  const products = allProducts.filter(
    (p) => p.category?.toString() === category._id.toString()
  );

  // Dynamic parallax fallback configuration
  const defaultParallax = {
    backgroundImage: "/images/parallax-home.png",
    headline: `Modern ${category.name} Gear`,
    description: `Enhance your digital workspace with GizmoGrid's premium selection of design-forward, engineered products tailored for the ${category.name} collection.`,
    ctaText: "View Collection",
    ctaLink: `/shop?category=${category.slug}`
  };

  const parallaxData = PARALLAX_CONFIGS[slug] || defaultParallax;

  return (
    <>
      <Header />
      <div className="h-28" />

      {/* Top Breadcrumb & Title (Constrained width) */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 w-full">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to all accessories
        </Link>

        {/* Category Header */}
        <div className="border-b border-neutral-100 pb-6 mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 text-sm text-neutral-500 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Full-width Parallax Editorial Section */}
      <div className="mb-12">
        <ParallaxFeature
          backgroundImage={parallaxData.backgroundImage}
          headline={parallaxData.headline}
          description={parallaxData.description}
          ctaText={parallaxData.ctaText}
          ctaLink={parallaxData.ctaLink}
        />
      </div>

      {/* Product Grid (Constrained width) */}
      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 flex-grow w-full">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 rounded-custom-xl border border-dashed border-neutral-200">
            <h3 className="font-display text-lg font-bold text-neutral-900 mb-1">
              No products found
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-6">
              We haven't seeded products for the {category.name} category yet.
            </p>
            <Link href="/shop">
              <Button variant="primary">Explore Other Categories</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
