import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pg"],
  // Minimal production image (Docker `runner` stage copies only the
  // standalone output, not the full node_modules tree).
  output: "standalone",
  sassOptions: {
    includePaths: ["./src/styles"],
  },
};

export default withNextIntl(nextConfig);
