import { Call } from "starknet";

function transferName(
  resolverContract: string,
  domainEncoded: string,
  targetAddress: string
): Call {
  return {
    contractAddress: resolverContract,
    entrypoint: "transfer_name",
    calldata: [domainEncoded, targetAddress],
  };
}

function setAddresstoDomain(callDataEncodedDomain: (number | string)[]): Call {
  // todo: remove condition once new naming contract version has been updated on mainnet
  const callData = [...callDataEncodedDomain, 0]; // zero is hint argument
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_address_to_domain",
    calldata: callData,
  };
}

const resolverCalls = {
  transferName,
  setAddresstoDomain,
};

export default resolverCalls;
