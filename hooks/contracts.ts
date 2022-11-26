import { useContract } from "@starknet-react/core";
import starknet_id_abi from "../abi/starknet/starknet_id_abi.json";
import naming_abi from "../abi/starknet/naming_abi.json";
import pricing_abi from "../abi/starknet/pricing_abi.json";
import verifier_abi from "../abi/starknet/verifier_abi.json";
import erc20_abi from "../abi/starknet/erc20_abi.json";
import { Abi } from "starknet";

//L2 Contracts
export const starknetIdContract: string =
  "0x3b960d41dfbe13c9f0c712d81627cf58dc3538180b4e95f9cbec50a29985e80";

export const namingContract: string =
  "0x57d92da64e92c3ab36bb45412e3cc26ec7684c2bdb2998f80cd4be7dccee34c";

// test whitelist
// 0x07bb1b694dea5f117a380ab56d2ad5c656196a14192d549b74a04a59220ab3a3;

export const pricingContract: string =
  "0x6f670aaf8279931e6de21f831530cb990da81f51717d7e80e442aa010bc6ef5";

export const verifierContract: string =
  "0x004107cbd7113cb1dd22cf496add384cbec7baf22a2677a0b377400430584862";

export const etherContract: string =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

// L1 Contracts
export const L1buyingContract = "0xd3d5e8afb1bb4d7c1073f0b704ff78b65818df0f";

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
