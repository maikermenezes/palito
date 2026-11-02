import type { Metadata } from "next";
import { Suspense } from "react";
import { getVendorProducts } from "@/lib/data";
import { WalkInForm } from "./WalkInForm";

export const metadata: Metadata = { title: "Venda avulsa" };

export default function WalkInPage() {
  return (
    <Suspense>
      <WalkIn />
    </Suspense>
  );
}

async function WalkIn() {
  const products = await getVendorProducts();
  return <WalkInForm products={products.filter((p) => p.stock > 0)} />;
}
