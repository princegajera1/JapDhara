import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  ChevronDown,
  Sparkles,
  Check,
  Award,
} from 'lucide-react';

import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import useApp from '../hooks/useApp';
import { INITIAL_MANTRAS } from '../data/mantras';
import { getMalaProgressDetails, resetCurrentMalaProgress, MALA_BEADS } from '../utils/malaUtils';
import { playSpiritualSound } from '../utils/audioUtils';
import { triggerHaptic } from '../utils/hapticUtils';

export const Mala = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    setTodayCount,
    currentMantra,
    setCurrentMantra,
    completedMalas,
    customMantras,
    recordChant,
    settings,
  } = useApp();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationText, setCelebrationText] = useState('1 Mala Complete 🙏');
  const [tapAnimation, setTapAnimation] = useState(false);
  const [floatingItems, setFloatingItems] = useState([]);

  const prevCountRef = useRef(todayCount);
  const celebrationTimerRef = useRef(null);
  const tapAnimationTimerRef = useRef(null);

  const availableMantras = [...INITIAL_MANTRAS, ...customMantras];

  // Derive exact mala & bead details from master todayCount using formula ((count-1)%108)+1
  const { currentBead, completedMalas: calculatedMalas } = getMalaProgressDetails(todayCount);
  const displayMalas = Math.max(completedMalas, calculatedMalas);

  // Generate 108 beads dynamically
  const beads = Array.from({ length: MALA_BEADS }, (_, i) => i + 1);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      if (tapAnimationTimerRef.current) clearTimeout(tapAnimationTimerRef.current);
    };
  }, []);

  // Calculate angles for circular placement (starting at top -90deg)
  const getBeadCoordinates = (index, size = 300, radius = 125) => {
    const center = size / 2;
    const angle = ((index / MALA_BEADS) * 360 - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  const handleChantMala = (e) => {
    if (e) e.stopPropagation();

    const prevCount = prevCountRef.current;
    const nextCount = todayCount + 1;

    recordChant(1);

    // Audio & Haptic Feedback
    const soundType = settings?.soundType || (settings?.soundEnabled ? 'bead' : 'none');
    playSpiritualSound(soundType, settings?.soundEnabled !== false);

    const hapticIntensity = settings?.hapticIntensity || (settings?.vibrationEnabled ? 'light' : 'off');
    triggerHaptic(hapticIntensity);

    // Trigger completion celebration ONLY when crossing exact multiples of 108 (e.g. 107 -> 108, 215 -> 216)
    if (nextCount > 0 && nextCount % MALA_BEADS === 0 && prevCount % MALA_BEADS !== 0) {
      const malaNum = Math.floor(nextCount / MALA_BEADS);
      setCelebrationText(`${malaNum} Mala${malaNum > 1 ? 's' : ''} Complete 🙏`);
      setShowCelebration(true);
      playSpiritualSound('temple_bell', settings?.soundEnabled !== false);
      triggerHaptic('mala_complete');
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = setTimeout(() => setShowCelebration(false), 3500);
    }

    prevCountRef.current = nextCount;

    setTapAnimation(true);
    if (tapAnimationTimerRef.current) clearTimeout(tapAnimationTimerRef.current);
    tapAnimationTimerRef.current = setTimeout(() => setTapAnimation(false), 120);

    const newItem = { id: Date.now() + Math.random(), label: '+1' };
    setFloatingItems((prev) => [...prev.slice(-4), newItem]);
  };

  useEffect(() => {
    prevCountRef.current = todayCount;
  }, [todayCount]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if (isInput) return;

      if (e.code === 'Space' && !isResetModalOpen && !isMantraModalOpen) {
        e.preventDefault();
        handleChantMala();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [todayCount, isResetModalOpen, isMantraModalOpen]);

  const handleConfirmReset = () => {
    const resetCount = resetCurrentMalaProgress(todayCount);
    setTodayCount(resetCount);
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <Toast
        message={celebrationText}
        type="success"
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      <PageHeader
        title="Digital Mala"
        subtitle="108 sacred beads for continuous flow."
        showBack
        onBack={() => navigate('/jaap')}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/jaap')}
            className="text-xs"
          >
            Back to Jaap
          </Button>
        }
      />

      <Card
        role="button"
        tabIndex={0}
        onClick={handleChantMala}
        aria-label="Tap to count Jaap"
        className="p-4 flex items-center justify-between border-spiritual-500/20 cursor-pointer touch-manipulation select-none active:scale-[0.99] transition-transform"
      >
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5 text-xs text-spiritual-600 dark:text-spiritual-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Mantra</span>
          </div>
          <h2 className="font-bold text-base md:text-lg">{currentMantra.title}</h2>
          <p className="mantra-text font-serif text-sm text-spiritual-500 font-medium">
            {currentMantra.sanskrit}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsMantraModalOpen(true);
          }}
          className="gap-1 shrink-0 text-xs"
        >
          <span>Change</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </Card>

      <Card
        role="button"
        tabIndex={0}
        onClick={handleChantMala}
        aria-label="Sacred Mala interaction area: tap anywhere or tap any of the 108 beads to count Jaap"
        className="p-4 sm:p-6 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-spiritual-500/5 via-transparent to-transparent border-spiritual-500/30 overflow-hidden cursor-pointer touch-manipulation select-none relative"
      >
        {/* Floating +1 Particles */}
        <AnimatePresence>
          {floatingItems.map((item) => (
            <motion.span
              key={item.id}
              initial={{ opacity: 1, y: 0, scale: 0.9 }}
              animate={{ opacity: 0, y: -50, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute text-spiritual-500 font-black text-xl pointer-events-none z-20"
              style={{ top: '40%', left: '50%' }}
            >
              {item.label}
            </motion.span>
          ))}
        </AnimatePresence>

        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-3 rounded-2xl bg-spiritual-500/20 border border-spiritual-500/40 text-spiritual-600 dark:text-spiritual-400 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5 text-spiritual-500" />
            <span>{celebrationText}</span>
          </motion.div>
        )}

        {/* 108 Sacred Bead Interactive SVG Ring */}
        <div className="relative w-full max-w-[270px] sm:max-w-[300px] aspect-square flex items-center justify-center">
          <svg viewBox="0 0 300 300" className="w-full h-full absolute inset-0">
            <circle
              cx="150"
              cy="150"
              r="125"
              stroke="currentColor"
              strokeWidth="2"
              className="text-spiritual-500/20 fill-none"
            />

            {beads.map((beadNum, index) => {
              const { x, y } = getBeadCoordinates(index, 300, 125);
              const isGuruBead = index === 0;
              const isCurrent = beadNum === currentBead;
              const isPassed = currentBead > 0 && beadNum < currentBead;

              if (isGuruBead) {
                return (
                  <g
                    key={beadNum}
                    onClick={handleChantMala}
                    className="cursor-pointer touch-manipulation group"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      className="fill-transparent stroke-none pointer-events-auto"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrent ? '9' : '7.5'}
                      className={`transition-all duration-200 ${
                        isCurrent
                          ? 'fill-amber-500 stroke-amber-300 stroke-2 ring-4 ring-amber-500/40'
                          : 'fill-spiritual-600 stroke-spiritual-400 group-hover:fill-amber-500'
                      }`}
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-[10px] fill-amber-500 font-bold select-none"
                    >
                      🕉 Guru
                    </text>
                  </g>
                );
              }

              return (
                <g
                  key={beadNum}
                  onClick={handleChantMala}
                  className="cursor-pointer touch-manipulation group"
                >
                  {/* Expanded Invisible Touch Target Overlay */}
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    className="fill-transparent stroke-none pointer-events-auto"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isCurrent ? '6.5' : '4'}
                    className={`transition-all duration-150 ${
                      isCurrent
                        ? 'fill-spiritual-500 stroke-spiritual-300 stroke-2 shadow-glow-accent'
                        : isPassed
                        ? 'fill-spiritual-500/80'
                        : 'fill-light-border dark:fill-dark-border group-hover:fill-spiritual-400'
                    }`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Sacred Center Count Display */}
          <div className="z-10 flex flex-col items-center justify-center space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-spiritual-500">
              Current Mala
            </span>
            <span className="text-3xl font-black tracking-tight">
              {currentBead} <span className="text-sm font-normal text-light-muted dark:text-dark-muted">/ 108</span>
            </span>
            <p className="text-xs font-semibold text-light-muted dark:text-dark-muted">
              Total Jaap: <span className="font-bold text-light-text dark:text-dark-text">{todayCount}</span>
            </p>
            {displayMalas > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-1">
                Completed Malas: {displayMalas}
              </span>
            )}
          </div>
        </div>

        {/* Main Sacred Action Button */}
        <div className="w-full max-w-xs space-y-2" onClick={(e) => e.stopPropagation()}>
          <motion.button
            onClick={handleChantMala}
            animate={{ scale: tapAnimation ? 0.94 : 1 }}
            transition={{ duration: 0.1 }}
            className="w-full py-5 rounded-3xl bg-spiritual-500 hover:bg-spiritual-600 text-white font-bold text-xl shadow-soft-lg hover:shadow-glow-accent flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-spiritual-500/50"
            aria-label="Advance Mala Bead"
          >
            <span className="text-2xl">🙏</span>
            <span>Jaap Bead (+1)</span>
          </motion.button>

          <p className="text-[11px] text-light-muted dark:text-dark-muted font-medium">
            Tap any of the 108 beads or press <kbd className="px-1.5 py-0.5 rounded bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border text-xs">Spacebar</kbd>
          </p>
        </div>

        <div className="w-full space-y-4 pt-2 border-t border-light-border dark:border-dark-border" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
              <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Current Bead</p>
              <p className="font-bold text-spiritual-500">{currentBead} / 108</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
              <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Total Jaap</p>
              <p className="font-bold">{todayCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
              <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Completed</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{displayMalas} Mala{displayMalas !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            icon={RotateCcw}
            fullWidth
            className="text-rose-500 hover:text-rose-600 font-semibold"
          >
            Reset Current Mala
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Current Mala?"
      >
        <div className="space-y-4 pt-1">
          <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
            Reset current mala bead back to Bead 1? Your today's total Jaap count, completed malas, and mantra settings will remain safe.
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

      <Modal
        isOpen={isMantraModalOpen}
        onClose={() => setIsMantraModalOpen(false)}
        title="Select Mantra"
      >
        <div className="space-y-3 pt-2">
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Select a mantra for your digital mala session.
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
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
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
    </div>
  );
};

export default Mala;
