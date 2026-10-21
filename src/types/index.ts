export type ClutterLevel = 'low' | 'medium' | 'high' | 'critical';

export type TaskDifficulty = 'micro' | 'easy' | 'moderate';

export interface RoomZone {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface DecomposedTask {
  id: string;
  title: string;
  description: string;
  zone: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
  completed: boolean;
  completedAt?: number;
  xp: number;
  dopamineTag: string;
  whyThisHelps: string;
  itemCountHint?: string;
}

export interface RoomAnalysis {
  roomType: string;
  summary: string;
  clutterLevel: ClutterLevel;
  totalEstimatedMinutes: number;
  totalTasks: number;
  zones: RoomZone[];
  tasks: DecomposedTask[];
  adhdTip: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
  completedCount: number;
  rankTitle: string;
  soundEnabled: boolean;
  speechEnabled: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  screenReaderAnnouncements: boolean;
}
