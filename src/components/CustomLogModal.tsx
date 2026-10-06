import React, { useState } from 'react';
import { X, Droplet, Clock, FileText, Check } from 'lucide-react';
import { VolumeUnit } from '../types/hydration';
import {
  BEVERAGE_TYPES,
  DEFAULT_VESSELS,
  flOzToMl,
  formatVolume,
  mlToFlOz,
} from '../utils/calculator';

interface CustomLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: VolumeUnit;
  onSave: (amountMl: number, beverageId: string, timestamp?: string, note?: string) => void;
}

export const CustomLogModal: React.FC<CustomLogModalProps> = ({
  isOpen,
  onClose,
  unit,
  onSave,
}) => {
  const [amountInput, setAmountInput] = useState<number>(350);
  const [beverageId, setBeverageId] = useState<string>('pure_water');
  const [note, setNote] = useState<string>('');
  
  // Custom time (HH:mm)
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [timeInput, setTimeInput] = useState<string>(currentHHMM);

  if (!isOpen) return null;

  const currentBeverage = BEVERAGE_TYPES.find((b) => b.id === beverageId) || BEVERAGE_TYPES[0];
  const effectiveAmountMl = Math.round(amountInput * currentBeverage.hydrationFactor);

  const handleUnitAmountChange = (valStr: string) => {
    const num = parseFloat(valStr) || 0;
    if (unit === 'fl_oz') {
      setAmountInput(flOzToMl(num));
    } else {
      setAmountInput(num);
    }
  };

  const displayVal = unit === 'fl_oz' ? mlToFlOz(amountInput) : amountInput;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountInput <= 0) return;

    // Construct full timestamp with current date and specified time
    const today = new Date();
    const [hh, mm] = timeInput.split(':').map(Number);
    today.setHours(hh || 0, mm || 0, 0, 0);

    onSave(amountInput, beverageId, today.toISOString(), note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Log Hydration Intake</h3>
              <p className="text-xs text-slate-400">Add custom volume & beverage factor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Volume Input Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
              Fluid Volume ({unit === 'fl_oz' ? 'fl oz' : 'ml'})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="3000"
                step={unit === 'fl_oz' ? '0.5' : '10'}
                value={displayVal}
                onChange={(e) => handleUnitAmountChange(e.target.value)}
                className="w-32 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-lg font-bold focus:border-sky-500 focus:outline-none"
                required
              />
              <span className="text-sm font-medium text-slate-400">
                {unit === 'fl_oz' ? 'fl oz' : 'ml'}
              </span>

              {/* Slider for quick volume adjust */}
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={amountInput}
                onChange={(e) => setAmountInput(Number(e.target.value))}
                className="flex-1 accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick volume presets */}
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {DEFAULT_VESSELS.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setAmountInput(v.amountMl)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    amountInput === v.amountMl
                      ? 'bg-sky-500/30 text-sky-200 border border-sky-500/50'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {v.name} ({formatVolume(v.amountMl, unit)})
                </button>
              ))}
            </div>
          </div>

          {/* Beverage Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
              Select Beverage
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BEVERAGE_TYPES.map((bev) => {
                const isSelected = bev.id === beverageId;
                return (
                  <button
                    type="button"
                    key={bev.id}
                    onClick={() => setBeverageId(bev.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/60 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" 
                      style={{ backgroundColor: bev.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {bev.name}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-sky-400 shrink-0">
                          {Math.round(bev.hydrationFactor * 100)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {bev.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calculated Net Hydration Info Box */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Net Hydration Credited:</span>
              <span className="font-mono font-bold text-sky-300 text-sm">
                {formatVolume(effectiveAmountMl, unit)}
              </span>
            </div>
          </div>

          {/* Time & Optional Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Time Consumed</span>
              </label>
              <input
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Note (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Post-cardio workout"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={40}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Log {formatVolume(amountInput, unit)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
