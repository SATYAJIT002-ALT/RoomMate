"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Home,
  Sparkles,
  ShieldCheck,
  Moon,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  MessageSquare,
  Lock,
  ChevronDown,
  Building,
  MapPin,
  Sliders,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState("Please Sign In or Complete Your Profile");
  const [authModalDesc, setAuthModalDesc] = useState("You need an active RoomMate account and completed profile to discover compatible roommates and browse room listings.");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser({
            ...data.user,
            profileCompletion: data.profileCompletion || 20,
          });
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  }, []);

  const handleFindRoommateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalTitle("Sign In Required to Find Roommates");
      setAuthModalDesc("Please sign in or complete your profile so our bidirectional matching engine can evaluate your lifestyle compatibility with roommates.");
    } else {
      router.push("/discover");
    }
  };

  const handleBrowseRoomsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalTitle("Sign In Required to Browse Room Listings");
      setAuthModalDesc("Please sign in or complete your profile to view verified room listings and match against your housing requirements.");
      setIsAuthModalOpen(true);
    } else {
      router.push("/rooms");
    }
  };

  const faqs = [
    {
      q: "How is RoomMate different from typical flat-finding platforms?",
      a: "Typical platforms only focus on whether a room is vacant. RoomMate matches you with people you can actually live with using bidirectional lifestyle compatibility — comparing sleep schedules, cleanliness, noise tolerance, food preferences, and strict deal breakers from both sides.",
    },
    {
      q: "What does 'Bidirectional Matching' mean?",
      a: "Most apps only check if User A likes User B's profile. RoomMate evaluates both directions: (1) Does User B live in a way User A is comfortable with? (2) Does User A live in a way User B is comfortable with? (3) Do your daily living rhythms coexist peacefully?",
    },
    {
      q: "How does gender compatibility work?",
      a: "Gender comfort is strictly mutual. We compare both prospective flatmates' comfort settings to ensure nobody is matched with an opposite-gender or same-gender flatmate unless both parties have explicitly agreed to that preference.",
    },
    {
      q: "Are there fake or seeded profiles on RoomMate?",
      a: "Never. RoomMate operates strictly with real, authenticated users and real room listings created by genuine hosts and students.",
    },
    {
      q: "How does RoomMate protect my personal privacy?",
      a: "We never publicly expose exact residential flat/unit numbers, government identification, phone numbers, or private verification documents. Only approximate neighborhood landmarks are displayed.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>The Shared-Living Compatibility Platform</span>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Find a roommate you can{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                actually live with.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Match with real people based on actual lifestyle, sleep routines, cleanliness, budget, personality, and deal breakers — not just location.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleFindRoommateClick}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <span>Find My Roommate</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleBrowseRoomsClick}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-indigo-500" />
              <span>Browse Room Listings</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Real Verified Users Only</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Bidirectional Matching Engine</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-violet-500" />
              <span>Zero Fake Profiles or Mock Reviews</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Deterministic & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">How RoomMate Works</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Simple 4-step workflow to connect with compatible roommates and verified room listings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Tell Us How You Live",
                desc: "Complete your authentic lifestyle questionnaire: sleep routine, cleanliness (1-10), noise tolerance, and dietary preferences.",
              },
              {
                step: "02",
                title: "Define Roommate Wants",
                desc: "Set the living characteristics you are comfortable with, target budget, and strict non-negotiable deal breakers.",
              },
              {
                step: "03",
                title: "Bidirectional Evaluation",
                desc: "Our engine evaluates both directions (A→B, B→A, and mutual coexistence) to calculate transparent category match scores.",
              },
              {
                step: "04",
                title: "Match & Coordinate",
                desc: "Show interest, unlock mutual matches, message in real-time, and search for shared rooms together as a group.",
              },
            ].map((st) => (
              <div
                key={st.step}
                className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-3"
              >
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {st.step}
                </div>
                <h3 className="text-base font-bold">{st.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE BIDIRECTIONAL MATCHING ENGINE ARCHITECTURE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-8">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Core Engine Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">
                Why One-Way Matching Always Fails
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                If User A wants a night owl, and User B is a night owl — but User B prefers an early sleeper — traditional platforms count that as a match. RoomMate evaluates compatibility from BOTH sides to prevent roommate friction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block">Check 1 & Check 2</span>
                <h4 className="text-sm font-bold">Two-Way Preference Satisfaction</h4>
                <p className="text-xs text-slate-300">
                  User A&apos;s preferences $\to$ User B&apos;s lifestyle, and User B&apos;s preferences $\to$ User A&apos;s lifestyle.
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-indigo-400 block">Check 3 & Check 4</span>
                <h4 className="text-sm font-bold">Mutual Lifestyle & Budget</h4>
                <p className="text-xs text-slate-300">
                  Cleanliness alignment (slider 1-10), noise tolerance harmony, and overlapping rental budgets.
                </p>
              </div>

              <div className="p-6 bg-white/10 backdrop-blur rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs font-bold text-rose-400 block">Check 5 & Check 6</span>
                <h4 className="text-sm font-bold">Mutual Gender & Deal Breakers</h4>
                <p className="text-xs text-slate-300">
                  Hard disqualifier filters. If a strict deal breaker is violated, the user is excluded from recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRANSPARENT COMPATIBILITY BREAKDOWN PREVIEW */}
      <section className="py-20 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              No Mystery Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">
              Every Match Score is Fully Explained
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              We never just give you &ldquo;89%&rdquo;. You receive an itemized breakdown of strengths and potential differences.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-800/70 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">Sample Match</span>
                <h3 className="text-lg font-black">89% Bidirectional Compatibility</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                Highly Compatible
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Lifestyle Rhythms (25%)</span>
                  <span className="text-indigo-600">92%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[92%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Budget & Location (20%)</span>
                  <span className="text-indigo-600">95%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[95%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>Personality & Nature (15%)</span>
                  <span className="text-indigo-600">84%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 w-[84%]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="space-y-1 text-emerald-700 dark:text-emerald-400">
                <span className="font-bold block">✓ Strong Points of Alignment</span>
                <p>• Both prefer quiet study hours (11 PM - 7 AM)</p>
                <p>• Cleanliness expectations are identical (8/10 vs 8/10)</p>
                <p>• Overlapping budget range: ₹6,000 - ₹10,000/mo</p>
              </div>

              <div className="space-y-1 text-amber-700 dark:text-amber-400">
                <span className="font-bold block">⚠ Potential Differences</span>
                <p>• One user works from home frequently</p>
                <p>• Hobbies differ (Cricket vs Gaming)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-500">Everything you need to know about RoomMate</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-xs sm:text-sm hover:text-indigo-600 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">
            Ready to find your ideal roommate?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mx-auto">
            Create your authentic lifestyle profile in under 3 minutes and start matching with verified people in your city.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-indigo-700 hover:bg-indigo-50 rounded-2xl text-xs font-black shadow-xl transition"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Auth Prompt Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 p-6 text-white text-center relative">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-black">{authModalTitle}</h3>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 dark:text-slate-300 text-center leading-relaxed">
                {authModalDesc}
              </p>

              <div className="space-y-2.5 pt-1">
                <Link
                  href="/login"
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to RoomMate</span>
                </Link>

                <Link
                  href="/register"
                  className="w-full py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition flex items-center justify-center space-x-2"
                >
                  <UserPlus className="w-4 h-4 text-indigo-500" />
                  <span>Create Free Account</span>
                </Link>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Stay on Home Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
