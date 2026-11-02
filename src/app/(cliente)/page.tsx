import { Suspense } from "react";
import { CatalogData, CatalogSkeleton } from "./CatalogData";
import { CatalogHeader } from "./CatalogHeader";

export default function CatalogPage() {
  return (
    <div className="flex flex-1 flex-col">
      <CatalogHeader
        title="Escolha seus sabores"
        subtitle="Você faz o pedido aqui e paga direto pra gente — Pix, cartão ou dinheiro."
      />
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogData />
      </Suspense>
    </div>
  );
}
