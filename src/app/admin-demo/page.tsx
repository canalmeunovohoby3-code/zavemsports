import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export const metadata = {
  title: "Painel indisponível na demonstração",
  robots: { index: false, follow: false },
};

export default function AdminDemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-12">
      <div className="w-full max-w-[560px] border border-line bg-white p-7 sm:p-10">
        <Image
          src="/brand/logo-zeven.png"
          alt="ZEVEN SPORTS"
          width={790}
          height={286}
          className="h-10 w-auto"
        />
        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Ambiente de demonstração
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-ink">
          Painel disponível apenas no ambiente local.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Esta publicação é uma demonstração da loja e não possui banco de dados
          persistente. O painel administrativo continua funcionando localmente,
          com SQLite, sem alterar o catálogo nem as configurações da loja.
        </p>
        <div className="mt-6 flex items-start gap-3 border border-line bg-[#f7f7f5] px-4 py-3.5">
          <LockKeyhole size={15} className="mt-0.5 shrink-0 text-ink" />
          <p className="text-[11px] leading-relaxed text-[#555]">
            Nenhum acesso administrativo é criado ou liberado nesta
            demonstração.
          </p>
        </div>
        <Link href="/" className="btn btn-black mt-7">
          <ArrowLeft size={14} />
          Voltar para a loja
        </Link>
      </div>
    </main>
  );
}
