"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Plus,
  Sparkles,
  MapPin,
  ShieldAlert,
  ArrowLeft,
  Check,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { RealtimeLocationPicker, SelectedLocation } from "@/components/maps/RealtimeLocationPicker";

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsVerified(!!data.user.isCollegeVerified);
        }
      })
      .catch(() => {});
  }, []);

  const [form, setForm] = useState({
    title: "",
    description: "",
    photos: [] as string[],
    city: "Kolkata",
    locality: "Salt Lake Sector V",
    approximateAddress: "Near Technopolis / Salt Lake Sector V Metro",
    monthlyRent: 8500,
    securityDeposit: 17000,
    roomCount: 3,
    currentRoommateCount: 2,
    totalCapacity: 3,
    availableFrom: new Date().toISOString().split("T")[0],
    furnishing: "SEMI_FURNISHED",
    housingType: "FLAT",
    roomType: "PRIVATE",
    amenities: ["Wi-Fi", "AC", "Washing Machine", "Kitchen", "Power Backup"],
    houseRules: ["Non-smokers preferred", "Respect quiet study hours after 11 PM"],
    preferredGender: "ANY",
    preferredOccupation: "ANY",
  });

  const availableAmenities = [
    "Wi-Fi", "AC", "Washing Machine", "Refrigerator", "Kitchen",
    "Parking", "Balcony", "Power Backup", "24/7 Security", "Elevator", "RO Purifier"
  ];

  const availableRules = [
    "Non-smokers preferred", "No overnight parties", "Respect quiet hours after 11 PM",
    "Vegetarian preferred", "Keep kitchen clean after use", "Pet-friendly"
  ];

  const toggleArrayItem = (arr: string[], item: string) => {
    if (arr.includes(item)) return arr.filter((i) => i !== item);
    return [...arr, item];
  };

  const handleAiAssistant = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/listing-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.description) {
        setForm((prev) => ({ ...prev, description: data.description }));
      }
    } catch {
      // fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room listing");

      router.push(`/rooms/${data.listing.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Rooms</span>
      </button>

      {isVerified === false ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5 max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase">
              Verification Required
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Room Posting Locked
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              To prevent fraudulent listings and maintain a 100% verified community, your Student or Employee ID must be approved by an administrator before publishing room listings.
            </p>
          </div>
          <div>
            <a
              href="/profile"
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              Verify ID Card in Profile →
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
            <Home className="w-3.5 h-3.5" />
            <span>Create Real Room Listing</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">List Your Available Room</h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide authentic property details. Approximate location will be displayed to safeguard privacy.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-2xl border border-rose-200 dark:border-rose-900 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-slate-900 dark:text-white">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Listing Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Spacious Private Room in 3BHK Apartment with Balcony"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Room & Property Description
                </label>
                <button
                  type="button"
                  onClick={handleAiAssistant}
                  disabled={aiLoading}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiLoading ? "Generating..." : "AI Description Assistant"}</span>
                </button>
              </div>
              <textarea
                required
                rows={4}
                placeholder="Describe room dimensions, shared spaces, roommate dynamics..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Location details with Interactive Real-Time Map */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Property Location & Interactive Map</h3>
            <RealtimeLocationPicker
              initialCity={form.city}
              initialLocality={form.locality}
              onLocationSelect={(loc: SelectedLocation) => {
                setForm((prev) => ({
                  ...prev,
                  city: loc.city,
                  locality: loc.locality,
                  approximateAddress: loc.fullAddress,
                }));
              }}
            />
          </div>

          {/* Pricing & Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                required
                min={500}
                value={form.monthlyRent}
                onChange={(e) => setForm({ ...form, monthlyRent: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                value={form.securityDeposit}
                onChange={(e) => setForm({ ...form, securityDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Available From
              </label>
              <input
                type="date"
                value={form.availableFrom}
                onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Housing Type</label>
              <select
                value={form.housingType}
                onChange={(e) => setForm({ ...form, housingType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="FLAT">Flat / Multi-bedroom apartment</option>
                <option value="APARTMENT">Gated Society Apartment</option>
                <option value="PG">PG (Paying Guest)</option>
                <option value="HOSTEL">Hostel</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Type</label>
              <select
                value={form.roomType}
                onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="PRIVATE">Private Room</option>
                <option value="SHARED">Shared Room</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Furnishing</label>
              <select
                value={form.furnishing}
                onChange={(e) => setForm({ ...form, furnishing: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="FURNISHED">Fully Furnished</option>
                <option value="SEMI_FURNISHED">Semi-Furnished</option>
                <option value="UNFURNISHED">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Amenities selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Available Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map((am) => (
                <button
                  type="button"
                  key={am}
                  onClick={() => setForm({ ...form, amenities: toggleArrayItem(form.amenities, am) })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    form.amenities.includes(am)
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {am}
                </button>
              ))}
            </div>
          </div>

          {/* House guidelines */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              House Guidelines & Expectations
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRules.map((rule) => (
                <button
                  type="button"
                  key={rule}
                  onClick={() => setForm({ ...form, houseRules: toggleArrayItem(form.houseRules, rule) })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    form.houseRules.includes(rule)
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Room Listing"}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
