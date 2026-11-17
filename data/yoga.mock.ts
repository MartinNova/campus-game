import type { YogaClass } from "@/types/yoga";

/**
 * Yoga classes of the student club Nova MindSpace.
 * Copied by hand from their public schedule page (YOGA_LINKS.schedule).
 * The club publishes a new schedule every week, so this list is a snapshot.
 * To update: replace the entries and YOGA_WEEK_OF with the current week.
 */
export const YOGA_WEEK_OF = "16.11-20.11.2026";

export const YOGA_CLASSES: YogaClass[] = [
  {
    id: "yoga-tue-1110",
    weekday: "Tuesday",
    time: "11:10-12:00",
    teacher: "Lisa",
    location: "NOVA – beach lawn",
  },
];

export const YOGA_LINKS = {
  schedule:
    "https://app.notion.com/p/novamindspace/Nova-MindSpace-Trainings-3e0b27d2f39b8049b44dcf41cb5363c4",
  instagram: "https://www.instagram.com/nova_mindspace/",
};

/** How sign-up works, as described by the club on its schedule page. */
export const YOGA_SIGNUP = {
  model: "Donation-based",
  suggestion: "We suggest €3-6 per class.",
  deadline: "Sign-ups close at 10pm the night before class.",
  howTo:
    "Open the schedule, find your class and use the teacher's payment link. Your donation is your sign-up.",
  noMoney: "Can't pay? Message the teacher directly and you are still welcome to join.",
};
