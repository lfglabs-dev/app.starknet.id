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
  const { address } = useAccount();
  const [loading, setLoading] = useState<boolean>(true);
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

    // // Aspect Indexer
    // fetch(
    //   `https://api-testnet.aspect.co/api/v0/assets?contract_address=${process.env.NEXT_PUBLIC_STARKNETID_CONTRACT as string}&owner_address=${account.address}&sort_by=minted_at&order_by=desc`
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     setOwnedIdentities(data.assets);
    //   });
  }, [address, router.asPath]);

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
                    address ? () => mint() : () => setWalletModalOpen(true)
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
              />
              <div className="w-fit block mx-auto px-4 mt-[33px]">
                <ClickableAction
                  title="ADD IDENTITIES"
                  icon={<MintIcon />}
                  onClick={
                    address ? () => mint() : () => setWalletModalOpen(true)
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

      <Wallets
        closeWallet={() => setWalletModalOpen(false)}
        hasWallet={walletModalOpen}
      />
    </>
  );
};

export default Identities;
