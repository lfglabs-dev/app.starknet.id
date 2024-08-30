import { useState, useEffect } from "react";
import {
  AutoRenewalContracts,
  CurrencyType,
  ERC20Contract,
} from "@/utils/constants";
import { Call } from "starknet";
import registrationCalls from "@/utils/callData/registrationCalls";
import { utils } from "starknetid.js";
import { FormState } from "@/context/FormProvider";
import { getAutoRenewAllowance, getYearlyPrice } from "@/utils/altcoinService";
import { getApprovalAmount } from "@/utils/priceService";
import autoRenewalCalls from "@/utils/callData/autoRenewalCalls";
import identityChangeCalls from "@/utils/callData/identityChangeCalls";
import { hexToDecimal, toUint256 } from "@/utils/feltService";
import {
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "@/utils/stringService";

export const useRenewalTxPrep = (
  formState: FormState,
  displayedCurrency: CurrencyType,
  quoteData: QuoteQueryData | null,
  price: bigint,
  discountedPrice: bigint,
  salesTaxAmount: bigint,
  sponsor: string,
  discount: { discountId: string; durationInDays: number },
  renewalBox: boolean,
  allowanceStatus: AllowanceStatus,
  nonSubscribedDomains: string[] | undefined
) => {
  const [callData, setCallData] = useState<Call[]>([]);

  useEffect(() => {
    if (displayedCurrency !== CurrencyType.ETH && !quoteData) return;

    // Variables
    const finalDurationInDays = formState.isUpselled
      ? discount.durationInDays
      : formState.durationInYears * 365;
    const priceToPay = formState.isUpselled ? discountedPrice : price;
    const txMetadataHash = `0x${formState.metadataHash}` as HexString;

    // Common calls
    const calls = [
      registrationCalls.approve(priceToPay, ERC20Contract[displayedCurrency]),
    ];

    if (displayedCurrency === CurrencyType.ETH) {
      calls.push(
        ...registrationCalls.multiCallRenewal(
          selectedDomainsToEncodedArray(formState.selectedDomains),
          finalDurationInDays,
          txMetadataHash,
          sponsor,
          formState.isUpselled ? discount.discountId : "0"
        )
      );
    } else {
      calls.push(
        ...registrationCalls.multiCallRenewalAltcoin(
          selectedDomainsToEncodedArray(formState.selectedDomains),
          finalDurationInDays,
          txMetadataHash,
          ERC20Contract[displayedCurrency],
          quoteData as QuoteQueryData,
          sponsor,
          formState.isUpselled ? discount.discountId : "0"
        )
      );
    }

    // If the user is a Swiss resident, we add the sales tax
    if (formState.salesTaxRate) {
      calls.unshift(
        registrationCalls.vatTransfer(
          salesTaxAmount,
          ERC20Contract[displayedCurrency]
        )
      ); // IMPORTANT: We use unshift to put the call at the beginning of the array
    }

    // If the user has toggled autorenewal
    if (renewalBox) {
      if (allowanceStatus.needsAllowance) {
        const amountToApprove = getApprovalAmount(
          price,
          salesTaxAmount,
          discountedPrice
            ? discount.durationInDays / finalDurationInDays
            : formState.durationInYears,
          allowanceStatus.currentAllowance
        );

        calls.push(
          autoRenewalCalls.approve(
            ERC20Contract[displayedCurrency],
            AutoRenewalContracts[displayedCurrency],
            amountToApprove
          )
        );
      }

      selectedDomainsToArray(formState.selectedDomains).map((domain) => {
        // we enable renewal only for the domains that are not already subscribed
        if (nonSubscribedDomains?.includes(domain)) {
          const encodedDomain = utils
            .encodeDomain(domain)
            .map((element) => element.toString())[0];

          const domainPrice = getYearlyPrice(
            domain,
            displayedCurrency,
            quoteData?.quote
          );
          const allowance = getAutoRenewAllowance(
            displayedCurrency,
            formState.salesTaxRate,
            domainPrice
          );

          calls.push(
            autoRenewalCalls.enableRenewal(
              AutoRenewalContracts[displayedCurrency],
              encodedDomain,
              allowance,
              txMetadataHash
            )
          );
        }
      });
    }

    // if the user has selected a profile picture
    if (formState.selectedPfp) {
      const nftData = formState.selectedPfp;
      const nft_id = toUint256(nftData.token_id);
      calls.push(
        identityChangeCalls.updateProfilePicture(
          hexToDecimal(nftData.contract_address),
          nft_id.low,
          nft_id.high,
          formState.tokenId.toString()
        )
      );
    }

    // Set the call data
    setCallData(calls);
  }, [
    formState.tokenId,
    formState.isUpselled,
    formState.durationInYears,
    price,
    formState.selectedDomains,
    sponsor,
    formState.metadataHash,
    formState.salesTaxRate,
    renewalBox,
    salesTaxAmount,
    allowanceStatus.needsAllowance,
    allowanceStatus.currentAllowance,
    quoteData,
    displayedCurrency,
    formState.selectedPfp,
    discount.durationInDays,
    discount.discountId,
    discountedPrice,
    nonSubscribedDomains,
  ]);

  return { callData };
};
