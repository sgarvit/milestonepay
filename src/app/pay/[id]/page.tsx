"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  BadgeCheck,
  ExternalLink,
  FileLock2,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { supabase, type Delivery } from "@/lib/supabase";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function fireConfetti() {
  void confetti({
    particleCount: 140,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#34d399", "#fbbf24", "#22d3ee", "#f8fafc"],
  });
}

export default function PayPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const celebrated = useRef(false);

  const loadDelivery = useCallback(async () => {
    if (!id) {
      setStatus("missing");
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      setDelivery(null);
      setError(fetchError.message);
      setStatus("error");
      return;
    }

    if (!data) {
      setDelivery(null);
      setStatus("missing");
      return;
    }

    setError(null);
    setDelivery(data as Delivery);
    setStatus("ready");
  }, [id]);

  useEffect(() => {
    void loadDelivery();
  }, [loadDelivery]);

  useEffect(() => {
    if (status === "ready" && delivery?.is_paid && !celebrated.current) {
      celebrated.current = true;
      fireConfetti();
    }
  }, [delivery?.is_paid, status]);

  async function handlePay() {
    if (!id || !delivery) return;
    setError(null);
    setIsPaying(true);

    const { data, error: updateError } = await supabase
      .from("deliveries")
      .update({ is_paid: true })
      .eq("id", id)
      .select()
      .single();

    setIsPaying(false);

    if (updateError || !data) {
      setError(updateError?.message ?? "Payment could not be recorded. Try again.");
      return;
    }

    setDelivery(data as Delivery);
  }

  return (
    <div className="relative min-h-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </span>
            <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {status === "loading" ? <PaySkeleton /> : null}

        {status === "error" ? (
          <div className="rounded-3xl border border-rose-500/30 bg-slate-900/70 p-10 text-center">
            <FileLock2 className="mx-auto h-10 w-10 text-rose-300" />
            <h1 className="mt-4 text-2xl font-semibold text-white">Could not load milestone</h1>
            <p className="mt-2 text-sm text-slate-400">{error ?? "Check your Supabase configuration and try again."}</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:border-slate-500"
            >
              Back to {siteConfig.name}
            </Link>
          </div>
        ) : null}

        {status === "missing" ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center">
            <FileLock2 className="mx-auto h-10 w-10 text-slate-500" />
            <h1 className="mt-4 text-2xl font-semibold text-white">Milestone Not Found</h1>
            <p className="mt-2 text-sm text-slate-400">
              This paywall link is invalid or the delivery was removed.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 hover:border-slate-500"
            >
              Back to {siteConfig.name}
            </Link>
          </div>
        ) : null}

        {status === "ready" && delivery && !delivery.is_paid ? (
          <LockedCard
            delivery={delivery}
            isPaying={isPaying}
            error={error}
            onPay={handlePay}
          />
        ) : null}

        {status === "ready" && delivery?.is_paid ? (
          <UnlockedCard delivery={delivery} />
        ) : null}
      </main>
    </div>
  );
}

function PaySkeleton() {
  return (
    <div className="animate-pulse space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
      <div className="h-6 w-40 rounded-full bg-slate-800" />
      <div className="h-8 w-3/4 rounded-lg bg-slate-800" />
      <div className="h-20 rounded-2xl bg-slate-800" />
      <div className="h-12 rounded-xl bg-slate-800" />
    </div>
  );
}

function LockedCard({
  delivery,
  isPaying,
  error,
  onPay,
}: {
  delivery: Delivery;
  isPaying: boolean;
  error: string | null;
  onPay: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_0_80px_rgba(251,191,36,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.35)]">
          <Lock className="h-3.5 w-3.5" />
          Payment Pending
        </span>
        <p className="text-sm text-slate-500">Powered by {siteConfig.name}</p>
      </div>

      <div className="mt-8 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
          <Lock className="h-7 w-7 text-amber-300" />
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{delivery.title}</h1>
          {delivery.description ? (
            <p className="mt-2 text-sm leading-6 text-slate-400">{delivery.description}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-400">Amount to pay</p>
      <p className="text-4xl font-semibold text-white">
        {siteConfig.currencySymbol}
        {delivery.amount.toLocaleString("en-IN")}
      </p>

      <div className="relative mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <div className="select-none blur-md">
          <p className="font-mono text-sm text-slate-300">https://drive.google.com/secret-files-••••</p>
          <p className="mt-2 text-sm text-slate-400">
            Final assets, source files, and download credentials are sealed until payment.
          </p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
          <p className="rounded-full border border-slate-700 bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-300">
            Deliverables safely locked
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onPay}
        disabled={isPaying}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_32px_rgba(251,191,36,0.35)] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPaying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing test payment…
          </>
        ) : (
          <>
            Pay {siteConfig.currencySymbol}
            {delivery.amount.toLocaleString("en-IN")} to Unlock Files
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">MVP test mode — no live gateway charge.</p>
    </div>
  );
}

function UnlockedCard({ delivery }: { delivery: Delivery }) {
  const href = isHttpUrl(delivery.secret_content) ? delivery.secret_content.trim() : null;

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-8 shadow-[0_0_80px_rgba(16,185,129,0.12)]">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
        <BadgeCheck className="h-3.5 w-3.5" />
        Payment Verified
      </span>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">{delivery.title}</h1>
      {delivery.description ? (
        <p className="mt-2 text-sm leading-6 text-slate-400">{delivery.description}</p>
      ) : null}

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Secret content</p>
        <p className="mt-2 whitespace-pre-wrap break-all font-mono text-sm leading-6 text-emerald-100">
          {delivery.secret_content}
        </p>
      </div>

      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          <ExternalLink className="h-4 w-4" />
          Open / Download Deliverables
        </a>
      ) : (
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(delivery.secret_content)}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
        >
          Open / Download Deliverables
        </button>
      )}
    </div>
  );
}
