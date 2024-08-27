import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "../../styles/components/registerV3.module.css";
import { weiToEth } from "../../utils/feltService";
import { CurrencyType } from "../../utils/constants";
import CurrencyDropdown from "./currencyDropdown";
import { Skeleton } from "@mui/material";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import ArCurrencyDropdown from "./arCurrencyDropdown";
import { getDisplayablePrice } from "@/utils/priceService";

type RegisterSummaryProps = {
  durationInYears: number;
  priceInEth: bigint;
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
  discountedPrice?: bigint;
  discountedPriceInEth?: bigint;
  areArCurrenciesEnabled?: boolean;
};

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  durationInYears,
  priceInEth,
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
  discountedPriceInEth,
  areArCurrenciesEnabled = false,
}) => {
  const [ethUsdPrice, setEthUsdPrice] = useState<string>("0"); // price of 1 ETH in USD
  const [usdRegistrationPrice, setUsdRegistrationPrice] = useState<string>("0");
  const [salesTaxAmountUsd, setSalesTaxAmountUsd] = useState<string>("0");
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
    const effectivePrice =
      discountedPrice && discountedPrice !== BigInt(0) && discountedPriceInEth
        ? discountedPriceInEth
        : priceInEth;

    const computeUsdRegistrationPrice = () => {
      if (!ethUsdPrice || !priceInEth) return 0;

      return Number(ethUsdPrice) * weiToEth(effectivePrice);
    };

    const computeUsdSalesTaxAmount = () => {
      if (!ethUsdPrice || !priceInEth) return 0;

      return salesTaxRate * weiToEth(effectivePrice) * Number(ethUsdPrice);
    };

    setUsdRegistrationPrice(computeUsdRegistrationPrice().toFixed(2));
    setSalesTaxAmountUsd(computeUsdSalesTaxAmount().toFixed(2));
  }, [
    priceInEth,
    ethUsdPrice,
    durationInYears,
    discountedPrice,
    discountedPriceInEth,
    salesTaxRate,
  ]);

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
    const salesTaxInfo = salesTaxAmountUsd
      ? ` (+ ${salesTaxAmountUsd}$ worth of ${announcedCurrency} for Swiss VAT)`
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
    if (!priceInEth) return "0";
    else {
      return `${getDisplayablePrice(priceInEth)} ETH x ${durationInYears} ${
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
          <p className={styles.legend}>≈ ${usdRegistrationPrice}</p>
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
