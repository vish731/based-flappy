class SoundEngineClass {
  constructor() {
    this.ctx = null
    this.enabled = true
    this.masterVolume = 0.3
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {}
  }

  ensureContext() {
    if (!this.ctx) this.init()
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume()
  }

  play(type) {
    if (!this.enabled) return
    this.ensureContext()
    if (!this.ctx) return
    switch (type) {
      case 'flap':    this._osc(400, 'sine', 0.1, 0.25, 600, 0.08); break
      case 'score':   this._osc(880, 'sine', 0.15, 0.2); setTimeout(() => this._osc(1100, 'sine', 0.2, 0.2), 80); break
      case 'death':   this._osc(300, 'sawtooth', 0.3, 0.2, 80, 0.3); break
      case 'click':   this._osc(600, 'sine', 0.06, 0.15); break
      case 'success': this._osc(523, 'sine', 0.12, 0.2); setTimeout(() => this._osc(659, 'sine', 0.12, 0.2), 100); setTimeout(() => this._osc(784, 'sine', 0.2, 0.2), 200); break
    }
  }

  _osc(f, t, d, v, ef, ed) {
    if (!this.ctx) return
    try {
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = t
      o.frequency.setValueAtTime(f, this.ctx.currentTime)
      if (ef) o.frequency.exponentialRampToValueAtTime(ef, this.ctx.currentTime + (ed || d))
      g.gain.setValueAtTime(v * this.masterVolume, this.ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + d)
      o.connect(g)
      g.connect(this.ctx.destination)
      o.start()
      o.stop(this.ctx.currentTime + d)
    } catch (e) {}
  }

  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }
}

export const SoundEngine = new SoundEngineClass()

