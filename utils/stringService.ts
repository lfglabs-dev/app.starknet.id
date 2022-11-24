export function removeStarkFromString(domain: string): string {
  return domain.slice(0, domain.length - 6);
}

export function isStarkDomain(domain: string): boolean {
  return domain.includes(".stark");
}
