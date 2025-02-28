import React, { useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/pfpcollections.module.css";
import PfpNftCard from "../components/pfpcollections/pfpNftCard";
import { ourNfts, NftCollections } from "../utils/constants";
import Step from "@/components/domains/steps/step";

// Define tab configuration
const TABS = [
  {
    index: 0,
    label: "Starknet ID Ecosystem",
    iconPrefix: "ecosystem",
    collections: ourNfts,
    onCardClick: (collection: any) => window.open(collection.infoPage),
  },
  {
    index: 1,
    label: "Overall Starknet Ecosystem",
    iconPrefix: "starknet",
    collections: NftCollections,
    onCardClick: (collection: any) => window.open(collection.externalLink),
  },
];

const PFPCollections: NextPage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  // Render step component with proper icon based on active state
  const renderStep = (tabConfig: typeof TABS[0]) => (
    <Step
      stepIndex={tabConfig.index}
      currentStep={currentTab}
      setStep={setCurrentTab}
      icon={
        <img
          src={
            currentTab === tabConfig.index
              ? `/icons/${tabConfig.iconPrefix}-active.svg`
              : `/icons/${tabConfig.iconPrefix}-inactive.svg`
          }
          alt={tabConfig.label}
        />
      }
      label={tabConfig.label}
      showDoneIcon={false}
      allowSwitchAnytime={true}
    />
  );

  // Render NFT collection cards
  const renderCollectionCards = () => {
    const activeTab = TABS[currentTab];
    return (
      <div className={'mx-auto flex flex-wrap gap-2 justify-center'}>
        {activeTab.collections.map((collection, index) => (
          <PfpNftCard
            key={index}
            image={collection.imageUri}
            name={collection.name}
            onClick={() => activeTab.onCardClick(collection)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col md:flex-row justify-center gap-4 px-3 py-4 lg:px-32 md:px-16 sm:py-12 h-[88vh] mt-[12vh] xl:mt-[calc(12vh + 1rem)]">
      {/* Desktop Navigation */}
      <aside className={styles.purchaseStepNav} role="navigation">
        <div>
          {TABS.map((tab) => renderStep(tab))}
        </div>
        <img
          src="/visuals/purchaseStepVisual.svg"
          alt="Domain purchase steps visualization"
        />
      </aside>

      {/* Mobile Navigation */}
      <div className={styles.purchaseStepNavMobile} role="navigation">
        {TABS.map((tab) => renderStep(tab))}
        <div className="flex justify-center">
          <img
            src="/visuals/purchaseStepVisualMobile.svg"
            alt="Domain purchase steps visualization"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 ">
        <section className=" max-w-[680px] mx-auto flex justify-center">
          {renderCollectionCards()}
        </section>
      </div>
    </div>
  );
};

export default PFPCollections;