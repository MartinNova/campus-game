"use client";

import { useEffect, useState } from "react";
import { getStudentCount } from "@/lib/services/stats.service";

/** "34 Nova students are already here", with a pulsing live dot. Hidden until known. */
export function StudentCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    void getStudentCount()
      .catch(() => null)
      .then(setCount);
  }, []);

  if (!count) return null;
  return (
    <p className="fade-in text-muted flex items-center justify-center gap-2 text-sm">
      <span className="relative flex size-2.5">
        <span className="live-ping absolute inset-0 rounded-full bg-green-500" />
        <span className="relative size-2.5 rounded-full bg-green-500" />
      </span>
      <span>
        <strong className="text-foreground tabular-nums">{count}</strong> Nova student
        {count === 1 ? " is" : "s are"} already here
      </span>
    </p>
  );
}
