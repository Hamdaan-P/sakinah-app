/**
 * Masjid Finder Page
 * Uses Geolocation API + Overpass API to find nearby mosques
 * Shows list of mosques with distance, directions link, and details
 * Converted from: masjid_finder_page.dart
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  NavigationArrow,
  MagnifyingGlass,
  SpinnerGap,
  WarningCircle,
  CaretLeft,
  ArrowSquareOut,
  ArrowsClockwise,
  Crosshair,
  Buildings,
} from '@phosphor-icons/react';

interface Mosque {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  address?: string;
  amenity?: string;
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 16-point compass direction
function getDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  if (bearing < 0) bearing += 360;
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(bearing / 22.5) % 16];
}

export function MasjidFinderPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMosques = useCallback(async (lat: number, lon: number, radius: number) => {
    setLoading(true);
    setError(null);
    try {
      // Overpass API query for mosques within radius
      const radiusM = radius * 1000;
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusM},${lat},${lon});
          node["building"="mosque"](around:${radiusM},${lat},${lon});
          way["building"="mosque"](around:${radiusM},${lat},${lon});
        );
        out center body;
      `;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error('Failed to fetch mosques');
      const data = await res.json();

      const results: Mosque[] = (data.elements || []).map((el: Record<string, unknown>) => {
        const elLat = (el.lat as number) || (el.center as Record<string, number>)?.lat || 0;
        const elLon = (el.lon as number) || (el.center as Record<string, number>)?.lon || 0;
        const tags = (el.tags || {}) as Record<string, string>;
        return {
          id: el.id as number,
          name: tags.name || tags['name:en'] || 'Mosque',
          lat: elLat,
          lon: elLon,
          distance: haversine(lat, lon, elLat, elLon),
          address: tags['addr:full'] || tags['addr:street'] || undefined,
          amenity: tags.amenity || tags.building || 'mosque',
        };
      });

      results.sort((a, b) => a.distance - b.distance);
      setMosques(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search for mosques');
    } finally {
      setLoading(false);
    }
  }, []);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
        fetchMosques(pos.coords.latitude, pos.coords.longitude, searchRadius);
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Location permission denied. Please enable location access.',
          2: 'Location unavailable. Please try again.',
          3: 'Location request timed out.',
        };
        setError(msgs[err.code] || 'Failed to get location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchMosques, searchRadius]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const handleRadiusChange = (r: number) => {
    setSearchRadius(r);
    if (userLat !== null && userLon !== null) {
      fetchMosques(userLat, userLon, r);
    }
  };

  const openDirections = (mosque: Mosque) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`;
    window.open(url, '_blank');
  };

  const filtered = mosques.filter((m) =>
    searchQuery === '' || m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#10151F]/95 backdrop-blur-sm border-b border-[rgba(212,168,83,0.2)]/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/faith')} className="p-2 rounded-lg hover:bg-white/10">
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#F5E8C7]">Masjid Finder</h1>
            <p className="text-xs text-[#7A7363]">
              {userLat !== null ? `${mosques.length} mosques within ${searchRadius} km` : 'Getting location...'}
            </p>
          </div>
          <button onClick={getLocation} className="p-2 rounded-lg hover:bg-white/10" title="Refresh location">
            <ArrowsClockwise size={20} className={`text-[#D4A853] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search + Radius */}
      <div className="px-4 pt-4 space-y-3">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7363]" />
          <input
            type="text"
            placeholder="Search by mosque name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-[#D4A853]/50"
          />
        </div>

        {/* Radius chips */}
        <div className="flex gap-2">
          {[5, 10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                searchRadius === r
                  ? 'bg-[#D4A853] text-[#10151F]'
                  : 'bg-[#10151F] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)] hover:border-[#D4A853]/50'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <SpinnerGap size={32} className="text-[#D4A853] animate-spin mb-3" />
          <p className="text-[#C9C0A8] text-sm">Searching for nearby mosques...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mx-4 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <WarningCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-medium">Location Error</p>
              <p className="text-red-300/70 text-xs mt-1">{error}</p>
              <button
                onClick={getLocation}
                className="mt-3 px-4 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location info card */}
      {userLat !== null && userLon !== null && !loading && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 flex items-center gap-3">
          <Crosshair size={20} className="text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[#F5E8C7] text-xs font-medium">Your Location</p>
            <p className="text-[#7A7363] text-xs">{userLat.toFixed(4)}°N, {userLon.toFixed(4)}°E</p>
          </div>
        </div>
      )}

      {/* Mosque list */}
      {!loading && !error && (
        <div className="px-4 mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Buildings size={40} className="text-[#7A7363] mx-auto mb-3" />
              <p className="text-[#C9C0A8] text-sm">No mosques found in this area</p>
              <p className="text-[#7A7363] text-xs mt-1">Try increasing the search radius</p>
            </div>
          ) : (
            filtered.map((mosque, i) => (
              <motion.div
                key={mosque.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 hover:border-[#D4A853]/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#F5E8C7] font-semibold text-sm truncate">{mosque.name}</h3>
                    {mosque.address && (
                      <p className="text-[#7A7363] text-xs mt-0.5 truncate">{mosque.address}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[#D4A853] text-xs font-medium">
                        {mosque.distance < 1
                          ? `${Math.round(mosque.distance * 1000)} m`
                          : `${mosque.distance.toFixed(1)} km`}
                      </span>
                      {userLat !== null && userLon !== null && (
                        <span className="text-[#7A7363] text-xs">
                          {getDirection(userLat, userLon, mosque.lat, mosque.lon)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => openDirections(mosque)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D4A853]/15 text-[#D4A853] text-xs font-medium hover:bg-[#D4A853]/25 transition-colors shrink-0"
                  >
                    <NavigationArrow size={14} />
                    Directions
                  </button>
                </div>
              </motion.div>
            ))
          )}

          {/* Open in Maps button */}
          {userLat !== null && userLon !== null && filtered.length > 0 && (
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/mosque/@${userLat},${userLon},14z`,
                  '_blank'
                )
              }
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-sm font-medium hover:bg-[#D4A853]/25 transition-colors"
            >
              <ArrowSquareOut size={16} />
              View All on Google Maps
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MasjidFinderPage;
