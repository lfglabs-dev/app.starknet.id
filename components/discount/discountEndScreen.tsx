import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";

type DiscountEndScreenProps = {
  image: string;
  title: string;
};

const DiscountEndScreen: FunctionComponent<DiscountEndScreenProps> = ({
  image,
  title,
}) => {
  return (
    <div className={styles.container}>
      <img src={image} className={styles.illustration} />
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
};

export default DiscountEndScreen;
