import { Call } from "starknet";
import { numberToString } from "./stringService";
import { hexToDecimal } from "./feltService";

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
  duration: number,
  metadata: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "buy",
    calldata: [
      numberToString(tokenId),
      encodedDomain,
      numberToString(duration * 365),
      0,
      hexToDecimal(targetAddress),
      sponsor,
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

function enableRenewal(
  encodedDomain: string,
  price: string,
  metahash: string
): Call[] {
  return [
    {
      contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
      entrypoint: "approve",
      calldata: [
        process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
        "340282366920938463463374607431768211455",
        "340282366920938463463374607431768211455",
      ],
    },
    {
      contractAddress: process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      entrypoint: "enable_renewals",
      calldata: [encodedDomain.toString(), price, 0, metahash],
    },
  ];
}

function disableRenewal(encodedDomain: string): Call[] {
  return [
    {
      contractAddress: process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      entrypoint: "disable_renewals",
      calldata: [encodedDomain.toString()],
    },
  ];
}

function vatTransfer(amount: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
    entrypoint: "transfer",
    calldata: [process.env.NEXT_PUBLIC_VAT_CONTRACT as string, amount, "0"],
  };
}

const registerCalls = {
  approve,
  buy,
  addressToDomain,
  mint,
  enableRenewal,
  disableRenewal,
  buy_discounted,
  vatTransfer,
};

export default registerCalls;
