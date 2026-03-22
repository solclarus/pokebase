import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.pokemon.solclarus.me" }],
  },
};

export default nextConfig;
