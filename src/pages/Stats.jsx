import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Flame,
  Target,
  Layers,
  Sparkles,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  Play,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import ProgressRing from '../components/ui/ProgressRing';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';

export const Stats = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    dailyGoal,
    completedMalas,
    recentSessions,
    meditationHistory,
  } = useApp();

  // Helper to extract date key (YYYY-MM-DD)
  const getTodayDateKey = () => new Date().toISOString().split('T')[0];

  // Dynamically calculate all metrics from actual saved user data
  const {
    totalJaap,
    totalMalas,
    totalMeditationMins,
    totalMeditationCount,
    activeDateSet,
    currentStreak,
    longestStreak,
    weeklyData,
    weeklyTotal,
    weeklyAvg,
    bestDayName,
    weeklyMalas,
    monthlyTotal,
    monthlyMalas,
    monthlyMeditationMins,
    monthlyActiveDays,
  } = useMemo(() => {
    // 1. Total Jaap Count
    const historyJaapSum = recentSessions.reduce((acc, s) => acc + (s.count || 0), 0);
    const totalJaap = Math.max(todayCount, historyJaapSum + (todayCount > 0 ? 0 : 0));

    // 2. Total Malas
    const historyMalaSum = recentSessions.reduce((acc, s) => acc + (s.count >= 108 ? Math.floor(s.count / 108) : 0), 0);
    const totalMalas = Math.max(completedMalas, historyMalaSum);

    // 3. Meditation Totals
    const totalMeditationMins = meditationHistory.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
    const totalMeditationCount = meditationHistory.length;

    // 4. Unique Active Dates & Streak Calculation
    const activeDates = new Set();

    recentSessions.forEach((s) => {
      if (s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) {
          activeDates.add(d.toISOString().split('T')[0]);
        }
      }
    });

    meditationHistory.forEach((m) => {
      if (m.dateKey) activeDates.add(m.dateKey);
      else if (m.date) {
        const d = new Date(m.date);
        if (!isNaN(d.getTime())) activeDates.add(d.toISOString().split('T')[0]);
      }
    });

    if (todayCount > 0) {
      activeDates.add(getTodayDateKey());
    }

    const sortedDates = Array.from(activeDates).sort();

    // Streak calculation algorithm based on consecutive dates
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const todayStr = getTodayDateKey();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check consecutive runs
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

    // Current streak validation against today or yesterday
    if (activeDates.has(todayStr) || activeDates.has(yesterdayStr)) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    // 5. Weekly Chart & Breakdown (Mon - Sun of current week)
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = weekDays.map((dayName, index) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index);
      const dateStr = targetDate.toISOString().split('T')[0];

      let dayCount = 0;
      recentSessions.forEach((s) => {
        if (s.date) {
          const d = new Date(s.date);
          if (!isNaN(d.getTime()) && d.toISOString().split('T')[0] === dateStr) {
            dayCount += s.count || 0;
          }
        }
      });

      if (dateStr === todayStr && dayCount < todayCount) {
        dayCount = todayCount;
      }

      return { day: dayName, dateStr, count: dayCount };
    });

    const weeklyTotal = weeklyData.reduce((acc, d) => acc + d.count, 0);
    const weeklyAvg = Math.round(weeklyTotal / 7);
    const maxDayObj = [...weeklyData].sort((a, b) => b.count - a.count)[0];
    const bestDayName = maxDayObj && maxDayObj.count > 0 ? `${maxDayObj.day} (${maxDayObj.count})` : 'None';
    const weeklyMalas = Math.floor(weeklyTotal / 108);

    // 6. Monthly Breakdown
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyTotal = 0;
    let monthlyActiveDaysSet = new Set();

    recentSessions.forEach((s) => {
      if (s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthlyTotal += s.count || 0;
          monthlyActiveDaysSet.add(d.toISOString().split('T')[0]);
        }
      }
    });

    if (todayCount > 0) {
      monthlyActiveDaysSet.add(todayStr);
      if (monthlyTotal < todayCount) monthlyTotal = todayCount;
    }

    const monthlyMalas = Math.floor(monthlyTotal / 108);
    const monthlyActiveDays = monthlyActiveDaysSet.size;

    const monthlyMeditationMins = meditationHistory.reduce((acc, m) => {
      const d = new Date(m.timestamp || m.date);
      if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + (m.durationMinutes || 0);
      }
      return acc;
    }, 0);

    return {
      totalJaap,
      totalMalas,
      totalMeditationMins,
      totalMeditationCount,
      activeDateSet: activeDates,
      currentStreak,
      longestStreak,
      weeklyData,
      weeklyTotal,
      weeklyAvg,
      bestDayName,
      weeklyMalas,
      monthlyTotal,
      monthlyMalas,
      monthlyMeditationMins,
      monthlyActiveDays,
    };
  }, [todayCount, completedMalas, recentSessions, meditationHistory]);

  const todayProgressPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));
  const maxWeeklyBar = Math.max(108, ...weeklyData.map((d) => d.count));
  const hasAnyData = totalJaap > 0 || totalMeditationCount > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Statistics & Insights"
        subtitle="Track your daily Sadhana, streak flow, and lifetime progress."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* 1. Today's Progress Card */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-spiritual-500/10 via-spiritual-500/5 to-transparent border-spiritual-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 w-full md:w-auto">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-spiritual-500/20 text-spiritual-600 dark:text-spiritual-400">
              Today's Performance
            </span>
            <h2 className="text-xl md:text-2xl font-bold">Today's Progress</h2>
            <p className="text-3xl font-extrabold text-spiritual-600 dark:text-spiritual-400">
              {todayCount} <span className="text-lg font-normal text-light-muted dark:text-dark-muted">/ {dailyGoal} Jaap</span>
            </p>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              {todayProgressPct}% of your daily goal completed
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={todayCount} max={dailyGoal} size={150} strokeWidth={10}>
              <div className="text-center">
                <span className="text-2xl font-bold text-spiritual-500">{todayProgressPct}%</span>
                <p className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Goal</p>
              </div>
            </ProgressRing>
          </div>
        </div>
      </Card>

      {/* 2. Key Metrics Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Current Streak</span>
          <p className="text-xl font-black text-amber-500">{currentStreak} Days</p>
        </Card>

        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Longest Streak</span>
          <p className="text-xl font-black text-spiritual-500">{longestStreak} Days</p>
        </Card>

        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Total Malas</span>
          <p className="text-xl font-black text-emerald-500">{totalMalas}</p>
        </Card>

        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Meditation</span>
          <p className="text-xl font-black text-blue-500">{totalMeditationMins} min</p>
        </Card>
      </div>

      {/* 3. 7-Day Weekly SVG Bar Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-spiritual-500" />
              <span>Weekly Jaap Activity</span>
            </h3>
            <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
              Daily chant breakdown for the current week.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-spiritual-500/10 text-spiritual-500">
            {weeklyTotal} Total
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-light-border dark:border-dark-border px-2">
          {weeklyData.map((d) => {
            const heightPct = Math.max(6, Math.min(100, Math.round((d.count / maxWeeklyBar) * 100)));
            const isToday = d.dateStr === getTodayDateKey();
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-bold mb-1 text-light-muted dark:text-dark-muted group-hover:text-spiritual-500 transition-colors">
                  {d.count}
                </span>
                <div className="w-full max-w-[32px] bg-light-hover dark:bg-dark-hover rounded-t-lg overflow-hidden h-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.5 }}
                    className={`w-full rounded-t-lg transition-colors ${
                      isToday
                        ? 'bg-spiritual-500 shadow-soft-sm'
                        : d.count > 0
                        ? 'bg-spiritual-500/60 hover:bg-spiritual-500'
                        : 'bg-light-border/40 dark:bg-dark-border/40'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold mt-2 ${
                    isToday ? 'text-spiritual-500 font-bold' : 'text-light-muted dark:text-dark-muted'
                  }`}
                >
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Weekly Insights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Weekly Total</p>
            <p className="font-bold">{weeklyTotal} Jaap</p>
          </div>
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Daily Avg</p>
            <p className="font-bold">{weeklyAvg} / day</p>
          </div>
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Best Day</p>
            <p className="font-bold text-spiritual-500">{bestDayName}</p>
          </div>
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Week Malas</p>
            <p className="font-bold text-emerald-500">{weeklyMalas} Mala</p>
          </div>
        </div>
      </Card>

      {/* 4. Monthly Summary Section */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-spiritual-500" />
          <span>Monthly Summary</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Month Jaap</p>
            <p className="text-xl font-extrabold text-spiritual-500 mt-1">{monthlyTotal}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Month Malas</p>
            <p className="text-xl font-extrabold text-emerald-500 mt-1">{monthlyMalas}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Meditation</p>
            <p className="text-xl font-extrabold text-blue-500 mt-1">{monthlyMeditationMins} m</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Active Days</p>
            <p className="text-xl font-extrabold text-amber-500 mt-1">{monthlyActiveDays} days</p>
          </div>
        </div>
      </Card>

      {/* Empty State Fallback if zero activity exists */}
      {!hasAnyData && (
        <EmptyState
          icon={BarChart3}
          title="No Jaap data yet."
          description="Start your first Jaap or meditation session to unlock real insights and analytics."
          actionLabel="Start Your First Jaap"
          onAction={() => navigate('/jaap')}
        />
      )}
    </div>
  );
};

export default Stats;
