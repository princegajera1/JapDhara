import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({
  message,
  type = 'info',
  isVisible,
  onClose,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-spiritual-500 shrink-0" />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-soft-lg px-4 py-3 rounded-2xl max-w-sm"
        >
          {icons[type] || icons.info}
          <p className="text-sm font-medium text-light-text dark:text-dark-text">{message}</p>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
