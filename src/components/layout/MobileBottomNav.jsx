import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CircleDot, Layers, BookOpen, User } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/mala', label: 'Mala', icon: Layers },
  { path: '/jaap', label: 'Jaap', icon: CircleDot, center: true },
  { path: '/mantras', label: 'Mantras', icon: BookOpen },
  { path: '/profile', label: 'Profile', icon: User },
];

export const MobileBottomNav = () => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-md border-t border-light-border dark:border-dark-border px-2 pt-1.5 pb-safe shadow-lg transition-colors duration-200"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.center) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-label="Jaap Counter"
                className="flex flex-col items-center justify-center relative -top-4 transition-transform active:scale-95"
              >
                {({ isActive }) => (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-soft-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-spiritual-500 text-white ring-4 ring-spiritual-500/20 scale-105'
                        : 'bg-spiritual-500 text-white hover:bg-spiritual-600'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl min-w-[56px] transition-colors ${
                  isActive
                    ? 'text-spiritual-500 font-semibold'
                    : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
