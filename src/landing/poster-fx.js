// Small decorative details for the Poster hero: glowing streaks and pixels drifting away from the torn seam.
// Positions are generated once from a fixed seed so the layout is the same on every load.
const rand = (() => { let s = 20260; return () => ((s = (s * 16807) % 2147483647) / 2147483647) })()
const between = (a, b) => a + (b - a) * rand()
const round = n => Math.round(n * 10) / 10

export const STREAKS = Array.from({ length: 9 }, (_, i) => ({
  y: round(12 + i * 9.4 + between(-2.5, 2.5)),
  w: round(between(14, 46)),
  h: rand() < 0.3 ? 3 : 2,
  d: round(between(3.2, 6.4)),
  delay: round(between(0, 3)),
}))

export const PIXELS = Array.from({ length: 36 }, () => ({
  x: round(Math.pow(rand(), 1.9) * 56),
  y: round(between(4, 94)),
  s: [3, 3, 4, 4, 6][Math.floor(rand() * 5)],
  d: round(between(2, 5)),
  delay: round(between(0, 4)),
  hot: rand() < 0.22,
}))
