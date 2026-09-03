import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';
import Button from '../ui/Button';
import Logo from '../common/Logo';

export const Header = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-light-bg/85 dark:bg-dark-bg/85 backdrop-blur-md border-b border-light-border dark:border-dark-border px-4 py-3 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/home')}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-spiritual-500 rounded-xl p-1 cursor-pointer"
          aria-label="JapDhara Home"
        >
          <Logo size="md" variant="full" />
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            ariaLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="text-light-muted dark:text-dark-muted hover:text-spiritual-500 dark:hover:text-spiritual-500 cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
