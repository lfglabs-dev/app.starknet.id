import React, { useEffect, useState } from "react";
import styles from "../styles/solana.module.css";
import Image from "next/image";
import AffiliateImage from "../public/visuals/affiliate.webp";
import Button from "../components/UI/button";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";
import Wallets from "../components/UI/wallets";
import { useAccount } from "@starknet-react/core";
import ProgressBar from "../components/UI/progressBar";
// import EthLogo from "../public/visuals/ethLogo.svg";
import { NextPage } from "next";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

//todo: remove from visual ethLogo.svg
// todo: remove Solana button component

const Solana: NextPage = () => {
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const { address: starknetAddress } = useAccount();
  const { publicKey: solPublicKey } = useWallet();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [snsDomains, setSnsDomain] = useState([]);
  const [selectDomain, setSelectDomain] = useState([]);

  useEffect(() => {
    if (!starknetAddress) setCurrentStep(0);
    else if (starknetAddress && !solPublicKey) setCurrentStep(1);
    else if (starknetAddress && solPublicKey) setCurrentStep(2);
  }, [starknetAddress, solPublicKey]);

  console.log("publicKey", solPublicKey);
  console.log("starknetAddress", starknetAddress);

  // fetch sol domains from SNS api
  useEffect(() => {
    if (!solPublicKey) return;
    fetch(`https://sns-api.bonfida.com/owners/${solPublicKey}/domains`)
      .then((response) => response.json())
      .then((res) => {
        console.log("Success:", res);
        if (res?.success) setSnsDomain(res?.result);
        else setSnsDomain([]);
      })
      .catch((error) => {
        console.log("An error occured", error);
        setSnsDomain([]);
      });
  }, [solPublicKey]);

  const generateSignature = async () => {};

  // useEffect(() => {
  //   if (!ethAddress) return;

  //   const getDomains = async () => {
  //     await provider.lookupAddress(
  //       "0x5555763613a12D8F3e73be831DFf8598089d3dCa"
  //     );
  //   };
  // }, [ethAddress]);

  // All properties on a domain are optional
  // const domain = {
  //   name: "Eth Stark Resolver",
  //   version: "1",
  //   chainId: 5,
  // } as const;

  // const types = {
  //   "Claim my .eth.stark domain": [
  //     { name: "domain", type: "string" },
  //     { name: "starknet address", type: "string" },
  //   ],
  // } as const;

  // const message = {
  //   domain: "riton.eth", // ens domain name
  //   "starknet address":
  //     "804388756904569972460955916013815525033312120440152538849502850576260523679",
  // } as const;

  // const {
  //   data,
  //   isError,
  //   isLoading: isLoadingSignMsg,
  //   isSuccess,
  //   signTypedData,
  //   variables,
  // } = useSignTypedData({
  //   domain,
  //   message,
  //   primaryType: "Claim my .eth.stark domain",
  //   types,
  // });

  // useEffect(() => {
  //   if (isError || isLoadingSignMsg) return;

  //   // Split signature to get it in r, s, v format
  //   const splitSig = ethers.Signature.from(data);

  //   // pass it to u256 with starknet.js
  //   const r = cairo.uint256(splitSig.r);
  //   const s = cairo.uint256(splitSig.s);
  //   const v = cairo.uint256(splitSig.v);
  // }, [data, isError, isLoadingSignMsg, isSuccess]);

  // const messageHash = ethers.TypedDataEncoder.hash(
  //   domain,
  //   types as any,
  //   message
  // );

  // const checkAndUpdateStepNumber = () => {
  // if (
  //   StarknetAddress &&
  //   connectedEthereumAddress &&
  //   selectDomain.length > 0
  // ) {
  //   setCurrentStep(3);
  // } else if (StarknetAddress && connectedEthereumAddress) {
  //   setCurrentStep(2);
  // } else if (!StarknetAddress) {
  //   setCurrentStep(1);
  // }
  // };

  // useEffect(() => {
  //   checkAndUpdateStepNumber();
  // }, [StarknetAddress, connectedEthereumAddress]);

  return (
    <div className={styles.screen}>
      <div className={styles.wrapperScreen}>
        <div className={styles.container}>
          {currentStep === 0 ? (
            <div className={styles.banner}>
              <Image
                src={AffiliateImage}
                alt="hey"
                priority
                className={styles.image}
              />
              <div className={styles.banner_content}>
                <div>
                  <span className="title mr-2">Get your .sol domain on </span>
                  <span className="title" style={{ color: "#19AA6E" }}>
                    Starknet
                  </span>
                </div>
                <p className="text-left">
                  Get your .sol domain on starknet. Connect, verify, and elevate
                  your digital identity with cross-chain domains !
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
            </div>
          ) : currentStep === 1 ? (
            <div className={styles.banner}>
              <Image
                src={AffiliateImage}
                alt="hey"
                priority
                className={styles.image}
              />
              <div className={styles.banner_content}>
                <div>
                  <span className="title mr-2">Get your .sol domain on </span>
                  <span className="title" style={{ color: "#19AA6E" }}>
                    Starknet
                  </span>
                </div>
                <p className="text-left">
                  Get your .sol domain on starknet. Connect, verify, and elevate
                  your digital identity with cross-chain domains!
                </p>
                <div className={styles.button_container}>
                  <div className={styles.connectEthLayout}>
                    <WalletMultiButton />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.domainContainer}>
              <div className="flex flex-row justify-between	">
                <h1 className="title text-left">Domains to bridge</h1>
                <WalletMultiButton />
              </div>
              <div className={styles.domain_list}>
                {snsDomains.map((name, index) => {
                  return (
                    <div key={index} className={styles.domain_box}>
                      <p className={styles.domainName}>{name}.sol</p>
                      <div>
                        <Button onClick={() => generateSignature()}>
                          Allow on Solana
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className={styles.progress_bar_container}>
          <ProgressBar doneSteps={currentStep} totalSteps={3} />
        </div>
      </div>
      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </div>
  );
};

export default Solana;
