"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RoomCard } from "@/components/rooms/RoomCard";
import {
  Home,
  Search,
  Plus,
  SlidersHorizontal,
  MapPin,
  Map as MapIcon,
  List,
  Sparkles,
  Building,
  Lock,
  LogIn,
  UserPlus,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface ListingItem {
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
}

export default function RoomsPage() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [cityFilter, setCityFilter] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("ALL");
  const [housingTypeFilter, setHousingTypeFilter] = useState("ALL");
  const [maxRentFilter, setMaxRentFilter] = useState(25000);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsAuthenticated(true);
          fetchRooms();
        } else {
          setIsAuthenticated(false);
          setLoading(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLoading(false);
      });
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (cityFilter) query.set("city", cityFilter);
      if (roomTypeFilter !== "ALL") query.set("roomType", roomTypeFilter);
      if (housingTypeFilter !== "ALL") query.set("housingType", housingTypeFilter);
      if (maxRentFilter < 50000) query.set("maxRent", maxRentFilter.toString());

      const res = await fetch(`/api/rooms?${query.toString()}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [roomTypeFilter, housingTypeFilter, maxRentFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-bold">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>Real Shared Living Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Shared Rooms & Apartments</h1>
          <p className="text-xs sm:text-sm text-indigo-100/80">
            Real room listings created by authenticated hosts. Matched against your personal budget and housing requirements.
          </p>
        </div>

        <Link
          href="/rooms/new"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Your Room</span>
        </Link>
      </div>

      {/* Filter and View Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city or locality (e.g. Salt Lake)..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchRooms()}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-700 dark:text-slate-300 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Grid / Map Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                viewMode === "map"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Room Type</label>
            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="ALL">All Room Types</option>
              <option value="PRIVATE">Private Room</option>
              <option value="SHARED">Shared Room</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Housing Type</label>
            <select
              value={housingTypeFilter}
              onChange={(e) => setHousingTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="ALL">All Housing Styles</option>
              <option value="FLAT">Flat / Apartment</option>
              <option value="PG">PG</option>
              <option value="HOSTEL">Hostel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Max Rent ({formatINR(maxRentFilter)}/month)
            </label>
            <input
              type="range"
              min={3000}
              max={30000}
              step={1000}
              value={maxRentFilter}
              onChange={(e) => setMaxRentFilter(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-600"
            />
          </div>
        </div>
      )}

      {/* View Content */}
      {isAuthenticated === false ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-6 shadow-2xl animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Sign In Required to Browse Room Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Please sign in or complete your profile to view verified room listings, rent pricing, and neighborhood area markers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to RoomMate</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Create Account</span>
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Home className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No room listings found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no real listings matching your filter criteria. Be the first to list a room!
          </p>
          <Link
            href="/rooms/new"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition mt-2"
          >
            + Create First Listing
          </Link>
        </div>
      ) : viewMode === "map" ? (
        /* Map View with Approximate Landmarks */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <span>Approximate Area Markers (Exact residential address protected for privacy)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((l) => (
              <div key={l.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{l.locality}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatINR(l.monthlyRent)}/mo</span>
                </div>
                <h4 className="text-xs font-bold line-clamp-1">{l.title}</h4>
                <p className="text-[11px] text-slate-500">{l.approximateAddress}</p>
                <Link
                  href={`/rooms/${l.id}`}
                  className="block text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <RoomCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
