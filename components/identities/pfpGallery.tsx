import React, { FunctionComponent, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import NftCard from "../UI/nftCard";
import { debounce } from "../../utils/debounceService";
import PfpSkeleton from "./skeletons/pfpSkeleton";


type PfpGalleryProps = {
  userNfts: StarkscanNftProps[];
  isLoading?: boolean;
  selectPfp: (nft: StarkscanNftProps) => void;
  selectedPfp?: StarkscanNftProps | null;
  title?: string
};



const PfpGallery: FunctionComponent<PfpGalleryProps> = ({
  userNfts,
  isLoading = false,
  selectPfp,
  selectedPfp,
  title = "Choose your NFT Profile picture"
}) => {
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleMouseEnter = debounce((id: string) => setIsHovered(id), 50);
  const handleMouseLeave = debounce(() => setIsHovered(null), 50);
  

  return (
    <>
      <div>
        {userNfts.length > 0 && (
          <h2 className={styles.title}>{title}</h2>
        )}

        <div className={styles.nftSection}>
          {isLoading ? (
            <PfpSkeleton />
          ) : userNfts.length > 0 ? (
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
              <h2 className={styles.title}>NO NFTS FOUND</h2>
              <p className={styles.subtitle}>
                You don&apos;t own any whitelisted NFTs yet. Get your first NFT
                to customize your profile picture and display it on your domain.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PfpGallery;
