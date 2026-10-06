import React from 'react';
import {
  Droplets,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { VolumeUnit } from '../types/hydration';
import { formatDateLabel, getTodayDateString } from '../utils/calculator';

interface HeaderProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  unit: VolumeUnit;
  onUnitToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onOpenCalculator: () => void;
  onOpenReminders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  unit,
  onUnitToggle,
  soundEnabled,
  onSoundToggle,
  onOpenCalculator,
  onOpenReminders,
}) => {
  const today = getTodayDateString();
  const isToday = currentDate === today;

  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${day}`);
  };

  const handleNextDay = () => {
    if (isToday) return;
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${day}`);
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-md shadow-sky-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Droplets className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white leading-none flex items-center gap-1">
              <span>Hydro</span>
              <span className="text-sky-400">Pace</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-tight mt-0.5">
              Fluid Tracker & Goal Planner
            </span>
          </div>
        </div>

        {/* Date Navigator in Header Center */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 shadow-sm">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span className="whitespace-nowrap">{formatDateLabel(currentDate)}</span>
          </div>

          <button
            onClick={handleNextDay}
            disabled={isToday}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isToday
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              onClick={() => onDateChange(today)}
              className="text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md transition-colors ml-1 cursor-pointer"
            >
              Today
            </button>
          )}
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Unit Toggle */}
          <button
            onClick={onUnitToggle}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            title={`Switch to ${unit === 'ml' ? 'fluid ounces (fl oz)' : 'milliliters (ml)'}`}
          >
            {unit === 'ml' ? 'ml' : 'fl oz'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onSoundToggle}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-900 border-slate-800 text-sky-400 hover:bg-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Reminders Button */}
          <button
            onClick={onOpenReminders}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Reminder Settings"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Goal Calculator Trigger */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-tight transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Set personalized hydration goals"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Goal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
