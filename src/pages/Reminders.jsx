import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/common/Toast';
import useApp from '../hooks/useApp';

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

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setToastType('error');
      setToastMessage('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        updateSettings({ remindersEnabled: true });
        setToastType('success');
        setToastMessage('Notification permissions granted! Daily reminders enabled.');
      } else if (permission === 'denied') {
        updateSettings({ remindersEnabled: false });
        setToastType('error');
        setToastMessage('Notification permission denied by browser.');
      }
    } catch (e) {
      setToastType('error');
      setToastMessage('Failed to request notification permission.');
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

  const handleTimeChange = (timeStr) => {
    updateSettings({ reminderTime: timeStr });
    setToastType('success');
    setToastMessage(`Reminder time updated to ${timeStr}.`);
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
        subtitle="Set peaceful morning and evening chanting reminders."
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
                Receive a subtle notification for your daily Jaap.
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

        {/* Reminder Time Picker */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">Reminder Time</p>
              <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                Select your preferred chanting time.
              </p>
            </div>
          </div>

          <input
            type="time"
            value={settings?.reminderTime || '06:00'}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={!settings?.remindersEnabled}
            className="px-3 py-1.5 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-spiritual-500 disabled:opacity-50"
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

        <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
          {notificationPermission === 'granted'
            ? 'Browser notifications are enabled. JapDhara can send local reminders at your scheduled time.'
            : notificationPermission === 'denied'
            ? 'Notification permissions are blocked in your browser settings. Please unblock notifications in site settings to receive reminders.'
            : notificationPermission === 'unsupported'
            ? 'Browser notifications are not supported on this platform. You can still use JapDhara offline.'
            : 'Permission not yet requested. Click below to allow browser notifications.'}
        </p>

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
    </div>
  );
};

export default Reminders;
