import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";
import {
  CurrencyType,
  PaymentCurrencyIcon,
  PaymentCurrency,
} from "../../utils/constants";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@mui/material";
import { areArraysEqual } from "@/utils/arrayService";

type CurrencyDropdownProps = {
  onCurrencySwitch: (type: CurrencyType[]) => void;
  displayedCurrency: CurrencyType[];
};

const CurrencyDropdown: FunctionComponent<CurrencyDropdownProps> = ({
  displayedCurrency,
  onCurrencySwitch,
}) => {
  const selectStyle = {
    "& .MuiSelect-select": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "8px 16px",
      gap: "8px",
    },
    "& .MuiListItemIcon-root": {
      minWidth: "24px",
    },
    "& .css-10hburv-MuiTypography-root": {
      fontFamily: "Poppins-Regular",
    },
  };

  function onPaymentCurrencyChange(PaymentCurrency: PaymentCurrency) {
    if (PaymentCurrency === PaymentCurrency["ETH OR STRK"]) {
      onCurrencySwitch([CurrencyType.ETH, CurrencyType.STRK]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onCurrencySwitch([PaymentCurrency as any]); // as any is safe here cause we know the value is a CurrencyType
    }
  }

  function getPaymentCurrency(displayedCurrency: CurrencyType[]) {
    const areAllCurrenciesAccepted = areArraysEqual(displayedCurrency, [
      CurrencyType.ETH,
      CurrencyType.STRK,
    ]);

    return areAllCurrenciesAccepted
      ? PaymentCurrency["ETH OR STRK"]
      : displayedCurrency[0];
  }

  return (
    <div className={styles.currencySwitcher}>
      <Select
        fullWidth
        value={getPaymentCurrency(displayedCurrency)}
        defaultValue={getPaymentCurrency(displayedCurrency)}
        inputProps={{ MenuProps: { disableScrollLock: true } }}
        onChange={(e) =>
          onPaymentCurrencyChange(e.target.value as PaymentCurrency)
        }
        style={{
          borderRadius: "8.983px",
        }}
        sx={selectStyle}
      >
        {Object.values(PaymentCurrency).map((currency) => {
          return (
            <MenuItem key={currency} value={currency}>
              <ListItemIcon>
                <img
                  width="20px"
                  src={`${PaymentCurrencyIcon[currency]}`}
                  alt={`${currency} icon`}
                />
              </ListItemIcon>
              <ListItemText primary={currency} />
            </MenuItem>
          );
        })}
      </Select>
    </div>
  );
};

export default CurrencyDropdown;
