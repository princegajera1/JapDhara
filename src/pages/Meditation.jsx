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
  Music,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Toast from '../components/common/Toast';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';
import storage from '../utils/storage';
import {
  startAmbientAudio,
  stopAmbientAudio,
  updateAmbientVolume,
  playCompletionBell,
} from '../utils/meditationAudio';

const STORAGE_KEY_AUDIO = 'japdhara_meditation_audio';

const DEFAULT_AUDIO_SETTINGS = {
  soundEnabled: true,
  selectedSound: 'river',
  soundVolume: 0.6,
  reverbEnabled: true,
  reverbAmount: 0.5,
  completionBellEnabled: true,
  completionBellVolume: 0.8,
};

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
    t,
    currentMantra,
    meditationHistory,
    addMeditationSession,
  } = useApp();

  const [selectedDuration, setSelectedDuration] = useState(5); // minutes
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompletionToast, setShowCompletionToast] = useState(false);

  // Audio Configuration State (Persisted)
  const [audioSettings, setAudioSettings] = useState(() =>
    storage.getItem(STORAGE_KEY_AUDIO, DEFAULT_AUDIO_SETTINGS)
  );

  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState(false);

  // Breathing cycle phase for Breath Focus mode
  const [breathPhase, setBreathPhase] = useState('Inhale');

  const timerRef = useRef(null);
  const endTimeRef = useRef(null);
  const pausedTimeLeftRef = useRef(null);
  const hasPlayedCompletionRef = useRef(false);

  // Persist Audio Settings
  useEffect(() => {
    storage.setItem(STORAGE_KEY_AUDIO, audioSettings);
  }, [audioSettings]);

  // Sync initial time when user picks duration (when not running)
  const handleSelectDuration = (minutes) => {
    if (isRunning) return;
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsPaused(false);
  };

  // Dynamic Volume update during active session
  useEffect(() => {
    if (isRunning && !isPaused && audioSettings.soundEnabled) {
      updateAmbientVolume(audioSettings.soundVolume);
    }
  }, [audioSettings.soundVolume, isRunning, isPaused, audioSettings.soundEnabled]);

  // Accurate Timestamp-Based Timer Engine
  useEffect(() => {
    if (isRunning && !isPaused) {
      if (!endTimeRef.current) {
        const remainingMs = (pausedTimeLeftRef.current !== null ? pausedTimeLeftRef.current : timeLeft) * 1000;
        endTimeRef.current = Date.now() + remainingMs;
      }

      timerRef.current = setInterval(() => {
        const now = Date.now();
        const diffMs = endTimeRef.current - now;
        const remainingSecs = Math.max(0, Math.ceil(diffMs / 1000));

        setTimeLeft(remainingSecs);

        if (remainingSecs <= 0) {
          clearInterval(timerRef.current);
          endTimeRef.current = null;
          pausedTimeLeftRef.current = null;
          handleCompleteSession(selectedDuration * 60, true);
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      endTimeRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, selectedDuration]);

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

  // Handle Page Visibility Changes (App Background/Tab Change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isPaused) {
        // Continue tracking elapsed time accurately via endTimeRef
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning, isPaused]);

  const handleStartTimer = () => {
    hasPlayedCompletionRef.current = false;
    const initialSecs = selectedDuration * 60;
    setTimeLeft(initialSecs);
    pausedTimeLeftRef.current = initialSecs;
    endTimeRef.current = Date.now() + initialSecs * 1000;
    setIsRunning(true);
    setIsPaused(false);

    // Start Ambient Sound
    if (audioSettings.soundEnabled && audioSettings.selectedSound !== 'silent') {
      startAmbientAudio({
        soundType: audioSettings.selectedSound,
        volume: audioSettings.soundVolume,
        reverbEnabled: audioSettings.reverbEnabled,
        reverbAmount: audioSettings.reverbAmount,
      });
    }
  };

  const handlePauseTimer = () => {
    setIsPaused(true);
    pausedTimeLeftRef.current = timeLeft;
    endTimeRef.current = null;
    stopAmbientAudio();
  };

  const handleResumeTimer = () => {
    setIsPaused(false);
    endTimeRef.current = Date.now() + (pausedTimeLeftRef.current || timeLeft) * 1000;

    if (audioSettings.soundEnabled && audioSettings.selectedSound !== 'silent') {
      startAmbientAudio({
        soundType: audioSettings.selectedSound,
        volume: audioSettings.soundVolume,
        reverbEnabled: audioSettings.reverbEnabled,
        reverbAmount: audioSettings.reverbAmount,
      });
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    stopAmbientAudio();
    pausedTimeLeftRef.current = null;
    endTimeRef.current = null;
    setTimeLeft(selectedDuration * 60);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleEndSession = () => {
    const totalTargetSecs = selectedDuration * 60;
    const elapsedSecs = Math.max(1, totalTargetSecs - timeLeft);
    handleCompleteSession(elapsedSecs, false);
  };

  const handleCompleteSession = (elapsedSecs, isNaturalCompletion = false) => {
    setIsRunning(false);
    setIsPaused(false);
    stopAmbientAudio();

    if (timerRef.current) clearInterval(timerRef.current);
    endTimeRef.current = null;
    pausedTimeLeftRef.current = null;

    setShowCompletionToast(true);

    // Play ONE peaceful completion bell if natural completion reached 00:00
    if (isNaturalCompletion && audioSettings.completionBellEnabled && !hasPlayedCompletionRef.current) {
      hasPlayedCompletionRef.current = true;
      playCompletionBell(audioSettings.completionBellVolume);
    }

    const actualSecs = elapsedSecs || Math.max(1, selectedDuration * 60 - timeLeft);
    const durationMinutes = Math.max(1, Math.round(actualSecs / 60));

    addMeditationSession({
      durationSeconds: actualSecs,
      durationMinutes: durationMinutes,
      mode: selectedMode.title,
    });

    setTimeLeft(selectedDuration * 60);
  };

  const updateAudioState = (fields) => {
    setAudioSettings((prev) => {
      const next = { ...prev, ...fields };
      if (isRunning && !isPaused && next.soundEnabled) {
        startAmbientAudio({
          soundType: next.selectedSound,
          volume: next.soundVolume,
          reverbEnabled: next.reverbEnabled,
          reverbAmount: next.reverbAmount,
        });
      } else if (!next.soundEnabled || next.selectedSound === 'silent') {
        stopAmbientAudio();
      }
      return next;
    });
  };

  // Format MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration display label
  const formatDurationDisplay = (seconds, minutes) => {
    if (seconds && seconds < 60) {
      return `${seconds} sec`;
    }
    const mins = minutes || Math.floor((seconds || 0) / 60);
    const secs = seconds ? seconds % 60 : 0;
    if (secs > 0) {
      return `${mins} min ${secs} sec`;
    }
    return `${mins} min`;
  };

  // Calculate dynamic stats from saved history
  const todayKey = new Date().toISOString().split('T')[0];

  const todaySessions = useMemo(() => {
    return meditationHistory.filter((s) => s.dateKey === todayKey);
  }, [meditationHistory, todayKey]);

  const todayMinutes = useMemo(() => {
    const totalSecs = todaySessions.reduce(
      (acc, s) => acc + (s.durationSeconds || s.durationMinutes * 60 || 0),
      0
    );
    return Math.round(totalSecs / 60);
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
        message={t('peacefulComplete') || 'Peaceful session complete 🙏'}
        type="success"
        isVisible={showCompletionToast}
        onClose={() => setShowCompletionToast(false)}
      />

      <PageHeader
        title={t('meditation')}
        subtitle="Silent reflection, breath focus, and inner stillness."
        showBack
        onBack={() => navigate('/home')}
        action={
          <button
            onClick={() => updateAudioState({ soundEnabled: !audioSettings.soundEnabled })}
            className="p-2 rounded-xl border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-spiritual-500 transition-colors cursor-pointer"
            aria-label={audioSettings.soundEnabled ? 'Mute ambient sound' : 'Unmute ambient sound'}
          >
            {audioSettings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        }
      />

      {/* Main Timer Display Container */}
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

        {/* Mantra Mode Custom Display */}
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
              {t('changeMantra')}
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

        {/* Duration Selector Bar */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto w-full max-w-md pb-1">
          {DURATIONS.map((dur) => {
            const isSelected = selectedDuration === dur.minutes;
            return (
              <button
                key={dur.minutes}
                disabled={isRunning}
                onClick={() => handleSelectDuration(dur.minutes)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
              className="py-4 text-base font-semibold shadow-soft-md cursor-pointer"
            >
              {t('startMeditation')}
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
                  className="cursor-pointer"
                >
                  {t('resume')}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  icon={Pause}
                  onClick={handlePauseTimer}
                  className="cursor-pointer"
                >
                  {t('pause')}
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                icon={Square}
                onClick={handleEndSession}
                className="w-auto px-4 cursor-pointer"
                ariaLabel="End meditation session"
              >
                {t('end')}
              </Button>
            </>
          )}

          {isRunning && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetTimer}
              ariaLabel="Reset timer"
              className="shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>
      </Card>

      {/* Premium Meditation Sound Collapsible Panel */}
      <Card className="divide-y divide-light-border dark:divide-dark-border overflow-hidden">
        <button
          onClick={() => setIsAudioPanelOpen(!isAudioPanelOpen)}
          className="w-full p-4 flex items-center justify-between hover:bg-light-hover dark:hover:bg-dark-hover transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-spiritual-500/10 text-spiritual-500">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-light-text dark:text-dark-text">
                🎵 {t('meditationSound')}
              </p>
              <p className="text-xs text-light-muted dark:text-dark-muted">
                {audioSettings.soundEnabled && audioSettings.selectedSound !== 'silent'
                  ? `Active: ${audioSettings.selectedSound}`
                  : 'Silent Ambient'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                audioSettings.soundEnabled
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted'
              }`}
            >
              {audioSettings.soundEnabled ? t('on') : t('off')}
            </span>
            {isAudioPanelOpen ? (
              <ChevronUp className="w-5 h-5 text-light-muted dark:text-dark-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-light-muted dark:text-dark-muted" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isAudioPanelOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-5 space-y-4 bg-light-card/40 dark:bg-dark-card/40"
            >
              {/* Sound Enabled Switch & Sound Selection Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
                    {t('sound')}
                  </label>
                  <select
                    value={audioSettings.selectedSound}
                    onChange={(e) => updateAudioState({ selectedSound: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500 cursor-pointer"
                  >
                    <option value="silent">{t('silent')}</option>
                    <option value="river">{t('riverWater')}</option>
                    <option value="rain">{t('gentleRain')}</option>
                    <option value="forest">{t('forestBreeze')}</option>
                    <option value="singing_bowl">{t('singingBowl')}</option>
                    <option value="om_drone">{t('softOmDrone')}</option>
                    <option value="ambient">{t('softAmbient')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-light-muted dark:text-dark-muted uppercase tracking-wider">
                      {t('volume')}
                    </span>
                    <span className="text-spiritual-500">
                      {Math.round(audioSettings.soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioSettings.soundVolume}
                    onChange={(e) => updateAudioState({ soundVolume: parseFloat(e.target.value) })}
                    className="w-full accent-spiritual-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Reverb Toggle & Intensity Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-light-text dark:text-dark-text">{t('reverb')}</p>
                    <p className="text-[11px] text-light-muted dark:text-dark-muted">Spiritual acoustics</p>
                  </div>
                  <button
                    onClick={() => updateAudioState({ reverbEnabled: !audioSettings.reverbEnabled })}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                      audioSettings.reverbEnabled
                        ? 'bg-spiritual-500 text-white'
                        : 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted'
                    }`}
                  >
                    {audioSettings.reverbEnabled ? t('on') : t('off')}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-light-muted dark:text-dark-muted uppercase tracking-wider">
                      {t('reverbIntensity')}
                    </span>
                    <span className="text-spiritual-500">
                      {audioSettings.reverbAmount < 0.4 ? t('low') : t('high')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    disabled={!audioSettings.reverbEnabled}
                    value={audioSettings.reverbAmount}
                    onChange={(e) => updateAudioState({ reverbAmount: parseFloat(e.target.value) })}
                    className="w-full accent-spiritual-500 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Completion Bell Toggle & Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-light-text dark:text-dark-text">{t('completionBell')}</p>
                    <p className="text-[11px] text-light-muted dark:text-dark-muted">Chime at 00:00</p>
                  </div>
                  <button
                    onClick={() =>
                      updateAudioState({ completionBellEnabled: !audioSettings.completionBellEnabled })
                    }
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                      audioSettings.completionBellEnabled
                        ? 'bg-spiritual-500 text-white'
                        : 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted'
                    }`}
                  >
                    {audioSettings.completionBellEnabled ? t('on') : t('off')}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-light-muted dark:text-dark-muted uppercase tracking-wider">
                      {t('bellVolume')}
                    </span>
                    <span className="text-spiritual-500">
                      {Math.round(audioSettings.completionBellVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    disabled={!audioSettings.completionBellEnabled}
                    value={audioSettings.completionBellVolume}
                    onChange={(e) => updateAudioState({ completionBellVolume: parseFloat(e.target.value) })}
                    className="w-full accent-spiritual-500 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
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
                      Completed ✓
                    </span>
                  </div>
                  <p className="text-xs text-light-muted dark:text-dark-muted">{session.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-spiritual-500 px-2.5 py-1 rounded-full bg-spiritual-500/10">
                    {formatDurationDisplay(session.durationSeconds, session.durationMinutes)}
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
