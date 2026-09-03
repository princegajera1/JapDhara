import React from 'react';
import Card from '../ui/Card';
import useApp from '../../hooks/useApp';
import { Flame } from 'lucide-react';

export const StreakCard = () => {
  const { streakCount } = useApp();

  return (
    <Card className="flex items-center gap-3.5 p-5">
      <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
        <Flame className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <span>{streakCount} Day{streakCount === 1 ? '' : 's'} Streak</span>
        </h3>
        <p className="text-xs text-light-muted dark:text-dark-muted">
          {streakCount > 0
            ? 'Keep your Sadhana going'
            : 'Start your Sadhana today'}
        </p>
      </div>
    </Card>
  );
};

export default StreakCard;
