import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "GizmoGrid | Premium Tech & Lifestyle Accessories",
    template: "%s | GizmoGrid",
  },
  description: "Shop premium design-forward mobile accessories, computer accessories, charging gadgets, and everyday lifestyle essentials at GizmoGrid.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GizmoGrid | Premium Tech & Lifestyle Accessories",
    description: "Shop premium design-forward mobile accessories, computer accessories, charging gadgets, and everyday lifestyle essentials at GizmoGrid.",
    url: "/",
    siteName: "GizmoGrid",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GizmoGrid | Premium Tech & Lifestyle Accessories",
    description: "Shop premium design-forward mobile accessories, computer accessories, charging gadgets, and everyday lifestyle essentials at GizmoGrid.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-neutral-900 bg-white selection:bg-brand-primary/10 selection:text-brand-primary">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
