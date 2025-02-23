import React, { useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";
import PfpNftCard from "../components/pfpcollections/pfpNftCard";
import { ourNfts, NftCollections } from "../utils/constants";

const PFPCollections: NextPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className={styles.container}>
      <div className="grid w-full grid-cols-1 md:grid-cols-[minmax(100px,1fr)_5fr] gap-4">
        <div className={styles.gallery}>
          <div className="flex flex-col items-center md:items-start gap-[24px] lg:gap-4">
            <div className="flex gap-2 lg:hidden">
              <img src="/icons/avatar.svg" />
              <span className={`font-bold text-[14px] text-gray-400`}>
                Your NFTs
              </span>
            </div>
            <div
              className="flex gap-2 cursor-pointer"
              onClick={() => setTab(0)}
            >
              <img
                src={`${
                  tab === 0
                    ? "/icons/ecosystem-active.svg"
                    : "/icons/ecosystem-inactive.svg"
                }`}
              />
              <span
                className={`font-bold text-[14px] ${
                  tab === 0 ? "" : "text-gray-400"
                }`}
              >
                Starknet ID Ecosystem
              </span>
            </div>
            <div
              className="flex gap-2 cursor-pointer"
              onClick={() => setTab(1)}
            >
              <img
                src={`${
                  tab === 1
                    ? "/icons/starknet-active.svg"
                    : "/icons/starknet-inactive.svg"
                }`}
              />
              <span
                className={`font-bold text-[14px] ${
                  tab === 1 ? "" : "text-gray-400"
                }`}
              >
                Overall Starknet Ecosystem
              </span>
            </div>
          </div>
        </div>
          <div className="mt-5 lg:mt-12 lg:mx-10 mb-16">
            {tab === 0 ? (
              <section>
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
            ) : (
              <section>
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
            )}
          </div>
        </div>
    </div>
  );
};

export default PFPCollections;
