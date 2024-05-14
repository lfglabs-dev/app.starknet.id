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

export default function useAllowances(address?: string) {
  const [allowances, setAllowances] = useState<TokenBalance>({});
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20BalanceData, error: erc20BalanceError } = useContractRead({
    address: multicallContract?.address as string,
    abi: multicallContract?.abi as Abi,
    functionName: "aggregate",
    args: callData,
    watch: true,
    blockIdentifier: BlockTag.pending,
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
            new CairoCustomEnum({
              Hardcoded: AutoRenewalContracts[currencyNames[index]],
            }), // owner
            new CairoCustomEnum({ Hardcoded: address }), // spender
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
    if (erc20BalanceError || !erc20BalanceData) return;
    const currencyNames = Object.values(CurrencyType);
    const balanceEntries: TokenBalance = {};
    currencyNames.forEach((currency, index) => {
      // Skip setting allowances if the currency is ALL
      if (currency === CurrencyType["ALL CURRENCIES"]) {
        return; // Skip the current iteration, effectively acts like a 'continue' in a forEach loop
      }

      const balance = fromUint256(
        BigInt(erc20BalanceData[index][0]),
        BigInt(erc20BalanceData[index][1])
      );
      balanceEntries[currency] = balance;
    });
    setAllowances(balanceEntries);
  }, [erc20BalanceData, erc20BalanceError]);

  console.log("allowances: ", allowances);
  return allowances;
}
