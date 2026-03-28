"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export function PokemonImage({ src, alt, width, height, className }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center rounded bg-muted text-muted-foreground text-xs ${className ?? ""}`}
      >
        ?
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
