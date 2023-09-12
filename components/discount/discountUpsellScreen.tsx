import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import homeStyles from "../../styles/Home.module.css";
import theme from "../../styles/theme";
import Button from "../UI/button";
import ArrowLeftIcon from "../UI/iconsComponents/icons/arrows/arrowLeftIcon";

type DiscountUpsellScreenProps = {
  onUpsellChoice: (isUpselled: boolean) => void;
  goBack: () => void;
  title: { desc: string; catch: string };
  desc: string;
  image: string;
  expiry: number;
};

const DiscountUpsellScreen: FunctionComponent<DiscountUpsellScreenProps> = ({
  onUpsellChoice,
  goBack,
  title,
  desc,
  image,
}) => {
  return (
    <div className={homeStyles.wrapperScreen}>
      <div className={styles.container}>
        <div className="max-w-xl flex flex-col items-start justify-start gap-5 mx-5 mb-5">
          <div className={styles.backArrow} onClick={() => goBack()}>
            <ArrowLeftIcon width="24px" color={theme.palette.secondary.main} />
            <p className="ml-2">Back</p>
          </div>
          <div className="flex flex-col lg:items-start items-center text-center sm:text-start gap-3">
            <h1 className={styles.title}>
              {title.desc}
              <br />
              <span className="text-primary">{title.catch}</span>
            </h1>
            <p className={styles.description}>{desc}</p>
          </div>
        </div>

        <div className={styles.illustrationContainer}>
          <img src={image} className={styles.upsellIllustration} />
        </div>
      </div>

      <div className={styles.upsellButtons}>
        <div className="max-w-lg">
          <Button onClick={() => onUpsellChoice(true)}>
            Yes I profit from this opportunity
          </Button>
        </div>
        <p onClick={() => onUpsellChoice(false)}>
          No, thanks I just want a 1$ domain
        </p>
      </div>
    </div>
  );
};

export default DiscountUpsellScreen;
