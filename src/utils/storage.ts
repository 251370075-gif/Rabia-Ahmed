import {
  DayHydrationRecord,
  HydrationLogEntry,
  UserHydrationProfile,
} from '../types/hydration';
import { calculatePersonalizedGoal, getTodayDateString } from './calculator';

const STORAGE_KEYS = {
  PROFILE: 'hydropace_profile_v1',
  RECORDS: 'hydropace_records_v1',
};

export const DEFAULT_PROFILE: UserHydrationProfile = {
  weightKg: 70,
  weightUnit: 'kg',
  sex: 'other',
  activityLevel: 'moderate',
  climate: 'temperate',
  lifeStage: 'standard',
  wakeTime: '07:30',
  bedTime: '23:00',
  preferredUnit: 'ml',
  useCustomGoal: false,
  customGoalMl: 2600,
  calculatedGoalMl: 2600,
  remindersEnabled: false,
  reminderIntervalMinutes: 90,
  soundEnabled: true,
};

// Initial sample seed records for past 6 days so charts and streaks are populated on first launch
export function generateSeedRecords(goalMl: number): Record<string, DayHydrationRecord> {
  const records: Record<string, DayHydrationRecord> = {};
  const today = new Date();

  // Helper to format date YYYY-MM-DD
  const formatIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Past 6 days of realistic hydration activity
  const sampleData = [
    { daysAgo: 6, percent: 0.92, drinks: [250, 500, 350, 500, 500, 250] },
    { daysAgo: 5, percent: 1.05, drinks: [500, 350, 500, 500, 500, 350] },
    { daysAgo: 4, percent: 0.98, drinks: [250, 500, 500, 350, 500, 350] },
    { daysAgo: 3, percent: 1.10, drinks: [500, 500, 350, 500, 750, 250] },
    { daysAgo: 2, percent: 1.02, drinks: [500, 350, 500, 500, 500, 300] },
    { daysAgo: 1, percent: 0.95, drinks: [350, 500, 500, 500, 350, 250] },
  ];

  sampleData.forEach((item) => {
    const d = new Date(today);
    d.setDate(d.getDate() - item.daysAgo);
    const dateStr = formatIso(d);
    
    let runningHour = 8;
    const entries: HydrationLogEntry[] = item.drinks.map((amt, idx) => {
      runningHour += 2;
      const hourStr = String(Math.min(22, runningHour)).padStart(2, '0');
      const timestamp = `${dateStr}T${hourStr}:15:00.000Z`;
      const isMorning = idx === 0;
      const beverageId = isMorning ? (idx % 2 === 0 ? 'pure_water' : 'herbal_tea') : 'pure_water';
      const factor = beverageId === 'herbal_tea' ? 0.98 : 1.0;

      return {
        id: `seed-${dateStr}-${idx}`,
        timestamp,
        date: dateStr,
        rawAmountMl: amt,
        effectiveAmountMl: Math.round(amt * factor),
        beverageId,
        note: isMorning ? 'Morning hydration' : undefined,
      };
    });

    records[dateStr] = {
      date: dateStr,
      goalMl,
      entries,
    };
  });

  return records;
}

export function loadUserProfile(): UserHydrationProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      const goalCalc = calculatePersonalizedGoal(parsed);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        calculatedGoalMl: goalCalc.totalMl,
      };
    }
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  const defaultGoal = calculatePersonalizedGoal(DEFAULT_PROFILE);
  return {
    ...DEFAULT_PROFILE,
    calculatedGoalMl: defaultGoal.totalMl,
  };
}

export function saveUserProfile(profile: UserHydrationProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadAllRecords(profileGoal: number): Record<string, DayHydrationRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load records', e);
  }
  // Initialize with seed records on first launch
  const initial = generateSeedRecords(profileGoal);
  saveAllRecords(initial);
  return initial;
}

export function saveAllRecords(records: Record<string, DayHydrationRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records', e);
  }
}

export function getActiveGoalMl(profile: UserHydrationProfile): number {
  return profile.useCustomGoal ? profile.customGoalMl : profile.calculatedGoalMl;
}

export function calculateStreak(records: Record<string, DayHydrationRecord>, profileGoal: number): {
  currentStreak: number;
  longestStreak: number;
  daysCompletedTotal: number;
} {
  const dates = Object.keys(records).sort();
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, daysCompletedTotal: 0 };
  }

  let longest = 0;
  let running = 0;
  let daysCompletedTotal = 0;

  // Evaluate each day
  dates.forEach((d) => {
    const record = records[d];
    const totalEffective = record.entries.reduce((acc, curr) => acc + curr.effectiveAmountMl, 0);
    const target = record.goalMl || profileGoal;
    const isSuccess = totalEffective >= target * 0.95; // 95% threshold counts towards consistent habit

    if (isSuccess) {
      daysCompletedTotal++;
      running++;
      if (running > longest) longest = running;
    } else {
      running = 0;
    }
  });

  // Calculate current streak leading up to today / yesterday
  const today = getTodayDateString();
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yest = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  let currentStreak = 0;
  let checkDate = new Date();

  // Check today first
  const todayRecord = records[today];
  const todayEffective = todayRecord ? todayRecord.entries.reduce((acc, curr) => acc + curr.effectiveAmountMl, 0) : 0;
  const todayGoal = todayRecord?.goalMl || profileGoal;
  const todayDone = todayEffective >= todayGoal * 0.95;

  if (todayDone) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not done yet, check if yesterday was done (so streak isn't lost during the daytime today!)
    const yestRecord = records[yest];
    const yestEffective = yestRecord ? yestRecord.entries.reduce((acc, curr) => acc + curr.effectiveAmountMl, 0) : 0;
    const yestGoal = yestRecord?.goalMl || profileGoal;
    if (yestEffective >= yestGoal * 0.95) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return { currentStreak: 0, longestStreak: longest, daysCompletedTotal };
    }
  }

  // Iterate backwards day by day
  while (true) {
    const dayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const rec = records[dayStr];
    if (!rec) break;
    const eff = rec.entries.reduce((acc, curr) => acc + curr.effectiveAmountMl, 0);
    const g = rec.goalMl || profileGoal;
    if (eff >= g * 0.95) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longest, currentStreak),
    daysCompletedTotal,
  };
}
