import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Guia de tamanhos",
  description:
    "Grade de tamanhos ZEVEN SPORTS: infantil do 02 ao 14 e plus size G1, G2 e G3.",
};

export default function SizeGuidePage() {
  return (
    <div className="shell py-10 md:py-16">
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="transition hover:text-ink">
          Início
        </Link>
        <span>/</span>
        <span className="text-[#555]">Guia de tamanhos</span>
      </nav>

      <header className="mt-7 grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <span className="eyebrow">Informação</span>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
            Guia de tamanhos.
          </h1>
        </div>
        <p className="max-w-[460px] text-sm leading-relaxed text-muted lg:pb-1">
          A grade é definida por produto, com estoque individual em cada
          tamanho. Consulte sempre as opções disponíveis na página da peça antes
          de comprar.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
              Adulto e plus size
            </p>
          </div>
          <div className="p-5 md:p-7">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
              Grade em confirmação
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A grade adulto completa ainda será confirmada pela loja. Os
              tamanhos especiais já informados são:
            </p>
            <div className="mt-5 grid grid-cols-3 border border-line">
              {siteConfig.sizePresets.plus.map((size, index) => (
                <div
                  key={size}
                  className={`border-r border-line py-6 text-center last:border-r-0 ${
                    index === 2 ? "bg-lime" : "bg-[#f7f7f5]"
                  }`}
                >
                  <span className="font-display text-2xl font-semibold text-ink">
                    {size}
                  </span>
                  <span className="mt-1 block text-[8px] uppercase tracking-[0.12em] text-[#555]">
                    Plus size
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2.5 border border-line bg-[#f7f7f5] px-4 py-3">
              <Info size={15} className="mt-0.5 shrink-0 text-ink" />
              <p className="text-[11px] leading-relaxed text-muted">
                Não publicamos medidas ou tamanhos que a loja ainda não
                confirmou. Cada produto exibirá sua própria grade.
              </p>
            </div>
          </div>
        </section>

        <section className="border border-line bg-white">
          <div className="border-b border-line px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
              Infantil
            </p>
          </div>
          <div className="p-5 md:p-7">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
              Do 02 ao 14
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Camisetas e bermudas infantis trabalham com a seguinte grade,
              conforme a disponibilidade de estoque de cada peça:
            </p>
            <div className="mt-5 grid grid-cols-4 border border-line md:grid-cols-7">
              {siteConfig.sizePresets.kids.map((size) => (
                <div
                  key={size}
                  className="flex flex-col items-center justify-center border-b border-r border-line py-3 last:border-r-0 md:border-b-0"
                >
                  <span className="font-display text-base font-semibold text-ink">
                    {size}
                  </span>
                  <span className="mt-0.5 text-[7px] uppercase tracking-[0.1em] text-muted">
                    Anos
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">
              Cada produto infantil pode ter disponibilidade diferente por
              tamanho. Tamanhos sem estoque aparecem desabilitados na página da
              peça.
            </p>
          </div>
        </section>
      </div>

      <section className="mt-5 grid gap-4 border border-line bg-[#f7f7f5] p-5 md:grid-cols-3 md:p-7">
        {[
          {
            title: "Estoque por tamanho",
            text: "A quantidade é controlada individualmente em cada variação. Não é possível adicionar ao carrinho um tamanho esgotado.",
          },
          {
            title: "Grade por produto",
            text: "Cada peça possui sua própria grade. Um mesmo modelo pode ter tamanhos diferentes dos demais.",
          },
          {
            title: "Dúvidas",
            text: "As informações de atendimento serão atualizadas após a confirmação oficial dos canais da loja.",
          },
        ].map((item) => (
          <div key={item.title}>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
        <p className="text-[10px] text-muted">
          Encontre o seu tamanho na página de cada produto.
        </p>
        <Link href="/catalogo" className="btn btn-black">
          Ver produtos
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
