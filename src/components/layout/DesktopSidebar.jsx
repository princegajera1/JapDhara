import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  CircleDot,
  Layers,
  BookOpen,
  Sparkles,
  BarChart3,
  History,
  Trophy,
  Calendar,
  User,
  Settings,
} from 'lucide-react';
import useApp from '../../hooks/useApp';
import { APP_VERSION } from '../../utils/constants';

const NAV_ITEMS = [
  { path: '/home', key: 'home', defaultLabel: 'Home', icon: Home },
  { path: '/jaap', key: 'jaapCounter', defaultLabel: 'Jaap Counter', icon: CircleDot, emphasized: true },
  { path: '/mala', key: 'digitalMala', defaultLabel: 'Digital Mala', icon: Layers },
  { path: '/mantras', key: 'mantras', defaultLabel: 'Mantras', icon: BookOpen },
  { path: '/meditation', key: 'meditation', defaultLabel: 'Meditation', icon: Sparkles },
  { path: '/stats', key: 'statistics', defaultLabel: 'Statistics', icon: BarChart3 },
  { path: '/calendar', key: 'calendar', defaultLabel: 'Calendar', icon: Calendar },
  { path: '/history', key: 'history', defaultLabel: 'History', icon: History },
  { path: '/achievements', key: 'achievements', defaultLabel: 'Achievements', icon: Trophy },
  { path: '/profile', key: 'profile', defaultLabel: 'Profile', icon: User },
  { path: '/settings', key: 'settings', defaultLabel: 'Settings', icon: Settings },
];

export const DesktopSidebar = () => {
  const { t } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-light-border dark:border-dark-border bg-light-card/50 dark:bg-dark-card/50 p-4 min-h-[calc(100vh-61px)] justify-between">
      <nav className="space-y-1 overflow-y-auto pr-1">
        <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          {t('navigation')}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const translatedLabel = t(item.key) || item.defaultLabel;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-spiritual-500 text-white shadow-soft-sm font-semibold'
                    : item.emphasized
                    ? 'text-spiritual-600 dark:text-spiritual-400 hover:bg-spiritual-500/10'
                    : 'text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{translatedLabel}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Clean Footer */}
      <div className="pt-4 border-t border-light-border dark:border-dark-border shrink-0 mt-4">
        <div className="p-3 rounded-2xl bg-light-hover/40 dark:bg-dark-hover/40 text-center">
          <p className="text-xs font-bold text-spiritual-500">JapDhara v{APP_VERSION}</p>
          <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5">{t('appTagline')}</p>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
