"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Search, Loader2, CheckCircle2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface SelectedLocation {
  city: string;
  locality: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

interface RealtimeLocationPickerProps {
  initialCity?: string;
  initialLocality?: string;
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: SelectedLocation) => void;
}

export function RealtimeLocationPicker({
  initialCity = "Kolkata",
  initialLocality = "Salt Lake",
  initialLat = 22.5726,
  initialLng = 88.3639,
  onLocationSelect,
}: RealtimeLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>(
    initialLocality ? `${initialLocality}, ${initialCity}` : initialCity
  );
  const [currentCity, setCurrentCity] = useState<string>(initialCity);
  const [currentLocality, setCurrentLocality] = useState<string>(initialLocality);

  // Custom high-visibility glowing Pin Icon (SVG DivIcon, 0 dependency on external asset loading)
  const createPinIcon = useCallback((L: any) => {
    return L.divIcon({
      className: "custom-map-pin",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 8px;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.5), 0 0 0 3px white;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style="
            width: 8px;
            height: 8px;
            background: #4f46e5;
            border-radius: 50%;
            margin-top: 2px;
            box-shadow: 0 0 8px #4f46e5;
          "></div>
        </div>
      `,
      iconSize: [36, 46],
      iconAnchor: [18, 46],
      popupAnchor: [0, -46],
    });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isCancelled = false;

    import("leaflet").then((L) => {
      if (isCancelled || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const pinIcon = createPinIcon(L);

        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 14,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        // Marker drag handler
        marker.on("dragend", async (e: any) => {
          const newPos = e.target.getLatLng();
          setCoords({ lat: newPos.lat, lng: newPos.lng });
          await reverseGeocode(newPos.lat, newPos.lng);
        });

        // Map click handler
        map.on("click", async (e: any) => {
          marker.setLatLng(e.latlng);
          setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
          await reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      }
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [createPinIcon]);

  // Reverse Geocoding with OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();

      if (data && data.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state_district ||
          data.address.state ||
          "Kolkata";
        const locality =
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.residential ||
          data.address.road ||
          city;
        const fullAddr = data.display_name || `${locality}, ${city}`;

        setCurrentCity(city);
        setCurrentLocality(locality);
        setCurrentAddress(fullAddr);

        onLocationSelect({
          city,
          locality,
          fullAddress: fullAddr,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (err) {
      console.warn("Reverse geocode fallback:", err);
    }
  };

  // Perform Live Location Search
  const executeSearch = async (queryText: string) => {
    if (!queryText.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryText.trim()
        )}&countrycodes=in&limit=6&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.warn("Search location error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Debounced auto-search on typing
  const handleQueryChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length >= 3) {
      debounceTimerRef.current = setTimeout(() => {
        executeSearch(val);
      }, 400);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    executeSearch(searchQuery);
  };

  // Selecting a Search Result
  const selectSearchResult = (item: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setCoords({ lat, lng });

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.invalidateSize();
    }

    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.state_district ||
      "Kolkata";
    const locality =
      item.address?.suburb ||
      item.address?.neighbourhood ||
      item.address?.road ||
      city;
    const fullAddr = item.display_name;

    setCurrentCity(city);
    setCurrentLocality(locality);
    setCurrentAddress(fullAddr);
    setSearchResults([]);
    setSearchQuery(locality || city);

    onLocationSelect({
      city,
      locality,
      fullAddress: fullAddr,
      latitude: lat,
      longitude: lng,
    });
  };

  // GPS / Browser Geolocation
  const handleUseCurrentLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords({ lat, lng });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.invalidateSize();
        }

        await reverseGeocode(lat, lng);
        setGeoLoading(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setGeoLoading(false);
        alert("Unable to retrieve your location. Please check browser GPS permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-white">
            <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Real-Time Location Picker</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Search your locality, drag the glowing pin (📍), or click anywhere on the map.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {geoLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>{geoLoading ? "Detecting GPS..." : "📍 Use My Current Location"}</span>
        </button>
      </div>

      {/* Live Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Type area (e.g. Salt Lake, Koramangala, Powai, Hinjewadi)..."
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchSubmit(e);
                }
              }}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={searching}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-[1000] max-h-56 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Matching Locations ({searchResults.length}) - Click to jump
            </div>
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => selectSearchResult(item, e)}
                className="w-full text-left px-3.5 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-start space-x-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-[11px]">
                    {item.address?.suburb || item.address?.neighbourhood || item.address?.city || item.display_name.split(",")[0]}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.display_name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Selected Location Details Card */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-start space-x-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                {currentLocality ? `${currentLocality}, ${currentCity}` : currentCity}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Selected
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {currentAddress}
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shrink-0 self-start sm:self-auto">
          📍 {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
        </div>
      </div>
    </div>
  );
}
