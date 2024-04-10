import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import NftCard from "../UI/nftCard";
import { debounce } from "../../utils/debounceService";
import WarningMessage from "../UI/warningMessage";
import PfpSkeleton from "./skeletons/pfpSkeleton";

type PfpGalleryProps = {
  userNfts: StarkscanNftProps[];
  isLoading?: boolean;
  selectPfp: (nft: StarkscanNftProps) => void;
  selectedPfp?: StarkscanNftProps | null;
};

const PfpGallery: FunctionComponent<PfpGalleryProps> = ({
  userNfts,
  isLoading = false,
  selectPfp,
  selectedPfp,
}) => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleMouseEnter = debounce((id: string) => setIsHovered(id), 50);
  const handleMouseLeave = debounce(() => setIsHovered(null), 50);

  return (
    <>
      <div>
        <p className={styles.subtitle}>Your NFTs</p>
        <h2 className={styles.title}>Choose your NFT Profile picture</h2>
        <div className={styles.nftSection}>
          {isLoading ? (
            <PfpSkeleton />
          ) : userNfts && userNfts.length > 0 ? (
            userNfts.map((nft, index) => {
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
                    selectPicture={() => selectPfp(nft)}
                    isHovered={isHovered === nft.token_id}
                    isSelected={selectedPfp?.token_id === nft.token_id}
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
    </>
  );
};

export default PfpGallery;
