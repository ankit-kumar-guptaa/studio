import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  width?: number;
  height?: number;
}

export function Logo({ width = 140, height = 40, ...props }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Hiring Dekho Logo"
      width={width}
      height={height}
      {...props}
    />
  );
}
