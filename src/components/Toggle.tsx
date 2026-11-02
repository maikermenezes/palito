// Só o desenho do interruptor; o botão que o envolve cuida do clique e do aria-pressed.
export function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-7 w-[46px] shrink-0 items-center rounded-full p-[3px] transition-colors ${on ? "justify-end bg-acai" : "justify-start bg-borda-forte"}`}
    >
      <span className="size-[22px] rounded-full bg-white" />
    </span>
  );
}
