import { getDomainLength } from "./stringService";

export const PRICES = {
  ONE: BigInt("1068493150684932") * BigInt(365),
  TWO: BigInt("657534246575343") * BigInt(365),
  THREE: BigInt("410958904109590") * BigInt(365),
  FOUR: BigInt("232876712328767") * BigInt(365),
  FIVE: BigInt("24657534246575") * BigInt(365),
};

export function getPriceFromDomain(duration: number, domain: string): bigint {
  const domainLength = getDomainLength(domain);
  const durationBigInt = BigInt(duration);

  switch (domainLength) {
    case 0:
      return durationBigInt * PRICES.ONE;
    case 1:
      return durationBigInt * PRICES.ONE;
    case 2:
      return durationBigInt * PRICES.TWO;
    case 3:
      return durationBigInt * PRICES.THREE;
    case 4:
      return durationBigInt * PRICES.FOUR;
    default:
      return durationBigInt * PRICES.FIVE;
  }
}

export function getPriceFromDomains(
  domains: string[],
  duration: number
): bigint {
  // Calculate the sum of all prices with getPriceFromDomain
  return domains.reduce(
    (acc, domain) => acc + getPriceFromDomain(duration, domain),
    BigInt(0)
  );
}

export function areDomainSelected(
  selectedDomains: Record<string, boolean> | undefined
): boolean {
  if (!selectedDomains) return false;

  return Object.values(selectedDomains).some((isSelected) => isSelected);
}
