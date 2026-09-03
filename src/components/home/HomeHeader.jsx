import React from 'react';
import { useNavigate } from 'react-router-dom';
import useApp from '../../hooks/useApp';
import { Settings, User } from 'lucide-react';

export const HomeHeader = () => {
  const navigate = useNavigate();
  const { profile } = useApp();

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between pb-2">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-light-text dark:text-dark-text flex items-center gap-2">
          Namaste 🙏
        </h1>
        <p className="text-sm font-semibold text-spiritual-600 dark:text-spiritual-400 mt-0.5">
          Welcome to JapDhara
        </p>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
          {formattedDate}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover text-light-muted dark:text-dark-muted hover:text-spiritual-500 transition-colors"
          aria-label="Open Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 rounded-full bg-spiritual-500/10 border border-spiritual-500/20 flex items-center justify-center text-xl shadow-soft-sm hover:ring-2 hover:ring-spiritual-500/40 transition-all cursor-pointer"
          aria-label="View Profile"
        >
          {profile?.avatar || '🧘'}
        </button>
      </div>
    </div>
  );
};

export default HomeHeader;
