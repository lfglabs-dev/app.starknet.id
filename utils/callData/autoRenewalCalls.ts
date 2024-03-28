import { Call } from "starknet";

function approve(erc20_contract: string, renewal_contract: string): Call {
  return {
    contractAddress: erc20_contract,
    entrypoint: "approve",
    calldata: [
      renewal_contract,
      "340282366920938463463374607431768211455",
      "340282366920938463463374607431768211455",
    ],
  };
}

function enableRenewal(
  autoRenewalContract: string,
  encodedDomain: string,
  price: string,
  metahash: string
): Call {
  return {
    contractAddress: autoRenewalContract,
    entrypoint: "enable_renewals",
    calldata: [
      encodedDomain.toString(),
      price,
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
