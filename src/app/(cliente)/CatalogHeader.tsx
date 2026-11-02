import { Logo } from "@/components/Popsicle";

export function CatalogHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col gap-3.5 px-4 pt-5 pb-3">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-manga px-2.5 py-1.5 text-xs font-bold">Feito em casa</span>
      </div>
      <div>
        <h1 className="font-display text-[30px] leading-[1.1] font-semibold">{title}</h1>
        <p className="mt-1.5 text-sm text-suave">{subtitle}</p>
      </div>
    </header>
  );
}
