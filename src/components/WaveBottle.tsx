import React, { useMemo } from 'react';
import { Sparkles, Trophy, Plus } from 'lucide-react';
import { VolumeUnit } from '../types/hydration';
import { formatVolume } from '../utils/calculator';

interface WaveBottleProps {
  currentMl: number;
  goalMl: number;
  unit: VolumeUnit;
  onQuickAdd: (ml: number) => void;
  statusText?: string;
  isCompleted?: boolean;
}

export const WaveBottle: React.FC<WaveBottleProps> = ({
  currentMl,
  goalMl,
  unit,
  onQuickAdd,
  statusText,
  isCompleted = false,
}) => {
  const percentage = useMemo(() => {
    if (!goalMl || goalMl <= 0) return 0;
    return Math.min(100, Math.round((currentMl / goalMl) * 100));
  }, [currentMl, goalMl]);

  // Water height percentage for SVG container (minimum 6% for visual puddle, max 96%)
  const liquidHeightPercent = useMemo(() => {
    if (percentage <= 0) return 4;
    return Math.min(96, Math.max(6, percentage * 0.94));
  }, [percentage]);

  const remainingMl = Math.max(0, goalMl - currentMl);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
      {/* Background ambient radial glow */}
      <div 
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: isCompleted 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: isCompleted 
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, transparent 70%)',
        }}
      />

      {/* Main Hydration Bottle Cylinder Visual */}
      <div className="relative w-48 sm:w-56 h-72 sm:h-80 flex items-center justify-center">
        {/* Glass Carafe Container */}
        <div className="relative w-full h-full rounded-[2.5rem] border-2 border-slate-700/60 bg-slate-950/60 backdrop-blur-lg overflow-hidden shadow-2xl flex flex-col justify-end">
          
          {/* Glass Cap / Lip accent */}
          <div className="absolute top-0 inset-x-8 h-3 bg-gradient-to-b from-slate-700/80 to-transparent rounded-b-md z-20 pointer-events-none" />

          {/* Measurement ticks on the left edge */}
          <div className="absolute left-3 top-6 bottom-6 flex flex-col justify-between z-20 pointer-events-none text-[10px] font-mono text-slate-500/70 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1px] bg-slate-600/70" />
              <span>100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-[1px] bg-slate-700/70" />
              <span>75%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1px] bg-slate-600/70" />
              <span>50%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-[1px] bg-slate-700/70" />
              <span>25%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1px] bg-slate-600/70" />
              <span>0%</span>
            </div>
          </div>

          {/* Glass Reflection Highlight */}
          <div className="absolute top-2 right-4 bottom-4 w-4 bg-gradient-to-l from-white/10 to-transparent rounded-full z-20 pointer-events-none" />
          <div className="absolute top-2 left-3 w-1.5 h-3/4 bg-white/5 rounded-full z-20 pointer-events-none" />

          {/* Dynamic Fluid Liquid Fill Area */}
          <div
            className="relative w-full transition-all duration-1000 ease-out flex flex-col justify-end"
            style={{ height: `${liquidHeightPercent}%` }}
          >
            {/* Wave Tops SVG */}
            <div className="absolute -top-5 left-0 w-[200%] h-6 z-10 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full animate-wave-1 opacity-70 fill-sky-400"
              >
                <path d="M0,0 C150,90 350,-40 500,45 C650,130 850,-30 1000,50 C1150,130 1200,60 1200,60 L1200,120 L0,120 Z" />
              </svg>
            </div>
            <div className="absolute -top-4 -left-12 w-[200%] h-5 z-10 overflow-hidden pointer-events-none">
              <svg
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
                className="w-full h-full animate-wave-2 opacity-60 fill-cyan-300"
              >
                <path d="M0,20 C180,-30 320,80 500,20 C680,-40 820,70 1000,10 C1120,-30 1200,40 1200,40 L1200,120 L0,120 Z" />
              </svg>
            </div>

            {/* Liquid Body with aquatic gradient */}
            <div
              className={`w-full h-full transition-colors duration-1000 relative ${
                isCompleted
                  ? 'bg-gradient-to-t from-emerald-600/90 via-teal-500/80 to-cyan-400/80'
                  : 'bg-gradient-to-t from-sky-700/90 via-sky-500/80 to-cyan-400/80'
              }`}
            >
              {/* Internal Floating Bubbles */}
              <div
                className="bubble-particle absolute left-1/4 bottom-3 w-2 h-2 rounded-full bg-white/40 pointer-events-none"
                style={{ animationDelay: '0.2s', animationDuration: '3.2s' }}
              />
              <div
                className="bubble-particle absolute left-2/3 bottom-8 w-1.5 h-1.5 rounded-full bg-white/50 pointer-events-none"
                style={{ animationDelay: '1.4s', animationDuration: '4.1s' }}
              />
              <div
                className="bubble-particle absolute left-1/2 bottom-1 w-2.5 h-2.5 rounded-full bg-white/30 pointer-events-none"
                style={{ animationDelay: '2.5s', animationDuration: '3.8s' }}
              />
            </div>
          </div>

          {/* Centered Volume & Target readout over the glass */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center px-4">
            <div className="bg-slate-950/75 border border-slate-700/50 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1 font-mono">
                <span>{percentage}</span>
                <span className="text-base font-normal text-sky-400">%</span>
              </div>
              <div className="text-xs font-medium text-slate-300 mt-0.5">
                {formatVolume(currentMl, unit)}
              </div>
              <div className="text-[11px] text-slate-500">
                of {formatVolume(goalMl, unit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target status & quick action footer */}
      <div className="mt-5 w-full text-center flex flex-col items-center">
        {isCompleted ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wide">
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Goal Reached Today!</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            <span>Remaining: </span>
            <span className="font-semibold text-slate-200 font-mono">
              {formatVolume(remainingMl, unit)}
            </span>
          </div>
        )}

        {statusText && (
          <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
            {statusText}
          </p>
        )}

        {/* Quick Sip Button right under bottle */}
        <button
          onClick={() => onQuickAdd(250)}
          className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 hover:text-sky-200 text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Quick log 250ml water"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Sip (+{formatVolume(250, unit)})</span>
        </button>
      </div>
    </div>
  );
};
