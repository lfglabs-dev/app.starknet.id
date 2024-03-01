import { useContractRead } from "@starknet-react/core";
import { useMulticallContract } from "./contracts";
import { Abi, CairoCustomEnum, Call, RawArgs, hash } from "starknet";
import { useEffect, useState } from "react";
import { CurrenciesContract, UINT_128_MAX } from "../utils/constants";

export default function useBalances(address?: string) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [callData, setCallData] = useState<Call[]>([]);
  // const [needsAllowance, setNeedsAllowance] = useState(false);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
      address: multicallContract?.address as string,
      abi: multicallContract?.abi as Abi,
      functionName: "aggregate",
      args: [
        address as string,
        process.env.NEXT_PUBLIC_RENEWAL_CONTRACT as string,
      ],
    });

  useEffect(() => {
    if (!address) {
      setCallData([]);
      return;
    }
    //
    let currencies = Object.values(CurrenciesContract);
    let calls = [];
    currencies.forEach((currency) => {
      calls.push({
        execution: new CairoCustomEnum({
          Static: {},
        }),
        to: new CairoCustomEnum({
          Hardcoded: currency,
        }),
        selector: new CairoCustomEnum({
          Hardcoded: hash.getSelectorFromName("balance_of"),
        }),
        calldata: [new CairoCustomEnum({ Hardcoded: address })],
      });
    });
    setCallData([calls as RawArgs]);
  }, [address]);

  // useEffect(() => {
  //   if (
  //     erc20AllowanceError ||
  //     (erc20AllowanceData &&
  //       erc20AllowanceData["remaining"].low !== UINT_128_MAX &&
  //       erc20AllowanceData["remaining"].high !== UINT_128_MAX)
  //   ) {
  //     setNeedsAllowance(true);
  //   } else {
  //     setNeedsAllowance(false);
  //   }
  // }, [erc20AllowanceData, erc20AllowanceError]);

  return balances;
}
