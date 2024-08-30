import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import DiscountEndScreen from "../components/discount/discountEndScreen";

const Argent: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <DiscountEndScreen
        title="Argent discount has ended"
        image="/argent/argentdiscount.webp"
      />
    </div>
  );
};

export default Argent;
