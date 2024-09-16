import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AutoRenewalContracts,
  CurrencyType,
  ERC20Contract,
} from "@/utils/constants";
import { Call } from "starknet";
import registrationCalls from "@/utils/callData/registrationCalls";
import { utils } from "starknetid.js";
import { getAutoRenewAllowance, getDomainPrice } from "@/utils/altcoinService";
import { getApprovalAmount } from "@/utils/priceService";
import autoRenewalCalls from "@/utils/callData/autoRenewalCalls";
import {
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "@/utils/stringService";
import useNeedsAllowances from "../useNeedAllowances";
import useNeedSubscription from "../useNeedSubscription";
import { areArraysEqual } from "@/utils/arrayService";
import { isEqual } from "lodash";

export const useFreeRenewalTxPrep = (
  quoteData: QuoteQueryData | null,
  salesTaxAmount: bigint,
  displayedCurrencies: CurrencyType[],
  salesTaxRate: number,
  potentialPrices: Record<CurrencyType, bigint>,
  selectedDomains?: Record<string, boolean>,
  address?: string,
  metadataHash?: string
) => {
  const [callData, setCallData] = useState<Call[]>([]);
  const allowanceStatus = useNeedsAllowances(address);
  const needSubscription = useNeedSubscription(address);

  const isCurrencyETH = useMemo(
    () => areArraysEqual(displayedCurrencies, [CurrencyType.ETH]),
    [displayedCurrencies]
  );

  const buildCalls = useCallback(() => {
    if (!isCurrencyETH && !quoteData) return [];
    const txMetadataHash = `0x${metadataHash}` as HexString;
    if (!selectedDomains) return [];

    const calls: Call[] = [
      ...registrationCalls.multiCallFreeRenewals(
        selectedDomainsToEncodedArray(selectedDomains),
        AutoRenewalContracts[displayedCurrencies[0]]
      ),
    ];

    displayedCurrencies.forEach((currency) => {
      if (allowanceStatus[currency].needsAllowance) {
        const amountToApprove = getApprovalAmount(
          potentialPrices[currency],
          salesTaxAmount,
          1,
          allowanceStatus[currency].currentAllowance
        );

        calls.unshift(
          autoRenewalCalls.approve(
            ERC20Contract[currency],
            AutoRenewalContracts[currency],
            amountToApprove
          )
        );
      }

      selectedDomainsToArray(selectedDomains).forEach((domain) => {
        if (needSubscription.needSubscription[domain]?.[currency]) {
          const encodedDomain = utils
            .encodeDomain(domain)
            .map((element) => element.toString())[0];

          const domainPrice = getDomainPrice(
            domain,
            currency,
            365,
            quoteData?.quote
          );
          const allowance = getAutoRenewAllowance(
            currency,
            salesTaxRate,
            domainPrice
          );

          calls.unshift(
            autoRenewalCalls.enableRenewal(
              AutoRenewalContracts[currency],
              encodedDomain,
              allowance,
              txMetadataHash
            )
          );
        }
      });
    });

    return calls;
  }, [
    isCurrencyETH,
    quoteData,
    selectedDomains,
    displayedCurrencies,
    allowanceStatus,
    potentialPrices,
    salesTaxAmount,
    needSubscription,
    salesTaxRate,
    metadataHash,
  ]);

  const prevCallDataRef = useRef(callData);
  useEffect(() => {
    const newCallData = buildCalls();
    if (!isEqual(newCallData, prevCallDataRef.current)) {
      setCallData(newCallData);
      prevCallDataRef.current = newCallData;
    }
  }, [buildCalls]);

  return { callData };
};
