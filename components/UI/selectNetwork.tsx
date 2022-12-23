import React, { FunctionComponent } from "react";
import {
  FormControl,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useRouter } from "next/router";

type SelectNetworkProps = {
  network: "testnet" | "mainnet";
};

const SelectNetwork: FunctionComponent<SelectNetworkProps> = ({ network }) => {
  const router = useRouter();

  function changeTokenId(e: any): void {
    if (e.target.value != network) {
      if (e.target.value === "testnet") {
        router.push("https://goerli.app.starknet.id" + router.asPath);
      } else {
        router.push("https://app.starknet.id" + router.asPath);
      }
    }
  }

  return (
    <div className="mr-5">
      <FormControl fullWidth>
        <Select
          value={network}
          defaultValue={"Testnet"}
          onChange={changeTokenId}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textTransform: "none",
              padding: "10px",
              width: "80%",
              cursor: "pointer",
              color: "#402d28",
            },

            "& .MuiListItemIcon-root": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0px",
              fontWeight: "bold",
              margin: "0px",
            },
            "& .css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-11u53oe-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
              { paddingRight: "40px" },
            "& .css-10hburv-MuiTypography-root": { fontWeight: "600" },
          }}
        >
          <MenuItem value={"testnet"}>
            <ListItemIcon>
              <img
                width={"25px"}
                src="/visuals/starknetLogo.webp"
                alt="starknet logo"
              />
            </ListItemIcon>

            <ListItemText primary="Testnet" />
          </MenuItem>
          <MenuItem value={"mainnet"}>
            <ListItemIcon>
              <img
                width={"25px"}
                src="/visuals/starknetLogo.webp"
                alt="starknet logo"
              />
            </ListItemIcon>

            <ListItemText primary="Mainnet" />
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectNetwork;
