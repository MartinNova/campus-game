import type { SurfSchool } from "@/types/surf";

/**
 * Surf schools near Lisbon, researched in November 2026 from public listings
 * (Time Out, Visit Portugal, Visit Cascais, ISIC, booking platforms).
 * Prices are indicative only. Check with the school before booking.
 * To add a school: append an entry with a unique id and an existing spotId.
 */
export const SURF_SCHOOLS: SurfSchool[] = [
  // Carcavelos
  {
    id: "carcavelos-surf-school",
    name: "Carcavelos Surf School",
    spotId: "carcavelos",
    description: "One of the oldest schools on the beach. Lessons, surf camps and kids programmes.",
    studentDiscount: "ISIC student discount",
    mapsQuery: "Carcavelos Surf School, Carcavelos",
  },
  {
    id: "wanted-surf-school",
    name: "Wanted Surf School",
    spotId: "carcavelos",
    description: "Lessons in Carcavelos and Guincho, equipment included.",
    priceInfo: "Group lessons from ~€45",
    mapsQuery: "Wanted Surf School, Carcavelos",
  },
  {
    id: "lisbon-surfaris",
    name: "Lisbon Surfaris",
    spotId: "carcavelos",
    description: "Lessons right on Praia de Carcavelos, by the Avenida Marginal.",
    priceInfo: "Lessons from ~€30",
    mapsQuery: "Lisbon Surfaris, Praia de Carcavelos",
  },

  // Costa da Caparica
  {
    id: "breakthrough-surf-school",
    name: "Breakthrough Surf School",
    spotId: "costa-da-caparica",
    description: "Group and private lessons in Portuguese and English. Meets at Muralha da Praia.",
    priceInfo: "Lessons from ~€40",
    mapsQuery: "Breakthrough Surf School, Costa da Caparica",
  },
  {
    id: "gecko-surf-school",
    name: "Gecko Surf School",
    spotId: "costa-da-caparica",
    description:
      "Accredited by the Portuguese Surfing Federation. Praia do Norte, sunset sessions.",
    mapsQuery: "Gecko Surf School, Costa da Caparica",
  },
  {
    id: "lufi-surf-school",
    name: "Lufi Surf School",
    spotId: "costa-da-caparica",
    description: "Recognised by the Surfing Federation and Turismo de Portugal. 10+ years running.",
    mapsQuery: "Lufi Surf School, Costa da Caparica",
  },

  // Guincho
  {
    id: "moana-surf-school",
    name: "Moana Surf School",
    spotId: "guincho",
    description: "Running since 2003, based right at Guincho beach.",
    mapsQuery: "Moana Surf School, Guincho",
  },
  {
    id: "surf-cascais",
    name: "Surf Cascais",
    spotId: "guincho",
    description:
      "School, camp and shop. Moves between Guincho and Carcavelos depending on conditions. Board rental.",
    mapsQuery: "Surf Cascais, Murches",
  },
  {
    id: "moby-dick-surf-school",
    name: "Moby Dick Surf School",
    spotId: "guincho",
    description: "Private lessons with beach pick-up, cheaper per person in small groups.",
    priceInfo: "Private lessons from ~€50 p.p.",
    mapsQuery: "Moby Dick Surf School, Cascais",
  },

  // Ericeira
  {
    id: "ericeira-waves-surf-school",
    name: "Ericeira Waves Surf School",
    spotId: "ericeira",
    description: "Certified school at Praia de Ribeira d'Ilhas.",
    mapsQuery: "Ericeira Waves Surf School, Ericeira",
  },
  {
    id: "pocean-surf-academy",
    name: "Pocean Surf Academy",
    spotId: "ericeira",
    description: "At Ribeira d'Ilhas beach, about 2 km north of Ericeira.",
    mapsQuery: "Pocean Surf Academy, Ericeira",
  },
  {
    id: "boardculture-surf-school",
    name: "Boardculture Surf School",
    spotId: "ericeira",
    description: "Founded in 2012, next to the main entrance of Ericeira Camping.",
    mapsQuery: "Boardculture Surf School, Ericeira",
  },
];
