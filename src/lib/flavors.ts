// Cores da ilustração de picolé usada quando o sabor ainda não tem foto.
export const FLAVOR_COLORS = {
  creme: { label: "Creme", body: "#F6EEE3", top: "#5A3222", tint: "#FBEFE6" },
  rosa: { label: "Rosa", body: "#F58BA5", top: "#FFFFFF", tint: "#FDE3EA" },
  amarelo: { label: "Amarelo", body: "#FFD45C", top: "#FFB238", tint: "#FFF3D1" },
  roxo: { label: "Roxo", body: "#5B1E55", top: "#F6EEE3", tint: "#EFDDEB" },
  caramelo: { label: "Caramelo", body: "#F3E3CC", top: "#B07A45", tint: "#F6ECDF" },
  verde: { label: "Verde", body: "#E7F5B8", top: "#FFFFFF", tint: "#F1F8DA" },
} as const;

export type FlavorColor = keyof typeof FLAVOR_COLORS;

export function flavor(key: string) {
  return FLAVOR_COLORS[key as FlavorColor] ?? FLAVOR_COLORS.creme;
}
