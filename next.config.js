/** @type {import('next').NextConfig} */

module.exports = {
  rewrites() {
    return {
      beforeFiles: [],
    };
  },
  reactStrictMode: true,
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
    ],
  },
};
