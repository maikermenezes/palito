"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Fulfillment, OrderStatus } from "@/db/schema";
import { IconChat, IconCheck, IconPlus } from "@/components/icons";
import { money, orderNumber, whatsappLink } from "@/lib/format";
import { paymentLabel } from "@/lib/ordering";
import { cancelOrder, confirmOrder } from "../../actions";

export type OrderView = {
  id: number;
  customerName: string;
  whatsapp: string;
  fulfillment: Fulfillment;
  paymentMethod: string;
  address: string;
  note: string;
  status: OrderStatus;
  totalCents: number;
  when: string;
  items: { name: string; qty: number; stock: number | null }[];
};

const BADGE: Record<OrderStatus, [string, string]> = {
  pending: ["Novo", "bg-manga"],
  done: ["Vendido", "bg-acai text-white"],
  canceled: ["Recusado", "bg-borda"],
};

const FULFILLMENT: Record<Fulfillment, string> = {
  entrega: "Entrega",
  retirada: "Retirada",
  balcao: "No balcão",
  "": "",
};

const REFRESH_MS = 20_000;

export function OrdersList({ orders }: { orders: OrderView[] }) {
  const router = useRouter();
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const pending = orders.filter((o) => o.status === "pending").length;

  // Busca pedidos novos enquanto a tela está aberta.
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);
    return () => clearInterval(t);
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  function run(id: number, fn: () => Promise<string>) {
    setBusy(id);
    startTransition(async () => {
      setToast(await fn());
      setBusy(null);
    });
  }

  return (
    <>
      <header className="flex flex-col gap-3 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[30px] font-semibold">Pedidos</h1>
          {pending > 0 && (
            <span className="rounded-full bg-morango px-3 py-1.5 text-[13px] font-bold">
              {pending === 1 ? "1 novo" : `${pending} novos`}
            </span>
          )}
        </div>
        <Link
          href="/vendedor/pedidos/avulsa"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borda-forte bg-white text-[15px] font-bold"
        >
          <IconPlus size={18} />
          Registrar venda avulsa
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-3 px-4 pt-1 pb-4">
        {orders.length === 0 && (
          <p className="py-10 text-center text-sm text-suave">
            Nenhum pedido ainda. Compartilhe o QR code do catálogo para começar a receber.
          </p>
        )}
        {orders.map((o) => {
          const isPending = o.status === "pending";
          const [label, badge] = BADGE[o.status];
          return (
            <article
              key={o.id}
              className={`flex flex-col gap-2.5 rounded-[20px] border border-borda bg-white p-3.5 ${isPending ? "" : "opacity-70"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-base font-bold">
                    {o.customerName || "Cliente"}{" "}
                    <span className="text-[13px] font-medium text-suave">
                      · {orderNumber(o.id)} · {o.when}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[13px] text-suave">
                    {[FULFILLMENT[o.fulfillment], o.fulfillment === "entrega" && o.address, paymentLabel(o.paymentMethod)]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${badge}`}>
                  {label}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-[14px] bg-leite px-3 py-2">
                {o.items.map((l, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      <strong>{l.qty}×</strong> {l.name}
                    </span>
                    <span className="text-xs whitespace-nowrap text-suave">
                      {isPending && l.stock != null
                        ? `estoque ${l.stock} → ${Math.max(0, l.stock - l.qty)}`
                        : o.status === "done"
                          ? "baixado"
                          : "—"}
                    </span>
                  </div>
                ))}
              </div>

              {o.note && <p className="text-sm text-suave">“{o.note}”</p>}

              <div className="flex items-center justify-between gap-2">
                {o.whatsapp ? (
                  <a
                    href={whatsappLink(o.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 items-center gap-1.5 text-[13px] font-bold"
                  >
                    <IconChat size={18} />
                    {o.whatsapp}
                  </a>
                ) : (
                  <span className="text-[13px] text-suave">{isPending ? "A receber" : "Total"}</span>
                )}
                <span className="font-display text-xl font-bold">{money(o.totalCents)}</span>
              </div>

              {isPending && (
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <button
                    disabled={busy === o.id}
                    onClick={() =>
                      run(o.id, async () => {
                        await cancelOrder(o.id);
                        return `Pedido ${orderNumber(o.id)} recusado`;
                      })
                    }
                    className="h-[46px] rounded-[14px] border border-borda-forte bg-white text-sm font-bold disabled:opacity-60"
                  >
                    Recusar
                  </button>
                  <button
                    disabled={busy === o.id}
                    onClick={() =>
                      run(o.id, async () => {
                        const { units } = await confirmOrder(o.id);
                        return `Venda registrada · −${units} ${units === 1 ? "picolé" : "picolés"} no estoque`;
                      })
                    }
                    className="flex h-[46px] items-center justify-center gap-1.5 rounded-[14px] bg-acai text-sm font-bold text-white disabled:opacity-60"
                  >
                    <IconCheck size={18} />
                    Vendido · baixar estoque
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </main>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-24 z-10 mx-auto flex max-w-[448px] items-center gap-2.5 rounded-2xl bg-acai px-4 py-3.5 text-sm text-white"
          style={{ width: "calc(100% - 32px)" }}
        >
          <IconCheck className="text-manga" />
          {toast}
        </div>
      )}
    </>
  );
}
