"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function StoreError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="shell py-20 md:py-28">
      <div className="mx-auto max-w-[580px] border border-line bg-[#f7f7f5] p-8 text-center md:p-12">
        <span className="eyebrow justify-center">Ops</span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-ink">
          Algo saiu do ritmo.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Não foi possível carregar esta página agora. Tente novamente em
          instantes.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-lime">
            <RotateCcw size={15} />
            Tentar novamente
          </button>
          <Link href="/" className="btn btn-outline">
            Ir para a home
          </Link>
        </div>
      </div>
    </div>
  );
}
