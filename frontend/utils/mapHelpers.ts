export function getZoomScale(zoomLevel: number): number {
  const s = 1 + (zoomLevel - 12) * 0.08;
  return Math.max(0.5, s);
}
