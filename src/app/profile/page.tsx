"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Sliders,
  Moon,
  HeartHandshake,
  AlertTriangle,
  Home,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Briefcase,
  Upload,
  BadgeCheck,
  Lock,
  Eye,
  Clock,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { RealtimeLocationPicker, SelectedLocation } from "@/components/maps/RealtimeLocationPicker";

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"basic" | "lifestyle" | "preferences" | "dealbreakers" | "housing" | "verification">("basic");
  const [loading, setLoading] = useState(true);
  const [savedState, setSavedState] = useState<any>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["basic", "lifestyle", "preferences", "dealbreakers", "housing", "verification"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // ID Verification state
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isCollegeVerified, setIsCollegeVerified] = useState(false);
  const [isCompanyVerified, setIsCompanyVerified] = useState(false);
  const [idType, setIdType] = useState<"COLLEGE" | "COMPANY">("COLLEGE");
  const [idInstituteName, setIdInstituteName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [idSubmitting, setIdSubmitting] = useState(false);
  const [idSuccess, setIdSuccess] = useState("");
  const [idError, setIdError] = useState("");

  const [formData, setFormData] = useState<any>({
    fullName: "",
    phone: "",
    gender: "PREFER_NOT_TO_SAY",
    city: "Kolkata",
    profile: {
      bio: "",
      occupationStatus: "STUDENT",
      collegeName: "",
      companyName: "",
      preferredArea: "",
      personalityTraits: [],
      preferredRoommateTraits: [],
      hobbies: [],
      aiSummary: "",
    },
    lifestyle: {
      sleepSchedule: null,
      wakeUpSchedule: null,
      cleanliness: null,
      noiseTolerance: null,
      guestFrequency: null,
      wfhOrStudy: null,
      cookingFrequency: null,
      foodPreference: null,
      smokingHabit: null,
      drinkingHabit: null,
      petOwnership: null,
      acUsage: null,
      socialBehavior: null,
    },
    roommatePref: {
      preferredGender: null,
      comfortableWithGender: ["MALE", "FEMALE", "OTHER"],
      preferredSleepSchedule: null,
      preferredSmoking: null,
      minCleanliness: null,
      preferredNoise: null,
      preferredGuests: null,
      preferredPets: null,
      preferredFood: null,
      preferredDrinking: null,
      preferredOccupation: null,
      ageMin: 18,
      ageMax: 35,
    },
    dealBreakers: {
      noSmoking: false,
      noDrinking: false,
      noPets: false,
      noFrequentGuests: false,
      noOppositeGender: false,
      strictQuietHours: false,
      strictCleanlinessMin: null,
      vegetarianKitchenOnly: false,
      strictMaxBudget: null,
    },
    housingReq: {
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
    },
  });

  const hasUnsavedChanges = React.useMemo(() => {
    if (!savedState || !formData) return false;
    return JSON.stringify(formData) !== JSON.stringify(savedState);
  }, [formData, savedState]);

  const fetchVerificationStatus = () => {
    fetch("/api/profile/verification")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setVerificationData(data.verification || null);
          setIsCollegeVerified(data.isCollegeVerified || false);
          setIsCompanyVerified(data.isCompanyVerified || false);
          if (data.user?.profile?.collegeName) {
            setIdInstituteName(data.user.profile.collegeName);
          } else if (data.user?.profile?.companyName) {
            setIdInstituteName(data.user.profile.companyName);
            setIdType("COMPANY");
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const merged = {
            fullName: data.user.fullName || "",
            phone: data.user.phone || "",
            gender: data.user.gender || "PREFER_NOT_TO_SAY",
            city: data.user.city || "Kolkata",
            avatarUrl: data.user.avatarUrl || null,
            profile: {
              bio: data.user.profile?.bio || "",
              occupationStatus: data.user.profile?.occupationStatus || "STUDENT",
              collegeName: data.user.profile?.collegeName || "",
              companyName: data.user.profile?.companyName || "",
              preferredArea: data.user.profile?.preferredArea || "",
              personalityTraits: data.user.profile?.personalityTraits || [],
              preferredRoommateTraits: data.user.profile?.preferredRoommateTraits || [],
              hobbies: data.user.profile?.hobbies || [],
              aiSummary: data.user.profile?.aiSummary || "",
            },
            lifestyle: {
              sleepSchedule: data.user.lifestyle?.sleepSchedule ?? null,
              wakeUpSchedule: data.user.lifestyle?.wakeUpSchedule ?? null,
              cleanliness: data.user.lifestyle?.cleanliness ?? null,
              noiseTolerance: data.user.lifestyle?.noiseTolerance ?? null,
              guestFrequency: data.user.lifestyle?.guestFrequency ?? null,
              wfhOrStudy: data.user.lifestyle?.wfhOrStudy ?? null,
              cookingFrequency: data.user.lifestyle?.cookingFrequency ?? null,
              foodPreference: data.user.lifestyle?.foodPreference ?? null,
              smokingHabit: data.user.lifestyle?.smokingHabit ?? null,
              drinkingHabit: data.user.lifestyle?.drinkingHabit ?? null,
              petOwnership: data.user.lifestyle?.petOwnership ?? null,
              acUsage: data.user.lifestyle?.acUsage ?? null,
              socialBehavior: data.user.lifestyle?.socialBehavior ?? null,
            },
            roommatePref: {
              preferredGender: data.user.roommatePref?.preferredGender ?? null,
              comfortableWithGender: data.user.roommatePref?.comfortableWithGender || ["MALE", "FEMALE", "OTHER"],
              preferredSleepSchedule: data.user.roommatePref?.preferredSleepSchedule ?? null,
              preferredSmoking: data.user.roommatePref?.preferredSmoking ?? null,
              minCleanliness: data.user.roommatePref?.minCleanliness ?? null,
              preferredNoise: data.user.roommatePref?.preferredNoise ?? null,
              preferredGuests: data.user.roommatePref?.preferredGuests ?? null,
              preferredPets: data.user.roommatePref?.preferredPets ?? null,
              preferredFood: data.user.roommatePref?.preferredFood ?? null,
              preferredDrinking: data.user.roommatePref?.preferredDrinking ?? null,
              preferredOccupation: data.user.roommatePref?.preferredOccupation ?? null,
              ageMin: data.user.roommatePref?.ageMin ?? null,
              ageMax: data.user.roommatePref?.ageMax ?? null,
            },
            dealBreakers: {
              noSmoking: Boolean(data.user.dealBreakers?.noSmoking),
              noDrinking: Boolean(data.user.dealBreakers?.noDrinking),
              noPets: Boolean(data.user.dealBreakers?.noPets),
              noFrequentGuests: Boolean(data.user.dealBreakers?.noFrequentGuests),
              noOppositeGender: Boolean(data.user.dealBreakers?.noOppositeGender),
              strictQuietHours: Boolean(data.user.dealBreakers?.strictQuietHours),
              strictCleanlinessMin: data.user.dealBreakers?.strictCleanlinessMin ?? null,
              vegetarianKitchenOnly: Boolean(data.user.dealBreakers?.vegetarianKitchenOnly),
              strictMaxBudget: data.user.dealBreakers?.strictMaxBudget ?? null,
            },
            housingReq: {
              city: data.user.housingReq?.city || "Kolkata",
              targetLocalities: data.user.housingReq?.targetLocalities || ["Salt Lake", "New Town"],
              budgetMin: data.user.housingReq?.budgetMin ?? 4000,
              budgetMax: data.user.housingReq?.budgetMax ?? 12000,
              moveInDate: data.user.housingReq?.moveInDate || "",
              rentalDuration: data.user.housingReq?.rentalDuration || "1 year",
              housingType: data.user.housingReq?.housingType || "FLAT",
              roomType: data.user.housingReq?.roomType || "PRIVATE",
              requiredAmenities: data.user.housingReq?.requiredAmenities || ["Wi-Fi", "AC", "Washing Machine"],
              furnishing: data.user.housingReq?.furnishing || "SEMI_FURNISHED",
            },
          };
          setFormData(merged);
          setSavedState(JSON.parse(JSON.stringify(merged)));
        }
      })
      .catch((err) => console.error("Error loading profile:", err))
      .finally(() => setLoading(false));

    fetchVerificationStatus();
  }, []);

  const handleIdPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setIdError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setIdPhotoPreview(event.target?.result as string);
      setIdError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInstituteName.trim()) {
      setIdError(idType === "COLLEGE" ? "Please enter your college/school name." : "Please enter your company/organization name.");
      return;
    }
    if (!idPhotoPreview) {
      setIdError("Please upload a clear photo of your ID Card.");
      return;
    }

    setIdSubmitting(true);
    setIdError("");
    setIdSuccess("");

    try {
      const res = await fetch("/api/profile/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: idType,
          instituteName: idInstituteName.trim(),
          idNumber: idNumber.trim() || null,
          documentUrl: idPhotoPreview,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit verification");

      setIdSuccess("ID Document submitted successfully! It is now under private review by RoomMate Admin.");
      fetchVerificationStatus();
    } catch (err: unknown) {
      setIdError(err instanceof Error ? err.message : "Error submitting ID verification");
    } finally {
      setIdSubmitting(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSavedState(JSON.parse(JSON.stringify(formData)));
      setSuccessMsg("Changes saved successfully.");
      window.dispatchEvent(new Event("user-updated"));
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    if (!savedState) return;
    setFormData(JSON.parse(JSON.stringify(savedState)));
    setShowDiscardModal(false);
    setSuccessMsg("Unsaved changes discarded.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Section-Specific Reset Handlers (Modifies editing state only)
  const handleClearOptionalInfo = () => {
    setFormData((prev: any) => ({
      ...prev,
      profile: {
        ...prev.profile,
        bio: "",
        hobbies: [],
        personalityTraits: [],
      },
    }));
  };

  const handleResetLifestyle = () => {
    setFormData((prev: any) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        sleepSchedule: null,
        wakeUpSchedule: null,
        cleanliness: null,
        noiseTolerance: null,
        guestFrequency: null,
        wfhOrStudy: null,
        cookingFrequency: null,
        foodPreference: null,
        smokingHabit: null,
        drinkingHabit: null,
        petOwnership: null,
        acUsage: null,
        socialBehavior: null,
      },
    }));
  };

  const handleResetRoommatePreferences = () => {
    setFormData((prev: any) => ({
      ...prev,
      roommatePref: {
        ...prev.roommatePref,
        preferredGender: null,
        preferredOccupation: null,
        preferredSleepSchedule: null,
        minCleanliness: null,
        preferredNoise: null,
        preferredSmoking: null,
        preferredDrinking: null,
        preferredGuests: null,
        preferredPets: null,
        preferredFood: null,
        ageMin: null,
        ageMax: null,
        preferredRoommateTraits: [],
      },
      profile: {
        ...prev.profile,
        preferredRoommateTraits: [],
      },
    }));
    setSuccessMsg("Roommate preferences reset to Not specified (N/A). Click 'Save Changes' to update your dashboard.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleClearDealBreakers = () => {
    setFormData((prev: any) => ({
      ...prev,
      dealBreakers: {
        ...prev.dealBreakers,
        noSmoking: false,
        noDrinking: false,
        noPets: false,
        noFrequentGuests: false,
        noOppositeGender: false,
        strictQuietHours: false,
        strictCleanlinessMin: null,
        vegetarianKitchenOnly: false,
        strictMaxBudget: null,
      },
    }));
  };

  const handleResetHousing = () => {
    setFormData((prev: any) => ({
      ...prev,
      housingReq: {
        ...prev.housingReq,
        targetLocalities: [],
        budgetMin: null,
        budgetMax: null,
        moveInDate: null,
        rentalDuration: "Flexible",
        housingType: "ANY",
        roomType: "EITHER",
        requiredAmenities: [],
        furnishing: "ANY",
      },
    }));
  };

  const toggleArrayItem = (arr: string[], item: string) => {
    if (arr.includes(item)) return arr.filter((i) => i !== item);
    return [...arr, item];
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-900 dark:text-white pb-28">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Profile & Living Preferences</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your daily living habits, room requirements, and roommate compatibility preferences.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900 text-xs font-bold flex items-center justify-between">
          <span>{error === "Unauthorized" ? "Your session has expired or requires re-authentication." : error}</span>
          {error === "Unauthorized" && (
            <button
              onClick={() => router.push("/login")}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition ml-3 shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
        {[
          { id: "basic", label: "Basic Info", icon: User },
          { id: "lifestyle", label: "My Lifestyle", icon: Moon },
          { id: "preferences", label: "Roommate Prefs", icon: HeartHandshake },
          { id: "dealbreakers", label: "Deal Breakers", icon: AlertTriangle },
          { id: "housing", label: "Housing & Budget", icon: Home },
          { id: "verification", label: "Trust Badges & Status", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* TAB 1: BASIC INFO */}
        {activeTab === "basic" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold">Identity & Background</h3>
                <p className="text-xs text-slate-500">Your core profile information and personal interests.</p>
              </div>
              <button
                type="button"
                onClick={handleClearOptionalInfo}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Clears Bio, Hobbies, and Personality Traits while keeping Name and Identity"
              >
                Clear Optional Info
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ""}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                <select
                  value={formData.gender || "PREFER_NOT_TO_SAY"}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Occupation Status</label>
                <select
                  value={formData.profile?.occupationStatus || "STUDENT"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: { ...formData.profile, occupationStatus: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="STUDENT">Student</option>
                  <option value="WORKING_PROFESSIONAL">Working Professional</option>
                  <option value="FREELANCER">Freelancer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">College / Company Name</label>
                <input
                  type="text"
                  value={formData.profile?.collegeName || formData.profile?.companyName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profile: {
                        ...formData.profile,
                        collegeName: e.target.value,
                        companyName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">About Me (Bio)</label>
              <textarea
                rows={3}
                placeholder="Tell potential roommates a little bit about yourself..."
                value={formData.profile?.bio || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    profile: { ...formData.profile, bio: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Hobbies & Interests */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  My Hobbies & Interests <span className="text-slate-400 font-normal">(Click to select/unselect)</span>
                </label>
                {(formData.profile?.hobbies?.length || 0) === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No hobbies selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
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
                ].map((hobby) => {
                  const currentHobbies: string[] = formData.profile?.hobbies || [];
                  const isSelected = currentHobbies.some(
                    (h) => h === hobby || h.toLowerCase().includes(hobby.toLowerCase()) || hobby.toLowerCase().includes(h.toLowerCase())
                  );
                  return (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => {
                        const nextHobbies = isSelected
                          ? currentHobbies.filter(
                              (h) => h !== hobby && !h.toLowerCase().includes(hobby.toLowerCase()) && !hobby.toLowerCase().includes(h.toLowerCase())
                            )
                          : [...currentHobbies, hobby];
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, hobbies: nextHobbies },
                        });
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                      }`}
                    >
                      {hobby} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personality Traits */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  My Personality Traits <span className="text-slate-400 font-normal">(Click to select/unselect)</span>
                </label>
                {(formData.profile?.personalityTraits?.length || 0) === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No personality traits selected</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
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
                ].map((trait) => {
                  const currentTraits: string[] = formData.profile?.personalityTraits || [];
                  const isSelected = currentTraits.some(
                    (t) => t === trait || t.toLowerCase().includes(trait.toLowerCase()) || trait.toLowerCase().includes(t.toLowerCase())
                  );
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => {
                        const nextTraits = isSelected
                          ? currentTraits.filter(
                              (t) => t !== trait && !t.toLowerCase().includes(trait.toLowerCase()) && !trait.toLowerCase().includes(t.toLowerCase())
                            )
                          : [...currentTraits, trait];
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, personalityTraits: nextTraits },
                        });
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                        isSelected
                          ? "bg-violet-600 text-white border-violet-600 shadow-md"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400"
                      }`}
                    >
                      {trait} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY LIFESTYLE */}
        {activeTab === "lifestyle" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold">How I Actually Live (My Lifestyle)</h3>
                <p className="text-xs text-slate-500">Your daily habits and living rhythm.</p>
              </div>
              <button
                type="button"
                onClick={handleResetLifestyle}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Resets all lifestyle fields to Not specified / N/A"
              >
                Reset Lifestyle
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sleep Schedule</label>
                <select
                  value={formData.lifestyle?.sleepSchedule ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, sleepSchedule: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NIGHT_OWL">Night Owl (Late sleep after 1 AM)</option>
                  <option value="EARLY_SLEEPER">Early Sleeper (Sleeps before 11 PM)</option>
                  <option value="NORMAL">Normal schedule</option>
                  <option value="FLEXIBLE">Flexible</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Cleanliness Level</label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {formData.lifestyle?.cleanliness != null ? `${formData.lifestyle.cleanliness}/10` : "Not specified (N/A)"}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={formData.lifestyle?.cleanliness ?? 7}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, cleanliness: Number(e.target.value) },
                    })
                  }
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Noise Tolerance</label>
                <select
                  value={formData.lifestyle?.noiseTolerance ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, noiseTolerance: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="VERY_QUIET">Very Quiet</option>
                  <option value="QUIET">Quiet & Peaceful</option>
                  <option value="MODERATE">Moderate / Normal</option>
                  <option value="LIVELY">Lively & Social</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Guests & Visitors</label>
                <select
                  value={formData.lifestyle?.guestFrequency ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, guestFrequency: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="RARELY">Rarely / Never</option>
                  <option value="SOMETIMES">Occasionally (Weekends)</option>
                  <option value="FREQUENTLY">Frequently / Open House</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Food Diet</label>
                <select
                  value={formData.lifestyle?.foodPreference ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, foodPreference: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="NO_PREFERENCE">No preference</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Smoking Habit</label>
                <select
                  value={formData.lifestyle?.smokingHabit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, smokingHabit: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NEVER">Never (Non-smoker)</option>
                  <option value="OUTSIDE_ONLY">Outside / Balcony Only</option>
                  <option value="OCCASIONALLY">Social Smoker</option>
                  <option value="REGULARLY">Regular Smoker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Drinking Habit</label>
                <select
                  value={formData.lifestyle?.drinkingHabit ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, drinkingHabit: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NEVER">Never (Non-drinker)</option>
                  <option value="SOCIALLY">Social Drinker</option>
                  <option value="REGULARLY">Regular Drinker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pet Ownership</label>
                <select
                  value={formData.lifestyle?.petOwnership ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, petOwnership: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NO_PETS">No Pets</option>
                  <option value="HAVE_DOG">I Have a Dog 🐕</option>
                  <option value="HAVE_CAT">I Have a Cat 🐈</option>
                  <option value="HAVE_OTHER">I Have Other Pets 🐾</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Social Behavior / Nature</label>
                <select
                  value={formData.lifestyle?.socialBehavior ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, socialBehavior: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="BALANCED">Balanced (Ambivert)</option>
                  <option value="INTROVERTED">Introverted & Quiet</option>
                  <option value="EXTROVERTED">Extroverted & Outgoing</option>
                  <option value="VERY_INTROVERTED">Very Introverted</option>
                  <option value="VERY_EXTROVERTED">Very Extroverted</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Work / Study from Home</label>
                <select
                  value={formData.lifestyle?.wfhOrStudy ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, wfhOrStudy: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="SOMETIMES">Hybrid / Occasionally</option>
                  <option value="FREQUENTLY">Mostly from home / room</option>
                  <option value="RARELY">Rarely (Go to college / office daily)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROOMMATE PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold">What I Look For in an Ideal Roommate</h3>
                <p className="text-xs text-slate-500">Specify preferences or choose Any/No Preference when flexible.</p>
              </div>
              <button
                type="button"
                onClick={handleResetRoommatePreferences}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Resets all roommate preferences to Not specified / N/A"
              >
                Reset Preferences
              </button>
            </div>

            {/* Basic Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender Preference</label>
                <select
                  value={formData.roommatePref?.preferredGender ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredGender: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="ANY">Any / All genders (No preference)</option>
                  <option value="MALE">Male roommates only</option>
                  <option value="FEMALE">Female roommates only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Occupation Preference</label>
                <select
                  value={formData.roommatePref?.preferredOccupation ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredOccupation: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NO_PREFERENCE">Any / No preference (Students or Professionals)</option>
                  <option value="STUDENT_ONLY">Students only</option>
                  <option value="WORKING_PROFESSIONAL_ONLY">Working Professionals only</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Age Range</label>
                  {formData.roommatePref?.ageMin == null && formData.roommatePref?.ageMax == null && (
                    <span className="text-[11px] text-slate-400 italic">Not specified (N/A)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={18}
                    max={60}
                    placeholder="Min (18)"
                    value={formData.roommatePref?.ageMin ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roommatePref: { ...formData.roommatePref, ageMin: e.target.value ? Number(e.target.value) : null },
                      })
                    }
                    className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="number"
                    min={18}
                    max={60}
                    placeholder="Max (35)"
                    value={formData.roommatePref?.ageMax ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roommatePref: { ...formData.roommatePref, ageMax: e.target.value ? Number(e.target.value) : null },
                      })
                    }
                    className="w-1/2 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Daily Routine & Noise */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sleep Schedule Compatibility</label>
                <select
                  value={formData.roommatePref?.preferredSleepSchedule ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredSleepSchedule: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NO_PREFERENCE">Any / Doesn&apos;t matter (Flexible)</option>
                  <option value="NIGHT_OWL">Night Owl (Late sleeper)</option>
                  <option value="EARLY_SLEEPER">Early to bed & rise</option>
                  <option value="NORMAL">Normal schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Noise & Atmosphere</label>
                <select
                  value={formData.roommatePref?.preferredNoise ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredNoise: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="DOESNT_MATTER">Any / Doesn&apos;t matter</option>
                  <option value="QUIET">Quiet & Peaceful</option>
                  <option value="MODERATE">Moderate / Normal</option>
                  <option value="LIVELY">Lively & Social</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Min Cleanliness</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {formData.roommatePref?.minCleanliness != null ? `≥ ${formData.roommatePref.minCleanliness}/10` : "Not specified (N/A)"}
                    </span>
                    {formData.roommatePref?.minCleanliness != null && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            roommatePref: { ...formData.roommatePref, minCleanliness: null },
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-rose-500 underline cursor-pointer"
                      >
                        Clear (N/A)
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={formData.roommatePref?.minCleanliness ?? 5}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, minCleanliness: Number(e.target.value) },
                    })
                  }
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>
            </div>

            {/* Social, Food & Habits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Guest & Friend Visits</label>
                <select
                  value={formData.roommatePref?.preferredGuests ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredGuests: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="DOESNT_MATTER">Any / Doesn&apos;t matter</option>
                  <option value="RARELY">Rarely / No frequent guests</option>
                  <option value="SOMETIMES">Occasionally (Weekends)</option>
                  <option value="FREQUENT_OK">Frequent visitors okay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Food & Kitchen Diet</label>
                <select
                  value={formData.roommatePref?.preferredFood ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredFood: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NO_PREFERENCE">Any / No preference (Any food)</option>
                  <option value="VEGETARIAN_ONLY">Vegetarian roommates only</option>
                  <option value="NON_VEG_OK">Non-vegetarian okay</option>
                  <option value="EGGETARIAN">Eggetarian okay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pet Comfort</label>
                <select
                  value={formData.roommatePref?.preferredPets ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredPets: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="DOESNT_MATTER">Any / Doesn&apos;t matter</option>
                  <option value="NO_PETS">No pets allowed</option>
                  <option value="PETS_OK">Pets are welcome</option>
                  <option value="LOVE_PETS">Loves cats & dogs</option>
                </select>
              </div>
            </div>

            {/* Smoking & Drinking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Smoking Tolerance</label>
                <select
                  value={formData.roommatePref?.preferredSmoking ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredSmoking: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NO_PREFERENCE">Any / No preference</option>
                  <option value="NON_SMOKER_ONLY">Strictly non-smoker only</option>
                  <option value="BALCONY_ONLY">Outside / Balcony smoking only</option>
                  <option value="OCCASIONAL_OK">Occasional smoker okay</option>
                  <option value="SMOKER_OK">Smoker okay</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Drinking Tolerance</label>
                <select
                  value={formData.roommatePref?.preferredDrinking ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roommatePref: { ...formData.roommatePref, preferredDrinking: e.target.value || null },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not specified (N/A)</option>
                  <option value="NO_PREFERENCE">Any / No preference</option>
                  <option value="NON_DRINKER_ONLY">Non-drinker only</option>
                  <option value="OCCASIONAL_OK">Occasional / Social drinking okay</option>
                  <option value="DRINKING_OK">Regular drinking okay</option>
                </select>
              </div>
            </div>

            {/* Desired Values & Traits in a Roommate */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Key Values & Traits I Look For in a Roommate <span className="text-slate-400 font-normal">(Click to select/unselect)</span>
                </label>
                {(formData.profile?.preferredRoommateTraits?.length || 0) === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No traits specified</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
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
                ].map((trait) => {
                  const currentTraits: string[] = formData.profile?.preferredRoommateTraits || [];
                  const isSelected = currentTraits.some(
                    (t) => t === trait || t.toLowerCase().includes(trait.toLowerCase()) || trait.toLowerCase().includes(t.toLowerCase())
                  );
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => {
                        const nextTraits = isSelected
                          ? currentTraits.filter(
                              (t) => t !== trait && !t.toLowerCase().includes(trait.toLowerCase()) && !trait.toLowerCase().includes(t.toLowerCase())
                            )
                          : [...currentTraits, trait];
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, preferredRoommateTraits: nextTraits },
                        });
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition border cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400"
                      }`}
                    >
                      {trait} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEAL BREAKERS */}
        {activeTab === "dealbreakers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">Strict Deal Breakers</h3>
                <p className="text-xs text-slate-500">Any match violating these hard criteria will be excluded from recommendations.</p>
              </div>
              <button
                type="button"
                onClick={handleClearDealBreakers}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Clears all active deal breaker rules"
              >
                Clear Deal Breakers
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { key: "noSmoking", label: "Strict No Smoking in Flat" },
                { key: "noDrinking", label: "Strict No Alcohol / Dry Home" },
                { key: "noPets", label: "No Pets Allowed" },
                { key: "noFrequentGuests", label: "No Frequent Overnight Guests" },
                { key: "strictQuietHours", label: "Strict Quiet Hours (11 PM - 7 AM)" },
                { key: "vegetarianKitchenOnly", label: "Strict Vegetarian Kitchen" },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-xs"
                >
                  <span className="font-bold">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.dealBreakers?.[item.key])}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dealBreakers: { ...formData.dealBreakers, [item.key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HOUSING & BUDGET */}
        {activeTab === "housing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold">Target Location & Housing Requirements</h3>
                <p className="text-xs text-slate-500">Pin your preferred area on the live map or set your target rent budget.</p>
              </div>
              <button
                type="button"
                onClick={handleResetHousing}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                title="Resets housing and budget criteria"
              >
                Reset Housing Preferences
              </button>
            </div>

            {/* Real-time Map Location Picker */}
            <RealtimeLocationPicker
              initialCity={formData.housingReq?.city || formData.city || "Kolkata"}
              initialLocality={formData.profile?.preferredArea || formData.housingReq?.targetLocalities?.[0] || "Salt Lake"}
              onLocationSelect={(loc: SelectedLocation) => {
                setFormData((prev: any) => ({
                  ...prev,
                  city: loc.city,
                  profile: {
                    ...prev.profile,
                    preferredArea: loc.locality,
                  },
                  housingReq: {
                    ...prev.housingReq,
                    city: loc.city,
                    targetLocalities: [loc.locality, loc.city],
                  },
                }));
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Max Monthly Budget ({formData.housingReq?.budgetMax ? `${formatINR(formData.housingReq.budgetMax)}/mo` : "Not specified (N/A)"})
                </label>
                <input
                  type="range"
                  min={3000}
                  max={30000}
                  step={500}
                  value={formData.housingReq?.budgetMax || 12000}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      housingReq: { ...formData.housingReq, budgetMax: Number(e.target.value) },
                    })
                  }
                  className="w-full mt-2 accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Style</label>
                <select
                  value={formData.housingReq?.roomType || "PRIVATE"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      housingReq: { ...formData.housingReq, roomType: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="PRIVATE">Private Room</option>
                  <option value="SHARED">Shared Room</option>
                  <option value="EITHER">Either / Flexible</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ID & TRUST VERIFICATION */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span>Student & Employee ID Verification</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify your student college card or work employee ID to earn a verified trust badge.
              </p>
            </div>

            {/* Privacy Guarantee Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start space-x-3 text-xs">
              <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-indigo-950 dark:text-indigo-200">
                  🔒 100% Private & Protected Verification
                </p>
                <p className="text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed text-[11px]">
                  Your uploaded ID card photo is encrypted and <strong>strictly private</strong>. Other roommates will never see your ID document. It is only reviewed by RoomMate Admin to grant your verified badge and prevent fake accounts.
                </p>
              </div>
            </div>

            {/* Current Active Badge Banner */}
            {isCollegeVerified && (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center space-x-1.5">
                      <span>🎓 Student Verified Badge Active</span>
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                      Your student identity is verified. Roommates can see your green verified badge on Discover and Match Cards.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCompanyVerified && !isCollegeVerified && (
              <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-blue-950 dark:text-blue-200 flex items-center space-x-1.5">
                      <span>💼 Employee Verified Badge Active</span>
                      <BadgeCheck className="w-4 h-4 text-blue-400" />
                    </h4>
                    <p className="text-xs text-blue-800/80 dark:text-blue-400/80 mt-0.5">
                      Your employment identity is verified. Roommates can see your blue verified employee badge on Discover.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Review Banner */}
            {verificationData?.status === "PENDING" && !isCollegeVerified && !isCompanyVerified && (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    ⏳ ID Verification Under Review
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                    Your {verificationData.type === "COMPANY" ? "Employee" : "Student"} ID document for <strong>{verificationData.instituteName}</strong> was received and is currently being reviewed by Admin.
                  </p>
                </div>
              </div>
            )}

            {/* Rejected / Re-upload Banner */}
            {verificationData?.status === "REJECTED" && !isCollegeVerified && !isCompanyVerified && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
                <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Verification Needs Re-submission</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  Reason: {verificationData.rejectionReason || "Uploaded ID was unreadable or could not be validated. Please re-upload a clear photo."}
                </p>
              </div>
            )}

            {/* ID Submission Form (Only if not already verified or if re-uploading) */}
            {(!isCollegeVerified && !isCompanyVerified) && (
              <form onSubmit={handleSubmitVerification} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Submit ID Document for Review
                </h4>

                {/* Occupation / ID Category Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIdType("COLLEGE")}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                      idType === "COLLEGE"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-xs font-bold">College / School Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIdType("COMPANY")}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition cursor-pointer ${
                      idType === "COMPANY"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="text-xs font-bold">Working Professional / Employee</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {idType === "COLLEGE" ? "College / University Name *" : "Company / Organization Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={idType === "COLLEGE" ? "e.g., Jadavpur University, IIT, Delhi University..." : "e.g., Google, TCS, Wipro, Infosys..."}
                      value={idInstituteName}
                      onChange={(e) => setIdInstituteName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {idType === "COLLEGE" ? "Student Roll No / ID (Optional)" : "Employee ID / Code (Optional)"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CS-2024-042 or EMP-9182"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* ID Photo Upload Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {idType === "COLLEGE" ? "Upload Student ID Card Photo *" : "Upload Employee ID Card Photo *"}
                  </label>

                  <div className="mt-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition bg-white dark:bg-slate-900">
                    {idPhotoPreview ? (
                      <div className="space-y-3">
                        <img
                          src={idPhotoPreview}
                          alt="ID Card Preview"
                          className="max-h-48 mx-auto rounded-xl shadow-md object-contain"
                        />
                        <div className="flex items-center justify-center space-x-3">
                          <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                            Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleIdPhotoSelect}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setIdPhotoPreview(null)}
                            className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-4 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Click to select ID Card image from device or camera
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
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

                {idError && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                    {idError}
                  </p>
                )}

                {idSuccess && (
                  <p className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    {idSuccess}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={idSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{idSubmitting ? "Submitting ID Document..." : "Submit ID for Verification"}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab !== "verification" && (
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">
              💡 Changes apply across your living preferences and compatibility scoring.
            </span>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Unsaved Changes Bar */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 dark:border-slate-800 text-white p-4 sm:px-6 sm:py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">You have unsaved changes</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(true)}
                disabled={saving}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Discard Unsaved Changes?</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All edits you made during this session will be reverted back to your last saved state.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-slate-400">Loading Profile & Preferences...</div>}>
      <ProfileForm />
    </Suspense>
  );
}
