// Small decorative details for the Poster hero: pixels drifting away from the data stream.
// Positions are generated once from a fixed seed so the layout is the same on every load.
const rand = (() => { let s = 20260; return () => ((s = (s * 16807) % 2147483647) / 2147483647) })()
const between = (a, b) => a + (b - a) * rand()
const round = n => Math.round(n * 10) / 10

export const PIXELS = Array.from({ length: 36 }, () => ({
  x: round(Math.pow(rand(), 1.9) * 56),
  y: round(between(4, 94)),
  s: [3, 3, 4, 4, 6][Math.floor(rand() * 5)],
  d: round(between(2, 5)),
  delay: round(between(0, 4)),
  hot: rand() < 0.22,
}))
