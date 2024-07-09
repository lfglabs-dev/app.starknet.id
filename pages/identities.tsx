import React, { useMemo } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useAccount, useConnect } from "@starknet-react/core";
import { useContractWrite } from "@/hooks/useContract";
import { useEffect, useState } from "react";
import IdentitiesGallery from "../components/identities/identitiesGalleryV1";
import MintIcon from "../components/UI/iconsComponents/icons/mintIcon";
import { useRouter } from "next/router";
import { hexToDecimal } from "../utils/feltService";
import IdentitiesSkeleton from "../components/identities/skeletons/identitiesSkeleton";
import TxConfirmationModal from "../components/UI/txConfirmationModal";
import ClickableAction from "../components/UI/iconsComponents/clickableAction";
import { useNotificationManager } from "../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../utils/constants";
import WalletConnect from "@/components/UI/walletConnect";
import { Connector } from "starknetkit";

const Identities: NextPage = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
  const [ownedIdentities, setOwnedIdentities] = useState<FullId[]>([]);
  const [externalDomains, setExternalDomains] = useState<string[]>([]);
  const randomTokenId: number = Math.floor(Math.random() * 1000000000000);
  const router = useRouter();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const { addTransaction } = useNotificationManager();
  const { connectAsync, connectors } = useConnect();
  const [showWalletConnectModal, setShowWalletConnectModal] =
    useState<boolean>(false);

  //Mint
  const callData = useMemo(() => {
    return {
      contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
      entrypoint: "mint",
      calldata: [randomTokenId],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We want this to run only once
  const { writeAsync: execute, data: mintData } = useContractWrite({
    calls: [callData],
  });

  useEffect(() => {
    if (address) {
      setLoading(true);
      // Our Indexer
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_full_ids?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setOwnedIdentities(data.full_ids);
          setLoading(false);
        });

      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_external_domains?addr=${hexToDecimal(address)}`
      )
        .then((response) => response.json())
        .then((data: ExternalDomains) => {
          setExternalDomains(data.domains);
        });
    } else {
      setLoading(false);
    }
  }, [address, router.asPath]);

  useEffect(() => {
    if (!mintData?.transaction_hash) return;
    addTransaction({
      timestamp: Date.now(),
      subtext: `Minting identity #${randomTokenId}`,
      type: NotificationType.TRANSACTION,
      data: {
        type: TransactionType.MINT_IDENTITY,
        hash: mintData.transaction_hash,
        status: "pending",
      },
    });
    setIsTxModalOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintData]); // We want this to run only when the tx is sent

  function mint() {
    execute();
  }

  const connectWallet = async (connector: Connector) => {
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
    localStorage.setItem("SID-lastUsedConnector", connector.id);
  };

  return (
    <>
      <div className={styles.containerGallery}>
        <div>
          {loading ? (
            <IdentitiesSkeleton />
          ) : ownedIdentities.length + externalDomains.length === 0 ||
            !address ? (
            <>
              <h1 className="title text-center mb-[16px]">
                All Your Identities in One Place
              </h1>
              <p className="description text-center max-w-2xl">
                Easily access and manage all your identities from one
                centralized location. Streamline your digital presence with
                convenience and control.
              </p>
              <div className="w-fit block mx-auto px-4 mt-[33px]">
                <ClickableAction
                  title="ADD IDENTITIES"
                  icon={<MintIcon />}
                  onClick={
                    address
                      ? () => mint()
                      : () => setShowWalletConnectModal(true)
                  }
                  width="auto"
                />
              </div>
            </>
          ) : (
            <div>
              <IdentitiesGallery
                identities={ownedIdentities}
                externalDomains={externalDomains}
                address={address}
              />
              <div className="w-fit block mx-auto px-4 mt-[33px]">
                <ClickableAction
                  title="ADD IDENTITIES"
                  icon={<MintIcon />}
                  onClick={
                    address
                      ? () => mint()
                      : () => setShowWalletConnectModal(true)
                  }
                  width="auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <TxConfirmationModal
        txHash={mintData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your identity NFT is on it's way !"
      />
      <WalletConnect
        closeModal={() => setShowWalletConnectModal(false)}
        open={showWalletConnectModal}
        connectors={connectors as Connector[]}
        connectWallet={connectWallet}
      />
    </>
  );
};

export default Identities;
