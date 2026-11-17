/**
 * Padel clubs in Lisbon that take bookings on Playtomic.
 *
 * We only link to Playtomic (no scraping, no unofficial API): the user books
 * the court there and then posts the match in our app. Slugs taken from
 * https://playtomic.com/search?q=Lisboa (checked 17.11.2026).
 */
export interface PadelClub {
  name: string;
  playtomicUrl: string;
}

/** Playtomic's club search for Lisbon, for clubs that are not in our list. */
export const PLAYTOMIC_LISBON_SEARCH = "https://playtomic.com/search?q=Lisboa";

const club = (name: string, slug: string): PadelClub => ({
  name,
  playtomicUrl: `https://playtomic.com/clubs/${slug}`,
});

export const PADEL_CLUBS: PadelClub[] = [
  club("Clube de Padel Alcântara", "clube-de-padel-alcantara"),
  club("Padel CIF", "padel-cif"),
  club("CIT Padel Amoreiras", "cit-padel-amoreiras"),
  club("GCP Padel & Ténis Amoreiras", "gcp-padel-tenis-amoreiras"),
  club("BoaHora Ténis & Padel", "boahora-tenis-padel"),
  club("LX Indoor Padel", "lx-indoor-padel"),
  club("Lambert Clube", "lambert-clube"),
  club("Lemonfit Padel Olaias", "lemonfit-padel-olaias"),
  club("Padel do Relógio", "padel-do-relogio"),
];

/** Playtomic page for a location name, or the Lisbon search if we don't know the club. */
export function playtomicUrlFor(location: string): string {
  return PADEL_CLUBS.find((c) => c.name === location)?.playtomicUrl ?? PLAYTOMIC_LISBON_SEARCH;
}
