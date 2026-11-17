import {
  CalendarDays,
  Dumbbell,
  Flower2,
  Footprints,
  Home,
  School,
  Trophy,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** "live" = usable, "soon" = placeholder page only. */
export type ModuleStatus = "live" | "soon";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  status: ModuleStatus;
  /** Other routes that should highlight this tab, e.g. "/canteen" for Campus. */
  alsoActiveFor?: string[];
}

export interface SubModule extends NavItem {
  description: string;
  /** Git branch where this module is being built (see CONTRIBUTING.md). */
  branch: string;
}

/**
 * Bottom navigation. Single source of truth: add a new module here
 * and it appears in the nav and on the home page.
 */
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Home", icon: Home, status: "live" },
  { href: "/sport", label: "Sport", icon: Trophy, status: "live" },
  { href: "/timetable", label: "Timetable", icon: CalendarDays, status: "soon" },
  { href: "/friends", label: "Friends", icon: Users, status: "soon" },
  // Campus bundles library, study rooms, map and Food Options (/canteen stays its own page).
  {
    href: "/campus",
    label: "Campus",
    icon: School,
    status: "live",
    alsoActiveFor: ["/canteen"],
  },
];

/** Sub-modules of the Sport module. Flip `status` to "live" when a feature is merged. */
export const SPORT_MODULES: SubModule[] = [
  {
    href: "/sport/padel",
    label: "Padel",
    description: "Find players and join open padel matches.",
    icon: Trophy,
    status: "live",
    branch: "feature/padel",
  },
  {
    href: "/sport/surf",
    label: "Surf",
    description: "3-day forecast and surf schools near Lisbon.",
    icon: Waves,
    status: "live",
    branch: "feature/surf",
  },
  {
    href: "/sport/gym",
    label: "Gym",
    description: "Viva Gym on campus: opening hours and live occupancy (simulated).",
    icon: Dumbbell,
    status: "live",
    branch: "feature/gym",
  },
  {
    href: "/sport/yoga",
    label: "Yoga",
    description: "Yoga classes on campus by Nova MindSpace.",
    icon: Flower2,
    status: "live",
    branch: "feature/yoga",
  },
  {
    href: "/sport/running",
    label: "Running",
    description: "Join Lisbon run clubs or post your own run.",
    icon: Footprints,
    status: "live",
    branch: "feature/running",
  },
];

/** True if `pathname` belongs to the nav item (so /sport/surf highlights "Sport"). */
export function isActive(pathname: string, href: string, alsoActiveFor: string[] = []): boolean {
  if (href === "/") return pathname === "/";
  return [href, ...alsoActiveFor].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
