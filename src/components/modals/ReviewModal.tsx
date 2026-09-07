"use client";

import React, { useState } from "react";
import { Star, X, MessageSquareHeart } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetListingId?: string;
  targetName?: string;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  targetUserId,
  targetListingId,
  targetName,
  onSuccess,
}: ReviewModalProps) {
  const [cleanliness, setCleanliness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [respectfulness, setRespectfulness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId,
          targetListingId,
          cleanlinessRating: cleanliness,
          communicationRating: communication,
          reliabilityRating: reliability,
          respectfulnessRating: respectfulness,
          accuracyRating: accuracy,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post review");

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error posting review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, setRating: (val: number) => void) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => setRating(star)}
          className="p-1 hover:scale-110 transition"
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 dark:text-slate-700"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <MessageSquareHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Write a Living Review</h3>
              <p className="text-xs text-indigo-100">
                Share authentic living experience with {targetName || "Roommate"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-slate-900 dark:text-white">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Cleanliness & Hygiene</span>
              {renderStars(cleanliness, setCleanliness)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Communication & Respect</span>
              {renderStars(communication, setCommunication)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Reliability & Bill Splitting</span>
              {renderStars(reliability, setReliability)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">House Rule Respectfulness</span>
              {renderStars(respectfulness, setRespectfulness)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Accuracy of Listing/Habits</span>
              {renderStars(accuracy, setAccuracy)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Review Comments
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe your living experience, compatibility, and shared apartment habits..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? "Posting..." : "Publish Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
