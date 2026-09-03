import React from 'react';
import HomeHeader from '../components/home/HomeHeader';
import TodayProgressCard from '../components/home/TodayProgressCard';
import DailyGoalCard from '../components/home/DailyGoalCard';
import StreakCard from '../components/home/StreakCard';
import MantraPreview from '../components/home/MantraPreview';
import QuickActionCard from '../components/home/QuickActionCard';
import RecentActivity from '../components/home/RecentActivity';

export const Home = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Greeting */}
      <HomeHeader />

      {/* 2. Today's Jaap Progress & Continue CTA */}
      <TodayProgressCard />

      {/* 4 & 5. Daily Goal & Streak Side-by-Side on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DailyGoalCard />
        <StreakCard />
      </div>

      {/* 6. Today's Mantra Preview */}
      <MantraPreview />

      {/* 7. Quick Actions */}
      <QuickActionCard />

      {/* 8. Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Home;
