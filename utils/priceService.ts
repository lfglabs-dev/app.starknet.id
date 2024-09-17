import { weiToEth } from "./feltService";
import { getDomainLength, selectedDomainsToArray } from "./stringService";

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
  if (!domain) return BigInt(0);

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
  selectedDomains: Record<string, boolean> | undefined,
  durationInDays: number
): bigint {
  if (!selectedDomains) return BigInt(0);

  // Calculate the sum of all prices with getDomainPriceWei
  return selectedDomainsToArray(selectedDomains).reduce(
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

export function getYearlyPriceWei(domain: string): bigint {
  const priceInWei = getDomainPriceWei(365, domain);

  return priceInWei;
}

export function getTotalYearlyPrice(
  selectedDomains: Record<string, boolean> | undefined
): bigint {
  if (!selectedDomains) return BigInt(0);

  const priceInWei = getManyDomainsPriceWei(selectedDomains, 365);

  return priceInWei;
}

export function getDisplayablePrice(priceInWei: bigint): string {
  return weiToEth(priceInWei).toFixed(3).toString();
}

export function getApprovalAmount(
  price: bigint,
  salesTaxAmount: bigint,
  durationInYears: number,
  currentAllowance: bigint
): bigint {
  const TotalPrice = price + salesTaxAmount;
  const baseAmount = TotalPrice / BigInt(durationInYears);
  const baseApproval = baseAmount * BigInt(10); // 10 years of approval
  const amountToApprove = baseApproval + currentAllowance;

  return amountToApprove;
}
export function isApprovalInfinite(approval: bigint | string): boolean {
  // Convert approval to a BigInt if it's not already
  const approvalBigInt = BigInt(approval);

  // Define the threshold values
  const UINT_256_MINUS_UINT_128 =
    (BigInt(1) << BigInt(256)) - (BigInt(1) << BigInt(128));

  // Define a threshold of 10K ETH in wei (10,000 * 10^18)
  const THRESHOLD = BigInt(10000) * BigInt(10 ** 18);

  return (
    approvalBigInt >= THRESHOLD || approvalBigInt === UINT_256_MINUS_UINT_128
  );
}
