import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IconCheck } from "@/components/icons";
import { Popsicle } from "@/components/Popsicle";
import { getOrderByToken } from "@/lib/data";
import { money, orderNumber } from "@/lib/format";
import { ASK_CUSTOMER_INFO, paymentLabel } from "@/lib/ordering";

export const metadata: Metadata = { title: "Pedido enviado" };

const STATUS = {
  pending: "Aguardando a gente confirmar",
  done: "Confirmado",
  canceled: "Não conseguimos atender este pedido",
};

export default function OrderPage({ params }: PageProps<"/pedido/[token]">) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-morango">
      <div className="absolute -top-[130px] -right-[110px] size-80 rounded-full bg-manga" />
      <main className="relative flex flex-1 flex-col items-center justify-center gap-[18px] p-6 text-center">
        <div className="relative flex h-[190px] w-[150px] items-end justify-center">
          <Popsicle body="#FFF4F6" top="#3B1035" width={110} />
          <div className="absolute top-0 right-0 flex size-14 items-center justify-center rounded-full bg-acai text-manga">
            <IconCheck size={28} strokeWidth={3} />
          </div>
        </div>
        <h1 className="font-display text-4xl leading-[1.05] font-bold">Pedido enviado!</h1>
        <p className="max-w-[300px] text-[17px] leading-[1.45]">
          {ASK_CUSTOMER_INFO
            ? "A gente vai te chamar no WhatsApp pra confirmar e combinar o pagamento."
            : "Mostre esta tela pra gente na hora de pagar."}
        </p>
        <Suspense fallback={<div className="h-48 w-full rounded-[22px] bg-leite/60" />}>
          <OrderSummary params={params} />
        </Suspense>
      </main>
      <footer className="relative px-4 pt-3 pb-safe">
        <Link href="/" className="btn-primary">
          Voltar ao catálogo
        </Link>
      </footer>
    </div>
  );
}

async function OrderSummary({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  if (!order) notFound();

  return (
    <div className="flex w-full flex-col gap-2 rounded-[22px] bg-leite px-[18px] py-4 text-left text-[15px]">
      <div className="flex justify-between">
        <span className="text-suave">Pedido</span>
        <strong>{orderNumber(order.id)}</strong>
      </div>
      {order.items.map((i) => (
        <div key={i.id} className="flex justify-between gap-3">
          <span>
            {i.qty} × {i.name}
          </span>
          <span className="whitespace-nowrap">{money(i.qty * i.unitPriceCents)}</span>
        </div>
      ))}
      <div className="h-px bg-borda" />
      <div className="flex items-center justify-between">
        <span className="font-bold">Total a pagar</span>
        <span className="font-display text-xl font-bold">{money(order.totalCents)}</span>
      </div>
      <div className="text-[13px] text-suave">
        {[
          order.fulfillment === "entrega" ? "Entrega" : order.fulfillment === "retirada" ? "Retirada" : "",
          paymentLabel(order.paymentMethod) || "pagamento na hora",
          STATUS[order.status],
        ]
          .filter(Boolean)
          .join(" · ")}
      </div>
    </div>
  );
}
