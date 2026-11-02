"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { IconCopy, IconDownload, IconPrint, IconShare } from "@/components/icons";
import { Logo, Popsicle } from "@/components/Popsicle";

const DARK = "#3B1035";
const QR_OPTIONS = { errorCorrectionLevel: "H", margin: 0, color: { dark: DARK, light: "#FFFFFF" } } as const;

// Mesmo desenho do componente Popsicle, para desenhar no canvas.
const POPSICLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120"><rect x="33" y="84" width="14" height="32" rx="7" fill="#E2B98A"/><path d="M14 34a26 26 0 0 1 52 0v44a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z" fill="#E8436B"/><path d="M14 34a26 26 0 0 1 52 0v8c-4 7-9 7-13 0c-4 7-9 7-13 0c-4 7-9 7-13 0c-4 7-9 7-13 0z" fill="#3B1035"/></svg>`;

// Os dois links que dá para compartilhar.
const LINKS = {
  pedido: { label: "Fazer pedido", path: "/", cta: ["Aponte a câmera e", "faça seu pedido"], file: "pedido" },
  cardapio: { label: "Só cardápio", path: "/cardapio", cta: ["Aponte a câmera e", "veja os sabores"], file: "cardapio" },
} as const;

type LinkKind = keyof typeof LINKS;

export function QrPoster() {
  const [base, setBase] = useState("");
  const [kind, setKind] = useState<LinkKind>("pedido");
  const [svg, setSvg] = useState("");
  const [copied, setCopied] = useState(false);
  const link = LINKS[kind];
  const url = base && base + link.path;

  useEffect(() => {
    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o endereço só existe no navegador
    setBase(origin.replace(/\/$/, ""));
  }, []);

  useEffect(() => {
    if (url) QRCode.toString(url, { ...QR_OPTIONS, type: "svg" }).then(setSvg);
  }, [url]);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Palito", text: "Peça seus picolés pelo app:", url });
      } catch {}
    } else {
      await copy();
    }
  }

  async function download() {
    const blob = await renderPoster(url, link.cta);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `palito-qr-${link.file}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function choose(next: LinkKind) {
    setKind(next);
    setCopied(false);
  }

  return (
    <>
      <div
        role="group"
        aria-label="Qual link compartilhar"
        className="no-print grid grid-cols-2 gap-2 rounded-2xl border border-borda bg-white p-1"
      >
        {(Object.keys(LINKS) as LinkKind[]).map((k) => (
          <button
            key={k}
            onClick={() => choose(k)}
            aria-pressed={kind === k}
            className={`h-11 rounded-xl text-[15px] font-bold ${kind === k ? "bg-acai text-white" : ""}`}
          >
            {LINKS[k].label}
          </button>
        ))}
      </div>
      <p className="no-print -mt-1.5 text-[13px] text-suave">
        {kind === "pedido"
          ? "O cliente escolhe os sabores e envia o pedido com a forma de pagamento."
          : "O cliente só vê os sabores, preços e quantos restam. Sem sacola."}
      </p>

      <div className="relative flex flex-col items-center gap-3.5 overflow-hidden rounded-[28px] bg-morango px-5 pt-[22px] pb-5 print:mx-auto print:mt-10 print:max-w-[480px] print:[print-color-adjust:exact]">
        <div className="absolute -top-[110px] -right-20 size-[200px] rounded-full bg-manga" />
        <div className="relative">
          <Logo size={32} body="#FFF4F6" top="#3B1035" />
        </div>
        <div className="relative rounded-[22px] bg-white p-3.5">
          <div
            role="img"
            aria-label="QR code que abre o catálogo"
            className="size-[175px] [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div className="absolute top-1/2 left-1/2 flex size-[46px] -translate-1/2 items-center justify-center rounded-xl bg-white">
            <Popsicle body="#E8436B" top="#3B1035" width={22} />
          </div>
        </div>
        <div className="relative text-center font-display text-xl leading-tight font-semibold">
          {link.cta[0]}
          <br />
          {link.cta[1]}
        </div>
        <div className="relative max-w-full truncate rounded-full bg-leite px-3 py-1.5 text-[13px] font-bold">
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "") || "…"}
        </div>
      </div>

      <div className="no-print grid grid-cols-2 gap-2">
        <button onClick={download} disabled={!url} className="flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-acai text-[15px] font-bold text-white">
          <IconDownload size={18} />
          Baixar imagem
        </button>
        <button onClick={() => window.print()} className="flex h-[50px] items-center justify-center gap-2 rounded-2xl border border-borda-forte bg-white text-[15px] font-bold">
          <IconPrint size={18} />
          Imprimir cartaz
        </button>
        <button onClick={copy} disabled={!url} className="flex h-[50px] items-center justify-center gap-2 rounded-2xl border border-borda-forte bg-white text-[15px] font-bold">
          <IconCopy size={18} />
          <span aria-live="polite">{copied ? "Link copiado" : "Copiar link"}</span>
        </button>
        <button onClick={share} disabled={!url} className="flex h-[50px] items-center justify-center gap-2 rounded-2xl border border-borda-forte bg-white text-[15px] font-bold">
          <IconShare size={18} />
          Compartilhar
        </button>
      </div>
    </>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Cartaz 1080×1350 (bom para WhatsApp e Instagram) com o QR no meio.
async function renderPoster(url: string, cta: readonly [string, string]) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const css = getComputedStyle(document.body);
  const display = css.getPropertyValue("--font-fredoka").trim() || "sans-serif";
  const body = css.getPropertyValue("--font-dm-sans").trim() || "sans-serif";

  ctx.fillStyle = "#E8436B";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#FFB238";
  ctx.beginPath();
  ctx.arc(W - 120, 40, 330, 0, Math.PI * 2);
  ctx.fill();

  const popsicle = await loadImage("data:image/svg+xml;charset=utf-8," + encodeURIComponent(POPSICLE_SVG));
  ctx.fillStyle = DARK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 120px ${display}`;
  const word = "palito";
  const wordW = ctx.measureText(word).width;
  const iconW = 74;
  const startX = (W - (wordW + iconW + 24)) / 2;
  ctx.drawImage(popsicle, startX, 120, iconW, iconW * 1.5);
  ctx.textAlign = "left";
  ctx.fillText(word, startX + iconW + 24, 222);

  const box = 660;
  const bx = (W - box) / 2;
  const by = 300;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(bx, by, box, box, 64);
  ctx.fill();

  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, url, { ...QR_OPTIONS, width: box - 100 });
  ctx.drawImage(qr, bx + 50, by + 50);
  const badge = 150;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(W / 2 - badge / 2, by + box / 2 - badge / 2, badge, badge, 36);
  ctx.fill();
  ctx.drawImage(popsicle, W / 2 - 36, by + box / 2 - 54, 72, 108);

  ctx.fillStyle = DARK;
  ctx.textAlign = "center";
  ctx.font = `600 64px ${display}`;
  ctx.fillText(cta[0], W / 2, 1080);
  ctx.fillText(cta[1], W / 2, 1160);
  ctx.font = `700 36px ${body}`;
  ctx.fillText(url.replace(/^https?:\/\//, "").replace(/\/$/, ""), W / 2, 1250);

  return new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}
