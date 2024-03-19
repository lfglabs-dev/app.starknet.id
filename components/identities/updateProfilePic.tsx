import React, { FunctionComponent, useEffect, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import NftCard from "../UI/nftCard";
import ModalProfilePic from "../UI/modalProfilePic";
import { filterAssets, retrieveAssets } from "../../utils/nftService";
import BackButton from "../UI/backButton";
import PfpSkeleton from "./skeletons/pfpSkeleton";
import SelectedCollections from "./selectedCollections";
import { debounce } from "../../utils/debounceService";
import { useContractRead } from "@starknet-react/core";
import { useNftPpVerifierContract } from "../../hooks/contracts";
import { Abi } from "starknet";
import { Identity } from "../../utils/apiWrappers/identity";
import WarningMessage from "../UI/warningMessage";

type UpdateProfilePicProps = {
  identity?: Identity;
  tokenId: string;
  back: () => void;
  openTxModal: () => void;
  setPfpTxHash: (hash: string) => void;
};

const UpdateProfilePic: FunctionComponent<UpdateProfilePicProps> = ({
  tokenId,
  identity,
  back,
  openTxModal,
  setPfpTxHash,
}) => {
  const [userNft, setUserNft] = useState<StarkscanNftProps[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [selectedPic, setSelectedPic] = useState<StarkscanNftProps | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { contract } = useNftPpVerifierContract();
  const { data: whitelistData, error: whitelistError } = useContractRead({
    address: contract?.address as string,
    abi: contract?.abi as Abi,
    functionName: "get_whitelisted_contracts",
    args: [],
  });

  useEffect(() => {
    if (!identity?.ownerAddress || !whitelistData) return;
    retrieveAssets(
      `${process.env.NEXT_PUBLIC_SERVER_LINK}/starkscan/fetch_nfts`,
      identity.ownerAddress
    ).then((data) => {
      const filteredAssets = filterAssets(data.data, whitelistData as bigint[]);
      setUserNft(filteredAssets);
      setIsLoading(false);
    });
  }, [tokenId, identity, whitelistData]);

  const selectPicture = (nft: StarkscanNftProps) => {
    setOpenModal(true);
    setSelectedPic(nft);
  };

  const goBack = (cancel: boolean) => {
    setOpenModal(false);
    if (!cancel) {
      openTxModal();
      back();
    }
  };

  const handleMouseEnter = debounce((id: string) => setIsHovered(id), 50);
  const handleMouseLeave = debounce(() => setIsHovered(null), 50);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.arrows}>
          <BackButton onClick={() => back()} />
        </div>
        <div className={styles.gallery}>
          <p className={styles.subtitle}>Your NFTs</p>
          <h2 className={styles.title}>Choose your NFT Profile picture</h2>
          <div className={styles.nftSection}>
            {isLoading ? (
              <PfpSkeleton />
            ) : userNft && userNft.length > 0 ? (
              userNft.map((nft, index) => {
                if (!nft.image_url) return null;
                return (
                  <div
                    key={index}
                    onMouseEnter={() => handleMouseEnter(nft.token_id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <NftCard
                      image={nft.image_url as string}
                      name={nft.name as string}
                      selectPicture={() => selectPicture(nft)}
                      isHovered={isHovered === nft.token_id}
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col align-middle items-center">
                <img src="/visuals/notFound.webp" alt="Not found" width={201} />
                <WarningMessage>
                  You don&apos;t own any whitelisted NFTs yet
                </WarningMessage>
              </div>
            )}
          </div>
        </div>
        {isLoading ? null : (
          <div className={styles.gallery}>
            <p className={styles.subtitle}>Get a new Profile Pic</p>
            <h2 className={styles.title}>Our NFT Collections selection</h2>
            <SelectedCollections />
          </div>
        )}
      </div>
      <ModalProfilePic
        isModalOpen={openModal}
        closeModal={goBack}
        nftData={selectedPic as StarkscanNftProps}
        tokenId={tokenId}
        setPfpTxHash={setPfpTxHash}
      />
    </>
  );
};

export default UpdateProfilePic;
