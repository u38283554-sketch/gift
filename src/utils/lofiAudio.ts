/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Soft Lo-Fi Romantic Ambient Music Generator using Web Audio API
class LofiAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private timer: number | null = null;
  private step: number = 0;
  private vinylNode: AudioNode | null = null;

  // Chord progression (Fmaj9 -> Em7 -> Dm9 -> Cmaj7)
  private chords = [
    // Fmaj9: F2, A3, C4, E4, G4
    { bass: 87.31, notes: [220.0, 261.63, 329.63, 392.0] },
    // Em7: E2, G3, B3, D4, G4
    { bass: 82.41, notes: [196.0, 246.94, 293.66, 392.0] },
    // Dm9: D2, F3, A3, C4, E4
    { bass: 73.42, notes: [174.61, 220.0, 261.63, 329.63] },
    // Cmaj7 / Am9: C2 or A1, G3, B3, D4, E4
    { bass: 65.41, notes: [196.0, 246.94, 293.66, 329.63] },
  ];

  // Melodic bell/kalimba notes
  private melodies = [
    [523.25, 659.25, 783.99, 880.0],
    [587.33, 739.99, 880.0, 987.77],
    [440.0, 523.25, 659.25, 783.99],
    [523.25, 659.25, 880.0, 1046.5],
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startVinylWarmth();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private startVinylWarmth() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.04;
        b2 = 0.85 * b2 + white * 0.02;
        output[i] = (b0 + b1 + b2) * 0.08;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      const vinylGain = this.ctx.createGain();
      vinylGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(vinylGain);
      vinylGain.connect(this.masterGain);

      whiteNoise.start();
      this.vinylNode = whiteNoise;
    } catch {
      // Ignored if audio buffer creation is unsupported
    }
  }

  private playRhodesChord(chordIdx: number) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chord = this.chords[chordIdx % this.chords.length];

    // Bass note (sub sine)
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(chord.bass, now);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);

    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain);
    bassOsc.start(now);
    bassOsc.stop(now + 3.8);

    // Warm Rhodes Pad Chords
    chord.notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Tape wow & flutter (subtle vibrato LFO)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.4 + idx * 0.1, now);
      lfoGain.gain.setValueAtTime(1.8, now);
      lfo.connect(osc1.detune);
      lfo.connect(osc2.detune);
      lfo.start(now);
      lfo.stop(now + 4.0);

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.frequency.setValueAtTime(freq * 1.002, now); // soft chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 + idx * 40, now);
      filter.Q.setValueAtTime(1.1, now);

      const stagger = idx * 0.04;
      const noteStart = now + stagger;

      noteGain.gain.setValueAtTime(0.0001, noteStart);
      noteGain.gain.linearRampToValueAtTime(0.06, noteStart + 0.12);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 3.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc1.start(noteStart);
      osc2.start(noteStart);
      osc1.stop(noteStart + 3.6);
      osc2.stop(noteStart + 3.6);
    });

    // Gentle Kalimba / Music Box chime embellishments
    const melodyGroup = this.melodies[chordIdx % this.melodies.length];
    melodyGroup.forEach((mFreq, mIdx) => {
      if (!this.ctx || !this.masterGain) return;
      const chimeTime = now + 0.6 + mIdx * 0.65;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      const chimeFilter = this.ctx.createBiquadFilter();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(mFreq, chimeTime);

      chimeFilter.type = 'bandpass';
      chimeFilter.frequency.setValueAtTime(mFreq, chimeTime);
      chimeFilter.Q.setValueAtTime(3.0, chimeTime);

      chimeGain.gain.setValueAtTime(0.0001, chimeTime);
      chimeGain.gain.linearRampToValueAtTime(0.045, chimeTime + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 1.2);

      chimeOsc.connect(chimeFilter);
      chimeFilter.connect(chimeGain);
      chimeGain.connect(this.masterGain);

      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 1.3);
    });
  }

  public play() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    this.playRhodesChord(this.step);
    this.step++;

    // 3.4 second bar tempo for relaxed lo-fi feel
    this.timer = window.setInterval(() => {
      this.playRhodesChord(this.step);
      this.step++;
    }, 3400);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isPlaying = false;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const lofiPlayer = new LofiAudioPlayer();
