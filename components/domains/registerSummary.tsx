import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV3.module.css";
import { weiToEth, numberToFixedString } from "../../utils/feltService";
import { CurrencyType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";
import { Skeleton } from "@mui/material";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import ArCurrencyDropdown from "./arCurrencyDropdown";

type RegisterSummaryProps = {
  ethPrice?: bigint;
  paidPrice?: bigint;
  expectedPrice?: bigint;
  yearlyRenewalPriceInEth?: bigint;
  receivedDurationInDays: number;
  renewalBox?: boolean;
  salesTaxRate: number;
  isSwissResident?: boolean;
  customMessage?: string;
  paymentCurrency?: CurrencyType[] | CurrencyType;
  onCurrencySwitch?:
    | ((type: CurrencyType[]) => void)
    | ((type: CurrencyType) => void);
  loadingPrice?: boolean;
  isUpselled?: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  ethPrice,
  paidPrice,
  expectedPrice,
  yearlyRenewalPriceInEth,
  receivedDurationInDays,
  renewalBox = true,
  salesTaxRate,
  isSwissResident,
  customMessage,
  paymentCurrency,
  onCurrencySwitch,
  loadingPrice,
  isUpselled = false,
}) => {
  // price of 1ETH in USD
  const [ethUsdQuote, setEthUsdQuote] = useState<number>(0);
  // includes tax
  const [usdEstimation, setUsdEstimation] = useState<number>(0);
  const recurrence =
    renewalBox && receivedDurationInDays === 365 ? "/year" : "";

  // this will allow to display
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        setEthUsdQuote(Number(data?.ethereum?.usd));
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  const announcedCurrency =
    Array.isArray(paymentCurrency) && paymentCurrency.length > 1
      ? "ETH or STRK"
      : paymentCurrency;

  useEffect(() => {
    if (ethUsdQuote && ethPrice) {
      setUsdEstimation(ethUsdQuote * Number(weiToEth(ethPrice)));
    }
  }, [ethUsdQuote, ethPrice]);

  // Ideally, this should be a separate components
  function displayPrice(priceToPay: string, salesTaxInfo: string): ReactNode {
    return (
      <div className="flex items-center justify-center">
        <span className={styles.price}>
          {toFixedTrimmed(weiToEth(priceToPay), 4)} {announcedCurrency}{" "}
          {recurrence}
        </span>
        {isSwissResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function toFixedTrimmed(num: number, decimals: number) {
    return Number(num.toFixed(decimals)).toString();
  }

  function displayDiscountedPrice(
    expectedPrice: bigint,
    paidPrice: bigint,
    salesTaxInfo: string
  ): ReactNode {
    return (
      <div className="flex items-center justify-center">
        <span className={styles.priceCrossed}>
          {toFixedTrimmed(weiToEth(expectedPrice), 4)}
        </span>
        <ArrowRightIcon width="25" color="#454545" />
        <span className={styles.price}>
          {toFixedTrimmed(weiToEth(paidPrice), 4)} {announcedCurrency}{" "}
          {recurrence} 🔥
        </span>
        {isSwissResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function displayTokenPrice(): ReactNode {
    if (!expectedPrice || !paidPrice) return;

    const salesTaxInfo = salesTaxRate
      ? ` (+ ${numberToFixedString(
          salesTaxRate * usdEstimation
        )}$ worth of ${announcedCurrency} for Swiss VAT)`
      : "";

    if (isUpselled) {
      return displayDiscountedPrice(expectedPrice, paidPrice, salesTaxInfo);
    }
    return displayPrice(paidPrice.toString(), salesTaxInfo);
  }

  function getMessage() {
    if (!yearlyRenewalPriceInEth) return "";
    if (customMessage) return customMessage;
    else {
      return `${toFixedTrimmed(
        weiToEth(yearlyRenewalPriceInEth),
        4
      )} ETH x ${Math.floor(receivedDurationInDays / 365)} ${
        receivedDurationInDays / 365 >= 2 ? "years" : "year"
      }`;
    }
  }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>{getMessage()}</p>
          {loadingPrice ? (
            <Skeleton variant="text" width="150px" height="24px" />
          ) : (
            displayTokenPrice()
          )}
          <p className={styles.legend}>≈ ${toFixedTrimmed(usdEstimation, 2)}</p>
        </div>
      </div>
      {Array.isArray(paymentCurrency) ? (
        <ArCurrencyDropdown
          displayedCurrency={paymentCurrency as CurrencyType[]} // as CurrencyType[] is safe here cause we know the value is a CurrencyType[]
          onCurrencySwitch={onCurrencySwitch as (type: CurrencyType[]) => void}
        />
      ) : (
        <CurrencyDropdown
          displayedCurrency={paymentCurrency as CurrencyType} // as CurrencyType is safe here cause we know the value is a CurrencyType
          onCurrencySwitch={onCurrencySwitch as (type: CurrencyType) => void}
        />
      )}
    </div>
  );
};

export default RegisterSummary;
