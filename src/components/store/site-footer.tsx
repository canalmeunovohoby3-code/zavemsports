import Link from "next/link";
import {
  ArrowUpRight,
  AtSign,
  Mail,
  MessageCircle,
  PackageCheck,
} from "lucide-react";
import type { Category } from "@/lib/types";
import type { StoreSettings } from "@/lib/store-settings";
import {
  getWhatsAppHref,
  isWhatsAppPending,
} from "@/lib/store-settings";

type SiteFooterProps = {
  categories: Category[];
  settings: StoreSettings;
};

export function SiteFooter({ categories, settings }: SiteFooterProps) {
  const whatsapp = getWhatsAppHref(
    settings,
    "Olá! Vim pela loja ZEVEN SPORTS e gostaria de atendimento.",
  );
  const whatsappPending = isWhatsAppPending(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-[#f7f7f5]">
      <div className="shell">
        <div className="grid gap-10 border-b border-line py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              ZEVEN SPORTS
            </p>
            <h2 className="mt-4 max-w-[620px] font-display text-[clamp(2.1rem,4.4vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              Essenciais para o seu dia a dia.
              <span className="text-lime">.</span>
            </h2>
            <p className="mt-4 max-w-[500px] text-sm leading-relaxed text-muted">
              Camisetas de algodão, bermudas, plus size e infantil. Peças
              diretas para acompanhar a sua rotina.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <Link href="/catalogo" className="btn btn-black w-fit">
              Ver todos os produtos
              <ArrowUpRight size={15} />
            </Link>
            <p className="max-w-[340px] text-[11px] leading-relaxed text-muted lg:text-right">
              A loja está sendo preparada para receber o catálogo completo. As
              condições comerciais serão publicadas pela ZEVEN.
            </p>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow-plain text-ink">Loja</p>
            <ul className="mt-5 space-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categoria/${category.slug}`}
                    className="text-sm text-[#555] transition hover:text-ink"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow-plain text-ink">Institucional</p>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-[#555] transition hover:text-ink"
                >
                  Sobre a ZEVEN
                </Link>
              </li>
              <li>
                <Link
                  href="/guia-de-tamanhos"
                  className="text-sm text-[#555] transition hover:text-ink"
                >
                  Guia de tamanhos
                </Link>
              </li>
              <li>
                <Link
                  href="/conta"
                  className="text-sm text-[#555] transition hover:text-ink"
                >
                  Acompanhar pedido
                </Link>
              </li>
              <li>
                <Link
                  href="/carrinho"
                  className="text-sm text-[#555] transition hover:text-ink"
                >
                  Minha sacola
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow-plain text-ink">Atendimento</p>
            <ul className="mt-5 space-y-4 text-sm text-[#555]">
              <li className="flex items-start gap-2.5">
                <MessageCircle size={15} className="mt-0.5 shrink-0 text-muted" />
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.14em] text-muted">
                    WhatsApp
                  </span>
                  {whatsapp ? (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 transition hover:text-ink"
                    >
                      {settings.whatsappDisplay || settings.whatsappNumber}
                      <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      {settings.whatsappDisplay || settings.whatsappNumber}
                      {whatsappPending ? (
                        <span className="tag tag-warning">A confirmar</span>
                      ) : null}
                    </span>
                  )}
                  {whatsappPending ? (
                    <span className="mt-2 block max-w-[260px] text-[10px] leading-relaxed text-muted">
                      Número informado pela loja. O link será liberado após a
                      confirmação oficial.
                    </span>
                  ) : null}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <AtSign size={15} className="mt-0.5 shrink-0 text-muted" />
                <span>
                  <span className="block text-[9px] uppercase tracking-[0.14em] text-muted">
                    Instagram
                  </span>
                  {settings.instagramUrl ? (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 transition hover:text-ink"
                    >
                      Abrir Instagram
                      <ArrowUpRight size={12} />
                    </a>
                  ) : (
                    <span className="mt-1 block text-muted">Em breve</span>
                  )}
                </span>
              </li>
              {settings.contactEmail ? (
                <li className="flex items-start gap-2.5">
                  <Mail size={15} className="mt-0.5 shrink-0 text-muted" />
                  <span>
                    <span className="block text-[9px] uppercase tracking-[0.14em] text-muted">
                      E-mail
                    </span>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="mt-1 inline-flex transition hover:text-ink"
                    >
                      {settings.contactEmail}
                    </a>
                  </span>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <p className="eyebrow-plain text-ink">Informações</p>
            <ul className="mt-5 space-y-3 text-sm text-[#555]">
              <li>Pagamento por PIX ou cartão de crédito, com confirmação pela loja.</li>
              <li>Frete e prazo informados após a confirmação do pedido.</li>
              <li>Condições de troca e devolução serão publicadas pela loja.</li>
              <li className="flex items-center gap-2 text-ink">
                <PackageCheck size={15} className="text-lime" />
                Acompanhe seu pedido online
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-7 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-display text-2xl font-extrabold uppercase tracking-[-0.05em] text-ink"
          >
            ZEVEN<span className="text-lime">.</span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted">
            <span>
              © {year} ZEVEN SPORTS. Todos os direitos reservados.
            </span>
            <Link href="/sobre" className="transition hover:text-ink">
              A marca
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 transition hover:text-ink"
            >
              Acesso administrativo
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
