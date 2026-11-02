"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { IconBack, IconInfo } from "@/components/icons";
import { ProductThumb } from "@/components/ProductThumb";
import type { CatalogProduct } from "@/lib/data";
import { money } from "@/lib/format";
import { ASK_CUSTOMER_INFO, PAYMENT_METHODS, type PaymentKey } from "@/lib/ordering";
import { placeOrder } from "../actions";
import { loadCustomer, saveCustomer, useCart } from "../cart";

type Mode = "entrega" | "retirada";

export function Bag({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const { cart, ready, clear } = useCart();
  const [mode, setMode] = useState<Mode>("entrega");
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentKey | "">("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const saved = loadCustomer();
    /* eslint-disable react-hooks/set-state-in-effect -- só existe no aparelho, depois de montar */
    setCustomerName(saved.customerName ?? "");
    setWhatsapp(saved.whatsapp ?? "");
    setAddress(saved.address ?? "");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const lines = products.flatMap((p) => {
    const n = Math.min(cart?.[p.id] ?? 0, p.stock);
    return n > 0 ? [{ ...p, n }] : [];
  });
  const total = lines.reduce((s, l) => s + l.n * l.priceCents, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await placeOrder({
        paymentMethod: payment,
        customer: ASK_CUSTOMER_INFO ? { customerName, whatsapp, fulfillment: mode, address, note } : undefined,
        items: lines.map((l) => ({ productId: l.id, qty: l.n })),
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if (ASK_CUSTOMER_INFO) saveCustomer({ customerName, whatsapp, address });
      clear();
      router.replace(`/pedido/${result.token}`);
    });
  }

  const header = (
    <header className="flex items-center gap-2 p-4">
      <Link
        href="/"
        aria-label="Voltar ao catálogo"
        className="flex size-11 items-center justify-center rounded-[14px] border border-borda bg-white"
      >
        <IconBack />
      </Link>
      <h1 className="font-display text-[26px] font-semibold">Sua sacola</h1>
    </header>
  );

  if (!ready) return header;

  if (lines.length === 0) {
    return (
      <>
        {header}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pb-24 text-center">
          <p className="font-display text-xl font-semibold">Sua sacola está vazia</p>
          <Link href="/" className="btn-primary w-full">
            Escolher sabores
          </Link>
        </main>
      </>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      {header}
      <main className="flex flex-1 flex-col gap-4 px-4 pb-4">
        <section className="rounded-[20px] border border-borda bg-white px-3.5 py-1.5">
          {lines.map((l) => (
            <div key={l.id} className="flex items-center gap-3 border-b border-linha py-2.5">
              <ProductThumb name={l.name} color={l.color} photos={l.photos} w={48} h={48} className="size-12 shrink-0 rounded-xl" popsicle={24} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold">{l.name}</div>
                <div className="text-[13px] text-suave">
                  {l.n} × {money(l.priceCents)}
                </div>
              </div>
              <span className="font-display text-base font-semibold">{money(l.n * l.priceCents)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 pb-2">
            <span className="font-bold">Total</span>
            <span className="font-display text-[22px] font-bold">{money(total)}</span>
          </div>
        </section>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2.5 text-[15px] font-bold">Como você vai pagar?</legend>
          {(Object.entries(PAYMENT_METHODS) as [PaymentKey, string][]).map(([key, label]) => (
            <label
              key={key}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-[15px] font-bold ${payment === key ? "border-acai bg-white ring-1 ring-acai" : "border-borda bg-white"}`}
            >
              <input
                type="radio"
                name="payment"
                value={key}
                required
                checked={payment === key}
                onChange={() => setPayment(key)}
                className="size-5 accent-acai"
              />
              {label}
            </label>
          ))}
        </fieldset>

        {ASK_CUSTOMER_INFO && (
          <>
            <fieldset className="flex flex-col gap-2.5">
              <legend className="mb-2.5 text-[15px] font-bold">Como você quer receber?</legend>
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-borda bg-white p-1">
                {(["entrega", "retirada"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={`h-11 rounded-xl text-[15px] font-bold ${mode === m ? "bg-acai text-white" : ""}`}
                  >
                    {m === "entrega" ? "Entrega" : "Retirada"}
                  </button>
                ))}
              </div>
            </fieldset>

            <section className="flex flex-col gap-3">
              <label className="field-label">
                Seu nome
                <input
                  className="field"
                  required
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </label>
              <label className="field-label">
                WhatsApp
                <input
                  className="field"
                  type="tel"
                  required
                  autoComplete="tel-national"
                  placeholder="(81) 9 0000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </label>
              {mode === "entrega" && (
                <label className="field-label">
                  Endereço de entrega
                  <input
                    className="field"
                    required
                    autoComplete="street-address"
                    placeholder="Rua, número, complemento"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </label>
              )}
              <label className="field-label">
                Observação (opcional)
                <textarea
                  rows={2}
                  className="field h-auto resize-none py-3"
                  placeholder="Ex.: tocar o interfone 302"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            </section>
          </>
        )}

        <div className="flex items-start gap-2.5 rounded-2xl bg-aviso px-3.5 py-3 text-sm leading-snug">
          <IconInfo className="mt-px shrink-0" />
          <span>O pagamento não é feito no app. Você paga direto pra gente na hora de pegar seus picolés.</span>
        </div>
      </main>

      <footer className="sticky bottom-0 flex flex-col gap-2 border-t border-borda bg-leite px-4 pt-3 pb-safe">
        {error && (
          <p role="alert" className="text-center text-sm font-bold text-perigo">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-70">
          {pending ? "Enviando…" : `Enviar pedido · ${money(total)}`}
        </button>
      </footer>
    </form>
  );
}
