import styles from "../../../styles/components/upsellCard.module.css";
import React, { FunctionComponent, useEffect, useState } from "react";
import { FormControlLabel, Radio, RadioGroup } from "@mui/material";
import textFieldStyles from "../../../styles/components/textField.module.css";
import { CurrencyType } from "@/utils/constants";

type UpsellCardProps = {
  upsellData: Upsell;
  enabled: boolean;
  onUpsellChoice: (isUpselled: boolean) => void;
  invalidBalance: boolean;
  displayedCurrency: CurrencyType;
};

const UpsellCard: FunctionComponent<UpsellCardProps> = ({
  upsellData,
  enabled,
  onUpsellChoice,
  invalidBalance,
  displayedCurrency,
}) => {
  const [isUserChoice, setIsUserChoice] = useState<boolean>(false);

  useEffect(() => {
    setIsUserChoice(false);
  }, [displayedCurrency]);

  useEffect(() => {
    if (isUserChoice) return;
    if (enabled && invalidBalance) onUpsellChoice(false);
    if (!enabled && !invalidBalance) onUpsellChoice(true);
  }, [isUserChoice, invalidBalance]);

  const handleUpsellChoice = () => {
    onUpsellChoice(!enabled);
    setIsUserChoice(true);
  };

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
          onChange={handleUpsellChoice}
          className={styles.radioGroupContainer}
        >
          <div className={styles.radioGroup}>
            <FormControlLabel
              control={<Radio />}
              value={true}
              label={
                <p className={textFieldStyles.legend}>Yes, count me in!</p>
              }
            />
            <FormControlLabel
              control={<Radio />}
              value={false}
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
