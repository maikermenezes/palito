"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { products } from "@/db/schema";
import { IconBack, IconMinus, IconPlus } from "@/components/icons";
import { ProductThumb } from "@/components/ProductThumb";
import { itemsLabel, money } from "@/lib/format";
import { registerWalkIn } from "../../../actions";

type Product = typeof products.$inferSelect;

export function WalkInForm({ products }: { products: Product[] }) {
  const [qty, setQty] = useState<Record<number, number>>({});
  const [pending, startTransition] = useTransition();

  const lines = products.filter((p) => (qty[p.id] ?? 0) > 0);
  const count = lines.reduce((s, p) => s + qty[p.id], 0);
  const total = lines.reduce((s, p) => s + qty[p.id] * p.priceCents, 0);

  function set(id: number, n: number) {
    setQty((q) => ({ ...q, [id]: n }));
  }

  function submit() {
    startTransition(() => registerWalkIn(lines.map((p) => ({ productId: p.id, qty: qty[p.id] }))));
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-2 p-4">
        <Link
          href="/vendedor/pedidos"
          aria-label="Voltar aos pedidos"
          className="flex size-11 items-center justify-center rounded-[14px] border border-borda bg-white"
        >
          <IconBack />
        </Link>
        <h1 className="font-display text-[26px] font-semibold">Venda avulsa</h1>
      </header>
      <p className="px-4 pb-3 text-sm text-suave">
        Para vendas feitas na hora, fora do app. O estoque já baixa ao registrar.
      </p>

      <main className="flex flex-1 flex-col gap-2.5 px-4 pb-4">
        {products.length === 0 && (
          <p className="py-10 text-center text-sm text-suave">Nenhum sabor com estoque agora.</p>
        )}
        {products.map((p) => {
          const n = qty[p.id] ?? 0;
          return (
            <div key={p.id} className="flex items-center gap-2.5 rounded-[18px] border border-borda bg-white p-3">
              <ProductThumb name={p.name} color={p.color} photos={p.photos} w={48} h={48} className="size-12 shrink-0 rounded-xl" popsicle={24} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] leading-tight font-bold">{p.name}</div>
                <div className="text-[13px] text-suave">
                  {money(p.priceCents)} · {p.stock} em estoque
                </div>
              </div>
              <div className="flex items-center rounded-[14px] bg-leite">
                <button
                  type="button"
                  onClick={() => set(p.id, n - 1)}
                  disabled={n === 0}
                  aria-label={`Tirar um ${p.name}`}
                  className="flex size-11 items-center justify-center disabled:opacity-30"
                >
                  <IconMinus size={16} />
                </button>
                <span className="min-w-7 text-center font-display text-xl font-bold" aria-live="polite">
                  {n}
                </span>
                <button
                  type="button"
                  onClick={() => set(p.id, n + 1)}
                  disabled={n >= p.stock}
                  aria-label={`Pôr mais um ${p.name}`}
                  className="flex size-11 items-center justify-center disabled:opacity-30"
                >
                  <IconPlus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="sticky bottom-0 border-t border-borda bg-leite px-4 pt-3 pb-safe">
        <button onClick={submit} disabled={count === 0 || pending} className="btn-primary w-full disabled:opacity-50">
          {pending
            ? "Registrando…"
            : count === 0
              ? "Escolha os sabores vendidos"
              : `Registrar venda · ${itemsLabel(count)} · ${money(total)}`}
        </button>
      </footer>
    </div>
  );
}
