/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Droplets,
  Plus,
  BarChart2,
  Calendar,
  Sparkles,
  BookOpen,
  Download,
  Upload,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  DayHydrationRecord,
  HydrationLogEntry,
  UserHydrationProfile,
  VolumeUnit,
} from './types/hydration';
import {
  DEFAULT_PROFILE,
  getActiveGoalMl,
  loadAllRecords,
  loadUserProfile,
  saveAllRecords,
  saveUserProfile,
  generateSeedRecords,
} from './utils/storage';
import {
  formatVolume,
  getBeverageById,
  getTodayDateString,
  calculatePacingStatus,
  calculatePersonalizedGoal,
} from './utils/calculator';
import { soundPlayer } from './utils/audio';

import { Header } from './components/Header';
import { WaveBottle } from './components/WaveBottle';
import { QuickLogBar } from './components/QuickLogBar';
import { CustomLogModal } from './components/CustomLogModal';
import { GoalCalculatorModal } from './components/GoalCalculatorModal';
import { HourlyPacingTracker } from './components/HourlyPacingTracker';
import { IntakeHistoryList } from './components/IntakeHistoryList';
import { TrendsAndStats } from './components/TrendsAndStats';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';

export default function App() {
  const [profile, setProfile] = useState<UserHydrationProfile>(() => loadUserProfile());
  const [records, setRecords] = useState<Record<string, DayHydrationRecord>>(() =>
    loadAllRecords(getActiveGoalMl(loadUserProfile()))
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<'tracker' | 'trends' | 'science'>('tracker');

  // Modals
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isCustomLogOpen, setIsCustomLogOpen] = useState<boolean>(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState<boolean>(false);

  // Goal celebration banner
  const [showCelebrationBanner, setShowCelebrationBanner] = useState<boolean>(false);
  const prevCompletedRef = useRef<boolean>(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sound mute from profile
  useEffect(() => {
    soundPlayer.setMuted(!profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Current day data
  const currentRecord = useMemo(() => {
    return records[selectedDate] || {
      date: selectedDate,
      goalMl: getActiveGoalMl(profile),
      entries: [],
    };
  }, [records, selectedDate, profile]);

  const activeGoalMl = currentRecord.goalMl || getActiveGoalMl(profile);
  const currentEntries = currentRecord.entries || [];
  
  const currentEffectiveMl = useMemo(() => {
    return currentEntries.reduce((acc, curr) => acc + curr.effectiveAmountMl, 0);
  }, [currentEntries]);

  const currentRawMl = useMemo(() => {
    return currentEntries.reduce((acc, curr) => acc + curr.rawAmountMl, 0);
  }, [currentEntries]);

  const isGoalReached = currentEffectiveMl >= activeGoalMl && activeGoalMl > 0;

  // Detect goal reached trigger for celebratory sound and animation
  useEffect(() => {
    if (isGoalReached && !prevCompletedRef.current && currentEntries.length > 0) {
      soundPlayer.playGoalCelebration();
      setShowCelebrationBanner(true);
      const timer = setTimeout(() => setShowCelebrationBanner(false), 6000);
      return () => clearTimeout(timer);
    }
    prevCompletedRef.current = isGoalReached;
  }, [isGoalReached, currentEntries.length]);

  // Background reminder timer simulation (if reminders enabled in app)
  useEffect(() => {
    if (!profile.remindersEnabled) return;
    const intervalMs = (profile.reminderIntervalMinutes || 90) * 60 * 1000;
    const timer = setInterval(() => {
      soundPlayer.playSplash();
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('HydroPace · Hydration Prompt', {
            body: `Keep up your healthy pace! Time for ~${formatVolume(250, profile.preferredUnit)} of water.`,
            icon: '/favicon.ico',
          });
        } catch {
          // ignore
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [profile.remindersEnabled, profile.reminderIntervalMinutes, profile.preferredUnit]);

  // Save profile updates
  const handleSaveProfile = (newProfile: UserHydrationProfile) => {
    setProfile(newProfile);
    saveUserProfile(newProfile);

    // Also update goal for current record if not customized
    const newGoal = getActiveGoalMl(newProfile);
    setRecords((prev) => {
      const updated = { ...prev };
      if (updated[selectedDate]) {
        updated[selectedDate] = {
          ...updated[selectedDate],
          goalMl: newGoal,
        };
      }
      saveAllRecords(updated);
      return updated;
    });
  };

  // Log drink
  const handleLogDrink = (
    amountMl: number,
    beverageId: string,
    containerName?: string,
    customTimestamp?: string,
    note?: string
  ) => {
    const bev = getBeverageById(beverageId);
    const effectiveAmountMl = Math.round(amountMl * bev.hydrationFactor);

    const newEntry: HydrationLogEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: customTimestamp || new Date().toISOString(),
      date: selectedDate,
      rawAmountMl: amountMl,
      effectiveAmountMl,
      beverageId,
      containerName,
      note,
    };

    soundPlayer.playSplash();

    setRecords((prev) => {
      const existing = prev[selectedDate] || {
        date: selectedDate,
        goalMl: activeGoalMl,
        entries: [],
      };
      const updatedDay: DayHydrationRecord = {
        ...existing,
        goalMl: existing.goalMl || activeGoalMl,
        entries: [...existing.entries, newEntry],
      };
      const nextRecords = { ...prev, [selectedDate]: updatedDay };
      saveAllRecords(nextRecords);
      return nextRecords;
    });
  };

  // Delete drink
  const handleDeleteEntry = (entryId: string) => {
    setRecords((prev) => {
      const existing = prev[selectedDate];
      if (!existing) return prev;
      const filtered = existing.entries.filter((e) => e.id !== entryId);
      const updated = {
        ...prev,
        [selectedDate]: {
          ...existing,
          entries: filtered,
        },
      };
      saveAllRecords(updated);
      return updated;
    });
  };

  // Clear all for selected day
  const handleClearToday = () => {
    if (!window.confirm("Clear today's logged drinks?")) return;
    setRecords((prev) => {
      const existing = prev[selectedDate];
      if (!existing) return prev;
      const updated = {
        ...prev,
        [selectedDate]: {
          ...existing,
          entries: [],
        },
      };
      saveAllRecords(updated);
      return updated;
    });
  };

  // Export data
  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      profile,
      records,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydropace-backup-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile && parsed.records) {
          setProfile(parsed.profile);
          saveUserProfile(parsed.profile);
          setRecords(parsed.records);
          saveAllRecords(parsed.records);
          alert('Hydration records imported successfully!');
        } else {
          alert('Invalid file format. Please use a HydroPace backup JSON file.');
        }
      } catch (err) {
        alert('Failed to parse file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // Reset demo records
  const handleResetDemoData = () => {
    if (!window.confirm('Reset hydration records to sample week data?')) return;
    const initial = generateSeedRecords(activeGoalMl);
    setRecords(initial);
    saveAllRecords(initial);
  };

  const pacingInfo = calculatePacingStatus(
    currentEffectiveMl,
    activeGoalMl,
    profile.wakeTime,
    profile.bedTime
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        currentDate={selectedDate}
        onDateChange={setSelectedDate}
        unit={profile.preferredUnit}
        onUnitToggle={() => {
          const nextUnit: VolumeUnit = profile.preferredUnit === 'ml' ? 'fl_oz' : 'ml';
          handleSaveProfile({ ...profile, preferredUnit: nextUnit });
        }}
        soundEnabled={profile.soundEnabled}
        onSoundToggle={() => {
          handleSaveProfile({ ...profile, soundEnabled: !profile.soundEnabled });
        }}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenReminders={() => setIsRemindersOpen(true)}
      />

      {/* Goal Celebration Toast Banner */}
      {showCelebrationBanner && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-slate-950 font-bold px-4 py-2.5 shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm animate-in slide-in-from-top duration-300">
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Congratulations! You reached 100% of your daily hydration goal!</span>
          <Sparkles className="w-4 h-4 shrink-0" />
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Tabs (Tracker vs Trends vs Science Guide) */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tracker')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tracker'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Hydration Tracker</span>
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Trends & Habit Streaks</span>
            </button>
            <button
              onClick={() => setActiveTab('science')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'science'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Physiology Guide</span>
            </button>
          </div>

          {/* Quick Target Summary / Plan Button */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="text-slate-400">Target Formula:</span>
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-mono font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{formatVolume(activeGoalMl, profile.preferredUnit)}</span>
              <span className="text-[10px] text-slate-500">
                ({profile.useCustomGoal ? 'Custom' : 'Calculated'})
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: TRACKER VIEW */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {/* Top Grid: Liquid Bottle Vessel + Quick Logging Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Wave Fluid Bottle (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <WaveBottle
                  currentMl={currentEffectiveMl}
                  goalMl={activeGoalMl}
                  unit={profile.preferredUnit}
                  onQuickAdd={(ml) => handleLogDrink(ml, 'pure_water', 'Quick Glass')}
                  statusText={pacingInfo.message}
                  isCompleted={isGoalReached}
                />

                {/* Hydration Efficiency Metric Card */}
                {currentRawMl > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/90 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block">Total Volume Ingested:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {formatVolume(currentRawMl, profile.preferredUnit)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Net Cellular Hydration:</span>
                      <span className="font-mono font-bold text-sky-400">
                        {formatVolume(currentEffectiveMl, profile.preferredUnit)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Logging tools, Pacing Tracker, and Timeline (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Quick Log Buttons Bar */}
                <QuickLogBar
                  unit={profile.preferredUnit}
                  onLogDrink={(amt, bevId, container) =>
                    handleLogDrink(amt, bevId, container)
                  }
                  onOpenCustomLog={() => setIsCustomLogOpen(true)}
                />

                {/* Hourly Pacing Chart */}
                <HourlyPacingTracker
                  entries={currentEntries}
                  currentEffectiveMl={currentEffectiveMl}
                  goalMl={activeGoalMl}
                  wakeTime={profile.wakeTime}
                  bedTime={profile.bedTime}
                  unit={profile.preferredUnit}
                />

                {/* Today's Logged Drinks List */}
                <IntakeHistoryList
                  entries={currentEntries}
                  unit={profile.preferredUnit}
                  onDeleteEntry={handleDeleteEntry}
                  onClearAll={handleClearToday}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRENDS & HABIT STREAKS VIEW */}
        {activeTab === 'trends' && (
          <TrendsAndStats
            records={records}
            goalMl={activeGoalMl}
            unit={profile.preferredUnit}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setActiveTab('tracker');
            }}
          />
        )}

        {/* TAB 3: SCIENCE & BIO GUIDE */}
        {activeTab === 'science' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">The Physiology of Human Hydration</h2>
                  <p className="text-xs text-slate-400">
                    Why personalized goals matter far more than the generic "8 cups a day" myth
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h3 className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                    <Droplets className="w-4 h-4" />
                    <span>The Weight-to-Volume Equation</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clinical guidelines from the European Food Safety Authority (EFSA) and the US National Academies of Medicine advise an intake of approximately 30–35 ml per kilogram of body weight for healthy adults. A 90 kg individual needs significantly more fluid volume for metabolic clearance than a 55 kg individual.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h3 className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Beverage Hydration Index (BHI)</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Not all fluids hydrate identically. Studies pioneered at Loughborough University demonstrate that fluids containing electrolytes (sodium, potassium) and macronutrients are retained in the body longer, while high caffeine or concentrated sugars cause osmotic diuretic or fluid-drawing shifts.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h3 className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>Cognitive & Physical Performance</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Even a 1.5% to 2% fluid deficit triggers measurable declines in executive function, short-term memory recall, mood stability, and endurance output. Consistent pacing prevents the fatigue dips that hit around 2:00 PM to 4:00 PM.
                  </p>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h3 className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sleep Pacing & Nocturia Prevention</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Drinking 80% of your hydration target between waking and 3 hours prior to bedtime stabilizes deep REM sleep cycles by avoiding middle-of-the-night bladder wakeups.
                  </p>
                </div>
              </div>

              {/* Recalculate CTA */}
              <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-400 text-center sm:text-left">
                  Ready to calculate your exact biological hydration profile?
                </div>
                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Configure My Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Data Backup & Management */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">HydroPace</span>
            <span>·</span>
            <span>Local privacy-first hydration intelligence</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Export JSON */}
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-pointer"
              title="Backup your hydration logs to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Data</span>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-pointer"
              title="Restore hydration records from JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />

            {/* Reset sample demo records */}
            <button
              onClick={handleResetDemoData}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer"
              title="Reset records with sample habit streak"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <GoalCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <CustomLogModal
        isOpen={isCustomLogOpen}
        onClose={() => setIsCustomLogOpen(false)}
        unit={profile.preferredUnit}
        onSave={(amount, bevId, timestamp, note) => {
          handleLogDrink(amount, bevId, undefined, timestamp, note);
        }}
      />

      <ReminderSettingsModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        unit={profile.preferredUnit}
      />
    </div>
  );
}
