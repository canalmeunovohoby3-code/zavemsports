"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";

const initialState: ActionState = { status: "idle" };

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <p className="eyebrow">Painel ZEVEN</p>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-[-0.04em]">
        Acesso restrito
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Entre com o e-mail e a senha do administrador para gerenciar a loja.
      </p>

      {notice ? (
        <p className="mt-6 border border-lime/30 bg-lime/[0.05] px-4 py-3 text-xs text-lime">
          {notice}
        </p>
      ) : null}

      {state.status === "error" ? (
        <p className="mt-6 border border-danger/35 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
          {state.message}
        </p>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitAction(formAction, event.currentTarget);
        }}
        className="mt-7 space-y-5"
      >
        <div>
          <label htmlFor="email" className="field-label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="input"
            placeholder="admin@zevensports.com"
          />
          {state.fieldErrors?.email?.[0] ? (
            <p className="field-error">{state.fieldErrors.email[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="input pr-12"
              placeholder="Sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-muted transition hover:text-lime"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {state.fieldErrors?.password?.[0] ? (
            <p className="field-error">{state.fieldErrors.password[0]}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn btn-lime btn-block"
        >
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Entrando…
            </>
          ) : (
            <>
              Entrar no painel
              <LogIn size={15} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[11px] leading-relaxed text-muted">
        Sem acesso? Solicite as credenciais ao responsável pela loja. A
        recuperação de senha deve ser feita diretamente no servidor.
      </p>
    </div>
  );
}



