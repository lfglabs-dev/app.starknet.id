import { useContractRead } from "@starknet-react/core";
import { useMulticallContract } from "./contracts";
import { Abi, BlockTag, CairoCustomEnum, Call, RawArgs, hash } from "starknet";
import { useEffect, useState } from "react";
import {
  ERC20Contract,
  CurrencyType,
  AutoRenewalContracts,
  UINT_128_MAX,
} from "../utils/constants";

export default function useNeedsAllowances(
  address?: string
): TokenNeedsAllowance {
  const initialAllowances: TokenNeedsAllowance = Object.values(
    CurrencyType
  ).reduce((acc, currency) => {
    acc[currency] = { needsAllowance: false, currentAllowance: BigInt(0) };
    return acc;
  }, {} as TokenNeedsAllowance);
  const [needsAllowances, setNeedsAllowances] =
    useState<TokenNeedsAllowance>(initialAllowances);
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useContractRead({
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
    const newNeedsAllowances: TokenNeedsAllowance = {};
    const erc20AllowanceRes = erc20AllowanceData as CallResult[];
    currencyNames.forEach((currency, index) => {
      console.log(
        "erc20AllowanceRes[index] " + currency,
        erc20AllowanceRes[index]
      );

      newNeedsAllowances[currency] = {
        needsAllowance: erc20AllowanceRes[index][0] !== UINT_128_MAX,
        currentAllowance: erc20AllowanceRes[index][0],
      };
    });
    setNeedsAllowances((prevAllowances) => ({
      ...prevAllowances,
      ...newNeedsAllowances,
    }));
  }, [erc20AllowanceData, erc20AllowanceError]);

  return needsAllowances;
}
