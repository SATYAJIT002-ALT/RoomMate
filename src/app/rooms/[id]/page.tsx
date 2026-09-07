"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import {
  Home,
  MapPin,
  Sparkles,
  Bookmark,
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Star,
  Building,
  Users,
  Calendar,
  Layers,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { ReviewModal } from "@/components/modals/ReviewModal";
import { ReportModal } from "@/components/modals/ReportModal";

interface ListingDetail {
  id: string;
  userId: string;
  title: string;
  description: string;
  photos: string[];
  city: string;
  locality: string;
  approximateAddress: string;
  monthlyRent: number;
  securityDeposit: number;
  roomCount: number;
  currentRoommateCount: number;
  totalCapacity: number;
  availableFrom: string;
  furnishing: string;
  housingType: string;
  roomType: string;
  amenities: string[];
  houseRules: string[];
  preferredGender: string;
  preferredOccupation: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
    city: string;
    gender: string;
    isCollegeVerified: boolean;
    isEmailVerified: boolean;
    profile?: {
      bio?: string | null;
      occupationStatus: string;
      collegeName?: string | null;
      companyName?: string | null;
    } | null;
  };
  reviews: {
    id: string;
    author: { id: string; fullName: string; avatarUrl?: string | null };
    overallRating: number;
    cleanlinessRating: number;
    communicationRating: number;
    content: string;
    createdAt: string;
  }[];
  _count: { savedBy: number };
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Room listing not found");

      setListing(data.listing);
      setCompatibility(data.compatibility);
      setIsSaved(data.isSaved);
      setIsOwner(data.isOwner);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading listing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const handleToggleSave = async () => {
    setIsSaved(!isSaved);
    await fetch("/api/saved/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: id }),
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your room listing?")) return;
    await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    router.push("/rooms");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-6 animate-pulse">
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="text-xl font-bold">{error || "Listing not found"}</h2>
        <Link href="/rooms" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Listings
        </Link>
      </div>
    );
  }

  const defaultPhoto = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";
  const displayPhotos = listing.photos && listing.photos.length > 0 ? listing.photos : [defaultPhoto];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-white">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center space-x-2">
          {isOwner ? (
            <button
              onClick={handleDelete}
              className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl hover:bg-rose-100 text-xs font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Listing</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition ${
                  isSaved
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-600"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
                title="Save Room"
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-600" : ""}`} />
              </button>
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 text-xs hover:bg-slate-100"
              >
                Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Image Showcase */}
      <div className="relative rounded-3xl overflow-hidden h-[360px] sm:h-[460px] bg-slate-900 shadow-xl">
        <img
          src={displayPhotos[0]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600">
                {listing.housingType}
              </span>
              <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white/20 backdrop-blur">
                {listing.roomType.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{listing.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-indigo-400 shrink-0" />
              <span>{listing.locality}, {listing.city} • {listing.approximateAddress}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0">
            <span className="text-xs text-indigo-200 block">Monthly Rent</span>
            <span className="text-2xl font-black text-white">{formatINR(listing.monthlyRent)}</span>
            <span className="text-xs text-slate-300 block">Deposit: {formatINR(listing.securityDeposit)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Details vs Side Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specs, Description, Compatibility */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Compatibility Breakdown Card */}
          {compatibility && (
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-2xl bg-emerald-600 text-white font-black text-sm">
                    {compatibility.overallScore}%
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                      Housing Compatibility Match
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Evaluated against your budget, preferred area, and requested facilities
                    </p>
                  </div>
                </div>
              </div>

              {compatibility.strengths.length > 0 && (
                <div className="space-y-1 pt-1">
                  {compatibility.strengths.map((str: string, idx: number) => (
                    <div key={idx} className="flex items-center text-xs text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}

              {compatibility.notes.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                  {compatibility.notes.map((note: string, idx: number) => (
                    <div key={idx} className="flex items-center text-xs text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 mr-2 shrink-0" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Furnishing</span>
              <span className="text-xs font-bold capitalize">{listing.furnishing.replace("_", " ").toLowerCase()}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available From</span>
              <span className="text-xs font-bold">{new Date(listing.availableFrom).toLocaleDateString()}</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Rooms</span>
              <span className="text-xs font-bold">{listing.roomCount} Rooms ({listing.currentRoommateCount} flatmates)</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Preferred Gender</span>
              <span className="text-xs font-bold capitalize">{listing.preferredGender.toLowerCase()}</span>
            </div>
          </div>

          {/* Property Description */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              About This Living Space
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Included Amenities & Perks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {listing.amenities.map((am, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{am}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          {listing.houseRules.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                House Guidelines
              </h3>
              <div className="flex flex-wrap gap-2">
                {listing.houseRules.map((rule, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Roommate Reviews ({listing.reviews.length})
              </h3>
              <button
                onClick={() => setIsReviewOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100"
              >
                + Write a Review
              </button>
            </div>

            {listing.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reviews yet for this room listing.</p>
            ) : (
              <div className="space-y-3">
                {listing.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{rev.author.fullName}</span>
                      <div className="flex items-center text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        <span>{rev.overallRating} / 5.0</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{rev.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Host Card & Direct Contact */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sticky top-24">
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Listed by Authenticated Host
              </span>

              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg uppercase shadow-md">
                  {listing.user.avatarUrl ? (
                    <img src={listing.user.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    listing.user.fullName.charAt(0)
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-base font-bold">{listing.user.fullName}</h4>
                    {listing.user.isCollegeVerified && (
                      <span title="Verified Host">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {listing.user.profile?.occupationStatus === "STUDENT"
                      ? listing.user.profile.collegeName || "Student Host"
                      : listing.user.profile?.companyName || "Professional Host"}
                  </p>
                </div>
              </div>

              {listing.user.profile?.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  &ldquo;{listing.user.profile.bio}&rdquo;
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Link
                href={`/messages`}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Host Directly</span>
              </Link>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
              <span className="font-bold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                RoomMate Safety First
              </span>
              <p>Never transfer security deposits without viewing the room in person and checking documentation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        targetListingId={id}
        targetName={listing.title}
        onSuccess={fetchListing}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetListingId={id}
        targetName={listing.title}
      />
    </div>
  );
}
