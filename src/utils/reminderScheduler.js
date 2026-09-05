/**
 * JapDhara Reminder Scheduler Utility
 * Real browser & PWA daily reminder scheduling system.
 */

import storage from './storage';
import { getLocalDateKey } from './dateUtils';

const KEYS = {
  LAST_NOTIFIED_DATE: 'japdhara_last_notified_date',
};

class ReminderScheduler {
  constructor() {
    this.timerId = null;
    this.isInitialized = false;
    this.currentSettings = null;
  }

  init(settings) {
    this.currentSettings = settings;
    if (typeof window === 'undefined') return;

    if (!this.isInitialized) {
      this.isInitialized = true;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.currentSettings) {
          this.scheduleReminder(this.currentSettings);
        }
      });
      window.addEventListener('focus', () => {
        if (this.currentSettings) {
          this.scheduleReminder(this.currentSettings);
        }
      });
    }

    this.scheduleReminder(settings);
  }

  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      return 'denied';
    }
  }

  cancelReminder() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  scheduleReminder(settings) {
    this.currentSettings = settings;
    this.cancelReminder();

    if (!settings || !settings.remindersEnabled) {
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const rawTime = settings.reminderTime || '06:00:00';
    const parts = rawTime.split(':');
    const hours = parseInt(parts[0], 10) || 6;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;

    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const lastNotified = storage.getItem(KEYS.LAST_NOTIFIED_DATE, '');

    const targetDate = new Date();
    targetDate.setHours(hours, minutes, seconds, 0);

    // If target time today has already passed or we already notified today, schedule for tomorrow
    if (targetDate.getTime() <= now.getTime() || lastNotified === todayKey) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const delayMs = Math.max(1000, targetDate.getTime() - now.getTime());

    // Schedule local timer
    this.timerId = setTimeout(() => {
      this.triggerNotification();
      // Re-schedule for tomorrow
      this.scheduleReminder(this.currentSettings);
    }, delayMs);
  }

  async triggerNotification() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const todayKey = getLocalDateKey();
    const lastNotified = storage.getItem(KEYS.LAST_NOTIFIED_DATE, '');
    if (lastNotified === todayKey) return;

    storage.setItem(KEYS.LAST_NOTIFIED_DATE, todayKey);

    const title = 'JapDhara — Daily Reminder 🙏';
    const options = {
      body: 'Time for your daily peaceful Jaap and meditation practice.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'japdhara-daily-reminder',
      renotify: false,
      data: { url: '/jaap' },
    };

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, options);
          return;
        }
      }
      new Notification(title, options);
    } catch (e) {
      try {
        new Notification(title, options);
      } catch (err) {
        // Fallback suppressed
      }
    }
  }
}

export const reminderScheduler = new ReminderScheduler();
export default reminderScheduler;
