import React, { FunctionComponent } from "react";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tooltip,
} from "@mui/material";
import InfoIcon from "../UI/iconsComponents/icons/infoIcon";
import textFieldStyles from "../../styles/components/textField.module.css";
import TextField from "../UI/textField";

type UsFormProps = {
  isUsResident: boolean;
  onUsResidentChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: string
  ) => void;
  usPostalCode: string;
  onUsPostalCodeChange: (value: string) => void;
};

const UsForm: FunctionComponent<UsFormProps> = ({
  isUsResident,
  onUsResidentChange,
  usPostalCode = "",
  onUsPostalCodeChange,
}) => {
  return (
    <FormControl className="flex gap-4 w-full">
      <div className="flex flex-col">
        <div className="flex gap-1 my-1">
          <Tooltip
            className="cursor-pointer"
            title="If you live in the US, we need your ZIP code due to the USA tax policy."
            placement="top"
          >
            <div>
              <InfoIcon width="16px" color={"#454545"} />
            </div>
          </Tooltip>
          <p className={textFieldStyles.legend}>Do you live in the USA ?*</p>
        </div>

        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          className="flex flex-row gap-4"
          value={isUsResident}
          onChange={onUsResidentChange}
        >
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
        </RadioGroup>
      </div>
      {isUsResident ? (
        <TextField
          label="The state code that you live in"
          value={usPostalCode}
          onChange={(e) => onUsPostalCodeChange(e.target.value)}
          color="secondary"
          placeholder="CA for California, NY for New York, etc."
          required
        />
      ) : null}
    </FormControl>
  );
};

export default UsForm;
