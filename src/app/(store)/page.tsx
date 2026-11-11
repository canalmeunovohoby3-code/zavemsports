import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  PackageCheck,
  Ruler,
  Shirt,
} from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { editorial } from "@/config/editorial";
import { listBestSellers, listCategories, listProducts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import type { ProductSummary } from "@/lib/types";

export default function HomePage() {
  const settings = getSettings();
  const categories = listCategories();
  const bestSellers = listBestSellers(4);
  const featured = listProducts({ featured: true, limit: 4 });
  const recent = listProducts({ limit: 8 });

  const highlight = [...bestSellers.products];
  for (const product of [...featured, ...recent]) {
    if (highlight.length >= 4) break;
    if (!highlight.some((item) => item.id === product.id)) {
      highlight.push(product);
    }
  }
  const highlightProducts = highlight.slice(0, 4);
  const highlightTitle = bestSellers.hasSales
    ? "Mais vendidos"
    : featured.length > 0
      ? "Destaques"
      : "Novidades";
  const newArrivals = recent
    .filter(
      (product) => !highlightProducts.some((item) => item.id === product.id),
    )
    .slice(0, 4);

  const shirts = listProducts({ kind: "camiseta", limit: 4 });
  const shorts = listProducts({ kind: "bermuda", limit: 4 });
  const plus = listProducts({ audience: "plus", limit: 4 });
  const kids = listProducts({ audience: "infantil", limit: 4 });

  const hasProducts =
    highlightProducts.length > 0 ||
    shirts.length > 0 ||
    shorts.length > 0 ||
    plus.length > 0 ||
    kids.length > 0;

  const findCategory = (slug: string) =>
    categories.find((category) => category.slug === slug);

  const categoryCards = [
    {
      title: "Adulto",
      note: "Camisetas e bermudas",
      href: "/catalogo?publico=adulto",
      image:
        findCategory("camisetas-adulto")?.imageUrl ||
        editorial.audienceImages.adulto,
    },
    {
      title: "Plus Size",
      note: "Grade G1 a G3",
      href: "/catalogo?publico=plus",
      image:
        findCategory("camisetas-plus-size")?.imageUrl ||
        editorial.audienceImages.plus,
    },
    {
      title: "Infantil",
      note: "Tamanhos 02 a 14",
      href: "/catalogo?publico=infantil",
      image:
        findCategory("camisetas-infantil")?.imageUrl ||
        editorial.audienceImages.infantil,
    },
    {
      title: "Camisetas",
      note: "Básicas de algodão",
      href: "/catalogo?tipo=camiseta",
      image:
        findCategory("camisetas-adulto")?.imageUrl ||
        editorial.typeImages.camiseta,
    },
    {
      title: "Bermudas",
      note: "Para o dia a dia",
      href: "/catalogo?tipo=bermuda",
      image:
        findCategory("bermudas-adulto")?.imageUrl ||
        editorial.typeImages.bermuda,
    },
  ];

  return (
    <>
      <section className="border-b border-line bg-[#f7f7f5]">
        <Image
          src={settings.bannerImage || editorial.heroBanner}
          alt={
            settings.bannerImageAlt ||
            "Campanha ZEVEN SPORTS com modelos vestindo camisetas e bermudas"
          }
          width={2172}
          height={724}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
      </section>

      <section className="bg-white">
        <div className="shell py-8 md:py-10">
          <SectionHeading
            eyebrow="Seleção ZEVEN"
            title={highlightTitle}
            description="Peças para montar o seu básico e vestir bem todos os dias."
            href="/catalogo"
            linkLabel="Ver catálogo"
          />
          {highlightProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {highlightProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-start justify-between gap-3 border border-line bg-[#f7f7f5] px-4 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted">
                O catálogo está sendo preparado pela ZEVEN. Novos produtos
                chegam em breve.
              </p>
              <Link
                href="/catalogo"
                className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink"
              >
                Explorar categorias
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {newArrivals.length > 0 ? (
        <section className="border-y border-line bg-[#f7f7f5]">
          <div className="shell py-8 md:py-10">
            <SectionHeading
              eyebrow="Chegando agora"
              title="Lançamentos"
              description="As peças mais recentes cadastradas na loja."
              href="/catalogo"
              linkLabel="Ver novidades"
            />
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {hasProducts ? (
        <>
          <ProductShelf
            eyebrow="Básicos de algodão"
            title="Camisetas"
            description="Para o dia a dia, para o treino e para combinar do seu jeito."
            href="/catalogo?tipo=camiseta"
            linkLabel="Ver camisetas"
            products={shirts}
            tone="white"
            emptyLabel="Novas camisetas em breve."
            promoNote="Adulto · Plus Size · Infantil"
            promoImage={editorial.typeImages.camiseta}
          />
          <ProductShelf
            eyebrow="Para acompanhar o movimento"
            title="Bermudas"
            description="Modelagens confortáveis para o calor e para a rotina."
            href="/catalogo?tipo=bermuda"
            linkLabel="Ver bermudas"
            products={shorts}
            tone="paper"
            emptyLabel="Novas bermudas em breve."
            promoNote="Adulto · Plus Size · Infantil"
            promoImage={editorial.typeImages.bermuda}
          />
          <ProductShelf
            eyebrow="Grade G1 · G2 · G3"
            title="Plus Size"
            description="Camisetas e bermudas com tamanhos especiais e estoque exibido por peça."
            href="/catalogo?publico=plus"
            linkLabel="Ver plus size"
            products={plus}
            tone="white"
            emptyLabel="Novos produtos plus size em breve."
            promoNote="Grade G1 · G2 · G3"
            promoImage={editorial.audienceImages.plus}
          />
          <ProductShelf
            eyebrow="Tamanhos 02 ao 14"
            title="Infantil"
            description="Conforto para acompanhar cada fase, com disponibilidade por tamanho."
            href="/catalogo?publico=infantil"
            linkLabel="Ver infantil"
            products={kids}
            tone="paper"
            emptyLabel="Novos produtos infantis em breve."
            promoNote="Tamanhos 02 ao 14"
            promoImage={editorial.audienceImages.infantil}
          />
        </>
      ) : null}

      <section className="bg-white">
        <div className="shell py-10 md:py-14">
          <SectionHeading
            eyebrow="Compre por categoria"
            title="Escolha o seu essencial"
            href="/catalogo"
            linkLabel="Ver todos os produtos"
          />
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5">
            {categoryCards.map((category) => (
              <Link key={category.title} href={category.href} className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#f4f4f1]">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-2.5 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-[15px] font-semibold leading-tight text-ink">
                      {category.title}
                    </h3>
                    <p className="mt-1 text-[10px] text-muted">{category.note}</p>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="mt-1 shrink-0 text-muted transition group-hover:text-ink"
                  />
                </div>
              </Link>
            ))}
            <Link
              href="/catalogo"
              className="group flex aspect-[4/5] flex-col justify-between bg-lime p-4 text-black md:p-5"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">
                Catálogo completo
              </span>
              <div>
                <p className="font-display text-[clamp(1.3rem,2.4vw,2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
                  Todos os
                  <br />
                  produtos
                </p>
                <span className="mt-4 inline-flex h-9 w-9 items-center justify-center border border-black/20 transition group-hover:bg-black group-hover:text-lime">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-[#f7f7f5]">
        <div className="shell py-7 md:py-9">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[
              {
                icon: Shirt,
                title: "Básicos de algodão",
                text: "Camisetas para usar todos os dias.",
              },
              {
                icon: Ruler,
                title: "Grade plus size",
                text: "Tamanhos G1, G2 e G3.",
              },
              {
                icon: Baby,
                title: "Linha infantil",
                text: "Do 02 ao 14, conforme estoque.",
              },
              {
                icon: PackageCheck,
                title: "Pedido acompanhado",
                text: "Status online com número e e-mail.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-2.5">
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="mt-0.5 shrink-0 text-ink"
                  />
                  <div>
                    <p className="text-[10px] font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[9px] leading-relaxed text-muted">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="shell grid gap-8 py-10 md:py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative min-h-[260px] overflow-hidden bg-[#f4f4f1] md:min-h-[330px]">
            <Image
              src={editorial.institutional}
              alt="Detalhe de peças de vestuário ZEVEN"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-[560px]">
            <span className="eyebrow">A marca</span>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink">
              O essencial para o seu dia.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#555]">
              A ZEVEN SPORTS nasce do encontro entre o essencial e o movimento.
              Camisetas de algodão, bermudas, uma grade plus size e uma linha
              infantil — peças diretas e confortáveis para diferentes corpos e
              rotinas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/sobre" className="btn btn-black btn-sm">
                Conhecer a ZEVEN
                <ArrowRight size={13} />
              </Link>
              <Link href="/guia-de-tamanhos" className="btn btn-outline btn-sm">
                Guia de tamanhos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductShelf({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  products,
  tone,
  emptyLabel,
  promoNote,
  promoImage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  products: ProductSummary[];
  tone: "white" | "paper";
  emptyLabel: string;
  promoNote: string;
  promoImage: string;
}) {
  const remaining = Math.max(0, 4 - products.length);
  const promoSpan =
    remaining === 1
      ? "md:col-span-1"
      : remaining === 2
        ? "md:col-span-2"
        : "md:col-span-3";

  return (
    <section className={tone === "paper" ? "bg-[#f7f7f5]" : "bg-white"}>
      <div className="shell py-8 md:py-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
          linkLabel={linkLabel}
        />
        {products.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {remaining > 0 ? (
              <Link
                href={href}
                className={`group relative col-span-2 flex min-h-[300px] flex-col justify-between overflow-hidden border border-line p-5 text-white transition hover:border-ink md:min-h-0 ${promoSpan}`}
              >
                <Image
                  src={promoImage}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="tag bg-white/95 text-black">Ver todos</span>
                    <ArrowUpRight size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {eyebrow}
                    </p>
                    <p className="mt-2 font-display text-xl font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-2xl">
                      {title}
                    </p>
                    <p className="mt-2 text-[11px] text-white/75">{promoNote}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                      {linkLabel}
                      <ArrowRight size={13} className="text-lime" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-start justify-between gap-2 border border-line bg-white px-4 py-3.5 sm:flex-row sm:items-center">
            <p className="text-xs text-muted">{emptyLabel}</p>
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-[#555] transition hover:text-ink"
            >
              Ver categoria
              <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}





