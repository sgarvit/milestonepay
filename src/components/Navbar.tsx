"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import { ShieldCheck, LogOut, LayoutDashboard } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span>{siteConfig.name}</span>
        </Link>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Creator Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}