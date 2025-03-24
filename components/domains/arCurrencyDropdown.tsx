/**
    * @description      : 
    * @author           : 
    * @group            : 
    * @created          : 24/03/2025 - 14:03:52
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 24/03/2025
    * - Author          : 
    * - Modification    : 
**/
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
      alignItems: "center",
      padding: "12px 16px",
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
        renderValue={(selected) => {
          const currencyKey =
            selected && ArCurrencyIcon[selected] ? selected : "ETH OR STRK";

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                width="20px"
                src={ArCurrencyIcon[currencyKey]}
                alt={`${currencyKey} icon`}
              />
              <span style={{ color: selected ? "#000" : "#aaa" }}>
                {selected || "ETH OR STRK"}
              </span>
            </div>
          );
        }}
      >
        {Object.values(ArCurrency).map((currency) => (
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
        ))}
      </Select>
    </div>
  );
};

export default ArCurrencyDropdown;
