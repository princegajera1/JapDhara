import React, { useState } from 'react';
import Modal from './Modal';
import Button from '../ui/Button';
import useApp from '../../hooks/useApp';

const AVATAR_CHOICES = ['🧘', 'ॐ', '🙏', '☸️', '✨', '🌸', '🌿', '🪷'];

export const ProfileSetupModal = () => {
  const { profile, updateProfile, isOnboardingCompleted } = useApp();

  // Show profile setup modal ONLY after onboarding is finished AND if profile setup has not been completed
  const isOpen = Boolean(isOnboardingCompleted) && !Boolean(profile?.hasCompletedSetup);

  const [name, setName] = useState(profile?.name || 'Seeker');
  const [avatar, setAvatar] = useState(profile?.avatar || '🧘');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile({
      name: name.trim(),
      avatar,
      hasCompletedSetup: true,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Welcome to JapDhara 🙏">
      <form onSubmit={handleSubmit} className="space-y-5 pt-1 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-spiritual-500/15 border-2 border-spiritual-500/30 flex items-center justify-center text-4xl shadow-soft-md">
          {avatar}
        </div>

        <div>
          <h3 className="font-bold text-lg">Welcome to JapDhara</h3>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
            Let's personalize your spiritual journey before you begin.
          </p>
        </div>

        <div className="text-left space-y-1.5">
          <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted">
            Display Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
          />
        </div>

        <div className="text-left space-y-2">
          <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted">
            Choose Your Avatar
          </label>
          <div className="grid grid-cols-4 gap-2.5 p-2.5 rounded-2xl bg-light-hover/60 dark:bg-dark-hover/60">
            {AVATAR_CHOICES.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => setAvatar(symbol)}
                className={`h-11 rounded-xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                  avatar === symbol
                    ? 'bg-spiritual-500 text-white ring-2 ring-spiritual-500/50 scale-105 shadow-soft-sm'
                    : 'hover:bg-spiritual-500/10'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth type="submit" className="py-3 font-bold text-sm">
          Continue to JapDhara
        </Button>
      </form>
    </Modal>
  );
};

export default ProfileSetupModal;
