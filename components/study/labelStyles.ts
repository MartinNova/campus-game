import type { LabelColor } from "@/types/todo";

/** Tailwind classes per label colour (written out in full so Tailwind can find them). */
export const LABEL_STYLES: Record<LabelColor, { chip: string; dot: string }> = {
  red: { chip: "bg-red-500/20 text-red-800 dark:text-red-300", dot: "bg-red-500" },
  orange: { chip: "bg-orange-500/20 text-orange-800 dark:text-orange-300", dot: "bg-orange-500" },
  yellow: { chip: "bg-yellow-400/30 text-yellow-900 dark:text-yellow-200", dot: "bg-yellow-400" },
  green: { chip: "bg-green-500/20 text-green-800 dark:text-green-300", dot: "bg-green-500" },
  teal: { chip: "bg-teal-500/20 text-teal-800 dark:text-teal-300", dot: "bg-teal-500" },
  blue: { chip: "bg-blue-500/20 text-blue-800 dark:text-blue-300", dot: "bg-blue-500" },
  purple: { chip: "bg-purple-500/20 text-purple-800 dark:text-purple-300", dot: "bg-purple-500" },
  pink: { chip: "bg-pink-500/20 text-pink-800 dark:text-pink-300", dot: "bg-pink-400" },
  gray: { chip: "bg-slate-500/20 text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
};
