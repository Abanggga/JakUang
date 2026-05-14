/**
 * Mask NPWP for display: 12.345.678.9-012.345 → 12.345.XXX.X-XXX.XXX
 */
export function maskNPWP(npwp: string): string {
  const clean = npwp.replace(/[^0-9]/g, "");
  if (clean.length < 15) return npwp;
  const visible = clean.slice(0, 5);
  return `${visible.slice(0, 2)}.${visible.slice(2, 5)}.XXX.X-XXX.XXX`;
}

/**
 * Format raw NPWP number with dots and dashes
 */
export function formatNPWP(npwp: string): string {
  const clean = npwp.replace(/[^0-9]/g, "");
  if (clean.length !== 15) return npwp;
  return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}.${clean.slice(8, 9)}-${clean.slice(9, 12)}.${clean.slice(12, 15)}`;
}
