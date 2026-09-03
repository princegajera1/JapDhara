import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Download } from 'lucide-react';
import useTheme from '../../hooks/useTheme';
import Button from '../ui/Button';
import Logo from '../common/Logo';
import InstallModal from '../common/InstallModal';

export const Header = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-light-bg/85 dark:bg-dark-bg/85 backdrop-blur-md border-b border-light-border dark:border-dark-border px-4 py-3 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => navigate('/home')}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-spiritual-500 rounded-xl p-1"
          aria-label="JapDhara Home"
        >
          <Logo size="md" variant="full" />
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => setIsInstallModalOpen(true)}
            className="text-xs py-1.5 px-3 border-spiritual-500/40 text-spiritual-600 dark:text-spiritual-400"
          >
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            ariaLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="text-light-muted dark:text-dark-muted hover:text-spiritual-500 dark:hover:text-spiritual-500"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </header>
  );
};

export default Header;
