/**
 * JapDhara Date Utilities
 * Reliable calendar date handling for daily chanting and meditation records.
 */

// Returns current local calendar date string in YYYY-MM-DD format
export const getTodayDateKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formats YYYY-MM-DD or ISO date string into human readable format (e.g. "Sep 3, 2026")
export const formatDateLabel = (dateInput) => {
  if (!dateInput) return 'Today';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Formats date & time string (e.g. "Sep 3, 2026, 10:45 AM")
export const formatDateTimeLabel = (dateInput) => {
  if (!dateInput) return 'Just now';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Returns array of YYYY-MM-DD keys for the 7 days of the current week (Monday to Sunday)
export const getWeeklyDateKeys = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon
  const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMon);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((dayName, idx) => {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + idx);
    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    return {
      dayName,
      dateKey,
      isToday: dateKey === getTodayDateKey(),
    };
  });
};
