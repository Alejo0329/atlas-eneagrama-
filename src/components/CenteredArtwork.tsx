import { useEffect, useState } from 'react';

interface CenteredArtworkProps {
  src: string;
  alt: string;
  caption: string;
  roman: string;
  title: string;
  accentHex: string;
  size?: 'hero' | 'thumb';
}

export function CenteredArtwork({
  src,
  alt,
  caption,
  roman,
  title,
  accentHex,
  size = 'hero',
}: CenteredArtworkProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (size === 'thumb') {
    return (
      <div className="relative w-full aspect-square overflow-hidden rounded-lg border border-[#2B2F3B] bg-[#14161C] flex items-center justify-center">
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span
              className="font-serif text-3xl font-medium"
              style={{ color: accentHex }}
            >
              {roman}
            </span>
            <span className="mt-1 text-xs text-[#9E9B93]">{title}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <figure className="w-full flex flex-col items-center">
      <div className="w-full max-w-[340px] sm:max-w-[380px] mx-auto aspect-square overflow-hidden rounded-xl border border-[#2C303C] bg-[#0F1116] flex items-center justify-center">
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#1A1D26] to-[#101217]">
            <svg
              viewBox="0 0 120 120"
              className="w-20 h-20 mb-4 opacity-70"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="60" cy="60" r="46" stroke={accentHex} strokeWidth="1.2" />
              <polygon
                points="60,14 99.8,83 20.2,83"
                stroke={accentHex}
                strokeWidth="1"
                opacity="0.7"
              />
            </svg>
            <span className="font-serif text-4xl font-medium" style={{ color: accentHex }}>
              {roman}
            </span>
            <span className="mt-2 text-sm text-[#D6D2C9]">{title}</span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 text-center font-serif italic text-xs sm:text-sm text-[#9E9B93] max-w-md">
        {caption}
      </figcaption>
    </figure>
  );
}
