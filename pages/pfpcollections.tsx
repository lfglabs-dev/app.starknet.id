import React from "react";
import type { NextPage } from "next";
import PtpLeftCol from "../components/pfpcollections/ptpLeftCol";

import homeStyles from "../styles/Home.module.css";
const PFPCollections: NextPage = () => {
  return (
    <div className={homeStyles.screen}>
      <PtpLeftCol />
    </div>
  );
};

export default PFPCollections;
