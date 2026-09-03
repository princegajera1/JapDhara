import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'Your journey begins here. Start chanting or add your favorite mantras.',
  actionLabel,
  onAction,
  symbol = '🕉',
  className = '',
}) => {
  return (
    <Card className={`text-center py-12 px-6 flex flex-col items-center justify-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-spiritual-500/10 text-spiritual-500 flex items-center justify-center mb-4 text-3xl">
        {Icon ? <Icon className="w-8 h-8" /> : <span>{symbol}</span>}
      </div>
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">
        {title}
      </h3>
      <p className="text-sm text-light-muted dark:text-dark-muted max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

export default EmptyState;
