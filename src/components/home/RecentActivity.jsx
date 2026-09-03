import React from 'react';
import useApp from '../../hooks/useApp';
import EmptyState from '../common/EmptyState';
import Card from '../ui/Card';
import { History } from 'lucide-react';

export const RecentActivity = () => {
  const { recentSessions } = useApp();

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
        Recent Activity
      </h3>

      {recentSessions && recentSessions.length > 0 ? (
        <Card className="divide-y divide-light-border dark:divide-dark-border">
          {recentSessions.map((session, index) => (
            <div key={index} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{session.mantraTitle || 'Om Namah Shivaya'}</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">{session.date}</p>
              </div>
              <span className="text-sm font-bold text-spiritual-500">
                {session.count} chants
              </span>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={History}
          title="No Jaap recorded yet."
          description="Your completed Jaap sessions will automatically appear here."
        />
      )}
    </div>
  );
};

export default RecentActivity;
