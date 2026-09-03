import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Home } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <Card className="max-w-md w-full p-8 flex flex-col items-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-spiritual-500/10 text-spiritual-500 flex items-center justify-center text-3xl">
          🕉
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            The path you are looking for does not exist or has been moved.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Home}
          onClick={() => navigate('/home')}
        >
          Go Home
        </Button>
      </Card>
    </div>
  );
};

export default NotFound;
