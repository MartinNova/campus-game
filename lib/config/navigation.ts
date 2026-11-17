import {
  CalendarDays,
  Dumbbell,
  Home,
  Trophy,
  UtensilsCrossed,
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
  { href: "/canteen", label: "Canteen", icon: UtensilsCrossed, status: "soon" },
];

/** Sub-modules of the Sport module. Flip `status` to "live" when a feature is merged. */
export const SPORT_MODULES: SubModule[] = [
  {
    href: "/sport/padel",
    label: "Padel",
    description: "Find players and join open padel matches.",
    icon: Trophy,
    status: "soon",
    branch: "feature/padel",
  },
  {
    href: "/sport/surf",
    label: "Surf",
    description: "3-day wave and wind forecast for spots near Lisbon.",
    icon: Waves,
    status: "live",
    branch: "feature/surf",
  },
  {
    href: "/sport/gym",
    label: "Gym",
    description: "Gym locations, opening hours and classes (placeholder).",
    icon: Dumbbell,
    status: "soon",
    branch: "feature/gym",
  },
];

/** True if `pathname` belongs to the nav item (so /sport/surf highlights "Sport"). */
export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
