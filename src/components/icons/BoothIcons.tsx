import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (size?: number) => ({
  width: size ?? 24,
  height: size ?? 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function IconCamera({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <path d="M4 8h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="14" r="3.5" />
    </svg>
  );
}

export function IconGallery({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="9.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSparkles({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconUser({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

export function IconMail({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export function IconMapPin({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconArrowRight({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCalendar({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

export function IconShield({ size, className, ...props }: IconProps) {
  const d = defaults(size);
  return (
    <svg {...d} className={className} aria-hidden {...props}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
