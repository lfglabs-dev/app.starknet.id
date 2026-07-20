import React, { type FunctionComponent } from "react";
import { ListItemIcon, ListItemText, MenuItem, Select } from "@mui/material";
import styles from "../../styles/components/registerV2.module.css";

const CurrencyDropdown: FunctionComponent = () => {
  const selectStyle = {
    "& .MuiSelect-select": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "8px 16px",
      gap: "8px",
    },
    "& .MuiListItemIcon-root": { minWidth: "24px" },
    "& .css-10hburv-MuiTypography-root": {
      fontFamily: "Poppins-Regular",
    },
  };

  return (
    <div className={styles.currencySwitcher}>
      <Select
        fullWidth
        value="ETH"
        defaultValue="ETH"
        inputProps={{ MenuProps: { disableScrollLock: true } }}
        style={{ borderRadius: "8.983px" }}
        sx={selectStyle}
      >
        <MenuItem value="ETH">
          <ListItemIcon>
            <img width="20px" src="/currencies/eth.svg" alt="ETH icon" />
          </ListItemIcon>
          <ListItemText primary="ETH" />
        </MenuItem>
      </Select>
    </div>
  );
};

export default CurrencyDropdown;
