"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBag, IconMinus, IconPlus } from "@/components/icons";
import { Popsicle } from "@/components/Popsicle";
import { ProductThumb } from "@/components/ProductThumb";
import type { CatalogProduct, Category } from "@/lib/data";
import { itemsLabel, money } from "@/lib/format";
import { stockLeftLabel } from "@/lib/ordering";
import { useCart } from "./cart";

type Props = {
  products: CatalogProduct[];
  categories: Category[];
  // Desligado = só o cardápio, sem sacola nem botões.
  orderable?: boolean;
};

type Group = { key: string; name: string; products: CatalogProduct[] };

const ALL = "todos";

// Uma seção por categoria com sabores, na ordem das categorias; os sem categoria vão para "Outros".
function groupByCategory(products: CatalogProduct[], categories: Category[]): Group[] {
  const groups: Group[] = categories.map((c) => ({ key: String(c.id), name: c.name, products: [] }));
  const others: Group = { key: "outros", name: "Outros", products: [] };
  for (const p of products) {
    (groups.find((g) => g.key === String(p.categoryId)) ?? others).products.push(p);
  }
  return [...groups, others].filter((g) => g.products.length > 0);
}

export function Catalog({ products, categories, orderable = true }: Props) {
  const { cart, ready, setQty } = useCart();
  const [selected, setSelected] = useState(ALL);

  const groups = groupByCategory(products, categories);
  // Se a categoria escolhida sumiu (ex.: esgotou e foi ocultada), volta para todos.
  const active = groups.some((g) => g.key === selected) ? selected : ALL;
  const shown = active === ALL ? groups : groups.filter((g) => g.key === active);

  let count = 0;
  let total = 0;
  for (const p of products) {
    const n = Math.min(cart?.[p.id] ?? 0, p.stock);
    count += n;
    total += n * p.priceCents;
  }

  if (products.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-16 text-center">
        <Popsicle body="#F6EEE3" top="#3B1035" width={64} shine />
        <p className="font-display text-xl font-semibold">Nenhum sabor por aqui ainda</p>
        <p className="text-sm text-suave">Volte daqui a pouco — a próxima fornada já está no congelador.</p>
      </main>
    );
  }

  return (
    <>
      {groups.length > 1 && (
        <nav aria-label="Filtrar por categoria" className="sticky top-0 z-10 bg-leite/95 py-2 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
            {[{ key: ALL, name: "Todos" }, ...groups].map((g) => (
              <button
                key={g.key}
                onClick={() => {
                  setSelected(g.key);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                aria-pressed={active === g.key}
                className={`h-10 shrink-0 rounded-full border px-4 text-sm font-bold whitespace-nowrap ${
                  active === g.key ? "border-acai bg-acai text-white" : "border-borda bg-white"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-4">
        {shown.map((g) => (
          <section key={g.key} aria-label={g.name} className="flex flex-col gap-3">
            {/* Com uma categoria só, o título repetiria o filtro; mostra se há mais de uma na tela. */}
            {(shown.length > 1 || groups.length === 1) && (
              <h2 className="font-display text-[22px] leading-tight font-semibold">
                {g.name}
              </h2>
            )}
            <div className="grid grid-cols-2 gap-3">
              {g.products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={Math.min(cart?.[p.id] ?? 0, p.stock)}
                  orderable={orderable}
                  ready={ready}
                  setQty={setQty}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {orderable && (
        <footer className="sticky bottom-0 border-t border-borda bg-leite px-4 pt-3 pb-safe">
          {count > 0 ? (
            <Link
              href="/sacola"
              className="flex h-14 items-center justify-between rounded-[18px] bg-acai px-[18px] text-white"
            >
              <span className="flex items-center gap-2.5 text-base font-bold">
                <IconBag size={22} />
                Ver sacola · {itemsLabel(count)}
              </span>
              <span className="font-display text-lg font-semibold text-manga">{money(total)}</span>
            </Link>
          ) : (
            <p className="flex h-14 items-center justify-center text-sm text-suave">
              Toque em Adicionar para montar seu pedido
            </p>
          )}
        </footer>
      )}
    </>
  );
}

type CardProps = {
  product: CatalogProduct;
  qty: number;
  orderable: boolean;
  ready: boolean;
  setQty: (id: number, qty: number) => void;
};

function ProductCard({ product: p, qty, orderable, ready, setQty }: CardProps) {
  const soldOut = p.stock <= 0;
  return (
    <article
      className={`flex flex-col gap-2 rounded-[20px] border border-borda bg-white p-2 ${soldOut ? "opacity-60" : ""}`}
    >
      <div className="relative">
        <ProductThumb name={p.name} color={p.color} photos={p.photos} w={170} h={128} className="h-32 rounded-[14px]" popsicle={60} />
        {p.tag && (
          <span className="absolute top-2 left-2 rounded-full bg-acai px-2 py-1 text-[11px] font-bold text-white">
            {p.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-1">
        <h3 className="text-[15px] leading-tight font-bold">{p.name}</h3>
        {p.description && <p className="line-clamp-2 text-xs text-suave">{p.description}</p>}
        <div className="mt-auto flex items-baseline justify-between gap-1">
          <span className="font-display text-[17px] font-semibold">{money(p.priceCents)}</span>
          {!soldOut && <span className="text-xs font-bold text-suave">{stockLeftLabel(p.stock)}</span>}
        </div>
      </div>
      {soldOut ? (
        <div className="flex h-11 items-center justify-center rounded-[14px] bg-borda text-sm font-bold">
          Esgotado hoje
        </div>
      ) : !orderable ? null : !ready || qty === 0 ? (
        <button onClick={() => setQty(p.id, 1)} className="h-11 rounded-[14px] bg-acai text-[15px] font-bold text-white">
          Adicionar
        </button>
      ) : (
        <div className="flex h-11 items-center justify-between rounded-[14px] bg-morango">
          <button
            onClick={() => setQty(p.id, qty - 1)}
            aria-label={`Tirar um ${p.name}`}
            className="flex size-11 items-center justify-center"
          >
            <IconMinus size={18} />
          </button>
          <span className="font-display text-lg font-bold" aria-live="polite">
            {qty}
          </span>
          <button
            onClick={() => setQty(p.id, qty + 1)}
            disabled={qty >= p.stock}
            aria-label={`Pôr mais um ${p.name}`}
            className="flex size-11 items-center justify-center disabled:opacity-40"
          >
            <IconPlus size={18} />
          </button>
        </div>
      )}
    </article>
  );
}
