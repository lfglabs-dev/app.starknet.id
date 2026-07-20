import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  useMediaQuery,
} from "@mui/material";
import type { FunctionComponent } from "react";
import { IdentityAvatar } from "@/components/IdentityAvatar";
import type { OwnedIdentity } from "@/lib/core/types";
import textFieldStyles from "@/styles/components/textField.module.css";
import InputHelper from "@/components/UI/inputHelper";

type SelectIdentityProps = {
  identities: OwnedIdentity[];
  value: string;
  onChange: (value: string) => void;
};

const SelectIdentity: FunctionComponent<SelectIdentityProps> = ({
  identities,
  value,
  onChange,
}) => {
  const matches = useMediaQuery("(max-width: 1084px)");
  const defaultText = matches ? "Mint a new one" : "Mint a new starknet id";

  return (
    <div className="flex flex-col w-full">
      <div className="grid place-content-center my-2 md:justify-start lg:justify-start">
        <p className={textFieldStyles.legend}>
          Select an identity to link with your domain*
        </p>
      </div>
      <InputHelper>
        <Select
          fullWidth
          value={value}
          IconComponent={() => null}
          defaultValue={identities[0]?.tokenId ?? "new"}
          inputProps={{ MenuProps: { disableScrollLock: true } }}
          onChange={(event) => onChange(String(event.target.value))}
          style={{ borderRadius: "8px" }}
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
          <MenuItem value="new">
            <div className="flex gap-2">
              <ListItemIcon>
                <img width="30" src="/visuals/StarknetIdLogo.svg" alt="starknet.id avatar" />
              </ListItemIcon>
              <ListItemText primary={defaultText} />
            </div>
          </MenuItem>
          {identities.map((identity) => (
            <MenuItem key={identity.tokenId} value={identity.tokenId}>
              <ListItemIcon>
                <IdentityAvatar tokenId={identity.tokenId} size={25} />
              </ListItemIcon>
              <ListItemText primary={identity.tokenId} />
            </MenuItem>
          ))}
        </Select>
      </InputHelper>
    </div>
  );
};

export default SelectIdentity;
