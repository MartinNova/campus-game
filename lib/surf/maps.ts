/**
 * Builds an official Google Maps search link (no API key needed).
 * Opens Google Maps in the browser, or the Maps app on phones.
 * Docs: https://developers.google.com/maps/documentation/urls/get-started
 */
export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
