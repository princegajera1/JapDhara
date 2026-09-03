import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import useApp from '../../hooks/useApp';
import { Play, Sparkles } from 'lucide-react';

export const MantraPreview = () => {
  const navigate = useNavigate();
  const { currentMantra, setCurrentMantra } = useApp();

  const defaultMantraObj = {
    id: 'om-namah-shivaya',
    title: 'Om Namah Shivaya',
    sanskrit: 'ॐ नमः शिवाय',
    meaning: 'I bow to Lord Shiva, the supreme reality',
    targetCount: 108,
    category: 'Universal',
  };

  const activeMantra = currentMantra || defaultMantraObj;

  const handleStartMantra = () => {
    setCurrentMantra(activeMantra);
    navigate('/jaap');
  };

  return (
    <Card className="p-6 space-y-4 border-spiritual-500/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-spiritual-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            Today's Mantra
          </span>
        </div>
        <button
          onClick={() => navigate('/mantras')}
          className="text-xs font-semibold text-spiritual-500 hover:underline"
        >
          Explore Library
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold">{activeMantra.title}</h3>
        <p className="mantra-text font-serif text-2xl text-spiritual-500 font-semibold py-1">
          {activeMantra.sanskrit}
        </p>
        <p className="text-xs text-light-muted dark:text-dark-muted italic">
          &ldquo;{activeMantra.meaning || 'Om Namah Shivaya'}&rdquo;
        </p>
      </div>

      <Button
        variant="outline"
        size="md"
        icon={Play}
        onClick={handleStartMantra}
        fullWidth
        className="font-semibold"
      >
        Start This Mantra
      </Button>
    </Card>
  );
};

export default MantraPreview;
