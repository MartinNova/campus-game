import { toISODate } from "@/lib/padel/dates";
import type { Run } from "@/types/running";

/**
 * Example runs so the calendar isn't empty on first start.
 * Dates are relative to `today`, so the demo always shows upcoming runs.
 * Runners are the fictional demo accounts from data/users.mock.ts.
 */
export function createMockRuns(today: Date): Run[] {
  const inDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return toISODate(d);
  };
  const createdAt = today.toISOString();

  return [
    {
      id: "mock-run-1",
      date: inDays(1),
      time: "08:00",
      location: "Carcavelos beach promenade",
      distanceKm: 6,
      paceSecPerKm: 360,
      level: "beginner",
      difficulty: "easy",
      description: "Easy morning run by the sea. Coffee afterwards.",
      runnerIds: ["demo-2"],
      createdBy: "demo-2",
      createdAt,
    },
    {
      id: "mock-run-2",
      date: inDays(3),
      time: "18:30",
      location: "Cais do Sodré (ferry terminal)",
      distanceKm: 8,
      paceSecPerKm: 330,
      level: "intermediate",
      difficulty: "moderate",
      description: "Riverside run towards Belém and back.",
      runnerIds: ["demo-4", "demo-5"],
      createdBy: "demo-4",
      createdAt,
    },
    {
      id: "mock-run-3",
      date: inDays(5),
      time: "09:00",
      location: "Parque Eduardo VII",
      distanceKm: 10,
      paceSecPerKm: 300,
      level: "advanced",
      difficulty: "hard",
      description: "Hill repeats. Bring water.",
      runnerIds: ["demo-1"],
      createdBy: "demo-1",
      createdAt,
    },
  ];
}
