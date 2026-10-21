import React from 'react';
import { Trophy, Sparkles, Flame, CheckCircle, RotateCcw } from 'lucide-react';
import { AccessibilitySettings } from '../types/index.ts';

interface CelebrationBannerProps {
  totalTasks: number;
  totalXp: number;
  timeSpent: number;
  streak: number;
  accessibility: AccessibilitySettings;
  onReset: () => void;
}

export const CelebrationBanner: React.FC<CelebrationBannerProps> = ({
  totalTasks,
  totalXp,
  timeSpent,
  streak,
  accessibility,
  onReset,
}) => {
  return (
    <div
      role="alert"
      aria-label="Mission Complete celebration"
      className={`rounded-2xl border p-6 sm:p-8 text-center transition-all ${
        accessibility.highContrast
          ? 'bg-black border-4 border-yellow-400 text-white'
          : 'bg-gradient-to-b from-[#111827] to-[#0a0d18] border-emerald-500/50 shadow-[0_0_50px_rgba(52,211,153,0.3)] text-white'
      }`}
    >
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Trophy Glow */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
            accessibility.highContrast
              ? 'bg-yellow-400 text-black border-2 border-white'
              : 'bg-emerald-500/20 border border-emerald-400 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)] animate-pulse'
          }`}
          aria-hidden="true"
        >
          <Trophy className="w-9 h-9" />
        </div>

        <span
          className={`text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 ${
            accessibility.highContrast
              ? 'bg-white text-black'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          ROOM SANCTUARY LIBERATED
        </span>

        <h2 className="text-2xl sm:text-4xl font-mono font-black text-white tracking-tight mb-2">
          MISSION ACCOMPLISHED!
        </h2>

        <p className="text-sm sm:text-base text-slate-300 mb-6 font-sans">
          You bypassed executive paralysis and reclaimed your room step by tiny step. That is genuine neurodivergent victory.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Micro-Wins</div>
            <div className="text-xl font-mono font-black text-emerald-400">{totalTasks}</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">XP Gained</div>
            <div className="text-xl font-mono font-black text-fuchsia-400">+{totalXp}</div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Streak</div>
            <div className="text-xl font-mono font-black text-amber-400">{streak}x</div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onReset}
          className={`px-6 py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all focus-visible:ring-4 focus-visible:ring-cyan-400 focus:outline-none ${
            accessibility.highContrast
              ? 'bg-yellow-400 text-black border-2 border-white'
              : 'bg-gradient-to-r from-emerald-400 to-cyan-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.5)] hover:shadow-[0_0_30px_rgba(52,211,153,0.8)]'
          }`}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>De-Clutter Another Space</span>
        </button>
      </div>
    </div>
  );
};
