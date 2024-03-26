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
) {
  const [needsAllowance, setNeedsAllowance] = useState(false);
  const { contract: etherContract } = useEtherContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
      address: ERC20Contract[erc20],
      abi: etherContract?.abi as Abi,
      functionName: "allowance",
      args: [address as string, AutoRenewalContracts[erc20]],
    });

  useEffect(() => {
    if (
      erc20AllowanceError ||
      (erc20AllowanceData &&
        erc20AllowanceData["remaining"].low !== UINT_128_MAX &&
        erc20AllowanceData["remaining"].high !== UINT_128_MAX)
    ) {
      setNeedsAllowance(true);
    } else {
      setNeedsAllowance(false);
    }
  }, [erc20AllowanceData, erc20AllowanceError]);

  return needsAllowance;
}
