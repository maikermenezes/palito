import Link from "next/link";
import { IconBag, IconBox, IconQr } from "@/components/icons";

const TABS = [
  { href: "/vendedor/estoque", label: "Estoque", Icon: IconBox },
  { href: "/vendedor/pedidos", label: "Pedidos", Icon: IconBag },
  { href: "/vendedor/qrcode", label: "QR code", Icon: IconQr },
] as const;

export function VendorNav({ current }: { current: (typeof TABS)[number]["href"] }) {
  return (
    <nav
      aria-label="Menu do vendedor"
      className="no-print sticky bottom-0 mt-auto grid grid-cols-3 border-t border-borda bg-white px-2 pt-1.5 pb-safe"
    >
      {TABS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
          className={`flex min-h-[52px] flex-col items-center justify-center gap-[3px] text-xs font-bold ${href === current ? "text-morango" : "text-suave"}`}
        >
          <Icon size={22} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
