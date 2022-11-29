/* eslint-disable @next/next/no-img-element */
import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useAccount } from "@starknet-react/core";
import React, { FunctionComponent, useEffect, useState } from "react";
import { hexToFelt } from "../../utils/felt";

type SelectDomainProps = {
  tokenId: number;
  changeTokenId: (e: any) => void;
  defaultText?: string;
};

const SelectDomain: FunctionComponent<SelectDomainProps> = ({
  tokenId,
  changeTokenId,
  defaultText = "Mint a new starknet.id",
}) => {
  const { account } = useAccount();
  const [ownedIdentities, setOwnedIdentities] = useState<number[] | []>([]);

  useEffect(() => {
    if (account) {
      fetch(
        `https://indexer.starknet.id/addr_to_available_ids?addr=${hexToFelt(
          account.address
        )?.replace("0x", "")}`
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
    <div className="mt-3">
      <FormControl fullWidth>
        <InputLabel>Starknet.id</InputLabel>
        <Select
          value={tokenId}
          defaultValue={ownedIdentities[0]}
          label="Starknet.id"
          onChange={changeTokenId}
          sx={{
            "& .MuiSelect-select": {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        >
          <MenuItem value={0}>
            <ListItemIcon>
              <img
                width={"25px"}
                src="/visuals/StarknetIdLogo.png"
                alt="starknet.id avatar"
              />
            </ListItemIcon>
            <ListItemText primary={defaultText} />
          </MenuItem>
          {ownedIdentities.map((tokenId: number, index: number) => (
            <MenuItem key={index} value={tokenId}>
              <ListItemIcon>
                <img
                  width={"25px"}
                  src={`https://www.starknet.id/api/identicons/${tokenId}`}
                  alt="starknet.id avatar"
                />
              </ListItemIcon>
              <ListItemText primary={tokenId} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          Choose the starknet identity you want to link with your domain
        </FormHelperText>
      </FormControl>
    </div>
  );
};

export default SelectDomain;
