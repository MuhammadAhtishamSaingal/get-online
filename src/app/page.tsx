"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Truck,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Star,
  ArrowRight,
  MessageCircle,
  Clock,
  Award,
  Leaf,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/ui/product-card";
import { HeroBanner } from "@/components/layout/hero-banner";
import { ParallaxFeature } from "@/components/ui/parallax-feature";

const CATEGORIES_MARQUEE = [
  { name: "Car Holders", slug: "mobile-accessories", image: "/images/cat-smartwatch.png" },
  { name: "Laptop Accessories", slug: "computer-accessories", image: "/images/cat-computer.png" },
  { name: "Power Banks", slug: "chargers", image: "/images/gan-charger.png" },
  { name: "Car Chargers", slug: "chargers", image: "/images/gan-charger.png" },
  { name: "Chargers", slug: "chargers", image: "/images/gan-charger.png" },
  { name: "Cables", slug: "mobile-accessories", image: "/images/prod-keyboard.png" },
  { name: "Audios", slug: "earbuds", image: "/images/cat-audio.png" },
  { name: "Car Accessories", slug: "mobile-accessories", image: "/images/hero.png" },
];

export default function Home() {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);



  // Dynamic database states
  const [featuredProducts, setFeaturedProducts] = React.useState<any[]>([]);
  const [bestSellers, setBestSellers] = React.useState<any[]>([]);
  const [newArrivals, setNewArrivals] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchJson = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`Failed to load ${url}: Status ${res.status}`);
          }
          return res.json();
        };
        const [featRes, bestRes, newRes] = await Promise.all([
          fetchJson("/api/products?featured=true"),
          fetchJson("/api/products?bestSeller=true"),
          fetchJson("/api/products?newArrival=true"),
        ]);
        setFeaturedProducts(featRes || []);
        setBestSellers(bestRes || []);
        setNewArrivals(newRes || []);
      } catch (err) {
        console.error("Failed to load dynamic products from DB API:", err);
        setError("Could not establish a connection to the database. Live storefront catalog is unavailable.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const communityFavorites = [
    {
      name: "Precision Mouse X1",
      price: "$89.00",
      image: "/images/hero.png"
    },
    {
      name: "ProLink 2m Braided Cable",
      price: "$15.00",
      image: "/images/gan-charger.png"
    },
    {
      name: "Nexus 8-in-1 Hub",
      price: "$69.00",
      image: "/images/cat-computer.png"
    }
  ];

  const reviews = [
    {
      name: "Ahmad K.",
      role: "Software Architect",
      content: "The TactileAir keyboard is a masterpiece. Clean layout, quiet mechanical feedback, and matches my workspace aesthetic perfectly.",
      rating: 5
    },
    {
      name: "Sarah M.",
      role: "Creative Director",
      content: "GizmoGrid's GaN charger is a game-changer for travel. I can charge my MacBook Pro, iPad, and iPhone simultaneously with one brick.",
      rating: 5
    },
    {
      name: "Zainab T.",
      role: "Product Designer",
      content: "The SonicWave Buds Pro provide pristine audio separation. Customer support was incredibly quick to answer my compatibility questions.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Do you offer Cash on Delivery (COD)?",
      answer: "Yes! Cash on Delivery is available nationwide across Pakistan with no advance payment required for major cities."
    },
    {
      question: "What is your warranty policy?",
      answer: "We offer a 2-year official GizmoGrid warranty on all chargers, hubs, and electronic gadgets. Cables and cases carry a 1-year warranty."
    },
    {
      question: "How long does shipping take?",
      answer: "Orders are processed within 24 hours. Delivery typically takes 2-3 business days for major cities, and 4-5 business days for remote areas."
    },
    {
      question: "Can I return a product if it doesn't fit my device?",
      answer: "Absolutely. We offer a 14-day hassle-free return and exchange policy as long as the packaging is intact. Check our Refund Policy for details."
    }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <div className="flex-grow flex items-center justify-center py-40">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-primary" />
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Loading GizmoGrid...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-900 text-white">
        <Header />
        <div className="flex-grow flex items-center justify-center px-4 py-32">
          <div className="max-w-md w-full text-center space-y-6 bg-neutral-800/80 border border-neutral-700/50 p-8 rounded-custom-3xl shadow-xl backdrop-blur-md">
            <div className="w-12 h-12 bg-red-950 border border-red-700/50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl font-black">
              !
            </div>
            <h2 className="font-display text-xl font-black tracking-tight text-white">Database Connection Failure</h2>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              We are unable to connect to the product database cluster. Checkout and store operations are disabled.
            </p>
            <div className="pt-3 border-t border-neutral-700/50 text-[10px] text-neutral-500 font-mono">
              {error}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((faq) => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />


      {/* Header */}
      <Header />

      {/* Main Content (with top padding to account for sticky header) */}
      <main className="flex-grow pt-8">
        
        {/* Hero Section */}
        <HeroBanner />

        {/* Features Spotlight Bar / COD & Delivery bar */}
        <section className="bg-neutral-900 text-white py-6 border-y border-neutral-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <div className="p-2 rounded-full bg-neutral-800 text-brand-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">Fast Delivery</p>
                  <p className="text-[10px] text-neutral-400">Shipped in 24 hours</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <div className="p-2 rounded-full bg-neutral-800 text-brand-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</p>
                  <p className="text-[10px] text-neutral-400">Pay at your doorstep</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <div className="p-2 rounded-full bg-neutral-800 text-brand-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">Authentic Products</p>
                  <p className="text-[10px] text-neutral-400">100% genuine brand warranty</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <div className="p-2 rounded-full bg-neutral-800 text-brand-primary">
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">24/7 Expert Support</p>
                  <p className="text-[10px] text-neutral-400">Get assistance anytime</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infinite Scrolling Category Marquee Section */}
        <section className="bg-neutral-50 py-8 overflow-hidden border-b border-neutral-200">
          <div className="relative w-full">
            {/* Styles for continuous marquee motion */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes marqueeContinuous {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-track {
                display: flex;
                width: max-content;
                animation: marqueeContinuous 30s linear infinite;
              }
              .marquee-track:hover {
                animation-play-state: paused;
              }
            `}} />

            <div className="marquee-track flex gap-6 px-4">
              {[...CATEGORIES_MARQUEE, ...CATEGORIES_MARQUEE].map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-4 bg-white border border-neutral-200/60 rounded-custom-xl p-3 w-64 shadow-sm flex-shrink-0 hover:shadow-md hover:border-neutral-300 transition-all duration-300 group"
                >
                  <div className="h-16 w-16 relative bg-neutral-50 rounded-custom-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-500"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-800">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Explore →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Shop By Category Section */}
        <section id="categories" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-end mb-8 border-b border-neutral-100 pb-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-900">
                  Shop by Category
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Specialized hardware for every environment.
                </p>
              </div>
              <Link href="/shop" className="text-xs sm:text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1 group">
                View all collections <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Large Spotlight category - Mobile */}
              <Link
                href="/shop?category=mobile-accessories"
                className="relative overflow-hidden rounded-custom-xl group border border-neutral-200/50 shadow-sm md:col-span-6 aspect-[4/3] md:aspect-auto md:h-full flex flex-col justify-end p-6 animate-fade-in-up stagger-delay-1"
              >
                <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/20 transition-colors z-10" />
                <Image
                  src="/images/cat-mobile.png"
                  alt="Mobile Accessories"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="relative z-20 text-white bg-neutral-950/60 backdrop-blur-sm p-4 rounded-custom-lg border border-white/10 max-w-xs">
                  <h3 className="font-display text-lg font-bold">Mobile Essentials</h3>
                  <p className="text-[11px] text-neutral-200 mt-1">The core of your digital life.</p>
                </div>
              </Link>

              {/* Smaller categories grid on right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:col-span-6 gap-6">
                
                {/* Computer */}
                <Link
                  href="/shop?category=computer-accessories"
                  className="relative overflow-hidden rounded-custom-xl group border border-neutral-200/50 shadow-sm aspect-square flex flex-col justify-end p-6 animate-fade-in-up stagger-delay-2"
                >
                  <div className="absolute inset-0 bg-neutral-900/15 group-hover:bg-neutral-900/25 transition-colors z-10" />
                  <Image
                    src="/images/cat-computer.png"
                    alt="Computer Accessories"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="relative z-20 text-white bg-neutral-950/60 backdrop-blur-sm p-3 rounded-custom-md border border-white/10">
                    <h3 className="font-display text-base font-bold">Computer</h3>
                  </div>
                </Link>

                {/* Audio */}
                <Link
                  href="/shop?category=earbuds"
                  className="relative overflow-hidden rounded-custom-xl group border border-neutral-200/50 shadow-sm aspect-square flex flex-col justify-end p-6 animate-fade-in-up stagger-delay-3"
                >
                  <div className="absolute inset-0 bg-neutral-900/15 group-hover:bg-neutral-900/25 transition-colors z-10" />
                  <Image
                    src="/images/cat-audio.png"
                    alt="Audio Accessories"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="relative z-20 text-white bg-neutral-950/60 backdrop-blur-sm p-3 rounded-custom-md border border-white/10">
                    <h3 className="font-display text-base font-bold">Audio</h3>
                  </div>
                </Link>

                {/* Smartwatches / Wearables */}
                <Link
                  href="/shop?category=smartwatches"
                  className="relative overflow-hidden rounded-custom-xl group border border-neutral-200/50 shadow-sm sm:col-span-2 aspect-[2/1] flex flex-col justify-end p-6 animate-fade-in-up stagger-delay-4"
                >
                  <div className="absolute inset-0 bg-neutral-900/15 group-hover:bg-neutral-900/25 transition-colors z-10" />
                  <Image
                    src="/images/cat-smartwatch.png"
                    alt="Smartwatches"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="relative z-20 text-white bg-neutral-950/60 backdrop-blur-sm p-3 rounded-custom-md border border-white/10 max-w-xs">
                    <h3 className="font-display text-base font-bold">Smartwatches</h3>
                  </div>
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-t border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-2 mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-900">
                Featured Innovation
              </h2>
              <p className="text-sm text-neutral-500 max-w-xl mx-auto">
                Selected performance hardware, rated by our engineering team for ultimate reliability.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product, idx) => (
                <div key={product._id || product.id} className={`animate-fade-in-up stagger-delay-${(idx % 4) + 1}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Best Sellers Section (NEW) */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-2 mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-900">
                Best Sellers
              </h2>
              <p className="text-sm text-neutral-500 max-w-xl mx-auto">
                Our most popular, community-approved gear flying off the shelves.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {bestSellers.map((product, idx) => (
                <div key={product._id || product.id} className={`animate-fade-in-up stagger-delay-${(idx % 4) + 1}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals Section (NEW) */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-t border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-2 mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-black text-neutral-900">
                New Arrivals
              </h2>
              <p className="text-sm text-neutral-500 max-w-xl mx-auto">
                Stay at the cutting edge of tech with our latest accessory releases.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product, idx) => (
                <div key={product._id || product.id} className={`animate-fade-in-up stagger-delay-${(idx % 4) + 1}`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Shop With Us Section (NEW) */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12 space-y-2">
              <h2 className="font-display text-3xl font-black text-neutral-900">
                Why Shop With Us
              </h2>
              <p className="text-sm text-neutral-500">
                Our core promises that set us apart from generic electronic storefronts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 bg-neutral-50 rounded-custom-xl border border-neutral-100">
                <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-bold text-neutral-900 mb-2">Engineered Quality</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Every product is crafted from aerospace-grade materials, durable composites, and components safety-tested under load.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 bg-neutral-50 rounded-custom-xl border border-neutral-100">
                <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
                  <Leaf className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-bold text-neutral-900 mb-2">Sustainably Sourced</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  We use 100% recyclable paper packaging, carbon-neutral shipping routes, and responsibly sourced components.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 bg-neutral-50 rounded-custom-xl border border-neutral-100">
                <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
                  <ArrowRightLeft className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-bold text-neutral-900 mb-2">14-Day Safe Returns</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Not compatible? Change your mind? Enjoy hassle-free returns and exchanges within 2 weeks of receiving your item.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center p-6 bg-neutral-50 rounded-custom-xl border border-neutral-100">
                <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-display text-base font-bold text-neutral-900 mb-2">2-Year Support</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Sleep soundly knowing all electronics are backed by our transparent 2-year replacement/parts warranty service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Parallax Lifestyle/Editorial Section */}
        <ParallaxFeature
          backgroundImage="/images/parallax-home.png"
          headline="The Art of the Desk Setup"
          description="Experience the synergy of form and function. Elevate your everyday workspace with design-forward accessories crafted for comfort and focus."
          ctaText="Explore the Look"
          ctaLink="/shop"
        />

        {/* Detailed Delivery & COD info (NEW) */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-t border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 gap-8 items-center bg-white rounded-custom-2xl border border-neutral-200 overflow-hidden shadow-sm">
              {/* Text */}
              <div className="lg:col-span-7 p-8 sm:p-12 space-y-6">
                <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                  Delivery Guarantee
                </Badge>
                <h2 className="font-display text-3xl font-black text-neutral-900 tracking-tight leading-none">
                  Cash on Delivery <br />
                  &amp; Express Shipping
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                  We understand that trust and speed are everything when ordering premium gear online. That is why we provide a complete delivery promise:
                </p>
                <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span><strong>No Advance Payment</strong>: Pay securely in cash only when the courier hands you the package.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span><strong>Tracking Enabled</strong>: You will receive an SMS and email notification with a live tracking link.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span><strong>Inspected Shipments</strong>: All order packages are sealed with high-grade tamper-evident tape.</span>
                  </li>
                </ul>
              </div>

              {/* Media graphic representative */}
              <div className="lg:col-span-5 relative h-64 lg:h-full min-h-[320px] bg-neutral-900 flex items-center justify-center text-white">
                <div className="absolute inset-0 bg-neutral-950/20 z-10" />
                <Image
                  src="/images/hero.png" // Reused
                  alt="Delivery composition"
                  fill
                  className="object-cover opacity-60"
                />
                <div className="relative z-20 text-center space-y-2 p-6">
                  <Truck className="h-12 w-12 text-brand-primary mx-auto animate-bounce" />
                  <h3 className="font-display text-xl font-bold">Standard 2-3 Day Delivery</h3>
                  <p className="text-xs text-neutral-300">Fast transit times to all major cities in Pakistan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GaN Charger Promotional Spotlight Banner */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-custom-2xl border border-neutral-200 bg-neutral-50 lg:grid lg:grid-cols-12 items-center p-8 sm:p-12 lg:p-16">
              
              {/* Content */}
              <div className="lg:col-span-7 space-y-6">
                <Badge variant="default" className="bg-brand-primary text-white">
                  Technology Spotlight
                </Badge>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-none">
                  Unleash the Power of <br />
                  <span className="text-brand-primary">GaN Technology</span>
                </h2>
                <p className="text-sm sm:text-base text-neutral-500 max-w-lg leading-relaxed">
                  Smaller, faster, and more efficient. Our new range of HyperCharge adapters keeps you powered up without the bulk. Made with premium flame-retardant safety shell design.
                </p>
                <div className="pt-2">
                  <Link href="/shop?category=chargers">
                    <Button variant="primary" className="h-12 px-6">
                      Shop All Chargers
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Promo image */}
              <div className="mt-12 lg:mt-0 lg:col-span-5 relative w-full aspect-square max-w-[400px] mx-auto rounded-custom-xl overflow-hidden shadow-lg border border-neutral-200/80 bg-white">
                <Image
                  src="/images/gan-charger.png"
                  alt="GaN Charger Close-up"
                  fill
                  className="object-cover"
                />
              </div>

            </div>
          </div>
        </section>

        {/* Product Bundles Section */}
        <section className="py-16 bg-neutral-900 text-white px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary">
                  Limited Edition
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight leading-none">
                  The Clean Desk <br />Bundle Pack
                </h2>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Complete your workspace layout with our design-coordinated set. Includes the TactileAir Keyboard, Precision Mouse X1, and Nexus Hub.
                </p>
                <div className="border-t border-neutral-800 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Retail Price</span>
                    <span className="line-through">$347.00</span>
                  </div>
                  <div className="flex justify-between text-base font-bold">
                    <span>Bundle Price (Save 15%)</span>
                    <span className="text-brand-primary text-lg">$295.00</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="primary" className="h-12 w-full lg:w-auto px-8">
                    Claim Bundle
                  </Button>
                </div>
              </div>

              <div className="mt-8 lg:mt-0 lg:col-span-7 grid grid-cols-3 gap-4">
                <div className="aspect-square bg-neutral-800 rounded-custom-lg border border-neutral-700/50 p-2 relative overflow-hidden flex items-center justify-center">
                  <Image src="/images/prod-keyboard.png" alt="Keyboard" fill className="object-cover opacity-80" />
                </div>
                <div className="aspect-square bg-neutral-800 rounded-custom-lg border border-neutral-700/50 p-2 relative overflow-hidden flex items-center justify-center">
                  <Image src="/images/hero.png" alt="Mouse" fill className="object-cover opacity-80" />
                </div>
                <div className="aspect-square bg-neutral-800 rounded-custom-lg border border-neutral-700/50 p-2 relative overflow-hidden flex items-center justify-center">
                  <Image src="/images/cat-computer.png" alt="Hub" fill className="object-cover opacity-80" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Community Favorites Row Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-200">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-900">
                Community Favorites
              </h2>
              <div className="flex gap-2">
                <button className="h-9 w-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary" aria-label="Previous favorited item">
                  ←
                </button>
                <button className="h-9 w-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary" aria-label="Next favorited item">
                  →
                </button>
              </div>
            </div>

            {/* Flat List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communityFavorites.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-custom-xl border border-neutral-100 hover:border-neutral-200 shadow-sm transition-all bg-white"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-custom-lg bg-neutral-50 border border-neutral-150">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">{item.name}</h4>
                    <p className="text-sm font-semibold text-brand-primary mt-0.5">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center space-y-2 mb-12">
              <h2 className="font-display text-3xl font-black text-neutral-900">
                Trusted by Innovators
              </h2>
              <p className="text-sm text-neutral-500">
                Here is what creative professionals and developers say about GizmoGrid.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((rev, idx) => (
                <Card key={idx} className="bg-white p-6 flex flex-col justify-between">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm italic text-neutral-600 leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  </CardContent>
                  <div className="border-t border-neutral-100 pt-4 mt-6 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{rev.name}</h4>
                      <p className="text-[10px] text-neutral-400">{rev.role}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Logos Row Section */}
        <section className="py-10 border-t border-b border-neutral-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-8 opacity-40">
              <span className="font-display text-sm font-black tracking-widest uppercase" tabIndex={0}>NOMAD</span>
              <span className="font-display text-sm font-black tracking-widest uppercase" tabIndex={0}>NATIVE UNION</span>
              <span className="font-display text-sm font-black tracking-widest uppercase" tabIndex={0}>UGMONK</span>
              <span className="font-display text-sm font-black tracking-widest uppercase" tabIndex={0}>BELLROY</span>
              <span className="font-display text-sm font-black tracking-widest uppercase" tabIndex={0}>APPLE</span>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-neutral-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-neutral-200 rounded-custom-lg overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-neutral-900 hover:bg-neutral-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    aria-expanded={activeFaq === index}
                  >
                    <span>{faq.question}</span>
                    <span className="text-neutral-400 font-normal text-lg leading-none" aria-hidden="true">
                      {activeFaq === index ? "−" : "+"}
                    </span>
                  </button>
                  {activeFaq === index && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-500 border-t border-neutral-100 leading-relaxed bg-neutral-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Our Community Newsletter Section */}
        <section className="relative w-full h-[380px] sm:h-[420px] overflow-hidden flex items-center justify-center">
          {/* Background image */}
          <Image
            src="/images/parallax-home.png"
            alt="Join our community backdrop"
            fill
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-neutral-950/70 z-0" />

          {/* Centered Content Card */}
          <div className="relative z-10 text-center max-w-2xl px-6 space-y-6">
            <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-[0.2em] text-white leading-none">
              Join Our Community
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mx-auto">
              Subscribe to receive first time brand update, access to exclusive deals, and 15% off your first order.
            </p>

            <form
              className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for joining our community! Code: GIZMO15 has been sent to your email.");
              }}
            >
              <input
                type="email"
                required
                placeholder="Your e-mail"
                className="w-full sm:w-64 bg-white border border-transparent text-sm px-4 py-2.5 text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
                type="submit"
                className="bg-white hover:bg-neutral-100 text-black text-xs font-extrabold uppercase tracking-widest px-8 py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md self-center sm:self-auto"
              >
                <span>Subscribe</span>
                <span className="text-sm">→</span>
              </button>
            </form>
          </div>
        </section>

      </main>

      {/* Floating WhatsApp Widget */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 duration-200 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label="Contact support on WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* Footer */}
      <Footer />
    </div>
  );
}
