import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import homeStyles from "../../styles/Home.module.css";
import Timer from "../UI/timer";
import Button from "../UI/button";
import { CDNImg } from "../cdn/image";

type DiscountRenewalScreenProps = {
  title: { desc: string; catch: string };
  desc: string;
  image: string;
  expiry: number;
  setScreen: (screen: number) => void;
};

const DiscountRenewalScreen: FunctionComponent<DiscountRenewalScreenProps> = ({
  title,
  desc,
  image,
  expiry,
  setScreen,
}) => {
  return (
    <div className={homeStyles.wrapperScreen}>
      <div className={styles.container}>
        <div className={styles.illustrationContainer}>
          <CDNImg src={image} className={styles.illustration} />
          <Timer expiry={expiry} fixed />
        </div>
        <div className="max-w-xl flex flex-col items-start justify-start gap-5 mx-5 mb-5">
          <div className="flex flex-col lg:items-start items-center text-center sm:text-start gap-3">
            <h1 className={styles.title}>
              {title.desc}
              <br />
              <span className="text-primary">{title.catch}</span>
            </h1>
            <p className={styles.description}>{desc}</p>
          </div>
          <Button onClick={() => setScreen(2)}>Renew for free now</Button>
        </div>
      </div>
    </div>
  );
};

export default DiscountRenewalScreen;
