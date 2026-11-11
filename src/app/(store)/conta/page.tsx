import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TrackOrderForm } from "@/components/store/track-order-form";

export const metadata = {
  title: "Acompanhar pedido",
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return (
    <div className="shell py-10 md:py-16">
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="transition hover:text-ink">
          Início
        </Link>
        <span>/</span>
        <span className="text-[#555]">Meus pedidos</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_430px] lg:gap-16">
        <div>
          <span className="eyebrow">Atendimento</span>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-ink">
            Acompanhe o seu pedido.
          </h1>
          <p className="mt-4 max-w-[460px] text-sm leading-relaxed text-muted">
            Consulte o status usando o número recebido na finalização e o e-mail
            informado na compra. Não é necessário criar conta.
          </p>

          <div className="mt-8 max-w-[460px] border border-line">
            {[
              ["01", "Pedido registrado", "Aguardando pagamento"],
              ["02", "Pagamento", "Confirmação pela loja"],
              ["03", "Preparação e envio", "Acompanhamento pelo pedido"],
            ].map(([index, title, detail], position) => (
              <div
                key={index}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  position !== 2 ? "border-b border-line" : ""
                }`}
              >
                <div>
                  <p className="text-[11px] font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-[10px] text-muted">{detail}</p>
                </div>
                <span className="font-display text-sm font-semibold text-[#999]">
                  {index}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-5">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-[#555] transition hover:text-ink"
            >
              Ver produtos
              <ArrowUpRight size={12} />
            </Link>
            <Link
              href="/guia-de-tamanhos"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-muted transition hover:text-ink"
            >
              Guia de tamanhos
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        <div className="lg:pt-8">
          <TrackOrderForm />
        </div>
      </div>
    </div>
  );
}
