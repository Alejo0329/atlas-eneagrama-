export class HarmonicSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscFundamental: OscillatorNode | null = null;
  private oscOctave: OscillatorNode | null = null;
  private oscFifth: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying = false;
  private currentFreq = 432;
  private currentVolume = 0.25;

  public start(frequencyHz: number, volume = 0.25): void {
    this.currentFreq = frequencyHz;
    this.currentVolume = Math.max(0, Math.min(1, volume));

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    if (this.isPlaying) {
      this.setFrequency(frequencyHz);
      this.setVolume(volume);
      return;
    }

    const now = this.ctx.currentTime;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.currentVolume * 0.35),
      now + 1.2,
    );
    this.masterGain.connect(this.ctx.destination);

    // Fundamental pure sine tone (e.g. 432 Hz)
    this.oscFundamental = this.ctx.createOscillator();
    this.oscFundamental.type = 'sine';
    this.oscFundamental.frequency.setValueAtTime(frequencyHz, now);
    const fundamentalGain = this.ctx.createGain();
    fundamentalGain.gain.setValueAtTime(0.75, now);
    this.oscFundamental.connect(fundamentalGain);
    fundamentalGain.connect(this.masterGain);

    // Subtle fifth harmonic (1.5x) for warm meditative resonance
    this.oscFifth = this.ctx.createOscillator();
    this.oscFifth.type = 'sine';
    this.oscFifth.frequency.setValueAtTime(frequencyHz * 1.5, now);
    const fifthGain = this.ctx.createGain();
    fifthGain.gain.setValueAtTime(0.09, now);
    this.oscFifth.connect(fifthGain);
    fifthGain.connect(this.masterGain);

    // Soft upper octave (2x)
    this.oscOctave = this.ctx.createOscillator();
    this.oscOctave.type = 'sine';
    this.oscOctave.frequency.setValueAtTime(frequencyHz * 2, now);
    const octaveGain = this.ctx.createGain();
    octaveGain.gain.setValueAtTime(0.06, now);
    this.oscOctave.connect(octaveGain);
    octaveGain.connect(this.masterGain);

    // Slow organic breathing LFO (0.12 Hz subtle swell)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.setValueAtTime(0.12, now);
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(0.04, now);
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(fundamentalGain.gain);

    this.oscFundamental.start(now);
    this.oscFifth.start(now);
    this.oscOctave.start(now);
    this.lfo.start(now);
    this.isPlaying = true;
  }

  public setFrequency(frequencyHz: number): void {
    this.currentFreq = frequencyHz;
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    this.oscFundamental?.frequency.setTargetAtTime(frequencyHz, now, 0.15);
    this.oscFifth?.frequency.setTargetAtTime(frequencyHz * 1.5, now, 0.15);
    this.oscOctave?.frequency.setTargetAtTime(frequencyHz * 2, now, 0.15);
  }

  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(
      Math.max(0.0001, this.currentVolume * 0.35),
      now,
      0.1,
    );
  }

  public stop(): void {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    const gain = this.masterGain;
    const oscs = [this.oscFundamental, this.oscFifth, this.oscOctave, this.lfo];

    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    }

    setTimeout(() => {
      for (const osc of oscs) {
        try {
          osc?.stop();
          osc?.disconnect();
        } catch {
          // Ignore already stopped oscillators
        }
      }
      gain?.disconnect();
    }, 600);

    this.oscFundamental = null;
    this.oscFifth = null;
    this.oscOctave = null;
    this.lfo = null;
    this.lfoGain = null;
    this.masterGain = null;
    this.isPlaying = false;
  }

  public dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
