import React, { useState } from 'react';
import {
  Droplets,
  Coffee,
  Sparkles,
  Zap,
  Palmtree,
  Leaf,
  Milk,
  SlidersHorizontal,
} from 'lucide-react';
import {
  BeverageTypeInfo,
  VesselPreset,
  VolumeUnit,
} from '../types/hydration';
import {
  BEVERAGE_TYPES,
  DEFAULT_VESSELS,
  formatVolume,
} from '../utils/calculator';

interface QuickLogBarProps {
  unit: VolumeUnit;
  onLogDrink: (amountMl: number, beverageId: string, containerName?: string) => void;
  onOpenCustomLog: () => void;
}

export const QuickLogBar: React.FC<QuickLogBarProps> = ({
  unit,
  onLogDrink,
  onOpenCustomLog,
}) => {
  const [selectedBeverageId, setSelectedBeverageId] = useState<string>('pure_water');

  const selectedBeverage: BeverageTypeInfo =
    BEVERAGE_TYPES.find((b) => b.id === selectedBeverageId) || BEVERAGE_TYPES[0];

  const getBeverageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5" />;
      case 'Palmtree':
        return <Palmtree className="w-3.5 h-3.5" />;
      case 'Leaf':
        return <Leaf className="w-3.5 h-3.5" />;
      case 'Coffee':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'Milk':
        return <Milk className="w-3.5 h-3.5" />;
      case 'Droplet':
      default:
        return <Droplets className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
      {/* Beverage category selector bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Beverage Type
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-sky-400 font-medium">
            {Math.round(selectedBeverage.hydrationFactor * 100)}% Hydration Index
          </span>
        </div>

        {/* Scrollable list of beverage pills for selection */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {BEVERAGE_TYPES.slice(0, 6).map((bev) => {
            const isSelected = bev.id === selectedBeverageId;
            return (
              <button
                key={bev.id}
                onClick={() => setSelectedBeverageId(bev.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                title={`${bev.name} (${Math.round(bev.hydrationFactor * 100)}% hydration)`}
              >
                {getBeverageIcon(bev.iconName)}
                <span>{bev.name.split('/')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Vessel Size Buttons */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
            Quick Log Containers
          </span>
          <button
            onClick={onOpenCustomLog}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Custom Amount</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {DEFAULT_VESSELS.map((vessel: VesselPreset) => {
            const netHydration = Math.round(vessel.amountMl * selectedBeverage.hydrationFactor);
            return (
              <button
                key={vessel.id}
                onClick={() => onLogDrink(vessel.amountMl, selectedBeverage.id, vessel.name)}
                className="group relative flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/90 hover:border-sky-500/50 transition-all text-left active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 group-hover:bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 transition-colors">
                  <Droplets className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate w-full text-center">
                  {vessel.name}
                </div>
                <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">
                  +{formatVolume(vessel.amountMl, unit)}
                </div>
                {selectedBeverage.hydrationFactor !== 1.0 && (
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    net: {formatVolume(netHydration, unit)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
