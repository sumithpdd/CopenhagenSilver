'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAppConfig } from '@/components/providers/app-config-provider';

interface BoothLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showLink?: boolean;
}

const sizes = {
  sm: { w: 100, h: 120, className: 'h-9 w-auto max-w-[100px]' },
  md: { w: 130, h: 156, className: 'h-11 md:h-12 w-auto max-w-[130px]' },
  lg: { w: 160, h: 192, className: 'h-14 md:h-16 w-auto max-w-[160px]' },
};

/** Configurable event logo — works with or without Sitecore branding. */
export function BoothLogo({
  href = '/',
  size = 'md',
  showLink = true,
}: BoothLogoProps) {
  const { branding } = useAppConfig();
  const dim = sizes[size];

  const content = (
    <Image
      src={branding.logoPath}
      alt={branding.eventTitle}
      width={dim.w}
      height={dim.h}
      className={`${dim.className} object-contain object-left`}
      priority={size === 'md'}
      unoptimized={branding.logoPath.startsWith('/')}
    />
  );

  if (!showLink) return content;

  return (
    <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}
