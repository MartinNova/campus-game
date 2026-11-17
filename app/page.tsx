import Image from "next/image";
import { Greeting } from "@/components/home/Greeting";
import { Badge } from "@/components/ui/Badge";
import { LinkCard } from "@/components/ui/Card";
import { MAIN_NAV } from "@/lib/config/navigation";

export default function HomePage() {
  const modules = MAIN_NAV.filter((item) => item.href !== "/");

  return (
    <>
      <Greeting />
      <section aria-labelledby="campus-intro" className="mb-8 space-y-4">
        <Image
          src="/images/nova-campus-aerial.png"
          alt="Aerial view of the NOVA SBE campus beside the Atlantic Ocean."
          width={800}
          height={460}
          sizes="(max-width: 768px) 100vw, 672px"
          preload
          className="h-auto w-full rounded-2xl"
        />
        <div className="space-y-2">
          <h2 id="campus-intro" className="text-2xl font-bold tracking-tight">
            Everything NOVA, in one place.
          </h2>
          <p className="text-muted leading-relaxed">
            Find your next meal, explore campus activities, and discover useful services — without
            switching between different websites.
          </p>
        </div>
      </section>
      <h2 className="text-muted mb-3 text-sm font-semibold tracking-wide uppercase">Modules</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map(({ href, label, icon: Icon, status }) => (
          <LinkCard
            key={href}
            href={href}
            title={label}
            icon={<Icon className="size-5" aria-hidden />}
            badge={status === "soon" ? <Badge>Soon</Badge> : null}
          />
        ))}
      </div>
    </>
  );
}
