import React, { useContext, useEffect, useState } from "react";
import styles from "../styles/solana.module.css";
import Image from "next/image";
import AffiliateImage from "../public/visuals/affiliate.webp";
import Button from "../components/UI/button";
import StarknetIcon from "../components/UI/iconsComponents/icons/starknetIcon";
import { useAccount, useConnect, useContractWrite } from "@starknet-react/core";
import ProgressBar from "../components/UI/progressBar";
import { NextPage } from "next";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Call } from "starknet";
import TxConfirmationModal from "../components/UI/txConfirmationModal";
import { NotificationType, TransactionType } from "../utils/constants";
import { useNotificationManager } from "../hooks/useNotificationManager";
import { Skeleton } from "@mui/material";
import SolanaCalls from "../utils/callData/solanaCalls";
import { utils } from "starknetid.js";
import useHasClaimSolSubdomain from "../hooks/useHasClaimSolSubdomain";
import DoneFilledIcon from "../components/UI/iconsComponents/icons/doneFilledIcon";
import theme from "../styles/theme";
import DomainActions from "../components/solana/domainActions";
import DiscountEndScreen from "../components/discount/discountEndScreen";
import { useStarknetkitConnectModal } from "starknetkit";
import { StarknetIdJsContext } from "../context/StarknetIdJsProvider";
import { useRouter } from "next/router";

const Solana: NextPage = () => {
  const { address: starknetAddress } = useAccount();
  const { publicKey: solPublicKey, signMessage } = useWallet();
  const { addTransaction } = useNotificationManager();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [snsDomains, setSnsDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<SnsDomainData>();
  const [hasLoadedSolDomain, setHasLoadedSolDomain] = useState<boolean>(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const claimedDomains = useHasClaimSolSubdomain(
    snsDomains,
    starknetAddress as string
  );
  const [callData, setCallData] = useState<Call[]>([]);
  const { writeAsync: execute, data: registerData } = useContractWrite({
    calls: callData,
  });
  const [open, setOpen] = useState(true);
  const [disableBtn, setDisableBtn] = useState<string>("");
  const { connectAsync } = useConnect();
  const { availableConnectors } = useContext(StarknetIdJsContext);
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: availableConnectors,
  });
  const [redirect, setRedirect] = useState<string>("");

  useEffect(() => {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();

    if (timestamp >= 1714051234 * 1000) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!starknetAddress) setCurrentStep(0);
    else if (starknetAddress && !solPublicKey) setCurrentStep(1);
    else if (starknetAddress && solPublicKey) setCurrentStep(2);
  }, [starknetAddress, solPublicKey]);

  // fetch sol domains from SNS api
  useEffect(() => {
    if (!solPublicKey) return;
    fetch(`https://sns-api.bonfida.com/owners/${solPublicKey}/domains`)
      .then((response) => response.json())
      .then((res) => {
        if (res?.success && res.result) setSnsDomains(res.result);
        else setSnsDomains([]);
        setHasLoadedSolDomain(true);
      })
      .catch((error) => {
        console.log("An error occured while fetching user SNS domains", error);
        setSnsDomains([]);
        setHasLoadedSolDomain(true);
      });
  }, [solPublicKey]);

  useEffect(() => {
    if (!selectedDomain || !selectedDomain.signature) return;
    const name = utils.encodeDomain(selectedDomain.name);
    setCallData([
      SolanaCalls.claimDomain(
        name[0].toString(),
        selectedDomain.signature.r,
        selectedDomain.signature.s,
        selectedDomain.signature.max_validity as number
      ),
      SolanaCalls.setResolving(name[0].toString(), starknetAddress as string),
      SolanaCalls.setAsMainDomain(name[0].toString()),
    ]);
  }, [selectedDomain, starknetAddress]);

  useEffect(() => {
    if (!registerData?.transaction_hash || !selectedDomain) return;
    // posthog?.capture("register");

    if (selectedDomain !== undefined) {
      setSelectedDomain((prevState) => ({
        name: prevState ? prevState.name : "",
        signature: prevState ? prevState.signature : undefined,
        sent: true,
      }));
    }

    addTransaction({
      timestamp: Date.now(),
      subtext: `Received ${selectedDomain?.name}.sol.stark`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.CLAIM_SOL,
        hash: registerData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    setRedirect(selectedDomain?.name);
    setSelectedDomain(undefined);
  }, [registerData?.transaction_hash]);

  const generateSignature = async (solDomain: string) => {
    if (!signMessage) return;
    setDisableBtn(solDomain);
    const maxValidity = parseInt(
      ((Date.now() + 60 * 60 * 1000) / 1000).toFixed(0)
    );
    const leading0Addr = "0x" + starknetAddress?.slice(2).padStart(64, "0");
    const message = `${solPublicKey} allow claiming ${solDomain}.sol on starknet on ${leading0Addr} at max validity timestamp ${maxValidity}`;

    // encode message to Uint8Array
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(message);

    signMessage(uint8Array)
      .then((sig: Uint8Array) => {
        generateStarkSig(solDomain, sig, maxValidity);
      })
      .catch(() => {
        setDisableBtn("");
      });
  };

  const generateStarkSig = async (
    solDomain: string,
    solSig: Uint8Array,
    maxValidity: number
  ) => {
    const sigQuery = {
      source_domain: solDomain + ".sol",
      target_address: starknetAddress,
      source_signature: Array.from(solSig),
      max_validity: maxValidity,
    };
    const data = JSON.stringify(sigQuery);

    fetch(`${process.env.NEXT_PUBLIC_SERVER_LINK}/crosschain/solana/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    })
      .then((response) => response.json())
      .then((res) => {
        setSelectedDomain({
          name: solDomain,
          signature: res,
          sent: false,
        });
        setDisableBtn("");
      })
      .catch((error) => {
        console.log("An error occured", error);
        setDisableBtn("");
      });
  };

  const receiveDomain = () => {
    if (!selectedDomain || selectedDomain.sent) return;
    execute();
  };

  const canReceiveOnStarknet = (name: string): boolean => {
    return selectedDomain &&
      selectedDomain.name === name &&
      selectedDomain.signature &&
      !selectedDomain.sent &&
      selectedDomain.signature.max_validity > Date.now() / 1000
      ? true
      : false;
  };

  const connectWallet = async () => {
    const { connector } = await starknetkitConnectModal();
    if (!connector) {
      return;
    }
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
  };

  return (
    <div className={styles.screen}>
      {!open ? (
        <DiscountEndScreen
          title=".sol domains campaign has ended"
          image="/freeRenewal/freeRenewal.webp"
        />
      ) : (
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
                    <span className={styles.bannerTitle}>Starknet</span>
                  </div>
                  <p className="text-left">
                    Get your .sol domain on starknet. Connect, verify, and
                    elevate your digital identity with cross-chain domains !
                  </p>
                  <div className={styles.button_container}>
                    <Button onClick={connectWallet}>
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
                    <span className={styles.bannerTitle}>Starknet</span>
                  </div>
                  <p className="text-left">
                    Get your .sol domain on starknet. Connect, verify, and
                    elevate your digital identity with cross-chain domains!
                  </p>
                  <div className={styles.buttonContainer}>
                    <div className={styles.connectLayout}>
                      <WalletMultiButton />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.domainContainer}>
                <div className="flex flex-col md:flex-row justify-between	">
                  <h1 className="title text-left">Domains to bridge</h1>
                  <WalletMultiButton />
                </div>
                <div className={styles.domainList}>
                  {hasLoadedSolDomain ? (
                    snsDomains.length > 0 ? (
                      snsDomains.map((name, index) => {
                        return (
                          <div key={index} className={styles.domainBox}>
                            <div className={styles.domainTitle}>
                              <p className={styles.domainName}>
                                {name}.sol.stark
                              </p>
                              {claimedDomains.includes(name) ? (
                                <DomainActions name={name} />
                              ) : null}
                            </div>
                            <div>
                              {canReceiveOnStarknet(name) ? (
                                <Button onClick={receiveDomain}>
                                  Receive on Starknet
                                </Button>
                              ) : selectedDomain &&
                                selectedDomain.name === name &&
                                selectedDomain.sent &&
                                !claimedDomains.includes(name) ? (
                                <Button
                                  onClick={() => {
                                    /* intentionally empty */
                                  }}
                                  disabled
                                >
                                  Transaction ongoing
                                </Button>
                              ) : claimedDomains.includes(name) ? (
                                <div className={styles.receivedBtn}>
                                  <DoneFilledIcon
                                    width="24"
                                    secondColor={theme.palette.primary.main}
                                    color="#FFF"
                                  />
                                  <p>Received</p>
                                </div>
                              ) : disableBtn === name ? (
                                <Skeleton
                                  variant="rectangular"
                                  className={styles.btnSkeleton}
                                  height={48}
                                  width={180}
                                />
                              ) : (
                                <Button onClick={() => generateSignature(name)}>
                                  Allow on Solana
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      "You don't own any .sol domains"
                    )
                  ) : (
                    <>
                      <Skeleton
                        variant="rectangular"
                        width={358}
                        height={124}
                        className={styles.domainSkeleton}
                      />
                      <Skeleton
                        variant="rectangular"
                        width={358}
                        height={124}
                        className={styles.domainSkeleton}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.progressBarContainer}>
            <ProgressBar doneSteps={currentStep} totalSteps={3} />
          </div>
        </div>
      )}
      <TxConfirmationModal
        txHash={registerData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => {
          setIsTxModalOpen(false);
          router.push(`/externaldomains/${redirect}.sol.stark`);
        }}
        title="Your domain is on it's way !"
      />
    </div>
  );
};

export default Solana;
