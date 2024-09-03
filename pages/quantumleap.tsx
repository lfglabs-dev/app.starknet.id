import React from "react";
import type { NextPage } from "next";
import homeStyles from "../styles/Home.module.css";
import DiscountEndScreen from "../components/discount/discountEndScreen";

const QuantumLeap: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <DiscountEndScreen
        title={`Quantum leap discount has ended`}
        image="/quantumleap/quantumLeapAstro2.webp"
      />
    </div>
  );
};

export default QuantumLeap;
