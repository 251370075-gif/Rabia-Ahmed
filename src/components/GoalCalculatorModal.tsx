import React, { useState } from 'react';
import {
  X,
  Target,
  Calculator,
  Activity,
  Sun,
  Scale,
  Sparkles,
  Check,
  Info,
} from 'lucide-react';
import {
  ActivityLevel,
  BiologicalSex,
  ClimateType,
  LifeStage,
  UserHydrationProfile,
  VolumeUnit,
} from '../types/hydration';
import {
  calculatePersonalizedGoal,
  flOzToMl,
  formatVolume,
  mlToFlOz,
} from '../utils/calculator';

interface GoalCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserHydrationProfile;
  onSaveProfile: (updatedProfile: UserHydrationProfile) => void;
}

export const GoalCalculatorModal: React.FC<GoalCalculatorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  // Form State initialized from current profile
  const [weight, setWeight] = useState<number>(
    profile.weightUnit === 'lbs' ? Math.round(profile.weightKg * 2.20462) : profile.weightKg
  );
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(profile.weightUnit);
  const [sex, setSex] = useState<BiologicalSex>(profile.sex);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);
  const [climate, setClimate] = useState<ClimateType>(profile.climate);
  const [lifeStage, setLifeStage] = useState<LifeStage>(profile.lifeStage);
  const [preferredUnit, setPreferredUnit] = useState<VolumeUnit>(profile.preferredUnit);
  const [wakeTime, setWakeTime] = useState<string>(profile.wakeTime || '07:30');
  const [bedTime, setBedTime] = useState<string>(profile.bedTime || '23:00');
  const [useCustomGoal, setUseCustomGoal] = useState<boolean>(profile.useCustomGoal);
  const [customGoalInput, setCustomGoalInput] = useState<number>(
    profile.preferredUnit === 'fl_oz'
      ? mlToFlOz(profile.customGoalMl || 2600)
      : profile.customGoalMl || 2600
  );

  if (!isOpen) return null;

  // Convert current weight to kg for clinical formula
  const weightKgCalculated = weightUnit === 'lbs' ? weight / 2.20462 : weight;

  const { totalMl: recommendedGoalMl, breakdown } = calculatePersonalizedGoal({
    weightKg: weightKgCalculated,
    sex,
    activityLevel,
    climate,
    lifeStage,
  });

  const activeGoalMl = useCustomGoal
    ? preferredUnit === 'fl_oz'
      ? flOzToMl(customGoalInput)
      : customGoalInput
    : recommendedGoalMl;

  const handleWeightUnitToggle = (unit: 'kg' | 'lbs') => {
    if (unit === weightUnit) return;
    if (unit === 'lbs') {
      setWeight(Math.round(weight * 2.20462));
    } else {
      setWeight(Math.round(weight / 2.20462));
    }
    setWeightUnit(unit);
  };

  const handleSave = () => {
    const updated: UserHydrationProfile = {
      ...profile,
      weightKg: Math.round(weightKgCalculated),
      weightUnit,
      sex,
      activityLevel,
      climate,
      lifeStage,
      preferredUnit,
      wakeTime,
      bedTime,
      useCustomGoal,
      customGoalMl: preferredUnit === 'fl_oz' ? flOzToMl(customGoalInput) : customGoalInput,
      calculatedGoalMl: recommendedGoalMl,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Personalized Hydration Planner</h2>
              <p className="text-xs text-slate-400">Ground your fluid targets in physiology and daily climate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Recommended Target Preview Hero Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 border border-sky-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Physiological Target</span>
              </div>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-1.5">
                <span>{formatVolume(recommendedGoalMl, preferredUnit)}</span>
                <span className="text-xs font-normal text-slate-400">/ day</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Based on {weight} {weightUnit} body mass, {activityLevel} lifestyle & {climate.replace('_', ' ')} climate.
              </p>
            </div>

            {/* Goal Toggle (Recommended vs Manual) */}
            <div className="flex flex-col gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shrink-0">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomGoal}
                  onChange={(e) => setUseCustomGoal(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span>Set custom goal override</span>
              </label>

              {useCustomGoal && (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min="500"
                    max="6000"
                    step={preferredUnit === 'fl_oz' ? '1' : '50'}
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(Number(e.target.value))}
                    className="w-24 px-2.5 py-1 text-sm bg-slate-900 border border-slate-700 text-white font-mono rounded-lg focus:border-sky-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-mono">
                    {preferredUnit === 'fl_oz' ? 'oz' : 'ml'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Body Weight Input */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-sky-400" />
                  <span>Body Weight</span>
                </label>
                <div className="flex items-center p-0.5 bg-slate-800 rounded-lg text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => handleWeightUnitToggle('kg')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      weightUnit === 'kg' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWeightUnitToggle('lbs')}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      weightUnit === 'lbs' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={weightUnit === 'kg' ? '30' : '65'}
                max={weightUnit === 'kg' ? '250' : '550'}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-base font-semibold focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard baseline: 34 ml per kg body weight
              </span>
            </div>

            {/* Biological Sex */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Biological Sex (Hydration Basal Rate)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'female', label: 'Female' },
                  { id: 'male', label: 'Male' },
                  { id: 'other', label: 'Other / Neutral' },
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSex(s.id as BiologicalSex)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      sex === s.id
                        ? 'bg-sky-500/20 text-sky-200 border border-sky-500/50 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Daily Physical Activity</span>
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value="sedentary">Sedentary (Desk work, &lt;30m exercise)</option>
                <option value="moderate">Moderate (30-60m brisk walks / workout, +400ml)</option>
                <option value="active">Active (60-90m intense sport / training, +800ml)</option>
                <option value="athlete">Endurance Athlete (High sweat rate, +1,300ml)</option>
              </select>
            </div>

            {/* Climate Environment */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Climate & Season</span>
              </label>
              <select
                value={climate}
                onChange={(e) => setClimate(e.target.value as ClimateType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value="cold">Cool / Air-conditioned (0ml)</option>
                <option value="temperate">Temperate / Mild (+150ml)</option>
                <option value="warm_humid">Warm & Humid / Summer (+450ml)</option>
                <option value="hot_arid">Hot / Desert Arid (+750ml)</option>
              </select>
            </div>

            {/* Awake Schedule (Wake & Sleep for daytime pacing) */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Awake Hydration Window
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Wake Up</span>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">Bedtime</span>
                  <input
                    type="time"
                    value={bedTime}
                    onChange={(e) => setBedTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Special Life Stage */}
            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">
                Specific Stage
              </label>
              <select
                value={lifeStage}
                onChange={(e) => setLifeStage(e.target.value as LifeStage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-sky-500 focus:outline-none"
              >
                <option value="standard">Standard / None</option>
                <option value="pregnancy">Pregnancy (+300ml)</option>
                <option value="breastfeeding">Breastfeeding (+700ml)</option>
              </select>
            </div>
          </div>

          {/* Clinical Calculation Breakdown Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Target Math Calculation</span>
            </div>
            <div className="space-y-1.5 font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Base metabolic requirement ({Math.round(weightKgCalculated)}kg × 34ml):</span>
                <span className="text-slate-200">+{breakdown.baseMl} ml</span>
              </div>
              {breakdown.sexAdjustmentMl > 0 && (
                <div className="flex justify-between">
                  <span>Lean body mass adjustment:</span>
                  <span className="text-slate-200">+{breakdown.sexAdjustmentMl} ml</span>
                </div>
              )}
              {breakdown.activityMl > 0 && (
                <div className="flex justify-between">
                  <span>Sweat replacement ({activityLevel}):</span>
                  <span className="text-slate-200">+{breakdown.activityMl} ml</span>
                </div>
              )}
              {breakdown.climateMl > 0 && (
                <div className="flex justify-between">
                  <span>Evaporative loss ({climate.replace('_', ' ')}):</span>
                  <span className="text-slate-200">+{breakdown.climateMl} ml</span>
                </div>
              )}
              {breakdown.lifeStageMl > 0 && (
                <div className="flex justify-between">
                  <span>Maternal fluid demand:</span>
                  <span className="text-slate-200">+{breakdown.lifeStageMl} ml</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sky-300">
                <span>Recommended Daily Total:</span>
                <span>{recommendedGoalMl} ml ({mlToFlOz(recommendedGoalMl)} oz)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Active Goal: <span className="font-bold text-white font-mono">{formatVolume(activeGoalMl, preferredUnit)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Goal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
