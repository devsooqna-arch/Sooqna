type ListingMapLocation = {
  city?: string | null;
  area?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

function toFiniteCoordinate(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildGoogleMapsHref(location: ListingMapLocation): string | null {
  const latitude = toFiniteCoordinate(location.latitude);
  const longitude = toFiniteCoordinate(location.longitude);

  if (latitude !== null && longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }

  const address = [location.area, location.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
