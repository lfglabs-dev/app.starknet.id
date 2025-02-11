import React, { FunctionComponent } from "react";
import styles from "../../styles/components/profilePic.module.css";
import { NftCollections } from "../../utils/constants";
import ClickableAction from "../UI/iconsComponents/clickableAction";
import ArrowRightIcon from "../UI/iconsComponents/icons/arrowRightIcon";
import theme from "../../styles/theme";
import { useRouter } from "next/router";

const SelectedCollections: FunctionComponent = () => {

  const router = useRouter();
  
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
        <ClickableAction
          title="Get your NFT"
          icon={
            <ArrowRightIcon width="25" color={theme.palette.secondary.main} />
          }
          onClick={() => window.open("https://unframed.co/")}
          width="auto"
        />
         <div className="">
            <div className={styles.cancelBtn} onClick={() => router.push("/")}>
              Cancel
            </div>
          </div>
      </div>
    </>
  );
};

export default SelectedCollections;
