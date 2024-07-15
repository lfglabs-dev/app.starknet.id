import { useReadContract } from "@starknet-react/core";
import { useMulticallContract } from "./contracts";
import { Abi, BlockTag, CairoCustomEnum, Call, RawArgs, hash } from "starknet";
import { useEffect, useState } from "react";
import { ERC20Contract, CurrencyType } from "../utils/constants";
import { fromUint256 } from "../utils/feltService";

export default function useBalances(address?: string) {
  const [balances, setBalances] = useState<TokenBalance>({});
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20BalanceData, error: erc20BalanceError } = useReadContract({
    address: multicallContract?.address as HexString,
    abi: multicallContract?.abi as Abi,
    functionName: "aggregate",
    args: callData,
    watch: true,
    blockIdentifier: BlockTag.PENDING,
  });

  useEffect(() => {
    const balancesCallData = () => {
      const currencies = Object.values(ERC20Contract);
      const calls: MulticallCallData[] = [];
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
      return [calls as RawArgs];
    };

    if (!address) {
      setCallData([]);
      return;
    }
    const calldata = balancesCallData();
    setCallData(calldata as Call[]);
  }, [address]);

  useEffect(() => {
    if (erc20BalanceError || !erc20BalanceData) return;
    const erc20BalanceRes = erc20BalanceData as bigint[][];
    const currencies = Object.values(CurrencyType);
    const balanceEntries: TokenBalance = {};
    currencies.forEach((currency, index) => {
      const balance = fromUint256(
        BigInt(erc20BalanceRes[index][0]),
        BigInt(erc20BalanceRes[index][1])
      );
      balanceEntries[currency] = balance;
    });
    setBalances(balanceEntries);
  }, [erc20BalanceData, erc20BalanceError]);

  return balances;
}
