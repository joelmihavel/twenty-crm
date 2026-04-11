/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
};

export default nextConfig;
