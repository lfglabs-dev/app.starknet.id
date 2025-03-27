import React, { useMemo } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  useAccount,
  useConnect,
  useSendTransaction,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { hexToDecimal } from "../utils/feltService";
import IdentitiesSkeleton from "../components/identities/skeletons/identitiesSkeleton";
import TxConfirmationModal from "../components/UI/txConfirmationModal";
import { useNotificationManager } from "../hooks/useNotificationManager";
import { NotificationType, TransactionType } from "../utils/constants";
import WalletConnect from "@/components/UI/walletConnect";
import { Connector } from "starknetkit";
import AddButton from "@/components/UI/AddButtonIdentities";
import CancelSubscription from "@/components/UI/CancelSubscription";
import AvailableIdentities from "@/components/identities/availableIdentities";

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

  const callData = useMemo(() => {
    return {
      contractAddress: process.env.NEXT_PUBLIC_IDENTITY_CONTRACT as string,
      entrypoint: "mint",
      calldata: [randomTokenId.toString()],
    };
  }, []); 

  const { sendAsync: execute, data: mintData } = useSendTransaction({
    calls: [callData],
  });

  useEffect(() => {
    if (address) {
      setLoading(true);
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
  }, [mintData]); 

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
      <div className={styles.wrapperScreen}>
        <div className="mt-[12vh]">
          {loading ? (
            <section className="mt-20 w-full">
              <IdentitiesSkeleton />
            </section>
          ) : ownedIdentities.length + externalDomains.length === 0 ||
          !address ? (
            <div className={styles.containerGallery}>
              <h1 className="title text-center mb-[16px]">
                All Your Identities in One Place
              </h1>
              <p className="description text-center max-w-2xl">
                Easily access and manage all your identities from one
                centralized location. Streamline your digital presence with
                convenience and control.
              </p>
              <div className="w-fit block mx-auto px-4 mt-[48px] ">
                <AddButton
                  onClick={
                    address
                      ? () => mint()
                      : () => setShowWalletConnectModal(true)
                  }
                  radius="8px"
                >
                  ADD IDENTITIES
                </AddButton>
              </div>
            </div>
          ) : (
            <div className="max-h-[88vh]">
              <AvailableIdentities tokenId={ownedIdentities[0].id} />

              {/* Cancel Subscription Button */}
            <div className="mt-6 flex justify-center">
              <button
             className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 ease-in-out"
            >
            Cancel Subscription
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
      <TxConfirmationModal
        txHash={mintData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your identity NFT is on its way!"
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
