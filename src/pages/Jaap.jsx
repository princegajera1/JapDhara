import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Undo2,
  Plus,
  Play,
  Square,
  CheckCircle2,
  ChevronDown,
  Layers,
  BookOpen,
  Sparkles,
  Target,
  Check,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import useApp from '../hooks/useApp';
import { INITIAL_MANTRAS } from '../data/mantras';

const PRESET_GOALS = [108, 216, 324, 540, 1008, 1080];

export const Jaap = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    setTodayCount,
    dailyGoal,
    setDailyGoal,
    currentMantra,
    setCurrentMantra,
    customMantras,
    addJaapSession,
    settings,
  } = useApp();

  const [sessionCount, setSessionCount] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [isCustomGoal, setIsCustomGoal] = useState(false);
  const [tapAnimation, setTapAnimation] = useState(false);

  const availableMantras = [...INITIAL_MANTRAS, ...customMantras];

  const percentage = Math.min(100, Math.round((todayCount / dailyGoal) * 100));
  const isGoalComplete = todayCount >= dailyGoal;

  // Single tap/click handler that increments count by exactly 1
  const handleChant = () => {
    if (!isSessionActive) {
      setIsSessionActive(true);
    }

    setTodayCount(todayCount + 1);
    setSessionCount((prev) => prev + 1);

    // Subtle tap animation feedback
    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 150);

    if (settings?.vibrationEnabled && window.navigator?.vibrate) {
      try {
        window.navigator.vibrate(25);
      } catch (e) {
        // Ignore vibration errors on unsupported devices
      }
    }
  };

  // Keyboard accessibility: Spacebar or Enter increments count
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        !isResetModalOpen &&
        !isMantraModalOpen &&
        !isGoalModalOpen
      ) {
        e.preventDefault();
        handleChant();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todayCount, isSessionActive, isResetModalOpen, isMantraModalOpen, isGoalModalOpen]);

  // Undo handler: removes exactly 1 Jaap without going below 0
  const handleUndo = () => {
    if (todayCount > 0) {
      setTodayCount(todayCount - 1);
      setSessionCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Confirm Reset handler: resets today's count to 0
  const handleConfirmReset = () => {
    setTodayCount(0);
    setSessionCount(0);
    setIsSessionActive(false);
    setIsResetModalOpen(false);
  };

  // Session start/stop behavior
  const handleToggleSession = () => {
    if (isSessionActive) {
      if (sessionCount > 0) {
        addJaapSession({
          mantraTitle: currentMantra.title,
          sanskrit: currentMantra.sanskrit,
          count: sessionCount,
        });
      }
      setIsSessionActive(false);
      setSessionCount(0);
    } else {
      setIsSessionActive(true);
      setSessionCount(0);
    }
  };

  const handleGoalSelect = (goal) => {
    setDailyGoal(goal);
    setIsCustomGoal(false);
    setIsGoalModalOpen(false);
  };

  const handleCustomGoalSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customGoalInput, 10);
    if (!isNaN(val) && val > 0) {
      setDailyGoal(val);
      setIsGoalModalOpen(false);
      setCustomGoalInput('');
      setIsCustomGoal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Header & Quick Navigation Links */}
      <PageHeader
        title="Jaap Counter"
        subtitle="Turn every chant into a peaceful moment of focus."
        showBack
        onBack={() => navigate('/home')}
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/mala"
              className="p-2 rounded-xl bg-spiritual-500/10 text-spiritual-600 dark:text-spiritual-400 hover:bg-spiritual-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Digital Mala</span>
            </Link>
            <Link
              to="/mantras"
              className="p-2 rounded-xl bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Link>
          </div>
        }
      />

      {/* Active Mantra Selector Header */}
      <Card className="p-4 flex items-center justify-between border-spiritual-500/20">
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-xs text-spiritual-600 dark:text-spiritual-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Selected Mantra</span>
          </div>
          <h2 className="font-bold text-base md:text-lg">{currentMantra.title}</h2>
          <p className="mantra-text font-serif text-sm text-spiritual-500 font-medium">
            {currentMantra.sanskrit}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMantraModalOpen(true)}
          className="gap-1 shrink-0"
        >
          <span>Change</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </Card>

      {/* Main Counter & Progress Ring Container */}
      <Card className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-spiritual-500/5 to-transparent border-spiritual-500/30">
        {/* Goal Complete Banner */}
        {isGoalComplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Daily Jaap Goal Complete 🙏</span>
          </motion.div>
        )}

        {/* Circular Progress Ring with Center Counts */}
        <div className="relative py-2">
          <ProgressRing value={todayCount} max={dailyGoal} size={230} strokeWidth={12}>
            <div className="space-y-1">
              <motion.span
                key={todayCount}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.15 }}
                className="block text-4xl md:text-5xl font-black tracking-tight text-light-text dark:text-dark-text"
              >
                {todayCount}
              </motion.span>
              <p className="text-xs font-semibold text-light-muted dark:text-dark-muted">
                Goal: <span className="text-spiritual-500 font-bold">{todayCount} / {dailyGoal}</span>
              </p>
              <span className="inline-block text-[11px] font-bold text-spiritual-600 dark:text-spiritual-400 bg-spiritual-500/10 px-2.5 py-0.5 rounded-full mt-1">
                {percentage}% Complete
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Main Circular Tap Button */}
        <div className="w-full max-w-xs space-y-3">
          <motion.button
            onClick={handleChant}
            animate={{ scale: tapAnimation ? 0.94 : 1 }}
            transition={{ duration: 0.1 }}
            className="w-full py-6 rounded-3xl bg-spiritual-500 hover:bg-spiritual-600 text-white font-bold text-xl md:text-2xl shadow-soft-lg hover:shadow-glow-accent flex items-center justify-center gap-3 transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-spiritual-500/50"
            aria-label="Count +1 Jaap"
          >
            <span className="text-2xl">🙏</span>
            <span>Jaap (+1)</span>
          </motion.button>

          <p className="text-[11px] text-light-muted dark:text-dark-muted font-medium">
            Tap button or press <kbd className="px-1.5 py-0.5 rounded bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border text-xs">Spacebar</kbd> to count
          </p>
        </div>

        {/* Secondary Action Bar: Undo, +1, Reset, Goal Selector */}
        <div className="grid grid-cols-4 gap-2.5 w-full pt-4 border-t border-light-border dark:border-dark-border">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleChant}
            icon={Plus}
            className="flex-col py-2.5 text-xs h-auto"
            ariaLabel="Add one chant"
          >
            <span>+1 Jaap</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleUndo}
            disabled={todayCount <= 0}
            icon={Undo2}
            className="flex-col py-2.5 text-xs h-auto"
            ariaLabel="Undo last chant"
          >
            <span>Undo</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsGoalModalOpen(true)}
            icon={Target}
            className="flex-col py-2.5 text-xs h-auto"
            ariaLabel="Change goal"
          >
            <span>Goal</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            icon={RotateCcw}
            className="flex-col py-2.5 text-xs h-auto text-rose-500 hover:text-rose-600"
            ariaLabel="Reset counter"
          >
            <span>Reset</span>
          </Button>
        </div>
      </Card>

      {/* Session Tracker Box */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            Current Session
          </span>
          <p className="text-lg font-bold text-spiritual-500 mt-0.5">
            {sessionCount} chants
          </p>
        </div>

        <Button
          variant={isSessionActive ? 'outline' : 'secondary'}
          size="sm"
          icon={isSessionActive ? Square : Play}
          onClick={handleToggleSession}
        >
          {isSessionActive ? 'End Session' : 'Start Session'}
        </Button>
      </Card>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Today's Counter?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
            Are you sure you want to reset today's Jaap counter back to 0? Your daily goal and previous history will remain safe.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Mantra Modal */}
      <Modal
        isOpen={isMantraModalOpen}
        onClose={() => setIsMantraModalOpen(false)}
        title="Select Mantra"
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Choose a sacred mantra for your chanting session.
          </p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {availableMantras.map((mantra) => {
              const isSelected = currentMantra.id === mantra.id;
              return (
                <button
                  key={mantra.id}
                  onClick={() => {
                    setCurrentMantra(mantra);
                    setIsMantraModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-spiritual-500 bg-spiritual-500/10 text-spiritual-600 dark:text-spiritual-400 font-semibold'
                      : 'border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm">{mantra.title}</h4>
                    <p className="mantra-text font-serif text-sm text-spiritual-500">
                      {mantra.sanskrit}
                    </p>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-spiritual-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Change Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Select Daily Goal"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Select your target daily chant count. Saved automatically.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {PRESET_GOALS.map((goal) => {
              const isSelected = dailyGoal === goal && !isCustomGoal;
              return (
                <button
                  key={goal}
                  onClick={() => handleGoalSelect(goal)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-spiritual-500 bg-spiritual-500/15 text-spiritual-600 dark:text-spiritual-400'
                      : 'border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                  }`}
                >
                  <span>{goal} Jaap</span>
                  {isSelected && <Check className="w-4 h-4 text-spiritual-500" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-light-border dark:border-dark-border">
            {!isCustomGoal ? (
              <button
                onClick={() => setIsCustomGoal(true)}
                className="text-xs font-semibold text-spiritual-500 hover:underline py-1"
              >
                + Enter Custom Goal
              </button>
            ) : (
              <form onSubmit={handleCustomGoalSubmit} className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  placeholder="Enter count..."
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
                />
                <Button type="submit" variant="primary" size="sm">
                  Save
                </Button>
              </form>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jaap;
