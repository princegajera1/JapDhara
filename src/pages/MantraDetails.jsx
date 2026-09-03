import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/common/EmptyState';
import useApp from '../hooks/useApp';
import { INITIAL_MANTRAS } from '../data/mantras';

export const MantraDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite, customMantras, setCurrentMantra } = useApp();

  // Find mantra in built-in or custom dataset
  const allMantras = [...INITIAL_MANTRAS, ...customMantras];
  const mantra = allMantras.find((m) => m.id === id);

  if (!mantra) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <PageHeader title="Mantra Not Found" showBack onBack={() => navigate('/mantras')} />
        <EmptyState
          title="Mantra not found"
          description="The requested mantra could not be found in the library."
          actionLabel="Return to Library"
          onAction={() => navigate('/mantras')}
        />
      </div>
    );
  }

  const isFav = favorites.includes(mantra.id);

  const handleStartJaap = () => {
    setCurrentMantra(mantra);
    navigate('/jaap');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <PageHeader
        title={mantra.title}
        subtitle="Spiritual meaning, origin, and chanting benefits."
        showBack
        onBack={() => navigate('/mantras')}
        action={
          <button
            onClick={() => toggleFavorite(mantra.id)}
            className={`p-2.5 rounded-full border transition-all ${
              isFav
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-rose-500'
            }`}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>
        }
      />

      {/* Main Mantra Presentation Card */}
      <Card className="p-6 md:p-8 space-y-6 border-spiritual-500/30 text-center bg-gradient-to-b from-spiritual-500/5 via-transparent to-transparent">
        <div className="space-y-3 flex flex-col items-center">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-spiritual-500/15 text-spiritual-600 dark:text-spiritual-400 uppercase tracking-wider">
            {mantra.category} Category
          </span>

          <h2 className="mantra-text font-serif text-3xl md:text-4xl text-spiritual-500 font-bold py-2">
            {mantra.sanskrit}
          </h2>

          {mantra.transliteration && (
            <p className="text-sm font-semibold text-light-muted dark:text-dark-muted italic">
              &ldquo;{mantra.transliteration}&rdquo;
            </p>
          )}
        </div>

        {mantra.meaning && (
          <div className="p-4 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60 text-left border border-light-border dark:border-dark-border space-y-1">
            <h4 className="font-semibold text-xs text-spiritual-600 dark:text-spiritual-400 uppercase tracking-wider">
              Meaning
            </h4>
            <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">
              {mantra.meaning}
            </p>
          </div>
        )}

        {mantra.description && (
          <div className="text-left space-y-1.5 pt-2">
            <h4 className="font-semibold text-sm">About This Chant</h4>
            <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
              {mantra.description}
            </p>
          </div>
        )}

        {mantra.benefits && mantra.benefits.length > 0 && (
          <div className="text-left space-y-2 pt-2 border-t border-light-border dark:border-dark-border">
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-spiritual-500" />
              <span>Spiritual Purpose & Reflection</span>
            </h4>
            <ul className="space-y-2">
              {mantra.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-light-muted dark:text-dark-muted">
                  <CheckCircle2 className="w-4 h-4 text-spiritual-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={Play}
          onClick={handleStartJaap}
          className="py-4 text-base font-semibold shadow-soft-md"
        >
          Start Jaap
        </Button>
      </Card>
    </div>
  );
};

export default MantraDetails;
