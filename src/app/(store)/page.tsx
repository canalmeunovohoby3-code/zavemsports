import Image, { getImageProps } from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  PackageCheck,
  Ruler,
  Shirt,
} from "lucide-react";
import { StoreHomeSection } from "@/components/store/home-section";
import { SectionHeading } from "@/components/store/section-heading";
import { editorial } from "@/config/editorial";
import {
  getStoreCategories,
  getStoreHomeSectionsForHome,
  getStoreSettings,
} from "@/lib/storefront";

export default async function HomePage() {
  const settings = await getStoreSettings();
  const bannerAlt =
    settings.bannerImageAlt ||
    "Campanha ZEVEN SPORTS com modelos vestindo camisetas e bermudas";
  const bannerDesktop = getImageProps({
    src: settings.bannerImage || editorial.heroBanner,
    alt: bannerAlt,
    width: 2172,
    height: 724,
    sizes: "100vw",
    priority: true,
  }).props;
  const bannerMobile = getImageProps({
    src: editorial.heroBannerMobile,
    alt: bannerAlt,
    width: 1448,
    height: 1086,
    sizes: "100vw",
    priority: true,
  }).props;
  const categories = await getStoreCategories();
  const homeSections = await getStoreHomeSectionsForHome();
  const visibleSections = homeSections.filter(
    (section) => section.products.length > 0,
  );

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
        <picture>
          {settings.bannerImage ? null : (
            <source
              media="(max-width: 639px)"
              srcSet={bannerMobile.srcSet}
              sizes={bannerMobile.sizes}
            />
          )}
          <img
            {...bannerDesktop}
            alt={bannerAlt}
            className="block h-auto w-full"
          />
        </picture>
      </section>

      {visibleSections.length > 0 ? (
        <>
          {visibleSections.map((section, index) => (
            <StoreHomeSection
              key={section.id}
              section={section}
              tone={index % 2 === 0 ? "white" : "paper"}
            />
          ))}
        </>
      ) : (
        <section className="border-b border-line bg-white">
          <div className="shell py-10 md:py-12">
            <SectionHeading
              eyebrow="Seleção ZEVEN"
              title="Catálogo em preparação"
              description="As vitrines já podem ser montadas no painel. Os produtos publicados aparecerão aqui automaticamente."
              href="/catalogo"
              linkLabel="Explorar categorias"
            />
            <div className="mt-5 flex flex-col items-start justify-between gap-3 border border-line bg-[#f7f7f5] px-4 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-muted">
                Nenhum produto publicado ainda. Cadastre os produtos no painel
                para preencher as vitrines da loja.
              </p>
              <Link
                href="/catalogo"
                className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink"
              >
                Ver catálogo
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      )}

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
