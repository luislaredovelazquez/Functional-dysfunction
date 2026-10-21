import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Crosshair,
  Filter,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import { DecomposedTask, RoomZone, AccessibilitySettings } from '../types/index.ts';

interface TacticalTaskHUDProps {
  tasks: DecomposedTask[];
  zones: RoomZone[];
  accessibility: AccessibilitySettings;
  onToggleComplete: (task: DecomposedTask) => void;
  onFocusTask: (task: DecomposedTask) => void;
  onSwitchToFocusMode: () => void;
}

export const TacticalTaskHUD: React.FC<TacticalTaskHUDProps> = ({
  tasks,
  zones,
  accessibility,
  onToggleComplete,
  onFocusTask,
  onSwitchToFocusMode,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (selectedZone !== 'all' && t.zone !== selectedZone) return false;
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingMinutes = tasks
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return (
    <section
      aria-label="Tactical Room Tasks Map"
      className={`rounded-2xl border p-6 transition-all ${
        accessibility.highContrast
          ? 'bg-black border-2 border-yellow-400 text-white'
          : 'bg-[#0c1020]/90 border-cyan-500/30 text-slate-100 shadow-xl'
      }`}
    >
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h2 className="font-mono text-xl font-bold tracking-wide uppercase text-white">
              Tactical Mission Map
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {completedCount} of {tasks.length} micro-missions completed • {remainingMinutes} mins estimated effort remaining
          </p>
        </div>

        {/* Focus Mode Quick Return Button */}
        <button
          type="button"
          onClick={onSwitchToFocusMode}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
            accessibility.highContrast
              ? 'bg-yellow-400 text-black border-2 border-white'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
          }`}
          aria-label="Return to Single Task Dopamine Focus Mode"
        >
          <Crosshair className="w-4 h-4" aria-hidden="true" />
          <span>Launch 1-Task Focus</span>
        </button>
      </div>

      {/* Filter and Zone Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {/* Zone Filters */}
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Filter tasks by zone">
          <button
            type="button"
            onClick={() => setSelectedZone('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
              selectedZone === 'all'
                ? accessibility.highContrast
                  ? 'bg-yellow-400 text-black border-white font-bold'
                  : 'bg-cyan-500 text-black border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            aria-pressed={selectedZone === 'all'}
          >
            All Zones
          </button>
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedZone(zone.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                selectedZone === zone.name
                  ? accessibility.highContrast
                    ? 'bg-yellow-400 text-black border-white font-bold'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              aria-pressed={selectedZone === zone.name}
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Completion status filter */}
        <div className="flex items-center gap-1.5" role="toolbar" aria-label="Filter by task status">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              filterStatus === 'all' ? 'text-cyan-400 font-bold underline' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-pressed={filterStatus === 'all'}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              filterStatus === 'pending' ? 'text-amber-400 font-bold underline' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-pressed={filterStatus === 'pending'}
          >
            Pending ({tasks.length - completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              filterStatus === 'completed' ? 'text-emerald-400 font-bold underline' : 'text-slate-500 hover:text-slate-300'
            }`}
            aria-pressed={filterStatus === 'completed'}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3" role="list">
        {filteredTasks.map((task, idx) => (
          <div
            key={task.id}
            role="listitem"
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              task.completed
                ? 'opacity-60 bg-black/40 border-slate-800'
                : accessibility.highContrast
                ? 'bg-black border-2 border-yellow-400/80 hover:border-yellow-400'
                : 'bg-[#101528] border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            {/* Task Info with Accessible Checkbox */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <label
                htmlFor={`checkbox-${task.id}`}
                className="relative flex items-center cursor-pointer mt-0.5"
              >
                <input
                  id={`checkbox-${task.id}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task)}
                  className="sr-only"
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors border ${
                    task.completed
                      ? accessibility.highContrast
                        ? 'bg-yellow-400 text-black border-white'
                        : 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                      : 'border-slate-600 hover:border-cyan-400 bg-slate-900'
                  }`}
                  aria-hidden="true"
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                </div>
              </label>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {task.zone}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {task.estimatedMinutes}m
                  </span>
                  <span className="text-[10px] font-mono text-fuchsia-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    +{task.xp} XP
                  </span>
                  {task.itemCountHint && (
                    <span className="text-[10px] font-mono text-amber-300">
                      [{task.itemCountHint}]
                    </span>
                  )}
                </div>

                <h3
                  className={`text-sm sm:text-base font-semibold leading-snug ${
                    task.completed ? 'line-through text-slate-500' : 'text-white'
                  }`}
                >
                  {task.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Focus Action Button */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              {!task.completed && (
                <button
                  type="button"
                  onClick={() => onFocusTask(task)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                    accessibility.highContrast
                      ? 'bg-yellow-400 text-black border-white'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900'
                  }`}
                  aria-label={`Enter single-task focus mode for ${task.title}`}
                >
                  <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Lock Focus</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
