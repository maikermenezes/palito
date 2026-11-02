export function money(cents: number) {
  return "R$ " + (cents / 100).toFixed(2).replace(".", ",");
}

// "9,00", "9.5", "R$ 12" → centavos. Retorna NaN se não der para ler.
export function parseMoney(input: string) {
  const clean = input.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  return Math.round(parseFloat(clean) * 100);
}

export function orderNumber(id: number) {
  return "#" + String(id).padStart(4, "0");
}

export function itemsLabel(count: number) {
  return count === 1 ? "1 item" : `${count} itens`;
}

export function timeAgo(date: Date, now = new Date()) {
  const min = Math.round((now.getTime() - date.getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function whatsappLink(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length <= 11) digits = "55" + digits;
  return `https://wa.me/${digits}`;
}
