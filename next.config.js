/** @type {import('next').NextConfig} */

module.exports = {
  rewrites() {
    return {
      beforeFiles: [
        // if the host is `app.acme.com`,
        // this rewrite will be applied
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "indexer.starknet.id",
            },
          ],
          destination: "/api/indexer/:path*",
        },
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "goerli.indexer.starknet.id",
            },
          ],
          destination: "/api/indexer/:path*",
        },
      ],
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
