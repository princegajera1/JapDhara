/**
 * JapDhara Haptic Feedback Engine
 * Handles device vibration feedback with user intensity settings.
 */

export const triggerHaptic = (intensity = 'light') => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  try {
    switch (intensity) {
      case 'off':
      case false:
      case 'none':
        break;

      case 'light':
        navigator.vibrate(10);
        break;

      case 'medium':
        navigator.vibrate(20);
        break;

      case 'strong':
        navigator.vibrate(40);
        break;

      case 'mala_complete':
        navigator.vibrate([20, 30, 40, 20, 50]);
        break;

      default:
        navigator.vibrate(10);
        break;
    }
  } catch (e) {
    // Ignore unsupported vibration errors
  }
};
