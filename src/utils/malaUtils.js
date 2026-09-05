/**
 * JapDhara Mala Mathematics Utilities
 * Mathematically precise 108-bead mala calculations.
 */

export const MALA_BEADS = 108;

// Calculates total completed malas from cumulative chant count using Math.floor
export const calculateCompletedMalas = (totalJaap) => {
  const count = Math.max(0, parseInt(totalJaap, 10) || 0);
  return Math.floor(count / MALA_BEADS);
};

// Calculates current bead position along 1..108 ring: count === 0 ? 0 : ((count - 1) % 108) + 1
export const calculateCurrentBead = (totalJaap) => {
  const count = Math.max(0, parseInt(totalJaap, 10) || 0);
  if (count === 0) return 0;
  return ((count - 1) % MALA_BEADS) + 1;
};

// Resets in-progress mala count while preserving completed malas
export const resetCurrentMalaProgress = (totalJaap) => {
  const count = Math.max(0, parseInt(totalJaap, 10) || 0);
  return count - (count % MALA_BEADS);
};

// Returns object with completed malas, current bead (1..108), and percentage complete of current mala
export const getMalaProgressDetails = (totalJaap) => {
  const count = Math.max(0, parseInt(totalJaap, 10) || 0);
  const completedMalas = Math.floor(count / MALA_BEADS);
  const currentBead = count === 0 ? 0 : ((count - 1) % MALA_BEADS) + 1;
  const percentage = Math.round((currentBead / MALA_BEADS) * 100);

  return {
    completedMalas,
    currentBead,
    percentage,
  };
};

