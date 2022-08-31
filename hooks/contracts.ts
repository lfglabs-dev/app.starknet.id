import { useContract } from "@starknet-react/core";
import starknet_id_abi from "../abi/starknet_id_abi.json";
import naming_abi from "../abi/naming_abi.json";
import pricing_abi from "../abi/pricing_abi.json";
import verifier_abi from "../abi/verifier_abi.json";
import erc20_abi from "../abi/erc20_abi.json";
import { Abi } from "starknet";

export const starknetIdContract: string =
  "0x0798e884450c19e072d6620fefdbeb7387d0453d3fd51d95f5ace1f17633d88b";

export const namingContract: string =
  "0x05cf267a0af6101667013fc6bd3f6c11116a14cda9b8c4b1198520d59f900b17";

export const pricingContract: string =
  "0x0348b9e4e4cbd6516f01c40e7ba90310ff1a9c7c706bab67528196b1a3bd556f";

export const verifierContract: string =
  "0x06520a4a1934c84a385a3088952c3812c96f9e9c614bc4d483daff5622ea9fad";

export const etherContract: string =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

export function useStarknetIdContract() {
  return useContract({
    abi: starknet_id_abi as Abi,
    address: starknetIdContract,
  });
}

export function useNamingContract() {
  return useContract({
    abi: naming_abi as Abi,
    address: namingContract,
  });
}

export function usePricingContract() {
  return useContract({
    abi: pricing_abi as Abi,
    address: pricingContract,
  });
}

export function useVerifierIdContract() {
  return useContract({
    abi: verifier_abi as Abi,
    address: verifierContract,
  });
}

export function useEtherContract() {
  return useContract({
    abi: erc20_abi as Abi,
    address: etherContract,
  });
}
