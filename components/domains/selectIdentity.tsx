import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { hexToDecimal } from "../../utils/feltService";
import textFieldStyles from "../../styles/components/textField.module.css";
import InputHelper from "../UI/inputHelper";

type SelectIdentityProps = {
  tokenId: number;
  changeTokenId: (value: number) => void;
};

const SelectIdentity: FunctionComponent<SelectIdentityProps> = ({
  tokenId,
  changeTokenId,
}) => {
  const { account } = useAccount();
  const [ownedIdentities, setOwnedIdentities] = useState<number[] | []>([]);
  const matches = useMediaQuery("(max-width: 1084px)");
  const defaultText = matches ? "Mint a new one" : "Mint a new starknet id";

  useEffect(() => {
    if (account) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_available_ids?addr=${hexToDecimal(account.address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          const dataFiltered = data.ids.filter(
            (element: string, index: number) => {
              return data.ids.indexOf(element) === index;
            }
          );
          setOwnedIdentities(dataFiltered);
        });
    }
  }, [account]);

  return (
    <div className="flex flex-col w-full">
      <div className="grid place-content-center my-2 ">
        <p className={textFieldStyles.legend}>
          Select an identity to link with your domain*
        </p>
      </div>
      <InputHelper>
        <Select
          fullWidth
          value={tokenId}
          IconComponent={() => null}
          defaultValue={ownedIdentities[0]}
          inputProps={{ MenuProps: { disableScrollLock: true } }}
          onChange={(e) => changeTokenId(Number(e.target.value))}
          style={{
            borderRadius: "8px",
          }}
          sx={{
            boxShadow: "0px 2px 30px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            width: "100%",
            "& .MuiSelect-select": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#ffffff",
              textAlign: "center",
              borderRadius: "8px",
              borderColor: "rgba(69, 69, 69, 0.20)",
            },
            "& .css-10hburv-MuiTypography-root": {
              display: "flex",
              justifyItems: "flex-start",
              fontFamily: "Poppins-Regular",
            },
            "& .css-cveggr-MuiListItemIcon-root": {
              minWidth: "40px",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiListItemText-root": {
              textAlign: "center",
              justifyContent: "center",
              display: "flex",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(69, 69, 69, 0.20)",
            },
          }}
        >
          <MenuItem value={0}>
            <div className="flex gap-2">
              <ListItemIcon>
                <img
                  width={"30px"}
                  src="/visuals/StarknetIdLogo.svg"
                  alt="starknet.id avatar"
                />
              </ListItemIcon>
              <ListItemText primary={defaultText} />
            </div>
          </MenuItem>
          {ownedIdentities.map((tokenId: number, index: number) => (
            <MenuItem key={index} value={tokenId}>
              <ListItemIcon>
                <img
                  width={"25px"}
                  src={`https://identicon.starknet.id/${tokenId}`}
                  alt="starknet.id avatar"
                />
              </ListItemIcon>
              <ListItemText primary={tokenId} />
            </MenuItem>
          ))}
        </Select>
      </InputHelper>
    </div>
  );
};

export default SelectIdentity;
