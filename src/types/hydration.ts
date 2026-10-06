export type VolumeUnit = 'ml' | 'fl_oz';

export type BiologicalSex = 'female' | 'male' | 'other';

export type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'athlete';

export type ClimateType = 'cold' | 'temperate' | 'warm_humid' | 'hot_arid';

export type LifeStage = 'standard' | 'pregnancy' | 'breastfeeding';

export interface BeverageTypeInfo {
  id: string;
  name: string;
  category: 'water' | 'infusion' | 'caffeine' | 'juice' | 'electrolytes' | 'dairy';
  hydrationFactor: number; // Hydration effectiveness index (e.g., 1.0 for water, 0.85 for coffee)
  color: string;
  bgColor: string;
  textColor: string;
  iconName: string;
  description: string;
}

export interface UserHydrationProfile {
  weightKg: number;
  weightUnit: 'kg' | 'lbs';
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
  climate: ClimateType;
  lifeStage: LifeStage;
  wakeTime: string; // "07:00"
  bedTime: string;  // "23:00"
  preferredUnit: VolumeUnit;
  useCustomGoal: boolean;
  customGoalMl: number;
  calculatedGoalMl: number;
  remindersEnabled: boolean;
  reminderIntervalMinutes: number;
  soundEnabled: boolean;
}

export interface HydrationLogEntry {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  rawAmountMl: number;
  effectiveAmountMl: number;
  beverageId: string;
  note?: string;
  containerName?: string;
}

export interface DayHydrationRecord {
  date: string; // YYYY-MM-DD
  goalMl: number;
  entries: HydrationLogEntry[];
}

export interface VesselPreset {
  id: string;
  name: string;
  amountMl: number;
  icon: string;
  description: string;
}
