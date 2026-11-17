import { ArrowUp, Clock, Thermometer, Timer, Waves, Wind } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { SurfForecastDay, SurfRating } from "@/types/surf";

const RATING_STYLE: Record<SurfRating, { label: string; dot: string; text: string }> = {
  good: {
    label: "Good conditions",
    dot: "bg-green-500",
    text: "text-green-700 dark:text-green-400",
  },
  medium: {
    label: "Medium conditions",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  bad: { label: "Poor conditions", dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const toCompass = (deg: number) => COMPASS[Math.round(deg / 45) % 8];

function dayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  const today = new Date();
  const diff = Math.round(
    (date.setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

/**
 * Arrow pointing where the wind/swell is GOING (direction + 180°),
 * which is how surf apps usually draw it.
 */
function DirectionArrow({ from }: { from: number }) {
  return (
    <ArrowUp
      className="text-muted size-3.5"
      style={{ transform: `rotate(${from + 180}deg)` }}
      aria-hidden
    />
  );
}

function Stat({
  icon,
  label,
  value,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="bg-background rounded-xl p-2.5">
      <dt className="text-muted flex items-center gap-1 text-xs">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 flex items-center gap-1 font-semibold">
        {value}
        {extra}
      </dd>
    </div>
  );
}

export function ForecastDayCard({ day }: { day: SurfForecastDay }) {
  const { conditions: c, rating, reasons, bestTime } = day;
  const style = RATING_STYLE[rating];

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{dayLabel(day.date)}</h3>
          <p className={`flex items-center gap-1.5 text-sm font-medium ${style.text}`}>
            <span className={`size-2.5 rounded-full ${style.dot}`} aria-hidden />
            {style.label}
          </p>
        </div>
        <p className="text-muted flex items-center gap-1 text-xs">
          <Clock className="size-3.5" aria-hidden /> Best {bestTime}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <Stat
          icon={<Waves className="size-3.5" aria-hidden />}
          label="Waves"
          value={`${c.waveHeightM.toFixed(1)} m`}
          extra={
            <span className="text-muted flex items-center text-xs font-normal">
              <DirectionArrow from={c.waveDirectionDeg} />
              {toCompass(c.waveDirectionDeg)}
            </span>
          }
        />
        <Stat
          icon={<Timer className="size-3.5" aria-hidden />}
          label="Period"
          value={`${c.wavePeriodS.toFixed(0)} s`}
        />
        <Stat
          icon={<Wind className="size-3.5" aria-hidden />}
          label="Wind"
          value={`${c.windSpeedKmh} km/h`}
          extra={
            <span className="text-muted flex items-center text-xs font-normal">
              <DirectionArrow from={c.windDirectionDeg} />
              {toCompass(c.windDirectionDeg)}
            </span>
          }
        />
        <Stat
          icon={<Thermometer className="size-3.5" aria-hidden />}
          label="Air max"
          value={`${c.temperatureC} °C`}
        />
      </dl>

      <ul className="text-muted mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {reasons.map((reason) => (
          <li key={reason}>• {reason}</li>
        ))}
      </ul>
    </Card>
  );
}
