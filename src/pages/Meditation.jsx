import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Wind,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  BookOpen,
  History,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';

const DURATIONS = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '15 min', minutes: 15 },
  { label: '20 min', minutes: 20 },
  { label: '30 min', minutes: 30 },
];

const MODES = [
  {
    id: 'silent',
    title: 'Silent Meditation',
    instruction: 'Rest your awareness in quiet presence and silence.',
    icon: Sparkles,
  },
  {
    id: 'breath',
    title: 'Breath Focus',
    instruction: 'Slowly breathe in, pause gently, and breathe out.',
    icon: Wind,
  },
  {
    id: 'mantra',
    title: 'Mantra Meditation',
    instruction: 'Repeat your selected mantra peacefully with every breath.',
    icon: BookOpen,
  },
  {
    id: 'relaxation',
    title: 'Relaxation',
    instruction: 'Release tension in your body and allow deep restful stillness.',
    icon: Clock,
  },
];

export const Meditation = () => {
  const navigate = useNavigate();
  const {
    currentMantra,
    meditationHistory,
    addMeditationSession,
    settings,
  } = useApp();

  const [selectedDuration, setSelectedDuration] = useState(5); // in minutes
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompletionToast, setShowCompletionToast] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Breathing cycle phase for Breath Focus mode (Inhale, Hold, Exhale, Pause)
  const [breathPhase, setBreathPhase] = useState('Inhale');

  const timerRef = useRef(null);

  // Sync initial time when user picks duration (and not currently running)
  const handleSelectDuration = (minutes) => {
    if (isRunning) return;
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsPaused(false);
  };

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, isPaused]);

  // Breathing cycle timer for Breath Focus mode
  useEffect(() => {
    if (selectedMode.id !== 'breath' || !isRunning || isPaused) return;

    const phases = [
      { text: 'Inhale...', duration: 4000 },
      { text: 'Hold gently...', duration: 4000 },
      { text: 'Exhale slowly...', duration: 4000 },
      { text: 'Rest...', duration: 2000 },
    ];

    let phaseIndex = 0;
    setBreathPhase(phases[0].text);

    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setBreathPhase(phases[phaseIndex].text);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedMode, isRunning, isPaused]);

  // Play Web Audio API chime bell on completion or start
  const playChimeSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz healing tone
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    } catch (e) {
      // Silently handle if audio context is blocked
    }
  };

  const handleStartTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    playChimeSound();
  };

  const handlePauseTimer = () => {
    setIsPaused(true);
  };

  const handleResumeTimer = () => {
    setIsPaused(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    clearInterval(timerRef.current);
  };

  const handleEndSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    clearInterval(timerRef.current);
  };

  const handleCompleteSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setShowCompletionToast(true);
    playChimeSound();

    addMeditationSession({
      durationMinutes: selectedDuration,
      mode: selectedMode.title,
    });

    setTimeLeft(selectedDuration * 60);
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate dynamic stats from saved history
  const todayKey = new Date().toISOString().split('T')[0];

  const todaySessions = useMemo(() => {
    return meditationHistory.filter((s) => s.dateKey === todayKey);
  }, [meditationHistory, todayKey]);

  const todayMinutes = useMemo(() => {
    return todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  }, [todaySessions]);

  const totalSessionsCount = meditationHistory.length;

  // Chronologically sorted meditation sessions (newest first)
  const sortedMeditationHistory = useMemo(() => {
    return [...meditationHistory].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.date || 0).getTime();
      const timeB = new Date(b.timestamp || b.date || 0).getTime();
      return timeB - timeA;
    });
  }, [meditationHistory]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Toast Notification for Completion */}
      <Toast
        message="Meditation Complete 🙏"
        type="success"
        isVisible={showCompletionToast}
        onClose={() => setShowCompletionToast(false)}
      />

      <PageHeader
        title="Meditation"
        subtitle="Silent reflection, breath focus, and inner stillness."
        showBack
        onBack={() => navigate('/home')}
        action={
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-spiritual-500 transition-colors"
            aria-label={soundEnabled ? 'Mute ambient sound' : 'Unmute ambient sound'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        }
      />

      {/* Main Timer Display & Breathing Container */}
      <Card className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-spiritual-500/5 via-transparent to-transparent border-spiritual-500/30">
        {/* Mode & Instruction Header */}
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-spiritual-500/15 text-spiritual-600 dark:text-spiritual-400 uppercase tracking-wider">
            {selectedMode.title}
          </span>
          <p className="text-xs text-light-muted dark:text-dark-muted max-w-xs mx-auto pt-1">
            {selectedMode.instruction}
          </p>
        </div>

        {/* Mantra Mode Custom Visual Display */}
        {selectedMode.id === 'mantra' && (
          <div className="p-3 rounded-2xl bg-spiritual-500/10 border border-spiritual-500/20 max-w-xs w-full space-y-1">
            <span className="text-[10px] font-bold text-spiritual-600 dark:text-spiritual-400 uppercase">
              Chanting Focus
            </span>
            <p className="mantra-text font-serif text-lg text-spiritual-500 font-semibold">
              {currentMantra.sanskrit}
            </p>
            <Link
              to="/mantras"
              className="text-[11px] font-semibold text-spiritual-500 hover:underline block"
            >
              Change Mantra
            </Link>
          </div>
        )}

        {/* Breath Focus Animated Visual Circle */}
        {selectedMode.id === 'breath' && isRunning && !isPaused ? (
          <div className="relative flex flex-col items-center justify-center py-4">
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-48 h-48 rounded-full bg-spiritual-500/15 border-2 border-spiritual-500/40 flex flex-col items-center justify-center shadow-soft-lg"
            >
              <span className="text-3xl font-black tracking-tight">{formatTime(timeLeft)}</span>
              <span className="text-xs font-bold text-spiritual-600 dark:text-spiritual-400 mt-1 animate-pulse">
                {breathPhase}
              </span>
            </motion.div>
          </div>
        ) : (
          /* Standard Digital Timer Display */
          <div className="py-4">
            <span className="text-5xl md:text-6xl font-black tracking-tight text-light-text dark:text-dark-text">
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs text-light-muted dark:text-dark-muted font-semibold mt-2">
              Target: {selectedDuration} Minutes
            </p>
          </div>
        )}

        {/* Duration Selector Bar (Disabled when timer is active) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto w-full max-w-md pb-1">
          {DURATIONS.map((dur) => {
            const isSelected = selectedDuration === dur.minutes;
            return (
              <button
                key={dur.minutes}
                disabled={isRunning}
                onClick={() => handleSelectDuration(dur.minutes)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-spiritual-500 text-white shadow-soft-sm'
                    : 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text disabled:opacity-50'
                }`}
              >
                {dur.label}
              </button>
            );
          })}
        </div>

        {/* Timer Control Action Buttons */}
        <div className="flex items-center gap-3 w-full max-w-xs pt-2">
          {!isRunning ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={Play}
              onClick={handleStartTimer}
              className="py-4 text-base font-semibold shadow-soft-md"
            >
              Start Meditation
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={Play}
                  onClick={handleResumeTimer}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  icon={Pause}
                  onClick={handlePauseTimer}
                >
                  Pause
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                icon={Square}
                onClick={handleEndSession}
                className="w-auto px-4"
                ariaLabel="End meditation session"
              >
                End
              </Button>
            </>
          )}

          {isRunning && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetTimer}
              ariaLabel="Reset timer"
              className="shrink-0"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>
      </Card>

      {/* Meditation Modes Picker */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Meditation Modes
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode.id === mode.id;
            return (
              <button
                key={mode.id}
                disabled={isRunning}
                onClick={() => setSelectedMode(mode)}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  isSelected
                    ? 'border-spiritual-500 bg-spiritual-500/10 text-spiritual-600 dark:text-spiritual-400 font-bold shadow-soft-sm'
                    : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover text-light-muted dark:text-dark-muted disabled:opacity-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{mode.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Meditation Stats Dashboard */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            Today's Minutes
          </p>
          <p className="text-xl font-extrabold text-spiritual-500 mt-0.5">
            {todayMinutes} min
          </p>
        </Card>

        <Card className="p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            Today's Sessions
          </p>
          <p className="text-xl font-extrabold text-spiritual-500 mt-0.5">
            {todaySessions.length}
          </p>
        </Card>

        <Card className="p-3.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            Total Sessions
          </p>
          <p className="text-xl font-extrabold text-spiritual-500 mt-0.5">
            {totalSessionsCount}
          </p>
        </Card>
      </div>

      {/* Meditation History List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Recent Meditation Sessions
        </h3>

        {sortedMeditationHistory && sortedMeditationHistory.length > 0 ? (
          <Card className="divide-y divide-light-border dark:divide-dark-border">
            {sortedMeditationHistory.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{session.mode || 'Silent Meditation'}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">{session.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-spiritual-500 px-2.5 py-1 rounded-full bg-spiritual-500/10">
                    {session.durationMinutes} min
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <EmptyState
            icon={History}
            title="No meditation sessions yet."
            description="Your completed meditation sessions will automatically appear here."
          />
        )}
      </div>
    </div>
  );
};

export default Meditation;
