"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldPlus } from "lucide-react";
import { setupAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import { submitAction } from "@/lib/submit-action";

const initialState: ActionState = { status: "idle" };

export function SetupForm() {
  const [state, formAction, pending] = useActionState(
    setupAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <p className="eyebrow">Primeiro acesso</p>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-[-0.04em]">
        Criar administrador
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Defina as credenciais iniciais do painel. Esta etapa acontece apenas
        uma vez, antes do primeiro produto ser cadastrado.
      </p>

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
          <label htmlFor="name" className="field-label">
            Nome do administrador
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            className="input"
            placeholder="Nome completo"
          />
          {state.fieldErrors?.name?.[0] ? (
            <p className="field-error">{state.fieldErrors.name[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="field-label">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
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
              autoComplete="new-password"
              minLength={10}
              required
              className="input pr-12"
              placeholder="Mínimo de 10 caracteres"
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

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={10}
            required
            className="input"
            placeholder="Repita a senha"
          />
          {state.fieldErrors?.confirmPassword?.[0] ? (
            <p className="field-error">
              {state.fieldErrors.confirmPassword[0]}
            </p>
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
              Criando acesso…
            </>
          ) : (
            <>
              Criar acesso administrativo
              <ShieldPlus size={16} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[11px] leading-relaxed text-muted">
        Use uma senha exclusiva e guarde as credenciais em local seguro. Após a
        criação, esta página deixa de ficar disponível.
      </p>
    </div>
  );
}



