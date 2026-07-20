# Mainnet deployment

1. Revoke any Starkscan key that has previously appeared in client code,
   planning output, logs, or screenshots.
2. Create a new key and set it as the server-only `STARKSCAN_API_KEY` variable
   in the Vercel project. Do not create a public equivalent.
3. In Vercel Firewall, add same-origin rate-limit rules for:
   - `POST /api/rpc`
   - `GET /api/indexer/identities`
4. Deploy one preview artifact, run the automated and no-submit browser suites,
   and promote that exact artifact.
5. Keep the prior deployment available for rollback. No on-chain migration is
   needed.

The API handlers also enforce same-origin CORS, fixed mainnet upstreams,
method/input allowlists, a 256 KiB JSON-RPC body limit, a 25-item batch limit,
bounded timeouts, and secret-safe errors. Vercel Firewall remains the
distributed rate-limit layer because process-local counters are ineffective in
stateless functions.

Do not delete any separate test deployment as part of this rollout. Shared
infrastructure should be decommissioned only after its other consumers have
been audited separately.
