import { ec } from 'starknet';

interface SubdomainEntry {
  domain: string;
  publicKey: { x: string; y: string };
  status: string;
}

export function verifySubdomain(entry: SubdomainEntry): boolean {
  try {
    const point = ec.starkCurve.point(entry.publicKey.x, entry.publicKey.y);
    return point !== null && entry.status === 'active';
  } catch {
    return false;
  }
}

export function addSubdomain(entry: SubdomainEntry): void {
  // In production, this would write to a database or smart contract
  console.log(`Subdomain ${entry.domain} added successfully`);
}
