import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import storage from '../utils/storage';

export const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const isCompleted = storage.getItem('japdhara_onboarding_completed', false);
      if (isCompleted) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center space-y-6 max-w-sm"
      >
        {/* Spiritual Symbol with Framer Motion breathing animation */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-24 h-24 rounded-full bg-spiritual-500/10 border border-spiritual-500/20 flex items-center justify-center text-5xl shadow-soft-lg"
        >
          🕉
        </motion.div>

        {/* Brand Title & Tagline */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Jap<span className="text-spiritual-500 font-bold">Dhara</span>
          </h1>
          <p className="text-sm font-medium text-light-muted dark:text-dark-muted italic">
            &ldquo;Let your Jaap flow.&rdquo;
          </p>
        </div>

        <p className="text-xs text-spiritual-600/80 dark:text-spiritual-400/80 pt-4">
          A peaceful journey of every chant.
        </p>
      </motion.div>
    </div>
  );
};

export default Splash;
