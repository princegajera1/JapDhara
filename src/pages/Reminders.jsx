import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/common/Toast';
import useApp from '../hooks/useApp';
import reminderScheduler from '../utils/reminderScheduler';

export const Reminders = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useApp();

  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const rawTime = settings?.reminderTime || '06:00:00';
  // Ensure time string includes seconds format HH:MM:SS
  const timeWithSeconds = useMemo(() => {
    if (!rawTime) return '06:00:00';
    const parts = rawTime.split(':');
    if (parts.length === 2) return `${rawTime}:00`;
    return rawTime;
  }, [rawTime]);

  const formattedTimeLabel = useMemo(() => {
    const [h, m, s = '00'] = timeWithSeconds.split(':');
    const hourNum = parseInt(h, 10) || 0;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hour12)}:${pad(m)}:${pad(s)} ${ampm}`;
  }, [timeWithSeconds]);

  const handleRequestPermission = async () => {
    const permission = await reminderScheduler.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      const newSettings = { ...settings, remindersEnabled: true };
      updateSettings(newSettings);
      reminderScheduler.scheduleReminder(newSettings);
      setToastType('success');
      setToastMessage('Notification permissions granted! Daily reminders enabled.');
    } else if (permission === 'denied') {
      const newSettings = { ...settings, remindersEnabled: false };
      updateSettings(newSettings);
      reminderScheduler.cancelReminder();
      setToastType('error');
      setToastMessage('Notification permission denied by browser.');
    } else if (permission === 'unsupported') {
      setToastType('error');
      setToastMessage('Browser notifications are not supported on this device.');
    }
  };

  const handleToggleReminders = (enabled) => {
    if (enabled && notificationPermission !== 'granted') {
      handleRequestPermission();
    } else {
      updateSettings({ remindersEnabled: enabled });
      setToastType('info');
      setToastMessage(enabled ? 'Daily reminder enabled.' : 'Daily reminder disabled.');
    }
  };

  const handleTimeChange = (e) => {
    const val = e.target.value;
    const formatted = val.split(':').length === 2 ? `${val}:00` : val;
    updateSettings({ reminderTime: formatted });
    setToastType('success');
    setToastMessage(`Reminder time updated to ${formatted}.`);
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
        title="Daily Reminders"
        subtitle="Set peaceful chanting and meditation reminders with HH:MM:SS precision."
        showBack
        onBack={() => navigate('/settings')}
      />

      {/* Main Reminder Controls Card */}
      <Card className="divide-y divide-light-border dark:divide-dark-border">
        {/* Toggle Reminders */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Enable Daily Reminder</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                Stay consistent with your daily spiritual practice.
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={settings?.remindersEnabled || false}
            onChange={(e) => handleToggleReminders(e.target.checked)}
            className="w-5 h-5 accent-spiritual-500 cursor-pointer"
          />
        </div>

        {/* Reminder Time Picker (HH:MM:SS) */}
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Reminder Time (HH:MM:SS)</p>
              <p className="text-xs text-spiritual-600 dark:text-spiritual-400 font-semibold mt-0.5">
                Scheduled: {formattedTimeLabel}
              </p>
            </div>
          </div>

          <input
            type="time"
            step="1"
            value={timeWithSeconds}
            onChange={handleTimeChange}
            disabled={!settings?.remindersEnabled}
            className="px-3.5 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-spiritual-500 disabled:opacity-50 font-mono"
          />
        </div>
      </Card>

      {/* Browser Permission Status Box */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          {notificationPermission === 'granted' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <h3 className="font-semibold text-sm">Browser Notification Status</h3>
        </div>

        <div className="space-y-2 text-xs text-light-muted dark:text-dark-muted leading-relaxed">
          <p>
            Status:{' '}
            <strong className="text-light-text dark:text-dark-text capitalize">
              {notificationPermission}
            </strong>
          </p>

          <p>
            {notificationPermission === 'granted'
              ? 'Browser notifications are enabled. JapDhara will send local reminders at your scheduled time.'
              : notificationPermission === 'denied'
              ? 'Notification permissions are blocked in your browser settings. Please unblock notifications in site settings to receive reminders.'
              : notificationPermission === 'unsupported'
              ? 'Browser notifications are not supported on this platform. You can still use JapDhara offline.'
              : 'Permission not yet requested. Click below to allow browser notifications.'}
          </p>
        </div>

        {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRequestPermission}
            className="mt-2 text-xs"
          >
            Grant Notification Permission
          </Button>
        )}
      </Card>

      {/* Web Platform Limitation Notice */}
      <Card className="p-5 space-y-2 border-spiritual-500/20 bg-spiritual-500/5">
        <div className="flex items-center gap-2 text-spiritual-600 dark:text-spiritual-400 font-semibold text-xs uppercase tracking-wider">
          <Info className="w-4 h-4" />
          <span>Web Platform & PWA Notice</span>
        </div>
        <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
          In Web Browsers and installed PWAs, scheduled notifications trigger reliably while the app tab or PWA session is open or running in background. For standalone offline usage, JapDhara logs every scheduled reminder in your session timeline.
        </p>
      </Card>
    </div>
  );
};

export default Reminders;
