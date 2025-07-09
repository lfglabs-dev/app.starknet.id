import React from "react";
import styles from "../styles/solana.module.css";
import { NextPage } from "next";
import DiscountEndScreen from "../components/discount/discountEndScreen";

const Solana: NextPage = () => {
  return (
    <div className={styles.screen}>
      <DiscountEndScreen
        title=".sol domains campaign has ended"
        image="/freeRenewal/freeRenewal.webp"
      />
    </div>
  );
};

export default Solana;
