"use client";

import React, { useState } from "react";
import { CompatibilityReport } from "@/types";
import { ExplanationModal } from "./ExplanationModal";
import { getScoreColor, calculateAge } from "@/lib/utils";
import {
  Heart,
  Bookmark,
  Sparkles,
  Info,
  ShieldCheck,
  Moon,
  Sun,
  Flame,
  Volume2,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Trash2,
  EyeOff,
} from "lucide-react";

interface MatchCardProps {
  report: CompatibilityReport;
  onInterest: (targetUserId: string) => Promise<void>;
  onSave?: (targetUserId: string) => Promise<void>;
  onReport?: (targetUserId: string) => void;
  onBlock?: (targetUserId: string) => void;
  onDismiss?: (targetUserId: string) => void;
  onPermanentHide?: (targetUserId: string) => void;
  isSaved?: boolean;
}

export function MatchCard({
  report,
  onInterest,
  onSave,
  onReport,
  onBlock,
  onDismiss,
  onPermanentHide,
  isSaved = false,
}: MatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [interestStatus, setInterestStatus] = useState<"NONE" | "SENT" | "MUTUAL">("NONE");
  const [saved, setSaved] = useState(isSaved);
  const [loading, setLoading] = useState(false);

  const target = report.targetUser;
  const colors = getScoreColor(report.overallScore);
  const age = calculateAge(target.dateOfBirth);

  const handleInterestClick = async () => {
    if (interestStatus !== "NONE" || loading) return;
    setLoading(true);
    try {
      await onInterest(target.id);
      setInterestStatus("SENT");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = async () => {
    setSaved(!saved);
    if (onSave) await onSave(target.id);
  };

  return (
    <>
      <div className="card-3d bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
        {/* Top Card Header */}
        <div className="p-5 pb-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3.5">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white text-lg font-black uppercase shadow-md shadow-indigo-500/20">
                  {target.avatarUrl ? (
                    <img
                      src={target.avatarUrl}
                      alt={target.fullName}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    target.fullName.charAt(0)
                  )}
                </div>
                {target.isCollegeVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-sm"
                    title="🎓 Verified Student Badge"
                  >
                    <div className="p-1 rounded-full bg-emerald-500 text-white">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>
                )}
                {target.isCompanyVerified && !target.isCollegeVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-sm"
                    title="💼 Verified Employee Badge"
                  >
                    <div className="p-1 rounded-full bg-blue-600 text-white">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Identity */}
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {target.fullName}
                  </h3>
                  {age && <span className="text-xs text-slate-400 font-medium">({age})</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {target.city}
                  {target.profile?.preferredArea ? ` • ${target.profile.preferredArea}` : ""}
                </p>
                <div className="mt-1 flex items-center space-x-1.5 flex-wrap gap-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {target.profile?.occupationStatus === "STUDENT"
                      ? target.profile.collegeName || "Student"
                      : target.profile?.companyName || "Working Professional"}
                  </span>
                  {target.isCollegeVerified && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center space-x-1">
                      <span>🎓 Student Verified</span>
                    </span>
                  )}
                  {target.isCompanyVerified && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 flex items-center space-x-1">
                      <span>💼 Employee Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu & Save Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleSaveClick}
                className={`p-2 rounded-xl transition ${
                  saved
                    ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={saved ? "Saved" : "Save Roommate"}
              >
                <Bookmark className={`w-4 h-4 ${saved ? "fill-rose-600" : ""}`} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onPermanentHide) onPermanentHide(target.id);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 font-medium"
                      title="Permanently hides this profile so they won't appear even after page refresh"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>Hide (Never Show Again)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onDismiss) onDismiss(target.id);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Dismiss for Now</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onReport) onReport(target.id);
                      }}
                      className="w-full text-left px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-700/50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Report Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (onBlock) onBlock(target.id);
                      }}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-700/50 mt-1 pt-1.5 font-bold"
                    >
                      <span>Block User</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compatibility Score Banner */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${colors.bg} ${colors.border}`}
          >
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-xl ${colors.badge} font-black text-xs`}>
                {report.overallScore}%
              </div>
              <div className="text-xs">
                <span className={`font-bold ${colors.text} block`}>
                  {report.isDealBreakerViolated
                    ? "Deal Breaker Flagged"
                    : report.overallScore >= 80
                    ? "Highly Compatible"
                    : report.overallScore >= 65
                    ? "Good Match"
                    : "Moderate Compatibility"}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Bidirectional Compatibility
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Info className="w-3.5 h-3.5 mr-1" />
              Why Match?
            </button>
          </div>

          {/* Target Housing Budget Range */}
          {target.housingReq && (
            <div className="flex items-center justify-between text-xs px-1 text-slate-600 dark:text-slate-400">
              <span>Target Budget:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ₹{target.housingReq.budgetMin?.toLocaleString() || "0"} - ₹{target.housingReq.budgetMax?.toLocaleString() || "15,000"}/mo
              </span>
            </div>
          )}

          {/* Lifestyle Badges */}
          {target.lifestyle && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Their Lifestyle:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <Moon className="w-3 h-3 mr-1 text-indigo-500" />
                  {target.lifestyle.sleepSchedule?.replace("_", " ").toLowerCase() || "Normal"}
                </span>
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                  Cleanliness {target.lifestyle.cleanliness || 7}/10
                </span>
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <Flame className="w-3 h-3 mr-1 text-rose-500" />
                  {target.lifestyle.smokingHabit === "NEVER" ? "Non-smoker" : "Smoker"}
                </span>
              </div>
            </div>
          )}

          {/* What They Look For In Roommates */}
          {target.roommatePref && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 font-semibold block">Seeking Roommate Who Is:</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/50 dark:border-indigo-900/50">
                  {target.roommatePref.preferredGender === "MALE"
                    ? "👦 Male Roommate"
                    : target.roommatePref.preferredGender === "FEMALE"
                    ? "👧 Female Roommate"
                    : "👥 Any Gender"}
                </span>
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/50 dark:border-emerald-900/50">
                  Cleanliness ≥ {target.roommatePref.minCleanliness || 5}/10
                </span>
              </div>
            </div>
          )}

          {/* Key Match Strengths */}
          {report.strengths.length > 0 && (
            <div className="space-y-1 pt-1">
              {report.strengths.slice(0, 2).map((str, idx) => (
                <div
                  key={idx}
                  className="flex items-center text-[11px] text-emerald-700 dark:text-emerald-400"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1.5 shrink-0" />
                  <span className="truncate">{str}</span>
                </div>
              ))}
            </div>
          )}

          {/* Deal Breaker Warning if any */}
          {report.isDealBreakerViolated && (
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-[11px] text-rose-600 dark:text-rose-400 flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{report.dealBreakerReasons[0]}</span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 py-2.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            View Profile
          </button>

          <button
            onClick={handleInterestClick}
            disabled={interestStatus !== "NONE" || loading}
            className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 ${
              interestStatus === "MUTUAL"
                ? "bg-emerald-600 text-white cursor-default"
                : interestStatus === "SENT"
                ? "bg-slate-400 text-white cursor-default"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>
              {interestStatus === "MUTUAL"
                ? "Matched!"
                : interestStatus === "SENT"
                ? "Interest Sent"
                : "Interested"}
            </span>
          </button>
        </div>
      </div>

      {/* Explanation Modal */}
      <ExplanationModal
        report={report}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSendInterest={handleInterestClick}
        interestStatus={interestStatus}
      />
    </>
  );
}
