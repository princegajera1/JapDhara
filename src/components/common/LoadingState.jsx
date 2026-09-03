import React from 'react';

export const LoadingState = ({
  message = 'Seeking peace...',
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-spiritual-500/20 border-t-spiritual-500 animate-spin" />
        <span className="absolute text-2xl animate-breathe-slow">🕉</span>
      </div>
      <p className="text-sm font-medium text-light-muted dark:text-dark-muted tracking-wide">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingState;
