import React, { useState } from "react";
import styles from "../styles/affiliate.module.css";
import Image from "next/image";
import AffiliateImage from "../public/visuals/affiliate.webp";
import Button from "../components/UI/button";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";
import { NextPage } from "next";
import { useMediaQuery } from "@mui/material";
import Wallets from "../components/UI/wallets";
import { useAccount } from "@starknet-react/core";
import "@rainbow-me/rainbowkit/styles.css";

const Ens: NextPage = () => {
  const isMobile = useMediaQuery("(min-width: 768px)");
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const { address } = useAccount();

  function onButtonClick() {
    if (!address) {
      setWalletModalOpen(true);
    } else {
      // Connect Ethereum wallet here
      setWalletModalOpen(false);
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          <div className={styles.banner}>
            {isMobile ? (
              <Image
                src={AffiliateImage}
                alt="hey"
                priority
                className={styles.image}
              />
            ) : null}
            <div className={styles.banner_content}>
              <div>
                <span className="title mr-2">Get your .eth domain on </span>
                <span className="title" style={{ color: "#19AA6E" }}>
                  Starknet
                </span>
              </div>
              <p className="text-left">
                Get your .eth domain on starknet. Connect, verify, and elevate
                your digital identity with cross-chain domains !
              </p>
              <Button onClick={onButtonClick}>
                <div className="flex flex-row gap-4 justify-center items-center">
                  <StarknetIcon width="28" color="" />
                  <p>Connect your Starknet wallet</p>
                </div>
              </Button>
              <Wallets
                closeWallet={() => setWalletModalOpen(false)}
                hasWallet={walletModalOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ens;
