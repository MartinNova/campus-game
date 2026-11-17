import type { CampusLinkSection } from "@/types/campus";

/**
 * Useful Nova SBE links shown on the Campus tab.
 * To add a link: add an entry to a section (or a new section). Internal routes start with "/".
 */
export const CAMPUS_LINK_SECTIONS: CampusLinkSection[] = [
  {
    title: "Library",
    links: [
      {
        id: "book-search",
        title: "Search books",
        description: "Find books and articles in the Nova SBE library (EBSCO).",
        href: "https://research.ebsco.com/c/7kzg2s/search",
        icon: "book-search",
      },
      {
        id: "study-rooms",
        title: "Book a study room",
        description: "Reserve a library study room (LibCal).",
        href: "https://novasbe.libcal.com/",
        icon: "study-room",
      },
    ],
  },
  {
    title: "On campus",
    links: [
      {
        id: "campus-map",
        title: "Campus map",
        description: "Find rooms and buildings with the interactive campus tour.",
        href: "https://campustour.novasbe.pt/",
        icon: "map",
      },
      {
        id: "canteen",
        title: "Food Options",
        description: "The different restaurants and cafés on campus and their menus.",
        href: "/canteen",
        icon: "canteen",
      },
    ],
  },
];
