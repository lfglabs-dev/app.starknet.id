import { Call } from "starknet";
import { numberToString } from "../stringService";
import { hexToDecimal } from "../feltService";

function approve(price: string, erc20Address: string): Call {
  return {
    contractAddress: erc20Address,
    entrypoint: "approve",
    calldata: [process.env.NEXT_PUBLIC_NAMING_CONTRACT as string, price, 0],
  };
}

function buy(
  encodedDomain: string,
  tokenId: number,
  sponsor: string,
  durationInYears: number,
  metadata: string,
  discountId?: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "buy",
    calldata: [
      // id
      numberToString(tokenId),
      // domain
      encodedDomain,
      // days
      numberToString(durationInYears * 365),
      // resolver
      0,
      // sponsor
      sponsor,
      // discount
      discountId ?? 0,
      // metadata
      metadata,
    ],
  };
}

function altcoinBuy(
  encodedDomain: string,
  tokenId: number,
  sponsor: string,
  durationInYears: number,
  metadata: string,
  erc20Address: string,
  quoteData: QuoteQueryData,
  discountId?: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "altcoin_buy",
    calldata: [
      // id
      numberToString(tokenId),
      // domain
      encodedDomain,
      // days
      numberToString(durationInYears * 365),
      // resolver
      0,
      // sponsor
      sponsor,
      // discount
      discountId ?? 0,
      // metadata
      metadata,
      // altcoin address
      erc20Address,
      // quote
      quoteData.quote,
      // max quote validity
      quoteData.max_quote_validity,
      // signature
      quoteData.r,
      quoteData.s,
    ],
  };
}

//todo: remove this function
function buy_discounted(
  encodedDomain: string,
  tokenId: number,
  targetAddress: string,
  duration: number,
  discountId: string,
  metadata: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "buy_discounted",
    calldata: [
      numberToString(tokenId),
      encodedDomain,
      numberToString(duration),
      0,
      hexToDecimal(targetAddress),
      discountId,
      metadata,
    ],
  };
}

function mint(tokenId: number): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
    entrypoint: "mint",
    calldata: [numberToString(tokenId)],
  };
}

function mainId(tokenId: number): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
    entrypoint: "set_main_id",
    calldata: [tokenId],
  };
}

function vatTransfer(amount: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
    entrypoint: "transfer",
    calldata: [process.env.NEXT_PUBLIC_VAT_CONTRACT as string, amount, "0"],
  };
}

function renew(
  encodedDomain: string,
  durationInYears: number,
  metadataHash: string,
  sponsor?: string,
  discountId?: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "renew",
    calldata: [
      encodedDomain,
      durationInYears * 365,
      sponsor ?? 0,
      discountId ?? 0,
      "0x" + metadataHash,
    ],
  };
}

function freeRenewal(encodedDomain: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "renew_ar_discount",
    calldata: [encodedDomain],
  };
}

function multiCallRenewal(
  encodedDomains: string[],
  durationInYears: number,
  metadataHash: string,
  sponsor?: string,
  discountId?: string
): Call[] {
  return encodedDomains.map((encodedDomain, index) =>
    renew(encodedDomain, durationInYears, metadataHash, sponsor, discountId)
  );
}

function multiCallFreeRenewals(encodedDomains: string[]): Call[] {
  return encodedDomains.map((encodedDomain) => freeRenewal(encodedDomain));
}

const registrationCalls = {
  approve,
  buy,
  altcoinBuy,
  mainId,
  mint,
  buy_discounted,
  vatTransfer,
  renew,
  multiCallRenewal,
  freeRenewal,
  multiCallFreeRenewals,
};

export default registrationCalls;
