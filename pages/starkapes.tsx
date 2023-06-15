import React from "react";
import type { NextPage } from "next";
import styles from "../styles/starkApes.module.css";
import Button from "../components/UI/button";
import { useRouter } from "next/router";

const StarkApes: NextPage = () => {
  const router = useRouter();
  return (
    <main className={styles.main}>
      <div className={styles.imageSectionV2}>
        <img src={"/starkApes/starkApes.webp"} alt="Stark Ape Example" />
      </div>
      <div className={styles.textSection}>
        <h1 className={styles.title}>Get your Stark Ape</h1>
        <div className="mt-2">
          <p>
            The Stark Ape Club is a collection of 10,000 unique Stark Ape NFTs—
            unique digital collectibles living on the Starknet Rollup. And you
            heard the news ? Thi collection is completely FREE for the stark
            domain long term holders, buy or renew a domain for 5 years and get
            your ape for free !
          </p>
          <h2 className={styles.subtitle}>3 323/10 000</h2>

          <div className="mt-5">
            <Button onClick={() => router.push("/")}>
              Get My Early Tribers Ape
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default StarkApes;
