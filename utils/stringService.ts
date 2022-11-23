export function removeStarkFromString(domain: string): string {
  return domain.slice(0, domain.length - 6);
}
