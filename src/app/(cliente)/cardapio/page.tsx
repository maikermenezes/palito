import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogData, CatalogSkeleton } from "../CatalogData";
import { CatalogHeader } from "../CatalogHeader";

export const metadata: Metadata = { title: "Cardápio" };

// Só para ver os sabores: sem sacola nem pedido.
export default function MenuPage() {
  return (
    <div className="flex flex-1 flex-col pb-safe">
      <CatalogHeader title="Nossos sabores" subtitle="Veja o que tem hoje e quantos ainda restam de cada sabor." />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogData orderable={false} />
      </Suspense>
    </div>
  );
}
