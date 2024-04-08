import React, { FunctionComponent, useContext, useState } from "react";
import styles from "../../styles/components/profilePic.module.css";
import NftCard from "../UI/nftCard";
import { debounce } from "../../utils/debounceService";
import WarningMessage from "../UI/warningMessage";
import { FormContext } from "@/context/FormProvider";

type PfpGalleryProps = {
  selectPfp: (nft: StarkscanNftProps) => void;
  selectedPfp?: StarkscanNftProps | null;
};

const PfpGallery: FunctionComponent<PfpGalleryProps> = ({
  selectPfp,
  selectedPfp,
}) => {
  const { userNft } = useContext(FormContext);
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleMouseEnter = debounce((id: string) => setIsHovered(id), 50);
  const handleMouseLeave = debounce(() => setIsHovered(null), 50);

  return (
    <>
      <div>
        <p className={styles.subtitle}>Your NFTs</p>
        <h2 className={styles.title}>Choose your NFT Profile picture</h2>
        <div className={styles.nftSection}>
          {userNft && userNft.length > 0 ? (
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
