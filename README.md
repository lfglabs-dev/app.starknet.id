# Starknet ID mainnet frontend

This repository contains the mainnet-only Starknet ID frontend. It has no
persistent application backend, database, indexer, signer, bot, telemetry
client, or scheduled workload.

All authoritative state comes from Starknet. The browser sends reads, receipt
polls, fee estimates, and simulations to two stateless same-origin functions:

- `POST /api/rpc` protects the server-side Starkscan key and falls back to
  Cartridge only for idempotent reads.
- `GET /api/indexer/identities` obtains untrusted identity transfer
  candidates from Starkscan. Every candidate is validated against `owner_of`.

Braavos receives calls only after state is re-read, fees are estimated, and the
same call list simulates successfully. The application never handles wallet
secrets.

## Local setup

```sh
cp .env.example .env.local
bun install
bun run dev
```

Set `STARKSCAN_API_KEY` in `.env.local`. Contract addresses and ABIs are
part of the typed `SN_MAIN` manifest and are not environment-driven.

## Checks

```sh
bun test
bun run lint
bun run build
```

Live integration checks are opt-in:

```sh
RUN_LIVE_MAINNET_TESTS=true bun test tests/live
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the Vercel firewall and rollout steps.
