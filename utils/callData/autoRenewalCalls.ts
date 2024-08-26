import { Call } from "starknet";

function approve(
  erc20Contract: string,
  renewalContract: string,
  erc20Price: bigint
): Call {
  return {
    contractAddress: erc20Contract,
    entrypoint: "approve",
    calldata: [renewalContract, erc20Price.toString(), "0"],
  };
}

function enableRenewal(
  autoRenewalContract: string,
  encodedDomain: string,
  price: bigint,
  metahash: string
): Call {
  return {
    contractAddress: autoRenewalContract,
    entrypoint: "enable_renewals",
    calldata: [
      encodedDomain.toString(),
      price.toString(),
      0, // sponsor
      metahash,
    ],
  };
}

function disableRenewal(
  autoRenewalContract: string,
  encodedDomain: string
): Call {
  return {
    contractAddress: autoRenewalContract,
    entrypoint: "disable_renewals",
    calldata: [encodedDomain.toString()],
  };
}

const registrationCalls = {
  approve,
  enableRenewal,
  disableRenewal,
};

export default registrationCalls;
