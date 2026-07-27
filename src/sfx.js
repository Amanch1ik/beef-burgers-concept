// Звуковой движок SMASH — всё синтезируется через Web Audio API, без файлов.
// Разлочивается по первому жесту пользователя (браузеры блокируют автозвук).
// Каждая функция обёрнута так, чтобы никогда не бросать исключение.

let ctx = null
let master = null
let muted = false
let noiseBuf = null

function ensure() {
  if (ctx) return ctx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
    // буфер белого шума для «мяса», «шипения», «вжуха»
    const len = ctx.sampleRate * 1.2
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = noiseBuf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  } catch { ctx = null }
  return ctx
}

// вызвать из первого клика/скролла — «будит» AudioContext
export function unlock() {
  const c = ensure()
  if (c && c.state === 'suspended') c.resume().catch(() => {})
}

export function setMuted(v) {
  muted = v
  if (master && ctx) master.gain.setTargetAtTime(v ? 0 : 0.9, ctx.currentTime, 0.02)
}
export function isMuted() { return muted }

function tone({ freq = 220, type = 'sine', dur = 0.18, gain = 0.5, glideTo = null, attack = 0.004 }) {
  const c = ensure(); if (!c || muted) return
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glideTo), t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t); osc.stop(t + dur + 0.02)
}

function noise({ dur = 0.2, gain = 0.4, type = 'lowpass', freq = 1200, q = 0.7, sweepTo = null }) {
  const c = ensure(); if (!c || muted || !noiseBuf) return
  const t = c.currentTime
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const filt = c.createBiquadFilter()
  filt.type = type
  filt.frequency.setValueAtTime(freq, t)
  filt.Q.value = q
  if (sweepTo) filt.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filt).connect(g).connect(master)
  src.start(t); src.stop(t + dur + 0.02)
}

// ── Библиотека звуков ──────────────────────────────────────────────────
// глухой «тумк» приземления слоя (butt/patty) — низкий тон + слой мяса-шума
export function thud(pitch = 1) {
  tone({ freq: 150 * pitch, type: 'sine', dur: 0.16, gain: 0.55, glideTo: 60 * pitch })
  noise({ dur: 0.12, gain: 0.28, type: 'lowpass', freq: 900, sweepTo: 200 })
}
// сочный «поп» лёгких слоёв (сыр/овощи)
export function pop(pitch = 1) {
  tone({ freq: 380 * pitch, type: 'triangle', dur: 0.12, gain: 0.4, glideTo: 180 * pitch })
}
// «вжух» — слой летит вниз
export function whoosh() {
  noise({ dur: 0.26, gain: 0.22, type: 'bandpass', freq: 1800, q: 0.8, sweepTo: 300 })
}
// тонкий тик на ховере
export function tick() {
  tone({ freq: 2100, type: 'square', dur: 0.03, gain: 0.12, attack: 0.001 })
}
// «чавк» — удовлетворяющий укус для CTA / add
export function chomp() {
  tone({ freq: 220, type: 'sawtooth', dur: 0.1, gain: 0.3, glideTo: 90 })
  noise({ dur: 0.14, gain: 0.35, type: 'lowpass', freq: 1400, sweepTo: 400 })
  setTimeout(() => tone({ freq: 320, type: 'triangle', dur: 0.09, gain: 0.25, glideTo: 160 }), 70)
}
// финальный «дзынь» — бургер собран
export function complete() {
  const notes = [523, 659, 784, 1046]
  notes.forEach((f, i) => setTimeout(() => tone({ freq: f, type: 'triangle', dur: 0.28, gain: 0.22 }), i * 70))
}
