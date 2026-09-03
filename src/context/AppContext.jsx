import React, { createContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { INITIAL_MANTRAS } from '../data/mantras';

export const AppContext = createContext();

const KEYS = {
  ONBOARDING: 'japdhara_onboarding_completed',
  DAILY_GOAL: 'japdhara_daily_goal',
  SELECTED_MANTRA: 'japdhara_selected_mantra',
  DEFAULT_MANTRA: 'japdhara_default_mantra',
  USER_PROFILE: 'japdhara_user_profile',
  SETTINGS: 'japdhara_settings',
  TODAY_JAAP: 'japdhara_today_jaap',
  STREAK: 'japdhara_streak',
  HISTORY: 'japdhara_jaap_history',
  LAST_DATE: 'japdhara_last_date',
  MALA_PROGRESS: 'japdhara_mala_progress',
  COMPLETED_MALAS: 'japdhara_completed_malas',
  FAVORITES: 'japdhara_favorite_mantras',
  CUSTOM_MANTRAS: 'japdhara_custom_mantras',
  MEDITATION_HISTORY: 'japdhara_meditation_history',
  ACTIVE_DATES: 'japdhara_active_dates',
};

const DEFAULT_PROFILE = {
  name: 'Seeker',
  avatar: '🧘',
  joinedDate: new Date().toISOString(),
  hasCompletedSetup: false,
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  hapticFeedback: true,
  reminderTime: '06:00:00',
  remindersEnabled: false,
};

export const AppProvider = ({ children }) => {
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() =>
    storage.getItem(KEYS.ONBOARDING, false)
  );

  const [dailyGoal, setDailyGoalState] = useState(() =>
    storage.getItem(KEYS.DAILY_GOAL, 108)
  );

  const [currentMantra, setCurrentMantraState] = useState(() =>
    storage.getItem(KEYS.SELECTED_MANTRA, storage.getItem(KEYS.DEFAULT_MANTRA, INITIAL_MANTRAS[0]))
  );

  const [favorites, setFavoritesState] = useState(() =>
    storage.getItem(KEYS.FAVORITES, ['om-namah-shivaya'])
  );

  const [customMantras, setCustomMantrasState] = useState(() =>
    storage.getItem(KEYS.CUSTOM_MANTRAS, [])
  );

  const [meditationHistory, setMeditationHistoryState] = useState(() =>
    storage.getItem(KEYS.MEDITATION_HISTORY, [])
  );

  const [profile, setProfileState] = useState(() =>
    storage.getItem(KEYS.USER_PROFILE, DEFAULT_PROFILE)
  );

  const [settings, setSettingsState] = useState(() =>
    storage.getItem(KEYS.SETTINGS, DEFAULT_SETTINGS)
  );

  // Active dates tracking for reliable streak calculations
  const [activeDates, setActiveDatesState] = useState(() => {
    const saved = storage.getItem(KEYS.ACTIVE_DATES, []);
    const today = getTodayDateString();
    if (!saved.includes(today)) {
      const updated = [...saved, today];
      storage.setItem(KEYS.ACTIVE_DATES, updated);
      return updated;
    }
    return saved;
  });

  // Today's Jaap Count with automatic Calendar Date rollover check
  const [todayCount, setTodayCountState] = useState(() => {
    const lastDate = storage.getItem(KEYS.LAST_DATE, null);
    const today = getTodayDateString();
    if (lastDate && lastDate !== today) {
      storage.setItem(KEYS.LAST_DATE, today);
      storage.setItem(KEYS.TODAY_JAAP, 0);
      storage.setItem(KEYS.MALA_PROGRESS, 1);
      return 0;
    }
    if (!lastDate) {
      storage.setItem(KEYS.LAST_DATE, today);
    }
    return storage.getItem(KEYS.TODAY_JAAP, storage.getItem('japdhara_today_count', 0));
  });

  const [completedMalas, setCompletedMalasState] = useState(() =>
    storage.getItem(KEYS.COMPLETED_MALAS, 0)
  );

  const [currentBead, setCurrentBeadState] = useState(() =>
    storage.getItem(KEYS.MALA_PROGRESS, 1)
  );

  const [recentSessions, setRecentSessionsState] = useState(() =>
    storage.getItem(KEYS.HISTORY, storage.getItem('japdhara_recent_activity', []))
  );

  // Mark today as active in storage
  const markTodayActive = () => {
    const today = getTodayDateString();
    setActiveDatesState((prev) => {
      if (!prev.includes(today)) {
        const updated = [...prev, today];
        storage.setItem(KEYS.ACTIVE_DATES, updated);
        return updated;
      }
      return prev;
    });
  };

  // Sync states with storage
  useEffect(() => {
    storage.setItem(KEYS.ONBOARDING, isOnboardingCompleted);
  }, [isOnboardingCompleted]);

  useEffect(() => {
    storage.setItem(KEYS.DAILY_GOAL, dailyGoal);
  }, [dailyGoal]);

  useEffect(() => {
    storage.setItem(KEYS.SELECTED_MANTRA, currentMantra);
    storage.setItem(KEYS.DEFAULT_MANTRA, currentMantra);
  }, [currentMantra]);

  useEffect(() => {
    storage.setItem(KEYS.FAVORITES, favorites);
  }, [favorites]);

  useEffect(() => {
    storage.setItem(KEYS.CUSTOM_MANTRAS, customMantras);
  }, [customMantras]);

  useEffect(() => {
    storage.setItem(KEYS.MEDITATION_HISTORY, meditationHistory);
  }, [meditationHistory]);

  useEffect(() => {
    storage.setItem(KEYS.USER_PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    storage.setItem(KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    storage.setItem(KEYS.TODAY_JAAP, todayCount);
    storage.setItem('japdhara_today_count', todayCount);
  }, [todayCount]);

  useEffect(() => {
    storage.setItem(KEYS.MALA_PROGRESS, currentBead);
  }, [currentBead]);

  useEffect(() => {
    storage.setItem(KEYS.COMPLETED_MALAS, completedMalas);
  }, [completedMalas]);

  useEffect(() => {
    storage.setItem(KEYS.HISTORY, recentSessions);
    storage.setItem('japdhara_recent_activity', recentSessions);
  }, [recentSessions]);

  // Master Chant Recorder: Uses functional state updates to prevent stale closure race conditions
  const recordChant = (amount = 1) => {
    const today = getTodayDateString();
    storage.setItem(KEYS.LAST_DATE, today);
    markTodayActive();

    // 1. Update Today's Count functionally
    setTodayCountState((prevCount) => prevCount + amount);

    // 2. Update Digital Mala Bead Progress functionally
    setCurrentBeadState((prevBead) => {
      let newBead = prevBead + amount;
      if (newBead > 108) {
        const extraMalas = Math.floor((newBead - 1) / 108);
        setCompletedMalasState((prevMalas) => prevMalas + extraMalas);
        newBead = ((newBead - 1) % 108) + 1;
      }
      return newBead;
    });

    // 3. Append to Session History
    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dateKey: today,
      mantraTitle: currentMantra.title,
      sanskrit: currentMantra.sanskrit,
      count: amount,
      timestamp: new Date().toISOString(),
    };

    setRecentSessionsState((prevSessions) => [newSession, ...prevSessions]);
  };

  const addMeditationSession = (sessionData) => {
    markTodayActive();
    const durationSeconds = sessionData.durationSeconds || (sessionData.durationMinutes ? sessionData.durationMinutes * 60 : 0);
    const durationMinutes = sessionData.durationMinutes || Math.max(1, Math.round(durationSeconds / 60));

    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dateKey: getTodayDateString(),
      durationSeconds: durationSeconds,
      durationMinutes: durationMinutes,
      mode: sessionData.mode || 'Silent Meditation',
      completed: true,
      timestamp: new Date().toISOString(),
    };
    setMeditationHistoryState((prev) => [newSession, ...prev]);
  };

  const toggleFavorite = (mantraId) => {
    setFavoritesState((prev) =>
      prev.includes(mantraId)
        ? prev.filter((id) => id !== mantraId)
        : [...prev, mantraId]
    );
  };

  const addCustomMantra = (mantraData) => {
    const newMantra = {
      id: `custom-${Date.now()}`,
      title: mantraData.title,
      sanskrit: mantraData.sanskrit,
      transliteration: mantraData.transliteration || mantraData.title,
      category: 'Custom',
      meaning: mantraData.meaning || 'Personal custom mantra',
      description: mantraData.description || 'Custom mantra created by user.',
      benefits: ['Promotes personal focus and intention.'],
      isCustom: true,
    };
    setCustomMantrasState((prev) => [newMantra, ...prev]);
    return newMantra;
  };

  const deleteCustomMantra = (id) => {
    setCustomMantrasState((prev) => prev.filter((m) => m.id !== id));
    setFavoritesState((prev) => prev.filter((favId) => favId !== id));
  };

  const setDailyGoal = (goal) => {
    const parsed = parseInt(goal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDailyGoalState(parsed);
    }
  };

  const setTodayCount = (count) => {
    const parsed = parseInt(count, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setTodayCountState(parsed);
      storage.setItem(KEYS.LAST_DATE, getTodayDateString());
    }
  };

  const setCurrentBead = (bead) => {
    const parsed = parseInt(bead, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 108) {
      setCurrentBeadState(parsed);
    }
  };

  const setCompletedMalas = (count) => {
    const parsed = parseInt(count, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setCompletedMalasState(parsed);
    }
  };

  const incrementTodayCount = (amount = 1) => {
    recordChant(amount);
  };

  const addJaapSession = (session) => {
    markTodayActive();
    const newSession = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      dateKey: getTodayDateString(),
      mantraTitle: session.mantraTitle || currentMantra.title,
      sanskrit: session.sanskrit || currentMantra.sanskrit,
      count: session.count,
      timestamp: new Date().toISOString(),
    };
    setRecentSessionsState((prev) => [newSession, ...prev]);
  };

  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    storage.setItem(KEYS.ONBOARDING, true);
  };

  const updateProfile = (fields) => {
    setProfileState((prev) => ({ ...prev, ...fields }));
  };

  const updateSettings = (fields) => {
    setSettingsState((prev) => ({ ...prev, ...fields }));
  };

  const setCurrentMantra = (mantra) => {
    setCurrentMantraState(mantra);
  };

  return (
    <AppContext.Provider
      value={{
        isOnboardingCompleted,
        completeOnboarding,
        dailyGoal,
        setDailyGoal,
        currentMantra,
        setCurrentMantra,
        favorites,
        toggleFavorite,
        customMantras,
        addCustomMantra,
        deleteCustomMantra,
        meditationHistory,
        addMeditationSession,
        profile,
        updateProfile,
        settings,
        updateSettings,
        todayCount,
        setTodayCount,
        currentBead,
        setCurrentBead,
        completedMalas,
        setCompletedMalas,
        incrementTodayCount,
        recordChant,
        activeDates,
        recentSessions,
        setRecentSessions: setRecentSessionsState,
        addJaapSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
