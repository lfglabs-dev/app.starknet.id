import { useReadContract } from "@starknet-react/core";
import { useMulticallContract } from "./contracts";
import { Abi, BlockTag, CairoCustomEnum, Call, RawArgs, hash } from "starknet";
import { useEffect, useState, useMemo } from "react";
import {
  ERC20Contract,
  CurrencyType,
  AutoRenewalContracts,
} from "../utils/constants";
import { isApprovalInfinite } from "@/utils/priceService";

const createInitialAllowances = (): TokenNeedsAllowance =>
  Object.values(CurrencyType).reduce((acc, currency) => {
    acc[currency] = { needsAllowance: false, currentAllowance: BigInt(0) };
    return acc;
  }, {} as TokenNeedsAllowance);

export default function useNeedsAllowances(
  address?: string
): TokenNeedsAllowance {
  const initialAllowances = useMemo(() => createInitialAllowances(), []);
  const [needsAllowances, setNeedsAllowances] =
    useState<TokenNeedsAllowance>(initialAllowances);
  const [callData, setCallData] = useState<Call[]>([]);
  const { contract: multicallContract } = useMulticallContract();
  const { data: erc20AllowanceData, error: erc20AllowanceError } =
    useReadContract({
      address: multicallContract?.address as HexString,
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
    const newNeedsAllowances: TokenNeedsAllowance = {};
    const erc20AllowanceRes = erc20AllowanceData as CallResult[];
    currencyNames.forEach((currency, index) => {
      newNeedsAllowances[currency] = {
        needsAllowance: !isApprovalInfinite(erc20AllowanceRes[index][0]),
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
