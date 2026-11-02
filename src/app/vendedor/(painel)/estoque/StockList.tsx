"use client";

import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import type { products } from "@/db/schema";
import { IconEye, IconMinus, IconPlus } from "@/components/icons";
import { ProductThumb } from "@/components/ProductThumb";
import { Toggle } from "@/components/Toggle";
import { money } from "@/lib/format";
import { adjustStock, setVisible } from "../../actions";

type Product = typeof products.$inferSelect;
type Change = { id: number; delta?: number; visible?: boolean };
type Filter = "all" | "low" | "out";

export function StockList({ products: initial }: { products: Product[] }) {
  const [list, apply] = useOptimistic(initial, (state, c: Change) =>
    state.map((p) =>
      p.id !== c.id
        ? p
        : {
            ...p,
            stock: Math.max(0, p.stock + (c.delta ?? 0)),
            visible: c.visible ?? p.visible,
          },
    ),
  );

  const [filter, setFilter] = useState<Filter>("all");
  // Sabores mexidos com o filtro ligado continuam na lista, para não sumirem no meio do ajuste.
  const [touched, setTouched] = useState<Set<number>>(new Set());

  function pickFilter(next: Filter) {
    setFilter((cur) => (cur === next ? "all" : next));
    setTouched(new Set());
  }

  function change(c: Change) {
    if (filter !== "all") setTouched((t) => new Set(t).add(c.id));
    startTransition(async () => {
      apply(c);
      if (c.delta) await adjustStock(c.id, c.delta);
      if (c.visible !== undefined) await setVisible(c.id, c.visible);
    });
  }

  const total = list.reduce((s, p) => s + p.stock, 0);
  const low = list.filter((p) => matches(p, "low")).length;
  const out = list.filter((p) => matches(p, "out")).length;
  const shown = list.filter((p) => filter === "all" || matches(p, filter) || touched.has(p.id));

  return (
    <>
      <div role="group" aria-label="Filtrar sabores" className="grid grid-cols-3 gap-2 px-4 pb-3">
        <Stat
          value={total}
          label={total === 1 ? "picolé" : "picolés"}
          hint="Mostrar todos"
          onClick={() => pickFilter("all")}
          className="bg-acai text-white"
        />
        <Stat
          value={low}
          label="acabando"
          hint="Mostrar só os que estão acabando"
          active={filter === "low"}
          onClick={() => pickFilter("low")}
          className="bg-manga"
        />
        <Stat
          value={out}
          label={out === 1 ? "esgotado" : "esgotados"}
          hint="Mostrar só os esgotados"
          active={filter === "out"}
          onClick={() => pickFilter("out")}
          className="border border-borda bg-white"
        />
      </div>

      <main className="flex flex-1 flex-col gap-2.5 px-4 pt-1 pb-4">
        {list.length === 0 && (
          <p className="py-10 text-center text-sm text-suave">
            Nenhum sabor ainda. Toque em <strong>Novo sabor</strong> para cadastrar o primeiro.
          </p>
        )}
        {list.length > 0 && shown.length === 0 && (
          <p className="py-10 text-center text-sm text-suave">
            {filter === "low" ? "Nenhum sabor acabando." : "Nenhum sabor esgotado."}{" "}
            <button onClick={() => pickFilter("all")} className="min-h-11 font-bold text-acai underline">
              Ver todos
            </button>
          </p>
        )}
        {shown.map((p) => {
          const isLow = p.stock > 0 && p.stock <= p.lowStockAt;
          return (
            <div key={p.id} className="flex flex-col gap-2 rounded-[18px] border border-borda bg-white p-3">
              <div className="flex items-center gap-2.5">
                <ProductThumb name={p.name} color={p.color} photos={p.photos} w={52} h={52} className="size-[52px] shrink-0 rounded-xl" popsicle={26} />
                <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <Link href={`/vendedor/produtos/${p.id}`} className="text-[15px] leading-tight font-bold">
                    {p.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
                    <span className="text-suave">{money(p.priceCents)}</span>
                    {isLow && <Badge className="bg-manga">Acabando</Badge>}
                    {p.stock === 0 && <Badge className="bg-acai text-white">Esgotado</Badge>}
                  </div>
                </div>
                <div className="flex items-center rounded-[14px] bg-leite">
                  <button
                    onClick={() => change({ id: p.id, delta: -1 })}
                    disabled={p.stock === 0}
                    aria-label={`Diminuir estoque de ${p.name}`}
                    className="flex size-11 items-center justify-center disabled:opacity-30"
                  >
                    <IconMinus size={16} />
                  </button>
                  <span className="min-w-7 text-center font-display text-xl font-bold" aria-live="polite">
                    {p.stock}
                  </span>
                  <button
                    onClick={() => change({ id: p.id, delta: 1 })}
                    aria-label={`Aumentar estoque de ${p.name}`}
                    className="flex size-11 items-center justify-center"
                  >
                    <IconPlus size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => change({ id: p.id, visible: !p.visible })}
                aria-pressed={p.visible}
                className="flex h-11 items-center justify-between border-t border-linha px-0.5 text-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <IconEye size={18} />
                  {p.visible ? "Aparece no catálogo" : "Oculto do catálogo"}
                </span>
                <Toggle on={p.visible} />
              </button>
            </div>
          );
        })}
      </main>
    </>
  );
}

function matches(p: Product, filter: Exclude<Filter, "all">) {
  return filter === "out" ? p.stock === 0 : p.stock > 0 && p.stock <= p.lowStockAt;
}

type StatProps = {
  value: number;
  label: string;
  hint: string;
  // Ausente no "todos": é só um atalho para limpar o filtro, não um filtro que liga e desliga.
  active?: boolean;
  onClick: () => void;
  className: string;
};

function Stat({ value, label, hint, active, onClick, className }: StatProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      title={hint}
      className={`rounded-2xl px-3 py-2.5 text-left ${className} ${active ? "ring-2 ring-acai ring-offset-2 ring-offset-leite" : ""}`}
    >
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </button>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${className}`}>{children}</span>;
}
