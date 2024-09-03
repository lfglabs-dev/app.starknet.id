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

export const useRegisterTxPrep = (
  formState: FormState,
  displayedCurrency: CurrencyType,
  quoteData: QuoteQueryData | null,
  price: bigint,
  discountedPrice: bigint,
  salesTaxAmount: bigint,
  sponsor: string,
  hasMainDomain: boolean,
  mainDomainBox: boolean,
  hasReverseAddressRecord: boolean,
  discount: { discountId: string; durationInDays: number },
  renewalBox: boolean,
  allowanceStatus: AllowanceStatus
) => {
  const [callData, setCallData] = useState<Call[]>([]);
  const [tokenIdRedirect, setTokenIdRedirect] = useState<string>("0x0");

  // Set Register Multicall
  useEffect(() => {
    if (displayedCurrency !== CurrencyType.ETH && !quoteData) return;
    // Variables
    const newTokenId: number = Math.floor(Math.random() * 1000000000000);
    const txMetadataHash = `0x${formState.metadataHash}` as HexString;
    const encodedDomain = utils
      .encodeDomain(Object.keys(formState.selectedDomains)[0])
      .map((element) => element.toString())[0];
    const finalDurationInDays = formState.isUpselled
      ? discount.durationInDays
      : formState.durationInYears * 365;
    const priceToPay = formState.isUpselled ? discountedPrice : price;

    // Common calls
    const calls = [
      registrationCalls.approve(priceToPay, ERC20Contract[displayedCurrency]),
    ];

    if (displayedCurrency === CurrencyType.ETH) {
      calls.push(
        registrationCalls.buy(
          encodedDomain,
          formState.tokenId === 0 ? newTokenId : formState.tokenId,
          sponsor,
          finalDurationInDays,
          txMetadataHash,
          formState.isUpselled ? discount.discountId : "0"
        )
      );
    } else {
      calls.push(
        registrationCalls.altcoinBuy(
          encodedDomain,
          formState.tokenId === 0 ? newTokenId : formState.tokenId,
          sponsor,
          finalDurationInDays,
          txMetadataHash,
          ERC20Contract[displayedCurrency],
          quoteData as QuoteQueryData,
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

    // If the user choose to mint a new identity
    let tokenIdToUse = formState.tokenId;
    if (formState.tokenId === 0) {
      calls.unshift(registrationCalls.mint(newTokenId)); // IMPORTANT: We use unshift to put the call at the beginning of the array
      tokenIdToUse = newTokenId;
    }
    setTokenIdRedirect(tokenIdToUse.toString());

    // If the user does not have a main domain or has checked the mainDomain box
    if (!hasMainDomain || mainDomainBox) {
      if (hasReverseAddressRecord)
        calls.push(registrationCalls.resetAddrToDomain());
      calls.push(registrationCalls.mainId(tokenIdToUse));
    }

    if (renewalBox) {
      if (allowanceStatus.needsAllowance) {
        const amountToApprove = getApprovalAmount(
          price,
          salesTaxAmount,
          discountedPrice
            ? Number(
                BigInt(discount.durationInDays) / BigInt(finalDurationInDays)
              )
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

      const allowance = getAutoRenewAllowance(
        displayedCurrency,
        formState.salesTaxRate,
        getYearlyPrice(
          Object.keys(formState.selectedDomains)[0],
          displayedCurrency,
          quoteData?.quote
        )
      );
      calls.push(
        autoRenewalCalls.enableRenewal(
          AutoRenewalContracts[displayedCurrency],
          encodedDomain,
          allowance,
          `0x${formState.metadataHash}`
        )
      );
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
          tokenIdToUse.toString()
        )
      );
    }

    // Merge and set the call data
    setCallData(calls);
  }, [
    formState.tokenId,
    formState.isUpselled,
    formState.durationInYears,
    price,
    formState.selectedDomains,
    hasMainDomain,
    sponsor,
    formState.metadataHash,
    formState.salesTaxRate,
    mainDomainBox,
    salesTaxAmount,
    quoteData,
    displayedCurrency,
    formState.selectedPfp,
    discount.durationInDays,
    discount.discountId,
    discountedPrice,
    hasReverseAddressRecord,
    renewalBox,
    allowanceStatus.needsAllowance,
    allowanceStatus.currentAllowance,
  ]);

  return { callData, tokenIdRedirect };
};
