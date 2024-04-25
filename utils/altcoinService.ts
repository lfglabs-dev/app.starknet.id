import Big from "big.js";
import { CurrenciesRange, CurrencyType, ERC20Contract } from "./constants";
import { applyRateToBigInt, hexToDecimal } from "./feltService";
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
  if (quote === "1") return priceInEth;

  const priceBigInt = new Big(priceInEth);
  const quoteBigInt = new Big(quote);
  const scaleFactor = new Big(10 ** 18);

  const price = priceBigInt.mul(quoteBigInt).div(scaleFactor).toFixed(0);

  return price;
};

export const getPriceForDuration = (
  priceFor1Y: string,
  duration: number
): string => {
  if (duration === 1) return priceFor1Y;

  const priceBigInt = new Big(priceFor1Y);
  const durationBigInt = new Big(duration);

  const price = priceBigInt.mul(durationBigInt).toFixed(0);

  return price;
};

export const getLimitPriceRange = (
  type: CurrencyType,
  price: bigint
): bigint => {
  switch (type) {
    case CurrencyType.ETH:
      return price;
    case CurrencyType.STRK:
      return (
        price +
        BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.STRK)))
      );
    // case CurrencyType.USDC:
    //   return (
    //     price +
    //     BigInt(applyRateToBigInt(price, parseFloat(CurrenciesRange.USDC)))
    //   );
    // case CurrencyType.USDT:
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
  currencyType: CurrencyType,
  quote?: string
): string => {
  if (currencyType === CurrencyType.ETH) {
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
  currencyType: CurrencyType,
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

type AvnuQuote = {
  address: string;
  currentPrice: number;
  decimals: number;
};

export const smartCurrencyChoosing = async (
  tokenBalances: TokenBalance
): Promise<CurrencyType> => {
  let currency = CurrencyType.ETH;
  if (tokenBalances.ETH && !tokenBalances.STRK) return CurrencyType.ETH;
  if (!tokenBalances.ETH && tokenBalances.STRK) return CurrencyType.STRK;
  if (!tokenBalances.ETH && !tokenBalances.STRK) return CurrencyType.STRK;

  // query AVNU api to get STRK quote
  const avnuQuoteDataRes = await fetch(
    `${process.env.NEXT_PUBLIC_AVNU_API}/tokens/short?in=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
  );
  const avnuQuoteData = await avnuQuoteDataRes.json();

  // compute STRK balance into ETH
  const contractAddress = ERC20Contract[CurrencyType.STRK];
  const quoteData = avnuQuoteData.find(
    (data: AvnuQuote) =>
      hexToDecimal(data.address) === hexToDecimal(contractAddress)
  );
  if (!quoteData) return currency;
  const strkBalance = BigInt(tokenBalances.STRK);
  const strkQuote = BigInt(
    Math.round(quoteData.currentPrice * Math.pow(10, quoteData.decimals))
  );
  const strkConvertedBalance =
    (strkBalance * strkQuote) / BigInt(Math.pow(10, quoteData.decimals));

  if (BigInt(tokenBalances.ETH) * BigInt(3) < strkConvertedBalance) {
    currency = CurrencyType.STRK;
  } else {
    currency = CurrencyType.ETH;
  }
  return currency;
};
