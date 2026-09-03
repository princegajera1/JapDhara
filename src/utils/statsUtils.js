/**
 * JapDhara Statistics Calculation Engine
 * Dynamic analytics calculated strictly from user's actual stored records.
 */

import { getTodayDateKey, getWeeklyDateKeys, getLocalDateKey } from './dateUtils';
import { calculateCompletedMalas } from './malaUtils';
import { calculateStreaks } from './streakUtils';

export const calculateAppStats = ({
  todayCount = 0,
  dailyGoal = 108,
  completedMalas = 0,
  recentSessions = [],
  meditationHistory = [],
  activeDates = [],
}) => {
  const todayKey = getTodayDateKey();

  // 1. Total Jaap Count
  const historyJaapSum = recentSessions.reduce((acc, s) => acc + (s.count || 0), 0);
  const totalJaap = Math.max(todayCount, historyJaapSum);

  // 2. Total Malas
  const historyMalasSum = recentSessions.reduce(
    (acc, s) => acc + (s.count >= 108 ? Math.floor(s.count / 108) : 0),
    0
  );
  const totalMalas = Math.max(completedMalas, calculateCompletedMalas(totalJaap), historyMalasSum);

  // 3. Meditation Totals
  const totalMeditationMinutes = meditationHistory.reduce(
    (acc, m) => acc + (m.durationMinutes || (m.durationSeconds ? Math.round(m.durationSeconds / 60) : 0)),
    0
  );
  const totalMeditationSessions = meditationHistory.length;

  // 4. Streaks
  const { currentStreak, longestStreak, totalActiveDays, activeDateSet } = calculateStreaks(
    recentSessions,
    meditationHistory,
    todayCount,
    activeDates
  );

  // 5. Weekly 7-Day Breakdown (Mon to Sun)
  const weeklyDateKeys = getWeeklyDateKeys();
  const weeklyData = weeklyDateKeys.map(({ dayName, dateKey, isToday }) => {
    let dayCount = 0;
    recentSessions.forEach((s) => {
      if (s.dateKey === dateKey) {
        dayCount += s.count || 0;
      } else if (s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime()) && getLocalDateKey(d) === dateKey) {
          dayCount += s.count || 0;
        }
      }
    });

    if (isToday && dayCount < todayCount) {
      dayCount = todayCount;
    }

    return {
      day: dayName,
      dateKey,
      count: dayCount,
      isToday,
    };
  });

  const weeklyTotal = weeklyData.reduce((acc, d) => acc + d.count, 0);
  const weeklyAverage = Math.round(weeklyTotal / 7);
  const maxDay = [...weeklyData].sort((a, b) => b.count - a.count)[0];
  const bestDayName = maxDay && maxDay.count > 0 ? `${maxDay.day} (${maxDay.count})` : 'None';
  const weeklyMalas = Math.floor(weeklyTotal / 108);

  // 6. Monthly Summary
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let monthlyTotal = 0;
  const monthlyActiveDaysSet = new Set();

  // Add all dates from activeDateSet that fall in the current month
  activeDateSet.forEach((dKey) => {
    const d = new Date(`${dKey}T00:00:00`);
    if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      monthlyActiveDaysSet.add(dKey);
    }
  });

  recentSessions.forEach((s) => {
    const d = new Date(s.timestamp || s.date);
    if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      monthlyTotal += s.count || 0;
    }
  });

  if (todayCount > 0) {
    if (monthlyTotal < todayCount) monthlyTotal = todayCount;
  }

  const monthlyMalas = Math.floor(monthlyTotal / 108);
  const monthlyActiveDays = monthlyActiveDaysSet.size;

  const monthlyMeditationMinutes = meditationHistory.reduce((acc, m) => {
    const d = new Date(m.timestamp || m.date);
    if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      return acc + (m.durationMinutes || (m.durationSeconds ? Math.round(m.durationSeconds / 60) : 0));
    }
    return acc;
  }, 0);

  const todayProgressPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  return {
    todayCount,
    dailyGoal,
    todayProgressPct,
    totalJaap,
    totalMalas,
    totalMeditationMinutes,
    totalMeditationSessions,
    currentStreak,
    longestStreak,
    totalActiveDays,
    weeklyData,
    weeklyTotal,
    weeklyAverage,
    bestDayName,
    weeklyMalas,
    monthlyTotal,
    monthlyMalas,
    monthlyMeditationMinutes,
    monthlyActiveDays,
  };
};
