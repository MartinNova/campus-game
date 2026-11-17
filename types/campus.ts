export interface CampusLink {
  id: string;
  title: string;
  description: string;
  /** External URL (opens in a new tab) or internal route starting with "/". */
  href: string;
  icon: "book-search" | "study-room" | "map" | "canteen" | "train";
}

export interface CampusLinkSection {
  title: string;
  links: CampusLink[];
}
