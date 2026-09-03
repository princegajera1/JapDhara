/**
 * JapDhara Date & Streak Utilities
 * Uses local calendar date (YYYY-MM-DD) avoiding UTC shifts.
 */

export const getLocalDateKey = (d = new Date()) => {
  const dateObj = d instanceof Date && !isNaN(d.getTime()) ? d : new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateKey = () => getLocalDateKey(new Date());

export const getWeeklyDateKeys = (referenceDate = new Date()) => {
  const curr = new Date(referenceDate);
  const currentDay = curr.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMon);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayKey = getLocalDateKey(referenceDate);

  return dayNames.map((dayName, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateKey = getLocalDateKey(d);
    return {
      dayName,
      dateKey,
      isToday: dateKey === todayKey,
    };
  });
};

export const calculateStreaks = (activeDatesArray = [], referenceDate = new Date()) => {
  const todayKey = getLocalDateKey(referenceDate);

  const yesterday = new Date(referenceDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);

  // Filter out future dates, invalid strings, remove duplicates & sort chronologically
  const validDates = Array.from(new Set(activeDatesArray))
    .filter((dKey) => typeof dKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dKey) && dKey <= todayKey)
    .sort();

  if (validDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
  }

  // Calculate longest streak across history
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < validDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(`${validDates[i - 1]}T00:00:00`);
      const curr = new Date(`${validDates[i]}T00:00:00`);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak += 1;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Calculate current streak counting backward from today or yesterday
  const hasToday = validDates.includes(todayKey);
  const hasYesterday = validDates.includes(yesterdayKey);

  let currentStreak = 0;

  if (hasToday || hasYesterday) {
    let checkDate = hasToday ? new Date(referenceDate) : new Date(yesterday);
    while (true) {
      const key = getLocalDateKey(checkDate);
      if (validDates.includes(key)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalActiveDays: validDates.length,
  };
};
