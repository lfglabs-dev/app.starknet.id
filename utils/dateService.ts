import { isStarkRootDomain } from "./stringService";

export function timestampToReadableDate(timestamp: number): string {
  // Check if the timestamp is in seconds and convert it to milliseconds
  if (Math.abs(timestamp) < 10000000000) {
    timestamp *= 1000;
  }

  // Create a new Date object using the timestamp
  const date = new Date(timestamp);

  // Use toDateString to get a human-readable date string
  return date.toDateString();
}

export function isIdentityExpiringSoon(identity: FullId): boolean {
  if (!identity?.domain_expiry) return false;
  if (!identity?.domain) return false;
  if (!isStarkRootDomain(identity.domain)) return false;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const threeMonths = 60 * 60 * 24 * 90;

  return Boolean(currentTimestamp + threeMonths > identity.domain_expiry);
}
