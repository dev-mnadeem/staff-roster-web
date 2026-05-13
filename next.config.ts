import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle, so the runtime image ships without
  // node_modules.
  output: "standalone",
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
