"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Users, Home, Trash2, EyeOff, RotateCcw, ShieldCheck } from "lucide-react";
import { RoomCard } from "@/components/rooms/RoomCard";
import Link from "next/link";

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<"rooms" | "users" | "hidden">("rooms");
  const [savedRooms, setSavedRooms] = useState<any[]>([]);
  const [savedUsers, setSavedUsers] = useState<any[]>([]);
  const [hiddenUsers, setHiddenUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unhidingId, setUnhidingId] = useState<string | null>(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const [rRes, uRes, hRes] = await Promise.all([
        fetch("/api/saved/rooms"),
        fetch("/api/saved/users"),
        fetch("/api/matching/dismiss"),
      ]);

      const rData = await rRes.json();
      const uData = await uRes.json();
      const hData = await hRes.json();

      setSavedRooms(rData.savedRooms || []);
      setSavedUsers(uData.savedUsers || []);
      setHiddenUsers(hData.hiddenUsers || []);
    } catch (err) {
      console.error("Error loading saved items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnhide = async (targetUserId: string) => {
    setUnhidingId(targetUserId);
    try {
      const res = await fetch("/api/matching/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action: "UNHIDE" }),
      });
      if (res.ok) {
        setHiddenUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      }
    } catch (err) {
      console.error("Failed to unhide user:", err);
    } finally {
      setUnhidingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <Bookmark className="w-6 h-6 text-indigo-600" />
            <span>Saved & Preferences</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bookmarked rooms, saved roommates, and hidden profiles
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "rooms"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Saved Rooms ({savedRooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "users"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Saved Roommates ({savedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hidden")}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === "hidden"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <EyeOff className="w-4 h-4" />
            <span>Hidden Roommates ({hiddenUsers.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === "rooms" ? (
        savedRooms.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Home className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold">No saved room listings yet</h3>
            <p className="text-xs text-slate-500">Click the bookmark icon on any room listing to save it here.</p>
            <Link href="/rooms" className="inline-block mt-2 text-xs font-bold text-indigo-600">
              Browse Rooms →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRooms.map((room) => (
              <RoomCard key={room.id} listing={room} isSaved={true} />
            ))}
          </div>
        )
      ) : activeTab === "users" ? (
        savedUsers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold">No saved roommate profiles</h3>
            <p className="text-xs text-slate-500">Bookmark potential roommates during match discovery.</p>
            <Link href="/discover" className="inline-block mt-2 text-xs font-bold text-indigo-600">
              Find Roommates →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{u.fullName}</h4>
                    <p className="text-xs text-slate-500">{u.city}</p>
                  </div>
                </div>
                <Link
                  href={`/discover`}
                  className="block text-center py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold"
                >
                  View Match Breakdown
                </Link>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Hidden Roommates Tab */
        hiddenUsers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <EyeOff className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold">No hidden roommates</h3>
            <p className="text-xs text-slate-500">
              When you click "Hide (Never Show Again)" on a roommate card, they will appear here and stay hidden from your Discover feed.
            </p>
            <Link href="/discover" className="inline-block mt-2 text-xs font-bold text-indigo-600">
              Find Roommates →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hiddenUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-base uppercase shrink-0">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      u.fullName?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{u.fullName}</h4>
                    <p className="text-xs text-slate-500">{u.city}{u.profile?.preferredArea ? ` • ${u.profile.preferredArea}` : ""}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {u.profile?.occupationStatus === "STUDENT"
                        ? u.profile.collegeName || "Student"
                        : u.profile?.companyName || "Working Professional"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">Hidden from Discover</span>
                  <button
                    type="button"
                    onClick={() => handleUnhide(u.id)}
                    disabled={unhidingId === u.id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{unhidingId === u.id ? "Restoring..." : "Unhide & Restore"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
