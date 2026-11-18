import { Greeting } from "@/components/home/Greeting";
import { HomeView } from "@/components/home/HomeView";

/** Home: what's on today. The modules themselves live in the tab bar. */
export default function HomePage() {
  return (
    <>
      <Greeting />
      <HomeView />
    </>
  );
}
