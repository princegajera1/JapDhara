/**
 * JapDhara Master Meditation Audio Engine — v1.2
 * Centralized Web Audio API pipeline for natural meditation soundscapes & completion chimes.
 */

class MeditationAudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbGain = null;
    this.reverbNode = null;
    this.activeSource = null;
    this.currentSound = 'silent';
    this.soundEnabled = true;
    this.volume = 0.5; // Default 50%
    this.reverbEnabled = true;
    this.reverbAmount = 0.5; // Medium
    this.completionBellEnabled = true;
    this.completionBellVolume = 0.8;
    this.isCrossfading = false;
  }

  // Ensure Single AudioContext Instance
  initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Reverb Network Setup
      this.reverbGain = this.ctx.createGain();
      this.reverbNode = this.createSyntheticReverbNode();

      if (this.reverbNode) {
        this.masterGain.connect(this.reverbNode);
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.ctx.destination);
      }

      this.masterGain.connect(this.ctx.destination);
      this.updateReverbMix();
    }

    return this.ctx;
  }

  // Create Synthetic Impulse Reverb Node
  createSyntheticReverbNode() {
    if (!this.ctx) return null;
    try {
      const rate = this.ctx.sampleRate;
      const length = rate * 2.5; // 2.5 second reverb tail
      const impulse = this.ctx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        const decay = Math.exp(-i / (rate * 0.5));
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
      }

      const convolver = this.ctx.createConvolver();
      convolver.buffer = impulse;
      return convolver;
    } catch (e) {
      return null;
    }
  }

  // Synchronize Master Volume Slider Immediately
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1.0, vol));
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const safeVal = Math.max(0.0001, this.volume);
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(safeVal, now + 0.05);
    }
  }

  // Synchronize Reverb State Immediately
  setReverb(enabled, amount = 0.5) {
    this.reverbEnabled = enabled;
    this.reverbAmount = amount;
    this.updateReverbMix();
  }

  updateReverbMix() {
    if (this.reverbGain && this.ctx) {
      const now = this.ctx.currentTime;
      const wetGain = this.reverbEnabled ? Math.max(0.05, Math.min(0.7, this.reverbAmount * 0.7)) : 0.0001;
      this.reverbGain.gain.cancelScheduledValues(now);
      this.reverbGain.gain.linearRampToValueAtTime(wetGain, now + 0.1);
    }
  }

  // Real-time Sound Switching with Smooth 600ms Crossfade
  startSound(soundId, config = {}) {
    this.initContext();
    if (!this.ctx) return;

    if (config.volume !== undefined) this.setVolume(config.volume);
    if (config.soundEnabled !== undefined) this.soundEnabled = config.soundEnabled;
    if (config.reverbEnabled !== undefined) this.setReverb(config.reverbEnabled, config.reverbAmount);

    if (!this.soundEnabled || soundId === 'silent' || soundId === 'none') {
      this.stopCurrentSound();
      this.currentSound = 'silent';
      return;
    }

    if (this.currentSound === soundId && this.activeSource) {
      return; // Already playing this sound
    }

    // Crossfade out existing sound
    this.stopCurrentSound(true);
    this.currentSound = soundId;

    // Create New Sound Generator Node
    const sourceObj = this.createSoundSource(soundId);
    if (sourceObj) {
      this.activeSource = sourceObj;
      const now = this.ctx.currentTime;
      sourceObj.sourceGain.gain.setValueAtTime(0.0001, now);
      sourceObj.sourceGain.gain.linearRampToValueAtTime(1.0, now + 0.6);
      sourceObj.sourceGain.connect(this.masterGain);
    }
  }

  // Synthesize Sound Source Nodes
  createSoundSource(soundId) {
    if (!this.ctx) return null;
    const now = this.ctx.currentTime;
    const sourceGain = this.ctx.createGain();
    const cleanupFns = [];

    switch (soundId) {
      case 'river': {
        // Natural River Stream: Smooth Low-Pass Filtered Noise with LFO Sweep
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        // LFO for natural water flow variation
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, now);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(120, now);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSrc.connect(filter);
        filter.connect(sourceGain);

        noiseSrc.start(now);
        lfo.start(now);

        cleanupFns.push(() => {
          try { noiseSrc.stop(); noiseSrc.disconnect(); } catch (e) {}
          try { lfo.stop(); lfo.disconnect(); } catch (e) {}
        });
        break;
      }

      case 'rain': {
        // Gentle Meditation Rain: Broad Bandpass Filtered Pink Noise
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.96 * b1 + white * 0.15;
          b2 = 0.86 * b2 + white * 0.30;
          data[i] = (b0 + b1 + b2) * 0.15;
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, now);
        filter.Q.setValueAtTime(0.4, now);

        noiseSrc.connect(filter);
        filter.connect(sourceGain);
        noiseSrc.start(now);

        cleanupFns.push(() => {
          try { noiseSrc.stop(); noiseSrc.disconnect(); } catch (e) {}
        });
        break;
      }

      case 'forest': {
        // Forest Breeze: Warm Low-Frequency Sway
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + 0.01 * white) / 1.01;
          last = data[i];
        }

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);

        noiseSrc.connect(filter);
        filter.connect(sourceGain);
        noiseSrc.start(now);

        cleanupFns.push(() => {
          try { noiseSrc.stop(); noiseSrc.disconnect(); } catch (e) {}
        });
        break;
      }

      case 'singing_bowl': {
        // 432 Hz & 528 Hz Singing Bowl Harmonic Synth with Tremor
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(432, now);
        osc2.frequency.setValueAtTime(528, now);

        const bowlGain = this.ctx.createGain();
        bowlGain.gain.setValueAtTime(0.25, now);

        osc1.connect(bowlGain);
        osc2.connect(bowlGain);
        bowlGain.connect(sourceGain);

        osc1.start(now);
        osc2.start(now);

        cleanupFns.push(() => {
          try { osc1.stop(); osc1.disconnect(); } catch (e) {}
          try { osc2.stop(); osc2.disconnect(); } catch (e) {}
        });
        break;
      }

      case 'om_drone': {
        // 136.1 Hz Sacred Earth Om Drone
        const freqs = [136.1, 272.2];
        const oscs = [];
        freqs.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(i === 0 ? 0.3 : 0.1, now);
          osc.connect(g);
          g.connect(sourceGain);
          osc.start(now);
          oscs.push(osc);
        });

        cleanupFns.push(() => {
          oscs.forEach((o) => { try { o.stop(); o.disconnect(); } catch (e) {} });
        });
        break;
      }

      case 'ambient':
      default: {
        // Soft Ambient Pad (432Hz Chord)
        const freqs = [216, 432, 648];
        const oscs = [];
        freqs.forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.15, now);
          osc.connect(g);
          g.connect(sourceGain);
          osc.start(now);
          oscs.push(osc);
        });

        cleanupFns.push(() => {
          oscs.forEach((o) => { try { o.stop(); o.disconnect(); } catch (e) {} });
        });
        break;
      }
    }

    return { sourceGain, cleanupFns };
  }

  // Stop Active Ambient Sound Safely
  stopCurrentSound(fastFade = false) {
    if (this.activeSource) {
      const src = this.activeSource;
      this.activeSource = null;
      if (this.ctx && src.sourceGain) {
        const now = this.ctx.currentTime;
        const fadeTime = fastFade ? 0.2 : 0.5;
        src.sourceGain.gain.cancelScheduledValues(now);
        src.sourceGain.gain.linearRampToValueAtTime(0.0001, now + fadeTime);
        setTimeout(() => {
          if (src.cleanupFns) {
            src.cleanupFns.forEach((fn) => fn());
          }
        }, fadeTime * 1000 + 50);
      } else {
        if (src.cleanupFns) {
          src.cleanupFns.forEach((fn) => fn());
        }
      }
    }
  }

  // Pause Audio (Fade out)
  pause() {
    this.stopCurrentSound(false);
  }

  // Resume Audio
  resume(soundId, config = {}) {
    this.startSound(soundId || this.currentSound, config);
  }

  // Complete Cleanup on End/Page Unmount
  stopAll() {
    this.stopCurrentSound(false);
    this.currentSound = 'silent';
  }

  // Play ONE Peaceful Completion Bell (Output Volume = masterVolume * bellVolume)
  playCompletionBell(bellVol = 0.8) {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(432, now); // 432 Hz Fundamental
      osc2.frequency.setValueAtTime(864, now); // 864 Hz Octave Harmonic

      const calcVolume = Math.max(0.01, Math.min(1.0, this.volume * bellVol * 0.4));
      bellGain.gain.setValueAtTime(calcVolume, now);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc1.connect(bellGain);
      osc2.connect(bellGain);

      // Connect through Reverb for spacious spiritual sound
      if (this.reverbNode && this.reverbEnabled) {
        bellGain.connect(this.reverbNode);
      } else {
        bellGain.connect(this.ctx.destination);
      }

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.5);
      osc2.stop(now + 3.5);
    } catch (e) {
      // Silently handle context blocked
    }
  }
}

export const meditationAudioManager = new MeditationAudioManager();
export default meditationAudioManager;
