import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV3.module.css";
import { numberToFixedString, weiToEth } from "../../utils/feltService";
import { CurrencyType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";
import { Skeleton } from "@mui/material";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import ArCurrencyDropdown from "./arCurrencyDropdown";
import { getDisplayablePrice } from "@/utils/priceService";

type RegisterSummaryProps = {
  durationInYears: number;
  yearlyPrice: bigint;
  price: bigint;
  renewalBox?: boolean;
  salesTaxRate: number;
  isSwissResident?: boolean;
  customMessage?: string;
  displayedCurrency?: CurrencyType[] | CurrencyType;
  onCurrencySwitch?:
    | ((type: CurrencyType[]) => void)
    | ((type: CurrencyType) => void);
  loadingPrice?: boolean;
  isUpselled?: boolean;
  discountedPrice?: bigint; // price the user will pay after discount
  areArCurrenciesEnabled?: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  durationInYears,
  yearlyPrice,
  price,
  renewalBox = true,
  salesTaxRate,
  isSwissResident,
  customMessage,
  displayedCurrency,
  onCurrencySwitch,
  loadingPrice,
  isUpselled = false,
  discountedPrice,
  areArCurrenciesEnabled = false,
}) => {
  const [ethUsdPrice, setEthUsdPrice] = useState<string>("0"); // price of 1 ETH in USD
  const [usdRegistrationPrice, setUsdRegistrationPrice] = useState<string>("0");
  const recurrence = renewalBox && durationInYears === 1 ? "/year" : "";
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Coingecko API Data:", data);
        setEthUsdPrice(data?.ethereum?.usd);
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  const announcedCurrency =
    Array.isArray(displayedCurrency) && displayedCurrency.length > 1
      ? "ETH or STRK"
      : displayedCurrency;

  useEffect(() => {
    const computeUsdPrice = () => {
      if (!ethUsdPrice || !price) return 0;

      const effectivePrice =
        discountedPrice && discountedPrice !== BigInt(0)
          ? discountedPrice
          : price;
      const effectiveDuration = Math.max(durationInYears, 1);

      return Number(ethUsdPrice) * weiToEth(effectivePrice) * effectiveDuration;
    };

    setUsdRegistrationPrice(computeUsdPrice().toFixed(2));
  }, [price, ethUsdPrice, durationInYears, discountedPrice]);

  // Ideally, this should be a separate components
  function displayPrice(priceToPay: string, salesTaxInfo: string): ReactNode {
    return (
      <div className="flex items-center justify-center">
        <span className={styles.price}>
          {priceToPay} {announcedCurrency} {recurrence}
        </span>
        {isSwissResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function displayDiscountedPrice(
    price: string,
    priceDiscounted: string,
    salesTaxInfo: string
  ): ReactNode {
    return (
      <div className="flex items-center justify-center">
        <span className={styles.priceCrossed}>{price}</span>
        <ArrowRightIcon width="25" color="#454545" />
        <span className={styles.price}>
          {priceDiscounted} {announcedCurrency} {recurrence} 🔥
        </span>
        {isSwissResident ? (
          <p className={styles.legend}>&nbsp;{salesTaxInfo}</p>
        ) : null}
      </div>
    );
  }

  function displayTokenPrice(): ReactNode {
    const salesTaxAmountUsd =
      salesTaxRate * weiToEth(yearlyPrice) * Number(ethUsdPrice);

    const salesTaxInfo = salesTaxAmountUsd
      ? ` (+ ${numberToFixedString(
          salesTaxAmountUsd
        )}$ worth of ${announcedCurrency} for Swiss VAT)`
      : "";

    if (isUpselled && discountedPrice) {
      return displayDiscountedPrice(
        getDisplayablePrice(price),
        getDisplayablePrice(discountedPrice),
        salesTaxInfo
      );
    }
    return displayPrice(getDisplayablePrice(price), salesTaxInfo);
  }

  function getCheckoutMessage() {
    if (customMessage) return customMessage;
    if (!yearlyPrice) return "0";
    else {
      return `${getDisplayablePrice(yearlyPrice)} ETH x ${durationInYears} ${
        isUpselled || durationInYears > 1 ? "years" : "year"
      }`;
    }
  }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>{getCheckoutMessage()}</p>
          {loadingPrice ? (
            <Skeleton variant="text" width="150px" height="24px" />
          ) : (
            displayTokenPrice()
          )}
          <p className={styles.legend}>≈ ${usdRegistrationPrice.toString()}</p>
        </div>
      </div>
      {areArCurrenciesEnabled ? (
        <ArCurrencyDropdown
          displayedCurrency={displayedCurrency as CurrencyType[]} // as CurrencyType[] is safe here cause we know the value is a CurrencyType[]
          onCurrencySwitch={onCurrencySwitch as (type: CurrencyType[]) => void}
        />
      ) : (
        <CurrencyDropdown
          displayedCurrency={displayedCurrency as CurrencyType} // as CurrencyType is safe here cause we know the value is a CurrencyType
          onCurrencySwitch={onCurrencySwitch as (type: CurrencyType) => void}
        />
      )}
    </div>
  );
};

export default RegisterSummary;
