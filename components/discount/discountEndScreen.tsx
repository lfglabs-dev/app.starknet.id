import React, { FunctionComponent } from "react";
import styles from "../../styles/discount.module.css";
import homeStyles from "../../styles/Home.module.css";
import { CDNImg } from "../cdn/image";

type DiscountEndScreenProps = {
  image: string;
  title: string;
};

const DiscountEndScreen: FunctionComponent<DiscountEndScreenProps> = ({
  image,
  title,
}) => {
  return (
    <div className={homeStyles.wrapperScreen}>
      <div className="flex flex-col justify-center items-center">
        <CDNImg src={image} width={350} />
        <h1 className={`${styles.title} mt-5`}>{title}</h1>
      </div>
    </div>
  );
};

export default DiscountEndScreen;
