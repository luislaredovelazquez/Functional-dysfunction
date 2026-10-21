import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Plus,
  HelpCircle,
} from 'lucide-react';
import { DecomposedTask, AccessibilitySettings } from '../types/index.ts';
import { speakText } from '../utils/gamification.ts';

interface TaskFocusViewProps {
  task: DecomposedTask;
  currentIndex: number;
  totalTasks: number;
  nextTask?: DecomposedTask;
  accessibility: AccessibilitySettings;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onComplete: (task: DecomposedTask) => void;
  onSkip: () => void;
  onSwitchToAllTasks: () => void;
}

export const TaskFocusView: React.FC<TaskFocusViewProps> = ({
  task,
  currentIndex,
  totalTasks,
  nextTask,
  accessibility,
  speechEnabled,
  onComplete,
  onSkip,
  onSwitchToAllTasks,
}) => {
  // Timer state for current task
  const initialSeconds = task.estimatedMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);

  // Reset timer when task changes
  useEffect(() => {
    setSecondsRemaining(task.estimatedMinutes * 60);
    setIsTimerRunning(false);
    setTimerExpired(false);

    if (speechEnabled) {
      speakText(`${task.title}. ${task.description}`);
    }
  }, [task.id, task.estimatedMinutes, speechEnabled]);

  // Interval timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTimerExpired(true);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setSecondsRemaining(task.estimatedMinutes * 60);
    setTimerExpired(false);
  };

  const addExtraMinute = () => {
    setSecondsRemaining((prev) => prev + 60);
    setTimerExpired(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalTasks) * 100);

  return (
    <article
      aria-label={`Current focus task: ${task.title}`}
      className={`rounded-2xl border p-6 transition-all ${
        accessibility.highContrast
          ? 'bg-black border-2 border-yellow-400 text-white'
          : 'bg-[#0c1020]/90 border-cyan-500/40 text-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.5)]'
      }`}
    >
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
              accessibility.highContrast
                ? 'bg-yellow-400 text-black font-black'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-400/50'
            }`}
          >
            FOCUS TARGET {currentIndex + 1} OF {totalTasks}
          </span>

          <span
            className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
              accessibility.highContrast
                ? 'bg-white text-black'
                : 'bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40'
            }`}
          >
            {task.dopamineTag}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSwitchToAllTasks}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
            aria-label="View all tactical tasks in room map"
          >
            View Tactical Map ({totalTasks} tasks)
          </button>
        </div>
      </div>

      {/* Main Focus Card Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Task Details */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
              <span>Zone:</span>
              <span className="text-cyan-400 font-bold">{task.zone}</span>
              {task.itemCountHint && (
                <>
                  <span>•</span>
                  <span className="text-amber-300">{task.itemCountHint}</span>
                </>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold font-mono text-white leading-tight">
              {task.title}
            </h3>
          </div>

          {/* Detailed Instructions */}
          <p className="text-base text-slate-200 leading-relaxed font-sans bg-black/30 p-4 rounded-xl border border-slate-800">
            {task.description}
          </p>

          {/* ADHD Brain Rationale */}
          <div
            className={`p-3.5 rounded-xl text-xs font-mono flex items-start gap-3 border ${
              accessibility.highContrast
                ? 'bg-black border border-yellow-400 text-yellow-200'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-[10px] text-emerald-400 mb-0.5">
                Executive Function Rationale
              </span>
              <span>{task.whyThisHelps}</span>
            </div>
          </div>

          {/* Next Task Teaser */}
          {nextTask && (
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2 pt-1">
              <span className="uppercase text-slate-500">Up Next:</span>
              <span className="text-slate-300 truncate">{nextTask.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Right Column: Dopamine Timer & Action */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center gap-4 p-5 rounded-2xl bg-black/50 border border-slate-800">
          {/* Dopamine Micro-Timer */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Sprint Timer</span>
            </div>

            {/* Big Timer Digits */}
            <div
              className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${
                timerExpired
                  ? 'text-red-400 animate-pulse'
                  : accessibility.highContrast
                  ? 'text-yellow-300'
                  : 'text-cyan-400'
              }`}
              aria-live="polite"
              aria-label={`Time remaining: ${formatTime(secondsRemaining)}`}
            >
              {formatTime(secondsRemaining)}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={toggleTimer}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                  isTimerRunning
                    ? 'bg-amber-500 text-black'
                    : accessibility.highContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                }`}
                aria-label={isTimerRunning ? 'Pause timer' : 'Start sprint timer'}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none"
                title="Reset Timer"
                aria-label="Reset timer to initial time"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={addExtraMinute}
                className="px-2 py-1.5 rounded-lg border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none flex items-center gap-1"
                title="Add 1 minute"
                aria-label="Add 1 minute to timer"
              >
                <Plus className="w-3 h-3" aria-hidden="true" />
                <span>1m</span>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-slate-800 my-1" aria-hidden="true" />

          {/* Giant Dopamine Action Button */}
          <button
            type="button"
            onClick={() => onComplete(task)}
            className={`w-full py-4 px-6 rounded-xl font-mono text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-3 transition-all focus-visible:ring-4 focus-visible:ring-cyan-400 focus:outline-none ${
              accessibility.highContrast
                ? 'bg-yellow-400 text-black border-2 border-white hover:bg-yellow-300 active:scale-95'
                : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:shadow-[0_0_35px_rgba(52,211,153,0.8)] active:scale-95'
            }`}
            aria-label={`Mark task complete: ${task.title}. Awards ${task.xp} XP`}
          >
            <CheckCircle2 className="w-6 h-6 text-black flex-shrink-0" aria-hidden="true" />
            <div className="flex flex-col text-left">
              <span>MISSION ACCOMPLISHED!</span>
              <span className="text-[11px] font-bold text-slate-900 tracking-normal">
                +{task.xp} XP REWARD
              </span>
            </div>
          </button>

          {/* Non-punitive skip */}
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 underline focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none py-1"
            aria-label="Skip this task for now without penalty"
          >
            Skip for now (No penalty)
          </button>
        </div>
      </div>
    </article>
  );
};
