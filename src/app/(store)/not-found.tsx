import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function StoreNotFound() {
  return (
    <div className="shell py-16 md:py-24">
      <div className="border border-line bg-[#f7f7f5] p-8 md:p-14">
        <span className="eyebrow">Erro 404</span>
        <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
          Página não encontrada.
        </h1>
        <p className="mt-4 max-w-[440px] text-sm leading-relaxed text-muted">
          O endereço pode ter mudado ou o conteúdo não está mais disponível.
          Volte ao catálogo para continuar navegando.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link href="/catalogo" className="btn btn-lime">
            Ver produtos
            <ArrowRight size={14} />
          </Link>
          <Link href="/" className="btn btn-outline">
            Ir para a home
          </Link>
        </div>
      </div>
    </div>
  );
}
