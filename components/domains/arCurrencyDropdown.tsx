import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";
import {
  CurrencyType,
  ArCurrencyIcon,
  ArCurrency,
} from "../../utils/constants";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@mui/material";
import { areArraysEqual } from "@/utils/arrayService";

type ArCurrencyDropdownProps = {
  onCurrencySwitch: (type: CurrencyType[]) => void;
  displayedCurrency: CurrencyType[];
  areSeveralCurrenciesEnabled?: boolean;
};

const ArCurrencyDropdown: FunctionComponent<ArCurrencyDropdownProps> = ({
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

  function onArCurrencyChange(ArCurrency: ArCurrency) {
    if ("ETH OR STRK" === ArCurrency) {
      onCurrencySwitch([CurrencyType.ETH, CurrencyType.STRK]);
    } else {
      onCurrencySwitch([ArCurrency as unknown as CurrencyType]); // Safe here cause we know the value is a CurrencyType
    }
  }

  function getArCurrency(displayedCurrency: CurrencyType[]) {
    const areAllCurrenciesAccepted = areArraysEqual(displayedCurrency, [
      CurrencyType.ETH,
      CurrencyType.STRK,
    ]);

    return areAllCurrenciesAccepted
      ? ArCurrency["ETH OR STRK"]
      : displayedCurrency[0];
  }

  return (
    <div className={styles.currencySwitcher}>
      <Select
        fullWidth
        value={getArCurrency(displayedCurrency)}
        defaultValue={getArCurrency(displayedCurrency)}
        inputProps={{ MenuProps: { disableScrollLock: true } }}
        onChange={(e) => onArCurrencyChange(e.target.value as ArCurrency)}
        style={{
          borderRadius: "8.983px",
        }}
        sx={selectStyle}
      >
        {Object.values(ArCurrency).map((currency) => {
          return (
            <MenuItem key={currency} value={currency}>
              <ListItemIcon>
                <img
                  width="20px"
                  src={`${ArCurrencyIcon[currency]}`}
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

export default ArCurrencyDropdown;
