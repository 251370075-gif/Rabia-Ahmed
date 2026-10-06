import React, { useState, useEffect } from 'react';
import { X, Bell, Volume2, VolumeX, Clock, Sparkles, Check } from 'lucide-react';
import { UserHydrationProfile, VolumeUnit } from '../types/hydration';
import { formatVolume } from '../utils/calculator';
import { soundPlayer } from '../utils/audio';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserHydrationProfile;
  onSaveProfile: (profile: UserHydrationProfile) => void;
  unit: VolumeUnit;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  unit,
}) => {
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(profile.remindersEnabled);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(profile.reminderIntervalMinutes || 90);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(profile.soundEnabled);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  if (!isOpen) return null;

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          setRemindersEnabled(true);
        }
      } catch (err) {
        console.error('Permission error', err);
      }
    }
  };

  const handleTestChime = () => {
    soundPlayer.playSplash();
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification('HydroPace · Hydration Reminder', {
          body: `Time for a mindful sip! Recommended volume: ~${formatVolume(250, unit)}.`,
          icon: '/favicon.ico',
        });
      } catch {
        // ignore
      }
    }
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleSave = () => {
    soundPlayer.setMuted(!soundEnabled);
    onSaveProfile({
      ...profile,
      remindersEnabled,
      reminderIntervalMinutes: intervalMinutes,
      soundEnabled,
    });
    onClose();
  };

  // Calculate approximate intervals throughout the day
  const [wakeH] = (profile.wakeTime || '07:30').split(':').map(Number);
  const [bedH] = (profile.bedTime || '23:00').split(':').map(Number);
  const totalAwakeHours = Math.max(8, bedH - wakeH);
  const totalReminders = Math.round((totalAwakeHours * 60) / intervalMinutes);
  const goalMl = profile.useCustomGoal ? profile.customGoalMl : profile.calculatedGoalMl;
  const targetPerChime = Math.round(goalMl / Math.max(1, totalReminders));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Hydration Reminders</h3>
              <p className="text-xs text-slate-400">Pace your fluid intake with audio & alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">Hydration Reminders</div>
              <div className="text-xs text-slate-400">Periodic pacing prompts while awake</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500" />
            </label>
          </div>

          {/* Reminder Interval Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Prompt Interval</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[45, 60, 90, 120].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setIntervalMinutes(mins)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    intervalMinutes === mins
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-500/50'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              ~{totalReminders} pacing cues daily (approx. {formatVolume(targetPerChime, unit)} per cue)
            </p>
          </div>

          {/* Audio Chime Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sky-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <div className="text-xs font-semibold text-white">Audio Water Droplets</div>
                <div className="text-[11px] text-slate-400">Play pleasant droplet cues & goal chimes</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                soundEnabled
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* Browser Notifications Request */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Browser Notifications</div>
              <div className="text-[11px] text-slate-400">
                {notificationPermission === 'granted'
                  ? 'Notifications permitted'
                  : notificationPermission === 'denied'
                  ? 'Blocked in browser settings'
                  : 'Permission needed for background alerts'}
              </div>
            </div>
            {notificationPermission !== 'granted' ? (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors cursor-pointer"
              >
                Allow
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" />
                Active
              </span>
            )}
          </div>

          {/* Test Chime Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestChime}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{testNotificationSent ? 'Prompt Played!' : 'Test Sound & Prompt'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
