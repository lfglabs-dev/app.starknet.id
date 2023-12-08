import { Call } from "starknet";
import { numberToString } from "../stringService";
import { hexToDecimal } from "../feltService";

function approve(price: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
    entrypoint: "approve",
    calldata: [process.env.NEXT_PUBLIC_NAMING_CONTRACT as string, price, 0],
  };
}

function buy(
  encodedDomain: string,
  tokenId: number,
  targetAddress: string,
  sponsor: string,
  durationInYears: number,
  metadata: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "buy",
    calldata: [
      numberToString(tokenId),
      encodedDomain,
      numberToString(durationInYears * 365),
      0,
      hexToDecimal(targetAddress),
      "0", // force sponsor to 0
      metadata,
    ],
  };
}

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

function addressToDomain(encodedDomain: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_address_to_domain",
    calldata: [1, encodedDomain],
  };
}

function mint(tokenId: number): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
    entrypoint: "mint",
    calldata: [numberToString(tokenId)],
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
  metadataHashes: string[],
  sponsor?: string,
  discountId?: string
): Call[] {
  return encodedDomains.map((encodedDomain, index) =>
    renew(
      encodedDomain,
      durationInYears,
      metadataHashes[index],
      sponsor,
      discountId
    )
  );
}

function multiCallFreeRenewals(encodedDomains: string[]): Call[] {
  return encodedDomains.map((encodedDomain) => freeRenewal(encodedDomain));
}

const registrationCalls = {
  approve,
  buy,
  addressToDomain,
  mint,
  buy_discounted,
  vatTransfer,
  renew,
  multiCallRenewal,
  freeRenewal,
  multiCallFreeRenewals,
};

export default registrationCalls;
