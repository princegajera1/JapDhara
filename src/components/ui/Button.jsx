import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  icon: Icon,
  ariaLabel,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-spiritual-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:transform-none cursor-pointer min-h-[44px] min-w-[44px]';

  const variants = {
    primary:
      'bg-spiritual-500 hover:bg-spiritual-600 text-white shadow-soft-sm hover:shadow-glow-accent dark:bg-spiritual-500 dark:hover:bg-spiritual-600',
    secondary:
      'bg-light-hover text-light-text hover:bg-spiritual-100 dark:bg-dark-hover dark:text-dark-text dark:hover:bg-dark-border',
    outline:
      'border border-spiritual-500 text-spiritual-600 hover:bg-spiritual-50 dark:text-spiritual-400 dark:hover:bg-spiritual-950/30',
    ghost:
      'text-light-muted hover:text-light-text hover:bg-light-hover dark:text-dark-muted dark:hover:text-dark-text dark:hover:bg-dark-hover',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-soft-sm focus-visible:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
    icon: 'p-2.5 rounded-full',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
