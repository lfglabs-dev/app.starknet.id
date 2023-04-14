import { useContract } from "@starknet-react/core";
import starknet_id_abi from "../abi/starknet/starknet_id_abi.json";
import naming_abi from "../abi/starknet/naming_abi.json";
import pricing_abi from "../abi/starknet/pricing_abi.json";
import verifier_abi from "../abi/starknet/verifier_abi.json";
import erc20_abi from "../abi/starknet/erc20_abi.json";
import braavosNFT_abi from "../abi/starknet/braavosNFT_abi.json";
import { Abi } from "starknet";

export function useStarknetIdContract() {
  return useContract({
    abi: starknet_id_abi as Abi,
    address: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT,
  });
}

export function useNamingContract() {
  return useContract({
    abi: naming_abi as Abi,
    address: process.env.NEXT_PUBLIC_NAMING_CONTRACT,
  });
}

export function usePricingContract() {
  return useContract({
    abi: pricing_abi as Abi,
    address: process.env.NEXT_PUBLIC_PRICING_CONTRACT,
  });
}

export function useVerifierIdContract() {
  return useContract({
    abi: verifier_abi as Abi,
    address: process.env.NEXT_PUBLIC_VERIFIER_CONTRACT,
  });
}

export function useEtherContract() {
  return useContract({
    abi: erc20_abi as Abi,
    address: process.env.NEXT_PUBLIC_ETHER_CONTRACT,
  });
}

export function useBraavosNftContract() {
  return useContract({
    abi: braavosNFT_abi as Abi,
    address: process.env.NEXT_PUBLIC_BRAAVOS_SHIELD_CONTRACT,
  });
}
