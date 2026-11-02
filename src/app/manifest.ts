import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Palito · picolés gourmet",
    short_name: "Palito",
    description: "Picolés gourmet feitos em casa. Peça pelo app e pague na entrega.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF4F6",
    theme_color: "#FFF4F6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Pedidos", url: "/vendedor/pedidos", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Estoque", url: "/vendedor/estoque", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
