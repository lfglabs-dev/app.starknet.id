import styles from "../../../styles/components/upsellCard.module.css";
import React, { FunctionComponent, useEffect } from "react";
import { Divider, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import textFieldStyles from "../../../styles/components/textField.module.css";
type UpsellCardProps = {
  upsellData: Upsell;
  enabled: boolean;
  onUpsellChoice: (isUpselled: boolean) => void;
  invalidBalance: boolean;
  hasUserSelectedOffer: boolean;
  setHasUserSelectedOffer: (hasUserSelectedOffer: boolean) => void;
  loadingPrice: boolean;
};

const UpsellCard: FunctionComponent<UpsellCardProps> = ({
  upsellData,
  enabled,
  onUpsellChoice,
  invalidBalance,
  hasUserSelectedOffer,
  setHasUserSelectedOffer,
  loadingPrice,
}) => {
  useEffect(() => {
    if (hasUserSelectedOffer || loadingPrice) return;
    if (enabled && invalidBalance) {
      onUpsellChoice(false);
      setHasUserSelectedOffer(true);
    }
    if (!enabled && !invalidBalance) onUpsellChoice(true);
  }, [
    hasUserSelectedOffer,
    invalidBalance,
    enabled,
    setHasUserSelectedOffer,
    loadingPrice,
    onUpsellChoice,
  ]);

  const handleUpsellChoice = () => {
    onUpsellChoice(!enabled);
    setHasUserSelectedOffer(true);
  };

  return (
    <div className={styles.card}>
      <div className="flex flex-col items-start gap-1 self-stretch">
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
              <p className={textFieldStyles.legend}>Yes, count on me!</p>
            }
          />
          <FormControlLabel
            control={<Radio />}
            value={false}
            label={<p className={textFieldStyles.legend}>No, thanks</p>}
          />
        </div>
      </RadioGroup>
      <Divider className={styles.divider} />
    </div>
  );
};

export default UpsellCard;
