/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL_ENV === "production";

module.exports = {
  rewrites() {
    return {
      beforeFiles: [],
    };
  },
  reactStrictMode: true,
  assetPrefix: isProd
    ? process.env.NEXT_PUBLIC_IS_TESTNET === "true"
      ? "https://goerli.cdn.starknet.quest"
      : "https://cdn.starknet.quest"
    : undefined,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  images: {
    domains: [
      "www.starknet.id",
      "starknet.id",
      "app.starknet.id",
      "starknetid.netlify.app",
      "cdn.app.starknet.id",
      "goerli.cdn.app.starknet.id",
    ],
  },
};
