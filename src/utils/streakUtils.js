/**
 * JapDhara Streak Calculation Engine
 * Date-based consecutive day streak calculation.
 */

import { getTodayDateKey } from './dateUtils';

export const calculateStreaks = (recentSessions = [], meditationHistory = [], todayCount = 0) => {
  const activeDateSet = new Set();

  // Extract date keys from Jaap sessions
  recentSessions.forEach((s) => {
    if (s.dateKey) {
      activeDateSet.add(s.dateKey);
    } else if (s.date) {
      const d = new Date(s.date);
      if (!isNaN(d.getTime())) {
        activeDateSet.add(d.toISOString().split('T')[0]);
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
        activeDateSet.add(d.toISOString().split('T')[0]);
      }
    }
  });

  // Include today if todayCount > 0
  const todayStr = getTodayDateKey();
  if (todayCount > 0) {
    activeDateSet.add(todayStr);
  }

  const sortedDates = Array.from(activeDateSet).sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak relative to today or yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (activeDateSet.has(todayStr) || activeDateSet.has(yesterdayStr)) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: activeDateSet.size,
    activeDateSet,
  };
};
