/**
 * Safe localStorage wrapper with JSON parsing error protection.
 */
export const storage = {
  /**
   * Get an item from localStorage
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*}
   */
  getItem: (key, defaultValue = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`[storage] Error reading key "${key}" from localStorage:`, error);
      return defaultValue;
    }
  },

  /**
   * Set an item in localStorage
   * @param {string} key
   * @param {*} value
   * @returns {boolean} Success status
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`[storage] Error writing key "${key}" to localStorage:`, error);
      return false;
    }
  },

  /**
   * Remove an item from localStorage
   * @param {string} key
   * @returns {boolean} Success status
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[storage] Error removing key "${key}" from localStorage:`, error);
      return false;
    }
  },

  /**
   * Clear all JapDhara keys from localStorage
   */
  clearAll: () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('japdhara_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('[storage] Error clearing japdhara items:', error);
      return false;
    }
  },
};

export default storage;
