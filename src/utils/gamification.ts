import { GamificationState } from '../types/index.ts';

export const RANK_TIERS = [
  { level: 1, title: 'Novice Cadet', minXp: 0 },
  { level: 2, title: 'Neural Sweeper', minXp: 150 },
  { level: 3, title: 'Dopamine Specialist', minXp: 400 },
  { level: 4, title: 'Zone Commander', minXp: 800 },
  { level: 5, title: 'Executive Function Archon', minXp: 1400 },
  { level: 6, title: 'Cyber Sanctuary Prime', minXp: 2200 },
];

export const XP_PER_LEVEL = 200;

export function getRankTitle(level: number): string {
  const match = [...RANK_TIERS].reverse().find(t => level >= t.level);
  return match ? match.title : 'Zone Commander';
}

export function calculateLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  const safeXP = Math.max(0, totalXP);
  const level = Math.floor(safeXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = safeXP % XP_PER_LEVEL;
  const xpNeededForNext = XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / xpNeededForNext) * 100));

  return {
    level,
    currentLevelXP,
    xpNeededForNext,
    progressPercent,
  };
}

export function calculateTaskXP(minutes: number, difficulty: string, streak: number): number {
  const baseRate = 25; // 25 XP per minute estimated
  const safeMinutes = Math.max(1, Math.min(minutes, 10));
  let multiplier = 1.0;

  if (difficulty === 'micro') multiplier = 1.2; // Bonus dopamine reward for micro tasks!
  if (difficulty === 'moderate') multiplier = 1.5;

  const streakBonus = Math.min(streak * 5, 50); // up to +50 XP streak bonus
  return Math.round(safeMinutes * baseRate * multiplier + streakBonus);
}

export function updateGameStateOnTaskComplete(
  current: GamificationState,
  taskXP: number
): { newState: GamificationState; leveledUp: boolean } {
  const newXP = current.xp + taskXP;
  const prevLevel = current.level;
  const { level, xpNeededForNext } = calculateLevelFromXP(newXP);
  const leveledUp = level > prevLevel;
  const newStreak = current.streak + 1;
  const newCompletedCount = current.completedCount + 1;

  return {
    newState: {
      ...current,
      xp: newXP,
      level,
      xpToNextLevel: xpNeededForNext,
      streak: newStreak,
      completedCount: newCompletedCount,
      rankTitle: getRankTitle(level),
    },
    leveledUp,
  };
}

// Procedural Web Audio synth for rewarding feedback without external assets
export function playCyberpunkSound(type: 'task_complete' | 'level_up' | 'click' | 'timer_done') {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContext) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'task_complete') {
      // Ascending major chime with cyber shimmer
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } else if (type === 'level_up') {
      // Cyber fanfare
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.001, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.45);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'timer_done') {
      const notes = [784, 880, 988, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.22);
      });
    }
  } catch {
    // AudioContext might be blocked until user gesture, ignore safely
  }
}

// Text-to-speech for ADHD auditory processing support
export function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors safely
  }
}
