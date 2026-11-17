import { CalendarClock, GraduationCap, Languages, Link2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { countryName, flagEmoji, formatMonth, studyProgress } from "@/lib/profile/profile-rules";
import { formatLevel } from "@/types/padel";
import { STUDY_STATUSES, type Profile } from "@/types/profile";

interface ProfileCardProps {
  profile: Profile;
  /** "YYYY-MM", used for "1st year" etc. */
  today: string;
}

/** How a student appears to others: picture, name, programme, interests. */
export function ProfileCard({ profile: p, today }: ProfileCardProps) {
  const progress = studyProgress(p.studyStart, p.studyEnd, today);
  const period = [formatMonth(p.studyStart), formatMonth(p.studyEnd)].filter(Boolean).join(" – ");

  return (
    <Card className="grid gap-5">
      <div className="flex items-center gap-4">
        <Avatar
          firstName={p.firstName}
          lastName={p.lastName}
          username={p.username}
          url={p.avatarUrl}
          size={80}
        />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">
            {[p.firstName, p.lastName].filter(Boolean).join(" ") || `@${p.username}`}
          </h2>
          {p.username && <p className="text-muted">@{p.username}</p>}
          {p.country && (
            <p className="mt-0.5 text-sm">
              {flagEmoji(p.country)} {countryName(p.country)}
            </p>
          )}
        </div>
      </div>

      {p.bio && <p className="text-sm">{p.bio}</p>}

      {p.program && (
        <div className="flex gap-3">
          <GraduationCap className="text-brand mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-medium">{p.program}</p>
            <p className="text-muted">
              {[progress, period, p.studyStatus && STUDY_STATUSES[p.studyStatus]]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      )}

      {(p.sports.length > 0 || p.padelLevel !== null) && (
        <div className="flex flex-wrap gap-1.5">
          {p.sports.map((s) => (
            <Badge key={s} tone="brand">
              {s}
            </Badge>
          ))}
          {p.padelLevel !== null && <Badge>Padel {formatLevel(p.padelLevel)}</Badge>}
        </div>
      )}

      {(p.languages.length > 0 || p.availabilityDays.length > 0 || p.instagram || p.linkedin) && (
        <dl className="text-muted grid gap-2 text-sm">
          {p.languages.length > 0 && (
            <div className="flex gap-2">
              <dt>
                <Languages className="size-4" aria-label="Languages" />
              </dt>
              <dd>{p.languages.join(", ")}</dd>
            </div>
          )}
          {p.availabilityDays.length > 0 && (
            <div className="flex gap-2">
              <dt>
                <CalendarClock className="size-4" aria-label="Usually free" />
              </dt>
              <dd>
                {p.availabilityDays.join(", ")}
                {p.availabilityTimes.length > 0 &&
                  ` · ${p.availabilityTimes.join(", ").toLowerCase()}`}
              </dd>
            </div>
          )}
          {(p.instagram || p.linkedin) && (
            <div className="flex gap-2">
              <dt>
                <Link2 className="size-4" aria-label="Links" />
              </dt>
              <dd className="flex gap-3">
                {p.instagram && (
                  <a
                    href={`https://instagram.com/${p.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Instagram
                  </a>
                )}
                {p.linkedin && (
                  <a href={p.linkedin} target="_blank" rel="noreferrer" className="underline">
                    LinkedIn
                  </a>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Card>
  );
}
