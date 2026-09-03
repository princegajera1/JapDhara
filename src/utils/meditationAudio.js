/**
 * JapDhara Web Audio Meditation Sound & Synthesizer Engine
 * Pure Web Audio API synthesis for zero-dependency, royalty-free meditation ambient sounds and completion bells.
 */

let audioCtx = null;
let ambientNodes = null;
let currentSoundType = 'silent';

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

// Create a Reverb / Delay feedback network
const createReverbNode = (ctx, amount = 0.5) => {
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.15;
  const feedback = ctx.createGain();
  feedback.gain.value = Math.min(0.7, Math.max(0.1, amount * 0.7));
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1500;

  delay.connect(feedback);
  feedback.connect(filter);
  filter.connect(delay);

  return { input: delay, output: delay };
};

// Stop active ambient synthesis smoothly
export const stopAmbientAudio = () => {
  if (ambientNodes) {
    try {
      const { gainNode, oscillators, noiseBufferSource, stopFn } = ambientNodes;
      const ctx = getAudioContext();
      if (ctx && gainNode) {
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      }
      setTimeout(() => {
        if (stopFn) stopFn();
        if (oscillators) oscillators.forEach((o) => { try { o.stop(); o.disconnect(); } catch (e) {} });
        if (noiseBufferSource) { try { noiseBufferSource.stop(); noiseBufferSource.disconnect(); } catch (e) {} }
        ambientNodes = null;
      }, 450);
    } catch (e) {
      ambientNodes = null;
    }
  }
  currentSoundType = 'silent';
};

// Generate Ambient Sound
export const startAmbientAudio = ({
  soundType = 'silent',
  volume = 0.5,
  reverbEnabled = false,
  reverbAmount = 0.5,
}) => {
  stopAmbientAudio();
  if (soundType === 'silent' || soundType === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const targetVol = Math.max(0.01, Math.min(1.0, volume));
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(targetVol, now + 0.5);

    let destinationNode = masterGain;

    // Connect Reverb if enabled
    if (reverbEnabled) {
      const reverb = createReverbNode(ctx, reverbAmount);
      masterGain.connect(reverb.input);
      reverb.output.connect(ctx.destination);
      masterGain.connect(ctx.destination);
    } else {
      masterGain.connect(ctx.destination);
    }

    const oscillators = [];
    let noiseBufferSource = null;
    let stopFn = null;

    switch (soundType) {
      case 'om_drone': {
        // 136.1 Hz Sacred Earth Om Frequency Drone
        const freqs = [136.1, 272.2, 408.3];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          oscGain.gain.setValueAtTime(idx === 0 ? 0.4 : 0.15, now);
          osc.connect(oscGain);
          oscGain.connect(destinationNode);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'singing_bowl': {
        // 432 Hz & 528 Hz Singing Bowl Harmonic Synth
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, now);
        osc2.frequency.setValueAtTime(528, now);

        const bowlGain1 = ctx.createGain();
        const bowlGain2 = ctx.createGain();
        bowlGain1.gain.setValueAtTime(0.3, now);
        bowlGain2.gain.setValueAtTime(0.2, now);

        osc1.connect(bowlGain1);
        osc2.connect(bowlGain2);
        bowlGain1.connect(destinationNode);
        bowlGain2.connect(destinationNode);

        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'river':
      case 'rain':
      case 'forest': {
        // Synthesize Organic Noise Buffer for Nature Sounds
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        const filter = ctx.createBiquadFilter();
        if (soundType === 'river') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, now);
        } else if (soundType === 'rain') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, now);
          filter.Q.setValueAtTime(0.5, now);
        } else {
          // Forest breeze
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, now);
        }

        noiseSrc.connect(filter);
        filter.connect(destinationNode);
        noiseSrc.start(now);
        noiseBufferSource = noiseSrc;
        break;
      }

      case 'ambient':
      default: {
        // Soft Ambient Harmonic Pad (432Hz base)
        const padFreqs = [216, 432, 648];
        padFreqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const pGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          pGain.gain.setValueAtTime(0.2, now);
          osc.connect(pGain);
          pGain.connect(destinationNode);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }
    }

    ambientNodes = {
      gainNode: masterGain,
      oscillators,
      noiseBufferSource,
      stopFn,
    };
    currentSoundType = soundType;
  } catch (e) {
    // Silently ignore audio errors so timer proceeds smoothly
  }
};

export const updateAmbientVolume = (volume = 0.5) => {
  if (ambientNodes && ambientNodes.gainNode) {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      const target = Math.max(0.001, Math.min(1.0, volume));
      ambientNodes.gainNode.gain.setValueAtTime(ambientNodes.gainNode.gain.value, now);
      ambientNodes.gainNode.gain.exponentialRampToValueAtTime(target, now + 0.1);
    }
  }
};

// Single Peaceful Completion Bell Playback (Plays ONCE, 2-5 sec gentle fade out)
export const playCompletionBell = (volume = 0.8) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(432, now); // 432 Hz Healing Fundamental
    osc2.frequency.setValueAtTime(864, now); // 864 Hz Octave Harmonic

    const targetVol = Math.max(0.01, Math.min(1.0, volume * 0.4));
    gain.gain.setValueAtTime(targetVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.5);
    osc2.stop(now + 3.5);
  } catch (e) {
    // Ignore audio context block errors
  }
};
