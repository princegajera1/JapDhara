/**
 * JapDhara Streak Calculation Engine
 * Integrates active calendar dates from app opens, Jaap, and meditation sessions.
 */

import { getLocalDateKey, calculateStreaks as calculateBaseStreaks } from './dateUtils';

export const calculateStreaks = (
  recentSessions = [],
  meditationHistory = [],
  todayCount = 0,
  storedActiveDates = []
) => {
  const activeDateSet = new Set(
    Array.isArray(storedActiveDates)
      ? storedActiveDates.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      : []
  );

  // Extract date keys from Jaap sessions
  recentSessions.forEach((s) => {
    if (s.dateKey) {
      activeDateSet.add(s.dateKey);
    } else if (s.date) {
      const d = new Date(s.date);
      if (!isNaN(d.getTime())) {
        activeDateSet.add(getLocalDateKey(d));
      }
    }
  });

  // Extract date keys from meditation sessions
  meditationHistory.forEach((m) => {
    if (m.dateKey) {
      activeDateSet.add(m.dateKey);
    } else if (m.timestamp || m.date) {
      const d = new Date(m.timestamp || m.date);
      if (!isNaN(d.getTime())) {
        activeDateSet.add(getLocalDateKey(d));
      }
    }
  });

  const todayKey = getLocalDateKey();
  if (todayCount > 0) {
    activeDateSet.add(todayKey);
  }

  const { currentStreak, longestStreak, totalActiveDays } = calculateBaseStreaks(
    Array.from(activeDateSet)
  );

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    activeDateSet,
  };
};
