"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  Users,
  Home,
  HeartHandshake,
  MessageSquare,
  ShieldAlert,
  BadgeCheck,
  TrendingUp,
  AlertCircle,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load admin analytics");
      setStats(data.stats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const COLORS = ["#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-slate-950 flex text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Platform Analytics & Governance</h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time telemetry and moderation metrics computed directly from database tables
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Live Database Connected
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/50 text-rose-300 border border-rose-900 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-32 bg-slate-900 rounded-3xl border border-slate-800" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Total Registered Users
                  </span>
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats?.totalUsers || 0}</div>
                <p className="text-[11px] text-slate-400">
                  {stats?.usersByRole?.user || 0} Standard Users • {stats?.usersByRole?.admin || 0} Administrators
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Real Room Listings
                  </span>
                  <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                    <Home className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats?.totalListings || 0}</div>
                <p className="text-[11px] text-slate-400">Active rooms posted by verified hosts</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mutual Matches Formed
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats?.totalMatches || 0}</div>
                <p className="text-[11px] text-slate-400">Compatible living matches created</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Active Conversations
                  </span>
                  <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats?.totalConversations || 0}</div>
                <p className="text-[11px] text-slate-400">Real-time messaging threads</p>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Safety Reports
                  </span>
                  <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats?.totalReports || 0}</div>
                <p className="text-[11px] text-rose-400 font-semibold">
                  {stats?.pendingReports || 0} Pending moderation review
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pending Verifications
                  </span>
                  <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black">{stats?.pendingVerifications || 0}</div>
                <p className="text-[11px] text-amber-400 font-semibold">Student badges awaiting review</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* City distribution */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  User Distribution by City
                </h3>
                {stats?.cityDistribution?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-12 text-center">No city data available yet.</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.cityDistribution || []}>
                        <XAxis dataKey="city" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px" }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Gender ratio */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Gender Ratio (Mutual Comfort Compatibility)
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center pt-8">
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="text-xs text-slate-400 block">Male</span>
                    <span className="text-2xl font-black text-indigo-400">{stats?.usersByGender?.male || 0}</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="text-xs text-slate-400 block">Female</span>
                    <span className="text-2xl font-black text-pink-400">{stats?.usersByGender?.female || 0}</span>
                  </div>
                  <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                    <span className="text-xs text-slate-400 block">Other / Undisclosed</span>
                    <span className="text-2xl font-black text-emerald-400">{stats?.usersByGender?.other || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
