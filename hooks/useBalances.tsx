import { useContractRead } from "@starknet-react/core";
import { useMulticallContract } from "./contracts";
import { Abi, CairoCustomEnum, Call, RawArgs, hash } from "starknet";
import { useEffect, useState } from "react";
import {
  ERC20Contract,
  ERC20ContractTestnet,
  CurrenciesType,
} from "../utils/constants";
import { fromUint256 } from "../utils/feltService";

export default function useBalances(address?: string) {
  const [balances, setBalances] = useState<TokenBalance>({});
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20BalanceData, error: erc20BalanceError } = useContractRead({
    address: multicallContract?.address as string,
    abi: multicallContract?.abi as Abi,
    functionName: "aggregate",
    args: callData,
    watch: true,
  });

  const buildCalldata = () => {
    let currencies = Object.values(
      process.env.NEXT_PUBLIC_IS_TESTNET === "true"
        ? ERC20ContractTestnet
        : ERC20Contract
    );
    console.log("currencies", currencies);
    let calls: MulticallCallData[] = [];
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

  useEffect(() => {
    if (!address) {
      setCallData([]);
      return;
    }
    const calldata = buildCalldata();
    setCallData(calldata as Call[]);
  }, [address]);

  useEffect(() => {
    if (erc20BalanceError || !erc20BalanceData) return;
    let currencies = Object.values(CurrenciesType);
    let balanceEntries: TokenBalance = {};
    currencies.forEach((currency, index) => {
      let balance = fromUint256(
        BigInt(erc20BalanceData[index][0]),
        BigInt(erc20BalanceData[index][1])
      );
      balanceEntries[currency] = balance;
    });
    setBalances(balanceEntries);
  }, [erc20BalanceData, erc20BalanceError]);

  return balances;
}
