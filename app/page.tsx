import { Greeting } from "@/components/home/Greeting";
import { SurfHero } from "@/components/home/SurfHero";
import { TodayView } from "@/components/home/TodayView";

/** Home: what's on today. The modules themselves live in the tab bar. */
export default function HomePage() {
  return (
    <>
      <Greeting />
      <div className="flex flex-col gap-6">
        <SurfHero />
        <TodayView />
      </div>
    </>
  );
}
