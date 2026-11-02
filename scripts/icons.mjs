// Gera os ícones do app em public/icons a partir do símbolo do Palito.
// Uso: node scripts/icons.mjs
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const popsicle = (x, y, w) => {
  const s = w / 80;
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="33" y="84" width="14" height="32" rx="7" fill="#E2B98A"/>
    <path d="M14 34a26 26 0 0 1 52 0v44a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z" fill="#E8436B"/>
    <path d="M14 34a26 26 0 0 1 52 0v8c-4 7-9 7-13 0c-4 7-9 7-13 0c-4 7-9 7-13 0c-4 7-9 7-13 0z" fill="#FFB238"/>
  </g>`;
};

// `scale` = fração do lado ocupada pela altura do picolé; `radius` = cantos (0 para maskable).
const icon = (size, scale, radius) => {
  const h = size * scale;
  const w = h / 1.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="#3B1035"/>
    ${popsicle((size - w) / 2, (size - h) / 2, w)}
  </svg>`;
};

await mkdir("public/icons", { recursive: true });
const out = [
  ["icon-192.png", icon(192, 0.68, 0)],
  ["icon-512.png", icon(512, 0.68, 0)],
  ["maskable-512.png", icon(512, 0.5, 0)],
  ["apple-touch-icon.png", icon(180, 0.62, 0)],
];
for (const [name, svg] of out) {
  await sharp(Buffer.from(svg)).png().toFile(`public/icons/${name}`);
}
await writeFile("src/app/icon.svg", icon(64, 0.72, 14));
console.log("Ícones gerados em public/icons e src/app/icon.svg");
