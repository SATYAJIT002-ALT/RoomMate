"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserCheck, ArrowRightLeft, X, Lock, Eye, EyeOff } from "lucide-react";

interface AccountSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: string;
  currentEmail?: string;
}

const ADMIN_EMAIL = "satyajitsasmal022@gmail.com";
const USER_EMAIL = "satyajitsasmal780@gmail.com";

export function AccountSwitchModal({
  isOpen,
  onClose,
  currentRole,
  currentEmail,
}: AccountSwitchModalProps) {
  const router = useRouter();
  const isCurrentAdmin = currentRole === "ADMIN";

  const defaultTarget = isCurrentAdmin ? USER_EMAIL : ADMIN_EMAIL;
  const [targetEmail, setTargetEmail] = useState(defaultTarget);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTargetEmail(isCurrentAdmin ? USER_EMAIL : ADMIN_EMAIL);
      setPassword("");
      setError("");
      setShowPassword(false);
    }
  }, [isOpen, isCurrentAdmin]);

  if (!isOpen) return null;

  const handleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/switch-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate account");
      }

      onClose();
      // Safely navigate to appropriate dashboard
      if (data.targetRole === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 backdrop-blur rounded-xl">
                <ArrowRightLeft className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Switch Account</h3>
                <p className="text-xs text-indigo-100">
                  {isCurrentAdmin ? "Switch to your permanent User ID" : "Switch to your permanent Admin ID"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Currently active:</span>
            <span className="inline-flex items-center font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              {isCurrentAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-500" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              )}
              {currentEmail || "Active Session"} ({currentRole})
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSwitch} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Account Email
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password for Target Account
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Authenticate & Switch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

