import { Construction } from "lucide-react";
import { Card } from "./Card";

/**
 * Placeholder for modules that are not built yet.
 * Replace the whole page on your feature branch when you start the module.
 */
export function ComingSoon({ branch, children }: { branch?: string; children?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-2 py-10 text-center">
      <Construction className="text-accent size-8" aria-hidden />
      <p className="font-semibold">Coming soon</p>
      {children && <p className="text-muted max-w-xs text-sm">{children}</p>}
      {branch && (
        <p className="text-muted text-xs">
          In progress on <code className="font-mono">{branch}</code>
        </p>
      )}
    </Card>
  );
}
