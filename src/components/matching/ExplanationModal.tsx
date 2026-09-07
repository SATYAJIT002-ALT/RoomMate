"use client";

import React from "react";
import { CompatibilityReport } from "@/types";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { getScoreColor } from "@/lib/utils";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles, ArrowRightLeft, HeartHandshake } from "lucide-react";

interface ExplanationModalProps {
  report: CompatibilityReport | null;
  isOpen: boolean;
  onClose: () => void;
  onSendInterest?: () => void;
  interestStatus?: "NONE" | "SENT" | "RECEIVED" | "MUTUAL";
}

export function ExplanationModal({
  report,
  isOpen,
  onClose,
  onSendInterest,
  interestStatus = "NONE",
}: ExplanationModalProps) {
  if (!isOpen || !report) return null;

  const colors = getScoreColor(report.overallScore);
  const target = report.targetUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold uppercase shadow-lg">
              {target.avatarUrl ? (
                <img src={target.avatarUrl} alt={target.fullName} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                target.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black">{target.fullName}</h3>
                {target.isCollegeVerified && (
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-200">
                {target.city} • {target.profile?.occupationStatus === "STUDENT" ? "Student" : "Professional"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between p-3.5 bg-white/10 backdrop-blur rounded-2xl border border-white/10">
            <div>
              <span className="text-[11px] font-medium text-indigo-200 uppercase tracking-wider block">
                Bidirectional Compatibility Score
              </span>
              <span className="text-2xl font-black text-white">{report.overallScore}% Match</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-300 block">Gender Compatibility:</span>
              <span className="text-xs font-bold text-emerald-300">
                {report.isGenderCompatible ? "✓ Mutually Compatible" : "⚠ Incompatible"}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-white">
          {/* Deal Breaker Alert */}
          {report.isDealBreakerViolated && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-xs space-y-1">
              <div className="flex items-center font-bold text-rose-700 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Hard Deal Breaker Criterion Triggered
              </div>
              <ul className="list-disc list-inside text-rose-600 dark:text-rose-300 space-y-0.5">
                {report.dealBreakerReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bidirectional Explainer Concept */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>How RoomMate Evaluated This Match</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              We evaluated your living preferences against {target.fullName}&apos;s actual lifestyle ({report.directionAtoBScore}%), {target.fullName}&apos;s preferences against your actual lifestyle ({report.directionBtoAScore}%), and measured mutual lifestyle coexistence rhythms.
            </p>
          </div>

          {/* Category Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Compatibility Category Scores
            </h4>
            <CategoryBreakdown scores={report.categoryScores} />
          </div>

          {/* Strengths & Points of Alignment */}
          {report.strengths.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Strong Points of Alignment ({report.strengths.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.strengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300"
                  >
                    {str}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Potential Differences */}
          {report.differences.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5" />
                Potential Differences to Consider
              </h4>
              <div className="space-y-1.5">
                {report.differences.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300"
                  >
                    {diff}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Living Habits vs Roommate Preferences Detailed Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Their Lifestyle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider">
                👤 {target.fullName}&apos;s Lifestyle
              </h5>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sleep Schedule:</span>
                  <span className="font-semibold capitalize">{target.lifestyle?.sleepSchedule?.replace("_", " ").toLowerCase() || "Normal"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cleanliness:</span>
                  <span className="font-semibold">{target.lifestyle?.cleanliness || 7}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Noise Tolerance:</span>
                  <span className="font-semibold capitalize">{target.lifestyle?.noiseTolerance?.replace("_", " ").toLowerCase() || "Moderate"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Smoking:</span>
                  <span className="font-semibold capitalize">{target.lifestyle?.smokingHabit?.toLowerCase() || "Never"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Diet / Food:</span>
                  <span className="font-semibold capitalize">{target.lifestyle?.foodPreference?.replace("_", " ").toLowerCase() || "Any"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Social Nature:</span>
                  <span className="font-semibold capitalize">{target.lifestyle?.socialBehavior?.replace("_", " ").toLowerCase() || "Balanced"}</span>
                </div>
              </div>
            </div>

            {/* What They Seek In A Roommate */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-2 text-xs">
              <h5 className="font-bold text-indigo-950 dark:text-indigo-200 uppercase text-[11px] tracking-wider">
                🎯 What {target.fullName} Looks For
              </h5>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Preferred Gender:</span>
                  <span className="font-semibold capitalize">{target.roommatePref?.preferredGender?.toLowerCase() || "Any"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Cleanliness:</span>
                  <span className="font-semibold">≥ {target.roommatePref?.minCleanliness || 5}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Smoking Tolerance:</span>
                  <span className="font-semibold capitalize">{target.roommatePref?.preferredSmoking?.replace("_", " ").toLowerCase() || "No preference"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guest Policy:</span>
                  <span className="font-semibold capitalize">{target.roommatePref?.preferredGuests?.replace("_", " ").toLowerCase() || "Moderate"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pet Comfort:</span>
                  <span className="font-semibold capitalize">{target.roommatePref?.preferredPets?.replace("_", " ").toLowerCase() || "No pets"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Budget:</span>
                  <span className="font-semibold">₹{target.housingReq?.budgetMax?.toLocaleString() || "12,000"}/mo</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary Note if present */}
          {target.profile?.aiSummary && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-bold flex items-center text-indigo-600 dark:text-indigo-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                AI Lifestyle Summary:
              </span>
              <p className="text-slate-600 dark:text-slate-300 italic">&ldquo;{target.profile.aiSummary}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>

          {onSendInterest && (
            <button
              onClick={() => {
                onSendInterest();
                onClose();
              }}
              disabled={interestStatus === "SENT" || interestStatus === "MUTUAL"}
              className={`flex items-center space-x-1.5 px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition ${
                interestStatus === "MUTUAL"
                  ? "bg-emerald-600 cursor-default"
                  : interestStatus === "SENT"
                  ? "bg-slate-500 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>
                {interestStatus === "MUTUAL"
                  ? "Matched! Chat Now"
                  : interestStatus === "SENT"
                  ? "Interest Sent"
                  : "Show Roommate Interest"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
