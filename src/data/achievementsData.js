/**
 * JapDhara Master Achievement Dataset
 * 100 dynamically evaluated spiritual milestones across 9 categories.
 */

export const ACHIEVEMENT_CATEGORIES = [
  'All',
  'Jaap',
  'Mala',
  'Streak',
  'Meditation',
  'Daily Practice',
  'Consistency',
  'Sessions',
  'Mantra',
];

export const RAW_ACHIEVEMENTS = [
  // 1. JAAP MILESTONES (13)
  { id: 'jaap-1', category: 'Jaap', title: 'First Chant', description: 'Complete your very first Jaap chant.', target: 1, getValue: (s) => s.totalJaap },
  { id: 'jaap-10', category: 'Jaap', title: '10 Chants', description: 'Reach 10 total Jaap chants.', target: 10, getValue: (s) => s.totalJaap },
  { id: 'jaap-25', category: 'Jaap', title: '25 Chants', description: 'Reach 25 total Jaap chants.', target: 25, getValue: (s) => s.totalJaap },
  { id: 'jaap-50', category: 'Jaap', title: '50 Chants', description: 'Reach 50 total Jaap chants.', target: 50, getValue: (s) => s.totalJaap },
  { id: 'jaap-108', category: 'Jaap', title: '108 Sacred Chants', description: 'Reach 108 total chants of devotion.', target: 108, getValue: (s) => s.totalJaap },
  { id: 'jaap-216', category: 'Jaap', title: '216 Devotional Chants', description: 'Reach 216 total Jaap chants.', target: 216, getValue: (s) => s.totalJaap },
  { id: 'jaap-500', category: 'Jaap', title: '500 Chants', description: 'Reach 500 total Jaap chants.', target: 500, getValue: (s) => s.totalJaap },
  { id: 'jaap-1000', category: 'Jaap', title: '1,000 Chants', description: 'Reach 1,000 total Jaap chants.', target: 1000, getValue: (s) => s.totalJaap },
  { id: 'jaap-5000', category: 'Jaap', title: '5,000 Chants', description: 'Reach 5,000 total Jaap chants.', target: 5000, getValue: (s) => s.totalJaap },
  { id: 'jaap-10000', category: 'Jaap', title: '10,000 Chants', description: 'Reach 10,000 total Jaap chants.', target: 10000, getValue: (s) => s.totalJaap },
  { id: 'jaap-25000', category: 'Jaap', title: '25,000 Chants', description: 'Reach 25,000 total Jaap chants.', target: 25000, getValue: (s) => s.totalJaap },
  { id: 'jaap-50000', category: 'Jaap', title: '50,000 Chants', description: 'Reach 50,000 total Jaap chants.', target: 50000, getValue: (s) => s.totalJaap },
  { id: 'jaap-100000', category: 'Jaap', title: '100,000 Master Chants', description: 'Reach 100,000 total Jaap chants.', target: 100000, getValue: (s) => s.totalJaap },

  // 2. MALA MILESTONES (10)
  { id: 'mala-1', category: 'Mala', title: 'First Mala', description: 'Complete your first 108-bead sacred mala.', target: 1, getValue: (s) => s.totalMalas },
  { id: 'mala-2', category: 'Mala', title: '2 Malas', description: 'Complete 2 full 108-bead malas.', target: 2, getValue: (s) => s.totalMalas },
  { id: 'mala-5', category: 'Mala', title: '5 Malas', description: 'Complete 5 full 108-bead malas.', target: 5, getValue: (s) => s.totalMalas },
  { id: 'mala-10', category: 'Mala', title: '10 Malas', description: 'Complete 10 full 108-bead malas.', target: 10, getValue: (s) => s.totalMalas },
  { id: 'mala-25', category: 'Mala', title: '25 Malas', description: 'Complete 25 full 108-bead malas.', target: 25, getValue: (s) => s.totalMalas },
  { id: 'mala-50', category: 'Mala', title: '50 Malas', description: 'Complete 50 full 108-bead malas.', target: 50, getValue: (s) => s.totalMalas },
  { id: 'mala-108', category: 'Mala', title: '108 Malas', description: 'Complete 108 full 108-bead malas.', target: 108, getValue: (s) => s.totalMalas },
  { id: 'mala-216', category: 'Mala', title: '216 Malas', description: 'Complete 216 full 108-bead malas.', target: 216, getValue: (s) => s.totalMalas },
  { id: 'mala-500', category: 'Mala', title: '500 Malas', description: 'Complete 500 full 108-bead malas.', target: 500, getValue: (s) => s.totalMalas },
  { id: 'mala-1000', category: 'Mala', title: '1,000 Malas Master', description: 'Complete 1,000 full 108-bead malas.', target: 1000, getValue: (s) => s.totalMalas },

  // 3. STREAK MILESTONES (12)
  { id: 'streak-2', category: 'Streak', title: '2-Day Flow', description: 'Maintain a 2-day consecutive Sadhana streak.', target: 2, getValue: (s) => s.longestStreak },
  { id: 'streak-3', category: 'Streak', title: '3-Day Sadhana', description: 'Maintain a 3-day consecutive Sadhana streak.', target: 3, getValue: (s) => s.longestStreak },
  { id: 'streak-7', category: 'Streak', title: '7-Day Week', description: 'Maintain a 7-day consecutive Sadhana streak.', target: 7, getValue: (s) => s.longestStreak },
  { id: 'streak-14', category: 'Streak', title: '14-Day Devotion', description: 'Maintain a 14-day consecutive Sadhana streak.', target: 14, getValue: (s) => s.longestStreak },
  { id: 'streak-21', category: 'Streak', title: '21-Day Habit', description: 'Maintain a 21-day consecutive Sadhana streak.', target: 21, getValue: (s) => s.longestStreak },
  { id: 'streak-30', category: 'Streak', title: '30-Day Master', description: 'Maintain a 30-day consecutive Sadhana streak.', target: 30, getValue: (s) => s.longestStreak },
  { id: 'streak-40', category: 'Streak', title: '40-Day Tapasya', description: 'Maintain a 40-day consecutive Sadhana streak.', target: 40, getValue: (s) => s.longestStreak },
  { id: 'streak-50', category: 'Streak', title: '50-Day Discipline', description: 'Maintain a 50-day consecutive Sadhana streak.', target: 50, getValue: (s) => s.longestStreak },
  { id: 'streak-75', category: 'Streak', title: '75-Day Unstoppable', description: 'Maintain a 75-day consecutive Sadhana streak.', target: 75, getValue: (s) => s.longestStreak },
  { id: 'streak-100', category: 'Streak', title: '100-Day Centurion', description: 'Maintain a 100-day consecutive Sadhana streak.', target: 100, getValue: (s) => s.longestStreak },
  { id: 'streak-180', category: 'Streak', title: '180-Day Half Year', description: 'Maintain a 180-day consecutive Sadhana streak.', target: 180, getValue: (s) => s.longestStreak },
  { id: 'streak-365', category: 'Streak', title: '365-Day Whole Year', description: 'Maintain a 365-day consecutive Sadhana streak.', target: 365, getValue: (s) => s.longestStreak },

  // 4. MEDITATION MILESTONES (12)
  { id: 'med-1', category: 'Meditation', title: 'First Meditation', description: 'Complete your first meditation session.', target: 1, getValue: (s) => s.totalMeditationCount },
  { id: 'med-10m', category: 'Meditation', title: '10 Meditation Mins', description: 'Accumulate 10 minutes of meditation.', target: 10, getValue: (s) => s.totalMeditationMins },
  { id: 'med-30m', category: 'Meditation', title: '30 Meditation Mins', description: 'Accumulate 30 minutes of meditation.', target: 30, getValue: (s) => s.totalMeditationMins },
  { id: 'med-60m', category: 'Meditation', title: '60 Mindfulness Mins', description: 'Accumulate 60 minutes of meditation.', target: 60, getValue: (s) => s.totalMeditationMins },
  { id: 'med-500m', category: 'Meditation', title: '500 Meditation Mins', description: 'Accumulate 500 minutes of meditation.', target: 500, getValue: (s) => s.totalMeditationMins },
  { id: 'med-1000m', category: 'Meditation', title: '1,000 Meditation Mins', description: 'Accumulate 1,000 minutes of meditation.', target: 1000, getValue: (s) => s.totalMeditationMins },
  { id: 'med-5000m', category: 'Meditation', title: '5,000 Meditation Mins', description: 'Accumulate 5,000 minutes of meditation.', target: 5000, getValue: (s) => s.totalMeditationMins },
  { id: 'med-s5', category: 'Meditation', title: '5 Meditation Sessions', description: 'Complete 5 total meditation sessions.', target: 5, getValue: (s) => s.totalMeditationCount },
  { id: 'med-s10', category: 'Meditation', title: '10 Meditation Sessions', description: 'Complete 10 total meditation sessions.', target: 10, getValue: (s) => s.totalMeditationCount },
  { id: 'med-s25', category: 'Meditation', title: '25 Meditation Sessions', description: 'Complete 25 total meditation sessions.', target: 25, getValue: (s) => s.totalMeditationCount },
  { id: 'med-s50', category: 'Meditation', title: '50 Meditation Sessions', description: 'Complete 50 total meditation sessions.', target: 50, getValue: (s) => s.totalMeditationCount },
  { id: 'med-s100', category: 'Meditation', title: '100 Meditation Sessions', description: 'Complete 100 total meditation sessions.', target: 100, getValue: (s) => s.totalMeditationCount },

  // 5. DAILY PRACTICE / GOALS (8)
  { id: 'goal-1', category: 'Daily Practice', title: 'First Daily Goal', description: 'Reach 100% of your daily Jaap goal.', target: 1, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-3', category: 'Daily Practice', title: '3 Goals Completed', description: 'Achieve 3 total daily Jaap goals.', target: 3, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-7', category: 'Daily Practice', title: '7 Goals Completed', description: 'Achieve 7 total daily Jaap goals.', target: 7, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-14', category: 'Daily Practice', title: '14 Goals Completed', description: 'Achieve 14 total daily Jaap goals.', target: 14, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-30', category: 'Daily Practice', title: '30 Goals Completed', description: 'Achieve 30 total daily Jaap goals.', target: 30, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-50', category: 'Daily Practice', title: '50 Goals Completed', description: 'Achieve 50 total daily Jaap goals.', target: 50, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-100', category: 'Daily Practice', title: '100 Goals Completed', description: 'Achieve 100 total daily Jaap goals.', target: 100, getValue: (s) => s.completedGoalsCount },
  { id: 'goal-365', category: 'Daily Practice', title: '365 Goals Completed', description: 'Achieve 365 total daily Jaap goals.', target: 365, getValue: (s) => s.completedGoalsCount },

  // 6. CONSISTENCY / ACTIVE DAYS (7)
  { id: 'active-1', category: 'Consistency', title: 'First Active Day', description: 'Log activity on your first day.', target: 1, getValue: (s) => s.totalActiveDays },
  { id: 'active-7', category: 'Consistency', title: '7 Active Days', description: 'Log activity across 7 total days.', target: 7, getValue: (s) => s.totalActiveDays },
  { id: 'active-14', category: 'Consistency', title: '14 Active Days', description: 'Log activity across 14 total days.', target: 14, getValue: (s) => s.totalActiveDays },
  { id: 'active-30', category: 'Consistency', title: '30 Active Days', description: 'Log activity across 30 total days.', target: 30, getValue: (s) => s.totalActiveDays },
  { id: 'active-50', category: 'Consistency', title: '50 Active Days', description: 'Log activity across 50 total days.', target: 50, getValue: (s) => s.totalActiveDays },
  { id: 'active-100', category: 'Consistency', title: '100 Active Days', description: 'Log activity across 100 total days.', target: 100, getValue: (s) => s.totalActiveDays },
  { id: 'active-365', category: 'Consistency', title: '365 Active Days', description: 'Log activity across 365 total days.', target: 365, getValue: (s) => s.totalActiveDays },

  // 7. SESSIONS MILESTONES (7)
  { id: 'sess-1', category: 'Sessions', title: 'First Jaap Session', description: 'Complete 1 dedicated Jaap session.', target: 1, getValue: (s) => s.jaapSessionsCount },
  { id: 'sess-5', category: 'Sessions', title: '5 Jaap Sessions', description: 'Complete 5 dedicated Jaap sessions.', target: 5, getValue: (s) => s.jaapSessionsCount },
  { id: 'sess-10', category: 'Sessions', title: '10 Jaap Sessions', description: 'Complete 10 dedicated Jaap sessions.', target: 10, getValue: (s) => s.jaapSessionsCount },
  { id: 'sess-25', category: 'Sessions', title: '25 Jaap Sessions', description: 'Complete 25 dedicated Jaap sessions.', target: 25, getValue: (s) => s.jaapSessionsCount },
  { id: 'sess-50', category: 'Sessions', title: '50 Jaap Sessions', description: 'Complete 50 dedicated Jaap sessions.', target: 50, getValue: (s) => s.jaapSessionsCount },
  { id: 'sess-100', category: 'Sessions', title: '100 Jaap Sessions', description: 'Complete 100 dedicated Jaap sessions.', target: 100, getValue: (s) => s.jaapSessionsCount },
  { id: 'sess-500', category: 'Sessions', title: '500 Jaap Sessions', description: 'Complete 500 dedicated Jaap sessions.', target: 500, getValue: (s) => s.jaapSessionsCount },

  // 8. MANTRA MILESTONES (5)
  { id: 'mantra-1', category: 'Mantra', title: 'First Mantra Practitioner', description: 'Chant with 1 selected mantra.', target: 1, getValue: (s) => s.uniqueMantrasCount },
  { id: 'mantra-3', category: 'Mantra', title: '3 Mantras Practiced', description: 'Practice with 3 different mantras.', target: 3, getValue: (s) => s.uniqueMantrasCount },
  { id: 'mantra-5', category: 'Mantra', title: '5 Mantras Practiced', description: 'Practice with 5 different mantras.', target: 5, getValue: (s) => s.uniqueMantrasCount },
  { id: 'mantra-10', category: 'Mantra', title: '10 Mantras Mastered', description: 'Practice with 10 different mantras.', target: 10, getValue: (s) => s.uniqueMantrasCount },
  { id: 'mantra-25', category: 'Mantra', title: '25 Mantra Sessions', description: 'Complete 25 total mantra chanting sessions.', target: 25, getValue: (s) => s.jaapSessionsCount },
];

// Generates derived achievement states (unlocked, progress %, current value)
export const evaluateAchievements = (statsData) => {
  return RAW_ACHIEVEMENTS.map((item) => {
    const rawVal = item.getValue(statsData) || 0;
    const current = Math.max(0, parseInt(rawVal, 10) || 0);
    const target = item.target;
    const isUnlocked = current >= target;
    const progressPct = Math.min(100, Math.round((current / target) * 100));

    return {
      ...item,
      current,
      target,
      isUnlocked,
      progressPct,
    };
  });
};
