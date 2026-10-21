import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ImageScanner } from './components/ImageScanner.tsx';
import { TaskFocusView } from './components/TaskFocusView.tsx';
import { TacticalTaskHUD } from './components/TacticalTaskHUD.tsx';
import { RoomSummaryCard } from './components/RoomSummaryCard.tsx';
import { CelebrationBanner } from './components/CelebrationBanner.tsx';
import {
  RoomAnalysis,
  DecomposedTask,
  GamificationState,
  AccessibilitySettings,
} from './types/index.ts';
import { PresetRoom } from './utils/presets.ts';
import {
  updateGameStateOnTaskComplete,
  playCyberpunkSound,
  calculateLevelFromXP,
} from './utils/gamification.ts';

export default function App() {
  // Gamification state
  const [gameState, setGameState] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('neurosweep_game');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return {
      xp: 0,
      level: 1,
      xpToNextLevel: 200,
      streak: 0,
      completedCount: 0,
      rankTitle: 'Novice Cadet',
      soundEnabled: true,
      speechEnabled: false,
    };
  });

  // Accessibility settings (WCAG 2.1 compliance)
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('neurosweep_a11y');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'normal',
      screenReaderAnnouncements: true,
    };
  });

  // Save state on change
  useEffect(() => {
    localStorage.setItem('neurosweep_game', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('neurosweep_a11y', JSON.stringify(accessibility));
  }, [accessibility]);

  // Active AI Engine detection
  const [activeEngine, setActiveEngine] = useState<string>('Detecting AI Model...');

  useEffect(() => {
    fetch('/api/engine-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeEngine) {
          setActiveEngine(data.activeEngine);
        }
      })
      .catch(() => {
        setActiveEngine('OpenAI / Gemini Vision Ready');
      });
  }, []);

  // Application state
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'focus' | 'all'>('focus');
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Announce helper for screen readers
  const announce = (message: string) => {
    setLiveAnnouncement(message);
  };

  // Perform room analysis via backend proxy
  const handleAnalyze = async (imageData: string, mimeType: string, roomTypeHint?: string) => {
    setIsAnalyzing(true);
    announce('Initiating neural clutter scan. Decomposing room into tiny micro-steps.');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          mimeType,
          roomTypeHint,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      if (result.analysis) {
        setAnalysis(result.analysis);
        setActiveTaskIndex(0);
        setViewMode('focus');

        if (gameState.soundEnabled) {
          playCyberpunkSound('task_complete');
        }

        announce(
          `Analysis complete for ${result.analysis.roomType}. Identified ${result.analysis.totalTasks} dopamine-friendly micro-tasks, total estimated time ${result.analysis.totalEstimatedMinutes} minutes.`
        );
      } else {
        throw new Error('Analysis response was empty');
      }
    } catch (err) {
      console.error('Analyze failed:', err);
      announce('Analysis encountered an issue. Please try another image or preset.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Direct 1-click Preset Selector
  const handleSelectPreset = (preset: PresetRoom) => {
    // Clone analysis so tasks are freshly mutable
    const freshTasks = preset.analysis.tasks.map((t) => ({ ...t, completed: false }));
    setAnalysis({
      ...preset.analysis,
      tasks: freshTasks,
    });
    setActiveTaskIndex(0);
    setViewMode('focus');

    if (gameState.soundEnabled) {
      playCyberpunkSound('click');
    }

    announce(
      `Loaded preset ${preset.name}. ${preset.analysis.tasks.length} micro-tasks ready for execution.`
    );
  };

  // Mark task complete with gamified dopamine reward
  const handleTaskComplete = (completedTask: DecomposedTask) => {
    if (!analysis) return;

    // Update tasks in analysis
    const updatedTasks = analysis.tasks.map((t) =>
      t.id === completedTask.id ? { ...t, completed: true, completedAt: Date.now() } : t
    );

    const updatedAnalysis = { ...analysis, tasks: updatedTasks };
    setAnalysis(updatedAnalysis);

    // Update XP and game state
    const { newState, leveledUp } = updateGameStateOnTaskComplete(gameState, completedTask.xp);
    setGameState(newState);

    // Play sounds
    if (gameState.soundEnabled) {
      if (leveledUp) {
        playCyberpunkSound('level_up');
      } else {
        playCyberpunkSound('task_complete');
      }
    }

    // Screen reader announcement
    if (leveledUp) {
      announce(
        `Task completed! You earned ${completedTask.xp} XP. LEVEL UP! You reached Level ${newState.level}: ${newState.rankTitle}!`
      );
    } else {
      announce(
        `Task completed: ${completedTask.title}. You earned ${completedTask.xp} XP! Current streak: ${newState.streak}.`
      );
    }

    // Auto-advance to next incomplete task
    const nextIncompleteIdx = updatedTasks.findIndex((t) => !t.completed);
    if (nextIncompleteIdx !== -1) {
      setActiveTaskIndex(nextIncompleteIdx);
    }
  };

  // Toggle complete from list view
  const handleToggleComplete = (task: DecomposedTask) => {
    if (task.completed) {
      // Uncheck
      if (!analysis) return;
      const updatedTasks = analysis.tasks.map((t) =>
        t.id === task.id ? { ...t, completed: false } : t
      );
      setAnalysis({ ...analysis, tasks: updatedTasks });
      announce(`Task marked as incomplete: ${task.title}`);
    } else {
      handleTaskComplete(task);
    }
  };

  // Skip task without penalty
  const handleTaskSkip = () => {
    if (!analysis) return;
    const tasks = analysis.tasks;
    // Find next task after current index, looping around
    for (let i = 1; i < tasks.length; i++) {
      const candidateIdx = (activeTaskIndex + i) % tasks.length;
      if (!tasks[candidateIdx].completed) {
        setActiveTaskIndex(candidateIdx);
        announce(`Skipped to task: ${tasks[candidateIdx].title}`);
        return;
      }
    }
  };

  // Lock into a specific task from list
  const handleFocusSpecificTask = (task: DecomposedTask) => {
    if (!analysis) return;
    const idx = analysis.tasks.findIndex((t) => t.id === task.id);
    if (idx !== -1) {
      setActiveTaskIndex(idx);
      setViewMode('focus');
      announce(`Locked focus on task: ${task.title}`);
    }
  };

  // Reset to scan a new room
  const handleReset = () => {
    setAnalysis(null);
    setActiveTaskIndex(0);
    announce('Cleared current room. Ready to scan a new space.');
  };

  // Active task calculation
  const currentTask = analysis?.tasks[activeTaskIndex] || null;
  const isRoomLiberated = Boolean(
    analysis && analysis.tasks.length > 0 && analysis.tasks.every((t) => t.completed)
  );

  // Find next task preview
  const nextIncompleteTask = analysis?.tasks.find((t, i) => i > activeTaskIndex && !t.completed);

  // Font size class mapping
  const getFontSizeClass = () => {
    if (accessibility.fontSize === 'large') return 'text-[18px]';
    if (accessibility.fontSize === 'extra-large') return 'text-[20px]';
    return 'text-[16px]';
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-cyan-500 selection:text-black ${
        accessibility.highContrast
          ? 'bg-black text-white'
          : 'bg-[#06080f] text-slate-100'
      } ${getFontSizeClass()}`}
    >
      {/* Skip to Content for Keyboard/Screen Reader WCAG 2.1 Compliance */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:font-bold focus:rounded-md focus:outline-none focus:ring-4 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Screen Reader Live Announcement Region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {liveAnnouncement}
      </div>

      {/* Cyberpunk Grid Background Overlay (calmed if reducedMotion is true) */}
      {!accessibility.highContrast && !accessibility.reducedMotion && (
        <div
          className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#00f0ff0f_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0f_1px,transparent_1px)] bg-[size:4rem_4rem]"
          aria-hidden="true"
        />
      )}

      {/* Header */}
      <Header
        gameState={gameState}
        accessibility={accessibility}
        activeEngine={activeEngine}
        onToggleSound={() =>
          setGameState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
        }
        onToggleSpeech={() =>
          setGameState((prev) => ({ ...prev, speechEnabled: !prev.speechEnabled }))
        }
        onToggleHighContrast={() =>
          setAccessibility((prev) => ({ ...prev, highContrast: !prev.highContrast }))
        }
        onToggleReducedMotion={() =>
          setAccessibility((prev) => ({ ...prev, reducedMotion: !prev.reducedMotion }))
        }
        onToggleFontSize={() => {
          setAccessibility((prev) => {
            const nextSize =
              prev.fontSize === 'normal'
                ? 'large'
                : prev.fontSize === 'large'
                ? 'extra-large'
                : 'normal';
            return { ...prev, fontSize: nextSize };
          });
        }}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
        {!analysis ? (
          /* Step 1: Room Scanner & Input Station */
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            {/* ADHD Executive Function Mission Banner */}
            <section
              aria-label="Executive Function Introduction"
              className={`p-5 rounded-2xl border transition-colors ${
                accessibility.highContrast
                  ? 'bg-black border-2 border-yellow-400 text-white'
                  : 'bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-fuchsia-950/40 border-cyan-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                    [NEURODIVERGENT EXECUTIVE COMPANION]
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-mono text-white">
                    Paralyzed by a messy room? Let AI do the hard part.
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Executive dysfunction convinces your brain that cleaning requires hours of suffering.
                    NeuroSweep scans the room and chunks it into bite-sized, 2-minute dopamine wins.
                  </p>
                </div>
              </div>
            </section>

            {/* Scanner Component */}
            <ImageScanner
              accessibility={accessibility}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAnalyze}
              onSelectPreset={handleSelectPreset}
            />
          </div>
        ) : (
          /* Step 2: Active Room Tactical De-Clutter Station */
          <div className="flex flex-col gap-6">
            {/* Room Diagnostics Summary Bar */}
            <RoomSummaryCard
              analysis={analysis}
              accessibility={accessibility}
              onReset={handleReset}
            />

            {/* Victory Celebration Banner when all tasks done */}
            {isRoomLiberated ? (
              <CelebrationBanner
                totalTasks={analysis.totalTasks}
                totalXp={analysis.tasks.reduce((sum, t) => sum + t.xp, 0)}
                timeSpent={analysis.totalEstimatedMinutes}
                streak={gameState.streak}
                accessibility={accessibility}
                onReset={handleReset}
              />
            ) : (
              <>
                {/* View Switcher: Focus Mode vs Tactical Map */}
                <div className="flex items-center justify-between" role="tablist" aria-label="Task display modes">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewMode === 'focus'}
                      onClick={() => setViewMode('focus')}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                        viewMode === 'focus'
                          ? accessibility.highContrast
                            ? 'bg-yellow-400 text-black border-white'
                            : 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      1-Task Focus Lock (Anti-Paralysis)
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={viewMode === 'all'}
                      onClick={() => setViewMode('all')}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus:outline-none ${
                        viewMode === 'all'
                          ? accessibility.highContrast
                            ? 'bg-yellow-400 text-black border-white'
                            : 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Tactical Room Map ({analysis.tasks.filter((t) => t.completed).length}/
                      {analysis.tasks.length})
                    </button>
                  </div>
                </div>

                {/* Primary Interactive View */}
                {viewMode === 'focus' && currentTask ? (
                  <TaskFocusView
                    task={currentTask}
                    currentIndex={activeTaskIndex}
                    totalTasks={analysis.tasks.length}
                    nextTask={nextIncompleteTask}
                    accessibility={accessibility}
                    soundEnabled={gameState.soundEnabled}
                    speechEnabled={gameState.speechEnabled}
                    onComplete={handleTaskComplete}
                    onSkip={handleTaskSkip}
                    onSwitchToAllTasks={() => setViewMode('all')}
                  />
                ) : (
                  <TacticalTaskHUD
                    tasks={analysis.tasks}
                    zones={analysis.zones}
                    accessibility={accessibility}
                    onToggleComplete={handleToggleComplete}
                    onFocusTask={handleFocusSpecificTask}
                    onSwitchToFocusMode={() => setViewMode('focus')}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Cyberpunk Footer with Accessibility & Executive Function Credits */}
      <footer
        role="contentinfo"
        className={`border-t py-6 px-4 mt-12 transition-colors ${
          accessibility.highContrast
            ? 'bg-black border-yellow-400 text-white'
            : 'bg-[#080a14] border-slate-800/80 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">NEURO//SWEEP v2.1</span>
            <span>•</span>
            <span>WCAG 2.1 AA/AAA Compliant</span>
            <span>•</span>
            <span>ADHD Executive Function Decomposer</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by OpenAI GPT-4o & Google Gemini Vision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
