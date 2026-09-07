/**
 * Synthesize a clean, pleasant ascending chime (Ding!) using Web Audio API.
 * Doesn't require any external audio files, works offline in PWA, and has zero latency.
 */
export function playOrderReadySound() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);

    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.6);

    // Tone 2: 880 Hz (A5) slightly delayed for a bright "Ding-Dong!"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (err) {
    // AudioContext may be restricted before user interaction; fail silently
    console.warn("Could not play notification sound:", err);
  }
}
