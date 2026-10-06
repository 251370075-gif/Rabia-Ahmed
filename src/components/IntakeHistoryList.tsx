import React from 'react';
import { Trash2, Droplets, Clock, AlertCircle } from 'lucide-react';
import { HydrationLogEntry, VolumeUnit } from '../types/hydration';
import {
  BEVERAGE_TYPES,
  formatVolume,
  getBeverageById,
} from '../utils/calculator';

interface IntakeHistoryListProps {
  entries: HydrationLogEntry[];
  unit: VolumeUnit;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
}

export const IntakeHistoryList: React.FC<IntakeHistoryListProps> = ({
  entries,
  unit,
  onDeleteEntry,
  onClearAll,
}) => {
  // Sort reverse chronologically
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Calculate breakdown by beverage category
  const totalVolume = entries.reduce((acc, curr) => acc + curr.rawAmountMl, 0);
  const categoryTotals: Record<string, number> = {};
  entries.forEach((e) => {
    const bev = getBeverageById(e.beverageId);
    categoryTotals[bev.name] = (categoryTotals[bev.name] || 0) + e.rawAmountMl;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Today's Intake Log</h3>
            <span className="text-xs text-slate-400 font-mono">
              {entries.length} {entries.length === 1 ? 'drink' : 'drinks'} logged
            </span>
          </div>
        </div>

        {entries.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            Clear Log
          </button>
        )}
      </div>

      {/* Beverage Breakdown mini bar if multiple drinks */}
      {entries.length > 1 && totalVolume > 0 && (
        <div className="mt-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Beverage Breakdown</span>
            <span className="font-mono">{formatVolume(totalVolume, unit)} total</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex bg-slate-950">
            {Object.entries(categoryTotals).map(([name, vol]) => {
              const bev = BEVERAGE_TYPES.find((b) => b.name === name) || BEVERAGE_TYPES[0];
              const pct = (vol / totalVolume) * 100;
              return (
                <div
                  key={name}
                  style={{ width: `${pct}%`, backgroundColor: bev.color }}
                  title={`${name}: ${formatVolume(vol, unit)} (${Math.round(pct)}%)`}
                  className="h-full transition-all"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="mt-3.5 flex-1 overflow-y-auto max-h-72 space-y-2 pr-1">
        {sorted.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center text-slate-500">
            <Droplets className="w-8 h-8 text-slate-700 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-400">No drinks logged yet today</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tap any quick container above or log a custom sip
            </p>
          </div>
        ) : (
          sorted.map((item) => {
            const beverage = getBeverageById(item.beverageId);
            return (
              <div
                key={item.id}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: beverage.color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 truncate">
                        {beverage.name}
                      </span>
                      {item.containerName && (
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {item.containerName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatTime(item.timestamp)}
                      </span>
                      {item.note && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="truncate italic text-slate-400 max-w-[120px] sm:max-w-xs">
                            {item.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and delete action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sky-400">
                      +{formatVolume(item.rawAmountMl, unit)}
                    </div>
                    {beverage.hydrationFactor !== 1.0 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        net: {formatVolume(item.effectiveAmountMl, unit)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteEntry(item.id)}
                    className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-800/80 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                    title="Remove drink entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
