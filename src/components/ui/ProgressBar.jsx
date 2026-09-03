import React from 'react';

export const ProgressBar = ({
  value = 0,
  max = 100,
  height = 'h-2.5',
  showText = false,
  className = '',
  barColor = 'bg-spiritual-500',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center text-xs text-light-muted dark:text-dark-muted mb-1 font-medium">
          <span>{value} / {max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-light-hover dark:bg-dark-border rounded-full overflow-hidden ${height}`}>
        <div
          className={`${barColor} h-full rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
