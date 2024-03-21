import Big from "big.js";
import { CurrenciesRange, CurrenciesType } from "./constants";
import { applyRateToBigInt } from "./feltService";
import { getPriceFromDomain } from "./priceService";
import { Result } from "starknet";

export const getTokenQuote = async (tokenAddress: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/get_altcoin_quote?erc20_addr=${tokenAddress}`
    );
    return await res.json();
  } catch (error) {
    console.log("Error querying quote from server: ", error);
  }
};

export const getDomainPriceAltcoin = (quote: string, priceInEth: string) => {
  const priceBigInt = new Big(priceInEth);
  const quoteBigInt = new Big(quote);
  const scaleFactor = new Big(10 ** 18);

  const price = priceBigInt
    .mul(quoteBigInt)
    .div(scaleFactor)
    .round(0)
    .toString();

  return price;
};

export const getQuoteInWad = (quote: string) => {
  const quoteBigInt = new Big(quote);
  const scaleFactor = new Big(10 ** 18);

  const res = quoteBigInt.mul(scaleFactor).round(0).toString();

  return res;
};

export const getLimitPriceRange = (
  type: CurrenciesType,
  price: bigint
): bigint => {
  switch (type) {
    case CurrenciesType.ETH:
      return price;
    case CurrenciesType.STRK:
      return (
        price +
        BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.STRK)))
      );
    // case CurrenciesType.USDC:
    //   return (
    //     price +
    //     BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.USDC)))
    //   );
    // case CurrenciesType.USDT:
    //   return (
    //     price +
    //     BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.USDT)))
    //   );
    default:
      return price;
  }
};

export const getRenewalPriceETH = (
  priceError: Error | null,
  priceData: Result | undefined,
  domain: string,
  duration: number
): string => {
  if (priceError || !priceData) return getPriceFromDomain(1, domain).toString();
  else {
    // Divide the priceData by the duration to get the renewal price
    const high = priceData?.["price"].high << BigInt(128);
    const price = priceData?.["price"].low + high;
    const renew = price / BigInt(duration);
    return renew.toString(10);
  }
};

export const getDomainPrice = (
  domain: string,
  currencyType: CurrenciesType,
  quote?: string
): string => {
  if (currencyType === CurrenciesType.ETH) {
    return getPriceFromDomain(1, domain).toString();
  } else {
    return getDomainPriceAltcoin(
      quote as string,
      getPriceFromDomain(1, domain).toString()
    );
  }
};

// function to compute the limit price for the auto renewal contract
// depending on the token selected by the user
export const getAutoRenewAllowance = (
  currencyType: CurrenciesType,
  salesTaxRate: number,
  domainPrice: string
): string => {
  const limitPrice = getLimitPriceRange(currencyType, BigInt(domainPrice));
  const allowance: string = salesTaxRate
    ? (
        BigInt(limitPrice) + BigInt(applyRateToBigInt(limitPrice, salesTaxRate))
      ).toString()
    : limitPrice.toString();

  return allowance;
};
