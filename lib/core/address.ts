export const UINT128_MAX = (1n << 128n) - 1n;
export const UINT256_MAX = (1n << 256n) - 1n;
export const STARKNET_ADDRESS_MAX = (1n << 251n) - 256n;

export function parseBigInt(value: string | number | bigint, label = "value"): bigint {
  try {
    return BigInt(value);
  } catch {
    throw new Error(`${label} must be an integer`);
  }
}

export function normalizeAddress(value: string): string {
  if (!/^0x[0-9a-fA-F]{1,64}$/.test(value)) {
    throw new Error("Enter a valid 0x-prefixed Starknet address");
  }
  const parsed = BigInt(value);
  if (parsed <= 0n || parsed > STARKNET_ADDRESS_MAX) {
    throw new Error("Starknet address is outside the valid field range");
  }
  return `0x${parsed.toString(16)}`;
}

export function sameAddress(left: string, right: string): boolean {
  try {
    return BigInt(left) === BigInt(right);
  } catch {
    return false;
  }
}

export function normalizeTokenId(value: string | number | bigint, allowZero = false): string {
  const parsed = parseBigInt(value, "Identity ID");
  if (parsed < 0n || parsed > UINT128_MAX || (!allowZero && parsed === 0n)) {
    throw new Error("Identity ID must be a nonzero u128");
  }
  return parsed.toString(10);
}

export function toUint256(value: string | number | bigint): [string, string] {
  const parsed = parseBigInt(value);
  if (parsed < 0n || parsed > UINT256_MAX) {
    throw new Error("Value must fit in a uint256");
  }
  return [
    (parsed & UINT128_MAX).toString(10),
    (parsed >> 128n).toString(10),
  ];
}

export function fromUint256(low: string | bigint, high: string | bigint): bigint {
  const lowValue = BigInt(low);
  const highValue = BigInt(high);
  if (lowValue < 0n || lowValue > UINT128_MAX || highValue < 0n || highValue > UINT128_MAX) {
    throw new Error("Malformed uint256 limbs");
  }
  return lowValue + (highValue << 128n);
}

export function asciiToFelt(value: string): string {
  if (!/^[\x20-\x7e]{1,31}$/.test(value)) {
    throw new Error("Felt text must contain 1 to 31 ASCII characters");
  }
  const bytes = new TextEncoder().encode(value);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export function shortAddress(value: string): string {
  try {
    const normalized = normalizeAddress(value);
    return `${normalized.substring(0, 4)}...${normalized.substring(normalized.length - 3)}`.toLowerCase();
  } catch {
    return value;
  }
}
