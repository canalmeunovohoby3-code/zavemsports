"use client";

import { useActionState, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { changePasswordAction } from "@/app/admin/(painel)/conta/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";

const initialState: ActionState = { status: "idle" };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [visible, setVisible] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitAction(formAction, event.currentTarget);
      }}
      className="border border-line bg-surface"
    >
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          Alterar senha
        </h2>
      </div>
      <div className="space-y-5 p-5">
        {state.status === "error" ? (
          <p className="border border-danger/35 bg-danger/5 px-4 py-3 text-xs text-danger">
            {state.message}
          </p>
        ) : null}

        <div>
          <label htmlFor="currentPassword" className="field-label">
            Senha atual
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className="input"
          />
          {state.fieldErrors?.currentPassword?.[0] ? (
            <p className="field-error">
              {state.fieldErrors.currentPassword[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="newPassword" className="field-label">
            Nova senha
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={10}
            required
            className="input"
            placeholder="Mínimo de 10 caracteres"
          />
          {state.fieldErrors?.newPassword?.[0] ? (
            <p className="field-error">{state.fieldErrors.newPassword[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            Confirmar nova senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={10}
            required
            className="input"
          />
          {state.fieldErrors?.confirmPassword?.[0] ? (
            <p className="field-error">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-[10px] text-muted">
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => setVisible(event.target.checked)}
            className="h-3.5 w-3.5 accent-lime"
          />
          Mostrar senhas
        </label>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-lime btn-block"
        >
          {pending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Alterando…
            </>
          ) : (
            <>
              <KeyRound size={15} />
              Alterar senha
            </>
          )}
        </button>
        <p className="text-[10px] leading-relaxed text-muted">
          Ao alterar a senha, todas as sessões administrativas são encerradas.
          Você precisará entrar novamente.
        </p>
      </div>
    </form>
  );
}



