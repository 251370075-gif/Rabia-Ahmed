import React from 'react';
import {
  Flame,
  Award,
  BarChart3,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  DayHydrationRecord,
  VolumeUnit,
} from '../types/hydration';
import {
  formatDateLabel,
  formatVolume,
  getTodayDateString,
} from '../utils/calculator';
import { calculateStreak } from '../utils/storage';

interface TrendsAndStatsProps {
  records: Record<string, DayHydrationRecord>;
  goalMl: number;
  unit: VolumeUnit;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
}

export const TrendsAndStats: React.FC<TrendsAndStatsProps> = ({
  records,
  goalMl,
  unit,
  onSelectDate,
  selectedDate,
}) => {
  const streakInfo = calculateStreak(records, goalMl);

  // Generate last 7 days for the comparison bar chart
  const last7Days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    last7Days.push(`${y}-${m}-${day}`);
  }

  // Calculate weekly stats
  let totalWeekEffective = 0;
  let daysMetGoal = 0;
  const chartData = last7Days.map((dStr) => {
    const rec = records[dStr];
    const effective = rec
      ? rec.entries.reduce((acc, curr) => acc + curr.effectiveAmountMl, 0)
      : 0;
    const target = rec?.goalMl || goalMl;
    const pct = target > 0 ? Math.round((effective / target) * 100) : 0;
    
    totalWeekEffective += effective;
    if (pct >= 95) daysMetGoal++;

    return {
      dateStr: dStr,
      label: formatDateLabel(dStr),
      effective,
      target,
      pct,
    };
  });

  const dailyAverageMl = Math.round(totalWeekEffective / 7);
  const weekCompletionRate = Math.round((daysMetGoal / 7) * 100);

  // Urine hydration chart reference guide
  const hydrationTips = [
    { title: 'Morning Glass', desc: 'Drink 300–500ml upon waking to offset nocturnal respiratory moisture loss.' },
    { title: 'Electrolyte Balance', desc: 'When active in warm climates, sodium & magnesium prevent hyponatremia and fluid dumping.' },
    { title: 'Urine Bio-Feedback', desc: 'Aim for pale straw or clear lemonade hue. Deep amber signals immediate fluid deficit.' },
  ];

  return (
    <div className="space-y-4">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
            <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
            <span>Current Streak</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-auto">
            {streakInfo.currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Best: {streakInfo.longestStreak} days</span>
        </div>

        {/* 7-Day Average */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Daily Average</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-auto truncate">
            {formatVolume(dailyAverageMl, unit)}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">Past 7 days pace</span>
        </div>

        {/* Completion Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target Consistency</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-auto">
            {weekCompletionRate}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">{daysMetGoal} of 7 days reached</span>
        </div>

        {/* Total Habits Logged */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Habit Mastery</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-auto">
            {streakInfo.daysCompletedTotal} <span className="text-xs font-normal text-slate-400">goals</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5">All-time completions</span>
        </div>
      </div>

      {/* 7-Day Hydration Trend Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Hydration Trends</h3>
              <p className="text-xs text-slate-400">Daily intake relative to target goal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-sky-500" />
              <span>Hydrated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-slate-600" />
              <span>Target (100%)</span>
            </div>
          </div>
        </div>

        {/* Bar chart canvas */}
        <div className="mt-6 pt-2">
          <div className="h-40 flex items-end gap-2 sm:gap-4 relative">
            {/* 100% Target reference line across the chart */}
            <div className="absolute top-[25%] inset-x-0 border-b border-dashed border-slate-700/80 pointer-events-none z-10 flex items-center justify-end pr-1">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900/80 px-1 rounded">
                100% Goal
              </span>
            </div>

            {chartData.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === getTodayDateString();
              // Calculate bar height relative to 125% of goal max
              const heightPct = Math.min(100, Math.max(8, (day.effective / (day.target * 1.25)) * 100));
              const isCompleted = day.pct >= 95;

              return (
                <button
                  type="button"
                  key={day.dateStr}
                  onClick={() => onSelectDate(day.dateStr)}
                  className={`flex-1 h-full flex flex-col items-center justify-end group transition-all cursor-pointer rounded-xl p-1.5 ${
                    isSelected ? 'bg-slate-800/60 ring-1 ring-sky-500' : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Tooltip value */}
                  <div className="text-[10px] font-mono font-bold text-slate-300 opacity-80 group-hover:opacity-100 mb-1">
                    {day.pct}%
                  </div>

                  {/* Vertical bar */}
                  <div className="w-full max-w-[42px] h-28 flex items-end justify-center rounded-lg bg-slate-950/60 overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-md transition-all ${
                        isCompleted
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-t from-sky-600 to-sky-400'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-xs block font-medium ${
                        isToday ? 'text-sky-400 font-bold' : isSelected ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {day.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {formatVolume(day.effective, unit)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hydration Science & Insights Cards */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Hydration Bio-Science Guidelines
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {hydrationTips.map((tip, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-semibold text-sky-300 block mb-1">
                {tip.title}
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
