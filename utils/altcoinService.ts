import { CurrenciesRange, CurrencyType, ERC20Contract } from "./constants";
import { applyRateToBigInt, hexToDecimal } from "./feltService";
import { getDomainPriceWei } from "./priceService";
import { Result } from "starknet";
import { selectedDomainsToArray } from "./stringService";

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

export const getDomainPriceAltcoin = (quote: string, priceInEth: bigint) => {
  if (quote === "1") return priceInEth;

  const quoteBigInt = BigInt(quote);
  const scaleFactor = BigInt(10 ** 18);
  const priceBeforeRounding = (priceInEth * quoteBigInt) / scaleFactor;

  // Rounding to nearest integer
  const remainder =
    (priceInEth * quoteBigInt * BigInt(2)) % (scaleFactor * BigInt(2));
  const roundingAdjustment = remainder >= scaleFactor ? BigInt(1) : BigInt(0);
  const price = priceBeforeRounding + roundingAdjustment;

  return price;
};

export const getPriceForDuration = (
  priceFor1Y: bigint,
  durationInDays: number
): bigint => {
  if (durationInDays === 365) return priceFor1Y;

  // Convert the string to BigInt
  const priceBigInt = BigInt(priceFor1Y);
  const durationBigInt = BigInt(durationInDays);

  // Perform the multiplication
  const price = priceBigInt * durationBigInt;

  // Convert the result back to string
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
  if (priceError || !priceData) return getDomainPriceWei(1, domain).toString();
  else {
    const res = priceData as CallResult;
    // Divide the priceData by the duration to get the renewal price
    const high = res?.["price"].high << BigInt(128);
    const price = res?.["price"].low + high;
    const renew = price / BigInt(duration);
    return renew.toString(10);
  }
};

export const getDomainPrice = (
  domain: string,
  currencyType: CurrencyType,
  durationInDays: number,
  quote?: string
): bigint => {
  if (currencyType === CurrencyType.ETH || !quote) {
    // When quote is missing we return ETH price
    return getDomainPriceWei(durationInDays, domain);
  } else {
    return getDomainPriceAltcoin(
      quote as string,
      getDomainPriceWei(durationInDays, domain)
    );
  }
};

export function getYearlyPrice(
  domain: string,
  currencyType: CurrencyType,
  quote?: string
): bigint {
  const priceInWei = getDomainPrice(domain, currencyType, 365, quote);

  return priceInWei;
}

export function getManyDomainsPrice(
  selectedDomains: Record<string, boolean> | undefined,
  currencyType: CurrencyType,
  durationInDays: number,
  quote?: string
): bigint {
  if (!selectedDomains) return BigInt(0);

  // Calculate the sum of all prices with getPriceFromDomain
  return selectedDomainsToArray(selectedDomains).reduce(
    (acc, domain) =>
      acc + getDomainPrice(domain, currencyType, durationInDays, quote),
    BigInt(0)
  );
}

export function getTotalYearlyPrice(
  selectedDomains: Record<string, boolean> | undefined,
  currencyType: CurrencyType,
  quote?: string
): bigint {
  if (!selectedDomains) return BigInt(0);

  const price = getManyDomainsPrice(selectedDomains, currencyType, 365, quote);

  return price;
}

// function to compute the limit price for the auto renewal contract
// depending on the token selected by the user
export const getAutoRenewAllowance = (
  currencyType: CurrencyType,
  salesTaxRate: number,
  domainPrice: bigint
): bigint => {
  const limitPrice = getLimitPriceRange(currencyType, domainPrice);
  const allowance: bigint = salesTaxRate
    ? BigInt(limitPrice) + BigInt(applyRateToBigInt(limitPrice, salesTaxRate))
    : limitPrice;

  return allowance;
};

type AvnuQuote = {
  address: string;
  currentPrice: number;
  decimals: number;
};

export async function fetchAvnuQuoteData(): Promise<AvnuQuote[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AVNU_API}/tokens/short?in=0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7`
  );
  return response.json();
}

// Determine the currency type based on token balances and STRK quote
export const smartCurrencyChoosing = async (
  tokenBalances: TokenBalance,
  priceInEth?: bigint // price to pay in ETH
): Promise<CurrencyType> => {
  // Early returns based on token presence
  if (tokenBalances.ETH && !tokenBalances.STRK) return CurrencyType.ETH;
  if (!tokenBalances.ETH) return CurrencyType.STRK;

  // Fetch data and find relevant quote
  const avnuQuotes = await fetchAvnuQuoteData();
  const contractAddress = ERC20Contract[CurrencyType.STRK];
  const quoteData = avnuQuotes.find(
    (quote) => hexToDecimal(quote.address) === hexToDecimal(contractAddress)
  );

  // Fallback to ETH if no STRK quote data is found
  if (!quoteData) return CurrencyType.ETH;

  // Convert STRK balance to ETH equivalent
  const strkBalance = BigInt(tokenBalances.STRK);
  const strkQuote = BigInt(
    Math.round(quoteData.currentPrice * Math.pow(10, quoteData.decimals))
  );
  const strkConvertedBalance =
    (strkBalance * strkQuote) / BigInt(Math.pow(10, quoteData.decimals));

  // If domain price is provided, use it to determine currency type
  // if a user can only pay with one currency then we'll select it
  if (priceInEth) {
    const priceBigInt = priceInEth;
    const ethBalance = BigInt(tokenBalances.ETH);
    // if user can only pay in STRK and doesn't have enough ETH to pay for the domain
    if (strkConvertedBalance > priceBigInt && ethBalance < priceBigInt) {
      return CurrencyType.STRK;
    }
    // if user can only pay in ETH and doesn't have enough ETH to pay for the domain
    if (ethBalance > priceBigInt && strkConvertedBalance < priceBigInt) {
      return CurrencyType.ETH;
    }
  }

  // If user is able to pay in both currencies
  // Compare converted STRK balance to ETH balance
  return BigInt(tokenBalances.ETH) * BigInt(3) < strkConvertedBalance
    ? CurrencyType.STRK
    : CurrencyType.ETH;
};

export const tokenNames = {
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7": "ETH",
  "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d": "STRK",
  "0x68f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8": "USDT",
  "0x5574eb6b8789a91466f902c380d978e472db68170ff82a5b650b95a58ddf4ad": "DAI",
  "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8": "USDC",
  "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac": "WBTC",
  "0x42b8f0484674ca266ac5d08e4ac6a3fe65bd3129795def2dca5c34ecc5f96d2": "wstETH",
  "0x319111a5037cbec2b3e638cc34a3474e2d2608299f3e62866e9cc683208c610":
    "Rocket Pool ETH",
};
