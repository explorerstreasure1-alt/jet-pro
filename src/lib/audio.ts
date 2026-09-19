let ctx: AudioContext | null = null;
let sfxOn = true;

export function setSfx(on: boolean) {
  sfxOn = on;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export async function resumeAudio() {
  const audio = ac();
  if (audio && audio.state === "suspended") await audio.resume().catch(() => undefined);
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.05, slide?: number) {
  if (!sfxOn) return;
  const audio = ac();
  if (!audio) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, audio.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), audio.currentTime + dur);
  g.gain.setValueAtTime(gain, audio.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
  o.connect(g);
  g.connect(audio.destination);
  o.start();
  o.stop(audio.currentTime + dur + 0.02);
}

export function sfxLaser() {
  beep(920, 0.12, "square", 0.04, 180);
}

export function sfxHit() {
  beep(240, 0.18, "sawtooth", 0.05, 60);
  beep(520, 0.1, "triangle", 0.03);
}

export function sfxMiss() {
  beep(140, 0.22, "square", 0.05, 70);
}

export function sfxCombo(n: number) {
  beep(440 + n * 40, 0.08, "triangle", 0.04);
}

export function sfxMilestone() {
  beep(523, 0.09, "triangle", 0.05);
  window.setTimeout(() => beep(784, 0.09, "triangle", 0.05), 80);
  window.setTimeout(() => beep(1046, 0.16, "triangle", 0.05), 160);
}

export function sfxUi() {
  beep(660, 0.05, "sine", 0.03);
}

export function sfxCoin() {
  beep(880, 0.07, "sine", 0.05);
  window.setTimeout(() => beep(1318, 0.14, "sine", 0.05), 60);
}

export function sfxShield() {
  beep(180, 0.25, "sine", 0.07, 90);
  beep(720, 0.12, "triangle", 0.03);
}

export function sfxFreeze() {
  beep(1400, 0.5, "sine", 0.05, 240);
}

export function sfxLowHp() {
  beep(220, 0.12, "sawtooth", 0.05);
  window.setTimeout(() => beep(220, 0.12, "sawtooth", 0.05), 150);
}

export function sfxWin() {
  beep(523, 0.12, "triangle", 0.05);
  window.setTimeout(() => beep(659, 0.12, "triangle", 0.05), 90);
  window.setTimeout(() => beep(784, 0.2, "triangle", 0.05), 180);
}

export function sfxLose() {
  beep(220, 0.3, "sawtooth", 0.05, 80);
}

/* ---------------- procedural background music ---------------- */

type MusicKind = "menu" | "combat";

let musicGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicKind: MusicKind = "menu";
let musicOn = false;
let nextNoteTime = 0;
let step16 = 0;

const TEMPO = 102;
const STEP_DUR = 60 / TEMPO / 4;

// A-minor dark ambient progression
const BASS: number[] = [55, 0, 55, 0, 55, 0, 65.41, 0, 49, 0, 49, 0, 73.42, 0, 82.41, 0];
const ARP = [440, 523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25];
const CHORDS: number[][] = [
  [220, 261.63, 329.63, 392],
  [174.61, 220, 261.63, 349.23],
  [261.63, 329.63, 392, 493.88],
  [196, 246.94, 293.66, 392],
];

function mnote(type: OscillatorType, freq: number, t: number, dur: number, gain: number) {
  const audio = ctx;
  if (!audio || !musicGain) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.025);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(musicGain);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function mhat(t: number) {
  const audio = ctx;
  if (!audio || !musicGain) return;
  const len = 0.04;
  const buf = audio.createBuffer(1, Math.floor(audio.sampleRate * len), audio.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = audio.createBufferSource();
  src.buffer = buf;
  const f = audio.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 6500;
  const g = audio.createGain();
  g.gain.value = 0.07;
  src.connect(f);
  f.connect(g);
  g.connect(musicGain);
  src.start(t);
}

function scheduleStep(t: number, i: number) {
  const b = BASS[i % 16];
  if (b) mnote("triangle", b, t, STEP_DUR * 1.8, musicKind === "combat" ? 0.11 : 0.08);
  if (musicKind === "combat") {
    const a = ARP[i % ARP.length];
    if (i % 2 === 0) mnote("square", a, t, STEP_DUR * 0.85, 0.028);
    if (i % 4 === 2) mhat(t);
    if (i % 8 === 0) mnote("sine", a / 2, t, STEP_DUR * 3, 0.05);
  } else {
    if (i % 8 === 0) mnote("sine", ARP[(i / 8) % ARP.length], t, STEP_DUR * 5, 0.045);
  }
  if (i % 16 === 0) {
    const chord = CHORDS[(i / 16) % CHORDS.length]!;
    for (const f of chord) mnote("sine", f, t, STEP_DUR * 15, 0.024);
  }
}

function tick() {
  const audio = ctx;
  if (!audio || !musicOn) return;
  if (audio.state !== "running") {
    nextNoteTime = 0;
    return;
  }
  if (!nextNoteTime) nextNoteTime = audio.currentTime + 0.06;
  while (nextNoteTime < audio.currentTime + 0.2) {
    scheduleStep(nextNoteTime, step16);
    nextNoteTime += STEP_DUR;
    step16 = (step16 + 1) % 64;
  }
}

export function startMusic(kind: MusicKind) {
  const audio = ac();
  if (!audio) return;
  musicKind = kind;
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  if (!musicGain) {
    musicGain = audio.createGain();
    musicGain.gain.value = 0.5;
    musicGain.connect(audio.destination);
  }
  musicGain.gain.setTargetAtTime(0.5, audio.currentTime, 0.15);
  if (audio.state === "suspended") void audio.resume().catch(() => undefined);
  nextNoteTime = 0;
  step16 = 0;
  musicOn = true;
  musicTimer = window.setInterval(tick, 40);
}

export function stopMusic() {
  musicOn = false;
  if (musicTimer) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  if (musicGain && ctx) musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
}

export function pauseMusic() {
  if (musicGain && ctx) musicGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
}

export function resumeMusic() {
  if (musicOn && musicGain && ctx) musicGain.gain.setTargetAtTime(0.5, ctx.currentTime, 0.12);
}

export function setMusic(on: boolean) {
  if (on) startMusic(musicKind);
  else stopMusic();
}
