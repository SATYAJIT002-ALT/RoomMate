"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ShieldAlert, Check, X, Eye } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReport = async (reportId: string, status: string) => {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    fetchReports();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-h-screen">
        <div>
          <h1 className="text-2xl font-black">Safety & Harassment Reports</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review community safety reports filed against suspicious profiles or listings
          </p>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Report Details</th>
                  <th className="p-4">Reported Target</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading safety reports...</td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No reports filed yet. Platform is clean.</td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <span className="font-bold text-white block">{r.reason}</span>
                        <span className="text-[11px] text-slate-400 block max-w-xs line-clamp-2 mt-0.5">
                          {r.description}
                        </span>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Filed {formatRelativeTime(r.createdAt)}
                        </span>
                      </td>

                      <td className="p-4">
                        {r.reportedUser ? (
                          <div>
                            <span className="font-semibold text-rose-400 block">User: {r.reportedUser.fullName}</span>
                            <span className="text-[11px] text-slate-400">{r.reportedUser.email}</span>
                          </div>
                        ) : r.reportedListing ? (
                          <div>
                            <span className="font-semibold text-amber-400 block">Listing: {r.reportedListing.title}</span>
                            <span className="text-[11px] text-slate-400">{r.reportedListing.locality}, {r.reportedListing.city}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">General Report</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="font-semibold">{r.reporter.fullName}</span>
                        <span className="text-[11px] text-slate-400 block">{r.reporter.email}</span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          r.status === "PENDING"
                            ? "bg-rose-500/20 text-rose-300"
                            : r.status === "RESOLVED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {r.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleUpdateReport(r.id, "RESOLVED")}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                            >
                              Resolve & Sanction
                            </button>
                            <button
                              onClick={() => handleUpdateReport(r.id, "DISMISSED")}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[11px] font-bold"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
