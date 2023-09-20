import { ListItemText, MenuItem, Select } from "@mui/material";
import React, { FunctionComponent } from "react";
import textFieldStyles from "../../styles/components/textField.module.css";
import allUsStates from "../../public/usa/allUsStates.json";

type SelectStateProps = {
  usState: string;
  changeUsState: (value: string) => void;
};

const SelectState: FunctionComponent<SelectStateProps> = ({
  usState,
  changeUsState,
}) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex my-1">
        <p className={textFieldStyles.legend}>Select your state*</p>
      </div>
      <Select
        fullWidth
        value={usState}
        defaultValue={"DE"}
        onChange={(e) => changeUsState(e.target.value)}
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
        <MenuItem value="DE">
          <ListItemText primary="Delaware" />
        </MenuItem>
        {allUsStates.map((state: UsState, index: number) => (
          <MenuItem key={index} value={state.abbreviation}>
            <ListItemText primary={state.name} />
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default SelectState;
