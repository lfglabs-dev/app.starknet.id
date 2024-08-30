import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "../../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import {
  CurrencyType,
  FormType,
  NotificationType,
  TransactionType,
} from "@/utils/constants";
import { useAccount, useContractWrite } from "@starknet-react/core";
import Button from "@/components/UI/button";
import RegisterSummary from "../registerSummary";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import useAllowanceCheck from "@/hooks/useAllowanceCheck";
import useBalances from "@/hooks/useBalances";
import { Divider } from "@mui/material";
import { Call } from "starknet";
import RegisterCheckboxes from "../registerCheckboxes";
import { formatHexString, getDomainWithStark } from "@/utils/stringService";
import UpsellCard from "./upsellCard";
import posthog from "posthog-js";
import { useRouter } from "next/router";
import { formatDomainData } from "@/utils/cacheDomainData";
import ReduceDuration from "./reduceDuration";
import Notification from "@/components/UI/notification";
import { useCurrencyManagement } from "@/hooks/checkout/useCurrencyManagement";
import { usePriceManagement } from "@/hooks/checkout/usePriceManagement";
import { useCheckoutState } from "@/hooks/checkout/useCheckoutState";
import { useRegisterTxPrep } from "@/hooks/checkout/useRegisterTxPrep";
import { useRenewalTxPrep } from "@/hooks/checkout/useRenewalTxPrep";

type CheckoutCardProps = {
  type: FormType;
  groups: string[];
  discount: Upsell;
};

const CheckoutCard: FunctionComponent<CheckoutCardProps> = ({
  type,
  discount,
  groups,
}) => {
  const router = useRouter();
  const { account, address } = useAccount();
  const { formState, updateFormState, clearForm } = useContext(FormContext);
  const { addTransaction } = useNotificationManager();
  const tokenBalances = useBalances(address); // fetch the user balances for all whitelisted tokens
  const [callData, setCallData] = useState<Call[]>([]);
  const { writeAsync: execute, data: checkoutData } = useContractWrite({
    calls: callData,
  });

  const {
    termsBox,
    renewalBox,
    mainDomainBox,
    hasUserSelectedOffer,
    hasReverseAddressRecord,
    domainsMinting,
    reducedDuration,
    nonSubscribedDomains,
    sponsor,
    hasMainDomain,
    setHasUserSelectedOffer,
    setDomainsMinting,
    setReducedDuration,
    onChangeTermsBox,
    onChangeRenewalBox,
    onChangeMainDomainBox,
  } = useCheckoutState(type, address);

  const {
    displayedCurrency,
    quoteData,
    currencyError,
    hasChosenCurrency,
    onCurrencySwitch,
    setHasChosenCurrency,
    setCurrencyError,
  } = useCurrencyManagement();

  const {
    dailyPriceInEth,
    discountedPriceInEth,
    price,
    discountedPrice,
    loadingPrice,
    setLoadingPrice,
    setReloadingPrice,
    salesTaxAmount,
    maxPriceRange,
    invalidBalance,
  } = usePriceManagement(
    formState,
    displayedCurrency,
    quoteData,
    discount,
    tokenBalances,
    hasChosenCurrency,
    onCurrencySwitch,
    setHasChosenCurrency,
    updateFormState
  );
  const allowanceStatus = useAllowanceCheck(displayedCurrency, address);

  const {
    callData: registerCallData,
    tokenIdRedirect: registerTokenIdRedirect,
  } = useRegisterTxPrep(
    formState,
    displayedCurrency,
    quoteData,
    price,
    discountedPrice,
    salesTaxAmount,
    sponsor,
    hasMainDomain,
    mainDomainBox,
    hasReverseAddressRecord,
    discount,
    renewalBox,
    allowanceStatus
  );

  const { callData: renewalCallData } = useRenewalTxPrep(
    formState,
    displayedCurrency,
    quoteData,
    price,
    discountedPrice,
    salesTaxAmount,
    sponsor,
    discount,
    renewalBox,
    allowanceStatus,
    nonSubscribedDomains
  );

  useEffect(() => {
    if (type === FormType.REGISTER) {
      setCallData(registerCallData);
    } else if (type === FormType.RENEW) {
      setCallData(renewalCallData);
    }
  }, [type, registerCallData, renewalCallData]);

  // on execute transaction,
  useEffect(() => {
    if (!checkoutData?.transaction_hash || !formState.salt) return;

    // track the registration event(s) for analytics
    if (renewalBox) posthog?.capture("enable-ar-register");
    if (type === FormType.REGISTER) posthog?.capture("register");
    else if (type === FormType.RENEW) posthog?.capture("renewal from page");

    // register the metadata to the sales manager db
    if (formState.needMetadata) {
      fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/add_metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_hash: formState.metadataHash,
          email: formState.email,
          tax_state: formState.isSwissResident ? "switzerland" : "none",
          salt: formState.salt,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log("Error on sending metadata:", err));
    }

    fetch(`${process.env.NEXT_PUBLIC_SALES_SERVER_LINK}/mail_subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_hash: formatHexString(checkoutData.transaction_hash),
        groups: renewalBox ? groups : [groups[0]],
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log("Error on registering to email:", err));

    addTransaction({
      timestamp: Date.now(),
      subtext:
        type === FormType.REGISTER ? "Domain registration" : "Domain renewal",
      type: NotificationType.TRANSACTION,
      data: {
        type:
          type === FormType.REGISTER
            ? TransactionType.BUY_DOMAIN
            : TransactionType.RENEW_DOMAIN,
        hash: checkoutData.transaction_hash,
        status: "pending",
      },
    });

    // if registration, store domain data in local storage to use it until it's indexed
    if (type === FormType.REGISTER) {
      formatDomainData(
        registerTokenIdRedirect,
        formatHexString(address as string),
        getDomainWithStark(Object.keys(formState.selectedDomains)[0]),
        formState.isUpselled
          ? discount.durationInDays
          : formState.durationInYears * 365,
        !hasMainDomain || mainDomainBox ? true : false,
        formState.selectedPfp
      );
    }

    // clear context
    clearForm();

    // Redirect to confirmation page
    if (type === FormType.REGISTER)
      router.push(`/confirmation?tokenId=${registerTokenIdRedirect}`);
    else router.push(`/confirmation`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutData]); // We only need registerData here because we don't want to send the metadata twice (we send it once the tx is sent)

  const handleCurrencySwitch = (type: CurrencyType) => {
    setReloadingPrice(true);
    if (type !== CurrencyType.ETH) setLoadingPrice(true);
    setReducedDuration(0);
    onCurrencySwitch(type);
    setHasUserSelectedOffer(false);
  };

  const onUpsellChoice = useCallback(
    (enable: boolean) => {
      updateFormState({ isUpselled: enable });
    },
    [updateFormState]
  );

  return (
    <>
      {formState.durationInYears === 1 ? (
        <UpsellCard
          upsellData={discount as Upsell}
          enabled={formState.isUpselled}
          onUpsellChoice={onUpsellChoice}
          invalidBalance={invalidBalance}
          hasUserSelectedOffer={hasUserSelectedOffer}
          setHasUserSelectedOffer={setHasUserSelectedOffer}
          loadingPrice={loadingPrice}
        />
      ) : null}
      {reducedDuration > 0 &&
      invalidBalance &&
      reducedDuration !== formState.durationInYears * 365 ? (
        <ReduceDuration
          newDuration={reducedDuration}
          currentDuration={formState.durationInYears}
          updateFormState={updateFormState}
          displayCurrency={displayedCurrency}
        />
      ) : null}

      <div className={styles.container}>
        <div className={styles.checkout}>
          <RegisterSummary
            priceInEth={
              dailyPriceInEth * BigInt(formState.durationInYears * 365)
            }
            price={price}
            durationInYears={
              formState.isUpselled
                ? discount.durationInDays / 365
                : formState.durationInYears
            }
            renewalBox={renewalBox}
            salesTaxRate={formState.salesTaxRate}
            isSwissResident={formState.isSwissResident}
            displayedCurrency={displayedCurrency}
            onCurrencySwitch={handleCurrencySwitch}
            loadingPrice={loadingPrice}
            isUpselled={formState.isUpselled}
            discountedPrice={discountedPrice}
            discountedPriceInEth={discountedPriceInEth}
          />
          <Divider className="w-full" />
          <div className={styles.checkoutSummary}>
            <RegisterCheckboxes
              onChangeTermsBox={onChangeTermsBox}
              termsBox={termsBox}
              onChangeRenewalBox={onChangeRenewalBox}
              renewalBox={renewalBox}
              showMainDomainBox={type === FormType.REGISTER && hasMainDomain}
              mainDomainBox={mainDomainBox}
              onChangeMainDomainBox={onChangeMainDomainBox}
              domain={getDomainWithStark(
                Object.keys(formState.selectedDomains)[0]
              )}
              displayedCurrency={displayedCurrency}
              maxPriceRange={maxPriceRange}
            />
            <div>
              <Button
                onClick={() =>
                  execute().then(() => {
                    setDomainsMinting(formState.selectedDomains);
                  })
                }
                disabled={
                  domainsMinting === formState.selectedDomains ||
                  !account ||
                  !formState.durationInYears ||
                  formState.durationInYears < 1 ||
                  invalidBalance ||
                  !termsBox
                }
              >
                {!termsBox
                  ? "Please accept terms & policies"
                  : invalidBalance
                  ? `You don't have enough ${displayedCurrency}`
                  : "Purchase"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Notification
        visible={currencyError}
        onClose={() => setCurrencyError(false)}
      >
        <p>Failed to get token quote. Please use ETH for now.</p>
      </Notification>
    </>
  );
};

export default CheckoutCard;
