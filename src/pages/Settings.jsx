import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Vibrate,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Shield,
  BookOpen,
  Target,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import useTheme from '../hooks/useTheme';
import useApp from '../hooks/useApp';
import storage from '../utils/storage';

export const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    settings,
    updateSettings,
    dailyGoal,
    currentMantra,
    profile,
    todayCount,
    currentBead,
    completedMalas,
    favorites,
    customMantras,
    recentSessions,
    meditationHistory,
  } = useApp();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
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

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      setToastType('info');
      setToastMessage('App is already installed or browser install prompt is unavailable.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setToastType('success');
      setToastMessage('JapDhara installed successfully!');
    }
    setDeferredPrompt(null);
  };

  // Real JSON Data Export with version & backup metadata
  const handleExportData = () => {
    try {
      const backupPayload = {
        app: 'JapDhara',
        version: '1.0.0',
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {
          profile,
          dailyGoal,
          currentMantra,
          todayCount,
          currentBead,
          completedMalas,
          favorites,
          customMantras,
          recentSessions,
          meditationHistory,
          settings,
        },
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `japdhara-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setToastType('success');
      setToastMessage('Backup exported successfully as JSON file!');
    } catch (e) {
      setToastType('error');
      setToastMessage('Failed to export data backup.');
    }
  };

  // Robust JSON Data Import Audit & Fix
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so re-uploading same file triggers event
    const inputElement = e.target;

    // File size check (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToastType('error');
      setToastMessage('Backup file size exceeds 5MB limit.');
      inputElement.value = '';
      return;
    }

    // Extension / type check
    if (!file.name.endsWith('.json') && file.type && !file.type.includes('json')) {
      setToastType('error');
      setToastMessage('Invalid file type. Please upload a valid .json backup file.');
      inputElement.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text || typeof text !== 'string') {
          throw new Error('File content is empty.');
        }

        const json = JSON.parse(text);

        // Schema validation
        if (!json || typeof json !== 'object') {
          throw new Error('Invalid JSON format.');
        }

        const data = json.data || json;

        if (typeof data !== 'object') {
          throw new Error('No valid JapDhara data payload found.');
        }

        // Restore keys into localStorage cleanly
        if (data.dailyGoal) storage.setItem('japdhara_daily_goal', data.dailyGoal);
        if (data.currentMantra) storage.setItem('japdhara_selected_mantra', data.currentMantra);
        if (data.profile) storage.setItem('japdhara_user_profile', data.profile);
        if (data.todayCount !== undefined) storage.setItem('japdhara_today_jaap', data.todayCount);
        if (data.currentBead) storage.setItem('japdhara_mala_progress', data.currentBead);
        if (data.completedMalas !== undefined) storage.setItem('japdhara_completed_malas', data.completedMalas);
        if (data.favorites) storage.setItem('japdhara_favorite_mantras', data.favorites);
        if (data.customMantras) storage.setItem('japdhara_custom_mantras', data.customMantras);
        if (data.recentSessions) storage.setItem('japdhara_jaap_history', data.recentSessions);
        if (data.meditationHistory) storage.setItem('japdhara_meditation_history', data.meditationHistory);
        if (data.settings) storage.setItem('japdhara_settings', data.settings);

        setToastType('success');
        setToastMessage('Backup restored successfully! Reloading application...');

        inputElement.value = '';

        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        inputElement.value = '';
        setToastType('error');
        setToastMessage(err.message || 'Corrupted or malformed JSON backup file.');
      }
    };

    reader.onerror = () => {
      inputElement.value = '';
      setToastType('error');
      setToastMessage('Error reading backup file.');
    };

    reader.readAsText(file);
  };

  // Clear all JapDhara local data
  const handleClearAllData = () => {
    storage.clearAll();
    localStorage.removeItem('japdhara_onboarding_completed');
    setIsClearModalOpen(false);
    setToastType('info');
    setToastMessage('All data cleared. Resetting application...');
    setTimeout(() => {
      window.location.href = '/';
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage('')}
      />

      <PageHeader
        title="Settings"
        subtitle="Manage theme, preferences, sound, and data backup."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* PWA App Installation Option (if prompt is deferred) */}
      {deferredPrompt && !isInstalled && (
        <Card className="p-5 bg-gradient-to-r from-spiritual-500/15 via-spiritual-500/5 to-transparent border-spiritual-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/20 text-spiritual-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Install JapDhara App</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                Install on your device home screen for fast offline access.
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleInstallPWA}>
            Install
          </Button>
        </Card>
      )}

      {/* A. Appearance Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Appearance
        </h3>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-sm">Theme Mode</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                Current mode: <span className="capitalize font-semibold text-spiritual-500">{theme}</span>
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            Toggle Theme
          </Button>
        </Card>
      </div>

      {/* B. Notifications Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Notifications & Reminders
        </h3>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Daily Chanting Reminders</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                {settings?.remindersEnabled
                  ? `Scheduled daily at ${settings.reminderTime || '06:00'}`
                  : 'Reminders disabled'}
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={() => navigate('/reminders')}>
            Configure
          </Button>
        </Card>
      </div>

      {/* C. Jaap Preferences Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Jaap Preferences
        </h3>
        <Card className="divide-y divide-light-border dark:divide-dark-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Daily Target Goal</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">{dailyGoal} Jaap per day</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jaap')}>
              Change
            </Button>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Default Mantra</p>
                <p className="text-xs text-spiritual-500 font-serif">{currentMantra.sanskrit}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/mantras')}>
              Library
            </Button>
          </div>
        </Card>
      </div>

      {/* D. Sound & Haptics Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Sound & Feedback
        </h3>
        <Card className="divide-y divide-light-border dark:divide-dark-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
                {settings?.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-semibold text-sm">Chant Sound Effects</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">Audio chime on completion</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings?.soundEnabled || false}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
              className="w-5 h-5 accent-spiritual-500 cursor-pointer"
            />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
                <Vibrate className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Haptic Feedback</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">Vibrate on bead tap</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings?.vibrationEnabled || false}
              onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
              className="w-5 h-5 accent-spiritual-500 cursor-pointer"
            />
          </div>
        </Card>
      </div>

      {/* E. Data Management Section (Export / Import / Clear) */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Data Backup & Management
        </h3>
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="md"
              icon={Download}
              onClick={handleExportData}
              fullWidth
            >
              Export Backup (JSON)
            </Button>

            <label className="w-full">
              <div className="w-full py-2.5 px-4 rounded-full border border-light-border dark:border-dark-border bg-light-hover dark:bg-dark-hover hover:bg-spiritual-500/10 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-spiritual-500" />
                <span>Import Backup</span>
              </div>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-3 border-t border-light-border dark:border-dark-border">
            <Button
              variant="danger"
              size="md"
              icon={RotateCcw}
              onClick={() => setIsClearModalOpen(true)}
              fullWidth
            >
              Clear All Data
            </Button>
          </div>
        </Card>
      </div>

      {/* F. About JapDhara Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          About JapDhara
        </h3>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-spiritual-500/15 border border-spiritual-500/30 flex items-center justify-center text-2xl">
              🕉
            </div>
            <div>
              <h4 className="font-bold text-lg">JapDhara <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-spiritual-500/10 text-spiritual-500">v1.0.0</span></h4>
              <p className="text-xs font-medium text-light-muted dark:text-dark-muted italic">
                &ldquo;Let your Jaap flow.&rdquo; — A peaceful journey of every chant.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-light-muted dark:text-dark-muted leading-relaxed pt-2 border-t border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2 text-light-text dark:text-dark-text font-semibold">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Local Privacy Guarantee</span>
            </div>
            <p>
              Your Jaap and meditation data is stored locally in your browser. No personal data or chant logs are sent to external servers.
            </p>
          </div>
        </Card>
      </div>

      {/* Clear Data Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Clear All JapDhara Data?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
            Warning: This action will reset JapDhara back to its initial fresh state. All your Jaap counts, malas, meditation history, and custom settings will be permanently cleared from this browser.
          </p>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setIsClearModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleClearAllData}>
              Clear All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
