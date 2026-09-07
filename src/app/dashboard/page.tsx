"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  MessageSquare,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Banknote,
  Moon,
  Sparkle,
  HeartHandshake,
  Lock,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()),
      fetch("/api/profile/verification").then((res) => res.json()).catch(() => ({})),
    ])
      .then(([userData, verifData]) => {
        if (userData.user) setUser(userData.user);
        if (verifData.verification) setVerification(verifData.verification);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatVal = (val?: string | null) => {
    if (val === null || val === undefined || val === "" || val === "NOT_SET") {
      return <span className="text-slate-400 dark:text-slate-500 font-normal italic">N/A</span>;
    }
    if (val === "ANY" || val === "NO_PREFERENCE" || val === "DOESNT_MATTER") {
      return <span className="font-bold text-slate-700 dark:text-slate-300">Any / Flexible</span>;
    }
    if (val === "NO_PETS") {
      return <span className="font-bold">No Pets</span>;
    }
    if (val === "PETS_OK") {
      return <span className="font-bold text-indigo-600 dark:text-indigo-400">Pets Welcome 🐾</span>;
    }
    if (val === "LOVE_PETS") {
      return <span className="font-bold text-indigo-600 dark:text-indigo-400">Loves Pets 🐕</span>;
    }
    if (val === "HAVE_DOG") {
      return <span className="font-bold text-indigo-600 dark:text-indigo-400">Has Dog 🐕</span>;
    }
    if (val === "HAVE_CAT") {
      return <span className="font-bold text-indigo-600 dark:text-indigo-400">Has Cat 🐈</span>;
    }
    if (val === "HAVE_OTHER") {
      return <span className="font-bold text-indigo-600 dark:text-indigo-400">Has Pets 🐾</span>;
    }
    if (val === "MALE") {
      return <span className="font-bold">Male</span>;
    }
    if (val === "FEMALE") {
      return <span className="font-bold">Female</span>;
    }
    if (val === "STUDENT_ONLY") {
      return <span className="font-bold">Students Only</span>;
    }
    if (val === "WORKING_PROFESSIONAL_ONLY") {
      return <span className="font-bold">Working Professionals Only</span>;
    }
    if (val === "NON_SMOKER_ONLY") {
      return <span className="font-bold">Strictly Non-smoker Only</span>;
    }
    if (val === "BALCONY_ONLY") {
      return <span className="font-bold">Balcony / Outside Only</span>;
    }
    if (val === "NON_DRINKER_ONLY") {
      return <span className="font-bold">Non-drinker Only</span>;
    }
    if (val === "VEGETARIAN_ONLY") {
      return <span className="font-bold">Vegetarian Only</span>;
    }
    if (val === "NON_VEG_OK") {
      return <span className="font-bold">Non-vegetarian Okay</span>;
    }
    if (val === "EGGETARIAN") {
      return <span className="font-bold">Eggetarian Okay</span>;
    }
    if (val === "NIGHT_OWL") {
      return <span className="font-bold">Night Owl</span>;
    }
    if (val === "EARLY_SLEEPER" || val === "EARLY_BIRD") {
      return <span className="font-bold">Early Sleeper</span>;
    }
    if (val === "NORMAL") {
      return <span className="font-bold">Normal Schedule</span>;
    }
    if (val === "FLEXIBLE") {
      return <span className="font-bold">Flexible</span>;
    }
    if (val === "QUIET" || val === "VERY_QUIET") {
      return <span className="font-bold">Quiet & Peaceful</span>;
    }
    if (val === "MODERATE") {
      return <span className="font-bold">Moderate / Normal</span>;
    }
    if (val === "LIVELY") {
      return <span className="font-bold">Lively & Social</span>;
    }
    if (val === "RARELY") {
      return <span className="font-bold">Rarely</span>;
    }
    if (val === "SOMETIMES") {
      return <span className="font-bold">Occasionally</span>;
    }
    if (val === "FREQUENT_OK" || val === "FREQUENTLY") {
      return <span className="font-bold">Frequent Guests Okay</span>;
    }
    return <span className="font-bold capitalize">{val.replace(/_/g, " ").toLowerCase()}</span>;
  };

  const formatCleanliness = (val?: number | null) => {
    if (val === null || val === undefined) return <span className="text-slate-400 dark:text-slate-500 font-normal italic">N/A</span>;
    return <span className="font-bold">{val}/10</span>;
  };

  const formatAgeRange = (min?: number | null, max?: number | null) => {
    if (min == null && max == null) {
      return <span className="text-slate-400 dark:text-slate-500 font-normal italic">N/A</span>;
    }
    if (min != null && max != null) {
      return <span className="font-bold text-slate-900 dark:text-white">{min} – {max} yrs</span>;
    }
    if (min != null) {
      return <span className="font-bold text-slate-900 dark:text-white">≥ {min} yrs</span>;
    }
    return <span className="font-bold text-slate-900 dark:text-white">≤ {max} yrs</span>;
  };

  const formatBudget = (budgetMax?: number | null) => {
    if (!budgetMax) return <span className="text-slate-400 dark:text-slate-500 font-normal italic">N/A</span>;
    return <span className="font-bold">₹{budgetMax.toLocaleString()}/mo</span>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Please sign in to access your dashboard</h2>
        <Link href="/login" className="inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  const completion = user.profile?.profileCompletion || 20;

  // Check how complete roommate preferences are (including age and traits)
  const prefFields = [
    user.roommatePref?.preferredGender,
    user.roommatePref?.preferredOccupation,
    user.roommatePref?.preferredSleepSchedule,
    user.roommatePref?.minCleanliness,
    user.roommatePref?.preferredNoise,
    user.roommatePref?.preferredSmoking,
    user.roommatePref?.preferredDrinking,
    user.roommatePref?.preferredGuests,
    user.roommatePref?.preferredPets,
    user.roommatePref?.preferredFood,
    user.roommatePref?.ageMin,
    user.roommatePref?.ageMax,
  ];
  const configuredPrefCount = prefFields.filter(
    (f) => f !== null && f !== undefined && f !== "" && f !== "NOT_SET"
  ).length;
  const isRoommatePrefAlmostEmpty = configuredPrefCount === 0;
  const isRoommatePrefPartiallyEmpty = configuredPrefCount > 0 && configuredPrefCount < 9;

  // Check how complete lifestyle profile is (10 fields)
  const lifestyleFields = [
    user.lifestyle?.sleepSchedule,
    user.lifestyle?.cleanliness,
    user.lifestyle?.noiseTolerance,
    user.lifestyle?.guestFrequency,
    user.lifestyle?.foodPreference,
    user.lifestyle?.smokingHabit,
    user.lifestyle?.drinkingHabit,
    user.lifestyle?.petOwnership,
    user.lifestyle?.socialBehavior,
    user.lifestyle?.wfhOrStudy,
  ];
  const configuredLifestyleCount = lifestyleFields.filter(
    (f) => f !== null && f !== undefined && f !== "" && f !== "NOT_SET"
  ).length;
  const isLifestyleIncomplete = configuredLifestyleCount <= 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-900 dark:text-white">
      {/* Welcome Header & Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-black text-2xl uppercase shadow-xl shadow-indigo-500/25 shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full rounded-3xl object-cover" />
            ) : (
              user.fullName?.charAt(0) || "U"
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{user.fullName || "Roommate User"}</h1>
              {user.isCollegeVerified && (
                <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Verified Student / Host
                </span>
              )}
            </div>
            <p className="text-sm text-indigo-200">
              {user.city || "N/A"} • {user.profile?.occupationStatus === "STUDENT" ? user.profile.collegeName || "Student" : user.profile?.companyName || "Professional"}
            </p>
          </div>
        </div>

        {/* Profile Completeness Pill */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-3 min-w-[260px]">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-indigo-200">Profile Completeness</span>
            <span className="font-bold text-white text-base">{completion}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-indigo-300 hover:text-white flex items-center justify-end transition"
          >
            <span>{completion < 100 ? "Complete Profile →" : "Edit Preferences →"}</span>
          </Link>
        </div>
      </div>

      {/* ID Verification Banner */}
      {user.isCollegeVerified ? (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                <span>Identity Verified</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  Profile Active
                </span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your ID document is verified. Your profile is publicly active and visible in roommate matching and discovery.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            ✓ Verified
          </span>
        </div>
      ) : verification?.status === "PENDING" ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                <span>🔐 Identity Verification Pending</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  Under Review
                </span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your ID document is submitted and currently under manual review by an administrator. Your profile remains private until approved.
              </p>
            </div>
          </div>
          <Link
            href="/profile?tab=verification"
            className="px-5 py-2.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 font-bold text-xs rounded-2xl shadow-sm transition whitespace-nowrap shrink-0"
          >
            Check Status →
          </Link>
        </div>
      ) : verification?.status === "REJECTED" ? (
        <div className="bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                <span>⚠️ Verification Rejected — Action Required</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs">
                  Re-upload Required
                </span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your ID document was not approved. Please re-upload a clear photo of your student or employee ID to activate your profile.
              </p>
            </div>
          </div>
          <Link
            href="/profile?tab=verification"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition whitespace-nowrap shrink-0"
          >
            Re-upload ID →
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                <span>Identity & Trust Verification</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  Action Needed
                </span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Upload your Student ID Card or Employee Work ID to earn your official verified badge and unlock roommate matching.
              </p>
            </div>
          </div>
          <Link
            href="/profile?tab=verification"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-2xl shadow-md transition whitespace-nowrap shrink-0"
          >
            Verify ID Card →
          </Link>
        </div>
      )}

      {/* Action Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/discover"
          className="p-7 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-lg hover:shadow-indigo-500/10 space-y-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Discover Roommates</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Explore bidirectional matches</p>
          </div>
        </Link>

        <Link
          href="/rooms"
          className="p-7 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-lg hover:shadow-indigo-500/10 space-y-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
            <Home className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Search Room Listings</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Find compatible shared flats</p>
          </div>
        </Link>

        <Link
          href="/messages"
          className="p-7 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-lg hover:shadow-indigo-500/10 space-y-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">Live Messages</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Chat with mutual connections</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="p-7 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition shadow-lg hover:shadow-indigo-500/10 space-y-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition shadow-sm">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">My Living Preferences</h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">View & edit living rhythms</p>
          </div>
        </Link>
      </div>

      {/* Profile Overview Grids: Displays All User Preferences with Clean N/A Fallbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Lifestyle Column */}
        <div className="space-y-4">
          {isLifestyleIncomplete && (
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>⚠️ Complete Your Lifestyle Profile</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    The more you tell us about how you actually live, the more accurately we can find compatible roommates.
                  </p>
                </div>
              </div>
              <Link
                href="/profile?tab=lifestyle"
                className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 shrink-0 transition"
              >
                Complete Lifestyle →
              </Link>
            </div>
          )}

          {/* Lifestyle summary */}
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                My Actual Lifestyle
              </h3>
              <Link href="/profile?tab=lifestyle" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Edit Lifestyle →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Sleep Routine</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.sleepSchedule)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Cleanliness</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCleanliness(user.lifestyle?.cleanliness)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Noise Level</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.noiseTolerance)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Guests & Visitors</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.guestFrequency)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Food Diet</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.foodPreference)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Smoking Habit</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.smokingHabit)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Drinking Habit</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.drinkingHabit)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Pet Ownership</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.petOwnership)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Social Nature</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.lifestyle?.socialBehavior)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Roommate Preferences Column */}
        <div className="space-y-4">
          {/* Warning card directly ABOVE the My Roommate Preferences section */}
          {isRoommatePrefAlmostEmpty ? (
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>⚠️ Please Select Your Roommate Preferences</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Please select your roommate preferences to find a compatible roommate.
                  </p>
                </div>
              </div>
              <Link
                href="/profile?tab=preferences"
                className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 shrink-0 transition"
              >
                Select Preferences →
              </Link>
            </div>
          ) : isRoommatePrefPartiallyEmpty ? (
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>⚠️ Complete Your Preferences</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Some of your roommate preferences haven&apos;t been specified yet. Complete them to improve the accuracy of your roommate matches.
                  </p>
                </div>
              </div>
              <Link
                href="/profile?tab=preferences"
                className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 shrink-0 transition"
              >
                Complete Preferences →
              </Link>
            </div>
          ) : null}

          {/* Roommate preferences */}
          <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                My Roommate Preferences
              </h3>
              <Link href="/profile?tab=preferences" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Edit Preferences →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Gender Preference</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredGender)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Occupation Target</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredOccupation)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Preferred Age Range</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatAgeRange(user.roommatePref?.ageMin, user.roommatePref?.ageMax)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Sleep Schedule</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredSleepSchedule)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Min Cleanliness</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.roommatePref?.minCleanliness != null ? `≥ ${user.roommatePref.minCleanliness}/10` : <span className="text-slate-400 dark:text-slate-500 font-normal italic">N/A</span>}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Noise Tolerance</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredNoise)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Smoking Comfort</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredSmoking)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Drinking Comfort</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredDrinking)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Guests Comfort</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredGuests)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Pet Comfort</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredPets)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Food Diet Pref</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatVal(user.roommatePref?.preferredFood)}</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
                <span className="text-xs text-slate-400 block">Target Budget</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{formatBudget(user.housingReq?.budgetMax)}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-2">Key Traits I Look For:</span>
              {user.profile?.preferredRoommateTraits && user.profile.preferredRoommateTraits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.profile.preferredRoommateTraits.map((trait: string) => (
                    <span
                      key={trait}
                      className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 italic">No traits specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deal Breakers & Target Housing Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deal Breakers */}
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>My Deal Breakers (Strict Rules)</span>
            </h3>
            <Link href="/profile" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Edit →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2.5 text-xs sm:text-sm">
            {user.dealBreakers?.noSmoking && (
              <span className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl font-bold border border-rose-200 dark:border-rose-900">
                🚭 Strict No Smoking
              </span>
            )}
            {user.dealBreakers?.noDrinking && (
              <span className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl font-bold border border-rose-200 dark:border-rose-900">
                🚫 Dry House (No Alcohol)
              </span>
            )}
            {user.dealBreakers?.noPets && (
              <span className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl font-bold border border-rose-200 dark:border-rose-900">
                🐾 No Pets Allowed
              </span>
            )}
            {user.dealBreakers?.strictQuietHours && (
              <span className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl font-bold border border-rose-200 dark:border-rose-900">
                🤫 Strict Quiet Hours
              </span>
            )}
            {user.dealBreakers?.vegetarianKitchenOnly && (
              <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold border border-emerald-200 dark:border-emerald-900">
                🥗 Pure Vegetarian Kitchen
              </span>
            )}
            {!user.dealBreakers?.noSmoking &&
              !user.dealBreakers?.noDrinking &&
              !user.dealBreakers?.noPets &&
              !user.dealBreakers?.strictQuietHours &&
              !user.dealBreakers?.vegetarianKitchenOnly && (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">None Set (N/A)</p>
              )}
          </div>
        </div>

        {/* Housing & Budget */}
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span>Target Housing & Localities</span>
            </h3>
            <Link href="/profile" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Edit →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 block">Target City</span>
              <span className="font-bold text-slate-900 dark:text-white">{user.housingReq?.city || user.city || "N/A"}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 block">Budget Range</span>
              {user.housingReq?.budgetMin || user.housingReq?.budgetMax ? (
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{user.housingReq?.budgetMin?.toLocaleString() || "0"} - ₹{user.housingReq?.budgetMax?.toLocaleString() || "N/A"}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 font-normal italic">N/A</span>
              )}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400 block">Room Type</span>
              <div className="font-bold text-slate-900 dark:text-white">{formatVal(user.housingReq?.roomType)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hobbies & Personality Traits Overview */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>My Hobbies, Interests & Personality</span>
          </h3>
          <Link href="/profile" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Manage Hobbies →
          </Link>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Hobbies & Interests:</span>
            <div className="flex flex-wrap gap-2.5">
              {user.profile?.hobbies && user.profile.hobbies.length > 0 ? (
                user.profile.hobbies.map((h: string) => (
                  <span
                    key={h}
                    className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-2xl text-xs sm:text-sm font-semibold border border-indigo-200 dark:border-indigo-800"
                  >
                    {h}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 dark:text-slate-500 italic">No hobbies selected yet (N/A)</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Personality Traits:</span>
            <div className="flex flex-wrap gap-2.5">
              {user.profile?.personalityTraits && user.profile.personalityTraits.length > 0 ? (
                user.profile.personalityTraits.map((t: string) => (
                  <span
                    key={t}
                    className="px-4 py-1.5 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 rounded-2xl text-xs sm:text-sm font-semibold border border-violet-200 dark:border-violet-800"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400 dark:text-slate-500 italic">No personality traits selected yet (N/A)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
