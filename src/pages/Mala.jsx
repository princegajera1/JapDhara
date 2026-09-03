import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Undo2,
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

export const Mala = () => {
  const navigate = useNavigate();
  const {
    todayCount,
    setTodayCount,
    currentMantra,
    setCurrentMantra,
    currentBead,
    setCurrentBead,
    completedMalas,
    setCompletedMalas,
    customMantras,
    addJaapSession,
    settings,
  } = useApp();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [tapAnimation, setTapAnimation] = useState(false);

  const availableMantras = [...INITIAL_MANTRAS, ...customMantras];

  // Generate 108 beads dynamically
  const totalBeads = 108;
  const beads = Array.from({ length: totalBeads }, (_, i) => i + 1);

  // Calculate angles for circular placement (starting at top -90deg)
  const getBeadCoordinates = (index, size = 300, radius = 125) => {
    const center = size / 2;
    const angle = ((index / totalBeads) * 360 - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  const handleChantMala = () => {
    if (currentBead >= 108) {
      setShowCelebration(true);
      setCompletedMalas(completedMalas + 1);
      setCurrentBead(1);
      setTodayCount(todayCount + 1);

      addJaapSession({
        mantraTitle: currentMantra.title,
        sanskrit: currentMantra.sanskrit,
        count: 108,
      });

      setTimeout(() => setShowCelebration(false), 3500);
    } else {
      setCurrentBead(currentBead + 1);
      setTodayCount(todayCount + 1);
    }

    setTapAnimation(true);
    setTimeout(() => setTapAnimation(false), 150);

    if (settings?.vibrationEnabled && window.navigator?.vibrate) {
      try {
        window.navigator.vibrate(25);
      } catch (e) {
        // Ignore vibration error on unsupported platforms
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        !isResetModalOpen &&
        !isMantraModalOpen
      ) {
        e.preventDefault();
        handleChantMala();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBead, todayCount, isResetModalOpen, isMantraModalOpen]);

  const handleUndo = () => {
    if (todayCount > 0) {
      setTodayCount(todayCount - 1);
      if (currentBead > 1) {
        setCurrentBead(currentBead - 1);
      } else if (completedMalas > 0) {
        setCompletedMalas(completedMalas - 1);
        setCurrentBead(108);
      }
    }
  };

  const handleConfirmReset = () => {
    setCurrentBead(1);
    setIsResetModalOpen(false);
  };

  const currentMalaNumber = completedMalas + 1;

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <Toast
        message="1 Mala Complete 🙏"
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

      <Card className="p-4 flex items-center justify-between border-spiritual-500/20">
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
          onClick={() => setIsMantraModalOpen(true)}
          className="gap-1 shrink-0 text-xs"
        >
          <span>Change</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </Card>

      <Card className="p-6 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-b from-spiritual-500/5 via-transparent to-transparent border-spiritual-500/30">
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-3 rounded-2xl bg-spiritual-500/20 border border-spiritual-500/40 text-spiritual-600 dark:text-spiritual-400 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5 text-spiritual-500" />
            <span>1 Mala Complete 🙏 (Mala {completedMalas} Finished!)</span>
          </motion.div>
        )}

        <div className="relative w-[300px] h-[300px] flex items-center justify-center">
          <svg width="300" height="300" className="absolute inset-0">
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
              const isPassed = beadNum < currentBead;

              if (isGuruBead) {
                return (
                  <g key={beadNum}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrent ? '9' : '7.5'}
                      className={`transition-all duration-200 ${
                        isCurrent
                          ? 'fill-spiritual-500 stroke-spiritual-300 stroke-2'
                          : 'fill-spiritual-600 stroke-spiritual-400'
                      }`}
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-[10px] fill-spiritual-500 font-bold"
                    >
                      🕉 Guru
                    </text>
                  </g>
                );
              }

              return (
                <circle
                  key={beadNum}
                  cx={x}
                  cy={y}
                  r={isCurrent ? '5.5' : '3.5'}
                  className={`transition-all duration-150 ${
                    isCurrent
                      ? 'fill-spiritual-500 stroke-spiritual-300 stroke-2 ring-2 ring-spiritual-500'
                      : isPassed
                      ? 'fill-spiritual-500/80'
                      : 'fill-light-border dark:fill-dark-border'
                  }`}
                />
              );
            })}
          </svg>

          <div className="z-10 flex flex-col items-center justify-center space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-spiritual-500">
              Mala {currentMalaNumber}
            </span>
            <span className="text-3xl font-black tracking-tight">
              {currentBead} <span className="text-sm font-normal text-light-muted dark:text-dark-muted">/ 108</span>
            </span>
            <p className="text-xs font-semibold text-light-muted dark:text-dark-muted">
              Total: <span className="font-bold text-light-text dark:text-dark-text">{todayCount}</span> Jaap
            </p>
            {completedMalas > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                {completedMalas} Mala{completedMalas > 1 ? 's' : ''} Completed
              </span>
            )}
          </div>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <motion.button
            onClick={handleChantMala}
            animate={{ scale: tapAnimation ? 0.94 : 1 }}
            transition={{ duration: 0.1 }}
            className="w-full py-5 rounded-3xl bg-spiritual-500 hover:bg-spiritual-600 text-white font-bold text-xl shadow-soft-lg hover:shadow-glow-accent flex items-center justify-center gap-2.5 transition-all duration-150 active:scale-95 cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-4 focus-visible:ring-spiritual-500/50"
            aria-label="Advance Mala Bead"
          >
            <span className="text-2xl">🙏</span>
            <span>Jaap Bead</span>
          </motion.button>

          <p className="text-[11px] text-light-muted dark:text-dark-muted font-medium">
            Tap button or press <kbd className="px-1.5 py-0.5 rounded bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border text-xs">Spacebar</kbd>
          </p>
        </div>

        <div className="w-full space-y-4 pt-2 border-t border-light-border dark:border-dark-border">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
              <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Current Bead</p>
              <p className="font-bold text-spiritual-500">{currentBead} / 108</p>
            </div>
            <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
              <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Today Total</p>
              <p className="font-bold">{todayCount} Jaap</p>
            </div>
            <div className="p-2 rounded-xl bg-light-hover/50 dark:bg-dark-hover/50">
              <p className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Completed</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{completedMalas} Mala</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUndo}
              disabled={todayCount <= 0}
              icon={Undo2}
              fullWidth
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsResetModalOpen(true)}
              icon={RotateCcw}
              fullWidth
              className="text-rose-500 hover:text-rose-600"
            >
              Reset Mala
            </Button>
          </div>
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
    </div>
  );
};

export default Mala;
