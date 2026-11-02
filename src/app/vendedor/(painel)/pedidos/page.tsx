import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VendorNav } from "../VendorNav";
import { IconPlus } from "@/components/icons";
import { getVendorOrders } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { OrdersList, type OrderView } from "./OrdersList";

export const metadata: Metadata = { title: "Pedidos" };

export default function OrdersPage() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <Orders />
      </Suspense>
      <VendorNav current="/vendedor/pedidos" />
    </>
  );
}

async function Orders() {
  const orders = await getVendorOrders();
  const now = new Date();
  const views: OrderView[] = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    whatsapp: o.whatsapp,
    fulfillment: o.fulfillment,
    paymentMethod: o.paymentMethod,
    address: o.address,
    note: o.note,
    status: o.status,
    totalCents: o.totalCents,
    when: timeAgo(o.createdAt, now),
    items: o.items.map((i) => ({ name: i.name, qty: i.qty, stock: i.stock })),
  }));
  return <OrdersList orders={views} />;
}

function Skeleton() {
  return (
    <>
      <header className="flex flex-col gap-3 px-4 pt-5 pb-3">
        <h1 className="font-display text-[30px] font-semibold">Pedidos</h1>
        <Link
          href="/vendedor/pedidos/avulsa"
          className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borda-forte bg-white text-[15px] font-bold"
        >
          <IconPlus size={18} />
          Registrar venda avulsa
        </Link>
      </header>
      <div className="flex flex-col gap-3 px-4" aria-busy="true" aria-label="Carregando pedidos">
        {[0, 1].map((i) => (
          <div key={i} className="h-52 rounded-[20px] bg-white" />
        ))}
      </div>
    </>
  );
}
