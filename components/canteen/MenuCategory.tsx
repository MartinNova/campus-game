import { Card } from "@/components/ui/Card";
import type { CutMenuCategory } from "@/types/the-cut";

const euros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
export function MenuCategory({ category }: { category: CutMenuCategory }) {
  return (
    <section
      id={category.id}
      aria-labelledby={`${category.id}-title`}
      className="scroll-mt-24 space-y-4"
    >
      <div>
        <h2 id={`${category.id}-title`} className="text-2xl font-bold tracking-tight">
          {category.title}
        </h2>
        <p className="text-muted mt-1 text-sm">{category.subtitle}</p>
      </div>
      <Card className="divide-border divide-y p-0 sm:px-6">
        {category.items.map((item) => (
          <article key={item.name} className="px-4 py-5 sm:px-0">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-semibold">{item.name}</h3>
              <span className="text-brand shrink-0 text-sm font-semibold tabular-nums">
                {item.priceCents === null
                  ? "Price to confirm"
                  : euros.format(item.priceCents / 100)}
              </span>
            </div>
            {item.description && (
              <p className="text-muted mt-1 max-w-lg text-sm leading-relaxed">{item.description}</p>
            )}
            {item.review && (
              <p className="text-muted mt-2 text-xs leading-relaxed">
                <span className="font-semibold">Please confirm: </span>
                {item.review}
              </p>
            )}
          </article>
        ))}
      </Card>
    </section>
  );
}
