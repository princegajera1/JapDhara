/**
 * JapDhara Mala Mathematics Utilities
 * Mathematically precise 108-bead mala calculations.
 */

export const MALA_BEADS = 108;

// Calculates total completed malas from cumulative chant count using Math.floor
export const calculateCompletedMalas = (totalJaap) => {
  if (!totalJaap || totalJaap < 0) return 0;
  return Math.floor(totalJaap / MALA_BEADS);
};

// Calculates current bead position along 1..108 ring
export const calculateCurrentBead = (totalJaap) => {
  if (!totalJaap || totalJaap <= 0) return 1;
  const remainder = totalJaap % MALA_BEADS;
  return remainder === 0 ? MALA_BEADS : remainder;
};

// Returns object with completed malas, current bead (1..108), and percentage complete of current mala
export const getMalaProgressDetails = (totalJaap) => {
  const count = Math.max(0, parseInt(totalJaap, 10) || 0);
  const completed = Math.floor(count / MALA_BEADS);
  const remainder = count % MALA_BEADS;
  const bead = remainder === 0 && count > 0 ? MALA_BEADS : remainder === 0 ? 1 : remainder;
  const percentage = Math.round((bead / MALA_BEADS) * 100);

  return {
    completedMalas: completed,
    currentBead: bead,
    remainderJaap: remainder,
    percentage,
    isMalaCompleteJustNow: remainder === 0 && count > 0,
  };
};
