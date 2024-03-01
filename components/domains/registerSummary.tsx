import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV2.module.css";
import CurrencySwitcher from "./currencySwitcher";
import { gweiToEth, numberToFixedString } from "../../utils/feltService";
import { CurrenciesType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";

type RegisterSummaryProps = {
  duration: number;
  ethRegistrationPrice: string;
  renewalBox: boolean;
  salesTaxRate: number;
  isSwissResident: boolean;
  isUsdPriceDisplayed?: boolean;
  customMessage?: string;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  duration,
  ethRegistrationPrice,
  renewalBox,
  salesTaxRate,
  isSwissResident,
  isUsdPriceDisplayed = true,
  customMessage,
}) => {
  // todo: remove isEthPriceDisplayed
  const [isEthPriceDisplayed, setIsEthPriceDisplayed] = useState<boolean>(true);
  // todo: move into parent
  const [currencyDisplayed, setIsCurrencyDisplayed] = useState<CurrenciesType>(
    CurrenciesType.ETH
  );
  const [ethSwissdPrice, setEthSwissdPrice] = useState<number>(0);
  const [usdRegistrationPrice, setSwissdRegistrationPrice] =
    useState<number>(0);
  const recurrence = renewalBox && duration === 1 ? "/year" : "";
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        setEthSwissdPrice(data?.ethereum?.usd);
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  useEffect(() => {
    function computeSwissdPrice() {
      if (ethSwissdPrice) {
        return ethSwissdPrice * Number(gweiToEth(ethRegistrationPrice));
      }
      return 0;
    }

    if (!isEthPriceDisplayed) {
      setSwissdRegistrationPrice(computeSwissdPrice());
    }
  }, [ethRegistrationPrice, ethSwissdPrice, isEthPriceDisplayed]);

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

  function displayEthPrice(): ReactNode {
    const salesTaxAmount =
      salesTaxRate * Number(gweiToEth(ethRegistrationPrice)) * ethSwissdPrice;
    const salesTaxInfo = salesTaxAmount
      ? ` (+ ${numberToFixedString(
          salesTaxAmount
        )}$ worth of ETH for Swiss VAT)`
      : "";

    return displayPrice(
      String(Number(gweiToEth(ethRegistrationPrice)))
        .concat(" ETH ")
        .concat(recurrence),
      salesTaxInfo
    );
  }

  function displaySwissdPrice(): ReactNode {
    const salesTaxAmount = salesTaxRate * usdRegistrationPrice;
    const salesTaxInfo = salesTaxAmount
      ? ` (+ ${numberToFixedString(Number(salesTaxAmount))}$ for US VAT)`
      : "";

    return displayPrice(
      numberToFixedString(usdRegistrationPrice)
        .concat(" $ ")
        .concat(recurrence),
      salesTaxInfo
    );
  }

  function updateCurrencyDisplayed(currency: CurrenciesType) {
    console.log("currency to display", currency);
    setIsCurrencyDisplayed(currency);
  }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>
            {customMessage
              ? customMessage
              : `${Number(gweiToEth(ethRegistrationPrice))} ETH x ${duration} ${
                  duration === 1 ? "year" : "years"
                }`}
          </p>
          {isEthPriceDisplayed ? displayEthPrice() : displaySwissdPrice()}
        </div>
      </div>
      {isUsdPriceDisplayed ? (
        <>
          {/* <CurrencySwitcher
            isEthPriceDisplayed={isEthPriceDisplayed}
            onCurrencySwitch={() =>
              setIsEthPriceDisplayed(!isEthPriceDisplayed)
            }
          /> */}
          <CurrencyDropdown
            currencyDisplayed={currencyDisplayed}
            onCurrencySwitch={updateCurrencyDisplayed}
          />
        </>
      ) : null}
    </div>
  );
};

export default RegisterSummary;
