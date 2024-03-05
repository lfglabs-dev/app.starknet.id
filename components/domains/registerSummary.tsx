import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV2.module.css";
import { gweiToEth, numberToFixedString } from "../../utils/feltService";
import { CurrenciesType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";

type RegisterSummaryProps = {
  duration: number;
  ethRegistrationPrice: string;
  registrationPrice: string;
  renewalBox: boolean;
  salesTaxRate: number;
  isSwissResident: boolean;
  isTokenDropdownDisplayed?: boolean;
  customMessage?: string;
  currencyDisplayed: CurrenciesType;
  onCurrencySwitch: (type: CurrenciesType) => void;
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
  currencyDisplayed,
  onCurrencySwitch,
}) => {
  // const [isEthPriceDisplayed, setIsEthPriceDisplayed] = useState<boolean>(true);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0); // price of 1ETH in USD
  const [usdRegistrationPrice, setUsdRegistrationPrice] = useState<number>(0);
  const recurrence = renewalBox && duration === 1 ? "/year" : "";
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        setEthUsdPrice(data?.ethereum?.usd);
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  useEffect(() => {
    function computeUsdPrice() {
      if (ethUsdPrice) {
        return parseFloat(
          (ethUsdPrice * Number(gweiToEth(ethRegistrationPrice))).toFixed(2)
        );
      }
      return 0;
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
      salesTaxRate * Number(gweiToEth(ethRegistrationPrice)) * ethUsdPrice;
    const salesTaxInfo = salesTaxAmountUsd
      ? ` (+ ${numberToFixedString(
          salesTaxAmountUsd
        )}$ worth of ${currencyDisplayed} for Swiss VAT)`
      : "";

    return displayPrice(
      String(Number(gweiToEth(registrationPrice)))
        .concat(` ${currencyDisplayed} `)
        .concat(recurrence),
      salesTaxInfo
    );
  }

  // function displaySwissdPrice(): ReactNode {
  //   const salesTaxAmount = salesTaxRate * usdRegistrationPrice;
  //   const salesTaxInfo = salesTaxAmount
  //     ? ` (+ ${numberToFixedString(Number(salesTaxAmount))}$ for US VAT)`
  //     : "";

  //   return displayPrice(
  //     numberToFixedString(usdRegistrationPrice)
  //       .concat(" $ ")
  //       .concat(recurrence),
  //     salesTaxInfo
  //   );
  // }

  // function updateCurrencyDisplayed(currency: CurrenciesType) {
  //   console.log("currency to display", currency);
  //   setIsCurrencyDisplayed(currency);
  // }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>
            {customMessage
              ? customMessage
              : `For ${duration} ${duration === 1 ? "year" : "years"}`}
          </p>
          {displayTokenPrice()}
          <p className={styles.legend}>≈ ${usdRegistrationPrice}</p>
        </div>
      </div>
      {isTokenDropdownDisplayed ? (
        <CurrencyDropdown
          currencyDisplayed={currencyDisplayed}
          onCurrencySwitch={onCurrencySwitch}
        />
      ) : null}
    </div>
  );
};

export default RegisterSummary;
