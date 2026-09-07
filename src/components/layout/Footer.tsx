import React from "react";
import Link from "next/link";
import { Users, ShieldAlert, Heart, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 mt-auto transition-colors">
      {/* Safety Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center space-x-3 text-amber-900 dark:text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="font-semibold">Safety Notice:</strong> Always verify a property and prospective roommate independently before making advance payments or moving in. RoomMate does not guarantee the safety, authenticity, or condition of third-party listings.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                Room<span className="text-indigo-600 dark:text-indigo-400">Mate</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Find someone you can actually live with — bidirectional compatibility matching based on lifestyle, habits, personality, and housing requirements.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-2">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real verified users only. No artificial content.</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/discover" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Browse Room Listings
                </Link>
              </li>
              <li>
                <Link href="/rooms/new" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  List Your Room
                </Link>
              </li>
              <li>
                <Link href="/groups" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Roommate Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* Compatibility Engine */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Matching Engine
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Lifestyle Profiling
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Mutual Gender Comfort
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Deal Breaker Filters
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  AI Summary Generator
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/profile?tab=verification" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  ID Verification Badges
                </Link>
              </li>
              <li>
                <Link href="/notifications" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Safety Alerts
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block mt-1">
                  100% verified student and professional community.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} RoomMate Technologies. Built for real people with real compatibility.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for shared living harmony</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
