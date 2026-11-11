"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PackageSearch } from "lucide-react";
import { trackOrderAction } from "@/app/(store)/conta/actions";
import { submitAction } from "@/lib/submit-action";
import type { ActionState } from "@/lib/action-state";

const initialState: ActionState = { status: "idle" };

export function TrackOrderForm() {
  const [state, formAction, pending] = useActionState(
    trackOrderAction,
    initialState,
  );
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.token && !redirected.current) {
      redirected.current = true;
      router.push(`/pedido/${state.token}`);
    }
  }, [state, router]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitAction(formAction, event.currentTarget);
      }}
      className="border border-line bg-white p-6 md:p-8"
    >
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <PackageSearch size={19} strokeWidth={1.6} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
          Consultar pedido
        </p>
      </div>

      {state.status === "error" ? (
        <p className="mt-5 border border-[#efc9c4] bg-[#fdf1ef] px-4 py-3 text-xs leading-relaxed text-[#a53227]">
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="orderNumber" className="field-label">
            Número do pedido
          </label>
          <input
            id="orderNumber"
            name="orderNumber"
            required
            className="input"
            placeholder="ZV-00000000-0000"
            autoComplete="off"
          />
          {state.fieldErrors?.orderNumber?.[0] ? (
            <p className="field-error">{state.fieldErrors.orderNumber[0]}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="email" className="field-label">
            E-mail utilizado no pedido
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="voce@email.com"
            autoComplete="email"
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="field-error">{state.fieldErrors.email[0]}</p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-lime btn-block mt-6"
      >
        {pending ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Consultando…
          </>
        ) : (
          <>
            Acompanhar pedido
            <ArrowRight size={14} />
          </>
        )}
      </button>
      <p className="mt-3 text-[10px] leading-relaxed text-muted">
        Informe o número do pedido e o mesmo e-mail usado na compra. Não é
        necessário criar conta.
      </p>
    </form>
  );
}
