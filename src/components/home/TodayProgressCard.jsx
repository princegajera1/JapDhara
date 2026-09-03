import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import ProgressRing from '../ui/ProgressRing';
import Button from '../ui/Button';
import useApp from '../../hooks/useApp';
import { Play } from 'lucide-react';

export const TodayProgressCard = () => {
  const navigate = useNavigate();
  const { todayCount, dailyGoal } = useApp();

  const completed = todayCount || 0;
  const goal = dailyGoal || 108;
  const percentage = Math.min(100, Math.round((completed / goal) * 100));

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-spiritual-500/10 via-spiritual-500/5 to-transparent border-spiritual-500/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3 w-full md:w-auto">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-spiritual-500/20 text-spiritual-600 dark:text-spiritual-400">
            Today's Progress
          </span>

          <h2 className="text-xl md:text-2xl font-bold">Today's Jaap</h2>

          <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-spiritual-600 dark:text-spiritual-400">
            {completed} / {goal} <span className="text-xl font-semibold text-light-text dark:text-dark-text">Jaap</span>
          </p>

          <p className="text-sm font-semibold text-spiritual-500">
            {percentage}% Complete
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 shrink-0">
          <ProgressRing value={completed} max={goal} size={160} strokeWidth={11}>
            <div className="text-center">
              <span className="text-2xl font-bold text-spiritual-500">{percentage}%</span>
              <p className="text-[10px] text-light-muted dark:text-dark-muted font-medium uppercase tracking-wider">
                Complete
              </p>
            </div>
          </ProgressRing>

          <Button
            variant="primary"
            size="lg"
            icon={Play}
            onClick={() => navigate('/jaap')}
            className="w-full md:w-auto px-8 py-3.5 text-base font-semibold shadow-soft-md"
          >
            Start Jaap
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TodayProgressCard;
