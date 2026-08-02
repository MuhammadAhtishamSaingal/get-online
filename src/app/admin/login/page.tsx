"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, EyeOff, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Check if already authenticated on mount
  React.useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (data.authenticated) {
          router.replace("/admin/dashboard");
        }
      } catch {
        // Fail silently
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in both administrative fields.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast("Authentication successful! Welcome to the panel.", "success");
        // Force instant redirect
        window.location.href = "/admin/dashboard";
      } else {
        showToast(data.error || "Invalid administrator credentials.", "error");
      }
    } catch {
      showToast("Connection failure during login attempt.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#0B0F19] overflow-hidden px-4">
      {/* Decorative Neon Spheres */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none animate-pulse duration-5000" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse duration-7000" />

      {/* Login Card Panel */}
      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-custom-3xl shadow-2xl flex flex-col items-center">
        {/* Shield Icon Logo */}
        <div className="h-14 w-14 rounded-custom-2xl bg-gradient-to-tr from-brand-primary to-indigo-600 flex items-center justify-center text-white shadow-lg mb-6 ring-4 ring-brand-primary/20">
          <ShieldCheck className="h-7 w-7" />
        </div>

        {/* Headings */}
        <h1 className="font-display text-2xl font-black text-white tracking-tight mb-1 text-center">
          Get Online Command
        </h1>
        <p className="text-xs text-neutral-400 font-medium mb-8 text-center uppercase tracking-wider">
          Store Management Console
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wider pl-1">
              Admin Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rehanmuhammad546@gmail.com"
                className="w-full h-11 text-xs rounded-custom-xl border border-white/10 bg-white/[0.05] pl-10 pr-4 text-white placeholder-neutral-500 focus:border-brand-primary focus:bg-white/[0.08] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-300 uppercase tracking-wider pl-1">
              Passphrase
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 text-xs rounded-custom-xl border border-white/10 bg-white/[0.05] pl-10 pr-10 text-white placeholder-neutral-500 focus:border-brand-primary focus:bg-white/[0.08] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center h-11 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-brand-primary to-indigo-600 hover:from-brand-primary/95 hover:to-indigo-600/95 border-none shadow-md"
              isLoading={isLoading}
            >
              Sign In to Console
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
