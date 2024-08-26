import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "../../../styles/components/registerV3.module.css";
import { FormContext } from "@/context/FormProvider";
import {
  AutoRenewalContracts,
  CurrencyType,
  ERC20Contract,
  FormType,
  NotificationType,
  TransactionType,
  swissVatRate,
} from "@/utils/constants";
import { useAccount, useContractWrite } from "@starknet-react/core";
import Button from "@/components/UI/button";
import RegisterSummary from "../registerSummary";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import useAllowanceCheck from "@/hooks/useAllowanceCheck";
import useBalances from "@/hooks/useBalances";
import { Divider } from "@mui/material";
import { Call } from "starknet";
import {
  getAutoRenewAllowance,
  getDomainPriceAltcoin,
  getPriceForDuration,
  getTokenQuote,
  getYearlyPrice,
  smartCurrencyChoosing,
} from "@/utils/altcoinService";
import {
  getApprovalAmount,
  getManyDomainsPriceWei,
} from "@/utils/priceService";
import {
  applyRateToBigInt,
  hexToDecimal,
  toUint256,
} from "@/utils/feltService";
import RegisterCheckboxes from "../registerCheckboxes";
import {
  formatHexString,
  getDomainWithStark,
  selectedDomainsToArray,
  selectedDomainsToEncodedArray,
} from "@/utils/stringService";
import UpsellCard from "./upsellCard";
import registrationCalls from "@/utils/callData/registrationCalls";
import { utils } from "starknetid.js";
import autoRenewalCalls from "@/utils/callData/autoRenewalCalls";
import { useDomainFromAddress } from "@/hooks/naming";
import identityChangeCalls from "@/utils/callData/identityChangeCalls";
import posthog from "posthog-js";
import { useRouter } from "next/router";
import { formatDomainData } from "@/utils/cacheDomainData";
import ReduceDuration from "./reduceDuration";
import Notification from "@/components/UI/notification";

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
  const [dailyPriceInEth, setDailyPriceInEth] = useState<bigint>(BigInt(0)); // price in ETH for 1 year
  const [price, setPrice] = useState<bigint>(BigInt(0)); // total price in displayedCurrency
  const [discountedPrice, setDiscountedPrice] = useState<bigint>(BigInt(0)); // discounted price in displayedCurrency
  const [maxPriceRange, setMaxPriceRange] = useState<bigint>(BigInt(0)); // max price range for the displayedCurrency that will be spent on yearly subscription
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null); // null if in ETH
  const [salesTaxAmount, setSalesTaxAmount] = useState<bigint>(BigInt(0));
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);
  const [renewalBox, setRenewalBox] = useState<boolean>(true);
  const [termsBox, setTermsBox] = useState<boolean>(false);
  const mainDomain = useDomainFromAddress(address ?? "");
  const [mainDomainBox, setMainDomainBox] = useState<boolean>(true);
  const [sponsor, setSponsor] = useState<string>("0x0");
  const [hasUserSelectedOffer, setHasUserSelectedOffer] =
    useState<boolean>(false);
  const [displayedCurrency, setDisplayedCurrency] = useState<CurrencyType>(
    CurrencyType.ETH
  );
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const [reloadingPrice, setReloadingPrice] = useState<boolean>(false); // used to know if the user changes the currency
  const [hasReverseAddressRecord, setHasReverseAddressRecord] =
    useState<boolean>(false);
  const [domainsMinting, setDomainsMinting] =
    useState<Record<string, boolean>>();
  const { addTransaction } = useNotificationManager();
  const allowanceStatus = useAllowanceCheck(displayedCurrency, address);
  const tokenBalances = useBalances(address); // fetch the user balances for all whitelisted tokens
  const [hasChosenCurrency, setHasChosenCurrency] = useState<boolean>(false);
  const [callData, setCallData] = useState<Call[]>([]);
  const [tokenIdRedirect, setTokenIdRedirect] = useState<string>("0x0");
  const { writeAsync: execute, data: checkoutData } = useContractWrite({
    calls: callData,
  });
  const [reducedDuration, setReducedDuration] = useState<number>(0); // reduced duration for the user to buy the domain
  const [nonSubscribedDomains, setNonSubscribedDomains] = useState<string[]>();
  const [currencyError, setCurrencyError] = useState<boolean>(false);

  const hasMainDomain = useMemo(() => {
    if (!mainDomain || !mainDomain.domain) return false;
    return mainDomain.domain.endsWith(".stark");
  }, [mainDomain]);

  // Fetch token quote
  useEffect(() => {
    const fetchQuote = async () => {
      if (displayedCurrency === CurrencyType.ETH) return;
      const data = await getTokenQuote(ERC20Contract[displayedCurrency]);
      if (data) {
        setQuoteData(data);
        setCurrencyError(false);
      } else {
        setDisplayedCurrency(CurrencyType.ETH);
        setCurrencyError(true);
      }
    };

    // refetch new quote if the timestamp from quote is expired
    const scheduleRefetch = () => {
      const now = parseInt((new Date().getTime() / 1000).toFixed(0));
      const timeLimit = now - 60; // 60 seconds
      // Check if we need to refetch
      if (!quoteData || displayedCurrency === CurrencyType.ETH) {
        setQuoteData(null);
        // we don't need to check for quote until displayedCurrency is updated
        return;
      }

      if (quoteData.max_quote_validity <= timeLimit) {
        fetchQuote();
      }

      // Calculate the time until the next validity check
      const timeUntilNextCheck = quoteData.max_quote_validity - timeLimit;
      setTimeout(scheduleRefetch, Math.max(15000, timeUntilNextCheck * 100));
    };

    // Initial fetch
    fetchQuote();
    // Start the refetch scheduling
    scheduleRefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedCurrency, dailyPriceInEth]); // We don't add quoteData because it would create an infinite loop

  useEffect(() => {
    // get the price for domains for a year
    if (!formState.selectedDomains) return;
    setDailyPriceInEth(getManyDomainsPriceWei(formState.selectedDomains, 1));
  }, [formState.selectedDomains, formState.durationInYears]);

  useEffect(() => {
    const discountedPrice =
      dailyPriceInEth * BigInt(discount.paidDurationInDays);

    // Update discountedPrice based on isUpselled selected or not
    if (formState.isUpselled) {
      if (displayedCurrency === CurrencyType.ETH) {
        setDiscountedPrice(discountedPrice);
      } else if (quoteData) {
        const priceInAltcoin = getDomainPriceAltcoin(
          quoteData?.quote as string,
          discountedPrice
        );
        setDiscountedPrice(priceInAltcoin);
      }
    } else setDiscountedPrice(BigInt(0));
  }, [
    dailyPriceInEth,
    formState.isUpselled,
    displayedCurrency,
    quoteData,
    discount,
  ]);

  // we choose the currency based on the user balances
  useEffect(() => {
    if (
      tokenBalances &&
      Object.keys(tokenBalances).length > 0 &&
      !hasChosenCurrency &&
      dailyPriceInEth
    ) {
      const domainPrice = formState.isUpselled
        ? dailyPriceInEth * BigInt(discount.paidDurationInDays)
        : dailyPriceInEth * BigInt(formState.durationInYears * 365);
      smartCurrencyChoosing(tokenBalances, domainPrice).then((currency) => {
        onCurrencySwitch(currency);
        setHasChosenCurrency(true);
      });
    }
  }, [
    tokenBalances,
    dailyPriceInEth,
    formState.isUpselled,
    hasChosenCurrency,
    formState.durationInYears,
    discount.paidDurationInDays,
  ]);

  // we ensure user has enough balance of the token selected
  useEffect(() => {
    if (
      tokenBalances &&
      price &&
      displayedCurrency &&
      !loadingPrice &&
      !reloadingPrice
    ) {
      const tokenBalance = tokenBalances[displayedCurrency];
      if (!tokenBalance) return;
      const _price = formState.isUpselled ? discountedPrice : price;
      if (tokenBalance && BigInt(tokenBalance) >= BigInt(_price))
        setInvalidBalance(false);
      else setInvalidBalance(true);
    }
  }, [
    price,
    discountedPrice,
    formState.isUpselled,
    displayedCurrency,
    tokenBalances,
    loadingPrice,
    reloadingPrice,
  ]);

  useEffect(() => {
    const referralData = localStorage.getItem("referralData");
    if (referralData) {
      const data = JSON.parse(referralData);
      if (data.sponsor && data?.expiry >= new Date().getTime()) {
        setSponsor(data.sponsor);
      } else {
        setSponsor("0");
      }
    } else {
      setSponsor("0");
    }
  }, [address, formState.selectedDomains]);

  useEffect(() => {
    const _price = formState.isUpselled ? discountedPrice : price;
    if (!formState.needMetadata && _price) {
      setSalesTaxAmount(applyRateToBigInt(_price, formState.salesTaxRate));
    } else {
      if (formState.isSwissResident) {
        updateFormState({ salesTaxRate: swissVatRate });
        setSalesTaxAmount(applyRateToBigInt(_price, swissVatRate));
      } else {
        updateFormState({ salesTaxRate: 0 });
        setSalesTaxAmount(BigInt(0));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formState.isSwissResident,
    price,
    formState.isUpselled,
    discountedPrice,
    formState.needMetadata,
    formState.salesTaxRate,
  ]); // Don't call updateFromState on every render

  // if dailyPriceInEth or quoteData have changed, we update the price in altcoin
  useEffect(() => {
    if (!dailyPriceInEth) return;
    const _price = getManyDomainsPriceWei(
      formState.selectedDomains,
      formState.isUpselled
        ? discount.durationInDays
        : formState.durationInYears * 365
    );
    if (displayedCurrency === CurrencyType.ETH) {
      setPrice(_price);
    } else if (quoteData) {
      setPrice(getDomainPriceAltcoin(quoteData.quote, _price));
    }
    setLoadingPrice(false);
    if (reloadingPrice) setReloadingPrice(false);
  }, [
    dailyPriceInEth,
    quoteData,
    displayedCurrency,
    formState.isUpselled,
    formState.durationInYears,
    discount.durationInDays,
    reloadingPrice,
    formState.selectedDomains,
  ]);

  useEffect(() => {
    if (displayedCurrency !== CurrencyType.ETH && !quoteData) return;
    const limitPrice = getAutoRenewAllowance(
      displayedCurrency,
      formState.salesTaxRate,
      getYearlyPrice(
        Object.keys(formState.selectedDomains)[0],
        displayedCurrency,
        quoteData?.quote
      )
    );
    setMaxPriceRange(limitPrice);
  }, [
    displayedCurrency,
    formState.selectedDomains,
    quoteData,
    formState.salesTaxRate,
  ]);

  useEffect(() => {
    if (!address) return;
    fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/addr_has_rev?addr=${address}`)
      .then((response) => response.json())
      .then((reverseAddressData) => {
        setHasReverseAddressRecord(reverseAddressData.has_rev);
      });
  }, [address]);

  // we get the list of domains that do not have a autorenewal already enabled
  useEffect(() => {
    if (type !== FormType.RENEW) return;
    if (address) {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_LINK}/renewal/get_non_subscribed_domains?addr=${address}`
      )
        .then((response) => response.json())
        .then((data) => {
          setNonSubscribedDomains(data);
        });
    }
  }, [address, formState.selectedDomains, renewalBox, type]);

  // Set Register Multicall
  useEffect(() => {
    if (
      (displayedCurrency !== CurrencyType.ETH && !quoteData) ||
      type !== FormType.REGISTER
    )
      return;
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
            ? Number(BigInt(discount.durationInDays) / BigInt(365))
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
    address,
    sponsor,
    formState.metadataHash,
    formState.salesTaxRate,
    renewalBox,
    mainDomainBox,
    salesTaxAmount,
    allowanceStatus.needsAllowance,
    allowanceStatus.currentAllowance,
    quoteData,
    displayedCurrency,
    formState.selectedPfp,
    type,
    discount.durationInDays,
    discount.discountId,
    discountedPrice,
    hasReverseAddressRecord,
  ]);

  // Set Renewal Multicall
  useEffect(() => {
    if (type !== FormType.RENEW) return;
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
            ? Number(BigInt(discount.durationInDays) / BigInt(365))
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

    // Merge and set the call data
    setCallData(calls);
  }, [
    formState.tokenId,
    formState.isUpselled,
    formState.durationInYears,
    price,
    formState.selectedDomains,
    hasMainDomain,
    address,
    sponsor,
    formState.metadataHash,
    formState.salesTaxRate,
    renewalBox,
    mainDomainBox,
    salesTaxAmount,
    allowanceStatus.needsAllowance,
    allowanceStatus.currentAllowance,
    quoteData,
    displayedCurrency,
    formState.selectedPfp,
    type,
    discount.durationInDays,
    discount.discountId,
    discountedPrice,
    nonSubscribedDomains,
  ]);

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
        tokenIdRedirect,
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
      router.push(`/confirmation?tokenId=${tokenIdRedirect}`);
    else router.push(`/confirmation`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutData]); // We only need registerData here because we don't want to send the metadata twice (we send it once the tx is sent)

  const onCurrencySwitch = (type: CurrencyType) => {
    setReloadingPrice(true);
    if (type !== CurrencyType.ETH) setLoadingPrice(true);
    setReducedDuration(0);
    setDisplayedCurrency(type);
    setHasUserSelectedOffer(false);
  };

  const onUpsellChoice = useCallback(
    (enable: boolean) => {
      updateFormState({ isUpselled: enable });
    },
    [updateFormState]
  );

  useEffect(() => {
    const durationInYears = formState.durationInYears;
    if (!invalidBalance || !dailyPriceInEth) {
      if (!reducedDuration) setReducedDuration(0);
      return;
    }
    let found = false;
    for (
      let newDurationInYears = durationInYears - 1;
      newDurationInYears > 0;
      newDurationInYears--
    ) {
      const newPriceInEth = getPriceForDuration(
        dailyPriceInEth,
        newDurationInYears
      );
      let newPrice = newPriceInEth;
      if (displayedCurrency !== CurrencyType.ETH && quoteData)
        newPrice = getDomainPriceAltcoin(quoteData.quote, newPriceInEth);
      const balance = tokenBalances[displayedCurrency];
      if (!balance) continue;
      if (BigInt(balance) >= BigInt(newPrice)) {
        if (reducedDuration !== newDurationInYears)
          setReducedDuration(newDurationInYears);
        found = true;
        break;
      }
    }
    if (!found && reducedDuration) setReducedDuration(0);
  }, [
    formState.durationInYears,
    invalidBalance,
    discount.durationInDays,
    dailyPriceInEth,
    formState.isUpselled,
    tokenBalances,
    displayedCurrency,
    quoteData,
    reducedDuration,
  ]);

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
            yearlyPrice={dailyPriceInEth * BigInt(365)}
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
            onCurrencySwitch={onCurrencySwitch}
            loadingPrice={loadingPrice}
            isUpselled={formState.isUpselled}
            discountedPrice={discountedPrice}
          />
          <Divider className="w-full" />
          <div className={styles.checkoutSummary}>
            <RegisterCheckboxes
              onChangeTermsBox={() => setTermsBox(!termsBox)}
              termsBox={termsBox}
              onChangeRenewalBox={() => setRenewalBox(!renewalBox)}
              renewalBox={renewalBox}
              showMainDomainBox={type === FormType.REGISTER && hasMainDomain}
              mainDomainBox={mainDomainBox}
              onChangeMainDomainBox={() => setMainDomainBox(!mainDomainBox)}
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
