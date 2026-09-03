/**
 * JapDhara PWA Installation Manager Hook
 * Single source of truth for PWA installability, standalone state, and native prompt execution.
 */

import { useState, useEffect, useCallback } from 'react';

const isRunningStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true ||
    (document.referrer && document.referrer.includes('android-app://'))
  );
};

const checkIsIOS = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    !window.MSStream &&
    !isRunningStandalone()
  );
};

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isRunningStandalone());
  const [isIOS] = useState(() => checkIsIOS());

  useEffect(() => {
    // 1. Check media query changes for standalone state
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    // 2. Global beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // 3. Global appinstalled listener
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { success: false, reason: 'no_prompt' };
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (choiceResult && choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        return { success: true, outcome: 'accepted' };
      } else {
        return { success: false, outcome: 'dismissed' };
      }
    } catch (err) {
      setDeferredPrompt(null);
      return { success: false, error: err };
    }
  }, [deferredPrompt]);

  return {
    isInstalled,
    canInstall: !!deferredPrompt && !isInstalled,
    isIOS: isIOS && !isInstalled,
    promptInstall,
  };
};

export default usePWAInstall;
