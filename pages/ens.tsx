"use client";
import React, { useCallback, useEffect, useState } from "react";
import styles from "../styles/affiliate.module.css";
import Image from "next/image";
import AffiliateImage from "../public/visuals/affiliate.webp";
import Button from "../components/UI/button";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";
import EthConnectButton from "../components/affiliate/EthConnectButton";
import Wallets from "../components/UI/wallets";
import { Connector, useAccount, useConnect } from "@starknet-react/core";
import { constants } from "starknet";
import { useDisplayName } from "../hooks/displayName.tsx";
import { useMediaQuery } from "@mui/material";
import ProgressBar from "../components/UI/progressBar";
import EthLogo from "../public/visuals/ethLogo.svg";

export default function Affiliate() {
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const { address: StarknetAddress, account: StarknetAccount } = useAccount();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const { connect, connectors } = useConnect();
  const isMobile = useMediaQuery("(max-width:425px)");
  const domainOrAddress = useDisplayName(StarknetAddress ?? "", isMobile);
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [total, setTotal] = useState(3);
  const [selectDomain, setSelectDomain] = useState([]);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "testnet" : "mainnet";

  const checkAndUpdateStepNumber = () => {
    if (StarknetAddress) {
      setCurrentMilestone(1);
    }
    // eslint-disable-next-line no-constant-condition
    else if (2 === 2) {
      setCurrentMilestone(1);
    } else if (selectDomain.length > 0) {
      setCurrentMilestone(1);
    }
  };

  useEffect(() => {
    checkAndUpdateStepNumber();
  }, []);

  useEffect(() => {
    if (!isConnected || !StarknetAccount) return;
    StarknetAccount.getChainId().then((chainId) => {
      const isWrongNetwork =
        (chainId === constants.StarknetChainId.SN_GOERLI &&
          network === "mainnet") ||
        (chainId === constants.StarknetChainId.SN_MAIN &&
          network === "testnet");
      setIsWrongNetwork(isWrongNetwork);
    });
  }, [StarknetAccount, network, isConnected]);

  const tryConnect = useCallback(
    async (connector: Connector) => {
      if (StarknetAddress) return;
      if (await connector.ready()) {
        connect({ connector });

        return;
      }
    },
    [StarknetAddress, connectors]
  );

  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          <div className={styles.banner}>
            {currentMilestone + 1 === 1 ? (
              <>
                <Image
                  src={AffiliateImage}
                  alt="hey"
                  priority
                  className={styles.image}
                />
                <div className={styles.banner_content}>
                  <div>
                    <span className="title mr-2">Get your .eth domain on </span>
                    <span className="title" style={{ color: "#19AA6E" }}>
                      Starknet
                    </span>
                  </div>
                  <p className="text-left">
                    Get your .eth domain on starknet. Connect, verify, and
                    elevate your digital identity with cross-chain domains !
                  </p>
                  <div className={styles.button_container}>
                    {StarknetAddress ? (
                      <div className={styles.connectEthLayout}>
                        <p className="title" style={{ fontSize: 24 }}>
                          {domainOrAddress.toLocaleUpperCase()} is CONNECTED
                        </p>
                        <EthConnectButton
                          title={
                            <div className={styles.button_text}>
                              <Image
                                src={EthLogo}
                                alt="Ethereum Logo"
                                width="15"
                                height={24}
                                color=""
                              />
                              <p>Connect your ethereum wallet</p>
                            </div>
                          }
                          onClick={() => console.log("hey")}
                        />
                      </div>
                    ) : (
                      <Button onClick={() => setWalletModalOpen(true)}>
                        <div className="flex flex-row gap-4 justify-center items-center">
                          <StarknetIcon width="28" color="" />
                          <p>Connect your Starknet wallet</p>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : currentMilestone + 1 === 2 ? (
              <>
                <Image
                  src={AffiliateImage}
                  alt="hey"
                  priority
                  className={styles.image}
                />
                <div className={styles.banner_content}>
                  <div>
                    <span className="title mr-2">Get your .eth domain on </span>
                    <span className="title" style={{ color: "#19AA6E" }}>
                      Starknet
                    </span>
                  </div>
                  <p className="text-left">
                    Get your .eth domain on starknet. Connect, verify, and
                    elevate your digital identity with cross-chain domains !
                  </p>
                  <div className={styles.button_container}>
                    <Button onClick={() => setWalletModalOpen(true)}>
                      <div className="flex flex-row gap-4 justify-center items-center">
                        <StarknetIcon width="28" color="" />
                        <p>Connect your Starknet wallet</p>
                      </div>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.chain_container}>
                <div
                  className={styles.each_chain_container}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRight: "2px solid #EAE0D5",
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                  }}
                >
                  <div className={styles.each_chain_content}>
                    <h1 className="title">Ethereum</h1>
                    <div className={styles.domain_list}>
                      {Array.from(Array(10).keys()).map((_, index) => {
                        return (
                          <div key={index} className={styles.domain_box}>
                            <p> Domain Name</p>
                            <div style={{ width: "80%" }}>
                              <Button onClick={() => console.log("hey")}>
                                Redeem
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div
                  className={styles.each_chain_container}
                  style={{
                    backgroundColor: "#FFFCF8",
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                  }}
                >
                  <div className={styles.each_chain_content}>
                    <h1 className="title">Starknet</h1>
                    <div className={styles.domain_list}>
                      {Array.from(Array(10).keys()).map((_, index) => {
                        return (
                          <div key={index} className={styles.domain_box}>
                            <p> Domain Name</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.progress_bar_container}>
          <ProgressBar done={currentMilestone} total={total} />
        </div>
      </div>
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
}
