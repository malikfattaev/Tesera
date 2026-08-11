/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace engine + UI packages from their TypeScript source.
  transpilePackages: ["@tesera/core", "@tesera/ui"],
};

export default nextConfig;
