import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

export const PageHeader = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  action,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className={`mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            ariaLabel="Go back"
            className="shrink-0 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-light-text dark:text-dark-text" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-light-text dark:text-dark-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </header>
  );
};

export default PageHeader;
