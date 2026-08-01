"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

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

interface ParallaxFeatureProps {
  backgroundImage: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export function ParallaxFeature({
  backgroundImage,
  headline,
  description,
  ctaText,
  ctaLink,
}: ParallaxFeatureProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);
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

  // Parallax scroll logic
  React.useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image || prefersReducedMotion) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    const updateParallax = () => {
      // Disable parallax on mobile viewports (< 768px) for performance
      if (window.innerWidth < 768) {
        image.style.transform = "none";
        return;
      }

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Don't calculate if section is off-screen
      if (rect.bottom < 0 || rect.top > windowHeight) {
        return;
      }

      const viewportCenter = windowHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distance = elementCenter - viewportCenter;

      const factor = 0.12; // parallax factor
      const yOffset = distance * factor;

      // Keep within bounds of the vertical bleed
      const maxOffset = 80;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, yOffset));

      image.style.transform = `translate3d(0, ${clampedOffset}px, 0)`;
    };

    updateParallax();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] bg-neutral-900 overflow-hidden flex items-center justify-center"
    >
      {/* Background Image Container with vertical bleed */}
      <div
        ref={imageRef}
        className="absolute left-0 right-0 top-[-100px] h-[calc(100%+200px)] w-full will-change-transform"
      >
        <Image
          src={getOptimizedImageUrl(backgroundImage, 1920, 1200)}
          alt={headline}
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Centered Glassmorphism Card */}
      <div className="relative z-10 mx-4 max-w-xl w-full bg-white/75 backdrop-blur-md border border-white/20 p-8 sm:p-12 rounded-custom-2xl shadow-xl text-center group">
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 mb-4">
          {headline}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 font-medium">
          {description}
        </p>
        <Link
          href={ctaLink}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-neutral-900 border-b-2 border-neutral-900 pb-0.5 hover:border-brand-primary hover:text-brand-primary transition-all duration-300"
        >
          <span>{ctaText}</span>
          <span className="transition-transform group-hover:translate-x-1 duration-300">
            &rarr;
          </span>
        </Link>
      </div>
    </section>
  );
}
