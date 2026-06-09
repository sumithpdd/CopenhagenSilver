import Image from 'next/image';
import Link from 'next/link';
import { BRAND_ASSETS } from '@/lib/branding';

interface SitecoreLogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showLink?: boolean;
}

const sizes = {
  sm: { w: 100, h: 120, className: 'h-9 w-auto max-w-[100px]' },
  md: { w: 130, h: 156, className: 'h-11 md:h-12 w-auto max-w-[130px]' },
  lg: { w: 160, h: 192, className: 'h-14 md:h-16 w-auto max-w-[160px]' },
};

/** Official Sitecore Silver logo only (no badge + banner lockup). */
export function SitecoreLogo({
  href = '/',
  size = 'md',
  showLink = true,
}: SitecoreLogoProps) {
  const dim = sizes[size];

  const content = (
    <Image
      src={BRAND_ASSETS.logo}
      alt="Sitecore"
      width={dim.w}
      height={dim.h}
      className={`${dim.className} object-contain object-left`}
      priority={size === 'md'}
      unoptimized
    />
  );

  if (!showLink) return content;

  return (
    <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
      {content}
    </Link>
  );
}
