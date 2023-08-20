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
  const [usdRegistrationPrice, SetUsdRegistrationPrice] = useState<number>(0);
  const recurrence = renewalBox && duration === 1 ? "/year" : "";

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        setEthUsdPrice(data?.ethereum?.usd);
      });
  }, []);

  useEffect(() => {
    function computeUsdPrice() {
      if (ethUsdPrice) {
        return ethUsdPrice * Number(gweiToEth(ethRegistrationPrice));
      }
      return 0;
    }

    if (!isEthPriceDisplayed) {
      SetUsdRegistrationPrice(computeUsdPrice());
    }
  }, [ethRegistrationPrice, isEthPriceDisplayed]);

  function displayEthPrice(): ReactNode {
    const salesTaxAmount =
      salesTaxRate * Number(gweiToEth(ethRegistrationPrice));
    const salesTaxInfo = salesTaxAmount
      ? ` (+ ${salesTaxAmount} ETH for US sales tax)`
      : "";

    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-800 text-xl not-italic font-bold leading-6">
          {String(Number(gweiToEth(ethRegistrationPrice)))
            .concat(" ETH ")
            .concat(recurrence)}
        </p>
        {isUsResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function displayUsdPrice(): ReactNode {
    const salesTaxAmount = salesTaxRate * usdRegistrationPrice;
    const salesTaxInfo = salesTaxAmount
      ? ` (+ ${numberToFixedString(Number(salesTaxAmount))}$ for US sales tax)`
      : "";

    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-800 text-xl not-italic font-bold leading-6">
          {numberToFixedString(usdRegistrationPrice)
            .concat(" $ ")
            .concat(recurrence)}
        </p>
        {isUsResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
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
