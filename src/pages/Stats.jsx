import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Flame,
  Layers,
  Clock,
  Calendar,
  Award,
  TrendingUp,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';
import { calculateAppStats } from '../utils/statsUtils';

export const Stats = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    dailyGoal,
    completedMalas,
    recentSessions,
    meditationHistory,
  } = useApp();

  // Dynamically calculate all metrics using centralized stats calculation engine
  const stats = useMemo(() => {
    return calculateAppStats({
      todayCount,
      dailyGoal,
      completedMalas,
      recentSessions,
      meditationHistory,
    });
  }, [todayCount, dailyGoal, completedMalas, recentSessions, meditationHistory]);

  const maxWeeklyBar = Math.max(108, ...stats.weeklyData.map((d) => d.count));
  const hasAnyData = stats.totalJaap > 0 || stats.totalMeditationSessions > 0;

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
              {stats.todayCount} <span className="text-lg font-normal text-light-muted dark:text-dark-muted">/ {stats.dailyGoal} Jaap</span>
            </p>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              {stats.todayProgressPct}% of your daily goal completed
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProgressRing value={stats.todayCount} max={stats.dailyGoal} size={150} strokeWidth={10}>
              <div className="text-center">
                <span className="text-2xl font-bold text-spiritual-500">{stats.todayProgressPct}%</span>
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
          <p className="text-xl font-black text-amber-500">{stats.currentStreak} Days</p>
        </Card>

        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Longest Streak</span>
          <p className="text-xl font-black text-spiritual-500">{stats.longestStreak} Days</p>
        </Card>

        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Total Malas</span>
          <p className="text-xl font-black text-emerald-500">{stats.totalMalas}</p>
        </Card>

        <Card className="p-4 flex flex-col items-center text-center space-y-1">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Meditation</span>
          <p className="text-xl font-black text-blue-500">{stats.totalMeditationMinutes} min</p>
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
            {stats.weeklyTotal} Total
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-light-border dark:border-dark-border px-2">
          {stats.weeklyData.map((d) => {
            const heightPct = Math.max(6, Math.min(100, Math.round((d.count / maxWeeklyBar) * 100)));
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
                      d.isToday
                        ? 'bg-spiritual-500 shadow-soft-sm'
                        : d.count > 0
                        ? 'bg-spiritual-500/60 hover:bg-spiritual-500'
                        : 'bg-light-border/40 dark:bg-dark-border/40'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-semibold mt-2 ${
                    d.isToday ? 'text-spiritual-500 font-bold' : 'text-light-muted dark:text-dark-muted'
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
            <p className="font-bold">{stats.weeklyTotal} Jaap</p>
          </div>
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Daily Avg</p>
            <p className="font-bold">{stats.weeklyAverage} / day</p>
          </div>
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Best Day</p>
            <p className="font-bold text-spiritual-500">{stats.bestDayName}</p>
          </div>
          <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
            <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Week Malas</p>
            <p className="font-bold text-emerald-500">{stats.weeklyMalas} Mala</p>
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
            <p className="text-xl font-extrabold text-spiritual-500 mt-1">{stats.monthlyTotal}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Month Malas</p>
            <p className="text-xl font-extrabold text-emerald-500 mt-1">{stats.monthlyMalas}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Meditation</p>
            <p className="text-xl font-extrabold text-blue-500 mt-1">{stats.monthlyMeditationMinutes} m</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            <p className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Active Days</p>
            <p className="text-xl font-extrabold text-amber-500 mt-1">{stats.monthlyActiveDays} days</p>
          </div>
        </div>
      </Card>

      {/* Empty State Fallback */}
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
