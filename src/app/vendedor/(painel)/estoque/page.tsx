import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VendorNav } from "../VendorNav";
import { IconPlus, IconTag } from "@/components/icons";
import { getVendorProducts } from "@/lib/data";
import { StockList } from "./StockList";

export const metadata: Metadata = { title: "Estoque" };

export default function StockPage() {
  return (
    <>
      <header className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 className="font-display text-[30px] font-semibold">Estoque</h1>
        <div className="flex gap-2">
          <Link
            href="/vendedor/categorias"
            aria-label="Categorias"
            title="Categorias"
            className="flex size-11 items-center justify-center rounded-[14px] border border-borda bg-white"
          >
            <IconTag />
          </Link>
          <Link
            href="/vendedor/produtos/novo"
            className="flex h-11 items-center gap-1.5 rounded-[14px] bg-acai px-4 text-[15px] font-bold text-white"
          >
            <IconPlus size={18} />
            Novo sabor
          </Link>
        </div>
      </header>
      <Suspense fallback={<Skeleton />}>
        <Stock />
      </Suspense>
      <VendorNav current="/vendedor/estoque" />
    </>
  );
}

async function Stock() {
  const products = await getVendorProducts();
  return <StockList products={products} />;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2.5 px-4" aria-busy="true" aria-label="Carregando estoque">
      <div className="h-[68px] rounded-2xl bg-borda/60" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[130px] rounded-[18px] bg-white" />
      ))}
    </div>
  );
}
