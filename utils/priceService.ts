import { weiToEth } from "./feltService";
import { getDomainLength } from "./stringService";

// Price per day (x 365 per year)
export const PRICES = {
  ONE: BigInt("801369863013699"),
  TWO: BigInt("657534246575343"),
  THREE: BigInt("160000000000000"),
  FOUR: BigInt("36986301369863"),
  FIVE: BigInt("24657534246575"),
};

export function getDomainPriceWei(
  durationInDays: number,
  domain: string
): bigint {
  const domainLength = getDomainLength(domain);
  const durationBigInt = BigInt(durationInDays);

  switch (domainLength) {
    case 0:
      return durationBigInt * PRICES.FIVE;
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

export function getManyDomainsPriceWei(
  domains: string[],
  durationInDays: number
): bigint {
  // Calculate the sum of all prices with getDomainPriceWei
  return domains.reduce(
    (acc, domain) => acc + getDomainPriceWei(durationInDays, domain),
    BigInt(0)
  );
}

export function areDomainSelected(
  selectedDomains: Record<string, boolean> | undefined
): boolean {
  if (!selectedDomains) return false;

  return Object.values(selectedDomains).some((isSelected) => isSelected);
}

export function getYearlyPrice(domain: string): string {
  if (!domain) return "0";

  return weiToEth(String(getDomainPriceWei(365, domain))).toString();
}

export function getTotalYearlyPrice(
  selectedDomains: Record<string, boolean> | undefined
): string {
  if (!selectedDomains) return "0";

  return weiToEth(
    String(
      getManyDomainsPriceWei(
        Object.keys(selectedDomains).filter((key) => selectedDomains[key]),
        1
      )
    )
  ).toString();
}
