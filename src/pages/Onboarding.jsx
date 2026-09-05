import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useApp from '../hooks/useApp';
import Button from '../components/ui/Button';

const SLIDES = [
  {
    id: 1,
    symbol: '🕉',
    title: 'Begin Your Spiritual Journey',
    description: 'Make every chant a peaceful moment of connection.',
  },
  {
    id: 2,
    symbol: '📿',
    title: '108 Chants. One Peaceful Mind.',
    description: 'Track your Jaap with our digital mala and simple counter.',
  },
  {
    id: 3,
    symbol: '🙏',
    title: 'Build Your Daily Sadhana',
    description: 'Set your daily goal, maintain your streak and grow your practice.',
  },
];

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding, isOnboardingCompleted } = useApp();

  const isLastStep = currentStep === SLIDES.length - 1;
  const isFirstStep = currentStep === 0;

  const handleFinish = (e) => {
    if (e) e.stopPropagation();
    completeOnboarding();
    navigate('/home', { replace: true });
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, SLIDES.length - 1));
    }
  };

  const handleBack = (e) => {
    if (e) e.stopPropagation();
    if (!isFirstStep) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleKeyDownContent = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text max-w-lg mx-auto transition-colors duration-200">
      {/* Top Header: Brand & Skip Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕉</span>
          <span className="font-bold text-sm tracking-tight">JapDhara</span>
        </div>
        <button
          onClick={handleFinish}
          className="text-xs font-semibold text-light-muted dark:text-dark-muted hover:text-spiritual-500 transition-colors p-2 rounded-lg cursor-pointer"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content Area — Clickable/Tappable Center Content */}
      <div className="my-auto py-6">
        <div
          role="button"
          tabIndex={0}
          onClick={handleNext}
          onKeyDown={handleKeyDownContent}
          aria-label={`Slide ${currentStep + 1}: ${SLIDES[currentStep].title}. Tap to advance next.`}
          className="cursor-pointer touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-spiritual-500/50 rounded-3xl p-4 transition-transform active:scale-[0.99] select-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col items-center text-center space-y-6"
            >
              {/* Visual Icon / Symbol */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-spiritual-500/10 border border-spiritual-500/20 flex items-center justify-center text-5xl sm:text-6xl shadow-soft-md animate-breathe-slow">
                {SLIDES[currentStep].symbol}
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {SLIDES[currentStep].title}
                </h1>
                <p className="text-sm sm:text-base text-light-muted dark:text-dark-muted max-w-xs mx-auto leading-relaxed">
                  {SLIDES[currentStep].description}
                </p>
                <p className="text-[11px] font-semibold text-spiritual-500/80 pt-1">
                  (Tap card or button to continue)
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3 Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-6" aria-label="Slide indicators">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentStep(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentStep
                  ? 'w-8 bg-spiritual-500'
                  : 'w-2.5 bg-light-border dark:bg-dark-border hover:bg-spiritual-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="space-y-3 pb-4">
        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBack}
              ariaLabel="Previous slide"
              className="w-1/3"
            >
              Back
            </Button>
          )}

          {isLastStep ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleFinish}
              className="py-4 text-base font-semibold shadow-soft-md"
            >
              Begin Jaap
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              fullWidth={isFirstStep}
              className={!isFirstStep ? 'w-2/3' : 'w-full'}
            >
              Next
            </Button>
          )}
        </div>

        {isOnboardingCompleted && (
          <p className="text-center text-xs text-light-muted dark:text-dark-muted pt-2">
            You have already completed onboarding.{' '}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/home');
              }}
              className="text-spiritual-500 underline font-medium cursor-pointer"
            >
              Return Home
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
