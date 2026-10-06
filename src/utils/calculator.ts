import {
  BeverageTypeInfo,
  UserHydrationProfile,
  VesselPreset,
  VolumeUnit,
} from '../types/hydration';

export const ML_PER_FL_OZ = 29.5735;

export const BEVERAGE_TYPES: BeverageTypeInfo[] = [
  {
    id: 'pure_water',
    name: 'Pure Water',
    category: 'water',
    hydrationFactor: 1.0,
    color: '#0284c7', // sky-600
    bgColor: 'rgba(2, 132, 199, 0.15)',
    textColor: '#38bdf8',
    iconName: 'Droplet',
    description: 'Gold standard baseline (100% hydration)',
  },
  {
    id: 'mineral_sparkling',
    name: 'Mineral / Sparkling',
    category: 'water',
    hydrationFactor: 1.0,
    color: '#0ea5e9', // sky-500
    bgColor: 'rgba(14, 165, 233, 0.15)',
    textColor: '#7dd3fc',
    iconName: 'Sparkles',
    description: 'Carbonated or mineral rich water (100% hydration)',
  },
  {
    id: 'electrolyte_drink',
    name: 'Electrolytes / Sports',
    category: 'electrolytes',
    hydrationFactor: 1.1,
    color: '#06b6d4', // cyan-500
    bgColor: 'rgba(6, 182, 212, 0.15)',
    textColor: '#22d3ee',
    iconName: 'Zap',
    description: 'Optimal fluid retention with sodium & potassium (110% hydration)',
  },
  {
    id: 'coconut_water',
    name: 'Coconut Water',
    category: 'electrolytes',
    hydrationFactor: 1.08,
    color: '#14b8a6', // teal-500
    bgColor: 'rgba(20, 184, 166, 0.15)',
    textColor: '#2dd4bf',
    iconName: 'Palmtree',
    description: 'Natural potassium & electrolyte hydration (108%)',
  },
  {
    id: 'herbal_tea',
    name: 'Herbal Tea / Infusion',
    category: 'infusion',
    hydrationFactor: 0.98,
    color: '#10b981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.15)',
    textColor: '#34d399',
    iconName: 'Leaf',
    description: 'Caffeine-free chamomile, peppermint, or fruit tea (98%)',
  },
  {
    id: 'green_black_tea',
    name: 'Green / Black Tea',
    category: 'caffeine',
    hydrationFactor: 0.9,
    color: '#84cc16', // lime-500
    bgColor: 'rgba(132, 204, 22, 0.15)',
    textColor: '#a3e635',
    iconName: 'CupSoda',
    description: 'Mild caffeine diuretic effect (90% net retention)',
  },
  {
    id: 'coffee',
    name: 'Coffee / Espresso',
    category: 'caffeine',
    hydrationFactor: 0.82,
    color: '#b45309', // amber-700
    bgColor: 'rgba(180, 83, 9, 0.15)',
    textColor: '#fbbf24',
    iconName: 'Coffee',
    description: 'Higher caffeine concentration (82% net hydration retention)',
  },
  {
    id: 'milk_plant_milk',
    name: 'Milk / Oat / Almond',
    category: 'dairy',
    hydrationFactor: 0.95,
    color: '#a855f7', // purple-500
    bgColor: 'rgba(168, 85, 247, 0.15)',
    textColor: '#c084fc',
    iconName: 'Milk',
    description: 'Electrolyte & protein retention matrix (95%)',
  },
  {
    id: 'fresh_juice',
    name: 'Fruit Juice / Smoothie',
    category: 'juice',
    hydrationFactor: 0.85,
    color: '#f97316', // orange-500
    bgColor: 'rgba(249, 115, 22, 0.15)',
    textColor: '#fb923c',
    iconName: 'Citrus',
    description: 'High osmotic sugar concentration slows absorption (85%)',
  },
];

export const DEFAULT_VESSELS: VesselPreset[] = [
  { id: 'glass', name: 'Glass', amountMl: 250, icon: 'GlassWater', description: 'Standard table glass (250 ml / 8.5 oz)' },
  { id: 'mug', name: 'Mug / Cup', amountMl: 350, icon: 'Coffee', description: 'Ceramic tea or coffee mug (350 ml / 11.8 oz)' },
  { id: 'bottle', name: 'Sports Bottle', amountMl: 500, icon: 'FlaskConical', description: 'Medium reusable gym bottle (500 ml / 16.9 oz)' },
  { id: 'tumbler', name: 'Hydro Tumbler', amountMl: 750, icon: 'MilkWine', description: 'Insulated travel tumbler (750 ml / 25.4 oz)' },
  { id: 'jug', name: 'Large Jug', amountMl: 1000, icon: 'Cylinder', description: 'Daily workout jug (1000 ml / 33.8 oz)' },
];

export function getBeverageById(id: string): BeverageTypeInfo {
  return BEVERAGE_TYPES.find((b) => b.id === id) || BEVERAGE_TYPES[0];
}

/**
 * Calculates evidence-grounded daily water intake requirement:
 * Baseline: 35 ml / kg (clinical recommendation from EFSA & US Institute of Medicine)
 * Adjusted for:
 * - Activity level: Sedentary (+0), Moderate (+400), Active (+800), Athlete (+1300)
 * - Climate: Cold (+0), Temperate (+150), Warm/Humid (+450), Hot/Arid (+750)
 * - Biological sex: Slight metabolic adjustment (+200ml for male average lean mass)
 * - Life stage: Pregnancy (+300ml), Breastfeeding (+700ml)
 */
export function calculatePersonalizedGoal(profile: Partial<UserHydrationProfile>): {
  totalMl: number;
  breakdown: {
    baseMl: number;
    activityMl: number;
    climateMl: number;
    sexAdjustmentMl: number;
    lifeStageMl: number;
  };
} {
  const weightKg = profile.weightKg || 70;
  
  // Base requirement: 35 ml per kg of body mass
  const baseMl = Math.round(weightKg * 34);

  let sexAdjustmentMl = 0;
  if (profile.sex === 'male') {
    sexAdjustmentMl = 200;
  } else if (profile.sex === 'female') {
    sexAdjustmentMl = 0;
  }

  let activityMl = 0;
  switch (profile.activityLevel) {
    case 'moderate':
      activityMl = 400;
      break;
    case 'active':
      activityMl = 800;
      break;
    case 'athlete':
      activityMl = 1300;
      break;
    case 'sedentary':
    default:
      activityMl = 0;
      break;
  }

  let climateMl = 0;
  switch (profile.climate) {
    case 'temperate':
      climateMl = 150;
      break;
    case 'warm_humid':
      climateMl = 450;
      break;
    case 'hot_arid':
      climateMl = 750;
      break;
    case 'cold':
    default:
      climateMl = 0;
      break;
  }

  let lifeStageMl = 0;
  if (profile.lifeStage === 'pregnancy') {
    lifeStageMl = 300;
  } else if (profile.lifeStage === 'breastfeeding') {
    lifeStageMl = 700;
  }

  const rawTotal = baseMl + sexAdjustmentMl + activityMl + climateMl + lifeStageMl;
  // Round to nearest 50 ml for clean realistic goal targets
  const totalMl = Math.round(rawTotal / 50) * 50;

  return {
    totalMl,
    breakdown: {
      baseMl,
      activityMl,
      climateMl,
      sexAdjustmentMl,
      lifeStageMl,
    },
  };
}

export function mlToFlOz(ml: number): number {
  return Number((ml / ML_PER_FL_OZ).toFixed(1));
}

export function flOzToMl(oz: number): number {
  return Math.round(oz * ML_PER_FL_OZ);
}

export function formatVolume(ml: number, unit: VolumeUnit): string {
  if (unit === 'fl_oz') {
    return `${mlToFlOz(ml)} fl oz`;
  }
  return `${Math.round(ml).toLocaleString()} ml`;
}

export function formatVolumeShort(ml: number, unit: VolumeUnit): string {
  if (unit === 'fl_oz') {
    return `${mlToFlOz(ml)} oz`;
  }
  return `${Math.round(ml).toLocaleString()} ml`;
}

/**
 * Calculates daytime pacing:
 * Computes how much fluid the user should have consumed by the current time
 * based on wakeTime and bedTime.
 */
export function calculatePacingStatus(
  currentEffectiveMl: number,
  goalMl: number,
  wakeTimeStr: string = '07:00',
  bedTimeStr: string = '23:00',
  customNowHour?: number,
  customNowMinute?: number
): {
  expectedMl: number;
  differenceMl: number; // current - expected (positive = ahead, negative = behind)
  status: 'ahead' | 'on_track' | 'behind' | 'completed';
  percentPace: number;
  message: string;
} {
  if (currentEffectiveMl >= goalMl) {
    return {
      expectedMl: goalMl,
      differenceMl: currentEffectiveMl - goalMl,
      status: 'completed',
      percentPace: 100,
      message: 'Daily hydration goal achieved! Great fluid balance today.',
    };
  }

  const now = new Date();
  const currentHour = customNowHour !== undefined ? customNowHour : now.getHours();
  const currentMinute = customNowMinute !== undefined ? customNowMinute : now.getMinutes();
  const currentMinutesFromMidnight = currentHour * 60 + currentMinute;

  const [wakeH, wakeM] = wakeTimeStr.split(':').map(Number);
  const [bedH, bedM] = bedTimeStr.split(':').map(Number);

  const wakeMinutes = wakeH * 60 + (wakeM || 0);
  const bedMinutes = bedH * 60 + (bedM || 0);

  const totalAwakeMinutes = Math.max(60, bedMinutes > wakeMinutes ? bedMinutes - wakeMinutes : 1440 - wakeMinutes + bedMinutes);
  
  let elapsedAwakeMinutes = 0;
  if (currentMinutesFromMidnight < wakeMinutes) {
    elapsedAwakeMinutes = 0;
  } else if (currentMinutesFromMidnight > bedMinutes) {
    elapsedAwakeMinutes = totalAwakeMinutes;
  } else {
    elapsedAwakeMinutes = currentMinutesFromMidnight - wakeMinutes;
  }

  const fractionOfDay = Math.min(1, Math.max(0, elapsedAwakeMinutes / totalAwakeMinutes));
  const expectedMl = Math.round(goalMl * fractionOfDay);
  const differenceMl = currentEffectiveMl - expectedMl;

  let status: 'ahead' | 'on_track' | 'behind' | 'completed';
  let message = '';

  const threshold = goalMl * 0.08; // 8% tolerance band
  if (differenceMl > threshold) {
    status = 'ahead';
    message = `Ahead of pace by ${Math.round(differenceMl)} ml. Superb hydration consistency!`;
  } else if (differenceMl < -threshold) {
    status = 'behind';
    message = `${Math.round(Math.abs(differenceMl))} ml behind current schedule. Sip a glass soon.`;
  } else {
    status = 'on_track';
    message = 'Right on schedule with your awake hydration timeline.';
  }

  const percentPace = Math.min(100, Math.round((currentEffectiveMl / goalMl) * 100));

  return {
    expectedMl,
    differenceMl,
    status,
    percentPace,
    message,
  };
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return 'Today';
  
  const d = new Date(dateStr + 'T12:00:00');
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
  if (dateStr === yestStr) return 'Yesterday';

  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
