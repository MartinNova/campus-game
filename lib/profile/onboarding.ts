import type { Profile, ProfileUpdate } from "@/types/profile";

/** What the three onboarding steps ask for. */
export interface OnboardingAnswers {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  program: string;
  sports: string[];
  padelLevel: number | null;
}

export const ONBOARDING_STEPS = ["You", "Studies", "Sports"] as const;

/** Error for the current step, or null if you can go on. Only the first name is required. */
export function checkOnboardingStep(step: number, answers: OnboardingAnswers): string | null {
  if (step === 0 && !answers.firstName.trim()) return "Please enter your first name.";
  return null;
}

/** The profile with the onboarding answers filled in; everything else stays as it was. */
export function applyOnboarding(profile: Profile, answers: OnboardingAnswers): ProfileUpdate {
  const update: Partial<Profile> = { ...profile };
  delete update.userId;
  delete update.email;
  return {
    ...(update as ProfileUpdate),
    firstName: answers.firstName.trim(),
    lastName: answers.lastName.trim(),
    avatarUrl: answers.avatarUrl,
    program: answers.program,
    sports: answers.sports,
    padelLevel: answers.sports.includes("Padel") ? answers.padelLevel : profile.padelLevel,
  };
}

/** How complete a profile looks to others, 0–100 (picture, name, programme, sports). */
export function profileCompleteness(
  p: Pick<Profile, "avatarUrl" | "firstName" | "program" | "sports">,
): number {
  const parts = [!!p.avatarUrl, !!p.firstName.trim(), !!p.program, p.sports.length > 0];
  return Math.round((parts.filter(Boolean).length / parts.length) * 100);
}
