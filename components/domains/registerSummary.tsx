import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV3.module.css";
import { gweiToEth, numberToFixedString } from "../../utils/feltService";
import { CurrencyType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";
import { Skeleton } from "@mui/material";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import ArCurrencyDropdown from "./arCurrencyDropdown";

type RegisterSummaryProps = {
  duration: number;
  ethRegistrationPrice?: string;
  registrationPrice?: string; // price in displayedCurrency, set to priceInEth on first load as ETH is the default currency
  renewalBox?: boolean;
  salesTaxRate?: number;
  isSwissResident?: boolean;
  customMessage?: string;
  displayedCurrency?: CurrencyType[] | CurrencyType;
  onCurrencySwitch?:
    | ((type: CurrencyType[]) => void)
    | ((type: CurrencyType) => void);
  loadingPrice?: boolean;
  isUpselled?: boolean;
  discountedPrice?: string; // price the user will pay after discount
  discountedDuration?: number; // years the user will have the domain for after discount
  areArCurrenciesEnabled?: boolean;
  isFree?: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  duration,
  ethRegistrationPrice,
  registrationPrice,
  renewalBox = true,
  salesTaxRate,
  isSwissResident,
  customMessage,
  displayedCurrency,
  onCurrencySwitch,
  loadingPrice,
  isUpselled = false,
  discountedPrice,
  discountedDuration,
  areArCurrenciesEnabled = false,
  isFree = false,
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

  const announcedCurrency =
    Array.isArray(displayedCurrency) && displayedCurrency.length > 1
      ? "ETH or STRK"
      : displayedCurrency;

  useEffect(() => {
    function computeUsdPrice() {
      if (ethUsdPrice && ethRegistrationPrice) {
        return (
          Number(ethUsdPrice) *
          Number(gweiToEth(ethRegistrationPrice)) *
          duration
        ).toFixed(2);
      }
      return "0";
    }

    setUsdRegistrationPrice(computeUsdPrice());
  }, [ethRegistrationPrice, ethUsdPrice, duration]);

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
    if (!ethRegistrationPrice || !salesTaxRate || !registrationPrice)
      return null;
    const salesTaxAmountUsd =
      salesTaxRate *
      Number(gweiToEth(ethRegistrationPrice)) *
      Number(ethUsdPrice);
    const salesTaxInfo = salesTaxAmountUsd
      ? ` (+ ${numberToFixedString(
          salesTaxAmountUsd
        )}$ worth of ${announcedCurrency} for Swiss VAT)`
      : "";

    const registerPrice = Number(gweiToEth(registrationPrice));
    const registerPriceStr =
      registerPrice != 0 ? numberToFixedString(registerPrice, 3) : "0";
    if (isUpselled && discountedPrice) {
      return displayDiscountedPrice(
        registerPriceStr,
        numberToFixedString(Number(gweiToEth(discountedPrice)), 3),
        salesTaxInfo
      );
    }
    return displayPrice(registerPriceStr, salesTaxInfo);
  }

  function getMessage() {
    if (isFree) return "3 months";
    if (!ethRegistrationPrice) return "0";
    if (customMessage) return customMessage;
    else {
      return `${gweiToEth(ethRegistrationPrice)} ETH x ${
        isUpselled ? discountedDuration : duration
      } ${isUpselled || duration > 1 ? "years" : "year"}`;
    }
  }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>{getMessage()}</p>
          {isFree ? (
            "Free"
          ) : (
            <>
              {loadingPrice ? (
                <Skeleton variant="text" width="150px" height="24px" />
              ) : (
                displayTokenPrice()
              )}
              <p className={styles.legend}>≈ ${usdRegistrationPrice}</p>
            </>
          )}
        </div>
      </div>
      {isFree ? null : areArCurrenciesEnabled ? (
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
