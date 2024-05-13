import styles from "../../../styles/components/upsellCard.module.css";
import React, { FunctionComponent } from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import textFieldStyles from "../../../styles/components/textField.module.css";

type UpsellCardProps = {
  upsellData: Upsell;
  enabled: boolean;
  onUpsellChoice: (isUpselled: boolean) => void;
  invalidBalance: boolean;
};

const UpsellCard: FunctionComponent<UpsellCardProps> = ({
  upsellData,
  enabled,
  onUpsellChoice,
  invalidBalance,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className="flex flex-col items-start gap-1 self-stretch">
          <p className={styles.title}>{upsellData.title.desc}</p>
          <h3 className={styles.catch}>{upsellData.title.catch}</h3>
          <p className={styles.desc}>{upsellData.desc}</p>
        </div>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={enabled}
          onChange={() => onUpsellChoice(!enabled)}
          className={styles.radioGroupContainer}
        >
          <div className={styles.radioGroup}>
            <FormControlLabel
              value={!invalidBalance}
              control={<Radio />}
              label={
                <p className={textFieldStyles.legend}>Yes, count me in!</p>
              }
            />
            <FormControlLabel
              value={invalidBalance}
              control={<Radio />}
              label={<p className={textFieldStyles.legend}>No, thanks!</p>}
            />
          </div>
        </RadioGroup>
      </div>
      <img className={styles.image} src={upsellData.imageUrl} />
    </div>
  );
};

export default UpsellCard;
