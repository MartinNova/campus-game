type Tone = "neutral" | "good" | "medium" | "bad" | "brand";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted/15 text-muted",
  good: "bg-green-500/15 text-green-700 dark:text-green-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  bad: "bg-red-500/15 text-red-700 dark:text-red-400",
  brand: "bg-brand/10 text-brand",
};

/** Small status label. good/medium/bad are meant for traffic-light ratings. */
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
