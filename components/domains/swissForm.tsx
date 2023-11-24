import React, { FunctionComponent } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import textFieldStyles from "../../styles/components/textField.module.css";
import variantStyles from "../../styles/components/variants.module.css";
import InputHelper from "../UI/inputHelper";

type SwissFormProps = {
  isSwissResident: boolean;
  onSwissResidentChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => void;
  variant?: "default" | "white";
};

const SwissForm: FunctionComponent<SwissFormProps> = ({
  isSwissResident,
  onSwissResidentChange,
  variant = "default",
}) => {
  return (
    <FormControl className="flex gap-4 w-full">
      <div className="flex flex-col">
        <div className="flex gap-1 my-1">
          <p className={textFieldStyles.legend}>
            Do you live in Switzerland ?*
          </p>
        </div>
        <div
          className={
            variant === "white"
              ? variantStyles.whiteSwissForm
              : variantStyles.defaultSwissForm
          }
        >
          <InputHelper helperText="If you live in the Switzerland, we collect VAT due to Swiss tax policy.">
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              value={isSwissResident}
              onChange={onSwissResidentChange}
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
    </FormControl>
  );
};

export default SwissForm;
