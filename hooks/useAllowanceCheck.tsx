import { useContractRead } from "@starknet-react/core";
import { useEtherContract } from "./contracts";
import { Abi } from "starknet";
import { useEffect, useState } from "react";
import { UINT_128_MAX } from "../utils/constants";

export default function useAllowanceCheck(address?: string) {
  const [needsAllowance, setNeedsAllowance] = useState(false);
  const { contract: etherContract } = useEtherContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
      address: etherContract?.address as string,
      abi: etherContract?.abi as Abi,
      functionName: "allowance",
      args: [
        address as string,
        process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      ],
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
