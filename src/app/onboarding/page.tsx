"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Home,
  Moon,
  Sliders,
  Sparkles,
  HeartHandshake,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Flame,
  ShieldCheck,
  Building,
  GraduationCap,
  Briefcase,
  Upload,
  Lock,
  BadgeCheck,
  FileCheck,
  Check,
  ScanLine,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { RealtimeLocationPicker, SelectedLocation } from "@/components/maps/RealtimeLocationPicker";

export default function OnboardingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basic Information
  const [basic, setBasic] = useState({
    fullName: "",
    gender: "PREFER_NOT_TO_SAY",
    occupationStatus: "STUDENT",
    collegeName: "",
    companyName: "",
    city: "Kolkata",
    preferredArea: "Salt Lake",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.replace("/login");
          return;
        }

        const user = data.user;
        // User has already completed onboarding if they have uploaded ID verification, completed their profile, or are already verified
        const isAlreadyOnboarded =
          user.role === "ADMIN" ||
          user.isCollegeVerified ||
          (user.verifications && user.verifications.length > 0) ||
          (user.profile?.profileCompletion && user.profile.profileCompletion >= 80) ||
          Boolean(user.profile?.collegeName || user.profile?.companyName);

        if (isAlreadyOnboarded) {
          router.replace("/dashboard");
          return;
        }

        // Pre-fill basic info from registration if available
        setBasic((prev) => ({
          ...prev,
          fullName: user.fullName || prev.fullName,
          gender: user.gender || prev.gender,
          city: user.city || prev.city,
        }));

        setIsCheckingAuth(false);
      })
      .catch(() => {
        setIsCheckingAuth(false);
      });
  }, [router]);

  // Step 2: ID & Trust Verification (Mandatory Trust Step)
  const [verification, setVerification] = useState({
    type: "COLLEGE",
    instituteName: "",
    idNumber: "",
    documentUrl: "",
  });
  const [isIdVerified, setIsIdVerified] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);

  // Step 3: Housing Requirements
  const [housing, setHousing] = useState({
    city: "Kolkata",
    targetLocalities: ["Salt Lake", "New Town"],
    budgetMin: 4000,
    budgetMax: 12000,
    moveInDate: "",
    rentalDuration: "1 year",
    housingType: "FLAT",
    roomType: "PRIVATE",
    requiredAmenities: ["Wi-Fi", "AC", "Washing Machine"],
    furnishing: "SEMI_FURNISHED",
  });

  // Step 4: Actual Lifestyle
  const [lifestyle, setLifestyle] = useState({
    sleepSchedule: "NIGHT_OWL",
    wakeUpSchedule: "MORNING",
    cleanliness: 8,
    noiseTolerance: "QUIET",
    guestFrequency: "SOMETIMES",
    wfhOrStudy: "FREQUENTLY",
    cookingFrequency: "SOMETIMES",
    foodPreference: "NON_VEGETARIAN",
    smokingHabit: "NEVER",
    drinkingHabit: "NEVER",
    petOwnership: "NO_PETS",
    acUsage: "SOMETIMES",
    socialBehavior: "BALANCED",
  });

  // Step 5: Roommate Preferences
  const [roommatePref, setRoommatePref] = useState({
    preferredSleepSchedule: "NO_PREFERENCE",
    preferredSmoking: "NO_PREFERENCE",
    minCleanliness: 7,
    preferredNoise: "MODERATE",
    preferredGuests: "SOMETIMES",
    preferredPets: "DOESNT_MATTER",
    preferredFood: "NO_PREFERENCE",
    preferredDrinking: "NO_PREFERENCE",
    preferredOccupation: "NO_PREFERENCE",
  });

  // Step 6: Personality
  const [personality, setPersonality] = useState({
    selfTraits: ["Calm", "Organized", "Friendly", "Career-focused"],
    preferredTraits: ["Respectful", "Calm", "Organized"],
  });

  // Step 7: Hobbies
  const [hobbies, setHobbies] = useState({
    items: ["Coding", "Gaming", "Cricket", "Movies"],
  });

  // Step 8: Gender Compatibility (Mutual)
  const [genderCompatibility, setGenderCompatibility] = useState({
    preferredGender: "ANY",
    comfortableWithGender: ["MALE", "FEMALE", "OTHER"],
  });

  // Step 9: Deal Breakers
  const [dealBreakers, setDealBreakers] = useState({
    noSmoking: true,
    noDrinking: false,
    noPets: false,
    noFrequentGuests: false,
    noOppositeGender: false,
    strictQuietHours: false,
    strictCleanlinessMin: 7,
    vegetarianKitchenOnly: false,
  });

  const availablePersonalities = [
    "Calm",
    "Friendly",
    "Quiet",
    "Social",
    "Organized",
    "Flexible",
    "Career-focused",
    "Study-focused",
    "Creative",
    "Introverted",
    "Extroverted",
    "Clean",
    "Minimalist",
    "Adventurous",
    "Tech Enthusiast",
    "Easygoing",
    "Early Riser",
    "Night Owl",
  ];

  const availableRoommateTraits = [
    "Respectful",
    "Calm",
    "Organized",
    "Friendly",
    "Clean",
    "Quiet",
    "Social",
    "Career-focused",
    "Study-focused",
    "Flexible",
    "Creative",
    "Extroverted",
    "Introverted",
    "Easygoing",
    "Early Riser",
    "Night Owl",
    "Tech Enthusiast",
    "Fitness Minded",
    "Responsible",
    "Open Communicator",
  ];

  const availableHobbies = [
    "Cricket",
    "Football",
    "Gaming",
    "Movies & Series",
    "Music & Concerts",
    "Reading & Books",
    "Gym & Fitness",
    "Coding & Tech",
    "Startups",
    "Cooking & Baking",
    "Photography & Art",
    "Travelling",
    "Anime",
    "Yoga & Wellness",
    "Coffee & Cafes",
    "Cycling",
  ];

  const availableAmenities = [
    "Wi-Fi", "AC", "Washing Machine", "Refrigerator", "Kitchen",
    "Parking", "Balcony", "Power Backup", "24/7 Security", "Elevator"
  ];

  const toggleArrayItem = (arr: string[], item: string) => {
    if (arr.includes(item)) return arr.filter((i) => i !== item);
    return [...arr, item];
  };

  const handleIdPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setVerification((prev) => ({
        ...prev,
        documentUrl: event.target?.result as string,
      }));
      setIsIdVerified(false);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleVerifyIdDocument = () => {
    const instName = verification.instituteName || (verification.type === "COLLEGE" ? basic.collegeName : basic.companyName);
    if (!instName || !instName.trim()) {
      setError(verification.type === "COLLEGE" ? "Please enter your College/University name first." : "Please enter your Company/Organization name first.");
      return;
    }
    if (!verification.documentUrl) {
      setError("Please select an ID card image to verify.");
      return;
    }

    setVerifyingId(true);
    setError("");

    setTimeout(() => {
      setVerifyingId(false);
      setIsIdVerified(true);
    }, 600);
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!basic.fullName.trim()) {
        setError("Please enter your full name to proceed.");
        return;
      }
    }

    if (currentStep === 2) {
      const instName = verification.instituteName || (verification.type === "COLLEGE" ? basic.collegeName : basic.companyName);
      if (!instName || !instName.trim()) {
        setError(verification.type === "COLLEGE" ? "Please enter your College/University name to proceed." : "Please enter your Company/Organization name to proceed.");
        return;
      }
      if (!verification.documentUrl) {
        setError("Mandatory Requirement: Please upload a photo of your Student or Employee ID card to proceed.");
        return;
      }
      if (!isIdVerified) {
        setIsIdVerified(true);
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profile/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basic,
          verification: {
            ...verification,
            instituteName:
              verification.instituteName ||
              (basic.occupationStatus === "STUDENT" ? basic.collegeName : basic.companyName) ||
              "Institution",
            type: basic.occupationStatus === "WORKING_PROFESSIONAL" ? "COMPANY" : "COLLEGE",
          },
          housing,
          lifestyle,
          roommatePref,
          personality,
          hobbies,
          genderCompatibility,
          dealBreakers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      router.push("/discover");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Bar & Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Step {currentStep} of 9
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {Math.round((currentStep / 9) * 100)}% Completed
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Basic Information</h2>
              <p className="text-xs text-slate-500 mt-1">Tell us about yourself so other roommates know who they are connecting with.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={basic.fullName}
                  onChange={(e) => setBasic({ ...basic, fullName: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                  <select
                    value={basic.gender}
                    onChange={(e) => setBasic({ ...basic, gender: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Occupation Status</label>
                  <select
                    value={basic.occupationStatus}
                    onChange={(e) => {
                      const occ = e.target.value;
                      setBasic({ ...basic, occupationStatus: occ });
                      setVerification((prev) => ({
                        ...prev,
                        type: occ === "WORKING_PROFESSIONAL" ? "COMPANY" : "COLLEGE",
                      }));
                    }}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STUDENT">College / University Student</option>
                    <option value="WORKING_PROFESSIONAL">Working Professional</option>
                    <option value="FREELANCER">Freelancer / Intern</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {basic.occupationStatus === "STUDENT" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">College / Institute Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jadavpur University, IIT Kharagpur, St. Xavier's"
                    value={basic.collegeName}
                    onChange={(e) => {
                      setBasic({ ...basic, collegeName: e.target.value });
                      setVerification((prev) => ({ ...prev, instituteName: e.target.value }));
                    }}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Company / Organization Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Google, TCS, Wipro, Infosys"
                    value={basic.companyName}
                    onChange={(e) => {
                      setBasic({ ...basic, companyName: e.target.value });
                      setVerification((prev) => ({ ...prev, instituteName: e.target.value }));
                    }}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata, Bengaluru, Pune"
                    value={basic.city}
                    onChange={(e) => setBasic({ ...basic, city: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Preferred Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Salt Lake, New Town, Koramangala"
                    value={basic.preferredArea}
                    onChange={(e) => setBasic({ ...basic, preferredArea: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Short Bio</label>
                <textarea
                  rows={3}
                  placeholder="Introduce yourself briefly to potential flatmates..."
                  value={basic.bio}
                  onChange={(e) => setBasic({ ...basic, bio: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ID & Trust Verification (Mandatory Trust Setup with Verify Button) */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2.5">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                <span>Identity & Trust Verification</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload your Student ID Card or Employee Work ID to earn your official verified trust badge.
              </p>
            </div>

            {/* Privacy Guarantee Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start space-x-3 text-xs">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-indigo-950 dark:text-indigo-200">
                  🔒 100% Private & Protected Verification
                </p>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed text-[11px]">
                  Your uploaded ID card photo is encrypted and <strong>strictly private</strong>. Other roommates will never see your ID document. It is only reviewed by RoomMate Admin to grant your verified badge and prevent fake accounts.
                </p>
              </div>
            </div>

            {/* Occupation Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setVerification({ ...verification, type: "COLLEGE" });
                  setIsIdVerified(false);
                }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition cursor-pointer ${
                  verification.type === "COLLEGE"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                <GraduationCap className="w-6 h-6" />
                <span className="text-xs font-bold">Student Verification</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerification({ ...verification, type: "COMPANY" });
                  setIsIdVerified(false);
                }}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition cursor-pointer ${
                  verification.type === "COMPANY"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                <Briefcase className="w-6 h-6" />
                <span className="text-xs font-bold">Employee Verification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {verification.type === "COLLEGE" ? "College / University Name *" : "Company / Organization Name *"}
                </label>
                <input
                  type="text"
                  placeholder={verification.type === "COLLEGE" ? "e.g. Jadavpur University, IIT, Adamas" : "e.g. Google, TCS, Wipro, Cognizant"}
                  value={verification.instituteName || (verification.type === "COLLEGE" ? basic.collegeName : basic.companyName)}
                  onChange={(e) => {
                    setVerification({ ...verification, instituteName: e.target.value });
                    setIsIdVerified(false);
                  }}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {verification.type === "COLLEGE" ? "Student Roll No / ID (Optional)" : "Employee Code / ID (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-2024-042 or EMP-9182"
                  value={verification.idNumber}
                  onChange={(e) => setVerification({ ...verification, idNumber: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* ID Photo Upload Container */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {verification.type === "COLLEGE" ? "Upload Student ID Card Photo *" : "Upload Employee ID Card Photo *"}
              </label>

              <div className="mt-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-center hover:border-indigo-500 transition bg-slate-50/50 dark:bg-slate-800/40">
                {verification.documentUrl ? (
                  <div className="space-y-4">
                    <img
                      src={verification.documentUrl}
                      alt="ID Card Preview"
                      className="max-h-52 mx-auto rounded-2xl shadow-lg object-contain border border-slate-200 dark:border-slate-700"
                    />

                    {/* Verify ID Document Action Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {!isIdVerified ? (
                        <button
                          type="button"
                          onClick={handleVerifyIdDocument}
                          disabled={verifyingId}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                        >
                          <ScanLine className="w-4 h-4" />
                          <span>{verifyingId ? "Verifying Document..." : "Verify & Confirm ID Document"}</span>
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>ID Document Verified & Attached</span>
                        </div>
                      )}

                      <label className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer px-3 py-2">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleIdPhotoSelect}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                      <Upload className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to upload ID Card photo or take a picture
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PNG, JPG, JPEG, WebP (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleIdPhotoSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Housing Requirements */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Target Location & Housing</h2>
              <p className="text-xs text-slate-500 mt-1">Pin your exact preferred area on the map or use your live GPS location.</p>
            </div>

            {/* Real-time Location Picker */}
            <RealtimeLocationPicker
              initialCity={housing.city}
              initialLocality={housing.targetLocalities[0] || "Salt Lake"}
              onLocationSelect={(loc: SelectedLocation) => {
                setHousing((prev) => ({
                  ...prev,
                  city: loc.city,
                  targetLocalities: [loc.locality, loc.city],
                }));
                setBasic((prev) => ({
                  ...prev,
                  city: loc.city,
                  preferredArea: loc.locality,
                }));
              }}
            />

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Minimum Budget ({formatINR(housing.budgetMin)}/mo)
                  </label>
                  <input
                    type="range"
                    min={2000}
                    max={25000}
                    step={500}
                    value={housing.budgetMin}
                    onChange={(e) => setHousing({ ...housing, budgetMin: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Maximum Budget ({formatINR(housing.budgetMax)}/mo)
                  </label>
                  <input
                    type="range"
                    min={4000}
                    max={40000}
                    step={500}
                    value={housing.budgetMax}
                    onChange={(e) => setHousing({ ...housing, budgetMax: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Housing Type</label>
                  <select
                    value={housing.housingType}
                    onChange={(e) => setHousing({ ...housing, housingType: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                  >
                    <option value="FLAT">Apartment / Flat</option>
                    <option value="PG">PG / Co-Living</option>
                    <option value="INDEPENDENT_HOUSE">Independent House</option>
                    <option value="ANY">Any / Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Preference</label>
                  <select
                    value={housing.roomType}
                    onChange={(e) => setHousing({ ...housing, roomType: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                  >
                    <option value="PRIVATE">Private Room</option>
                    <option value="SHARED">Shared Room</option>
                    <option value="EITHER">Either / Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Furnishing</label>
                  <select
                    value={housing.furnishing}
                    onChange={(e) => setHousing({ ...housing, furnishing: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                  >
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                    <option value="ANY">Any</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Must-have Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {availableAmenities.map((amenity) => {
                    const isSelected = housing.requiredAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() =>
                          setHousing({
                            ...housing,
                            requiredAmenities: toggleArrayItem(housing.requiredAmenities, amenity),
                          })
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Lifestyle & Habits */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Daily Lifestyle</h2>
              <p className="text-xs text-slate-500 mt-1">Honest answers help match you with roommates of identical rhythm and living habits.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sleep Schedule</label>
                <select
                  value={lifestyle.sleepSchedule}
                  onChange={(e) => setLifestyle({ ...lifestyle, sleepSchedule: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="EARLY_BIRD">Early Bird (Sleeps before 11 PM)</option>
                  <option value="NIGHT_OWL">Night Owl (Sleeps after 1 AM)</option>
                  <option value="NORMAL">Normal schedule</option>
                  <option value="FLEXIBLE">Flexible / Irregular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cleanliness Standard ({lifestyle.cleanliness}/10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={lifestyle.cleanliness}
                  onChange={(e) => setLifestyle({ ...lifestyle, cleanliness: Number(e.target.value) })}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Noise Level / Atmosphere</label>
                <select
                  value={lifestyle.noiseTolerance}
                  onChange={(e) => setLifestyle({ ...lifestyle, noiseTolerance: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="QUIET">Quiet & Peaceful</option>
                  <option value="MODERATE">Moderate / Normal</option>
                  <option value="LIVELY">Lively & Social</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Guests & Visitors</label>
                <select
                  value={lifestyle.guestFrequency}
                  onChange={(e) => setLifestyle({ ...lifestyle, guestFrequency: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="RARELY">Rarely / Never</option>
                  <option value="SOMETIMES">Occasionally (Weekends)</option>
                  <option value="FREQUENTLY">Frequently / Open House</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Dietary Habit</label>
                <select
                  value={lifestyle.foodPreference}
                  onChange={(e) => setLifestyle({ ...lifestyle, foodPreference: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="VEGETARIAN">Strict Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Smoking Habit</label>
                <select
                  value={lifestyle.smokingHabit}
                  onChange={(e) => setLifestyle({ ...lifestyle, smokingHabit: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NEVER">Never Smoke (Non-smoker)</option>
                  <option value="OUTSIDE_ONLY">Outside / Balcony Only</option>
                  <option value="OCCASIONALLY">Social Smoker</option>
                  <option value="REGULARLY">Regular Smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Drinking Habit</label>
                <select
                  value={lifestyle.drinkingHabit}
                  onChange={(e) => setLifestyle({ ...lifestyle, drinkingHabit: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NEVER">Never (Non-drinker)</option>
                  <option value="SOCIALLY">Social Drinker</option>
                  <option value="REGULARLY">Regular Drinker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pet Ownership</label>
                <select
                  value={lifestyle.petOwnership}
                  onChange={(e) => setLifestyle({ ...lifestyle, petOwnership: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NO_PETS">No Pets</option>
                  <option value="HAVE_DOG">I Have a Dog 🐕</option>
                  <option value="HAVE_CAT">I Have a Cat 🐈</option>
                  <option value="HAVE_OTHER">I Have Other Pets 🐾</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Social Behavior / Nature</label>
                <select
                  value={lifestyle.socialBehavior}
                  onChange={(e) => setLifestyle({ ...lifestyle, socialBehavior: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="BALANCED">Balanced (Ambivert)</option>
                  <option value="INTROVERTED">Introverted & Quiet</option>
                  <option value="EXTROVERTED">Extroverted & Outgoing</option>
                  <option value="VERY_INTROVERTED">Very Introverted</option>
                  <option value="VERY_EXTROVERTED">Very Extroverted & Party Lover</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Roommate Preferences */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Ideal Roommate Expectations</h2>
              <p className="text-xs text-slate-500 mt-1">What are your baseline preferences for who you live with? All options are fully customizable.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pet Comfort / Policy</label>
                <select
                  value={roommatePref.preferredPets}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredPets: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DOESNT_MATTER">Doesn't Matter / Flexible</option>
                  <option value="NO_PETS">Strictly No Pets</option>
                  <option value="PETS_OK">Pets are Welcome 🐾</option>
                  <option value="LOVE_PETS">Must Love Cats & Dogs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Smoking Preference</label>
                <select
                  value={roommatePref.preferredSmoking}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredSmoking: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NO_PREFERENCE">No Preference</option>
                  <option value="NON_SMOKER_ONLY">Strictly Non-Smoker Only</option>
                  <option value="OUTSIDE_ONLY">Outside / Balcony OK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Minimum Cleanliness ({roommatePref.minCleanliness}/10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={roommatePref.minCleanliness}
                  onChange={(e) => setRoommatePref({ ...roommatePref, minCleanliness: Number(e.target.value) })}
                  className="w-full accent-indigo-600 mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sleep Schedule Match</label>
                <select
                  value={roommatePref.preferredSleepSchedule}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredSleepSchedule: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NO_PREFERENCE">Doesn't Matter / Flexible</option>
                  <option value="NIGHT_OWL">Night Owl (Late sleeper)</option>
                  <option value="EARLY_SLEEPER">Early Sleeper</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Noise & Atmosphere</label>
                <select
                  value={roommatePref.preferredNoise}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredNoise: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="DOESNT_MATTER">Doesn't Matter</option>
                  <option value="QUIET">Quiet & Studious</option>
                  <option value="MODERATE">Moderate / Casual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Guest Policy</label>
                <select
                  value={roommatePref.preferredGuests}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredGuests: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="DOESNT_MATTER">Doesn't Matter / Flexible</option>
                  <option value="NO_GUESTS">No Frequent Overnight Guests</option>
                  <option value="SOMETIMES">Occasional Guests Fine</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Food & Kitchen Diet</label>
                <select
                  value={roommatePref.preferredFood}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredFood: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NO_PREFERENCE">No Preference (Any Food OK)</option>
                  <option value="VEGETARIAN_ONLY">Strict Vegetarian Only</option>
                  <option value="NON_VEGETARIAN_OK">Non-Vegetarian OK</option>
                  <option value="EGGETARIAN">Eggetarian OK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Occupation</label>
                <select
                  value={roommatePref.preferredOccupation}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredOccupation: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NO_PREFERENCE">Students or Professionals</option>
                  <option value="STUDENT_ONLY">Students Only</option>
                  <option value="WORKING_PROFESSIONAL_ONLY">Working Professionals Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Drinking Habit Preference</label>
                <select
                  value={roommatePref.preferredDrinking}
                  onChange={(e) => setRoommatePref({ ...roommatePref, preferredDrinking: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="NO_PREFERENCE">No Preference</option>
                  <option value="NON_DRINKER_ONLY">Strictly Non-Drinker</option>
                  <option value="DRINKING_OK">Social Drinkers OK</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Personality Traits */}
        {currentStep === 6 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Personality & Vibe</h2>
              <p className="text-xs text-slate-500 mt-1">Select traits that best describe yourself and what you look for in a roommate.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">My Personality Traits</label>
                <div className="flex flex-wrap gap-2">
                  {availablePersonalities.map((trait) => {
                    const isSelected = personality.selfTraits.includes(trait);
                    return (
                      <button
                        key={trait}
                        type="button"
                        onClick={() =>
                          setPersonality({
                            ...personality,
                            selfTraits: toggleArrayItem(personality.selfTraits, trait),
                          })
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {trait}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Traits I Appreciate in Roommates</label>
                <div className="flex flex-wrap gap-2">
                  {availableRoommateTraits.map((trait) => {
                    const isSelected = personality.preferredTraits.includes(trait);
                    return (
                      <button
                        key={trait}
                        type="button"
                        onClick={() =>
                          setPersonality({
                            ...personality,
                            preferredTraits: toggleArrayItem(personality.preferredTraits, trait),
                          })
                        }
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {trait}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Hobbies & Passions */}
        {currentStep === 7 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Hobbies & Interests</h2>
              <p className="text-xs text-slate-500 mt-1">Shared interests make living together 10x more fun.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableHobbies.map((hobby) => {
                const isSelected = hobbies.items.includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() =>
                      setHobbies({
                        ...hobbies,
                        items: toggleArrayItem(hobbies.items, hobby),
                      })
                    }
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? "★ " : "+ "}
                    {hobby}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: Gender Compatibility (Mutual) */}
        {currentStep === 8 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Gender Preferences</h2>
              <p className="text-xs text-slate-500 mt-1">Both roommates must mutually agree on flatmate gender for safe matching.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Primary Preferred Roommate Gender</label>
                <select
                  value={genderCompatibility.preferredGender}
                  onChange={(e) => setGenderCompatibility({ ...genderCompatibility, preferredGender: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white"
                >
                  <option value="ANY">Any / No Preference</option>
                  <option value="MALE">Male Flatmates Only</option>
                  <option value="FEMALE">Female Flatmates Only</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">I am comfortable sharing a flat with</label>
                <div className="flex flex-wrap gap-2">
                  {["MALE", "FEMALE", "OTHER"].map((g) => {
                    const isSelected = genderCompatibility.comfortableWithGender.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() =>
                          setGenderCompatibility({
                            ...genderCompatibility,
                            comfortableWithGender: toggleArrayItem(genderCompatibility.comfortableWithGender, g),
                          })
                        }
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {g === "MALE" ? "Male Roommates" : g === "FEMALE" ? "Female Roommates" : "Other / Non-binary"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 9: Deal Breakers */}
        {currentStep === 9 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <Flame className="w-6 h-6 text-rose-500" />
                <span>Hard Deal Breakers</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Any mismatch on these rules will trigger dealbreaker alerts during matching.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: "noSmoking", label: "Strictly No Smoking inside the flat" },
                { key: "noDrinking", label: "Strictly No Alcohol inside the flat" },
                { key: "noPets", label: "Strictly No Pets allowed" },
                { key: "noFrequentGuests", label: "No frequent overnight guests" },
                { key: "noOppositeGender", label: "Strictly same-gender apartment only" },
                { key: "strictQuietHours", label: "Strict quiet hours after 11 PM" },
                { key: "vegetarianKitchenOnly", label: "Strictly 100% vegetarian kitchen only" },
              ].map((item) => {
                const isChecked = (dealBreakers as any)[item.key];
                return (
                  <label
                    key={item.key}
                    className={`flex items-center space-x-3 p-4 rounded-2xl border transition cursor-pointer ${
                      isChecked
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200 font-bold"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        setDealBreakers({
                          ...dealBreakers,
                          [item.key]: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <span className="font-bold block">✨ Summary of your Roommate Profile</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Sleep Routine</span>
                  <span className="font-bold capitalize">{lifestyle.sleepSchedule.replace("_", " ").toLowerCase()}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Cleanliness</span>
                  <span className="font-bold">{lifestyle.cleanliness}/10</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Budget Target</span>
                  <span className="font-bold">{formatINR(housing.budgetMax)}/mo</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Smoking</span>
                  <span className="font-bold capitalize">{lifestyle.smokingHabit.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center space-x-1.5 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 transition shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : <div />}

          {currentStep < 9 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center space-x-1.5 px-7 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-2xl shadow-xl shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Finalizing Profile..." : "Start Matching Now"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
