import { audioSettings } from '../config/presentation.config';

/**
 * Original, procedurally synthesised sound design (Web Audio API).
 * No files, no network — works fully offline. Muted until the presenter
 * enables sound (start screen or M), which also satisfies browser autoplay rules.
 *
 * Voiced for laptop speakers and projectors: those cannot reproduce much
 * below ~150 Hz, so every effect carries its energy in the mid range, with
 * sub-bass only as an extra for proper speakers. A compressor on the master
 * keeps everything loud enough to hear but never harsh.
 */

export type Sfx =
  | 'impact'
  | 'tick'
  | 'glitch'
  | 'whoosh'
  | 'rise'
  | 'reveal'
  | 'pop'
  | 'alert'
  | 'confirm'
  | 'scratch'
  | 'ding'
  | 'drumroll';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private padBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private padStarted = false;
  enabled = false;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      const ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;
      comp.connect(ctx.destination);
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(comp);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = audioSettings.effectsVolume;
      this.sfxBus.connect(this.master);
      this.padBus = ctx.createGain();
      this.padBus.gain.value = audioSettings.ambientVolume * 0.5;
      this.padBus.connect(this.master);
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
      this.ctx = ctx;
      return ctx;
    } catch (error) {
      console.warn('[Businessverse] Audio unavailable.', error);
      return null;
    }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    if (on) {
      void ctx.resume();
      this.startPad();
      this.master.gain.setTargetAtTime(audioSettings.masterVolume, now, 0.3);
    } else {
      this.master.gain.setTargetAtTime(0, now, 0.1);
    }
  }

  /** A slow, airy ambient pad (A minor add9) — audible on small speakers, quiet under a voice. */
  private startPad() {
    const ctx = this.ctx;
    if (!ctx || !this.padBus || this.padStarted) return;
    this.padStarted = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.Q.value = 0.6;
    filter.connect(this.padBus);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    (
      [
        ['triangle', 110, 0, 0.32],
        ['sawtooth', 164.81, 5, 0.1],
        ['triangle', 220, -4, 0.26],
        ['sine', 261.63, 3, 0.2],
        ['sine', 329.63, -6, 0.14],
        ['sine', 493.88, 4, 0.06],
      ] as const
    ).forEach(([type, freq, detune, level], i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      // Each voice breathes at its own slow rate so the pad never sounds static.
      const swell = ctx.createOscillator();
      const swellGain = ctx.createGain();
      swell.frequency.value = 0.05 + i * 0.013;
      swellGain.gain.value = level * 0.35;
      swell.connect(swellGain).connect(g.gain);
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start();
      swell.start();
    });
  }

  private env(gain: GainNode, t: number, peak: number, attack: number, release: number) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  }

  private noiseSource(loop = false) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = loop;
    return src;
  }

  private tone(type: OscillatorType, from: number, to: number, t: number, peak: number, attack: number, release: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + attack + release * 0.6);
    this.env(g, t, peak, attack, release);
    osc.connect(g).connect(this.sfxBus!);
    osc.start(t);
    osc.stop(t + attack + release + 0.05);
  }

  private burst(t: number, type: BiquadFilterType, freq: number, q: number, peak: number, release: number) {
    const ctx = this.ctx!;
    const n = this.noiseSource();
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    this.env(g, t, peak, 0.004, release);
    n.connect(f).connect(g).connect(this.sfxBus!);
    n.start(t);
    n.stop(t + release + 0.05);
  }

  play(name: Sfx) {
    if (!this.enabled || !this.ctx || !this.sfxBus || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const out = this.sfxBus;
    const t = ctx.currentTime + 0.01;
    try {
      switch (name) {
        case 'impact': {
          // Cinematic hit: mid-range body + bright transient, with sub-bass for real speakers.
          this.tone('triangle', 260, 90, t, 0.7, 0.005, 0.5);
          this.tone('sine', 110, 45, t, 0.6, 0.005, 0.9);
          this.burst(t, 'bandpass', 1800, 0.8, 0.5, 0.12);
          this.burst(t, 'lowpass', 1200, 0.7, 0.45, 0.35);
          break;
        }
        case 'tick': {
          this.tone('sine', 1500, 1500, t, 0.22, 0.002, 0.06);
          this.burst(t, 'highpass', 4000, 0.7, 0.12, 0.025);
          break;
        }
        case 'pop': {
          // A world arriving: a bright, round blip.
          this.tone('sine', 520, 980, t, 0.4, 0.004, 0.22);
          this.tone('triangle', 1040, 1560, t + 0.03, 0.14, 0.004, 0.18);
          break;
        }
        case 'glitch': {
          [0, 0.06, 0.13, 0.17].forEach((offset, i) => this.burst(t + offset, 'bandpass', 1400 + i * 900, 3, 0.4, 0.035));
          this.tone('square', 880, 440, t, 0.06, 0.002, 0.15);
          break;
        }
        case 'whoosh': {
          const dur = 1.9;
          const n = this.noiseSource(true);
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.Q.value = 1.4;
          bp.frequency.setValueAtTime(400, t);
          bp.frequency.exponentialRampToValueAtTime(4200, t + dur * 0.65);
          bp.frequency.exponentialRampToValueAtTime(900, t + dur);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.75, t + dur * 0.6);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          n.connect(bp).connect(g).connect(out);
          n.start(t);
          n.stop(t + dur + 0.05);
          break;
        }
        case 'rise': {
          const dur = 2;
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(600, t + dur);
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(500, t);
          lp.frequency.exponentialRampToValueAtTime(4000, t + dur);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.28, t + dur * 0.9);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
          osc.connect(lp).connect(g).connect(out);
          osc.start(t);
          osc.stop(t + dur + 0.2);
          break;
        }
        case 'alert': {
          // Breaking-news sting: two urgent two-tone beeps.
          [0, 0.32].forEach((o) => {
            this.tone('square', 988, 988, t + o, 0.16, 0.005, 0.13);
            this.tone('square', 740, 740, t + o + 0.15, 0.16, 0.005, 0.13);
          });
          this.burst(t, 'bandpass', 2500, 1, 0.2, 0.08);
          break;
        }
        case 'confirm': {
          // Decision locked in: a confident rising pair.
          this.tone('triangle', 523.25, 523.25, t, 0.35, 0.005, 0.18);
          this.tone('triangle', 783.99, 783.99, t + 0.11, 0.4, 0.005, 0.35);
          this.tone('sine', 1567.98, 1567.98, t + 0.11, 0.08, 0.005, 0.3);
          break;
        }
        case 'ding': {
          // Answer reveal: a bright bell.
          this.tone('sine', 1318.5, 1318.5, t, 0.32, 0.003, 0.9);
          this.tone('sine', 2637, 2637, t, 0.08, 0.003, 0.5);
          break;
        }
        case 'scratch': {
          // Record scratch for the interruption.
          const n = this.noiseSource();
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.Q.value = 6;
          bp.frequency.setValueAtTime(2600, t);
          bp.frequency.exponentialRampToValueAtTime(500, t + 0.18);
          bp.frequency.exponentialRampToValueAtTime(1800, t + 0.32);
          const g = ctx.createGain();
          this.env(g, t, 0.9, 0.01, 0.34);
          n.connect(bp).connect(g).connect(out);
          n.start(t);
          n.stop(t + 0.4);
          break;
        }
        case 'drumroll': {
          // Suspense before a reveal: quickening snare taps.
          let at = 0;
          for (let i = 0; i < 18; i++) {
            this.burst(t + at, 'bandpass', 1800, 1.2, 0.18 + i * 0.012, 0.05);
            at += Math.max(0.045, 0.11 - i * 0.004);
          }
          break;
        }
        case 'reveal': {
          [220, 277.18, 329.63, 440, 554.37, 659.25].forEach((freq, i) =>
            this.tone('sine', freq, freq, t + i * 0.06, 0.13, 0.9, 3.6),
          );
          this.burst(t, 'highpass', 6000, 0.5, 0.08, 1.4);
          break;
        }
      }
    } catch {
      /* audio is decorative; never break the show */
    }
  }
}

export const audioEngine = new AudioEngine();
