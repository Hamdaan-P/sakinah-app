/**
 * QiblaCompassPage
 * Mirrors Flutter's qibla_compass_page.dart
 * Interactive compass showing direction to Makkah using Geolocation + DeviceOrientation APIs
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Info, ArrowCounterClockwise, CheckCircle, Warning } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// ==================== Constants ====================

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const COMPASS_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

const DIRECTION_FULL_NAMES: Record<string, string> = {
  N: 'North', NNE: 'North-Northeast', NE: 'Northeast', ENE: 'East-Northeast',
  E: 'East', ESE: 'East-Southeast', SE: 'Southeast', SSE: 'South-Southeast',
  S: 'South', SSW: 'South-Southwest', SW: 'Southwest', WSW: 'West-Southwest',
  W: 'West', WNW: 'West-Northwest', NW: 'Northwest', NNW: 'North-Northwest',
};

// ==================== Qibla Utilities ====================

function toRadians(deg: number) { return (deg * Math.PI) / 180; }
function toDegrees(rad: number) { return (rad * 180) / Math.PI; }

function calculateQiblaBearing(lat: number, lng: number): number {
  const lat1 = toRadians(lat);
  const lat2 = toRadians(KAABA_LAT);
  const dLng = toRadians(KAABA_LNG - lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let bearing = toDegrees(Math.atan2(y, x));
  if (bearing < 0) bearing += 360;
  return bearing;
}

function calculateDistanceKm(lat: number, lng: number): number {
  const R = 6371;
  const dLat = toRadians(KAABA_LAT - lat);
  const dLng = toRadians(KAABA_LNG - lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat)) * Math.cos(toRadians(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCompassDirection(bearing: number): string {
  const idx = Math.floor(((bearing + 11.25) % 360) / 22.5);
  return COMPASS_DIRECTIONS[idx] || 'N';
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// ==================== Component ====================

export function QiblaCompassPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [compassDirection, setCompassDirection] = useState('');
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [hasCompass, setHasCompass] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const compassTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadQiblaData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the cross-platform location helper: prefers @capacitor/geolocation
      // on native (so Android prompts the OS permission dialog properly),
      // falls back to navigator.geolocation in browsers.
      const { getCurrentLocation } = await import('@/lib/permissions');
      const coords = await getCurrentLocation();
      if (!coords) {
        setError('Location permission denied or unavailable. Please enable location access in your device settings.');
        setIsLoading(false);
        return;
      }

      const { lat: latitude, lng: longitude } = coords;
      const bearing = calculateQiblaBearing(latitude, longitude);
      const dist = calculateDistanceKm(latitude, longitude);
      const dir = getCompassDirection(bearing);

      setQiblaBearing(bearing);
      setDistanceKm(dist);
      setCompassDirection(dir);

      // Try to initialize compass (DeviceOrientation)
      const hasOrientation = 'DeviceOrientationEvent' in window;

      if (hasOrientation) {
        // iOS 13+ requires permission
        const DeviceOrientationEvt = DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<string>;
        };
        if (typeof DeviceOrientationEvt.requestPermission === 'function') {
          try {
            const perm = await DeviceOrientationEvt.requestPermission();
            if (perm !== 'granted') {
              setHasCompass(false);
              setIsLoading(false);
              return;
            }
          } catch {
            setHasCompass(false);
            setIsLoading(false);
            return;
          }
        }

        // Listen for heading updates
        let gotEvent = false;
        const handler = (e: DeviceOrientationEvent) => {
          gotEvent = true;
          // Use webkitCompassHeading for iOS, alpha for Android
          const heading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading
            ?? (e.alpha != null ? (360 - e.alpha) % 360 : null);
          if (heading != null) {
            setCompassHeading(heading);
            setHasCompass(true);
          }
        };

        window.addEventListener('deviceorientationabsolute', handler as EventListener);
        window.addEventListener('deviceorientation', handler as EventListener);

        // Timeout: if no compass event after 4s, assume no sensor
        compassTimeout.current = setTimeout(() => {
          if (!gotEvent) setHasCompass(false);
        }, 4000);
      }

      setIsLoading(false);
    } catch {
      setError('Failed to get your location. Please try again.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQiblaData();
    return () => {
      if (compassTimeout.current) clearTimeout(compassTimeout.current);
    };
  }, [loadQiblaData]);

  // Calculate needle rotation & alignment
  const { needleRotation, isAligned } = useMemo(() => {
    if (compassHeading == null) return { needleRotation: 0, isAligned: false };
    const rotation = qiblaBearing - compassHeading;
    let diff = Math.abs(qiblaBearing - compassHeading);
    if (diff > 180) diff = 360 - diff;
    return { needleRotation: rotation, isAligned: diff < 5 };
  }, [compassHeading, qiblaBearing]);

  const readableDirection = `${DIRECTION_FULL_NAMES[compassDirection] ?? compassDirection} (${Math.round(qiblaBearing)}°)`;

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="min-h-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-3 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#C9C0A8] text-base">Loading Qibla direction...</p>
        </div>
      </div>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="min-h-full relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] gap-4 px-8">
          <Warning size={64} className="text-red-400" />
          <p className="text-white text-center text-base">{error}</p>
          <button
            onClick={loadQiblaData}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#161D2C] text-white hover:bg-[#161D2C] transition-colors"
          >
            <ArrowCounterClockwise size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ---- Main ----
  return (
    <div className="min-h-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
              Qibla Compass
            </h1>
            <p className="text-xs text-[#C9C0A8] mt-1">Find direction to Makkah</p>
          </div>
          <button onClick={() => setShowInfo(true)} className="p-2 rounded-xl border border-[rgba(212,168,83,0.2)] text-[#C9C0A8] hover:border-[#D4A853]/40 transition-colors">
            <Info size={20} />
          </button>
        </motion.div>

        {/* No compass warning */}
        {!hasCompass && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl border bg-[#10151F]/90 border-[#D4A853]/30 flex items-start gap-2.5"
          >
            <Warning size={20} className="text-[#D4A853] shrink-0 mt-0.5" />
            <div className="text-xs text-[#C9C0A8] leading-relaxed space-y-1">
              <p className="font-semibold text-[#F5E8C7]">Compass not active</p>
              <p>The Qibla bearing below is correct, but your phone's magnetometer didn't report orientation.</p>
              <p>Try: hold your phone <span className="font-semibold">flat (face up)</span> and slowly trace a <span className="font-semibold">figure-8 in the air</span> for ~5 seconds to calibrate. Make sure no metal cases or magnets are nearby.</p>
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border bg-[#10151F] border-[#161D2C]/30 mb-6"
        >
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <Compass size={24} className="text-[#D4A853]" />
              <span className="text-xs text-[#C9C0A8]">Direction</span>
              <span className="text-sm font-bold text-white">{readableDirection}</span>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex flex-col items-center gap-1">
              <MapPin size={24} className="text-[#D4A853]" />
              <span className="text-xs text-[#C9C0A8]">Distance</span>
              <span className="text-sm font-bold text-white">{formatDistance(distanceKm)}</span>
            </div>
          </div>
        </motion.div>

        {/* Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-[280px] h-[280px]">
            {/* Outer ring */}
            <div className={cn(
              'absolute inset-0 rounded-full border-2 transition-colors duration-300',
              isAligned ? 'border-[#D4A853] shadow-[0_0_20px_rgba(212,168,83,0.3)]' : 'border-[#161D2C]/50',
            )} />

            {/* Compass background */}
            <div className={cn(
              'absolute inset-[10px] rounded-full transition-all duration-300',
              'bg-gradient-radial from-[#161D2C]/30 via-[#10151F]/10 to-transparent',
              isAligned
                ? 'border-[3px] border-[#D4A853] shadow-[0_0_20px_rgba(212,168,83,0.3)]'
                : 'border-2 border-[#161D2C]/50',
            )} />

            {/* Compass rose (rotates with device) */}
            {compassHeading != null && (
              <div
                className="absolute inset-[20px] transition-transform duration-500 ease-out"
                style={{ transform: `rotate(${-compassHeading}deg)` }}
              >
                {/* Cardinal directions */}
                {['N', 'E', 'S', 'W'].map((dir, i) => (
                  <div
                    key={dir}
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${i * 90}deg)` }}
                  >
                    <div className={cn(
                      'mt-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      dir === 'N' ? 'bg-[#161D2C] text-white' : 'text-white/70',
                    )}>
                      {dir}
                    </div>
                  </div>
                ))}

                {/* Degree ticks */}
                {Array.from({ length: 36 }, (_, i) => (
                  <div
                    key={`tick-${i}`}
                    className="absolute inset-0 flex justify-center"
                    style={{ transform: `rotate(${i * 10}deg)` }}
                  >
                    <div
                      className="mt-[35px] bg-white/30"
                      style={{ width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 10 : 5 }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Qibla needle */}
            <div
              className={cn(
                'absolute inset-[40px] flex justify-center transition-transform duration-500 ease-out',
                isAligned && 'animate-pulse',
              )}
              style={{ transform: compassHeading != null ? `rotate(${needleRotation}deg)` : `rotate(${qiblaBearing}deg)` }}
            >
              {/* Needle shaft */}
              <div className={cn(
                'w-1 h-[80px] rounded-full',
                isAligned
                  ? 'bg-gradient-to-b from-[#D4A853] to-[#D4A853]/50 shadow-[0_0_10px_rgba(212,168,83,0.5)]'
                  : 'bg-gradient-to-b from-[#161D2C] to-[#10151F]',
              )} />
              {/* Arrow head */}
              <div
                className="absolute top-[10px] left-1/2 -translate-x-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: `20px solid ${isAligned ? '#D4A853' : '#161D2C'}`,
                }}
              />
            </div>

            {/* Center Kaaba icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                'w-[60px] h-[60px] rounded-full flex items-center justify-center border-2 bg-[#10151F]',
                isAligned ? 'border-[#D4A853]' : 'border-[rgba(212,168,83,0.2)]',
              )}>
                <span className={cn('text-2xl', isAligned ? 'text-[#D4A853]' : 'text-white')}>
                  🕌
                </span>
              </div>
            </div>

            {/* Alignment indicator */}
            <AnimatePresence>
              {isAligned && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: [0.95, 1.05, 0.95] }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ scale: { repeat: Infinity, duration: 1 } }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                >
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4A853] text-white text-sm font-bold">
                    <CheckCircle size={16} />
                    Aligned with Qibla
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Calibration hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-3 rounded-xl bg-[#10151F]/50 flex items-center gap-2"
        >
          <Info size={20} className="text-white/70 shrink-0" />
          <p className="text-xs text-white/70">
            {compassHeading == null
              ? 'Compass sensor not available on this device'
              : 'Move your device in a figure-8 pattern to calibrate'}
          </p>
        </motion.div>
      </div>

      {/* Info Dialog */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">How to use</h3>
              <div className="space-y-3">
                {[
                  'Hold your device flat and parallel to the ground',
                  'The golden needle will point towards the Qibla (Kaaba in Makkah)',
                  'When aligned correctly, the compass will glow gold',
                  'If compass is not calibrated, move your device in a figure-8 pattern',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#161D2C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/90">{text}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="mt-5 w-full py-2.5 rounded-xl text-[#D4A853] font-medium hover:bg-[#D4A853]/10 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
