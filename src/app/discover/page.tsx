"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/matching/MatchCard";
import { CompatibilityReport } from "@/types";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Lock,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  RotateCcw,
  EyeOff,
  LogIn,
  UserPlus,
} from "lucide-react";
import { ReportModal } from "@/components/modals/ReportModal";

export default function DiscoverPage() {
  const [matches, setMatches] = useState<CompatibilityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUnauthenticated, setIsUnauthenticated] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [verificationInfo, setVerificationInfo] = useState<{
    status: string;
    rejectionReason?: string | null;
    submittedAt?: string | null;
  } | null>(null);

  const [cityFilter, setCityFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [sleepFilter, setSleepFilter] = useState("");
  const [cleanlinessFilter, setCleanlinessFilter] = useState(0);
  const [hideDealBreakers, setHideDealBreakers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    setVerificationInfo(null);

    try {
      const query = new URLSearchParams();
      if (cityFilter) query.set("city", cityFilter);
      if (genderFilter !== "ALL") query.set("gender", genderFilter);
      if (sleepFilter) query.set("sleepSchedule", sleepFilter);
      if (cleanlinessFilter > 0) query.set("minCleanliness", cleanlinessFilter.toString());
      if (hideDealBreakers) query.set("hideDealBreakers", "true");

      const res = await fetch(`/api/matching/discover?${query.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.verificationStatus) {
          setVerificationInfo({
            status: data.verificationStatus,
            rejectionReason: data.rejectionReason,
            submittedAt: data.submittedAt,
          });
          setMatches([]);
          return;
        }
        if (res.status === 401) {
          setIsUnauthenticated(true);
          setError("Please sign in or complete your profile to view personalized matches.");
          setMatches([]);
          return;
        }
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
      setHiddenCount(data.hiddenCount || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading roommate matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [genderFilter, sleepFilter, cleanlinessFilter, hideDealBreakers]);

  const handleInterest = async (targetUserId: string) => {
    const res = await fetch("/api/matching/interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
    const data = await res.json();
    if (data.isMutualMatch) {
      alert(`🎉 Mutual Match with ${data.matchedUser?.name || "this user"}! You can now chat in Messages.`);
    }
  };

  const handleSave = async (targetUserId: string) => {
    await fetch("/api/saved/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
  };

  const handleBlock = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to block this user? You will no longer see each other.")) return;
    await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedId: targetUserId }),
    });
    fetchMatches();
  };

  const handleDismiss = async (targetUserId: string) => {
    setMatches((prev) => prev.filter((m) => m.targetUser.id !== targetUserId));
  };

  const handlePermanentHide = async (targetUserId: string) => {
    setMatches((prev) => prev.filter((m) => m.targetUser.id !== targetUserId));
    setHiddenCount((prev) => prev + 1);

    try {
      await fetch("/api/matching/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
    } catch (err) {
      console.error("Failed to permanently hide roommate:", err);
    }
  };

  const handleResetHidden = async () => {
    if (!confirm("Restore all hidden roommates so they appear in your Discover feed again?")) return;
    try {
      await fetch("/api/matching/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_ALL" }),
      });
      setHiddenCount(0);
      fetchMatches();
    } catch (err) {
      console.error("Failed to reset hidden roommates:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold text-indigo-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Deterministic Compatibility Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Verified Roommate Discovery
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Compare your lifestyle, budget, cleanliness habits, and deal breakers with 100% Admin-Verified Students and Working Professionals.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {hiddenCount > 0 && (
              <button
                onClick={handleResetHidden}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 backdrop-blur rounded-2xl text-xs font-bold text-amber-200 transition border border-amber-300/30 cursor-pointer shadow-sm"
                title="Restore all hidden roommate profiles"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore {hiddenCount} Hidden {hiddenCount === 1 ? "Roommate" : "Roommates"}</span>
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur rounded-2xl text-xs font-bold transition border border-white/10"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={fetchMatches}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition shadow-md shadow-indigo-600/30"
              title="Refresh matches"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Filter drawer */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-white text-xs"
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male Roommates</option>
                <option value="FEMALE">Female Roommates</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">Sleep Routine</label>
              <select
                value={sleepFilter}
                onChange={(e) => setSleepFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-white text-xs"
              >
                <option value="">Any Routine</option>
                <option value="NIGHT_OWL">Night Owls Only</option>
                <option value="EARLY_SLEEPER">Early Sleepers Only</option>
                <option value="NORMAL">Normal Schedule</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-200 mb-1">
                Min Cleanliness ({cleanlinessFilter === 0 ? "Any" : `${cleanlinessFilter}/10`})
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={cleanlinessFilter}
                onChange={(e) => setCleanlinessFilter(Number(e.target.value))}
                className="w-full mt-2 accent-indigo-400"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 text-[11px] text-indigo-200 cursor-pointer p-2">
                <input
                  type="checkbox"
                  checked={hideDealBreakers}
                  onChange={(e) => setHideDealBreakers(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
                <span>Hide deal breaker conflicts</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* 1. DEDICATED VERIFICATION PENDING SCREEN (Section 4 & 5) */}
      {verificationInfo && verificationInfo.status === "PENDING" && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
              Status: Under Review
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Identity Verification Pending
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Your Student or Employee ID has been submitted successfully and is waiting for administrator verification.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Profile Privacy & Safety Rules:</span>
            </div>
            <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-1">
              <li>Your profile will remain private until an administrator verifies your identity.</li>
              <li>You cannot participate in roommate matching until verification is approved.</li>
              {verificationInfo.submittedAt && (
                <li>Submitted on: {new Date(verificationInfo.submittedAt).toLocaleDateString()}</li>
              )}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
            >
              <span>View Verification Status on Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. DEDICATED VERIFICATION REJECTED SCREEN (Section 12 & 13) */}
      {verificationInfo && verificationInfo.status === "REJECTED" && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-rose-900/40 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs uppercase tracking-wider">
              Status: Verification Rejected
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Verification Needs Re-submission
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Your identity verification could not be completed. Your profile will remain private and matching is disabled until a clear document is approved.
            </p>
          </div>

          {verificationInfo.rejectionReason && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-left text-xs space-y-1 max-w-md mx-auto">
              <span className="font-bold text-rose-300 block">Feedback from administrator:</span>
              <p className="text-rose-200 text-xs">{verificationInfo.rejectionReason}</p>
            </div>
          )}

          <div className="pt-2">
            <Link
              href="/profile?tab=verification"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Re-upload Student / Employee ID</span>
            </Link>
          </div>
        </div>
      )}

      {/* 0. DEDICATED UNAUTHENTICATED AUTH GATE SCREEN */}
      {isUnauthenticated && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-6 shadow-2xl animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Sign In Required to Discover Roommates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Please sign in or complete your profile to access personalized lifestyle matching and view verified roommates in your area.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to RoomMate</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      )}

      {/* General Error state */}
      {!isUnauthenticated && !verificationInfo && error && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start space-x-3 text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">{error}</p>
            <p>Ensure you have completed your profile and questionnaire under &ldquo;Lifestyle & Preferences&rdquo;.</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isUnauthenticated && !verificationInfo && loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      )}

      {/* Real Matches Grid */}
      {!verificationInfo && !loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((report) => (
            <MatchCard
              key={report.targetUserId}
              report={report}
              onInterest={handleInterest}
              onSave={handleSave}
              onReport={(id) => setReportTarget({ id, name: report.targetUser.fullName })}
              onBlock={handleBlock}
              onDismiss={handleDismiss}
              onPermanentHide={handlePermanentHide}
            />
          ))}
        </div>
      )}

      {/* Proper Empty State */}
      {!verificationInfo && !loading && matches.length === 0 && !error && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No compatible roommates found yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As real users join RoomMate in your city and their identity is verified by Admin, they will appear here with calculated compatibility scores.
          </p>
        </div>
      )}

      {/* Safety Report Modal */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetUserId={reportTarget.id}
          targetName={reportTarget.name}
        />
      )}
    </div>
  );
}
