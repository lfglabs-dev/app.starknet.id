import { Call } from "starknet";

function claimDomain(
  encodedDomain: string,
  r: string,
  s: string,
  maxValidity: number
): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_SOL_SUBDOMAINS as string,
    entrypoint: "claim",
    calldata: [encodedDomain, r, s, maxValidity],
  };
}

function setResolving(encodedDomain: string, targetAddr: string): Call {
  return {
    contractAddress: process.env.NEXT_PUBLIC_SOL_SUBDOMAINS as string,
    entrypoint: "set_resolving",
    calldata: [encodedDomain, "starknet", targetAddr],
  };
}

function setAsMainDomain(encodedDomain: string): Call {
  // As we're not owner of .sol domain on testnet, we use .soldomain for testing purposes
  const rootDomain =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "57437602656154" : "16434";
  return {
    contractAddress: process.env.NEXT_PUBLIC_NAMING_CONTRACT as string,
    entrypoint: "set_address_to_domain",
    calldata: [2, encodedDomain, rootDomain],
  };
}

const SolanaCalls = {
  claimDomain,
  setResolving,
  setAsMainDomain,
};

export default SolanaCalls;
