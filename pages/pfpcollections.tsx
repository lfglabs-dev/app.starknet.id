import React from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";

const PFPCollections: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        <p className={styles.subtitle}>Our NFT’s</p>
        <h2 className={styles.title}>PFP collections</h2>

        <p className={styles.subtitle}>Explore our selection</p>
        <h2 className={styles.title}>Our suggestions</h2>
      </div>
    </div>
  );
};

export default PFPCollections;
