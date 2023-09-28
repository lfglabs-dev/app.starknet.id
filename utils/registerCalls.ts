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

function renewal(encodedDomain: string, price: string): Call[] {
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
      entrypoint: "toggle_renewals",
      calldata: [encodedDomain.toString(), price, 0],
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

function updateProfilePicture(
  nftContractAddress: string,
  nft_id: string,
  id: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_NFT_PP_VERIFIER as string,
    entrypoint: "set_native_pp",
    calldata: [nftContractAddress, nft_id, 0, id],
  };
}

const registerCalls = {
  approve,
  buy,
  addressToDomain,
  mint,
  renewal,
  buy_discounted,
  vatTransfer,
  updateProfilePicture,
};

export default registerCalls;
