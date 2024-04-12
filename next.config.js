/** @type {import('next').NextConfig} */
const { withAxiom } = require("next-axiom");

module.exports = withAxiom({
  rewrites() {
    return {
      beforeFiles: [],
    };
  },
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false };
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
  i18n: {
    locales: ["en-US", "zh-CN"],
    defaultLocale: "en-US",
  },
});
