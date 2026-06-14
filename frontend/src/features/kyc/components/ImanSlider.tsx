/**
 * Iman Slider — Gold gradient slider with emoji labels
 * "If your iman had a battery percentage right now — what would it be?"
 */

import { useState, useCallback } from 'react';
import { IMAN_SLIDER_LABELS } from '../types/kyc.types';

interface ImanSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const LABEL_KEYS = [0, 25, 50, 75, 100] as const;

function getClosestLabel(value: number): string {
  let closest = 0;
  let minDist = Infinity;
  for (const k of LABEL_KEYS) {
    const dist = Math.abs(value - k);
    if (dist < minDist) {
      minDist = dist;
      closest = k;
    }
  }
  return IMAN_SLIDER_LABELS[closest];
}

function getEmoji(value: number): string {
  if (value <= 10) return '🪫';
  if (value <= 30) return '😔';
  if (value <= 55) return '😐';
  if (value <= 80) return '🤲';
  return '✨';
}

export function ImanSlider({ value, onChange }: ImanSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  return (
    <div className="space-y-4">
      {/* Current value display */}
      <div className="text-center">
        <span className="text-4xl">{getEmoji(value)}</span>
        <p className="text-[#D4A853] font-bold text-2xl mt-1">{value}%</p>
        <p className="text-[#F5E8C7] text-sm font-medium">{getClosestLabel(value)}</p>
      </div>

      {/* Slider */}
      <div className="relative px-1">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="iman-slider w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #5C5749 ${0}%, #D4A853 ${value}%, #10151F ${value}%)`,
          }}
        />

        {/* Track labels */}
        <div className="flex justify-between mt-3 px-0.5">
          {LABEL_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={`text-[10px] transition-colors cursor-pointer ${
                Math.abs(value - k) <= 12
                  ? 'text-[#D4A853] font-medium'
                  : 'text-[#5C5749]'
              }`}
              style={{ width: '20%', textAlign: k === 0 ? 'left' : k === 100 ? 'right' : 'center' }}
            >
              {k}%
            </button>
          ))}
        </div>
      </div>

      {/* Custom slider styles */}
      <style>{`
        .iman-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: ${isDragging ? '28px' : '24px'};
          height: ${isDragging ? '28px' : '24px'};
          border-radius: 50%;
          background: linear-gradient(135deg, #D4A853, #E8C97A);
          border: 3px solid #0A0E16;
          box-shadow: 0 0 12px rgba(212,168,83, 0.4);
          cursor: pointer;
          transition: width 0.15s, height 0.15s, box-shadow 0.15s;
        }
        .iman-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 20px rgba(212,168,83, 0.6);
        }
        .iman-slider::-moz-range-thumb {
          width: ${isDragging ? '28px' : '24px'};
          height: ${isDragging ? '28px' : '24px'};
          border-radius: 50%;
          background: linear-gradient(135deg, #D4A853, #E8C97A);
          border: 3px solid #0A0E16;
          box-shadow: 0 0 12px rgba(212,168,83, 0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
