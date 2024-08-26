import { useContractRead } from "@starknet-react/core";
import { useEtherContract } from "./contracts";
import { Abi } from "starknet";
import { useEffect, useState } from "react";
import {
  ERC20Contract,
  CurrencyType,
  UINT_128_MAX,
  AutoRenewalContracts,
} from "../utils/constants";

export default function useAllowanceCheck(
  erc20: CurrencyType,
  address?: string
): AllowanceStatus {
  const [needsAllowance, setNeedsAllowance] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(BigInt(0));
  const { contract: etherContract } = useEtherContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
      address: ERC20Contract[erc20],
      abi: etherContract?.abi as Abi,
      functionName: "allowance",
      args: [address as string, AutoRenewalContracts[erc20]],
    });

  useEffect(() => {
    const erc20AllowanceRes = erc20AllowanceData as CallResult;

    if (
      erc20AllowanceError ||
      (erc20AllowanceRes &&
        erc20AllowanceRes["remaining"].low !== UINT_128_MAX &&
        erc20AllowanceRes["remaining"].high !== UINT_128_MAX)
    ) {
      setNeedsAllowance(true);
      setCurrentAllowance(BigInt(erc20AllowanceRes["remaining"].low));
    } else {
      setNeedsAllowance(false);
      setCurrentAllowance(BigInt(0));
    }
  }, [erc20AllowanceData, erc20AllowanceError]);

  return { needsAllowance, currentAllowance };
}
