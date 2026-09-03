import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  ShieldCheck,
  Edit2,
  Flame,
  Layers,
  CircleDot,
  Clock,
  Trophy,
  Award,
  Settings,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import useApp from '../hooks/useApp';
import { evaluateAchievements } from '../data/achievementsData';

const AVATAR_OPTIONS = ['🧘', 'ॐ', '🙏', '☸️', '✨', '🌸', '🌿', '🪷'];

export const Profile = () => {
  const navigate = useNavigate();
  const {
    profile,
    updateProfile,
    todayCount,
    dailyGoal,
    completedMalas,
    recentSessions,
    meditationHistory,
    activeDates = [],
  } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile?.name || 'Seeker');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '🧘');

  // Derive real statistics for profile stats grid
  const {
    totalJaap,
    totalMalas,
    totalMeditationLabel,
    currentStreak,
    longestStreak,
    unlockedAchievementsCount,
    totalAchievementsCount,
  } = useMemo(() => {
    const historyJaapSum = recentSessions.reduce((acc, s) => acc + (s.count || 0), 0);
    const totalJaap = Math.max(todayCount, historyJaapSum);

    const historyMalaSum = recentSessions.reduce(
      (acc, s) => acc + (s.count >= 108 ? Math.floor(s.count / 108) : 0),
      0
    );
    const totalMalas = Math.max(completedMalas, historyMalaSum);

    const totalMeditationSecs = meditationHistory.reduce((acc, m) => {
      return acc + (m.durationSeconds || (m.durationMinutes ? m.durationMinutes * 60 : 0));
    }, 0);

    const totalMeditationLabel =
      totalMeditationSecs < 60
        ? `${totalMeditationSecs} sec`
        : `${Math.floor(totalMeditationSecs / 60)} min`;

    // Streak calculation using local active calendar dates
    const dateSet = new Set(activeDates);
    recentSessions.forEach((s) => {
      if (s.dateKey) dateSet.add(s.dateKey);
      else if (s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) dateSet.add(d.toISOString().split('T')[0]);
      }
    });
    meditationHistory.forEach((m) => {
      if (m.dateKey) dateSet.add(m.dateKey);
    });

    const todayStr = new Date().toISOString().split('T')[0];
    dateSet.add(todayStr); // Opening app today counts for today's active streak

    const sortedDates = Array.from(dateSet).sort();
    let currentStreak = 0;
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

    currentStreak = tempStreak > 0 ? tempStreak : 1;

    // Evaluate dynamic achievements using global 77 dataset
    const statsData = {
      totalJaap,
      totalMalas,
      totalMeditationMins: Math.round(totalMeditationSecs / 60),
      totalMeditationCount: meditationHistory.length,
      longestStreak,
      completedGoalsCount: todayCount >= dailyGoal ? 1 : 0,
      totalActiveDays: dateSet.size,
      jaapSessionsCount: recentSessions.length,
      uniqueMantrasCount: 1,
    };

    const evaluated = evaluateAchievements(statsData);
    const unlockedAchievementsCount = evaluated.filter((a) => a.isUnlocked).length;

    return {
      totalJaap,
      totalMalas,
      totalMeditationLabel,
      currentStreak,
      longestStreak,
      unlockedAchievementsCount,
      totalAchievementsCount: evaluated.length,
    };
  }, [todayCount, dailyGoal, completedMalas, recentSessions, meditationHistory, activeDates]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateProfile({
      name: editName.trim(),
      avatar: editAvatar,
      hasCompletedSetup: true,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <PageHeader
        title="Profile"
        subtitle="Your personal spiritual identity and lifetime achievements."
        showBack
        onBack={() => navigate('/home')}
        action={
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => {
              setEditName(profile?.name || 'Seeker');
              setEditAvatar(profile?.avatar || '🧘');
              setIsEditModalOpen(true);
            }}
            className="text-xs"
          >
            Edit Profile
          </Button>
        }
      />

      {/* Main Profile Header Card */}
      <Card className="p-6 md:p-8 space-y-6 text-center bg-gradient-to-b from-spiritual-500/10 via-transparent to-transparent border-spiritual-500/30">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-spiritual-500/15 border-2 border-spiritual-500/30 flex items-center justify-center text-4xl shadow-soft-md">
            {profile?.avatar || '🧘'}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.name || 'Seeker'}</h2>
            <p className="text-xs font-semibold text-spiritual-600 dark:text-spiritual-400 uppercase tracking-wider mt-0.5">
              Peaceful Practitioner
            </p>
          </div>
        </div>

        {/* Profile Info Details Bar */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-light-border dark:border-dark-border text-left">
          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-spiritual-500/10 text-spiritual-500">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-light-muted dark:text-dark-muted">Joined</p>
              <p className="text-xs font-bold">
                {profile?.joinedDate
                  ? new Date(profile.joinedDate).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Sep 2026'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-light-muted dark:text-dark-muted">Status</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active Seeker</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lifetime Progress Metrics Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Lifetime Progress
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <Card className="p-4 flex flex-col items-center text-center space-y-1">
            <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
              <CircleDot className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Total Jaap</span>
            <p className="text-xl font-black text-spiritual-500">{totalJaap}</p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center space-y-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Total Malas</span>
            <p className="text-xl font-black text-emerald-500">{totalMalas}</p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center space-y-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Current Streak</span>
            <p className="text-xl font-black text-amber-500">{currentStreak} Day{currentStreak === 1 ? '' : 's'}</p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center space-y-1">
            <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Longest Streak</span>
            <p className="text-xl font-black text-spiritual-500">{longestStreak} Day{longestStreak === 1 ? '' : 's'}</p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center space-y-1">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Meditation</span>
            <p className="text-xl font-black text-blue-500">{totalMeditationLabel}</p>
          </Card>

          <Card className="p-4 flex flex-col items-center text-center space-y-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase font-bold text-light-muted dark:text-dark-muted">Badges</span>
            <p className="text-xl font-black text-purple-500">
              {unlockedAchievementsCount} / {totalAchievementsCount}
            </p>
          </Card>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="md"
          icon={Trophy}
          onClick={() => navigate('/achievements')}
          fullWidth
        >
          View Badges
        </Button>
        <Button
          variant="secondary"
          size="md"
          icon={Settings}
          onClick={() => navigate('/settings')}
          fullWidth
        >
          Settings
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-2">
              Select Avatar Symbol
            </label>
            <div className="grid grid-cols-4 gap-2.5 p-2 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setEditAvatar(emoji)}
                  className={`h-11 rounded-xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                    editAvatar === emoji
                      ? 'bg-spiritual-500 text-white ring-2 ring-spiritual-500/40 scale-105 shadow-soft-sm'
                      : 'hover:bg-spiritual-500/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" fullWidth type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
