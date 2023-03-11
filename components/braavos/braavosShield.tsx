import React, { FunctionComponent } from "react";
import styles from "../../styles/braavos.module.css";
import Button from "../UI/button";

type BraavosShieldProps = {
  imgSrc: string;
  desc: string;
  condition: string;
  mint: () => void;
};

const BraavosShield: FunctionComponent<BraavosShieldProps> = ({
  imgSrc,
  desc,
  condition,
  mint,
}) => {
  return (
    <>
      <h1 className="title">Get your Braavos shield !</h1>
      <div className={styles.sbtContainer}>
        <div className={styles.sbtImageContainer}>
          <img className={styles.sbtImage} src={imgSrc} />
          <h5 className="text-center text-lg font-quickZap">{desc}</h5>
          <p className="text-center text-sm">{condition}</p>
        </div>
      </div>
      <Button onClick={mint}>GET MY SHIELD</Button>
    </>
  );
};

export default BraavosShield;
