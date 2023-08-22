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
  isUsResident: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  duration,
  ethRegistrationPrice,
  renewalBox,
  salesTaxRate,
  isUsResident,
}) => {
  const [isEthPriceDisplayed, setIsEthPriceDisplayed] = useState<boolean>(true);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0);
  const [usdRegistrationPrice, setUsdRegistrationPrice] = useState<number>(0);
  const recurrence = renewalBox && duration === 1 ? "/year" : "";

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        setEthUsdPrice(data?.ethereum?.usd);
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  useEffect(() => {
    function computeUsdPrice() {
      if (ethUsdPrice) {
        return ethUsdPrice * Number(gweiToEth(ethRegistrationPrice));
      }
      return 0;
    }

    if (!isEthPriceDisplayed) {
      setUsdRegistrationPrice(computeUsdPrice());
    }
  }, [ethRegistrationPrice, isEthPriceDisplayed]);

  function displayPrice(priceToPay: string, salesTaxInfo: string): ReactNode {
    return (
      <div className="flex items-center justify-center">
        <span className="text-gray-800 text-xl not-italic font-bold leading-6 whitespace-nowrap">
          {priceToPay}
        </span>
        {isUsResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function displayEthPrice(): ReactNode {
    const salesTaxAmount =
      salesTaxRate * Number(gweiToEth(ethRegistrationPrice)) * ethUsdPrice;
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

  function displayUsdPrice(): ReactNode {
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
            for {duration} {duration === 1 ? "year" : "years"}
          </p>
          {isEthPriceDisplayed ? displayEthPrice() : displayUsdPrice()}
        </div>
      </div>
      <CurrencySwitcher
        isEthPriceDisplayed={isEthPriceDisplayed}
        onCurrencySwitch={() => setIsEthPriceDisplayed(!isEthPriceDisplayed)}
      />
    </div>
  );
};

export default RegisterSummary;
