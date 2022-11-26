export function getPriceFromDomain(domain: string): number {
  switch (domain.length) {
    case 1:
      return 0.39;
    case 2:
      return 0.374;
    case 3:
      return 0.34;
    case 4:
      return 0.085;
    default:
      return 0.009;
  }
}
