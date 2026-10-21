import React from 'react';
import {
  Clock,
  Sparkles,
  Layers,
  AlertTriangle,
  RotateCcw,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { RoomAnalysis, AccessibilitySettings } from '../types/index.ts';

interface RoomSummaryCardProps {
  analysis: RoomAnalysis;
  accessibility: AccessibilitySettings;
  onReset: () => void;
}

export const RoomSummaryCard: React.FC<RoomSummaryCardProps> = ({
  analysis,
  accessibility,
  onReset,
}) => {
  const getClutterBadge = () => {
    switch (analysis.clutterLevel) {
      case 'low':
        return { label: 'Low Clutter (Quick Tidy)', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
      case 'medium':
        return { label: 'Medium Friction', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' };
      case 'high':
        return { label: 'High Clutter (Overload Risk)', color: 'text-orange-400 border-orange-500/40 bg-orange-950/40' };
      case 'critical':
      default:
        return { label: 'Severe Clutter (Paralysis Zone)', color: 'text-red-400 border-red-500/40 bg-red-950/40' };
    }
  };

  const clutter = getClutterBadge();

  return (
    <section
      aria-label="Room Diagnostic Summary"
      className={`rounded-2xl border p-5 transition-all ${
        accessibility.highContrast
          ? 'bg-black border-2 border-yellow-400 text-white'
          : 'bg-[#0a0d18] border-cyan-500/30 text-slate-100'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Room Type & Diagnostics */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded uppercase ${
                accessibility.highContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-400/50'
              }`}
            >
              ZONE: {analysis.roomType}
            </span>

            <span
              className={`text-xs font-mono px-2 py-0.5 rounded border ${
                accessibility.highContrast ? 'border-white text-white' : clutter.color
              }`}
            >
              {clutter.label}
            </span>
          </div>

          <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
            {analysis.summary}
          </p>

          {/* Encouraging ADHD Tip */}
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-300/90 font-mono">
            <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>ADHD Tip: {analysis.adhdTip}</span>
          </div>
        </div>

        {/* Right: Stats & Reset Button */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-4 text-center">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Sprints</div>
              <div className="text-lg font-mono font-bold text-white">{analysis.totalTasks} Steps</div>
            </div>
            <div className="h-6 w-px bg-slate-800" aria-hidden="true" />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Est. Time</div>
              <div className="text-lg font-mono font-bold text-cyan-400">{analysis.totalEstimatedMinutes} Mins</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              accessibility.highContrast
                ? 'bg-black text-white border-yellow-400 hover:bg-yellow-400 hover:text-black'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            aria-label="Scan or upload another room"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Scan Another Room</span>
          </button>
        </div>
      </div>
    </section>
  );
};
