import Big from "big.js";

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
    .div(quoteBigInt)
    .mul(scaleFactor)
    .round(0)
    .toString();

  return price;
};
