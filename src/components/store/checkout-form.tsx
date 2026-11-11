"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  LockKeyhole,
  QrCode,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/components/store/cart-provider";
import { placeOrderAction } from "@/app/(store)/checkout/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";
import { formatPrice, onlyDigits } from "@/lib/format";
import { SHIPPING_PENDING_LABEL, SHIPPING_NOTICE } from "@/lib/shipping";
import { PAYMENT_PENDING_NOTICE } from "@/lib/payments";

const initialState: ActionState = { status: "idle" };

type CepStatus = "idle" | "loading" | "found" | "not-found" | "error";

export function CheckoutForm() {
  const { items, isReady, subtotalCents, itemCount, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initialState,
  );
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const redirected = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success" && state.token && !redirected.current) {
      redirected.current = true;
      clearCart();
      router.push(`/pedido/${state.token}`);
    }
  }, [state, clearCart, router]);

  const handleCepBlur = async () => {
    const digits = onlyDigits(cepRef.current?.value ?? "");
    if (digits.length !== 8) return;

    setCepStatus("loading");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!response.ok) throw new Error("CEP indisponível");
      const data = (await response.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (data.erro) {
        setCepStatus("not-found");
        return;
      }

      const form = formRef.current;
      if (!form) return;
      const setField = (name: string, value: string) => {
        const field = form.elements.namedItem(name);
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement
        ) {
          field.value = value;
        }
      };
      setField("addressStreet", data.logradouro ?? "");
      setField("addressNeighborhood", data.bairro ?? "");
      setField("addressCity", data.localidade ?? "");
      setField("addressState", data.uf ?? "");
      setCepStatus("found");
      const numberField = form.elements.namedItem("addressNumber");
      if (numberField instanceof HTMLInputElement) numberField.focus();
    } catch {
      setCepStatus("error");
    }
  };

  const itemsPayload = JSON.stringify(
    items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  );

  if (state.status === "success") {
    return (
      <div className="shell flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <Loader2 size={28} className="animate-spin" />
        <h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em]">
          Pedido registrado
        </h1>
        <p className="mt-2 text-sm text-muted">Abrindo o resumo do pedido…</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="shell py-16">
        <div className="h-8 w-44 animate-pulse bg-[#f2f2ee]" />
        <div className="mt-8 h-[360px] animate-pulse border border-line bg-[#f7f7f5]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="shell py-16 md:py-24">
        <div className="mx-auto max-w-[560px] border border-line bg-[#f7f7f5] p-8 text-center md:p-12">
          <ShoppingBag size={24} className="mx-auto" strokeWidth={1.5} />
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em]">
            Sua sacola está vazia
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Adicione uma peça à sacola para iniciar o checkout.
          </p>
          <Link href="/catalogo" className="btn btn-lime mt-6">
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-8 md:py-12">
      <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted">
        <Link href="/" className="transition hover:text-ink">
          Início
        </Link>
        <span>/</span>
        <Link href="/carrinho" className="transition hover:text-ink">
          Sacola
        </Link>
        <span>/</span>
        <span className="text-[#555]">Checkout</span>
      </nav>

      <header className="mt-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Finalizar pedido
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.04em] text-ink">
            Checkout
          </h1>
        </div>
        <p className="text-xs text-muted">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </p>
      </header>

      <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_370px] lg:gap-10">
        <form
          ref={formRef}
          onSubmit={(event) => {
            event.preventDefault();
            submitAction(formAction, event.currentTarget);
          }}
          className="min-w-0 space-y-4"
        >
          <input type="hidden" name="items" value={itemsPayload} />
          <input type="hidden" name="expectedSubtotalCents" value={subtotalCents} />

          {state.status === "error" ? (
            <div className="border border-[#efc9c4] bg-[#fdf1ef] px-4 py-3.5 text-sm leading-relaxed text-[#a53227]">
              <p>{state.message}</p>
              {state.message?.includes("carrinho") ||
              state.message?.includes("estoque") ||
              state.message?.includes("disponível") ||
              state.message?.includes("preços") ? (
                <Link
                  href="/carrinho"
                  className="mt-2 inline-flex text-[10px] font-semibold uppercase tracking-[0.08em] underline"
                >
                  Revisar sacola
                </Link>
              ) : null}
            </div>
          ) : null}

          <section className="border border-line bg-white p-5 md:p-6">
            <SectionTitle number="01" title="Contato" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="customerName" className="field-label">
                  Nome completo
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  autoComplete="name"
                  required
                  className="input"
                  placeholder="Seu nome completo"
                />
                <FieldError field="customerName" state={state} />
              </div>
              <div>
                <label htmlFor="customerEmail" className="field-label">
                  E-mail
                </label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="voce@email.com"
                />
                <FieldError field="customerEmail" state={state} />
              </div>
              <div>
                <label htmlFor="customerPhone" className="field-label">
                  Telefone com DDD
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  className="input"
                  placeholder="(00) 00000-0000"
                />
                <FieldError field="customerPhone" state={state} />
              </div>
            </div>
          </section>

          <section className="border border-line bg-white p-5 md:p-6">
            <SectionTitle number="02" title="Entrega" />
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="addressCep" className="field-label">
                  CEP
                </label>
                <input
                  ref={cepRef}
                  id="addressCep"
                  name="addressCep"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={9}
                  required
                  className="input"
                  placeholder="00000-000"
                  onBlur={handleCepBlur}
                />
                <p className="mt-1.5 text-[10px] text-muted">
                  {cepStatus === "loading"
                    ? "Buscando endereço…"
                    : cepStatus === "found"
                      ? "Endereço localizado. Confira o número."
                      : cepStatus === "not-found"
                        ? "CEP não encontrado. Preencha manualmente."
                        : cepStatus === "error"
                          ? "Busca indisponível. Preencha manualmente."
                          : "Preenchimento automático pelo ViaCEP."}
                </p>
                <FieldError field="addressCep" state={state} />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="addressStreet" className="field-label">
                  Rua / Avenida
                </label>
                <input
                  id="addressStreet"
                  name="addressStreet"
                  autoComplete="street-address"
                  required
                  className="input"
                  placeholder="Nome da rua"
                />
                <FieldError field="addressStreet" state={state} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="addressNumber" className="field-label">
                  Número
                </label>
                <input
                  id="addressNumber"
                  name="addressNumber"
                  required
                  className="input"
                  placeholder="000"
                />
                <FieldError field="addressNumber" state={state} />
              </div>
              <div className="sm:col-span-4">
                <label htmlFor="addressComplement" className="field-label">
                  Complemento{" "}
                  <span className="normal-case tracking-normal text-muted/70">
                    (opcional)
                  </span>
                </label>
                <input
                  id="addressComplement"
                  name="addressComplement"
                  className="input"
                  placeholder="Apartamento, bloco, referência"
                />
                <FieldError field="addressComplement" state={state} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="addressNeighborhood" className="field-label">
                  Bairro
                </label>
                <input
                  id="addressNeighborhood"
                  name="addressNeighborhood"
                  required
                  className="input"
                  placeholder="Bairro"
                />
                <FieldError field="addressNeighborhood" state={state} />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="addressCity" className="field-label">
                  Cidade
                </label>
                <input
                  id="addressCity"
                  name="addressCity"
                  required
                  className="input"
                  placeholder="Cidade"
                />
                <FieldError field="addressCity" state={state} />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="addressState" className="field-label">
                  UF
                </label>
                <input
                  id="addressState"
                  name="addressState"
                  required
                  maxLength={2}
                  className="input uppercase"
                  placeholder="SP"
                />
                <FieldError field="addressState" state={state} />
              </div>
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="field-label">
                  Observações{" "}
                  <span className="normal-case tracking-normal text-muted/70">
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="textarea"
                  placeholder="Informações para a entrega"
                />
                <FieldError field="notes" state={state} />
              </div>
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[10px] leading-relaxed text-muted">
              {SHIPPING_NOTICE}
            </p>
          </section>

          <section className="border border-line bg-white p-5 md:p-6">
            <SectionTitle number="03" title="Pagamento" />
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <label className="group cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pix"
                  defaultChecked
                  className="peer sr-only"
                />
                <span className="flex h-full items-start gap-3.5 border border-line bg-white p-4 transition group-hover:border-[#aaa] peer-checked:border-ink peer-checked:bg-[#f7f7f5]">
                  <QrCode size={19} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      PIX
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                      Pagamento combinado após a confirmação do pedido.
                    </span>
                  </span>
                </span>
              </label>
              <label className="group cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  className="peer sr-only"
                />
                <span className="flex h-full items-start gap-3.5 border border-line bg-white p-4 transition group-hover:border-[#aaa] peer-checked:border-ink peer-checked:bg-[#f7f7f5]">
                  <CreditCard size={19} className="mt-0.5 shrink-0" />
                  <span>
                    <span className="block text-sm font-semibold text-ink">
                      Cartão de crédito
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-muted">
                      Nenhum dado de cartão é solicitado neste site.
                    </span>
                  </span>
                </span>
              </label>
            </div>
            <FieldError field="paymentMethod" state={state} />

            <div className="mt-4 flex gap-3 border border-line bg-[#f7f7f5] px-4 py-3.5">
              <LockKeyhole size={15} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed text-[#555]">
                {PAYMENT_PENDING_NOTICE}
              </p>
            </div>
          </section>

          <section className="border border-line bg-white p-5 md:p-6">
            <label className="flex cursor-pointer items-start gap-3 text-[11px] leading-relaxed text-muted">
              <input
                type="checkbox"
                name="accepted"
                className="mt-0.5 h-4 w-4 shrink-0 accent-lime"
              />
              <span>
                Estou ciente de que o pedido será registrado com status
                aguardando pagamento e que a confirmação será feita pela loja
                pelos dados informados.
              </span>
            </label>
            <FieldError field="accepted" state={state} />

            <button
              type="submit"
              disabled={pending}
              className="btn btn-lime btn-block mt-5"
            >
              {pending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando pedido…
                </>
              ) : (
                <>
                  Finalizar pedido
                  <LockKeyhole size={14} />
                </>
              )}
            </button>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
              Nenhuma cobrança é realizada neste site. O pedido será confirmado
              pelo atendimento da ZEVEN.
            </p>
          </section>
        </form>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="border border-line bg-[#f7f7f5]">
            <div className="border-b border-line px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                Seu pedido
              </p>
            </div>
            <ul className="divide-y divide-line px-5">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 py-4">
                  <div className="relative h-[74px] w-[58px] shrink-0 overflow-hidden bg-white">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="58px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[8px] text-muted">
                        ZEVEN
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug text-ink">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      Tamanho {item.size} · Qtd. {item.quantity}
                    </p>
                    <p className="mt-1 text-[11px] tabular-nums text-[#555]">
                      {formatPrice(item.priceCents * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-4 text-sm">
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-muted">Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotalCents)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1">
                <span className="text-muted">Frete</span>
                <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-warning)]">
                  {SHIPPING_PENDING_LABEL}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
                  Total dos produtos
                </span>
                <span className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(subtotalCents)}
                </span>
              </div>
            </div>
            <div className="border-t border-line px-5 py-4">
              <Link
                href="/carrinho"
                className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted transition hover:text-ink"
              >
                <ArrowLeft size={12} />
                Editar sacola
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-line pb-4">
      <span className="flex h-6 w-6 items-center justify-center bg-ink text-[9px] font-semibold text-white">
        {number}
      </span>
      <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h2>
    </div>
  );
}

function FieldError({ field, state }: { field: string; state: ActionState }) {
  const error = state.fieldErrors?.[field]?.[0];
  if (!error) return null;
  return <p className="field-error">{error}</p>;
}
