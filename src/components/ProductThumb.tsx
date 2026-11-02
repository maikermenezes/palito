import type { Photo } from "@/db/schema";
import { flavor } from "@/lib/flavors";
import { photoUrl } from "@/lib/images";
import { Popsicle } from "./Popsicle";

type Props = {
  name: string;
  color: string;
  photos: Photo[];
  w: number;
  h: number;
  className?: string;
  popsicle?: number;
};

// Foto de capa do sabor, ou a ilustração na cor escolhida quando não há foto.
export function ProductThumb({ name, color, photos, w, h, className = "", popsicle }: Props) {
  const f = flavor(color);
  const cover = photos[0];
  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: f.tint }}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- o Cloudinary já otimiza
        <img
          src={photoUrl(cover.url, w, h)}
          alt={name}
          width={w}
          height={h}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <Popsicle body={f.body} top={f.top} width={popsicle ?? Math.round(h * 0.47)} shine />
      )}
    </div>
  );
}
