"use client";

import Link from "next/link";
import { startTransition, useActionState, useId, useRef, useState, useTransition } from "react";
import type { Photo, products } from "@/db/schema";
import { IconBack, IconCamera, IconClose, IconPlus } from "@/components/icons";
import { Popsicle } from "@/components/Popsicle";
import { Toggle } from "@/components/Toggle";
import type { Category } from "@/lib/data";
import { FLAVOR_COLORS, flavor } from "@/lib/flavors";
import { photoUrl } from "@/lib/images";
import { deleteProduct, saveProduct, signUpload } from "../../actions";

type Product = typeof products.$inferSelect;
const MAX_PHOTOS = 4;

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, action, saving] = useActionState(saveProduct, undefined);
  const [deleting, startDelete] = useTransition();
  const [photos, setPhotos] = useState<Photo[]>(product?.photos ?? []);
  const [color, setColor] = useState(product?.color ?? "creme");
  const [visible, setVisible] = useState(product?.visible ?? true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  // Id único: o Next guarda a tela anterior escondida na página, então "categoryId" fixo se repetiria.
  const categoryFieldId = useId();
  const replaceCover = useRef(false);

  const f = flavor(color);
  const cover = photos[0];

  function pickPhotos(replace: boolean) {
    replaceCover.current = replace;
    fileInput.current?.click();
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const replace = replaceCover.current;
    const room = replace ? 1 : MAX_PHOTOS - photos.length;
    const chosen = Array.from(files).slice(0, room);
    setUploading(true);
    setUploadError("");
    try {
      const uploaded = await Promise.all(chosen.map(upload));
      setPhotos((prev) => (replace ? [uploaded[0], ...prev.slice(1)] : [...prev, ...uploaded]));
    } catch {
      setUploadError("Não deu para enviar a foto. Confira a internet e tente de novo.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function makeCover(i: number) {
    setPhotos((prev) => [prev[i], ...prev.filter((_, j) => j !== i)]);
  }

  function remove(i: number) {
    setPhotos((prev) => prev.filter((_, j) => j !== i));
  }

  function onDelete() {
    if (!product || !confirm(`Excluir "${product.name}"? Isso não tem volta.`)) return;
    startDelete(() => deleteProduct(product.id));
  }

  // Sem `action={...}` no form: o React limparia os campos se o servidor devolver erro.
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      <input type="hidden" name="color" value={color} />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />

      <header className="flex items-center gap-2 p-4">
        <Link
          href="/vendedor/estoque"
          aria-label="Voltar ao estoque"
          className="flex size-11 items-center justify-center rounded-[14px] border border-borda bg-white"
        >
          <IconBack />
        </Link>
        <h1 className="font-display text-[26px] font-semibold">{product ? "Editar sabor" : "Novo sabor"}</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-4">
        <section className="flex flex-col gap-2.5">
          <div
            className="relative flex h-[210px] items-center justify-center overflow-hidden rounded-[22px]"
            style={{ background: f.tint }}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- o Cloudinary já otimiza
              <img src={photoUrl(cover.url, 358, 210)} alt="Foto de capa" className="h-full w-full object-cover" />
            ) : (
              <Popsicle body={f.body} top={f.top} width={96} shine label="Ilustração do picolé" />
            )}
            {cover && (
              <span className="absolute top-2.5 left-2.5 rounded-full bg-acai px-2 py-1 text-[11px] font-bold text-white">
                Foto de capa
              </span>
            )}
            <button
              type="button"
              disabled={uploading}
              onClick={() => pickPhotos(!!cover)}
              className="absolute right-2.5 bottom-2.5 flex h-11 items-center gap-1.5 rounded-[14px] bg-white px-3.5 text-sm font-bold disabled:opacity-70"
            >
              <IconCamera size={18} />
              {uploading ? "Enviando…" : cover ? "Trocar foto" : "Pôr foto"}
            </button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
                <div key={p.publicId} className="relative aspect-square">
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    aria-label={i === 0 ? "Esta é a capa" : `Usar foto ${i + 1} como capa`}
                    className={`size-full overflow-hidden rounded-[14px] ${i === 0 ? "border-2 border-acai" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- o Cloudinary já otimiza */}
                    <img src={photoUrl(p.url, 80, 80)} alt="" className="size-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Tirar foto ${i + 1}`}
                    className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-acai text-white"
                  >
                    <IconClose size={14} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => pickPhotos(false)}
                  aria-label="Adicionar foto"
                  className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-[14px] border-2 border-dashed border-borda-forte bg-white text-[11px] font-bold"
                >
                  <IconPlus size={20} />
                  Foto
                </button>
              )}
            </div>
          )}
          {uploadError && (
            <p role="alert" className="text-sm font-bold text-perigo">
              {uploadError}
            </p>
          )}
          <p className="text-[13px] text-suave">
            Tire da câmera ou escolha da galeria. Até 4 fotos; a primeira vira capa no catálogo. Toque numa
            foto para fazer dela a capa.
          </p>
        </section>

        <label className="field-label">
          Nome do sabor
          <input name="name" required defaultValue={product?.name} placeholder="Ex.: Ninho com Nutella" className="field" />
        </label>
        <div className="field-label">
          <span className="flex items-center justify-between">
            <label htmlFor={categoryFieldId}>Categoria</label>
            <Link href="/vendedor/categorias" className="text-[13px] font-bold text-suave underline">
              Editar categorias
            </Link>
          </span>
          <select id={categoryFieldId} name="categoryId" defaultValue={product?.categoryId ?? ""} className="field">
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <label className="field-label">
          Descrição
          <textarea
            name="description"
            rows={2}
            defaultValue={product?.description}
            className="field h-auto resize-none py-3"
          />
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="field-label">
            Preço (R$)
            <input
              name="price"
              required
              inputMode="decimal"
              placeholder="0,00"
              defaultValue={product ? (product.priceCents / 100).toFixed(2).replace(".", ",") : ""}
              className="field"
            />
          </label>
          <label className="field-label">
            Em estoque
            <input name="stock" type="number" min={0} inputMode="numeric" defaultValue={product?.stock ?? 0} className="field" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="field-label">
            Avisar quando restar
            <input
              name="lowStockAt"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={product?.lowStockAt ?? 5}
              className="field"
            />
          </label>
          <label className="field-label">
            Etiqueta
            <input name="tag" maxLength={20} defaultValue={product?.tag} placeholder="Ex.: Novo" className="field" />
          </label>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-bold">Cor do picolé (quando não tem foto)</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FLAVOR_COLORS).map(([key, c]) => (
              <button
                key={key}
                type="button"
                onClick={() => setColor(key)}
                aria-pressed={color === key}
                aria-label={c.label}
                className={`flex size-12 items-center justify-center rounded-[14px] ${color === key ? "ring-2 ring-acai ring-offset-2 ring-offset-leite" : ""}`}
                style={{ background: c.tint }}
              >
                <Popsicle body={c.body} top={c.top} width={20} stroke="#F2D9E0" />
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-pressed={visible}
          className="flex min-h-14 items-center justify-between rounded-2xl border border-borda bg-white px-3.5 text-left"
        >
          <span className="flex flex-col">
            <strong className="text-[15px]">Mostrar no catálogo</strong>
            <span className="text-[13px] text-suave">
              {visible ? "Clientes podem ver e pedir" : "Fica escondido dos clientes"}
            </span>
          </span>
          <Toggle on={visible} />
        </button>
        {visible && <input type="hidden" name="visible" value="on" />}

        {product && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="h-12 text-[15px] font-bold text-perigo"
          >
            {deleting ? "Excluindo…" : "Excluir sabor"}
          </button>
        )}
      </main>

      <footer className="sticky bottom-0 flex flex-col gap-2 border-t border-borda bg-leite px-4 pt-3 pb-safe">
        {state?.error && (
          <p role="alert" className="text-center text-sm font-bold text-perigo">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={saving || uploading} className="btn-primary disabled:opacity-70">
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </footer>
    </form>
  );
}

// Reduz fotos grandes da câmera antes de mandar, para gastar menos dados.
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5e6) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

async function upload(file: File): Promise<Photo> {
  const sig = await signUpload();
  const body = new FormData();
  body.append("file", await shrink(file));
  body.append("api_key", sig.apiKey);
  body.append("timestamp", String(sig.timestamp));
  body.append("folder", sig.folder);
  body.append("signature", sig.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return { url: json.secure_url, publicId: json.public_id };
}
