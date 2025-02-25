import React from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";
import PtpLeftCol from "../components/pfpcollections/ptpLeftCol";

const PFPCollections: NextPage = () => {
  return (
    <div className={styles.container}>
      <PtpLeftCol />
    </div>
  );
};

export default PFPCollections;
