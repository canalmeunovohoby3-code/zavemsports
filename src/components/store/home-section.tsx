import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { getSectionHref } from "@/lib/home-section-link";
import type { HomeSection } from "@/lib/types";

type HomeSectionProps = {
  section: HomeSection;
  tone?: "white" | "paper";
};

export function StoreHomeSection({
  section,
  tone = "white",
}: HomeSectionProps) {
  const href = getSectionHref(section);
  const hasProducts = section.products.length > 0;

  return (
    <section className={tone === "paper" ? "bg-[#f7f7f5]" : "bg-white"}>
      <div className="shell py-8 md:py-10">
        {section.imageUrl ? (
          <div className="relative overflow-hidden border border-line bg-[#f0f0ec]">
            <div className="relative h-[150px] sm:h-[170px] md:h-[190px]">
              <Image
                src={section.imageUrl}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/5" />
              <div className="absolute inset-0 flex items-end justify-between gap-4 p-4 sm:p-6">
                <div className="max-w-[620px] text-white">
                  <h2 className="font-display text-[clamp(1.5rem,2.7vw,2.3rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                    {section.title}
                  </h2>
                  {section.subtitle ? (
                    <p className="mt-2 max-w-[520px] text-xs leading-relaxed text-white/80 sm:text-sm">
                      {section.subtitle}
                    </p>
                  ) : null}
                </div>
                {hasProducts ? (
                  <Link
                    href={href}
                    className="group hidden shrink-0 items-center gap-2 border-b border-white/70 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white sm:inline-flex"
                  >
                    Ver todos
                    <ArrowRight
                      size={13}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <SectionHeading
            eyebrow="Seleção ZEVEN"
            title={section.title}
            description={section.subtitle || undefined}
            href={href}
            linkLabel="Ver todos"
          />
        )}

        {section.imageUrl && hasProducts ? (
          <div className="mt-2 flex justify-end sm:hidden">
            <Link
              href={href}
              className="inline-flex items-center gap-1 border-b border-ink pb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink"
            >
              Ver todos
              <ArrowRight size={12} />
            </Link>
          </div>
        ) : null}

        {hasProducts ? (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {section.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-start justify-between gap-3 border border-line bg-white px-4 py-4 sm:flex-row sm:items-center">
            <p className="text-sm text-muted">
              Esta vitrine está sendo preparada. Novos produtos chegam em breve.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink"
            >
              Ver catálogo
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
