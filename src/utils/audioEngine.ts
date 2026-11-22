import { audioSettings } from '../config/presentation.config';

/**
 * Original, procedurally synthesised sound design (Web Audio API).
 * No files, no network — works fully offline. Muted until the presenter
 * enables sound, which also satisfies browser autoplay rules.
 * Phase 5 can layer recorded assets from public/assets/audio on top.
 */

export type Sfx = 'impact' | 'tick' | 'glitch' | 'whoosh' | 'rise' | 'reveal';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private droneBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private droneStarted = false;
  enabled = false;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      const ctx = new AC();
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);
      this.sfxBus = ctx.createGain();
      this.sfxBus.gain.value = audioSettings.effectsVolume;
      this.sfxBus.connect(this.master);
      this.droneBus = ctx.createGain();
      this.droneBus.gain.value = audioSettings.ambientVolume * 0.25;
      this.droneBus.connect(this.master);
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
      this.startDrone();
      this.master.gain.setTargetAtTime(audioSettings.masterVolume, now, 0.4);
    } else {
      this.master.gain.setTargetAtTime(0, now, 0.12);
    }
  }

  private startDrone() {
    const ctx = this.ctx;
    if (!ctx || !this.droneBus || this.droneStarted) return;
    this.droneStarted = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 380;
    filter.Q.value = 0.8;
    filter.connect(this.droneBus);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    (
      [
        ['triangle', 55, 0, 0.9],
        ['sawtooth', 82.41, 6, 0.35],
        ['sine', 110, -4, 0.5],
      ] as const
    ).forEach(([type, freq, detune, level]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detune;
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start();
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

  play(name: Sfx) {
    if (!this.enabled || !this.ctx || !this.sfxBus || this.ctx.state !== 'running') return;
    const ctx = this.ctx;
    const out = this.sfxBus;
    const t = ctx.currentTime + 0.01;
    try {
      switch (name) {
        case 'impact': {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(120, t);
          osc.frequency.exponentialRampToValueAtTime(36, t + 0.7);
          this.env(g, t, 0.9, 0.01, 1.2);
          osc.connect(g).connect(out);
          osc.start(t);
          osc.stop(t + 1.4);
          const n = this.noiseSource();
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 900;
          const ng = ctx.createGain();
          this.env(ng, t, 0.35, 0.005, 0.25);
          n.connect(lp).connect(ng).connect(out);
          n.start(t);
          n.stop(t + 0.4);
          break;
        }
        case 'tick': {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = 1800;
          this.env(g, t, 0.05, 0.002, 0.045);
          osc.connect(g).connect(out);
          osc.start(t);
          osc.stop(t + 0.08);
          break;
        }
        case 'glitch': {
          [0, 0.07, 0.15].forEach((offset, i) => {
            const n = this.noiseSource();
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 1800 + i * 900;
            bp.Q.value = 4;
            const g = ctx.createGain();
            this.env(g, t + offset, 0.28, 0.003, 0.04);
            n.connect(bp).connect(g).connect(out);
            n.start(t + offset);
            n.stop(t + offset + 0.08);
          });
          break;
        }
        case 'whoosh': {
          const dur = 2.6;
          const n = this.noiseSource(true);
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.Q.value = 1.1;
          bp.frequency.setValueAtTime(220, t);
          bp.frequency.exponentialRampToValueAtTime(3200, t + dur * 0.7);
          bp.frequency.exponentialRampToValueAtTime(600, t + dur);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.65);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          n.connect(bp).connect(g).connect(out);
          n.start(t);
          n.stop(t + dur + 0.05);
          break;
        }
        case 'rise': {
          const dur = 2.2;
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(70, t);
          osc.frequency.exponentialRampToValueAtTime(280, t + dur);
          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(300, t);
          lp.frequency.exponentialRampToValueAtTime(2400, t + dur);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.9);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.15);
          osc.connect(lp).connect(g).connect(out);
          osc.start(t);
          osc.stop(t + dur + 0.2);
          break;
        }
        case 'reveal': {
          [220, 277.18, 329.63, 440, 554.37].forEach((freq) => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            this.env(g, t, 0.07, 1.2, 4);
            osc.connect(g).connect(out);
            osc.start(t);
            osc.stop(t + 5.4);
          });
          break;
        }
      }
    } catch {
      /* audio is decorative; never break the show */
    }
  }
}

export const audioEngine = new AudioEngine();
