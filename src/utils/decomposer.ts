import { RoomAnalysis, DecomposedTask, ClutterLevel } from '../types/index.ts';

export const ADHD_DECOMPOSITION_SYSTEM_PROMPT = `You are NeuroSweep, an expert AI task deconstruction system designed specifically for people with ADHD experiencing executive dysfunction.

When given an image of a messy room:
1. Identify the room type and specific clutter (dishes, clothes, trash, wrappers, papers, bottles, items on floor).
2. DO NOT suggest massive tasks like "Clean the room" or "Do all the dishes". Executive dysfunction causes paralysis when tasks are broad or open-ended.
3. Decompose the process into 4 to 7 TINY, DOPAMINE-FRIENDLY MICRO-TASKS (each 1 to 5 minutes maximum).
4. Order tasks by cognitive ease and dopamine momentum:
   - Task 1 MUST BE zero-friction: picking up obvious trash/packaging in a bag, or gathering 3 items.
   - Next tasks: "Staging" (gathering like items in one spot without processing them yet, e.g. cups by sink, clothes onto bed corner).
   - Next tasks: Put-aways with definite homes.
   - Final task: Quick sensory reset (wipe a surface or straighten pillows).
5. For each task, provide:
   - title: Crisp, active instruction starting with action verb and quantity (e.g. "Pick up 4 stray mugs")
   - description: Reassuring, friendly breakdown that removes guilt and explains exactly what to do and what NOT to worry about yet.
   - zone: Name of the zone (e.g. "Trash Sweep", "Countertop Staging", "Floor Clearance")
   - estimatedMinutes: 1 to 5 minutes
   - difficulty: "micro" | "easy" | "moderate"
   - dopamineTag: Short fun badge (e.g. "Instant Win", "Floor Liberator", "Brain Reset", "Tetris Joy")
   - whyThisHelps: 1 sentence explaining the neuroscience/executive function benefit (e.g. "Removes 50% of visual noise so working memory can breathe").
   - itemCountHint: Approximate count of items (e.g. "Approx 3 items")

Return ONLY valid JSON matching this schema:
{
  "roomType": string,
  "summary": string (warm, non-judgmental analysis of the room clutter),
  "clutterLevel": "low" | "medium" | "high" | "critical",
  "totalEstimatedMinutes": number,
  "totalTasks": number,
  "zones": [
    { "id": string, "name": string, "description": string, "color": string }
  ],
  "tasks": [
    {
      "id": string,
      "title": string,
      "description": string,
      "zone": string,
      "estimatedMinutes": number,
      "difficulty": "micro" | "easy" | "moderate",
      "completed": false,
      "xp": number,
      "dopamineTag": string,
      "whyThisHelps": string,
      "itemCountHint": string
    }
  ],
  "adhdTip": string (specific encouraging tip for this room)
}`;

export function validateAndSanitizeAnalysis(raw: unknown): RoomAnalysis | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<RoomAnalysis>;

  if (!data.roomType || !Array.isArray(data.tasks) || data.tasks.length === 0) {
    return null;
  }

  const clutterLevel: ClutterLevel =
    data.clutterLevel === 'low' || data.clutterLevel === 'medium' || data.clutterLevel === 'high' || data.clutterLevel === 'critical'
      ? data.clutterLevel
      : 'high';

  const defaultColors = ['#ff0055', '#00f0ff', '#ffe600', '#00ff66', '#b026ff', '#ff8800'];

  const zones = Array.isArray(data.zones) && data.zones.length > 0
    ? data.zones.map((z, idx) => ({
        id: z.id || `zone-${idx + 1}`,
        name: z.name || `Zone ${idx + 1}`,
        description: z.description || 'Target area',
        color: z.color || defaultColors[idx % defaultColors.length],
      }))
    : [{ id: 'z1', name: 'Primary Zone', description: 'Immediate Focus', color: '#00f0ff' }];

  const tasks: DecomposedTask[] = data.tasks.map((t, idx) => {
    const minutes = typeof t.estimatedMinutes === 'number' && t.estimatedMinutes > 0 ? Math.min(10, Math.round(t.estimatedMinutes)) : 3;
    const difficulty = t.difficulty === 'micro' || t.difficulty === 'moderate' ? t.difficulty : 'easy';
    const xp = typeof t.xp === 'number' && t.xp > 0 ? t.xp : minutes * 25;

    return {
      id: t.id || `task-${idx + 1}-${Date.now()}`,
      title: t.title || `Micro-step ${idx + 1}`,
      description: t.description || 'Take a breath and do this quick step.',
      zone: t.zone || zones[0].name,
      estimatedMinutes: minutes,
      difficulty,
      completed: false,
      xp,
      dopamineTag: t.dopamineTag || 'Quick Win',
      whyThisHelps: t.whyThisHelps || 'Reduces visual clutter and jumpstarts dopamine production.',
      itemCountHint: t.itemCountHint || undefined,
    };
  });

  const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  return {
    roomType: data.roomType || 'Living Space',
    summary: data.summary || 'Tactical sweep of room clutter ready for step-by-step execution.',
    clutterLevel,
    totalEstimatedMinutes: totalMinutes,
    totalTasks: tasks.length,
    zones,
    tasks,
    adhdTip: data.adhdTip || 'One small step breaks the overwhelm cycle. You don’t have to finish everything to win!',
  };
}

export function parseAIResponseToJSON(rawText: string): unknown {
  // Strip possible markdown code blocks ```json ... ```
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find first { and last }
  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return JSON.parse(cleaned);
}
