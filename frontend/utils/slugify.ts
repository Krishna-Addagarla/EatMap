export function getSpotSlug(name: string, area: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cleanArea = area.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${cleanName}-${cleanArea}`;
}
