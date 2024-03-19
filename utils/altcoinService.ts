import Big from "big.js";
import { CurrenciesRange, CurrenciesType } from "./constants";
import { applyRateToBigInt } from "./feltService";

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
