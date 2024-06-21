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
  // duration paid by the user
  durationInDays: number;
  // years the user will have the domain for after discount
  discountedDuration?: number;
  dailyPriceInEth?: bigint;
  dailyPrice?: bigint;
  discountedPrice?: bigint;
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
  areArCurrenciesEnabled?: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  durationInDays,
  dailyPriceInEth,
  dailyPrice,
  discountedPrice,
  renewalBox = true,
  salesTaxRate,
  isSwissResident,
  customMessage,
  displayedCurrency,
  onCurrencySwitch,
  loadingPrice,
  isUpselled = false,
  discountedDuration,
  areArCurrenciesEnabled = false,
}) => {
  const [ethUsdPrice, setEthUsdPrice] = useState<number>(0); // price of 1ETH in USD
  const [usdFinalPrice, setUsdFinalPrice] = useState<string>("0");
  const recurrence = renewalBox && durationInDays === 365 ? "/year" : "";
  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        setEthUsdPrice(Number(data?.ethereum?.usd));
      })
      .catch((err) => console.log("Coingecko API Error:", err));
  }, []);

  const announcedCurrency =
    Array.isArray(displayedCurrency) && displayedCurrency.length > 1
      ? "ETH or STRK"
      : displayedCurrency;
  useEffect(() => {
    setUsdFinalPrice(() => {
      if (ethUsdPrice && dailyPriceInEth) {
        return (
          ethUsdPrice *
          Number(
            weiToEth(
              isUpselled && discountedPrice
                ? discountedPrice
                : dailyPriceInEth *
                    BigInt(
                      isUpselled && discountedDuration
                        ? discountedDuration
                        : durationInDays
                    )
            )
          )
        ).toFixed(2);
      }
      return "0";
    });
  }, [dailyPriceInEth, ethUsdPrice]);

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
    const salesTaxAmountUsd = dailyPriceInEth
      ? salesTaxRate * Number(weiToEth(dailyPriceInEth)) * Number(ethUsdPrice)
      : 0;
    const salesTaxInfo = salesTaxAmountUsd
      ? ` (+ ${numberToFixedString(
          salesTaxAmountUsd
        )}$ worth of ${announcedCurrency} for Swiss VAT)`
      : "";

    const registerPrice = Number(
      weiToEth(
        BigInt(
          isUpselled && discountedDuration ? discountedDuration : durationInDays
        ) * (dailyPrice ? dailyPrice : BigInt(0))
      )
    );
    const discountedRegisterPrice = Number(
      weiToEth(discountedPrice ? discountedPrice : BigInt(0))
    );
    const displayedNormalPrice =
      registerPrice != 0 ? numberToFixedString(registerPrice, 4) : "0";

    if (isUpselled) {
      return displayDiscountedPrice(
        displayedNormalPrice,
        discountedRegisterPrice != 0
          ? numberToFixedString(discountedRegisterPrice, 4)
          : "0",
        salesTaxInfo
      );
    }
    return displayPrice(displayedNormalPrice, salesTaxInfo);
  }

  function getMessage() {
    if (!dailyPriceInEth) return "0";
    if (customMessage) return customMessage;
    else {
      return `${weiToEth(dailyPriceInEth * BigInt(365))} ETH x ${Math.floor(
        ((isUpselled ? discountedDuration : durationInDays) as number) / 365
      )} ${isUpselled || durationInDays / 365 >= 2 ? "years" : "year"}`;
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
          <p className={styles.legend}>≈ ${usdFinalPrice}</p>
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
