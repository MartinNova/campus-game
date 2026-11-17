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

/**
 * Playtomic start page, for "Book a court" and clubs that are not in our list.
 * We don't link the Lisbon search (/search?q=Lisboa) directly: on 17.11.2026 it
 * often timed out and Safari then offered a download instead of the page.
 */
export const PLAYTOMIC_HOME = "https://playtomic.com/";

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

/** Playtomic page for a location name, or the start page if we don't know the club. */
export function playtomicUrlFor(location: string): string {
  return PADEL_CLUBS.find((c) => c.name === location)?.playtomicUrl ?? PLAYTOMIC_HOME;
}
