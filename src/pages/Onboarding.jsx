import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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

  const handleFinish = () => {
    // Explicitly set localStorage key as requested by Phase 3 requirement
    localStorage.setItem('japdhara_onboarding_completed', 'true');
    completeOnboarding();
    navigate('/home', { replace: true });
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, SLIDES.length - 1));
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text max-w-lg mx-auto transition-colors duration-200">
      {/* Top Header: Brand & Skip Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕉</span>
          <span className="font-bold text-sm tracking-tight">JapDhara</span>
        </div>
        <button
          onClick={handleFinish}
          className="text-xs font-semibold text-light-muted dark:text-dark-muted hover:text-spiritual-500 transition-colors p-2 rounded-lg"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content Area */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center text-center space-y-6 px-4"
          >
            {/* Visual Icon / Symbol */}
            <div className="w-24 h-24 rounded-full bg-spiritual-500/10 border border-spiritual-500/20 flex items-center justify-center text-5xl shadow-soft-md animate-breathe-slow">
              {SLIDES[currentStep].symbol}
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {SLIDES[currentStep].title}
              </h1>
              <p className="text-sm md:text-base text-light-muted dark:text-dark-muted max-w-xs mx-auto leading-relaxed">
                {SLIDES[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 3 Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8" aria-label="Slide indicators">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
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
              onClick={() => navigate('/home')}
              className="text-spiritual-500 underline font-medium"
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
