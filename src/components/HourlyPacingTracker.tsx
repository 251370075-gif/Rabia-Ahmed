import React from 'react';
import { Clock, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { HydrationLogEntry, VolumeUnit } from '../types/hydration';
import {
  calculatePacingStatus,
  formatVolume,
} from '../utils/calculator';

interface HourlyPacingTrackerProps {
  entries: HydrationLogEntry[];
  currentEffectiveMl: number;
  goalMl: number;
  wakeTime: string;
  bedTime: string;
  unit: VolumeUnit;
}

export const HourlyPacingTracker: React.FC<HourlyPacingTrackerProps> = ({
  entries,
  currentEffectiveMl,
  goalMl,
  wakeTime,
  bedTime,
  unit,
}) => {
  const pacing = calculatePacingStatus(currentEffectiveMl, goalMl, wakeTime, bedTime);

  // Group entries by hour of day (0-23)
  const hourlyIntake: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourlyIntake[i] = 0;
  }

  entries.forEach((entry) => {
    try {
      const d = new Date(entry.timestamp);
      const hour = d.getHours();
      hourlyIntake[hour] = (hourlyIntake[hour] || 0) + entry.effectiveAmountMl;
    } catch {
      // ignore
    }
  });

  const [wakeHour] = wakeTime.split(':').map(Number);
  const [bedHour] = bedTime.split(':').map(Number);

  // Display hours between wakeHour and bedHour (e.g. 7am to 11pm)
  const displayHours: number[] = [];
  const start = isNaN(wakeHour) ? 7 : wakeHour;
  const end = isNaN(bedHour) ? 23 : bedHour;
  for (let h = start; h <= end; h++) {
    displayHours.push(h);
  }

  const currentHour = new Date().getHours();

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Hourly Hydration Pacing</h3>
            <p className="text-xs text-slate-400">Steady fluid distribution across your awake hours</p>
          </div>
        </div>

        {/* Pacing status badge */}
        <div className="flex items-center gap-2">
          {pacing.status === 'completed' ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Goal Complete</span>
            </div>
          ) : pacing.status === 'ahead' ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Ahead of Schedule</span>
            </div>
          ) : pacing.status === 'on_track' ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>On Target</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Behind Schedule</span>
            </div>
          )}
        </div>
      </div>

      {/* Status banner description */}
      <div className="mt-3 text-xs text-slate-300 flex items-center justify-between">
        <span>{pacing.message}</span>
        <span className="font-mono text-slate-400">
          Expected now: ~{formatVolume(pacing.expectedMl, unit)}
        </span>
      </div>

      {/* Hourly distribution bar chart */}
      <div className="mt-4 pt-2">
        <div className="h-20 flex items-end gap-1 sm:gap-1.5">
          {displayHours.map((hour) => {
            const amount = hourlyIntake[hour] || 0;
            // Scale bar relative to maximum typical drink or 600ml
            const maxRef = Math.max(600, ...Object.values(hourlyIntake));
            const heightPercent = amount > 0 ? Math.min(100, Math.max(15, (amount / maxRef) * 100)) : 0;
            const isCurrent = hour === currentHour;
            const isPast = hour < currentHour;

            return (
              <div key={hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                {amount > 0 && (
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-sky-300 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow pointer-events-none z-20 whitespace-nowrap">
                    {formatVolume(amount, unit)}
                  </div>
                )}

                {/* The vertical bar */}
                <div
                  className={`w-full rounded-t transition-all ${
                    amount > 0
                      ? 'bg-sky-400 hover:bg-sky-300 shadow-sm'
                      : isPast
                      ? 'bg-slate-800/40'
                      : 'bg-slate-800/20'
                  } ${isCurrent ? 'ring-1 ring-sky-400 ring-offset-1 ring-offset-slate-950' : ''}`}
                  style={{ height: `${heightPercent}%`, minHeight: amount > 0 ? '6px' : '2px' }}
                />

                {/* Hour label */}
                <span className={`text-[10px] font-mono mt-1 select-none ${
                  isCurrent ? 'text-sky-400 font-bold' : 'text-slate-500'
                }`}>
                  {hour % 12 === 0 ? 12 : hour % 12}
                  <span className="text-[8px]">{hour < 12 ? 'a' : 'p'}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
