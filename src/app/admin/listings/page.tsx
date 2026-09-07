"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Home, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/listings");
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error("Error loading listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleToggleActive = async (listingId: string, currentActive: boolean) => {
    await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, isActive: !currentActive }),
    });
    fetchListings();
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    await fetch(`/api/admin/listings?id=${listingId}`, { method: "DELETE" });
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-white">
      <AdminSidebar />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-h-screen">
        <div>
          <h1 className="text-2xl font-black">Room Listings Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted property listings, remove fraudulent entries, and manage visibility
          </p>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Rent</th>
                  <th className="p-4">Host</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading listings...</td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No room listings in database yet.</td>
                  </tr>
                ) : (
                  listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-white block">{l.title}</span>
                          <span className="text-[11px] text-slate-400">
                            {l.roomType} • {l.housingType}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold">{l.locality}</span>
                        <span className="text-[11px] text-slate-400 block">{l.city}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-emerald-400">{formatINR(l.monthlyRent)}</span>
                        <span className="text-[11px] text-slate-400 block">Dep: {formatINR(l.securityDeposit)}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold">{l.user.fullName}</span>
                        <span className="text-[11px] text-slate-400 block">{l.user.email}</span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          l.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                        }`}>
                          {l.isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/rooms/${l.id}`}
                          target="_blank"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-[11px] rounded-lg font-semibold inline-flex items-center space-x-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <button
                          onClick={() => handleToggleActive(l.id, l.isActive)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${
                            l.isActive ? "bg-amber-600/20 text-amber-300" : "bg-emerald-600/20 text-emerald-300"
                          }`}
                        >
                          {l.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(l.id)}
                          className="p-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-300 rounded-lg"
                          title="Delete fraudulent listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
