import { UINT128_MAX, normalizeTokenId } from "@/lib/core/address";

export type RandomFill = (bytes: Uint8Array) => Uint8Array;

export function generateIdentityId(fill?: RandomFill): string {
  const bytes = new Uint8Array(16);
  const randomFill =
    fill ??
    ((target: Uint8Array) => {
      if (!globalThis.crypto?.getRandomValues) {
        throw new Error("Secure random generation is unavailable");
      }
      return globalThis.crypto.getRandomValues(target);
    });
  randomFill(bytes);
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  if (value === 0n || value > UINT128_MAX) {
    throw new Error("Generated identity ID must be a nonzero u128");
  }
  return normalizeTokenId(value);
}

export async function findAvailableIdentityId(
  ownerOf: (tokenId: string) => Promise<string | null>,
  generate: () => string = generateIdentityId,
  maxAttempts = 16
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let tokenId: string;
    try {
      tokenId = normalizeTokenId(generate());
    } catch {
      continue;
    }
    if ((await ownerOf(tokenId)) === null) return tokenId;
  }
  throw new Error("Could not generate an unused identity ID");
}
