import type { NextConfig } from "next";

function remotePattern(origin: string) {
  const url = new URL(origin);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported image origin protocol: ${origin}`);
  }

  return {
    protocol: url.protocol.slice(0, -1) as "http" | "https",
    hostname: url.hostname,
    port: url.port,
    pathname: "/**",
  };
}

const environmentImageOrigins = (
  process.env.CERTILYS_IMAGE_REMOTE_ORIGINS ?? ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(remotePattern);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      ...environmentImageOrigins,
      {
        protocol: "https",
        hostname: "supabase.certilys.com",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "supabase-cert.talentlistx.com",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
