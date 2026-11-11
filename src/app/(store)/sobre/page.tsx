import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getStoreCategories } from "@/lib/storefront";
import { audienceLabels } from "@/config/site";
import { editorial } from "@/config/editorial";

export const metadata = {
  title: "Sobre a ZEVEN",
  description:
    "A ZEVEN SPORTS reúne camisetas de algodão, bermudas, tamanhos especiais e linha infantil.",
};

export default async function AboutPage() {
  const categories = await getStoreCategories();

  return (
    <div className="bg-white">
      <section className="border-b border-line bg-[#f7f7f5]">
        <div className="mx-auto grid w-full max-w-[1480px] lg:grid-cols-[1fr_0.9fr]">
          <div className="flex items-center px-5 py-12 sm:px-8 md:py-16 xl:px-12">
            <div className="max-w-[560px]">
              <span className="eyebrow">A marca</span>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
                Essenciais para acompanhar você.
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-[#555] md:text-[15px]">
                A ZEVEN SPORTS nasce do encontro entre o essencial e o
                movimento. Uma proposta direta: camisetas de algodão, bermudas,
                tamanhos especiais e uma linha infantil para acompanhar
                diferentes corpos e rotinas.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Sem excessos. Sem ruído. Peças que cumprem o seu papel dentro e
                fora do treino, com uma identidade construída em preto e
                verde-limão.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <Link href="/catalogo" className="btn btn-black">
                  Ver produtos
                  <ArrowRight size={14} />
                </Link>
                <Link href="/guia-de-tamanhos" className="btn btn-outline">
                  Guia de tamanhos
                </Link>
              </div>
            </div>
          </div>
          <div className="relative min-h-[320px] border-t border-line lg:min-h-[480px] lg:border-l lg:border-t-0">
            <Image
              src={editorial.institutional}
              alt="Detalhe de peças de vestuário ZEVEN"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="shell py-12 md:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              index: "01",
              title: "Essencial",
              text: "Básicos de algodão que funcionam sozinhos ou em composição. O ponto de partida do guarda-roupa.",
            },
            {
              index: "02",
              title: "Inclusão",
              text: "Grade plus size G1, G2 e G3 e linha infantil do 02 ao 14, com estoque exibido por tamanho.",
            },
            {
              index: "03",
              title: "Movimento",
              text: "Peças para o treino, o dia a dia e tudo o que acontece entre um e outro.",
            },
          ].map((value) => (
            <div key={value.index} className="border border-line p-6 md:p-7">
              <span className="text-[10px] font-semibold text-muted">
                {value.index}
              </span>
              <h2 className="mt-6 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                {value.title}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-[#f7f7f5]">
        <div className="shell py-12 md:py-16">
          <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Linhas ZEVEN
              </p>
              <h2 className="mt-2 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold tracking-[-0.035em] text-ink">
                Um essencial, três frentes.
              </h2>
            </div>
            <Link href="/catalogo" className="btn btn-outline btn-sm w-fit">
              Ver catálogo
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(["adulto", "plus", "infantil"] as const).map((audience) => {
              const audienceCategories = categories.filter(
                (category) => category.audience === audience,
              );
              return (
                <div key={audience} className="border border-line bg-white p-5 md:p-6">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {audienceLabels[audience]}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {audience === "plus"
                      ? "G1 — G3"
                      : audience === "infantil"
                        ? "02 — 14"
                        : "Essenciais"}
                  </h3>
                  <ul className="mt-5 border-t border-line">
                    {audienceCategories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/categoria/${category.slug}`}
                          className="flex items-center justify-between gap-3 border-b border-line py-2.5 text-xs text-[#555] transition hover:text-ink"
                        >
                          {category.name}
                          <ArrowUpRight size={12} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="shell py-12 md:py-16">
        <div className="flex flex-col justify-between gap-5 border border-line bg-[#f7f7f5] p-7 md:flex-row md:items-center md:p-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Catálogo
            </p>
            <h2 className="mt-2 max-w-[640px] font-display text-[clamp(1.8rem,3.4vw,2.7rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-ink">
              A ZEVEN está sendo preparada para receber a coleção completa.
            </h2>
            <p className="mt-3 max-w-[540px] text-sm leading-relaxed text-muted">
              Os produtos serão publicados com nome, descrição, preço, imagens e
              grade de tamanhos próprios. Nenhuma informação comercial é criada
              sem o cadastro oficial.
            </p>
          </div>
          <Link href="/catalogo" className="btn btn-black shrink-0">
            Explorar categorias
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
