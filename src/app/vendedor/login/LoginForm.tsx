"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { IconEye, IconLock } from "@/components/icons";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  // Controlado para não sumir quando a senha estiver errada (o form é resetado após a action).
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex flex-col gap-4 rounded-t-[32px] bg-leite px-5 pt-7 pb-safe">
      <h1 className="font-display text-[26px] font-semibold">Entrar</h1>
      <label className="field-label">
        E-mail
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field h-[50px]"
        />
      </label>
      <label className="field-label">
        Senha
        <span className="relative flex">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            className="field h-[50px] pr-[52px]"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
            aria-pressed={show}
            className="absolute top-[3px] right-[3px] flex size-11 items-center justify-center text-suave"
          >
            <IconEye />
          </button>
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="text-sm font-bold text-perigo">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-1 h-[54px] disabled:opacity-70">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      <Link href="/vendedor/esqueci" className="flex min-h-11 items-center self-center text-sm font-bold">
        Esqueci minha senha
      </Link>
      <p className="flex items-center justify-center gap-2 text-[13px] text-suave">
        <IconLock size={16} />
        Só o vendedor vê o estoque e os pedidos
      </p>
    </form>
  );
}
