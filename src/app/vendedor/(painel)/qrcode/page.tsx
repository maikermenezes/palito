import type { Metadata } from "next";
import { Suspense } from "react";
import { VendorNav } from "../VendorNav";
import { IconLogout } from "@/components/icons";
import { requireVendor } from "@/lib/auth";
import { logout } from "../../actions";
import { QrPoster } from "./QrPoster";

export const metadata: Metadata = { title: "QR do catálogo" };

export default function QrPage() {
  return (
    <>
      <header className="no-print px-4 pt-5 pb-2">
        <h1 className="font-display text-[30px] font-semibold">QR do catálogo</h1>
        <p className="mt-1 text-sm text-suave">Imprima e cole no isopor, na geladeira ou mande no WhatsApp.</p>
      </header>
      <main className="flex flex-1 flex-col gap-3.5 px-4 pt-2 pb-4">
        <Suspense fallback={<div className="h-[440px] rounded-[28px] bg-morango/40" />}>
          <Guarded />
        </Suspense>
        <form action={logout} className="no-print mt-auto">
          <button className="flex min-h-11 w-full items-center justify-center gap-2 text-sm font-bold text-suave">
            <IconLogout size={18} />
            Sair da conta
          </button>
        </form>
      </main>
      <VendorNav current="/vendedor/qrcode" />
    </>
  );
}

async function Guarded() {
  await requireVendor();
  return <QrPoster />;
}
