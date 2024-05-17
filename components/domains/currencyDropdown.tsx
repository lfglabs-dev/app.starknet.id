import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";
import { CurrenciesIcon, CurrencyType } from "../../utils/constants";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@mui/material";

type CurrencyDropdownProps = {
  onCurrencySwitch: (type: CurrencyType) => void;
  displayedCurrency: CurrencyType;
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
  return (
    <div className={styles.currencySwitcher}>
      <Select
        fullWidth
        value={displayedCurrency}
        defaultValue={displayedCurrency}
        inputProps={{ MenuProps: { disableScrollLock: true } }}
        onChange={(e) => onCurrencySwitch(e.target.value as CurrencyType)}
        style={{
          borderRadius: "8.983px",
        }}
        sx={selectStyle}
      >
        {Object.values(CurrencyType).map((currency) => {
          return (
            <MenuItem key={currency} value={currency}>
              <ListItemIcon>
                <img
                  width={"20px"}
                  src={`${CurrenciesIcon[currency]}`}
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
