/**
 * JapDhara Web Audio Synthesis Engine
 * Provides clean, zero-latency spiritual sounds via Web Audio API.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

export const playSpiritualSound = (soundType = 'bead', soundEnabled = true) => {
  if (!soundEnabled || soundType === 'none' || soundType === 'off') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (soundType) {
      case 'soft_click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'bead':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now); // Sacred 432Hz frequency
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;

      case 'bell':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now); // 528Hz Transformation frequency
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;

      case 'temple_bell':
      case 'mala_complete':
        // Harmonic Dual-Tone Resonant Temple Bell
        const osc2 = ctx.createOscillator();
        osc.type = 'sine';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(216, now);
        osc2.frequency.setValueAtTime(432, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 2.5);
        osc2.stop(now + 2.5);
        break;

      case 'om':
        // 136.1 Hz Earth / Om Frequency Drone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(136.1, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
        break;

      default:
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
  } catch (e) {
    // Ignore audio context block errors
  }
};
