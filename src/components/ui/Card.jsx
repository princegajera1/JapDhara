import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'p-5',
  bordered = true,
  ...props
}) => {
  const baseStyles = 'rounded-2xl bg-light-card dark:bg-dark-card transition-all duration-200';
  const borderStyles = bordered
    ? 'border border-light-border dark:border-dark-border shadow-soft-sm'
    : '';
  const hoverStyles = hoverable
    ? 'hover:shadow-soft-md hover:border-spiritual-400/40 cursor-pointer transform hover:-translate-y-0.5'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${borderStyles} ${hoverStyles} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
