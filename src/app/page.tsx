"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import {
  Lock,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [secretContent, setSecretContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. Get logged in user (if any)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 2. Insert into Supabase
      const { data, error } = await supabase
        .from("deliveries")
        .insert({
          title,
          description: description || null,
          amount: parseFloat(amount),
          currency: "INR",
          secret_content: secretContent,
          client_email: clientEmail || null,
          user_id: user?.id || null, // Creator account se attach hoga
        })
        .select("id")
        .single();

      if (error) throw error;

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setGeneratedUrl(`${origin}/pay/${data.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to create milestone link. Please check database connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAmount("");
    setClientEmail("");
    setSecretContent("");
    setGeneratedUrl(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Hero & Explainer */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
            Pay-Before-Download for Creators & Freelancers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Lock deliverables behind a paywall.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Get paid first.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            {siteConfig.tagline}
          </p>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-500/20">
                1
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Lock Files</h3>
              <p className="text-xs text-slate-400">Add Drive link, zip URL, or project access notes.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-500/20">
                2
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Share Paywall</h3>
              <p className="text-xs text-slate-400">Send unique secure link directly to your client.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3 border border-emerald-500/20">
                3
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Auto Unlock</h3>
              <p className="text-xs text-slate-400">Client pays ₹ amount, files instantly unlock.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Creation Form / Success Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            {generatedUrl ? (
              /* Success State */
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Milestone Locked!</h2>
                  <p className="text-xs text-slate-400">Share this paywall link with your client</p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 break-all select-all text-left">
                  {generatedUrl}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={generatedUrl}
                    target="_blank"
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-slate-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Preview Link</span>
                  </Link>
                </div>

                <button
                  onClick={resetForm}
                  className="text-xs text-slate-400 hover:text-white transition underline underline-offset-4"
                >
                  Create another milestone
                </button>
              </div>
            ) : (
              /* Creation Form */
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-1">Create Locked Delivery</h2>
                  <p className="text-xs text-slate-400">
                    Amount is charged in {siteConfig.currencyCode} ({siteConfig.currencySymbol})
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Project Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Brand Identity Assets — Phase 2"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Description / Scope
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What deliverables are included inside this milestone..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Amount ({siteConfig.currencySymbol})
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="5000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Client Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@company.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Secret Content (Locked behind paywall)
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={secretContent}
                      onChange={(e) => setSecretContent(e.target.value)}
                      placeholder="Paste Google Drive folder URL, Dropbox link, or private Figma file..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Lock & Generate Paywall Link</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}