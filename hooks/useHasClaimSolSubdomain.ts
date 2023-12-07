import { useContractRead } from "@starknet-react/core";
import { useSolSubdomainContract } from "./contracts";
import { Abi } from "starknet";
import { useEffect, useState } from "react";
import { utils } from "starknetid.js";
import { hexToDecimal } from "../utils/feltService";

export default function useHasClaimSolSubdomain(
  snsDomains: string[],
  address: string
) {
  const [claimedDomains, setClaimedDomains] = useState<string[]>([]);
  const { contract } = useSolSubdomainContract();
  const { data: claimedData, error: claimedError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "were_claimed",
    args: [
      snsDomains.map((domain) => utils.encodeDomain(domain)[0].toString()),
    ],
  });

  useEffect(() => {
    if (!address || claimedError || !claimedData) return;
    let domains: string[] = [];
    (claimedData as BigInt[]).map((claimAddr, index) => {
      if (claimAddr.toString() === hexToDecimal(address)) {
        domains.push(snsDomains[index]);
      }
    });
    setClaimedDomains(domains);
  }, [claimedData, claimedError, address, snsDomains]);

  return claimedDomains;
}
