export const PRICES = {
  ONE: 0.39,
  TWO: 0.374,
  THREE: 0.34,
  FOUR: 0.085,
  FIVE: 0.009,
};

export function getYearlyPriceFromDomain(domain: string): number {
  const domainLength = domain.includes(".stark")
    ? domain.length - ".stark".length
    : domain.length;

  switch (domainLength) {
    case 0:
      return PRICES.ONE;
    case 1:
      return PRICES.ONE;
    case 2:
      return PRICES.TWO;
    case 3:
      return PRICES.THREE;
    case 4:
      return PRICES.FOUR;
    default:
      return PRICES.FIVE;
  }
}
