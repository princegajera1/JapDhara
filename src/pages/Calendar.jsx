import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  CircleDot,
  Clock,
  Sparkles,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Modal from '../components/common/Modal';
import useApp from '../hooks/useApp';
import { getLocalDateKey } from '../utils/dateUtils';

export const CalendarPage = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    completedMalas,
    recentSessions,
    meditationHistory,
    activeDates = [],
  } = useApp();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  // Calculate daily breakdown for the entire month
  const monthData = useMemo(() => {
    const todayKey = getLocalDateKey();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const daysMap = {};

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      daysMap[dKey] = {
        dateKey: dKey,
        dayNum,
        jaapCount: 0,
        malasCount: 0,
        meditationSecs: 0,
        sessionsCount: 0,
        isActive: activeDates.includes(dKey),
        isToday: dKey === todayKey,
        isFuture: dKey > todayKey,
      };
    }

    recentSessions.forEach((s) => {
      let dKey = s.dateKey;
      if (!dKey && s.date) {
        const d = new Date(s.date);
        if (!isNaN(d.getTime())) dKey = getLocalDateKey(d);
      }
      if (dKey && daysMap[dKey]) {
        daysMap[dKey].jaapCount += s.count || 0;
        daysMap[dKey].sessionsCount += 1;
        daysMap[dKey].isActive = true;
      }
    });

    meditationHistory.forEach((m) => {
      let dKey = m.dateKey;
      if (!dKey && (m.timestamp || m.date)) {
        const d = new Date(m.timestamp || m.date);
        if (!isNaN(d.getTime())) dKey = getLocalDateKey(d);
      }
      if (dKey && daysMap[dKey]) {
        daysMap[dKey].meditationSecs += m.durationSeconds || (m.durationMinutes ? m.durationMinutes * 60 : 0);
        daysMap[dKey].sessionsCount += 1;
        daysMap[dKey].isActive = true;
      }
    });

    if (daysMap[todayKey]) {
      if (daysMap[todayKey].jaapCount < todayCount) {
        daysMap[todayKey].jaapCount = todayCount;
      }
      daysMap[todayKey].malasCount = Math.floor(daysMap[todayKey].jaapCount / 108);
      daysMap[todayKey].isActive = true;
    }

    Object.values(daysMap).forEach((dayObj) => {
      dayObj.malasCount = Math.floor(dayObj.jaapCount / 108);
    });

    return {
      daysMap,
      daysInMonth,
      mondayOffset,
    };
  }, [year, month, recentSessions, meditationHistory, activeDates, todayCount]);

  // Calculate monthly summaries
  const monthlySummaries = useMemo(() => {
    let totalJaap = 0;
    let totalMalas = 0;
    let totalMeditationSecs = 0;
    let activeDaysCount = 0;

    Object.values(monthData.daysMap).forEach((day) => {
      if (day.isActive || day.jaapCount > 0 || day.meditationSecs > 0) {
        activeDaysCount += 1;
      }
      totalJaap += day.jaapCount;
      totalMalas += day.malasCount;
      totalMeditationSecs += day.meditationSecs;
    });

    return {
      totalJaap,
      totalMalas,
      activeDaysCount,
      totalMeditationMins: Math.round(totalMeditationSecs / 60),
    };
  }, [monthData]);

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    setCurrentMonthDate(new Date());
  };

  const getActivityBadgeClass = (count, malas) => {
    if (count >= 1000) return 'bg-purple-500 text-white font-extrabold shadow-soft-sm';
    if (count >= 500) return 'bg-spiritual-500 text-white font-extrabold shadow-soft-sm';
    if (malas >= 1 || count >= 108) return 'bg-emerald-500 text-white font-bold shadow-soft-sm';
    if (count > 0) return 'bg-spiritual-500/30 text-spiritual-700 dark:text-spiritual-300 font-semibold';
    return '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Spiritual Calendar"
        subtitle="Visual daily breakdown of your Jaap, Mala, and Meditation sadhana."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* Month Navigation Header */}
      <Card className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{monthName}</h2>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              {monthlySummaries.activeDaysCount} Active Days this month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToday}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-spiritual-500/30 text-spiritual-500 hover:bg-spiritual-500/10 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-spiritual-500 cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-spiritual-500 cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <Card className="p-3.5">
          <p className="text-[10px] font-semibold uppercase text-light-muted dark:text-dark-muted">Month Jaap</p>
          <p className="text-xl font-black text-spiritual-500 mt-0.5">{monthlySummaries.totalJaap}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[10px] font-semibold uppercase text-light-muted dark:text-dark-muted">Month Malas</p>
          <p className="text-xl font-black text-emerald-500 mt-0.5">{monthlySummaries.totalMalas}</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[10px] font-semibold uppercase text-light-muted dark:text-dark-muted">Meditation</p>
          <p className="text-xl font-black text-blue-500 mt-0.5">{monthlySummaries.totalMeditationMins} min</p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[10px] font-semibold uppercase text-light-muted dark:text-dark-muted">Active Days</p>
          <p className="text-xl font-black text-amber-500 mt-0.5">{monthlySummaries.activeDaysCount}</p>
        </Card>
      </div>

      {/* Calendar Grid Container */}
      <Card className="p-4 sm:p-6 space-y-4">
        {/* Day Names Row (Mon -> Sun) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-light-muted dark:text-dark-muted border-b border-light-border dark:border-dark-border pb-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Calendar Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty Offset Cells */}
          {Array.from({ length: monthData.mondayOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} className="h-12 sm:h-16 rounded-xl bg-transparent" />
          ))}

          {/* Day Cells */}
          {Array.from({ length: monthData.daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayObj = monthData.daysMap[dKey];
            const badgeClass = getActivityBadgeClass(dayObj.jaapCount, dayObj.malasCount);

            return (
              <button
                key={dKey}
                disabled={dayObj.isFuture}
                onClick={() => setSelectedDayDetail(dayObj)}
                className={`h-12 sm:h-16 p-1 rounded-2xl border flex flex-col justify-between items-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  dayObj.isToday
                    ? 'border-spiritual-500 ring-2 ring-spiritual-500/40 bg-spiritual-500/10'
                    : dayObj.isActive
                    ? 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-spiritual-500/50'
                    : 'border-light-border/40 dark:border-dark-border/40 bg-light-hover/20 dark:bg-dark-hover/20'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    dayObj.isToday ? 'text-spiritual-600 dark:text-spiritual-400' : 'text-light-text dark:text-dark-text'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Activity Dots / Badges */}
                {dayObj.jaapCount > 0 ? (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full w-full max-w-[42px] truncate text-center ${badgeClass}`}
                  >
                    {dayObj.jaapCount}
                  </span>
                ) : dayObj.isActive ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-soft-xs mb-1" />
                ) : null}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Day Details Modal */}
      {selectedDayDetail && (
        <Modal
          isOpen={!!selectedDayDetail}
          onClose={() => setSelectedDayDetail(null)}
          title={`Activity — ${selectedDayDetail.dateKey}`}
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-spiritual-500/10">
                <span className="text-[10px] font-bold uppercase text-spiritual-600 dark:text-spiritual-400">
                  Total Jaap
                </span>
                <p className="text-xl font-black text-spiritual-500 mt-0.5">
                  {selectedDayDetail.jaapCount}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10">
                <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Completed Malas
                </span>
                <p className="text-xl font-black text-emerald-500 mt-0.5">
                  {selectedDayDetail.malasCount}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/10">
                <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                  Meditation
                </span>
                <p className="text-xl font-black text-blue-500 mt-0.5">
                  {Math.round(selectedDayDetail.meditationSecs / 60)} min
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10">
                <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  Active Status
                </span>
                <p className="text-sm font-bold text-amber-500 mt-1">
                  {selectedDayDetail.isActive ? 'Active Sadhana Day ✓' : 'No Activity'}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CalendarPage;
