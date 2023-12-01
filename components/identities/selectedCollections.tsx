import React, { FunctionComponent } from "react";
import styles from "../../styles/components/profilePic.module.css";
import { NftCollections } from "../../utils/constants";
import ClickableAction from "../UI/iconsComponents/clickableAction";
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
              <img
                src={collection.imageUri}
                alt={`${collection.name} image`}
                className={styles.nftCollectionImg}
              />
              <div className={styles.nftCollectionName}>{collection.name}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.btnWrapper}>
        <ClickableAction
          title="Get your NFT"
          icon={
            <ArrowRightIcon width="25" color={theme.palette.secondary.main} />
          }
          onClick={() => window.open("https://unframed.co/")}
          width="auto"
        />
      </div>
    </>
  );
};

export default SelectedCollections;
