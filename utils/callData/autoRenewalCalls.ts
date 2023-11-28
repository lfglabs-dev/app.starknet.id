import { Call } from "starknet";

function approve(): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_ETHER_CONTRACT as string,
    entrypoint: "approve",
    calldata: [
      process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      "340282366920938463463374607431768211455",
      "340282366920938463463374607431768211455",
    ],
  };
}

function enableRenewal(
  encodedDomain: string,
  price: string,
  metahash: string
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
    entrypoint: "enable_renewals",
    calldata: [
      encodedDomain.toString(),
      price,
      0, // sponsor
      metahash,
    ],
  };
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

const registrationCalls = {
  approve,
  enableRenewal,
  disableRenewal,
};

export default registrationCalls;
