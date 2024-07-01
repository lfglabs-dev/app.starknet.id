import { useContractRead } from "@starknet-react/core";
import { useMulticallContract } from "./contracts";
import { Abi, BlockTag, CairoCustomEnum, Call, RawArgs, hash } from "starknet";
import { useEffect, useState } from "react";
import {
  ERC20Contract,
  CurrencyType,
  AutoRenewalContracts,
} from "../utils/constants";
import { fromUint256 } from "../utils/feltService";

export default function useNeedsAllowances(
  address?: string
): TokenNeedsAllowance {
  const [needsAllowances, setNeedsAllowances] = useState<
    Record<string, boolean>
  >({});
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
      address: multicallContract?.address as string,
      abi: multicallContract?.abi as Abi,
      functionName: "aggregate",
      args: callData,
      watch: true,
      blockIdentifier: BlockTag.PENDING,
    });

  useEffect(() => {
    const allowancesCallData = () => {
      const currencyContracts = Object.values(ERC20Contract);
      const currencyNames = Object.values(CurrencyType);

      const calls: MulticallCallData[] = [];
      currencyContracts.forEach((currency, index) => {
        calls.push({
          execution: new CairoCustomEnum({
            Static: {},
          }),
          to: new CairoCustomEnum({
            Hardcoded: currency,
          }),
          selector: new CairoCustomEnum({
            Hardcoded: hash.getSelectorFromName("allowance"),
          }),
          calldata: [
            new CairoCustomEnum({ Hardcoded: address }), // owner
            new CairoCustomEnum({
              Hardcoded: AutoRenewalContracts[currencyNames[index]],
            }), // spender
          ],
        });
      });
      return [calls as RawArgs];
    };

    if (!address) {
      setCallData([]);
      return;
    }
    const calldata = allowancesCallData();
    setCallData(calldata as Call[]);
  }, [address]);

  useEffect(() => {
    if (erc20AllowanceError || !erc20AllowanceData) return;
    const currencyNames = Object.values(CurrencyType);
    const needsAllowancesEntries: Record<string, boolean> = {};
    const erc20AllowanceRes = erc20AllowanceData as bigint[][];
    currencyNames.forEach((currency, index) => {
      const balance = fromUint256(
        BigInt(erc20AllowanceRes[index][0]),
        BigInt(erc20AllowanceRes[index][1])
      );
      needsAllowancesEntries[currency] = balance === "0";
    });
    setNeedsAllowances(needsAllowancesEntries);
  }, [erc20AllowanceData, erc20AllowanceError]);

  return needsAllowances;
}
