"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import {
  Plus,
  ExternalLink,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  DollarSign,
  Lock,
  Layers,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Delivery {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  is_paid: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("deliveries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDeliveries(data as Delivery[]);
      }
      setLoading(false);
    }

    loadData();
  }, [router]);

  const copyToClipboard = (id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalEarned = deliveries
    .filter((d) => d.is_paid)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const paidCount = deliveries.filter((d) => d.is_paid).length;
  const pendingCount = deliveries.filter((d) => !d.is_paid).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading creator workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Creator Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Logged in as <span className="text-emerald-400 font-medium">{user?.email}</span>
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Milestone</span>
          </Link>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              ₹{totalEarned.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Successfully cleared payments</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Paid Milestones</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{paidCount}</div>
            <p className="text-xs text-slate-500 mt-1">Files unlocked by clients</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Paywalls</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">{pendingCount}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting client payment</p>
          </div>
        </div>

        {/* Milestones Data Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              Your Created Milestones
            </h2>
            <span className="text-xs text-slate-500">{deliveries.length} total</span>
          </div>

          {deliveries.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-500 mb-4 border border-slate-700/50">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No milestones created yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Lock your project deliverables and share the secure paywall link with your client.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                <Plus className="h-4 w-4" />
                Create your first milestone
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                  <tr>
                    <th className="px-6 py-3.5 font-semibold">Milestone / Title</th>
                    <th className="px-6 py-3.5 font-semibold">Amount</th>
                    <th className="px-6 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Created</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deliveries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-200">
                        ₹{Number(item.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {item.is_paid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(item.id)}
                            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 transition"
                            title="Copy Paywall Link"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <Link
                            href={`/pay/${item.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
                            title="Preview Client Page"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}