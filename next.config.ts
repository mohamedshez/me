import type { NextConfig } from "next";
import { AVATAR_HOST, AVATAR_PATH } from "./src/lib/portrait";
import { CACHE_SECONDS } from "./src/lib/repositories";

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // GitHub sends max-age=300; hold optimized images for the site's 24-hour refresh window.
    minimumCacheTTL: CACHE_SECONDS,
    remotePatterns: [{ protocol: "https", hostname: AVATAR_HOST, pathname: AVATAR_PATH }],
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};
export default config;
