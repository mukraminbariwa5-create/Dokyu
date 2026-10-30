/** Haversine distance in kilometres (plan §5.4: computed server-side, coordinates never stored). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  );
}

export function sortByDistance<T extends { lat: number | null; lng: number | null }>(
  items: T[],
  from: { lat: number; lng: number },
): Array<T & { distanceKm: number | null }> {
  return items
    .map((it) => ({
      ...it,
      distanceKm:
        it.lat == null || it.lng == null
          ? null
          : Math.round(distanceKm(from, { lat: it.lat, lng: it.lng }) * 10) / 10,
    }))
    .sort((x, y) => (x.distanceKm ?? Infinity) - (y.distanceKm ?? Infinity));
}
