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
import { CDNImg } from "../cdn/image";

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
  const defaultText = matches ? "Mint a new one" : "Mint a new Starknet ID";

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
      <div className="flex my-1">
        <p className={textFieldStyles.legend}>
          {matches
            ? "Select an identity*"
            : "Select an identity to link with your domain*"}
        </p>
      </div>
      <Select
        fullWidth
        value={tokenId}
        defaultValue={ownedIdentities[0]}
        onChange={(e) => changeTokenId(Number(e.target.value))}
        style={{
          borderRadius: "8.983px",
        }}
        sx={{
          "& .MuiSelect-select": {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          "& .css-10hburv-MuiTypography-root": {
            fontFamily: "Poppins-Regular",
          },
        }}
      >
        <MenuItem value={0}>
          <ListItemIcon>
            <CDNImg
              width={"30px"}
              src="/visuals/StarknetIdLogo.svg"
              alt="starknet.id avatar"
            />
          </ListItemIcon>
          <ListItemText primary={defaultText} />
        </MenuItem>
        {ownedIdentities.map((tokenId: number, index: number) => (
          <MenuItem key={index} value={tokenId}>
            <ListItemIcon>
              <CDNImg
                width={"25px"}
                src={`${process.env.NEXT_PUBLIC_STARKNET_ID}/api/identicons/${tokenId}`}
                alt="starknet.id avatar"
              />
            </ListItemIcon>
            <ListItemText primary={tokenId} />
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default SelectIdentity;
