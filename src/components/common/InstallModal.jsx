import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, Check, X, Download } from 'lucide-react';
import Modal from './Modal';
import Button from '../ui/Button';

export const InstallModal = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

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
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download JapDhara App">
      <div className="space-y-5 pt-1 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-spiritual-500/15 border border-spiritual-500/30 flex items-center justify-center text-3xl shadow-soft-md">
          🕉
        </div>

        <div>
          <h3 className="font-bold text-lg">Install JapDhara</h3>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
            Install JapDhara on your device home screen for fast, offline-first access without app store downloads.
          </p>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            <span>JapDhara is already installed!</span>
          </div>
        ) : isIOS ? (
          /* iOS Step-by-Step Instructions */
          <div className="p-4 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60 text-left border border-light-border dark:border-dark-border space-y-3">
            <h4 className="font-semibold text-xs text-spiritual-500 uppercase tracking-wider">
              iOS Installation Steps
            </h4>
            <ol className="space-y-2.5 text-xs text-light-text dark:text-dark-text">
              <li className="flex items-start gap-2">
                <span className="font-bold text-spiritual-500">1.</span>
                <span>Tap the <strong className="inline-flex items-center gap-1"><Share className="w-3.5 h-3.5 inline text-spiritual-500" /> Share</strong> button in Safari toolbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-spiritual-500">2.</span>
                <span>Scroll down and select <strong className="inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5 inline text-spiritual-500" /> Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-spiritual-500">3.</span>
                <span>Tap <strong className="text-spiritual-500">Add</strong> in top right corner.</span>
              </li>
            </ol>
          </div>
        ) : deferredPrompt ? (
          /* Android / Desktop Native Install Action */
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={Download}
            onClick={handleInstallClick}
            className="py-4 text-base font-semibold shadow-soft-md"
          >
            Install App Now
          </Button>
        ) : (
          /* Fallback prompt when browser does not expose deferred prompt */
          <div className="p-4 rounded-2xl bg-spiritual-500/10 border border-spiritual-500/20 text-xs text-light-muted dark:text-dark-muted leading-relaxed">
            To install JapDhara, open your browser menu and choose <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.
          </div>
        )}

        <Button variant="secondary" fullWidth onClick={onClose} className="mt-2">
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default InstallModal;
