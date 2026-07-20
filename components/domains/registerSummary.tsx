import React, { type FunctionComponent, useEffect, useState } from "react";
import { Skeleton } from "@mui/material";
import CurrencyDropdown from "./currencyDropdown";
import styles from "../../styles/components/registerV3.module.css";

type RegisterSummaryProps = {
  durationInYears: number;
  price?: bigint;
  loadingPrice?: boolean;
};

function displayPrice(price: bigint): string {
  return (Number(price) / 1e18).toFixed(3);
}

const RegisterSummary: FunctionComponent<RegisterSummaryProps> = ({
  durationInYears,
  price,
  loadingPrice,
}) => {
  const [ethUsdPrice, setEthUsdPrice] = useState("0");

  useEffect(() => {
    void fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((response) => response.json())
      .then((data: { ethereum?: { usd?: number } }) =>
        setEthUsdPrice(String(data.ethereum?.usd ?? 0))
      )
      .catch(() => setEthUsdPrice("0"));
  }, []);

  const usdPrice = price
    ? ((Number(price) / 1e18) * Number(ethUsdPrice)).toFixed(2)
    : "0.00";

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>
            {price ? displayPrice(price) : "0"} ETH x {durationInYears}{" "}
            {durationInYears > 1 ? "years" : "year"}
          </p>
          {loadingPrice ? (
            <Skeleton variant="text" width="150px" height="24px" />
          ) : (
            <div className="flex items-center justify-center">
              <span className={styles.price}>
                {price ? displayPrice(price) : "0.000"} ETH
              </span>
            </div>
          )}
          <p className={styles.legend}>≈ ${usdPrice}</p>
        </div>
      </div>
      <CurrencyDropdown />
    </div>
  );
};

export default RegisterSummary;
