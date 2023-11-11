import React from "react";
import styles from "../styles/affiliate.module.css";
import Image from "next/image";
import AffiliateImage from "../public/visuals/affiliate.webp";
import Button from "../components/UI/button";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";

export default function Affiliate() {
  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          <div className={styles.banner}>
            <Image
              src={AffiliateImage}
              alt="hey"
              priority
              className={styles.image}
            />
            <div className={styles.banner_content}>
              <div>
                <span className="title mr-2">
                  Integrate Your Starknet Domain with
                </span>
                <span className="title" style={{ color: "#19AA6E" }}>
                  Ethereum
                </span>
              </div>
              <p className="text-left">
                Link your Starknet domain with Solana seamlessly. Connect,
                verify, and elevate your digital identity with cross-chain
                subdomain distribution!
              </p>
              <Button onClick={() => console.log("hey")}>
                <div className="flex flex-row gap-4 justify-center items-center">
                  <StarknetIcon width="28" color="" />
                  <p>Connect your Starknet wallet</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
