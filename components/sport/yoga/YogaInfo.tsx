import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { YOGA_LINKS, YOGA_SIGNUP } from "@/data/yoga.mock";

const LINK_CLASS =
  "border-border bg-surface hover:border-brand focus-visible:outline-brand inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium focus-visible:outline-2";

/** How to sign up, plus links to the club's schedule and Instagram. */
export function YogaInfo() {
  return (
    <Card className="mt-4">
      <h2 className="font-semibold">How to join</h2>
      <p className="text-muted mt-1 text-sm">{YOGA_SIGNUP.howTo}</p>
      <ul className="text-muted mt-2 list-disc pl-5 text-sm">
        <li>
          {YOGA_SIGNUP.model}. {YOGA_SIGNUP.suggestion}
        </li>
        <li>{YOGA_SIGNUP.deadline}</li>
        <li>{YOGA_SIGNUP.noMoney}</li>
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={YOGA_LINKS.schedule} target="_blank" rel="noreferrer" className={LINK_CLASS}>
          <ExternalLink className="size-4" aria-hidden />
          Current schedule and sign-up
        </a>
        <a href={YOGA_LINKS.instagram} target="_blank" rel="noreferrer" className={LINK_CLASS}>
          <ExternalLink className="size-4" aria-hidden />
          Instagram
        </a>
      </div>
    </Card>
  );
}
