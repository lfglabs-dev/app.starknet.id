import React, { useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";
import PfpNftCard from "../components/pfpcollections/pfpNftCard";
import { ourNfts, NftCollections } from "../utils/constants";
import Step from "@/components/domains/steps/step";

const PFPCollections: NextPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className="w-full flex flex-col xl:flex-row justify-center h-full gap-4 px-3 py-4 lg:px-32 md:px-16 sm:py-12 xl:h-[88vh] mt-[12vh] xl:mt-[calc(12vh + 1rem)]">
      <aside className={styles.purchaseStepNav} role="navigation">
        <div>
          <Step
            stepIndex={0}
            currentStep={tab}
            setStep={setTab}
            icon={
              <img
                src={
                  tab === 0
                    ? "/icons/ecosystem-active.svg"
                    : "/icons/ecosystem-inactive.svg"
                }
                alt="Starknet ID Ecosystem"
              />
            }
            label="Starknet ID Ecosystem"
            showDoneIcon={false}
            allowSwitchAnytime={true}
          />
          <Step
            stepIndex={1}
            currentStep={tab}
            setStep={setTab}
            icon={
              <img
                src={
                  tab === 1
                    ? "/icons/starknet-active.svg"
                    : "/icons/starknet-inactive.svg"
                }
                alt="Overall Starknet Ecosystem"
              />
            }
            label="Overall Starknet Ecosystem"
            showDoneIcon={false}
            allowSwitchAnytime={true}
          />
        </div>

        <img
          src="/visuals/purchaseStepVisual.svg"
          alt="Domain purchase steps visualization"
        />
      </aside>

      <div className={styles.purchaseStepNavMobile} role="navigation">
        <Step
          stepIndex={0}
          currentStep={tab}
          setStep={setTab}
          icon={
            <img
              src={
                tab === 0
                  ? "/icons/ecosystem-active.svg"
                  : "/icons/ecosystem-inactive.svg"
              }
              alt="Starknet ID Ecosystem"
            />
          }
          label="Starknet ID Ecosystem"
          showDoneIcon={false}
          allowSwitchAnytime={true}
        />
        <Step
          stepIndex={1}
          currentStep={tab}
          setStep={setTab}
          icon={
            <img
              src={
                tab === 1
                  ? "/icons/starknet-active.svg"
                  : "/icons/starknet-inactive.svg"
              }
              alt="Overall Starknet Ecosystem"
            />
          }
          label="Overall Starknet Ecosystem"
          showDoneIcon={false}
          allowSwitchAnytime={true}
        />

        <div className="flex justify-center">
          <img
            src="/visuals/purchaseStepVisualMobile.svg"
            alt="Domain purchase steps visualization"
          />
        </div>
      </div>

      <div className="flex-1">
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
  );
};

export default PFPCollections;
