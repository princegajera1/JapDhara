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
  Globe,
  Image as ImageIcon,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import useTheme from '../hooks/useTheme';
import useApp from '../hooks/useApp';
import storage from '../utils/storage';
import { playSpiritualSound } from '../utils/audioUtils';
import { triggerHaptic } from '../utils/hapticUtils';

const BACKGROUND_PRESETS = [
  { id: 'dark', label: 'Dark Minimal', category: 'Minimal', color: '#121212' },
  { id: 'black', label: 'Pure Black', category: 'Minimal', color: '#000000' },
  { id: 'cream', label: 'Spiritual Cream', category: 'Minimal', color: '#FAF6F0' },
  { id: 'saffron', label: 'Sacred Saffron', category: 'Minimal', color: '#FFF3E0' },
  { id: 'shiva', label: 'Lord Shiva 🕉', category: 'Divine', color: '#1E293B' },
  { id: 'ram', label: 'Lord Ram 🚩', category: 'Divine', color: '#7C2D12' },
  { id: 'krishna', label: 'Lord Krishna 🦚', category: 'Divine', color: '#1E1B4B' },
  { id: 'hanuman', label: 'Lord Hanuman 🙏', category: 'Divine', color: '#9A3412' },
  { id: 'mata', label: 'Divine Mata 🌺', category: 'Divine', color: '#881337' },
  { id: 'mountains', label: 'Himalayan Peaks', category: 'Nature', color: '#0F172A' },
  { id: 'river', label: 'Sacred Ganges', category: 'Nature', color: '#064E3B' },
  { id: 'sunrise', label: 'Morning Dawn', category: 'Nature', color: '#7C2D12' },
  { id: 'temple', label: 'Temple Courtyard', category: 'Nature', color: '#451A03' },
  { id: 'forest', label: 'Meditative Forest', category: 'Nature', color: '#14532D' },
];

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
      setToastMessage('To install: In Chrome select "Install App", or Safari tap "Share -> Add to Home Screen".');
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

  const handleCustomWallpaperUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToastType('error');
      setToastMessage('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        updateSettings({ jaapBackground: 'custom', customWallpaperUrl: dataUrl });
        setToastType('success');
        setToastMessage('Custom wallpaper updated successfully!');
      }
    };
    reader.readAsDataURL(file);
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

    const inputElement = e.target;

    if (file.size > 5 * 1024 * 1024) {
      setToastType('error');
      setToastMessage('Backup file size exceeds 5MB limit.');
      inputElement.value = '';
      return;
    }

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

        if (!json || typeof json !== 'object') {
          throw new Error('Invalid JSON format.');
        }

        const data = json.data || json;

        if (typeof data !== 'object') {
          throw new Error('No valid JapDhara data payload found.');
        }

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
        subtitle="Manage app installation, language, theme, audio, and backgrounds."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* 1. App Installation Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          App Installation
        </h3>
        <Card className="p-5 bg-gradient-to-r from-spiritual-500/15 via-spiritual-500/5 to-transparent border-spiritual-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-spiritual-500/20 text-spiritual-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Install JapDhara PWA</p>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Status:{' '}
                  <span className="font-bold text-spiritual-500">
                    {isInstalled ? 'Installed ✓' : 'Not Installed'}
                  </span>
                </p>
              </div>
            </div>

            {!isInstalled && (
              <Button variant="primary" size="sm" onClick={handleInstallPWA}>
                Install App
              </Button>
            )}
          </div>

          {!isInstalled && (
            <div className="text-xs text-light-muted dark:text-dark-muted leading-relaxed pt-2 border-t border-spiritual-500/20 space-y-1">
              <p>• <strong>Chrome / Android:</strong> Tap &ldquo;Install App&rdquo; above or use browser menu.</p>
              <p>• <strong>iPhone / Safari:</strong> Tap Share button &rarr; &ldquo;Add to Home Screen&rdquo;.</p>
            </div>
          )}
        </Card>
      </div>

      {/* 2. Language Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Language
        </h3>
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">App Language</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                Select your preferred interface language
              </p>
            </div>
          </div>

          <select
            value={settings?.language || 'en'}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500 cursor-pointer"
          >
            <option value="en">English</option>
            <option value="gu">ગુજરાતી</option>
            <option value="hi">हिन्दी</option>
          </select>
        </Card>
      </div>

      {/* 3. Appearance & Jaap Background */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Appearance & Jaap Background
        </h3>
        <Card className="divide-y divide-light-border dark:divide-dark-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-sm">Theme Mode</p>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Current: <span className="capitalize font-semibold text-spiritual-500">{theme}</span>
                </p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </div>

          {/* Background Preset Picker */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-spiritual-500" />
                <p className="font-semibold text-sm">Jaap Screen Background</p>
              </div>
              <label className="text-xs font-bold text-spiritual-500 hover:underline cursor-pointer">
                + Custom Wallpaper
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomWallpaperUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = (settings?.jaapBackground || 'dark') === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => updateSettings({ jaapBackground: preset.id })}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-spiritual-500 bg-spiritual-500/15 text-spiritual-600 dark:text-spiritual-400 font-bold ring-2 ring-spiritual-500/30'
                        : 'border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Sound & Haptic Feedback */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Sound & Haptic Feedback
        </h3>
        <Card className="divide-y divide-light-border dark:divide-dark-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
                {settings?.soundType === 'none' ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-semibold text-sm">Chant Sound Effect</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">Web Audio chime on bead tap</p>
              </div>
            </div>

            <select
              value={settings?.soundType || 'bead'}
              onChange={(e) => {
                const val = e.target.value;
                updateSettings({ soundType: val, soundEnabled: val !== 'none' });
                playSpiritualSound(val, true);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500 cursor-pointer"
            >
              <option value="none">None</option>
              <option value="soft_click">Soft Click</option>
              <option value="bead">Wooden Bead</option>
              <option value="bell">Crystal Chime</option>
              <option value="temple_bell">Temple Bell</option>
              <option value="om">Om Frequency</option>
            </select>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
                <Vibrate className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Vibration Intensity</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">Device haptic feedback</p>
              </div>
            </div>

            <select
              value={settings?.hapticIntensity || 'light'}
              onChange={(e) => {
                const val = e.target.value;
                updateSettings({ hapticIntensity: val, vibrationEnabled: val !== 'off' });
                triggerHaptic(val);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500 cursor-pointer"
            >
              <option value="off">Off</option>
              <option value="light">Light (10ms)</option>
              <option value="medium">Medium (20ms)</option>
              <option value="strong">Strong (40ms)</option>
            </select>
          </div>
        </Card>
      </div>

      {/* 5. Notifications & Reminders Section */}
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
                  ? `Scheduled daily at ${settings.reminderTime || '06:00:00'}`
                  : 'Reminders disabled'}
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={() => navigate('/reminders')}>
            Configure
          </Button>
        </Card>
      </div>

      {/* 6. Jaap Preferences Section */}
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

      {/* 7. Data Backup & Management */}
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

      {/* 8. About JapDhara */}
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
