import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Download, Check } from 'lucide-react';
import useTheme from '../../hooks/useTheme';
import Button from '../ui/Button';

export const Header = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-light-border dark:border-dark-border px-4 py-3 md:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <span className="text-2xl" role="img" aria-label="Om symbol">
            🕉
          </span>
          <span className="font-semibold text-lg md:text-xl tracking-tight text-light-text dark:text-dark-text">
            Jap<span className="text-spiritual-500 font-bold">Dhara</span>
          </span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {deferredPrompt && !isInstalled && (
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleInstallClick}
              className="text-xs py-1.5 px-3 border-spiritual-500/40 text-spiritual-600 dark:text-spiritual-400"
            >
              <span className="hidden sm:inline">Install App</span>
              <span className="sm:hidden">Install</span>
            </Button>
          )}

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
    </header>
  );
};

export default Header;
