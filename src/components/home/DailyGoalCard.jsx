import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../common/Modal';
import useApp from '../../hooks/useApp';
import { Target, Check } from 'lucide-react';

const PRESET_GOALS = [108, 216, 324, 540, 1008, 1080];

export const DailyGoalCard = () => {
  const { dailyGoal, setDailyGoal } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [isCustomInput, setIsCustomInput] = useState(false);

  const handleSelectGoal = (goal) => {
    setDailyGoal(goal);
    setIsCustomInput(false);
    setIsModalOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customGoal, 10);
    if (!isNaN(val) && val > 0) {
      setDailyGoal(val);
      setIsModalOpen(false);
      setCustomGoal('');
      setIsCustomInput(false);
    }
  };

  return (
    <>
      <Card className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-spiritual-500/10 text-spiritual-500">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Daily Goal</h3>
            <p className="text-sm font-bold text-spiritual-600 dark:text-spiritual-400">
              {dailyGoal} Jaap
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
        >
          Change Goal
        </Button>
      </Card>

      {/* Goal Selector Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Daily Goal"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Choose your preferred daily chant target. 108 is the traditional mala count.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {PRESET_GOALS.map((goal) => {
              const isSelected = dailyGoal === goal && !isCustomInput;
              return (
                <button
                  key={goal}
                  onClick={() => handleSelectGoal(goal)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-spiritual-500 bg-spiritual-500/15 text-spiritual-600 dark:text-spiritual-400'
                      : 'border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                  }`}
                >
                  <span>{goal} Jaap</span>
                  {isSelected && <Check className="w-4 h-4 text-spiritual-500" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-light-border dark:border-dark-border">
            {!isCustomInput ? (
              <button
                onClick={() => setIsCustomInput(true)}
                className="text-xs font-semibold text-spiritual-500 hover:underline py-1"
              >
                + Enter Custom Goal
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="100000"
                  placeholder="Enter target count..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-spiritual-500"
                />
                <Button type="submit" variant="primary" size="sm">
                  Save
                </Button>
              </form>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DailyGoalCard;
