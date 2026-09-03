import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import { CircleDot, BookOpen, Sparkles, Layers } from 'lucide-react';

export const QuickActionCard = () => {
  const navigate = useNavigate();

  const ACTIONS = [
    {
      title: 'Jaap Counter',
      subtitle: 'Counter session',
      icon: CircleDot,
      path: '/jaap',
    },
    {
      title: 'Digital Mala',
      subtitle: '108 bead mala',
      icon: Layers,
      path: '/mala',
    },
    {
      title: 'Mantras',
      subtitle: 'Sacred library',
      icon: BookOpen,
      path: '/mantras',
    },
    {
      title: 'Meditation',
      subtitle: 'Silent reflection',
      icon: Sparkles,
      path: '/meditation',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              hoverable
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center text-center p-4 space-y-2"
            >
              <div className="p-3 rounded-2xl bg-spiritual-500/10 text-spiritual-500">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{action.title}</h4>
                <p className="text-[11px] text-light-muted dark:text-dark-muted">{action.subtitle}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionCard;
