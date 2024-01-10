import React from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";
import PfpNftCard from "../components/pfpcollections/pfpNftCard";
import { ourNfts, NftCollections } from "../utils/constants";

const PFPCollections: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.gallery}>
        <section>
          <p className={styles.subtitle}>Starknet ID Ecosystem</p>
          <h2 className={styles.title}>PFP collections</h2>
          <div className={styles.nfts}>
            {ourNfts.map((collection, index) => (
              <PfpNftCard
                key={index}
                image={collection.imageUri}
                name={collection.name}
                onClick={() => window.open(collection.infoPage)}
              />
            ))}
          </div>
        </section>
        <section>
          <p className={styles.subtitle}>Overall Starknet Ecosystem</p>
          <h2 className={styles.title}>Our suggestions</h2>
          <div className={styles.nfts}>
            {NftCollections.map((collection, index) => (
              <PfpNftCard
                key={index}
                image={collection.imageUri}
                name={collection.name}
                onClick={() => window.open(collection.externalLink)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PFPCollections;
