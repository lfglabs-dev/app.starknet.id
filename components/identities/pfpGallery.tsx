import React, { FunctionComponent, useState, useCallback } from "react";
import styles from "../../styles/components/profilePic.module.css";
import NftCard from "../UI/nftCard";
import { debounce } from "../../utils/debounceService";
import PfpSkeleton from "./skeletons/pfpSkeleton";

type PfpGalleryProps = {
  userNfts: StarkscanNftProps[];
  isLoading?: boolean;
  selectPfp: (nft: StarkscanNftProps) => void;
  selectedPfp?: StarkscanNftProps | null;
  title?: string;
};

const PfpGallery: FunctionComponent<PfpGalleryProps> = ({
  userNfts,
  isLoading = false,
  selectPfp,
  selectedPfp,
  title = "Choose your NFT Profile picture",
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleMouseEnter = useCallback((id: string) => debounce(() => setHoveredId(id), 50)(), [setHoveredId]);
  const handleMouseLeave = useCallback(() => debounce(() => setHoveredId(null), 50)(), [setHoveredId]);

  return (
    <div>
      {userNfts.length > 0 && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.nftSection}>
        {isLoading ? (
          <PfpSkeleton />
        ) : userNfts.length > 0 ? (
          userNfts.map((nft) =>
            nft.image_url ? (
              <div
                key={nft.token_id}
                onMouseEnter={() => handleMouseEnter(nft.token_id)}
                onMouseLeave={handleMouseLeave}
              >
                <NftCard
                  image={nft.image_url}
                  name={nft.name || "Unnamed NFT"}
                  selectPicture={() => selectPfp(nft)}
                  isHovered={hoveredId === nft.token_id}
                  isSelected={selectedPfp?.token_id === nft.token_id}
                />
              </div>
            ) : null
          )
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
  );
};

export default PfpGallery;
