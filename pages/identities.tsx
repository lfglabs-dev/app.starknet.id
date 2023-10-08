import React from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import {
  useAccount,
  useContractWrite,
  useTransactionManager,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import IdentitiesGallery from "../components/identities/identitiesGalleryV1";
import MintIcon from "../components/UI/iconsComponents/icons/mintIcon";
import { useRouter } from "next/router";
import { hexToDecimal } from "../utils/feltService";
import IdentitiesSkeleton from "../components/identities/identitiesSkeleton";
import TxConfirmationModal from "../components/UI/txConfirmationModal";
import Wallets from "../components/UI/wallets";
import ClickableAction from "../components/UI/iconsComponents/clickableAction";

const Identities: NextPage = () => {
  const { account, address } = useAccount();
  const [loading, setLoading] = useState<boolean>(false);
  const [ownedIdentities, setOwnedIdentities] = useState<FullId[]>([]);
  const [externalDomains, setExternalDomains] = useState<string[]>([]);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const randomTokenId: number = Math.floor(Math.random() * 1000000000000);
  const router = useRouter();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const { addTransaction } = useTransactionManager();

  //Mint
  const callData = {
    contractAddress: process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string,
    entrypoint: "mint",
    calldata: [randomTokenId],
  };
  const { writeAsync: execute, data: mintData } = useContractWrite({
    calls: callData,
  });

  useEffect(() => {
    if (account) {
      // Our Indexer
      setLoading(true);
      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_full_ids?addr=${hexToDecimal(account.address)}`
      )
        .then((response) => response.json())
        .then((data) => {
          setOwnedIdentities(data.full_ids);
        });

      fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER_LINK
        }/addr_to_external_domains?addr=${hexToDecimal(account.address)}`
      )
        .then((response) => response.json())
        .then((data: ExternalDomains) => {
          setExternalDomains(data.domains);
          setLoading(false);
        });
    }

    // // Aspect Indexer
    // fetch(
    //   `https://api-testnet.aspect.co/api/v0/assets?contract_address=${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string}&owner_address=${account.address}&sort_by=minted_at&order_by=desc`
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setOwnedIdentities(data.assets);
    //   });
  }, [account, router.asPath]);

  useEffect(() => {
    if (!mintData?.transaction_hash) return;
    addTransaction({ hash: mintData?.transaction_hash });
    setIsTxModalOpen(true);
  }, [mintData]);

  function mint() {
    execute();
  }

  return (
    <>
      <div className="firstLeavesGroup">
        <img width="100%" alt="leaf" src="/leaves/new/leavesGroup02.svg" />
      </div>
      <div className="secondLeavesGroup">
        <img width="100%" alt="leaf" src="/leaves/new/leavesGroup01.svg" />
      </div>
      <div className={styles.containerGallery}>
        <div>
          {loading ? (
            <IdentitiesSkeleton />
          ) : ownedIdentities.length + externalDomains.length === 0 ? (
            <>
              <h1 className="title text-center">
                All Your Identities in One Place
              </h1>
              <p className="description text-center mb-6">
                Easily access and manage all your identities from one
                centralized location. Streamline your digital presence with
                convenience and control.
              </p>
            </>
          ) : (
            <IdentitiesGallery
              identities={ownedIdentities}
              externalDomains={externalDomains}
            />
          )}
          <div className="w-full flex justify-center items-center px-4">
            <ClickableAction
              title="ADD IDENTITIES"
              icon={<MintIcon />}
              onClick={address ? () => mint() : () => setWalletModalOpen(true)}
              width="auto"
            />
          </div>
        </div>
      </div>
      <TxConfirmationModal
        txHash={mintData?.transaction_hash}
        isTxModalOpen={isTxModalOpen}
        closeModal={() => setIsTxModalOpen(false)}
        title="Your identity NFT is on it's way !"
      />

      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </>
  );
};

export default Identities;
