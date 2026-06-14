import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const Svg = ({ children, ...p }: P & { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} {...p}>
    {children}
  </svg>
);

export const MenuIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="5" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="19" cy="12" r="1.2" />
  </Svg>
);

export const BackIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const MicIcon = (p: P) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0014 0" />
    <path d="M12 18v3" />
  </Svg>
);

export const HeartIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-7-4.5-9-9.5C1 6 6 3 9 6c1 1 2 2 3 3 1-1 2-2 3-3 3-3 8 0 6 5.5-2 5-9 9.5-9 9.5z" />
  </Svg>
);

export const HeartIconFilled = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 21s-7-4.5-9-9.5C1 6 6 3 9 6c1 1 2 2 3 3 1-1 2-2 3-3 3-3 8 0 6 5.5-2 5-9 9.5-9 9.5z" />
  </svg>
);

export const SendIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const CheckIcon = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M5 12l4 4L19 6" />
  </Svg>
);

/* Door icons */
export const DoorMemoryIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6M12 17v6M1 12h6M17 12h6" />
  </Svg>
);
export const DoorBodyIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 2C8 6 8 11 12 16c4-5 4-10 0-14z" />
    <path d="M12 16v6" />
  </Svg>
);
export const DoorOthersIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="17" cy="13" r="2.5" />
    <path d="M2 21c0-3 3-6 7-6s7 3 7 6" />
  </Svg>
);
export const DoorFearIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path d="M12 7v6l3 2" />
  </Svg>
);
export const DoorDuaIcon = (p: P) => (
  <Svg {...p}>
    <path d="M7 22V11l5-7 5 7v11" />
    <path d="M10 22v-7h4v7" />
  </Svg>
);
export const DoorSilenceIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
  </Svg>
);
export const DoorActionIcon = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

