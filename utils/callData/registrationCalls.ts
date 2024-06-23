import { Call } from "starknet";
import { numberToString, numberToStringHex } from "../stringService";

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
  metadata: HexString,
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
  metadata: HexString,
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

function mint(tokenId: number): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
    entrypoint: "mint",
    calldata: [numberToStringHex(tokenId)],
  };
}

function mainId(tokenId: number): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
    entrypoint: "set_main_id",
    calldata: [tokenId],
  };
}

function vatTransfer(amount: string, erc20_contract: string): Call {
  return {
    contractAddress: erc20_contract,
    entrypoint: "transfer",
    calldata: [process.env.NEXT_PUBLIC_VAT_CONTRACT as string, amount, "0"],
  };
}

function renew(
  encodedDomain: string,
  durationInYears: number,
  metadataHash: HexString,
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
      metadataHash,
    ],
  };
}

function altcoinRenew(
  encodedDomain: string,
  durationInYears: number,
  metadataHash: HexString,
  erc20Address: string,
  quoteData: QuoteQueryData,
  sponsor?: string,
  discountId?: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "altcoin_renew",
    calldata: [
      encodedDomain,
      durationInYears * 365,
      sponsor ?? 0,
      discountId ?? 0,
      metadataHash,
      erc20Address,
      quoteData.quote,
      quoteData.max_quote_validity,
      quoteData.r,
      quoteData.s,
    ],
  };
}

function freeRenewal(encodedDomain: string, ar_contract: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "ar_discount_renew",
    calldata: [encodedDomain, ar_contract],
  };
}

function multiCallRenewal(
  encodedDomains: string[],
  durationInYears: number,
  metadataHash: HexString,
  sponsor?: string,
  discountId?: string
): Call[] {
  return encodedDomains.map((encodedDomain) =>
    renew(encodedDomain, durationInYears, metadataHash, sponsor, discountId)
  );
}

function multiCallRenewalAltcoin(
  encodedDomains: string[],
  durationInYears: number,
  metadataHash: HexString,
  erc20Address: string,
  quoteData: QuoteQueryData,
  sponsor?: string,
  discountId?: string
): Call[] {
  return encodedDomains.map((encodedDomain) =>
    altcoinRenew(
      encodedDomain,
      durationInYears,
      metadataHash,
      erc20Address,
      quoteData,
      sponsor,
      discountId
    )
  );
}

function multiCallFreeRenewals(
  encodedDomains: string[],
  ar_contract: string
): Call[] {
  return encodedDomains.map((encodedDomain) =>
    freeRenewal(encodedDomain, ar_contract)
  );
}

function resetAddrToDomain(): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "reset_address_to_domain",
    calldata: [],
  };
}

export const getFreeRegistrationCalls = (
  newTokenId: number,
  encodedDomain: string,
  signature: string[],
  txMetadataHash: string
) => {
  return [
    mint(newTokenId),
    {
      contractAddress: process.env.NEXT_PUBLIC_DOMAIN_GIFT_CONTRACT as string,
      entrypoint: "get_free_domain",
      calldata: [
        numberToStringHex(newTokenId),
        numberToStringHex(encodedDomain),
        signature.map((s) => numberToStringHex(s)),
        txMetadataHash,
      ].flat(),
    },
  ];
};

const registrationCalls = {
  approve,
  buy,
  altcoinBuy,
  mainId,
  mint,
  vatTransfer,
  renew,
  altcoinRenew,
  multiCallRenewal,
  multiCallRenewalAltcoin,
  freeRenewal,
  multiCallFreeRenewals,
  resetAddrToDomain,
  getFreeRegistrationCalls,
};

export default registrationCalls;
