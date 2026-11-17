import type { RunClub } from "@/types/running";

/**
 * Run clubs in Lisbon, compiled in November 2026 from public listings
 * (club Instagram, ma.to, 3cket, lu.ma, portugal.com guide).
 * Clubs change their days and times often, so always check the club's own page
 * before you go. The Nova Running Club schedule (Mondays 19:30, Cais do Sodré)
 * was given by our team; its Instagram page could not be read automatically.
 *
 * To add a club: append an entry with a unique id. Only clubs with a fixed
 * weekday and time get `weeklyRuns`; those also appear in the run calendar.
 */
export const RUN_CLUBS: RunClub[] = [
  {
    id: "nova-running-club",
    name: "Nova Running Club",
    description: "The running club of the Nova SBE community.",
    schedule: "Mondays, 19:30",
    meetingPoint: "Cais do Sodré",
    links: [{ label: "Instagram", url: "https://www.instagram.com/nova.running.club/" }],
    weeklyRuns: [{ weekday: 1, time: "19:30" }],
  },
  {
    id: "lisbon-running-community",
    name: "Lisbon Running Community",
    description:
      "Free social run along the river. Runners often choose between a short and a longer route.",
    schedule: "Tuesdays, 19:00",
    meetingPoint: "Cais do Sodré ferry terminal",
    distance: "4 or 6 km",
    links: [
      {
        label: "Guide with details",
        url: "https://www.portugal.com/activities-experiences/5-best-spots-to-get-your-run-on-in-lisbon-and-how-to-find-new-running-friends",
      },
    ],
    weeklyRuns: [
      {
        weekday: 2,
        time: "19:00",
        note: "Short or long route, ending near the 25 de Abril Bridge.",
      },
    ],
  },
  {
    id: "rookie-run-club",
    name: "Rookie Run Club Lisbon",
    description: "Inclusive social run club. Everyone is welcome, the group splits by pace.",
    schedule: "Wednesday evenings and Saturday mornings",
    meetingPoint: "Cais do Sodré",
    distance: "5 km, flat",
    links: [{ label: "Event page", url: "https://ma.to/venue/rookierunclub_pt" }],
  },
  {
    id: "founders-running-club",
    name: "Founders Running Club",
    description: "Easy runs and networking, followed by coffee together.",
    schedule: "Weekly, mostly Saturday mornings (time varies)",
    meetingPoint: "Praça do Comércio, at the statue",
    distance: "Easy 5 km (sometimes 10 km)",
    links: [{ label: "Event page", url: "https://lu.ma/frc-lisbon" }],
  },
  {
    id: "ell-running-club",
    name: "ELL Running Club (Erasmus Life Lisboa)",
    description:
      "Short runs for all fitness levels, organised for Erasmus and international students.",
    schedule: "Mondays, evening (18:00 or 18:30, varies)",
    meetingPoint: "Jardim Roque Gameiro, near Cais do Sodré",
    distance: "3.5 to 5 km",
    links: [{ label: "Tickets and dates", url: "https://3cket.com/ca/event/ell-running-club" }],
  },
];

/** Meeting points offered in the "post your run" form. */
export const RUN_MEETING_POINTS: string[] = [
  "Cais do Sodré (ferry terminal)",
  "Praça do Comércio",
  "Belém Tower",
  "Parque Eduardo VII",
  "Nova SBE campus, Carcavelos",
  "Carcavelos beach promenade",
];

export function getRunClub(id: string | undefined): RunClub | undefined {
  return RUN_CLUBS.find((club) => club.id === id);
}
