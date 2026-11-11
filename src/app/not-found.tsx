import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
        ZEVEN SPORTS
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-0.05em] text-ink">
        404
      </h1>
      <p className="mt-2 text-sm text-muted">
        O conteúdo solicitado não foi encontrado.
      </p>
      <Link href="/" className="btn btn-lime mt-6">
        Voltar para a loja
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
