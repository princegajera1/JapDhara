import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Flame,
  CircleDot,
  Layers,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  Filter,
  Search,
  BookOpen,
  Calendar,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';
import { ACHIEVEMENT_CATEGORIES, evaluateAchievements } from '../data/achievementsData';

const CATEGORY_ICONS = {
  All: Trophy,
  Jaap: CircleDot,
  Mala: Layers,
  Streak: Flame,
  Meditation: Clock,
  'Daily Practice': Award,
  Consistency: Calendar,
  Sessions: Sparkles,
  Mantra: BookOpen,
};

export const Achievements = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    dailyGoal,
    completedMalas,
    recentSessions,
    meditationHistory,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Unlocked' | 'Locked' | 'Closest'
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate comprehensive stats for achievement evaluation
  const statsData = useMemo(() => {
    const historyJaapSum = recentSessions.reduce((acc, s) => acc + (s.count || 0), 0);
    const totalJaap = Math.max(todayCount, historyJaapSum);

    const historyMalaSum = recentSessions.reduce(
      (acc, s) => acc + (s.count >= 108 ? Math.floor(s.count / 108) : 0),
      0
    );
    const totalMalas = Math.max(completedMalas, historyMalaSum);

    const totalMeditationMins = meditationHistory.reduce(
      (acc, m) => acc + (m.durationMinutes || 0),
      0
    );
    const totalMeditationCount = meditationHistory.length;

    // Unique active calendar days & streak
    const activeDates = new Set();
    recentSessions.forEach((s) => {
      if (s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) activeDates.add(d.toISOString().split('T')[0]);
      }
    });
    meditationHistory.forEach((m) => {
      if (m.dateKey) activeDates.add(m.dateKey);
    });
    if (todayCount > 0) activeDates.add(new Date().toISOString().split('T')[0]);

    const sortedDates = Array.from(activeDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) tempStreak += 1;
        else if (diffDays > 1) tempStreak = 1;
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    const uniqueMantras = new Set(recentSessions.map((s) => s.mantraTitle)).size;
    const completedGoalsCount = todayCount >= dailyGoal ? 1 : 0;

    return {
      totalJaap,
      totalMalas,
      totalMeditationMins,
      totalMeditationCount,
      longestStreak,
      completedGoalsCount,
      totalActiveDays: activeDates.size,
      jaapSessionsCount: recentSessions.length,
      uniqueMantrasCount: Math.max(1, uniqueMantras),
    };
  }, [todayCount, dailyGoal, completedMalas, recentSessions, meditationHistory]);

  // Evaluate all 77 achievement items dynamically
  const evaluatedAchievements = useMemo(() => {
    return evaluateAchievements(statsData);
  }, [statsData]);

  const unlockedCount = evaluatedAchievements.filter((a) => a.isUnlocked).length;
  const totalCount = evaluatedAchievements.length;
  const unlockedPct = Math.round((unlockedCount / totalCount) * 100);

  // Filter and search
  const filteredAchievements = useMemo(() => {
    let result = evaluatedAchievements;

    if (activeCategory !== 'All') {
      result = result.filter((a) => a.category === activeCategory);
    }

    if (activeFilter === 'Unlocked') {
      result = result.filter((a) => a.isUnlocked);
    } else if (activeFilter === 'Locked') {
      result = result.filter((a) => !a.isUnlocked);
    } else if (activeFilter === 'Closest') {
      result = result
        .filter((a) => !a.isUnlocked)
        .sort((a, b) => b.progressPct - a.progressPct);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [evaluatedAchievements, activeCategory, activeFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Spiritual Milestones"
        subtitle="Badges and achievements unlocked on your continuous journey."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* Overview Progress Banner */}
      <Card className="p-6 bg-gradient-to-r from-spiritual-500/15 via-spiritual-500/5 to-transparent border-spiritual-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-4 rounded-2xl bg-spiritual-500/20 text-spiritual-500 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Achievements Unlocked</h2>
            <p className="text-sm font-extrabold text-spiritual-600 dark:text-spiritual-400">
              {unlockedCount} of {totalCount} Unlocked ({unlockedPct}%)
            </p>
          </div>
        </div>

        <div className="w-full md:w-56 space-y-1">
          <ProgressBar value={unlockedCount} max={totalCount} height="h-3" />
          <p className="text-[11px] font-semibold text-right text-light-muted dark:text-dark-muted">
            {unlockedCount} / {totalCount} Badges
          </p>
        </div>
      </Card>

      {/* Controls: Search + Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-spiritual-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          {['All', 'Unlocked', 'Locked', 'Closest'].map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-spiritual-500 text-white shadow-soft-sm'
                    : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ACHIEVEMENT_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Trophy;
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-spiritual-500/15 border border-spiritual-500 text-spiritual-600 dark:text-spiritual-400 font-bold'
                  : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Responsive Grid of Achievement Cards */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredAchievements.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || Trophy;
            const isUnlocked = item.isUnlocked;

            return (
              <Card
                key={item.id}
                className={`p-4 flex flex-col justify-between space-y-3 transition-all ${
                  isUnlocked
                    ? 'border-spiritual-500/50 bg-spiritual-500/5 shadow-soft-sm'
                    : 'opacity-75 border-light-border dark:border-dark-border bg-light-card/40 dark:bg-dark-card/40'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2.5 rounded-2xl ${
                        isUnlocked
                          ? 'bg-spiritual-500 text-white shadow-glow-accent'
                          : 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-light-muted dark:text-dark-muted bg-light-hover dark:bg-dark-hover px-2.5 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm">{item.title}</h3>
                    <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-light-border dark:border-dark-border space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-light-muted dark:text-dark-muted">
                    <span>Progress</span>
                    <span>
                      {item.current} / {item.target}
                    </span>
                  </div>
                  <ProgressBar value={item.current} max={item.target} height="h-1.5" />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Trophy}
          title="No badges match filter."
          description="Try changing category or filter settings to view your spiritual milestones."
        />
      )}
    </div>
  );
};

export default Achievements;
