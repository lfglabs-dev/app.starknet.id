import { useState, useEffect } from "react";
import { CurrencyType, ERC20Contract } from "@/utils/constants";
import { getTokenQuote } from "@/utils/altcoinService";

export const useCurrencyManagement = () => {
  const [displayedCurrency, setDisplayedCurrency] = useState<CurrencyType>(
    CurrencyType.ETH
  );
  const [quoteData, setQuoteData] = useState<QuoteQueryData | null>(null);
  const [currencyError, setCurrencyError] = useState<boolean>(false);
  const [hasChosenCurrency, setHasChosenCurrency] = useState<boolean>(false);

  const onCurrencySwitch = (currency: CurrencyType) => {
    setDisplayedCurrency(currency);
    setHasChosenCurrency(true);
  };

  // we fetch the quote for the currency selected
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchQuote = async () => {
      if (displayedCurrency === CurrencyType.ETH) {
        setQuoteData(null);
        return;
      }
      const data = await getTokenQuote(ERC20Contract[displayedCurrency]);
      if (data) {
        setQuoteData(data);
        setCurrencyError(false);
      } else {
        setDisplayedCurrency(CurrencyType.ETH);
        setCurrencyError(true);
      }
    };

    const scheduleRefetch = () => {
      const now = parseInt((new Date().getTime() / 1000).toFixed(0));
      const timeLimit = now - 60; // 60 seconds
      if (!quoteData || displayedCurrency === CurrencyType.ETH) {
        setQuoteData(null);
        return;
      }

      if (quoteData.max_quote_validity <= timeLimit) {
        fetchQuote();
      }

      const timeUntilNextCheck = quoteData.max_quote_validity - timeLimit;
      timeoutId = setTimeout(
        scheduleRefetch,
        Math.max(15000, timeUntilNextCheck * 100)
      );
    };

    fetchQuote();
    scheduleRefetch();

    return () => clearTimeout(timeoutId);
  }, [displayedCurrency, quoteData]);

  return {
    displayedCurrency,
    quoteData,
    currencyError,
    hasChosenCurrency,
    onCurrencySwitch,
    setHasChosenCurrency,
    setCurrencyError,
  };
};
