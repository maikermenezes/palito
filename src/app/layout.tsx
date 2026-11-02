import type { Metadata, Viewport } from "next";
import { DM_Sans, Fredoka } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: { default: "Palito · picolés gourmet", template: "%s · Palito" },
  description: "Picolés gourmet feitos em casa. Peça pelo app e pague na entrega.",
  applicationName: "Palito",
  appleWebApp: { capable: true, title: "Palito", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#FFF4F6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fredoka.variable} ${dmSans.variable} antialiased`}>
      <body className="mx-auto flex min-h-dvh max-w-[480px] flex-col font-sans shadow-[0_0_0_1px_var(--color-borda)]">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
