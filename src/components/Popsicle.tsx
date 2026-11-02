type Props = {
  body: string;
  top: string;
  width: number;
  shine?: boolean;
  stroke?: string;
  label?: string;
  className?: string;
};

// O símbolo do Palito: picolé com cobertura derretendo.
export function Popsicle({ body, top, width, shine, stroke, label, className }: Props) {
  return (
    <svg
      width={width}
      height={width * 1.5}
      viewBox="0 0 80 120"
      className={className}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <rect x="33" y="84" width="14" height="32" rx="7" fill="#E2B98A" />
      <path
        d="M14 34a26 26 0 0 1 52 0v44a10 10 0 0 1-10 10H24a10 10 0 0 1-10-10z"
        fill={body}
        stroke={stroke}
        strokeWidth={stroke ? 1.5 : undefined}
      />
      <path
        d="M14 34a26 26 0 0 1 52 0v8c-4 7-9 7-13 0c-4 7-9 7-13 0c-4 7-9 7-13 0c-4 7-9 7-13 0z"
        fill={top}
      />
      {shine && <rect x="22" y="48" width="6" height="26" rx="3" fill="#FFFFFF" opacity="0.4" />}
    </svg>
  );
}

export function Logo({ size = 28, body = "#E8436B", top = "#3B1035" }) {
  return (
    <span className="flex items-center gap-2">
      <Popsicle body={body} top={top} width={size * 0.78} />
      <span className="font-display font-bold tracking-tight" style={{ fontSize: size }}>
        palito
      </span>
    </span>
  );
}
