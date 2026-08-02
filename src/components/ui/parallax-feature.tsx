"use client";

import * as React from "react";
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
  const optimizedUrl = getOptimizedImageUrl(backgroundImage, 1920, 1200);

  return (
    <section
      className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] bg-neutral-900 overflow-hidden flex items-center justify-center"
    >
      {/* Background Image Container using CSS parallax background-attachment */}
      <div
        className="absolute inset-0 w-full h-full bg-fixed bg-center bg-no-repeat bg-cover transition-all duration-300 motion-reduce:bg-scroll"
        style={{ backgroundImage: `url('${optimizedUrl}')` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/45" />
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

