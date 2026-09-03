import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, CircleDot, Clock, Layers, Sparkles, Filter } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';

export const History = () => {
  const navigate = useNavigate();
  const { recentSessions, meditationHistory } = useApp();

  const [activeFilter, setActiveFilter] = useState('All');

  // Unified chronological history items
  const combinedHistory = useMemo(() => {
    const jaapItems = recentSessions.map((s) => ({
      id: `jaap-${s.id || Math.random()}`,
      type: 'Jaap',
      title: s.mantraTitle || 'Om Namah Shivaya',
      subtext: s.sanskrit || 'ॐ नमः शिवाय',
      countText: `${s.count} chants`,
      malasCount: Math.floor((s.count || 0) / 108),
      date: s.date || 'Recent',
      rawDate: new Date(s.date || Date.now()).getTime(),
    }));

    const meditationItems = meditationHistory.map((m) => ({
      id: `meditation-${m.id || Math.random()}`,
      type: 'Meditation',
      title: m.mode || 'Silent Meditation',
      subtext: `${m.durationMinutes} minutes session`,
      countText: `${m.durationMinutes} mins`,
      date: m.date || 'Recent',
      rawDate: new Date(m.timestamp || m.date || Date.now()).getTime(),
    }));

    const merged = [...jaapItems, ...meditationItems];
    merged.sort((a, b) => b.rawDate - a.rawDate);
    return merged;
  }, [recentSessions, meditationHistory]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'Jaap') return combinedHistory.filter((i) => i.type === 'Jaap');
    if (activeFilter === 'Meditation') return combinedHistory.filter((i) => i.type === 'Meditation');
    return combinedHistory;
  }, [combinedHistory, activeFilter]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Session History"
        subtitle="Chronological timeline of your spiritual practice."
        showBack
        onBack={() => navigate('/home')}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-light-muted dark:text-dark-muted shrink-0 ml-1" />
        {['All', 'Jaap', 'Meditation'].map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-spiritual-500 text-white shadow-soft-sm'
                  : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Timeline List */}
      {filteredItems.length > 0 ? (
        <Card className="divide-y divide-light-border dark:divide-dark-border">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    item.type === 'Jaap'
                      ? 'bg-spiritual-500/10 text-spiritual-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}
                >
                  {item.type === 'Jaap' ? <CircleDot className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'Jaap'
                          ? 'bg-spiritual-500/10 text-spiritual-600 dark:text-spiritual-400'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {item.type}
                    </span>
                    {item.malasCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{item.malasCount} Mala</span>
                      </span>
                    )}
                  </div>
                  <p className="mantra-text font-serif text-xs text-light-muted dark:text-dark-muted">
                    {item.subtext}
                  </p>
                  <p className="text-[11px] text-light-muted dark:text-dark-muted">{item.date}</p>
                </div>
              </div>

              <span className="text-sm font-bold text-spiritual-600 dark:text-spiritual-400 shrink-0">
                {item.countText}
              </span>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={HistoryIcon}
          title="No activity recorded yet."
          description="Your completed Jaap and meditation sessions will automatically appear here."
        />
      )}
    </div>
  );
};

export default History;
