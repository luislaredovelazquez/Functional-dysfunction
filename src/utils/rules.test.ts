import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelFromXP,
  calculateTaskXP,
  updateGameStateOnTaskComplete,
  getRankTitle,
  XP_PER_LEVEL,
} from './gamification.ts';
import { parseAIResponseToJSON, validateAndSanitizeAnalysis } from './decomposer.ts';

test('calculateLevelFromXP handles 0 XP', () => {
  const result = calculateLevelFromXP(0);
  assert.equal(result.level, 1);
  assert.equal(result.currentLevelXP, 0);
  assert.equal(result.xpNeededForNext, XP_PER_LEVEL);
  assert.equal(result.progressPercent, 0);
});

test('calculateLevelFromXP scales levels correctly', () => {
  const result = calculateLevelFromXP(250);
  assert.equal(result.level, 2);
  assert.equal(result.currentLevelXP, 50);
  assert.equal(result.progressPercent, 25);
});

test('getRankTitle returns appropriate titles', () => {
  assert.equal(getRankTitle(1), 'Novice Cadet');
  assert.equal(getRankTitle(2), 'Neural Sweeper');
  assert.equal(getRankTitle(4), 'Zone Commander');
});

test('calculateTaskXP applies micro-task bonus and streak multiplier', () => {
  const microXP = calculateTaskXP(2, 'micro', 0);
  // 2 * 25 * 1.2 = 60
  assert.equal(microXP, 60);

  const streakXP = calculateTaskXP(2, 'micro', 4);
  // 60 + (4 * 5) = 80
  assert.equal(streakXP, 80);
});

test('updateGameStateOnTaskComplete increments streak and detects level up', () => {
  const initial = {
    xp: 180,
    level: 1,
    xpToNextLevel: 200,
    streak: 0,
    completedCount: 0,
    rankTitle: 'Novice Cadet',
    soundEnabled: true,
    speechEnabled: false,
  };

  const { newState, leveledUp } = updateGameStateOnTaskComplete(initial, 60);
  assert.equal(newState.xp, 240);
  assert.equal(newState.level, 2);
  assert.equal(leveledUp, true);
  assert.equal(newState.streak, 1);
  assert.equal(newState.completedCount, 1);
  assert.equal(newState.rankTitle, 'Neural Sweeper');
});

test('parseAIResponseToJSON strips markdown fences', () => {
  const markdown = '```json\n{"roomType": "Kitchen", "tasks": []}\n```';
  const parsed = parseAIResponseToJSON(markdown) as { roomType: string };
  assert.equal(parsed.roomType, 'Kitchen');
});

test('validateAndSanitizeAnalysis handles raw structured data', () => {
  const raw = {
    roomType: 'Study Desk',
    summary: 'Cables and cups cluttering desk.',
    tasks: [
      {
        title: 'Pick up 2 mugs',
        estimatedMinutes: 2,
        difficulty: 'micro',
      },
    ],
  };

  const sanitized = validateAndSanitizeAnalysis(raw);
  assert.notEqual(sanitized, null);
  assert.equal(sanitized?.roomType, 'Study Desk');
  assert.equal(sanitized?.tasks.length, 1);
  assert.equal(sanitized?.tasks[0].estimatedMinutes, 2);
  assert.equal(sanitized?.tasks[0].completed, false);
});
