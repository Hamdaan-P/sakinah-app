/**
 * BranchView helpers — seeded RNG + cubic Bezier sampler.
 */

/** Seeded pseudo-random number generator (mulberry-ish LCG). */
export function sr(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/** Sample a single cubic Bezier control polygon at parameter t. */
export function cubicPt(p0: number, p1: number, p2: number, p3: number, t: number) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}
