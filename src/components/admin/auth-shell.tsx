import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { getSettings } from "@/lib/settings";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const settings = getSettings();

  return (
    <div className="grid min-h-screen bg-ink lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between">
        <div className="grid-lines absolute inset-0 opacity-60" />
        <div className="relative p-10 xl:p-14">
          <BrandMark logoUrl={settings.logoUrl} onDark />
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            Painel administrativo
          </p>
        </div>

        <div className="relative px-10 pb-12 xl:px-14 xl:pb-16">
          <span className="outline-text font-display text-[clamp(5rem,10vw,10rem)] font-bold uppercase leading-[0.78] tracking-[-0.075em]">
            ZEVEN
            <br />
            ADMIN
          </span>
          <p className="mt-8 max-w-[400px] text-sm leading-relaxed text-muted">
            Gestão de catálogo, estoque por tamanho, pedidos e clientes da
            ZEVEN SPORTS em um único lugar.
          </p>
        </div>

        <div className="relative flex items-center justify-between border-t border-line px-10 py-5 xl:px-14">
          <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-muted">
            <ShieldCheck size={13} className="text-lime" />
            Área restrita
          </span>
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted">
            ZEVEN SPORTS
          </span>
        </div>
      </aside>

      <main className="flex flex-col p-6 md:p-10">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <BrandMark logoUrl={settings.logoUrl} compact onDark />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-lime"
          >
            <ArrowLeft size={13} />
            Voltar à loja
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        <p className="text-center text-[9px] uppercase tracking-[0.14em] text-muted">
          © {new Date().getFullYear()} ZEVEN SPORTS · Acesso administrativo
        </p>
      </main>
    </div>
  );
}
