import type { NextPage } from "next";
import { useState } from "react";
import {
  type Connector,
  useAccount,
  useConnect,
} from "@starknet-react/core";
import styles from "@/styles/Home.module.css";
import IdentitiesSkeleton from "@/components/identities/skeletons/identitiesSkeleton";
import TxConfirmationModal from "@/components/UI/txConfirmationModal";
import WalletConnect from "@/components/UI/walletConnect";
import AddButton from "@/components/UI/AddButtonIdentities";
import AvailableIdentities from "@/components/identities/availableIdentities";
import { useOwnedIdentities } from "@/hooks/useOwnedIdentities";
import { usePreparedTransaction } from "@/hooks/useTransactions";
import { prepareMintIntent } from "@/lib/transactions/intents";

const Identities: NextPage = () => {
  const { address } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const discovery = useOwnedIdentities();
  const submitPrepared = usePreparedTransaction();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [minting, setMinting] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);

  async function mint(): Promise<void> {
    if (minting) return;
    setMinting(true);
    try {
      const hash = await submitPrepared(() => prepareMintIntent());
      setTxHash(hash);
      setIsTxModalOpen(true);
    } catch (error) {
      console.error("Failed to mint an identity:", error);
    } finally {
      setMinting(false);
    }
  }

  async function connectWallet(connector: Connector): Promise<void> {
    await connectAsync({ connector });
    localStorage.setItem("SID-connectedWallet", connector.id);
    localStorage.setItem("SID-lastUsedConnector", connector.id);
  }

  return (
    <>
      <div className={styles.wrapperScreen}>
        <div className="mt-[5rem]">
          {discovery.loading ? (
            <section className="w-full mt-20">
              <IdentitiesSkeleton />
            </section>
          ) : discovery.identities.length === 0 || !address ? (
            <div className={styles.containerGallery}>
              <h1 className="title text-center mb-[16px]">
                All Your Identities in One Place
              </h1>
              <p className="max-w-2xl text-center description">
                Easily access and manage all your identities from one
                centralized location. Streamline your digital presence with
                convenience and control.
              </p>
              <div className="w-fit block mx-auto px-4 mt-[48px] ">
                <AddButton
                  onClick={
                    address
                      ? () => void mint()
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
              <AvailableIdentities
                tokenId={discovery.identities[0].tokenId}
                ownedIdentities={discovery}
              />
            </div>
          )}
        </div>
      </div>
      <TxConfirmationModal
        txHash={txHash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your identity NFT is on it's way !"
      />
      <WalletConnect
        closeModal={() => setShowWalletConnectModal(false)}
        open={showWalletConnectModal}
        connectors={connectors}
        connectWallet={(connector) => void connectWallet(connector)}
      />
    </>
  );
};

export default Identities;
