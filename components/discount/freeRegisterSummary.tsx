import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV3.module.css";
import { getYearlyPrice } from "@/utils/priceService";
import DoneIcon from "../UI/iconsComponents/icons/doneIcon";
import { GasTokenPrice } from "@avnu/gasless-sdk";

type FreeRegisterSummaryProps = {
  duration: number;
  domain: string;
  gasless?: boolean;
  gasTokenPrices?: GasTokenPrice[];
  gasTokenPrice?: GasTokenPrice;
  setGasTokenPrice: (price: GasTokenPrice) => void;
};

const FreeRegisterSummary: FunctionComponent<FreeRegisterSummaryProps> = ({
  domain,
  duration,
  gasless,
  gasTokenPrices,
  gasTokenPrice,
  setGasTokenPrice,
}) => {
  function getMessage() {
    return `${Math.floor(duration / 30)} months of domain registration`;
  }

  return (
    <div className={styles.pricesSummary}>
      <div className={styles.totalDue}>
        <h4 className={styles.totalDueTitle}>Total due:</h4>
        <div className={styles.priceContainer}>
          <p className={styles.legend}>{getMessage()}</p>
          <p>
            <span className="line-through">{getYearlyPrice(domain)} ETH</span>
            &nbsp;&nbsp;
            <strong>Free</strong>
          </p>
        </div>
        {gasless ? (
          <div className="flex items-center gap-2">
            <DoneIcon width="24" color="green" />
            <p className="text-sm">
              No gas fees to pay. You have a{" "}
              <a
                href="https://doc.avnu.fi/starknet-paymaster/introduction"
                target="_blank"
                rel="noreferrer noopener"
                className="underline"
              >
                Paymaster
              </a>{" "}
              reward.
            </p>
          </div>
        ) : (
          gasTokenPrices?.map((price) => (
            <button
              disabled={price.tokenAddress === gasTokenPrice?.tokenAddress}
              onClick={() => setGasTokenPrice(price)}
              key={price.tokenAddress}
            >
              {price.tokenAddress}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default FreeRegisterSummary;
