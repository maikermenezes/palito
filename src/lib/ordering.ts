// Liga de volta as perguntas de nome, WhatsApp, entrega/retirada e observação no checkout.
export const ASK_CUSTOMER_INFO = false;

export const PAYMENT_METHODS = {
  pix: "Pix",
  cartao: "Crédito/Débito",
  dinheiro: "Dinheiro",
} as const;

export type PaymentKey = keyof typeof PAYMENT_METHODS;

export function paymentLabel(key: string) {
  return PAYMENT_METHODS[key as PaymentKey] ?? "";
}

export function stockLeftLabel(stock: number) {
  return stock === 1 ? "resta 1" : `restam ${stock}`;
}
