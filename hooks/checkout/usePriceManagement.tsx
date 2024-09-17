import { useState, useEffect } from "react";
import { CurrencyType, swissVatRate } from "@/utils/constants";
import { getManyDomainsPriceWei } from "@/utils/priceService";
import {
  getAutoRenewAllowance,
  getDomainPriceAltcoin,
  getYearlyPrice,
  smartCurrencyChoosing,
} from "@/utils/altcoinService";
import { applyRateToBigInt } from "@/utils/feltService";
import { FormState } from "@/context/FormProvider";

export const usePriceManagement = (
  formState: {
    selectedDomains: Record<string, boolean>;
    isUpselled: boolean;
    durationInYears: number;
    salesTaxRate: number;
    isSwissResident: boolean;
    needMetadata: boolean;
  },
  displayedCurrency: CurrencyType,
  quoteData: QuoteQueryData | null,
  discount: { paidDurationInDays: number; durationInDays: number },
  tokenBalances: Record<string, string>,
  hasChosenCurrency: boolean,
  onCurrencySwitch: (currency: CurrencyType) => void,
  setHasChosenCurrency: (value: boolean) => void,
  updateFormState: (updates: Partial<FormState>) => void
) => {
  const [dailyPriceInEth, setDailyPriceInEth] = useState<bigint>(BigInt(0));
  const [discountedPriceInEth, setDiscountedPriceInEth] = useState<bigint>(
    BigInt(0)
  );
  const [price, setPrice] = useState<bigint>(BigInt(0));
  const [discountedPrice, setDiscountedPrice] = useState<bigint>(BigInt(0));
  const [loadingPrice, setLoadingPrice] = useState<boolean>(false);
  const [reloadingPrice, setReloadingPrice] = useState<boolean>(false);
  const [salesTaxAmount, setSalesTaxAmount] = useState<bigint>(BigInt(0));
  const [maxPriceRange, setMaxPriceRange] = useState<bigint>(BigInt(0));
  const [invalidBalance, setInvalidBalance] = useState<boolean>(false);

  useEffect(() => {
    if (!formState.selectedDomains) return;
    const _dailyPriceInEth = getManyDomainsPriceWei(
      formState.selectedDomains,
      1
    );
    setDailyPriceInEth(_dailyPriceInEth);
    setDiscountedPriceInEth(
      _dailyPriceInEth * BigInt(discount.paidDurationInDays)
    );
  }, [formState.selectedDomains, discount.paidDurationInDays]);

  useEffect(() => {
    const discountedPrice =
      dailyPriceInEth * BigInt(discount.paidDurationInDays);
    if (formState.isUpselled) {
      if (displayedCurrency === CurrencyType.ETH) {
        setDiscountedPrice(discountedPrice);
      } else if (quoteData) {
        const priceInAltcoin = getDomainPriceAltcoin(
          quoteData.quote,
          discountedPrice
        );
        setDiscountedPrice(priceInAltcoin);
      }
    } else {
      setDiscountedPrice(BigInt(0));
    }
  }, [
    dailyPriceInEth,
    formState.isUpselled,
    displayedCurrency,
    quoteData,
    discount,
  ]);

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
    formState.selectedDomains,
    reloadingPrice,
  ]);

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
  }, [
    formState.isSwissResident,
    price,
    formState.isUpselled,
    discountedPrice,
    formState.needMetadata,
    formState.salesTaxRate,
    updateFormState,
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
    setHasChosenCurrency,
    onCurrencySwitch,
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

  // Log salesTaxAmount when it changes
  useEffect(() => {
    console.log("Sales Tax Amount:", salesTaxAmount);
  }, [salesTaxAmount]);

  return {
    dailyPriceInEth,
    discountedPriceInEth,
    price,
    discountedPrice,
    loadingPrice,
    reloadingPrice,
    setLoadingPrice,
    setReloadingPrice,
    salesTaxAmount,
    maxPriceRange,
    invalidBalance,
  };
};
