import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";

type SwitchCurrencyProps = {
  onCurrencySwitch: () => void;
  isEthPriceDisplayed: boolean;
};

const SwitchCurrency: FunctionComponent<SwitchCurrencyProps> = ({
  isEthPriceDisplayed,
  onCurrencySwitch,
}) => {
  return (
    <div className={styles.currencySwitcher}>
      <div
        className={
          isEthPriceDisplayed ? styles.activeSwitch : styles.inactiveSwitch
        }
        onClick={onCurrencySwitch}
      >
        ETH
      </div>
      <div
        className={
          isEthPriceDisplayed ? styles.inactiveSwitch : styles.activeSwitch
        }
        onClick={onCurrencySwitch}
      >
        USD
      </div>
    </div>
  );
};

export default SwitchCurrency;
