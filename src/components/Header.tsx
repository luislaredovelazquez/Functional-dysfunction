import React from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Volume1,
  Contrast,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GamificationState, AccessibilitySettings } from '../types/index.ts';
import { calculateLevelFromXP } from '../utils/gamification.ts';

interface HeaderProps {
  gameState: GamificationState;
  accessibility: AccessibilitySettings;
  activeEngine: string;
  onToggleSound: () => void;
  onToggleSpeech: () => void;
  onToggleHighContrast: () => void;
  onToggleReducedMotion: () => void;
  onToggleFontSize: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  accessibility,
  activeEngine,
  onToggleSound,
  onToggleSpeech,
  onToggleHighContrast,
  onToggleReducedMotion,
  onToggleFontSize,
}) => {
  const { currentLevelXP, xpNeededForNext, progressPercent } = calculateLevelFromXP(gameState.xp);

  return (
    <header
      role="banner"
      className={`border-b transition-colors ${
        accessibility.highContrast
          ? 'bg-black border-yellow-400 text-white'
          : 'bg-[#090b14]/90 border-cyan-500/30 backdrop-blur-md text-slate-100'
      } sticky top-0 z-50 px-4 py-3 sm:px-6`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand and Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl tracking-tighter ${
                accessibility.highContrast
                  ? 'bg-yellow-400 text-black border-2 border-white'
                  : 'bg-gradient-to-br from-cyan-400 via-blue-600 to-fuchsia-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]'
              }`}
              aria-hidden="true"
            >
              N//S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-xl sm:text-2xl font-black tracking-wider uppercase text-cyan-400">
                  <span className={accessibility.highContrast ? 'text-yellow-300' : 'text-cyan-400'}>NEURO</span>
                  <span className={accessibility.highContrast ? 'text-white' : 'text-fuchsia-400'}>//SWEEP</span>
                </h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    accessibility.highContrast
                      ? 'bg-white text-black'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  ADHD HUD
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Tactical Room De-Cluttering & Micro-Step Engine
              </p>
            </div>
          </div>

          {/* Engine Indicator for Mobile */}
          <div className="md:hidden">
            <span
              className={`text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1 ${
                accessibility.highContrast
                  ? 'border border-yellow-400 text-yellow-300 bg-black'
                  : 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
              }`}
              title={`Active Engine: ${activeEngine}`}
            >
              <Zap className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span>{activeEngine.split(' ')[0]}</span>
            </span>
          </div>
        </div>

        {/* Center Gamification Status */}
        <div
          role="region"
          aria-label="Gamification Player Status"
          className={`flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-lg border ${
            accessibility.highContrast
              ? 'bg-black border-2 border-yellow-400'
              : 'bg-[#0d111d] border-cyan-500/20'
          }`}
        >
          {/* Level & Rank */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">LVL</span>
              <span
                className={`font-mono font-black text-base ${
                  accessibility.highContrast ? 'text-yellow-300' : 'text-cyan-400'
                }`}
              >
                {gameState.level}
              </span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                [{gameState.rankTitle}]
              </span>
            </div>
            {/* XP Mini Bar */}
            <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${
                  accessibility.highContrast
                    ? 'bg-yellow-400'
                    : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500'
                }`}
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={currentLevelXP}
                aria-valuemin={0}
                aria-valuemax={xpNeededForNext}
                aria-label={`XP progress: ${currentLevelXP} of ${xpNeededForNext} XP`}
              />
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" aria-hidden="true" />

          {/* Total XP */}
          <div className="flex items-center gap-1.5" title="Total Accumulated XP">
            <Sparkles
              className={`w-4 h-4 ${accessibility.highContrast ? 'text-yellow-400' : 'text-cyan-400'}`}
              aria-hidden="true"
            />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Total XP</div>
              <div className="font-mono font-bold text-sm text-white">{gameState.xp}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" aria-hidden="true" />

          {/* Streak */}
          <div className="flex items-center gap-1.5" title="Consecutive Micro-Tasks Completed">
            <Flame
              className={`w-4 h-4 ${
                gameState.streak > 0
                  ? accessibility.highContrast
                    ? 'text-yellow-400'
                    : 'text-amber-400 animate-pulse'
                  : 'text-slate-500'
              }`}
              aria-hidden="true"
            />
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Streak</div>
              <div className="font-mono font-bold text-sm text-amber-300">{gameState.streak}x</div>
            </div>
          </div>
        </div>

        {/* Accessibility & Audio Controls */}
        <div className="flex items-center gap-2 justify-end">
          {/* Active AI Engine Badge (Desktop) */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono ${
              accessibility.highContrast
                ? 'border border-yellow-400 text-yellow-300 bg-black'
                : 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
            }`}
            title="Connected AI Engine"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
            <span>{activeEngine}</span>
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            onClick={onToggleHighContrast}
            aria-pressed={accessibility.highContrast}
            className={`p-2 rounded-lg font-mono text-xs flex items-center gap-1 border transition-colors focus-visible:ring-2 focus-visible:ring-yellow-400 focus:outline-none ${
              accessibility.highContrast
                ? 'bg-yellow-400 text-black border-white font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
            }`}
            title="Toggle High Contrast Mode (WCAG AAA)"
            aria-label={`High contrast mode, currently ${accessibility.highContrast ? 'enabled' : 'disabled'}`}
          >
            <Contrast className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Contrast</span>
          </button>

          {/* Reduced Motion Toggle (Sensory Calm) */}
          <button
            type="button"
            onClick={onToggleReducedMotion}
            aria-pressed={accessibility.reducedMotion}
            className={`p-2 rounded-lg font-mono text-xs flex items-center gap-1 border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              accessibility.reducedMotion
                ? accessibility.highContrast
                  ? 'bg-white text-black border-yellow-400'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle Sensory Calm / Reduced Motion"
            aria-label={`Sensory calm reduced motion, currently ${
              accessibility.reducedMotion ? 'enabled' : 'disabled'
            }`}
          >
            <span className="hidden sm:inline">Calm</span>
            <span className="sm:hidden">⚡</span>
          </button>

          {/* Font Size Toggle */}
          <button
            type="button"
            onClick={onToggleFontSize}
            className={`p-2 rounded-lg font-mono text-xs border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              accessibility.highContrast
                ? 'bg-black text-white border-yellow-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Cycle Font Size"
            aria-label={`Current font size: ${accessibility.fontSize}. Click to enlarge.`}
          >
            <span className="font-bold text-sm">A±</span>
          </button>

          {/* Web Audio Dopamine Chime Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={gameState.soundEnabled}
            className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              gameState.soundEnabled
                ? accessibility.highContrast
                  ? 'bg-yellow-400 text-black border-white'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title="Toggle Dopamine Audio Chimes"
            aria-label={`Dopamine sound effects, currently ${gameState.soundEnabled ? 'enabled' : 'muted'}`}
          >
            {gameState.soundEnabled ? (
              <Volume2 className="w-4 h-4" aria-hidden="true" />
            ) : (
              <VolumeX className="w-4 h-4" aria-hidden="true" />
            )}
          </button>

          {/* Text-to-Speech Step Reader Toggle */}
          <button
            type="button"
            onClick={onToggleSpeech}
            aria-pressed={gameState.speechEnabled}
            className={`p-2 rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              gameState.speechEnabled
                ? accessibility.highContrast
                  ? 'bg-yellow-400 text-black border-white'
                  : 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
            title="Read Current Task Aloud (ADHD Assistive Audio)"
            aria-label={`Text-to-speech step reader, currently ${gameState.speechEnabled ? 'enabled' : 'disabled'}`}
          >
            <Volume1 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
