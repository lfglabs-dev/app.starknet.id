/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    const identities = [
      "/argent",
      "/discord",
      "/evmConfirmation",
      "/externaldomains/:path*",
      "/github",
      "/gift",
      "/pfpcollections",
      "/solana",
      "/twitter",
    ];
    const renewal = [
      "/freerenewal",
      "/subscription",
      "/subscriptionConfirmation",
    ];
    const removed = ["/newsletter", "/newsletter/:path*", "/quantumleap"];

    return [
      ...identities.map((source) => ({
        source,
        destination: "/identities",
        permanent: false,
      })),
      ...renewal.map((source) => ({
        source,
        destination: "/renewal",
        permanent: false,
      })),
      ...removed.map((source) => ({
        source,
        destination: "/removed",
        permanent: false,
      })),
      {
        source: "/confirmation",
        destination: "/identities",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
