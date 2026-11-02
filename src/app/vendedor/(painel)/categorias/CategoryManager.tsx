"use client";

import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from "react";
import { IconPlus, IconTrash } from "@/components/icons";
import { addCategory, deleteCategory } from "../../actions";

type Row = { id: number; name: string; productCount: number };

export function CategoryManager({ categories }: { categories: Row[] }) {
  const [state, action, adding] = useActionState(addCategory, undefined);
  const [removing, startRemove] = useTransition();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  // Limpa o campo depois de criar, e só aí (um erro mantém o que foi digitado).
  useEffect(() => {
    if (state?.ok && input.current) {
      input.current.value = "";
      input.current.focus();
    }
  }, [state?.ok]);

  // Sem `action={...}` no form: o React limparia o campo também quando o servidor devolve erro.
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  function remove(c: Row) {
    const detail =
      c.productCount === 0
        ? ""
        : `\n\n${c.productCount === 1 ? "1 sabor fica" : `${c.productCount} sabores ficam`} sem categoria (aparece em "Outros"). Nenhum sabor é apagado.`;
    if (!confirm(`Remover a categoria "${c.name}"?${detail}`)) return;
    setRemovingId(c.id);
    startRemove(() => deleteCategory(c.id));
  }

  return (
    <main className="flex flex-1 flex-col gap-4 px-4 pb-safe">
      <p className="text-sm text-suave">
        No catálogo, os sabores aparecem separados por categoria, nesta ordem.
      </p>

      <ul className="flex flex-col rounded-[20px] border border-borda bg-white px-3.5">
        {categories.length === 0 && <li className="py-6 text-center text-sm text-suave">Nenhuma categoria ainda.</li>}
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 border-b border-linha py-2 last:border-b-0">
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold">{c.name}</div>
              <div className="text-[13px] text-suave">
                {c.productCount === 0 ? "Nenhum sabor" : c.productCount === 1 ? "1 sabor" : `${c.productCount} sabores`}
              </div>
            </div>
            <button
              onClick={() => remove(c)}
              disabled={removing && removingId === c.id}
              aria-label={`Remover categoria ${c.name}`}
              className="flex size-11 items-center justify-center rounded-[14px] text-perigo disabled:opacity-40"
            >
              <IconTrash size={20} />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="flex flex-col gap-2">
        <label className="field-label">
          Nova categoria
          <span className="flex gap-2">
            <input
              ref={input}
              name="name"
              required
              maxLength={40}
              placeholder="Ex.: Picolé de fruta"
              className="field flex-1"
            />
            <button
              type="submit"
              disabled={adding}
              className="flex h-12 shrink-0 items-center gap-1.5 rounded-[14px] bg-acai px-4 text-[15px] font-bold text-white disabled:opacity-60"
            >
              <IconPlus size={18} />
              Adicionar
            </button>
          </span>
        </label>
        {state?.error && (
          <p role="alert" className="text-sm font-bold text-perigo">
            {state.error}
          </p>
        )}
      </form>
    </main>
  );
}
