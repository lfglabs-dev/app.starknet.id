/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
  images: {
    domains: [
      "starknet.id",
      "app.starknet.id",
      "starknetid.netlify.app",
      "robohash.org",
    ],
  },
};
