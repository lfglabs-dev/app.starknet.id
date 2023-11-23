import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV2.module.css";
import CurrencySwitcher from "./currencySwitcher";
import { gweiToEth, numberToFixedString } from "../../utils/feltService";

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
  const [isEthPriceDisplayed, setIsEthPriceDisplayed] = useState<boolean>(true);
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
        <span className="text-gray-800 text-xl not-italic font-bold leading-6 whitespace-nowrap">
          {priceToPay}
        </span>
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
        )}$ worth of ETH for US sales tax)`
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
      ? ` (+ ${numberToFixedString(Number(salesTaxAmount))}$ for US sales tax)`
      : "";

    return displayPrice(
      numberToFixedString(usdRegistrationPrice)
        .concat(" $ ")
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
              : `for ${duration} ${duration === 1 ? "year" : "years"}`}
          </p>
          {isEthPriceDisplayed ? displayEthPrice() : displaySwissdPrice()}
        </div>
      </div>
      {isUsdPriceDisplayed ? (
        <CurrencySwitcher
          isEthPriceDisplayed={isEthPriceDisplayed}
          onCurrencySwitch={() => setIsEthPriceDisplayed(!isEthPriceDisplayed)}
        />
      ) : null}
    </div>
  );
};

export default RegisterSummary;
