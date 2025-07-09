import React, { FunctionComponent } from "react";
import styles from "../../styles/components/profilePic.module.css";
import { NftCollections } from "../../utils/constants";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import theme from "../../styles/theme";
import { useRouter } from "next/router";

const SelectedCollections: FunctionComponent = () => {
  const router = useRouter();
  const NFT_MARKETPLACE_URL = "https://unframed.co/";

  const nftMarketPlace: React.MouseEventHandler<HTMLButtonElement> = () => {
    window.open(NFT_MARKETPLACE_URL, "_blank", "noopener noreferrer");
  };

  return (
    <>
      <div
        className={`mx-auto flex flex-col justify-center ${styles.nftCollectionWraper}`}
      >
        {NftCollections.map((collection, index) => (
          <div
            className={styles.nftCollectionCard}
            key={index}
            onClick={() => window.open(collection.externalLink)}
          >
            <div
              style={{ backgroundImage: `url(${collection.imageUri})` }}
              className={styles.nftCollectionImg}
            />
            <div className={styles.nftCollectionName}>{collection.name}</div>
          </div>
        ))}
      </div>
      <div className={styles.btnWrapper}>
        <button
          onClick={nftMarketPlace}
          aria-label="Get your NFT"
          className={styles.btnWrapperGetNftBtn}
        >
          <ArrowRightIcon width="16" color={theme.palette.secondary.main} />
          <span>Get your NFT</span>
        </button>
        <button
          onClick={() => router.push("/")}
          aria-label="Cancel action"
          className={styles.btnWrapperCancelBtn}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default SelectedCollections;
