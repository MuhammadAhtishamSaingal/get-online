"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Cloudinary optimization helper
function getOptimizedImageUrl(url: string, width: number, height: number): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com")) {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex !== -1) {
      const beforeUpload = url.substring(0, uploadIndex + 8);
      const afterUpload = url.substring(uploadIndex + 8);
      const transformation = `c_fill,g_auto,w_${width},h_${height},q_auto,f_auto/`;
      return `${beforeUpload}${transformation}${afterUpload}`;
    }
  }
  return url;
}

const SLIDES = [
  {
    image: "/images/cat-smartwatch.png",
    caption: "GO FURTHER. MOVE FREER.",
    headline: "Active Sport Loop",
    ctaText: "Shop Now",
    ctaLink: "/shop?category=smartwatches",
  },
  {
    image: "/images/hero.png",
    caption: "ENGINEERED FOR PRECISION.",
    headline: "Precision Mouse X1",
    ctaText: "Shop Now",
    ctaLink: "/shop?search=Mouse",
  },
  {
    image: "/images/prod-keyboard.png",
    caption: "DESIGNED TO INSPIRE.",
    headline: "TactileAir Keyboard",
    ctaText: "Shop Now",
    ctaLink: "/shop?category=computer-accessories",
  },
  {
    image: "/images/prod-buds.png",
    caption: "IMMERSIVE AUDIO EXPERIENCE.",
    headline: "SonicWave Buds Pro",
    ctaText: "Shop Now",
    ctaLink: "/shop?category=earbuds",
  },
  {
    image: "/images/gan-charger.png",
    caption: "NEXT-GEN POWER DELIVERY.",
    headline: "HyperCharge GaN",
    ctaText: "Shop Now",
    ctaLink: "/shop?category=chargers",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = React.useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  // Detect prefers-reduced-motion
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialMatch = mediaQuery.matches;
    
    // Set state asynchronously to avoid synchronous cascading renders linter error
    const timeoutId = setTimeout(() => {
      setPrefersReducedMotion(initialMatch);
    }, 0);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => {
      clearTimeout(timeoutId);
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  // Slide rotation interval - resets whenever current slide changes
  React.useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5500); // auto-advance every 5.5 seconds

    return () => clearInterval(interval);
  }, [current, prefersReducedMotion]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const handleDotClick = (idx: number) => {
    setCurrent(idx);
  };

  const getSlideClass = (idx: number, activeIdx: number, total: number) => {
    if (idx === activeIdx) return "slide-active";
    let isPrev = idx < activeIdx;
    if (activeIdx === 0 && idx === total - 1) {
      isPrev = true;
    } else if (activeIdx === total - 1 && idx === 0) {
      isPrev = false;
    }
    return isPrev ? "slide-inactive-prev" : "slide-inactive-next";
  };

  return (
    <section
      className="relative w-full h-[calc(100vh-2rem)] h-[calc(100dvh-2rem)] min-h-[380px] bg-neutral-950 overflow-hidden group banner-perspective"
    >
      {/* 3D Flip Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .banner-perspective {
          perspective: 2000px;
        }
        .slide-3d {
          backface-visibility: hidden;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-in-out;
        }
        .slide-active {
          transform: rotateY(0deg) scale(1);
          opacity: 1;
          z-index: 10;
        }
        .slide-inactive-next {
          transform: rotateY(180deg) scale(0.95);
          opacity: 0;
          z-index: 0;
          pointer-events: none;
        }
        .slide-inactive-prev {
          transform: rotateY(-180deg) scale(0.95);
          opacity: 0;
          z-index: 0;
          pointer-events: none;
        }
      `}} />

      {SLIDES.map((slide, idx) => {
        const isActive = idx === current;
        return (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 w-full h-full",
              prefersReducedMotion
                ? (isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")
                : `slide-3d ${getSlideClass(idx, current, SLIDES.length)}`
            )}
          >
            {/* Background image */}
            <Image
              src={getOptimizedImageUrl(slide.image, 1920, 1080)}
              alt={slide.headline}
              fill
              priority={idx === 0}
              className="object-cover"
              sizes="100vw"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-transparent to-neutral-950/60 z-0" />

            {/* Content overlay */}
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
              <div className="max-w-4xl space-y-4 md:space-y-6">
                <span
                  className={cn(
                    "block text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/90 transform transition-all duration-700",
                    prefersReducedMotion
                      ? "opacity-100"
                      : isActive
                      ? "opacity-100 translate-y-0 delay-200"
                      : "opacity-0 translate-y-4 duration-300 delay-0"
                  )}
                >
                  {slide.caption}
                </span>
                <h2
                  className={cn(
                    "font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-none transform transition-all duration-700",
                    prefersReducedMotion
                      ? "opacity-100"
                      : isActive
                      ? "opacity-100 translate-y-0 delay-400"
                      : "opacity-0 translate-y-6 duration-300 delay-0"
                  )}
                >
                  {slide.headline}
                </h2>
                <div
                  className={cn(
                    "pt-2 md:pt-4 transform transition-all duration-700",
                    prefersReducedMotion
                      ? "opacity-100"
                      : isActive
                      ? "opacity-100 translate-y-0 delay-600"
                      : "opacity-0 translate-y-4 duration-300 delay-0"
                  )}
                >
                  <Link href={slide.ctaLink}>
                    <button className="rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-900 transition-all duration-300 hover:scale-105 hover:bg-neutral-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2">
                      {slide.ctaText}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Edge arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {SLIDES.map((_, idx) => {
          const isActive = idx === current;
          return (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={cn(
                "relative h-4 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer transition-all ease-out duration-500",
                isActive ? "w-16" : "w-8"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {/* Background Track */}
              <div className="w-full h-[2px] bg-white/30 rounded-full overflow-hidden relative">
                {/* Active progress fill */}
                {isActive && !prefersReducedMotion && (
                  <div
                    key={current}
                    className="absolute inset-y-0 left-0 bg-white origin-left w-full animate-progress"
                    style={{
                      animation: "slide-progress 5500ms linear forwards",
                    }}
                  />
                )}
                {/* Static full fill if active but prefersReducedMotion is enabled */}
                {isActive && prefersReducedMotion && (
                  <div className="absolute inset-0 bg-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </section>
  );
}
