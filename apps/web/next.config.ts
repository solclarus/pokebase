import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ hostname: "images.pokemon.solclarus.me" }],
  },
};

export default nextConfig;
