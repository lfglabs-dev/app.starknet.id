import type { FunctionComponent } from "react";
import { Checkbox } from "@mui/material";
import CustomCheckmarkIcon from "@/components/UI/iconsComponents/icons/customCheckMark";
import styles from "@/styles/components/variants.module.css";

type TermCheckboxProps = {
  checked: boolean;
  onChange: () => void;
  variant?: "default" | "white";
};

const TermCheckbox: FunctionComponent<TermCheckboxProps> = ({
  checked,
  onChange,
  variant,
}) => (
  <div className="flex items-center justify-left text-xs mr-2">
    <Checkbox
      checked={checked}
      className={variant === "white" ? styles.whiteCheckbox : styles.defaultCheckbox}
      onClick={onChange}
      checkedIcon={<CustomCheckmarkIcon />}
    />
    <p className="ml-2 text-left">
      <span className="cursor-pointer" onClick={onChange}>Accept</span>{" "}
      <a className="underline" href="https://www.starknet.id/pdfs/Terms.pdf" target="_blank" rel="noreferrer">terms</a>{" "}
      &amp;{" "}
      <a className="underline" href="https://starknet.id/pdfs/PrivacyPolicy.pdf" target="_blank" rel="noreferrer">policies</a>
    </p>
  </div>
);

export default TermCheckbox;
