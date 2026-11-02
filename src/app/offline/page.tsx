import type { Metadata } from "next";
import { Popsicle } from "@/components/Popsicle";

export const metadata: Metadata = { title: "Sem internet" };

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
      <Popsicle body="#F6EEE3" top="#3B1035" width={72} shine />
      <h1 className="font-display text-2xl font-semibold">Sem internet por aqui</h1>
      <p className="text-[15px] text-suave">Assim que a conexão voltar, é só tentar de novo.</p>
    </main>
  );
}
