import React, { FunctionComponent } from "react";
import styles from "../../styles/components/registerV2.module.css";
import { CurrenciesIcon, CurrenciesType } from "../../utils/constants";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@mui/material";

type CurrencyDropdownProps = {
  onCurrencySwitch: (type: CurrenciesType) => void;
  currencyDisplayed: CurrenciesType;
  //todo : lui passer ici les balances comme ça on affiche que celles où la balance > 0
  // si balances est vide alors on prend toutes les currencies via la constante
};

const CurrencyDropdown: FunctionComponent<CurrencyDropdownProps> = ({
  currencyDisplayed,
  onCurrencySwitch,
}) => {
  return (
    <div className={styles.currencySwitcher}>
      <Select
        fullWidth
        value={currencyDisplayed}
        defaultValue={currencyDisplayed}
        onChange={(e) => onCurrencySwitch(e.target.value as CurrenciesType)}
        style={{
          borderRadius: "8.983px",
        }}
        sx={{
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
        }}
      >
        {Object.values(CurrenciesType).map((currency) => {
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
