import React, { FunctionComponent } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import textFieldStyles from "../../styles/components/textField.module.css";
import variantStyles from "../../styles/components/variants.module.css";
import SelectState from "./selectState";
import InputHelper from "../UI/inputHelper";

type UsFormProps = {
  isUsResident: boolean;
  onUsResidentChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => void;
  usState: string;
  changeUsState: (value: string) => void;
  variant?: "default" | "white";
};

const UsForm: FunctionComponent<UsFormProps> = ({
  isUsResident,
  onUsResidentChange,
  usState,
  changeUsState,
  variant = "default",
}) => {
  return (
    <FormControl className="flex gap-4 w-full">
      <div className="flex flex-col">
        <div className="flex gap-1 my-1">
          <p className={textFieldStyles.legend}>Do you live in the USA ?*</p>
        </div>
        <div
          className={
            variant === "white"
              ? variantStyles.whiteUsForm
              : variantStyles.defaultUsForm
          }
        >
          <InputHelper helperText="If you live in the US, we need your ZIP code due to the USA tax policy.">
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={isUsResident}
              onChange={onUsResidentChange}
            >
              <div className="flex flex-row gap-4">
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label={<p className={textFieldStyles.legend}>Yes</p>}
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label={<p className={textFieldStyles.legend}>No</p>}
                />
              </div>
            </RadioGroup>
          </InputHelper>
        </div>
      </div>
      {isUsResident ? (
        <SelectState usState={usState} changeUsState={changeUsState} />
      ) : null}
    </FormControl>
  );
};

export default UsForm;
