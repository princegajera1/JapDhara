/**
 * JapDhara Backup Schema Validator Utility
 * Validates import backup JSON files before applying to localStorage.
 */

export const validateBackupPayload = (jsonObj) => {
  if (!jsonObj || typeof jsonObj !== 'object') {
    throw new Error('Invalid JSON backup file format.');
  }

  const payload = jsonObj.data || jsonObj;
  if (!payload || typeof payload !== 'object') {
    throw new Error('No valid JapDhara data payload found in file.');
  }

  const validatedData = {};

  // 1. Daily Goal
  if (payload.dailyGoal !== undefined) {
    const goal = parseInt(payload.dailyGoal, 10);
    if (isNaN(goal) || goal <= 0 || goal > 1000000) {
      throw new Error('Invalid dailyGoal value in backup file.');
    }
    validatedData.dailyGoal = goal;
  }

  // 2. Today Count
  if (payload.todayCount !== undefined) {
    const count = parseInt(payload.todayCount, 10);
    if (isNaN(count) || count < 0 || count > 10000000) {
      throw new Error('Invalid todayCount value in backup file.');
    }
    validatedData.todayCount = count;
  }

  // 3. Current Mantra
  if (payload.currentMantra !== undefined) {
    if (
      typeof payload.currentMantra !== 'object' ||
      !payload.currentMantra ||
      !payload.currentMantra.id ||
      !payload.currentMantra.title
    ) {
      throw new Error('Invalid currentMantra payload in backup file.');
    }
    validatedData.currentMantra = payload.currentMantra;
  }

  // 4. Favorites Array
  if (payload.favorites !== undefined) {
    if (!Array.isArray(payload.favorites)) {
      throw new Error('Invalid favorites list in backup file.');
    }
    validatedData.favorites = payload.favorites.filter(
      (item) => typeof item === 'string'
    );
  }

  // 5. Custom Mantras Array
  if (payload.customMantras !== undefined) {
    if (!Array.isArray(payload.customMantras)) {
      throw new Error('Invalid customMantras list in backup file.');
    }
    validatedData.customMantras = payload.customMantras.filter(
      (m) => m && typeof m === 'object' && m.id && m.title
    );
  }

  // 6. Recent Sessions Array
  if (payload.recentSessions !== undefined) {
    if (!Array.isArray(payload.recentSessions)) {
      throw new Error('Invalid recentSessions list in backup file.');
    }
    validatedData.recentSessions = payload.recentSessions.filter(
      (s) => s && typeof s === 'object' && typeof (s.count || 0) === 'number'
    );
  }

  // 7. Meditation History Array
  if (payload.meditationHistory !== undefined) {
    if (!Array.isArray(payload.meditationHistory)) {
      throw new Error('Invalid meditationHistory list in backup file.');
    }
    validatedData.meditationHistory = payload.meditationHistory.filter(
      (m) => m && typeof m === 'object'
    );
  }

  // 8. User Profile Object
  if (payload.profile !== undefined) {
    if (typeof payload.profile !== 'object' || !payload.profile) {
      throw new Error('Invalid profile object in backup file.');
    }
    validatedData.profile = {
      name: String(payload.profile.name || 'Seeker'),
      avatar: String(payload.profile.avatar || '🧘'),
      joinedDate: String(payload.profile.joinedDate || new Date().toISOString()),
      hasCompletedSetup: Boolean(payload.profile.hasCompletedSetup),
    };
  }

  // 9. Settings Object
  if (payload.settings !== undefined) {
    if (typeof payload.settings !== 'object' || !payload.settings) {
      throw new Error('Invalid settings object in backup file.');
    }
    validatedData.settings = payload.settings;
  }

  if (Object.keys(validatedData).length === 0) {
    throw new Error('Backup file contains no recognizable JapDhara fields.');
  }

  return validatedData;
};
