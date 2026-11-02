import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, strokeWidth = 2, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconBack = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="M15 5l-7 7 7 7" /></Icon>;
export const IconPlus = (p: IconProps) => <Icon strokeWidth={2.5} {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const IconMinus = (p: IconProps) => <Icon strokeWidth={2.5} {...p}><path d="M5 12h14" /></Icon>;
export const IconCheck = (p: IconProps) => <Icon strokeWidth={2.5} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>;
export const IconClose = (p: IconProps) => <Icon strokeWidth={2.5} {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>;
export const IconEye = (p: IconProps) => (
  <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>
);
export const IconBag = (p: IconProps) => (
  <Icon {...p}><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Icon>
);
export const IconBox = (p: IconProps) => (
  <Icon {...p}><path d="M3 8l9-5 9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></Icon>
);
export const IconQr = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </Icon>
);
export const IconLock = (p: IconProps) => (
  <Icon {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon>
);
export const IconInfo = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></Icon>
);
export const IconCamera = (p: IconProps) => (
  <Icon {...p}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></Icon>
);
export const IconDownload = (p: IconProps) => <Icon strokeWidth={2.2} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></Icon>;
export const IconPrint = (p: IconProps) => (
  <Icon {...p}><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v6H7z" /></Icon>
);
export const IconCopy = (p: IconProps) => (
  <Icon {...p}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></Icon>
);
export const IconShare = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
    <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
  </Icon>
);
export const IconChat = (p: IconProps) => (
  <Icon {...p}><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /></Icon>
);
export const IconTrash = (p: IconProps) => (
  <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></Icon>
);
export const IconTag = (p: IconProps) => (
  <Icon {...p}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></Icon>
);
export const IconLogout =(p: IconProps) => (
  <Icon {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" /></Icon>
);
