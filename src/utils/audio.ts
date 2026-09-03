// Procedural Web Audio — singleton, never duplicate AudioContext in render.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let humNodes: { osc: OscillatorNode; gain: GainNode } | null = null;
let humPlaying = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)({
      latencyHint: "interactive",
    });
    master = ctx.createGain();
    master.gain.value = 0.11;
    master.connect(ctx.destination);
  }
  return ctx;
}

export async function ensureAudio(): Promise<AudioContext> {
  const c = getCtx();
  if (c.state === "suspended" || (c.state as unknown as string) === "interrupted") {
    await c.resume().catch(() => {});
  }
  return c;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, sweep?: number) {
  const c = getCtx();
  if (!master) return;
  if (c.state !== "running") void ensureAudio();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  if (sweep) {
    o.frequency.exponentialRampToValueAtTime(sweep, c.currentTime + dur * 0.6);
  }
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g).connect(master);
  o.start();
  o.stop(c.currentTime + dur + 0.02);
}

export function playInspectionPulse() {
  tone(880, 0.14, "sine", 0.16);
  setTimeout(() => tone(1320, 0.08, "sine", 0.08), 60);
}

export function playPistonClank() {
  tone(140, 0.22, "square", 0.18, 80);
  setTimeout(() => tone(340, 0.09, "square", 0.1), 50);
}

export function playPneumaticHiss() {
  const c = getCtx();
  if (!master) return;
  const bufferSize = Math.floor(c.sampleRate * 0.18);
  const buf = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = 1600;
  filt.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = 0.12;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  src.connect(filt).connect(g).connect(master);
  src.start();
}

export function playOverwrite() {
  tone(240, 0.18, "triangle", 0.14, 120);
}

export function playCompletionChime() {
  const seq = [523, 659, 784, 1046];
  seq.forEach((f, i) => setTimeout(() => tone(f, 0.5, "sine", 0.12), i * 90));
}

export function playConveyorHum() {
  if (humPlaying) return;
  const c = getCtx();
  if (!master || c.state !== "running") return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = 38;
  g.gain.value = 0.0;
  g.gain.linearRampToValueAtTime(0.03, c.currentTime + 0.8);
  o.connect(g).connect(master);
  o.start();
  humNodes = { osc: o, gain: g };
  humPlaying = true;
}

export function stopConveyorHum() {
  if (!humNodes || !ctx) return;
  const { osc, gain } = humNodes;
  try {
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    setTimeout(() => {
      try { osc.stop(); } catch { /* ignore */ }
    }, 500);
  } catch { /* ignore */ }
  humNodes = null;
  humPlaying = false;
}

export function setMuted(muted: boolean) {
  if (!master || !ctx) return;
  master.gain.linearRampToValueAtTime(muted ? 0.001 : 0.11, ctx.currentTime + 0.2);
}

export function isAudioRunning(): boolean {
  return ctx?.state === "running";
}
