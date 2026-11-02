"use server";

import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db, orderItems, orders, products } from "@/db";
import { ASK_CUSTOMER_INFO, PAYMENT_METHODS, type PaymentKey } from "@/lib/ordering";

const customerSchema = z
  .object({
    customerName: z.string().trim().min(1, "Conta pra gente seu nome.").max(80),
    whatsapp: z
      .string()
      .trim()
      .refine((v) => v.replace(/\D/g, "").length >= 10, "Confira o número do WhatsApp, com DDD."),
    fulfillment: z.enum(["entrega", "retirada"]),
    address: z.string().trim().max(200),
    note: z.string().trim().max(300),
  })
  .refine((o) => o.fulfillment === "retirada" || o.address.length > 0, {
    message: "Diga o endereço de entrega.",
  });

const orderSchema = z.object({
  paymentMethod: z.enum(Object.keys(PAYMENT_METHODS) as [PaymentKey, ...PaymentKey[]], {
    error: "Escolha como você vai pagar.",
  }),
  customer: ASK_CUSTOMER_INFO ? customerSchema : z.undefined().optional(),
  items: z
    .array(z.object({ productId: z.number().int(), qty: z.number().int().min(1).max(100) }))
    .min(1, "Sua sacola está vazia."),
});

export type OrderInput = {
  paymentMethod: string;
  customer?: z.input<typeof customerSchema>;
  items: { productId: number; qty: number }[];
};
export type OrderResult = { token: string } | { error: string };

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Confira os dados." };
  const data = parsed.data;

  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, data.items.map((i) => i.productId)));

  const items: { productId: number; name: string; unitPriceCents: number; qty: number }[] = [];
  for (const line of data.items) {
    const p = rows.find((r) => r.id === line.productId);
    if (!p || !p.visible) return { error: "Um dos sabores saiu do catálogo. Volte e confira a sacola." };
    if (line.qty > p.stock) {
      return {
        error:
          p.stock === 0
            ? `${p.name} acabou de esgotar. Tire da sacola para continuar.`
            : `Só temos ${p.stock} de ${p.name} agora.`,
      };
    }
    items.push({ productId: p.id, name: p.name, unitPriceCents: p.priceCents, qty: line.qty });
  }

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        paymentMethod: data.paymentMethod,
        ...(data.customer && {
          customerName: data.customer.customerName,
          whatsapp: data.customer.whatsapp,
          fulfillment: data.customer.fulfillment,
          address: data.customer.fulfillment === "entrega" ? data.customer.address : "",
          note: data.customer.note,
        }),
        totalCents: items.reduce((s, i) => s + i.qty * i.unitPriceCents, 0),
      })
      .returning({ id: orders.id, token: orders.token });
    await tx.insert(orderItems).values(items.map((i) => ({ ...i, orderId: created.id })));
    return created;
  });

  return { token: order.token };
}
