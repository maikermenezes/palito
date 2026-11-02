// Pede ao Cloudinary uma versão recortada e otimizada da foto.
export function photoUrl(url: string, w: number, h: number) {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_fill,g_auto,w_${w * 2},h_${h * 2}/`);
}
