import React, { useMemo } from 'react';
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
  Play,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';

export const Achievements = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    completedMalas,
    recentSessions,
    meditationHistory,
  } = useApp();

  // Derive real statistics for achievement conditions
  const {
    totalJaap,
    totalMalas,
    totalMeditationMins,
    totalMeditationCount,
    longestStreak,
  } = useMemo(() => {
    const historyJaapSum = recentSessions.reduce((acc, s) => acc + (s.count || 0), 0);
    const totalJaap = Math.max(todayCount, historyJaapSum);

    const historyMalaSum = recentSessions.reduce((acc, s) => acc + (s.count >= 108 ? Math.floor(s.count / 108) : 0), 0);
    const totalMalas = Math.max(completedMalas, historyMalaSum);

    const totalMeditationMins = meditationHistory.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
    const totalMeditationCount = meditationHistory.length;

    // Calculate longest streak from dates
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

    return {
      totalJaap,
      totalMalas,
      totalMeditationMins,
      totalMeditationCount,
      longestStreak,
    };
  }, [todayCount, completedMalas, recentSessions, meditationHistory]);

  // Define the 12 dynamic achievements derived from real data
  const achievements = useMemo(() => {
    return [
      {
        id: 'first-jaap',
        title: 'First Jaap',
        description: 'Complete your very first chant in JapDhara.',
        icon: CircleDot,
        isUnlocked: totalJaap >= 1,
        current: totalJaap,
        target: 1,
      },
      {
        id: 'first-mala',
        title: 'First Mala',
        description: 'Complete a full 108-bead sacred mala.',
        icon: Layers,
        isUnlocked: totalMalas >= 1,
        current: totalMalas,
        target: 1,
      },
      {
        id: '108-jaap',
        title: '108 Chants',
        description: 'Reach 108 total chants across all sessions.',
        icon: Sparkles,
        isUnlocked: totalJaap >= 108,
        current: totalJaap,
        target: 108,
      },
      {
        id: '216-jaap',
        title: 'Double Mala (216)',
        description: 'Reach 216 total chants of devotion.',
        icon: Award,
        isUnlocked: totalJaap >= 216,
        current: totalJaap,
        target: 216,
      },
      {
        id: '1008-jaap',
        title: '1008 Sacred Chants',
        description: 'Reach 1,008 total chants milestone.',
        icon: Trophy,
        isUnlocked: totalJaap >= 1008,
        current: totalJaap,
        target: 1008,
      },
      {
        id: '3-day-streak',
        title: '3-Day Sadhana',
        description: 'Maintain a 3-day consecutive streak.',
        icon: Flame,
        isUnlocked: longestStreak >= 3,
        current: longestStreak,
        target: 3,
      },
      {
        id: '7-day-streak',
        title: '7-Day Flow',
        description: 'Maintain a 7-day consecutive streak.',
        icon: Flame,
        isUnlocked: longestStreak >= 7,
        current: longestStreak,
        target: 7,
      },
      {
        id: '30-day-streak',
        title: '30-Day Master',
        description: 'Maintain a 30-day consecutive streak.',
        icon: Flame,
        isUnlocked: longestStreak >= 30,
        current: longestStreak,
        target: 30,
      },
      {
        id: 'first-meditation',
        title: 'First Meditation',
        description: 'Complete your first meditation session.',
        icon: Clock,
        isUnlocked: totalMeditationCount >= 1,
        current: totalMeditationCount,
        target: 1,
      },
      {
        id: '60-min-meditation',
        title: '60 Mindfulness Minutes',
        description: 'Accumulate 60 minutes of meditation.',
        icon: Clock,
        isUnlocked: totalMeditationMins >= 60,
        current: totalMeditationMins,
        target: 60,
      },
      {
        id: '10-malas',
        title: '10 Malas Completed',
        description: 'Complete 10 full 108-bead malas.',
        icon: Layers,
        isUnlocked: totalMalas >= 10,
        current: totalMalas,
        target: 10,
      },
      {
        id: '10000-jaap',
        title: '10,000 Jaap Practitioner',
        description: 'Reach 10,000 lifetime chants in JapDhara.',
        icon: Trophy,
        isUnlocked: totalJaap >= 10000,
        current: totalJaap,
        target: 10000,
      },
    ];
  }, [totalJaap, totalMalas, totalMeditationMins, totalMeditationCount, longestStreak]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const unlockedPct = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Spiritual Milestones"
        subtitle="Badges and achievements unlocked on your continuous journey."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* Overview Progress Card */}
      <Card className="p-6 bg-gradient-to-r from-spiritual-500/15 via-spiritual-500/5 to-transparent border-spiritual-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="p-4 rounded-2xl bg-spiritual-500/20 text-spiritual-500 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Achievements Unlocked</h2>
            <p className="text-sm font-extrabold text-spiritual-600 dark:text-spiritual-400">
              {unlockedCount} of {achievements.length} Unlocked ({unlockedPct}%)
            </p>
          </div>
        </div>

        <div className="w-full md:w-48">
          <ProgressBar value={unlockedCount} max={achievements.length} height="h-3" />
        </div>
      </Card>

      {/* Grid of 12 Achievement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((item) => {
          const Icon = item.icon;
          const isUnlocked = item.isUnlocked;
          return (
            <Card
              key={item.id}
              className={`p-5 flex flex-col justify-between space-y-4 transition-all ${
                isUnlocked
                  ? 'border-spiritual-500/50 bg-spiritual-500/5 shadow-soft-sm'
                  : 'opacity-70 border-light-border dark:border-dark-border bg-light-card/40 dark:bg-dark-card/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-2xl ${
                      isUnlocked
                        ? 'bg-spiritual-500 text-white shadow-glow-accent'
                        : 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-light-muted dark:text-dark-muted bg-light-hover dark:bg-dark-hover px-2.5 py-1 rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base">{item.title}</h3>
                  <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-light-border dark:border-dark-border space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-light-muted dark:text-dark-muted">
                  <span>Progress</span>
                  <span>
                    {Math.min(item.current, item.target)} / {item.target}
                  </span>
                </div>
                <ProgressBar value={Math.min(item.current, item.target)} max={item.target} height="h-2" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State Banner if user has zero progress */}
      {totalJaap === 0 && totalMeditationCount === 0 && (
        <EmptyState
          icon={Trophy}
          title="Start your first Jaap to unlock achievements."
          description="Your achievements and spiritual badges will automatically unlock as you chant and meditate."
          actionLabel="Start Jaap Now"
          onAction={() => navigate('/jaap')}
        />
      )}
    </div>
  );
};

export default Achievements;
