import React, { FunctionComponent } from "react";
import styles from "../../styles/components/profilePic.module.css";
import { NftCollections } from "../../utils/constants";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import theme from "../../styles/theme";

const SelectedCollections: FunctionComponent = () => {
  return (
    <>
      <div className={styles.nftCollectionWraper}>
        {NftCollections.map((collection, index) => {
          return (
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
          );
        })}
      </div>
      <div className={styles.btnWrapper}>
        <button
          onClick={() => window.open("https://unframed.co/")}
          aria-label="Get your NFT"
          className={styles.btnWrapperGetNftBtn}
        >
          <ArrowRightIcon width="16" color={theme.palette.secondary.main} />
          <span>Get your NFT</span>
        </button>
        <button
          onClick={() => {/* TODO: Implement cancel action */}}
          aria-label="Cancel action"
          className={styles.btnWrapperCancelBtn}>
          Cancel
        </button> 
      </div>
    </>
  );
};

export default SelectedCollections;
