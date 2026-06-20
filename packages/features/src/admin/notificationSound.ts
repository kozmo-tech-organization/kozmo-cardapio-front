export function playNotificationBell() {
  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    function ding(freq: number, startAt: number, duration: number, volume: number) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startAt)

      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(volume, startAt + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startAt)
      osc.stop(startAt + duration)
    }

    // Ding-dong: two notes
    ding(1318, now, 0.6, 0.35)        // E6 — first note
    ding(1047, now + 0.25, 0.8, 0.3)  // C6 — second note (lower)

    // Harmonic overtones for bell texture
    ding(2637, now, 0.3, 0.12)        // E7
    ding(2093, now + 0.25, 0.4, 0.1)  // C7

    setTimeout(() => ctx.close(), 1500)
  } catch {
    // AudioContext not available or user hasn't interacted with the page yet
  }
}
