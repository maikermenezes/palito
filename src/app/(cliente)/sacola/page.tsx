import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { getCatalog } from "@/lib/data";
import { Bag } from "./Bag";

export const metadata: Metadata = { title: "Sua sacola" };

export default function BagPage() {
  return (
    <Suspense>
      <BagData />
    </Suspense>
  );
}

// Na hora do acesso, não no build (ver CatalogData).
async function BagData() {
  await connection();
  return <Bag products={await getCatalog()} />;
}
