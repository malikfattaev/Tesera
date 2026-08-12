import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let a production build write to its own directory (NEXT_DIST_DIR=.next-build)
  // so it never clobbers the chunks of a running dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Compile the workspace engine + UI packages from their TypeScript source.
  transpilePackages: ["@tesera/core", "@tesera/ui"],
  // Self-contained server output for a small Docker image (Railway).
  output: "standalone",
  // Trace files from the monorepo root so workspace deps are bundled.
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
