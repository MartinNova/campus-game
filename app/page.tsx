import { Greeting } from "@/components/home/Greeting";
import { Badge } from "@/components/ui/Badge";
import { LinkCard } from "@/components/ui/Card";
import { MAIN_NAV } from "@/lib/config/navigation";

export default function HomePage() {
  const modules = MAIN_NAV.filter((item) => item.href !== "/");

  return (
    <>
      <Greeting />
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
