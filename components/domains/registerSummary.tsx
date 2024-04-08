import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV2.module.css";
import { gweiToEth, numberToFixedString } from "../../utils/feltService";
import { CurrencyType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";
import { Skeleton } from "@mui/material";

/**
 * price en ETH pour un an
 * if discount : prix pour 3 ans, prix actuel (2 ans)
 * duration actuelle pour pouvoir calculer le prix en USD
 */

type RegisterSummaryProps = {
  duration: number;
  ethRegistrationPrice: string;
  registrationPrice: string; // price in displayedCurrency, set to priceInEth on first load as ETH is the default currency
  renewalBox: boolean;
  salesTaxRate: number;
  isSwissResident: boolean;
  isTokenDropdownDisplayed?: boolean;
  customMessage?: string;
  displayedCurrency: CurrencyType;
  onCurrencySwitch: (type: CurrencyType) => void;
  loadingPrice?: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  duration,
  ethRegistrationPrice,
  registrationPrice,
  renewalBox,
  salesTaxRate,
  isSwissResident,
  isTokenDropdownDisplayed = true,
  customMessage,
  displayedCurrency,
  onCurrencySwitch,
  loadingPrice,
}) => {
  const [ethUsdPrice, setEthUsdPrice] = useState<string>("0"); // price of 1ETH in USD
  const [usdRegistrationPrice, setUsdRegistrationPrice] = useState<string>("0");
  const recurrence = renewalBox && duration === 1 ? "/year" : "";
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Coingecko API Data:", data);
        setEthUsdPrice(data?.ethereum?.usd.toString());
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  useEffect(() => {
    function computeUsdPrice() {
      if (ethUsdPrice) {
        return (
          Number(ethUsdPrice) * Number(gweiToEth(ethRegistrationPrice))
        ).toFixed(2);
      }
      return "0";
    }

    setUsdRegistrationPrice(computeUsdPrice());
  }, [ethRegistrationPrice, ethUsdPrice]);

  function displayPrice(priceToPay: string, salesTaxInfo: string): ReactNode {
    return (
      <div className="flex items-center justify-center">
        <span className={styles.price}>{priceToPay}</span>
        {isSwissResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function displayTokenPrice(): ReactNode {
    const salesTaxAmountUsd =
      salesTaxRate *
      Number(gweiToEth(ethRegistrationPrice)) *
      Number(ethUsdPrice);
    const salesTaxInfo = salesTaxAmountUsd
      ? ` (+ ${numberToFixedString(
          salesTaxAmountUsd
        )}$ worth of ${displayedCurrency} for Swiss VAT)`
      : "";

    return displayPrice(
      numberToFixedString(Number(gweiToEth(registrationPrice)), 3)
        .concat(` ${displayedCurrency} `)
        .concat(recurrence),
      salesTaxInfo
    );
  }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>
            {customMessage
              ? customMessage
              : `${gweiToEth(ethRegistrationPrice)} ETH x ${duration} ${
                  duration === 1 ? "year" : "years"
                }`}
          </p>
          {loadingPrice ? (
            <Skeleton variant="text" width="150px" height="24px" />
          ) : (
            displayTokenPrice()
          )}
          <p className={styles.legend}>≈ ${usdRegistrationPrice}</p>
        </div>
      </div>
      {isTokenDropdownDisplayed ? (
        <CurrencyDropdown
          displayedCurrency={displayedCurrency}
          onCurrencySwitch={onCurrencySwitch}
        />
      ) : null}
    </div>
  );
};

export default RegisterSummary;
