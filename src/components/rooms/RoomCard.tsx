"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import {
  Home,
  MapPin,
  Sparkles,
  Bookmark,
  Users,
  Check,
  ShieldCheck,
  Building,
} from "lucide-react";

interface RoomCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    photos: string[];
    city: string;
    locality: string;
    approximateAddress: string;
    monthlyRent: number;
    securityDeposit: number;
    furnishing: string;
    housingType: string;
    roomType: string;
    amenities: string[];
    compatibilityScore?: number;
    user: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
      isCollegeVerified: boolean;
    };
  };
  onSave?: (listingId: string) => Promise<void>;
  isSaved?: boolean;
}

export function RoomCard({ listing, onSave, isSaved = false }: RoomCardProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaved(!saved);
    if (onSave) await onSave(listing.id);
  };

  const defaultPhoto = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";
  const displayPhoto = listing.photos && listing.photos.length > 0 ? listing.photos[0] : defaultPhoto;

  return (
    <Link
      href={`/rooms/${listing.id}`}
      className="card-3d group bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Room Image Header */}
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={displayPhoto}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex items-center space-x-1.5">
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/20">
              {listing.roomType.replace("_", " ")}
            </span>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600/90 backdrop-blur-md text-white">
              {listing.housingType}
            </span>
          </div>

          <button
            onClick={handleSave}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition ${
              saved
                ? "bg-rose-500 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
          </button>

          {/* Price Tag on bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div>
              <span className="text-xl font-black">{formatINR(listing.monthlyRent)}</span>
              <span className="text-xs text-white/80 font-normal"> / month</span>
            </div>
            {listing.compatibilityScore && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-500/90 text-white backdrop-blur shadow-sm">
                {listing.compatibilityScore}% Match
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {listing.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-500 shrink-0" />
              <span className="truncate">{listing.locality}, {listing.city}</span>
            </p>
          </div>

          {/* Quick Specs */}
          <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-400 py-1 border-y border-slate-100 dark:border-slate-800">
            <span className="capitalize">{listing.furnishing.replace("_", " ").toLowerCase()}</span>
            <span>•</span>
            <span>Deposit: {formatINR(listing.securityDeposit)}</span>
          </div>

          {/* Amenities Badges */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {listing.amenities.slice(0, 3).map((am, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {am}
                </span>
              ))}
              {listing.amenities.length > 3 && (
                <span className="text-[10px] text-slate-400 px-1 py-0.5">
                  +{listing.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Host identity footer */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold uppercase">
            {listing.user.avatarUrl ? (
              <img src={listing.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              listing.user.fullName.charAt(0)
            )}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
            {listing.user.fullName}
          </span>
          {listing.user.isCollegeVerified && (
            <span title="Verified Host">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          View Room →
        </span>
      </div>
    </Link>
  );
}
